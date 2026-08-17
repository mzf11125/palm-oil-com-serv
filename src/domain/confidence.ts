/**
 * Evidence confidence grading (scorecard doc Table 10).
 *
 *   "Confidence is reported separately from score."
 *
 * That separation is the whole point: a score says how strong an asset looks,
 * a grade says how much the score can be trusted. Folding one into the other
 * destroys both. Nothing in this module ever touches a score value.
 */

import type { ConfidenceGrade, EvidenceTier } from './types'

export interface ConfidenceDefinition {
  grade: ConfidenceGrade
  meaning: { en: string; id: string }
  use: { en: string; id: string }
}

export const CONFIDENCE_DEFINITIONS: Record<ConfidenceGrade, ConfidenceDefinition> = {
  A: {
    grade: 'A',
    meaning: { en: 'Strong triangulation', id: 'Triangulasi kuat' },
    use: {
      en: 'Multiple independent and appropriate sources; major contradictions resolved; validation adequate.',
      id: 'Beberapa sumber independen dan sesuai; kontradiksi utama terselesaikan; validasi memadai.',
    },
  },
  B: {
    grade: 'B',
    meaning: { en: 'Credible and broadly consistent', id: 'Kredibel dan konsisten secara umum' },
    use: {
      en: 'More than one credible source with minor limitations; sufficient for most external reporting with caveats.',
      id: 'Lebih dari satu sumber kredibel dengan keterbatasan minor; cukup untuk pelaporan eksternal dengan catatan.',
    },
  },
  C: {
    grade: 'C',
    meaning: { en: 'Moderate evidence', id: 'Bukti moderat' },
    use: {
      en: 'Material limitations, partial validation, or unresolved coverage gaps.',
      id: 'Keterbatasan material, validasi parsial, atau gap cakupan yang belum terselesaikan.',
    },
  },
  D: {
    grade: 'D',
    meaning: {
      en: 'Preliminary / single-source / contradictory',
      id: 'Preliminer / sumber tunggal / kontradiktif',
    },
    use: {
      en: 'Insufficient independent verification; not suitable for headline external claim.',
      id: 'Verifikasi independen tidak cukup; tidak layak untuk klaim eksternal utama.',
    },
  },
  NA: {
    grade: 'NA',
    meaning: { en: 'Insufficient evidence', id: 'Bukti tidak cukup' },
    use: {
      en: 'Data are missing or cannot support responsible scoring.',
      id: 'Data hilang atau tidak dapat mendukung penilaian yang bertanggung jawab.',
    },
  },
}

/**
 * Grades that may carry an external advocacy claim.
 *
 *   "External advocacy messages will normally rely only on findings with
 *    confidence A or B, with caveats retained."   -- Proposal, section E.4.4
 */
export const ADVOCACY_GRADES: ConfidenceGrade[] = ['A', 'B']

export function isAdvocacyReady(grade: ConfidenceGrade): boolean {
  return ADVOCACY_GRADES.includes(grade)
}

/** Independent tiers: S and G are desk sources, P-* are collected evidence. */
const INDEPENDENT_TIERS: EvidenceTier[] = ['S', 'G', 'P-R', 'P-L', 'P-C']

export interface ConfidenceProposalInput {
  /** Share of component weight backed by evidence, 0-1. */
  coverage: number
  /** Evidence tiers actually used for this claim. */
  tiers: EvidenceTier[]
  /** Set when sources disagree and the conflict is unresolved. */
  hasUnresolvedContradiction?: boolean
  /** Set when the only evidence comes from a party with an interest. */
  singlePartySource?: boolean
}

export interface ConfidenceProposal {
  grade: ConfidenceGrade
  rationale: string
}

/**
 * Proposes a confidence grade. The analyst may override, and the store records
 * that an override happened — a proposed grade and an accepted grade are not
 * the same claim, and a reviewer at Gate 3 needs to tell them apart.
 *
 * This is deliberately conservative. Section 12 stage 5: "Confidence awal
 * konservatif sampai independent validation tersedia."
 */
export function proposeConfidence(input: ConfidenceProposalInput): ConfidenceProposal {
  const { coverage, tiers, hasUnresolvedContradiction, singlePartySource } = input
  const independent = new Set(tiers.filter((t) => INDEPENDENT_TIERS.includes(t)))

  if (coverage === 0 || independent.size === 0) {
    return { grade: 'NA', rationale: 'No evidence recorded for this claim.' }
  }

  if (hasUnresolvedContradiction) {
    return {
      grade: 'D',
      rationale: 'Sources contradict each other and the conflict is unresolved.',
    }
  }

  if (independent.size === 1 || singlePartySource) {
    return {
      grade: 'D',
      rationale: singlePartySource
        ? 'Evidence comes from a single interested party without independent corroboration.'
        : `Single evidence tier (${[...independent][0]}) without independent corroboration.`,
    }
  }

  // Human validation is what lifts a claim beyond desk evidence. The scorecard
  // doc is explicit that agency, inclusion and functionality cannot be
  // inferred from records and imagery alone.
  const hasHumanValidation = tiers.some((t) => t === 'P-R' || t === 'P-L' || t === 'P-C')

  if (coverage >= 0.8 && independent.size >= 3 && hasHumanValidation) {
    return {
      grade: 'A',
      rationale: `${independent.size} independent tiers including human validation, ${Math.round(coverage * 100)}% coverage.`,
    }
  }

  if (coverage >= 0.6 && hasHumanValidation) {
    return {
      grade: 'B',
      rationale: `Multiple sources with human validation, ${Math.round(coverage * 100)}% coverage.`,
    }
  }

  if (coverage >= 0.6) {
    return {
      grade: 'C',
      rationale: `Multiple desk sources but no human validation, ${Math.round(coverage * 100)}% coverage.`,
    }
  }

  return {
    grade: 'C',
    rationale: `Partial coverage (${Math.round(coverage * 100)}%) leaves material gaps.`,
  }
}
