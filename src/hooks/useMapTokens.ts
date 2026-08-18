/**
 * Resolves design tokens to concrete colour strings for Leaflet.
 *
 * The maps run with `preferCanvas`, so Leaflet paints through the Canvas 2D
 * API. Canvas cannot resolve CSS custom properties: assigning
 * `ctx.fillStyle = 'var(--seq-400)'` is invalid and is silently ignored,
 * leaving whatever was set before. Passing `var(...)` into a Leaflet
 * PathOptions therefore produces black shapes, not the intended colour, and
 * nothing about it fails loudly.
 *
 * Everything drawn on a map has to come through here. Anything rendered as
 * ordinary DOM can keep using `var(...)` directly, where it works fine.
 */

import { useCallback, useEffect, useState } from 'react'

/** Every token any map layer draws with. */
export const MAP_TOKENS = [
  // Sequential ramp, the POCI magnitude encoding.
  '--seq-250',
  '--seq-400',
  '--seq-450',
  '--seq-500',
  '--seq-700',
  // Absent evidence. Achromatic on purpose and never a point on the ramp.
  '--na',
  // Map-specific layer colours.
  '--map-concession-line',
  '--map-concession-fill',
  '--map-envelope-line',
  '--map-envelope-fill',
  '--map-village-line',
  '--map-selected-line',
  '--map-selected-fill',
  // Shared chrome.
  '--accent',
  '--baseline',
] as const

export type MapToken = (typeof MAP_TOKENS)[number]
export type MapTokens = Record<MapToken, string>

function readTokens(): MapTokens {
  const style = getComputedStyle(document.documentElement)
  const out = {} as MapTokens
  for (const token of MAP_TOKENS) out[token] = style.getPropertyValue(token).trim()
  return out
}

/**
 * Current token values, re-read whenever the active theme changes.
 *
 * Theming here is three-way: an explicit `data-theme` attribute, or the OS
 * preference when that attribute is absent. Both need watching, since a media
 * query alone misses the toggle and an attribute observer alone misses the OS
 * switching underneath "system".
 */
export function useMapTokens(): MapTokens {
  const [tokens, setTokens] = useState<MapTokens>(readTokens)

  const refresh = useCallback(() => setTokens(readTokens()), [])

  useEffect(() => {
    const observer = new MutationObserver(refresh)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', refresh)

    // The first paint can land before the stylesheet has applied, which would
    // cache a set of empty strings.
    refresh()

    return () => {
      observer.disconnect()
      media.removeEventListener('change', refresh)
    }
  }, [refresh])

  return tokens
}

/**
 * A cache key that changes with the theme.
 *
 * Leaflet's GeoJSON layer caches the style it was built with, so a React
 * re-render alone will not repaint existing features. Feeding this into the
 * layer's `key` forces a rebuild when the palette changes.
 */
export function tokenSignature(tokens: MapTokens): string {
  return `${tokens['--seq-700']}|${tokens['--map-concession-fill']}`
}
