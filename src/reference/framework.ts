/**
 * Framework reference content: contribution categories, evidence tiers, zones,
 * decision rules and required outputs.
 *
 * Transcribed from the two methodological design documents. Kept as data so
 * the UI renders the method rather than restating it in prose scattered
 * through components.
 */

import type { ContributionCategory, EvidenceTier } from '@/domain/types'

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
  { code: ContributionCategory; label: string; definition: string }
> = {
  direct: {
    code: 'direct',
    label: 'Direct',
    definition: 'Asset, job, programme or service financed or delivered directly by industry actors.',
  },
  indirect: {
    code: 'indirect',
    label: 'Indirect',
    definition: 'Economic activity generated through workers, suppliers, smallholders, procurement and local expenditure.',
  },
  catalytic: {
    code: 'catalytic',
    label: 'Catalytic',
    definition: 'Wider change stimulated by connectivity, market demand, population concentration or fiscal capacity.',
  },
  enabling: {
    code: 'enabling',
    label: 'Enabling',
    definition: 'Training, partnerships, cooperative strengthening or institutional support that enables asset mobilisation.',
  },
  'co-produced': {
    code: 'co-produced',
    label: 'Co-produced',
    definition: 'Change jointly produced by company, government, community, cooperative or other actors.',
  },
  external: {
    code: 'external',
    label: 'External / contextual',
    definition: 'Change primarily driven by public policy, unrelated investment, demographic change or another sector.',
  },
}

/** Evidence architecture (scorecard doc Table 5). */
export const EVIDENCE_TIER_DEFINITIONS: Record<
  EvidenceTier,
  { code: EvidenceTier; label: string; definition: string; rule: string }
> = {
  S: {
    code: 'S',
    label: 'Secondary data',
    definition: 'Official statistics, administrative/company/cooperative/facility records, programme documents.',
    rule: 'Default baseline and documentary pathway evidence.',
  },
  G: {
    code: 'G',
    label: 'GeoAI data',
    definition: 'Satellite imagery, road network, facilities, DEM, hazards, accessibility and spatial proxies.',
    rule: 'Default spatial baseline; metadata and uncertainty must be recorded.',
  },
  'P-R': {
    code: 'P-R',
    label: 'Remote primary',
    definition: 'Telephone/video interview, online survey, remote FGD, tracer survey, document audit.',
    rule: 'Default first validation after desk review.',
  },
  'P-L': {
    code: 'P-L',
    label: 'Local field primary',
    definition: 'GPS route, geotagged photo/video, mobile GIS checklist by a local focal point.',
    rule: 'For physical, functionality or location gaps, or digital bias.',
  },
  'P-C': {
    code: 'P-C',
    label: 'Central field primary',
    definition: 'Central-team visit, specialist sampling, in-person FGD/observation.',
    rule: 'Trigger only; not default.',
  },
}

/** Candidate zones in the functional community catchment (design doc Table 1). */
export const ZONES = [
  {
    code: 'Z0',
    name: 'Operational Core',
    definition: 'Concession polygon, mill, worker housing, nursery, collection point, estate roads.',
    role: 'Source of influence; not the primary community score unit.',
  },
  {
    code: 'Z1',
    name: 'Embedded/Adjacent Community',
    definition: 'Villages/settlements inside, enclaved, bordering or very close to the concession.',
    role: 'Potentially high direct exposure.',
  },
  {
    code: 'Z2',
    name: 'Immediate Connected Community',
    definition: 'Nearby villages with road access, labour, plasma, facilities or direct programmes.',
    role: 'Direct/enabling contribution.',
  },
  {
    code: 'Z3',
    name: 'Functionally Connected Community',
    definition: 'More distant villages that are strong worker origins, FFB suppliers, cooperative members or mill-road users.',
    role: 'Supply-chain/economic linkage.',
  },
  {
    code: 'Z4',
    name: 'Wider Catalytic Area',
    definition: 'Market centres, subdistricts, workshops, transport services, schools/clinics or service hubs growing alongside palm-oil activity.',
    role: 'Catalytic/local multiplier.',
  },
  {
    code: 'Z5',
    name: 'Low-Exposure Comparison',
    definition: 'Communities with comparable initial character but weak linkage to palm-oil operations.',
    role: 'Contextual comparator; not an experimental control.',
  },
]

/** POCI components (design doc Table 3). */
export const POCI_COMPONENT_DEFINITIONS = [
  {
    code: 'P' as const,
    weight: 0.15,
    name: 'Proximity',
    definition: 'Closeness of settlements/villages to the concession boundary or operational nodes.',
    note: 'Geometric screening, not evidence of contribution.',
    rubric: '0-2 km = 100; >2-5 = 80; >5-10 = 60; >10-20 = 40; >20-30 = 20; >30 = 0',
  },
  {
    code: 'N' as const,
    weight: 0.25,
    name: 'Network Connectivity',
    definition: 'Travel time and road connectivity to mill, estate gate, market, school and clinic.',
    note: 'More important than straight-line distance.',
    rubric: '<=15 min = 100; 16-30 = 80; 31-45 = 60; 46-60 = 40; 61-90 = 20; >90 = 0',
  },
  {
    code: 'E' as const,
    weight: 0.3,
    name: 'Economic Linkage',
    definition: 'Share of local workers, FFB suppliers, procurement, contractors and local value-chain activity.',
    note: 'Largest weight because it is the most direct form of functional exposure.',
    rubric: 'Combined worker origin, supplier origin and procurement/contractor linkage, normalised 0-100. NA is not 0 when records are unavailable.',
  },
  {
    code: 'F' as const,
    weight: 0.15,
    name: 'Facility/Infrastructure Linkage',
    definition: 'Roads, bridges, schools, clinics, utilities, digital access or facility support connected to palm-oil operations.',
    note: 'Chronology, financer, access and functionality must be checked.',
    rubric: '0 = no evidence; 25 = minor; 50 = moderate; 75 = strong; 100 = multiple functional linkages',
  },
  {
    code: 'L' as const,
    weight: 0.15,
    name: 'Institutional/Social Linkage',
    definition: 'Plasma, cooperatives, farmer groups, training, partnership, CSR/community programme, grievance mechanism.',
    note: 'Captures enabling and co-produced pathways.',
    rubric: '0 = none; 25 = sporadic; 50 = active programme/group; 75 = strong partnership; 100 = multi-institutional and sustained',
  },
]

/** Practical decision rules (design doc Table 12). */
export const DECISION_RULES = [
  {
    situation: 'A village is very close but has no worker/supplier/road/institutional linkage.',
    decision: 'Do not automatically select it as an exposed site; consider it as a low-exposure or contextual site.',
  },
  {
    situation: 'A village is >20-30 km away but is a principal supplier or worker origin.',
    decision: 'Include it in the functional catchment even though it falls outside the initial envelope.',
  },
  {
    situation: 'Economic records are unavailable.',
    decision: 'Do not assign E = 0. Mark NA/low confidence and carry out remote validation before exclusion.',
  },
  {
    situation: 'All candidates have high POCI.',
    decision: 'Select on typology diversity and baseline variation, not on ranking alone.',
  },
  {
    situation: 'Budget is very limited.',
    decision: 'Screen every village with secondary/GeoAI evidence, then run full ABCD on 4 exposed + 1 comparator.',
  },
  {
    situation: 'Two villages have the same POCI.',
    decision: 'Prioritise the village that adds a new pathway or an unrepresented beneficiary group.',
  },
  {
    situation: 'Community benefit comes from government-company-community co-production.',
    decision: 'Still score the ABCD asset; record attribution separately as a co-produced contribution.',
  },
]

/** Spatial and analytical outputs required by design doc section 13. */
export const REQUIRED_OUTPUTS = [
  { key: 'map-1', label: 'Concession, mill, gate, estate roads, village boundaries and settlements.' },
  { key: 'map-2', label: '15/30/45/60-minute network catchments from operational nodes.' },
  { key: 'map-3', label: 'Worker origin and supplier/FFB catchment.' },
  { key: 'map-4', label: 'Schools, clinics, markets, cooperatives, service areas and accessibility gaps.' },
  { key: 'map-5', label: 'POCI exposure surface / community classification.' },
  { key: 'map-6', label: 'Selected ABCD assessment portfolio and comparator.' },
  { key: 'table-poci', label: 'POCI component scores, source coverage, confidence and community typology.' },
  { key: 'table-abcd', label: 'ABCD provisional/final scores and contribution pathway.' },
  { key: 'validation-queue', label: 'Indicators/locations requiring remote, local or sentinel verification.' },
  { key: 'evidence-register', label: 'Chronology, actor, financing, beneficiaries, alternative explanations and counter-evidence.' },
]
