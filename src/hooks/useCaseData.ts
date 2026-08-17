/**
 * Derived case state: joins extracted source data with analyst input and runs
 * the domain engine over the result.
 *
 * This is the only place the two halves meet. Source data stays immutable,
 * analyst input stays keyed by VILLAGE_ID, and everything scored is computed
 * fresh rather than stored — so a change to the engine can never leave stale
 * numbers persisted in someone's browser.
 */

import { useEffect, useMemo, useState } from 'react'
import { loadCase } from '@/data/load'
import type { CaseCluster, VillageFeature } from '@/data/types'
import { computePoci, type PociResult } from '@/domain/poci'
import { computeIndicator, computeAllPillars, computeComposite, type PillarResult } from '@/domain/abcd'
import { suggestTypology, type TypologySuggestion } from '@/domain/typology'
import { proposeConfidence } from '@/domain/confidence'
import { deriveValidationItems, type ScoredIndicatorState, type ValidationItem } from '@/domain/validation'
import { INDICATORS } from '@/reference/indicators'
import { useProjectStore, assessmentKey } from '@/store/project'
import type { IndicatorAssessment, VillageScreening } from '@/store/types'
import type { ConfidenceGrade, IndicatorCode, PociInput } from '@/domain/types'

export interface ScreenedVillage {
  feature: VillageFeature
  villageId: string
  name: string
  screening: VillageScreening | undefined
  poci: PociResult
  suggestion: TypologySuggestion
  /** Analyst-confirmed typology, falling back to nothing (never the suggestion). */
  typology: VillageScreening['typology']
  confidence: ConfidenceGrade
  confidenceRationale: string
  confidenceOverridden: boolean
}

/** Loads a case cluster's source data. */
export function useCase(caseId: string | null) {
  const [data, setData] = useState<CaseCluster | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!caseId) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    loadCase(caseId)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [caseId])

  return { data, error, loading }
}

/**
 * Seeds a screening record for every village in the case, carrying the
 * source-provided proximity score across. Runs once per case load.
 */
export function useSeedScreening(caseData: CaseCluster | null) {
  const ensureScreening = useProjectStore((s) => s.ensureScreening)
  const ensureCase = useProjectStore((s) => s.ensureCase)

  useEffect(() => {
    if (!caseData) return
    ensureCase(caseData.caseId)
    for (const f of caseData.villages.features) {
      ensureScreening(caseData.caseId, f.properties.VILLAGE_ID, f.properties.P ?? null)
    }
  }, [caseData, ensureCase, ensureScreening])
}

/** Joins villages with their screening state and computes POCI for each. */
export function useScreenedVillages(caseData: CaseCluster | null): ScreenedVillage[] {
  const screeningMap = useProjectStore((s) =>
    caseData ? s.cases[caseData.caseId]?.screening : undefined,
  )

  return useMemo(() => {
    if (!caseData) return []

    return caseData.villages.features.map((feature) => {
      const villageId = feature.properties.VILLAGE_ID
      const screening = screeningMap?.[villageId]

      const input: PociInput = {
        P: screening?.components.P.value ?? feature.properties.P ?? null,
        N: screening?.components.N.value ?? null,
        E: screening?.components.E.value ?? null,
        F: screening?.components.F.value ?? null,
        L: screening?.components.L.value ?? null,
      }

      const poci = computePoci(input)
      const suggestion = suggestTypology(input, poci.score)

      const tiers = screening
        ? [...new Set(Object.values(screening.components).flatMap((c) => c.tiers))]
        : []
      const proposed = proposeConfidence({ coverage: poci.coverage, tiers })

      const overridden = screening?.confidenceOverride != null

      return {
        feature,
        villageId,
        name: feature.properties.VILLAGE_NAME,
        screening,
        poci,
        suggestion,
        typology: screening?.typology ?? null,
        confidence: screening?.confidenceOverride ?? proposed.grade,
        confidenceRationale: overridden
          ? screening?.confidenceOverrideReason || 'Analyst override'
          : proposed.rationale,
        confidenceOverridden: overridden,
      }
    })
  }, [caseData, screeningMap])
}

export interface IndicatorScore {
  indicator: IndicatorCode
  assessment: IndicatorAssessment | undefined
  score: number | null
  coverage: number
  missing: string[]
  confidence: ConfidenceGrade
  confidenceRationale: string
}

export interface VillageAssessment {
  villageId: string
  indicators: IndicatorScore[]
  pillars: PillarResult[]
  composite: ReturnType<typeof computeComposite>
  /** Indicators with at least one component scored. */
  scoredCount: number
}

/** Computes the full ABCD profile for one community. */
export function useVillageAssessment(caseId: string | null, villageId: string | null): VillageAssessment | null {
  const assessments = useProjectStore((s) => (caseId ? s.cases[caseId]?.assessments : undefined))

  return useMemo(() => {
    if (!caseId || !villageId) return null

    const indicators: IndicatorScore[] = INDICATORS.map((def) => {
      const assessment = assessments?.[assessmentKey(villageId, def.code)]
      const result = computeIndicator(
        assessment?.components ?? { A: null, C: null, M: null, I: null, O: null },
      )

      const proposed = proposeConfidence({
        coverage: result.coverage,
        tiers: assessment?.tiers ?? [],
        hasUnresolvedContradiction: assessment?.hasContradiction,
      })

      return {
        indicator: def.code,
        assessment,
        score: result.score,
        coverage: result.coverage,
        missing: result.missing,
        confidence: assessment?.confidenceOverridden
          ? (assessment.confidence ?? proposed.grade)
          : proposed.grade,
        confidenceRationale: assessment?.confidenceOverridden ? 'Analyst override' : proposed.rationale,
      }
    })

    const scoreMap = Object.fromEntries(indicators.map((i) => [i.indicator, i.score])) as Partial<
      Record<IndicatorCode, number | null>
    >
    const pillars = computeAllPillars(scoreMap)

    return {
      villageId,
      indicators,
      pillars,
      composite: computeComposite(pillars),
      scoredCount: indicators.filter((i) => i.score !== null).length,
    }
  }, [caseId, villageId, assessments])
}

/**
 * Derives the validation queue for every selected community and keeps the
 * store in sync. Items merge by stable id, so analyst status and notes survive
 * a recompute triggered by a score change.
 */
export function useValidationSync(caseId: string | null, selectedVillages: ScreenedVillage[]) {
  const assessments = useProjectStore((s) => (caseId ? s.cases[caseId]?.assessments : undefined))
  const syncValidation = useProjectStore((s) => s.syncValidation)

  const derived = useMemo<ValidationItem[]>(() => {
    if (!caseId) return []
    const items: ValidationItem[] = []

    for (const village of selectedVillages) {
      const states: ScoredIndicatorState[] = INDICATORS.map((def) => {
        const assessment = assessments?.[assessmentKey(village.villageId, def.code)]
        const result = computeIndicator(
          assessment?.components ?? { A: null, C: null, M: null, I: null, O: null },
        )
        const proposed = proposeConfidence({
          coverage: result.coverage,
          tiers: assessment?.tiers ?? [],
          hasUnresolvedContradiction: assessment?.hasContradiction,
        })
        return {
          indicator: def.code,
          missingComponents: result.missing,
          coverage: result.coverage,
          confidence: assessment?.confidenceOverridden
            ? (assessment.confidence ?? proposed.grade)
            : proposed.grade,
          tiers: assessment?.tiers ?? [],
          advocacyCritical: assessment?.advocacyCritical,
          hasContradiction: assessment?.hasContradiction,
        }
      // Only indicators the analyst has actually opened generate queue items.
      // Otherwise every unstarted indicator would flood the queue on day one.
      }).filter((s) => s.coverage > 0 || s.hasContradiction)

      items.push(...deriveValidationItems(village.villageId, village.name, states))
    }

    return items
  }, [caseId, selectedVillages, assessments])

  useEffect(() => {
    if (!caseId) return
    syncValidation(caseId, derived)
  }, [caseId, derived, syncValidation])

  return derived
}
