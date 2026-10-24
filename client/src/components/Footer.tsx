import { Link } from 'react-router-dom'
import { 
  Globe, MessageCircle, PlayCircle, Mail, 
  MapPin, Phone, Leaf, ArrowRight 
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 sm:mt-32 border-t border-slate-100 bg-white pt-12 sm:pt-24 pb-10 sm:pb-12 dark:border-slate-800 dark:bg-[#0a0a0a] transition-all">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand Info */}
          <div className="space-y-6 sm:space-y-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 group-hover:scale-110 transition-transform">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">Winie Leaf</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
               Mang những giá trị thuần túy từ thiên nhiên vào không gian sống của bạn. Winie Leaf — Nuôi dưỡng vẻ đẹp từ gốc rễ.
            </p>
            <div className="flex gap-3 sm:gap-4">
              {[
                { icon: Globe, href: '#' },
                { icon: MessageCircle, href: '#' },
                { icon: PlayCircle, href: '#' },
              ].map((social, i) => (
                <a key={i} href={social.href} className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-500 transition-all hover:bg-slate-900 hover:text-white dark:border-slate-800 dark:bg-[#111111] dark:hover:bg-white dark:hover:text-black active:scale-95">
                   <social.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-8">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Mua sắm</h3>
            <ul className="space-y-2.5 sm:space-y-4">
              {['Tất cả sản phẩm', 'Chăm sóc da', 'Trà thảo mộc', 'Tinh dầu'].map((link) => (
                <li key={link}>
                  <Link to="/products" className="text-sm text-slate-500 hover:text-emerald-500 transition-colors dark:text-slate-400">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Info */}
          <div className="space-y-4 sm:space-y-8">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Chúng tôi</h3>
            <ul className="space-y-2.5 sm:space-y-4">
              {['Về Winie Leaf', 'Chính sách bảo mật', 'Điều khoản sử dụng', 'Liên hệ'].map((link) => (
                <li key={link}>
                  <Link to="/" className="text-sm text-slate-500 hover:text-emerald-500 transition-colors dark:text-slate-400">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4 sm:space-y-8">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Bản tin</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Đăng ký nhận thông báo về bộ sưu tập mới và ưu đãi đặc quyền.</p>
            <div className="flex overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-[#111111]">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="w-full bg-transparent px-4 py-3 text-base sm:text-sm focus:outline-none"
              />
              <button aria-label="Đăng ký nhận tin" className="flex items-center justify-center bg-slate-900 px-5 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 active:scale-95">
                 <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-12 sm:mt-20 flex flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-[2.5rem] bg-slate-50 p-5 sm:p-8 dark:bg-[#111111] md:flex-row md:items-center md:justify-around text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-3 sm:gap-4 text-slate-600 dark:text-slate-300">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
            <span>118 Nguyễn Đình Chiểu, Phường Ngũ Hành Sơn, TP. Đà Nẵng</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-600 dark:text-slate-300">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
            <span>0794 010 454</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-600 dark:text-slate-300">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
            <span>winieleaf@gmail.com</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center justify-between gap-4 sm:gap-6 border-t border-slate-100 pt-8 sm:pt-12 dark:border-slate-800 md:flex-row text-center md:text-left">
          <p className="text-xs text-slate-400">© {currentYear} Winie Leaf Concept Store. Đã đăng ký bản quyền.</p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">System Online</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
