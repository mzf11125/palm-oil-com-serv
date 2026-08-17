import { useEffect, useState } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useT } from '@/i18n/useLocale'
import { useProjectStore } from '@/store/project'
import { loadCaseIndex } from '@/data/load'
import type { CaseSummary } from '@/data/types'
import { ConcessionExplorer } from '@/modules/ConcessionExplorer'
import { PociScreening } from '@/modules/PociScreening'
import { PortfolioSelection } from '@/modules/PortfolioSelection'
import { AbcdScorecard } from '@/modules/AbcdScorecard'
import { ValidationQueue } from '@/modules/ValidationQueue'
import { EvidenceRegister } from '@/modules/EvidenceRegister'
import { IndicatorDictionary } from '@/modules/IndicatorDictionary'
import { ExportsReport } from '@/modules/ExportsReport'

export type ModuleKey =
  | 'concessions'
  | 'screening'
  | 'portfolio'
  | 'scorecard'
  | 'validation'
  | 'evidence'
  | 'dictionary'
  | 'exports'

/**
 * Module order follows the method's own workflow: concession -> candidate
 * universe -> portfolio -> assessment -> validation. Reference modules sit
 * after the working ones.
 */
const MODULES: { key: ModuleKey; step?: number }[] = [
  { key: 'concessions', step: 1 },
  { key: 'screening', step: 2 },
  { key: 'portfolio', step: 3 },
  { key: 'scorecard', step: 4 },
  { key: 'validation', step: 5 },
  { key: 'evidence' },
  { key: 'dictionary' },
  { key: 'exports' },
]

type Theme = 'light' | 'dark' | 'system'

function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('abcds-rf-theme') as Theme) ?? 'system',
  )
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    localStorage.setItem('abcds-rf-theme', theme)
  }, [theme])
  return { theme, setTheme }
}

export default function App() {
  const { locale, setLocale, tr } = useT()
  const { theme, setTheme } = useTheme()
  const [module, setModule] = useState<ModuleKey>('concessions')
  const [cases, setCases] = useState<CaseSummary[]>([])
  const activeCaseId = useProjectStore((s) => s.activeCaseId)
  const setActiveCase = useProjectStore((s) => s.setActiveCase)

  useEffect(() => {
    loadCaseIndex()
      .then((idx) => {
        setCases(idx.cases)
        // Land on a case so the workspace is usable immediately rather than
        // requiring a selection before anything renders.
        if (!useProjectStore.getState().activeCaseId && idx.cases[0]) {
          setActiveCase(idx.cases[0].caseId)
        }
      })
      .catch(() => setCases([]))
  }, [setActiveCase])

  const activeCase = cases.find((c) => c.caseId === activeCaseId) ?? null

  const goToCase = (caseId: string) => {
    setActiveCase(caseId)
    setModule('screening')
  }

  return (
    <div className="flex h-full flex-col">
      <header
        className="no-print flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold tracking-tight">{STRINGS.appName[locale]}</span>
          <span className="hidden text-xs sm:inline" style={{ color: 'var(--text-muted)' }}>
            {tr(STRINGS.appSubtitle)}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {cases.length > 0 && (
            <select
              value={activeCaseId ?? ''}
              onChange={(e) => setActiveCase(e.target.value)}
              className="max-w-[16rem] truncate rounded px-2 py-1 text-xs"
              style={{
                background: 'var(--surface-1)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-strong)',
              }}
              title="Active case cluster"
            >
              {cases.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.poCom} — {c.district}
                </option>
              ))}
            </select>
          )}

          <div className="flex rounded border" style={{ borderColor: 'var(--border-strong)' }}>
            {(['id', 'en'] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className="px-2 py-1 text-xs font-medium uppercase"
                style={{
                  background: locale === code ? 'var(--accent)' : 'transparent',
                  color: locale === code ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
            className="rounded border px-2 py-1 text-xs"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            title={`Theme: ${theme}`}
          >
            {theme === 'dark' ? '◐' : theme === 'light' ? '○' : '◑'}
          </button>
        </div>
      </header>

      <nav
        className="no-print flex shrink-0 gap-0.5 overflow-x-auto border-b px-2"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        {MODULES.map(({ key, step }) => {
          const active = module === key
          return (
            <button
              key={key}
              onClick={() => setModule(key)}
              className="relative shrink-0 whitespace-nowrap px-3 py-2 text-xs font-medium"
              style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              {step && (
                <span
                  className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] tnum"
                  style={{
                    background: active ? 'var(--accent)' : 'var(--surface-sunken)',
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {step}
                </span>
              )}
              {tr(STRINGS.nav[key])}
              {active && (
                <span
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-t"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <main className="min-h-0 flex-1 overflow-auto thin-scroll">
        {module === 'concessions' && <ConcessionExplorer cases={cases} onOpenCase={goToCase} />}
        {module === 'screening' && <PociScreening caseId={activeCaseId} />}
        {module === 'portfolio' && <PortfolioSelection caseId={activeCaseId} />}
        {module === 'scorecard' && <AbcdScorecard caseId={activeCaseId} />}
        {module === 'validation' && <ValidationQueue caseId={activeCaseId} />}
        {module === 'evidence' && <EvidenceRegister caseId={activeCaseId} />}
        {module === 'dictionary' && <IndicatorDictionary />}
        {module === 'exports' && <ExportsReport caseId={activeCaseId} caseSummary={activeCase} />}
      </main>
    </div>
  )
}
