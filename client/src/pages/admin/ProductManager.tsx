import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Loader2, Upload, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { apiGet, apiSend, type Product } from '../../lib/api'
import { CATEGORIES } from '../../lib/constants'
import { ProductImage } from '../../components/ProductImage'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export function ProductManager() {
  const token = useAuthStore((s) => s.token)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'name' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc'>('name')

  // Modal states
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<Partial<Product>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageFileRef = useRef<HTMLInputElement>(null)

  const loadProducts = () => {
    setLoading(true)
    apiGet<Product[]>('/admin/products', token)
      .then(setProducts)
      .catch((e) => alert(e instanceof Error ? e.message : 'Lỗi tải sản phẩm'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (token) loadProducts()
  }, [token])

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) =>
      p.name.toLowerCase().includes(query.trim().toLowerCase())
    )
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'stock-asc': return a.stock - b.stock
        case 'stock-desc': return b.stock - a.stock
        default: return a.name.localeCompare(b.name, 'vi')
      }
    })
    return list
  }, [products, query, sort])

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    try {
      if (editing) {
        const p = await apiSend<Product>(`/admin/products/${editing.id}`, 'PUT', form, token)
        setProducts((list) => list.map((x) => (x.id === p.id ? p : x)))
      } else {
        const p = await apiSend<Product>('/admin/products', 'POST', form, token)
        setProducts((list) => [p, ...list])
      }
      setEditing(null)
      setForm({})
      setFormOpen(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lỗi lưu sản phẩm')
    }
  }

  async function deleteProduct(id: string) {
    if (!token || !confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Khóa ngoại có thể sẽ ngăn nếu sản phẩm đã nằm trong đơn hàng.')) return
    try {
      await apiSend(`/admin/products/${id}`, 'DELETE', undefined, token)
      setProducts((list) => list.filter((x) => x.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lỗi xóa')
    }
  }

  const openAddModal = () => {
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
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a]">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Tìm tên sản phẩm…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210] dark:focus:bg-[#111815]"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210]"
          >
            <option value="name">Tên A–Z</option>
            <option value="price-asc">Giá (Thấp đến Cao)</option>
            <option value="price-desc">Giá (Cao đến Thấp)</option>
            <option value="stock-asc">Tồn kho ít nhất</option>
            <option value="stock-desc">Tồn kho nhiều nhất</option>
          </select>
          <button
            onClick={loadProducts}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:border-[#2a3a31] dark:text-slate-400 dark:hover:bg-[#1a2520] transition"
            title="Làm mới báo cáo"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Product List Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm dark:border-[#202d26] dark:bg-[#151e1a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 dark:bg-[#111815] dark:text-slate-400 border-b border-slate-200/60 dark:border-[#202d26]">
              <tr>
                <th className="px-6 py-4 font-semibold w-16">Ảnh</th>
                <th className="px-6 py-4 font-semibold max-w-[300px]">Tên sản phẩm</th>
                <th className="px-6 py-4 font-semibold">Giá</th>
                <th className="px-6 py-4 font-semibold">Tồn kho</th>
                <th className="px-6 py-4 font-semibold">Tình trạng</th>
                <th className="px-6 py-4 font-semibold text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#202d26]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6 text-slate-400" />
                      Không tìm thấy sản phẩm nào.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/50 dark:hover:bg-[#1a2520]/50 group">
                    <td className="px-6 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 dark:border-[#2a3a31]">
                        <ProductImage image={p.image} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100 max-w-[300px] truncate">
                      {p.name}
                      {p.featured && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">HOT</span>}
                    </td>
                    <td className="px-6 py-3 font-semibold text-emerald-700 dark:text-emerald-400">
                      {vnd(p.price)}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {p.stock}
                    </td>
                    <td className="px-6 py-3">
                      {p.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">Hết hàng</span>
                      ) : p.stock <= 10 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">Sắp hết ({p.stock})</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">Còn hàng</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditing(p)
                            setForm(p)
                            setFormOpen(true)
                          }}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-[#202d26] dark:text-slate-300 dark:hover:bg-[#2a3a31]"
                          title="Sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setFormOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-[#111815] sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                {editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>

              <form onSubmit={saveProduct} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên sản phẩm</label>
                  <input
                    placeholder="VD: Trà sả chanh"
                    value={form.name || ''}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.price ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={form.stock ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Danh mục</label>
                  <select
                    value={form.category || 'tinh-dau'}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210]"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hình ảnh</label>
                  <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-4 dark:border-emerald-500/10 dark:bg-emerald-900/10 sm:flex-row sm:items-center">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#2a3a31] dark:bg-[#0c1210]">
                      <ProductImage image={form.image} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <input
                        ref={imageFileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]; e.target.value = '';
                          if (!file || !token) return;
                          setUploadingImage(true)
                          try {
                            const fd = new FormData(); fd.append('file', file)
                            const r = await fetch('/api/admin/upload/product-image', {
                              method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
                            })
                            const data = await r.json().catch(() => ({}))
                            if (!r.ok) throw new Error(data.error || 'Lỗi tải ảnh')
                            if (data.url) setForm((f) => ({ ...f, image: data.url }))
                          } catch (err) {
                            alert(err instanceof Error ? err.message : 'Lỗi tải ảnh')
                          } finally {
                            setUploadingImage(false)
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={uploadingImage || !token}
                        onClick={() => imageFileRef.current?.click()}
                        className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Tải ảnh (Max: 4MB)
                      </button>
                      <input
                        placeholder="Hoặc dán link ảnh/file name URL..."
                        value={form.image || ''}
                        onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition focus:border-emerald-500 focus:outline-none dark:border-[#2a3a31] dark:bg-[#0c1210] dark:text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả (Tùy chọn)</label>
                  <textarea
                    placeholder="Viết mô tả..."
                    value={form.description || ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210]"
                    rows={3}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#2a3a31] dark:bg-[#151e1a]">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={!!form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-[#2a3a31] dark:bg-[#0c1210] dark:checked:bg-emerald-500"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Sản phẩm Nổi bật
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    (Sẽ hiển thị trên trang chủ)
                  </span>
                </div>

                <div className="mt-4 flex gap-3 sm:col-span-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-[#2a3a31] dark:bg-[#111815] dark:text-slate-300 dark:hover:bg-[#1a2520] sm:flex-none"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-500 sm:flex-none"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
