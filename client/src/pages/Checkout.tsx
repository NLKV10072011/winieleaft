import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, QrCode, Wallet, Lock, ShoppingBag, ArrowLeft,
  Tag, X, Loader2, ChevronRight,
} from 'lucide-react'
import { PaymentQrCard } from '../components/PaymentQrCard'
import { PAYMENT_ACCOUNT_NAME, PAYMENT_QR_CAPTION_DEFAULT } from '../lib/payment'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { apiGet, apiSend, type EmailNotifyResult, type Order } from '../lib/api'
import clsx from 'clsx'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const FREE_SHIP = 500000
const SHIP_FEE = 30000

interface CouponResult {
  code: string
  discountType: 'percent' | 'flat'
  discountValue: number
  discount: number
}

export function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState(user?.addresses?.[0] || '')
  const [payment, setPayment] = useState<'cod' | 'qr'>('qr')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<Order | null>(null)
  const [err, setErr] = useState('')

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null)
  const [couponErr, setCouponErr] = useState('')

  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0)
  const couponDiscount = couponResult?.discount ?? 0
  const shipping = subtotal >= FREE_SHIP ? 0 : SHIP_FEE
  const total = Math.max(0, subtotal - couponDiscount) + shipping

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponErr('')
    setCouponLoading(true)
    try {
      const res = await apiGet<CouponResult>(
        `/coupons/validate?code=${encodeURIComponent(couponInput.trim())}&total=${subtotal}`
      )
      setCouponResult(res)
    } catch (e) {
      setCouponErr(e instanceof Error ? e.message : 'Mã không hợp lệ')
      setCouponResult(null)
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCouponResult(null)
    setCouponInput('')
    setCouponErr('')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!items.length) return
    setErr('')
    setSubmitting(true)
    try {
      const payload = {
        customerName: name,
        phone,
        address,
        paymentMethod: payment,
        couponCode: couponResult?.code || undefined,
        items: items.map((x) => ({ productId: x.productId, qty: x.qty })),
      }
      const res = await apiSend<{ order: Order; emailNotify?: EmailNotifyResult }>(
        '/orders', 'POST', payload, token
      )
      clear()
      setDone(res.order)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Có lỗi xảy ra, vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto flex w-full max-w-[600px] flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
        <ShoppingBag className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-6" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">Giỏ hàng trống</h1>
        <p className="text-slate-500 mb-8">Vui lòng chọn sản phẩm trước khi thanh toán.</p>
        <Link to="/products" className="rounded-full bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black hover:scale-105">
          Quay lại cửa hàng
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-[600px] py-8 sm:py-20 px-3.5 sm:px-4"
      >
        <div className="flex flex-col items-center text-center bg-white dark:bg-[#111111] p-5 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-200/60 dark:border-slate-800/80 shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 mb-5 sm:mb-8"
          >
            <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">Đặt hàng thành công 🎉</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base font-medium">
            Mã đơn hàng: <span className="text-slate-900 dark:text-white font-mono font-bold">#{done.id.slice(0, 8).toUpperCase()}</span>
          </p>

          <div className="w-full bg-slate-50 dark:bg-[#0a0a0a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 text-left border border-slate-100 dark:border-slate-800 space-y-3">
            {'subtotal' in done && (done as Order & { subtotal?: number }).subtotal != null && (done as Order & { subtotal?: number }).subtotal !== done.total && (
              <>
                <div className="flex justify-between text-xs sm:text-sm text-slate-500">
                  <span>Tạm tính</span>
                  <span>{vnd((done as Order & { subtotal?: number }).subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-emerald-600">
                  <span>Giảm giá (Coupon)</span>
                  <span>-{vnd(((done as Order & { subtotal?: number; discount?: number }).discount) ?? 0)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
              <span className="text-sm sm:text-base text-slate-500">Tổng thanh toán</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{vnd(done.total)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-500">Phương thức</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {done.paymentMethod === 'qr' ? 'VietQR Transfer' : 'Thanh toán tiền mặt (COD)'}
              </span>
            </div>
          </div>

          {done.paymentMethod === 'qr' && (
            <div className="w-full mb-6 sm:mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                <p className="font-semibold mb-3 sm:mb-4 text-center text-sm sm:text-base text-emerald-900 dark:text-emerald-100">Quét mã QR để thanh toán</p>
                <PaymentQrCard
                  total={done.total}
                  accountName={done.paymentHint?.accountName ?? PAYMENT_ACCOUNT_NAME}
                  transferContent={done.paymentHint?.transferContent ?? `WINIE ${done.id.slice(0, 8)}`}
                  caption={done.paymentHint?.caption ?? PAYMENT_QR_CAPTION_DEFAULT}
                  detailLine={done.qrPayload}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={() => navigate('/account')}
              className="w-full rounded-xl sm:rounded-2xl bg-slate-900 py-3.5 sm:py-4 font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-black dark:hover:bg-slate-200 text-sm sm:text-base"
            >
              Xem lịch sử đơn hàng
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-xl sm:rounded-2xl border border-slate-200 py-3.5 sm:py-4 font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.99] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 text-sm sm:text-base"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3.5 sm:px-8 xl:px-12 py-5 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 sm:mb-10 lg:mb-14">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
          Quay lại Giỏ hàng
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-24">
        {/* Checkout Form */}
        <div className="w-full lg:w-[55%]">
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6 sm:mb-10">
            Thông tin giao hàng
          </h1>

          <form id="checkout-form" onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-5">
              {/* Pre-fill notice */}
              {user && (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">Thông tin được điền sẵn từ tài khoản của bạn.</p>
                </div>
              )}

              {[
                { id: 'name', label: 'Họ và tên', value: name, set: setName, type: 'text', required: true },
                { id: 'phone', label: 'Số điện thoại liên hệ', value: phone, set: setPhone, type: 'tel', required: true },
              ].map((f) => (
                <div key={f.id} className="relative">
                  <input
                    id={f.id}
                    type={f.type}
                    required={f.required}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder=" "
                    className="peer w-full rounded-2xl border border-slate-200 bg-white/50 px-4 pb-3 pt-7 text-base font-medium text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-[#111111]/50 dark:text-white dark:focus:bg-[#1a1a1a]"
                  />
                  <label htmlFor={f.id} className="pointer-events-none absolute left-4 top-5 origin-[0] -translate-y-3 scale-75 text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-emerald-500">
                    {f.label}
                  </label>
                </div>
              ))}

              <div className="relative">
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder=" "
                  className="peer w-full resize-none rounded-2xl border border-slate-200 bg-white/50 px-4 pb-3 pt-7 text-base font-medium text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-[#111111]/50 dark:text-white dark:focus:bg-[#1a1a1a]"
                />
                <label htmlFor="address" className="pointer-events-none absolute left-4 top-5 origin-[0] -translate-y-3 scale-75 text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-emerald-500">
                  Địa chỉ nhận hàng chi tiết
                </label>
              </div>

              {/* Saved addresses quick select */}
              {user?.addresses && user.addresses.filter(Boolean).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Địa chỉ đã lưu</p>
                  {user.addresses.filter(Boolean).map((addr, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAddress(addr)}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition',
                        address === addr
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                      )}
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1 font-medium">{addr}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4 sm:mb-6">
                Phương thức thanh toán
              </h2>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {([
                  { key: 'qr', icon: QrCode, title: 'VietQR Transfer', desc: 'Quét mã QR sau khi đặt hàng.' },
                  { key: 'cod', icon: Wallet, title: 'Thanh toán tiền mặt', desc: 'Giao hàng và thu tiền tận nơi (COD).' },
                ] as const).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPayment(m.key)}
                    className={clsx(
                      'relative flex flex-col items-start gap-3 sm:gap-4 rounded-2xl sm:rounded-[2rem] border-2 p-4 sm:p-6 transition-all duration-300 text-left active:scale-[0.99]',
                      payment === m.key
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10 dark:bg-emerald-950/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#111111] dark:hover:border-slate-700'
                    )}
                  >
                    <div className={clsx('flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-white', payment === m.key ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700')}>
                      <m.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base mb-0.5">{m.title}</p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{m.desc}</p>
                    </div>
                    {payment === m.key && (
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-emerald-500 border-[3px] sm:border-[4px] border-emerald-100 dark:border-emerald-900" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {err && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-2xl bg-rose-50 p-4 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                <p className="text-sm font-medium">{err}</p>
              </motion.div>
            )}
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-[45%]">
          <div className="rounded-2xl sm:rounded-[2.5rem] bg-slate-50 border border-slate-200/60 p-5 sm:p-8 dark:bg-[#111111] dark:border-slate-800/80 lg:sticky lg:top-32 space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tóm tắt đơn hàng
            </h2>

            {/* Items */}
            <ul className="space-y-4">
              {items.map((x) => (
                <li key={x.productId} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-xl bg-white dark:bg-[#0a0a0a] overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                      <img src={x.image} alt={x.name} className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-white dark:text-black shadow-sm ring-2 ring-white dark:ring-[#111111]">
                        {x.qty}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white max-w-[180px] truncate">{x.name}</span>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{vnd(x.price * x.qty)}</span>
                </li>
              ))}
            </ul>

            {/* Coupon input */}
            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Mã giảm giá</p>

              {couponResult ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 dark:bg-emerald-950/20 dark:border-emerald-800"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">{couponResult.code}</span>
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">
                      — Giảm {couponResult.discountType === 'percent' ? `${couponResult.discountValue}%` : vnd(couponResult.discountValue)}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="p-1 text-emerald-600 hover:text-rose-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                    placeholder="Nhập mã coupon..."
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono font-bold tracking-widest text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-[#0a0a0a] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                  >
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Áp dụng'}
                  </button>
                </div>
              )}

              {couponErr && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-rose-500 font-medium px-1">
                  {couponErr}
                </motion.p>
              )}
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Tạm tính</span>
                <span>{vnd(subtotal)}</span>
              </div>

              <AnimatePresence>
                {couponDiscount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-semibold"
                  >
                    <span>Giảm giá coupon</span>
                    <span>-{vnd(couponDiscount)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? 'text-emerald-500 font-semibold' : ''}>
                  {shipping === 0 ? '🎉 Miễn phí' : vnd(SHIP_FEE)}
                </span>
              </div>

              {subtotal < FREE_SHIP && (
                <div className="rounded-xl bg-slate-100 dark:bg-slate-900 px-4 py-2.5">
                  <div className="flex justify-between mb-1.5 text-xs text-slate-500">
                    <span>Còn {vnd(FREE_SHIP - subtotal)} để freeship</span>
                    <span>{Math.round((subtotal / FREE_SHIP) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      animate={{ width: `${Math.min(100, (subtotal / FREE_SHIP) * 100)}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex items-end justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
              <span className="text-slate-900 dark:text-white font-bold text-lg">Tổng cộng</span>
              <div className="text-right">
                {couponDiscount > 0 && (
                  <p className="text-sm text-slate-400 line-through">{vnd(subtotal + shipping)}</p>
                )}
                <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{vnd(total)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-wide"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Đang xử lý...</>
              ) : (
                <><Lock className="h-4 w-4" /> Xác nhận Thanh toán</>
              )}
            </button>

            <p className="text-center text-xs text-slate-400">
              🔒 Thông tin của bạn được mã hóa và bảo mật hoàn toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
