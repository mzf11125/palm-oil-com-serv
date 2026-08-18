import { useEffect, useState } from 'react'
import { STRINGS } from '@/i18n/strings'
import { useProjectStore } from '@/store/project'
import { loadCaseIndex } from '@/data/load'
import type { CaseSummary } from '@/data/types'
import { MODULES, type ModuleKey } from '@/modules/registry'
import { Logo, ThemeToggle } from '@/components/brand'
import { useTheme } from '@/hooks/useTheme'
import { ConcessionExplorer } from '@/modules/ConcessionExplorer'
import { PociScreening } from '@/modules/PociScreening'
import { PortfolioSelection } from '@/modules/PortfolioSelection'
import { AbcdScorecard } from '@/modules/AbcdScorecard'
import { ValidationQueue } from '@/modules/ValidationQueue'
import { EvidenceRegister } from '@/modules/EvidenceRegister'
import { IndicatorDictionary } from '@/modules/IndicatorDictionary'
import { ExportsReport } from '@/modules/ExportsReport'

export default function Workspace() {
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
        className="no-print shrink-0 border-b"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        <div className="page flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span
              className="hidden text-sm leading-snug lg:inline"
              style={{ color: 'var(--text-muted)' }}
            >
              {STRINGS.appSubtitle}
            </span>
          </div>

          <div className="flex items-center gap-2 md:ml-auto">
            {cases.length > 0 && (
              <select
                value={activeCaseId ?? ''}
                onChange={(e) => setActiveCase(e.target.value)}
                className="min-h-9 w-full truncate rounded px-2 py-1.5 text-sm md:w-auto md:max-w-[18rem]"
                style={{
                  background: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)',
                }}
                aria-label="Active case cluster"
                title="Active case cluster"
              >
                {cases.map((c) => (
                  <option key={c.caseId} value={c.caseId}>
                    {c.poCom}, {c.district}
                  </option>
                ))}
              </select>
            )}

            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      <nav
        className="no-print shrink-0 border-b"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        <div className="page tab-scroll flex gap-0.5 px-2">
          {MODULES.map(({ key, step }) => {
            const active = module === key
            return (
              <button
                key={key}
                onClick={() => setModule(key)}
                aria-current={active ? 'page' : undefined}
                className="relative flex min-h-11 shrink-0 items-center whitespace-nowrap px-3 text-sm font-medium"
                style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}
              >
                {step && (
                  <span
                    className="tnum mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
                    style={{
                      background: active ? 'var(--accent)' : 'var(--surface-sunken)',
                      color: active ? 'var(--accent-ink)' : 'var(--text-muted)',
                    }}
                  >
                    {step}
                  </span>
                )}
                {STRINGS.nav[key]}
                {active && (
                  <span
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-t"
                    style={{ background: 'var(--accent-fill)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="thin-scroll min-h-0 flex-1 overflow-auto">
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
