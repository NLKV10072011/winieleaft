import { Save, Settings2 } from 'lucide-react'

export function AdminSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm dark:border-[#202d26] dark:bg-[#151e1a]">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-[#2a3a31]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cài đặt hệ thống</h2>
            <p className="text-sm text-slate-500 max-w-lg">
              Cấu hình các tham số chung cho cửa hàng Winieleaf.
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Đã lưu cấu hình giả định!'); }}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên Cửa Hàng</label>
              <input readOnly defaultValue="Winieleaf" className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 dark:border-[#2a3a31] dark:bg-[#0c1210] dark:text-slate-400" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Hỗ Trợ</label>
              <input readOnly defaultValue="winieleaf@gmail.com" className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 dark:border-[#2a3a31] dark:bg-[#0c1210] dark:text-slate-400" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phí Giao Hàng Cơ Bản (VND)</label>
              <input type="number" defaultValue="30000" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#111815]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Freeship từ (VND)</label>
              <input type="number" defaultValue="500000" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-[#2a3a31] dark:bg-[#111815]" />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95">
              <Save className="h-5 w-5" />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
