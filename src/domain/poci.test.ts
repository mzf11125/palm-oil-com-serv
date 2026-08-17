/**
 * Golden tests for POCI, taken from the methodological design document's own
 * worked examples. These are the acceptance criteria for the scoring engine:
 * if Table 6 does not reproduce, the implementation is wrong.
 */

import { describe, it, expect } from 'vitest'
import { computePoci, exposureBand, proximityScore, networkScore } from './poci'
import { POCI_WEIGHTS, type PociInput } from './types'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const input = (P: number | null, N: number | null, E: number | null, F: number | null, L: number | null): PociInput =>
  ({ P, N, E, F, L })

describe('POCI weights', () => {
  it('matches the published formula 0.15P + 0.25N + 0.30E + 0.15F + 0.15L', () => {
    expect(POCI_WEIGHTS).toEqual({ P: 0.15, N: 0.25, E: 0.3, F: 0.15, L: 0.15 })
  })

  it('sums to 1', () => {
    const total = Object.values(POCI_WEIGHTS).reduce((s, w) => s + w, 0)
    expect(total).toBeCloseTo(1, 10)
  })
})

describe('design doc Table 6 — eight illustrative candidate villages', () => {
  // Komunitas | P | N | E | F | L | POCI | Tipologi
  const table6 = [
    { name: 'Desa A - Sungai Baru', v: input(100, 95, 85, 75, 70), poci: 86.0 },
    { name: 'Desa B - Karya Tani', v: input(90, 85, 90, 80, 95), poci: 88.0 },
    { name: 'Desa C - Bukit Raya', v: input(70, 85, 80, 70, 80), poci: 78.3 },
    { name: 'Desa D - Sumber Makmur', v: input(40, 80, 95, 60, 65), poci: 73.3 },
    { name: 'Desa E - Suka Damai', v: input(65, 25, 5, 20, 10), poci: 22.0 },
    { name: 'Desa F - Pasar Jaya', v: input(25, 65, 55, 80, 40), poci: 54.5 },
    { name: 'Desa G - Harapan Baru', v: input(35, 30, 10, 20, 15), poci: 21.0 },
    // Table 6 prints 59.2. The exact value is 59.25, and the same document
    // rounds the other two ties in this table UP (Desa C 78.25 -> 78.3,
    // Desa D 73.25 -> 73.3). The printed 59.2 is therefore a rounding
    // inconsistency in the source, not a different rule. We apply half-up
    // uniformly, which agrees with two of the three ties and with the exact
    // arithmetic asserted below.
    { name: 'Desa H - Mekar Jaya', v: input(20, 75, 70, 60, 50), poci: 59.3 },
  ]

  for (const { name, v, poci } of table6) {
    it(`${name} scores ${poci}`, () => {
      const result = computePoci(v)
      expect(result.score).toBe(poci)
      expect(result.coverage).toBe(1)
      expect(result.missing).toEqual([])
    })
  }

  it('computes Desa H as exactly 59.25 before rounding', () => {
    // 0.15(20) + 0.25(75) + 0.30(70) + 0.15(60) + 0.15(50)
    //   = 3 + 18.75 + 21 + 9 + 7.5 = 59.25
    const exact = 0.15 * 20 + 0.25 * 75 + 0.3 * 70 + 0.15 * 60 + 0.15 * 50
    expect(exact).toBeCloseTo(59.25, 10)
  })

  it('rounds the other two Table 6 ties upward, as the document prints them', () => {
    expect(0.15 * 70 + 0.25 * 85 + 0.3 * 80 + 0.15 * 70 + 0.15 * 80).toBeCloseTo(78.25, 10)
    expect(computePoci(input(70, 85, 80, 70, 80)).score).toBe(78.3)
    expect(0.15 * 40 + 0.25 * 80 + 0.3 * 95 + 0.15 * 60 + 0.15 * 65).toBeCloseTo(73.25, 10)
    expect(computePoci(input(40, 80, 95, 60, 65)).score).toBe(73.3)
  })

  it('preserves the document ranking B > A > C > D > H > F > E > G', () => {
    const ranked = [...table6]
      .sort((a, b) => computePoci(b.v).score! - computePoci(a.v).score!)
      .map((r) => r.name.split(' ')[1])
    expect(ranked).toEqual(['B', 'A', 'C', 'D', 'H', 'F', 'E', 'G'])
  })

  it('bands Table 6 as section 7.1 interprets it: A-D high, F moderate, E/G comparators', () => {
    const bands = Object.fromEntries(
      table6.map((r) => [r.name.split(' ')[1], computePoci(r.v).band]),
    )
    expect(bands).toEqual({
      A: 'high', B: 'high', C: 'high', D: 'high',
      F: 'moderate', H: 'moderate',
      E: 'low', G: 'low',
    })
  })
})

describe('missing evidence is never treated as zero', () => {
  const desaA = input(100, 95, 85, 75, 70)

  it('renormalises when economic linkage is unavailable', () => {
    // Design doc section 5.1: "Jangan mengubah data yang tidak tersedia
    // menjadi skor 0. Hitung POCI provisional dari komponen yang tersedia."
    const result = computePoci(input(100, 95, null, 75, 70))
    // (0.15*100 + 0.25*95 + 0.15*75 + 0.15*70) / 0.70
    //   = (15 + 23.75 + 11.25 + 10.5) / 0.70 = 60.5 / 0.70 = 86.43
    expect(result.score).toBe(86.4)
    expect(result.coverage).toBeCloseTo(0.7, 10)
    expect(result.missing).toEqual(['E'])
    expect(result.economicLinkageMissing).toBe(true)
  })

  it('scores far lower if the same gap were wrongly coerced to zero', () => {
    const coerced = computePoci(input(100, 95, 0, 75, 70))
    expect(coerced.score).toBe(60.5)
    // Nearly 26 points of penalty purely for records nobody has yet — exactly
    // the error the renormalisation exists to prevent. Desa A would fall from
    // 'high' exposure to 'moderate' and could drop out of the portfolio.
    expect(computePoci(input(100, 95, null, 75, 70)).score! - coerced.score!).toBeCloseTo(25.9, 6)
    expect(exposureBand(86.4)).toBe('high')
    expect(exposureBand(60.5)).toBe('moderate')
  })

  it('scores a proximity-only village on proximity alone, at 15% coverage', () => {
    const result = computePoci(input(40, null, null, null, null))
    expect(result.score).toBe(40)
    expect(result.coverage).toBeCloseTo(0.15, 10)
    expect(result.available).toEqual(['P'])
    expect(result.missing).toEqual(['N', 'E', 'F', 'L'])
  })

  it('returns null rather than 0 when nothing is evidenced', () => {
    const result = computePoci(input(null, null, null, null, null))
    expect(result.score).toBeNull()
    expect(result.band).toBeNull()
    expect(result.coverage).toBe(0)
  })

  it('never lets an NA component pull the score below the available minimum', () => {
    // Property: for any subset of available components, the renormalised score
    // lies within [min, max] of those available values.
    const values = [0, 5, 20, 45, 70, 95, 100]
    for (const p of values) {
      for (const n of values) {
        const result = computePoci(input(p, n, null, null, null))
        expect(result.score!).toBeGreaterThanOrEqual(Math.min(p, n) - 1e-9)
        expect(result.score!).toBeLessThanOrEqual(Math.max(p, n) + 1e-9)
      }
    }
  })

  it('is unaffected by which components are missing when all present values are equal', () => {
    expect(computePoci(input(60, 60, 60, 60, 60)).score).toBe(60)
    expect(computePoci(input(60, null, 60, null, null)).score).toBe(60)
    expect(computePoci(input(null, null, 60, null, null)).score).toBe(60)
  })
})

describe('exposure bands (proposal section E.3.2)', () => {
  it('classifies >=70 as high', () => {
    expect(exposureBand(70)).toBe('high')
    expect(exposureBand(88)).toBe('high')
  })

  it('classifies 40-69 as moderate', () => {
    expect(exposureBand(40)).toBe('moderate')
    expect(exposureBand(69.9)).toBe('moderate')
  })

  it('classifies <30 as low', () => {
    expect(exposureBand(29.9)).toBe('low')
    expect(exposureBand(0)).toBe('low')
  })

  it('leaves 30-39.99 explicitly unbanded rather than guessing', () => {
    // The source defines >=70, 40-69 and <30. This gap is real, not an
    // implementation choice, and the analyst is asked to resolve it.
    expect(exposureBand(30)).toBe('unbanded')
    expect(exposureBand(39.99)).toBe('unbanded')
  })

  it('bands the Table 6 examples as the document interprets them', () => {
    // Section 7.1: A, B, C, D are high priority; F is moderate; E and G are
    // low-exposure comparator candidates.
    expect(exposureBand(86.0)).toBe('high')
    expect(exposureBand(88.0)).toBe('high')
    expect(exposureBand(78.3)).toBe('high')
    expect(exposureBand(73.3)).toBe('high')
    expect(exposureBand(54.5)).toBe('moderate')
    expect(exposureBand(22.0)).toBe('low')
    expect(exposureBand(21.0)).toBe('low')
  })
})

describe('proximity rubric (design doc Table 4)', () => {
  const cases: [number, number][] = [
    [0, 100], [2, 100],
    [2.1, 80], [5, 80],
    [5.1, 60], [10, 60],
    [10.1, 40], [20, 40],
    [20.1, 20], [30, 20],
    [30.1, 0], [95, 0],
  ]

  for (const [km, expected] of cases) {
    it(`${km} km scores ${expected}`, () => {
      expect(proximityScore(km)).toBe(expected)
    })
  }

  it('returns NA for unknown distance', () => {
    expect(proximityScore(null)).toBeNull()
  })
})

describe('network rubric (design doc Table 4)', () => {
  const cases: [number, number][] = [
    [5, 100], [15, 100],
    [16, 80], [30, 80],
    [31, 60], [45, 60],
    [46, 40], [60, 40],
    [61, 20], [90, 20],
    [91, 0],
  ]

  for (const [minutes, expected] of cases) {
    it(`${minutes} min scores ${expected}`, () => {
      expect(networkScore(minutes)).toBe(expected)
    })
  }

  it('returns NA for unknown travel time', () => {
    expect(networkScore(null)).toBeNull()
  })
})

/**
 * Validates the rubric against the real extracted data. The source village
 * layers were produced by a separate GIS workflow that already applied the
 * document's proximity rubric, so agreement on every feature is independent
 * confirmation that this implementation reads the rubric the same way.
 */
describe('proximity rubric vs. extracted case data', () => {
  const dataDir = join(process.cwd(), 'public/data/cases')
  const cases = ['PTPN_V_BLOCK_SEI_GALUH', 'PT_PENITI_SUNGAI_PINYUH']

  for (const caseId of cases) {
    const file = join(dataDir, `${caseId}.json`)

    it.runIf(existsSync(file))(`reproduces the source P field for every village in ${caseId}`, () => {
      const data = JSON.parse(readFileSync(file, 'utf8'))
      const features = data.villages.features
      expect(features.length).toBeGreaterThan(0)

      const mismatches = features.filter((f: any) => {
        return proximityScore(f.properties.DIST_TO_CONCESSION_KM) !== f.properties.P
      })

      expect(mismatches.map((f: any) => f.properties.VILLAGE_NAME)).toEqual([])
    })
  }
})
