/**
 * Framework reference content: contribution categories, evidence tiers, zones,
 * decision rules and required outputs.
 *
 * Transcribed from the two methodological design documents. Kept as data so
 * the UI renders the method rather than restating it in prose scattered
 * through components.
 */

import type { ContributionCategory, EvidenceTier } from '@/domain/types'

export interface Bilingual {
  en: string
  id: string
}

/**
 * Palm-oil contribution categories (scorecard doc Table 4).
 *
 * Deliberately a separate layer from the ABCD score:
 *
 *   "Palm-oil contribution is not embedded in the ABCD asset-strength score.
 *    A community may possess a strong cooperative that is primarily
 *    community-created, or a company may build a new facility that remains
 *    weakly mobilised by residents."          -- Proposal, section E.4.3
 */
export const CONTRIBUTION_DEFINITIONS: Record<
  ContributionCategory,
  { code: ContributionCategory; label: Bilingual; definition: Bilingual }
> = {
  direct: {
    code: 'direct',
    label: { en: 'Direct', id: 'Langsung' },
    definition: {
      en: 'Asset, job, programme or service financed or delivered directly by industry actors.',
      id: 'Aset, program, job atau service secara langsung dibiayai/diberikan aktor industri.',
    },
  },
  indirect: {
    code: 'indirect',
    label: { en: 'Indirect', id: 'Tidak Langsung' },
    definition: {
      en: 'Economic activity generated through workers, suppliers, smallholders, procurement and local expenditure.',
      id: 'Efek melalui workers, suppliers, smallholders, procurement dan local value-chain expenditure.',
    },
  },
  catalytic: {
    code: 'catalytic',
    label: { en: 'Catalytic', id: 'Katalitik' },
    definition: {
      en: 'Wider change stimulated by connectivity, market demand, population concentration or fiscal capacity.',
      id: 'Perubahan lebih luas yang distimulasi connectivity, market demand, population concentration atau fiscal capacity.',
    },
  },
  enabling: {
    code: 'enabling',
    label: { en: 'Enabling', id: 'Pemungkin' },
    definition: {
      en: 'Training, partnerships, cooperative strengthening or institutional support that enables asset mobilisation.',
      id: 'Training, partnership, cooperative strengthening atau institutional support yang memungkinkan komunitas memobilisasi aset.',
    },
  },
  'co-produced': {
    code: 'co-produced',
    label: { en: 'Co-produced', id: 'Ko-produksi' },
    definition: {
      en: 'Change jointly produced by company, government, community, cooperative or other actors.',
      id: 'Aset/perubahan dihasilkan bersama perusahaan, pemerintah, koperasi, komunitas atau pihak lain.',
    },
  },
  external: {
    code: 'external',
    label: { en: 'External / contextual', id: 'Eksternal / kontekstual' },
    definition: {
      en: 'Change primarily driven by public policy, unrelated investment, demographic change or another sector.',
      id: 'Perubahan terutama berasal dari public policy, unrelated investment, demographic change atau sektor lain.',
    },
  },
}

/** Evidence architecture (scorecard doc Table 5). */
export const EVIDENCE_TIER_DEFINITIONS: Record<
  EvidenceTier,
  { code: EvidenceTier; label: Bilingual; definition: Bilingual; rule: Bilingual }
> = {
  S: {
    code: 'S',
    label: { en: 'Secondary data', id: 'Data sekunder' },
    definition: {
      en: 'Official statistics, administrative/company/cooperative/facility records, programme documents.',
      id: 'Official statistics, administrative/company/cooperative/facility records, programme documents.',
    },
    rule: {
      en: 'Default baseline and documentary pathway evidence.',
      id: 'Default baseline dan documentary pathway evidence.',
    },
  },
  G: {
    code: 'G',
    label: { en: 'GeoAI data', id: 'Data GeoAI' },
    definition: {
      en: 'Satellite imagery, road network, facilities, DEM, hazards, accessibility and spatial proxies.',
      id: 'Satellite imagery, road network, facilities, DEM, hazards, accessibility and spatial proxies.',
    },
    rule: {
      en: 'Default spatial baseline; metadata and uncertainty must be recorded.',
      id: 'Default spatial baseline; metadata/uncertainty wajib dicatat.',
    },
  },
  'P-R': {
    code: 'P-R',
    label: { en: 'Remote primary', id: 'Primer jarak jauh' },
    definition: {
      en: 'Telephone/video interview, online survey, remote FGD, tracer survey, document audit.',
      id: 'Telephone/video interview, online survey, remote FGD, tracer survey, document audit.',
    },
    rule: {
      en: 'Default first validation after desk review.',
      id: 'Default first validation setelah desk review.',
    },
  },
  'P-L': {
    code: 'P-L',
    label: { en: 'Local field primary', id: 'Primer lapangan lokal' },
    definition: {
      en: 'GPS route, geotagged photo/video, mobile GIS checklist by a local focal point.',
      id: 'GPS route, geotagged photo/video, mobile GIS checklist oleh focal point lokal.',
    },
    rule: {
      en: 'For physical, functionality or location gaps, or digital bias.',
      id: 'Untuk physical/functionality/location gap atau bias digital.',
    },
  },
  'P-C': {
    code: 'P-C',
    label: { en: 'Central field primary', id: 'Primer lapangan pusat' },
    definition: {
      en: 'Central-team visit, specialist sampling, in-person FGD/observation.',
      id: 'Central-team visit, specialist sampling, in-person FGD/observation.',
    },
    rule: { en: 'Trigger only; not default.', id: 'Trigger only; bukan default.' },
  },
}

/** Candidate zones in the functional community catchment (design doc Table 1). */
export const ZONES = [
  {
    code: 'Z0',
    name: { en: 'Operational Core', id: 'Inti Operasional' },
    definition: {
      en: 'Concession polygon, mill, worker housing, nursery, collection point, estate roads.',
      id: 'Polygon konsesi, mill, worker housing, nursery, collection point, estate roads.',
    },
    role: {
      en: 'Source of influence; not the primary community score unit.',
      id: 'Sumber pengaruh; bukan unit community score utama.',
    },
  },
  {
    code: 'Z1',
    name: { en: 'Embedded/Adjacent Community', id: 'Komunitas Melekat/Berbatasan' },
    definition: {
      en: 'Villages/settlements inside, enclaved, bordering or very close to the concession.',
      id: 'Desa/permukiman di dalam, enclave, berbatasan, atau sangat dekat dengan konsesi.',
    },
    role: { en: 'Potentially high direct exposure.', id: 'Potensi direct exposure tinggi.' },
  },
  {
    code: 'Z2',
    name: { en: 'Immediate Connected Community', id: 'Komunitas Terhubung Langsung' },
    definition: {
      en: 'Nearby villages with road access, labour, plasma, facilities or direct programmes.',
      id: 'Desa dekat yang memiliki akses jalan, tenaga kerja, plasma, fasilitas, atau program langsung.',
    },
    role: { en: 'Direct/enabling contribution.', id: 'Direct/enabling contribution.' },
  },
  {
    code: 'Z3',
    name: { en: 'Functionally Connected Community', id: 'Komunitas Terhubung Fungsional' },
    definition: {
      en: 'More distant villages that are strong worker origins, FFB suppliers, cooperative members or mill-road users.',
      id: 'Desa lebih jauh tetapi kuat sebagai asal pekerja, pemasok TBS, anggota koperasi, atau pengguna jalan menuju mill.',
    },
    role: { en: 'Supply-chain/economic linkage.', id: 'Supply-chain/economic linkage.' },
  },
  {
    code: 'Z4',
    name: { en: 'Wider Catalytic Area', id: 'Area Katalitik Lebih Luas' },
    definition: {
      en: 'Market centres, subdistricts, workshops, transport services, schools/clinics or service hubs growing alongside palm-oil activity.',
      id: 'Pusat pasar, kecamatan, bengkel, jasa angkut, sekolah/klinik atau service hub yang berkembang bersama aktivitas sawit.',
    },
    role: { en: 'Catalytic/local multiplier.', id: 'Catalytic/local multiplier.' },
  },
  {
    code: 'Z5',
    name: { en: 'Low-Exposure Comparison', id: 'Pembanding Eksposur Rendah' },
    definition: {
      en: 'Communities with comparable initial character but weak linkage to palm-oil operations.',
      id: 'Komunitas dengan karakter awal sebanding tetapi keterhubungan dengan operasi sawit rendah.',
    },
    role: {
      en: 'Contextual comparator; not an experimental control.',
      id: 'Pembanding kontekstual; bukan experimental control.',
    },
  },
]

/** POCI components (design doc Table 3). */
export const POCI_COMPONENT_DEFINITIONS = [
  {
    code: 'P' as const,
    weight: 0.15,
    name: { en: 'Proximity', id: 'Kedekatan' },
    definition: {
      en: 'Closeness of settlements/villages to the concession boundary or operational nodes.',
      id: 'Kedekatan settlement/desa terhadap concession boundary atau operational node.',
    },
    note: {
      en: 'Geometric screening, not evidence of contribution.',
      id: 'Screening geometris, bukan bukti kontribusi.',
    },
    rubric: {
      en: '0-2 km = 100; >2-5 = 80; >5-10 = 60; >10-20 = 40; >20-30 = 20; >30 = 0',
      id: '0-2 km = 100; >2-5 = 80; >5-10 = 60; >10-20 = 40; >20-30 = 20; >30 = 0',
    },
  },
  {
    code: 'N' as const,
    weight: 0.25,
    name: { en: 'Network Connectivity', id: 'Konektivitas Jaringan' },
    definition: {
      en: 'Travel time and road connectivity to mill, estate gate, market, school and clinic.',
      id: 'Travel time dan keterhubungan melalui jalan ke mill, estate gate, market, school, clinic.',
    },
    note: {
      en: 'More important than straight-line distance.',
      id: 'Lebih penting daripada straight-line distance.',
    },
    rubric: {
      en: '<=15 min = 100; 16-30 = 80; 31-45 = 60; 46-60 = 40; 61-90 = 20; >90 = 0',
      id: '<=15 min = 100; 16-30 = 80; 31-45 = 60; 46-60 = 40; 61-90 = 20; >90 = 0',
    },
  },
  {
    code: 'E' as const,
    weight: 0.3,
    name: { en: 'Economic Linkage', id: 'Keterhubungan Ekonomi' },
    definition: {
      en: 'Share of local workers, FFB suppliers, procurement, contractors and local value-chain activity.',
      id: 'Share pekerja lokal, pemasok TBS, procurement, contractor, local value-chain activity.',
    },
    note: {
      en: 'Largest weight because it is the most direct form of functional exposure.',
      id: 'Bobot terbesar karena merupakan functional exposure yang lebih langsung.',
    },
    rubric: {
      en: 'Combined worker origin, supplier origin and procurement/contractor linkage, normalised 0-100. NA is not 0 when records are unavailable.',
      id: 'Gabungan worker origin, supplier origin, procurement/contractor linkage; dinormalisasi 0-100. NA bukan 0 bila records tidak tersedia.',
    },
  },
  {
    code: 'F' as const,
    weight: 0.15,
    name: { en: 'Facility/Infrastructure Linkage', id: 'Keterhubungan Fasilitas/Infrastruktur' },
    definition: {
      en: 'Roads, bridges, schools, clinics, utilities, digital access or facility support connected to palm-oil operations.',
      id: 'Jalan, jembatan, sekolah, klinik, utilities, digital access atau facility support yang terhubung dengan operasi sawit.',
    },
    note: {
      en: 'Chronology, financer, access and functionality must be checked.',
      id: 'Perlu cek chronology, financer, access, dan functionality.',
    },
    rubric: {
      en: '0 = no evidence; 25 = minor; 50 = moderate; 75 = strong; 100 = multiple functional linkages',
      id: '0 = tidak ada bukti; 25 = minor; 50 = moderate; 75 = strong; 100 = multiple functional linkages',
    },
  },
  {
    code: 'L' as const,
    weight: 0.15,
    name: { en: 'Institutional/Social Linkage', id: 'Keterhubungan Institusional/Sosial' },
    definition: {
      en: 'Plasma, cooperatives, farmer groups, training, partnership, CSR/community programme, grievance mechanism.',
      id: 'Plasma, koperasi, farmer groups, training, partnership, CSR/community programme, grievance mechanism.',
    },
    note: {
      en: 'Captures enabling and co-produced pathways.',
      id: 'Menangkap enabling dan co-produced pathways.',
    },
    rubric: {
      en: '0 = none; 25 = sporadic; 50 = active programme/group; 75 = strong partnership; 100 = multi-institutional and sustained',
      id: '0 = tidak ada; 25 = sporadis; 50 = program/kelompok aktif; 75 = partnership kuat; 100 = multi-institutional dan berkelanjutan',
    },
  },
]

/** Practical decision rules (design doc Table 12). */
export const DECISION_RULES = [
  {
    situation: {
      en: 'A village is very close but has no worker/supplier/road/institutional linkage.',
      id: 'Desa sangat dekat tetapi tidak mempunyai worker/supplier/road/institutional linkage.',
    },
    decision: {
      en: 'Do not automatically select it as an exposed site; consider it as a low-exposure or contextual site.',
      id: 'Jangan otomatis dipilih sebagai exposed site; pertimbangkan sebagai low-exposure atau contextual site.',
    },
  },
  {
    situation: {
      en: 'A village is >20-30 km away but is a principal supplier or worker origin.',
      id: 'Desa >20-30 km tetapi menjadi asal supplier/worker utama.',
    },
    decision: {
      en: 'Include it in the functional catchment even though it falls outside the initial envelope.',
      id: 'Masukkan ke functional catchment walaupun di luar initial envelope.',
    },
  },
  {
    situation: {
      en: 'Economic records are unavailable.',
      id: 'Economic records tidak tersedia.',
    },
    decision: {
      en: 'Do not assign E = 0. Mark NA/low confidence and carry out remote validation before exclusion.',
      id: 'Jangan beri E=0. Tandai NA/low confidence dan lakukan remote validation sebelum exclusion.',
    },
  },
  {
    situation: {
      en: 'All candidates have high POCI.',
      id: 'Semua kandidat mempunyai POCI tinggi.',
    },
    decision: {
      en: 'Select on typology diversity and baseline variation, not on ranking alone.',
      id: 'Pilih berdasarkan typology diversity dan baseline variation, bukan ranking saja.',
    },
  },
  {
    situation: {
      en: 'Budget is very limited.',
      id: 'Budget sangat terbatas.',
    },
    decision: {
      en: 'Screen every village with secondary/GeoAI evidence, then run full ABCD on 4 exposed + 1 comparator.',
      id: 'Screen semua desa secara secondary/GeoAI, lalu full ABCD pada 4 exposed + 1 comparator.',
    },
  },
  {
    situation: {
      en: 'Two villages have the same POCI.',
      id: 'Dua desa mempunyai POCI sama.',
    },
    decision: {
      en: 'Prioritise the village that adds a new pathway or an unrepresented beneficiary group.',
      id: 'Prioritaskan desa yang menambah pathway baru atau kelompok beneficiary yang belum terwakili.',
    },
  },
  {
    situation: {
      en: 'Community benefit comes from government-company-community co-production.',
      id: 'Community benefit berasal dari government-company-community co-production.',
    },
    decision: {
      en: 'Still score the ABCD asset; record attribution separately as a co-produced contribution.',
      id: 'Tetap nilai ABCD asset; attribution dicatat terpisah sebagai co-produced contribution.',
    },
  },
]

/** Spatial and analytical outputs required by design doc section 13. */
export const REQUIRED_OUTPUTS = [
  { key: 'map-1', en: 'Concession, mill, gate, estate roads, village boundaries and settlements.', id: 'Konsesi, mill, gate, estate roads, batas desa, dan settlements.' },
  { key: 'map-2', en: '15/30/45/60-minute network catchments from operational nodes.', id: 'Network catchment 15/30/45/60 menit dari operational nodes.' },
  { key: 'map-3', en: 'Worker origin and supplier/FFB catchment.', id: 'Worker origin dan supplier/FFB catchment.' },
  { key: 'map-4', en: 'Schools, clinics, markets, cooperatives, service areas and accessibility gaps.', id: 'Sekolah, klinik, pasar, koperasi, service areas, dan accessibility gaps.' },
  { key: 'map-5', en: 'POCI exposure surface / community classification.', id: 'POCI exposure surface/community classification.' },
  { key: 'map-6', en: 'Selected ABCD assessment portfolio and comparator.', id: 'Portfolio assessment ABCD terpilih dan comparator.' },
  { key: 'table-poci', en: 'POCI component scores, source coverage, confidence and community typology.', id: 'Skor komponen POCI, source coverage, confidence, dan tipologi komunitas.' },
  { key: 'table-abcd', en: 'ABCD provisional/final scores and contribution pathway.', id: 'Skor ABCD provisional/final dan contribution pathway.' },
  { key: 'validation-queue', en: 'Indicators/locations requiring remote, local or sentinel verification.', id: 'Daftar indikator/lokasi yang memerlukan remote, local, atau sentinel verification.' },
  { key: 'evidence-register', en: 'Chronology, actor, financing, beneficiaries, alternative explanations and counter-evidence.', id: 'Chronology, actor, financing, beneficiaries, alternative explanations, dan counter-evidence.' },
]
