import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { ProductImage } from '../components/ProductImage'
import clsx from 'clsx'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export function Cart() {
  const { items, setQty, remove } = useCartStore()
  const total = items.reduce((s, x) => s + x.price * x.qty, 0)
  const isFreeShipping = total >= 500000

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[800px] flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
           <ShoppingBag className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Giỏ hàng của bạn đang trống.
        </h1>
        <p className="mb-10 text-lg text-slate-500 dark:text-slate-400 max-w-md">
          Hãy khám phá những sản phẩm tinh túy từ thiên nhiên của chúng tôi.
        </p>
        <Link
          to="/products"
          className="rounded-full bg-emerald-600 px-8 py-4 font-semibold text-white transition-all hover:bg-emerald-500 hover:scale-105 shadow-xl shadow-emerald-600/20"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3.5 sm:px-8 xl:px-12 py-6 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 sm:mb-12">
         <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-4">
            Đơn hàng
         </h1>
         <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
            Miễn phí giao hàng cho đơn từ 500.000đ.
         </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-24">
        
        {/* Cart Items List */}
        <div className="w-full lg:w-[60%] xl:w-[65%]">
           {/* Free Shipping Progress Indicator */}
           <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-slate-50 border border-slate-200/60 dark:bg-[#111111] dark:border-slate-800/80">
              <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                 <span className="text-xs sm:text-base font-semibold text-slate-900 dark:text-white">
                    {isFreeShipping ? '🎉 Bạn được miễn phí giao hàng!' : `Mua thêm ${vnd(500000 - total)} để Freeship`}
                 </span>
                 <TruckIcon className={clsx("h-4 w-4 sm:h-5 sm:w-5 shrink-0 ml-2", isFreeShipping ? "text-emerald-500" : "text-slate-400")} />
              </div>
              <div className="h-1.5 sm:h-2 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-800">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((total / 500000) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={clsx("h-full rounded-full transition-colors", isFreeShipping ? "bg-emerald-500" : "bg-emerald-400")}
                 />
              </div>
           </div>

           <div className="space-y-3 sm:space-y-6">
             <AnimatePresence>
                {items.map((line) => (
                  <motion.div
                     key={line.productId}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="group flex flex-row gap-3.5 sm:gap-6 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 bg-white p-3 sm:p-5 transition-shadow hover:shadow-lg dark:border-slate-800/80 dark:bg-[#0a0a0a]"
                  >
                     <Link to={`/products/${line.productId}`} className="shrink-0">
                        <div className="h-20 w-20 sm:h-36 sm:w-36 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#111111]">
                           <ProductImage
                              image={line.image}
                              alt={line.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                           />
                        </div>
                     </Link>
                     
                     <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                           <div className="flex justify-between items-start gap-2 mb-1">
                              <Link
                                 to={`/products/${line.productId}`}
                                 className="text-sm sm:text-lg font-semibold leading-snug tracking-tight text-slate-900 hover:text-emerald-600 transition dark:text-white dark:hover:text-emerald-400 line-clamp-2"
                              >
                                 {line.name}
                              </Link>
                              <button
                                 type="button"
                                 onClick={() => remove(line.productId)}
                                 className="p-1 text-slate-400 transition hover:text-rose-500 shrink-0"
                                 title="Xóa sản phẩm"
                              >
                                 <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                           </div>
                           
                           <p className="text-xs sm:text-base font-medium text-slate-500 dark:text-slate-400">
                              {vnd(line.price)}
                           </p>
                        </div>
                        
                        <div className="mt-2.5 flex items-center justify-between">
                           <div className="flex items-center rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#111111]">
                              <button
                                 className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-base sm:text-lg font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white active:bg-slate-200 dark:active:bg-slate-700 rounded-l-lg sm:rounded-l-xl"
                                 onClick={() => setQty(line.productId, line.qty - 1)}
                              >−</button>
                              <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                 {line.qty}
                              </span>
                              <button
                                 className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-base sm:text-lg font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white active:bg-slate-200 dark:active:bg-slate-700 rounded-r-lg sm:rounded-r-xl"
                                 onClick={() => setQty(line.productId, line.qty + 1)}
                              >+</button>
                           </div>
                           <div className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                              {vnd(line.price * line.qty)}
                           </div>
                        </div>
                     </div>
                  </motion.div>
                ))}
             </AnimatePresence>
           </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[40%] xl:w-[35%] lg:sticky lg:top-32 h-fit">
           <div className="rounded-2xl sm:rounded-[2.5rem] bg-slate-50 p-5 sm:p-8 border border-slate-200/60 dark:bg-[#111111] dark:border-slate-800/80">
              <h2 className="mb-5 sm:mb-8 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Tổng cộng
              </h2>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                 <div className="flex justify-between text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    <span>Trị giá sản phẩm</span>
                    <span className="font-medium text-slate-900 dark:text-white">{vnd(total)}</span>
                 </div>
                 <div className="flex justify-between text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                       {isFreeShipping ? 'Miễn phí' : 'Tính khi thanh toán'}
                    </span>
                 </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4 sm:pt-6 mb-6 sm:mb-8 dark:border-slate-800">
                 <div className="flex justify-between items-end">
                    <span className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white">Tổng thanh toán</span>
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                       {vnd(total)}
                    </span>
                 </div>
                 <p className="text-xs text-slate-500 mt-1.5 text-right">Đã bao gồm VAT</p>
              </div>
              
              <Link
                 to="/checkout"
                 className="group flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-emerald-600 py-3.5 sm:py-4 font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-500/20 text-sm sm:text-base"
              >
                 Tiến hành thanh toán
                 <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <div className="mt-5 sm:mt-6 flex flex-col gap-2.5 text-xs sm:text-sm text-slate-500 justify-center items-center text-center">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Thanh toán an toàn bảo mật 100%</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <TruckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Giao hàng tận nơi toàn quốc</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}

function TruckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
      <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}
