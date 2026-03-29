import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, QrCode, Wallet } from 'lucide-react'
import { PaymentQrCard } from '../components/PaymentQrCard'
import {
  PAYMENT_ACCOUNT_NAME,
  PAYMENT_QR_CAPTION_DEFAULT,
} from '../lib/payment'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { apiSend, type EmailNotifyResult, type Order } from '../lib/api'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

export function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState(user?.addresses?.[0] || '')
  const [payment, setPayment] = useState<'cod' | 'qr'>('cod')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<Order | null>(null)
  const [emailNotify, setEmailNotify] = useState<EmailNotifyResult | null>(null)
  const [err, setErr] = useState('')

  const total = items.reduce((s, x) => s + x.price * x.qty, 0)

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
        items: items.map((x) => ({
          productId: x.productId,
          qty: x.qty,
        })),
      }
      const res = await apiSend<{
        order: Order
        emailNotify?: EmailNotifyResult
      }>('/orders', 'POST', payload, token)
      clear()
      setDone(res.order)
      setEmailNotify(res.emailNotify ?? null)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Giỏ hàng trống</h1>
        <Link to="/products" className="text-emerald-700 underline dark:text-emerald-300">
          Quay lại mua sắm
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg space-y-6 text-center"
      >
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
        <h1 className="text-2xl font-bold text-emerald-950 dark:text-white">
          Đặt hàng thành công
        </h1>
        <p className="text-emerald-800/80 dark:text-emerald-200/75">
          Mã đơn: <strong>{done.id.slice(0, 8)}</strong> — Tổng{' '}
          <strong>{vnd(done.total)}</strong>
        </p>
        {done.paymentMethod === 'qr' && (
          <PaymentQrCard
            total={done.total}
            accountName={
              done.paymentHint?.accountName ?? PAYMENT_ACCOUNT_NAME
            }
            transferContent={
              done.paymentHint?.transferContent ??
              `WINIE ${done.id.slice(0, 8)}`
            }
            caption={
              done.paymentHint?.caption ?? PAYMENT_QR_CAPTION_DEFAULT
            }
            detailLine={done.qrPayload}
          />
        )}
        {emailNotify?.sent ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Đã gửi email thông báo đơn tới hộp thư shop.
          </p>
        ) : (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-50/90 px-4 py-3 text-left text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">Chưa gửi được email thông báo.</p>
            {emailNotify?.error && (
              <p className="mt-1 font-mono text-xs opacity-90">
                {emailNotify.error}
              </p>
            )}
            {emailNotify?.reason === 'no_emailjs' && (
              <p className="mt-1">
                Kiểm tra <code className="rounded bg-black/10 px-1">EMAILJS_*</code> trong{' '}
                <code className="rounded bg-black/10 px-1">server/.env</code> và khởi động lại API.
              </p>
            )}
            {!emailNotify?.error &&
              emailNotify?.reason !== 'no_emailjs' && (
                <p className="mt-1">
                  Với EmailJS: bật gửi từ server (Dashboard → Account → Security), template
                  phải có biến <code className="rounded bg-black/10 px-1">{'{{subject}}'}</code> và{' '}
                  <code className="rounded bg-black/10 px-1">{'{{message}}'}</code>; kiểm tra cả
                  thư mục spam.
                </p>
              )}
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-2xl bg-emerald-700 px-6 py-3 font-semibold text-white"
        >
          Về trang chủ
        </button>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950 dark:text-white">
          Thanh toán
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Họ tên</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 dark:border-emerald-100/10 dark:bg-[#141c18]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 dark:border-emerald-100/10 dark:bg-[#141c18]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Địa chỉ giao hàng</label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 dark:border-emerald-100/10 dark:bg-[#141c18]"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Phương thức</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setPayment('cod')}
                className={`flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                  payment === 'cod'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
                    : 'border-emerald-900/15 dark:border-emerald-100/10'
                }`}
              >
                <Wallet className="h-5 w-5 shrink-0" />
                COD — Thanh toán khi nhận hàng
              </button>
              <button
                type="button"
                onClick={() => setPayment('qr')}
                className={`flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                  payment === 'qr'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
                    : 'border-emerald-900/15 dark:border-emerald-100/10'
                }`}
              >
                <QrCode className="h-5 w-5 shrink-0" />
                VietQR — Chuyển khoản / app ngân hàng
              </button>
            </div>
          </div>
          {payment === 'qr' && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-emerald-800 dark:text-emerald-200/80">
                Xem trước — mã QR cố định (nội dung CK đúng sau khi đặt)
              </p>
              <PaymentQrCard
                compact
                total={total}
                accountName={PAYMENT_ACCOUNT_NAME}
                transferContent="WINIE + 8 ký tự mã đơn (ngay sau khi bấm xác nhận)"
                caption={PAYMENT_QR_CAPTION_DEFAULT}
              />
            </div>
          )}
          {err && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-700 py-3 font-semibold text-white disabled:opacity-60 dark:bg-emerald-600"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </form>
      </div>
      <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 dark:border-emerald-100/10 dark:bg-[#141c18]">
        <h2 className="font-bold text-emerald-950 dark:text-white">Đơn hàng</h2>
        <ul className="mt-4 space-y-3">
          {items.map((x) => (
            <li key={x.productId} className="flex justify-between text-sm">
              <span className="text-emerald-900 dark:text-emerald-100">
                {x.name} × {x.qty}
              </span>
              <span>{vnd(x.price * x.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-emerald-900/10 pt-4 dark:border-emerald-100/10">
          <div className="flex justify-between text-lg font-bold">
            <span>Tổng</span>
            <span>{vnd(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
