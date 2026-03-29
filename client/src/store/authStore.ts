import { create } from 'zustand'
import { persist, type PersistOptions } from 'zustand/middleware'
import type { User } from '../lib/api'
import { apiGet, apiSend } from '../lib/api'

type AuthState = {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  refreshMe: () => Promise<void>
}

const authPersist: PersistOptions<AuthState, Pick<AuthState, 'token' | 'user'>> =
  {
    name: 'winie-auth',
    partialize: (s) => ({ token: s.token, user: s.user }),
  }

export const useAuthStore = create(
  persist<AuthState, [], [], Pick<AuthState, 'token' | 'user'>>(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      refreshMe: async () => {
        const { token } = get()
        if (!token) return
        try {
          const user = await apiGet<User>('/auth/me', token)
          set({ user })
        } catch {
          set({ token: null, user: null })
        }
      },
    }),
    authPersist
  )
)

export async function loginRequest(email: string, password: string) {
  const res = await apiSend<{ token: string; user: User }>(
    '/auth/login',
    'POST',
    { email, password }
  )
  useAuthStore.getState().setAuth(res.token, res.user)
}

export async function registerRequest(
  email: string,
  password: string,
  name: string,
  phone?: string
) {
  const res = await apiSend<{ token: string; user: User }>(
    '/auth/register',
    'POST',
    { email, password, name, phone }
  )
  useAuthStore.getState().setAuth(res.token, res.user)
}

export async function updateProfile(data: {
  name?: string
  phone?: string
  addresses?: string[]
  wishlist?: string[]
}) {
  const token = useAuthStore.getState().token
  if (!token) throw new Error('Chưa đăng nhập')
  const user = await apiSend<User>('/auth/me', 'PATCH', data, token)
  useAuthStore.setState({ user })
}
