import type { FeeSplit, Route } from './types.js';
import { computeFees } from './fees.js';
import { requireAmount, validateRoute } from './validation.js';

export interface RouterOptions {
  baseUrl: string;
  merchantId: string;
  fetch?: typeof globalThis.fetch;
}

/** HTTP bridge to poprs-router /route; that endpoint currently returns one best path. */
export class PoPRSRouterClient {
  private readonly url: URL;
  private readonly fetcher: typeof globalThis.fetch;
  private readonly merchantId: string;

  constructor(options: RouterOptions) {
    this.url = new URL('route', options.baseUrl.endsWith('/') ? options.baseUrl : `${options.baseUrl}/`);
    if (!/^https?:$/.test(this.url.protocol) || !options.merchantId) throw new Error('Invalid router configuration');
    if (this.url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(this.url.hostname)) throw new Error('Remote router requires HTTPS');
    this.fetcher = options.fetch ?? globalThis.fetch;
    this.merchantId = options.merchantId;
  }

  async queryOptimalPaths(amount: bigint, maxHops = 3): Promise<Route[]> {
    requireAmount(amount);
    if (!Number.isInteger(maxHops) || maxHops < 1 || maxHops > 3) throw new RangeError('maxHops must be 1..3');
    // The current Rust serde endpoint takes JSON u64 as a number; do not silently lose precision.
    if (amount > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Amount exceeds precise router JSON range');
    const response = await this.fetcher(this.url, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), merchant_id: this.merchantId, max_hops: maxHops }),
    });
    if (!response.ok) throw new Error(`Router request failed: HTTP ${response.status}`);
    const raw: unknown = await response.json();
    if (!raw || typeof raw !== 'object') throw new Error('Invalid router response');
    const data = raw as Record<string, unknown>;
    if (Array.isArray(data.path) && data.path.length === 0) return [];
    const route = validateRoute({
      path: data.path as string[], score: data.score as number,
      latencyMs: data.latency_ms as number, source: data.source as string,
    }, maxHops);
    // Trust boundary: PoCap/PoLat attestations are enforced by the router, not proven by this response.
    return [route];
  }

  computeFees(amount: bigint): FeeSplit { return computeFees(amount); }
}
