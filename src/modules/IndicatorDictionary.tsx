/**
 * Module 7 — Indicator Dictionary.
 *
 * Read-only reference rendering of the five-pillar / fifteen-indicator
 * structure from src/reference/indicators.ts.  Every indicator card shows:
 *   - Measurement focus / rationale
 *   - Minimum variables
 *   - Evidence routes per tier (S, G, P-R, P-L, P-C)
 *   - Default evidence intensity per tier (M/R/S/C/N codes from Table 7)
 *   - Interpretive limit (the most important field)
 *
 * Nothing in this module writes to the store.
 */

import { useMemo, useState } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useT } from '@/i18n/useLocale'
import {
  INDICATORS,
  PILLAR_DEFINITIONS,
  type IndicatorDefinition,
} from '@/reference/indicators'
import { Panel, Empty, MethodNote } from '@/components/ui'
import type { EvidenceTier, PillarCode } from '@/domain/types'
import type { Locale } from '@/i18n/strings'

// Evidence intensity code labels (Table 7)
const INTENSITY_LABEL: Record<'M' | 'R' | 'S' | 'C' | 'N', string> = {
  M: 'Mandatory',
  R: 'Recommended',
  S: 'Supplementary',
  C: 'Conditional',
  N: 'Not applicable',
}

const INTENSITY_TONE: Record<'M' | 'R' | 'S' | 'C' | 'N', string> = {
  M: 'var(--status-critical-fg)',
  R: 'var(--status-warning-fg)',
  S: 'var(--status-accent-fg)',
  C: 'var(--text-secondary)',
  N: 'var(--text-muted)',
}

const TIER_COLORS: Record<EvidenceTier, { bg: string; fg: string }> = {
  S:    { bg: 'var(--status-accent-bg)',    fg: 'var(--status-accent-fg)' },
  G:    { bg: 'var(--status-accent-bg)',    fg: 'var(--status-accent-fg)' },
  'P-R':{ bg: 'var(--status-warning-bg)',   fg: 'var(--status-warning-fg)' },
  'P-L':{ bg: 'var(--status-warning-bg)',   fg: 'var(--status-warning-fg)' },
  'P-C':{ bg: 'var(--status-critical-bg)',  fg: 'var(--status-critical-fg)' },
}

const ALL_TIERS: EvidenceTier[] = ['S', 'G', 'P-R', 'P-L', 'P-C']

function TierPill({ tier }: { tier: EvidenceTier }) {
  const { bg, fg } = TIER_COLORS[tier]
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-xs font-mono font-semibold"
      style={{ background: bg, color: fg }}
    >
      {tier}
    </span>
  )
}

// ─── Single indicator card ─────────────────────────────────────────────────

function IndicatorCard({
  indicator,
  locale,
  expanded,
  onToggle,
}: {
  indicator: IndicatorDefinition
  locale: Locale
  expanded: boolean
  onToggle: () => void
}) {
  const { tr } = useT()

  // Which tiers have non-N intensity for this indicator?
  const activeTiers = ALL_TIERS.filter((t) => indicator.intensity[t] !== 'N')

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
    >
      {/* Clickable header */}
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-mono text-xs font-bold shrink-0"
            style={{ color: 'var(--accent)' }}
          >
            {indicator.code}
          </span>
          <span className="font-medium text-sm truncate">{indicator.name[locale]}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {activeTiers.map((tier) => (
            <TierPill key={tier} tier={tier} />
          ))}
          <span
            className="ml-1 text-xs"
            style={{
              color: 'var(--text-muted)',
              display: 'inline-block',
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s',
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div
          className="border-t px-4 pb-4 pt-3 space-y-4"
          style={{ fontSize: '0.75rem', borderColor: 'var(--border)' }}
        >
          {/* Question */}
          <div>
            <p className="italic" style={{ color: 'var(--text-secondary)' }}>
              {indicator.question[locale]}
            </p>
          </div>

          {/* Rationale */}
          <div>
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              {tr(STRINGS.dictionary.rationale)}
            </h4>
            <p style={{ color: 'var(--text-primary)' }}>{indicator.rationale[locale]}</p>
          </div>

          {/* Minimum variables */}
          <div>
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              {tr(STRINGS.dictionary.minimumVariables)}
            </h4>
            <p style={{ color: 'var(--text-primary)' }}>{indicator.minimumVariables[locale]}</p>
          </div>

          {/* Evidence routes */}
          <div className="space-y-2">
            <h4 className="font-semibold" style={{ color: 'var(--text-muted)' }}>
              Evidence routes
            </h4>

            {indicator.secondarySources.length > 0 && (
              <div
                className="rounded border p-2"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TierPill tier="S" />
                  <span className="font-semibold">{tr(STRINGS.dictionary.secondarySources)}</span>
                  <span
                    className="ml-auto text-[10px] font-mono"
                    style={{ color: INTENSITY_TONE[indicator.intensity.S] }}
                  >
                    {INTENSITY_LABEL[indicator.intensity.S]}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {indicator.secondarySources.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {indicator.geoAiSources[locale] && (
              <div
                className="rounded border p-2"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TierPill tier="G" />
                  <span className="font-semibold">{tr(STRINGS.dictionary.geoAi)}</span>
                  <span
                    className="ml-auto text-[10px] font-mono"
                    style={{ color: INTENSITY_TONE[indicator.intensity.G] }}
                  >
                    {INTENSITY_LABEL[indicator.intensity.G]}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>{indicator.geoAiSources[locale]}</p>
              </div>
            )}

            {indicator.remoteValidation[locale] && (
              <div
                className="rounded border p-2"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TierPill tier="P-R" />
                  <span className="font-semibold">{tr(STRINGS.dictionary.remoteValidation)}</span>
                  <span
                    className="ml-auto text-[10px] font-mono"
                    style={{ color: INTENSITY_TONE[indicator.intensity['P-R']] }}
                  >
                    {INTENSITY_LABEL[indicator.intensity['P-R']]}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>{indicator.remoteValidation[locale]}</p>
              </div>
            )}

            {indicator.localVerification[locale] && (
              <div
                className="rounded border p-2"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TierPill tier="P-L" />
                  <span className="font-semibold">{tr(STRINGS.dictionary.localVerification)}</span>
                  <span
                    className="ml-auto text-[10px] font-mono"
                    style={{ color: INTENSITY_TONE[indicator.intensity['P-L']] }}
                  >
                    {INTENSITY_LABEL[indicator.intensity['P-L']]}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>{indicator.localVerification[locale]}</p>
              </div>
            )}

            {indicator.centralFieldTrigger[locale] && (
              <div
                className="rounded border p-2"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TierPill tier="P-C" />
                  <span className="font-semibold">{tr(STRINGS.dictionary.centralField)}</span>
                  <span
                    className="ml-auto text-[10px] font-mono"
                    style={{ color: INTENSITY_TONE[indicator.intensity['P-C']] }}
                  >
                    {INTENSITY_LABEL[indicator.intensity['P-C']]}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>{indicator.centralFieldTrigger[locale]}</p>
              </div>
            )}
          </div>

          {/* Minimum evidence package */}
          {indicator.minimumEvidencePackage[locale] && (
            <div>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                Minimum evidence package
              </h4>
              <p style={{ color: 'var(--text-primary)' }}>
                {indicator.minimumEvidencePackage[locale]}
              </p>
            </div>
          )}

          {/* Interpretive limit — always last */}
          <div
            className="rounded border-l-2 pl-3 py-2"
            style={{
              borderColor: 'var(--warning)',
              background: 'var(--status-warning-bg)',
            }}
          >
            <h4
              className="font-semibold mb-1"
              style={{ color: 'var(--status-warning-fg)', fontSize: '0.75rem' }}
            >
              ⚠ {tr(STRINGS.scorecard.interpretiveLimit)}
            </h4>
            <p style={{ color: 'var(--status-warning-fg)', fontSize: '0.75rem' }}>
              {indicator.interpretiveLimit[locale]}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Pillar group ──────────────────────────────────────────────────────────

function PillarGroup({
  pillarCode,
  indicators,
  locale,
  expandedSet,
  onToggle,
}: {
  pillarCode: PillarCode
  indicators: IndicatorDefinition[]
  locale: Locale
  expandedSet: Set<string>
  onToggle: (code: string) => void
}) {
  const pillar = PILLAR_DEFINITIONS[pillarCode]
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-sm font-bold">{pillar.name[locale]}</h2>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {(pillar.weight * 100).toFixed(0)}%
        </span>
      </div>
      <p className="mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {pillar.summary[locale]}
      </p>
      <div className="space-y-2">
        {indicators.map((ind) => (
          <IndicatorCard
            key={ind.code}
            indicator={ind}
            locale={locale}
            expanded={expandedSet.has(ind.code)}
            onToggle={() => onToggle(ind.code)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────

// Pillar order from domain types
const PILLAR_ORDER: PillarCode[] = ['HUM', 'ASS', 'INS', 'PSN', 'ECO']

export function IndicatorDictionary() {
  const { locale, tr } = useT()
  const [search, setSearch] = useState('')
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set())
  const [pillarFilter, setPillarFilter] = useState<PillarCode | 'ALL'>('ALL')

  const toggleExpanded = (code: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const expandAll = () => setExpandedSet(new Set(INDICATORS.map((i) => i.code)))
  const collapseAll = () => setExpandedSet(new Set())

  const filteredIndicators = useMemo(() => {
    const q = search.toLowerCase()
    return INDICATORS.filter((ind) => {
      if (pillarFilter !== 'ALL' && ind.pillar !== pillarFilter) return false
      if (q === '') return true
      return (
        ind.code.toLowerCase().includes(q) ||
        ind.name.en.toLowerCase().includes(q) ||
        ind.name.id.toLowerCase().includes(q) ||
        ind.rationale.en.toLowerCase().includes(q) ||
        ind.rationale.id.toLowerCase().includes(q)
      )
    })
  }, [search, pillarFilter])

  // Group by pillar in order
  const byPillar = useMemo(() => {
    const map = new Map<PillarCode, IndicatorDefinition[]>()
    for (const ind of filteredIndicators) {
      const arr = map.get(ind.pillar) ?? []
      arr.push(ind)
      map.set(ind.pillar, arr)
    }
    return map
  }, [filteredIndicators])

  const pillarsToShow = PILLAR_ORDER.filter((p) => byPillar.has(p))

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-semibold">{tr(STRINGS.dictionary.title)}</h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {tr(STRINGS.dictionary.intro)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tr(STRINGS.common.search) + ' indicators…'}
          className="rounded border px-2 py-1.5 text-xs flex-1 min-w-32"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border-strong)',
            color: 'var(--text-primary)',
          }}
        />

        {/* Pillar filter pills */}
        <div className="flex gap-1 flex-wrap">
          {(['ALL', ...PILLAR_ORDER] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPillarFilter(p)}
              className="rounded px-2 py-1 text-xs font-medium"
              style={{
                background: pillarFilter === p ? 'var(--accent)' : 'var(--surface-sunken)',
                color: pillarFilter === p ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {p === 'ALL' ? 'All' : p}
            </button>
          ))}
        </div>

        <button
          onClick={expandAll}
          className="rounded px-2 py-1 text-xs"
          style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="rounded px-2 py-1 text-xs"
          style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}
        >
          Collapse all
        </button>

        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {filteredIndicators.length} / {INDICATORS.length}
        </span>
      </div>

      {/* Pillar groups */}
      {pillarsToShow.length === 0 ? (
        <Empty>No indicators match.</Empty>
      ) : (
        <div className="space-y-8">
          {pillarsToShow.map((pillarCode) => (
            <PillarGroup
              key={pillarCode}
              pillarCode={pillarCode}
              indicators={byPillar.get(pillarCode)!}
              locale={locale}
              expandedSet={expandedSet}
              onToggle={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}
