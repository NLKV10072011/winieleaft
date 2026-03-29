import { create } from 'zustand'
import { persist, type PersistOptions } from 'zustand/middleware'

type Theme = 'light' | 'dark'

type ThemeState = {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

const themePersist: PersistOptions<ThemeState, Pick<ThemeState, 'theme'>> = {
  name: 'winie-theme',
  partialize: (s) => ({ theme: s.theme }),
  onRehydrateStorage: () => (state: ThemeState | undefined) => {
    if (state?.theme === 'dark')
      document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  },
}

export const useThemeStore = create(
  persist<ThemeState, [], [], Pick<ThemeState, 'theme'>>(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },
      setTheme: (t) => {
        set({ theme: t })
        document.documentElement.classList.toggle('dark', t === 'dark')
      },
    }),
    themePersist
  )
)
