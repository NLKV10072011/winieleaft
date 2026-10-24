import { useState, useEffect } from 'react'
import { Search, Loader2, Award, Mail, Phone } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { apiGet, type User } from '../../lib/api'

export function CustomerManager() {
  const token = useAuthStore((s) => s.token)
  const [customers, setCustomers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!token) return
    apiGet<User[]>('/admin/customers', token)
      .then(setCustomers)
      .catch((e) => alert(e instanceof Error ? e.message : 'Lỗi tải khách hàng'))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      (c.phone || '').includes(query)
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 dark:border-[#202d26] dark:bg-[#151e1a]">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Tìm theo tên, email, SĐT…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#0c1210] dark:focus:bg-[#111815]"
          />
        </div>
        <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Tổng cộng: {filtered.length} thành viên
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm dark:border-[#202d26] dark:bg-[#151e1a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 dark:bg-[#111815] dark:text-slate-400 border-b border-slate-200/60 dark:border-[#202d26]">
              <tr>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                <th className="px-6 py-4 font-semibold text-center">Điểm thưởng</th>
                <th className="px-6 py-4 font-semibold text-center">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#202d26]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500 mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy thành viên.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="transition hover:bg-slate-50/50 dark:hover:bg-[#1a2520]/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 font-bold text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {c.email}</span>
                        {c.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {c.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <Award className="h-4 w-4" />
                        {c.points} pt
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {c.role === 'admin' ? (
                        <span className="rounded-md bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">ADMIN</span>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">USER</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
