import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Loader2 } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { apiGet, type Product } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'
import { Link } from 'react-router-dom'

export function Wishlist() {
  const user = useAuthStore((s) => s.user)
  const localIds = useLocalWishlistStore((s) => s.ids)
  const [list, setList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const ids = Array.from(new Set([...(user?.wishlist ?? []), ...localIds]))

  useEffect(() => {
    if (ids.length === 0) {
      setList([])
      setLoading(false)
      return
    }
    
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const query = ids.join(',')
        const data = await apiGet<Product[]>(`/products?ids=${encodeURIComponent(query)}`)
        if (!cancelled) setList(data)
      } catch {
        if (!cancelled) setList([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    
    return () => { cancelled = true }
  }, [ids.join(',')])

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3.5 sm:px-8 xl:px-12 py-6 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header */}
      <div className="mb-8 sm:mb-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-4">
           Yêu thích
        </h1>
        <p className="max-w-xl text-sm sm:text-lg text-slate-500 dark:text-slate-400">
           Những sản phẩm tinh túy được bạn dành riêng một chỗ trong tim.
        </p>
      </div>

      <main className="min-h-[400px] w-full">
         <AnimatePresence mode="wait">
            {loading ? (
               <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex h-full w-full items-center justify-center py-32 text-emerald-500"
               >
                  <Loader2 className="h-10 w-10 animate-spin" />
               </motion.div>
            ) : list.length === 0 ? (
               <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mx-auto flex w-full max-w-[800px] flex-col items-center justify-center py-16 sm:py-20 text-center"
               >
                  <div className="mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                     <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-4">Danh sách trống</h2>
                  <p className="mb-8 text-sm sm:text-lg text-slate-500 dark:text-slate-400 max-w-sm">
                     Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
                  </p>
                  <Link
                     to="/products"
                     className="rounded-full bg-emerald-600 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-xl shadow-emerald-600/20"
                  >
                     Khám phá sản phẩm
                  </Link>
               </motion.div>
            ) : (
               <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
               >
                  {list.map((p, i) => (
                     <ProductCard key={p.id} product={p} index={i} />
                  ))}
               </motion.div>
            )}
         </AnimatePresence>
      </main>
    </div>
  )
}
