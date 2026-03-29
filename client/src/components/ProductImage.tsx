import { useEffect, useState } from 'react'
import { PRODUCT_IMAGES_BASE, productImageUrl } from '../lib/productImage'

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

  useEffect(() => {
    setSrc(productImageUrl(image))
  }, [image])

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setSrc((s) => (s === FALLBACK ? s : FALLBACK))}
    />
  )
}
