import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Sparkles, Filter } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { ProductSkeleton } from '../components/Skeleton'
import { apiGet, type Product } from '../lib/api'
import clsx from 'clsx'

const BRANDS = [
  { id: 'all', label: 'Tất cả nhãn hàng', tag: 'All' },
  { id: 'fuwa3e', label: 'Fuwa3e Enzyme', tag: 'Sinh học' },
  { id: 'vitrue', label: 'VITRUE Natural', tag: 'Detox' },
  { id: 'moc-nam', label: 'Mộc Nam Thảo Dược', tag: 'Thảo mộc' },
  { id: 'dda-cal', label: 'DDA-CAL Canxi', tag: 'Hữu cơ' },
]

const SUB_CATEGORIES: Record<string, { id: string; label: string }[]> = {
  fuwa3e: [
    { id: 'all', label: 'Tất cả Fuwa3e' },
    { id: 'rua-chen', label: 'Rửa chén & Máy rửa chén' },
    { id: 'giat-xa', label: 'Giặt xả sinh học' },
    { id: 'lau-san-da-nang', label: 'Lau sàn & Đa năng' },
    { id: 'rua-tay-khu-trung', label: 'Rửa tay & Khử trùng' },
    { id: 'ngam-rua-thuc-pham', label: 'Ngâm rửa thực phẩm' },
  ],
  vitrue: [
    { id: 'all', label: 'Tất cả VITRUE' },
    { id: 'detox', label: 'Tinh chất thải độc Detox' },
    { id: 'noni-celery', label: 'Cần tây & Tinh chất Noni' },
    { id: 'combo', label: 'Combo sức khỏe' },
  ],
  'moc-nam': [
    { id: 'all', label: 'Tất cả Mộc Nam' },
    { id: 'cham-soc-toc', label: 'Chăm sóc tóc (Dầu gội, Serum X5, Kem xả)' },
    { id: 'cham-co-the', label: 'Chăm sóc cơ thể & Khử mùi' },
    { id: 'cham-soc-da', label: 'Chăm sóc da & Bọt rửa mặt' },
  ],
  'dda-cal': [
    { id: 'all', label: 'Tất cả DDA-CAL' },
    { id: 'canxi', label: 'Canxi hữu cơ tinh khiết' },
  ],
}

export function Products() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  const brand = searchParams.get('brand') || 'all'
  const subCategory = searchParams.get('sub') || 'all'
  const query = searchParams.get('q') || ''

  // Load all products initially
  useEffect(() => {
    setLoading(true)
    apiGet<Product[]>('/products')
      .then(setAllProducts)
      .catch((e) => setErr(e.message || 'Lỗi tải sản phẩm'))
      .finally(() => setLoading(false))
  }, [])

  // Filter products client-side for zero-latency instant feedback
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      // Search keyword
      if (query) {
        const q = query.toLowerCase()
        const matchName = p.name.toLowerCase().includes(q)
        const matchDesc = p.description?.toLowerCase().includes(q)
        if (!matchName && !matchDesc) return false
      }

      // Brand filter
      if (brand !== 'all') {
        if (p.brand !== brand) return false
      }

      // SubCategory filter
      if (subCategory !== 'all') {
        if (p.subCategory !== subCategory) return false
      }

      return true
    })
  }, [allProducts, brand, subCategory, query])

  // Count items per brand for badge display
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length }
    for (const p of allProducts) {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1
      }
    }
    return counts
  }, [allProducts])

  function selectBrand(newBrand: string) {
    const nextParams = new URLSearchParams(searchParams)
    if (newBrand === 'all') {
      nextParams.delete('brand')
      nextParams.delete('sub')
    } else {
      nextParams.set('brand', newBrand)
      nextParams.delete('sub') // reset subcategory on brand change
    }
    setSearchParams(nextParams)
  }

  function selectSub(newSub: string) {
    const nextParams = new URLSearchParams(searchParams)
    if (newSub === 'all') {
      nextParams.delete('sub')
    } else {
      nextParams.set('sub', newSub)
    }
    setSearchParams(nextParams)
  }

  const currentSubList = brand !== 'all' ? SUB_CATEGORIES[brand] || [] : []

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8 xl:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 mb-3 border border-emerald-200 dark:border-emerald-900/50">
          <Sparkles className="h-3.5 w-3.5" /> Bộ sưu tập chính hãng
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Sản phẩm <span className="text-emerald-500 italic">Winie Leaf</span>
        </h1>
        <p className="mt-3 max-w-xl text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Lựa chọn các sản phẩm sinh học, thảo dược thiên nhiên và giải pháp sức khỏe thuần khiết.
        </p>
      </div>

      {/* FILTER LEVEL 1: NHÃN HÀNG (BRANDS) */}
      <div className="mb-4 sm:mb-6 w-full">
        <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 justify-center">
          <Filter className="h-3.5 w-3.5" /> Lọc theo nhãn hàng:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 w-full max-w-full no-scrollbar sm:flex-wrap sm:justify-center">
          {BRANDS.map((b) => {
            const count = brandCounts[b.id] ?? 0
            const active = brand === b.id
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => selectBrand(b.id)}
                className={clsx(
                  'cursor-pointer shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-[1.5rem] px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300',
                  active
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-[#1e1e1e] dark:text-white dark:border-slate-700'
                    : 'bg-slate-100/80 dark:bg-[#111111] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-transparent'
                )}
              >
                <span>{b.label}</span>
                <span
                  className={clsx(
                    'text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full transition-colors',
                    active
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* FILTER LEVEL 2: DÒNG SẢN PHẨM CON TRONG NHÃN HÀNG (SUBCATEGORIES) */}
      <AnimatePresence mode="wait">
        {currentSubList.length > 0 && (
          <motion.div
            key={brand}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mb-6 sm:mb-8 flex items-center gap-2 overflow-x-auto py-1 px-1 w-full max-w-full no-scrollbar sm:flex-wrap sm:justify-center border-t border-slate-200/40 dark:border-slate-800/40 pt-3"
          >
            {currentSubList.map((sub) => {
              const active = subCategory === sub.id
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => selectSub(sub.id)}
                  className={clsx(
                    'cursor-pointer shrink-0 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full transition-all duration-200 border whitespace-nowrap',
                    active
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-[#141414] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600'
                  )}
                >
                  {sub.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : err ? (
        <div className="py-20 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <p className="text-slate-500">{err}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-24 text-center text-slate-400">
          <p className="text-base sm:text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
          <button
            type="button"
            onClick={() => {
              setSearchParams(new URLSearchParams())
            }}
            className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline"
          >
            Xóa bộ lọc & xem tất cả
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 sm:mb-6 flex justify-between items-center text-xs sm:text-sm text-slate-400">
            <span>Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.2) }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
