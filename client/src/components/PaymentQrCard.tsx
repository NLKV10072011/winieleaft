import { useState } from 'react'
import { Copy, Check, QrCode } from 'lucide-react'
import {
  PAYMENT_QR_CAPTION_DEFAULT,
  PAYMENT_QR_IMAGE,
} from '../lib/payment'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

type Props = {
  total: number
  accountName: string
  transferContent: string
  caption?: string
  /** Ghi chú thêm (payload đầy đủ từ server) */
  detailLine?: string
  compact?: boolean
}

export function PaymentQrCard({
  total,
  accountName,
  transferContent,
  caption = PAYMENT_QR_CAPTION_DEFAULT,
  detailLine,
  compact,
}: Props) {
  const [copied, setCopied] = useState(false)

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(transferContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={
        compact
          ? 'space-y-3'
          : 'overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-b from-sky-50/90 to-white shadow-sm dark:border-sky-900/40 dark:from-sky-950/30 dark:to-[#141c18]'
      }
    >
      <div className={compact ? '' : 'px-4 pt-4'}>
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
          <QrCode className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          Chuyển khoản — Quét mã VietQR
        </div>
        {!compact && (
          <p className="mt-1 text-xs text-emerald-800/70 dark:text-emerald-200/60">
            Quét bằng ZaloPay, app ngân hàng, Momo… — nhập đúng nội dung để shop
            đối soát nhanh.
          </p>
        )}
      </div>

      <div
        className={
          compact
            ? 'flex gap-3'
            : 'flex flex-col px-4 pb-2'
        }
      >
        <div
          className={
            compact
              ? 'shrink-0 overflow-hidden rounded-2xl border border-sky-200/60 bg-white dark:border-sky-800/50'
              : 'overflow-hidden rounded-2xl border-2 border-sky-400/50 bg-white p-2 dark:border-sky-600/40 dark:bg-sky-950/20'
          }
        >
          <img
            src={PAYMENT_QR_IMAGE}
            alt="Mã QR nhận tiền cố định"
            className={
              compact
                ? 'h-28 w-28 object-cover object-center sm:h-32 sm:w-32'
                : 'mx-auto max-h-[min(420px,70vh)] w-full max-w-sm object-contain'
            }
          />
        </div>
        {!compact && (
          <p className="mt-3 text-center text-sm font-bold uppercase tracking-wide text-sky-950 dark:text-sky-100">
            {accountName}
          </p>
        )}
      </div>

      {compact && (
        <p className="text-xs font-semibold uppercase text-sky-950 dark:text-sky-100">
          {accountName}
        </p>
      )}

      <p
        className={
          compact
            ? 'text-[11px] text-emerald-800/75 dark:text-emerald-200/65'
            : 'px-4 text-center text-xs text-emerald-800/80 dark:text-emerald-200/65'
        }
      >
        {caption}
      </p>

      <div
        className={
          compact
            ? 'rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-3 dark:border-emerald-100/10 dark:bg-emerald-950/20'
            : 'mx-4 mb-4 space-y-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/80 p-4 dark:border-emerald-100/10 dark:bg-emerald-950/30'
        }
      >
        <div className="flex justify-between text-sm">
          <span className="text-emerald-800/80 dark:text-emerald-200/70">
            Số tiền
          </span>
          <span className="font-bold text-emerald-950 dark:text-emerald-50">
            {vnd(total)}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-200/70">
            Nội dung chuyển khoản (bắt buộc trùng)
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-xl bg-white px-3 py-2 font-mono text-sm text-emerald-950 dark:bg-[#0c1210] dark:text-emerald-100">
              {transferContent}
            </code>
            <button
              type="button"
              onClick={copyContent}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white dark:bg-emerald-600"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>
        </div>
        {detailLine ? (
          <p className="break-words text-[11px] leading-relaxed text-emerald-800/65 dark:text-emerald-200/55">
            {detailLine}
          </p>
        ) : null}
      </div>
    </div>
  )
}
