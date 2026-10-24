import { motion } from 'framer-motion'
import { Leaf, Recycle, Globe, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

export function About() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:px-12 animate-in fade-in duration-1000">
      <SEO title="Về chúng tôi" description="Câu chuyện thương hiệu Winie Leaf - Nuôi dưỡng vẻ đẹp từ thiên nhiên." />
      
      {/* Hero Section */}
      <section className="mb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
        >
          <Leaf className="h-12 w-12" />
        </motion.div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white md:text-7xl">
          Chào mừng đến với <br />
          <span className="text-emerald-500 italic">Winie Leaf</span>
        </h1>
        <p className="max-w-2xl text-lg text-slate-500 dark:text-slate-400">
           Khởi nguồn từ tình yêu với những giá trị nguyên bản, Winie Leaf được thành lập để mang lại những giải pháp chăm sóc sức khỏe và vẻ đẹp thuần túi từ thiên nhiên.
        </p>
      </section>

      {/* Story Sections */}
      <div className="space-y-32">
        <section className="grid gap-16 lg:grid-cols-2 lg:items-center">
           <motion.div 
             initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}
             className="relative aspect-video overflow-hidden rounded-[3rem] shadow-2xl shadow-emerald-500/10"
           >
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1280" alt="Sứ mệnh" className="h-full w-full object-cover" />
           </motion.div>
           <div className="space-y-6">
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-500">Sứ mệnh của chúng tôi</span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Kiến tạo lối sống bền vững</h2>
              <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                 Chúng tôi không chỉ bán sản phẩm, chúng tôi lan tỏa một lối sống. Winie Leaf cam kết tối ưu hóa quy trình sản xuất, ưu tiên nguyên liệu hữu cơ và bao bì tái chế để giảm thiểu tác động lên hành tinh xanh.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { icon: Globe, label: 'Thân thiện môi trường' },
                   { icon: Recycle, label: 'Bao bì tái chế' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-[#111111]">
                      <item.icon className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-bold">{item.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        <section className="grid gap-16 lg:grid-cols-2 lg:items-center">
           <div className="order-2 space-y-6 lg:order-1">
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-500">Giá trị cốt lõi</span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Sức khỏe là sự ưu tiên</h2>
              <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                 Mỗi sản phẩm tại Winie Leaf đều trải qua quy trình kiểm duyệt khắt khe. Chúng tôi nói không với hóa chất độc hại, hương liệu tổng hợp và các thành phần gây kích ứng. Sự an tâm của bạn chính là niềm tự hào của chúng tôi.
              </p>
              <ul className="space-y-4">
                 {['Nguyên liệu 100% tự nhiên', 'Không thử nghiệm trên động vật', 'Chứng nhận hữu cơ quốc tế'].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                       <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30">
                          <ArrowRight className="h-4 w-4" />
                       </div>
                       <span className="font-medium">{text}</span>
                    </li>
                 ))}
              </ul>
           </div>
           <motion.div 
             initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}
             className="order-1 relative aspect-video overflow-hidden rounded-[3rem] shadow-2xl shadow-emerald-500/10 lg:order-2"
           >
              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1280" alt="Giá trị" className="h-full w-full object-cover" />
           </motion.div>
        </section>
      </div>

      {/* CTA */}
      <section className="mt-32 rounded-[4rem] bg-slate-900 p-12 text-center text-white dark:bg-emerald-950/20 md:p-24 overflow-hidden relative">
         <div className="relative z-10 mx-auto max-w-2xl space-y-8">
            <h2 className="text-4xl font-bold md:text-5xl">Gia nhập cộng đồng <br /> sống xanh cùng Winie</h2>
            <p className="text-slate-400">Bắt đầu hành trình nuôi dưỡng bản thân ngay hôm nay với những sản phẩm tinh khiết nhất.</p>
            <Link to="/products" className="inline-flex rounded-full bg-white px-10 py-5 font-bold text-black hover:scale-110 shadow-xl transition-all">
               Khám phá Sản phẩm
            </Link>
         </div>
         <div className="absolute top-0 right-0 h-full w-64 bg-emerald-500/10 blur-[80px] -rotate-45 translate-x-32" />
         <div className="absolute bottom-0 left-0 h-full w-64 bg-teal-500/10 blur-[80px] rotate-45 -translate-x-32" />
      </section>
    </div>
  )
}
