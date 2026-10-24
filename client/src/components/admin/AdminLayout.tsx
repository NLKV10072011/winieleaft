import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Menu,
  X,
  ExternalLink,
  Moon,
  Sun,
  ShieldAlert,
  Tag,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

const MENU_ITEMS = [
  { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Sản phẩm', icon: Package },
  { path: '/admin/orders', label: 'Đơn hàng', icon: Bell },
  { path: '/admin/customers', label: 'Khách hàng', icon: Users },
  { path: '/admin/coupons', label: 'Mã giảm giá', icon: Tag },
  { path: '/admin/settings', label: 'Cài đặt', icon: Settings },
]

export function AdminLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const { theme, toggle: toggleTheme } = useThemeStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (!token || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 dark:bg-[#0c1210]">
        <div className="rounded-3xl border border-emerald-900/10 bg-white p-8 text-center shadow-2xl dark:border-emerald-100/10 dark:bg-[#141c18]">
          <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-emerald-600 dark:text-emerald-400" />
          <h1 className="mb-2 text-2xl font-bold text-emerald-950 dark:text-white">
            Khu vực Quản trị
          </h1>
          <p className="mb-6 text-emerald-800/80 dark:text-emerald-200/60">
            Bạn cần quyền quản trị viên cao cấp để truy cập.
          </p>
          <Link
            to="/login"
            className="inline-flex rounded-2xl bg-emerald-700 px-6 py-2.5 font-semibold text-white hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
          >
            Đăng nhập Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#080d0b] text-slate-900 dark:text-slate-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl dark:border-[#1a2520] dark:bg-[#111815] transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 overflow-hidden shadow-sm">
              <img src="/avatar.svg" alt="Admin Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-950 dark:text-white">
              Winie Admin
            </span>
          </Link>
          <button
            title="Đóng"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Menu chính
          </p>
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-[#1a2520] dark:hover:text-emerald-400'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-[#1a2520]">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3 dark:bg-[#1a2520]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold uppercase shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Admin
              </p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex min-h-screen w-full flex-col p-0 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-[#1a2520] dark:bg-[#111815]/80 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="hidden text-xl font-bold text-slate-800 dark:text-slate-100 sm:block">
              {MENU_ITEMS.find((i) => i.path === location.pathname)?.label ||
                'Chi tiết'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="group hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-[#202d26] dark:bg-[#151e1a] dark:text-slate-300 dark:hover:bg-[#1a2520] sm:flex"
            >
              Xem cửa hàng
              <ExternalLink className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-[#202d26] dark:bg-[#151e1a] dark:text-emerald-300 dark:hover:bg-[#1a2520]"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
