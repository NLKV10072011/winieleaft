import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { apiGet, type Product } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'

export function Wishlist() {
  const user = useAuthStore((s) => s.user)
  const localIds = useLocalWishlistStore((s) => s.ids)
  const [products, setProducts] = useState<Product[]>([])

  const mergedIds = useMemo(() => {
    const fromUser = user?.wishlist ?? []
    return [...new Set([...fromUser, ...localIds])]
  }, [user?.wishlist, localIds])

  useEffect(() => {
    apiGet<Product[]>('/products')
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  const list = useMemo(
    () => products.filter((p) => mergedIds.includes(p.id)),
    [products, mergedIds]
  )

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-emerald-950 dark:text-white sm:text-3xl">
            <Heart className="h-8 w-8 fill-rose-500 text-rose-500" />
            Yêu thích
          </h1>
          <p className="mt-1 text-emerald-800/75 dark:text-emerald-200/70">
            Sản phẩm bạn đã lưu (tài khoản + trình duyệt).
          </p>
        </div>
        <Link
          to="/products"
          className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Tiếp tục mua sắm
        </Link>
      </motion.div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-900/20 bg-emerald-50/50 py-16 text-center dark:border-emerald-100/15 dark:bg-emerald-950/30">
          <p className="text-emerald-800/80 dark:text-emerald-200/80">
            Chưa có sản phẩm nào. Nhấn ❤️ trên thẻ sản phẩm để lưu.
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block font-semibold text-emerald-700 underline dark:text-emerald-300"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
