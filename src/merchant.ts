import QRCode from 'qrcode';
import { getAddress, type Hex } from 'viem';
import { createStealthAddress, ptlcPoint, randomBytes32 } from './crypto.js';
import type { Invoice, SettlementReader } from './types.js';
import { isBytes32, requireAmount, validateInvoice } from './validation.js';

export interface MerchantOptions {
  merchantId: string;
  scanPublicKey: Hex;
  spendPublicKey: Hex;
  settlementReader: SettlementReader;
  now?: () => number;
}

/** Keeps invoice IDs locally and verifies an authenticated settled receipt. */
export class PoPRSMerchant {
  private readonly invoices = new Map<Hex, Invoice>();
  private readonly now: () => number;
  constructor(private readonly options: MerchantOptions) {
    if (!options.merchantId || !options.settlementReader) throw new Error('Merchant ID and settlement reader are required');
    this.now = options.now ?? Date.now;
  }

  createInvoice(params: { amountUsdc: bigint; expiresInSeconds?: number; displayCurrency?: string; displayAmount?: string }): Invoice {
    const amount = requireAmount(params.amountUsdc);
    const ttl = params.expiresInSeconds ?? 300;
    if (!Number.isInteger(ttl) || ttl < 1 || ttl > 86_400) throw new RangeError('Invalid invoice lifetime');
    const timestampMs = this.now();
    const stealth = createStealthAddress(this.options.scanPublicKey, this.options.spendPublicKey);
    const invoice: Invoice = {
      version: 2, invoiceId: randomBytes32(), merchantId: this.options.merchantId,
      amountUsdc: amount.toString(), timestampMs, expiresAtMs: timestampMs + ttl * 1000,
      stealthAddress: getAddress(stealth.address), ephemeralPubkey: stealth.ephemeralPubkey,
      viewTag: stealth.viewTag, displayCurrency: params.displayCurrency ?? 'USD',
      displayAmount: params.displayAmount ?? `${amount / 1_000_000n}.${(amount % 1_000_000n).toString().padStart(6, '0')}`,
    };
    this.invoices.set(invoice.invoiceId, invoice);
    return invoice;
  }

  /** Restore an invoice from the merchant's own durable storage after a restart. */
  registerInvoice(invoice: Invoice): void {
    validateInvoice(invoice, this.now());
    if (invoice.merchantId !== this.options.merchantId) throw new Error('Invoice belongs to another merchant');
    this.invoices.set(invoice.invoiceId, invoice);
  }

  toQRPayload(invoice: Invoice): string { return JSON.stringify(invoice); }

  async toQRDataUrl(invoice: Invoice): Promise<string> { return QRCode.toDataURL(this.toQRPayload(invoice), { errorCorrectionLevel: 'M' }); }

  async verifyUnlock(preimage: Hex, invoiceId: Hex): Promise<boolean> {
    if (!isBytes32(preimage) || !isBytes32(invoiceId) || !this.invoices.has(invoiceId)) return false;
    const receipt = await this.options.settlementReader.getSettlement(invoiceId);
    return !!receipt && receipt.status === 'settled' && receipt.invoiceId === invoiceId
      && receipt.preimage === preimage && isBytes32(receipt.point)
      && ptlcPoint(preimage) === receipt.point
      && Number.isFinite(receipt.settledAtMs) && receipt.settledAtMs <= this.invoices.get(invoiceId)!.expiresAtMs;
  }
}
