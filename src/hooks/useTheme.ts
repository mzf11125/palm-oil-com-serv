import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export const THEME_LABEL: Record<Theme, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
}

/** Glyph shown on the cycle button. */
export const THEME_GLYPH: Record<Theme, string> = {
  light: '○',
  dark: '◐',
  system: '◑',
}

export const nextTheme = (theme: Theme): Theme =>
  theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'

/**
 * Applies the theme to the document root and persists it.
 *
 * Called once at the router level rather than per page, so the attribute is
 * already set whichever route renders first and survives navigation between
 * the landing page and the workspace.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    // Storage key predates the rename to ABCD Scorecard and is deliberately
    // left alone: changing it would drop every existing user's preference.
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
