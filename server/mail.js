const emailjs = require('@emailjs/nodejs')

const SERVICE_ID = (process.env.EMAILJS_SERVICE_ID || 'service_oksah9q').trim()
const TEMPLATE_ID = (process.env.EMAILJS_TEMPLATE_ID || '').trim()
const PUBLIC_KEY = (process.env.EMAILJS_PUBLIC_KEY || '').trim()
const PRIVATE_KEY = (process.env.EMAILJS_PRIVATE_KEY || '').trim()

function emailjsReady() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)
}

/** Gọi khi khởi động server — kiểm tra biến môi trường EmailJS */
async function verifySmtp() {
  if (!emailjsReady()) {
    console.warn(
      '[mail] Chưa gửi được email: thiếu EMAILJS_TEMPLATE_ID hoặc EMAILJS_PUBLIC_KEY trong server/.env (và bật gửi API từ ứng dụng không phải trình duyệt: EmailJS → Account → Security).'
    )
    return { ok: false, reason: 'missing_env' }
  }
  console.log('[mail] EmailJS — service', SERVICE_ID, ', template', TEMPLATE_ID)
  return { ok: true }
}

/**
 * Template EmailJS cần có biến {{subject}}, {{message}} (và tùy chọn {{to_email}} nếu gửi tới địa chỉ động).
 */
async function sendOrderEmail({ order, customer }) {
  const lines = [
    '🌿 Winie Leaf — Thông báo đơn hàng mới',
    '',
    '🧑‍💻 Khách hàng:',
    `  Tên: ${customer.name}`,
    `  SĐT: ${customer.phone}`,
    `  Địa chỉ: ${customer.address}`,
    '',
    '🛍️ Sản phẩm:',
    ...order.items.map(
      (i) => `  • ${i.name} × ${i.qty} — ${formatVnd(i.price * i.qty)}`
    ),
    '',
    `💰 Tổng tiền: ${formatVnd(order.total)}`,
    `⏰ Thời gian: ${new Date(order.createdAt).toLocaleString('vi-VN')}`,
    `💳 Thanh toán: ${order.paymentMethod}`,
    `📦 Mã đơn: ${order.id}`,
  ]
  const text = lines.join('\n')
  const subject = `[Winie Leaf] Đơn mới #${order.id.slice(0, 8)} — ${formatVnd(order.total)}`
  const shopEmail = (process.env.SHOP_NOTIFY_EMAIL || '').trim()

  const templateParams = {
    subject,
    message: text,
    ...(shopEmail ? { to_email: shopEmail } : {}),
  }

  if (!emailjsReady()) {
    console.warn('[mail] Không gửi — thiếu cấu hình EmailJS. Nội dung:\n', text)
    return { sent: false, reason: 'no_emailjs', preview: text }
  }

  const options = { publicKey: PUBLIC_KEY }
  if (PRIVATE_KEY.trim()) options.privateKey = PRIVATE_KEY.trim()

  try {
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, options)
    console.log('[mail] Đã gửi thông báo đơn qua EmailJS', res?.status, res?.text || '')
    return { sent: true }
  } catch (e) {
    const err =
      e?.status != null
        ? `HTTP ${e.status}: ${e.text || e.message}`
        : e?.message || e?.text || String(e)
    console.error('[mail] EmailJS lỗi:', err)
    return { sent: false, error: err }
  }
}

function formatVnd(n) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(n)
}

module.exports = { sendOrderEmail, verifySmtp }
