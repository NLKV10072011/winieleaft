import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    title: 'Không gian xanh cho từng nhịp thở',
    subtitle: 'Tinh dầu & nến thơm organic — giảm căng thẳng, thêm ấm áp.',
    image:
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&q=80',
    cta: 'Mua ngay',
    to: '/products',
  },
  {
    title: 'Trà lá & thảo mộc sấy lạnh',
    subtitle: 'Thanh mát tự nhiên — không chất bảo quản.',
    image:
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1200&q=80',
    cta: 'Khám phá',
    to: '/products?category=tra',
  },
  {
    title: 'Chăm da dịu nhẹ từ nha đam',
    subtitle: 'Serum hữu cơ — phù hợp làn da nhạy cảm.',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=80',
    cta: 'Xem thêm',
    to: '/products?category=cham-da',
  },
]

export function BannerCarousel() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6500)
    return () => clearInterval(t)
  }, [])

  const s = slides[i]

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-emerald-950 shadow-xl dark:border-emerald-100/10">
      <div className="water-shimmer absolute inset-0 z-10 pointer-events-none opacity-40" />
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2"
        >
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px]">
            <img
              src={s.image}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-emerald-950/30 md:to-emerald-950/85" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl"
            >
              {s.title}
            </motion.h2>
            <p className="text-emerald-100/90 text-base leading-relaxed">
              {s.subtitle}
            </p>
            <Link
              to={s.to}
              className="inline-flex w-fit items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-emerald-900 shadow-lg transition hover:bg-emerald-50"
            >
              {s.cta}
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === i ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="Trước"
        onClick={() => setI((x) => (x - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Sau"
        onClick={() => setI((x) => (x + 1) % slides.length)}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}
