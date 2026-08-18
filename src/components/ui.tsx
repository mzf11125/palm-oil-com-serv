/**
 * Shared UI primitives.
 *
 * The recurring design problem in this application is showing three things at
 * once for every number: the score, how much evidence backs it, and how much
 * that evidence can be trusted. The method insists these stay distinguishable,
 * so the primitives here keep them visually separate — a score is a magnitude
 * on the blue ramp, coverage is a meter, confidence is a letter grade, and
 * missing evidence is achromatic so it can never be misread as "low".
 */

import type { ReactNode } from 'react'
import type { ConfidenceGrade, ExposureBand } from '@/domain/types'

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`surface rounded-lg ${className}`}>
      {(title || actions) && (
        <header className="hairline flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold leading-tight">{title}</h2>}
            {subtitle && (
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

/**
 * A quotation from the methodology, shown where it changes what the analyst
 * should do. These are not decoration: the design documents repeatedly warn
 * against specific misreadings, and the warnings only work at the point of use.
 */
export function MethodNote({
  children,
  tone = 'info',
}: {
  children: ReactNode
  tone?: 'info' | 'warning'
}) {
  const color = tone === 'warning' ? 'var(--status-serious)' : 'var(--accent)'
  return (
    <p
      className="rounded border-l-2 py-2.5 pl-3.5 pr-3 text-sm leading-relaxed"
      style={{
        borderColor: color,
        background: tone === 'warning' ? 'rgba(236,131,90,0.08)' : 'var(--accent-soft)',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </p>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded border border-dashed px-4 py-12 text-center text-sm"
      style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scores and evidence state
// ---------------------------------------------------------------------------

/** Maps 0-100 onto the sequential ramp. */
export function magnitudeColor(value: number): string {
  if (value >= 80) return 'var(--seq-700)'
  if (value >= 60) return 'var(--seq-500)'
  if (value >= 40) return 'var(--seq-450)'
  if (value >= 20) return 'var(--seq-400)'
  return 'var(--seq-250)'
}

export const BAND_COLOR: Record<ExposureBand, string> = {
  high: 'var(--band-high)',
  moderate: 'var(--band-moderate)',
  unbanded: 'var(--band-unbanded)',
  low: 'var(--band-low)',
}

/**
 * A score, or an explicit NA.
 *
 * NA renders achromatic and as text, never as a zero-length bar — the whole
 * method turns on not letting absent evidence look like a low value.
 */
export function Score({
  value,
  size = 'md',
  suffix,
}: {
  value: number | null
  size?: 'sm' | 'md' | 'lg'
  suffix?: string
}) {
  const cls = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-lg'
  if (value === null) {
    return (
      <span className={`${cls} font-medium`} style={{ color: 'var(--na)' }} title="Evidence not available">
        NA
      </span>
    )
  }
  return (
    <span className={`${cls} font-semibold`}>
      {value}
      {suffix && <span className="ml-0.5 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{suffix}</span>}
    </span>
  )
}

/** Horizontal magnitude bar with a 4px rounded data-end anchored at the baseline. */
export function ScoreBar({
  value,
  max = 100,
  label,
  color,
  height = 8,
}: {
  value: number | null
  max?: number
  label?: ReactNode
  color?: string
  height?: number
}) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="w-32 shrink-0 truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
      <div
        className="relative min-w-0 flex-1 overflow-hidden rounded"
        style={{ height, background: 'var(--surface-sunken)' }}
      >
        {value === null ? (
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(135deg, var(--na-fill) 0 4px, transparent 4px 8px)',
            }}
            title="Evidence not available"
          />
        ) : (
          <div
            className="absolute inset-y-0 left-0 rounded-r"
            style={{ width: `${pct}%`, background: color ?? magnitudeColor(value) }}
          />
        )}
      </div>
      <span className="tnum w-10 shrink-0 text-right text-sm" style={{ color: value === null ? 'var(--na)' : 'var(--text-primary)' }}>
        {value === null ? 'NA' : value}
      </span>
    </div>
  )
}

/**
 * Evidence coverage — a ratio against a limit, so a meter rather than a chart.
 * Deliberately rendered in a different visual language from the score bars so
 * "how much evidence" is never confused with "how high the score".
 */
export function CoverageMeter({ coverage, showLabel = true }: { coverage: number; showLabel?: boolean }) {
  const pct = Math.round(coverage * 100)
  const tone =
    pct >= 80 ? 'var(--status-good)' : pct >= 50 ? 'var(--status-warning)' : 'var(--status-serious)'
  return (
    <div className="flex items-center gap-1.5" title={`Evidence coverage ${pct}%`}>
      <div
        className="relative h-1.5 w-14 overflow-hidden rounded-full"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
      {showLabel && (
        <span className="tnum text-xs" style={{ color: 'var(--text-muted)' }}>
          {pct}%
        </span>
      )}
    </div>
  )
}

const CONFIDENCE_TONE: Record<ConfidenceGrade, string> = {
  A: 'var(--status-good)',
  B: 'var(--status-good)',
  C: 'var(--status-warning)',
  D: 'var(--status-critical)',
  NA: 'var(--na)',
}

/**
 * Confidence grade. Shown as a letter, never as color alone — the grades are
 * a defined vocabulary in the method and the letter is the meaning.
 */
export function ConfidenceBadge({ grade, overridden }: { grade: ConfidenceGrade | null; overridden?: boolean }) {
  if (grade === null) {
    return (
      <span className="text-xs" style={{ color: 'var(--na)' }}>
        —
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold"
      style={{ color: CONFIDENCE_TONE[grade], background: 'var(--surface-sunken)' }}
      title={overridden ? 'Analyst override' : 'Proposed by evidence rules'}
    >
      {grade}
      {overridden && <span style={{ color: 'var(--text-muted)' }}>·</span>}
    </span>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  title,
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'good' | 'warning' | 'critical' | 'muted'
  title?: string
}) {
  const map = {
    neutral: { color: 'var(--text-secondary)', background: 'var(--surface-sunken)' },
    accent: { color: 'var(--accent)', background: 'var(--accent-soft)' },
    good: { color: 'var(--status-good)', background: 'rgba(12,163,12,0.12)' },
    warning: { color: 'var(--status-serious)', background: 'rgba(236,131,90,0.14)' },
    critical: { color: 'var(--status-critical)', background: 'rgba(208,59,59,0.12)' },
    muted: { color: 'var(--na)', background: 'var(--na-fill)' },
  }[tone]
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium leading-5"
      style={map}
      title={title}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

export function Button({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled,
  type = 'button',
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
  title?: string
}) {
  const base =
    size === 'sm' ? 'px-2.5 py-1 text-xs rounded min-h-8' : 'px-3.5 py-2 text-sm rounded-md min-h-9'
  const styles = {
    default: { background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' },
    primary: { background: 'var(--accent)', color: 'var(--accent-ink)', border: '1px solid transparent' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
    danger: { background: 'transparent', color: 'var(--status-critical)', border: '1px solid var(--status-critical)' },
  }[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40`}
      style={styles}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: ReactNode
  hint?: ReactNode
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium">
        {label}
        {required && (
          <span className="text-xs font-normal" style={{ color: 'var(--status-serious)' }}>
            required
          </span>
        )}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </span>
      )}
    </label>
  )
}

const controlStyle = {
  background: 'var(--surface-1)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-strong)',
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  label?: ReactNode
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  const input = (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`min-h-9 w-full rounded px-2.5 py-1.5 text-sm ${className}`}
      style={controlStyle}
    />
  )
  if (label === undefined) return input
  return (
    <Field label={label}>
      {input}
    </Field>
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-y rounded px-2.5 py-2 text-sm leading-relaxed"
      style={controlStyle}
    />
  )
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | ''
  onChange: (v: T | '') => void
  options: { value: T; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T | '')}
      className="min-h-9 w-full rounded px-2.5 py-1.5 text-sm"
      style={controlStyle}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm leading-relaxed">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 shrink-0"
        style={{ accentColor: 'var(--accent)' }}
      />
      <span>{label}</span>
    </label>
  )
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="surface rounded-lg px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="mt-1.5 text-3xl font-semibold leading-none">{value}</div>
      {hint && (
        <div className="mt-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}
