#!/usr/bin/env node
/**
 * Folium HTML -> application JSON.
 *
 * The three source maps are Folium exports: static Leaflet pages with their
 * GeoJSON inlined as `geo_json_<md5>_add({ ... });` calls. This script pulls
 * those payloads out and reshapes them into what the app actually loads.
 *
 * The national concession payload is ~110 MB of nested JSON, so the payload
 * boundary is found by brace matching from the call site rather than by regex.
 *
 * Usage:  node scripts/extract-folium.mjs [--src <dir>] [--out <dir>]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'

// ---------------------------------------------------------------------------
// Source files
// ---------------------------------------------------------------------------

const SOURCES = {
  national: 'peta_konsesi_sawit.html',
  cases: ['map_02_candidate_villages.html', 'map_02_candidate_villages (1).html'],
}

/**
 * Village properties kept in the screening payload. The source carries 175
 * Dukcapil fields per village; the rest are served from the `.attrs.json`
 * sidecar and only fetched when an analyst opens a village detail drawer.
 */
const VILLAGE_SCREENING_PROPS = [
  'VILLAGE_ID',
  'VILLAGE_NAME',
  'SUBDISTRICT_NAME',
  'DISTRICT_NAME',
  'PROVINSI',
  'POPULATION',
  'HOUSEHOLDS',
  'DIST_TO_CONCESSION_KM',
  'P',
  'VILLAGE_GEOM_KM2',
  'KEPADATAN',
  'LUAS_DESA',
  'PRIA',
  'WANITA',
  'CASE_ID',
  'SELECTED_PO_COM',
  'GENERATED',
]

const CONCESSION_INDEX_PROPS = [
  'PO_COM',
  'PO_GROUP',
  'PROVINCE',
  'DISTRICT',
  'HECTARES',
  'LEGAL_STAT',
  'commodity',
  'SOURCES',
  'Nama_Konsesi',
]

// Rounding: 3 dp ~= 110 m, fine at national browse zoom. 5 dp ~= 1 m for the
// case clusters, where village boundaries are inspected closely.
const NATIONAL_PRECISION = 3
const CASE_PRECISION = 5

// ---------------------------------------------------------------------------
// Folium payload extraction
// ---------------------------------------------------------------------------

/**
 * Yields every `geo_json_*_add({...})` payload in a Folium document.
 * Brace matching (rather than a lazy regex) is what makes this safe on the
 * 110 MB national file, where the payload is deeply nested.
 */
function* foliumPayloads(html) {
  const callSite = /geo_json_[0-9a-f]+_add\(\s*/g
  let match
  while ((match = callSite.exec(html)) !== null) {
    const start = match.index + match[0].length
    if (html[start] !== '{') continue

    let depth = 0
    let inString = false
    let escaped = false
    let end = -1

    for (let i = start; i < html.length; i++) {
      const ch = html[i]
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        if (inString) escaped = true
        continue
      }
      if (ch === '"') {
        inString = !inString
        continue
      }
      if (inString) continue
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }

    if (end === -1) continue
    yield JSON.parse(html.slice(start, end + 1))
    // Skip past this payload so the next exec doesn't rescan its interior.
    callSite.lastIndex = end
  }
}

/**
 * Classifies a payload by the shape of its first feature. Folium gives layers
 * md5 names with no semantic meaning, so the properties are the only signal.
 */
function classify(collection) {
  const props = collection?.features?.[0]?.properties
  if (!props) return 'unknown'
  if ('VILLAGE_NAME' in props) return 'villages'
  if ('CONCESSION_AREA_HA' in props) return 'concession'
  if ('SCREENING_KM' in props) return 'envelope'
  if ('Nama_Konsesi' in props) return 'national'
  return 'unknown'
}

// ---------------------------------------------------------------------------
// Geometry helpers — every one handles Polygon and MultiPolygon.
// Case 1 (Sei Galuh) is Polygon; Case 2 (Peniti Sungai Purun) is MultiPolygon.
// ---------------------------------------------------------------------------

function roundCoords(coords, precision) {
  if (typeof coords[0] === 'number') {
    const f = 10 ** precision
    return [Math.round(coords[0] * f) / f, Math.round(coords[1] * f) / f]
  }
  return coords.map((c) => roundCoords(c, precision))
}

function eachPosition(coords, fn) {
  if (typeof coords[0] === 'number') {
    fn(coords[0], coords[1])
    return
  }
  for (const c of coords) eachPosition(c, fn)
}

function measure(geometry) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let sumX = 0
  let sumY = 0
  let n = 0

  eachPosition(geometry.coordinates, (x, y) => {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    sumX += x
    sumY += y
    n++
  })

  const r = (v, p) => Math.round(v * 10 ** p) / 10 ** p
  return {
    // Vertex-average, not a true area centroid. Only used to place a marker
    // and to fly the map to a concession, never for analysis.
    lon: r(sumX / n, 5),
    lat: r(sumY / n, 5),
    bbox: [r(minX, 4), r(minY, 4), r(maxX, 4), r(maxY, 4)],
  }
}

function pick(source, keys) {
  const out = {}
  for (const key of keys) out[key] = source[key] ?? null
  return out
}

function slug(value) {
  return String(value ?? 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { src: join(homedir(), 'Downloads'), out: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--src') args.src = resolve(argv[++i])
    else if (argv[i] === '--out') args.out = resolve(argv[++i])
  }
  args.out ??= resolve(new URL('../public/data', import.meta.url).pathname)
  return args
}

const args = parseArgs(process.argv.slice(2))
const log = (...m) => console.log(...m)
const bytes = (n) => `${(n / 1e6).toFixed(2)} MB`

function writeJson(path, data) {
  const text = JSON.stringify(data)
  writeFileSync(path, text)
  return text.length
}

// ---------------------------------------------------------------------------
// Case clusters
// ---------------------------------------------------------------------------

function extractCase(file, outDir) {
  const path = join(args.src, file)
  if (!existsSync(path)) {
    log(`  ! skipped (not found): ${file}`)
    return null
  }

  const html = readFileSync(path, 'utf8')
  const found = {}
  for (const payload of foliumPayloads(html)) {
    const kind = classify(payload)
    if (kind !== 'unknown') found[kind] = payload
  }

  if (!found.villages || !found.concession) {
    log(`  ! skipped (missing layers): ${file}`)
    return null
  }

  const concessionFeature = found.concession.features[0]
  const caseId = concessionFeature.properties.CASE_ID
  const villages = found.villages.features

  // Screening payload: geometry + the fields the POCI table needs.
  const screening = {
    caseId,
    poCom: concessionFeature.properties.PO_COM,
    poGroup: concessionFeature.properties.PO_GROUP,
    province: concessionFeature.properties.PROVINCE,
    district: concessionFeature.properties.DISTRICT,
    concessionAreaHa: concessionFeature.properties.CONCESSION_AREA_HA,
    screeningEnvelopeKm: found.envelope?.features?.[0]?.properties?.SCREENING_KM ?? null,
    villageCount: villages.length,
    sourceFile: file,
    concession: {
      type: 'Feature',
      properties: concessionFeature.properties,
      geometry: {
        type: concessionFeature.geometry.type,
        coordinates: roundCoords(concessionFeature.geometry.coordinates, CASE_PRECISION),
      },
    },
    envelope: found.envelope
      ? {
          type: 'Feature',
          properties: found.envelope.features[0].properties,
          geometry: {
            type: found.envelope.features[0].geometry.type,
            coordinates: roundCoords(found.envelope.features[0].geometry.coordinates, CASE_PRECISION),
          },
        }
      : null,
    villages: {
      type: 'FeatureCollection',
      features: villages.map((f) => {
        const m = measure(f.geometry)
        return {
          type: 'Feature',
          properties: {
            ...pick(f.properties, VILLAGE_SCREENING_PROPS),
            // Cast to string: village codes are numeric in source but are
            // identifiers, and the app keys analyst input off them.
            VILLAGE_ID: String(f.properties.VILLAGE_ID),
            centroid: [m.lon, m.lat],
          },
          geometry: {
            type: f.geometry.type,
            coordinates: roundCoords(f.geometry.coordinates, CASE_PRECISION),
          },
        }
      }),
    },
  }

  // Sidecar: the full 175-field attribute table, keyed by village.
  const attrs = {}
  for (const f of villages) attrs[String(f.properties.VILLAGE_ID)] = f.properties

  const a = writeJson(join(outDir, `${caseId}.json`), screening)
  const b = writeJson(join(outDir, `${caseId}.attrs.json`), attrs)

  log(
    `  ${caseId}: ${villages.length} villages, ` +
      `${Math.round(screening.concessionAreaHa).toLocaleString()} ha ` +
      `(${bytes(a)} + ${bytes(b)} attrs)`,
  )

  return {
    caseId,
    poCom: screening.poCom,
    poGroup: screening.poGroup,
    province: screening.province,
    district: screening.district,
    concessionAreaHa: screening.concessionAreaHa,
    screeningEnvelopeKm: screening.screeningEnvelopeKm,
    villageCount: villages.length,
  }
}

// ---------------------------------------------------------------------------
// National concession layer
// ---------------------------------------------------------------------------

function extractNational(outDir) {
  const path = join(args.src, SOURCES.national)
  if (!existsSync(path)) {
    log(`  ! skipped (not found): ${SOURCES.national}`)
    return null
  }

  const html = readFileSync(path, 'utf8')
  let collection = null
  for (const payload of foliumPayloads(html)) {
    if (classify(payload) === 'national') {
      collection = payload
      break
    }
  }
  if (!collection) {
    log('  ! no national layer found')
    return null
  }

  const features = collection.features
  const geomDir = join(outDir, 'geom')
  mkdirSync(geomDir, { recursive: true })

  const index = []
  const byProvince = new Map()

  features.forEach((f, i) => {
    const m = measure(f.geometry)
    const province = f.properties.PROVINCE ?? 'Unknown'
    index.push({ i, ...pick(f.properties, CONCESSION_INDEX_PROPS), ...m })

    if (!byProvince.has(province)) byProvince.set(province, [])
    byProvince.get(province).push({
      type: 'Feature',
      // Only the index position: attributes live in index.json, so province
      // geometry files stay pure geometry and cache independently.
      properties: { i },
      geometry: {
        type: f.geometry.type,
        coordinates: roundCoords(f.geometry.coordinates, NATIONAL_PRECISION),
      },
    })
  })

  const provinces = [...byProvince.entries()]
    .map(([name, feats]) => {
      const file = `${slug(name)}.json`
      const size = writeJson(join(geomDir, file), { type: 'FeatureCollection', features: feats })
      return { name, slug: slug(name), file, count: feats.length, bytes: size }
    })
    .sort((a, b) => b.count - a.count)

  const indexSize = writeJson(join(outDir, 'index.json'), {
    total: features.length,
    totalHectares: features.reduce((s, f) => s + (f.properties.HECTARES || 0), 0),
    provinces: provinces.map(({ name, slug, file, count }) => ({ name, slug, file, count })),
    concessions: index,
  })

  const geomBytes = provinces.reduce((s, p) => s + p.bytes, 0)
  log(`  index: ${features.length.toLocaleString()} concessions (${bytes(indexSize)})`)
  log(`  geom:  ${provinces.length} province files (${bytes(geomBytes)} total)`)

  return { total: features.length, provinces: provinces.length }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

log(`Source: ${args.src}`)
log(`Output: ${args.out}\n`)

const casesDir = join(args.out, 'cases')
const concessionsDir = join(args.out, 'concessions')
mkdirSync(casesDir, { recursive: true })
mkdirSync(concessionsDir, { recursive: true })

log('Case clusters:')
const cases = SOURCES.cases.map((f) => extractCase(f, casesDir)).filter(Boolean)

// Manifest lets the app list available cases without probing for filenames.
writeJson(join(casesDir, 'index.json'), { cases })

log('\nNational concession layer:')
const national = extractNational(concessionsDir)

if (!national) {
  // Leave no half-written directory behind — the app treats a missing
  // concessions/index.json as "national layer not generated" and says so.
  rmSync(concessionsDir, { recursive: true, force: true })
}

log(`\nDone. ${cases.length} case cluster(s)${national ? `, ${national.total} concessions` : ''}.`)
