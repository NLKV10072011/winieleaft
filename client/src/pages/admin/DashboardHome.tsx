import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  AlertTriangle,
  Bell,
  Package,
  Users,
  ShoppingCart,
  Banknote,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { apiGet, type AdminStats } from '../../lib/api'
import { getSocket } from '../../lib/socket'

const ORDER_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn tất (cũ)',
}

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export function DashboardHome() {
  const token = useAuthStore((s) => s.token)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    apiGet<AdminStats>('/admin/stats', token)
      .then(setStats)
      .catch(() => { })

    const s = getSocket()
    s.emit('join:admin', token)

    function onNew(payload: { orderId: string; total: number }) {
      setToast(`Đơn mới #${payload.orderId.slice(0, 8)} — ${vnd(payload.total)}`)
      setTimeout(() => setToast(null), 6000)
      // Refresh stats
      apiGet<AdminStats>('/admin/stats', token).then(setStats).catch(() => { })
    }

    s.on('order:new', onNew)
    return () => {
      s.off('order:new', onNew)
    }
  }, [token])

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed right-8 top-8 z-50 flex items-center gap-3 rounded-2xl border border-emerald-400 bg-emerald-50 px-5 py-4 text-emerald-950 shadow-2xl dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-100"
          >
            <div className="rounded-full bg-emerald-500 p-2 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Thông báo mới</span>
              <span className="text-sm">{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Doanh thu */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-teal-500/10 p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 dark:from-[#111815] transition-all hover:-translate-y-1 hover:shadow-lg dark:shadow-[0_0_25px_rgba(16,185,129,0.05)]">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-600/10 blur-2xl group-hover:bg-emerald-600/20 transition-colors" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-emerald-800/80 dark:text-emerald-200/60">Doanh thu</p>
            <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
            {vnd(stats.revenue)}
          </p>
        </div>

        {/* Tổng đơn */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a] transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tổng đơn</p>
            <ShoppingCart className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {stats.orderCount}
          </p>
        </div>

        {/* Chờ xử lý */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a] transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Chờ xử lý</p>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {stats.pending}
          </p>
        </div>

        {/* Khách hàng */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a] transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Khách hàng</p>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {stats.customerCount}
          </p>
        </div>

        {/* Đơn hôm nay */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a] transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Đơn mới (Hôm nay)</p>
            <Package className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {stats.ordersToday ?? 0}
          </p>
        </div>

        {/* Giá trị TB */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a] transition-all hover:-translate-y-1 hover:shadow-lg sm:col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Giá trị Trung bình/Đơn</p>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-4xl font-black tracking-tighter text-emerald-700 dark:text-emerald-400">
            {vnd(stats.avgOrderValue ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Biểu đồ */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-8 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a]">
          <h3 className="mb-6 font-bold text-lg text-slate-900 dark:text-white">
            Doanh thu 7 ngày qua
          </h3>
          <div className="flex h-56 items-end gap-2 sm:gap-4 md:gap-6">
            {(stats.chart || []).map((d, index) => {
              const max = Math.max(...((stats.chart || []).map((x) => x.revenue)), 1)
              const pct = Math.max((d.revenue / max) * 100, 2)
              return (
                <div key={d.date} className="group relative flex min-w-0 flex-1 flex-col items-center justify-end h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1, type: "spring" }}
                    className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-emerald-600/80 to-emerald-400 dark:from-emerald-800 dark:to-emerald-500 opacity-90 transition-opacity group-hover:opacity-100"
                  />

                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 scale-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 dark:bg-slate-200 dark:text-slate-900">
                    {vnd(d.revenue)}
                  </div>

                  <span className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trạng thái đơn */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a]">
          <h3 className="mb-6 font-bold text-lg text-slate-900 dark:text-white">
            Trạng thái hiện tại
          </h3>
          <div className="space-y-5">
            {Object.entries(stats.statusBreakdown || {})
              .sort((a, b) => b[1] - a[1])
              .map(([st, n]) => {
                const max = Math.max(...Object.values(stats.statusBreakdown || {}), 1)
                const pct = Math.round((n / max) * 100)
                return (
                  <div key={st}>
                    <div className="mb-1.5 flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                      <span>{ORDER_LABEL[st] || st}</span>
                      <span className="font-bold">{n}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-[#202d26]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, type: "spring" }}
                        className={`h-full rounded-full ${st === 'delivered' ? 'bg-emerald-500' :
                            st === 'pending' ? 'bg-amber-400' :
                              st === 'processing' ? 'bg-blue-500' :
                                st === 'cancelled' ? 'bg-rose-500' :
                                  'bg-indigo-500'
                          }`}
                      />
                    </div>
                  </div>
                )
              })}
            {Object.keys(stats.statusBreakdown || {}).length === 0 && (
              <p className="text-sm text-slate-500 italic">Chưa có thông tin.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sản phẩm bán chạy */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a]">
          <h3 className="mb-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">🔥</span>
            Top Bán Chạy
          </h3>
          {(stats.topProducts || []).length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có dữ liệu.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#202d26]">
              {(stats.topProducts || []).map((t, i) => (
                <div key={t.productId} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {i + 1}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {t.name}
                    </span>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {t.qty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tồn kho siêu thấp */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-rose-200/60 dark:border-rose-900/30 dark:bg-[#151e1a]">
          <h3 className="mb-4 font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            Sắp hết hàng (≤10)
          </h3>
          {(stats.lowStock || []).length === 0 ? (
            <p className="text-sm text-slate-500">Tất cả sản phẩm đều đủ kho.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
              {(stats.lowStock || []).map((p) => (
                <div key={p.id} className="group flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 p-3 transition hover:bg-rose-50 dark:border-rose-900/20 dark:bg-rose-950/10 dark:hover:bg-rose-900/20">
                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rose-100 px-2 text-xs font-bold text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                    {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
