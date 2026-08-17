/**
 * Case-cluster map: concession, screening envelope and candidate villages.
 *
 * Village fill encodes POCI on the sequential ramp, with an achromatic hatch
 * for communities that have no score yet — the same "NA is not zero" rule the
 * scoring engine enforces, carried into the map so an unevidenced village
 * never looks like a low-exposure one.
 */

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap, LayersControl } from 'react-leaflet'
import type { LatLngBoundsExpression, PathOptions } from 'leaflet'
import type { CaseCluster } from '@/data/types'
import type { ScreenedVillage } from '@/hooks/useCaseData'
import { magnitudeColor } from './ui'

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [24, 24] })
  }, [bounds, map])
  return null
}

function boundsOf(geometry: { coordinates: unknown }): LatLngBoundsExpression | null {
  let minLat = Infinity
  let minLon = Infinity
  let maxLat = -Infinity
  let maxLon = -Infinity

  const walk = (c: unknown): void => {
    if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') {
      const [lon, lat] = c as [number, number]
      if (lat < minLat) minLat = lat
      if (lon < minLon) minLon = lon
      if (lat > maxLat) maxLat = lat
      if (lon > maxLon) maxLon = lon
      return
    }
    if (Array.isArray(c)) c.forEach(walk)
  }
  walk(geometry.coordinates)

  if (minLat === Infinity) return null
  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ]
}

export function CaseMap({
  caseData,
  villages,
  selectedId,
  onSelect,
  height = '100%',
}: {
  caseData: CaseCluster
  villages: ScreenedVillage[]
  selectedId?: string | null
  onSelect?: (villageId: string) => void
  height?: string
}) {
  const bounds = useMemo(
    () => boundsOf(caseData.envelope?.geometry ?? caseData.concession.geometry),
    [caseData],
  )

  const scoreById = useMemo(
    () => new Map(villages.map((v) => [v.villageId, v])),
    [villages],
  )

  // Re-render the village layer when scores or selection change. Leaflet's
  // GeoJSON layer caches styles, so the key forces a rebuild.
  const villageKey = useMemo(
    () =>
      `${selectedId ?? ''}|${villages.map((v) => `${v.villageId}:${v.poci.score ?? 'x'}`).join(',')}`,
    [villages, selectedId],
  )

  const villageStyle = (villageId: string): PathOptions => {
    const village = scoreById.get(villageId)
    const score = village?.poci.score ?? null
    const isSelected = selectedId === villageId
    const inPortfolio = village?.screening?.selected ?? false

    return {
      color: isSelected ? 'var(--accent)' : 'var(--baseline)',
      weight: isSelected ? 2.5 : inPortfolio ? 2 : 0.7,
      dashArray: inPortfolio && !isSelected ? '4 2' : undefined,
      fillColor: score === null ? 'var(--na)' : magnitudeColor(score),
      fillOpacity: score === null ? 0.12 : 0.62,
    }
  }

  return (
    <MapContainer
      style={{ height, width: '100%' }}
      center={[0, 110]}
      zoom={9}
      scrollWheelZoom
      preferCanvas
    >
      <FitBounds bounds={bounds} />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked name="Candidate villages">
          <GeoJSON
            key={villageKey}
            data={caseData.villages as unknown as GeoJSON.GeoJsonObject}
            style={(feature) => villageStyle(feature?.properties?.VILLAGE_ID as string)}
            onEachFeature={(feature, layer) => {
              const p = feature.properties
              const village = scoreById.get(p.VILLAGE_ID)
              const poci = village?.poci
              layer.bindTooltip(
                `<strong>${p.VILLAGE_NAME}</strong><br/>` +
                  `${p.SUBDISTRICT_NAME}, ${p.DISTRICT_NAME}<br/>` +
                  `${p.DIST_TO_CONCESSION_KM.toFixed(1)} km · pop ${p.POPULATION.toLocaleString()}<br/>` +
                  `POCI: ${poci?.score ?? 'NA'}` +
                  (poci ? ` <span style="opacity:.7">(${Math.round(poci.coverage * 100)}% coverage)</span>` : ''),
                { sticky: true, className: 'foliumtooltip' },
              )
              if (onSelect) layer.on('click', () => onSelect(p.VILLAGE_ID as string))
            }}
          />
        </LayersControl.Overlay>

        {caseData.envelope && (
          <LayersControl.Overlay checked name={`Screening envelope (${caseData.screeningEnvelopeKm} km)`}>
            <GeoJSON
              data={caseData.envelope as unknown as GeoJSON.GeoJsonObject}
              style={{
                color: 'var(--text-muted)',
                weight: 1.5,
                dashArray: '6 4',
                fill: false,
              }}
            />
          </LayersControl.Overlay>
        )}

        <LayersControl.Overlay checked name="Concession">
          <GeoJSON
            data={caseData.concession as unknown as GeoJSON.GeoJsonObject}
            style={{
              color: 'var(--status-critical)',
              weight: 2,
              fillColor: 'var(--status-critical)',
              fillOpacity: 0.12,
            }}
          />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  )
}

/** Legend for the map's fill encoding, including the NA hatch. */
export function MapLegend() {
  const stops = [
    { label: '80–100', color: 'var(--seq-700)' },
    { label: '60–79', color: 'var(--seq-500)' },
    { label: '40–59', color: 'var(--seq-450)' },
    { label: '20–39', color: 'var(--seq-400)' },
    { label: '0–19', color: 'var(--seq-250)' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
      <span className="font-medium">POCI</span>
      {stops.map((s) => (
        <span key={s.label} className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
      <span className="flex items-center gap-1">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{
            background: 'repeating-linear-gradient(135deg, var(--na) 0 2px, transparent 2px 4px)',
            border: '1px solid var(--na)',
          }}
        />
        NA — not evidenced
      </span>
    </div>
  )
}
