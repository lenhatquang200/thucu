import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PRICE_LIST } from '@/data/priceList'
import { getModels } from '@/data/priceList'
import { formatVnd } from '@/lib/utils'

export function PriceListPage() {
  const [q, setQ] = useState('')
  const [model, setModel] = useState('')
  const [storage, setStorage] = useState('')
  const [color, setColor] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  const filtered = useMemo(() => {
    return PRICE_LIST.filter((p) => {
      if (model && p.model !== model) return false
      if (storage && p.storage !== storage) return false
      if (color && p.color !== color) return false
      const hay = `${p.model} ${p.storage} ${p.color} ${p.type}`.toLowerCase()
      if (q && !hay.includes(q.toLowerCase())) return false
      return true
    })
  }, [q, model, storage, color])

  const storages = [...new Set(PRICE_LIST.filter((p) => !model || p.model === model).map((p) => p.storage))]
  const colors = [
    ...new Set(
      PRICE_LIST.filter((p) => (!model || p.model === model) && (!storage || p.storage === storage)).map(
        (p) => p.color,
      ),
    ),
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Bảng giá thu chuẩn</CardTitle>
            <div className="mt-1 text-sm text-muted">Cập nhật: 23/08/2026</div>
          </div>
          <Button onClick={() => setImportOpen(true)}>Import bảng giá</Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Tìm kiếm..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Select
            value={model}
            onChange={(e) => {
              setModel(e.target.value)
              setStorage('')
              setColor('')
            }}
          >
            <option value="">Model</option>
            {getModels().map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select value={storage} onChange={(e) => setStorage(e.target.value)}>
            <option value="">Dung lượng</option>
            {storages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select value={color} onChange={(e) => setColor(e.target.value)}>
            <option value="">Màu</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-5">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Loại</th>
                <th className="pb-2 font-medium">Bộ nhớ</th>
                <th className="pb-2 font-medium">Màu</th>
                <th className="pb-2 font-medium">Tình trạng</th>
                <th className="pb-2 font-medium">Pin</th>
                <th className="pb-2 text-right font-medium">Giá</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/70">
                  <td className="py-3 font-medium">{p.model}</td>
                  <td className="py-3">{p.type}</td>
                  <td className="py-3">{p.storage}</td>
                  <td className="py-3">{p.color}</td>
                  <td className="py-3">{p.condition}</td>
                  <td className="py-3">{p.battery}</td>
                  <td className="py-3 text-right font-bold text-brand">{formatVnd(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal open={importOpen} title="Import bảng giá" onClose={() => setImportOpen(false)}>
        <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-border bg-slate-50 text-sm text-muted">
          Kéo thả file Excel tại đây
        </div>
        <p className="mt-3 text-xs text-muted">Demo — không parse file thật</p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setImportOpen(false)}>
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  )
}
