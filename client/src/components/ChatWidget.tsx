import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Loader2 } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

const WELCOME: Msg = {
  role: 'assistant',
  content:
    'Xin chào! Mình là trợ lý AI của Winie Leaf — hỏi mình về sản phẩm, đặt hàng hoặc liên hệ shop (hotline/Zalo và Facebook mình sẽ gửi khi bạn cần).',
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState<Msg[]>([WELCOME])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = msg.trim()
    if (!text || loading) return

    const next: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setMsg('')
    setLoading(true)

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(1),
        }),
      })
      const data = (await r.json().catch(() => ({}))) as { reply?: string; error?: string }
      if (!r.ok) {
        throw new Error(data.error || r.statusText)
      }
      if (!data.reply?.trim()) {
        throw new Error('Phản hồi trống')
      }
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Lỗi không xác định'
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: `Không gửi được tin lúc này (${m}). Bạn thử lại sau, hoặc gọi/Zalo 0794010454 — Facebook: https://www.facebook.com/profile.php?id=61578757753489`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-900/30 transition hover:scale-105 hover:bg-emerald-600 dark:bg-emerald-600"
        aria-label="Chat hỗ trợ"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-24 right-6 z-50 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-3xl border border-emerald-900/15 bg-white shadow-2xl dark:border-emerald-100/10 dark:bg-[#141c18]"
          >
            <div className="flex items-center justify-between bg-emerald-800 px-4 py-3 text-white dark:bg-emerald-900">
              <span className="font-semibold">Winie Leaf — Trợ lý AI</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-white/10"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto p-4 text-sm text-emerald-900 dark:text-emerald-100">
              {messages.map((m, i) => (
                <p
                  key={i}
                  className={`whitespace-pre-wrap rounded-2xl px-3 py-2 leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-6 rounded-tr-sm bg-emerald-600 text-white dark:bg-emerald-700'
                      : 'mr-4 rounded-tl-sm bg-emerald-50 dark:bg-emerald-950/50'
                  }`}
                >
                  {m.content}
                </p>
              ))}
              {loading && (
                <p className="flex items-center gap-2 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang trả lời…
                </p>
              )}
              <div ref={bottomRef} />
            </div>
            <form
              className="flex gap-2 border-t border-emerald-900/10 p-3 dark:border-emerald-100/10"
              onSubmit={onSubmit}
            >
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Nhập tin nhắn…"
                disabled={loading}
                className="min-w-0 flex-1 rounded-2xl border border-emerald-900/15 bg-white px-3 py-2 text-sm outline-none ring-emerald-600/30 focus:ring-2 disabled:opacity-60 dark:border-emerald-100/15 dark:bg-[#0c1210]"
              />
              <button
                type="submit"
                disabled={loading || !msg.trim()}
                className="rounded-2xl bg-emerald-700 p-2.5 text-white hover:bg-emerald-600 disabled:opacity-50"
                aria-label="Gửi"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
