import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ChatWidget } from './ChatWidget'
import { BackToTop } from './BackToTop'
import { SideCart } from './SideCart'
import { ToastProvider } from '../context/ToastContext'

export function Layout() {
  return (
    <ToastProvider>
      <SideCart />
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-500 selection:bg-emerald-500/30 dark:bg-[#000000] dark:text-slate-100">
        <Header />
        {/* We remove max-w on main so pages can bleed to edge if they want (like Apple's hero bands). 
            Constrained containers will be inside individual pages where needed. */}
        <main className="flex-1 w-full pt-16">
          <Outlet />
        </main>
        <Footer />
        <BackToTop />
        <ChatWidget />
      </div>
    </ToastProvider>
  )
}
