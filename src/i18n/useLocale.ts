import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from './strings'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

/**
 * Indonesian is the default: the two methodological design documents that
 * define POCI and the scorecard are written in Indonesian, and the analysts
 * applying them work in-country.
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'id',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'abcds-rf-locale' },
  ),
)

/** Convenience hook: `const { locale, tr } = useT()`. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const tr = (node: { id: string; en: string }) => node[locale]
  return { locale, setLocale, tr }
}
