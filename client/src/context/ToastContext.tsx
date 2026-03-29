import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle } from 'lucide-react'

type ToastType = 'ok' | 'err'

type Ctx = {
  show: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
  } | null>(null)

  const show = useCallback((message: string, type: ToastType = 'ok') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3400)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 z-[90] flex max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm font-medium shadow-xl dark:border-emerald-100/10 dark:bg-[#141c18]"
          >
            {toast.type === 'ok' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            )}
            <span className="text-emerald-950 dark:text-emerald-50">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const c = useContext(ToastContext)
  if (!c) throw new Error('useToast cần ToastProvider')
  return c
}
