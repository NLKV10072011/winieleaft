import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerRequest } from '../store/authStore'

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await registerRequest(email, password, name, phone)
      navigate('/account')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950 dark:text-white">
        Đăng ký
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Họ tên</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 dark:border-emerald-100/10 dark:bg-[#141c18]"
          />
        </div>
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
          <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 dark:border-emerald-100/10 dark:bg-[#141c18]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input
            type="password"
            required
            minLength={6}
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
          {loading ? '...' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="text-center text-sm text-emerald-800/80">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-emerald-700 underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
