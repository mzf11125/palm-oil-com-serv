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
  message: { en: string; id: string }
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
      message: {
        en: `${exposed.length} exposed communities selected; the design recommends ${EXPOSED_MIN}-${EXPOSED_MAX} per concession cluster.`,
        id: `${exposed.length} komunitas exposed dipilih; desain menyarankan ${EXPOSED_MIN}-${EXPOSED_MAX} per concession cluster.`,
      },
    })
  } else if (exposed.length > EXPOSED_MAX) {
    findings.push({
      rule: 'exposed-count',
      severity: 'warning',
      message: {
        en: `${exposed.length} exposed communities exceeds the indicative maximum of ${EXPOSED_MAX}; check validation capacity.`,
        id: `${exposed.length} komunitas exposed melebihi maksimum indikatif ${EXPOSED_MAX}; periksa kapasitas validasi.`,
      },
    })
  }

  // --- Comparator ----------------------------------------------------------
  if (comparators.length < COMPARATOR_MIN) {
    findings.push({
      rule: 'comparator-required',
      severity: 'error',
      message: {
        en: 'No low-exposure comparator selected. At least one is required for contextual comparison.',
        id: 'Tidak ada pembanding exposure rendah. Minimal satu diperlukan sebagai pembanding kontekstual.',
      },
    })
  } else if (comparators.length > COMPARATOR_MAX) {
    findings.push({
      rule: 'comparator-count',
      severity: 'warning',
      message: {
        en: `${comparators.length} comparators selected; ${COMPARATOR_MIN}-${COMPARATOR_MAX} is the indicative range.`,
        id: `${comparators.length} pembanding dipilih; ${COMPARATOR_MIN}-${COMPARATOR_MAX} adalah rentang indikatif.`,
      },
    })
  }

  // A comparator that scores as exposed is not a comparator.
  for (const c of comparators) {
    if (c.poci !== null && c.poci >= 40) {
      findings.push({
        rule: 'comparator-exposure',
        severity: 'warning',
        message: {
          en: `${c.villageName} is marked as a comparator but scores POCI ${c.poci}, above the low-exposure range.`,
          id: `${c.villageName} ditandai sebagai pembanding tetapi memiliki POCI ${c.poci}, di atas rentang exposure rendah.`,
        },
      })
    }
  }

  // --- Pathway diversity ---------------------------------------------------
  const untyped = exposed.filter((m) => m.typology === null)
  if (untyped.length > 0) {
    findings.push({
      rule: 'typology-assigned',
      severity: 'error',
      message: {
        en: `${untyped.length} exposed community(ies) have no confirmed typology: ${untyped.map((m) => m.villageName).join(', ')}.`,
        id: `${untyped.length} komunitas exposed belum memiliki tipologi terkonfirmasi: ${untyped.map((m) => m.villageName).join(', ')}.`,
      },
    })
  } else if (distinctTypologies.length < TYPOLOGY_DIVERSITY_MIN) {
    findings.push({
      rule: 'typology-diversity',
      severity: 'warning',
      message: {
        en: `Only ${distinctTypologies.length} distinct pathway(s) represented (${distinctTypologies.join(', ')}). The design asks for contribution pathway diversity, not the highest scores.`,
        id: `Hanya ${distinctTypologies.length} pathway berbeda terwakili (${distinctTypologies.join(', ')}). Desain meminta keragaman jalur kontribusi, bukan skor tertinggi.`,
      },
    })
  }

  // --- Under-visible groups ------------------------------------------------
  if (members.length > 0 && !members.some((m) => m.representsUndervisibleGroup)) {
    findings.push({
      rule: 'undervisible-group',
      severity: 'warning',
      message: {
        en: 'No selected community represents a group likely to be invisible to spatial data (independent smallholders, women/youth groups, or a remote community).',
        id: 'Tidak ada komunitas terpilih yang mewakili kelompok yang berpotensi kurang terlihat oleh data spasial (pekebun swadaya, kelompok perempuan/pemuda, atau komunitas terpencil).',
      },
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
    message: {
      en: `The ${selectedExposed.length} exposed communities are exactly the ${selectedExposed.length} highest POCI scores. The design warns against ranking-led selection: choose for pathway diversity and baseline variation instead.`,
      id: `${selectedExposed.length} komunitas exposed persis sama dengan ${selectedExposed.length} skor POCI tertinggi. Desain memperingatkan terhadap pemilihan berbasis ranking: pilih berdasarkan keragaman pathway dan variasi baseline.`,
    },
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
    en: 'Baseline remoteness',
    id: 'Baseline remoteness',
    check: {
      en: 'Travel time and road access before palm-oil development were broadly similar.',
      id: 'Travel time dan road access sebelum perkembangan sawit relatif serupa.',
    },
  },
  {
    key: 'population',
    en: 'Population / settlement',
    id: 'Populasi / permukiman',
    check: {
      en: 'Population scale and settlement pattern are not too different.',
      id: 'Skala penduduk dan pola permukiman tidak terlalu berbeda.',
    },
  },
  {
    key: 'agroecology',
    en: 'Agroecology',
    id: 'Agroekologi',
    check: {
      en: 'Topography, land cover, hazard and suitability are reasonably comparable.',
      id: 'Topografi, land cover, hazard, dan suitability cukup sebanding.',
    },
  },
  {
    key: 'service-access',
    en: 'Initial service access',
    id: 'Akses layanan awal',
    check: {
      en: 'Initial access to school, clinic, market and electricity/digital was broadly similar.',
      id: 'Akses awal sekolah, klinik, pasar, listrik/digital relatif mirip.',
    },
  },
  {
    key: 'administrative',
    en: 'Administrative context',
    id: 'Konteks administratif',
    check: {
      en: 'Where possible, within a similar district/province policy environment.',
      id: 'Jika memungkinkan berada dalam district/province policy environment yang serupa.',
    },
  },
  {
    key: 'low-linkage',
    en: 'Low palm-oil linkage',
    id: 'Keterhubungan sawit rendah',
    check: {
      en: 'Worker, supplier, procurement, programme and road dependence are low.',
      id: 'Pekerja, supplier, procurement, programme, dan road dependence rendah.',
    },
  },
  {
    key: 'no-contamination',
    en: 'No strong contamination',
    id: 'Tidak ada kontaminasi kuat',
    check: {
      en: 'Not on a corridor clearly receiving major spillover from the same concession.',
      id: 'Tidak berada pada corridor yang jelas menerima spillover utama dari konsesi yang sama.',
    },
  },
] as const

export type ComparatorCriterionKey = (typeof COMPARATOR_CRITERIA)[number]['key']
