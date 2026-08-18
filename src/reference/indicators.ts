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

export interface PillarDefinition {
  code: PillarCode
  order: number
  name: string
  /** Provisional weight; equal across pillars pending sensitivity analysis. */
  weight: number
  summary: string
}

export const PILLAR_DEFINITIONS: Record<PillarCode, PillarDefinition> = {
  HUM: {
    code: 'HUM',
    order: 1,
    name: 'Human & Individual Assets',
    weight: 0.2,
    summary: 'Knowledge, skills, employment readiness, adaptive capability, and the capacity of women and youth that the community can mobilise.',
  },
  ASS: {
    code: 'ASS',
    order: 2,
    name: 'Associational & Social Assets',
    weight: 0.2,
    summary: 'Resident-led organisations, social networks, collective action, participation, voice, and community control over assets and development decisions.',
  },
  INS: {
    code: 'INS',
    order: 3,
    name: 'Institutional & Service Assets',
    weight: 0.2,
    summary: 'Education, health, basic-service, local governance and partnership institutions that are available, accessible, functioning and supporting community capacity.',
  },
  PSN: {
    code: 'PSN',
    order: 4,
    name: 'Physical, Spatial & Natural Assets',
    weight: 0.2,
    summary: 'Physical assets, connectivity, spatial access, digital connectivity and natural/environmental conditions that enable or constrain asset mobilisation.',
  },
  ECO: {
    code: 'ECO',
    order: 5,
    name: 'Economic & Productive Assets',
    weight: 0.2,
    summary: 'Productive assets, employment, income-generation flows, smallholder market access, local enterprise, procurement, diversification and economic resilience.',
  },
}

export interface IndicatorDefinition {
  code: IndicatorCode
  pillar: PillarCode
  name: string
  /** The primary ABCD question the indicator answers. */
  question: string
  rationale: string
  minimumVariables: string
  secondarySources: string[]
  geoAiSources: string
  remoteValidation: string
  localVerification: string
  centralFieldTrigger: string
  minimumEvidencePackage: string
  /** What a high score does NOT establish. Shown on every scoring card. */
  interpretiveLimit: string
  /** Default evidence intensity per tier (scorecard doc Table 7). */
  intensity: Record<EvidenceTier, 'M' | 'R' | 'S' | 'C' | 'N'>
}

export const INDICATORS: IndicatorDefinition[] = [
  // --- HUM ------------------------------------------------------------------
  {
    code: 'HUM-1',
    pillar: 'HUM',
    name: 'Skills, Knowledge and Technical Capacity',
    question: 'What capacity do residents have, and are those skills actually applied?',
    rationale: 'Availability and application of agricultural, technical, digital, entrepreneurial, occupational-safety and problem-solving skills relevant to local livelihoods.',
    minimumVariables: 'Training participants/recipients; skill types; completion/certification; work experience; post-training skill use; farmer-extension exposure; digital capability; knowledge-transfer activity.',
    secondarySources: ['IDN-S01', 'IDN-S05', 'MYS-S04', 'ADM-04', 'ADM-05', 'ADM-07'],
    geoAiSources: 'IDN-S08 for mapping participant/facility distribution and spatial gaps. GeoAI is not used as direct evidence of competence.',
    remoteValidation: 'Short tracer survey of participants and non-completers; interviews with trainers/employers/farmer groups to verify skill use.',
    localVerification: 'Only where training facilities or practical-skill outcomes cannot be verified remotely.',
    centralFieldTrigger: 'Not default; triggered if practical-skill demonstration becomes a primary claim and cannot be verified remotely or locally.',
    minimumEvidencePackage: 'Participant/training register + completion evidence + independent remote tracer + demographic disaggregation.',
    interpretiveLimit: 'Training attendance is not an outcome. Distinguish enrolment, completion, application, and actual capability change.',
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'HUM-2',
    pillar: 'HUM',
    name: 'Employment Readiness and Adaptive Capability',
    question: 'Are residents able to enter, stay in, and adapt within work or enterprise?',
    rationale: 'Ability of individuals to enter, retain, move between or advance in work/enterprise, including experience, certification, progression and adaptation to technology/market change.',
    minimumVariables: 'Employment status; job type/skill level; tenure; training-to-job transition; progression; certification; occupational mobility; re-skilling; self-employment readiness; barriers to entry.',
    secondarySources: ['IDN-S02', 'IDN-S01', 'MYS-S01', 'ADM-01', 'ADM-05', 'ADM-07'],
    geoAiSources: 'GEO-G05/IDN-S08 only for context on access to work/training centres; not a measure of individual readiness.',
    remoteValidation: 'Worker/contractor interviews stratified by local/non-local, sex, age and employment type; verify continuity and progression.',
    localVerification: 'Conditional if residence coding, employer presence or recruitment routes are unclear.',
    centralFieldTrigger: 'Not default; only where working conditions or record authenticity become a primary and contested claim.',
    minimumEvidencePackage: 'Pseudonymised HR/contractor extract + training/job-transition records + independent remote worker validation.',
    interpretiveLimit: 'Payroll shows an income-generation flow, not an automatic improvement in household welfare.',
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'HUM-3',
    pillar: 'HUM',
    name: 'Women and Youth Capability and Leadership',
    question: 'Do women and youth gain meaningful capability, leadership and control?',
    rationale: 'Access of women and youth to skills, work, technology, finance, enterprise and leadership, and their ability to influence decisions and control benefits.',
    minimumVariables: 'Sex/age disaggregation; employment/enterprise role; training and finance receipt; leadership position; technology role; decision participation; control over income/benefit; barriers and safety.',
    secondarySources: ['IDN-S02', 'IDN-S03', 'MYS-S01', 'MYS-S02', 'ADM-01', 'ADM-02', 'ADM-04', 'ADM-05', 'ADM-08'],
    geoAiSources: 'IDN-S08 only for spatial distribution/access; never used to infer empowerment.',
    remoteValidation: 'Separate women/youth interviews or remote FGD through independent channels; test leadership, control, opportunity and exclusion.',
    localVerification: 'Use an independent local facilitator where digital exclusion, safety or power imbalance would bias remote participation.',
    centralFieldTrigger: 'Conditional for sensitive working conditions, control over income, discrimination, or contested leadership claims.',
    minimumEvidencePackage: 'Disaggregated administrative data + independent women/youth validation + evidence of leadership/decision roles.',
    interpretiveLimit: 'A participation count is not empowerment; measure voice, leadership and control over benefit.',
    intensity: { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  },

  // --- ASS ------------------------------------------------------------------
  {
    code: 'ASS-1',
    pillar: 'ASS',
    name: 'Community Associations and Cooperatives',
    question: 'Are resident organisations active and able to manage/connect community assets?',
    rationale: 'Existence, activity, capacity and reach of cooperatives, farmer groups, women/youth groups, business groups and other resident-driven local organisations.',
    minimumVariables: 'Number/type of active groups; membership; meeting frequency; leadership; financial/asset base; services; collective marketing; training; partner links; activity continuity.',
    secondarySources: ['IDN-S10', 'MYS-S06', 'IDN-S01', 'ADM-04', 'ADM-06', 'ABCD-ADM-09'],
    geoAiSources: 'IDN-S08, GEO-G05 for secretariat locations, member coverage/catchment, and access to market/service nodes.',
    remoteValidation: 'Document audit + interviews with leaders and members/non-members to test activity, reach, service use and community ownership.',
    localVerification: 'Conditional where an organisation is only administratively recorded but active status/asset base cannot be confirmed.',
    centralFieldTrigger: 'Not default; triggered only by a major governance dispute material to the findings.',
    minimumEvidencePackage: 'Registry/document evidence + membership/service records + independent member/non-member confirmation.',
    interpretiveLimit: 'A count of organisations does not represent social capital if groups are inactive or not owned/directed by residents.',
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'ASS-2',
    pillar: 'ASS',
    name: 'Social Networks, Mutual Support and Collective Action',
    question: 'Do local networks produce mutual support and collective action?',
    rationale: 'Capacity of the community to connect individuals/groups, share information and resources, respond to shared problems, and act collectively.',
    minimumVariables: 'Inter-group links; joint activities; mutual-aid mechanisms; information exchange; shared equipment/assets; collective bargaining; crisis response; cross-village links; network diversity.',
    secondarySources: ['IDN-S01', 'ADM-04', 'ADM-06', 'ADM-08', 'ABCD-ADM-09'],
    geoAiSources: 'GEO-G05/IDN-S08 as supporting evidence for proximity/network reach; cannot measure trust directly.',
    remoteValidation: 'Remote social-network elicitation, KII and FGD; identify who is connected to whom, forms of resource exchange, and recent collective-action examples.',
    localVerification: 'Conditional if remote network mapping is unrepresentative or participatory local mapping is needed.',
    centralFieldTrigger: 'Not default.',
    minimumEvidencePackage: 'At least two documentary/administrative traces + independent perspectives from multiple groups + one documented collective-action example.',
    interpretiveLimit: 'Trust and reciprocity must not be inferred from proximity or the existence of organisations alone.',
    intensity: { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'ASS-3',
    pillar: 'ASS',
    name: 'Participation, Voice and Community Control',
    question: 'Can residents influence decisions and control assets/programmes?',
    rationale: 'Quality of resident participation in planning, prioritisation, management, grievance and monitoring, and control over assets/programmes affecting the community.',
    minimumVariables: 'Consultation frequency; participant composition; agenda influence; community proposal uptake; grievance response; community management role; asset ownership/control; representation of excluded groups.',
    secondarySources: ['ADM-04', 'ADM-06', 'ADM-08', 'ABCD-ADM-09', 'IDN-S10', 'MYS-S06'],
    geoAiSources: 'Not default; IDN-S08/GEO-G05 only to support coverage mapping and identify unreached groups/settlements.',
    remoteValidation: 'Independent KII/FGD with community leaders, ordinary members, women/youth and non-beneficiaries; compare against minutes/grievance logs.',
    localVerification: 'Conditional where power imbalance or digital exclusion makes remote participation unsafe or unrepresentative.',
    centralFieldTrigger: 'Conditional for unresolved governance conflict, contested grievance, or high-risk accountability claims.',
    minimumEvidencePackage: 'Document audit + at least two independent stakeholder perspectives + evidence of decision influence or control.',
    interpretiveLimit: 'Attendance is not meaningful participation; distinguish being informed, being consulted, influencing decisions, and community control.',
    intensity: { S: 'M', G: 'N', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  },

  // --- INS ------------------------------------------------------------------
  {
    code: 'INS-1',
    pillar: 'INS',
    name: 'Education and Training Institutions',
    question: 'Are education/training institutions available, accessible, functioning and used?',
    rationale: 'Availability, function, accessibility, capacity and support for schools, training centres, extension, scholarships, transport and institutional learning support.',
    minimumVariables: 'Facility location/level; enrolment; teachers/trainers; facilities; operational status; training capacity; scholarship/transport beneficiaries; travel time; seasonal accessibility; programme budget/partner.',
    secondarySources: ['IDN-S05', 'IDN-S01', 'MYS-S04', 'ADM-05', 'ADM-06', 'ADM-07'],
    geoAiSources: 'IDN-S08, GEO-G05, GEO-G04, GEO-G01 for geocoding, 15/30/60-minute service areas and seasonal access.',
    remoteValidation: 'School/training administrator + a small user/parent/participant sample to confirm operation, access, usage and support receipt.',
    localVerification: 'Geotagged photo/video where coordinates, functionality or road access are uncertain.',
    centralFieldTrigger: 'Not default; only where a facility becomes a flagship story and remote/local evidence is insufficient.',
    minimumEvidencePackage: 'Official facility record + service/access model + remote functionality/use confirmation.',
    interpretiveLimit: 'A mapped facility does not prove service quality, attendance, or industry contribution.',
    intensity: { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'INS-2',
    pillar: 'INS',
    name: 'Health and Basic-Service Institutions',
    question: 'Are health/basic-service institutions accessible, reliable and sustainable?',
    rationale: 'Availability, accessibility, continuity and capacity of health, water, sanitation, electricity, ambulance/outreach and other basic-service institutions.',
    minimumVariables: 'Facility type/staff; service days; utilisation; travel time; seasonal access; water/sanitation/electricity coverage; outages; maintenance/funding responsibility; outreach frequency.',
    secondarySources: ['IDN-S06', 'IDN-S01', 'IDN-S03', 'MYS-S05', 'MYS-S02', 'ADM-05', 'ADM-06', 'ADM-07'],
    geoAiSources: 'IDN-S08, GEO-G05, GEO-G04, GEO-G01, IDN-S13 for service areas, seasonal disruption and exposure.',
    remoteValidation: 'Health worker/operator + short user validation for opening hours, staffing, cost, outages and wet-season access.',
    localVerification: 'Geotagged functionality audit where provider and user accounts differ.',
    centralFieldTrigger: 'Required only for specified technical claims such as laboratory water-quality, pollution or engineering-condition claims.',
    minimumEvidencePackage: 'Facility/service record + access analysis + independent functionality confirmation.',
    interpretiveLimit: 'Presence and modelled travel time do not establish service quality or health outcomes.',
    intensity: { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'C' },
  },
  {
    code: 'INS-3',
    pillar: 'INS',
    name: 'Local Governance, Accountability and Partnerships',
    question: 'Can governance and partnerships plan, finance and account for assets?',
    rationale: 'Capacity of village/local government, cooperatives and partners to plan, finance, manage, monitor and account for assets/programmes collaboratively.',
    minimumVariables: 'Planning regularity; budget allocation; co-financing; maintenance responsibility; partnership agreements; consultation; grievance performance; transparency; leadership composition; programme follow-up.',
    secondarySources: ['IDN-S10', 'MYS-S06', 'ADM-04', 'ADM-05', 'ADM-06', 'ADM-08'],
    geoAiSources: 'IDN-S08 for jurisdiction, facility/service coverage and spatial equity checks.',
    remoteValidation: 'Document audit + interviews with government, company and cooperative/community representatives from more than one recruitment channel.',
    localVerification: 'Conditional to verify implementation/asset responsibility or a contested accountability issue.',
    centralFieldTrigger: 'Conditional for unresolved governance conflict, contested grievance or a flagship partnership claim.',
    minimumEvidencePackage: 'Planning/budget/partnership documents + accountability records + at least two independent stakeholder perspectives.',
    interpretiveLimit: 'A formal agreement does not prove implementation quality or community influence.',
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'C' },
  },

  // --- PSN ------------------------------------------------------------------
  {
    code: 'PSN-1',
    pillar: 'PSN',
    name: 'Roads and All-Season Connectivity',
    question: 'Does the transport network work year-round and genuinely open up connectivity?',
    rationale: 'Availability and reliability of roads/bridges, network connectivity, surface condition, historical change, wet-season performance and maintenance responsibility.',
    minimumVariables: 'Road geometry/class; construction/improvement year; surface/condition; bridge/culvert; wet-season closure/delay; route speed; funding and maintenance responsibility; public/community access.',
    secondarySources: ['IDN-S07', 'IDN-S08', 'ADM-05', 'ADM-06'],
    geoAiSources: 'GEO-G01, GEO-G02, GEO-G05, GEO-G04, IDN-S13, IDN-S14, GEO-G06.',
    remoteValidation: 'User/driver confirmation of travel reliability, access restrictions and seasonal delay.',
    localVerification: 'Required for key assets/routes where condition or route geometry cannot be established; GPS track + geotagged photos.',
    centralFieldTrigger: 'Conditional where imagery/records conflict, a bridge/road is technically disputed, or a segment becomes a major advocacy claim.',
    minimumEvidencePackage: 'Dated road record/imagery + routable network + local/remote condition validation for key segments.',
    interpretiveLimit: 'Road presence does not mean public access, quality, year-round reliability, or industry contribution.',
    intensity: { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'R', 'P-C': 'C' },
  },
  {
    code: 'PSN-2',
    pillar: 'PSN',
    name: 'Accessibility to Services, Markets and Digital Networks',
    question: 'Can residents reach markets/services and digital networks at reasonable time and cost?',
    rationale: 'Ease of reaching mill/collection point, market, school, clinic and government services, plus access to communication/digital networks for information and services.',
    minimumVariables: 'Origin settlements; destination locations/capacity; travel time/cost by season; population coverage; unserved areas; telecom coverage; speed/latency/stability; package cost; digital use.',
    secondarySources: ['IDN-S01', 'IDN-S05', 'IDN-S06', 'IDN-S11', 'MYS-S04', 'MYS-S05', 'MYS-S07', 'ADM-03', 'ADM-05', 'ADM-06', 'ADM-07'],
    geoAiSources: 'IDN-S08, IDN-S09, GEO-G05, GEO-G04, GEO-G01, IDN-S13; terrain/network models.',
    remoteValidation: 'Route/travel-time checks + remotely submitted speed tests + user interviews on cost, stability and digital/service use.',
    localVerification: 'GPS route calibration or signal/speed verification where network model/provider data are insufficient.',
    centralFieldTrigger: 'Not default; only for a high-stakes accessibility/telecom investment claim that remains unverified.',
    minimumEvidencePackage: 'Verified destination locations + calibrated road/network model + independent route/speed observations.',
    interpretiveLimit: 'Modelled access measures potential accessibility; actual use also depends on cost, service quality, opening hours and social barriers.',
    intensity: { S: 'M', G: 'M', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'PSN-3',
    pillar: 'PSN',
    name: 'Natural Assets, Environmental Safety and Resilience',
    question: 'Are natural/physical assets safe and resilient to environmental risk?',
    rationale: 'Land/water/riparian conditions relevant to the community, hazard exposure, fire/flood/drought, safeguards, and the ability of physical/natural assets to keep functioning under environmental stress.',
    minimumVariables: 'Land-cover/riparian condition; water/drainage context; hazard exposure/history; affected settlements/assets; fire/hotspots; flood extent/duration; safeguard location; maintenance; recovery evidence.',
    secondarySources: ['IDN-S13', 'IDN-S14', 'IDN-S15', 'ADM-05', 'ADM-06', 'ADM-08'],
    geoAiSources: 'GEO-G01, GEO-G02, GEO-G03, GEO-G04, GEO-G06, IDN-S09.',
    remoteValidation: 'Incident chronology and community/service-operator confirmation; verify safeguard function remotely where possible.',
    localVerification: 'Geotagged evidence for drainage/riparian/safeguard/flood impact where spatial evidence is ambiguous.',
    centralFieldTrigger: 'Required for specified laboratory/engineering/attribution claims such as water quality, contamination, pollution source or structural integrity.',
    minimumEvidencePackage: 'At least two independent hazard/environment sources + exposure analysis + safeguard/event validation.',
    interpretiveLimit: 'Imagery/hotspots show a condition or event, not responsibility, contamination, or direct community impact.',
    intensity: { S: 'M', G: 'M', 'P-R': 'S', 'P-L': 'C', 'P-C': 'C' },
  },

  // --- ECO ------------------------------------------------------------------
  {
    code: 'ECO-1',
    pillar: 'ECO',
    name: 'Employment, Income Generation and Local Procurement',
    question: 'Do jobs, income flows and local procurement strengthen the local economic base?',
    rationale: 'Direct/indirect jobs, local labour participation, wage/payment flows, contractor activity and local procurement that strengthen the community economic base.',
    minimumVariables: 'Direct/contracted jobs; local/non-local share; employment status/duration; wage/payment band; sex/age disaggregation; procurement value/location/category; local-content share.',
    secondarySources: ['IDN-S02', 'IDN-S01', 'MYS-S01', 'ADM-01', 'ADM-02'],
    geoAiSources: 'IDN-S08, GEO-G05 for residence/procurement location mapping and spatial distribution.',
    remoteValidation: '10-20 short worker/contractor interviews per case (indicative), stratified by local/non-local, sex and employment type; procurement supplier confirmation.',
    localVerification: 'Conditional where residence coding or contractor presence is incomplete.',
    centralFieldTrigger: 'Not default; only where payroll authenticity, labour conditions or a headline claim cannot be independently verified.',
    minimumEvidencePackage: 'Administrative employment/procurement data + independent remote validation + demographic/spatial disaggregation.',
    interpretiveLimit: 'Do not infer household-income improvement from payroll alone; report the documented income-generation flow.',
    intensity: { S: 'M', G: 'S', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'ECO-2',
    pillar: 'ECO',
    name: 'Smallholder Productive Assets and Market Access',
    question: 'Can smallholders mobilise productive assets to market through effective networks?',
    rationale: 'Production/transaction performance, access to mill/collection points, cooperative services, finance, inputs, certification, and the ability of smallholders to mobilise farm assets to market.',
    minimumVariables: 'FFB volume/realised price; supplier type; delivery frequency; quality/rejection; distance/time/cost; membership/service use; training; finance; certification; farm/collection-point location.',
    secondarySources: ['IDN-S04', 'MYS-S03', 'IDN-S01', 'ADM-03', 'ADM-04'],
    geoAiSources: 'GEO-G01, GEO-G02, GEO-G05, IDN-S08, GEO-G04 for farm/supplier catchment and accessibility.',
    remoteValidation: 'Stratified member/non-member and plasma/independent farmer validation; confirm transport cost, payment delay, service use and barriers.',
    localVerification: 'Geotag collection point/farm route only where coordinates/routes are uncertain; plot measurement only for technical productivity claims that require it.',
    centralFieldTrigger: 'Not default; field visit if supplier records conflict materially or a technical farm claim requires measurement.',
    minimumEvidencePackage: 'Transaction records + GeoAI accessibility/catchment + independent smallholder validation.',
    interpretiveLimit: 'Satellite canopy indicators are supporting evidence only; they do not replace verified production/transaction records.',
    intensity: { S: 'M', G: 'M', 'P-R': 'R', 'P-L': 'C', 'P-C': 'N' },
  },
  {
    code: 'ECO-3',
    pillar: 'ECO',
    name: 'Local Enterprise, Diversification and Economic Resilience',
    question: 'Is the local economy diversified and able to withstand shocks?',
    rationale: 'Diversity of business activity, service economy, local value-chain linkages, alternative income sources, and the ability of the local economy to face price/environmental shocks.',
    minimumVariables: 'Business count/type/status; year established; employment band; palm-oil linkage; local procurement; activity diversity; price/production volatility; alternative livelihoods; recovery/continuity evidence.',
    secondarySources: ['IDN-S01', 'IDN-S03', 'IDN-S12', 'MYS-S02', 'MYS-S03', 'ADM-02', 'ADM-03', 'ADM-04', 'ADM-06'],
    geoAiSources: 'GEO-G02, GEO-G05, GEO-G07, IDN-S13, IDN-S14, GEO-G06 as spatial/economic context.',
    remoteValidation: 'Purposive business/village official calls on operating status, start year, palm-oil linkage, diversification and shock response.',
    localVerification: 'Rapid business listing only where registers/POI are weak or contradictory.',
    centralFieldTrigger: 'Not default; only where an enterprise/resilience claim becomes a major advocacy finding but desk + remote evidence stay inconsistent.',
    minimumEvidencePackage: 'At least two secondary listings, or one listing + remote confirmation + time-series/spatial context + documented resilience pathway.',
    interpretiveLimit: 'Night-time lights/POI growth do not prove causation or welfare; documentary and human corroboration are required.',
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
    name: 'Asset Strength',
    weight: 0.2,
    question: 'Is the asset available, active, of adequate quality and capacity?',
  },
  {
    code: 'C' as const,
    name: 'Connectivity & Accessibility',
    weight: 0.2,
    question: 'Can residents reach the asset, and is it connected to other assets/actors?',
  },
  {
    code: 'M' as const,
    name: 'Mobilization & Community Agency',
    weight: 0.25,
    question: 'Can the community use, organise and mobilise the asset for collective purposes?',
  },
  {
    code: 'I' as const,
    name: 'Inclusion & Community Control',
    weight: 0.15,
    question: 'Who can use, influence or control the asset and its benefits?',
  },
  {
    code: 'O' as const,
    name: 'Outcome & Continuity',
    weight: 0.2,
    question: 'Does the asset produce observable outcomes and keep functioning over time?',
  },
]

/** Ordinal anchors for the 0-4 component rating. */
export const RATING_ANCHORS = [
  { value: 0, label: 'None / no evidence of the quality' },
  { value: 1, label: 'Minimal' },
  { value: 2, label: 'Partial' },
  { value: 3, label: 'Substantial' },
  { value: 4, label: 'Strong and well established' },
]
