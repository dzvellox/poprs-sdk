import { describe, expect, it, vi } from 'vitest';
import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToHex, hexToBytes, keccak256, type Hex } from 'viem';
import { PoPRSClient, PoPRSMerchant, PoPRSRouterClient, computeFees, ptlcPoint, createStealthAddress, PTLCChannelAbi } from '../src/index.js';
import type { LockReceipt, PaymentTransport, SettlementReceipt } from '../src/index.js';

const scanPrivateKey = secp256k1.utils.randomPrivateKey();
const spendPrivateKey = secp256k1.utils.randomPrivateKey();
const scanPublicKey = bytesToHex(secp256k1.getPublicKey(scanPrivateKey, true));
const spendPublicKey = bytesToHex(secp256k1.getPublicKey(spendPrivateKey, true));
const now = 1_800_000_000_000;
const receiptStore = new Map<Hex, SettlementReceipt>();
function merchant() {
  return new PoPRSMerchant({ merchantId: 'shop', scanPublicKey, spendPublicKey,
    settlementReader: { getSettlement: async id => receiptStore.get(id) ?? null }, now: () => now });
}
const route = { path: ['hub-a', 'hub-b'], score: 31, latencyMs: 17, source: 'kademlia-dht-p2p' };

describe('math, ABI and cryptography', () => {
  it('splits 0.10% exactly and assigns integer remainder to burn', () => {
    expect(computeFees(1_000_000n)).toEqual({ total: 1000n, routing: 500n, prover: 200n, insurance: 150n, burn: 150n });
    const tiny = computeFees(1_001n);
    expect(tiny.routing + tiny.prover + tiny.insurance + tiny.burn).toBe(tiny.total);
    expect(() => computeFees(0n)).toThrow();
  });
  it('matches the Rust PTLC Keccak construction and L1 lock ABI', () => {
    const secret = `0x${'01'.repeat(32)}` as Hex;
    expect(ptlcPoint(secret)).toBe(keccak256(secret));
    expect(PTLCChannelAbi.find(item => item.type === 'function' && item.name === 'lockPTLC')?.inputs.map(input => input.type))
      .toEqual(['bytes32', 'bytes32', 'uint256', 'bytes32', 'uint256']);
  });
  it('derives a scanable secp256k1 stealth address and unique ephemerals', () => {
    const a = createStealthAddress(scanPublicKey, spendPublicKey);
    const b = createStealthAddress(scanPublicKey, spendPublicKey);
    expect(a.address).not.toBe(b.address);
    const shared = secp256k1.getSharedSecret(scanPrivateKey, hexToBytes(a.ephemeralPubkey), true);
    const tweak = BigInt(keccak256(bytesToHex(shared))) % secp256k1.CURVE.n;
    const recovered = secp256k1.ProjectivePoint.fromHex(spendPublicKey.slice(2)).add(secp256k1.ProjectivePoint.BASE.multiply(tweak));
    const uncompressed = bytesToHex(recovered.toRawBytes(false));
    expect(a.address.toLowerCase()).toBe(`0x${keccak256(`0x${uncompressed.slice(4)}`).slice(-40)}`.toLowerCase());
  });
});

describe('router bridge', () => {
  it('sends Rust /route fields and returns the single best route', async () => {
    const fetcher = vi.fn(async (_url: URL, options: RequestInit) => {
      expect(JSON.parse(options.body as string)).toEqual({ amount: 1_000_000, merchant_id: 'shop', max_hops: 3 });
      return { ok: true, json: async () => ({ path: route.path, score: route.score, latency_ms: route.latencyMs, source: route.source }) } as Response;
    });
    const client = new PoPRSRouterClient({ baseUrl: 'http://127.0.0.1:3000', merchantId: 'shop', fetch: fetcher as typeof fetch });
    expect(await client.queryOptimalPaths(1_000_000n, 3)).toEqual([route]);
    expect(fetcher.mock.calls[0]?.[0].toString()).toBe('http://127.0.0.1:3000/route');
    await expect(client.queryOptimalPaths(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).rejects.toThrow('precise');
  });
  it('rejects malformed routing data and refuses a remote plaintext endpoint', async () => {
    expect(() => new PoPRSRouterClient({ baseUrl: 'http://router.example', merchantId: 'shop' })).toThrow('HTTPS');
    const client = new PoPRSRouterClient({ baseUrl: 'http://localhost:3000', merchantId: 'shop',
      fetch: (async () => ({ ok: true, json: async () => ({ path: ['hub-a', 'hub-a'], score: 1, latency_ms: 1, source: 'dht' }) } as Response)) as typeof fetch });
    await expect(client.queryOptimalPaths(1n)).rejects.toThrow('Invalid route');
  });
});

describe('payment lifecycle', () => {
  it('generates an invoice and QR image, locks every hop before releasing the secret, then verifies settlement', async () => {
    const shop = merchant();
    const invoice = shop.createInvoice({ amountUsdc: 1_000_000n });
    expect(JSON.parse(shop.toQRPayload(invoice)).stealthAddress).toBe(invoice.stealthAddress);
    expect(await shop.toQRDataUrl(invoice)).toMatch(/^data:image\/png;base64,/);
    let locked = false;
    const transport: PaymentTransport = {
      lockPath: async request => {
        expect(request.amountUsdc).toBe('1000000');
        expect(request.feeUsdc).toBe('1000');
        expect(request.solvencyProof.amountUsdc).toBe('1001000');
        locked = true;
        return { invoiceId: request.invoiceId, point: request.point, route: request.route,
          lockIds: [bytesToHex(new Uint8Array(32).fill(1)), bytesToHex(new Uint8Array(32).fill(2))], status: 'locked' };
      },
      settle: async (lock, secret) => {
        expect(locked).toBe(true);
        expect(ptlcPoint(secret)).toBe(lock.point);
        const receipt: SettlementReceipt = { invoiceId: lock.invoiceId, point: lock.point, preimage: secret, status: 'settled', settledAtMs: now + 100 };
        receiptStore.set(invoice.invoiceId, receipt);
        return receipt;
      },
    };
    const sanctions = vi.fn(async () => false);
    const payer = new PoPRSClient({ prover: { prove: async ({ commitment }) => { expect(commitment).toMatch(/^0x[\da-f]{64}$/); return '0xabcd'; } },
      transport, balance: async () => 2_000_000n, checkSanctionList: sanctions, now: () => now });
    const result = await payer.pay(invoice, route);
    expect(await shop.verifyUnlock(result.preimage, invoice.invoiceId)).toBe(true);
    expect(await shop.verifyUnlock(bytesToHex(new Uint8Array(32).fill(3)), invoice.invoiceId)).toBe(false);
    expect(sanctions).toHaveBeenCalledWith(invoice.stealthAddress);
  });

  it('blocks sanctions and never exposes a secret on partial path lock', async () => {
    const invoice = merchant().createInvoice({ amountUsdc: 1_000_000n });
    const settle = vi.fn();
    const partial: PaymentTransport = {
      lockPath: async req => ({ invoiceId: req.invoiceId, point: req.point, route: req.route, lockIds: [bytesToHex(new Uint8Array(32).fill(1))], status: 'locked' }) as LockReceipt,
      settle,
    };
    const base = { prover: { prove: async () => '0xabcd' as Hex }, transport: partial, balance: async () => 2_000_000n, now: () => now };
    await expect(new PoPRSClient({ ...base, checkSanctionList: () => true }).pay(invoice, route)).rejects.toThrow('blocked');
    await expect(new PoPRSClient(base).pay(invoice, route)).rejects.toThrow('per-hop');
    expect(settle).not.toHaveBeenCalled();
  });

  it('rejects a forged unlock without authenticated settlement', async () => {
    const shop = merchant();
    const invoice = shop.createInvoice({ amountUsdc: 2n });
    expect(await shop.verifyUnlock(bytesToHex(new Uint8Array(32).fill(5)), invoice.invoiceId)).toBe(false);
  });
  it('rejects an invalid prover result before touching the transport', async () => {
    const invoice = merchant().createInvoice({ amountUsdc: 1_000_000n });
    const lockPath = vi.fn();
    const payer = new PoPRSClient({ prover: { prove: async () => '0x' as Hex }, transport: { lockPath, settle: vi.fn() },
      balance: async () => 2_000_000n, now: () => now });
    await expect(payer.pay(invoice, route)).rejects.toThrow('malformed proof');
    expect(lockPath).not.toHaveBeenCalled();
  });
});
