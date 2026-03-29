import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX = 15

type State = {
  ids: string[]
  add: (id: string) => void
}

export const useRecentProductsStore = create(
  persist<State>(
    (set, get) => ({
      ids: [],
      add: (id) => {
        const rest = get().ids.filter((x) => x !== id)
        set({ ids: [id, ...rest].slice(0, MAX) })
      },
    }),
    { name: 'winie-recent-products' }
  )
)
