import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, ShoppingBag, Star } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import {
  apiGet,
  apiSend,
  type Product,
  type ProductReview,
} from '../lib/api'
import { categoryLabel } from '../lib/constants'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { updateProfile } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'
import { useRecentProductsStore } from '../store/recentProductsStore'
import { useToast } from '../context/ToastContext'
import clsx from 'clsx'
import { ProductImage } from '../components/ProductImage'
import { productImageUrl } from '../lib/productImage'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

export function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const add = useCartStore((s) => s.add)
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const addRecent = useRecentProductsStore((s) => s.add)
  const toggleLocal = useLocalWishlistStore((s) => s.toggle)
  const localHas = useLocalWishlistStore((s) => s.has(product?.id || ''))
  const { show } = useToast()
  const wishlist = user?.wishlist ?? []
  const liked = user ? wishlist.includes(product?.id || '') : localHas

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void (async () => {
      try {
        const p = await apiGet<Product>(`/products/${id}`)
        if (cancelled) return
        setProduct(p)
        addRecent(p.id)
        const rel = await apiGet<Product[]>(
          `/suggestions?category=${encodeURIComponent(p.category)}`
        )
        if (!cancelled) setRelated(rel)
        const rev = await apiGet<ProductReview[]>(
          `/products/${p.id}/reviews`
        ).catch(() => [])
        if (!cancelled) setReviews(rev)
      } catch {
        if (!cancelled) {
          setProduct(null)
          setRelated([])
          setReviews([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, addRecent])

  async function toggleWishlist() {
    if (!product) return
    if (user && token) {
      const next = liked
        ? wishlist.filter((x) => x !== product.id)
        : [...wishlist, product.id]
      try {
        await updateProfile({ wishlist: next })
        show(liked ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích', 'ok')
      } catch {
        setAuth(token!, { ...user!, wishlist: next })
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

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !product) {
      show('Vui lòng đăng nhập để đánh giá', 'err')
      return
    }
    setSubmittingReview(true)
    try {
      const rev = await apiSend<ProductReview>(
        `/products/${product.id}/reviews`,
        'POST',
        { rating, comment },
        token
      )
      setReviews((r) => [rev, ...r])
      setComment('')
      show('Cảm ơn bạn đã đánh giá!', 'ok')
      const p2 = await apiGet<Product>(`/products/${product.id}`)
      setProduct(p2)
    } catch (err) {
      show(err instanceof Error ? err.message : 'Không gửi được đánh giá', 'err')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (!product) {
    return (
      <p className="text-center text-emerald-800/70">
        {id ? 'Đang tải hoặc không tìm thấy...' : 'Thiếu mã sản phẩm'}
      </p>
    )
  }

  const myReview = token && user ? reviews.find((r) => r.userId === user.id) : null

  return (
    <div className="space-y-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại cửa hàng
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white dark:border-emerald-100/10 dark:bg-[#141c18]"
        >
          <ProductImage
            image={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
            loading="eager"
          />
        </motion.div>
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            {categoryLabel(product.category)}
          </p>
          <h1 className="text-3xl font-bold text-emerald-950 dark:text-white">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-amber-500">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-semibold text-emerald-900 dark:text-emerald-100">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-emerald-800/60 dark:text-emerald-300/60">
              · Còn {product.stock} sản phẩm
            </span>
          </div>
          <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
            {vnd(product.price)}
          </p>
          <p className="leading-relaxed text-emerald-900/85 dark:text-emerald-100/85">
            {product.description}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-2xl border border-emerald-900/15 dark:border-emerald-100/10">
              <button
                type="button"
                className="px-4 py-2 text-lg"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="min-w-[2rem] text-center font-semibold">
                {qty}
              </span>
              <button
                type="button"
                className="px-4 py-2 text-lg"
                onClick={() =>
                  setQty((q) => Math.min(product.stock, q + 1))
                }
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                add({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: productImageUrl(product.image),
                  qty,
                })
                show('Đã thêm vào giỏ hàng', 'ok')
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-600 sm:flex-none dark:bg-emerald-600"
            >
              <ShoppingBag className="h-5 w-5" />
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={toggleWishlist}
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors',
                liked
                  ? 'border-rose-400 bg-rose-500 text-white'
                  : 'border-emerald-900/15 hover:bg-emerald-50 dark:border-emerald-100/10 dark:hover:bg-white/5'
              )}
              aria-label="Yêu thích"
            >
              <Heart className={clsx('h-6 w-6', liked && 'fill-current')} />
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 dark:border-emerald-100/10 dark:bg-[#141c18]">
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white">
          Đánh giá ({reviews.length})
        </h2>
        {token && !myReview && (
          <form onSubmit={submitReview} className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-emerald-800/80">Số sao:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={clsx(
                    'rounded-lg p-1 transition',
                    rating >= n ? 'text-amber-500' : 'text-emerald-900/20'
                  )}
                  aria-label={`${n} sao`}
                >
                  <Star className="h-7 w-7 fill-current" />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Viết nhận xét (tuỳ chọn)"
              rows={3}
              className="w-full rounded-2xl border border-emerald-900/15 px-4 py-3 dark:border-emerald-100/10 dark:bg-[#0c1210]"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submittingReview ? 'Đang gửi…' : 'Gửi đánh giá'}
            </button>
          </form>
        )}
        {!token && (
          <p className="mt-2 text-sm text-emerald-800/70">
            <Link to="/login" className="font-semibold underline">
              Đăng nhập
            </Link>{' '}
            để đánh giá sản phẩm.
          </p>
        )}
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="border-t border-emerald-900/10 pt-4 dark:border-emerald-100/10"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-emerald-950 dark:text-white">
                  {r.userName}
                </span>
                <span className="flex text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
                <span className="text-xs text-emerald-800/60">
                  {new Date(r.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {r.comment ? (
                <p className="mt-2 text-sm text-emerald-900/90 dark:text-emerald-100/85">
                  {r.comment}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        {reviews.length === 0 && (
          <p className="mt-4 text-sm text-emerald-800/60">Chưa có đánh giá.</p>
        )}
      </section>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-emerald-950 dark:text-white">
            Gợi ý cùng danh mục
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
