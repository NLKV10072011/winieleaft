import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { ProductSearchBar } from '../components/ProductSearchBar'
import { CATEGORIES } from '../lib/constants'
import { apiGet, type Product } from '../lib/api'

export function Products() {
  const [params, setParams] = useSearchParams()
  const [list, setList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const category = params.get('category') || 'all'
  const sort = params.get('sort') || 'newest'
  const minRating = params.get('minRating') || ''
  const minPrice = params.get('minPrice') || ''
  const maxPrice = params.get('maxPrice') || ''
  const inStock = params.get('inStock') === '1'
  const featuredOnly = params.get('featured') === '1'

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    const q = params.get('q')
    if (q) p.set('q', q)
    if (category && category !== 'all') p.set('category', category)
    if (sort && sort !== 'newest') p.set('sort', sort)
    if (minRating) p.set('minRating', minRating)
    if (minPrice) p.set('minPrice', minPrice)
    if (maxPrice) p.set('maxPrice', maxPrice)
    if (inStock) p.set('inStock', '1')
    if (featuredOnly) p.set('featured', '1')
    return p.toString() ? `?${p.toString()}` : ''
  }, [
    params,
    category,
    sort,
    minRating,
    minPrice,
    maxPrice,
    inStock,
    featuredOnly,
  ])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const data = await apiGet<Product[]>(`/products${queryString}`)
        if (!cancelled) setList(data)
      } catch {
        if (!cancelled) setList([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [queryString])

  function update(key: string, value: string) {
    const p = new URLSearchParams(params)
    if (!value || value === 'all') p.delete(key)
    else p.set(key, value)
    setParams(p)
  }

  function toggleFlag(key: 'inStock' | 'featured', checked: boolean) {
    const p = new URLSearchParams(params)
    if (checked) p.set(key, '1')
    else p.delete(key)
    setParams(p)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950 dark:text-white sm:text-3xl">
          Sản phẩm
        </h1>
        <p className="mt-1 text-emerald-800/80 dark:text-emerald-200/75">
          Gợi ý khi gõ (danh mục + giá), lọc nâng cao: tồn, nổi bật, giá, đánh
          giá.
        </p>
      </div>

      <ProductSearchBar
        variant="page"
        urlQuery={params.get('q') || ''}
        onApply={(query) => {
          const p = new URLSearchParams(params)
          if (query.trim()) p.set('q', query.trim())
          else p.delete('q')
          setParams(p)
        }}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-emerald-900/10 bg-white/80 p-4 dark:border-emerald-100/10 dark:bg-[#141c18]/80">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800 dark:text-emerald-200">
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
        </span>
        <select
          value={category}
          onChange={(e) => update('category', e.target.value)}
          className="rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => update('sort', e.target.value)}
          className="rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
        >
          <option value="newest">Mới nhất</option>
          <option value="name">Tên A–Z</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
          <option value="rating">Đánh giá cao</option>
        </select>
        <input
          type="number"
          min={0}
          placeholder="Giá từ"
          value={minPrice}
          onChange={(e) => update('minPrice', e.target.value)}
          className="w-28 rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
        />
        <input
          type="number"
          min={0}
          placeholder="Đến"
          value={maxPrice}
          onChange={(e) => update('maxPrice', e.target.value)}
          className="w-28 rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
        />
        <select
          value={minRating}
          onChange={(e) => update('minRating', e.target.value)}
          className="rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm dark:border-emerald-100/10 dark:bg-[#0c1210]"
        >
          <option value="">Đánh giá</option>
          <option value="4">≥ 4★</option>
          <option value="4.5">≥ 4.5★</option>
          <option value="4.8">≥ 4.8★</option>
        </select>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-emerald-900 dark:text-emerald-100">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => toggleFlag('inStock', e.target.checked)}
            className="rounded border-emerald-800/30"
          />
          Còn hàng
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-emerald-900 dark:text-emerald-100">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => toggleFlag('featured', e.target.checked)}
            className="rounded border-emerald-800/30"
          />
          Nổi bật
        </label>
      </div>

      {loading ? (
        <p className="text-center text-emerald-800/70">Đang tải...</p>
      ) : list.length === 0 ? (
        <p className="text-center text-emerald-800/70">Không có sản phẩm phù hợp.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
