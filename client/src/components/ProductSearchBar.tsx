import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import { apiGet, type SuggestResponse } from '../lib/api'
import { categoryLabel } from '../lib/constants'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

type Props = {
  variant?: 'page' | 'header'
  /** Đồng bộ ô tìm với `?q=` trên URL */
  urlQuery?: string
  /** Khi bấm « Tìm kiếm » hoặc Enter (không chọn gợi ý): áp dụng chuỗi lọc */
  onApply: (query: string) => void
  className?: string
}

export function ProductSearchBar({
  variant = 'page',
  urlQuery = '',
  onApply,
  className = '',
}: Props) {
  const [q, setQ] = useState(urlQuery)
  const [suggestions, setSuggestions] = useState<
    SuggestResponse['suggestions']
  >([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setQ(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    const t = q.trim()
    if (t.length < 1) {
      setSuggestions([])
      return
    }
    const id = window.setTimeout(() => {
      apiGet<SuggestResponse>(
        `/products/suggest?q=${encodeURIComponent(t)}`
      )
        .then((d) => setSuggestions(d.suggestions))
        .catch(() => setSuggestions([]))
    }, 200)
    return () => window.clearTimeout(id)
  }, [q])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function applyTextSearch() {
    const t = q.trim()
    if (variant === 'header') {
      navigate(t ? `/products?q=${encodeURIComponent(t)}` : '/products')
    } else {
      onApply(t)
    }
    setOpen(false)
    setSuggestions([])
  }

  function goToProduct(id: string) {
    navigate(`/products/${id}`)
    setOpen(false)
    setSuggestions([])
  }

  const showList =
    open && suggestions.length > 0 && q.trim().length > 0

  const inputCls =
    variant === 'header'
      ? 'w-full rounded-2xl border border-emerald-900/15 bg-white py-2.5 pl-10 pr-3 text-sm text-emerald-950 outline-none ring-emerald-600/30 focus:ring-2 dark:border-emerald-100/10 dark:bg-[#0c1210] dark:text-emerald-50'
      : 'w-full rounded-2xl border border-emerald-900/15 bg-white py-3 pl-11 pr-4 text-emerald-950 outline-none ring-emerald-600/30 focus:ring-2 dark:border-emerald-100/10 dark:bg-[#0c1210] dark:text-emerald-50'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (showList && active >= 0 && suggestions[active]) {
          goToProduct(suggestions[active].id)
          return
        }
        applyTextSearch()
      }}
      className={clsx(
        'flex flex-col gap-3 sm:flex-row sm:items-start',
        className
      )}
    >
      <div
        ref={wrapRef}
        className={clsx('relative flex-1', variant === 'header' && 'min-w-0')}
      >
        <Search
          className={clsx(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/50',
            variant === 'header' ? 'h-4 w-4' : 'h-5 w-5'
          )}
        />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!showList) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => Math.min(i + 1, suggestions.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, -1))
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          autoComplete="off"
          name="product-search"
          placeholder={
            variant === 'header'
              ? 'Tìm sản phẩm…'
              : 'Gõ để gợi ý — ↑↓ chọn, Enter vào chi tiết hoặc lọc'
          }
          className={inputCls}
        />
        {showList && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-2xl border border-emerald-900/15 bg-white py-1 shadow-xl dark:border-emerald-100/10 dark:bg-[#141c18]"
          >
            {suggestions.map((s, i) => (
              <li key={s.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={clsx(
                    'flex w-full flex-col gap-0.5 px-4 py-2.5 text-left text-sm transition',
                    i === active
                      ? 'bg-emerald-100 dark:bg-emerald-900/50'
                      : 'text-emerald-900 hover:bg-emerald-50 dark:text-emerald-100 dark:hover:bg-emerald-950/50'
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => goToProduct(s.id)}
                >
                  <span className="font-medium leading-snug">{s.name}</span>
                  <span className="text-xs text-emerald-800/65 dark:text-emerald-300/70">
                    {s.category ? categoryLabel(s.category) : ''}
                    {s.price != null
                      ? ` · ${vnd(Number(s.price))}`
                      : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {variant === 'page' && (
        <button
          type="submit"
          className="rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 dark:bg-emerald-600"
        >
          Tìm kiếm
        </button>
      )}
    </form>
  )
}
