import type { GuideFee } from './guides';

export type FeeSummary =
  | { kind: 'free' }
  | { kind: 'varies' }
  | { kind: 'exact'; amount: number }
  | { kind: 'from'; amount: number };

/**
 * The cheapest way to get a document: the lowest main fee plus every add-on fee.
 * "from" means some options cost more or part of the fee is not fixed.
 */
export function startingFee(fees: GuideFee[]): FeeSummary {
  const main = fees.filter((f) => !f.addOn);
  const addOns = fees.filter((f) => f.addOn);
  const knownMain = main.map((f) => f.amount).filter((a): a is number => a !== null);
  if (knownMain.length === 0) return { kind: 'varies' };

  const amount = Math.min(...knownMain) + addOns.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  const uncertain = main.length > 1 || addOns.some((f) => f.amount === null);
  if (amount === 0 && !uncertain) return { kind: 'free' };
  return uncertain ? { kind: 'from', amount } : { kind: 'exact', amount };
}
