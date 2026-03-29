import { useState } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Heart,
  LayoutDashboard,
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
  { to: '/products', label: 'Sản phẩm' },
  { to: '/wishlist', label: 'Yêu thích' },
  { to: '/account', label: 'Tài khoản' },
]

export function Header() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const headerSearchQ =
    location.pathname === '/products' ? searchParams.get('q') || '' : ''
  const [menu, setMenu] = useState(false)
  const toggle = useThemeStore((s) => s.toggle)
  const dark = useThemeStore((s) => s.theme === 'dark')
  const count = useCartStore((s) =>
    s.items.reduce((a, x) => a + x.qty, 0)
  )
  const user = useAuthStore((s) => s.user)
  const localWishIds = useLocalWishlistStore((s) => s.ids)
  const wishCount = new Set([
    ...(user?.wishlist ?? []),
    ...localWishIds,
  ]).size

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-[#f6faf7]/85 backdrop-blur-md dark:border-emerald-100/10 dark:bg-[#0c1210]/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-2xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          <img
            src="/avatar.svg"
            alt="Winie Leaf"
            className="h-11 w-11 rounded-2xl object-cover ring-2 ring-emerald-600/20"
            width={44}
            height={44}
          />
          <div className="leading-tight">
            <span className="block font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">
              Winie Leaf
            </span>
            <span className="hidden text-xs text-emerald-800/70 dark:text-emerald-200/70 sm:block">
              Thiên nhiên trong từng góc nhỏ
            </span>
          </div>
        </Link>

        <div className="mx-2 hidden min-w-0 max-w-md flex-1 lg:block">
          <ProductSearchBar
            variant="header"
            urlQuery={headerSearchQ}
            onApply={() => {}}
          />
        </div>

        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-700/15 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100'
                    : 'text-emerald-800/80 hover:bg-emerald-800/10 dark:text-emerald-200/80 dark:hover:bg-white/5'
                )
              }
              end={n.to === '/'}
            >
              {n.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-emerald-800/80 hover:bg-emerald-800/10 dark:text-emerald-200/80"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/10 bg-white/80 md:hidden dark:border-emerald-100/10 dark:bg-white/5"
            aria-label="Menu"
            onClick={() => setMenu(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/10 bg-white/80 text-emerald-900 transition hover:bg-white dark:border-emerald-100/10 dark:bg-white/5 dark:text-emerald-100 dark:hover:bg-white/10"
            aria-label={dark ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link
            to="/wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/10 bg-white/80 text-rose-600 transition hover:bg-white dark:border-emerald-100/10 dark:bg-white/5 dark:text-rose-400"
            aria-label="Yêu thích"
          >
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {wishCount > 99 ? '99+' : wishCount}
              </span>
            )}
          </Link>
          <Link
            to={user ? '/account' : '/login'}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/10 bg-white/80 text-emerald-900 transition hover:bg-white dark:border-emerald-100/10 dark:bg-white/5 dark:text-emerald-100"
            aria-label="Tài khoản"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-900/15 transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-emerald-950">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-emerald-950/40 backdrop-blur-sm md:hidden"
            onClick={() => setMenu(false)}
          >
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28 }}
              className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col gap-1 bg-[#f6faf7] p-4 pt-14 shadow-xl dark:bg-[#0c1210]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-4 top-4 rounded-xl p-2"
                aria-label="Đóng"
                onClick={() => setMenu(false)}
              >
                <X className="h-6 w-6" />
              </button>
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenu(false)}
                  className={({ isActive }) =>
                    clsx(
                      'rounded-xl px-4 py-3 text-base font-medium',
                      isActive
                        ? 'bg-emerald-700/15 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100'
                        : 'text-emerald-800'
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
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-medium text-rose-600 dark:text-rose-400"
              >
                <Heart className="h-5 w-5" />
                Yêu thích {wishCount > 0 ? `(${wishCount})` : ''}
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMenu(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-medium"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Admin
                </Link>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
