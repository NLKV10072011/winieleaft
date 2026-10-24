import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Lock, LogOut, Package, UserCircle, MapPin, ChevronRight, Settings } from 'lucide-react'
import { AddressField } from '../components/AddressField'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../context/ToastContext'
import { apiGet, apiSend, type Order } from '../lib/api'
import clsx from 'clsx'

const vnd = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipping: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang chuẩn bị',
  shipping: 'Đang vận chuyển',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn tất',
}

export function Account() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const refreshMe = useAuthStore((s) => s.refreshMe)
  const { show } = useToast()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile')
  
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  useEffect(() => {
    if (!token) return
    apiGet<Order[]>('/orders', token)
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [token])

  if (!user || !token) {
    return (
      <div className="mx-auto flex w-full max-w-[600px] flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
        <UserCircle className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-6" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">Tài khoản</h1>
        <p className="text-slate-500 mb-8">Vui lòng đăng nhập để xem thông tin tài khoản của bạn.</p>
        <Link to="/login" className="rounded-full bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black hover:scale-105">
          Đăng nhập
        </Link>
      </div>
    )
  }

  const tabs = [
     { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
     { id: 'orders', label: 'Lịch sử đơn hàng', icon: Package },
     { id: 'security', label: 'Bảo mật', icon: Settings },
  ] as const

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8 xl:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-10 lg:mb-16">
         <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Tài khoản
         </h1>
         <p className="text-lg text-slate-500 dark:text-slate-400">
            Quản lý thông tin, địa chỉ và lịch sử mua hàng của bạn.
         </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
         
         {/* Sidebar Tabs */}
         <aside className="w-full lg:w-72 shrink-0">
            <div className="grid grid-cols-3 lg:flex lg:flex-col gap-1.5 sm:gap-2 rounded-2xl sm:rounded-[2rem] bg-slate-50 p-2 sm:p-3 border border-slate-200/60 dark:bg-[#111111] dark:border-slate-800/80 lg:sticky lg:top-32">
               {tabs.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                           "flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 rounded-xl sm:rounded-2xl px-2 py-2.5 sm:px-5 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-300 text-center sm:text-left",
                           isActive 
                              ? "bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-[#1a1a1a] dark:text-white dark:border-slate-800" 
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
                        )}
                     >
                        <Icon className={clsx("h-4 w-4 sm:h-5 sm:w-5 shrink-0", isActive ? "text-emerald-500" : "")} />
                        <span className="truncate max-w-full">{tab.label}</span>
                     </button>
                  )
               })}
               <div className="hidden lg:block my-2 border-t border-slate-200 dark:border-slate-800" />
               <button
                 onClick={logout}
                 className="hidden lg:flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/20"
               >
                 <LogOut className="h-5 w-5" />
                 Đăng xuất
               </button>
            </div>
         </aside>

         {/* Content Area */}
         <main className="flex-1 w-full min-h-[500px]">
            <AnimatePresence mode="wait">
               {/* Tab: Profile */}
               {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                     
                     {/* Profile Header */}
                     <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 rounded-2xl sm:rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-5 sm:p-8">
                        <div className="flex h-16 w-16 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-emerald-200/50 text-2xl sm:text-4xl font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                           {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h2 className="text-xl sm:text-3xl font-semibold text-slate-900 dark:text-white mb-1 truncate">{user.name}</h2>
                           <p className="text-sm sm:text-base text-emerald-800/70 dark:text-emerald-200/70 truncate">{user.email}</p>
                        </div>
                     </div>

                     {/* Winie Rewards Card */}
                     {(() => {
                       const pts = user.points ?? 0
                       const tier = pts >= 13000 ? { name: 'Kim Cương', emoji: '💎', color: 'from-sky-400 to-indigo-600', textColor: 'text-sky-50', next: null, nextPts: 0, spend: '1.000.000đ' }
                         : pts >= 8000 ? { name: 'Bạc', emoji: '🥈', color: 'from-slate-400 to-slate-600', textColor: 'text-slate-50', next: 'Kim Cương', nextPts: 13000, spend: '500.000đ' }
                         : pts >= 5000 ? { name: 'Đồng', emoji: '🥉', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-50', next: 'Bạc', nextPts: 8000, spend: '200.000đ' }
                         : { name: 'Thành Viên', emoji: '🌿', color: 'from-emerald-400 to-green-600', textColor: 'text-emerald-50', next: 'Đồng', nextPts: 5000, spend: '0đ' }
                       const pct = tier.next ? Math.min(100, Math.round((pts / tier.nextPts) * 100)) : 100
                       return (
                         <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className={`relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br ${tier.color} p-5 sm:p-8 shadow-xl`}
                         >
                           {/* Bokeh orb */}
                           <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                           <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                           
                           <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                             <div className="text-4xl sm:text-6xl">{tier.emoji}</div>
                             <div className="flex-1">
                               <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] ${tier.textColor} opacity-70 mb-1`}>Hạng thành viên</p>
                               <h3 className={`text-2xl sm:text-4xl font-black ${tier.textColor} tracking-tight mb-1`}>{tier.name}</h3>
                               <p className={`text-xs sm:text-sm ${tier.textColor} opacity-80`}>
                                 <span className="font-bold">{pts.toLocaleString('vi-VN')}</span> điểm tích lũy · Chi tiêu tối thiểu {tier.spend}
                               </p>
                               {tier.next && (
                                 <div className="mt-4">
                                   <div className="flex justify-between mb-1.5">
                                     <p className={`text-xs font-semibold ${tier.textColor} opacity-70`}>Còn {(tier.nextPts - pts).toLocaleString('vi-VN')} điểm để lên {tier.next}</p>
                                     <p className={`text-xs font-bold ${tier.textColor}`}>{pct}%</p>
                                   </div>
                                   <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                                     <motion.div
                                       initial={{ width: 0 }}
                                       animate={{ width: `${pct}%` }}
                                       transition={{ duration: 1.5, ease: 'easeOut' }}
                                       className="h-full bg-white/80 rounded-full"
                                     />
                                   </div>
                                 </div>
                               )}
                             </div>
                           </div>

                           {/* Benefits row */}
                           <div className={`relative z-10 mt-6 grid grid-cols-3 gap-3 border-t border-white/20 pt-6`}>
                             {[
                               { label: 'Miễn phí ship', active: pts >= 5000 },
                               { label: 'Ưu tiên hỗ trợ', active: pts >= 8000 },
                               { label: 'Quà VIP độc quyền', active: pts >= 13000 },
                             ].map(b => (
                               <div key={b.label} className={clsx('text-center rounded-xl p-3', b.active ? 'bg-white/20' : 'bg-white/5 opacity-50')}>
                                 <p className={`text-[11px] font-bold ${tier.textColor}`}>{b.active ? '✓' : '🔒'} {b.label}</p>
                               </div>
                             ))}
                           </div>
                         </motion.div>
                       )
                     })()}

                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="rounded-[2rem] border border-slate-200/60 bg-white p-8 dark:border-slate-800/80 dark:bg-[#111111]">
                           <div className="flex items-center gap-3 mb-6">
                              <MapPin className="h-6 w-6 text-slate-400" />
                              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Địa chỉ giao hàng</h3>
                           </div>
                           <AddressField key={`${user.id}-${user.addresses?.[0] ?? ''}`} initialAddress={user.addresses?.[0] ?? ''} />
                           <p className="mt-4 text-xs text-slate-500">Mặc định sẽ được chọn khi thanh toán.</p>
                        </div>
                        
                        <div className="rounded-[2rem] border border-slate-200/60 bg-white p-8 dark:border-slate-800/80 dark:bg-[#111111]">
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                 <Heart className="h-6 w-6 text-rose-500" />
                                 <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Yêu thích</h3>
                              </div>
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                 {user.wishlist?.length ?? 0}
                              </span>
                           </div>
                           <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                              Bạn đã lưu {user.wishlist?.length ?? 0} sản phẩm. Xem lại danh sách để không bỏ lỡ những món đồ ưng ý.
                           </p>
                           <Link to="/wishlist" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200">
                              Mở Wishlist <ChevronRight className="h-4 w-4" />
                           </Link>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* Tab: Orders */}
               {activeTab === 'orders' && (
                  <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                     <div className="rounded-[2rem] border border-slate-200/60 bg-white p-8 dark:border-slate-800/80 dark:bg-[#111111]">
                        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-8">Lịch sử đơn hàng</h3>
                        
                        {orders.length === 0 ? (
                           <div className="flex flex-col items-center justify-center py-12 text-center">
                              <Package className="h-16 w-16 text-slate-200 dark:text-slate-800 mb-4" />
                              <p className="text-slate-500 text-lg">Bạn chưa có đơn hàng nào.</p>
                              <Link to="/products" className="mt-6 font-semibold text-emerald-600 hover:underline">Bắt đầu mua sắm</Link>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              {orders.map((o) => (
                                 <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-6 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0a0a0a] dark:hover:border-slate-700">
                                    <div>
                                       <div className="flex items-center gap-3 mb-2">
                                          <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">#{o.id.slice(0, 8)}</span>
                                          <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", STATUS_BADGE[o.status] || 'bg-slate-100 text-slate-600')}>
                                             {STATUS_LABEL[o.status] || o.status}
                                          </span>
                                       </div>
                                       <p className="text-sm text-slate-500">
                                          {new Date(o.createdAt).toLocaleString('vi-VN')} · {o.paymentMethod === 'qr' ? 'VietQR' : 'COD'}
                                       </p>
                                    </div>
                                    <div className="flex items-center gap-4 border-t border-slate-200 pt-4 sm:border-0 sm:pt-0 dark:border-slate-800">
                                       <span className="text-lg font-bold text-slate-900 dark:text-white">{vnd(o.total)}</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </motion.div>
               )}

               {/* Tab: Security */}
               {activeTab === 'security' && (
                  <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                     <div className="rounded-[2rem] border border-slate-200/60 bg-white p-8 dark:border-slate-800/80 dark:bg-[#111111]">
                        <div className="flex items-center gap-3 mb-8">
                           <Lock className="h-6 w-6 text-slate-400" />
                           <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Đổi mật khẩu</h3>
                        </div>
                        
                        <form
                           className="max-w-md space-y-5"
                           onSubmit={async (e) => {
                              e.preventDefault()
                              if (!token) return
                              setPwBusy(true)
                              try {
                                 await apiSend<{ ok: boolean }>('/auth/password', 'PATCH', { currentPassword: curPw, newPassword: newPw }, token)
                                 setCurPw('')
                                 setNewPw('')
                                 show('Đã cập nhật mật khẩu', 'ok')
                              } catch (err) {
                                 show(err instanceof Error ? err.message : 'Không đổi được mật khẩu', 'err')
                              } finally {
                                 setPwBusy(false)
                              }
                           }}
                        >
                           <div className="relative group">
                              <input
                                 type="password" required autoComplete="current-password"
                                 value={curPw} onChange={(e) => setCurPw(e.target.value)}
                                 placeholder=" "
                                 className="peer w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 pb-3 pt-7 text-base font-medium text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-[#0a0a0a] dark:text-white dark:focus:bg-[#1a1a1a]"
                              />
                              <label className="pointer-events-none absolute left-4 top-5 origin-[0] -translate-y-3 scale-75 text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-emerald-500">
                                 Mật khẩu hiện tại
                              </label>
                           </div>

                           <div className="relative group">
                              <input
                                 type="password" required autoComplete="new-password" minLength={8}
                                 value={newPw} onChange={(e) => setNewPw(e.target.value)}
                                 placeholder=" "
                                 className="peer w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 pb-3 pt-7 text-base font-medium text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-[#0a0a0a] dark:text-white dark:focus:bg-[#1a1a1a]"
                              />
                              <label className="pointer-events-none absolute left-4 top-5 origin-[0] -translate-y-3 scale-75 text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-emerald-500">
                                 Mật khẩu mới (ít nhất 8 ký tự)
                              </label>
                           </div>
                           
                           <button
                              type="submit"
                              disabled={pwBusy}
                              className="mt-4 rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                           >
                              {pwBusy ? 'Đang lưu…' : 'Cập nhật mật khẩu'}
                           </button>
                        </form>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Mobile Logout (shows at bottom on small screens) */}
            <div className="mt-8 lg:hidden">
               <button
                 onClick={logout}
                 className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-4 font-semibold text-rose-500 transition hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40"
               >
                 <LogOut className="h-5 w-5" />
                 Đăng xuất khỏi thiết bị này
               </button>
            </div>
         </main>
      </div>

    </div>
  )
}
