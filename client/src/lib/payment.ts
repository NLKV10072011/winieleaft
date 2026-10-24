/** Cấu hình VietQR — ngân hàng và số tài khoản */
export const VIETQR_BANK = import.meta.env.VITE_VIETQR_BANK || 'MB'
export const VIETQR_ACCOUNT = import.meta.env.VITE_VIETQR_ACCOUNT || '0904973234'

export const PAYMENT_ACCOUNT_NAME =
  import.meta.env.VITE_PAYMENT_ACCOUNT_NAME || 'NGUYEN LE KIEN VAN'

export const PAYMENT_QR_CAPTION_DEFAULT =
  'QR nhận tiền từ mọi ứng dụng chuyển tiền'

/**
 * Tạo URL ảnh QR động từ VietQR.io
 * - amount: số tiền (VND)
 * - addInfo: nội dung chuyển khoản
 * - accountName: tên chủ tài khoản (hiển thị trên QR)
 */
export function buildVietQrUrl(params: {
  amount: number
  addInfo: string
  accountName?: string
}): string {
  const bank = VIETQR_BANK
  const account = VIETQR_ACCOUNT
  const base = `https://img.vietqr.io/image/${bank}-${account}-vietqr_pro.svg`
  const qs = new URLSearchParams({
    amount: String(Math.round(params.amount)),
    addInfo: params.addInfo,
    ...(params.accountName ? { accountName: params.accountName } : {}),
  })
  return `${base}?${qs.toString()}`
}
