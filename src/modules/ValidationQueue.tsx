/**
 * Module 5 — Validation Queue.
 *
 * Items are derived, not hand-created: every entry names the trigger that
 * produced it, which is what makes the escalation defensible. The proposal
 * requires that "every P-R/P-L/P-C activity [is] linked to a specific evidence
 * gap or claim", so an item with no trigger cannot exist by construction.
 */

import { useMemo, useState } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useT } from '@/i18n/useLocale'
import { useCase, useSeedScreening, useScreenedVillages, useValidationSync } from '@/hooks/useCaseData'
import { useProjectStore } from '@/store/project'
import { TRIGGERS, ASSESSMENT_TIERS } from '@/domain/validation'
import { VALIDATION_TIERS, type ValidationTier } from '@/domain/types'
import { EVIDENCE_TIER_DEFINITIONS } from '@/reference/framework'
import { INDICATORS_BY_CODE } from '@/reference/indicators'
import {
  Panel,
  Empty,
  MethodNote,
  Badge,
  Select,
  TextInput,
  TextArea,
  StatTile,
  Button,
} from '@/components/ui'
import type { ValidationRecord } from '@/store/types'

const TIER_TONE: Record<ValidationTier, 'muted' | 'accent' | 'warning' | 'critical'> = {
  none: 'muted',
  'P-R': 'accent',
  'P-L': 'warning',
  'P-C': 'critical',
}

const STATUS_TONE = {
  open: 'warning',
  'in-progress': 'accent',
  resolved: 'good',
  dismissed: 'muted',
} as const

export function ValidationQueue({ caseId }: { caseId: string | null }) {
  const { locale, tr } = useT()
  const { data: caseData, loading } = useCase(caseId)
  useSeedScreening(caseData)
  const villages = useScreenedVillages(caseData)

  const selected = useMemo(() => villages.filter((v) => v.screening?.selected), [villages])
  const derived = useValidationSync(caseId, selected)

  const records = useProjectStore((s) => (caseId ? s.cases[caseId]?.validation : undefined))
  const updateValidation = useProjectStore((s) => s.updateValidation)
  const setValidationTier = useProjectStore((s) => s.setValidationTier)

  const [tierFilter, setTierFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const rows = useMemo(() => {
    const byId = new Map(derived.map((d) => [d.id, d]))
    return derived
      .map((item) => ({ item, record: records?.[item.id] }))
      .filter(({ item, record }) => {
        const tier = record?.tier ?? item.tier
        if (tierFilter && tier !== tierFilter) return false
        if (statusFilter && (record?.status ?? 'open') !== statusFilter) return false
        return byId.has(item.id)
      })
      // Highest escalation first: P-C costs the most and needs deciding first.
      .sort((a, b) => {
        const order = { 'P-C': 0, 'P-L': 1, 'P-R': 2, none: 3 }
        const at = a.record?.tier ?? a.item.tier
        const bt = b.record?.tier ?? b.item.tier
        return order[at] - order[bt]
      })
  }, [derived, records, tierFilter, statusFilter])

  const stats = useMemo(() => {
    const counts = { 'P-R': 0, 'P-L': 0, 'P-C': 0, none: 0 }
    let open = 0
    for (const item of derived) {
      const record = records?.[item.id]
      counts[record?.tier ?? item.tier]++
      if ((record?.status ?? 'open') === 'open') open++
    }
    return { counts, open, total: derived.length }
  }, [derived, records])

  if (!caseId) return <Empty>{locale === 'id' ? 'Pilih case cluster.' : 'Select a case cluster.'}</Empty>
  if (loading || !caseData) {
    return <div className="p-6 text-sm" style={{ color: 'var(--text-muted)' }}>{tr(STRINGS.common.loading)}</div>
  }

  return (
    <div className="space-y-4 p-4">
      <Panel title={tr(STRINGS.validation.title)} subtitle={caseData.poCom}>
        <div className="space-y-3">
          <MethodNote>{tr(STRINGS.validation.intro)}</MethodNote>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatTile
              label={locale === 'id' ? 'Total item' : 'Total items'}
              value={stats.total}
              hint={`${stats.open} ${locale === 'id' ? 'terbuka' : 'open'}`}
            />
            <StatTile label="P-R" value={stats.counts['P-R']} hint={locale === 'id' ? 'remote' : 'remote'} />
            <StatTile label="P-L" value={stats.counts['P-L']} hint={locale === 'id' ? 'lokal' : 'local'} />
            <StatTile label="P-C" value={stats.counts['P-C']} hint={locale === 'id' ? 'sentinel' : 'sentinel'} />
            <StatTile label="—" value={stats.counts.none} hint={locale === 'id' ? 'tanpa eskalasi' : 'no escalation'} />
          </div>
        </div>
      </Panel>

      <Panel
        title={locale === 'id' ? 'Antrean' : 'Queue'}
        subtitle={`${rows.length} ${tr(STRINGS.common.of)} ${derived.length}`}
        actions={
          <div className="flex gap-2">
            <div className="w-28">
              <Select
                value={tierFilter}
                onChange={(v) => setTierFilter(v)}
                options={VALIDATION_TIERS.map((t) => ({ value: t, label: t }))}
                placeholder={`${tr(STRINGS.common.all)} tier`}
              />
            </div>
            <div className="w-32">
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                options={(['open', 'in-progress', 'resolved', 'dismissed'] as const).map((s) => ({
                  value: s,
                  label: tr(STRINGS.validation.statuses[s]),
                }))}
                placeholder={`${tr(STRINGS.common.all)} status`}
              />
            </div>
          </div>
        }
      >
        {rows.length === 0 ? (
          <Empty>{tr(STRINGS.validation.empty)}</Empty>
        ) : (
          <div className="space-y-2">
            {rows.map(({ item, record }) => {
              const current: ValidationRecord = record ?? {
                id: item.id,
                status: 'open',
                tier: item.tier,
                tierOverridden: false,
                assignee: '',
                note: '',
                resolution: '',
              }
              const isOpen = expanded === item.id
              const trigger = TRIGGERS[item.trigger]

              return (
                <div key={item.id} className="rounded border" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left"
                  >
                    <Badge tone={TIER_TONE[current.tier]}>
                      {current.tier === 'none' ? '—' : current.tier}
                      {current.tierOverridden && '*'}
                    </Badge>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2 text-xs">
                        <span className="font-medium">{item.villageName}</span>
                        {item.indicator && (
                          <span style={{ color: 'var(--text-muted)' }}>
                            {item.indicator} — {INDICATORS_BY_CODE[item.indicator].name[locale]}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {item.detail}
                      </span>
                    </span>
                    <Badge tone={STATUS_TONE[current.status]}>
                      {tr(STRINGS.validation.statuses[current.status])}
                    </Badge>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {isOpen ? '▾' : '▸'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-3 border-t px-3 py-3" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <span className="text-[11px] font-medium">{tr(STRINGS.validation.trigger)}: </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          {trigger[locale]}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium">{tr(STRINGS.validation.tier)}</span>
                          <Select
                            value={current.tier}
                            onChange={(v) => v && setValidationTier(caseId, item.id, v as ValidationTier)}
                            options={VALIDATION_TIERS.map((t) => ({
                              value: t,
                              label:
                                t === 'none'
                                  ? locale === 'id'
                                    ? 'Tanpa eskalasi'
                                    : 'No escalation'
                                  : `${t} — ${EVIDENCE_TIER_DEFINITIONS[t].label[locale]}`,
                            }))}
                          />
                          {current.tier !== item.tier && (
                            <span className="mt-1 block text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {locale === 'id' ? 'Default pemicu' : 'Trigger default'}: {item.tier}
                            </span>
                          )}
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-xs font-medium">{tr(STRINGS.validation.status)}</span>
                          <Select
                            value={current.status}
                            onChange={(v) =>
                              v && updateValidation(caseId, item.id, { status: v as ValidationRecord['status'] })
                            }
                            options={(['open', 'in-progress', 'resolved', 'dismissed'] as const).map((s) => ({
                              value: s,
                              label: tr(STRINGS.validation.statuses[s]),
                            }))}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-xs font-medium">{tr(STRINGS.validation.assignee)}</span>
                          <TextInput
                            value={current.assignee}
                            onChange={(v) => updateValidation(caseId, item.id, { assignee: v })}
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-xs font-medium">{tr(STRINGS.common.notes)}</span>
                        <TextArea
                          value={current.note}
                          onChange={(v) => updateValidation(caseId, item.id, { note: v })}
                          rows={2}
                        />
                      </label>

                      {(current.status === 'resolved' || current.status === 'dismissed') && (
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium">
                            {tr(STRINGS.validation.resolution)}
                          </span>
                          <TextArea
                            value={current.resolution}
                            onChange={(v) => updateValidation(caseId, item.id, { resolution: v })}
                            rows={2}
                            placeholder={
                              locale === 'id'
                                ? 'Bukti apa yang menyelesaikan gap ini?'
                                : 'What evidence closed this gap?'
                            }
                          />
                        </label>
                      )}

                      {current.status === 'open' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateValidation(caseId, item.id, { status: 'in-progress' })}
                          >
                            {locale === 'id' ? 'Mulai' : 'Start'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateValidation(caseId, item.id, { status: 'dismissed' })}
                          >
                            {locale === 'id' ? 'Tutup' : 'Dismiss'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      <Panel
        title={locale === 'id' ? 'Intensitas assessment' : 'Assessment intensity'}
        subtitle={
          locale === 'id'
            ? 'Tier A–D sesuai desain remote-first dan targeted validation.'
            : 'Tiers A–D per the remote-first and targeted-validation design.'
        }
      >
        <div className="table-scroll">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th className="px-2 py-2 text-left font-medium">Tier</th>
                <th className="px-2 py-2 text-left font-medium">{locale === 'id' ? 'Cakupan' : 'Scope'}</th>
                <th className="px-2 py-2 text-left font-medium">{locale === 'id' ? 'Bukti' : 'Evidence'}</th>
                <th className="px-2 py-2 text-left font-medium">{locale === 'id' ? 'Tujuan' : 'Purpose'}</th>
                <th className="px-2 py-2 text-left font-medium">{locale === 'id' ? 'Beban lapangan' : 'Field burden'}</th>
              </tr>
            </thead>
            <tbody>
              {ASSESSMENT_TIERS.map((t) => (
                <tr key={t.tier} className="border-t align-top" style={{ borderColor: 'var(--gridline)' }}>
                  <td className="px-2 py-2 font-medium">{t.tier}</td>
                  <td className="px-2 py-2">{t.scope[locale]}</td>
                  <td className="px-2 py-2" style={{ color: 'var(--text-secondary)' }}>{t.evidence}</td>
                  <td className="px-2 py-2" style={{ color: 'var(--text-secondary)' }}>{t.purpose[locale]}</td>
                  <td className="px-2 py-2" style={{ color: 'var(--text-muted)' }}>{t.fieldBurden[locale]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
