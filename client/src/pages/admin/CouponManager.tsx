import { useEffect, useState } from 'react'
import { 
  Tag, Plus, Trash2, Calendar, 
  DollarSign, Percent, AlertCircle, Loader2, X, Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGet, apiSend } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

interface Coupon {
  id: string
  code: string
  discountType: 'percent' | 'flat'
  discountValue: number
  minOrderValue: number
  expiryDate: string | null
  active: boolean
}

const vnd = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export function CouponManager() {
  const token = useAuthStore((s) => s.token)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  // Form state
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percent' | 'flat'>('percent')
  const [value, setValue] = useState(0)
  const [minOrder, setMinOrder] = useState(0)
  const [expiry, setExpiry] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function fetchCoupons() {
    setLoading(true)
    try {
      const res = await apiGet<Coupon[]>('/admin/coupons', token)
      setCoupons(res)
    } catch (e: any) {
      setErr(e.message || 'Lỗi tải danh sách mã')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiSend('/admin/coupons', 'POST', {
        code: code.toUpperCase(),
        discountType: type,
        discountValue: Number(value),
        minOrderValue: Number(minOrder),
        expiryDate: expiry || null
      }, token)
      setShowAdd(false)
      resetForm()
      fetchCoupons()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa mã giảm giá này?')) return
    try {
      await apiSend(`/admin/coupons/${id}`, 'DELETE', null, token)
      setCoupons(c => c.filter(x => x.id !== id))
    } catch (e: any) {
       alert(e.message)
    }
  }

  function resetForm() {
    setCode('')
    setType('percent')
    setValue(0)
    setMinOrder(0)
    setExpiry('')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Mã giảm giá</h1>
           <p className="text-slate-500">Quản lý các chương trình khuyến mãi và coupon.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-black transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Tạo mã mới
        </button>
      </div>

      {err && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{err}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
         <AnimatePresence>
            {coupons.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 p-8 dark:bg-[#111111] dark:border-slate-800/80 hover:border-emerald-500/50 transition-colors"
              >
                  <div className="mb-6 flex items-center justify-between">
                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                        <Tag className="h-6 w-6" />
                     </div>
                     <button 
                      onClick={() => handleDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20"
                     >
                        <Trash2 className="h-5 w-5" />
                     </button>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-2xl font-black tracking-widest text-slate-900 dark:text-white font-mono">{c.code}</h3>
                     
                     <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold font-mono dark:bg-slate-800 uppercase">
                           {c.discountType === 'percent' ? `Giảm ${c.discountValue}%` : `Giảm ${vnd(c.discountValue)}`}
                        </span>
                        {c.minOrderValue > 0 && (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-950/20 uppercase">
                             Đơn từ {vnd(c.minOrderValue)}
                          </span>
                        )}
                        {c.active ? (
                           <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950/20 uppercase">Đang chạy</span>
                        ) : (
                           <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 uppercase">Tắt</span>
                        )}
                     </div>

                     <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>HSD: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}</span>
                     </div>
                  </div>

                  {/* Decorative background circle */}
                  <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-all" />
              </motion.div>
            ))}
         </AnimatePresence>

         {loading && [1,2,3].map(i => (
            <div key={i} className="h-[240px] rounded-[2.5rem] bg-slate-100 animate-pulse dark:bg-slate-900" />
         ))}

         {!loading && coupons.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 italic">Chưa có mã giảm giá nào.</div>
         )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
         {showAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setShowAdd(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="relative w-full max-w-xl overflow-hidden rounded-[3rem] bg-white shadow-2xl dark:bg-[#111111]"
               >
                  <form onSubmit={handleAdd} className="p-8 md:p-12">
                     <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Thêm mã giảm giá mới</h2>
                        <button type="button" onClick={() => setShowAdd(false)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                           <X className="h-6 w-6" />
                        </button>
                     </div>

                     <div className="space-y-6">
                        <div>
                           <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Mã Coupon</label>
                           <input 
                             required value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                             placeholder="VD: WINTER2024"
                             className="w-full rounded-2xl border border-slate-200 px-4 py-4 font-mono font-bold tracking-widest focus:border-emerald-500 focus:outline-none dark:bg-[#1a1a1a] dark:border-slate-800"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Loại giảm giá</label>
                              <div className="flex gap-2 rounded-2xl bg-slate-50 p-1.5 dark:bg-[#1a1a1a]">
                                 <button 
                                    type="button" onClick={() => setType('percent')}
                                    className={clsx("flex flex-1 items-center justify-center gap-2 rounded-xl py-2 font-bold transition", type === 'percent' ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-800" : "text-slate-400")}
                                 >
                                    <Percent className="h-4 w-4" /> % Trăm
                                 </button>
                                 <button 
                                    type="button" onClick={() => setType('flat')}
                                    className={clsx("flex flex-1 items-center justify-center gap-2 rounded-xl py-2 font-bold transition", type === 'flat' ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-800" : "text-slate-400")}
                                 >
                                    <DollarSign className="h-4 w-4" /> Cố định
                                 </button>
                              </div>
                           </div>
                           <div>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Giá trị</label>
                              <input 
                                required type="number" value={value} onChange={e => setValue(Number(e.target.value))}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold focus:border-emerald-500 focus:outline-none dark:bg-[#1a1a1a] dark:border-slate-800"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Đơn tối thiểu</label>
                              <input 
                                required type="number" value={minOrder} onChange={e => setMinOrder(Number(e.target.value))}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold focus:border-emerald-500 focus:outline-none dark:bg-[#1a1a1a] dark:border-slate-800"
                              />
                           </div>
                           <div>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Ngày hết hạn</label>
                              <input 
                                type="date" value={expiry} onChange={e => setExpiry(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold focus:border-emerald-500 focus:outline-none dark:bg-[#1a1a1a] dark:border-slate-800"
                              />
                           </div>
                        </div>

                        <button 
                           disabled={submitting}
                           className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                           {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Check className="h-6 w-6" /> Lưu mã giảm giá</>}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  )
}
