/**
 * Analyst work product.
 *
 * This is kept strictly separate from the extracted source data. Everything
 * here is keyed by VILLAGE_ID so that re-running `npm run extract` — which
 * rewrites public/data wholesale — cannot destroy an analyst's work.
 */

import type {
  AbcdComponent,
  ConfidenceGrade,
  ContributionCategory,
  EvidenceTier,
  IndicatorCode,
  PociComponent,
  Scored,
  Typology,
  ValidationTier,
} from '@/domain/types'
import type { ComparatorCriterionKey } from '@/domain/portfolio'

/** One POCI component score plus the evidence behind it. */
export interface PociComponentEntry {
  value: Scored
  /**
   * Required whenever a value is set. The design doc's whole argument is that
   * a linkage claim must be traceable; a bare number is not evidence.
   */
  note: string
  sources: string[]
  tiers: EvidenceTier[]
}

export interface VillageScreening {
  villageId: string
  /** P is seeded from source data; N/E/F/L start as NA. */
  components: Record<PociComponent, PociComponentEntry>
  /** Analyst-confirmed typology. The suggestion is never auto-applied. */
  typology: Typology | null
  typologyNote: string
  confidenceOverride: ConfidenceGrade | null
  confidenceOverrideReason: string
  /** In the assessment portfolio. */
  selected: boolean
  isComparator: boolean
  representsUndervisibleGroup: boolean
  undervisibleGroupNote: string
  comparatorCriteria: Partial<Record<ComparatorCriterionKey, boolean>>
  flagged: boolean
  notes: string
}

export interface IndicatorAssessment {
  villageId: string
  indicator: IndicatorCode
  components: Record<AbcdComponent, Scored>
  componentNotes: Partial<Record<AbcdComponent, string>>
  tiers: EvidenceTier[]
  sources: string[]
  confidence: ConfidenceGrade | null
  confidenceOverridden: boolean
  contribution: ContributionCategory | null
  contributionNote: string
  beneficiaries: string
  evidenceGaps: string
  /** Feeds the low-confidence-advocacy validation trigger. */
  advocacyCritical: boolean
  hasContradiction: boolean
  contradictionNote: string
  notes: string
}

export interface ValidationRecord {
  /** Stable id: `${villageId}:${indicator ?? 'POCI'}:${trigger}`. */
  id: string
  status: 'open' | 'in-progress' | 'resolved' | 'dismissed'
  tier: ValidationTier
  tierOverridden: boolean
  assignee: string
  note: string
  resolution: string
}

/** Evidence register entry (scorecard doc section 12 stage 1, Appendix 4). */
export interface EvidenceRecord {
  id: string
  sourceId: string
  caseId: string
  owner: string
  period: string
  geography: string
  format: string
  accessRestriction: string
  updateFrequency: string
  completeness: 'complete' | 'partial' | 'minimal' | 'unavailable' | 'unknown'
  sensitivity: 'public' | 'internal' | 'restricted' | 'confidential'
  licence: string
  permittedUse: string
  status: 'requested' | 'received' | 'processed' | 'refused' | 'not-requested'
  requestedOn: string
  receivedOn: string
  qualityFlag: string
  notes: string
}

export interface CaseProject {
  caseId: string
  screening: Record<string, VillageScreening>
  /** Keyed `${villageId}:${indicator}`. */
  assessments: Record<string, IndicatorAssessment>
  validation: Record<string, ValidationRecord>
  evidence: EvidenceRecord[]
  updatedAt: string
}

/** Bumped when the persisted shape changes; import checks it. */
export const PROJECT_SCHEMA_VERSION = 1

/**
 * Value written into new exports. The former name is still accepted on import
 * so project files produced before the rename keep opening.
 */
export const APPLICATION_ID = 'ABCD-SCORECARD'
export const LEGACY_APPLICATION_IDS = ['ABCDS-RF'] as const

export interface ProjectExport {
  schemaVersion: number
  exportedAt: string
  application: 'ABCD-SCORECARD' | 'ABCDS-RF'
  cases: Record<string, CaseProject>
}
