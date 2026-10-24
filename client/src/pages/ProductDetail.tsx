import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { apiGet, apiSend, type Product, type ProductReview } from '../lib/api'
import { categoryLabel } from '../lib/constants'
import { useCartStore } from '../store/cartStore'
import { useAuthStore, updateProfile } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'
import { useRecentProductsStore } from '../store/recentProductsStore'
import { useToast } from '../context/ToastContext'
import clsx from 'clsx'
import { ProductImage } from '../components/ProductImage'
import { productImageUrl } from '../lib/productImage'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [loading, setLoading] = useState(true)

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
      setLoading(true)
      try {
        const p = await apiGet<Product>(`/products/${id}`)
        if (cancelled) return
        setProduct(p)
        setQty(1)
        addRecent(p.id)

        const rel = await apiGet<Product[]>(`/suggestions?category=${encodeURIComponent(p.category)}`)
        if (!cancelled) setRelated(rel.filter(item => item.id !== p.id))

        const rev = await apiGet<ProductReview[]>(`/products/${p.id}/reviews`).catch(() => [])
        if (!cancelled) setReviews(rev)
      } catch {
        if (!cancelled) {
          setProduct(null)
          setRelated([])
          setReviews([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
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
      show(now ? 'Đã thêm' : 'Đã xóa', 'ok')
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !product) { show('Vui lòng đăng nhập để đánh giá', 'err'); return }
    setSubmittingReview(true)
    try {
      const rev = await apiSend<ProductReview>(`/products/${product.id}/reviews`, 'POST', { rating, comment }, token)
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <p className="font-medium animate-pulse">Đang tải sản phẩm...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
        <p className="text-xl font-medium text-slate-600 dark:text-slate-300">Không tìm thấy sản phẩm.</p>
        <Link to="/products" className="text-emerald-600 font-semibold hover:underline">Quay lại cửa hàng</Link>
      </div>
    )
  }

  const myReview = token && user ? reviews.find((r) => r.userId === user.id) : null

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 xl:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Breadcrumb nav */}
      <nav className="mb-10">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase transition">
          <ArrowLeft className="h-4 w-4" />
          Tất cả sản phẩm
        </Link>
      </nav>

      {/* Main Product Area (Apple Sticky Layout) */}
      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-24 items-start">

        {/* Left: Sticky Image Container */}
        <div className="w-full lg:w-[45%] lg:sticky lg:top-32 xl:w-1/2 shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-slate-50 dark:bg-[#0a0a0a]"
          >
            <ProductImage
              image={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 sm:top-6 sm:left-6 rounded-full bg-black/80 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
                Featured
              </span>
            )}
            <button
              type="button"
              onClick={toggleWishlist}
              className={clsx(
                'absolute right-4 top-4 sm:right-6 sm:top-6 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full backdrop-blur-md shadow-lg transition-all duration-300',
                liked
                  ? 'bg-rose-500 text-white shadow-rose-500/20'
                  : 'bg-white/80 text-slate-900 hover:bg-white hover:scale-110 dark:bg-black/50 dark:text-white dark:hover:bg-black/80'
              )}
              aria-label="Yêu thích"
            >
              <Heart className={clsx('h-4 w-4 sm:h-5 sm:w-5', liked && 'fill-current')} />
            </button>
          </motion.div>
        </div>

        {/* Right: Scrolling Info */}
        <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col pt-2 lg:pt-10 space-y-8 sm:space-y-12">

          <div className="space-y-4 sm:space-y-6">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              {categoryLabel(product.category)}
            </p>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                <span className="text-amber-700 dark:text-amber-400">{product.rating.toFixed(1)} <span className="text-amber-600/60 ml-1">({reviews.length} đánh giá)</span></span>
              </div>
              <div className={clsx(
                "px-3 py-1 rounded-full border",
                product.stock > 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                  : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
              )}>
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-baseline gap-3 sm:gap-4">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {vnd(product.price)}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <p className="text-lg sm:text-xl text-slate-400 line-through">
                    {vnd(product.originalPrice)}
                  </p>
                  <span className="rounded-full bg-rose-600 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-white shadow-sm">
                    Tiết kiệm {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-base sm:text-lg leading-relaxed tracking-tight text-slate-600 dark:text-slate-400 border-t border-slate-200/50 pt-6 sm:pt-8 dark:border-slate-800/80">
              {product.description || "Hãy tận hưởng sự tinh khiết từ thiên nhiên. Sản phẩm được lựa chọn kỹ lưỡng để mang đến cho bạn trải nghiệm tuyệt vời nhất."}
            </p>
          </div>

          {/* Add to cart section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200/60 dark:bg-[#111111] dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between w-full sm:w-auto rounded-2xl bg-white border border-slate-200 px-2 dark:bg-[#0a0a0a] dark:border-slate-800">
              <button
                type="button"
                className="p-4 text-xl font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={product.stock === 0}
              >−</button>
              <span className="w-8 text-center text-lg font-semibold text-slate-900 dark:text-white">{qty}</span>
              <button
                type="button"
                className="p-4 text-xl font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={product.stock === 0}
              >+</button>
            </div>

            <button
              type="button"
              disabled={product.stock === 0}
              onClick={() => {
                add({ productId: product.id, name: product.name, price: product.price, image: productImageUrl(product.image), qty })
                show(`Đã thêm ${qty} sản phẩm vào giỏ`, 'ok')
              }}
              className={clsx(
                "flex-1 flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300",
                product.stock === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                  : "bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95"
              )}
            >
              <ShoppingBag className="h-5 w-5" />
              {product.stock === 0 ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-6 border-t border-slate-200/50 pt-10 dark:border-slate-800/80">
            <div className="flex flex-col gap-2">
              <Truck className="h-6 w-6 text-slate-400 mb-2" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Giao hàng miễn phí</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cho đơn hàng trên 500.000đ</p>
            </div>
            <div className="flex flex-col gap-2">
              <ShieldCheck className="h-6 w-6 text-slate-400 mb-2" />
              <h4 className="font-semibold text-slate-900 dark:text-white">An tâm mua sắm</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Đổi trả miễn phí trong 7 ngày</p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-slate-200/50 pt-16 dark:border-slate-800/80">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
              Đánh giá từ khách hàng
            </h2>

            {token && !myReview && (
              <div className="mb-10 rounded-[2rem] bg-slate-50 p-8 border border-slate-200/60 dark:bg-[#111111] dark:border-slate-800/80">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Chia sẻ cảm nhận của bạn</h3>
                <form onSubmit={submitReview} className="space-y-6">
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={clsx(
                          'transition hover:scale-110 active:scale-90',
                          rating >= n ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        )}
                        aria-label={`${n} sao`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Sản phẩm này tuyệt vời như thế nào?"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-[#0a0a0a]"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                  >
                    {submittingReview ? 'Đang gửi…' : 'Gửi đánh giá'}
                  </button>
                </form>
              </div>
            )}

            {!token && (
              <div className="mb-10 rounded-2xl bg-amber-50/50 p-4 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  Vui lòng <Link to="/login" className="font-bold underline underline-offset-2">đăng nhập</Link> để đánh giá sản phẩm.
                </p>
              </div>
            )}

            {/* Review Summary Stats */}
            <div className="mb-12 grid gap-8 sm:grid-cols-2 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-200/40 dark:bg-[#0a0a0a] dark:border-slate-800/60">
              <div className="flex flex-col items-center justify-center border-r border-slate-200/60 dark:border-slate-800/60 pr-8">
                <div className="text-6xl font-black text-slate-900 dark:text-white mb-2">
                  {product.rating.toFixed(1)}
                </div>
                <div className="flex text-amber-400 mb-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <Star key={v} className={clsx("h-5 w-5 fill-current", product.rating < v && "opacity-20")} />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{reviews.length} Đánh giá</p>
              </div>

              <div className="space-y-3 flex flex-col justify-center">
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = reviews.filter(r => r.rating === s).length
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={s} className="flex items-center gap-4 group">
                      <span className="w-12 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {s} <Star className="h-3 w-3 fill-current text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-amber-400 rounded-full"
                        />
                      </div>
                      <span className="w-8 text-[10px] font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-8">
              {reviews.length === 0 ? (
                <p className="text-slate-500 italic text-center py-10">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
              ) : (
                reviews.map((r, idx) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-slate-100 pb-8 last:border-0 dark:border-slate-800/80"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{r.userName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-400">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-slate-600 leading-relaxed dark:text-slate-400 pl-14">
                        "{r.comment}"
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-32 pt-16 border-t border-slate-200/50 dark:border-slate-800/80">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Khám phá thêm
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {related.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0a0a0a]/95 sm:hidden shadow-lg pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-slate-400 truncate">Giá sản phẩm</span>
          <span className="text-base font-bold text-slate-900 dark:text-white truncate">{vnd(product.price)}</span>
        </div>
        <button
          type="button"
          disabled={product.stock === 0}
          onClick={() => {
            add({ productId: product.id, name: product.name, price: product.price, image: productImageUrl(product.image), qty })
            show(`Đã thêm ${qty} sản phẩm vào giỏ`, 'ok')
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 active:scale-95 disabled:opacity-50 shrink-0"
        >
          <ShoppingBag className="h-4 w-4" />
          {product.stock === 0 ? 'Hết hàng' : `Thêm vào giỏ (${qty})`}
        </button>
      </div>
    </div>
  )
}
