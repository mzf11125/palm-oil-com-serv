/**
 * Module 2 — POCI Screening.
 *
 * The candidate community universe, with P seeded from source data and
 * N/E/F/L entered by the analyst against the design document's rubric. Every
 * score requires an evidence note: the method's central claim is that a
 * linkage must be traceable, and a bare number is not evidence.
 */

import { useMemo, useState } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useCase, useSeedScreening, useScreenedVillages, type ScreenedVillage } from '@/hooks/useCaseData'
import { useProjectStore } from '@/store/project'
import { CaseMap, MapLegend } from '@/components/CaseMap'
import {
  Panel,
  Empty,
  MethodNote,
  Score,
  ScoreBar,
  CoverageMeter,
  ConfidenceBadge,
  Badge,
  Button,
  TextInput,
  TextArea,
  Select,
  Field,
  StatTile,
  Checkbox,
  BAND_COLOR,
} from '@/components/ui'
import { POCI_COMPONENT_DEFINITIONS, EVIDENCE_TIER_DEFINITIONS } from '@/reference/framework'
import { TYPOLOGY_DEFINITIONS } from '@/domain/typology'
import { proximityScore, networkScore } from '@/domain/poci'
import { CONFIDENCE_GRADES, EVIDENCE_TIERS, POCI_COMPONENTS, TYPOLOGIES } from '@/domain/types'
import type { ConfidenceGrade, EvidenceTier, PociComponent, Typology } from '@/domain/types'
import { SOURCES } from '@/reference/sources'

type SortKey = 'poci' | 'name' | 'distance' | 'population' | 'coverage'

export function PociScreening({ caseId }: { caseId: string | null }) {
  const { data: caseData, loading, error } = useCase(caseId)
  useSeedScreening(caseData)
  const villages = useScreenedVillages(caseData)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('poci')
  const [onlyScored, setOnlyScored] = useState(false)
  const [onlySelected, setOnlySelected] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = villages.filter((v) => {
      if (onlySelected && !v.screening?.selected) return false
      if (onlyScored && v.poci.coverage <= 0.15) return false
      if (q) {
        const p = v.feature.properties
        const hay = `${p.VILLAGE_NAME} ${p.SUBDISTRICT_NAME} ${p.DISTRICT_NAME}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    return [...list].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'distance':
          return a.feature.properties.DIST_TO_CONCESSION_KM - b.feature.properties.DIST_TO_CONCESSION_KM
        case 'population':
          return b.feature.properties.POPULATION - a.feature.properties.POPULATION
        case 'coverage':
          return b.poci.coverage - a.poci.coverage
        case 'poci':
        default:
          // Unscored villages sort last rather than as zero.
          if (a.poci.score === null && b.poci.score === null) return 0
          if (a.poci.score === null) return 1
          if (b.poci.score === null) return -1
          return b.poci.score - a.poci.score
      }
    })
  }, [villages, query, sort, onlyScored, onlySelected])

  const selected = villages.find((v) => v.villageId === selectedId) ?? null

  const stats = useMemo(() => {
    const evidencedBeyondProximity = villages.filter((v) => v.poci.coverage > 0.15).length
    const selectedCount = villages.filter((v) => v.screening?.selected).length
    const bands = { high: 0, moderate: 0, unbanded: 0, low: 0 }
    for (const v of villages) if (v.poci.band) bands[v.poci.band]++
    return { evidencedBeyondProximity, selectedCount, bands }
  }, [villages])

  if (!caseId) return <Empty>{'Select a case cluster.'}</Empty>
  if (loading) return <div className="page p-6 text-sm" style={{ color: 'var(--text-muted)' }}>{STRINGS.common.loading}</div>
  if (error || !caseData) {
    return (
      <div className="page p-4 md:p-6">
        <Empty>
          {error?.message ?? 'Case data unavailable.'}
        </Empty>
      </div>
    )
  }

  return (
    <div className="page space-y-4 p-4 md:p-6">
      <Panel
        title={`${STRINGS.screening.title} · ${caseData.poCom}`}
        subtitle={`${caseData.district}, ${caseData.province} · ${Math.round(caseData.concessionAreaHa).toLocaleString()} ha · ${caseData.villageCount} ${STRINGS.common.villages} · ${caseData.screeningEnvelopeKm} km envelope`}
      >
        <div className="space-y-3">
          <MethodNote>{STRINGS.screening.intro}</MethodNote>
          <MethodNote tone="warning">{STRINGS.screening.missingDataRule}</MethodNote>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <StatTile
              label={'Candidate villages'}
              value={villages.length}
            />
            <StatTile
              label={'Evidenced beyond P'}
              value={stats.evidencedBeyondProximity}
              hint={`${villages.length - stats.evidencedBeyondProximity} ${'proximity only'}`}
            />
            <StatTile
              label={'High exposure'}
              value={stats.bands.high}
              hint={`${stats.bands.moderate} moderate · ${stats.bands.low} low`}
            />
            <StatTile
              label={STRINGS.common.selected}
              value={stats.selectedCount}
            />
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <Panel
            className="overflow-hidden"
            title={'Candidate community map'}
          >
            <div className="h-[24rem] overflow-hidden rounded" style={{ border: '1px solid var(--border)' }}>
              <CaseMap
                caseData={caseData}
                villages={villages}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
            <div className="mt-2">
              <MapLegend />
            </div>
          </Panel>

          <Panel
            title={'Screening table'}
            subtitle={`${STRINGS.common.showing} ${filtered.length} ${STRINGS.common.of} ${villages.length}`}
            actions={
              <div className="flex items-center gap-2">
                <div className="w-40">
                  <TextInput value={query} onChange={setQuery} placeholder={STRINGS.common.search} />
                </div>
                <div className="w-32">
                  <Select
                    value={sort}
                    onChange={(v) => setSort((v || 'poci') as SortKey)}
                    options={[
                      { value: 'poci', label: 'POCI' },
                      { value: 'name', label: 'Name' },
                      { value: 'distance', label: 'Distance' },
                      { value: 'population', label: 'Population' },
                      { value: 'coverage', label: 'Coverage' },
                    ]}
                  />
                </div>
              </div>
            }
          >
            <div className="mb-2 flex flex-wrap gap-4">
              <Checkbox
                checked={onlyScored}
                onChange={setOnlyScored}
                label={'Only evidenced beyond P'}
              />
              <Checkbox
                checked={onlySelected}
                onChange={setOnlySelected}
                label={'Only portfolio'}
              />
            </div>

            <div className="table-scroll max-h-[30rem] overflow-y-auto thin-scroll">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-1)' }}>
                  <tr style={{ color: 'var(--text-muted)' }}>
                    <th className="px-3 py-2.5 text-left font-medium">{STRINGS.common.village}</th>
                    <th className="px-3 py-2.5 text-right font-medium">km</th>
                    <th className="px-3 py-2.5 text-right font-medium">{STRINGS.common.population}</th>
                    {POCI_COMPONENTS.map((c) => (
                      <th key={c} className="px-3 py-2.5 text-right font-medium" title={c}>
                        {c}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-right font-medium">POCI</th>
                    <th className="px-3 py-2.5 text-left font-medium">{STRINGS.common.coverage}</th>
                    <th className="px-3 py-2.5 text-center font-medium">C</th>
                    <th className="px-3 py-2.5 text-left font-medium">{STRINGS.common.typology}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => {
                    const p = v.feature.properties
                    const isActive = v.villageId === selectedId
                    return (
                      <tr
                        key={v.villageId}
                        onClick={() => setSelectedId(v.villageId)}
                        className="cursor-pointer border-t"
                        style={{
                          borderColor: 'var(--gridline)',
                          background: isActive ? 'var(--accent-soft)' : undefined,
                        }}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {v.screening?.selected && (
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ background: v.screening.isComparator ? 'var(--status-warning)' : 'var(--accent)' }}
                                title={v.screening.isComparator ? 'Comparator' : 'Portfolio'}
                              />
                            )}
                            <span className="font-medium">{p.VILLAGE_NAME}</span>
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {p.SUBDISTRICT_NAME}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right tnum">{p.DIST_TO_CONCESSION_KM.toFixed(1)}</td>
                        <td className="px-3 py-2 text-right tnum">{p.POPULATION.toLocaleString()}</td>
                        {POCI_COMPONENTS.map((c) => {
                          const value = v.screening?.components[c].value ?? null
                          return (
                            <td
                              key={c}
                              className="px-3 py-2 text-right tnum"
                              style={{ color: value === null ? 'var(--na)' : undefined }}
                            >
                              {value === null ? 'NA' : value}
                            </td>
                          )
                        })}
                        <td className="px-3 py-2 text-right">
                          <span
                            className="font-semibold tnum"
                            style={{ color: v.poci.band ? BAND_COLOR[v.poci.band] : 'var(--na)' }}
                          >
                            {v.poci.score ?? 'NA'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <CoverageMeter coverage={v.poci.coverage} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <ConfidenceBadge grade={v.confidence} overridden={v.confidenceOverridden} />
                        </td>
                        <td className="px-3 py-2">
                          {v.typology ? (
                            <Badge tone="accent" title={TYPOLOGY_DEFINITIONS[v.typology].label}>
                              {v.typology}
                            </Badge>
                          ) : v.suggestion.code ? (
                            <Badge tone="muted" title={v.suggestion.rationale}>
                              {v.suggestion.code}?
                            </Badge>
                          ) : (
                            <span style={{ color: 'var(--na)' }}>·</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="min-w-0">
          {selected ? (
            <VillageScoringPanel caseId={caseId} village={selected} />
          ) : (
            <Panel title={STRINGS.screening.componentEntry}>
              <Empty>
                {'Select a village on the map or table to score its components.'}
              </Empty>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scoring panel
// ---------------------------------------------------------------------------

function VillageScoringPanel({ caseId, village }: { caseId: string; village: ScreenedVillage }) {
  const setPociComponent = useProjectStore((s) => s.setPociComponent)
  const setTypology = useProjectStore((s) => s.setTypology)
  const updateScreening = useProjectStore((s) => s.updateScreening)

  const p = village.feature.properties
  const screening = village.screening

  return (
    <div className="space-y-4">
      <Panel
        title={p.VILLAGE_NAME}
        subtitle={`${p.SUBDISTRICT_NAME}, ${p.DISTRICT_NAME}, ${p.PROVINSI}`}
      >
        <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
          {[
            [STRINGS.common.distance, `${p.DIST_TO_CONCESSION_KM.toFixed(1)} km`],
            [STRINGS.common.population, p.POPULATION.toLocaleString()],
            [STRINGS.common.households, p.HOUSEHOLDS.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {label}
              </div>
              <div className="mt-0.5 font-medium tnum">{value}</div>
            </div>
          ))}
        </div>

        <div
          className="flex items-baseline justify-between rounded px-3 py-2"
          style={{ background: 'var(--surface-sunken)' }}
        >
          <div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {STRINGS.screening.provisional}
            </div>
            <Score value={village.poci.score} size="lg" />
          </div>
          <div className="text-right">
            {village.poci.band && (
              <Badge tone="accent">
                {STRINGS.exposureBands[village.poci.band]}
              </Badge>
            )}
            <div className="mt-1.5 flex items-center justify-end gap-2">
              <CoverageMeter coverage={village.poci.coverage} />
              <ConfidenceBadge grade={village.confidence} overridden={village.confidenceOverridden} />
            </div>
          </div>
        </div>

        {village.poci.band === 'unbanded' && (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--status-serious)' }}>
            {'Scores of 30-39 fall in no band defined by the source documents (≥70 high, 40-69 moderate, <30 low). Assign a classification explicitly.'}
          </p>
        )}

        {village.poci.economicLinkageMissing && (
          <div className="mt-2">
            <MethodNote tone="warning">{STRINGS.screening.economicMissing}</MethodNote>
          </div>
        )}

        <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {village.confidenceRationale}
        </p>
      </Panel>

      <Panel title={STRINGS.screening.componentEntry}>
        <div className="space-y-4">
          {POCI_COMPONENT_DEFINITIONS.map((def) => (
            <ComponentEditor
              key={def.code}
              caseId={caseId}
              villageId={village.villageId}
              component={def.code}
              definition={def}
              entry={screening?.components[def.code]}
              distanceKm={p.DIST_TO_CONCESSION_KM}
              onChange={setPociComponent}
            />
          ))}
        </div>
      </Panel>

      <Panel title={STRINGS.common.typology}>
        <div className="space-y-3">
          {village.suggestion.code && (
            <div
              className="flex items-start justify-between gap-2 rounded px-2.5 py-2"
              style={{ background: 'var(--surface-sunken)' }}
            >
              <div className="min-w-0 text-xs">
                <div className="font-medium">
                  {STRINGS.common.suggestion}: {village.suggestion.code} ·{' '}
                  {TYPOLOGY_DEFINITIONS[village.suggestion.code].label}
                </div>
                <p className="mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {village.suggestion.rationale}
                  {!village.suggestion.confident &&
                    (' (low confidence)')}
                </p>
              </div>
              {village.typology !== village.suggestion.code && (
                <Button
                  size="sm"
                  onClick={() => setTypology(caseId, village.villageId, village.suggestion.code)}
                >
                  {STRINGS.common.accept}
                </Button>
              )}
            </div>
          )}

          <Field
            label={'Confirmed typology'}
            hint={
              'A suggestion is never auto-applied. The analyst confirms.'
            }
          >
            <Select
              value={village.typology ?? ''}
              onChange={(v) => setTypology(caseId, village.villageId, (v || null) as Typology | null)}
              options={TYPOLOGIES.map((t) => ({
                value: t,
                label: `${t} — ${TYPOLOGY_DEFINITIONS[t]}`,
              }))}
              placeholder={STRINGS.common.notAssessed}
            />
          </Field>

          {village.typology && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {TYPOLOGY_DEFINITIONS[village.typology].characteristics}
            </p>
          )}

          <Field label={STRINGS.common.notes}>
            <TextArea
              value={screening?.typologyNote ?? ''}
              onChange={(v) => updateScreening(caseId, village.villageId, { typologyNote: v })}
              rows={2}
              placeholder={
                'Reasoning for the typology…'
              }
            />
          </Field>
        </div>
      </Panel>

      <Panel title={STRINGS.common.confidence}>
        <div className="space-y-3">
          <Field
            label={'Confidence override'}
            hint={
              'Confidence is reported separately from the score. An override is recorded as an analyst decision.'
            }
          >
            <Select
              value={screening?.confidenceOverride ?? ''}
              onChange={(v) =>
                updateScreening(caseId, village.villageId, {
                  confidenceOverride: (v || null) as ConfidenceGrade | null,
                })
              }
              options={CONFIDENCE_GRADES.map((g) => ({ value: g, label: g }))}
              placeholder={`${STRINGS.common.proposed}: ${village.confidence}`}
            />
          </Field>

          {screening?.confidenceOverride && (
            <Field label={'Override reason'} required>
              <TextArea
                value={screening.confidenceOverrideReason}
                onChange={(v) =>
                  updateScreening(caseId, village.villageId, { confidenceOverrideReason: v })
                }
                rows={2}
              />
            </Field>
          )}

          <Field label={STRINGS.common.notes}>
            <TextArea
              value={screening?.notes ?? ''}
              onChange={(v) => updateScreening(caseId, village.villageId, { notes: v })}
              rows={2}
            />
          </Field>
        </div>
      </Panel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// One POCI component
// ---------------------------------------------------------------------------

function ComponentEditor({
  caseId,
  villageId,
  component,
  definition,
  entry,
  distanceKm,
  onChange,
}: {
  caseId: string
  villageId: string
  component: PociComponent
  definition: (typeof POCI_COMPONENT_DEFINITIONS)[number]
  entry: { value: number | null; note: string; sources: string[]; tiers: EvidenceTier[] } | undefined
  distanceKm: number
  onChange: ReturnType<typeof useProjectStore.getState>['setPociComponent']
}) {
  const [expanded, setExpanded] = useState(false)
  const [helperInput, setHelperInput] = useState('')

  const value = entry?.value ?? null
  const noteMissing = value !== null && !entry?.note?.trim()

  const set = (patch: Partial<{ value: number | null; note: string; sources: string[]; tiers: EvidenceTier[] }>) =>
    onChange(caseId, villageId, component, patch)

  return (
    <div className="rounded border" style={{ borderColor: noteMissing ? 'var(--status-serious)' : 'var(--border)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold"
          style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}
        >
          {component}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium">{definition.name}</span>
          <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
            {'weight'} {definition.weight}
          </span>
        </span>
        <Score value={value} size="sm" />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {expanded ? '▾' : '▸'}
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t px-2.5 py-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {definition.definition}
          </p>
          <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {definition.note}
          </p>

          <div
            className="rounded px-3 py-2 text-xs leading-relaxed"
            style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}
          >
            <span className="font-medium">{STRINGS.screening.rubric}: </span>
            {definition.rubric}
          </div>

          {/* Rubric helpers: P and N have measurable inputs, so the app can
              apply the document's bands rather than asking for a raw score. */}
          {component === 'P' && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field label={'Distance (km)'}>
                  <TextInput
                    value={helperInput || String(distanceKm.toFixed(2))}
                    onChange={setHelperInput}
                    type="number"
                  />
                </Field>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const km = Number(helperInput || distanceKm)
                  set({
                    value: proximityScore(km),
                    note:
                      entry?.note ||
                      `Derived from ${km.toFixed(2)} km using the proximity rubric (design doc Table 4).`,
                  })
                }}
              >
                {'Apply'}
              </Button>
            </div>
          )}

          {component === 'N' && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field label={'Travel time (minutes)'}>
                  <TextInput value={helperInput} onChange={setHelperInput} type="number" />
                </Field>
              </div>
              <Button
                size="sm"
                disabled={!helperInput}
                onClick={() => {
                  const minutes = Number(helperInput)
                  set({
                    value: networkScore(minutes),
                    note:
                      entry?.note ||
                      `Derived from ${minutes} minutes travel time using the network rubric (design doc Table 4).`,
                  })
                }}
              >
                {'Apply'}
              </Button>
            </div>
          )}

          <Field label={'Score (0-100)'}>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={value ?? 0}
                onChange={(e) => set({ value: Number(e.target.value) })}
                className="min-w-0 flex-1"
                style={{ accentColor: 'var(--accent)' }}
                disabled={value === null}
              />
              <div className="w-16 shrink-0">
                <TextInput
                  value={value === null ? '' : String(value)}
                  onChange={(v) => set({ value: v === '' ? null : Math.max(0, Math.min(100, Number(v))) })}
                  type="number"
                />
              </div>
              <Button
                size="sm"
                variant={value === null ? 'primary' : 'ghost'}
                onClick={() => set({ value: null })}
                title={STRINGS.common.naFull}
              >
                NA
              </Button>
            </div>
          </Field>

          {value !== null && (
            <div className="pt-1">
              <ScoreBar value={value} />
            </div>
          )}

          <Field
            label={STRINGS.common.evidenceNote}
            required={value !== null}
            hint={noteMissing ? STRINGS.screening.noteRequired : undefined}
          >
            <TextArea
              value={entry?.note ?? ''}
              onChange={(v) => set({ note: v })}
              rows={2}
              placeholder={
                'What evidence supports this score?'
              }
            />
          </Field>

          <div>
            <span className="mb-1 block text-xs font-medium">{STRINGS.common.tiers}</span>
            <div className="flex flex-wrap gap-1">
              {EVIDENCE_TIERS.map((tier) => {
                const active = entry?.tiers.includes(tier) ?? false
                return (
                  <button
                    key={tier}
                    onClick={() =>
                      set({
                        tiers: active
                          ? (entry?.tiers ?? []).filter((t) => t !== tier)
                          : [...(entry?.tiers ?? []), tier],
                      })
                    }
                    className="rounded px-1.5 py-0.5 text-xs font-medium"
                    style={{
                      background: active ? 'var(--accent)' : 'var(--surface-sunken)',
                      color: active ? '#fff' : 'var(--text-secondary)',
                    }}
                    title={EVIDENCE_TIER_DEFINITIONS[tier].definition}
                  >
                    {tier}
                  </button>
                )
              })}
            </div>
          </div>

          <Field label={STRINGS.common.sources}>
            <Select
              value=""
              onChange={(v) => {
                if (v && !(entry?.sources ?? []).includes(v)) {
                  set({ sources: [...(entry?.sources ?? []), v] })
                }
              }}
              options={SOURCES.map((s) => ({ value: s.id, label: `${s.id} · ${s.name}` }))}
              placeholder={'Add source…'}
            />
          </Field>

          {(entry?.sources.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry!.sources.map((id) => (
                <button
                  key={id}
                  onClick={() => set({ sources: entry!.sources.filter((s) => s !== id) })}
                  title={'Remove'}
                >
                  <Badge tone="neutral">{id} ×</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
