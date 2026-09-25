import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/context/AppContext'
import { formatVnd, nowTime } from '@/lib/utils'

export function CashierPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecord, upsertRecord, staffName } = useApp()
  const record = getRecord(id!)
  const [checks, setChecks] = useState({
    device: record?.cashierChecks?.device ?? false,
    exterior: record?.cashierChecks?.exterior ?? false,
    customer: record?.cashierChecks?.customer ?? false,
  })
  const [done, setDone] = useState(false)

  if (!record) return <div>Không tìm thấy hồ sơ</div>

  const current = record
  const allChecked = checks.device && checks.exterior && checks.customer
  const price = current.finalPrice ?? current.estimatedPrice

  function confirm() {
    upsertRecord({
      ...current,
      status: 'Đã thu',
      finalPrice: price,
      cashierChecks: checks,
      warehouseAction: 'Chờ phân loại',
      handler: 'Thu ngân',
      updatedAt: new Date().toISOString(),
      timeline: [
        ...current.timeline,
        { id: `t-${Date.now()}`, at: nowTime(), actor: staffName || 'Thu ngân', action: 'Xác nhận nhận máy' },
      ],
    })
    setDone(true)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>{current.customer.name}</div>
            <div className="text-muted">{current.customer.phone}</div>
            <div>{current.customer.type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin máy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-medium">
              {current.device.model} {current.device.storage}
            </div>
            <div>{current.device.color}</div>
            <div>{current.device.type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tình trạng ngoại hình</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="text-lg font-bold">{current.inspection.exterior ?? '—'}</div>
            <div className="mt-1 text-muted">{current.inspection.exteriorNote || 'Không có ghi chú'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kết quả kiểm tra kỹ thuật</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>
              Pin: {current.inspection.batteryType ?? '—'}
              {current.inspection.batteryHealth != null ? ` · ${current.inspection.batteryHealth}%` : ''}
            </div>
            <div>
              Lỗi:{' '}
              {current.inspection.features.filter((f) => f.status === 'fail').map((f) => f.label).join(', ') ||
                'Không'}
            </div>
            <div>
              Zin:{' '}
              {current.inspection.isOriginal == null
                ? '—'
                : current.inspection.isOriginal
                  ? 'Còn zin'
                  : 'Đã sửa chữa'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Giá đã chốt</div>
          <div className="mt-1 text-4xl font-bold text-brand">{formatVnd(price)}</div>
          <div className="mt-2 text-sm text-slate-600">
            Hình thức:{' '}
            {current.transactionType === 'Thu đổi máy cũ'
              ? 'Thu đổi lấy máy qua sử dụng'
              : current.transactionType === 'Thu đổi máy mới'
                ? 'Thu đổi lấy máy mới'
                : current.transactionType}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-5">
          {(
            [
              ['device', 'Đã đối chiếu máy với kết quả kỹ thuật'],
              ['exterior', 'Đã đối chiếu ngoại hình'],
              ['customer', 'Đã xác nhận thông tin khách hàng'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={!allChecked} onClick={confirm}>
          Xác nhận thu máy
        </Button>
      </div>

      <Modal open={done} title="Thu máy thành công" onClose={() => navigate('/warehouse')}>
        <div className="text-center">
          <div className="text-sm text-muted">Mã hồ sơ</div>
          <div className="mt-1 text-2xl font-bold text-brand">{current.id}</div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(`/trade-in/${current.id}`)}>
            Chi tiết
          </Button>
          <Button onClick={() => navigate('/warehouse')}>Sang kho</Button>
        </div>
      </Modal>
    </div>
  )
}
