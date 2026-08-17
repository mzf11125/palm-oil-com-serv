/**
 * ABCD Scorecard scoring.
 *
 *   ABCD_j = 25 x (0.20A + 0.20C + 0.25M + 0.15I + 0.20O)
 *                                          -- Scorecard doc, section 2.1
 *
 * Each component is rated 0-4, so the maximum is 25 x 4 = 100.
 *
 *   "Nilai 100 tidak boleh dibaca sebagai bukti kontribusi penuh industri
 *    sawit; ia hanya menunjukkan profil kekuatan aset berdasarkan bukti yang
 *    tersedia."                            -- Scorecard doc, section 2.1
 *
 * Palm-oil contribution is a separate layer (see contribution.ts) and is
 * deliberately never mixed into these numbers.
 */

import { weightedScore, round, meanAvailable, type WeightedResult } from './score'
import {
  ABCD_WEIGHTS,
  ABCD_SCALE_FACTOR,
  PILLARS,
  type AbcdComponent,
  type AbcdInput,
  type IndicatorCode,
  type PillarCode,
} from './types'

export interface IndicatorResult extends WeightedResult<AbcdComponent> {
  /** 0-100, or null when no component has evidence. */
  score: number | null
}

/**
 * Scores one indicator from its five A/C/M/I/O component ratings.
 * Missing components are renormalised away, not treated as 0.
 */
export function computeIndicator(input: AbcdInput): IndicatorResult {
  const result = weightedScore<AbcdComponent>(input, ABCD_WEIGHTS)
  return {
    ...result,
    score: result.score === null ? null : round(result.score * ABCD_SCALE_FACTOR, 2),
  }
}

export const PILLAR_INDICATORS: Record<PillarCode, IndicatorCode[]> = {
  HUM: ['HUM-1', 'HUM-2', 'HUM-3'],
  ASS: ['ASS-1', 'ASS-2', 'ASS-3'],
  INS: ['INS-1', 'INS-2', 'INS-3'],
  PSN: ['PSN-1', 'PSN-2', 'PSN-3'],
  ECO: ['ECO-1', 'ECO-2', 'ECO-3'],
}

/** Scorecard doc Table 2: five pillars, equal provisional weight. */
export const PILLAR_WEIGHT = 0.2

export interface PillarResult {
  pillar: PillarCode
  score: number | null
  /** Indicators in this pillar that produced a score. */
  scoredIndicators: number
  totalIndicators: number
}

export function computePillar(
  pillar: PillarCode,
  indicatorScores: Partial<Record<IndicatorCode, number | null>>,
): PillarResult {
  const codes = PILLAR_INDICATORS[pillar]
  const values = codes.map((c) => indicatorScores[c] ?? null)
  return {
    pillar,
    score: round(meanAvailable(values), 2),
    scoredIndicators: values.filter((v) => v !== null).length,
    totalIndicators: codes.length,
  }
}

export function computeAllPillars(
  indicatorScores: Partial<Record<IndicatorCode, number | null>>,
): PillarResult[] {
  return PILLARS.map((p) => computePillar(p, indicatorScores))
}

export interface CompositeResult {
  score: number | null
  scoredPillars: number
  /**
   * True once every pillar has all three indicators scored. Below that the
   * composite is averaging over uneven evidence and should not be quoted.
   */
  complete: boolean
}

/**
 * Overall composite across the five equally weighted pillars.
 *
 * Deliberately gated behind an explicit opt-in in the UI. The proposal is
 * cautious about it twice over:
 *
 *   "The overall composite, if calculated, will be used cautiously; published
 *    interpretation will prioritise pillar profiles, gaps and confidence over
 *    a single rank."                             -- Proposal, section E.4.2
 *
 * and Appendix 6 still lists as unresolved "whether CPOPC prefers an overall
 * composite ABCD score to be externally displayed or only pillar/indicator
 * profiles". Until that is settled, pillar profiles are the headline.
 */
export function computeComposite(pillars: PillarResult[]): CompositeResult {
  const scores = pillars.map((p) => p.score)
  return {
    score: round(meanAvailable(scores), 2),
    scoredPillars: scores.filter((s) => s !== null).length,
    complete: pillars.every((p) => p.scoredIndicators === p.totalIndicators),
  }
}

export function pillarOf(indicator: IndicatorCode): PillarCode {
  return indicator.split('-')[0] as PillarCode
}
