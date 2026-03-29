import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, History, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { BannerCarousel } from '../components/BannerCarousel'
import { ProductCard } from '../components/ProductCard'
import { apiGet, type Product } from '../lib/api'
import { useRecentProductsStore } from '../store/recentProductsStore'

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [recommended, setRecommended] = useState<Product[]>([])
  const recentIds = useRecentProductsStore((s) => s.ids)

  useEffect(() => {
    apiGet<Product[]>('/products')
      .then((list) =>
        setFeatured(list.filter((p) => p.featured).slice(0, 4))
      )
      .catch(() => setFeatured([]))
  }, [])

  useEffect(() => {
    const q =
      recentIds.length > 0
        ? `?ids=${encodeURIComponent(recentIds.slice(0, 8).join(','))}`
        : ''
    apiGet<Product[]>(`/recommendations${q}`)
      .then(setRecommended)
      .catch(() => setRecommended([]))
  }, [recentIds])

  return (
    <div className="space-y-14">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Winie Leaf
            </p>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-emerald-950 dark:text-white sm:text-4xl md:text-5xl">
              Mang thiên nhiên vào từng góc nhỏ cuộc sống
            </h1>
            <p className="mt-3 max-w-xl text-base text-emerald-800/85 dark:text-emerald-200/80">
              Tinh khiết — an toàn — thư giãn. Khám phá tinh dầu, trà lá, chăm
              da và đồ sống xanh được chọn lọc cho không gian của bạn.
            </p>
          </div>
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
        <BannerCarousel />
      </motion.section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Truck,
            t: 'Giao hàng & hỗ trợ',
            d: 'Theo dõi đơn trong tài khoản, cập nhật trạng thái minh bạch.',
          },
          {
            icon: Bot,
            t: 'Trợ lý AI',
            d: 'Chat góc phải màn hình — tư vấn sản phẩm và liên hệ shop nhanh.',
          },
          {
            icon: ShieldCheck,
            t: 'Mua an tâm',
            d: 'Thanh toán chuyển khoản có hướng dẫn; điểm tích lũy khi mua.',
          },
        ].map(({ icon: Icon, t, d }, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-3 rounded-3xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm dark:border-emerald-100/10 dark:bg-[#141c18]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700/10 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-emerald-950 dark:text-white">{t}</p>
              <p className="mt-0.5 text-sm text-emerald-800/75 dark:text-emerald-200/70">
                {d}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {recommended.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-950 dark:text-white sm:text-2xl">
              <History className="h-6 w-6 text-emerald-600" />
              Gợi ý cho bạn
            </h2>
            <p className="max-w-md text-sm text-emerald-800/75 dark:text-emerald-200/70">
              Dựa trên danh mục sản phẩm bạn đã xem (lưu trên trình duyệt) và
              sản phẩm nổi bật.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-emerald-950 dark:text-white sm:text-2xl">
            Gợi ý hôm nay
          </h2>
          <Link
            to="/products"
            className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
          >
            Xem thêm
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
