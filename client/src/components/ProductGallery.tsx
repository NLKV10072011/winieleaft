import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'
import { productImageUrl } from '../lib/productImage'
import clsx from 'clsx'

type Props = {
  mainImage: string
  images?: string[]
  alt: string
  featured?: boolean
  badge?: React.ReactNode
  actions?: React.ReactNode
}

export function ProductGallery({ mainImage, images = [], alt, featured, badge, actions }: Props) {
  const allImages = [mainImage, ...images.filter((img) => img && img !== mainImage)]
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = useCallback(() =>
    setActiveIdx((i) => (i === 0 ? allImages.length - 1 : i - 1)), [allImages.length])
  const next = useCallback(() =>
    setActiveIdx((i) => (i === allImages.length - 1 ? 0 : i + 1)), [allImages.length])

  const currentSrc = productImageUrl(allImages[activeIdx] ?? mainImage)

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-[#0a0a0a] cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIdx}
              src={currentSrc}
              alt={`${alt} - anh ${activeIdx + 1}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" />
          </div>

          {featured && (
            <span className="absolute top-6 left-6 rounded-full bg-black/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
              Featured
            </span>
          )}

          {badge}
          {actions}

          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-110 dark:bg-black/60 dark:text-white dark:hover:bg-black/90"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-110 dark:bg-black/60 dark:text-white dark:hover:bg-black/90"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveIdx(i) }}
                    className={clsx(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === activeIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={clsx(
                  'relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200',
                  i === activeIdx
                    ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/20'
                    : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400 dark:border-slate-800'
                )}
              >
                <img
                  src={productImageUrl(img)}
                  alt={`${alt} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              onClick={() => setLightbox(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
              {activeIdx + 1} / {allImages.length}
            </div>
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[85vh] max-w-[90vw]"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  src={currentSrc}
                  alt={alt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-h-[85vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl"
                />
              </AnimatePresence>
            </motion.div>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
