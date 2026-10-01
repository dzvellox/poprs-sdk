import type { FeeSplit } from './types.js';
import { requireAmount } from './validation.js';

/** Exact integer split from poprs-core/src/tokenomics.rs. Remainder goes to burn. */
export function computeFees(amount: bigint): FeeSplit {
  requireAmount(amount);
  const total = amount * 10n / 10_000n;
  const routing = total * 50n / 100n;
  const prover = total * 20n / 100n;
  const insurance = total * 15n / 100n;
  return { total, routing, prover, insurance, burn: total - routing - prover - insurance };
}
