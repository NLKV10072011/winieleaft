import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Package, Truck, CheckCircle2, Clock, 
  MapPin, Phone, CreditCard, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react'
import { apiGet, type Order } from '../lib/api'
import clsx from 'clsx'

const vnd = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const STEPS = [
  { id: 'pending', label: 'Chờ xác nhận', icon: Clock, color: 'text-amber-500' },
  { id: 'processing', label: 'Đang chuẩn bị', icon: Package, color: 'text-blue-500' },
  { id: 'shipping', label: 'Đang giao hàng', icon: Truck, color: 'text-indigo-500' },
  { id: 'delivered', label: 'Đã giao hàng', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'completed', label: 'Hoàn tất', icon: CheckCircle2, color: 'text-emerald-500' },
]

export function OrderTracking() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [needsVerify, setNeedsVerify] = useState(false)

  async function fetchOrder(phoneNo?: string) {
    setLoading(true)
    setErr('')
    try {
      const url = `/orders/${id}${phoneNo ? `?phone=${phoneNo}` : ''}`
      const res = await apiGet<Order>(url)
      setOrder(res)
      setNeedsVerify(false)
    } catch (e: any) {
      if (e.status === 403) {
        setNeedsVerify(true)
      } else {
        setErr(e.message || 'Không tìm thấy đơn hàng')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (needsVerify) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-md py-20 px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/20 mx-auto">
          <Phone className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Xác minh đơn hàng</h1>
        <p className="text-slate-500 mb-8">Để bảo mật, vui lòng nhập số điện thoại bạn đã dùng khi đặt đơn hàng này.</p>
        <div className="flex gap-2">
          <input 
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="09xxx..."
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-[#111111] dark:border-slate-800"
          />
          <button 
            onClick={() => fetchOrder(phoneInput)}
            className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
          >
            Tra cứu
          </button>
        </div>
      </motion.div>
    )
  }

  if (err || !order) {
    return (
      <div className="mx-auto max-w-md py-20 px-6 text-center">
        <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">{err || 'Lỗi tra cứu'}</h1>
        <Link to="/" className="text-emerald-600 font-semibold flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex(s => s.id === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl py-12 px-6">
      <Link to="/account" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Quay lại tài khoản
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tracking Timeline */}
        <div className="lg:col-span-2 space-y-8">
           <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-8 dark:bg-[#111111] dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-black/20">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h1 className="text-2xl font-bold mb-1">Đơn hàng #{order.id.slice(0, 8).toUpperCase()}</h1>
                    <p className="text-sm text-slate-500">Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                 </div>
                 {isCancelled && <span className="rounded-full bg-rose-50 px-4 py-1 text-xs font-bold text-rose-500">ĐÃ HỦY</span>}
              </div>

              {!isCancelled && (
                <div className="relative space-y-10">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-3 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                  
                  {STEPS.map((step, idx) => {
                    const isActive = idx <= currentIdx
                    const isPassed = idx < currentIdx
                    const Icon = step.icon
                    return (
                      <div key={step.id} className="relative flex items-start gap-8 group">
                         <div className={clsx(
                           "relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500",
                           isActive ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                         )}>
                            <Icon className="h-6 w-6" />
                         </div>
                         <div className="pt-2">
                            <h3 className={clsx("font-bold transition-colors", isActive ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                               {step.label}
                            </h3>
                            <p className="text-sm text-slate-500">
                               {isActive ? (isPassed ? "Đã hoàn thành" : "Đang thực hiện") : "Dự kiến"}
                            </p>
                         </div>
                      </div>
                    )
                  })}
                </div>
              )}
           </div>

           {/* Items Summary */}
           <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-8 dark:bg-[#111111] dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-black/20">
              <h2 className="text-xl font-bold mb-6">Sản phẩm</h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                     <div className="h-16 w-16 bg-slate-100 rounded-xl overflow-hidden dark:bg-slate-800">
                        <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-1">{it.name}</p>
                        <p className="text-xs text-slate-500">x{it.qty}</p>
                     </div>
                     <span className="font-mono text-sm font-bold">{vnd(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Info Column */}
        <div className="space-y-8">
           <div className="rounded-[2.5rem] bg-slate-50 border border-slate-200/60 p-8 dark:bg-[#0a0a0a] dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-black/20">
              <h2 className="text-lg font-bold mb-6">Thông tin nhận hàng</h2>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-sm shrink-0">
                       <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Số điện thoại</p>
                       <p className="text-sm font-semibold">{order.phone}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-sm shrink-0">
                       <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Địa chỉ</p>
                       <p className="text-sm font-semibold leading-relaxed">{order.address}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-sm shrink-0">
                       <CreditCard className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Thanh toán</p>
                       <p className="text-sm font-semibold uppercase">{order.paymentMethod === 'qr' ? 'Chuyển khoản' : 'Tiền mặt'}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tạm tính</span>
                    <span className="font-bold">{vnd(order.total)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Phí ship</span>
                    <span className="text-emerald-500 font-bold">0đ</span>
                 </div>
                 <div className="flex justify-between text-lg pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                    <span className="font-bold">Tổng cộng</span>
                    <span className="font-black text-emerald-600">{vnd(order.total)}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  )
}
