import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  Download,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  Package,
  Search,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import {
  apiGet,
  apiSend,
  type AdminStats,
  type Order,
  type Product,
  type User,
} from '../lib/api'
import { CATEGORIES } from '../lib/constants'
import { getSocket } from '../lib/socket'
import { ProductImage } from '../components/ProductImage'

const ORDER_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn tất (cũ)',
}

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

export function Admin() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<User[]>([])
  const [tab, setTab] = useState<'dash' | 'products' | 'orders' | 'customers'>(
    'dash'
  )
  const [toast, setToast] = useState<string | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<Partial<Product>>({})
  const [productQuery, setProductQuery] = useState('')
  const [productSort, setProductSort] = useState<
    'name' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc'
  >('name')
  const [orderQuery, setOrderQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')
  const [customerQuery, setCustomerQuery] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageFileRef = useRef<HTMLInputElement>(null)

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) =>
      p.name.toLowerCase().includes(productQuery.trim().toLowerCase())
    )
    list = [...list].sort((a, b) => {
      switch (productSort) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'stock-asc':
          return a.stock - b.stock
        case 'stock-desc':
          return b.stock - a.stock
        default:
          return a.name.localeCompare(b.name, 'vi')
      }
    })
    return list
  }, [products, productQuery, productSort])

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase()
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter)
        return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.replace(/\s/g, '').includes(q) ||
        o.address.toLowerCase().includes(q)
      )
    })
  }, [orders, orderQuery, orderStatusFilter])

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || '').replace(/\s/g, '').includes(q)
    )
  }, [customers, customerQuery])

  function exportOrdersCsv() {
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`
    const headers = [
      'id',
      'createdAt',
      'customerName',
      'phone',
      'address',
      'total',
      'status',
      'paymentMethod',
    ]
    const rows = filteredOrders.map((o) => [
      o.id,
      o.createdAt,
      o.customerName,
      o.phone,
      o.address,
      String(o.total),
      o.status,
      o.paymentMethod,
    ])
    const csv =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!token || user?.role !== 'admin') return
    const s = getSocket()
    s.emit('join:admin')
    function onNew(payload: { orderId: string; total: number }) {
      setToast(`Đơn mới #${payload.orderId.slice(0, 8)} — ${vnd(payload.total)}`)
      setTimeout(() => setToast(null), 6000)
      apiGet<Order[]>('/orders', token).then(setOrders).catch(() => {})
      apiGet<AdminStats>('/admin/stats', token).then(setStats).catch(() => {})
    }
    s.on('order:new', onNew)
    return () => {
      s.off('order:new', onNew)
    }
  }, [token, user?.role])

  useEffect(() => {
    if (!token || user?.role !== 'admin') return
    apiGet<AdminStats>('/admin/stats', token).then(setStats).catch(() => {})
    apiGet<Product[]>('/admin/products', token).then(setProducts).catch(() => {})
    apiGet<Order[]>('/orders', token).then(setOrders).catch(() => {})
    apiGet<User[]>('/admin/customers', token).then(setCustomers).catch(() => {})
  }, [token, user?.role])

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    try {
      if (editing) {
        const p = await apiSend<Product>(
          `/admin/products/${editing.id}`,
          'PUT',
          form,
          token
        )
        setProducts((list) => list.map((x) => (x.id === p.id ? p : x)))
      } else {
        const p = await apiSend<Product>('/admin/products', 'POST', form, token)
        setProducts((list) => [...list, p])
      }
      setEditing(null)
      setForm({})
      setFormOpen(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lỗi')
    }
  }

  async function deleteProduct(id: string) {
    if (!token || !confirm('Xóa sản phẩm?')) return
    try {
      await apiSend(`/admin/products/${id}`, 'DELETE', undefined, token)
      setProducts((list) => list.filter((x) => x.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lỗi')
    }
  }

  async function setOrderStatus(id: string, status: string) {
    if (!token) return
    try {
      const o = await apiSend<Order>(
        `/orders/${id}/status`,
        'PATCH',
        { status },
        token
      )
      setOrders((list) => list.map((x) => (x.id === o.id ? o : x)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lỗi')
    }
  }

  if (!token || user?.role !== 'admin') {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-bold">Admin</h1>
        <p className="text-emerald-800/80">Bạn cần quyền quản trị.</p>
        <Link to="/login" className="text-emerald-700 underline">
          Đăng nhập admin
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-emerald-950 dark:text-white">
            Bảng điều khiển
          </h1>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-emerald-900/15 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 dark:border-emerald-100/10 dark:text-emerald-200 dark:hover:bg-white/5"
          >
            Cửa hàng <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['dash', 'Tổng quan', LayoutDashboard],
              ['products', 'Sản phẩm', Package],
              ['orders', 'Đơn hàng', Bell],
              ['customers', 'Khách', Users],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                tab === id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white/80 text-emerald-900 dark:bg-[#141c18]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <Bell className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {tab === 'dash' && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <p className="text-sm text-emerald-800/70">Doanh thu (đã giao)</p>
              <p className="mt-1 flex items-center gap-2 text-xl font-bold">
                <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600" />
                <span className="truncate">{vnd(stats.revenue)}</span>
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <p className="text-sm text-emerald-800/70">Tổng đơn</p>
              <p className="mt-1 text-xl font-bold">{stats.orderCount}</p>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <p className="text-sm text-emerald-800/70">Chờ xử lý</p>
              <p className="mt-1 text-xl font-bold text-amber-600">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <p className="text-sm text-emerald-800/70">Khách hàng</p>
              <p className="mt-1 text-xl font-bold">{stats.customerCount}</p>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <p className="text-sm text-emerald-800/70">Đơn hôm nay</p>
              <p className="mt-1 text-xl font-bold">
                {stats.ordersToday ?? 0}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <p className="text-sm text-emerald-800/70">
                Giá trị TB / đơn hoàn tất
              </p>
              <p className="mt-1 text-xl font-bold truncate">
                {vnd(stats.avgOrderValue ?? 0)}
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <h3 className="mb-4 font-bold text-emerald-950 dark:text-white">
                Trạng thái đơn hàng
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.statusBreakdown || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([st, n]) => {
                    const max = Math.max(
                      ...Object.values(stats.statusBreakdown || {}),
                      1
                    )
                    const pct = Math.round((n / max) * 100)
                    return (
                      <div key={st}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span>
                            {ORDER_LABEL[st] || st}{' '}
                            <span className="text-emerald-800/60">({n})</span>
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.4 }}
                            className="h-full rounded-full bg-emerald-600"
                          />
                        </div>
                      </div>
                    )
                  })}
                {Object.keys(stats.statusBreakdown || {}).length === 0 && (
                  <p className="text-sm text-emerald-800/60">Chưa có đơn.</p>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-amber-200/60 bg-amber-50/80 p-5 dark:border-amber-800/40 dark:bg-amber-950/40">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
                <AlertTriangle className="h-5 w-5" />
                Tồn kho thấp (≤10)
              </h3>
              {(stats.lowStock || []).length === 0 ? (
                <p className="text-sm text-amber-900/70 dark:text-amber-200/80">
                  Không có sản phẩm nào dưới ngưỡng.
                </p>
              ) : (
                <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                  {(stats.lowStock || []).map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between gap-2 border-b border-amber-200/40 pb-2 dark:border-amber-800/30"
                    >
                      <button
                        type="button"
                        className="min-w-0 truncate text-left font-medium text-amber-950 underline-offset-2 hover:underline dark:text-amber-100"
                        onClick={() => {
                          setTab('products')
                          setProductQuery(p.name)
                        }}
                      >
                        {p.name}
                      </button>
                      <span className="shrink-0 font-semibold text-rose-600 dark:text-rose-400">
                        {p.stock}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <h3 className="mb-4 font-bold text-emerald-950 dark:text-white">
                Biểu đồ doanh thu (7 ngày)
              </h3>
              <div className="flex h-44 items-end gap-1.5">
                {(stats.chart || []).map((d) => {
                  const max = Math.max(
                    ...((stats.chart || []).map((x) => x.revenue)),
                    1
                  )
                  const barPx = Math.round((d.revenue / max) * 140)
                  return (
                    <div
                      key={d.date}
                      className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="w-full max-w-[2.5rem] rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-500 dark:from-emerald-600 dark:to-emerald-400"
                        style={{
                          height: `${Math.max(barPx, d.revenue > 0 ? 6 : 2)}px`,
                        }}
                        title={`${d.date}: ${vnd(d.revenue)}`}
                      />
                      <span className="text-[10px] text-emerald-800/70 dark:text-emerald-300/80">
                        {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 dark:border-emerald-100/10 dark:bg-[#141c18]">
              <h3 className="mb-4 font-bold text-emerald-950 dark:text-white">
                Sản phẩm bán chạy
              </h3>
              {(stats.topProducts || []).length === 0 ? (
                <p className="text-sm text-emerald-800/60">Chưa có dữ liệu.</p>
              ) : (
                <ul className="space-y-3">
                  {(stats.topProducts || []).map((t, i) => (
                    <li
                      key={t.productId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium text-emerald-950 dark:text-emerald-100">
                          {t.name}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-emerald-700 dark:text-emerald-300">
                        {t.qty} đã bán
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-800/50" />
              <input
                type="search"
                placeholder="Tìm sản phẩm…"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="w-full rounded-2xl border border-emerald-900/15 py-2.5 pl-10 pr-3 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
              />
            </div>
            <select
              value={productSort}
              onChange={(e) =>
                setProductSort(e.target.value as typeof productSort)
              }
              className="rounded-2xl border border-emerald-900/15 px-3 py-2.5 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
            >
              <option value="name">Tên A–Z</option>
              <option value="price-asc">Giá tăng</option>
              <option value="price-desc">Giá giảm</option>
              <option value="stock-asc">Tồn ít nhất</option>
              <option value="stock-desc">Tồn nhiều nhất</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setForm({
                category: 'tinh-dau',
                stock: 10,
                rating: 5,
                price: 0,
                name: '',
                description: '',
                image: '',
              })
              setFormOpen(true)
            }}
            className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
          >
            + Thêm sản phẩm
          </button>
          {formOpen && (
            <form
              onSubmit={saveProduct}
              className="grid gap-3 rounded-3xl border border-emerald-900/10 bg-white p-4 dark:border-emerald-100/10 dark:bg-[#141c18] sm:grid-cols-2"
            >
              <input
                placeholder="Tên"
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl border border-emerald-900/15 px-3 py-2 dark:border-emerald-100/10 dark:bg-[#0c1210]"
                required
              />
              <input
                placeholder="Giá"
                type="number"
                value={form.price ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
                className="rounded-xl border border-emerald-900/15 px-3 py-2 dark:border-emerald-100/10 dark:bg-[#0c1210]"
                required
              />
              <select
                value={form.category || 'tinh-dau'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="rounded-xl border border-emerald-900/15 px-3 py-2 dark:border-emerald-100/10 dark:bg-[#0c1210]"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="sm:col-span-2 flex flex-col gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-4 dark:border-emerald-100/10 dark:bg-emerald-950/30">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  Ảnh sản phẩm
                </p>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-emerald-900/15 bg-white dark:border-emerald-100/10">
                    <ProductImage
                      image={form.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      ref={imageFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (!file || !token) return
                        setUploadingImage(true)
                        try {
                          const fd = new FormData()
                          fd.append('file', file)
                          const r = await fetch(
                            '/api/admin/upload/product-image',
                            {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                              body: fd,
                            }
                          )
                          const data = (await r.json().catch(() => ({}))) as {
                            url?: string
                            error?: string
                          }
                          if (!r.ok)
                            throw new Error(data.error || 'Lỗi tải ảnh')
                          if (data.url)
                            setForm((f) => ({ ...f, image: data.url }))
                        } catch (err) {
                          alert(
                            err instanceof Error ? err.message : 'Lỗi tải ảnh'
                          )
                        } finally {
                          setUploadingImage(false)
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingImage || !token}
                      onClick={() => imageFileRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Tải ảnh lên (tối đa 4MB)
                    </button>
                    <input
                      placeholder="Hoặc dán URL / tên file trong public/images/products/"
                      value={form.image || ''}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, image: e.target.value }))
                      }
                      className="w-full rounded-xl border border-emerald-900/15 px-3 py-2 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
                    />
                  </div>
                </div>
              </div>
              <input
                placeholder="Tồn kho"
                type="number"
                min={0}
                value={form.stock ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                }
                className="rounded-xl border border-emerald-900/15 px-3 py-2 dark:border-emerald-100/10 dark:bg-[#0c1210]"
              />
              <textarea
                placeholder="Mô tả"
                value={form.description || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="sm:col-span-2 rounded-xl border border-emerald-900/15 px-3 py-2 dark:border-emerald-100/10 dark:bg-[#0c1210]"
                rows={2}
              />
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={!!form.featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                />
                Nổi bật
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null)
                    setForm({})
                    setFormOpen(false)
                  }}
                  className="rounded-2xl border px-4 py-2 text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto rounded-3xl border border-emerald-900/10 bg-white dark:border-emerald-100/10 dark:bg-[#141c18]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-emerald-900/10 dark:border-emerald-100/10">
                <tr>
                  <th className="p-3">Tên</th>
                  <th className="p-3">Giá</th>
                  <th className="p-3">Tồn</th>
                  <th className="p-3 w-32" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-emerald-900/5 dark:border-emerald-100/5"
                  >
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{vnd(p.price)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3 space-x-2">
                      <button
                        type="button"
                        className="text-emerald-700 underline"
                        onClick={() => {
                          setEditing(p)
                          setForm(p)
                          setFormOpen(true)
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="text-rose-600 underline"
                        onClick={() => deleteProduct(p.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-800/50" />
              <input
                type="search"
                placeholder="Tìm theo mã đơn, tên, SĐT, địa chỉ…"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full rounded-2xl border border-emerald-900/15 py-2.5 pl-10 pr-3 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
              />
            </div>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="rounded-2xl border border-emerald-900/15 px-3 py-2.5 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
            >
              <option value="all">Mọi trạng thái</option>
              {[
                'pending',
                'processing',
                'shipping',
                'delivered',
                'cancelled',
                'completed',
              ].map((s) => (
                <option key={s} value={s}>
                  {ORDER_LABEL[s] || s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={exportOrdersCsv}
              disabled={filteredOrders.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-900/20 px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-100/15 dark:hover:bg-white/5"
            >
              <Download className="h-4 w-4" />
              Xuất CSV ({filteredOrders.length})
            </button>
          </div>
          {filteredOrders.length === 0 && (
            <p className="text-sm text-emerald-800/70">Không có đơn khớp bộ lọc.</p>
          )}
          {filteredOrders.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-emerald-900/10 bg-white p-4 dark:border-emerald-100/10 dark:bg-[#141c18]"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-mono text-sm">#{o.id.slice(0, 8)}</span>
                <span className="font-bold">{vnd(o.total)}</span>
              </div>
              <p className="text-sm text-emerald-800/80">
                {o.customerName} · {o.phone}
              </p>
              <p className="text-xs text-emerald-800/60">{o.address}</p>
              <select
                value={o.status}
                onChange={(e) => setOrderStatus(o.id, e.target.value)}
                className="mt-2 w-full max-w-xs rounded-xl border border-emerald-900/15 px-2 py-1.5 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
              >
                {[
                  'pending',
                  'processing',
                  'shipping',
                  'delivered',
                  'cancelled',
                  'completed',
                ].map((s) => (
                  <option key={s} value={s}>
                    {ORDER_LABEL[s] || s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === 'customers' && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-800/50" />
            <input
              type="search"
              placeholder="Tìm khách theo tên, email, SĐT…"
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              className="w-full rounded-2xl border border-emerald-900/15 py-2.5 pl-10 pr-3 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
            />
          </div>
          <div className="overflow-x-auto rounded-3xl border border-emerald-900/10 bg-white dark:border-emerald-100/10 dark:bg-[#141c18]">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-900/10 dark:border-emerald-100/10">
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Điểm</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="border-b border-emerald-900/5">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
