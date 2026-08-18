/**
 * Case-cluster map: concession, screening envelope and candidate villages.
 *
 * Three layers, three meanings, three hues. Green is the concession, the
 * source of influence. Gold is the screening envelope, a search radius rather
 * than a boundary of influence. The blue sequential ramp is POCI, the only
 * quantity on the map.
 *
 * Villages with no score are drawn achromatic, never as a low value on the
 * ramp. That is the same "NA is not zero" rule the scoring engine enforces,
 * carried into the map so an unevidenced village cannot be mistaken for a
 * low-exposure one.
 *
 * Every colour here is resolved through useMapTokens. Leaflet paints to
 * canvas, which cannot read CSS custom properties: passing `var(...)` into
 * PathOptions silently paints black.
 */

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression, PathOptions } from 'leaflet'
import type { CaseCluster } from '@/data/types'
import type { ScreenedVillage } from '@/hooks/useCaseData'
import { useMapTokens, tokenSignature, type MapTokens } from '@/hooks/useMapTokens'
import { BasemapLayer, BasemapSwitch, type Basemap } from './BasemapLayer'
import { magnitudeTokenName } from './ui'

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
  const tokens = useMapTokens()
  const [basemap, setBasemap] = useState<Basemap>('map')

  const bounds = useMemo(
    () => boundsOf(caseData.envelope?.geometry ?? caseData.concession.geometry),
    [caseData],
  )

  const scoreById = useMemo(() => new Map(villages.map((v) => [v.villageId, v])), [villages])

  // Leaflet caches the style a GeoJSON layer was built with, so the key has to
  // change when scores, selection or the palette change or nothing repaints.
  const villageKey = useMemo(
    () =>
      `${selectedId ?? ''}|${tokenSignature(tokens)}|${villages
        .map((v) => `${v.villageId}:${v.poci.score ?? 'x'}`)
        .join(',')}`,
    [villages, selectedId, tokens],
  )

  const villageStyle = (villageId: string): PathOptions => {
    const village = scoreById.get(villageId)
    const score = village?.poci.score ?? null
    const isSelected = selectedId === villageId
    const inPortfolio = village?.screening?.selected ?? false

    return {
      color: isSelected ? tokens['--map-selected-line'] : tokens['--map-village-line'],
      weight: isSelected ? 2.5 : inPortfolio ? 1.6 : 0.6,
      dashArray: inPortfolio && !isSelected ? '4 2' : undefined,
      fillColor: score === null ? tokens['--na'] : tokens[magnitudeTokenName(score)],
      // Unscored villages sit back rather than reading as a low value.
      fillOpacity: score === null ? 0.1 : 0.62,
    }
  }

  return (
    <div className="relative h-full w-full">
      <BasemapSwitch basemap={basemap} setBasemap={setBasemap} />
      <MapContainer
        style={{ height, width: '100%' }}
        center={[0, 110]}
        zoom={9}
        scrollWheelZoom
        preferCanvas
      >
        <FitBounds bounds={bounds} />
        <BasemapLayer basemap={basemap} />

        {caseData.envelope && (
          <GeoJSON
            key={`envelope|${tokenSignature(tokens)}`}
            data={caseData.envelope as unknown as GeoJSON.GeoJsonObject}
            style={{
              color: tokens['--map-envelope-line'],
              weight: 2,
              dashArray: '7 5',
              fillColor: tokens['--map-envelope-fill'],
              fillOpacity: 0.1,
            }}
          />
        )}

        <GeoJSON
          key={`concession|${tokenSignature(tokens)}`}
          data={caseData.concession as unknown as GeoJSON.GeoJsonObject}
          style={{
            color: tokens['--map-concession-line'],
            weight: 1.2,
            fillColor: tokens['--map-concession-fill'],
            fillOpacity: 0.42,
          }}
        />

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
              { sticky: true },
            )
            if (onSelect) layer.on('click', () => onSelect(p.VILLAGE_ID as string))
          }}
        />
      </MapContainer>

      <MapLegend tokens={tokens} envelopeKm={caseData.screeningEnvelopeKm ?? undefined} />
    </div>
  )
}

function Swatch({ style }: { style: React.CSSProperties }) {
  return <span className="h-2.5 w-3.5 shrink-0 rounded-[2px]" style={style} />
}

/**
 * Legend, overlaid on the map rather than sitting beneath it so the encoding
 * is readable without looking away from the thing it explains.
 */
function MapLegend({ tokens, envelopeKm }: { tokens: MapTokens; envelopeKm?: number }) {
  const stops: { label: string; token: keyof MapTokens }[] = [
    { label: '0-19', token: '--seq-250' },
    { label: '20-39', token: '--seq-400' },
    { label: '40-59', token: '--seq-450' },
    { label: '60-79', token: '--seq-500' },
    { label: '80-100', token: '--seq-700' },
  ]

  return (
    <div
      className="absolute bottom-6 left-3 z-[1000] rounded-md border px-3 py-2.5 text-[11px] shadow-sm"
      style={{
        background: 'color-mix(in srgb, var(--surface-1) 92%, transparent)',
        borderColor: 'var(--border-strong)',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
        POCI
      </div>
      <div className="mb-2 flex items-center gap-1">
        {stops.map((s) => (
          <span key={s.label} className="flex flex-col items-center gap-1">
            <Swatch style={{ background: tokens[s.token] }} />
            <span className="tnum text-[10px]">{s.label}</span>
          </span>
        ))}
      </div>
      <div className="space-y-1 border-t pt-1.5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5">
          <Swatch
            style={{
              background: 'repeating-linear-gradient(135deg, var(--na) 0 2px, transparent 2px 4px)',
              border: '1px solid var(--na)',
            }}
          />
          NA, not evidenced
        </div>
        <div className="flex items-center gap-1.5">
          <Swatch
            style={{
              background: tokens['--map-concession-fill'],
              border: `1px solid ${tokens['--map-concession-line']}`,
            }}
          />
          Concession
        </div>
        <div className="flex items-center gap-1.5">
          <Swatch
            style={{
              background: 'transparent',
              border: `1px dashed ${tokens['--map-envelope-line']}`,
            }}
          />
          Screening envelope{envelopeKm ? ` (${envelopeKm} km)` : ''}
        </div>
      </div>
    </div>
  )
}
