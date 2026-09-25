import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/context/AppContext'
import { calculatePricing } from '@/lib/pricing'
import { formatSignedVnd, formatVnd, nowTime } from '@/lib/utils'

const REJECT_REASONS = ['Giá thấp', 'Muốn tham khảo thêm', 'Không muốn đổi máy', 'Khác']

export function QuotationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecord, upsertRecord, staffName } = useApp()
  const record = getRecord(id!)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState(REJECT_REASONS[0])

  if (!record) return <div>Không tìm thấy hồ sơ</div>

  const current = record
  const pricing = calculatePricing(
    current.standardPrice,
    current.transactionType,
    current.origin,
    current.inspection,
  )
  const estimated = current.estimatedPrice ?? pricing.estimatedPrice
  const adjustment = estimated - current.standardPrice

  function accept() {
    upsertRecord({
      ...current,
      estimatedPrice: estimated,
      finalPrice: estimated,
      status: 'Chờ thu ngân',
      handler: staffName,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...current.timeline,
        { id: `t-${Date.now()}`, at: nowTime(), actor: staffName, action: 'Khách đồng ý' },
      ],
    })
    navigate(`/cashier/${current.id}`)
  }

  function reject() {
    upsertRecord({
      ...current,
      estimatedPrice: estimated,
      status: 'Khách từ chối',
      rejectReason: reason,
      handler: staffName,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...current.timeline,
        {
          id: `t-${Date.now()}`,
          at: nowTime(),
          actor: staffName,
          action: 'Khách từ chối',
          detail: reason,
        },
      ],
    })
    setRejectOpen(false)
    navigate(`/trade-in/${current.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted">{current.id}</div>
          <h2 className="mt-1 text-2xl font-bold">
            {current.device.model} {current.device.storage}
          </h2>
          <div className="text-slate-600">{current.device.color}</div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-xs text-muted">Giá chuẩn</div>
              <div className="text-lg font-semibold">{formatVnd(current.standardPrice)}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Điều chỉnh</div>
              <div className={`text-lg font-semibold ${adjustment < 0 ? 'text-danger' : 'text-success'}`}>
                {formatSignedVnd(adjustment)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Giá thu dự kiến</div>
              <div className="text-2xl font-bold text-brand">{formatVnd(estimated)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết định giá</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pricing.lines
            .filter((l) => l.kind !== 'base')
            .map((l, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {l.kind === 'add' ? '+ ' : l.kind === 'sub' ? '- ' : ''}
                  {l.label}
                </span>
                <span className={l.kind === 'add' ? 'text-success' : l.kind === 'sub' ? 'text-danger' : 'text-muted'}>
                  {l.kind === 'note' ? (l.label.includes('Chưa cấu hình') ? 'Chưa cấu hình' : '0 ₫') : formatSignedVnd(l.amount)}
                </span>
              </div>
            ))}
          <p className="pt-3 text-xs text-muted">{pricing.disclaimer}</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => setRejectOpen(true)}>
          Khách không đồng ý
        </Button>
        <Button onClick={accept}>Khách đồng ý</Button>
      </div>

      <Modal open={rejectOpen} title="Lý do không bán" onClose={() => setRejectOpen(false)}>
        <div className="space-y-2">
          {REJECT_REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} />
              {r}
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setRejectOpen(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={reject}>
            Xác nhận từ chối
          </Button>
        </div>
      </Modal>

      <div>
        <Badge tone="brand">{current.status}</Badge>
      </div>
    </div>
  )
}
