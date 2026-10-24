import { useEffect, useMemo, useState } from 'react'
import { Search, Download, RefreshCw, AlertCircle, ShoppingBag, Clock, CheckCircle2, Truck, XCircle, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { apiGet, apiSend, type Order } from '../../lib/api'
import { getSocket } from '../../lib/socket'

const ORDER_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn tất',
}

const ORDER_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipping: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  completed: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const ORDER_ICONS: Record<string, any> = {
  pending: Clock,
  processing: RotateCcw,
  shipping: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  completed: CheckCircle2,
}

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export function OrderManager() {
  const token = useAuthStore((s) => s.token)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadOrders = () => {
    setLoading(true)
    apiGet<Order[]>('/orders', token)
      .then(setOrders)
      .catch((e) => alert(e instanceof Error ? e.message : 'Lỗi tải đơn hàng'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!token) return
    loadOrders()

    const s = getSocket()
    s.emit('join:admin', token)

    function onNewOrder() {
      // Reload on new order
      apiGet<Order[]>('/orders', token).then(setOrders).catch(() => {})
    }

    s.on('order:new', onNewOrder)
    return () => {
      s.off('order:new', onNewOrder)
    }
  }, [token])

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.replace(/\s/g, '').includes(q) ||
        o.address.toLowerCase().includes(q)
      )
    })
  }, [orders, query, statusFilter])

  function exportCsv() {
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`
    const headers = ['Mã Đơn', 'Ngày tạo', 'Khách hàng', 'SĐT', 'Địa chỉ', 'Tổng tiền (VND)', 'Trạng thái', 'Thanh toán']
    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString('vi-VN'),
      o.customerName,
      o.phone,
      o.address,
      String(o.total),
      ORDER_LABEL[o.status] || o.status,
      o.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản',
    ])
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function updateStatus(id: string, status: string) {
    if (!token) return
    try {
      const updated = await apiSend<Order>(`/orders/${id}/status`, 'PATCH', { status }, token)
      setOrders((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lỗi cập nhật trạng thái')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a]">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Tìm theo mã, tên, SĐT, địa chỉ…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210] dark:focus:bg-[#111815]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210]"
          >
            <option value="all">Mọi trạng thái</option>
            {Object.keys(ORDER_LABEL).map((s) => (
              <option key={s} value={s}>{ORDER_LABEL[s]}</option>
            ))}
          </select>
          <button
            onClick={loadOrders}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:border-[#2a3a31] dark:text-slate-400 dark:hover:bg-[#1a2520] transition"
            title="Làm mới"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={exportCsv}
          disabled={filteredOrders.length === 0}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Download className="h-4 w-4" /> Xuất CSV ({filteredOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/60 bg-white dark:border-[#202d26] dark:bg-[#151e1a]">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-500">Đang tải đơn hàng...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/60 bg-white dark:border-[#202d26] dark:bg-[#151e1a]">
          <AlertCircle className="h-6 w-6 text-slate-400" />
          <p className="text-sm font-medium text-slate-500">Không có đơn hàng nào khớp điều kiện.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <AnimatePresence>
            {filteredOrders.map((o) => {
              const StatusIcon = ORDER_ICONS[o.status] || ShoppingBag
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={o.id}
                  className="group flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#202d26] dark:bg-[#151e1a]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ORDER_COLORS[o.status] || ORDER_COLORS.completed}`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">#{o.id.slice(0, 8)}</span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">{vnd(o.total)}</p>
                      </div>
                    </div>
                    
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`rounded-xl border border-transparent px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${ORDER_COLORS[o.status] || ORDER_COLORS.completed} bg-opacity-50`}
                    >
                      {Object.keys(ORDER_LABEL).map((s) => (
                        <option key={s} value={s} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                          {ORDER_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-2 rounded-2xl bg-slate-50 p-4 dark:bg-[#111815]">
                    <div className="mb-2 flex justify-between border-b border-slate-200 pb-2 dark:border-[#2a3a31]">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{o.customerName}</span>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{o.phone}</span>
                    </div>
                    <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">{o.address}</p>
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Thanh toán: <span className="text-emerald-600 uppercase dark:text-emerald-400">{o.paymentMethod || 'COD'}</span></span>
                      <span>{o.items?.length || 0} sản phẩm</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
