/**
 * Assessment portfolio rules (design doc section 6.1 and Table 13).
 *
 * The portfolio is where the method most easily goes wrong, because the
 * intuitive move — take the top five by POCI — is the one thing the design
 * explicitly prohibits:
 *
 *   "Jangan mengambil lima desa dengan POCI tertinggi tanpa memperhatikan
 *    tipologi."
 *   "Pilih kombinasi desa yang mewakili pathway kontribusi berbeda serta satu
 *    atau dua pembanding exposure rendah."      -- Design doc, sections 6.1, 4
 *
 * So this validates pathway diversity and comparator presence, and warns when
 * a selection looks like a ranked top-N.
 */

import type { Typology } from './types'

export interface PortfolioMember {
  villageId: string
  villageName: string
  poci: number | null
  /** Analyst-confirmed typology, not the suggestion. */
  typology: Typology | null
  /** Marked by the analyst as the low-exposure comparator. */
  isComparator: boolean
  /**
   * Represents a group at risk of being invisible to spatial data —
   * independent smallholders, women/youth groups, or a remote community.
   * Design doc 6.1 requires at least one.
   */
  representsUndervisibleGroup: boolean
}

export type FindingSeverity = 'error' | 'warning' | 'info'

export interface PortfolioFinding {
  rule: string
  severity: FindingSeverity
  message: string
}

export interface PortfolioAssessment {
  exposedCount: number
  comparatorCount: number
  distinctTypologies: Typology[]
  findings: PortfolioFinding[]
  /** True when no finding is an error. Warnings are for the analyst to weigh. */
  valid: boolean
}

/** Design doc section 14: 4-6 exposed communities, 1-2 comparators. */
export const EXPOSED_MIN = 4
export const EXPOSED_MAX = 6
export const COMPARATOR_MIN = 1
export const COMPARATOR_MAX = 2
/** Section 6.1's "stronger design" implies at least four distinct pathways. */
export const TYPOLOGY_DIVERSITY_MIN = 4

export function assessPortfolio(members: PortfolioMember[]): PortfolioAssessment {
  const findings: PortfolioFinding[] = []
  const exposed = members.filter((m) => !m.isComparator)
  const comparators = members.filter((m) => m.isComparator)

  const distinctTypologies = [
    ...new Set(exposed.map((m) => m.typology).filter((t): t is Typology => t !== null)),
  ]

  // --- Exposed community count ---------------------------------------------
  if (exposed.length < EXPOSED_MIN) {
    findings.push({
      rule: 'exposed-count',
      severity: 'error',
      message: `${exposed.length} exposed communities selected. The design recommends ${EXPOSED_MIN}-${EXPOSED_MAX} per concession cluster.`,
    })
  } else if (exposed.length > EXPOSED_MAX) {
    findings.push({
      rule: 'exposed-count',
      severity: 'warning',
      message: `${exposed.length} exposed communities exceeds the indicative maximum of ${EXPOSED_MAX}. Check validation capacity.`,
    })
  }

  // --- Comparator ----------------------------------------------------------
  if (comparators.length < COMPARATOR_MIN) {
    findings.push({
      rule: 'comparator-required',
      severity: 'error',
      message: 'No low-exposure comparator selected. At least one is required for contextual comparison.',
    })
  } else if (comparators.length > COMPARATOR_MAX) {
    findings.push({
      rule: 'comparator-count',
      severity: 'warning',
      message: `${comparators.length} comparators selected. ${COMPARATOR_MIN}-${COMPARATOR_MAX} is the indicative range.`,
    })
  }

  // A comparator that scores as exposed is not a comparator.
  for (const c of comparators) {
    if (c.poci !== null && c.poci >= 40) {
      findings.push({
        rule: 'comparator-exposure',
        severity: 'warning',
        message: `${c.villageName} is marked as a comparator but scores POCI ${c.poci}, above the low-exposure range.`,
      })
    }
  }

  // --- Pathway diversity ---------------------------------------------------
  const untyped = exposed.filter((m) => m.typology === null)
  if (untyped.length > 0) {
    findings.push({
      rule: 'typology-assigned',
      severity: 'error',
      message: `${untyped.length} exposed community(ies) have no confirmed typology: ${untyped.map((m) => m.villageName).join(', ')}.`,
    })
  } else if (distinctTypologies.length < TYPOLOGY_DIVERSITY_MIN) {
    findings.push({
      rule: 'typology-diversity',
      severity: 'warning',
      message: `Only ${distinctTypologies.length} distinct pathway(s) represented (${distinctTypologies.join(', ')}). The design asks for contribution pathway diversity, not the highest scores.`,
    })
  }

  // --- Under-visible groups ------------------------------------------------
  if (members.length > 0 && !members.some((m) => m.representsUndervisibleGroup)) {
    findings.push({
      rule: 'undervisible-group',
      severity: 'warning',
      message: 'No selected community represents a group likely to be invisible to spatial data (independent smallholders, women/youth groups, or a remote community).',
    })
  }

  return {
    exposedCount: exposed.length,
    comparatorCount: comparators.length,
    distinctTypologies,
    findings,
    valid: !findings.some((f) => f.severity === 'error'),
  }
}

/**
 * Detects the prohibited "just take the top N" selection.
 *
 * Compares the exposed selection against the highest-POCI candidates. An exact
 * prefix match is the signal that ranking, not pathway reasoning, drove the
 * choice. Returns null when the selection shows evidence of real selection.
 */
export function detectTopNSelection(
  selectedExposed: PortfolioMember[],
  allCandidates: { villageId: string; poci: number | null }[],
): PortfolioFinding | null {
  if (selectedExposed.length < 3) return null

  const ranked = allCandidates
    .filter((c) => c.poci !== null)
    .sort((a, b) => b.poci! - a.poci!)
    .slice(0, selectedExposed.length)
    .map((c) => c.villageId)

  if (ranked.length < selectedExposed.length) return null

  const selectedIds = new Set(selectedExposed.map((m) => m.villageId))
  const isTopN = ranked.every((id) => selectedIds.has(id))
  if (!isTopN) return null

  return {
    rule: 'top-n-selection',
    severity: 'warning',
    message: `The ${selectedExposed.length} exposed communities are exactly the ${selectedExposed.length} highest POCI scores. The design warns against ranking-led selection. choose for pathway diversity and baseline variation instead.`,
  }
}

/**
 * Comparator selection criteria (design doc Table 8). Presented as a checklist
 * against a candidate comparator; the doc treats these as operational checks
 * rather than a computable score, so they stay analyst-confirmed.
 */
export const COMPARATOR_CRITERIA = [
  {
    key: 'baseline-remoteness',
    label: 'Baseline remoteness',
    check: 'Travel time and road access before palm-oil development were broadly similar.',
  },
  {
    key: 'population',
    label: 'Population / settlement',
    check: 'Population scale and settlement pattern are not too different.',
  },
  {
    key: 'agroecology',
    label: 'Agroecology',
    check: 'Topography, land cover, hazard and suitability are reasonably comparable.',
  },
  {
    key: 'service-access',
    label: 'Initial service access',
    check: 'Initial access to school, clinic, market and electricity/digital was broadly similar.',
  },
  {
    key: 'administrative',
    label: 'Administrative context',
    check: 'Where possible, within a similar district/province policy environment.',
  },
  {
    key: 'low-linkage',
    label: 'Low palm-oil linkage',
    check: 'Worker, supplier, procurement, programme and road dependence are low.',
  },
  {
    key: 'no-contamination',
    label: 'No strong contamination',
    check: 'Not on a corridor clearly receiving major spillover from the same concession.',
  },
] as const

export type ComparatorCriterionKey = (typeof COMPARATOR_CRITERIA)[number]['key']
