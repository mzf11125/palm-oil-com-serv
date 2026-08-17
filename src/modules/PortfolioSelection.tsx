/**
 * Module 3 — Assessment Portfolio Selection.
 *
 * The step the method is most emphatic about: selection is by contribution
 * pathway, not by rank. The rule validator runs live and the top-N detector
 * calls out a ranking-led selection explicitly.
 */

import { useMemo } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useT } from '@/i18n/useLocale'
import { useCase, useSeedScreening, useScreenedVillages } from '@/hooks/useCaseData'
import { useProjectStore } from '@/store/project'
import {
  assessPortfolio,
  detectTopNSelection,
  COMPARATOR_CRITERIA,
  EXPOSED_MIN,
  EXPOSED_MAX,
  type PortfolioMember,
} from '@/domain/portfolio'
import { TYPOLOGY_DEFINITIONS } from '@/domain/typology'
import {
  Panel,
  Empty,
  MethodNote,
  Badge,
  Button,
  Checkbox,
  StatTile,
  CoverageMeter,
  TextArea,
  Field,
  BAND_COLOR,
} from '@/components/ui'

export function PortfolioSelection({ caseId }: { caseId: string | null }) {
  const { locale, tr } = useT()
  const { data: caseData, loading } = useCase(caseId)
  useSeedScreening(caseData)
  const villages = useScreenedVillages(caseData)
  const updateScreening = useProjectStore((s) => s.updateScreening)

  const selected = useMemo(() => villages.filter((v) => v.screening?.selected), [villages])

  const members: PortfolioMember[] = useMemo(
    () =>
      selected.map((v) => ({
        villageId: v.villageId,
        villageName: v.name,
        poci: v.poci.score,
        typology: v.typology,
        isComparator: v.screening?.isComparator ?? false,
        representsUndervisibleGroup: v.screening?.representsUndervisibleGroup ?? false,
      })),
    [selected],
  )

  const assessment = useMemo(() => assessPortfolio(members), [members])

  const topN = useMemo(
    () =>
      detectTopNSelection(
        members.filter((m) => !m.isComparator),
        villages.map((v) => ({ villageId: v.villageId, poci: v.poci.score })),
      ),
    [members, villages],
  )

  const findings = topN ? [...assessment.findings, topN] : assessment.findings

  // Ranked candidates, so the analyst can see what they are choosing among.
  const candidates = useMemo(
    () =>
      [...villages].sort((a, b) => {
        if (a.poci.score === null && b.poci.score === null) return 0
        if (a.poci.score === null) return 1
        if (b.poci.score === null) return -1
        return b.poci.score - a.poci.score
      }),
    [villages],
  )

  if (!caseId) return <Empty>{locale === 'id' ? 'Pilih case cluster.' : 'Select a case cluster.'}</Empty>
  if (loading || !caseData) {
    return <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>{tr(STRINGS.common.loading)}</div>
  }

  return (
    <div className="space-y-4 p-4">
      <Panel title={tr(STRINGS.portfolio.title)} subtitle={caseData.poCom}>
        <div className="space-y-3">
          <MethodNote tone="warning">{tr(STRINGS.portfolio.intro)}</MethodNote>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label={tr(STRINGS.portfolio.exposedCount)}
              value={assessment.exposedCount}
              hint={`${EXPOSED_MIN}–${EXPOSED_MAX} ${locale === 'id' ? 'disarankan' : 'recommended'}`}
            />
            <StatTile
              label={tr(STRINGS.portfolio.comparatorCount)}
              value={assessment.comparatorCount}
              hint={locale === 'id' ? '1–2 disarankan' : '1–2 recommended'}
            />
            <StatTile
              label={tr(STRINGS.portfolio.pathways)}
              value={assessment.distinctTypologies.length}
              hint={assessment.distinctTypologies.join(', ') || '—'}
            />
            <StatTile
              label={locale === 'id' ? 'Temuan aturan' : 'Rule findings'}
              value={findings.length}
              hint={
                assessment.valid
                  ? locale === 'id'
                    ? 'tanpa error'
                    : 'no errors'
                  : locale === 'id'
                    ? 'ada error'
                    : 'has errors'
              }
            />
          </div>

          {findings.length === 0 && selected.length > 0 && (
            <div
              className="flex items-center gap-2 rounded px-3 py-2 text-xs"
              style={{ background: 'rgba(12,163,12,0.1)', color: 'var(--success-text)' }}
            >
              <span aria-hidden>✓</span>
              {tr(STRINGS.portfolio.valid)}
            </div>
          )}

          {findings.map((f) => (
            <div
              key={f.rule}
              className="flex items-start gap-2 rounded px-3 py-2 text-xs leading-relaxed"
              style={{
                background:
                  f.severity === 'error' ? 'rgba(208,59,59,0.1)' : 'rgba(236,131,90,0.12)',
                color: f.severity === 'error' ? 'var(--status-critical)' : 'var(--status-serious)',
              }}
            >
              <span aria-hidden className="mt-px shrink-0 font-bold">
                {f.severity === 'error' ? '!' : '△'}
              </span>
              <span>
                <span className="font-semibold uppercase tracking-wide">
                  {f.severity === 'error'
                    ? locale === 'id'
                      ? 'Error'
                      : 'Error'
                    : locale === 'id'
                      ? 'Peringatan'
                      : 'Warning'}
                </span>{' '}
                — {f.message[locale]}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title={locale === 'id' ? 'Kandidat (peringkat POCI)' : 'Candidates (POCI ranked)'}
          subtitle={
            locale === 'id'
              ? 'Peringkat ditampilkan sebagai konteks, bukan sebagai aturan pemilihan.'
              : 'Ranking is shown as context, not as a selection rule.'
          }
        >
          <div className="table-scroll max-h-[32rem] overflow-y-auto thin-scroll">
            <table className="w-full text-xs">
              <thead className="sticky top-0" style={{ background: 'var(--surface-1)' }}>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="px-2 py-2 text-left font-medium">#</th>
                  <th className="px-2 py-2 text-left font-medium">{tr(STRINGS.common.village)}</th>
                  <th className="px-2 py-2 text-right font-medium">POCI</th>
                  <th className="px-2 py-2 text-left font-medium">{tr(STRINGS.common.typology)}</th>
                  <th className="px-2 py-2 text-center font-medium">{tr(STRINGS.common.selected)}</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 60).map((v, i) => (
                  <tr key={v.villageId} className="border-t" style={{ borderColor: 'var(--gridline)' }}>
                    <td className="px-2 py-1.5 tnum" style={{ color: 'var(--text-muted)' }}>
                      {i + 1}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="font-medium">{v.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {v.feature.properties.DIST_TO_CONCESSION_KM.toFixed(1)} km ·{' '}
                        {v.feature.properties.POPULATION.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <span
                        className="font-semibold tnum"
                        style={{ color: v.poci.band ? BAND_COLOR[v.poci.band] : 'var(--na)' }}
                      >
                        {v.poci.score ?? 'NA'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      {v.typology ? (
                        <Badge tone="accent">{v.typology}</Badge>
                      ) : (
                        <span style={{ color: 'var(--na)' }}>—</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={v.screening?.selected ?? false}
                        onChange={(e) =>
                          updateScreening(caseId, v.villageId, { selected: e.target.checked })
                        }
                        style={{ accentColor: 'var(--accent)' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {candidates.length > 60 && (
            <p className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {locale === 'id'
                ? `Menampilkan 60 teratas dari ${candidates.length}. Gunakan modul screening untuk daftar penuh.`
                : `Showing the top 60 of ${candidates.length}. Use the screening module for the full list.`}
            </p>
          )}
        </Panel>

        <Panel
          title={locale === 'id' ? 'Portfolio terpilih' : 'Selected portfolio'}
          subtitle={`${selected.length} ${tr(STRINGS.common.villages).toLowerCase()}`}
        >
          {selected.length === 0 ? (
            <Empty>
              {locale === 'id'
                ? 'Belum ada komunitas terpilih. Centang kandidat di sebelah kiri.'
                : 'No communities selected. Tick candidates on the left.'}
            </Empty>
          ) : (
            <div className="space-y-3">
              {selected.map((v) => {
                const s = v.screening!
                return (
                  <div
                    key={v.villageId}
                    className="rounded border px-3 py-2.5"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{v.name}</span>
                          {v.typology && <Badge tone="accent">{v.typology}</Badge>}
                          {s.isComparator && (
                            <Badge tone="warning">{tr(STRINGS.common.comparator)}</Badge>
                          )}
                        </div>
                        <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {v.feature.properties.SUBDISTRICT_NAME} ·{' '}
                          {v.typology ? TYPOLOGY_DEFINITIONS[v.typology][locale] : '—'}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div
                          className="text-lg font-semibold tnum"
                          style={{ color: v.poci.band ? BAND_COLOR[v.poci.band] : 'var(--na)' }}
                        >
                          {v.poci.score ?? 'NA'}
                        </div>
                        <CoverageMeter coverage={v.poci.coverage} showLabel={false} />
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      <Checkbox
                        checked={s.isComparator}
                        onChange={(checked) =>
                          updateScreening(caseId, v.villageId, { isComparator: checked })
                        }
                        label={
                          locale === 'id'
                            ? 'Pembanding exposure rendah'
                            : 'Low-exposure comparator'
                        }
                      />
                      <Checkbox
                        checked={s.representsUndervisibleGroup}
                        onChange={(checked) =>
                          updateScreening(caseId, v.villageId, {
                            representsUndervisibleGroup: checked,
                          })
                        }
                        label={tr(STRINGS.portfolio.undervisible)}
                      />
                    </div>

                    {s.representsUndervisibleGroup && (
                      <div className="mt-2">
                        <Field
                          label={locale === 'id' ? 'Kelompok mana?' : 'Which group?'}
                        >
                          <TextArea
                            value={s.undervisibleGroupNote}
                            onChange={(val) =>
                              updateScreening(caseId, v.villageId, { undervisibleGroupNote: val })
                            }
                            rows={2}
                            placeholder={
                              locale === 'id'
                                ? 'mis. pekebun swadaya, kelompok perempuan/pemuda, komunitas terpencil'
                                : 'e.g. independent smallholders, women/youth groups, remote community'
                            }
                          />
                        </Field>
                      </div>
                    )}

                    {s.isComparator && (
                      <div className="mt-3 rounded px-2.5 py-2" style={{ background: 'var(--surface-sunken)' }}>
                        <div className="mb-1.5 text-[11px] font-medium">
                          {tr(STRINGS.portfolio.comparatorCriteria)}
                        </div>
                        <div className="space-y-1">
                          {COMPARATOR_CRITERIA.map((c) => (
                            <Checkbox
                              key={c.key}
                              checked={s.comparatorCriteria[c.key] ?? false}
                              onChange={(checked) =>
                                updateScreening(caseId, v.villageId, {
                                  comparatorCriteria: { ...s.comparatorCriteria, [c.key]: checked },
                                })
                              }
                              label={
                                <span>
                                  <span className="font-medium">{c[locale]}</span>{' '}
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    — {c.check[locale]}
                                  </span>
                                </span>
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateScreening(caseId, v.villageId, { selected: false })}
                      >
                        {locale === 'id' ? 'Keluarkan' : 'Remove'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
