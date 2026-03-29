const API = '/api'

function authHeaders(
  token?: string | null,
  json = true
): HeadersInit {
  const h: Record<string, string> = {}
  if (json) h['Content-Type'] = 'application/json'
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const r = await fetch(`${API}${path}`, { headers: authHeaders(token, false) })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || r.statusText)
  }
  return r.json() as Promise<T>
}

export async function apiSend<T>(
  path: string,
  method: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: authHeaders(token),
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || r.statusText)
  }
  if (r.status === 204) return undefined as T
  return r.json() as Promise<T>
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  rating: number
  image: string
  stock: number
  featured?: boolean
}

export type LineItem = {
  productId: string
  name: string
  qty: number
  price: number
}

export type PaymentHint = {
  accountName: string
  transferContent: string
  caption: string
}

export type Order = {
  id: string
  userId?: string | null
  customerName: string
  phone: string
  address: string
  items: LineItem[]
  total: number
  paymentMethod: string
  status: string
  createdAt: string
  /** QR động (legacy); ưu tiên hiển thị ảnh VietQR cố định + paymentHint */
  qrDataUrl?: string | null
  qrPayload?: string
  paymentHint?: PaymentHint
}

export type User = {
  id: string
  email: string
  name: string
  phone: string
  addresses: string[]
  wishlist: string[]
  points: number
  role: string
}

export type EmailNotifyResult = {
  sent: boolean
  reason?: string
  error?: string
  preview?: string
}

export type ProductReview = {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export type SuggestResponse = {
  suggestions: {
    id: string
    name: string
    category?: string
    price?: number
  }[]
}

export type AdminStats = {
  revenue: number
  orderCount: number
  pending: number
  customerCount: number
  topProducts?: { productId: string; name: string; qty: number }[]
  chart?: { date: string; revenue: number }[]
  statusBreakdown?: Record<string, number>
  avgOrderValue?: number
  ordersToday?: number
  lowStock?: { id: string; name: string; stock: number }[]
}
