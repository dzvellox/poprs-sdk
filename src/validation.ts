import { isAddress, isHex, type Hex } from 'viem';
import type { Invoice, Route } from './types.js';

export const MAX_U64 = (1n << 64n) - 1n;
export function requireAmount(value: bigint, label = 'amount'): bigint {
  if (typeof value !== 'bigint' || value <= 0n || value > MAX_U64) throw new RangeError(`${label} must be a positive u64 in micro-USDC`);
  return value;
}

export function isBytes32(value: unknown): value is Hex {
  return typeof value === 'string' && isHex(value, { strict: true }) && value.length === 66;
}

export function validateInvoice(invoice: Invoice, now = Date.now()): bigint {
  if (invoice.version !== 2 || !isBytes32(invoice.invoiceId) || !isAddress(invoice.stealthAddress)
    || typeof invoice.merchantId !== 'string' || !invoice.merchantId
    || !isHex(invoice.ephemeralPubkey, { strict: true }) || invoice.ephemeralPubkey.length !== 68
    || !Number.isInteger(invoice.timestampMs) || !Number.isInteger(invoice.expiresAtMs)
    || invoice.timestampMs > now + 60_000 || invoice.expiresAtMs <= now || invoice.expiresAtMs <= invoice.timestampMs) {
    throw new Error('Invalid or expired invoice');
  }
  if (!/^[1-9]\d*$/.test(invoice.amountUsdc)) throw new Error('Invalid invoice amount');
  return requireAmount(BigInt(invoice.amountUsdc));
}

export function validateRoute(route: Route, maxHops = 3): Route {
  if (!Array.isArray(route.path) || route.path.length < 1 || route.path.length > maxHops
    || route.path.some(hub => typeof hub !== 'string' || !hub || hub.length > 256)
    || new Set(route.path).size !== route.path.length
    || !Number.isFinite(route.score) || !Number.isFinite(route.latencyMs) || route.latencyMs < 0
    || typeof route.source !== 'string') throw new Error('Invalid route');
  return route;
}
