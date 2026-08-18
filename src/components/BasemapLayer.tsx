/**
 * Basemap for every map in the application.
 *
 * The default is CARTO's desaturated raster rather than standard OSM. OSM is
 * a general-purpose map: its roads, landuse and labels are fully saturated and
 * compete with the data drawn on top. CARTO's light and dark styles are built
 * as data-visualisation backdrops, so concession polygons and the POCI ramp
 * stay the most salient thing on screen.
 *
 * It also means dark mode gets a genuinely dark tileset instead of the
 * `filter: invert(1)` trick that used to sit in styles.css, which mangled
 * label legibility and turned water an odd colour.
 */

import { useEffect, useState } from 'react'
import { TileLayer } from 'react-leaflet'

export type Basemap = 'map' | 'satellite'

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
const ESRI_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'

/** Tracks the resolved theme, including "system" following the OS. */
function useIsDark(): boolean {
  const read = () => {
    const explicit = document.documentElement.getAttribute('data-theme')
    if (explicit === 'dark') return true
    if (explicit === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  const [isDark, setIsDark] = useState(read)

  useEffect(() => {
    const update = () => setIsDark(read())
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', update)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', update)
    }
  }, [])

  return isDark
}

export function BasemapLayer({ basemap }: { basemap: Basemap }) {
  const isDark = useIsDark()

  const { url, attribution } =
    basemap === 'satellite'
      ? {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: ESRI_ATTRIBUTION,
        }
      : {
          url: `https://{s}.basemaps.cartocdn.com/${isDark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}.png`,
          attribution: CARTO_ATTRIBUTION,
        }

  // react-leaflet does not swap an existing TileLayer's url when the prop
  // changes, so the layer is keyed on it to force a remount.
  return <TileLayer key={url} url={url} attribution={attribution} maxZoom={19} />
}

/** Basemap switch, placed over the map rather than inside the layers control. */
export function BasemapSwitch({
  basemap,
  setBasemap,
}: {
  basemap: Basemap
  setBasemap: (b: Basemap) => void
}) {
  const options: { value: Basemap; label: string }[] = [
    { value: 'map', label: 'Map' },
    { value: 'satellite', label: 'Satellite' },
  ]
  return (
    // Top right: Leaflet's own zoom control occupies the top left corner.
    <div
      className="absolute right-3 top-3 z-[1000] flex overflow-hidden rounded-md border shadow-sm"
      style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-1)' }}
    >
      {options.map((o) => {
        const active = basemap === o.value
        return (
          <button
            key={o.value}
            onClick={() => setBasemap(o.value)}
            aria-pressed={active}
            className="px-3 py-1.5 text-xs font-medium"
            style={{
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--accent-ink)' : 'var(--text-secondary)',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
