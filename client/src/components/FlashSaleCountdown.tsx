import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import clsx from 'clsx'

type Props = {
  endsAt: string       // ISO date string
  originalPrice: number
  salePrice: number
  className?: string
  size?: 'sm' | 'md'
}

function pad(n: number) { return String(n).padStart(2, '0') }

function timeLeft(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { h, m, s, diff }
}

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export function FlashSaleCountdown({ endsAt, originalPrice, salePrice, className, size = 'md' }: Props) {
  const [tl, setTl] = useState(() => timeLeft(endsAt))

  useEffect(() => {
    const t = setInterval(() => setTl(timeLeft(endsAt)), 1000)
    return () => clearInterval(t)
  }, [endsAt])

  if (!tl) return null

  const discountPct = Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  const isSm = size === 'sm'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'overflow-hidden rounded-2xl',
        isSm
          ? 'bg-gradient-to-r from-orange-500 to-rose-500 p-3'
          : 'bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 p-4',
        className
      )}
    >
      <div className={clsx('flex items-center gap-2', isSm ? 'mb-2' : 'mb-3')}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Zap className={clsx('fill-white text-white', isSm ? 'h-4 w-4' : 'h-5 w-5')} />
        </motion.div>
        <span className={clsx('font-black uppercase tracking-wider text-white', isSm ? 'text-xs' : 'text-sm')}>
          Flash Sale
        </span>
        <span className="ml-auto rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
          -{discountPct}%
        </span>
      </div>

      {/* Prices */}
      {!isSm && (
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-2xl font-black text-white">{vnd(salePrice)}</span>
          <span className="text-sm text-white/60 line-through">{vnd(originalPrice)}</span>
        </div>
      )}

      {/* Countdown */}
      <div className="flex items-center gap-1.5">
        <span className={clsx('text-white/80', isSm ? 'text-[10px]' : 'text-xs font-medium')}>
          {isSm ? 'Con' : 'Ket thuc sau'}
        </span>
        {[
          { val: tl.h, label: 'gio' },
          { val: tl.m, label: 'phut' },
          { val: tl.s, label: 'giay' },
        ].map(({ val, label }, i) => (
          <span key={label} className="flex items-center gap-1">
            {i > 0 && <span className="text-white/60 font-bold">:</span>}
            <span className={clsx(
              'inline-flex flex-col items-center justify-center rounded-lg bg-white/20 font-mono font-black text-white backdrop-blur-sm',
              isSm ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base'
            )}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={val}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {pad(val)}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        ))}
      </div>
    </motion.div>
  )
}
