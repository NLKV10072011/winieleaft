import { create } from 'zustand'
import { persist, type PersistOptions } from 'zustand/middleware'

export type CartLine = {
  productId: string
  name: string
  price: number
  image: string
  qty: number
}

type CartState = {
  items: CartLine[]
  isOpen: boolean
  add: (line: Omit<CartLine, 'qty'> & { qty?: number }) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
  setOpen: (val: boolean) => void
}

const cartPersist: PersistOptions<CartState, Pick<CartState, 'items'>> = {
  name: 'winie-cart',
  partialize: (s) => ({ items: s.items }),
}

export const useCartStore = create(
  persist<CartState, [], [], Pick<CartState, 'items'>>(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (line) => {
        const items = [...get().items]
        const i = items.findIndex((x) => x.productId === line.productId)
        const q = line.qty ?? 1
        if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + q }
        else items.push({ ...line, qty: q })
        set({ items, isOpen: true }) // Auto open when add
      },
      remove: (productId) =>
        set({ items: get().items.filter((x) => x.productId !== productId) }),
      setQty: (productId, qty) => {
        if (qty < 1) {
          get().remove(productId)
          return
        }
        set({
          items: get().items.map((x) =>
            x.productId === productId ? { ...x, qty } : x
          ),
        })
      },
      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    cartPersist
  )
)
