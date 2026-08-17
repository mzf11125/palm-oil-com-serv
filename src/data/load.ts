/**
 * Data loading. Everything is fetched lazily and cached in-module.
 *
 * The national concession index is 4 MB and the per-province geometry files
 * total ~40 MB, so none of it belongs in the main bundle. `npm run extract`
 * may not have been run at all, which is a normal state rather than an error:
 * the two case clusters are committed, the national layer is not.
 */

import type {
  CaseCluster,
  CaseIndex,
  ConcessionIndex,
  VillageAttributes,
} from './types'

const BASE = `${import.meta.env.BASE_URL}data`

class MissingDataError extends Error {
  constructor(public readonly resource: string) {
    super(`Data not generated: ${resource}. Run \`npm run extract\` to build it from the source maps.`)
    this.name = 'MissingDataError'
  }
}

async function getJson<T>(path: string, resource: string): Promise<T> {
  const response = await fetch(`${BASE}/${path}`)
  if (response.status === 404) throw new MissingDataError(resource)
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`)
  return (await response.json()) as T
}

/** Simple promise cache: a second request reuses the first flight. */
function memoize<A extends unknown[], T>(fn: (...args: A) => Promise<T>) {
  const cache = new Map<string, Promise<T>>()
  return (...args: A): Promise<T> => {
    const key = JSON.stringify(args)
    let hit = cache.get(key)
    if (!hit) {
      hit = fn(...args).catch((err) => {
        // Don't cache failures; a retry after `npm run extract` should work.
        cache.delete(key)
        throw err
      })
      cache.set(key, hit)
    }
    return hit
  }
}

export const loadCaseIndex = memoize(() => getJson<CaseIndex>('cases/index.json', 'case clusters'))

export const loadCase = memoize((caseId: string) =>
  getJson<CaseCluster>(`cases/${caseId}.json`, `case cluster ${caseId}`),
)

export const loadCaseAttributes = memoize((caseId: string) =>
  getJson<VillageAttributes>(`cases/${caseId}.attrs.json`, `attributes for ${caseId}`),
)

export const loadConcessionIndex = memoize(() =>
  getJson<ConcessionIndex>('concessions/index.json', 'national concession index'),
)

export const loadProvinceGeometry = memoize((slug: string) =>
  getJson<GeoJSON.FeatureCollection>(`concessions/geom/${slug}.json`, `geometry for ${slug}`),
)

export { MissingDataError }
