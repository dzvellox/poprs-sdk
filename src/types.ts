import type { Address, Hex } from 'viem';

/** Integer micro-USDC. Never use floating point for a payment amount. */
export type Amount = bigint;

export interface SolvencyProof {
  proof: Hex;
  amountUsdc: string;
  commitment: Hex;
}

/** A real prover must bind the public amount and commitment to the secret balance. */
export interface SolvencyProver {
  prove(input: { balance: Amount; amount: Amount; blinding: Hex; commitment: Hex }): Promise<Hex>;
}

export interface Invoice {
  version: 2;
  invoiceId: Hex;
  merchantId: string;
  amountUsdc: string;
  timestampMs: number;
  expiresAtMs: number;
  stealthAddress: Address;
  ephemeralPubkey: Hex;
  viewTag: number;
  displayCurrency: string;
  displayAmount: string;
}

export interface Route {
  path: string[];
  score: number;
  latencyMs: number;
  source: string;
}

export interface PTLC {
  /** The secret must remain local until every hop has acknowledged its lock. */
  secret: Hex;
  point: Hex;
  amountUsdc: Amount;
  expiresAtMs: number;
}

export interface LockRequest {
  invoiceId: Hex;
  amountUsdc: string;
  feeUsdc: string;
  recipient: Address;
  route: string[];
  point: Hex;
  expiresAtMs: number;
  solvencyProof: SolvencyProof;
}

export interface LockReceipt {
  invoiceId: Hex;
  point: Hex;
  route: string[];
  lockIds: Hex[];
  status: 'locked';
}

export interface SettlementReceipt {
  invoiceId: Hex;
  point: Hex;
  preimage: Hex;
  status: 'settled';
  settledAtMs: number;
}

/** A node adapter must enforce atomic per-hop locking, finality and authenticated receipts. */
export interface PaymentTransport {
  lockPath(request: LockRequest): Promise<LockReceipt>;
  settle(lock: LockReceipt, preimage: Hex): Promise<SettlementReceipt>;
}

/** Read an authenticated settlement from a trusted node; a hash match alone is insufficient. */
export interface SettlementReader {
  getSettlement(invoiceId: Hex): Promise<SettlementReceipt | null>;
}

export type SanctionCheck = (address: Address) => Promise<boolean> | boolean;

export interface FeeSplit {
  total: Amount;
  routing: Amount;
  prover: Amount;
  insurance: Amount;
  burn: Amount;
}
