import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
import type { Product } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore, updateProfile } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'
import { useToast } from '../context/ToastContext'
import { categoryLabel } from '../lib/constants'
import clsx from 'clsx'
import { ProductImage } from './ProductImage'
import { productImageUrl } from '../lib/productImage'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

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

  const liked = user ? wishlist.includes(product.id) : localHas

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
        setAuth(token, { ...user, wishlist: next })
        show('Đã cập nhật yêu thích', 'ok')
      }
    } else {
      toggleLocal(product.id)
      const now = useLocalWishlistStore.getState().has(product.id)
      show(now ? 'Đã thêm vào yêu thích (lưu trên máy)' : 'Đã xóa khỏi yêu thích', 'ok')
    }
  }

  function addToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: productImageUrl(product.image),
    })
    show('Đã thêm 1 sản phẩm vào giỏ', 'ok')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} 
      className="group relative flex flex-col"
    >
      <Link
        to={`/products/${product.id}`}
        className="block flex-1 overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 dark:bg-[#111111] dark:hover:shadow-black/50"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50 dark:bg-[#0a0a0a]">
          <ProductImage
            image={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
          
          {/* Top badges */}
          <div className="absolute left-2.5 top-2.5 sm:left-4 sm:top-4 flex flex-col gap-1.5 sm:gap-2">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="inline-flex rounded-full bg-rose-600 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-sm">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
            {product.featured && (
              <span className="inline-flex rounded-full bg-slate-900/80 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md dark:bg-white/90 dark:text-black">
                Featured
              </span>
            )}
            {product.stock === 0 && (
               <span className="inline-flex rounded-full bg-rose-500/90 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                Hết hàng
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleWishlist}
            className={clsx(
              'absolute right-2.5 top-2.5 sm:right-4 sm:top-4 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300',
              liked
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-white/70 text-slate-600 hover:bg-white hover:scale-110 dark:bg-black/40 dark:text-slate-300 dark:hover:bg-black/70'
            )}
            aria-label="Yêu thích"
          >
            <Heart className={clsx('h-4 w-4 sm:h-5 sm:w-5', liked && 'fill-current')} />
          </button>
        </div>

        <div className="flex flex-col justify-between p-3.5 sm:p-5 lg:p-6">
          <div>
            <p className="mb-1 sm:mb-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 dark:text-slate-500 truncate">
              {product.brand ? (product.brand === 'fuwa3e' ? 'Fuwa3e Enzyme' : product.brand === 'vitrue' ? 'VITRUE Natural' : product.brand === 'moc-nam' ? 'Mộc Nam Thảo Dược' : 'DDA-CAL') : categoryLabel(product.category)}
            </p>
            <h3 className="line-clamp-2 min-h-[2.4rem] sm:min-h-[3rem] text-sm sm:text-base lg:text-lg font-semibold leading-snug sm:leading-tight tracking-tight text-slate-900 dark:text-white">
              {product.name}
            </h3>
          </div>
          
          <div className="mt-2.5 sm:mt-4 flex items-end justify-between gap-1">
            <div className="flex flex-col">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                  {vnd(product.originalPrice)}
                </span>
              )}
              <span className="text-sm sm:text-base lg:text-xl font-bold sm:font-medium tracking-tight text-slate-900 dark:text-slate-100">
                {vnd(product.price)}
              </span>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={product.stock === 0}
              className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition-all hover:bg-emerald-500 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-800 dark:text-white dark:hover:bg-emerald-500"
              aria-label="Thêm vào giỏ"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
