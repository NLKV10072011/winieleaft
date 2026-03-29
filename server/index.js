const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const http = require('http')
const { Server } = require('socket.io')
const { readJson, writeJson } = require('./db')
const { sendOrderEmail, verifySmtp } = require('./mail')
const { chatGemini } = require('./geminiChat')

const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'winie-leaf-dev-secret-change-me'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

const uploadsProductsDir = path.join(__dirname, 'uploads', 'products')
fs.mkdirSync(uploadsProductsDir, { recursive: true })
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const productImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsProductsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase()
      const ok = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const e = ok.includes(ext) ? ext : '.jpg'
      cb(null, `${uuidv4()}${e}`)
    },
  }),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new Error('Chỉ chấp nhận file ảnh'))
      return
    }
    cb(null, true)
  },
})

function seedAdmin() {
  let users = readJson('users', [])
  const hasAdmin = users.some((u) => u.role === 'admin')
  if (!hasAdmin) {
    users.push({
      id: uuidv4(),
      email: 'admin@winieleaf.local',
      passwordHash: bcrypt.hashSync('admin123', 10),
      name: 'Quản trị Winie Leaf',
      phone: '0900000000',
      addresses: [],
      wishlist: [],
      points: 0,
      role: 'admin',
    })
    writeJson('users', users)
    console.log('[seed] Tài khoản admin: admin@winieleaf.local / admin123')
  }
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    req.user = null
    return next()
  }
  try {
    req.user = jwt.verify(h.slice(7), JWT_SECRET)
  } catch {
    req.user = null
  }
  next()
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập' })
  next()
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập' })
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Không có quyền' })
  next()
}

app.use(authMiddleware)

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body
  if (!email || !password || !name)
    return res.status(400).json({ error: 'Thiếu thông tin' })
  let users = readJson('users', [])
  if (users.some((u) => u.email === email))
    return res.status(400).json({ error: 'Email đã được sử dụng' })
  const user = {
    id: uuidv4(),
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    name,
    phone: phone || '',
    addresses: [],
    wishlist: [],
    points: 0,
    role: 'user',
  }
  users.push(user)
  writeJson('users', users)
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '14d' }
  )
  res.json({ token, user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const users = readJson('users', [])
  const user = users.find((u) => u.email === email)
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: 'Sai email hoặc mật khẩu' })
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '14d' }
  )
  res.json({ token, user: publicUser(user) })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  const users = readJson('users', [])
  const user = users.find((u) => u.id === req.user.sub)
  if (!user) return res.status(404).json({ error: 'Không tìm thấy' })
  res.json(publicUser(user))
})

app.patch('/api/auth/me', requireAuth, (req, res) => {
  const { name, phone, addresses, wishlist } = req.body
  let users = readJson('users', [])
  const i = users.findIndex((u) => u.id === req.user.sub)
  if (i < 0) return res.status(404).json({ error: 'Không tìm thấy' })
  if (name != null) users[i].name = name
  if (phone != null) users[i].phone = phone
  if (addresses != null) users[i].addresses = addresses
  if (Array.isArray(wishlist)) users[i].wishlist = wishlist
  writeJson('users', users)
  res.json(publicUser(users[i]))
})

app.patch('/api/auth/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Thiếu mật khẩu' })
  if (String(newPassword).length < 8)
    return res
      .status(400)
      .json({ error: 'Mật khẩu mới cần ít nhất 8 ký tự' })
  let users = readJson('users', [])
  const i = users.findIndex((u) => u.id === req.user.sub)
  if (i < 0) return res.status(404).json({ error: 'Không tìm thấy' })
  if (!bcrypt.compareSync(currentPassword, users[i].passwordHash))
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' })
  users[i].passwordHash = bcrypt.hashSync(String(newPassword), 10)
  writeJson('users', users)
  res.json({ ok: true })
})

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    addresses: u.addresses || [],
    wishlist: u.wishlist || [],
    points: u.points ?? 0,
    role: u.role,
  }
}

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'Thiếu tin nhắn' })
  const last = messages[messages.length - 1]
  if (last.role !== 'user' || !String(last.content || '').trim())
    return res.status(400).json({ error: 'Nội dung không hợp lệ' })
  if (messages.length > 24)
    return res.status(400).json({ error: 'Hội thoại quá dài' })
  try {
    const trimmed = messages.slice(-20).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 4000),
    }))
    const reply = await chatGemini(trimmed)
    res.json({ reply })
  } catch (e) {
    const code =
      typeof e.statusCode === 'number' &&
      e.statusCode >= 400 &&
      e.statusCode < 600
        ? e.statusCode
        : 500
    res.status(code).json({ error: e.message || 'Lỗi chat' })
  }
})

app.get('/api/products', (req, res) => {
  let list = readJson('products', [])
  const q = (req.query.q || '').toLowerCase().trim()
  const category = req.query.category
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null
  const minRating = req.query.minRating ? Number(req.query.minRating) : null

  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    )
  }
  if (category && category !== 'all')
    list = list.filter((p) => p.category === category)
  if (minPrice != null && !Number.isNaN(minPrice))
    list = list.filter((p) => p.price >= minPrice)
  if (maxPrice != null && !Number.isNaN(maxPrice))
    list = list.filter((p) => p.price <= maxPrice)
  if (minRating != null && !Number.isNaN(minRating))
    list = list.filter((p) => (p.rating || 0) >= minRating)
  if (req.query.inStock === '1' || req.query.inStock === 'true')
    list = list.filter((p) => Number(p.stock) > 0)
  if (req.query.featured === '1' || req.query.featured === 'true')
    list = list.filter((p) => Boolean(p.featured))

  const sort = req.query.sort || 'newest'
  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc')
    list = [...list].sort((a, b) => b.price - a.price)
  else if (sort === 'rating')
    list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
  else if (sort === 'name')
    list = [...list].sort((a, b) =>
      String(a.name).localeCompare(String(b.name), 'vi')
    )

  res.json(list)
})

const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipping',
  'delivered',
  'cancelled',
  'completed',
]

app.get('/api/products/suggest', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim()
  if (q.length < 1) return res.json({ suggestions: [] })
  const list = readJson('products', [])
  const out = list
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        String(p.slug || '')
          .toLowerCase()
          .includes(q)
    )
    .slice(0, 12)
  res.json({
    suggestions: out.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
    })),
  })
})

app.get('/api/recommendations', (req, res) => {
  const ids = String(req.query.ids || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  const products = readJson('products', [])
  if (ids.length === 0) {
    const shuffled = [...products].sort(() => Math.random() - 0.5)
    return res.json(shuffled.slice(0, 8))
  }
  const cats = new Set()
  for (const id of ids) {
    const p = products.find((x) => x.id === id)
    if (p) cats.add(p.category)
  }
  let pool = products.filter((p) => cats.has(p.category) && !ids.includes(p.id))
  pool = [...pool].sort(() => Math.random() - 0.5)
  const seen = new Set(pool.map((p) => p.id))
  if (pool.length < 6) {
    for (const p of products) {
      if (ids.includes(p.id) || seen.has(p.id)) continue
      pool.push(p)
      seen.add(p.id)
      if (pool.length >= 8) break
    }
  }
  res.json(pool.slice(0, 8))
})

app.get('/api/products/:id/reviews', (req, res) => {
  const pid = req.params.id
  const list = readJson('reviews', []).filter((r) => r.productId === pid)
  res.json(
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  )
})

app.post('/api/products/:id/reviews', requireAuth, (req, res) => {
  const pid = req.params.id
  const products = readJson('products', [])
  if (!products.find((p) => p.id === pid))
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' })
  const rating = Math.min(
    5,
    Math.max(1, Math.round(Number(req.body.rating) || 0))
  )
  if (!rating || rating < 1)
    return res.status(400).json({ error: 'Chọn 1–5 sao' })
  const comment = String(req.body.comment || '').trim().slice(0, 2000)
  const users = readJson('users', [])
  const u = users.find((x) => x.id === req.user.sub)
  let reviews = readJson('reviews', [])
  if (reviews.some((r) => r.productId === pid && r.userId === req.user.sub))
    return res.status(400).json({ error: 'Bạn đã đánh giá sản phẩm này' })
  const rev = {
    id: uuidv4(),
    productId: pid,
    userId: req.user.sub,
    userName: u?.name || 'Khách',
    rating,
    comment,
    createdAt: new Date().toISOString(),
  }
  reviews.unshift(rev)
  writeJson('reviews', reviews)
  const forP = reviews.filter((r) => r.productId === pid)
  const avg = forP.reduce((s, r) => s + r.rating, 0) / forP.length
  const pi = products.findIndex((p) => p.id === pid)
  if (pi >= 0) {
    products[pi].rating = Math.round(avg * 10) / 10
    writeJson('products', products)
  }
  res.json(rev)
})

app.get('/api/products/:id', (req, res) => {
  const list = readJson('products', [])
  const p = list.find((x) => x.id === req.params.id || x.slug === req.params.id)
  if (!p) return res.status(404).json({ error: 'Không tìm thấy' })
  res.json(p)
})

app.get('/api/suggestions', (req, res) => {
  const { category } = req.query
  let list = readJson('products', [])
  if (category)
    list = list.filter((p) => p.category === category).slice(0, 4)
  else list = list.filter((p) => p.featured).slice(0, 4)
  res.json(list)
})

app.post('/api/orders', async (req, res) => {
  const { customerName, phone, address, items, paymentMethod } = req.body
  if (!customerName || !phone || !address || !items?.length)
    return res.status(400).json({ error: 'Thiếu thông tin đơn hàng' })
  const products = readJson('products', [])
  let total = 0
  const lineItems = []
  for (const line of items) {
    const p = products.find((x) => x.id === line.productId)
    if (!p) return res.status(400).json({ error: 'Sản phẩm không hợp lệ' })
    const qty = Math.max(1, Number(line.qty) || 1)
    if (p.stock < qty) return res.status(400).json({ error: `Hết hàng: ${p.name}` })
    total += p.price * qty
    lineItems.push({
      productId: p.id,
      name: p.name,
      qty,
      price: p.price,
    })
  }

  const userId = req.user?.sub || null
  const order = {
    id: uuidv4(),
    userId,
    customerName,
    phone,
    address,
    items: lineItems,
    total,
    paymentMethod: paymentMethod || 'cod',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  let orders = readJson('orders', [])
  orders.unshift(order)
  writeJson('orders', orders)

  for (const line of lineItems) {
    const pi = products.findIndex((x) => x.id === line.productId)
    if (pi >= 0) products[pi].stock -= line.qty
  }
  writeJson('products', products)

  if (userId) {
    let users = readJson('users', [])
    const ui = users.findIndex((u) => u.id === userId)
    if (ui >= 0) {
      users[ui].points = (users[ui].points || 0) + Math.floor(total / 10000)
      writeJson('users', users)
    }
  }

  const qrPayload = buildQrPayload(order)
  const paymentHint =
    order.paymentMethod === 'qr'
      ? {
          accountName:
            process.env.PAYMENT_ACCOUNT_NAME || 'NGUYEN LE KIEN VAN',
          transferContent: `WINIE ${order.id.slice(0, 8)}`,
          caption:
            process.env.PAYMENT_QR_CAPTION ||
            'QR nhận tiền từ mọi ứng dụng chuyển tiền',
        }
      : undefined

  let emailNotify = { sent: false }
  try {
    emailNotify = await sendOrderEmail({
      to: null,
      order: { ...order, qrPayload },
      customer: { name: customerName, phone, address },
    })
  } catch (e) {
    console.error('[mail] Email error', e)
    emailNotify = { sent: false, error: String(e?.message || e) }
  }

  io.emit('order:new', { orderId: order.id, total: order.total })

  res.json({
    order: { ...order, qrPayload, paymentHint },
    emailNotify,
  })
})

app.get('/api/orders', requireAuth, (req, res) => {
  let orders = readJson('orders', [])
  if (req.user.role !== 'admin')
    orders = orders.filter((o) => o.userId === req.user.sub)
  res.json(orders)
})

app.patch('/api/orders/:id/status', requireAuth, requireAdmin, (req, res) => {
  const { status } = req.body
  if (!ORDER_STATUSES.includes(status))
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' })
  let orders = readJson('orders', [])
  const i = orders.findIndex((o) => o.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Không tìm thấy' })
  orders[i].status = status
  writeJson('orders', orders)
  res.json(orders[i])
})

function computeAdminStats() {
  const orders = readJson('orders', [])
  const products = readJson('products', [])
  const revenue = orders
    .filter(
      (o) => o.status === 'delivered' || o.status === 'completed'
    )
    .reduce((s, o) => s + o.total, 0)
  const pending = orders.filter((o) => o.status === 'pending').length
  const users = readJson('users', [])
  const qtyByProduct = {}
  for (const o of orders) {
    if (o.status === 'cancelled') continue
    for (const line of o.items || []) {
      qtyByProduct[line.productId] =
        (qtyByProduct[line.productId] || 0) + line.qty
    }
  }
  const topProducts = Object.entries(qtyByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, qty]) => ({
      productId,
      qty,
      name: products.find((p) => p.id === productId)?.name || productId,
    }))
  const chart = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    chart.push({ date: key, revenue: 0 })
  }
  for (const o of orders) {
    if (o.status !== 'delivered' && o.status !== 'completed') continue
    const key = (o.createdAt || '').slice(0, 10)
    const day = chart.find((c) => c.date === key)
    if (day) day.revenue += o.total
  }
  const statusBreakdown = {}
  for (const o of orders) {
    const st = o.status || 'pending'
    statusBreakdown[st] = (statusBreakdown[st] || 0) + 1
  }
  const doneCount = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'completed'
  ).length
  const avgOrderValue = doneCount > 0 ? Math.round(revenue / doneCount) : 0
  const todayYmd = new Date().toISOString().slice(0, 10)
  const ordersToday = orders.filter(
    (o) => (o.createdAt || '').slice(0, 10) === todayYmd
  ).length
  const lowStock = products
    .filter((p) => Number(p.stock) <= 10)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 12)
    .map((p) => ({
      id: p.id,
      name: p.name,
      stock: Number(p.stock) || 0,
    }))
  return {
    revenue,
    orderCount: orders.length,
    pending,
    customerCount: users.filter((u) => u.role === 'user').length,
    topProducts,
    chart,
    statusBreakdown,
    avgOrderValue,
    ordersToday,
    lowStock,
  }
}

app.get('/api/admin/stats', requireAuth, requireAdmin, (req, res) => {
  res.json(computeAdminStats())
})

app.get('/api/admin/customers', requireAuth, requireAdmin, (req, res) => {
  const users = readJson('users', [])
  res.json(users.filter((u) => u.role === 'user').map(publicUser))
})

app.get('/api/admin/products', requireAuth, requireAdmin, (req, res) => {
  res.json(readJson('products', []))
})

app.post('/api/admin/products', requireAuth, requireAdmin, (req, res) => {
  const body = req.body
  const list = readJson('products', [])
  const p = {
    id: body.id || uuidv4(),
    name: body.name,
    slug: body.slug || slugify(body.name || ''),
    description: body.description || '',
    price: Number(body.price) || 0,
    category: body.category || 'khac',
    rating: Number(body.rating) || 5,
    image: body.image || '',
    stock: body.stock != null ? Number(body.stock) : 0,
    featured: Boolean(body.featured),
  }
  if (!p.name) return res.status(400).json({ error: 'Thiếu tên sản phẩm' })
  if (list.some((x) => x.id === p.id)) return res.status(400).json({ error: 'ID đã tồn tại' })
  list.push(p)
  writeJson('products', list)
  res.json(p)
})

app.put('/api/admin/products/:id', requireAuth, requireAdmin, (req, res) => {
  let list = readJson('products', [])
  const i = list.findIndex((x) => x.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Không tìm thấy' })
  const body = req.body
  list[i] = {
    ...list[i],
    ...body,
    price: Number(body.price ?? list[i].price),
    stock: Number(body.stock ?? list[i].stock),
    rating: Number(body.rating ?? list[i].rating),
  }
  writeJson('products', list)
  res.json(list[i])
})

app.delete('/api/admin/products/:id', requireAuth, requireAdmin, (req, res) => {
  let list = readJson('products', [])
  list = list.filter((x) => x.id !== req.params.id)
  writeJson('products', list)
  res.json({ ok: true })
})

app.post(
  '/api/admin/upload/product-image',
  requireAuth,
  requireAdmin,
  (req, res) => {
    productImageUpload.single('file')(req, res, (err) => {
      if (err) {
        const msg =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Ảnh quá lớn (tối đa 4MB)'
            : err.message || 'Lỗi upload'
        return res.status(400).json({ error: msg })
      }
      if (!req.file)
        return res.status(400).json({ error: 'Thiếu file ảnh' })
      res.json({ url: `/uploads/products/${req.file.filename}` })
    })
  }
)

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function buildQrPayload(order) {
  const bank = process.env.BANK_ACCOUNT || '0000000000'
  const name = process.env.BANK_NAME || 'NGUYEN LE KIEN VAN'
  const short = order.id.slice(0, 8)
  return [
    `Nội dung CK: WINIE ${short}`,
    `Số tiền: ${order.total.toLocaleString('vi-VN')} VND`,
    `STK ${bank} — ${name}`,
  ].join(' — ')
}

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  socket.on('join:admin', () => {
    socket.join('admin')
  })
})

seedAdmin()

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[api] Cổng ${PORT} đang được dùng — hãy tắt process Node cũ (Task Manager) hoặc đổi PORT trong server/.env.`
    )
    process.exit(1)
  }
  throw err
})

server.listen(PORT, async () => {
  console.log(`Winie Leaf API: http://localhost:${PORT}`)
  await verifySmtp()
})

function shutdown() {
  try {
    io.disconnectSockets(true)
  } catch (_) {
    /* ignore */
  }
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 4000).unref()
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
