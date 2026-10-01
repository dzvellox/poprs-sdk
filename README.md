# poprs-sdk

Typed TypeScript SDK for PoPRS V2. Includes client, merchant, router HTTP bridge, Keccak PTLC primitives, USDC fee math, QR invoices, and viem bindings for five L1 contracts. Builds ESM, CJS, and declarations.

## Install and check

```bash
npm ci
npm run check
```

Requires Node 20+ for development. The package also targets modern browsers with Web Crypto and `fetch`. Amounts use `bigint` in **micro-USDC** (6 decimals); for example `1_000_000n` is 1 USDC. JSON invoices encode the amount as a decimal string.

## Client and merchant

```ts
import { PoPRSClient, PoPRSMerchant, PoPRSRouterClient } from 'poprs-sdk';

const merchant = new PoPRSMerchant({
  merchantId: 'shop-1',
  scanPublicKey: '0x...',  // compressed secp256k1 public key (33 bytes)
  spendPublicKey: '0x...', // compressed secp256k1 public key (33 bytes)
  settlementReader,        // your trusted L2 node adapter
});
const invoice = merchant.createInvoice({ amountUsdc: 1_000_000n });
const qrPng = await merchant.toQRDataUrl(invoice);

const router = new PoPRSRouterClient({ baseUrl: 'https://your-router.example/', merchantId: invoice.merchantId });
const [route] = await router.queryOptimalPaths(BigInt(invoice.amountUsdc), 3);
if (!route) throw new Error('No route');

const payer = new PoPRSClient({
  prover,             // real zero-knowledge solvency prover
  transport,          // atomic L2 lock + settlement adapter
  balance: getBalance, // async () => bigint in micro-USDC
  checkSanctionList: async address => complianceProvider.isSanctioned(address),
});
const receipt = await payer.pay(invoice, route);
const paid = await merchant.verifyUnlock(receipt.preimage, invoice.invoiceId);
```

`pay` checks the sanctions hook before proving or locking, proves `amount + fee`, requires an acknowledgment for every hop, then releases the 32-byte secret to `transport.settle`. `verifyUnlock` requires a matching authenticated settlement from `settlementReader`; a preimage hash match by itself never confirms payment. Keep the merchant's invoices in durable storage and call `registerInvoice` on restart. Never log PTLC secrets or prover witness inputs.

The prover implements `prove({ balance, amount, blinding, commitment }): Promise<Hex>`. The public commitment is `keccak256(u64_big_endian(balance) || 32-byte blinding)`. Its circuit must enforce both this commitment and `balance >= amount` with the same public `amount`. The SDK cannot verify a prover's cryptographic soundness locally; use an audited verifier and a compatible circuit.

The transport implements `lockPath(request)` and `settle(lock, preimage)`. It must authenticate hop acknowledgments, guarantee atomic locks (or compensate failures), respect timeouts, and return a final authenticated receipt. The SDK checks the receipt fields and hash. The current upstream router has no L2 lock or settle HTTP endpoint, so the package does not invent one. A concrete node adapter is needed before real payments.

## Router and fees

`queryOptimalPaths(amount, maxHops)` calls the upstream Rust `POST /route` with `{amount, merchant_id, max_hops}` and maps its **single** best path into a one-element list. The node's DHT directory performs PoCap/PoLat filtering; the HTTP response does not carry cryptographic attestations for independent SDK verification. HTTP is accepted only for loopback development. The current Rust JSON `u64` endpoint cannot safely accept amounts above `Number.MAX_SAFE_INTEGER` from JavaScript.

`computeFees(1_000_000n)` returns `{ total: 1000n, routing: 500n, prover: 200n, insurance: 150n, burn: 150n }` micro-USDC. Integer remainder goes to burn, matching `poprs-core/src/tokenomics.rs`. This fee split describes the L2 protocol; `InsuranceVault.sol` has a separate payable calculation and must be reconciled before mainnet integration.

## Stealth invoices and QR

Each invoice derives a unique EVM address from secp256k1 ECDH, a spend public key and a Keccak tweak. The payload includes `ephemeralPubkey` and `viewTag` for merchant scanning, plus ID, amount, timestamp and expiry. `toQRPayload` yields JSON; `toQRDataUrl` yields a PNG data URL. The current upstream Rust `stealth.rs` explicitly labels its different address scheme a **mock**. Integrators must align the node and wallet on the SDK derivation before transferring funds. The invoice's stealth address is distinct from the `merchant_pubkey` field of the older Rust `PaymentRequest` struct.

## L1 bindings and source

The five Solidity snapshots in `abi-sources/` came from [`dzvellox/PoPRS` at `640642e2d5f8cb1f6d9e63ea0c933720d3df10cf`](https://github.com/dzvellox/PoPRS/tree/640642e2d5f8cb1f6d9e63ea0c933720d3df10cf/contracts). Run `npm run generate:abi` to regenerate the typed `as const` ABIs with `solc`; or set `POPRS_CORE_CONTRACTS` to another local contracts directory first. Use `createL1Bindings(publicClient, addresses)` for typed reads and exported ABIs with a viem `WalletClient` for writes.

**Testnet status:** Upstream `zk_solvency.rs` is a mock; `ZKVerifier.sol` uses testnet checks rather than production STARK verification; `PTLCChannel.sol` permits nonzero preimages in its unlock condition. These upstream contracts and the node need security review and fixes before real value is handled. No sub-second finality guarantee can be inferred from an SDK call or unit tests.
