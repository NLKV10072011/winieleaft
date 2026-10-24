import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Search } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center select-none">
      {/* Big 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        className="relative mb-8"
      >
        <div className="text-[180px] sm:text-[240px] font-black leading-none tracking-tighter text-slate-100 dark:text-[#111111] select-none pointer-events-none">
          404
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-2xl dark:bg-[#1a1a1a]">
              <span className="text-4xl">🌿</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Trang không tìm thấy
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm">
                Có vẻ liên kết này đã thay đổi hoặc không còn tồn tại.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 font-semibold text-white shadow-xl transition hover:bg-slate-800 hover:scale-105 dark:bg-white dark:text-black dark:hover:bg-slate-100"
        >
          <Home className="h-5 w-5" />
          Về Trang chủ
        </Link>
        <Link
          to="/products"
          className="flex items-center gap-2 rounded-full border border-slate-200 px-8 py-4 font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
        >
          <Search className="h-5 w-5" />
          Xem Sản phẩm
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
      </motion.div>

      {/* Floating leaves decoration */}
      {['🍃', '🌱', '🌿', '🍀'].map((leaf, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl pointer-events-none opacity-30"
          style={{
            left: `${[10, 85, 20, 75][i]}%`,
            top: `${[15, 20, 75, 70][i]}%`,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        >
          {leaf}
        </motion.span>
      ))}
    </div>
  )
}
