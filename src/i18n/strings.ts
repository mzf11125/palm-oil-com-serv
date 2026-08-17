/**
 * UI strings, Indonesian and English.
 *
 * The methodological documents are written in Indonesian and the CPOPC
 * proposal in English, so both audiences are real. Method terminology (POCI,
 * ABCD, the component letters, evidence tiers) is deliberately NOT translated:
 * these are defined terms in the source documents and translating them would
 * break traceability back to the method.
 */

export type Locale = 'id' | 'en'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'en', label: 'English' },
]

export const STRINGS = {
  appName: { id: 'ABCDS-RF', en: 'ABCDS-RF' },
  appSubtitle: {
    id: 'Scorecard ABCD Remote-First & Pemilihan Lokasi POCI',
    en: 'Remote-First ABCD Scorecard & POCI Site Selection',
  },

  nav: {
    concessions: { id: 'Konsesi', en: 'Concessions' },
    screening: { id: 'Screening POCI', en: 'POCI Screening' },
    portfolio: { id: 'Portfolio', en: 'Portfolio' },
    scorecard: { id: 'Scorecard ABCD', en: 'ABCD Scorecard' },
    validation: { id: 'Antrean Validasi', en: 'Validation Queue' },
    evidence: { id: 'Register Bukti', en: 'Evidence Register' },
    dictionary: { id: 'Kamus Indikator', en: 'Indicator Dictionary' },
    exports: { id: 'Ekspor & Laporan', en: 'Exports & Report' },
  },

  common: {
    search: { id: 'Cari', en: 'Search' },
    filter: { id: 'Filter', en: 'Filter' },
    all: { id: 'Semua', en: 'All' },
    none: { id: 'Tidak ada', en: 'None' },
    save: { id: 'Simpan', en: 'Save' },
    cancel: { id: 'Batal', en: 'Cancel' },
    close: { id: 'Tutup', en: 'Close' },
    clear: { id: 'Bersihkan', en: 'Clear' },
    notAssessed: { id: 'Belum dinilai', en: 'Not assessed' },
    na: { id: 'NA', en: 'NA' },
    naFull: { id: 'Bukti tidak tersedia', en: 'Evidence not available' },
    village: { id: 'Desa', en: 'Village' },
    villages: { id: 'Desa', en: 'Villages' },
    population: { id: 'Penduduk', en: 'Population' },
    households: { id: 'Rumah tangga', en: 'Households' },
    distance: { id: 'Jarak', en: 'Distance' },
    coverage: { id: 'Cakupan bukti', en: 'Evidence coverage' },
    confidence: { id: 'Confidence', en: 'Confidence' },
    typology: { id: 'Tipologi', en: 'Typology' },
    exposure: { id: 'Eksposur', en: 'Exposure' },
    score: { id: 'Skor', en: 'Score' },
    notes: { id: 'Catatan', en: 'Notes' },
    evidenceNote: { id: 'Catatan bukti', en: 'Evidence note' },
    sources: { id: 'Sumber', en: 'Sources' },
    tiers: { id: 'Tier bukti', en: 'Evidence tiers' },
    selected: { id: 'Terpilih', en: 'Selected' },
    comparator: { id: 'Pembanding', en: 'Comparator' },
    suggestion: { id: 'Saran', en: 'Suggestion' },
    accept: { id: 'Terima', en: 'Accept' },
    override: { id: 'Ubah manual', en: 'Override' },
    proposed: { id: 'Diusulkan', en: 'Proposed' },
    required: { id: 'Wajib', en: 'Required' },
    optional: { id: 'Opsional', en: 'Optional' },
    loading: { id: 'Memuat…', en: 'Loading…' },
    of: { id: 'dari', en: 'of' },
    showing: { id: 'Menampilkan', en: 'Showing' },
  },

  exposureBands: {
    high: { id: 'Tinggi', en: 'High' },
    moderate: { id: 'Sedang', en: 'Moderate' },
    unbanded: { id: 'Tanpa band', en: 'Unbanded' },
    low: { id: 'Rendah', en: 'Low' },
  },

  concessions: {
    title: { id: 'Penjelajah Konsesi', en: 'Concession Explorer' },
    intro: {
      id: 'Langkah 1: standardisasi polygon konsesi dan pilih satu operational-area case cluster. Konsesi berfungsi sebagai sumber pengaruh, sedangkan desa adalah unit utama assessment ABCD.',
      en: 'Step 1: standardise the concession polygon and select an operational-area case cluster. The concession is the source of influence; the village is the principal unit of ABCD assessment.',
    },
    province: { id: 'Provinsi', en: 'Province' },
    group: { id: 'Grup', en: 'Group' },
    legalStatus: { id: 'Status legal', en: 'Legal status' },
    commodity: { id: 'Komoditas', en: 'Commodity' },
    area: { id: 'Luas', en: 'Area' },
    openCase: { id: 'Buka case cluster', en: 'Open case cluster' },
    noCaseCluster: {
      id: 'Belum ada layer desa kandidat untuk konsesi ini. Case cluster dibuat di luar aplikasi melalui workflow GIS, lalu diekstrak dengan `npm run extract`.',
      en: 'No candidate-village layer has been generated for this concession. Case clusters are produced by the upstream GIS workflow and extracted with `npm run extract`.',
    },
    loadGeometry: { id: 'Muat geometri provinsi', en: 'Load province geometry' },
    missingData: {
      id: 'Layer konsesi nasional belum dibuat. Jalankan `npm run extract` untuk membangunnya dari peta sumber.',
      en: 'The national concession layer has not been generated. Run `npm run extract` to build it from the source maps.',
    },
  },

  screening: {
    title: { id: 'Screening POCI', en: 'POCI Screening' },
    intro: {
      id: 'POCI adalah instrumen screening untuk mengukur seberapa kuat sebuah komunitas terhubung dengan operasi sawit. POCI tidak mengukur keberhasilan community development dan tidak menggantikan ABCD Scorecard.',
      en: 'POCI is a screening instrument for how strongly a community is functionally linked to palm-oil operations. It does not measure community-development success and does not replace the ABCD Scorecard.',
    },
    missingDataRule: {
      id: 'Data yang tidak tersedia tidak boleh diubah menjadi skor 0. POCI provisional dihitung dari komponen yang tersedia, dengan bobot dinormalisasi ulang dan cakupan bukti ditampilkan.',
      en: 'Unavailable data is never converted to a score of 0. Provisional POCI is computed from the available components with weights renormalised, and evidence coverage is shown alongside.',
    },
    economicMissing: {
      id: 'Economic linkage (E) belum ada bukti. E memiliki bobot terbesar (0,30); komunitas tidak boleh dieliminasi hanya karena records belum tersedia.',
      en: 'Economic linkage (E) is not evidenced. E carries the largest weight (0.30); a community must not be eliminated merely because records are unavailable.',
    },
    componentEntry: { id: 'Input komponen', en: 'Component entry' },
    rubric: { id: 'Rubrik', en: 'Rubric' },
    noteRequired: {
      id: 'Catatan bukti wajib diisi saat memberi skor.',
      en: 'An evidence note is required when recording a score.',
    },
    provisional: { id: 'POCI provisional', en: 'Provisional POCI' },
  },

  portfolio: {
    title: { id: 'Pemilihan Portfolio Assessment', en: 'Assessment Portfolio Selection' },
    intro: {
      id: 'Jangan mengambil desa dengan POCI tertinggi tanpa memperhatikan tipologi. Pilih kombinasi desa yang mewakili pathway kontribusi berbeda serta satu atau dua pembanding exposure rendah.',
      en: 'Do not take the highest-POCI villages without regard to typology. Select a combination representing different contribution pathways, plus one or two low-exposure comparators.',
    },
    exposedCount: { id: 'Komunitas exposed', en: 'Exposed communities' },
    comparatorCount: { id: 'Pembanding', en: 'Comparators' },
    pathways: { id: 'Pathway berbeda', en: 'Distinct pathways' },
    comparatorCriteria: { id: 'Kriteria pembanding', en: 'Comparator criteria' },
    undervisible: {
      id: 'Mewakili kelompok yang kurang terlihat oleh data spasial',
      en: 'Represents a group under-visible to spatial data',
    },
    valid: { id: 'Portfolio memenuhi aturan desain', en: 'Portfolio satisfies the design rules' },
  },

  scorecard: {
    title: { id: 'Scorecard ABCD', en: 'ABCD Scorecard' },
    intro: {
      id: 'Setiap indikator dinilai pada lima dimensi (0-4). Skor 100 tidak boleh dibaca sebagai bukti kontribusi penuh industri sawit; skor hanya menunjukkan profil kekuatan aset berdasarkan bukti yang tersedia.',
      en: 'Each indicator is rated across five dimensions (0-4). A score of 100 must not be read as evidence of full palm-oil contribution; it shows only the asset-strength profile supported by available evidence.',
    },
    contributionSeparate: {
      id: 'Kontribusi sawit dinilai sebagai layer terpisah, tidak dimasukkan ke dalam skor kekuatan aset.',
      en: 'Palm-oil contribution is assessed as a separate layer and is not folded into the asset-strength score.',
    },
    interpretiveLimit: { id: 'Batas interpretasi', en: 'Interpretive limit' },
    minimumEvidence: { id: 'Paket bukti minimum', en: 'Minimum evidence package' },
    contribution: { id: 'Kategori kontribusi', en: 'Contribution category' },
    beneficiaries: { id: 'Penerima manfaat', en: 'Beneficiaries' },
    evidenceGaps: { id: 'Gap bukti', en: 'Evidence gaps' },
    advocacyCritical: { id: 'Kritis untuk advocacy', en: 'Advocacy-critical' },
    contradiction: { id: 'Ada kontradiksi sumber', en: 'Source contradiction' },
    pillarProfile: { id: 'Profil pilar', en: 'Pillar profile' },
    composite: { id: 'Skor komposit', en: 'Composite score' },
    compositeCaveat: {
      id: 'Komposit dihitung dengan hati-hati. Interpretasi yang dipublikasikan harus memprioritaskan profil pilar, gap, dan confidence daripada satu peringkat tunggal. CPOPC belum memutuskan apakah komposit boleh ditampilkan secara eksternal.',
      en: 'The composite is used cautiously. Published interpretation must prioritise pillar profiles, gaps and confidence over a single rank. CPOPC has not yet decided whether a composite may be displayed externally.',
    },
    showComposite: { id: 'Tampilkan komposit', en: 'Show composite' },
    selectVillage: {
      id: 'Pilih komunitas dari portfolio untuk mulai menilai.',
      en: 'Select a community from the portfolio to begin scoring.',
    },
    noPortfolio: {
      id: 'Belum ada komunitas terpilih. Bangun portfolio terlebih dahulu.',
      en: 'No communities selected yet. Build the portfolio first.',
    },
  },

  validation: {
    title: { id: 'Antrean Validasi', en: 'Validation Queue' },
    intro: {
      id: 'Validasi hanya diarahkan pada bukti yang hilang, kontradiktif, berkepercayaan rendah, sensitif, atau penting untuk klaim kebijakan. Setiap aktivitas P-R/P-L/P-C harus terhubung ke gap bukti tertentu.',
      en: 'Validation is directed only at evidence that is missing, contradictory, low-confidence, sensitive, or critical to a policy claim. Every P-R/P-L/P-C activity must link to a specific evidence gap.',
    },
    trigger: { id: 'Pemicu', en: 'Trigger' },
    tier: { id: 'Tier', en: 'Tier' },
    status: { id: 'Status', en: 'Status' },
    assignee: { id: 'Penanggung jawab', en: 'Assignee' },
    resolution: { id: 'Penyelesaian', en: 'Resolution' },
    empty: {
      id: 'Antrean kosong. Item muncul otomatis saat indikator dinilai dan gap bukti terdeteksi.',
      en: 'Queue is empty. Items appear automatically as indicators are scored and evidence gaps are detected.',
    },
    statuses: {
      open: { id: 'Terbuka', en: 'Open' },
      'in-progress': { id: 'Berjalan', en: 'In progress' },
      resolved: { id: 'Selesai', en: 'Resolved' },
      dismissed: { id: 'Ditutup', en: 'Dismissed' },
    },
  },

  evidence: {
    title: { id: 'Register Bukti', en: 'Evidence Register' },
    intro: {
      id: 'Setiap dataset menerima source, tanggal, skala spasial, lisensi, custodian, quality flag, dan klasifikasi permitted-use.',
      en: 'Every dataset receives a source, date, spatial scale, licence, custodian, quality flag and permitted-use classification.',
    },
    catalog: { id: 'Katalog sumber', en: 'Source catalog' },
    register: { id: 'Register akuisisi', en: 'Acquisition register' },
    addRecord: { id: 'Tambah catatan', en: 'Add record' },
    owner: { id: 'Pemilik', en: 'Owner' },
    period: { id: 'Periode', en: 'Period' },
    geography: { id: 'Geografi', en: 'Geography' },
    accessRestriction: { id: 'Batasan akses', en: 'Access restriction' },
    completeness: { id: 'Kelengkapan', en: 'Completeness' },
    sensitivity: { id: 'Sensitivitas', en: 'Sensitivity' },
    permittedUse: { id: 'Penggunaan yang diizinkan', en: 'Permitted use' },
    restricted: { id: 'Perlu permintaan resmi', en: 'Requires formal request' },
    empty: {
      id: 'Belum ada catatan akuisisi. Tambahkan entri saat data diminta atau diterima.',
      en: 'No acquisition records yet. Add entries as data is requested or received.',
    },
  },

  dictionary: {
    title: { id: 'Kamus Indikator', en: 'Indicator Dictionary' },
    intro: {
      id: 'Lima pilar, lima belas indikator inti, dan rute bukti untuk masing-masing.',
      en: 'Five pillars, fifteen core indicators, and the evidence route for each.',
    },
    rationale: { id: 'Fokus pengukuran', en: 'Measurement focus' },
    minimumVariables: { id: 'Variabel minimum', en: 'Minimum variables' },
    secondarySources: { id: 'Sumber sekunder & administratif', en: 'Secondary & administrative sources' },
    geoAi: { id: 'Sumber GeoAI / spasial', en: 'GeoAI / spatial sources' },
    remoteValidation: { id: 'Validasi remote (P-R)', en: 'Remote validation (P-R)' },
    localVerification: { id: 'Verifikasi geotagged lokal (P-L)', en: 'Local geotagged verification (P-L)' },
    centralField: { id: 'Pemicu lapangan pusat (P-C)', en: 'Central field trigger (P-C)' },
    intensityMatrix: { id: 'Matriks intensitas bukti', en: 'Evidence intensity matrix' },
  },

  exports: {
    title: { id: 'Ekspor & Laporan', en: 'Exports & Report' },
    intro: {
      id: 'Ekspor file proyek untuk menyimpan pekerjaan secara permanen, atau CSV untuk analisis lanjutan.',
      en: 'Export the project file to store work durably, or CSV for onward analysis.',
    },
    exportProject: { id: 'Ekspor file proyek (JSON)', en: 'Export project file (JSON)' },
    importProject: { id: 'Impor file proyek', en: 'Import project file' },
    exportPoci: { id: 'Ekspor skor POCI (CSV)', en: 'Export POCI scores (CSV)' },
    exportAbcd: { id: 'Ekspor skor ABCD (CSV)', en: 'Export ABCD scores (CSV)' },
    exportValidation: { id: 'Ekspor antrean validasi (CSV)', en: 'Export validation queue (CSV)' },
    printReport: { id: 'Laporan cetak', en: 'Printable report' },
    importWarning: {
      id: 'Impor akan mengganti seluruh pekerjaan yang tersimpan di browser ini. Ekspor terlebih dahulu jika perlu.',
      en: 'Importing replaces all work stored in this browser. Export first if needed.',
    },
    storageNote: {
      id: 'Pekerjaan disimpan otomatis di localStorage browser ini. Gunakan ekspor file proyek untuk penyimpanan permanen dan berbagi.',
      en: 'Work is autosaved to this browser’s localStorage. Use the project-file export for durable storage and sharing.',
    },
  },
} as const

type StringNode = { id: string; en: string } | { [key: string]: StringNode }

/** Resolves a bilingual node for the active locale. */
export function t(node: { id: string; en: string }, locale: Locale): string {
  return node[locale]
}

export type Strings = typeof STRINGS
export type { StringNode }
