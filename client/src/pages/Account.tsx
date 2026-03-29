import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Heart, Lock, LogOut, Package } from 'lucide-react'
import { AddressField } from '../components/AddressField'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../context/ToastContext'
import { apiGet, apiSend, type Order } from '../lib/api'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100',
  processing: 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100',
  shipping: 'bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100',
  delivered: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100',
  cancelled: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  completed: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn tất',
}

export function Account() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const refreshMe = useAuthStore((s) => s.refreshMe)
  const { show } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  useEffect(() => {
    if (!token) return
    apiGet<Order[]>('/orders', token)
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [token])

  if (!user || !token) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Tài khoản</h1>
        <p className="text-emerald-800/80">Vui lòng đăng nhập.</p>
        <Link
          to="/login"
          className="inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-semibold text-white"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-950 dark:text-white">
            Xin chào, {user.name}
          </h1>
          <p className="text-emerald-800/75 dark:text-emerald-200/70">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-900/15 px-4 py-2 text-sm font-medium dark:border-emerald-100/10"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50/80 p-6 dark:border-emerald-100/10 dark:bg-emerald-950/40">
          <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-100">
            <Gift className="h-5 w-5" />
            Điểm tích lũy
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-800 dark:text-emerald-200">
            {user.points}
          </p>
          <p className="text-sm text-emerald-800/70">
            +1 điểm mỗi 10.000₫ (làm tròn khi đặt hàng)
          </p>
        </div>
        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 dark:border-emerald-100/10 dark:bg-[#141c18]">
          <p className="font-semibold text-emerald-950 dark:text-white">
            Địa chỉ đã lưu
          </p>
          <AddressField
            key={`${user.id}-${user.addresses?.[0] ?? ''}`}
            initialAddress={user.addresses?.[0] ?? ''}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 dark:border-emerald-100/10 dark:bg-[#141c18]">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-emerald-950 dark:text-white">
          <Lock className="h-5 w-5" />
          Đổi mật khẩu
        </h2>
        <form
          className="mx-auto flex max-w-md flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!token) return
            setPwBusy(true)
            try {
              await apiSend<{ ok: boolean }>(
                '/auth/password',
                'PATCH',
                { currentPassword: curPw, newPassword: newPw },
                token
              )
              setCurPw('')
              setNewPw('')
              show('Đã cập nhật mật khẩu', 'ok')
            } catch (err) {
              show(
                err instanceof Error ? err.message : 'Không đổi được mật khẩu',
                'err'
              )
            } finally {
              setPwBusy(false)
            }
          }}
        >
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Mật khẩu hiện tại"
            value={curPw}
            onChange={(e) => setCurPw(e.target.value)}
            className="rounded-xl border border-emerald-900/15 px-3 py-2 dark:border-emerald-100/10 dark:bg-[#0c1210]"
            required
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            minLength={8}
            className="rounded-xl border border-emerald-900/15 px-3 py-2 dark:border-emerald-100/10 dark:bg-[#0c1210]"
            required
          />
          <button
            type="submit"
            disabled={pwBusy}
            className="rounded-2xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {pwBusy ? 'Đang lưu…' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-rose-200/60 bg-rose-50/80 p-5 dark:border-rose-900/40 dark:bg-rose-950/30">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-rose-500" />
          <div>
            <p className="font-semibold text-emerald-950 dark:text-white">
              Sản phẩm yêu thích
            </p>
            <p className="text-sm text-emerald-800/75 dark:text-emerald-200/70">
              {user.wishlist?.length ?? 0} mục trên tài khoản — xem cả wishlist
              cục bộ trên trang riêng.
            </p>
          </div>
        </div>
        <Link
          to="/wishlist"
          className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
        >
          Mở wishlist
        </Link>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-950 dark:text-white">
          <Package className="h-5 w-5" />
          Lịch sử đơn hàng
        </h2>
        {orders.length === 0 ? (
          <p className="text-emerald-800/70">Chưa có đơn nào.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-2xl border border-emerald-900/10 bg-white p-4 dark:border-emerald-100/10 dark:bg-[#141c18]"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-mono text-sm text-emerald-800/80">
                    #{o.id.slice(0, 8)}
                  </span>
                  <span className="font-semibold">{vnd(o.total)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-emerald-800/60">
                  <span>
                    {new Date(o.createdAt).toLocaleString('vi-VN')} ·{' '}
                    {o.paymentMethod}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      STATUS_BADGE[o.status] ||
                      'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40'
                    }`}
                  >
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  )
}
