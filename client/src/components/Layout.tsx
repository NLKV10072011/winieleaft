import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ChatWidget } from './ChatWidget'
import { BackToTop } from './BackToTop'
import { ToastProvider } from '../context/ToastContext'

export function Layout() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-[#f6faf7] text-emerald-950 dark:bg-[#0c1210] dark:text-emerald-50">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          <Outlet />
        </main>
        <Footer />
        <BackToTop />
        <ChatWidget />
      </div>
    </ToastProvider>
  )
}
