/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYMENT_ACCOUNT_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
