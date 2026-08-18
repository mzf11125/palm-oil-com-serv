/**
 * Data source catalog.
 *
 * Source IDs are retained from the POCDS-RF Data Sources and Acquisition Guide
 * (Version 1.0, verified official-source register as of 4 August 2026), as
 * required by scorecard doc section 11. ABCD-ADM-09 is the one addition,
 * proposed because ABCD needs data on resident organisations beyond formal
 * cooperatives.
 *
 * These IDs are the spine of evidence traceability: every indicator score
 * cites them, and the evidence register tracks acquisition against them.
 */

export type SourceKind =
  | 'secondary-public'
  | 'secondary-controlled'
  | 'secondary-reference'
  | 'geoai-base'
  | 'geoai-satellite'
  | 'geoai-hazard'
  | 'geoai-climate'
  | 'geoai-proxy'
  | 'open-geospatial'
  | 'administrative-request'

export interface SourceDefinition {
  id: string
  /** Indonesia, Malaysia, Global, or Operational (request-based). */
  region: 'IDN' | 'MYS' | 'GLOBAL' | 'OPERATIONAL'
  name: string
  kind: SourceKind
  primaryUse: string
  /** True where access needs a formal request or authorisation. */
  restricted: boolean
}

export const SOURCES: SourceDefinition[] = [
  // --- 11.1 Indonesia -------------------------------------------------------
  {
    id: 'IDN-S01',
    region: 'IDN',
    name: 'BPS — Statistik Potensi Desa Indonesia 2024',
    kind: 'secondary-public',
    primaryUse:
      'Village-level infrastructure, facilities, economy, transport, communication and vulnerability; released every three years.',
    restricted: false,
  },
  {
    id: 'IDN-S02',
    region: 'IDN',
    name: 'BPS — Keadaan Angkatan Kerja di Indonesia Februari 2026 (Sakernas)',
    kind: 'secondary-public',
    primaryUse: 'Labour-force benchmark; provincial-level context rather than community-level scoring.',
    restricted: false,
  },
  {
    id: 'IDN-S03',
    region: 'IDN',
    name: 'BPS — Statistik Kesejahteraan Rakyat 2025 / Susenas',
    kind: 'secondary-public',
    primaryUse:
      'Benchmark for education, health, housing, basic services, ICT, consumption and household welfare.',
    restricted: false,
  },
  {
    id: 'IDN-S04',
    region: 'IDN',
    name: 'Direktorat Jenderal Perkebunan — Buku Statistik Perkebunan 2024-2026',
    kind: 'secondary-public',
    primaryUse: 'Oil-palm area, production, productivity and sector context.',
    restricted: false,
  },
  {
    id: 'IDN-S05',
    region: 'IDN',
    name: 'Data Pokok Pendidikan (Dapodik)',
    kind: 'secondary-controlled',
    primaryUse:
      'School, student, teacher and education-facility records; detailed extracts may require authorised access.',
    restricted: true,
  },
  {
    id: 'IDN-S06',
    region: 'IDN',
    name: 'SATUSEHAT Data',
    kind: 'secondary-controlled',
    primaryUse:
      'Health-facility, workforce, infrastructure and service data; detailed local data may require agency access.',
    restricted: true,
  },
  {
    id: 'IDN-S07',
    region: 'IDN',
    name: 'Open Data PU — Road Condition Datasets',
    kind: 'secondary-public',
    primaryUse:
      'National, provincial and district road condition/length; village and estate roads require local/company records.',
    restricted: false,
  },
  {
    id: 'IDN-S08',
    region: 'IDN',
    name: 'BIG / Ina-Geoportal — Administrative Boundaries and Base Geospatial Data',
    kind: 'geoai-base',
    primaryUse: 'Administrative boundaries, roads, hydrography and other fundamental geospatial layers.',
    restricted: false,
  },
  {
    id: 'IDN-S09',
    region: 'IDN',
    name: 'BIG — DEMNAS',
    kind: 'geoai-base',
    primaryUse:
      'Elevation model for slope, terrain, hydrological screening and telecommunications line-of-sight.',
    restricted: false,
  },
  {
    id: 'IDN-S10',
    region: 'IDN',
    name: 'Kementerian Koperasi — Data Koperasi and ODS Koperasi',
    kind: 'secondary-controlled',
    primaryUse:
      'Cooperative identity, status and reporting; detailed membership/RAT/transactions require direct request.',
    restricted: true,
  },
  {
    id: 'IDN-S11',
    region: 'IDN',
    name: 'Kementerian Komunikasi dan Digital — Data Coverage Jaringan Telekomunikasi',
    kind: 'secondary-public',
    primaryUse:
      'Telecommunications coverage and connectivity context; local quality requires speed-test validation.',
    restricted: false,
  },
  {
    id: 'IDN-S12',
    region: 'IDN',
    name: 'Bappenas — Metadata Indikator TPB/SDGs Indonesia',
    kind: 'secondary-reference',
    primaryUse:
      'Indicator definitions, calculation methods, disaggregation, responsible institutions and collection frequency.',
    restricted: false,
  },
  {
    id: 'IDN-S13',
    region: 'IDN',
    name: 'BNPB — InaRISK',
    kind: 'geoai-hazard',
    primaryUse: 'Flood, fire, drought, landslide and multi-hazard layers, exposure and risk context.',
    restricted: false,
  },
  {
    id: 'IDN-S14',
    region: 'IDN',
    name: 'BMKG — Analisis Hujan',
    kind: 'geoai-climate',
    primaryUse: 'Observed and analysed rainfall for seasonal-access, flood and drought interpretation.',
    restricted: false,
  },
  {
    id: 'IDN-S15',
    region: 'IDN',
    name: 'Kementerian Kehutanan — Penutupan Lahan 2024',
    kind: 'geoai-base',
    primaryUse:
      'Official land-cover layer; regional scale requires caution for parcel-level interpretation.',
    restricted: false,
  },

  // --- 11.2 Malaysia --------------------------------------------------------
  {
    id: 'MYS-S01',
    region: 'MYS',
    name: 'OpenDOSM — Labour Force Statistics',
    kind: 'secondary-public',
    primaryUse:
      'National/state/district labour-force and employment benchmarks; not a substitute for local operational records.',
    restricted: false,
  },
  {
    id: 'MYS-S02',
    region: 'MYS',
    name: 'OpenDOSM — Household Income',
    kind: 'secondary-public',
    primaryUse: 'Household-income and amenities benchmark; for contextual comparison, not local attribution.',
    restricted: false,
  },
  {
    id: 'MYS-S03',
    region: 'MYS',
    name: 'Malaysian Palm Oil Board — Malaysian Oil Palm Industry Statistics',
    kind: 'secondary-public',
    primaryUse: 'Planted area, production, yields, FFB prices and industry trends.',
    restricted: false,
  },
  {
    id: 'MYS-S04',
    region: 'MYS',
    name: 'data.gov.my / Ministry of Education — Education Infrastructure',
    kind: 'secondary-public',
    primaryUse: 'District-level institutions, teachers and enrolment where available.',
    restricted: false,
  },
  {
    id: 'MYS-S05',
    region: 'MYS',
    name: 'data.gov.my / Ministry of Health — Health Infrastructure',
    kind: 'secondary-public',
    primaryUse:
      'Hospital and health-infrastructure data at national, state and district levels where available.',
    restricted: false,
  },
  {
    id: 'MYS-S06',
    region: 'MYS',
    name: 'Suruhanjaya Koperasi Malaysia — Cooperative Statistics',
    kind: 'secondary-controlled',
    primaryUse:
      'Cooperative statistics; cooperative-level governance/member records require direct request.',
    restricted: true,
  },
  {
    id: 'MYS-S07',
    region: 'MYS',
    name: 'data.gov.my / MCMC — Internet and Telecommunications Data',
    kind: 'secondary-public',
    primaryUse:
      'Internet penetration, cellular subscribers and communications context; local quality requires remote tests.',
    restricted: false,
  },

  // --- 11.3 Global GeoAI ----------------------------------------------------
  {
    id: 'GEO-G01',
    region: 'GLOBAL',
    name: 'Copernicus Sentinel-1',
    kind: 'geoai-satellite',
    primaryUse:
      'C-band SAR for all-weather surface change, flooding, wetness and road-access screening.',
    restricted: false,
  },
  {
    id: 'GEO-G02',
    region: 'GLOBAL',
    name: 'Copernicus Sentinel-2 Level-2A',
    kind: 'geoai-satellite',
    primaryUse:
      'Multispectral reflectance for land cover, vegetation, water, settlement and facility-context mapping.',
    restricted: false,
  },
  {
    id: 'GEO-G03',
    region: 'GLOBAL',
    name: 'NASA FIRMS',
    kind: 'geoai-hazard',
    primaryUse: 'Active-fire and thermal-anomaly data; use science-quality archive for research.',
    restricted: false,
  },
  {
    id: 'GEO-G04',
    region: 'GLOBAL',
    name: 'NASA Earthdata — NASADEM/SRTM',
    kind: 'geoai-base',
    primaryUse: '30 m elevation for terrain, slope, drainage, route impedance and line-of-sight analysis.',
    restricted: false,
  },
  {
    id: 'GEO-G05',
    region: 'GLOBAL',
    name: 'OpenStreetMap',
    kind: 'open-geospatial',
    primaryUse: 'Roads, buildings, services and points of interest; completeness must be checked.',
    restricted: false,
  },
  {
    id: 'GEO-G06',
    region: 'GLOBAL',
    name: 'CHIRPS',
    kind: 'geoai-climate',
    primaryUse: 'Long-term gridded rainfall for trend, drought and seasonal-access screening.',
    restricted: false,
  },
  {
    id: 'GEO-G07',
    region: 'GLOBAL',
    name: 'NASA Black Marble / VIIRS Night-Time Lights',
    kind: 'geoai-proxy',
    primaryUse: 'Supporting proxy for activity/electrification; never a direct welfare measure.',
    restricted: false,
  },

  // --- 11.4 Administrative and operational requests -------------------------
  {
    id: 'ADM-01',
    region: 'OPERATIONAL',
    name: 'Company payroll, HR and contractor roster',
    kind: 'administrative-request',
    primaryUse:
      'Employee ID (pseudonymised), sex, age band, residence code, employment status, wage band, start/end date and contractor.',
    restricted: true,
  },
  {
    id: 'ADM-02',
    region: 'OPERATIONAL',
    name: 'Local procurement and contractor records',
    kind: 'administrative-request',
    primaryUse:
      'Supplier location, category, transaction value, contract period, workforce and local-content classification.',
    restricted: true,
  },
  {
    id: 'ADM-03',
    region: 'OPERATIONAL',
    name: 'Mill weighbridge and FFB purchase records',
    kind: 'administrative-request',
    primaryUse:
      'Supplier/cooperative ID, collection point, date, volume, grade, price and payment status.',
    restricted: true,
  },
  {
    id: 'ADM-04',
    region: 'OPERATIONAL',
    name: 'Cooperative records',
    kind: 'administrative-request',
    primaryUse:
      'Membership, sex/age disaggregation, transactions, services, finance, training, RAT, leadership and grievance records.',
    restricted: true,
  },
  {
    id: 'ADM-05',
    region: 'OPERATIONAL',
    name: 'CSR/community-programme and asset register',
    kind: 'administrative-request',
    primaryUse:
      'Programme location, beneficiary list, budget, implementation year, partner, asset status, handover and maintenance responsibility.',
    restricted: true,
  },
  {
    id: 'ADM-06',
    region: 'OPERATIONAL',
    name: 'Local-government planning and budget records',
    kind: 'administrative-request',
    primaryUse:
      'Village/district plans, road/facility budget, maintenance records, service schedules and public co-financing.',
    restricted: true,
  },
  {
    id: 'ADM-07',
    region: 'OPERATIONAL',
    name: 'School, health and training operational records',
    kind: 'administrative-request',
    primaryUse:
      'Enrolment, attendance, staff, service days, utilisation, outages, equipment, participant completion and tracer outcomes.',
    restricted: true,
  },
  {
    id: 'ADM-08',
    region: 'OPERATIONAL',
    name: 'Consultation, grievance and accountability records',
    kind: 'administrative-request',
    primaryUse:
      'Consultation minutes, attendance, issue type, response time, resolution, unresolved cases and feedback.',
    restricted: true,
  },
  {
    id: 'ABCD-ADM-09',
    region: 'OPERATIONAL',
    name: 'Community association and local-group register (proposed new ABCD source)',
    kind: 'administrative-request',
    primaryUse:
      'Group name/type, membership, leadership, meeting/activity frequency, collective assets, partner links, initiatives, and current activity status.',
    restricted: true,
  },
]

export const SOURCES_BY_ID: Record<string, SourceDefinition> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
)

export const SOURCE_REGIONS = [
  { key: 'IDN' as const, label: 'Indonesia' },
  { key: 'MYS' as const, label: 'Malaysia' },
  { key: 'GLOBAL' as const, label: 'Global GeoAI & Geospatial' },
  {
    key: 'OPERATIONAL' as const,
    label: 'Administrative & Operational Requests',
  },
]
