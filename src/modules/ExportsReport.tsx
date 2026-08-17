/**
 * Module 8 — Exports & Print.
 *
 * Three export paths:
 *   1. Versioned project JSON   — full round-trip of analyst work.
 *   2. CSV exports              — POCI scores, ABCD scores, validation queue.
 *   3. Print                    — browser print dialog; print-only report
 *      content is hidden on screen and shown only at print time.
 *
 * localStorage is autosave, not durable storage. The project-file export
 * is the durable path; the intro says so explicitly.
 */

import { useRef } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useT } from '@/i18n/useLocale'
import { useProjectStore, assessmentKey } from '@/store/project'
import { useCase, useSeedScreening, useScreenedVillages } from '@/hooks/useCaseData'
import { INDICATORS } from '@/reference/indicators'
import { computeIndicator } from '@/domain/abcd'
import { PROJECT_SCHEMA_VERSION, type ProjectExport } from '@/store/types'
import { Panel, MethodNote, Button, Empty, StatTile } from '@/components/ui'
import type { CaseSummary } from '@/data/types'

// ─── CSV helpers ───────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  const s = val == null ? '' : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function rowsToCsv(headers: string[], rows: unknown[][]): string {
  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => r.map(escapeCsv).join(',')),
  ].join('\r\n')
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main ──────────────────────────────────────────────────────────────────

export function ExportsReport({
  caseId,
  caseSummary,
}: {
  caseId: string | null
  caseSummary: CaseSummary | null
}) {
  const { locale, tr } = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allCases = useProjectStore((s) => s.cases)
  const importProject = useProjectStore((s) => s.importProject)

  const { data: caseData } = useCase(caseId)
  useSeedScreening(caseData)
  const villages = useScreenedVillages(caseData)
  const caseProject = caseId ? allCases[caseId] : null

  // Stats
  const screened = villages.filter((v) => v.poci.score !== null).length
  const selected = villages.filter((v) => v.screening?.selected).length
  const comparators = villages.filter((v) => v.screening?.isComparator).length
  const validationItems = Object.values(caseProject?.validation ?? {})
  const openItems = validationItems.filter((v) => v.status === 'open').length
  const resolvedItems = validationItems.filter((v) => v.status === 'resolved').length

  // ── Export: full project JSON ──────────────────────────────────────────

  function handleExportProject() {
    const payload: ProjectExport = {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      application: 'ABCDS-RF',
      cases: allCases,
    }
    const json = JSON.stringify(payload, null, 2)
    const ts = new Date().toISOString().slice(0, 10)
    downloadBlob(`abcds-rf-project-${ts}.json`, json, 'application/json')
  }

  // ── Import: project JSON ──────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as ProjectExport
        if (parsed.schemaVersion !== PROJECT_SCHEMA_VERSION) {
          alert(
            `Schema version mismatch: file is v${parsed.schemaVersion}, expected v${PROJECT_SCHEMA_VERSION}. Cannot import.`,
          )
          return
        }
        if (!window.confirm(tr(STRINGS.exports.importWarning))) return
        const result = importProject(parsed)
        if (!result.ok) alert(`Import failed: ${result.error}`)
      } catch {
        alert('Could not parse the project file. Make sure it is a valid ABCDS-RF JSON export.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Export: POCI CSV ──────────────────────────────────────────────────

  function handleExportPoci() {
    if (!caseId || villages.length === 0) return
    const headers = [
      'VILLAGE_ID', 'VILLAGE_NAME', 'DISTRICT',
      'P', 'N', 'E', 'F', 'L',
      'POCI_SCORE', 'POCI_COVERAGE', 'EXPOSURE_BAND',
      'TYPOLOGY', 'CONFIDENCE',
    ]
    const rows = villages.map((v) => [
      v.villageId,
      v.name,
      v.feature.properties.DISTRICT_NAME ?? '',
      v.screening?.components.P.value ?? '',
      v.screening?.components.N.value ?? '',
      v.screening?.components.E.value ?? '',
      v.screening?.components.F.value ?? '',
      v.screening?.components.L.value ?? '',
      v.poci.score ?? '',
      v.poci.coverage != null ? (v.poci.coverage * 100).toFixed(0) + '%' : '',
      v.poci.band ?? '',
      v.typology ?? '',
      v.confidence ?? '',
    ])
    const csv = rowsToCsv(headers, rows)
    downloadBlob(
      `poci-${caseId}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv',
    )
  }

  // ── Export: ABCD CSV ──────────────────────────────────────────────────

  function handleExportAbcd() {
    if (!caseId) return
    const selectedVillages = villages.filter((v) => v.screening?.selected)
    if (selectedVillages.length === 0) {
      alert('No selected communities in the portfolio. Select villages first.')
      return
    }
    const indicatorHeaders = INDICATORS.flatMap((ind) => [
      `${ind.code}_SCORE`,
      `${ind.code}_COV`,
    ])
    const headers = ['VILLAGE_ID', 'VILLAGE_NAME', ...indicatorHeaders]

    const rows = selectedVillages.map((v) => {
      const cells: unknown[] = [v.villageId, v.name]
      for (const ind of INDICATORS) {
        const assessment = caseProject?.assessments?.[assessmentKey(v.villageId, ind.code)]
        const result = computeIndicator(
          assessment?.components ?? { A: null, C: null, M: null, I: null, O: null },
        )
        cells.push(result.score ?? '')
        cells.push(result.coverage != null ? (result.coverage * 100).toFixed(0) + '%' : '')
      }
      return cells
    })

    const csv = rowsToCsv(headers, rows)
    downloadBlob(
      `abcd-${caseId}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv',
    )
  }

  // ── Export: Validation queue CSV ──────────────────────────────────────

  function handleExportValidation() {
    if (!caseId) return
    const records = Object.values(caseProject?.validation ?? {})
    if (records.length === 0) {
      alert('Validation queue is empty.')
      return
    }
    const headers = ['ID', 'STATUS', 'TIER', 'TIER_OVERRIDDEN', 'ASSIGNEE', 'NOTE', 'RESOLUTION']
    const rows = records.map((r) => [
      r.id, r.status, r.tier,
      r.tierOverridden ? 'yes' : 'no',
      r.assignee, r.note, r.resolution,
    ])
    const csv = rowsToCsv(headers, rows)
    downloadBlob(
      `validation-${caseId}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv',
    )
  }

  if (!caseId) {
    return (
      <div className="p-4">
        <Empty>Select a case to access exports.</Empty>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-base font-semibold">{tr(STRINGS.exports.title)}</h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {tr(STRINGS.exports.intro)}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Villages" value={villages.length} />
        <StatTile label="Screened (POCI)" value={screened} />
        <StatTile label="In portfolio" value={selected} />
        <StatTile label="Comparators" value={comparators} />
        <StatTile label="Open items" value={openItems} />
        <StatTile label="Resolved" value={resolvedItems} />
      </div>

      {caseSummary && (
        <div
          className="rounded-lg border px-4 py-3 text-xs"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          <div className="font-semibold">{caseSummary.poCom}</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            {caseSummary.district} · {caseSummary.province} · {caseSummary.villageCount} villages
          </div>
        </div>
      )}

      {/* Project file */}
      <Panel title="Project file" subtitle={tr(STRINGS.exports.storageNote)}>
        <MethodNote>
          {locale === 'id'
            ? 'localStorage bersifat sementara. Ekspor file proyek secara rutin untuk penyimpanan dan berbagi lintas perangkat.'
            : 'localStorage is ephemeral. Export the project file regularly to store and share work across devices.'}
        </MethodNote>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={handleExportProject} variant="primary">
            ↓ {tr(STRINGS.exports.exportProject)}
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="default">
            ↑ {tr(STRINGS.exports.importProject)}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </Panel>

      {/* CSV exports */}
      <Panel title="CSV exports" subtitle="For onward analysis in spreadsheets or R/Python.">
        <div className="mt-2 flex flex-wrap gap-2">
          <Button onClick={handleExportPoci} variant="default" disabled={villages.length === 0}>
            ↓ {tr(STRINGS.exports.exportPoci)}
          </Button>
          <Button onClick={handleExportAbcd} variant="default" disabled={selected === 0}>
            ↓ {tr(STRINGS.exports.exportAbcd)}
          </Button>
          <Button
            onClick={handleExportValidation}
            variant="default"
            disabled={validationItems.length === 0}
          >
            ↓ {tr(STRINGS.exports.exportValidation)}
          </Button>
        </div>
        {selected === 0 && (
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            ABCD CSV requires at least one community selected in the portfolio.
          </p>
        )}
      </Panel>

      {/* Print */}
      <Panel
        title={tr(STRINGS.exports.printReport)}
        subtitle="Prints a summary of the case: POCI scores, portfolio, and ABCD profiles."
      >
        <div className="mt-2">
          <Button onClick={() => window.print()} variant="default">
            🖨 {tr(STRINGS.exports.printReport)}
          </Button>
        </div>

        {/* Print-only content — hidden on screen via CSS, shown at print time */}
        <div className="print-only mt-4 space-y-6">
          <div>
            <h1 className="text-xl font-bold">ABCDS-RF Assessment Report</h1>
            {caseSummary && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {caseSummary.poCom} · {caseSummary.district}, {caseSummary.province} ·
                Exported {new Date().toLocaleDateString()}
              </p>
            )}
          </div>

          <section>
            <h2 className="text-base font-semibold mb-2">POCI Screening Summary</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: 'var(--surface-sunken)' }}>
                  {['Village', 'P', 'N', 'E', 'F', 'L', 'POCI', 'Coverage', 'Band', 'Typology'].map(
                    (h) => (
                      <th
                        key={h}
                        className="border px-2 py-1 text-left"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {villages.map((v) => (
                  <tr key={v.villageId} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="border px-2 py-1" style={{ borderColor: 'var(--border)' }}>
                      {v.name}
                      {v.screening?.selected && ' ★'}
                      {v.screening?.isComparator && ' ◇'}
                    </td>
                    {(['P', 'N', 'E', 'F', 'L'] as const).map((c) => (
                      <td
                        key={c}
                        className="border px-2 py-1 text-right"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {v.screening?.components[c].value ?? '–'}
                      </td>
                    ))}
                    <td
                      className="border px-2 py-1 text-right font-semibold"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {v.poci.score != null ? v.poci.score.toFixed(1) : '–'}
                    </td>
                    <td
                      className="border px-2 py-1 text-right"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {v.poci.coverage != null
                        ? (v.poci.coverage * 100).toFixed(0) + '%'
                        : '–'}
                    </td>
                    <td className="border px-2 py-1" style={{ borderColor: 'var(--border)' }}>
                      {v.poci.band ?? '–'}
                    </td>
                    <td className="border px-2 py-1" style={{ borderColor: 'var(--border)' }}>
                      {v.typology ?? '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              ★ selected · ◇ comparator
            </p>
          </section>
        </div>
      </Panel>
    </div>
  )
}
