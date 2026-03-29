export const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'tinh-dau', label: 'Tinh dầu' },
  { id: 'nen-thom', label: 'Nến thơm' },
  { id: 'tra', label: 'Trà & thảo mộc' },
  { id: 'cham-da', label: 'Chăm da' },
  { id: 'cham-co-the', label: 'Chăm cơ thể' },
  { id: 'toc', label: 'Tóc' },
  { id: 'do-trang-tri', label: 'Đồ trang trí' },
  { id: 'suc-khoe', label: 'Sức khỏe' },
  { id: 'khac', label: 'Khác' },
] as const

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}
