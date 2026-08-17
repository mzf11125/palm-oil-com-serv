/**
 * ABCDS-RF indicator dictionary — five pillars, fifteen core indicators.
 *
 * Transcribed from "ABCD Scorecard Remote-First Edition (ABCDS-RF)" section 4
 * and the per-indicator specification tables, cross-checked against the CPOPC
 * proposal Appendix 1.
 *
 * The `interpretiveLimit` on each indicator is the most important field here:
 * it is the document's own warning about what the score does NOT establish,
 * and the UI shows it on every scoring card so it cannot be forgotten at the
 * point where it matters.
 */

import type { EvidenceTier, IndicatorCode, PillarCode } from '@/domain/types'

export interface Bilingual {
  en: string
  id: string
}

export interface PillarDefinition {
  code: PillarCode
  order: number
  name: Bilingual
  /** Provisional weight; equal across pillars pending sensitivity analysis. */
  weight: number
  summary: Bilingual
}

export const PILLAR_DEFINITIONS: Record<PillarCode, PillarDefinition> = {
  HUM: {
    code: 'HUM',
    order: 1,
    name: { en: 'Human & Individual Assets', id: 'Aset Manusia dan Individu' },
    weight: 0.2,
    summary: {
      en: 'Knowledge, skills, employment readiness, adaptive capability, and the capacity of women and youth that the community can mobilise.',
      id: 'Pengetahuan, keterampilan, kesiapan kerja, kemampuan adaptif, serta kapasitas perempuan dan pemuda yang dapat dimobilisasi oleh komunitas.',
    },
  },
  ASS: {
    code: 'ASS',
    order: 2,
    name: { en: 'Associational & Social Assets', id: 'Aset Asosiasional dan Sosial' },
    weight: 0.2,
    summary: {
      en: 'Resident-led organisations, social networks, collective action, participation, voice, and community control over assets and development decisions.',
      id: 'Organisasi yang dipimpin warga, jaringan sosial, tindakan kolektif, partisipasi, voice, dan kontrol komunitas atas aset serta keputusan pembangunan.',
    },
  },
  INS: {
    code: 'INS',
    order: 3,
    name: { en: 'Institutional & Service Assets', id: 'Aset Institusional dan Layanan' },
    weight: 0.2,
    summary: {
      en: 'Education, health, basic-service, local governance and partnership institutions that are available, accessible, functioning and supporting community capacity.',
      id: 'Institusi pendidikan, kesehatan, layanan dasar, tata kelola lokal, dan kemitraan yang tersedia, dapat diakses, berfungsi, serta mendukung kapasitas masyarakat.',
    },
  },
  PSN: {
    code: 'PSN',
    order: 4,
    name: { en: 'Physical, Spatial & Natural Assets', id: 'Aset Fisik, Spasial, dan Alam' },
    weight: 0.2,
    summary: {
      en: 'Physical assets, connectivity, spatial access, digital connectivity and natural/environmental conditions that enable or constrain asset mobilisation.',
      id: 'Aset fisik, konektivitas, akses spasial, digital connectivity, serta natural/environmental conditions yang memungkinkan atau membatasi mobilisasi aset komunitas.',
    },
  },
  ECO: {
    code: 'ECO',
    order: 5,
    name: { en: 'Economic & Productive Assets', id: 'Aset Ekonomi dan Produktif' },
    weight: 0.2,
    summary: {
      en: 'Productive assets, employment, income-generation flows, smallholder market access, local enterprise, procurement, diversification and economic resilience.',
      id: 'Aset produktif, pekerjaan, income-generation flows, smallholder market access, local enterprise, procurement, diversifikasi dan resiliensi ekonomi komunitas.',
    },
  },
}

export interface IndicatorDefinition {
  code: IndicatorCode
  pillar: PillarCode
  name: Bilingual
  /** The primary ABCD question the indicator answers. */
  question: Bilingual
  rationale: Bilingual
  minimumVariables: Bilingual
  secondarySources: string[]
  geoAiSources: Bilingual
  remoteValidation: Bilingual
  localVerification: Bilingual
  centralFieldTrigger: Bilingual
  minimumEvidencePackage: Bilingual
  /** What a high score does NOT establish. Shown on every scoring card. */
  interpretiveLimit: Bilingual
  /** Default evidence intensity per tier (scorecard doc Table 7). */
  intensity: Record<EvidenceTier, 'M' | 'R' | 'S' | 'C' | 'N'>
}

export const INDICATORS: IndicatorDefinition[] = [
  // --- HUM ------------------------------------------------------------------
  {
    code: 'HUM-1',
    pillar: 'HUM',
    name: {
      en: 'Skills, Knowledge and Technical Capacity',
      id: 'Keterampilan, Pengetahuan, dan Kapasitas Teknis',
    },
    question: {
      en: 'What capacity do residents have, and are those skills actually applied?',
      id: 'Kapasitas apa yang dimiliki warga dan apakah keterampilan tersebut benar-benar diterapkan?',
    },
    rationale: {
      en: 'Availability and application of agricultural, technical, digital, entrepreneurial, occupational-safety and problem-solving skills relevant to local livelihoods.',
      id: 'Ketersediaan dan penerapan keterampilan pertanian, teknis, digital, kewirausahaan, keselamatan kerja, dan kemampuan pemecahan masalah yang relevan bagi mata pencaharian lokal.',
    },
    minimumVariables: {
      en: 'Training participants/recipients; skill types; completion/certification; work experience; post-training skill use; farmer-extension exposure; digital capability; knowledge-transfer activity.',
      id: 'Peserta/penerima pelatihan; jenis keterampilan; completion/certification; pengalaman kerja; penggunaan keterampilan setelah pelatihan; farmer-extension exposure; digital capability; knowledge-transfer activity.',
    },
    secondarySources: ['IDN-S01', 'IDN-S05', 'MYS-S04', 'ADM-04', 'ADM-05', 'ADM-07'],
    geoAiSources: {
      en: 'IDN-S08 for mapping participant/facility distribution and spatial gaps. GeoAI is not used as direct evidence of competence.',
      id: 'IDN-S08 untuk pemetaan distribusi peserta/fasilitas dan gap spasial; GeoAI tidak digunakan sebagai bukti langsung kompetensi.',
    },
    remoteValidation: {
      en: 'Short tracer survey of participants and non-completers; interviews with trainers/employers/farmer groups to verify skill use.',
      id: 'Tracer survey singkat kepada peserta dan non-completer; wawancara trainer/employer/farmer group untuk memverifikasi penggunaan keterampilan.',
    },
    localVerification: {
      en: 'Only where training facilities or practical-skill outcomes cannot be verified remotely.',
      id: 'Hanya bila fasilitas pelatihan atau practical-skill outcome tidak dapat diverifikasi secara remote.',
    },
    centralFieldTrigger: {
      en: 'Not default; triggered if practical-skill demonstration becomes a primary claim and cannot be verified remotely or locally.',
      id: 'Tidak default; dipicu jika practical-skill demonstration menjadi klaim utama dan tidak dapat diverifikasi secara remote/local.',
    },
    minimumEvidencePackage: {
      en: 'Participant/training register + completion evidence + independent remote tracer + demographic disaggregation.',
      id: 'Participant/training register + completion evidence + independent remote tracer + demographic disaggregation.',
    },
    interpretiveLimit: {
      en: 'Training attendance is not an outcome. Distinguish enrolment, completion, application, and actual capability change.',
      id: 'Kehadiran pelatihan bukan outcome. Bedakan enrolment, completion, application, dan perubahan kemampuan.',
    },
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'HUM-2',
    pillar: 'HUM',
    name: {
      en: 'Employment Readiness and Adaptive Capability',
      id: 'Kesiapan Kerja dan Kapabilitas Adaptif',
    },
    question: {
      en: 'Are residents able to enter, stay in, and adapt within work or enterprise?',
      id: 'Apakah warga memiliki kemampuan untuk masuk, bertahan dan beradaptasi dalam pekerjaan/usaha?',
    },
    rationale: {
      en: 'Ability of individuals to enter, retain, move between or advance in work/enterprise, including experience, certification, progression and adaptation to technology/market change.',
      id: 'Kemampuan individu memasuki, mempertahankan, berpindah, atau meningkatkan pekerjaan/usaha; termasuk pengalaman, sertifikasi, progression, dan kemampuan beradaptasi terhadap perubahan teknologi/pasar.',
    },
    minimumVariables: {
      en: 'Employment status; job type/skill level; tenure; training-to-job transition; progression; certification; occupational mobility; re-skilling; self-employment readiness; barriers to entry.',
      id: 'Employment status; job type/skill level; tenure; training-to-job transition; progression; certification; occupational mobility; re-skilling; self-employment readiness; barriers to entry.',
    },
    secondarySources: ['IDN-S02', 'IDN-S01', 'MYS-S01', 'ADM-01', 'ADM-05', 'ADM-07'],
    geoAiSources: {
      en: 'GEO-G05/IDN-S08 only for context on access to work/training centres; not a measure of individual readiness.',
      id: 'GEO-G05/IDN-S08 hanya untuk konteks akses ke pusat kerja/pelatihan; bukan pengukur kesiapan individual.',
    },
    remoteValidation: {
      en: 'Worker/contractor interviews stratified by local/non-local, sex, age and employment type; verify continuity and progression.',
      id: 'Worker/contractor interviews yang distratifikasi local/non-local, sex, age, employment type; verifikasi continuity dan progression.',
    },
    localVerification: {
      en: 'Conditional if residence coding, employer presence or recruitment routes are unclear.',
      id: 'Conditional jika residence code, employer presence, atau jalur rekrutmen tidak jelas.',
    },
    centralFieldTrigger: {
      en: 'Not default; only where working conditions or record authenticity become a primary and contested claim.',
      id: 'Tidak default; hanya bila kondisi kerja atau authenticity records menjadi klaim utama dan masih diperdebatkan.',
    },
    minimumEvidencePackage: {
      en: 'Pseudonymised HR/contractor extract + training/job-transition records + independent remote worker validation.',
      id: 'Pseudonymised HR/contractor extract + training/job-transition records + independent remote worker validation.',
    },
    interpretiveLimit: {
      en: 'Payroll shows an income-generation flow, not an automatic improvement in household welfare.',
      id: 'Payroll menunjukkan income-generation flow, bukan otomatis peningkatan kesejahteraan rumah tangga.',
    },
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'HUM-3',
    pillar: 'HUM',
    name: {
      en: 'Women and Youth Capability and Leadership',
      id: 'Kapabilitas dan Kepemimpinan Perempuan dan Pemuda',
    },
    question: {
      en: 'Do women and youth gain meaningful capability, leadership and control?',
      id: 'Apakah perempuan dan pemuda memperoleh capability, leadership dan control yang bermakna?',
    },
    rationale: {
      en: 'Access of women and youth to skills, work, technology, finance, enterprise and leadership, and their ability to influence decisions and control benefits.',
      id: 'Akses perempuan dan pemuda terhadap keterampilan, pekerjaan, teknologi, finance, enterprise, leadership, serta kemampuan memengaruhi keputusan dan mengendalikan manfaat.',
    },
    minimumVariables: {
      en: 'Sex/age disaggregation; employment/enterprise role; training and finance receipt; leadership position; technology role; decision participation; control over income/benefit; barriers and safety.',
      id: 'Sex/age disaggregation; employment/enterprise role; training and finance receipt; leadership position; technology role; decision participation; control over income/benefit; barriers and safety.',
    },
    secondarySources: ['IDN-S02', 'IDN-S03', 'MYS-S01', 'MYS-S02', 'ADM-01', 'ADM-02', 'ADM-04', 'ADM-05', 'ADM-08'],
    geoAiSources: {
      en: 'IDN-S08 only for spatial distribution/access; never used to infer empowerment.',
      id: 'IDN-S08 hanya untuk distribusi spasial/akses; tidak digunakan untuk menyimpulkan empowerment.',
    },
    remoteValidation: {
      en: 'Separate women/youth interviews or remote FGD through independent channels; test leadership, control, opportunity and exclusion.',
      id: 'Separate women/youth interviews atau remote FGD dengan kanal independen; uji leadership, control, opportunity, dan exclusion.',
    },
    localVerification: {
      en: 'Use an independent local facilitator where digital exclusion, safety or power imbalance would bias remote participation.',
      id: 'Gunakan fasilitator lokal independen jika digital exclusion, safety, atau power imbalance membuat remote participation bias.',
    },
    centralFieldTrigger: {
      en: 'Conditional for sensitive working conditions, control over income, discrimination, or contested leadership claims.',
      id: 'Conditional untuk sensitive working conditions, control over income, discrimination, atau contested leadership claims.',
    },
    minimumEvidencePackage: {
      en: 'Disaggregated administrative data + independent women/youth validation + evidence of leadership/decision roles.',
      id: 'Disaggregated administrative data + independent women/youth validation + evidence of leadership/decision roles.',
    },
    interpretiveLimit: {
      en: 'A participation count is not empowerment; measure voice, leadership and control over benefit.',
      id: 'Participation count tidak sama dengan empowerment; ukur voice, leadership dan control over benefit.',
    },
    intensity: { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  },

  // --- ASS ------------------------------------------------------------------
  {
    code: 'ASS-1',
    pillar: 'ASS',
    name: { en: 'Community Associations and Cooperatives', id: 'Asosiasi Komunitas dan Koperasi' },
    question: {
      en: 'Are resident organisations active and able to manage/connect community assets?',
      id: 'Apakah organisasi warga aktif dan mampu mengelola/menghubungkan aset komunitas?',
    },
    rationale: {
      en: 'Existence, activity, capacity and reach of cooperatives, farmer groups, women/youth groups, business groups and other resident-driven local organisations.',
      id: 'Keberadaan, keaktifan, kapasitas dan daya jangkau koperasi, kelompok tani, kelompok perempuan/pemuda, kelompok usaha, dan organisasi lokal yang digerakkan warga.',
    },
    minimumVariables: {
      en: 'Number/type of active groups; membership; meeting frequency; leadership; financial/asset base; services; collective marketing; training; partner links; activity continuity.',
      id: 'Number/type of active groups; membership; meeting frequency; leadership; financial/asset base; services; collective marketing; training; partner links; activity continuity.',
    },
    secondarySources: ['IDN-S10', 'MYS-S06', 'IDN-S01', 'ADM-04', 'ADM-06', 'ABCD-ADM-09'],
    geoAiSources: {
      en: 'IDN-S08, GEO-G05 for secretariat locations, member coverage/catchment, and access to market/service nodes.',
      id: 'IDN-S08, GEO-G05 untuk lokasi sekretariat, coverage/catchment anggota, dan akses ke market/service nodes.',
    },
    remoteValidation: {
      en: 'Document audit + interviews with leaders and members/non-members to test activity, reach, service use and community ownership.',
      id: 'Document audit + interviews dengan leaders dan members/non-members untuk menguji activity, reach, service use, dan community ownership.',
    },
    localVerification: {
      en: 'Conditional where an organisation is only administratively recorded but active status/asset base cannot be confirmed.',
      id: 'Conditional bila organisasi hanya tercatat administratif tetapi status aktif/asset base tidak dapat dikonfirmasi.',
    },
    centralFieldTrigger: {
      en: 'Not default; triggered only by a major governance dispute material to the findings.',
      id: 'Tidak default; dipicu hanya pada sengketa governance besar yang material terhadap temuan.',
    },
    minimumEvidencePackage: {
      en: 'Registry/document evidence + membership/service records + independent member/non-member confirmation.',
      id: 'Registry/document evidence + membership/service records + independent member/non-member confirmation.',
    },
    interpretiveLimit: {
      en: 'A count of organisations does not represent social capital if groups are inactive or not owned/directed by residents.',
      id: 'Jumlah organisasi tidak merepresentasikan social capital jika kelompok tidak aktif atau tidak dimiliki/diarahkan warga.',
    },
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'ASS-2',
    pillar: 'ASS',
    name: {
      en: 'Social Networks, Mutual Support and Collective Action',
      id: 'Jaringan Sosial, Dukungan Timbal Balik, dan Tindakan Kolektif',
    },
    question: {
      en: 'Do local networks produce mutual support and collective action?',
      id: 'Apakah jejaring lokal menghasilkan mutual support dan collective action?',
    },
    rationale: {
      en: 'Capacity of the community to connect individuals/groups, share information and resources, respond to shared problems, and act collectively.',
      id: 'Kemampuan komunitas menghubungkan individu/kelompok, berbagi informasi/sumber daya, merespons masalah bersama, dan melakukan aksi kolektif.',
    },
    minimumVariables: {
      en: 'Inter-group links; joint activities; mutual-aid mechanisms; information exchange; shared equipment/assets; collective bargaining; crisis response; cross-village links; network diversity.',
      id: 'Inter-group links; joint activities; mutual-aid mechanisms; information exchange; shared equipment/assets; collective bargaining; crisis response; cross-village links; network diversity.',
    },
    secondarySources: ['IDN-S01', 'ADM-04', 'ADM-06', 'ADM-08', 'ABCD-ADM-09'],
    geoAiSources: {
      en: 'GEO-G05/IDN-S08 as supporting evidence for proximity/network reach; cannot measure trust directly.',
      id: 'GEO-G05/IDN-S08 sebagai supporting evidence untuk proximity/network reach; tidak dapat mengukur trust secara langsung.',
    },
    remoteValidation: {
      en: 'Remote social-network elicitation, KII and FGD; identify who is connected to whom, forms of resource exchange, and recent collective-action examples.',
      id: 'Remote social-network elicitation, KII dan FGD; identifikasi siapa terhubung dengan siapa, bentuk resource exchange, dan contoh aksi kolektif terkini.',
    },
    localVerification: {
      en: 'Conditional if remote network mapping is unrepresentative or participatory local mapping is needed.',
      id: 'Conditional jika network mapping remote tidak representatif atau membutuhkan participatory mapping lokal.',
    },
    centralFieldTrigger: { en: 'Not default.', id: 'Tidak default.' },
    minimumEvidencePackage: {
      en: 'At least two documentary/administrative traces + independent perspectives from multiple groups + one documented collective-action example.',
      id: 'At least two documentary/administrative traces + independent perspectives from multiple groups + one documented collective-action example.',
    },
    interpretiveLimit: {
      en: 'Trust and reciprocity must not be inferred from proximity or the existence of organisations alone.',
      id: 'Trust dan reciprocity tidak boleh diinferensikan hanya dari proximity atau keberadaan organisasi.',
    },
    intensity: { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'ASS-3',
    pillar: 'ASS',
    name: {
      en: 'Participation, Voice and Community Control',
      id: 'Partisipasi, Voice, dan Kontrol Komunitas',
    },
    question: {
      en: 'Can residents influence decisions and control assets/programmes?',
      id: 'Apakah warga dapat memengaruhi keputusan dan mengontrol aset/program?',
    },
    rationale: {
      en: 'Quality of resident participation in planning, prioritisation, management, grievance and monitoring, and control over assets/programmes affecting the community.',
      id: 'Kualitas partisipasi warga dalam perencanaan, prioritisasi, pengelolaan, grievance, monitoring, serta kontrol atas aset/program yang memengaruhi komunitas.',
    },
    minimumVariables: {
      en: 'Consultation frequency; participant composition; agenda influence; community proposal uptake; grievance response; community management role; asset ownership/control; representation of excluded groups.',
      id: 'Consultation frequency; participant composition; agenda influence; community proposal uptake; grievance response; community management role; asset ownership/control; representation of excluded groups.',
    },
    secondarySources: ['ADM-04', 'ADM-06', 'ADM-08', 'ABCD-ADM-09', 'IDN-S10', 'MYS-S06'],
    geoAiSources: {
      en: 'Not default; IDN-S08/GEO-G05 only to support coverage mapping and identify unreached groups/settlements.',
      id: 'Tidak default; IDN-S08/GEO-G05 hanya mendukung pemetaan coverage dan kelompok/settlement yang tidak terjangkau.',
    },
    remoteValidation: {
      en: 'Independent KII/FGD with community leaders, ordinary members, women/youth and non-beneficiaries; compare against minutes/grievance logs.',
      id: 'Independent KII/FGD dengan community leaders, ordinary members, women/youth dan non-beneficiaries; bandingkan dengan minutes/grievance logs.',
    },
    localVerification: {
      en: 'Conditional where power imbalance or digital exclusion makes remote participation unsafe or unrepresentative.',
      id: 'Conditional jika power imbalance atau digital exclusion membuat remote participation tidak aman/representatif.',
    },
    centralFieldTrigger: {
      en: 'Conditional for unresolved governance conflict, contested grievance, or high-risk accountability claims.',
      id: 'Conditional untuk unresolved governance conflict, contested grievance, atau accountability claim berisiko tinggi.',
    },
    minimumEvidencePackage: {
      en: 'Document audit + at least two independent stakeholder perspectives + evidence of decision influence or control.',
      id: 'Document audit + at least two independent stakeholder perspectives + evidence of decision influence or control.',
    },
    interpretiveLimit: {
      en: 'Attendance is not meaningful participation; distinguish being informed, being consulted, influencing decisions, and community control.',
      id: 'Attendance bukan meaningful participation; bedakan diinformasikan, dikonsultasikan, memengaruhi keputusan, dan community control.',
    },
    intensity: { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  },

  // --- INS ------------------------------------------------------------------
  {
    code: 'INS-1',
    pillar: 'INS',
    name: { en: 'Education and Training Institutions', id: 'Institusi Pendidikan dan Pelatihan' },
    question: {
      en: 'Are education/training institutions available, accessible, functioning and used?',
      id: 'Apakah institusi pendidikan/pelatihan tersedia, accessible, berfungsi dan digunakan?',
    },
    rationale: {
      en: 'Availability, function, accessibility, capacity and support for schools, training centres, extension, scholarships, transport and institutional learning support.',
      id: 'Ketersediaan, fungsi, accessibility, kapasitas dan support terhadap sekolah, training centre, extension, scholarship, transport, dan institutional learning support.',
    },
    minimumVariables: {
      en: 'Facility location/level; enrolment; teachers/trainers; facilities; operational status; training capacity; scholarship/transport beneficiaries; travel time; seasonal accessibility; programme budget/partner.',
      id: 'Facility location/level; enrolment; teachers/trainers; facilities; operational status; training capacity; scholarship/transport beneficiaries; travel time; seasonal accessibility; programme budget/partner.',
    },
    secondarySources: ['IDN-S05', 'IDN-S01', 'MYS-S04', 'ADM-05', 'ADM-06', 'ADM-07'],
    geoAiSources: {
      en: 'IDN-S08, GEO-G05, GEO-G04, GEO-G01 for geocoding, 15/30/60-minute service areas and seasonal access.',
      id: 'IDN-S08, GEO-G05, GEO-G04, GEO-G01 untuk geocoding, 15/30/60-min service areas dan seasonal access.',
    },
    remoteValidation: {
      en: 'School/training administrator + a small user/parent/participant sample to confirm operation, access, usage and support receipt.',
      id: 'School/training administrator + small user/parent/participant sample untuk mengonfirmasi operation, access, usage dan support receipt.',
    },
    localVerification: {
      en: 'Geotagged photo/video where coordinates, functionality or road access are uncertain.',
      id: 'Geotagged photo/video jika koordinat, functionality atau road access tidak pasti.',
    },
    centralFieldTrigger: {
      en: 'Not default; only where a facility becomes a flagship story and remote/local evidence is insufficient.',
      id: 'Tidak default; hanya jika fasilitas menjadi flagship story dan remote/local evidence tidak cukup.',
    },
    minimumEvidencePackage: {
      en: 'Official facility record + service/access model + remote functionality/use confirmation.',
      id: 'Official facility record + service/access model + remote functionality/use confirmation.',
    },
    interpretiveLimit: {
      en: 'A mapped facility does not prove service quality, attendance, or industry contribution.',
      id: 'Mapped facility tidak membuktikan kualitas layanan, attendance, atau kontribusi industri.',
    },
    intensity: { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'INS-2',
    pillar: 'INS',
    name: {
      en: 'Health and Basic-Service Institutions',
      id: 'Institusi Kesehatan dan Layanan Dasar',
    },
    question: {
      en: 'Are health/basic-service institutions accessible, reliable and sustainable?',
      id: 'Apakah institusi kesehatan/basic service accessible, reliable dan sustainable?',
    },
    rationale: {
      en: 'Availability, accessibility, continuity and capacity of health, water, sanitation, electricity, ambulance/outreach and other basic-service institutions.',
      id: 'Ketersediaan, accessibility, continuity dan kapasitas institusi kesehatan, air, sanitasi, listrik, ambulance/outreach dan layanan dasar lain.',
    },
    minimumVariables: {
      en: 'Facility type/staff; service days; utilisation; travel time; seasonal access; water/sanitation/electricity coverage; outages; maintenance/funding responsibility; outreach frequency.',
      id: 'Facility type/staff; service days; utilisation; travel time; seasonal access; water/sanitation/electricity coverage; outages; maintenance/funding responsibility; outreach frequency.',
    },
    secondarySources: ['IDN-S06', 'IDN-S01', 'IDN-S03', 'MYS-S05', 'MYS-S02', 'ADM-05', 'ADM-06', 'ADM-07'],
    geoAiSources: {
      en: 'IDN-S08, GEO-G05, GEO-G04, GEO-G01, IDN-S13 for service areas, seasonal disruption and exposure.',
      id: 'IDN-S08, GEO-G05, GEO-G04, GEO-G01, IDN-S13 untuk service areas, seasonal disruption dan exposure.',
    },
    remoteValidation: {
      en: 'Health worker/operator + short user validation for opening hours, staffing, cost, outages and wet-season access.',
      id: 'Health worker/operator + short user validation untuk opening, staffing, cost, outage dan wet-season access.',
    },
    localVerification: {
      en: 'Geotagged functionality audit where provider and user accounts differ.',
      id: 'Geotagged functionality audit bila provider dan user accounts berbeda.',
    },
    centralFieldTrigger: {
      en: 'Required only for specified technical claims such as laboratory water-quality, pollution or engineering-condition claims.',
      id: 'Hanya untuk technical claims tertentu seperti laboratory water-quality, pollution atau engineering-condition claims.',
    },
    minimumEvidencePackage: {
      en: 'Facility/service record + access analysis + independent functionality confirmation.',
      id: 'Facility/service record + access analysis + independent functionality confirmation.',
    },
    interpretiveLimit: {
      en: 'Presence and modelled travel time do not establish service quality or health outcomes.',
      id: 'Presence dan modelled travel time tidak menetapkan service quality atau health outcome.',
    },
    intensity: { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'C' },
  },
  {
    code: 'INS-3',
    pillar: 'INS',
    name: {
      en: 'Local Governance, Accountability and Partnerships',
      id: 'Tata Kelola Lokal, Akuntabilitas, dan Kemitraan',
    },
    question: {
      en: 'Can governance and partnerships plan, finance and account for assets?',
      id: 'Apakah governance dan partnership mampu merencanakan, membiayai dan mempertanggungjawabkan aset?',
    },
    rationale: {
      en: 'Capacity of village/local government, cooperatives and partners to plan, finance, manage, monitor and account for assets/programmes collaboratively.',
      id: 'Kapasitas pemerintah desa/lokal, koperasi dan mitra untuk merencanakan, membiayai, mengelola, memonitor dan mempertanggungjawabkan aset/program secara kolaboratif.',
    },
    minimumVariables: {
      en: 'Planning regularity; budget allocation; co-financing; maintenance responsibility; partnership agreements; consultation; grievance performance; transparency; leadership composition; programme follow-up.',
      id: 'Planning regularity; budget allocation; co-financing; maintenance responsibility; partnership agreements; consultation; grievance performance; transparency; leadership composition; programme follow-up.',
    },
    secondarySources: ['IDN-S10', 'MYS-S06', 'ADM-04', 'ADM-05', 'ADM-06', 'ADM-08'],
    geoAiSources: {
      en: 'IDN-S08 for jurisdiction, facility/service coverage and spatial equity checks.',
      id: 'IDN-S08 untuk jurisdiction, facility/service coverage dan spatial equity checks.',
    },
    remoteValidation: {
      en: 'Document audit + interviews with government, company and cooperative/community representatives from more than one recruitment channel.',
      id: 'Document audit + interviews dengan government, company, cooperative/community representatives dari lebih satu recruitment channel.',
    },
    localVerification: {
      en: 'Conditional to verify implementation/asset responsibility or a contested accountability issue.',
      id: 'Conditional untuk verifikasi implementation/asset responsibility atau contested accountability issue.',
    },
    centralFieldTrigger: {
      en: 'Conditional for unresolved governance conflict, contested grievance or a flagship partnership claim.',
      id: 'Conditional untuk unresolved governance conflict, contested grievance atau flagship partnership claim.',
    },
    minimumEvidencePackage: {
      en: 'Planning/budget/partnership documents + accountability records + at least two independent stakeholder perspectives.',
      id: 'Planning/budget/partnership documents + accountability records + at least two independent stakeholder perspectives.',
    },
    interpretiveLimit: {
      en: 'A formal agreement does not prove implementation quality or community influence.',
      id: 'Formal agreement tidak membuktikan implementation quality atau community influence.',
    },
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  },

  // --- PSN ------------------------------------------------------------------
  {
    code: 'PSN-1',
    pillar: 'PSN',
    name: {
      en: 'Roads and All-Season Connectivity',
      id: 'Jalan dan Konektivitas Sepanjang Tahun',
    },
    question: {
      en: 'Does the transport network work year-round and genuinely open up connectivity?',
      id: 'Apakah jaringan transport bekerja sepanjang tahun dan benar-benar membuka konektivitas komunitas?',
    },
    rationale: {
      en: 'Availability and reliability of roads/bridges, network connectivity, surface condition, historical change, wet-season performance and maintenance responsibility.',
      id: 'Ketersediaan dan reliability jalan/jembatan, konektivitas jaringan, surface condition, perubahan historis, wet-season performance, serta tanggung jawab maintenance.',
    },
    minimumVariables: {
      en: 'Road geometry/class; construction/improvement year; surface/condition; bridge/culvert; wet-season closure/delay; route speed; funding and maintenance responsibility; public/community access.',
      id: 'Road geometry/class; construction/improvement year; surface/condition; bridge/culvert; wet-season closure/delay; route speed; funding and maintenance responsibility; public/community access.',
    },
    secondarySources: ['IDN-S07', 'IDN-S08', 'ADM-05', 'ADM-06'],
    geoAiSources: {
      en: 'GEO-G01, GEO-G02, GEO-G05, GEO-G04, IDN-S13, IDN-S14, GEO-G06.',
      id: 'GEO-G01, GEO-G02, GEO-G05, GEO-G04, IDN-S13, IDN-S14, GEO-G06.',
    },
    remoteValidation: {
      en: 'User/driver confirmation of travel reliability, access restrictions and seasonal delay.',
      id: 'User/driver confirmation untuk travel reliability, access restriction dan seasonal delay.',
    },
    localVerification: {
      en: 'Required for key assets/routes where condition or route geometry cannot be established; GPS track + geotagged photos.',
      id: 'Required untuk key assets/routes bila kondisi atau route geometry tidak dapat dipastikan; GPS track + geotagged photos.',
    },
    centralFieldTrigger: {
      en: 'Conditional where imagery/records conflict, a bridge/road is technically disputed, or a segment becomes a major advocacy claim.',
      id: 'Conditional bila imagery/records conflict, bridge/road technically disputed, atau segment menjadi major advocacy claim.',
    },
    minimumEvidencePackage: {
      en: 'Dated road record/imagery + routable network + local/remote condition validation for key segments.',
      id: 'Dated road record/imagery + routable network + local/remote condition validation for key segments.',
    },
    interpretiveLimit: {
      en: 'Road presence does not mean public access, quality, year-round reliability, or industry contribution.',
      id: 'Road presence tidak berarti public access, quality, year-round reliability atau industry contribution.',
    },
    intensity: { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'R', 'P-C': 'C' },
  },
  {
    code: 'PSN-2',
    pillar: 'PSN',
    name: {
      en: 'Accessibility to Services, Markets and Digital Networks',
      id: 'Aksesibilitas ke Layanan, Pasar, dan Jaringan Digital',
    },
    question: {
      en: 'Can residents reach markets/services and digital networks at reasonable time and cost?',
      id: 'Apakah warga dapat menjangkau market/services dan digital networks dengan biaya/waktu yang wajar?',
    },
    rationale: {
      en: 'Ease of reaching mill/collection point, market, school, clinic and government services, plus access to communication/digital networks for information and services.',
      id: 'Kemudahan mencapai mill/collection point, market, school, clinic, government service, serta akses jaringan komunikasi/digital untuk informasi dan layanan.',
    },
    minimumVariables: {
      en: 'Origin settlements; destination locations/capacity; travel time/cost by season; population coverage; unserved areas; telecom coverage; speed/latency/stability; package cost; digital use.',
      id: 'Origin settlements; destination locations/capacity; travel time/cost by season; population coverage; unserved areas; telecom coverage; speed/latency/stability; package cost; digital use.',
    },
    secondarySources: ['IDN-S01', 'IDN-S05', 'IDN-S06', 'IDN-S11', 'MYS-S04', 'MYS-S05', 'MYS-S07', 'ADM-03', 'ADM-05', 'ADM-06', 'ADM-07'],
    geoAiSources: {
      en: 'IDN-S08, IDN-S09, GEO-G05, GEO-G04, GEO-G01, IDN-S13; terrain/network models.',
      id: 'IDN-S08, IDN-S09, GEO-G05, GEO-G04, GEO-G01, IDN-S13; terrain/network models.',
    },
    remoteValidation: {
      en: 'Route/travel-time checks + remotely submitted speed tests + user interviews on cost, stability and digital/service use.',
      id: 'Route/travel-time checks + remotely submitted speed tests + user interviews untuk cost, stability, digital/service use.',
    },
    localVerification: {
      en: 'GPS route calibration or signal/speed verification where network model/provider data are insufficient.',
      id: 'GPS route calibration atau signal/speed verification bila network model/provider data tidak cukup.',
    },
    centralFieldTrigger: {
      en: 'Not default; only for a high-stakes accessibility/telecom investment claim that remains unverified.',
      id: 'Tidak default; hanya untuk high-stakes accessibility/telecom investment claim yang tetap tidak terverifikasi.',
    },
    minimumEvidencePackage: {
      en: 'Verified destination locations + calibrated road/network model + independent route/speed observations.',
      id: 'Verified destination locations + calibrated road/network model + independent route/speed observations.',
    },
    interpretiveLimit: {
      en: 'Modelled access measures potential accessibility; actual use also depends on cost, service quality, opening hours and social barriers.',
      id: 'Modelled access mengukur potential accessibility; actual use juga dipengaruhi cost, service quality, opening hours dan social barriers.',
    },
    intensity: { S: 'M', G: 'M', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'PSN-3',
    pillar: 'PSN',
    name: {
      en: 'Natural Assets, Environmental Safety and Resilience',
      id: 'Aset Alam, Keselamatan Lingkungan, dan Resiliensi',
    },
    question: {
      en: 'Are natural/physical assets safe and resilient to environmental risk?',
      id: 'Apakah natural/physical assets aman dan resilient terhadap environmental risk?',
    },
    rationale: {
      en: 'Land/water/riparian conditions relevant to the community, hazard exposure, fire/flood/drought, safeguards, and the ability of physical/natural assets to keep functioning under environmental stress.',
      id: 'Kondisi land/water/riparian yang relevan bagi komunitas, hazard exposure, fire/flood/drought, safeguards, serta kemampuan aset fisik/natural mempertahankan fungsi di bawah tekanan lingkungan.',
    },
    minimumVariables: {
      en: 'Land-cover/riparian condition; water/drainage context; hazard exposure/history; affected settlements/assets; fire/hotspots; flood extent/duration; safeguard location; maintenance; recovery evidence.',
      id: 'Land-cover/riparian condition; water/drainage context; hazard exposure/history; affected settlements/assets; fire/hotspots; flood extent/duration; safeguard location; maintenance; recovery evidence.',
    },
    secondarySources: ['IDN-S13', 'IDN-S14', 'IDN-S15', 'ADM-05', 'ADM-06', 'ADM-08'],
    geoAiSources: {
      en: 'GEO-G01, GEO-G02, GEO-G03, GEO-G04, GEO-G06, IDN-S09.',
      id: 'GEO-G01, GEO-G02, GEO-G03, GEO-G04, GEO-G06, IDN-S09.',
    },
    remoteValidation: {
      en: 'Incident chronology and community/service-operator confirmation; verify safeguard function remotely where possible.',
      id: 'Incident chronology dan community/service-operator confirmation; verifikasi safeguard function secara remote jika memungkinkan.',
    },
    localVerification: {
      en: 'Geotagged evidence for drainage/riparian/safeguard/flood impact where spatial evidence is ambiguous.',
      id: 'Geotagged evidence untuk drainage/riparian/safeguard/flood impact bila spatial evidence ambigu.',
    },
    centralFieldTrigger: {
      en: 'Required for specified laboratory/engineering/attribution claims such as water quality, contamination, pollution source or structural integrity.',
      id: 'Required untuk specified laboratory/engineering/attribution claims seperti water quality, contamination, pollution source atau structural integrity.',
    },
    minimumEvidencePackage: {
      en: 'At least two independent hazard/environment sources + exposure analysis + safeguard/event validation.',
      id: 'At least two independent hazard/environment sources + exposure analysis + safeguard/event validation.',
    },
    interpretiveLimit: {
      en: 'Imagery/hotspots show a condition or event, not responsibility, contamination, or direct community impact.',
      id: 'Citra/hotspot menunjukkan kondisi atau event, bukan responsibility, contamination atau direct community impact.',
    },
    intensity: { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'C' },
  },

  // --- ECO ------------------------------------------------------------------
  {
    code: 'ECO-1',
    pillar: 'ECO',
    name: {
      en: 'Employment, Income Generation and Local Procurement',
      id: 'Pekerjaan, Arus Pendapatan, dan Pengadaan Lokal',
    },
    question: {
      en: 'Do jobs, income flows and local procurement strengthen the local economic base?',
      id: 'Apakah pekerjaan, income flow dan local procurement memperkuat basis ekonomi lokal?',
    },
    rationale: {
      en: 'Direct/indirect jobs, local labour participation, wage/payment flows, contractor activity and local procurement that strengthen the community economic base.',
      id: 'Direct/indirect jobs, local labour participation, wage/payment flows, contractor activity dan local procurement yang memperkuat basis ekonomi komunitas.',
    },
    minimumVariables: {
      en: 'Direct/contracted jobs; local/non-local share; employment status/duration; wage/payment band; sex/age disaggregation; procurement value/location/category; local-content share.',
      id: 'Direct/contracted jobs; local/non-local share; employment status/duration; wage/payment band; sex/age disaggregation; procurement value/location/category; local-content share.',
    },
    secondarySources: ['IDN-S02', 'IDN-S01', 'MYS-S01', 'ADM-01', 'ADM-02'],
    geoAiSources: {
      en: 'IDN-S08, GEO-G05 for residence/procurement location mapping and spatial distribution.',
      id: 'IDN-S08, GEO-G05 untuk residence/procurement location mapping dan spatial distribution.',
    },
    remoteValidation: {
      en: '10-20 short worker/contractor interviews per case (indicative), stratified by local/non-local, sex and employment type; procurement supplier confirmation.',
      id: '10-20 short worker/contractor interviews per case (indicative), distratifikasi local/non-local, sex dan employment type; procurement supplier confirmation.',
    },
    localVerification: {
      en: 'Conditional where residence coding or contractor presence is incomplete.',
      id: 'Conditional bila residence coding atau contractor presence tidak lengkap.',
    },
    centralFieldTrigger: {
      en: 'Not default; only where payroll authenticity, labour conditions or a headline claim cannot be independently verified.',
      id: 'Tidak default; hanya jika payroll authenticity, labour conditions, atau headline claim tidak dapat diverifikasi independen.',
    },
    minimumEvidencePackage: {
      en: 'Administrative employment/procurement data + independent remote validation + demographic/spatial disaggregation.',
      id: 'Administrative employment/procurement data + independent remote validation + demographic/spatial disaggregation.',
    },
    interpretiveLimit: {
      en: 'Do not infer household-income improvement from payroll alone; report the documented income-generation flow.',
      id: 'Jangan menyimpulkan household-income improvement dari payroll saja; laporkan documented income-generation flow.',
    },
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'ECO-2',
    pillar: 'ECO',
    name: {
      en: 'Smallholder Productive Assets and Market Access',
      id: 'Aset Produktif Pekebun dan Akses Pasar',
    },
    question: {
      en: 'Can smallholders mobilise productive assets to market through effective networks?',
      id: 'Apakah pekebun mampu memobilisasi productive assets ke market melalui jaringan yang efektif?',
    },
    rationale: {
      en: 'Production/transaction performance, access to mill/collection points, cooperative services, finance, inputs, certification, and the ability of smallholders to mobilise farm assets to market.',
      id: 'Kinerja produksi/transaksi, akses mill/collection point, cooperative services, finance, input, certification dan kemampuan pekebun memobilisasi aset kebun ke pasar.',
    },
    minimumVariables: {
      en: 'FFB volume/realised price; supplier type; delivery frequency; quality/rejection; distance/time/cost; membership/service use; training; finance; certification; farm/collection-point location.',
      id: 'FFB volume/realised price; supplier type; delivery frequency; quality/rejection; distance/time/cost; membership/service use; training; finance; certification; farm/collection-point location.',
    },
    secondarySources: ['IDN-S04', 'MYS-S03', 'IDN-S01', 'ADM-03', 'ADM-04'],
    geoAiSources: {
      en: 'GEO-G01, GEO-G02, GEO-G05, IDN-S08, GEO-G04 for farm/supplier catchment and accessibility.',
      id: 'GEO-G01, GEO-G02, GEO-G05, IDN-S08, GEO-G04 untuk farm/supplier catchment dan accessibility.',
    },
    remoteValidation: {
      en: 'Stratified member/non-member and plasma/independent farmer validation; confirm transport cost, payment delay, service use and barriers.',
      id: 'Stratified member/non-member dan plasma/independent farmer validation; confirm transport cost, payment delay, service use dan barriers.',
    },
    localVerification: {
      en: 'Geotag collection point/farm route only where coordinates/routes are uncertain; plot measurement only for technical productivity claims that require it.',
      id: 'Geotag collection point/farm route hanya jika koordinat/rute tidak pasti; plot measurement hanya untuk claim produktivitas teknis yang memerlukannya.',
    },
    centralFieldTrigger: {
      en: 'Not default; field visit if supplier records conflict materially or a technical farm claim requires measurement.',
      id: 'Tidak default; field visit jika supplier records conflict materially atau technical farm claim membutuhkan pengukuran.',
    },
    minimumEvidencePackage: {
      en: 'Transaction records + GeoAI accessibility/catchment + independent smallholder validation.',
      id: 'Transaction records + GeoAI accessibility/catchment + independent smallholder validation.',
    },
    interpretiveLimit: {
      en: 'Satellite canopy indicators are supporting evidence only; they do not replace verified production/transaction records.',
      id: 'Satellite canopy indicators hanya supporting evidence; tidak menggantikan verified production/transaction records.',
    },
    intensity: { S: 'M', G: 'M', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'ECO-3',
    pillar: 'ECO',
    name: {
      en: 'Local Enterprise, Diversification and Economic Resilience',
      id: 'Usaha Lokal, Diversifikasi, dan Resiliensi Ekonomi',
    },
    question: {
      en: 'Is the local economy diversified and able to withstand shocks?',
      id: 'Apakah ekonomi lokal terdiversifikasi dan mampu bertahan terhadap shocks?',
    },
    rationale: {
      en: 'Diversity of business activity, service economy, local value-chain linkages, alternative income sources, and the ability of the local economy to face price/environmental shocks.',
      id: 'Keanekaragaman aktivitas usaha, service economy, local value-chain linkages, sumber pendapatan alternatif dan kemampuan ekonomi lokal menghadapi price/environmental shocks.',
    },
    minimumVariables: {
      en: 'Business count/type/status; year established; employment band; palm-oil linkage; local procurement; activity diversity; price/production volatility; alternative livelihoods; recovery/continuity evidence.',
      id: 'Business count/type/status; year established; employment band; palm-oil linkage; local procurement; activity diversity; price/production volatility; alternative livelihoods; recovery/continuity evidence.',
    },
    secondarySources: ['IDN-S01', 'IDN-S03', 'IDN-S12', 'MYS-S02', 'MYS-S03', 'ADM-02', 'ADM-03', 'ADM-04', 'ADM-06'],
    geoAiSources: {
      en: 'GEO-G02, GEO-G05, GEO-G07, IDN-S13, IDN-S14, GEO-G06 as spatial/economic context.',
      id: 'GEO-G02, GEO-G05, GEO-G07, IDN-S13, IDN-S14, GEO-G06 sebagai spatial/economic context.',
    },
    remoteValidation: {
      en: 'Purposive business/village official calls on operating status, start year, palm-oil linkage, diversification and shock response.',
      id: 'Purposive business/village official calls untuk operating status, start year, palm-oil linkage, diversification dan shock response.',
    },
    localVerification: {
      en: 'Rapid business listing only where registers/POI are weak or contradictory.',
      id: 'Rapid business listing hanya bila registers/POI lemah atau kontradiktif.',
    },
    centralFieldTrigger: {
      en: 'Not default; only where an enterprise/resilience claim becomes a major advocacy finding but desk + remote evidence stay inconsistent.',
      id: 'Tidak default; hanya jika enterprise/resilience claim menjadi major advocacy finding tetapi desk + remote evidence tetap tidak konsisten.',
    },
    minimumEvidencePackage: {
      en: 'At least two secondary listings, or one listing + remote confirmation + time-series/spatial context + documented resilience pathway.',
      id: 'At least two secondary listings atau one listing + remote confirmation + time-series/spatial context + documented resilience pathway.',
    },
    interpretiveLimit: {
      en: 'Night-time lights/POI growth do not prove causation or welfare; documentary and human corroboration are required.',
      id: 'Night-time lights/POI growth tidak membuktikan causation atau welfare; perlu documentary and human corroboration.',
    },
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
]

export const INDICATORS_BY_CODE: Record<IndicatorCode, IndicatorDefinition> = Object.fromEntries(
  INDICATORS.map((i) => [i.code, i]),
) as Record<IndicatorCode, IndicatorDefinition>

/** Scorecard doc Table 3 — the five scoring components applied to each indicator. */
export const ABCD_COMPONENT_DEFINITIONS = [
  {
    code: 'A' as const,
    name: { en: 'Asset Strength', id: 'Kekuatan Aset' },
    weight: 0.2,
    question: {
      en: 'Is the asset available, active, of adequate quality and capacity?',
      id: 'Apakah aset tersedia, aktif, berkualitas dan memiliki kapasitas yang cukup?',
    },
  },
  {
    code: 'C' as const,
    name: { en: 'Connectivity & Accessibility', id: 'Konektivitas dan Aksesibilitas' },
    weight: 0.2,
    question: {
      en: 'Can residents reach the asset, and is it connected to other assets/actors?',
      id: 'Apakah warga dapat menjangkau aset dan apakah aset terhubung dengan aset/aktor lain?',
    },
  },
  {
    code: 'M' as const,
    name: { en: 'Mobilization & Community Agency', id: 'Mobilisasi dan Agensi Komunitas' },
    weight: 0.25,
    question: {
      en: 'Can the community use, organise and mobilise the asset for collective purposes?',
      id: 'Apakah komunitas mampu menggunakan, mengorganisasi dan memobilisasi aset untuk tujuan kolektif?',
    },
  },
  {
    code: 'I' as const,
    name: { en: 'Inclusion & Community Control', id: 'Inklusi dan Kontrol Komunitas' },
    weight: 0.15,
    question: {
      en: 'Who can use, influence or control the asset and its benefits?',
      id: 'Siapa yang dapat menggunakan, memengaruhi atau mengendalikan aset/manfaat?',
    },
  },
  {
    code: 'O' as const,
    name: { en: 'Outcome & Continuity', id: 'Outcome dan Keberlanjutan' },
    weight: 0.2,
    question: {
      en: 'Does the asset produce observable outcomes and keep functioning over time?',
      id: 'Apakah aset menghasilkan outcome yang dapat diamati dan tetap berfungsi/bermanfaat dari waktu ke waktu?',
    },
  },
]

/** Ordinal anchors for the 0-4 component rating. */
export const RATING_ANCHORS = [
  { value: 0, en: 'None / no evidence of the quality', id: 'Tidak ada / tidak ada bukti kualitas' },
  { value: 1, en: 'Minimal', id: 'Minimal' },
  { value: 2, en: 'Partial', id: 'Parsial' },
  { value: 3, en: 'Substantial', id: 'Substansial' },
  { value: 4, en: 'Strong and well established', id: 'Kuat dan mapan' },
]
