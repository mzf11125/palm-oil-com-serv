/**
 * Portfolio rule tests, built around the design document's own worked
 * portfolio (section 7.1) and the selection rules in section 6.1.
 */

import { describe, it, expect } from 'vitest'
import { assessPortfolio, detectTopNSelection, type PortfolioMember } from './portfolio'
import { suggestTypology } from './typology'
import { computePoci } from './poci'
import type { PociInput, Typology } from './types'

const member = (
  villageName: string,
  poci: number | null,
  typology: Typology | null,
  opts: Partial<PortfolioMember> = {},
): PortfolioMember => ({
  villageId: villageName.toLowerCase().replace(/\s+/g, '-'),
  villageName,
  poci,
  typology,
  isComparator: false,
  representsUndervisibleGroup: false,
  ...opts,
})

/**
 * Design doc section 7.1 selects: Desa A (direct worker), B (smallholder/
 * cooperative), C (infrastructure), D (supplier), F (catalytic service centre),
 * plus E or G as the low-exposure comparator.
 */
const documentPortfolio = (): PortfolioMember[] => [
  member('Desa A', 86.0, 'T1', { representsUndervisibleGroup: true }),
  member('Desa B', 88.0, 'T2'),
  member('Desa C', 78.3, 'T3'),
  member('Desa D', 73.3, 'T4'),
  member('Desa F', 54.5, 'T5'),
  member('Desa E', 22.0, 'T7', { isComparator: true }),
]

describe('the design document\'s own portfolio', () => {
  it('passes every rule', () => {
    const result = assessPortfolio(documentPortfolio())
    expect(result.valid).toBe(true)
    expect(result.findings.filter((f) => f.severity === 'error')).toEqual([])
    expect(result.findings).toEqual([])
  })

  it('counts five exposed communities and one comparator', () => {
    const result = assessPortfolio(documentPortfolio())
    expect(result.exposedCount).toBe(5)
    expect(result.comparatorCount).toBe(1)
  })

  it('represents five distinct contribution pathways', () => {
    const result = assessPortfolio(documentPortfolio())
    expect(result.distinctTypologies.sort()).toEqual(['T1', 'T2', 'T3', 'T4', 'T5'])
  })
})

describe('exposed community count', () => {
  it('errors below the minimum of four', () => {
    const result = assessPortfolio(documentPortfolio().slice(4))
    expect(result.valid).toBe(false)
    expect(result.findings.some((f) => f.rule === 'exposed-count' && f.severity === 'error')).toBe(true)
  })

  it('warns above the indicative maximum of six', () => {
    const members = [
      ...documentPortfolio(),
      member('Desa H', 59.3, 'T6'),
      member('Desa I', 60, 'T6'),
    ]
    const result = assessPortfolio(members)
    // Still valid — over-sampling is a capacity question, not a method error.
    expect(result.valid).toBe(true)
    expect(result.findings.some((f) => f.rule === 'exposed-count' && f.severity === 'warning')).toBe(true)
  })
})

describe('comparator rules', () => {
  it('errors when no comparator is selected', () => {
    const members = documentPortfolio().map((m) => ({ ...m, isComparator: false }))
    const result = assessPortfolio(members)
    expect(result.valid).toBe(false)
    expect(result.findings.some((f) => f.rule === 'comparator-required')).toBe(true)
  })

  it('warns when a comparator is not actually low-exposure', () => {
    const members = documentPortfolio()
    members.push(member('Desa X', 65, 'T3', { isComparator: true }))
    const result = assessPortfolio(members)
    expect(result.findings.some((f) => f.rule === 'comparator-exposure')).toBe(true)
  })

  it('accepts two comparators but warns at three', () => {
    const two = [...documentPortfolio(), member('Desa G', 21.0, 'T7', { isComparator: true })]
    expect(assessPortfolio(two).findings.some((f) => f.rule === 'comparator-count')).toBe(false)

    const three = [...two, member('Desa Z', 18, 'T7', { isComparator: true })]
    expect(assessPortfolio(three).findings.some((f) => f.rule === 'comparator-count')).toBe(true)
  })
})

describe('pathway diversity', () => {
  it('warns when the portfolio collapses onto too few pathways', () => {
    const members = [
      member('Desa A', 86, 'T1', { representsUndervisibleGroup: true }),
      member('Desa B', 84, 'T1'),
      member('Desa C', 80, 'T1'),
      member('Desa D', 78, 'T2'),
      member('Desa E', 22, 'T7', { isComparator: true }),
    ]
    const result = assessPortfolio(members)
    expect(result.findings.some((f) => f.rule === 'typology-diversity')).toBe(true)
  })

  it('errors when an exposed community has no confirmed typology', () => {
    const members = documentPortfolio()
    members[2] = { ...members[2]!, typology: null }
    const result = assessPortfolio(members)
    expect(result.valid).toBe(false)
    expect(result.findings.some((f) => f.rule === 'typology-assigned')).toBe(true)
  })
})

describe('under-visible groups (design doc section 6.1)', () => {
  it('warns when no selected community represents one', () => {
    const members = documentPortfolio().map((m) => ({ ...m, representsUndervisibleGroup: false }))
    const result = assessPortfolio(members)
    expect(result.findings.some((f) => f.rule === 'undervisible-group')).toBe(true)
  })
})

describe('top-N selection detection', () => {
  const candidates = [
    { villageId: 'desa-b', poci: 88.0 },
    { villageId: 'desa-a', poci: 86.0 },
    { villageId: 'desa-c', poci: 78.3 },
    { villageId: 'desa-d', poci: 73.3 },
    { villageId: 'desa-h', poci: 59.3 },
    { villageId: 'desa-f', poci: 54.5 },
    { villageId: 'desa-e', poci: 22.0 },
    { villageId: 'desa-g', poci: 21.0 },
  ]

  it('flags a selection that is exactly the highest scores', () => {
    const selected = [
      member('Desa B', 88.0, 'T2'),
      member('Desa A', 86.0, 'T1'),
      member('Desa C', 78.3, 'T3'),
      member('Desa D', 73.3, 'T4'),
    ]
    const finding = detectTopNSelection(selected, candidates)
    expect(finding).not.toBeNull()
    expect(finding!.rule).toBe('top-n-selection')
  })

  it('does not flag the document portfolio, which reaches down to Desa F', () => {
    // A, B, C, D, F skips Desa H (59.3) to include the catalytic service
    // centre — evidence of pathway reasoning rather than ranking.
    const selected = documentPortfolio().filter((m) => !m.isComparator)
    expect(detectTopNSelection(selected, candidates)).toBeNull()
  })

  it('does not flag selections too small to show a pattern', () => {
    const selected = [member('Desa B', 88.0, 'T2'), member('Desa A', 86.0, 'T1')]
    expect(detectTopNSelection(selected, candidates)).toBeNull()
  })

  it('ignores unscored candidates when ranking', () => {
    const withNulls = [...candidates, { villageId: 'desa-unknown', poci: null }]
    const selected = [
      member('Desa B', 88.0, 'T2'),
      member('Desa A', 86.0, 'T1'),
      member('Desa C', 78.3, 'T3'),
    ]
    expect(detectTopNSelection(selected, withNulls)).not.toBeNull()
  })
})

describe('typology suggestion', () => {
  const input = (P: number | null, N: number | null, E: number | null, F: number | null, L: number | null): PociInput =>
    ({ P, N, E, F, L })

  const suggest = (v: PociInput) => suggestTypology(v, computePoci(v).score)

  it('reads Desa D as a supply-chain community despite low proximity', () => {
    // Design doc 7.1: "Secara geometris lebih jauh tetapi economic linkage
    // sangat kuat melalui pemasok TBS."
    expect(suggest(input(40, 80, 95, 60, 65)).code).toBe('T4')
  })

  it('reads Desa E and G as low-exposure comparators', () => {
    expect(suggest(input(65, 25, 5, 20, 10)).code).toBe('T7')
    expect(suggest(input(35, 30, 10, 20, 15)).code).toBe('T7')
  })

  it('reads a high-scoring multi-pathway profile as mixed linkage', () => {
    expect(suggest(input(90, 85, 90, 80, 95)).code).toBe('T6')
  })

  it('declines to suggest when too little is evidenced', () => {
    const result = suggest(input(40, null, null, null, null))
    expect(result.code).toBeNull()
    expect(result.confident).toBe(false)
  })

  it('always explains itself', () => {
    for (const v of [input(40, 80, 95, 60, 65), input(65, 25, 5, 20, 10), input(40, null, null, null, null)]) {
      expect(suggest(v).rationale.length).toBeGreaterThan(0)
    }
  })
})
