import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginRequest, updateProfile, useAuthStore } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await loginRequest(email, password)
      const localIds = useLocalWishlistStore.getState().ids
      const user = useAuthStore.getState().user
      if (user && localIds.length > 0) {
        const merged = [
          ...new Set([...(user.wishlist || []), ...localIds]),
        ]
        try {
          await updateProfile({ wishlist: merged })
          useLocalWishlistStore.getState().clear()
        } catch {
          /* giữ local nếu sync lỗi */
        }
      }
      navigate('/account')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950 dark:text-white">
        Đăng nhập
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 dark:border-emerald-100/10 dark:bg-[#141c18]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 dark:border-emerald-100/10 dark:bg-[#141c18]"
          />
        </div>
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-emerald-700 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? '...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="text-center text-sm text-emerald-800/80">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-emerald-700 underline">
          Đăng ký
        </Link>
      </p>
    </div>
  )
}
