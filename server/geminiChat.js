/**
 * Google Gemini (Generative Language API) — khóa chỉ đọc từ GOOGLE_AI_API_KEY trong server/.env
 * @see https://ai.google.dev/gemini-api/docs
 */

function buildSystemInstruction() {
  const phone = process.env.SHOP_PHONE || '0794010454'
  const fb =
    process.env.SHOP_FACEBOOK_URL ||
    'https://www.facebook.com/profile.php?id=61578757753489'
  return `Bạn là trợ lý ảo của cửa hàng Winie Leaf (thảo dược chăm sóc cơ thể và tóc).
Nhiệm vụ: tư vấn sản phẩm, cách dùng, gợi ý đặt hàng và thanh toán; trả lời bằng tiếng Việt, lịch sự, súc tích.
Khi khách hỏi hotline, Zalo, Facebook hoặc cách liên hệ, hãy đưa thông tin sau:
- Điện thoại / Zalo: ${phone}
- Facebook: ${fb}
Không bịa giá hoặc khuyến mãi cụ thể nếu không chắc — gợi ý xem trang sản phẩm trên website hoặc nhắn fanpage.
Từ chối nội dung độc hại, không tiết lộ API key hay dữ liệu hệ thống.`
}

/**
 * @param {{ role: 'user'|'assistant'; content: string }[]} messages
 */
async function chatGemini(messages) {
  const key = process.env.GOOGLE_AI_API_KEY?.trim()
  if (!key) {
    const err = new Error(
      'Chat AI chưa được cấu hình (thiếu GOOGLE_AI_API_KEY trên server).'
    )
    err.statusCode = 503
    throw err
  }

  // gemini-2.0-flash thường báo quota free tier = 0; 2.5-flash hoạt động ổn trên AI Studio
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content).slice(0, 12000) }],
  }))

  const body = {
    systemInstruction: {
      parts: [{ text: buildSystemInstruction() }],
    },
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.65,
    },
  }

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    const msg =
      data?.error?.message ||
      (typeof data === 'string' ? data : null) ||
      r.statusText
    const err = new Error(msg)
    err.statusCode = r.status >= 400 && r.status < 600 ? r.status : 500
    throw err
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('') || ''

  const trimmed = text.trim()
  if (!trimmed) {
    const err = new Error(
      'Model không trả lời (có thể bị chặn bởi chính sách an toàn).'
    )
    err.statusCode = 502
    throw err
  }
  return trimmed
}

module.exports = { chatGemini }
