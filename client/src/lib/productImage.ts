/** Thư mục tĩnh: client/public/images/products — thêm file ví dụ p1.jpg rồi ghi "image": "p1.jpg" trong products.json */
export const PRODUCT_IMAGES_BASE = '/images/products'

export function productImageUrl(image: string | undefined | null): string {
  const t = image?.trim()
  if (!t) return `${PRODUCT_IMAGES_BASE}/placeholder.svg`
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('/')) return t
  return `${PRODUCT_IMAGES_BASE}/${t.replace(/^\.\//, '')}`
}
