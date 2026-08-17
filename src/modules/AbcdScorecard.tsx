/**
 * Module 4 — ABCD Scorecard.
 *
 * Fifteen indicator cards per selected community, each rated on A/C/M/I/O.
 * Three things are kept deliberately apart on screen, because the method
 * requires them kept apart in the analysis: the asset score, the confidence
 * grade, and the palm-oil contribution category.
 */

import { useEffect, useMemo, useState } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useT } from '@/i18n/useLocale'
import { useCase, useSeedScreening, useScreenedVillages, useVillageAssessment } from '@/hooks/useCaseData'
import { useProjectStore, assessmentKey } from '@/store/project'
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
  TextArea,
  Select,
  Field,
  Checkbox,
  StatTile,
} from '@/components/ui'
import {
  INDICATORS,
  INDICATORS_BY_CODE,
  PILLAR_DEFINITIONS,
  ABCD_COMPONENT_DEFINITIONS,
  RATING_ANCHORS,
} from '@/reference/indicators'
import { CONTRIBUTION_DEFINITIONS, EVIDENCE_TIER_DEFINITIONS } from '@/reference/framework'
import { PILLARS, CONFIDENCE_GRADES, CONTRIBUTION_CATEGORIES, EVIDENCE_TIERS, ABCD_COMPONENTS } from '@/domain/types'
import type {
  AbcdComponent,
  ConfidenceGrade,
  ContributionCategory,
  EvidenceTier,
  IndicatorCode,
  PillarCode,
} from '@/domain/types'
import { SOURCES } from '@/reference/sources'
import { PILLAR_INDICATORS } from '@/domain/abcd'

export function AbcdScorecard({ caseId }: { caseId: string | null }) {
  const { locale, tr } = useT()
  const { data: caseData, loading } = useCase(caseId)
  useSeedScreening(caseData)
  const villages = useScreenedVillages(caseData)

  const selected = useMemo(() => villages.filter((v) => v.screening?.selected), [villages])
  const [villageId, setVillageId] = useState<string | null>(null)
  const [showComposite, setShowComposite] = useState(false)
  const [openPillar, setOpenPillar] = useState<PillarCode | null>('HUM')

  // Default to the first selected community once the portfolio exists.
  useEffect(() => {
    if (!villageId && selected[0]) setVillageId(selected[0].villageId)
    if (villageId && !selected.some((v) => v.villageId === villageId)) {
      setVillageId(selected[0]?.villageId ?? null)
    }
  }, [selected, villageId])

  const assessment = useVillageAssessment(caseId, villageId)
  const village = selected.find((v) => v.villageId === villageId) ?? null

  if (!caseId) return <Empty>{locale === 'id' ? 'Pilih case cluster.' : 'Select a case cluster.'}</Empty>
  if (loading || !caseData) {
    return <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>{tr(STRINGS.common.loading)}</div>
  }

  if (selected.length === 0) {
    return (
      <div className="p-4">
        <Panel title={tr(STRINGS.scorecard.title)}>
          <Empty>{tr(STRINGS.scorecard.noPortfolio)}</Empty>
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <Panel
        title={tr(STRINGS.scorecard.title)}
        subtitle={caseData.poCom}
        actions={
          <Select
            value={villageId ?? ''}
            onChange={(v) => setVillageId(v || null)}
            options={selected.map((v) => ({
              value: v.villageId,
              label: `${v.name}${v.screening?.isComparator ? ' (comparator)' : ''}`,
            }))}
          />
        }
      >
        <div className="space-y-3">
          <MethodNote>{tr(STRINGS.scorecard.intro)}</MethodNote>
          <MethodNote tone="warning">{tr(STRINGS.scorecard.contributionSeparate)}</MethodNote>
        </div>
      </Panel>

      {!village || !assessment ? (
        <Empty>{tr(STRINGS.scorecard.selectVillage)}</Empty>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Panel
              title={`${village.name} — ${tr(STRINGS.scorecard.pillarProfile)}`}
              subtitle={
                locale === 'id'
                  ? `${assessment.scoredCount} dari 15 indikator dinilai`
                  : `${assessment.scoredCount} of 15 indicators scored`
              }
            >
              {/* Pillar scores are magnitudes on a common 0-100 scale, so a
                  horizontal bar on the sequential ramp — not a radar, which
                  would imply the five pillars form a shape worth reading. */}
              <div className="space-y-2.5">
                {assessment.pillars.map((p) => (
                  <div key={p.pillar}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium">
                        {PILLAR_DEFINITIONS[p.pillar].name[locale]}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {p.scoredIndicators}/{p.totalIndicators}{' '}
                        {locale === 'id' ? 'indikator' : 'indicators'}
                      </span>
                    </div>
                    <ScoreBar value={p.score} height={10} />
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--gridline)' }}>
                <Checkbox
                  checked={showComposite}
                  onChange={setShowComposite}
                  label={tr(STRINGS.scorecard.showComposite)}
                />
                {showComposite && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-baseline gap-3">
                      <Score value={assessment.composite.score} size="lg" />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {assessment.composite.complete
                          ? locale === 'id'
                            ? 'semua indikator dinilai'
                            : 'all indicators scored'
                          : locale === 'id'
                            ? 'BELUM LENGKAP — rata-rata atas bukti yang tidak merata'
                            : 'INCOMPLETE — averaging over uneven evidence'}
                      </span>
                    </div>
                    <MethodNote tone="warning">{tr(STRINGS.scorecard.compositeCaveat)}</MethodNote>
                  </div>
                )}
              </div>
            </Panel>

            <div className="space-y-3">
              <StatTile
                label="POCI"
                value={village.poci.score ?? 'NA'}
                hint={
                  village.typology
                    ? `${village.typology} · ${village.poci.band ?? '—'}`
                    : village.poci.band ?? '—'
                }
              />
              <StatTile
                label={locale === 'id' ? 'Indikator dinilai' : 'Indicators scored'}
                value={`${assessment.scoredCount}/15`}
              />
              <Panel title={locale === 'id' ? 'Ringkasan kontribusi' : 'Contribution summary'}>
                <ContributionSummary caseId={caseId} villageId={village.villageId} />
              </Panel>
            </div>
          </div>

          <div className="space-y-3">
            {PILLARS.map((pillar) => {
              const def = PILLAR_DEFINITIONS[pillar]
              const isOpen = openPillar === pillar
              const pillarResult = assessment.pillars.find((p) => p.pillar === pillar)!
              return (
                <Panel
                  key={pillar}
                  title={
                    <button
                      onClick={() => setOpenPillar(isOpen ? null : pillar)}
                      className="flex w-full items-center gap-2 text-left"
                    >
                      <span style={{ color: 'var(--text-muted)' }}>{isOpen ? '▾' : '▸'}</span>
                      <span>{def.name[locale]}</span>
                      <Badge tone="neutral">{Math.round(def.weight * 100)}%</Badge>
                      <span className="ml-auto flex items-center gap-2 text-xs font-normal">
                        <Score value={pillarResult.score} size="sm" />
                        <span style={{ color: 'var(--text-muted)' }}>
                          {pillarResult.scoredIndicators}/3
                        </span>
                      </span>
                    </button>
                  }
                  subtitle={isOpen ? def.summary[locale] : undefined}
                >
                  {isOpen && (
                    <div className="space-y-3">
                      {PILLAR_INDICATORS[pillar].map((code) => (
                        <IndicatorCard
                          key={code}
                          caseId={caseId}
                          villageId={village.villageId}
                          indicator={code}
                          result={assessment.indicators.find((i) => i.indicator === code)!}
                        />
                      ))}
                    </div>
                  )}
                </Panel>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Contribution summary
// ---------------------------------------------------------------------------

function ContributionSummary({ caseId, villageId }: { caseId: string; villageId: string }) {
  const { locale } = useT()
  const assessments = useProjectStore((s) => s.cases[caseId]?.assessments)

  const counts = useMemo(() => {
    const map = new Map<ContributionCategory, number>()
    for (const code of INDICATORS.map((i) => i.code)) {
      const a = assessments?.[assessmentKey(villageId, code)]
      if (a?.contribution) map.set(a.contribution, (map.get(a.contribution) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [assessments, villageId])

  if (counts.length === 0) {
    return (
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {locale === 'id'
          ? 'Belum ada kategori kontribusi yang ditetapkan.'
          : 'No contribution categories assigned yet.'}
      </p>
    )
  }

  return (
    <ul className="space-y-1.5 text-xs">
      {counts.map(([category, count]) => (
        <li key={category} className="flex items-center justify-between gap-2">
          <span>{CONTRIBUTION_DEFINITIONS[category].label[locale]}</span>
          <span className="tnum" style={{ color: 'var(--text-muted)' }}>
            {count}
          </span>
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// One indicator card
// ---------------------------------------------------------------------------

function IndicatorCard({
  caseId,
  villageId,
  indicator,
  result,
}: {
  caseId: string
  villageId: string
  indicator: IndicatorCode
  result: {
    score: number | null
    coverage: number
    confidence: ConfidenceGrade
    confidenceRationale: string
    assessment: ReturnType<typeof useVillageAssessment> extends null ? never : any
  }
}) {
  const { locale, tr } = useT()
  const [expanded, setExpanded] = useState(false)
  const def = INDICATORS_BY_CODE[indicator]

  const ensureAssessment = useProjectStore((s) => s.ensureAssessment)
  const setAbcdComponent = useProjectStore((s) => s.setAbcdComponent)
  const updateAssessment = useProjectStore((s) => s.updateAssessment)
  const setConfidence = useProjectStore((s) => s.setConfidence)

  const a = result.assessment

  const open = () => {
    if (!a) ensureAssessment(caseId, villageId, indicator)
    setExpanded(!expanded)
  }

  return (
    <div className="rounded border" style={{ borderColor: 'var(--border)' }}>
      <button onClick={open} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
        <Badge tone="neutral">{indicator}</Badge>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium">{def.name[locale]}</span>
          <span className="block truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {def.question[locale]}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <CoverageMeter coverage={result.coverage} showLabel={false} />
          <ConfidenceBadge grade={result.confidence} overridden={a?.confidenceOverridden} />
          <Score value={result.score} size="sm" />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {expanded ? '▾' : '▸'}
          </span>
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t px-3 py-3" style={{ borderColor: 'var(--border)' }}>
          {/* The interpretive limit sits at the top of the card, before the
              inputs — it is the document's own warning about what this score
              does not establish, and it only works if it is read first. */}
          <MethodNote tone="warning">
            <span className="font-semibold">{tr(STRINGS.scorecard.interpretiveLimit)}: </span>
            {def.interpretiveLimit[locale]}
          </MethodNote>

          <details className="text-[11px]">
            <summary className="cursor-pointer font-medium" style={{ color: 'var(--text-secondary)' }}>
              {tr(STRINGS.dictionary.rationale)}, {tr(STRINGS.dictionary.minimumVariables)},{' '}
              {tr(STRINGS.scorecard.minimumEvidence)}
            </summary>
            <div className="mt-2 space-y-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <span className="font-medium">{tr(STRINGS.dictionary.rationale)}: </span>
                {def.rationale[locale]}
              </p>
              <p>
                <span className="font-medium">{tr(STRINGS.dictionary.minimumVariables)}: </span>
                {def.minimumVariables[locale]}
              </p>
              <p>
                <span className="font-medium">{tr(STRINGS.scorecard.minimumEvidence)}: </span>
                {def.minimumEvidencePackage[locale]}
              </p>
              <p>
                <span className="font-medium">{tr(STRINGS.dictionary.secondarySources)}: </span>
                {def.secondarySources.join(', ')}
              </p>
              <p>
                <span className="font-medium">{tr(STRINGS.dictionary.remoteValidation)}: </span>
                {def.remoteValidation[locale]}
              </p>
            </div>
          </details>

          {/* A/C/M/I/O ratings */}
          <div className="space-y-3">
            {ABCD_COMPONENT_DEFINITIONS.map((comp) => {
              const value = a?.components?.[comp.code] ?? null
              return (
                <div key={comp.code}>
                  <div className="mb-1 flex items-baseline gap-2">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold"
                      style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}
                    >
                      {comp.code}
                    </span>
                    <span className="min-w-0 flex-1 text-xs font-medium">{comp.name[locale]}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {Math.round(comp.weight * 100)}%
                    </span>
                  </div>
                  <p className="mb-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {comp.question[locale]}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {RATING_ANCHORS.map((anchor) => {
                      const active = value === anchor.value
                      return (
                        <button
                          key={anchor.value}
                          onClick={() =>
                            setAbcdComponent(caseId, villageId, indicator, comp.code as AbcdComponent, anchor.value)
                          }
                          className="rounded px-2 py-1 text-[11px] font-medium"
                          style={{
                            background: active ? 'var(--accent)' : 'var(--surface-sunken)',
                            color: active ? '#fff' : 'var(--text-secondary)',
                          }}
                          title={anchor[locale]}
                        >
                          {anchor.value}
                        </button>
                      )
                    })}
                    <button
                      onClick={() =>
                        setAbcdComponent(caseId, villageId, indicator, comp.code as AbcdComponent, null)
                      }
                      className="rounded px-2 py-1 text-[11px] font-medium"
                      style={{
                        background: value === null ? 'var(--na)' : 'var(--surface-sunken)',
                        color: value === null ? '#fff' : 'var(--na)',
                      }}
                      title={tr(STRINGS.common.naFull)}
                    >
                      NA
                    </button>
                    {value !== null && (
                      <span className="ml-1 self-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {RATING_ANCHORS.find((r) => r.value === value)?.[locale]}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div
            className="flex items-center justify-between rounded px-3 py-2"
            style={{ background: 'var(--surface-sunken)' }}
          >
            <span className="text-xs font-medium">{tr(STRINGS.common.score)}</span>
            <div className="flex items-center gap-3">
              <CoverageMeter coverage={result.coverage} />
              <Score value={result.score} />
            </div>
          </div>

          {/* Evidence tiers and sources */}
          <div>
            <span className="mb-1 block text-xs font-medium">{tr(STRINGS.common.tiers)}</span>
            <div className="flex flex-wrap gap-1">
              {EVIDENCE_TIERS.map((tier) => {
                const active = a?.tiers?.includes(tier) ?? false
                const intensity = def.intensity[tier]
                return (
                  <button
                    key={tier}
                    onClick={() =>
                      updateAssessment(caseId, villageId, indicator, {
                        tiers: active
                          ? (a?.tiers ?? []).filter((t: EvidenceTier) => t !== tier)
                          : [...(a?.tiers ?? []), tier],
                      })
                    }
                    className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={{
                      background: active ? 'var(--accent)' : 'var(--surface-sunken)',
                      color: active ? '#fff' : 'var(--text-secondary)',
                      opacity: intensity === 'N' ? 0.45 : 1,
                    }}
                    title={`${EVIDENCE_TIER_DEFINITIONS[tier].definition[locale]} — default intensity: ${intensity}`}
                  >
                    {tier}
                    <span className="ml-1 opacity-70">{intensity}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              M = main · R = required · S = supporting · C = conditional · N = not normally required
            </p>
          </div>

          <Field label={tr(STRINGS.common.sources)}>
            <Select
              value=""
              onChange={(v) => {
                if (v && !(a?.sources ?? []).includes(v)) {
                  updateAssessment(caseId, villageId, indicator, {
                    sources: [...(a?.sources ?? []), v],
                  })
                }
              }}
              options={SOURCES.map((s) => ({ value: s.id, label: `${s.id} — ${s.name}` }))}
              placeholder={locale === 'id' ? 'Tambah sumber…' : 'Add source…'}
            />
          </Field>
          {(a?.sources?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {a.sources.map((id: string) => (
                <button
                  key={id}
                  onClick={() =>
                    updateAssessment(caseId, villageId, indicator, {
                      sources: a.sources.filter((s: string) => s !== id),
                    })
                  }
                >
                  <Badge tone="neutral">{id} ×</Badge>
                </button>
              ))}
            </div>
          )}

          {/* Contribution — the separate layer */}
          <div className="rounded border px-2.5 py-2" style={{ borderColor: 'var(--border)' }}>
            <Field
              label={tr(STRINGS.scorecard.contribution)}
              hint={
                locale === 'id'
                  ? 'Dinilai terpisah; tidak memengaruhi skor kekuatan aset.'
                  : 'Assessed separately; does not affect the asset-strength score.'
              }
            >
              <Select
                value={a?.contribution ?? ''}
                onChange={(v) =>
                  updateAssessment(caseId, villageId, indicator, {
                    contribution: (v || null) as ContributionCategory | null,
                  })
                }
                options={CONTRIBUTION_CATEGORIES.map((c) => ({
                  value: c,
                  label: CONTRIBUTION_DEFINITIONS[c].label[locale],
                }))}
                placeholder={tr(STRINGS.common.notAssessed)}
              />
            </Field>
            {a?.contribution && (
              <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {CONTRIBUTION_DEFINITIONS[a.contribution as ContributionCategory].definition[locale]}
              </p>
            )}
            <div className="mt-2">
              <Field label={locale === 'id' ? 'Catatan atribusi' : 'Attribution note'}>
                <TextArea
                  value={a?.contributionNote ?? ''}
                  onChange={(v) =>
                    updateAssessment(caseId, villageId, indicator, { contributionNote: v })
                  }
                  rows={2}
                  placeholder={
                    locale === 'id'
                      ? 'Kronologi, pembiayaan, aktor pelaksana, penjelasan alternatif…'
                      : 'Chronology, financing, implementing actor, alternative explanations…'
                  }
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={tr(STRINGS.scorecard.beneficiaries)}>
              <TextArea
                value={a?.beneficiaries ?? ''}
                onChange={(v) => updateAssessment(caseId, villageId, indicator, { beneficiaries: v })}
                rows={2}
              />
            </Field>
            <Field label={tr(STRINGS.scorecard.evidenceGaps)}>
              <TextArea
                value={a?.evidenceGaps ?? ''}
                onChange={(v) => updateAssessment(caseId, villageId, indicator, { evidenceGaps: v })}
                rows={2}
              />
            </Field>
          </div>

          <div className="space-y-1.5">
            <Checkbox
              checked={a?.advocacyCritical ?? false}
              onChange={(v) => updateAssessment(caseId, villageId, indicator, { advocacyCritical: v })}
              label={
                <span>
                  {tr(STRINGS.scorecard.advocacyCritical)}{' '}
                  <span style={{ color: 'var(--text-muted)' }}>
                    —{' '}
                    {locale === 'id'
                      ? 'memicu validasi jika confidence C atau D'
                      : 'triggers validation if confidence is C or D'}
                  </span>
                </span>
              }
            />
            <Checkbox
              checked={a?.hasContradiction ?? false}
              onChange={(v) => updateAssessment(caseId, villageId, indicator, { hasContradiction: v })}
              label={tr(STRINGS.scorecard.contradiction)}
            />
          </div>

          {a?.hasContradiction && (
            <Field label={locale === 'id' ? 'Uraian kontradiksi' : 'Contradiction detail'} required>
              <TextArea
                value={a?.contradictionNote ?? ''}
                onChange={(v) =>
                  updateAssessment(caseId, villageId, indicator, { contradictionNote: v })
                }
                rows={2}
              />
            </Field>
          )}

          {/* Confidence, kept visually separate from the score above */}
          <div className="rounded border px-2.5 py-2" style={{ borderColor: 'var(--border)' }}>
            <Field
              label={tr(STRINGS.common.confidence)}
              hint={result.confidenceRationale}
            >
              <Select
                value={a?.confidenceOverridden ? (a?.confidence ?? '') : ''}
                onChange={(v) =>
                  setConfidence(
                    caseId,
                    villageId,
                    indicator,
                    (v || null) as ConfidenceGrade | null,
                    v !== '',
                  )
                }
                options={CONFIDENCE_GRADES.map((g) => ({ value: g, label: g }))}
                placeholder={`${tr(STRINGS.common.proposed)}: ${result.confidence}`}
              />
            </Field>
          </div>

          <Field label={tr(STRINGS.common.notes)}>
            <TextArea
              value={a?.notes ?? ''}
              onChange={(v) => updateAssessment(caseId, villageId, indicator, { notes: v })}
              rows={2}
            />
          </Field>
        </div>
      )}
    </div>
  )
}
