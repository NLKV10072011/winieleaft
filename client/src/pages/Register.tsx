import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { registerRequest, socialLoginRequest, updateProfile, useAuthStore } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setErr('Mật khẩu tối thiểu 6 ký tự')
      return
    }
    setErr('')
    setLoading(true)
    try {
      await registerRequest(name, email, password)
      const localIds = useLocalWishlistStore.getState().ids
      const user = useAuthStore.getState().user
      if (user && localIds.length > 0) {
         try {
           await updateProfile({ wishlist: localIds })
           useLocalWishlistStore.getState().clear()
         } catch { /* ignore */ }
      }
      navigate('/account')
    } catch (e: any) {
      setErr(e instanceof Error ? e.message : 'Đăng ký thất bại. Email có thể đã tồn tại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setErr('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      await socialLoginRequest(idToken)
      navigate('/account')
    } catch (e: any) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setErr(e.message || 'Lỗi đăng ký Google')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full -mt-16 sm:-mt-20">
      
      {/* Right side: Register Form */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-12 lg:w-1/2 xl:px-24 bg-white dark:bg-[#000000] pt-24 pb-12 sm:pt-0 sm:pb-0">
        <div className="mx-auto flex w-full max-w-[420px] flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
           
           <Link to="/" className="mb-8 sm:mb-12 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
             <ArrowLeft className="h-4 w-4" />
             Về trang chủ
           </Link>

           <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
                 Tạo tài khoản
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                 Trở thành thành viên để tích điểm, theo dõi đơn hàng và lưu yêu thích.
              </p>
           </div>
           
           <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-5">
                 <div className="relative group">
                    <input
                       id="name" type="text" required
                       value={name} onChange={(e) => setName(e.target.value)}
                       placeholder=" "
                       className="peer w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 pb-3 pt-7 text-base font-medium text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-[#111111] dark:text-white dark:focus:bg-[#1a1a1a]"
                    />
                    <label htmlFor="name" className="pointer-events-none absolute left-4 top-5 origin-[0] -translate-y-3 scale-75 text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-emerald-500">
                       Họ và tên
                    </label>
                 </div>

                 <div className="relative group">
                    <input
                       id="email" type="email" required
                       value={email} onChange={(e) => setEmail(e.target.value)}
                       placeholder=" "
                       className="peer w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 pb-3 pt-7 text-base font-medium text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-[#111111] dark:text-white dark:focus:bg-[#1a1a1a]"
                    />
                    <label htmlFor="email" className="pointer-events-none absolute left-4 top-5 origin-[0] -translate-y-3 scale-75 text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-emerald-500">
                       Địa chỉ Email
                    </label>
                 </div>
                 
                 <div className="relative group">
                    <input
                       id="password" type="password" required
                       value={password} onChange={(e) => setPassword(e.target.value)}
                       placeholder=" "
                       className="peer w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 pb-3 pt-7 text-base font-medium text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-[#111111] dark:text-white dark:focus:bg-[#1a1a1a]"
                    />
                    <label htmlFor="password" className="pointer-events-none absolute left-4 top-5 origin-[0] -translate-y-3 scale-75 text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-emerald-500">
                       Mật khẩu (từ 6 ký tự)
                    </label>
                 </div>
              </div>

              {err && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                    {err}
                 </motion.div>
              )}

              <button
                 type="submit"
                 disabled={loading}
                 className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-70"
              >
                 {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Tạo tài khoản'}
              </button>

              <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                  <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-widest text-slate-400">Hoặc</span>
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-4 text-base font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-95 dark:border-slate-800 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
               >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Tiếp tục với Google
              </button>
           </form>

           <div className="mt-10 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                 Đã có tài khoản?{' '}
                 <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline underline-offset-4 dark:text-emerald-400 transition-colors">
                    Đăng nhập
                 </Link>
              </p>
           </div>
        </div>
      </div>

       {/* Left side (swapped to visually appear different from Login) */}
       <div className="hidden lg:block lg:w-1/2 relative bg-emerald-950">
         <img 
           src="https://images.unsplash.com/photo-1547488924-ce610fbdd286?q=80&w=2070&auto=format&fit=crop" 
           alt="Essential Oil Setup"
           className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-80"
         />
         <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/60 to-transparent" />
         <div className="absolute bottom-12 left-12 right-12 text-white">
            <h2 className="text-4xl font-semibold tracking-tight mb-4 text-shadow-sm">Join the club.</h2>
            <p className="text-xl text-emerald-50 font-medium max-w-sm text-shadow-sm">
               Nhận ngay ưu đãi miễn phí vận chuyển cho đơn hàng đầu tiên của thành viên mới.
            </p>
         </div>
      </div>
    </div>
  )
}
