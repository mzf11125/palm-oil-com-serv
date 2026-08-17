/**
 * Weighted scoring with missing-evidence renormalisation.
 *
 * Both POCI and the ABCD indicator score are weighted means over components
 * that may be absent. The design documents are explicit that absence is not
 * zero:
 *
 *   "Jangan mengubah data yang tidak tersedia menjadi skor 0. Hitung POCI
 *    provisional dari komponen yang tersedia, tampilkan source coverage dan
 *    confidence."                          -- Design doc, section 5.1
 *
 *   "Missing evidence diberi NA, bukan 0." -- Scorecard doc, section 2.1
 *
 * So the weighted sum is divided by the weight actually present rather than by
 * the full weight. A village evidenced only on proximity scores what its
 * proximity says, at 15% coverage — it is not dragged toward zero by the four
 * components nobody has data for. Coverage carries that caveat instead, which
 * is why it is returned alongside every score and never discarded.
 */

import type { Scored } from './types'

export interface WeightedResult<K extends string> {
  /** Weighted mean over available components, or null if none are available. */
  score: number | null
  /** Share of total weight backed by evidence, 0-1. */
  coverage: number
  available: K[]
  missing: K[]
}

/**
 * Weighted mean over components that have evidence.
 *
 * @param values  Component values, any of which may be null (NA).
 * @param weights Component weights. Need not sum to 1.
 */
export function weightedScore<K extends string>(
  values: Record<K, Scored>,
  weights: Record<K, number>,
): WeightedResult<K> {
  const keys = Object.keys(weights) as K[]
  const available: K[] = []
  const missing: K[] = []

  let weightedSum = 0
  let availableWeight = 0
  let totalWeight = 0

  for (const key of keys) {
    const weight = weights[key]
    totalWeight += weight

    const value = values[key]
    if (value === null || value === undefined || Number.isNaN(value)) {
      missing.push(key)
      continue
    }

    available.push(key)
    availableWeight += weight
    weightedSum += weight * value
  }

  return {
    score: availableWeight === 0 ? null : weightedSum / availableWeight,
    coverage: totalWeight === 0 ? 0 : availableWeight / totalWeight,
    available,
    missing,
  }
}

/** Rounds for display without letting float noise show (86.00000000000001). */
export function round(value: number | null, dp = 1): number | null {
  if (value === null) return null
  const f = 10 ** dp
  return Math.round(value * f) / f
}

/** Mean over the entries that have a value; null when none do. */
export function meanAvailable(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null)
  if (present.length === 0) return null
  return present.reduce((s, v) => s + v, 0) / present.length
}
