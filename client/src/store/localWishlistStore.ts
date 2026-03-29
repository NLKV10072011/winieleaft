import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type State = {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
  remove: (id: string) => void
  clear: () => void
}

export const useLocalWishlistStore = create(
  persist<State>(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      remove: (id) =>
        set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'winie-local-wishlist' }
  )
)
