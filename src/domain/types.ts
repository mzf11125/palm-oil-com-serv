/**
 * Shared domain vocabulary for ABCDS-RF.
 *
 * Terms follow the two methodological design documents, so names here are the
 * names used in the docs (POCI components P/N/E/F/L, ABCD components A/C/M/I/O,
 * evidence tiers S/G/P-R/P-L/P-C, typologies T1-T7).
 */

/** Missing evidence. Never coerced to 0 anywhere in this codebase. */
export const NA = null
export type NA = null

/** A score that may legitimately be absent. */
export type Scored<T extends number = number> = T | NA

// --- POCI -------------------------------------------------------------------

export const POCI_COMPONENTS = ['P', 'N', 'E', 'F', 'L'] as const
export type PociComponent = (typeof POCI_COMPONENTS)[number]

/** Design doc section 5. Components are on a 0-100 scale. */
export const POCI_WEIGHTS: Record<PociComponent, number> = {
  P: 0.15, // Proximity
  N: 0.25, // Network connectivity
  E: 0.3, // Economic linkage — highest weight; most direct functional exposure
  F: 0.15, // Facility / infrastructure linkage
  L: 0.15, // Institutional / social linkage
}

export type PociInput = Record<PociComponent, Scored>

// --- ABCD -------------------------------------------------------------------

export const ABCD_COMPONENTS = ['A', 'C', 'M', 'I', 'O'] as const
export type AbcdComponent = (typeof ABCD_COMPONENTS)[number]

/** Scorecard doc Table 3. Components are rated 0-4. */
export const ABCD_WEIGHTS: Record<AbcdComponent, number> = {
  A: 0.2, // Asset strength
  C: 0.2, // Connectivity & accessibility
  M: 0.25, // Mobilisation & community agency — the ABCD/inventory distinction
  I: 0.15, // Inclusion & community control
  O: 0.2, // Outcome & continuity
}

/** Component ratings are ordinal 0-4; 25 x weighted mean yields 0-100. */
export const ABCD_SCALE_MAX = 4
export const ABCD_SCALE_FACTOR = 25

export type AbcdInput = Record<AbcdComponent, Scored>

export const PILLARS = ['HUM', 'ASS', 'INS', 'PSN', 'ECO'] as const
export type PillarCode = (typeof PILLARS)[number]

export type IndicatorCode =
  | 'HUM-1' | 'HUM-2' | 'HUM-3'
  | 'ASS-1' | 'ASS-2' | 'ASS-3'
  | 'INS-1' | 'INS-2' | 'INS-3'
  | 'PSN-1' | 'PSN-2' | 'PSN-3'
  | 'ECO-1' | 'ECO-2' | 'ECO-3'

// --- Evidence ---------------------------------------------------------------

/** Scorecard doc Table 5. */
export const EVIDENCE_TIERS = ['S', 'G', 'P-R', 'P-L', 'P-C'] as const
export type EvidenceTier = (typeof EVIDENCE_TIERS)[number]

/** Scorecard doc Table 10. Reported separately from score, never folded in. */
export const CONFIDENCE_GRADES = ['A', 'B', 'C', 'D', 'NA'] as const
export type ConfidenceGrade = (typeof CONFIDENCE_GRADES)[number]

/** Scorecard doc Table 4. A layer alongside the asset score, not inside it. */
export const CONTRIBUTION_CATEGORIES = [
  'direct',
  'indirect',
  'catalytic',
  'enabling',
  'co-produced',
  'external',
] as const
export type ContributionCategory = (typeof CONTRIBUTION_CATEGORIES)[number]

// --- Typology ---------------------------------------------------------------

/** Design doc Table 5. */
export const TYPOLOGIES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const
export type Typology = (typeof TYPOLOGIES)[number]

/**
 * Proposal section E.3.2 defines >=70 high, 40-69 moderate, <30 low.
 * 30-39.99 is genuinely unspecified in the source documents, so it gets its
 * own band rather than being silently folded into a neighbour.
 */
export type ExposureBand = 'high' | 'moderate' | 'unbanded' | 'low'

/** Validation escalation tiers. Design doc Table 11. */
export const VALIDATION_TIERS = ['none', 'P-R', 'P-L', 'P-C'] as const
export type ValidationTier = (typeof VALIDATION_TIERS)[number]
