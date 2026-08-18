/**
 * Module 6 — Evidence Register.
 *
 * Two views: the source catalog (read-only reference) and the acquisition
 * register (analyst-managed per-case entries).
 *
 * Per scorecard doc section 12 stage 1 / Appendix 4: every dataset in the
 * analysis must receive a record here covering source, period, geography,
 * access restriction, completeness, sensitivity, licence, permitted use,
 * and acquisition status.
 */

import { useMemo, useState } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useProjectStore } from '@/store/project'
import { SOURCES, type SourceDefinition } from '@/reference/sources'
import {
  Panel,
  Empty,
  MethodNote,
  Badge,
  Select,
  TextInput,
  Button,
} from '@/components/ui'
import type { EvidenceRecord } from '@/store/types'

const COMPLETENESS_OPTIONS = ['complete', 'partial', 'minimal', 'unavailable', 'unknown'] as const
const SENSITIVITY_OPTIONS = ['public', 'internal', 'restricted', 'confidential'] as const
const STATUS_OPTIONS = [
  'not-requested',
  'requested',
  'received',
  'processed',
  'refused',
] as const

type CompletenessKey = (typeof COMPLETENESS_OPTIONS)[number]
type SensitivityKey = (typeof SENSITIVITY_OPTIONS)[number]
type StatusKey = (typeof STATUS_OPTIONS)[number]

const STATUS_TONE: Record<StatusKey, 'muted' | 'accent' | 'good' | 'warning' | 'critical'> = {
  'not-requested': 'muted',
  requested: 'accent',
  received: 'good',
  processed: 'good',
  refused: 'critical',
}

const COMPLETENESS_TONE: Record<CompletenessKey, 'muted' | 'accent' | 'good' | 'warning' | 'critical'> = {
  complete: 'good',
  partial: 'accent',
  minimal: 'warning',
  unavailable: 'critical',
  unknown: 'muted',
}

function makeRecord(sourceId: string, caseId: string): Omit<EvidenceRecord, 'id'> {
  return {
    sourceId,
    caseId,
    owner: '',
    period: '',
    geography: '',
    format: '',
    accessRestriction: '',
    updateFrequency: '',
    completeness: 'unknown',
    sensitivity: 'public',
    licence: '',
    permittedUse: '',
    status: 'not-requested',
    requestedOn: '',
    receivedOn: '',
    qualityFlag: '',
    notes: '',
  }
}

// ─── Source Catalog Row ────────────────────────────────────────────────────

function CatalogRow({
  source,
  onAdd,
  existing,
}: {
  source: SourceDefinition
  onAdd: (sourceId: string) => void
  existing: boolean
}) {
  return (
    <div
      className="flex items-start gap-3 border-b py-2.5 last:border-0"
      style={{ fontSize: '0.75rem', borderColor: 'var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono font-semibold" style={{ color: 'var(--accent)' }}>
            {source.id}
          </span>
          {source.restricted && (
            <Badge tone="warning">
              {STRINGS.evidence.restricted}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 font-medium leading-snug">{source.name}</div>
        <div className="mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {source.primaryUse}
        </div>
      </div>
      <button
        onClick={() => onAdd(source.id)}
        disabled={existing}
        className="shrink-0 rounded px-2 py-1 text-xs font-medium transition-opacity disabled:opacity-40"
        style={{
          background: existing ? 'var(--surface-sunken)' : 'var(--accent)',
          color: existing ? 'var(--text-muted)' : '#fff',
        }}
      >
        {existing ? '✓' : '+'}
      </button>
    </div>
  )
}

// ─── Evidence Record Form ──────────────────────────────────────────────────

function RecordForm({
  record,
  onChange,
  onRemove,
}: {
  record: EvidenceRecord
  onChange: (updated: EvidenceRecord) => void
  onRemove: () => void
}) {
  const source = SOURCES.find((s) => s.id === record.sourceId)

  const field = <K extends keyof EvidenceRecord>(key: K, value: EvidenceRecord[K]) =>
    onChange({ ...record, [key]: value })

  return (
    <div
      className="rounded-lg border p-3"
      style={{ background: 'var(--surface-1)', fontSize: '0.75rem', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span className="font-mono font-semibold" style={{ color: 'var(--accent)' }}>
            {record.sourceId}
          </span>
          {source && (
            <span className="ml-1.5" style={{ color: 'var(--text-secondary)' }}>
              {source.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={record.status}
            onChange={(v) => field('status', v as StatusKey)}
            options={STATUS_OPTIONS.map((s) => ({ value: s, label: s.replace(/-/g, ' ') }))}
          />
          <Badge tone={STATUS_TONE[record.status]}>{record.status}</Badge>
          <button
            onClick={onRemove}
            className="rounded px-1.5 py-0.5 text-xs"
            style={{ color: 'var(--text-muted)', background: 'var(--surface-sunken)' }}
            title="Remove record"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <TextInput
          label={STRINGS.evidence.owner}
          value={record.owner}
          onChange={(v) => field('owner', v)}
        />
        <TextInput
          label={STRINGS.evidence.period}
          value={record.period}
          onChange={(v) => field('period', v)}
          placeholder="e.g. 2024"
        />
        <TextInput
          label={STRINGS.evidence.geography}
          value={record.geography}
          onChange={(v) => field('geography', v)}
          placeholder="e.g. kabupaten"
        />
        <TextInput
          label="Format"
          value={record.format}
          onChange={(v) => field('format', v)}
          placeholder="CSV, shapefile…"
        />
        <TextInput
          label={STRINGS.evidence.accessRestriction}
          value={record.accessRestriction}
          onChange={(v) => field('accessRestriction', v)}
        />
        <TextInput
          label="Update frequency"
          value={record.updateFrequency}
          onChange={(v) => field('updateFrequency', v)}
          placeholder="annual…"
        />
      </div>

      {/* Row 2 */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {STRINGS.evidence.completeness}
          </label>
          <div className="flex gap-1 items-center">
            <Select
              value={record.completeness}
              onChange={(v) => field('completeness', v as CompletenessKey)}
              options={COMPLETENESS_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
            <Badge tone={COMPLETENESS_TONE[record.completeness]}>
              {(record.completeness[0] ?? '?').toUpperCase()}
            </Badge>
          </div>
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {STRINGS.evidence.sensitivity}
          </label>
          <Select
            value={record.sensitivity}
            onChange={(v) => field('sensitivity', v as SensitivityKey)}
            options={SENSITIVITY_OPTIONS.map((o) => ({ value: o, label: o }))}
          />
        </div>
        <TextInput
          label="Licence"
          value={record.licence}
          onChange={(v) => field('licence', v)}
          placeholder="CC BY 4.0…"
        />
        <TextInput
          label={STRINGS.evidence.permittedUse}
          value={record.permittedUse}
          onChange={(v) => field('permittedUse', v)}
        />
      </div>

      {/* Row 3 */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <TextInput
          label="Requested on"
          value={record.requestedOn}
          onChange={(v) => field('requestedOn', v)}
          placeholder="YYYY-MM-DD"
        />
        <TextInput
          label="Received on"
          value={record.receivedOn}
          onChange={(v) => field('receivedOn', v)}
          placeholder="YYYY-MM-DD"
        />
        <TextInput
          label="Quality flag"
          value={record.qualityFlag}
          onChange={(v) => field('qualityFlag', v)}
        />
        <TextInput
          label={STRINGS.common.notes}
          value={record.notes}
          onChange={(v) => field('notes', v)}
        />
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────

export function EvidenceRegister({ caseId }: { caseId: string | null }) {
  const [catalogSearch, setCatalogSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'IDN' | 'MYS' | 'GLOBAL' | 'OPERATIONAL'>('ALL')
  const [tab, setTab] = useState<'catalog' | 'register'>('catalog')

  const evidenceRecords = useProjectStore((s) =>
    caseId ? (s.cases[caseId]?.evidence ?? []) : [],
  )
  const addEvidence = useProjectStore((s) => s.addEvidence)
  const updateEvidence = useProjectStore((s) => s.updateEvidence)
  const removeEvidence = useProjectStore((s) => s.removeEvidence)
  const ensureCase = useProjectStore((s) => s.ensureCase)

  const filteredSources = useMemo(() => {
    const q = catalogSearch.toLowerCase()
    return SOURCES.filter(
      (s) =>
        (regionFilter === 'ALL' || s.region === regionFilter) &&
        (q === '' ||
          s.id.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.primaryUse.toLowerCase().includes(q)),
    )
  }, [catalogSearch, regionFilter])

  const existingSourceIds = new Set(evidenceRecords.map((r) => r.sourceId))

  function handleAdd(sourceId: string) {
    if (!caseId) return
    ensureCase(caseId)
    addEvidence(caseId, makeRecord(sourceId, caseId))
  }

  if (!caseId) {
    return (
      <div className="page p-4 md:p-6">
        <Empty>Select a case to manage evidence records.</Empty>
      </div>
    )
  }

  return (
    <div className="page space-y-4 p-4 md:p-6">
      {/* Header + tab toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold">{STRINGS.evidence.title}</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {STRINGS.evidence.intro}
          </p>
        </div>
        <div
          className="flex rounded border overflow-hidden"
          style={{ borderColor: 'var(--border-strong)' }}
        >
          {(['catalog', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1.5 text-xs font-medium"
              style={{
                background: tab === t ? 'var(--accent)' : 'var(--surface-1)',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {t === 'catalog' ? STRINGS.evidence.catalog : STRINGS.evidence.register}
            </button>
          ))}
        </div>
      </div>

      {/* Source Catalog */}
      {tab === 'catalog' && (
        <Panel
          title={STRINGS.evidence.catalog}
          subtitle="Click + to create an acquisition record for this case."
        >
          <div className="mb-3 flex flex-wrap gap-2">
            <TextInput
              label=""
              value={catalogSearch}
              onChange={setCatalogSearch}
              placeholder={STRINGS.common.search + ' sources…'}
              className="flex-1 min-w-32"
            />
            <Select
              value={regionFilter}
              onChange={(v) => setRegionFilter(v as typeof regionFilter)}
              options={[
                { value: 'ALL', label: 'All regions' },
                { value: 'IDN', label: 'Indonesia' },
                { value: 'MYS', label: 'Malaysia' },
                { value: 'GLOBAL', label: 'Global' },
                { value: 'OPERATIONAL', label: 'Operational' },
              ]}
            />
          </div>

          {filteredSources.length === 0 ? (
            <Empty>No sources match the filter.</Empty>
          ) : (
            filteredSources.map((source) => (
              <CatalogRow
                key={source.id}
                source={source}
                onAdd={handleAdd}
                existing={existingSourceIds.has(source.id)}
              />
            ))
          )}

          <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {SOURCES.length} sources in catalog · {existingSourceIds.size} tracked in this case
          </div>
        </Panel>
      )}

      {/* Acquisition Register */}
      {tab === 'register' && (
        <Panel
          title={STRINGS.evidence.register}
          subtitle="Acquisition status, quality flags and metadata for every dataset used."
          actions={
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {evidenceRecords.length} records
            </span>
          }
        >
          <MethodNote>
            {'Every dataset used in the analysis must have a record here, including sources that were refused or inaccessible. Absence is itself evidence.'}
          </MethodNote>

          {evidenceRecords.length === 0 ? (
            <div className="mt-3">
              <Empty>{STRINGS.evidence.empty}</Empty>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {evidenceRecords.map((rec) => (
                <RecordForm
                  key={rec.id}
                  record={rec}
                  onChange={(updated) => updateEvidence(caseId, updated.id, updated)}
                  onRemove={() => removeEvidence(caseId, rec.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <Button onClick={() => setTab('catalog')} variant="default" size="sm">
              + {STRINGS.evidence.addRecord}
            </Button>
          </div>
        </Panel>
      )}
    </div>
  )
}
