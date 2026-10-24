import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, X, ShieldCheck, BarChart3, Settings2 } from "lucide-react"

const STORAGE_KEY = "winie_cookie_consent"

type ConsentState = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [prefs, setPrefs] = useState<ConsentState>({
    necessary: true,
    analytics: true,
    marketing: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      // Delay 1.2s de khong lam nguoi dung hoang so ngay khi vao trang
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  function acceptAll() {
    save({ necessary: true, analytics: true, marketing: true })
  }

  function rejectOptional() {
    save({ necessary: true, analytics: false, marketing: false })
  }

  function saveCustom() {
    save(prefs)
  }

  function save(consent: ConsentState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop mo nho khi hien detail */}
          <AnimatePresence>
            {showDetail && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
                onClick={() => setShowDetail(false)}
              />
            )}
          </AnimatePresence>

          <motion.div
            key="cookie-banner"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-5 left-1/2 z-[999] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/20 backdrop-blur-xl dark:border-slate-700/60 dark:bg-[#111111]/95 dark:shadow-black/50">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                    <Cookie className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">
                      Website dung Cookie
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      De cai thien trai nghiem cua ban
                    </p>
                  </div>
                </div>
                <button
                  onClick={rejectOptional}
                  className="mt-0.5 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Dong"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pb-2">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Chung toi su dung cookie de phan tich luong truy cap, ghi nho gio hang va cai thien trai nghiem mua sam. Ban co the tu chon nhung gi minh muon cho phep.
                </p>
              </div>

              {/* Custom settings panel */}
              <AnimatePresence>
                {showDetail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                      {/* Necessary */}
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Bat buoc</p>
                            <p className="text-xs text-slate-500">Xac thuc, gio hang — khong the tat</p>
                          </div>
                        </div>
                        <div className="h-5 w-9 rounded-full bg-emerald-500 opacity-60 cursor-not-allowed" />
                      </div>

                      {/* Analytics */}
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2.5">
                          <BarChart3 className="h-4 w-4 shrink-0 text-sky-500" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Phan tich</p>
                            <p className="text-xs text-slate-500">Giup chung toi hieu ban dung web the nao</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                          className={`relative h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none ${prefs.analytics ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          aria-checked={prefs.analytics}
                          role="switch"
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${prefs.analytics ? "translate-x-4" : "translate-x-0"
                              }`}
                          />
                        </button>
                      </div>

                      {/* Marketing */}
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2.5">
                          <Settings2 className="h-4 w-4 shrink-0 text-violet-500" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Marketing</p>
                            <p className="text-xs text-slate-500">Quang cao & chao hang phu hop voi ban</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
                          className={`relative h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none ${prefs.marketing ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          aria-checked={prefs.marketing}
                          role="switch"
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${prefs.marketing ? "translate-x-4" : "translate-x-0"
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col gap-2 px-6 pb-6 pt-2 sm:flex-row">
                {showDetail ? (
                  <button
                    onClick={saveCustom}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-95"
                  >
                    Luu tuy chon
                  </button>
                ) : (
                  <button
                    onClick={acceptAll}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-95"
                  >
                    Chap nhan tat ca
                  </button>
                )}
                <button
                  onClick={() => setShowDetail((v) => !v)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 active:scale-95"
                >
                  {showDetail ? "An tuy chon" : "Tuy chinh"}
                </button>
                {!showDetail && (
                  <button
                    onClick={rejectOptional}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 whitespace-nowrap"
                  >
                    Tu choi
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
