import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const FREE_SHIP_THRESHOLD = 500000

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export function SideCart() {
  const { items, isOpen, setOpen, remove, setQty } = useCartStore()
  const navigate = useNavigate()
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0)
  const diff = Math.max(0, FREE_SHIP_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100)
  const cartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.div
            ref={cartRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[101] h-screen w-full max-w-md bg-white shadow-2xl dark:bg-[#0a0a0a] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Giỏ hàng ({items.length})</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Ship Progress */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#111111] border-b border-slate-100 dark:border-slate-800/80">
              {diff > 0 ? (
                <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
                  Cần mua thêm <span className="font-bold text-emerald-600 dark:text-emerald-400">{vnd(diff)}</span> để được <span className="text-emerald-600 dark:text-emerald-400">FREESHIP</span>
                </p>
              ) : (
                <p className="mb-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-center animate-pulse">
                  🎉 CHÚC MỪNG! BẠN ĐÃ ĐƯỢC MIỄN PHÍ GIAO HÀNG
                </p>
              )}
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-400">
                  <div className="p-6 rounded-full bg-slate-50 dark:bg-slate-900">
                    <ShoppingBag className="h-12 w-12 opacity-20" />
                  </div>
                  <p className="font-medium text-lg">Giỏ hàng của bạn đang trống</p>
                  <button
                    onClick={() => { setOpen(false); navigate('/products') }}
                    className="mt-2 rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex gap-4 group">
                    <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="line-clamp-2 text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</h3>
                          <button
                            onClick={() => remove(item.productId)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white uppercase">{vnd(item.price)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-black">
                          <button
                            onClick={() => setQty(item.productId, item.qty - 1)}
                            className="p-1 transition active:scale-95 text-slate-400 hover:text-emerald-500"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">{item.qty}</span>
                          <button
                            onClick={() => setQty(item.productId, item.qty + 1)}
                            className="p-1 transition active:scale-95 text-slate-400 hover:text-emerald-500"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{vnd(item.price * item.qty)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-8 bg-white dark:bg-[#0a0a0a] border-t border-slate-100 dark:border-slate-800/80 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Tạm tính</span>
                    <span className="font-bold text-slate-900 dark:text-white">{vnd(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Phí vận chuyển</span>
                    <span className="font-bold text-emerald-500">{subtotal >= FREE_SHIP_THRESHOLD ? 'Miễn phí' : vnd(30000)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
                    <span className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Tổng cộng</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {vnd(subtotal + (subtotal >= FREE_SHIP_THRESHOLD ? 0 : 30000))}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={() => { setOpen(false); navigate('/checkout') }}
                    className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-emerald-600 py-4 text-center font-black uppercase text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.98]"
                  >
                    Thanh toán ngay
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full rounded-[1.25rem] border border-slate-200 py-4 text-center font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 uppercase text-xs tracking-widest"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
