/**
 * Module 1 — Concession Explorer.
 *
 * Step 1 of the site-selection workflow: standardise the concession polygon
 * and choose an operational-area case cluster. The national layer is 12,259
 * concessions, so the index (attributes + centroid) drives search and the
 * per-province geometry is fetched only when a province is opened.
 */

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import { loadConcessionIndex, loadProvinceGeometry, MissingDataError } from '@/data/load'
import type { CaseSummary, ConcessionIndex, ConcessionRecord } from '@/data/types'
import { STRINGS } from '@/i18n/strings'
import { useT } from '@/i18n/useLocale'
import { Panel, Button, TextInput, Select, Empty, MethodNote, StatTile, Badge } from '@/components/ui'

function FlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.8 })
  }, [center, zoom, map])
  return null
}

const unique = (values: (string | null)[]) =>
  [...new Set(values.filter((v): v is string => !!v))].sort()

export function ConcessionExplorer({
  cases,
  onOpenCase,
}: {
  cases: CaseSummary[]
  onOpenCase: (caseId: string) => void
}) {
  const { locale, tr } = useT()
  const [index, setIndex] = useState<ConcessionIndex | null>(null)
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [province, setProvince] = useState<string>('')
  const [group, setGroup] = useState<string>('')
  const [legal, setLegal] = useState<string>('')
  const [selected, setSelected] = useState<ConcessionRecord | null>(null)
  const [geometry, setGeometry] = useState<GeoJSON.FeatureCollection | null>(null)
  const [geometryLoading, setGeometryLoading] = useState(false)

  useEffect(() => {
    loadConcessionIndex()
      .then(setIndex)
      .catch((e) => {
        if (e instanceof MissingDataError) setMissing(true)
      })
      .finally(() => setLoading(false))
  }, [])

  // Province geometry is ~1.5 MB per file; fetch on demand only.
  useEffect(() => {
    if (!province || !index) {
      setGeometry(null)
      return
    }
    const meta = index.provinces.find((p) => p.name === province)
    if (!meta) return
    let cancelled = false
    setGeometryLoading(true)
    loadProvinceGeometry(meta.slug)
      .then((g) => !cancelled && setGeometry(g))
      .catch(() => !cancelled && setGeometry(null))
      .finally(() => !cancelled && setGeometryLoading(false))
    return () => {
      cancelled = true
    }
  }, [province, index])

  const provinces = useMemo(() => index?.provinces.map((p) => p.name) ?? [], [index])
  const groups = useMemo(() => unique(index?.concessions.map((c) => c.PO_GROUP) ?? []), [index])
  const legals = useMemo(() => unique(index?.concessions.map((c) => c.LEGAL_STAT) ?? []), [index])

  const filtered = useMemo(() => {
    if (!index) return []
    const q = query.trim().toLowerCase()
    return index.concessions.filter((c) => {
      if (province && c.PROVINCE !== province) return false
      if (group && c.PO_GROUP !== group) return false
      if (legal && c.LEGAL_STAT !== legal) return false
      if (q) {
        const haystack = `${c.PO_COM ?? ''} ${c.PO_GROUP ?? ''} ${c.DISTRICT ?? ''} ${c.PROVINCE ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [index, query, province, group, legal])

  // A case cluster exists when the extractor produced a candidate-village
  // layer for that concession. Matched on operator name, which is what the
  // village layers carry as SELECTED_PO_COM.
  const caseForConcession = (c: ConcessionRecord | null): CaseSummary | undefined => {
    if (!c?.PO_COM) return undefined
    return cases.find(
      (k) => k.poCom.toLowerCase().trim() === c.PO_COM!.toLowerCase().trim(),
    )
  }

  const filteredHectares = useMemo(
    () => filtered.reduce((s, c) => s + (c.HECTARES ?? 0), 0),
    [filtered],
  )

  // Cap markers: 12,259 CircleMarkers would stall the map. Filtering down is
  // the intended workflow, so the cap doubles as a nudge to narrow the search.
  const MARKER_CAP = 600
  const markers = filtered.slice(0, MARKER_CAP)

  if (loading) {
    return <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>{tr(STRINGS.common.loading)}</div>
  }

  return (
    <div className="space-y-4 p-4">
      <Panel title={tr(STRINGS.concessions.title)} subtitle={tr(STRINGS.concessions.intro)}>
        {missing ? (
          <Empty>
            <p className="mb-2">{tr(STRINGS.concessions.missingData)}</p>
            <code className="rounded px-2 py-1 text-xs" style={{ background: 'var(--surface-sunken)' }}>
              npm run extract
            </code>
          </Empty>
        ) : (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label={locale === 'id' ? 'Konsesi' : 'Concessions'}
                value={filtered.length.toLocaleString()}
                hint={`${tr(STRINGS.common.of)} ${index?.total.toLocaleString()}`}
              />
              <StatTile
                label={locale === 'id' ? 'Total luas' : 'Total area'}
                value={`${Math.round(filteredHectares / 1000).toLocaleString()}k`}
                hint="hectares"
              />
              <StatTile
                label={locale === 'id' ? 'Provinsi' : 'Provinces'}
                value={provinces.length}
              />
              <StatTile
                label={locale === 'id' ? 'Case cluster siap' : 'Case clusters ready'}
                value={cases.length}
                hint={locale === 'id' ? 'dengan layer desa' : 'with village layers'}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <TextInput
                value={query}
                onChange={setQuery}
                placeholder={locale === 'id' ? 'Cari perusahaan / kabupaten…' : 'Search operator / district…'}
              />
              <Select
                value={province}
                onChange={(v) => setProvince(v)}
                options={provinces.map((p) => ({ value: p, label: p }))}
                placeholder={`${tr(STRINGS.common.all)} — ${tr(STRINGS.concessions.province)}`}
              />
              <Select
                value={group}
                onChange={(v) => setGroup(v)}
                options={groups.map((g) => ({ value: g, label: g }))}
                placeholder={`${tr(STRINGS.common.all)} — ${tr(STRINGS.concessions.group)}`}
              />
              <Select
                value={legal}
                onChange={(v) => setLegal(v)}
                options={legals.map((l) => ({ value: l, label: l }))}
                placeholder={`${tr(STRINGS.common.all)} — ${tr(STRINGS.concessions.legalStatus)}`}
              />
            </div>
          </>
        )}
      </Panel>

      {!missing && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Panel
            className="overflow-hidden"
            title={locale === 'id' ? 'Peta konsesi' : 'Concession map'}
            subtitle={
              province
                ? geometryLoading
                  ? tr(STRINGS.common.loading)
                  : `${province} — ${geometry?.features.length.toLocaleString() ?? 0} polygons`
                : locale === 'id'
                  ? 'Pilih provinsi untuk memuat geometri polygon.'
                  : 'Select a province to load polygon geometry.'
            }
          >
            <div className="h-[26rem] overflow-hidden rounded" style={{ border: '1px solid var(--border)' }}>
              <MapContainer style={{ height: '100%', width: '100%' }} center={[-1.5, 113]} zoom={5} preferCanvas>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyTo center={selected ? [selected.lat, selected.lon] : null} zoom={11} />

                {geometry && (
                  <GeoJSON
                    key={province}
                    data={geometry}
                    style={{
                      color: 'var(--seq-500)',
                      weight: 0.6,
                      fillColor: 'var(--seq-400)',
                      fillOpacity: 0.35,
                    }}
                  />
                )}

                {markers.map((c) => (
                  <CircleMarker
                    key={c.i}
                    center={[c.lat, c.lon]}
                    radius={selected?.i === c.i ? 7 : 4}
                    pathOptions={{
                      color: selected?.i === c.i ? 'var(--accent)' : 'var(--status-critical)',
                      weight: selected?.i === c.i ? 2.5 : 1,
                      fillColor: selected?.i === c.i ? 'var(--accent)' : 'var(--status-critical)',
                      fillOpacity: 0.75,
                    }}
                    eventHandlers={{ click: () => setSelected(c) }}
                  >
                    <Tooltip sticky>
                      <strong>{c.PO_COM}</strong>
                      <br />
                      {c.DISTRICT}, {c.PROVINCE}
                      <br />
                      {c.HECTARES?.toLocaleString(undefined, { maximumFractionDigits: 0 })} ha
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            {filtered.length > MARKER_CAP && (
              <p className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {locale === 'id'
                  ? `Menampilkan ${MARKER_CAP} dari ${filtered.length.toLocaleString()} penanda. Persempit filter untuk melihat sisanya.`
                  : `Showing ${MARKER_CAP} of ${filtered.length.toLocaleString()} markers. Narrow the filters to see the rest.`}
              </p>
            )}
          </Panel>

          <div className="space-y-4">
            {selected ? (
              <Panel title={selected.PO_COM ?? '—'} subtitle={`${selected.DISTRICT}, ${selected.PROVINCE}`}>
                <dl className="space-y-1.5 text-xs">
                  {[
                    [tr(STRINGS.concessions.group), selected.PO_GROUP],
                    [
                      tr(STRINGS.concessions.area),
                      selected.HECTARES
                        ? `${selected.HECTARES.toLocaleString(undefined, { maximumFractionDigits: 0 })} ha`
                        : null,
                    ],
                    [tr(STRINGS.concessions.legalStatus), selected.LEGAL_STAT],
                    [tr(STRINGS.concessions.commodity), selected.commodity],
                    ['Source', selected.SOURCES],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex gap-2">
                      <dt className="w-24 shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {label}
                      </dt>
                      <dd className="min-w-0 flex-1">{value ?? '—'}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4">
                  {(() => {
                    const match = caseForConcession(selected)
                    if (!match) {
                      return (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {tr(STRINGS.concessions.noCaseCluster)}
                        </p>
                      )
                    }
                    return (
                      <div className="space-y-2">
                        <Badge tone="good">
                          {match.villageCount} {tr(STRINGS.common.villages)} ·{' '}
                          {match.screeningEnvelopeKm} km envelope
                        </Badge>
                        <Button variant="primary" onClick={() => onOpenCase(match.caseId)}>
                          {tr(STRINGS.concessions.openCase)} →
                        </Button>
                      </div>
                    )
                  })()}
                </div>
              </Panel>
            ) : (
              <Panel title={locale === 'id' ? 'Detail konsesi' : 'Concession detail'}>
                <Empty>
                  {locale === 'id'
                    ? 'Pilih konsesi pada peta atau daftar.'
                    : 'Select a concession on the map or in the list.'}
                </Empty>
              </Panel>
            )}

            <Panel title={locale === 'id' ? 'Case cluster tersedia' : 'Available case clusters'}>
              {cases.length === 0 ? (
                <Empty>{locale === 'id' ? 'Tidak ada case cluster.' : 'No case clusters.'}</Empty>
              ) : (
                <ul className="space-y-2">
                  {cases.map((c) => (
                    <li key={c.caseId}>
                      <button
                        onClick={() => onOpenCase(c.caseId)}
                        className="w-full rounded border px-3 py-2 text-left text-xs hover:opacity-80"
                        style={{ borderColor: 'var(--border-strong)' }}
                      >
                        <div className="font-medium">{c.poCom}</div>
                        <div className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {c.district}, {c.province} ·{' '}
                          {Math.round(c.concessionAreaHa).toLocaleString()} ha · {c.villageCount}{' '}
                          {tr(STRINGS.common.villages)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <MethodNote>
              {locale === 'id'
                ? 'Radius 25–30 km hanya screening envelope awal untuk menginventarisasi desa kandidat, bukan batas final pengaruh. Desa di luar envelope tetap dapat dimasukkan bila data pekerja, pemasok, atau koperasi menunjukkan linkage kuat.'
                : 'A 25–30 km radius is only an initial screening envelope for inventorying candidate villages, not a final boundary of influence. Villages outside it may still be included where worker, supplier or cooperative records show strong linkage.'}
            </MethodNote>
          </div>
        </div>
      )}
    </div>
  )
}
