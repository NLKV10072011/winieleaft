import { useState } from 'react'
import { updateProfile } from '../store/authStore'

type Props = {
  initialAddress: string
}

export function AddressField({ initialAddress }: Props) {
  const [addr, setAddr] = useState(initialAddress)

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!addr.trim()) return
    try {
      await updateProfile({ addresses: [addr.trim()] })
    } catch {
      /* ignore */
    }
  }

  return (
    <form
      onSubmit={saveAddress}
      className="mt-3 flex flex-col gap-2 sm:flex-row"
    >
      <input
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        placeholder="Nhập địa chỉ giao hàng..."
        className="min-w-0 flex-1 rounded-2xl border border-emerald-900/15 px-4 py-2 dark:border-emerald-100/10 dark:bg-[#0c1210]"
      />
      <button
        type="submit"
        className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Lưu
      </button>
    </form>
  )
}
