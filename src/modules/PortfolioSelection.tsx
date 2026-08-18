/**
 * Module 3 — Assessment Portfolio Selection.
 *
 * The step the method is most emphatic about: selection is by contribution
 * pathway, not by rank. The rule validator runs live and the top-N detector
 * calls out a ranking-led selection explicitly.
 */

import { useMemo } from 'react'
import { STRINGS } from '@/i18n/strings'
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

  if (!caseId) return <Empty>{'Select a case cluster.'}</Empty>
  if (loading || !caseData) {
    return <div className="page p-6 text-sm" style={{ color: 'var(--text-muted)' }}>{STRINGS.common.loading}</div>
  }

  return (
    <div className="page space-y-4 p-4 md:p-6">
      <Panel title={STRINGS.portfolio.title} subtitle={caseData.poCom}>
        <div className="space-y-3">
          <MethodNote tone="warning">{STRINGS.portfolio.intro}</MethodNote>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <StatTile
              label={STRINGS.portfolio.exposedCount}
              value={assessment.exposedCount}
              hint={`${EXPOSED_MIN}-${EXPOSED_MAX} ${'recommended'}`}
            />
            <StatTile
              label={STRINGS.portfolio.comparatorCount}
              value={assessment.comparatorCount}
              hint={'1-2 recommended'}
            />
            <StatTile
              label={STRINGS.portfolio.pathways}
              value={assessment.distinctTypologies.length}
              hint={assessment.distinctTypologies.join(', ') || 'None'}
            />
            <StatTile
              label={'Rule findings'}
              value={findings.length}
              hint={
                assessment.valid
                  ? 'no errors'
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
              {STRINGS.portfolio.valid}
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
                    ? 'Error'
                    : 'Warning'}
                </span>{' '}
                · {f.message}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel
          title={'Candidates (POCI ranked)'}
          subtitle={
            'Ranking is shown as context, not as a selection rule.'
          }
        >
          <div className="table-scroll max-h-[32rem] overflow-y-auto thin-scroll">
            <table className="w-full text-xs">
              <thead className="sticky top-0" style={{ background: 'var(--surface-1)' }}>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="px-3 py-2.5 text-left font-medium">#</th>
                  <th className="px-3 py-2.5 text-left font-medium">{STRINGS.common.village}</th>
                  <th className="px-3 py-2.5 text-right font-medium">POCI</th>
                  <th className="px-3 py-2.5 text-left font-medium">{STRINGS.common.typology}</th>
                  <th className="px-3 py-2.5 text-center font-medium">{STRINGS.common.selected}</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 60).map((v, i) => (
                  <tr key={v.villageId} className="border-t" style={{ borderColor: 'var(--gridline)' }}>
                    <td className="px-3 py-2 tnum" style={{ color: 'var(--text-muted)' }}>
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{v.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {v.feature.properties.DIST_TO_CONCESSION_KM.toFixed(1)} km ·{' '}
                        {v.feature.properties.POPULATION.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className="font-semibold tnum"
                        style={{ color: v.poci.band ? BAND_COLOR[v.poci.band] : 'var(--na)' }}
                      >
                        {v.poci.score ?? 'NA'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {v.typology ? (
                        <Badge tone="accent">{v.typology}</Badge>
                      ) : (
                        <span style={{ color: 'var(--na)' }}>·</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
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
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {`Showing the top 60 of ${candidates.length}. Use the screening module for the full list.`}
            </p>
          )}
        </Panel>

        <Panel
          title={'Selected portfolio'}
          subtitle={`${selected.length} ${STRINGS.common.villages.toLowerCase()}`}
        >
          {selected.length === 0 ? (
            <Empty>
              {'No communities selected. Tick candidates on the left.'}
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
                            <Badge tone="warning">{STRINGS.common.comparator}</Badge>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {v.feature.properties.SUBDISTRICT_NAME} ·{' '}
                          {v.typology ? TYPOLOGY_DEFINITIONS[v.typology].label : 'Not set'}
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
                          'Low-exposure comparator'
                        }
                      />
                      <Checkbox
                        checked={s.representsUndervisibleGroup}
                        onChange={(checked) =>
                          updateScreening(caseId, v.villageId, {
                            representsUndervisibleGroup: checked,
                          })
                        }
                        label={STRINGS.portfolio.undervisible}
                      />
                    </div>

                    {s.representsUndervisibleGroup && (
                      <div className="mt-2">
                        <Field
                          label={'Which group?'}
                        >
                          <TextArea
                            value={s.undervisibleGroupNote}
                            onChange={(val) =>
                              updateScreening(caseId, v.villageId, { undervisibleGroupNote: val })
                            }
                            rows={2}
                            placeholder={
                              'e.g. independent smallholders, women/youth groups, remote community'
                            }
                          />
                        </Field>
                      </div>
                    )}

                    {s.isComparator && (
                      <div className="mt-3 rounded px-2.5 py-2" style={{ background: 'var(--surface-sunken)' }}>
                        <div className="mb-1.5 text-xs font-medium">
                          {STRINGS.portfolio.comparatorCriteria}
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
                                  <span className="font-medium">{c.label}</span>{' '}
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    · {c.check}
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
                        {'Remove'}
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
