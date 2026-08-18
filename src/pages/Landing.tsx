/**
 * Landing page.
 *
 * Serves two audiences on one scroll: a presentation hero for people meeting
 * the tool for the first time, then the workflow and method detail an analyst
 * wants. Every figure and label on this page is read from the method data in
 * src/reference and src/i18n rather than retyped, so the page cannot drift
 * from the tool it describes.
 */

import { Link } from 'react-router-dom'
import { STRINGS } from '@/i18n/strings'
import { Logo, ThemeToggle } from '@/components/brand'
import { useTheme } from '@/hooks/useTheme'
import { MethodNote, Panel, Badge } from '@/components/ui'
import { WORKFLOW_STEPS, REFERENCE_MODULES } from '@/modules/registry'
import { POCI_COMPONENT_DEFINITIONS, EVIDENCE_TIER_DEFINITIONS } from '@/reference/framework'
import { PILLAR_DEFINITIONS, INDICATORS } from '@/reference/indicators'
import { PILLARS, EVIDENCE_TIERS } from '@/domain/types'

function OpenWorkspace({ variant = 'primary' }: { variant?: 'primary' | 'quiet' }) {
  const primary = variant === 'primary'
  return (
    <Link
      to="/app"
      className={`inline-flex items-center justify-center rounded-md font-medium ${
        primary ? 'min-h-11 px-5 text-base' : 'min-h-9 px-4 text-sm'
      }`}
      style={
        primary
          ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
          : {
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              background: 'var(--surface-1)',
            }
      }
    >
      Open the workspace
    </Link>
  )
}

function SectionHeading({ overline, title }: { overline: string; title: string }) {
  return (
    <div className="mb-5">
      <div
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--accent)' }}
      >
        {overline}
      </div>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  )
}

export default function Landing() {
  const { theme, setTheme } = useTheme()

  return (
    // Deliberately not `h-full overflow-auto`. The workspace needs a fixed
    // viewport with its own scrolling pane, but a long marketing page should
    // scroll at the document level so native scroll restoration and mobile
    // URL bar collapse behave normally.
    <div className="min-h-full">
      <header
        className="sticky top-0 z-10 border-b backdrop-blur"
        style={{ background: 'color-mix(in srgb, var(--surface-1) 88%, transparent)', borderColor: 'var(--border)' }}
      >
        <div className="page flex items-center gap-3 px-4 py-3">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <OpenWorkspace variant="quiet" />
          </div>
        </div>
      </header>

      {/* Hero. The one place on the site where presentation outranks density. */}
      <section className="page px-4 pb-14 pt-16 md:pb-20 md:pt-24">
        <div className="max-w-3xl">
          <Badge tone="accent">CPOPC Output 11</Badge>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Which palm oil communities to assess, and what the evidence actually supports
          </h1>
          <p
            className="mt-5 text-lg leading-relaxed md:text-xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            {STRINGS.appName} is a remote-first workspace for two linked instruments. POCI screens
            how strongly a community is functionally linked to palm oil operations. The ABCD
            Scorecard measures the strength of that community's own assets across five pillars.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <OpenWorkspace />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No sign in required. Work is saved in your browser.
            </span>
          </div>
        </div>
      </section>

      {/* The two instruments. */}
      <section className="page px-4 pb-14">
        <SectionHeading overline="What it measures" title="Two instruments, kept apart" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="POCI, Palm Oil Community Influence Index"
            subtitle="A screening instrument. Five weighted components decide which communities are worth assessing."
          >
            <ul className="space-y-3">
              {POCI_COMPONENT_DEFINITIONS.map((c) => (
                <li key={c.code} className="flex gap-3">
                  <span
                    className="tnum mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    {c.code}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className="tnum text-xs" style={{ color: 'var(--text-muted)' }}>
                        weight {c.weight.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {c.definition}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="The ABCD Scorecard"
            subtitle={`Asset strength across five pillars and ${INDICATORS.length} core indicators, each rated on five dimensions.`}
          >
            <ul className="space-y-3">
              {PILLARS.map((code) => {
                const pillar = PILLAR_DEFINITIONS[code]
                return (
                  <li key={code} className="flex gap-3">
                    <span
                      className="mt-0.5 inline-flex h-6 shrink-0 items-center justify-center rounded px-1.5 text-xs font-bold"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      {code}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">{pillar.name}</span>
                        <span className="tnum text-xs" style={{ color: 'var(--text-muted)' }}>
                          {Math.round(pillar.weight * 100)}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {pillar.summary}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Panel>
        </div>
      </section>

      {/* Workflow, mirroring the workspace tab bar. */}
      <section className="page px-4 pb-14">
        <SectionHeading overline="How it works" title="Five steps, then the reference layer" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {WORKFLOW_STEPS.map(({ key, step }) => (
            <div key={key} className="surface rounded-lg p-4">
              <span
                className="tnum inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                {step}
              </span>
              <div className="mt-3 text-sm font-semibold">{STRINGS.nav[key]}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Supported throughout by
          </span>
          {REFERENCE_MODULES.map(({ key }) => (
            <Badge key={key} tone="neutral">
              {STRINGS.nav[key]}
            </Badge>
          ))}
        </div>
      </section>

      {/* Evidence tiers. Explains what "remote-first" actually means. */}
      <section className="page px-4 pb-14">
        <SectionHeading overline="Evidence" title="Every score carries its evidence tier" />
        <p className="mb-5 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Scores are never shown on their own. Each one is paired with how much evidence backs it
          and how far that evidence can be trusted, so a confident reading and a thin one can never
          look the same.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {EVIDENCE_TIERS.map((tier) => {
            const def = EVIDENCE_TIER_DEFINITIONS[tier]
            return (
              <div key={tier} className="surface rounded-lg p-4">
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  {tier}
                </span>
                <div className="mt-2 text-sm font-semibold">{def.label}</div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {def.definition}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Method cautions. The reason this page is worth having. */}
      <section className="page px-4 pb-16">
        <SectionHeading overline="Read this first" title="What these scores do not establish" />
        <div className="grid gap-3 lg:grid-cols-2">
          <MethodNote tone="warning">{STRINGS.screening.missingDataRule}</MethodNote>
          <MethodNote tone="warning">{STRINGS.scorecard.intro}</MethodNote>
          <MethodNote>{STRINGS.screening.intro}</MethodNote>
          <MethodNote>{STRINGS.scorecard.contributionSeparate}</MethodNote>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="page flex flex-col gap-4 px-4 py-8 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-semibold">{STRINGS.appName}</div>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {STRINGS.appSubtitle}. Prepared as CPOPC Output 11.
            </p>
          </div>
          <div className="md:ml-auto">
            <OpenWorkspace />
          </div>
        </div>
      </footer>
    </div>
  )
}
