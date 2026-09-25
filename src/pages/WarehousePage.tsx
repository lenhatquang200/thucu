import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/context/AppContext'
import { formatVnd, nowTime } from '@/lib/utils'
import type { TradeInRecord, WarehouseAction } from '@/types'

const ACTIONS: WarehouseAction[] = ['Vệ sinh', 'Cài đặt', 'Sửa chữa', 'Sẵn sàng bán', 'Bán xả']

export function WarehousePage() {
  const { records, upsertRecord, staffName } = useApp()
  const list = records.filter((r) => r.status === 'Đã thu' || r.status === 'Đã nhập kho')
  const [selected, setSelected] = useState<TradeInRecord | null>(null)
  const [action, setAction] = useState<WarehouseAction>('Vệ sinh')

  function confirm() {
    if (!selected) return
    upsertRecord({
      ...selected,
      status: 'Đã nhập kho',
      warehouseAction: action,
      handler: 'Kho',
      updatedAt: new Date().toISOString(),
      timeline: [
        ...selected.timeline,
        {
          id: `t-${Date.now()}`,
          at: nowTime(),
          actor: staffName || 'Kho',
          action: 'Nhập kho',
          detail: action,
        },
      ],
    })
    setSelected(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="overflow-x-auto pt-5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="pb-2 font-medium">Mã</th>
                <th className="pb-2 font-medium">Máy</th>
                <th className="pb-2 text-right font-medium">Giá thu</th>
                <th className="pb-2 font-medium">Ngày nhận</th>
                <th className="pb-2 font-medium">Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-b border-border/70 hover:bg-slate-50"
                  onClick={() => {
                    setSelected(r)
                    setAction(r.warehouseAction && r.warehouseAction !== 'Chờ phân loại' ? r.warehouseAction : 'Vệ sinh')
                  }}
                >
                  <td className="py-3 font-medium text-brand">{r.id}</td>
                  <td className="py-3">
                    {r.device.model} {r.device.storage}
                  </td>
                  <td className="py-3 text-right font-semibold">{formatVnd(r.finalPrice)}</td>
                  <td className="py-3">{new Date(r.updatedAt).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3">{r.warehouseAction ?? 'Chờ phân loại'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        open={!!selected}
        title={selected ? `${selected.id} — Hướng xử lý` : ''}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className="mb-4 text-sm text-slate-600">
              {selected.device.model} {selected.device.storage} · {formatVnd(selected.finalPrice)}
            </div>
            <div className="space-y-2">
              {ACTIONS.map((a) => (
                <label key={a} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input type="radio" name="wh" checked={action === a} onChange={() => setAction(a)} />
                  {a}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-between gap-2">
              <Link to={`/trade-in/${selected.id}`} className="text-sm text-brand hover:underline">
                Xem chi tiết
              </Link>
              <Button onClick={confirm}>Xác nhận nhập kho</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
