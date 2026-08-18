/**
 * Validation queue and escalation triggers.
 *
 * Remote-first does not mean remote-only. The queue exists so that human
 * evidence is spent where desk evidence genuinely cannot settle the question,
 * and nowhere else:
 *
 *   "Validasi hanya dimensi yang belum pasti."     -- Design doc, section 4
 *   "Every P-R/P-L/P-C activity linked to a specific evidence gap or claim."
 *                                                  -- Proposal, section E.11
 *
 * Each queue item therefore carries the trigger that produced it. An item with
 * no trigger is an unjustified cost.
 */

import type { EvidenceTier, IndicatorCode, ValidationTier } from './types'

export type TriggerCode =
  | 'missing-evidence'
  | 'source-contradiction'
  | 'low-confidence-advocacy'
  | 'agency-not-inferable'
  | 'facility-functionality-unclear'
  | 'sensitive-environmental-claim'
  | 'narrative-requirement'

export interface TriggerDefinition {
  code: TriggerCode
  label: string
  /** The tier this trigger normally escalates to. */
  defaultTier: ValidationTier
}

/** Design doc section 11.1 / proposal section E.5.3. */
export const TRIGGERS: Record<TriggerCode, TriggerDefinition> = {
  'missing-evidence': {
    code: 'missing-evidence',
    label: 'Missing evidence affecting classification or ABCD score',
    defaultTier: 'P-R',
  },
  'source-contradiction': {
    code: 'source-contradiction',
    label: 'Contradiction between company, government, cooperative, community or spatial evidence',
    defaultTier: 'P-R',
  },
  'low-confidence-advocacy': {
    code: 'low-confidence-advocacy',
    label: 'Low confidence on a claim important for advocacy or policy',
    defaultTier: 'P-R',
  },
  'agency-not-inferable': {
    code: 'agency-not-inferable',
    label: 'Agency, participation, inclusion, trust or community control cannot be inferred from secondary data',
    defaultTier: 'P-R',
  },
  'facility-functionality-unclear': {
    code: 'facility-functionality-unclear',
    label: 'Facility or road detected but functionality or public access is unclear',
    defaultTier: 'P-L',
  },
  'sensitive-environmental-claim': {
    code: 'sensitive-environmental-claim',
    label: 'Sensitive environmental or facility claim requiring technical verification',
    defaultTier: 'P-C',
  },
  'narrative-requirement': {
    code: 'narrative-requirement',
    label: 'Human-centred narrative required, representing an already-validated pathway',
    defaultTier: 'P-C',
  },
}

/**
 * Evidence-intensity matrix (scorecard doc Table 7).
 *   M = main/default, R = required for final evidence,
 *   S = supporting/conditional, C = conditional trigger, N = not normally required
 */
export type Intensity = 'M' | 'R' | 'S' | 'C' | 'N'

export const EVIDENCE_INTENSITY: Record<IndicatorCode, Record<EvidenceTier, Intensity>> = {
  'HUM-1': { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  'HUM-2': { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  'HUM-3': { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  'ASS-1': { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  'ASS-2': { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  'ASS-3': { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  'INS-1': { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'N' },
  'INS-2': { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'C' },
  'INS-3': { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  'PSN-1': { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'R', 'P-C': 'C' },
  'PSN-2': { S: 'M', G: 'M', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  'PSN-3': { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'C' },
  'ECO-1': { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  'ECO-2': { S: 'M', G: 'M', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  'ECO-3': { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
}

export interface ValidationItem {
  id: string
  villageId: string
  villageName: string
  /** Null for POCI-level items, which are not tied to one indicator. */
  indicator: IndicatorCode | null
  trigger: TriggerCode
  detail: string
  tier: ValidationTier
  status: 'open' | 'in-progress' | 'resolved' | 'dismissed'
  /** Set when the analyst changes the tier away from the trigger default. */
  tierOverridden?: boolean
  note?: string
}

export interface ScoredIndicatorState {
  indicator: IndicatorCode
  /** Component keys with no evidence. */
  missingComponents: string[]
  coverage: number
  confidence: string
  tiers: EvidenceTier[]
  advocacyCritical?: boolean
  hasContradiction?: boolean
}

/**
 * Derives queue items for one community from its current evidence state.
 *
 * Deterministic and idempotent: re-deriving after a score change produces the
 * same ids, so analyst-set status and notes survive a recompute. The store
 * merges on id rather than replacing the queue wholesale.
 */
export function deriveValidationItems(
  villageId: string,
  villageName: string,
  indicators: ScoredIndicatorState[],
): ValidationItem[] {
  const items: ValidationItem[] = []
  const add = (
    indicator: IndicatorCode | null,
    trigger: TriggerCode,
    detail: string,
    tier?: ValidationTier,
  ) => {
    items.push({
      id: `${villageId}:${indicator ?? 'POCI'}:${trigger}`,
      villageId,
      villageName,
      indicator,
      trigger,
      detail,
      tier: tier ?? TRIGGERS[trigger].defaultTier,
      status: 'open',
    })
  }

  for (const state of indicators) {
    const { indicator } = state

    if (state.missingComponents.length > 0) {
      add(
        indicator,
        'missing-evidence',
        `Components not evidenced: ${state.missingComponents.join(', ')} (${Math.round(state.coverage * 100)}% coverage).`,
      )
    }

    if (state.hasContradiction) {
      add(indicator, 'source-contradiction', 'Sources disagree and the conflict is unresolved.')
    }

    if (state.advocacyCritical && (state.confidence === 'C' || state.confidence === 'D')) {
      add(
        indicator,
        'low-confidence-advocacy',
        `Marked advocacy-critical but confidence is ${state.confidence}; grade A or B is required for external claims.`,
      )
    }

    // Agency-family indicators cannot be settled from records and imagery.
    // Scorecard doc Table 8: "Remote primary biasanya diperlukan karena
    // agency, capability, participation dan control tidak dapat diukur valid
    // hanya dengan imagery/records."
    if (AGENCY_INDICATORS.includes(indicator)) {
      const hasHuman = state.tiers.some((t) => t === 'P-R' || t === 'P-L' || t === 'P-C')
      if (!hasHuman && state.coverage > 0) {
        add(
          indicator,
          'agency-not-inferable',
          'Scored without any human validation. Agency, participation and control cannot be inferred from secondary or spatial data alone.',
        )
      }
    }

    // Physical assets detected from spatial data need a functionality check.
    if (FACILITY_INDICATORS.includes(indicator)) {
      const hasLocal = state.tiers.includes('P-L')
      const hasGeo = state.tiers.includes('G')
      if (hasGeo && !hasLocal && state.coverage > 0) {
        add(
          indicator,
          'facility-functionality-unclear',
          'Mapped from spatial evidence without local verification. Presence does not establish functionality or public access.',
        )
      }
    }

    // Environmental technical claims are the one place the docs require
    // central-team specialist work rather than remote or local verification.
    if (indicator === 'PSN-3' && state.advocacyCritical) {
      add(
        indicator,
        'sensitive-environmental-claim',
        'Advocacy-critical environmental claim. Laboratory, contamination, pollution-attribution or structural-integrity claims require specialist verification.',
      )
    }
  }

  return items
}

/** Indicators whose subject matter is agency, participation or control. */
const AGENCY_INDICATORS: IndicatorCode[] = ['HUM-3', 'ASS-1', 'ASS-2', 'ASS-3', 'INS-3']

/** Indicators grounded in physical assets whose presence != functionality. */
const FACILITY_INDICATORS: IndicatorCode[] = ['INS-1', 'INS-2', 'PSN-1', 'PSN-2']

/** Assessment intensity tiers (design doc Table 11). */
export const ASSESSMENT_TIERS = [
  {
    tier: 'Tier A',
    scope: 'All candidate communities',
    evidence: 'Secondary + administrative + operational + GeoAI',
    purpose: 'Provisional POCI; ABCD baseline for indicators with available data.',
    fieldBurden: 'No field routine',
  },
  {
    tier: 'Tier B',
    scope: 'Selected ABCD communities',
    evidence: 'Tier A + remote KII / mini-validation / FGD',
    purpose: 'Verify agency, inclusion, functionality, attribution.',
    fieldBurden: 'Default primary-data mode',
  },
  {
    tier: 'Tier C',
    scope: 'Local geotagged verification',
    evidence: 'Mobile GIS, GPS/time, photo, route log, short user confirmation',
    purpose: 'Resolve road, facility, functionality or location gaps.',
    fieldBurden: 'Triggered only',
  },
  {
    tier: 'Tier D',
    scope: 'Sentinel field visit',
    evidence: 'Integrated observation, interview, FGD, GPS, technical checks',
    purpose: 'High-value, conflicting, sensitive or communication-critical evidence.',
    fieldBurden: 'Very selective',
  },
] as const
