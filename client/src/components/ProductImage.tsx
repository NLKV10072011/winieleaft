import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCT_IMAGES_BASE, productImageUrl } from '../lib/productImage'
import clsx from 'clsx'

type Props = {
  image: string | undefined | null
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

const FALLBACK = `${PRODUCT_IMAGES_BASE}/placeholder.svg`

export function ProductImage({
  image,
  alt,
  className,
  loading = 'lazy',
}: Props) {
  const primary = productImageUrl(image)
  const [src, setSrc] = useState(primary)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setSrc(productImageUrl(image))
    setIsLoaded(false)
  }, [image])

  return (
    <div className={clsx("relative overflow-hidden bg-slate-100 dark:bg-slate-900", className)}>
       <AnimatePresence>
          {!isLoaded && (
             <motion.div 
               exit={{ opacity: 0 }} 
               transition={{ duration: 0.2 }}
               className="absolute inset-0 z-0 animate-pulse bg-slate-200 dark:bg-slate-800" 
             />
          )}
       </AnimatePresence>
       
       <motion.img
         initial={{ opacity: 0 }}
         animate={{ opacity: isLoaded ? 1 : 0 }}
         transition={{ duration: 0.25, ease: "easeOut" }}
         src={src}
         alt={alt}
         onLoad={() => setIsLoaded(true)}
         className={clsx("absolute inset-0 h-full w-full object-cover", className)}
         loading={loading}
         decoding="async"
         onError={() => {
            setSrc((s) => (s === FALLBACK ? s : FALLBACK))
            setIsLoaded(true)
         }}
       />
    </div>
  )
}
