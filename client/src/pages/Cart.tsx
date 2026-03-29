import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { ProductImage } from '../components/ProductImage'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  )

export function Cart() {
  const { items, setQty, remove, clear } = useCartStore()
  const total = items.reduce((s, x) => s + x.price * x.qty, 0)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-bold text-emerald-950 dark:text-white">
          Giỏ hàng trống
        </h1>
        <p className="text-emerald-800/75 dark:text-emerald-200/70">
          Thêm sản phẩm yêu thích để tiếp tục mua sắm nhé.
        </p>
        <Link
          to="/products"
          className="inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-semibold text-white"
        >
          Tiếp tục mua
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-emerald-950 dark:text-white sm:text-3xl">
        Giỏ hàng
      </h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((line, i) => (
            <motion.div
              key={line.productId}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex gap-4 rounded-3xl border border-emerald-900/10 bg-white p-4 dark:border-emerald-100/10 dark:bg-[#141c18]"
            >
              <Link to={`/products/${line.productId}`} className="shrink-0">
                <ProductImage
                  image={line.image}
                  alt={line.name}
                  className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${line.productId}`}
                  className="font-semibold text-emerald-950 hover:underline dark:text-white"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/70">
                  {vnd(line.price)} / sản phẩm
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-xl border border-emerald-900/15 dark:border-emerald-100/10">
                    <button
                      type="button"
                      className="px-3 py-1"
                      onClick={() =>
                        setQty(line.productId, line.qty - 1)
                      }
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1"
                      onClick={() =>
                        setQty(line.productId, line.qty + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.productId)}
                    className="inline-flex items-center gap-1 text-sm text-rose-600 hover:underline"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
              <div className="text-right font-semibold text-emerald-900 dark:text-emerald-100">
                {vnd(line.price * line.qty)}
              </div>
            </motion.div>
          ))}
          <button
            type="button"
            onClick={clear}
            className="text-sm text-emerald-800/70 underline dark:text-emerald-300/70"
          >
            Xóa toàn bộ giỏ
          </button>
        </div>
        <div className="h-fit rounded-3xl border border-emerald-900/10 bg-emerald-50/80 p-6 dark:border-emerald-100/10 dark:bg-emerald-950/40">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-white">
            Tóm tắt
          </h2>
          <div className="mt-4 flex justify-between text-emerald-800 dark:text-emerald-200">
            <span>Tạm tính</span>
            <span className="font-semibold">{vnd(total)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-emerald-800/70 dark:text-emerald-200/70">
            <span>Phí vận chuyển</span>
            <span>Tính khi thanh toán</span>
          </div>
          <div className="mt-4 border-t border-emerald-900/10 pt-4 dark:border-emerald-100/10">
            <div className="flex justify-between text-lg font-bold text-emerald-950 dark:text-white">
              <span>Tổng</span>
              <span>{vnd(total)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 block w-full rounded-2xl bg-emerald-700 py-3 text-center font-semibold text-white hover:bg-emerald-600 dark:bg-emerald-600"
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  )
}
