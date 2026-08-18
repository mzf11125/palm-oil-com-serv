/**
 * Community typology T1-T7 (design doc Table 5).
 *
 * The typology exists so the assessment portfolio captures different
 * *contribution pathways*, not just the highest-scoring villages:
 *
 *   "Jangan mengambil lima desa dengan POCI tertinggi tanpa memperhatikan
 *    tipologi."                              -- Design doc, section 6.1
 *
 * Everything here is a SUGGESTION. The analyst confirms, and the confirmed
 * value is what persists. A suggestion drawn from five screening numbers
 * cannot see cooperative structure or worker origin, which is precisely what
 * distinguishes T1 from T2 from T4.
 */

import type { PociComponent, PociInput, Typology } from './types'

export interface TypologyDefinition {
  code: Typology
  /** Short label, English then Indonesian. */
  label: string
  /** Design doc Table 5 "Ciri" — distinguishing characteristics. */
  characteristics: string
  /** Most relevant ABCD assets for this pathway. */
  relevantAssets: string
}

export const TYPOLOGY_DEFINITIONS: Record<Typology, TypologyDefinition> = {
  T1: {
    code: 'T1',
    label: 'Direct Estate-Linked',
    characteristics: 'Many workers/households linked to the estate or mill; high proximity and access.',
    relevantAssets: 'Human + Economic Assets',
  },
  T2: {
    code: 'T2',
    label: 'Smallholder/Cooperative-Linked',
    characteristics: 'Supplier, plasma or cooperative pathway dominant.',
    relevantAssets: 'Associational + Economic Assets',
  },
  T3: {
    code: 'T3',
    label: 'Infrastructure Spillover',
    characteristics: 'Main benefit through roads, bridges, transport, digital or service access.',
    relevantAssets: 'Physical + Institutional Assets',
  },
  T4: {
    code: 'T4',
    label: 'Supply-Chain Community',
    characteristics: 'More distant but strong as FFB supplier, contractor, transport or procurement.',
    relevantAssets: 'Economic + Associational Assets',
  },
  T5: {
    code: 'T5',
    label: 'Catalytic Service/Market Centre',
    characteristics: 'Workshops, market, food services, banking, accommodation, public services growing.',
    relevantAssets: 'Economic + Institutional Assets',
  },
  T6: {
    code: 'T6',
    label: 'Mixed Linkage',
    characteristics: 'Experiences more than one pathway at high intensity.',
    relevantAssets: 'Cross-asset mobilization',
  },
  T7: {
    code: 'T7',
    label: 'Low-Exposure Comparator',
    characteristics: 'Reasonably similar baseline but weak palm-oil linkage.',
    relevantAssets: 'Contextual comparison',
  },
}

export interface TypologySuggestion {
  code: Typology | null
  /** Why this was suggested, so the analyst can judge rather than accept. */
  rationale: string
  /** False when too few components are evidenced to suggest anything. */
  confident: boolean
}

const HIGH = 70
const MODERATE = 40

/**
 * Suggests a typology from the POCI component profile.
 *
 * Ordering matters: the more specific pathways are tested before the general
 * ones, and the comparator test comes first because a community with weak
 * linkage everywhere should never be labelled by whichever component happens
 * to be least weak.
 */
export function suggestTypology(input: PociInput, poci: number | null): TypologySuggestion {
  const present = (k: PociComponent): number | null => input[k]
  const at = (k: PociComponent, threshold: number): boolean => {
    const v = present(k)
    return v !== null && v >= threshold
  }
  const below = (k: PociComponent, threshold: number): boolean => {
    const v = present(k)
    return v !== null && v < threshold
  }
  // Inclusive: on the proximity rubric, P=40 means 10-20 km, which the design
  // doc treats as the distant case (Desa D, "secara geometris lebih jauh").
  const atMost = (k: PociComponent, threshold: number): boolean => {
    const v = present(k)
    return v !== null && v <= threshold
  }

  const evidenced = (Object.keys(input) as PociComponent[]).filter((k) => input[k] !== null)
  if (evidenced.length < 2) {
    return {
      code: null,
      rationale: 'Too few components evidenced to suggest a typology.',
      confident: false,
    }
  }

  // T7 first: low exposure overall is a classification in its own right.
  if (poci !== null && poci < 30) {
    return {
      code: 'T7',
      rationale: `POCI ${poci} is below the low-exposure threshold of 30.`,
      confident: true,
    }
  }

  const strong = evidenced.filter((k) => at(k, HIGH))

  // T6: several pathways at once, none clearly dominant.
  if (strong.length >= 3) {
    return {
      code: 'T6',
      rationale: `${strong.join(', ')} all score ${HIGH} or above — multiple simultaneous pathways.`,
      confident: true,
    }
  }

  // T4: economically strong but geographically distant. The design doc's Desa D
  // case — "tidak boleh dieliminasi oleh fixed buffer sempit".
  if (at('E', HIGH) && atMost('P', MODERATE)) {
    return {
      code: 'T4',
      rationale: 'Strong economic linkage despite low proximity — supply-chain pathway.',
      confident: true,
    }
  }

  // T2: institutional linkage alongside economic linkage suggests cooperative
  // or plasma structure rather than direct employment.
  if (at('L', HIGH) && at('E', MODERATE)) {
    return {
      code: 'T2',
      rationale: 'High institutional linkage with economic linkage — cooperative/plasma pathway.',
      confident: true,
    }
  }

  // T1: close, well connected and economically linked.
  if (at('P', HIGH) && at('N', HIGH) && at('E', MODERATE)) {
    return {
      code: 'T1',
      rationale: 'High proximity, connectivity and economic linkage — direct estate pathway.',
      confident: true,
    }
  }

  // T5: facility-rich and reachable but not primarily an employment or
  // supplier community — the service-centre profile.
  if (at('F', HIGH) && at('N', MODERATE) && atMost('P', MODERATE)) {
    return {
      code: 'T5',
      rationale: 'Strong facility linkage and access at distance — catalytic service centre.',
      confident: true,
    }
  }

  // T3: benefit arrives through infrastructure rather than economic ties.
  if (at('F', MODERATE) && below('E', MODERATE)) {
    return {
      code: 'T3',
      rationale: 'Facility/infrastructure linkage exceeds economic linkage — spillover pathway.',
      confident: true,
    }
  }

  if (at('N', HIGH) || at('F', HIGH)) {
    return {
      code: 'T3',
      rationale: 'Connectivity/facility linkage is the strongest evidenced pathway.',
      confident: false,
    }
  }

  return {
    code: null,
    rationale: 'No distinctive pathway in the evidenced components — analyst judgement required.',
    confident: false,
  }
}

/**
 * Typologies that represent exposure to a contribution pathway. T7 is the
 * comparator and is deliberately excluded — a portfolio of comparators is not
 * an assessment.
 */
export const EXPOSED_TYPOLOGIES: Typology[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
