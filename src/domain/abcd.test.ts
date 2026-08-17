/**
 * Golden tests for the ABCD indicator score, anchored on the scorecard
 * document's worked example (Table 11, ASS-1 Community Associations and
 * Cooperatives).
 */

import { describe, it, expect } from 'vitest'
import {
  computeIndicator,
  computePillar,
  computeAllPillars,
  computeComposite,
  pillarOf,
  PILLAR_INDICATORS,
} from './abcd'
import { ABCD_WEIGHTS, type AbcdInput, type IndicatorCode } from './types'

const input = (A: number | null, C: number | null, M: number | null, I: number | null, O: number | null): AbcdInput =>
  ({ A, C, M, I, O })

describe('ABCD weights', () => {
  it('matches the published formula 25 x (0.20A + 0.20C + 0.25M + 0.15I + 0.20O)', () => {
    expect(ABCD_WEIGHTS).toEqual({ A: 0.2, C: 0.2, M: 0.25, I: 0.15, O: 0.2 })
  })

  it('sums to 1', () => {
    expect(Object.values(ABCD_WEIGHTS).reduce((s, w) => s + w, 0)).toBeCloseTo(1, 10)
  })

  it('gives mobilisation the highest weight', () => {
    // Proposal E.4.2: "Mobilisation receives a slightly higher provisional
    // weight because it is the key distinction between an asset inventory and
    // an ABCD assessment."
    const max = Math.max(...Object.values(ABCD_WEIGHTS))
    expect(ABCD_WEIGHTS.M).toBe(max)
  })
})

describe('scorecard doc Table 11 — ASS-1 worked example', () => {
  // A 4/4, C 3/4, M 3/4, I 2/4, O 3/4  ->  ABCD indicator score 76.25/100
  const example = input(4, 3, 3, 2, 3)

  it('reproduces the published score of 76.25', () => {
    // 25 x (0.20(4) + 0.20(3) + 0.25(3) + 0.15(2) + 0.20(3))
    //   = 25 x (0.8 + 0.6 + 0.75 + 0.3 + 0.6) = 25 x 3.05 = 76.25
    expect(computeIndicator(example).score).toBe(76.25)
  })

  it('reports full coverage for the worked example', () => {
    const result = computeIndicator(example)
    expect(result.coverage).toBe(1)
    expect(result.missing).toEqual([])
  })
})

describe('indicator scale', () => {
  it('maps all-zero to 0 and all-four to 100', () => {
    expect(computeIndicator(input(0, 0, 0, 0, 0)).score).toBe(0)
    expect(computeIndicator(input(4, 4, 4, 4, 4)).score).toBe(100)
  })

  it('maps a uniform mid rating to the proportional score', () => {
    expect(computeIndicator(input(2, 2, 2, 2, 2)).score).toBe(50)
  })

  it('distinguishes a genuine zero rating from missing evidence', () => {
    // A rated 0 is a finding: the asset is absent. NA is the absence of a
    // finding. They must not produce the same score.
    const ratedZero = computeIndicator(input(4, 4, 4, 4, 0))
    const notEvidenced = computeIndicator(input(4, 4, 4, 4, null))
    expect(ratedZero.score).toBe(80)
    expect(notEvidenced.score).toBe(100)
    expect(ratedZero.coverage).toBe(1)
    expect(notEvidenced.coverage).toBeCloseTo(0.8, 10)
  })

  it('renormalises a partially evidenced indicator', () => {
    // Only A and M evidenced: (0.20*4 + 0.25*2) / 0.45 = 1.3 / 0.45 = 2.888..
    // x 25 = 72.22
    const result = computeIndicator(input(4, null, 2, null, null))
    expect(result.score).toBe(72.22)
    expect(result.coverage).toBeCloseTo(0.45, 10)
    expect(result.available).toEqual(['A', 'M'])
  })

  it('returns null rather than 0 when nothing is evidenced', () => {
    const result = computeIndicator(input(null, null, null, null, null))
    expect(result.score).toBeNull()
    expect(result.coverage).toBe(0)
  })

  it('never produces a score outside the available ratings, scaled', () => {
    const ratings = [0, 1, 2, 3, 4]
    for (const a of ratings) {
      for (const m of ratings) {
        const result = computeIndicator(input(a, null, m, null, null))
        expect(result.score!).toBeGreaterThanOrEqual(Math.min(a, m) * 25 - 1e-9)
        expect(result.score!).toBeLessThanOrEqual(Math.max(a, m) * 25 + 1e-9)
      }
    }
  })
})

describe('pillar structure', () => {
  it('has five pillars of three indicators each', () => {
    const pillars = Object.keys(PILLAR_INDICATORS)
    expect(pillars).toHaveLength(5)
    for (const codes of Object.values(PILLAR_INDICATORS)) {
      expect(codes).toHaveLength(3)
    }
  })

  it('covers exactly the fifteen core indicators', () => {
    const all = Object.values(PILLAR_INDICATORS).flat()
    expect(all).toHaveLength(15)
    expect(new Set(all).size).toBe(15)
  })

  it('derives the pillar from an indicator code', () => {
    expect(pillarOf('ASS-1')).toBe('ASS')
    expect(pillarOf('PSN-3')).toBe('PSN')
  })
})

describe('pillar and composite rollup', () => {
  it('averages the scored indicators in a pillar', () => {
    const result = computePillar('ASS', { 'ASS-1': 76.25, 'ASS-2': 50, 'ASS-3': 60 })
    expect(result.score).toBe(62.08)
    expect(result.scoredIndicators).toBe(3)
  })

  it('averages only what is scored, without penalising gaps', () => {
    const result = computePillar('ASS', { 'ASS-1': 80, 'ASS-2': null })
    expect(result.score).toBe(80)
    expect(result.scoredIndicators).toBe(1)
    expect(result.totalIndicators).toBe(3)
  })

  it('returns null for a pillar with no evidence at all', () => {
    expect(computePillar('ECO', {}).score).toBeNull()
  })

  it('marks the composite incomplete until every indicator is scored', () => {
    const partial: Partial<Record<IndicatorCode, number>> = { 'HUM-1': 70, 'ASS-1': 80 }
    const composite = computeComposite(computeAllPillars(partial))
    expect(composite.complete).toBe(false)
    expect(composite.scoredPillars).toBe(2)
    expect(composite.score).toBe(75)
  })

  it('marks the composite complete when all fifteen are scored', () => {
    const full = Object.fromEntries(
      Object.values(PILLAR_INDICATORS).flat().map((c) => [c, 60]),
    ) as Record<IndicatorCode, number>
    const composite = computeComposite(computeAllPillars(full))
    expect(composite.complete).toBe(true)
    expect(composite.scoredPillars).toBe(5)
    expect(composite.score).toBe(60)
  })

  it('weights pillars equally regardless of how many indicators each scored', () => {
    // HUM fully scored high, ECO scored once low: the composite is the mean of
    // pillar means, so ECO's single indicator carries a full pillar's weight.
    const composite = computeComposite(
      computeAllPillars({ 'HUM-1': 90, 'HUM-2': 90, 'HUM-3': 90, 'ECO-1': 30 }),
    )
    expect(composite.score).toBe(60)
  })
})
