import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronRight, Heart } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { apiGet, type Product } from '../lib/api'
import { useRecentProductsStore } from '../store/recentProductsStore'
import { SEO } from '../components/SEO'

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [recommended, setRecommended] = useState<Product[]>([])
  const recentIds = useRecentProductsStore((s) => s.ids)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.05])

  useEffect(() => {
    apiGet<Product[]>('/products')
      .then((list) => setFeatured(list.filter((p) => p.featured).slice(0, 4)))
      .catch(() => setFeatured([]))

    const q = recentIds.length > 0 ? `?ids=${encodeURIComponent(recentIds.slice(0, 8).join(','))}` : ''
    apiGet<Product[]>(`/recommendations${q}`)
      .then(setRecommended)
      .catch(() => setRecommended([]))
  }, [recentIds])

  return (
    <div className="flex flex-col w-full -mt-16 sm:-mt-20">
      <SEO title="Trang chủ" description="Winie Leaf - Tinh hoa thiên nhiên cho cuộc sống hiện đại." />
      {/* Cinematic Hero Section (Apple Style) */}
      <section className="relative flex h-screen min-h-[520px] sm:min-h-[700px] w-full items-center justify-center overflow-hidden bg-black text-white">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=2053&auto=format&fit=crop"
            alt="Essential Oil Nature"
            className="h-full w-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 -mt-12 sm:-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-7xl md:text-8xl lg:text-[100px] text-white hero-text-glow">
              Winieleaf
            </h1>
            <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-xl md:text-2xl font-medium tracking-tight text-slate-300">
              Tinh hoa thiên nhiên, đánh thức mọi giác quan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center w-full sm:w-auto px-6 sm:px-0"
          >
            <Link
              to="/products"
              className="w-full sm:w-auto text-center rounded-full bg-white px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Khám phá ngay
            </Link>
            <Link
              to="/products?brand=fuwa3e"
              className="group flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              Tìm hiểu thêm
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8 py-14 sm:py-24 space-y-16 sm:space-y-32">
        {/* Apple-style feature block */}
        <section className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:h-[600px] rounded-2xl sm:rounded-[2.5rem] bg-slate-100 overflow-hidden dark:bg-[#111111] transition-colors">
          <div className="flex-1 p-6 sm:p-10 md:p-16 lg:p-24 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Chăm sóc trọn vẹn. <br />
              <span className="text-slate-500">Mỏng nhẹ, tự nhiên.</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg tracking-tight text-slate-600 dark:text-slate-400 max-w-md">
              Được chiết xuất từ những nguyên liệu hữu cơ cao cấp nhất, mang lại luồng sinh khí mới cho môi trường sống của bạn. Hoàn toàn không chứa hóa chất độc hại.
            </p>
            <Link to="/products" className="mt-6 sm:mt-8 text-emerald-600 dark:text-emerald-400 font-semibold text-base sm:text-lg flex items-center gap-2 hover:underline underline-offset-4">
              Khám phá các dòng sản phẩm <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex-1 h-56 sm:h-64 md:h-full relative overflow-hidden bg-slate-200 dark:bg-[#1a1a1a]">
            <img
              src="https://images.unsplash.com/photo-1595425970377-c9703bc48b12?q=80&w=2071&auto=format&fit=crop"
              alt="Feature"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] hover:scale-110"
            />
          </div>
        </section>

        {/* Featured Products */}
        <section className="space-y-8 sm:space-y-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-4">
              Tuyệt tác từ lá & hoa
            </h2>
            <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
              Những sản phẩm bán chạy nhất, được khách hàng yêu thích.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>

        {/* Bento Grid Highlights */}
        <section className="space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto px-2">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-6">
              Sự khác biệt tại <span className="text-emerald-600">Winieleaf</span>
            </h2>
            <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
              Chúng tôi không chỉ bán sản phẩm, chúng tôi mang đến một phong cách sống bền vững và tỉnh thức.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 sm:gap-6 h-auto md:h-[800px]">
            {/* Big Card - Organic */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-950/20 p-6 sm:p-10 md:p-12 group min-h-[320px] sm:min-h-0"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white shadow-xl mb-6 sm:mb-8 dark:bg-emerald-500">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 dark:text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-bold text-emerald-950 dark:text-white mb-3 sm:mb-4 tracking-tight">100% Organic</h3>
                  <p className="text-emerald-800/70 dark:text-emerald-200/60 text-sm sm:text-lg leading-relaxed max-w-sm">
                    Mọi thành phần đều được canh tác hữu cơ, không hóa chất, bảo vệ sức khỏe và làn da của bạn một cách tuyệt đối.
                  </p>
                </div>
                <div className="mt-8 pt-4">
                  <div className="h-1 w-24 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ x: [0, 100, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full w-12 bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"
                className="absolute bottom-0 right-0 w-2/3 opacity-20 grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 pointer-events-none"
                alt="Organic"
              />
            </motion.div>

            {/* Sustainable Packaging */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-1 relative overflow-hidden rounded-3xl sm:rounded-[3rem] bg-slate-900 text-white p-6 sm:p-10 group"
            >
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 tracking-tight">Bền vững</h3>
                <p className="text-slate-400 text-sm sm:text-base max-w-xs leading-relaxed">
                  Sử dụng vật liệu tái chế 100% cho mọi bao bì, giảm thiểu rác thải nhựa ra môi trường.
                </p>
              </div>
              <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 sm:w-12 h-16 sm:h-20 rounded-full border border-white/10 flex items-end p-1">
                    <motion.div
                      animate={{ height: [`${20 * i}%`, '80%', `${20 * i}%`] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-full bg-emerald-500 rounded-full"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Handcrafted */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-1 md:row-span-1 relative overflow-hidden rounded-3xl sm:rounded-[3rem] bg-indigo-50 dark:bg-indigo-950/20 p-6 sm:p-8 flex flex-col items-center text-center justify-center group"
            >
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-indigo-600 text-white mb-3 sm:mb-4">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-indigo-950 dark:text-white mb-1.5 sm:mb-2">Thủ công</h3>
              <p className="text-xs sm:text-sm text-indigo-800/60 dark:text-indigo-200/60">
                Mỗi lọ sản phẩm là một tác phẩm tâm huyết.
              </p>
            </motion.div>

            {/* Tech/Science */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-1 md:row-span-1 relative overflow-hidden rounded-3xl sm:rounded-[3rem] bg-slate-100 dark:bg-[#1a1a1a] p-6 sm:p-8 flex flex-col justify-center gap-2 group"
            >
              <div className="text-3xl sm:text-4xl font-black text-slate-200 dark:text-slate-800 absolute -right-2 -top-2 sm:-right-4 sm:-top-4">02</div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Công nghệ Trích ly</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Giữ trọn 99% dưỡng chất quý giá từ thực vật.
              </p>
              <div className="mt-3 sm:mt-4 flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white bg-slate-200 dark:border-slate-900 dark:bg-slate-700 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="h-7 sm:h-8 flex items-center pl-3 sm:pl-4 text-[10px] font-bold text-slate-400">10k+ tin dùng</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Secondary feature blocks grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative h-[340px] sm:h-[420px] md:h-[500px] rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-slate-900 group">
            <img src="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-[2s] group-hover:scale-105" alt="Trà" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 md:p-12">
              <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-2 sm:mb-3 tracking-tight">Trà sấy lạnh</h3>
              <p className="text-slate-300 text-sm sm:text-lg tracking-tight mb-4 sm:mb-6">Thanh ngọt tự nhiên, không đường.</p>
              <Link to="/products?category=tra" className="text-sm sm:text-base text-white hover:text-white/80 font-medium underline underline-offset-4">Khám phá Trà</Link>
            </div>
          </div>

          <div className="relative h-[340px] sm:h-[420px] md:h-[500px] rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-emerald-100 dark:bg-emerald-950/20 group">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10 text-center">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 dark:text-emerald-400 mb-4 sm:mb-6" />
              <h3 className="text-2xl sm:text-3xl font-semibold text-emerald-950 dark:text-emerald-50 mb-2 sm:mb-3 tracking-tight">Chăm da dịu nhẹ</h3>
              <p className="text-emerald-800/70 dark:text-emerald-200/70 text-sm sm:text-lg tracking-tight mb-6 sm:mb-8 max-w-xs">
                Sản phẩm hữu cơ phù hợp cho cả làn da nhạy cảm nhất.
              </p>
              <Link to="/products?category=cham-da" className="rounded-full bg-emerald-600 px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:scale-105">
                Xem ngay
              </Link>
            </div>
          </div>
        </section>

        {/* Recommended Products */}
        {recommended.length > 0 && (
          <section className="space-y-8 sm:space-y-12 border-t border-slate-200 pt-12 sm:pt-20 dark:border-slate-800/80">
            <div className="text-center">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2 sm:mb-4">
                Dành riêng cho bạn
              </h2>
              <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
                Gợi ý dựa trên sở thích của bạn.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {recommended.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
