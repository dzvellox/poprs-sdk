import { isAddress, type Address, type Hex } from 'viem';
import { balanceCommitment, ptlcPoint, randomBytes32 } from './crypto.js';
import { computeFees } from './fees.js';
import type { Invoice, LockReceipt, PaymentTransport, PTLC, Route, SanctionCheck, SettlementReceipt, SolvencyProof, SolvencyProver } from './types.js';
import { isBytes32, requireAmount, validateInvoice, validateRoute } from './validation.js';

export interface ClientOptions {
  prover: SolvencyProver;
  transport: PaymentTransport;
  balance: () => Promise<bigint>;
  checkSanctionList?: SanctionCheck;
  payerAddress?: Address;
  now?: () => number;
}

/** Payment orchestrator. Proof and atomic L2 settlement require explicit real adapters. */
export class PoPRSClient {
  private readonly now: () => number;
  constructor(private readonly options: ClientOptions) {
    if (!options.prover || !options.transport || !options.balance) throw new Error('Prover, transport and balance provider are required');
    this.now = options.now ?? Date.now;
    if (options.payerAddress && !isAddress(options.payerAddress)) throw new Error('Invalid payer address');
  }

  async proveSolvency(balance: bigint, amount: bigint): Promise<SolvencyProof> {
    requireAmount(amount);
    if (balance < amount) throw new Error('Insufficient funds');
    requireAmount(balance, 'balance');
    const blinding = randomBytes32();
    const commitment = balanceCommitment(balance, blinding);
    const proof = await this.options.prover.prove({ balance, amount, blinding, commitment });
    if (typeof proof !== 'string' || !/^0x(?:[\da-fA-F]{2})+$/.test(proof)) throw new Error('Prover returned an empty or malformed proof');
    return { proof: proof as Hex, amountUsdc: amount.toString(), commitment };
  }

  generatePTLC(amount: bigint, lockTime: number): PTLC {
    requireAmount(amount);
    if (!Number.isInteger(lockTime) || lockTime < 1 || lockTime > 86_400) throw new RangeError('lockTime must be 1..86400 seconds');
    const secret = randomBytes32();
    return { secret, point: ptlcPoint(secret), amountUsdc: amount, expiresAtMs: this.now() + lockTime * 1000 };
  }

  async pay(invoice: Invoice, selectedRoute: Route): Promise<SettlementReceipt> {
    const now = this.now();
    const amount = validateInvoice(invoice, now);
    validateRoute(selectedRoute);
    if (this.options.checkSanctionList) {
      if (this.options.payerAddress && await this.options.checkSanctionList(this.options.payerAddress)) throw new Error('Payer blocked by sanctions check');
      if (await this.options.checkSanctionList(invoice.stealthAddress)) throw new Error('Recipient blocked by sanctions check');
    }
    const fee = computeFees(amount).total;
    const balance = await this.options.balance();
    const solvencyProof = await this.proveSolvency(balance, amount + fee);
    const lockSeconds = Math.floor((invoice.expiresAtMs - now) / 1000);
    const ptlc = this.generatePTLC(amount, Math.min(lockSeconds, 86_400));
    const lock = await this.options.transport.lockPath({
      invoiceId: invoice.invoiceId, amountUsdc: amount.toString(), feeUsdc: fee.toString(),
      recipient: invoice.stealthAddress, route: selectedRoute.path, point: ptlc.point,
      expiresAtMs: ptlc.expiresAtMs, solvencyProof,
    });
    this.validateLock(lock, invoice.invoiceId, ptlc.point, selectedRoute.path);
    if (this.now() >= ptlc.expiresAtMs) throw new Error('PTLC expired before settlement');
    // The secret is released only after authenticated acknowledgment for every hop.
    const settled = await this.options.transport.settle(lock, ptlc.secret);
    if (settled.status !== 'settled' || settled.invoiceId !== invoice.invoiceId || settled.point !== ptlc.point
      || !isBytes32(settled.preimage) || ptlcPoint(settled.preimage) !== ptlc.point
      || settled.preimage !== ptlc.secret || !Number.isFinite(settled.settledAtMs)
      || settled.settledAtMs > ptlc.expiresAtMs) throw new Error('Invalid settlement receipt');
    return settled;
  }

  private validateLock(lock: LockReceipt, invoiceId: Hex, point: Hex, path: string[]): void {
    if (lock.status !== 'locked' || lock.invoiceId !== invoiceId || lock.point !== point
      || !Array.isArray(lock.route) || lock.route.length !== path.length
      || lock.route.some((hop, i) => hop !== path[i])
      || !Array.isArray(lock.lockIds) || lock.lockIds.length !== path.length
      || lock.lockIds.some(id => !isBytes32(id)) || new Set(lock.lockIds).size !== path.length) {
      throw new Error('Missing or invalid per-hop lock acknowledgments');
    }
  }
}
