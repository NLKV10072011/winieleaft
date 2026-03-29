import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import type { Product } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { updateProfile } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'
import { useToast } from '../context/ToastContext'
import { categoryLabel } from '../lib/constants'
import clsx from 'clsx'
import { ProductImage } from './ProductImage'
import { productImageUrl } from '../lib/productImage'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const add = useCartStore((s) => s.add)
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const wishlist = user?.wishlist ?? []
  const localHas = useLocalWishlistStore((s) => s.has(product.id))
  const toggleLocal = useLocalWishlistStore((s) => s.toggle)
  const { show } = useToast()

  const liked = user
    ? wishlist.includes(product.id)
    : localHas

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (user && token) {
      const next = liked
        ? wishlist.filter((id) => id !== product.id)
        : [...wishlist, product.id]
      try {
        await updateProfile({ wishlist: next })
        show(liked ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích', 'ok')
      } catch {
        if (token && user) setAuth(token, { ...user, wishlist: next })
        show('Đã cập nhật yêu thích', 'ok')
      }
    } else {
      toggleLocal(product.id)
      const now = useLocalWishlistStore.getState().has(product.id)
      show(
        now ? 'Đã thêm vào yêu thích (lưu trên máy)' : 'Đã xóa khỏi yêu thích',
        'ok'
      )
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="group"
    >
      <Link
        to={`/products/${product.id}`}
        className={clsx(
          'block overflow-hidden rounded-3xl border transition-all duration-300',
          'border-emerald-900/10 bg-white shadow-sm dark:border-emerald-100/10 dark:bg-[#141c18]',
          'hover:border-emerald-600/30 hover:shadow-lg hover:shadow-emerald-900/5'
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50 dark:bg-emerald-950/40">
          <ProductImage
            image={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-emerald-800 shadow dark:bg-emerald-900/90 dark:text-emerald-100">
              Nổi bật
            </span>
          )}
          <button
            type="button"
            onClick={toggleWishlist}
            className={clsx(
              'absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors',
              liked
                ? 'bg-rose-500/90 text-white'
                : 'bg-white/80 text-emerald-900 hover:bg-white dark:bg-black/40 dark:text-emerald-100'
            )}
            aria-label="Yêu thích"
          >
            <Heart className={clsx('h-5 w-5', liked && 'fill-current')} />
          </button>
        </div>
        <div className="space-y-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/80 dark:text-emerald-300/80">
            {categoryLabel(product.category)}
          </p>
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-emerald-950 dark:text-emerald-50">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              {vnd(product.price)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                add({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: productImageUrl(product.image),
                })
                show('Đã thêm vào giỏ hàng', 'ok')
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <ShoppingBag className="h-4 w-4" />
              Thêm
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
