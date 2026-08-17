/**
 * Project store: all analyst work product, persisted to localStorage and
 * exportable as a versioned JSON file.
 *
 * Design constraints:
 *  - Source data is never written here. Only analyst input.
 *  - Everything keys off VILLAGE_ID, so re-extracting source data is safe.
 *  - Validation records merge by stable id, so re-deriving the queue after a
 *    score change preserves analyst status, notes and tier overrides.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ABCD_COMPONENTS,
  POCI_COMPONENTS,
  type AbcdComponent,
  type ConfidenceGrade,
  type ContributionCategory,
  type EvidenceTier,
  type IndicatorCode,
  type PociComponent,
  type Scored,
  type Typology,
  type ValidationTier,
} from '@/domain/types'
import type { ValidationItem } from '@/domain/validation'
import {
  PROJECT_SCHEMA_VERSION,
  type CaseProject,
  type EvidenceRecord,
  type IndicatorAssessment,
  type ProjectExport,
  type ValidationRecord,
  type VillageScreening,
} from './types'

const emptyPociEntry = () => ({ value: null as Scored, note: '', sources: [], tiers: [] })

export function createScreening(villageId: string, proximity: Scored): VillageScreening {
  const components = {} as VillageScreening['components']
  for (const c of POCI_COMPONENTS) components[c] = emptyPociEntry()

  // P is the one component the source data already provides. It is seeded with
  // its provenance so it is not mistaken for an analyst judgement.
  components.P = {
    value: proximity,
    note: 'Derived from DIST_TO_CONCESSION_KM using the design document proximity rubric (Table 4).',
    sources: ['IDN-S08'],
    tiers: ['G'],
  }

  return {
    villageId,
    components,
    typology: null,
    typologyNote: '',
    confidenceOverride: null,
    confidenceOverrideReason: '',
    selected: false,
    isComparator: false,
    representsUndervisibleGroup: false,
    undervisibleGroupNote: '',
    comparatorCriteria: {},
    flagged: false,
    notes: '',
  }
}

export function createAssessment(villageId: string, indicator: IndicatorCode): IndicatorAssessment {
  return {
    villageId,
    indicator,
    components: Object.fromEntries(
      ABCD_COMPONENTS.map((c) => [c, null]),
    ) as Record<AbcdComponent, Scored>,
    componentNotes: {},
    tiers: [],
    sources: [],
    confidence: null,
    confidenceOverridden: false,
    contribution: null,
    contributionNote: '',
    beneficiaries: '',
    evidenceGaps: '',
    advocacyCritical: false,
    hasContradiction: false,
    contradictionNote: '',
    notes: '',
  }
}

const emptyCase = (caseId: string): CaseProject => ({
  caseId,
  screening: {},
  assessments: {},
  validation: {},
  evidence: [],
  updatedAt: new Date().toISOString(),
})

export const assessmentKey = (villageId: string, indicator: IndicatorCode) =>
  `${villageId}:${indicator}`

interface ProjectState {
  cases: Record<string, CaseProject>
  activeCaseId: string | null

  setActiveCase: (caseId: string) => void
  ensureCase: (caseId: string) => void

  // --- screening ---
  ensureScreening: (caseId: string, villageId: string, proximity: Scored) => void
  setPociComponent: (
    caseId: string,
    villageId: string,
    component: PociComponent,
    patch: Partial<{ value: Scored; note: string; sources: string[]; tiers: EvidenceTier[] }>,
  ) => void
  setTypology: (caseId: string, villageId: string, typology: Typology | null, note?: string) => void
  updateScreening: (caseId: string, villageId: string, patch: Partial<VillageScreening>) => void
  toggleSelected: (caseId: string, villageId: string) => void

  // --- assessment ---
  ensureAssessment: (caseId: string, villageId: string, indicator: IndicatorCode) => void
  setAbcdComponent: (
    caseId: string,
    villageId: string,
    indicator: IndicatorCode,
    component: AbcdComponent,
    value: Scored,
    note?: string,
  ) => void
  updateAssessment: (
    caseId: string,
    villageId: string,
    indicator: IndicatorCode,
    patch: Partial<IndicatorAssessment>,
  ) => void
  setConfidence: (
    caseId: string,
    villageId: string,
    indicator: IndicatorCode,
    grade: ConfidenceGrade | null,
    overridden: boolean,
  ) => void
  setContribution: (
    caseId: string,
    villageId: string,
    indicator: IndicatorCode,
    category: ContributionCategory | null,
  ) => void

  // --- validation ---
  syncValidation: (caseId: string, derived: ValidationItem[]) => void
  updateValidation: (caseId: string, id: string, patch: Partial<ValidationRecord>) => void
  setValidationTier: (caseId: string, id: string, tier: ValidationTier) => void

  // --- evidence register ---
  addEvidence: (caseId: string, record: Omit<EvidenceRecord, 'id'>) => void
  updateEvidence: (caseId: string, id: string, patch: Partial<EvidenceRecord>) => void
  removeEvidence: (caseId: string, id: string) => void

  // --- project file ---
  exportProject: () => ProjectExport
  importProject: (data: unknown) => { ok: true; cases: number } | { ok: false; error: string }
  resetCase: (caseId: string) => void
}

/** Applies a mutation to one case and stamps updatedAt. */
function mutateCase(
  state: ProjectState,
  caseId: string,
  fn: (draft: CaseProject) => void,
): Partial<ProjectState> {
  const existing = state.cases[caseId] ?? emptyCase(caseId)
  const draft: CaseProject = {
    ...existing,
    screening: { ...existing.screening },
    assessments: { ...existing.assessments },
    validation: { ...existing.validation },
    evidence: [...existing.evidence],
  }
  fn(draft)
  draft.updatedAt = new Date().toISOString()
  return { cases: { ...state.cases, [caseId]: draft } }
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      cases: {},
      activeCaseId: null,

      setActiveCase: (caseId) => set({ activeCaseId: caseId }),

      ensureCase: (caseId) =>
        set((s) => (s.cases[caseId] ? {} : { cases: { ...s.cases, [caseId]: emptyCase(caseId) } })),

      // --- screening --------------------------------------------------------
      ensureScreening: (caseId, villageId, proximity) =>
        set((s) => {
          if (s.cases[caseId]?.screening[villageId]) return {}
          return mutateCase(s, caseId, (d) => {
            d.screening[villageId] = createScreening(villageId, proximity)
          })
        }),

      setPociComponent: (caseId, villageId, component, patch) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const screening = d.screening[villageId]
            if (!screening) return
            d.screening[villageId] = {
              ...screening,
              components: {
                ...screening.components,
                [component]: { ...screening.components[component], ...patch },
              },
            }
          }),
        ),

      setTypology: (caseId, villageId, typology, note) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const screening = d.screening[villageId]
            if (!screening) return
            d.screening[villageId] = {
              ...screening,
              typology,
              typologyNote: note ?? screening.typologyNote,
            }
          }),
        ),

      updateScreening: (caseId, villageId, patch) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const screening = d.screening[villageId]
            if (!screening) return
            d.screening[villageId] = { ...screening, ...patch }
          }),
        ),

      toggleSelected: (caseId, villageId) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const screening = d.screening[villageId]
            if (!screening) return
            d.screening[villageId] = { ...screening, selected: !screening.selected }
          }),
        ),

      // --- assessment -------------------------------------------------------
      ensureAssessment: (caseId, villageId, indicator) =>
        set((s) => {
          const key = assessmentKey(villageId, indicator)
          if (s.cases[caseId]?.assessments[key]) return {}
          return mutateCase(s, caseId, (d) => {
            d.assessments[key] = createAssessment(villageId, indicator)
          })
        }),

      setAbcdComponent: (caseId, villageId, indicator, component, value, note) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const key = assessmentKey(villageId, indicator)
            const current = d.assessments[key] ?? createAssessment(villageId, indicator)
            d.assessments[key] = {
              ...current,
              components: { ...current.components, [component]: value },
              componentNotes:
                note === undefined
                  ? current.componentNotes
                  : { ...current.componentNotes, [component]: note },
            }
          }),
        ),

      updateAssessment: (caseId, villageId, indicator, patch) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const key = assessmentKey(villageId, indicator)
            const current = d.assessments[key] ?? createAssessment(villageId, indicator)
            d.assessments[key] = { ...current, ...patch }
          }),
        ),

      setConfidence: (caseId, villageId, indicator, grade, overridden) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const key = assessmentKey(villageId, indicator)
            const current = d.assessments[key] ?? createAssessment(villageId, indicator)
            d.assessments[key] = { ...current, confidence: grade, confidenceOverridden: overridden }
          }),
        ),

      setContribution: (caseId, villageId, indicator, category) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const key = assessmentKey(villageId, indicator)
            const current = d.assessments[key] ?? createAssessment(villageId, indicator)
            d.assessments[key] = { ...current, contribution: category }
          }),
        ),

      // --- validation -------------------------------------------------------
      /**
       * Merges freshly derived queue items with existing records.
       *
       * Items are matched by their stable derived id. An item that still
       * triggers keeps whatever the analyst set on it; an item that no longer
       * triggers is dropped UNLESS the analyst has already acted on it, in
       * which case it is retained as a record of work done.
       */
      syncValidation: (caseId, derived) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const derivedIds = new Set(derived.map((i) => i.id))
            const next: Record<string, ValidationRecord> = {}

            for (const item of derived) {
              const existing = d.validation[item.id]
              next[item.id] = existing ?? {
                id: item.id,
                status: 'open',
                tier: item.tier,
                tierOverridden: false,
                assignee: '',
                note: '',
                resolution: '',
              }
            }

            // Preserve resolved/dismissed work whose trigger has since cleared.
            for (const [id, record] of Object.entries(d.validation)) {
              if (!derivedIds.has(id) && record.status !== 'open') next[id] = record
            }

            d.validation = next
          }),
        ),

      updateValidation: (caseId, id, patch) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const current = d.validation[id]
            if (!current) return
            d.validation[id] = { ...current, ...patch }
          }),
        ),

      setValidationTier: (caseId, id, tier) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            const current = d.validation[id]
            if (!current) return
            d.validation[id] = { ...current, tier, tierOverridden: true }
          }),
        ),

      // --- evidence register ------------------------------------------------
      addEvidence: (caseId, record) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            d.evidence.push({ ...record, id: crypto.randomUUID() })
          }),
        ),

      updateEvidence: (caseId, id, patch) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            d.evidence = d.evidence.map((e) => (e.id === id ? { ...e, ...patch } : e))
          }),
        ),

      removeEvidence: (caseId, id) =>
        set((s) =>
          mutateCase(s, caseId, (d) => {
            d.evidence = d.evidence.filter((e) => e.id !== id)
          }),
        ),

      // --- project file -----------------------------------------------------
      exportProject: () => ({
        schemaVersion: PROJECT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        application: 'ABCDS-RF',
        cases: get().cases,
      }),

      importProject: (data) => {
        if (typeof data !== 'object' || data === null) {
          return { ok: false, error: 'File is not a valid project object.' }
        }
        const parsed = data as Partial<ProjectExport>
        if (parsed.application !== 'ABCDS-RF') {
          return { ok: false, error: 'File is not an ABCDS-RF project export.' }
        }
        if (parsed.schemaVersion !== PROJECT_SCHEMA_VERSION) {
          return {
            ok: false,
            error: `Project schema version ${parsed.schemaVersion} cannot be read by this build (expects ${PROJECT_SCHEMA_VERSION}).`,
          }
        }
        if (typeof parsed.cases !== 'object' || parsed.cases === null) {
          return { ok: false, error: 'Project export contains no cases.' }
        }

        // Replaces rather than merges: a project file is a complete snapshot,
        // and silently blending two analysts' work would corrupt provenance.
        set({ cases: parsed.cases })
        return { ok: true, cases: Object.keys(parsed.cases).length }
      },

      resetCase: (caseId) =>
        set((s) => ({ cases: { ...s.cases, [caseId]: emptyCase(caseId) } })),
    }),
    {
      name: 'abcds-rf-project',
      version: PROJECT_SCHEMA_VERSION,
      partialize: (s) => ({ cases: s.cases, activeCaseId: s.activeCaseId }),
    },
  ),
)
