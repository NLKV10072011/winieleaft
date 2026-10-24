import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  User,
  X,
} from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useLocalWishlistStore } from '../store/localWishlistStore'
import { ProductSearchBar } from './ProductSearchBar'
import clsx from 'clsx'

const nav = [
  { to: '/', label: 'Trang chủ' },
  { to: '/products', label: 'Tất cả Sản phẩm' },
  { to: '/wishlist', label: 'Yêu thích' },
]

export function Header() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const headerSearchQ = location.pathname === '/products' ? searchParams.get('q') || '' : ''
  const [menu, setMenu] = useState(false)
  const toggle = useThemeStore((s) => s.toggle)
  const dark = useThemeStore((s) => s.theme === 'dark')
  
  const count = useCartStore((s) => s.items.reduce((a, x) => a + x.qty, 0))
  const user = useAuthStore((s) => s.user)
  const localWishIds = useLocalWishlistStore((s) => s.ids)
  const wishCount = new Set([...(user?.wishlist ?? []), ...localWishIds]).size

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menu])

  return (
    <header 
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-slate-50/70 border-b border-slate-200/50 backdrop-blur-xl dark:bg-[#000000]/70 dark:border-slate-800/80 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-3.5 sm:px-8 xl:px-0">
        <Link
          to="/"
          className="flex items-center gap-2 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 group"
        >
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
            <img src="/avatar.svg" alt="Winieleaf Logo" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 text-base sm:text-lg">
            Winieleaf
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                clsx(
                  'text-xs font-medium uppercase tracking-[0.15em] transition-all hover:text-emerald-500 duration-300 relative',
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                )
              }
              end={n.to === '/'}
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-6 left-0 right-0 h-[2px] bg-emerald-500"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-600 transition-colors hover:text-emerald-500"
            >
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 md:hidden active:scale-95"
            aria-label="Menu"
            onClick={() => setMenu(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden lg:block w-48">
            <ProductSearchBar variant="header" urlQuery={headerSearchQ} onApply={() => {}} />
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
             <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-300 active:scale-95"
            >
              {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            
            <Link
              to={user ? '/account' : '/login'}
              aria-label="Tài khoản"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 active:scale-95"
            >
              <User className="h-4.5 w-4.5" />
            </Link>
            
            <button
              onClick={() => useCartStore.getState().setOpen(true)}
              aria-label="Giỏ hàng"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 group active:scale-95"
            >
               <ShoppingCart className="h-4.5 w-4.5 transition-transform group-hover:-translate-y-0.5" />
               <AnimatePresence>
                {count > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-slate-50 dark:ring-black"
                  >
                    {count > 99 ? '99+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[100] bg-slate-50/95 dark:bg-black/95 md:hidden flex flex-col justify-between p-6 pt-safe pb-safe"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                  <img src="/avatar.svg" alt="Winieleaf Logo" className="h-full w-full object-cover" />
                </div>
                <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 text-lg">
                  Winieleaf
                </span>
              </div>
              <button
                onClick={() => setMenu(false)}
                aria-label="Đóng menu"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col items-center gap-6 text-xl font-semibold tracking-tight my-auto">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenu(false)}
                  className={({ isActive }) =>
                    clsx(
                      'py-2 px-6 rounded-full transition-colors',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-800 hover:text-emerald-600 dark:text-slate-200'
                    )
                  }
                  end={n.to === '/'}
                >
                  {n.label}
                </NavLink>
              ))}
              
              <Link
                to="/wishlist"
                onClick={() => setMenu(false)}
                className="py-2 px-6 rounded-full text-slate-800 dark:text-slate-200 flex items-center gap-2"
              >
                Yêu thích {wishCount > 0 && <span className="rounded-full bg-rose-500/15 text-rose-500 px-2 py-0.5 text-xs font-bold">({wishCount})</span>}
              </Link>

              <Link
                to={user ? '/account' : '/login'}
                onClick={() => setMenu(false)}
                className="py-2 px-6 rounded-full text-slate-800 dark:text-slate-200 flex items-center gap-2"
              >
                {user ? `Tài khoản (${user.name || user.email})` : 'Đăng nhập / Đăng ký'}
              </Link>
              
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMenu(false)}
                  className="py-2 px-6 rounded-full text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  Admin Panel
                </Link>
              )}
            </nav>
            
            <div className="w-full pb-4">
              <ProductSearchBar variant="header" urlQuery={headerSearchQ} onApply={() => setMenu(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
