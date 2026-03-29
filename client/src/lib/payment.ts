/** Ảnh VietQR cố định — thay bằng ảnh QR thật tại client/public/images/vietqr-payment.png */
export const PAYMENT_QR_IMAGE = '/images/vietqr-payment.png'

export const PAYMENT_QR_CAPTION_DEFAULT =
  'QR nhận tiền từ mọi ứng dụng chuyển tiền'

/** Trùng biến server PAYMENT_ACCOUNT_NAME khi có cấu hình .env */
export const PAYMENT_ACCOUNT_NAME =
  import.meta.env.VITE_PAYMENT_ACCOUNT_NAME || 'NGUYEN LE KIEN VAN'
