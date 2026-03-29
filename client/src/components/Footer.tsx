import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-emerald-900/10 bg-emerald-950/[0.03] py-10 dark:border-emerald-100/10 dark:bg-black/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <span className="font-semibold">Winie Leaf</span>
          </div>
          <p className="text-sm leading-relaxed text-emerald-800/80 dark:text-emerald-200/70">
            Mang thiên nhiên vào từng góc nhỏ cuộc sống — sản phẩm xanh, an
            toàn và thư giãn cho không gian sống của bạn.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-2 font-semibold text-emerald-900 dark:text-emerald-100">
              Khám phá
            </p>
            <ul className="space-y-1.5 text-emerald-800/75 dark:text-emerald-200/70">
              <li>
                <Link to="/products" className="hover:underline">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:underline">
                  Tài khoản
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-emerald-900 dark:text-emerald-100">
              Hỗ trợ
            </p>
            <ul className="space-y-1.5 text-emerald-800/75 dark:text-emerald-200/70">
              <li>
                Hotline / Zalo:{' '}
                <a
                  href="tel:0794010454"
                  className="font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  0794 010 454
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61578757753489"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  Facebook — Winie Leaf
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-emerald-800/50 dark:text-emerald-300/40">
        © {new Date().getFullYear()} Winie Leaf. Đã tối ưu cho trải nghiệm mượt
        & responsive.
      </p>
    </footer>
  )
}
