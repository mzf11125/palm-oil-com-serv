/**
 * Brand chrome shared by the landing page and the workspace.
 */

import { Link } from 'react-router-dom'
import { STRINGS } from '@/i18n/strings'
import { THEME_GLYPH, THEME_LABEL, nextTheme, type Theme } from '@/hooks/useTheme'

/**
 * The sawitAI lockup.
 *
 * Both marks are rendered and CSS shows whichever suits the active theme. The
 * artwork is black text on transparency, so the dark variant is a white-text
 * recolour: a single image would disappear on a dark surface. The swap rules
 * live in styles.css next to the tokens they follow.
 */
export function Logo({ to = '/', className = 'h-9' }: { to?: string; className?: string }) {
  return (
    <Link to={to} className="flex shrink-0 items-center" aria-label={STRINGS.appName}>
      <img
        src="/brand/logo.png"
        alt={STRINGS.appName}
        width={275}
        height={128}
        className={`logo-on-light w-auto ${className}`}
      />
      <img
        src="/brand/logo-dark.png"
        alt={STRINGS.appName}
        width={275}
        height={128}
        className={`logo-on-dark w-auto ${className}`}
      />
    </Link>
  )
}

export function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: Theme
  setTheme: (t: Theme) => void
}) {
  return (
    <button
      onClick={() => setTheme(nextTheme(theme))}
      className="min-h-9 shrink-0 rounded border px-2.5 text-sm"
      style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
      aria-label={THEME_LABEL[theme]}
      title={THEME_LABEL[theme]}
    >
      {THEME_GLYPH[theme]}
    </button>
  )
}
