/**
 * Shapes of the JSON emitted by scripts/extract-folium.mjs.
 * Source data only — analyst input never lives in these types.
 */

export interface VillageProperties {
  VILLAGE_ID: string
  VILLAGE_NAME: string
  SUBDISTRICT_NAME: string
  DISTRICT_NAME: string
  PROVINSI: string
  POPULATION: number
  HOUSEHOLDS: number
  DIST_TO_CONCESSION_KM: number
  /** Proximity score precomputed by the upstream GIS workflow. */
  P: number
  VILLAGE_GEOM_KM2: number
  KEPADATAN: number
  LUAS_DESA: number
  PRIA: number
  WANITA: number
  CASE_ID: string
  SELECTED_PO_COM: string
  GENERATED: string
  centroid: [number, number]
}

export interface VillageFeature {
  type: 'Feature'
  properties: VillageProperties
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] }
}

export interface CaseCluster {
  caseId: string
  poCom: string
  poGroup: string | null
  province: string
  district: string
  concessionAreaHa: number
  screeningEnvelopeKm: number | null
  villageCount: number
  sourceFile: string
  concession: {
    type: 'Feature'
    properties: Record<string, unknown>
    geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] }
  }
  envelope: {
    type: 'Feature'
    properties: Record<string, unknown>
    geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] }
  } | null
  villages: { type: 'FeatureCollection'; features: VillageFeature[] }
}

export interface CaseSummary {
  caseId: string
  poCom: string
  poGroup: string | null
  province: string
  district: string
  concessionAreaHa: number
  screeningEnvelopeKm: number | null
  villageCount: number
}

export interface CaseIndex {
  cases: CaseSummary[]
}

/** Full 175-field Dukcapil attribute table, keyed by village id. */
export type VillageAttributes = Record<string, Record<string, string | number | null>>

export interface ConcessionRecord {
  i: number
  PO_COM: string | null
  PO_GROUP: string | null
  PROVINCE: string | null
  DISTRICT: string | null
  HECTARES: number | null
  LEGAL_STAT: string | null
  commodity: string | null
  SOURCES: string | null
  Nama_Konsesi: string | null
  lon: number
  lat: number
  bbox: [number, number, number, number]
}

export interface ConcessionIndex {
  total: number
  totalHectares: number
  provinces: { name: string; slug: string; file: string; count: number }[]
  concessions: ConcessionRecord[]
}
