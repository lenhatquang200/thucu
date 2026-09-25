import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { calculatePricing } from '@/lib/pricing'
import { formatSignedVnd, formatVnd } from '@/lib/utils'

const TABS = ['Tổng quan', 'Kiểm tra kỹ thuật', 'Định giá', 'Lịch sử'] as const

export function TradeInDetailPage() {
  const { id } = useParams()
  const { getRecord } = useApp()
  const record = getRecord(id!)
  const [tab, setTab] = useState<(typeof TABS)[number]>('Tổng quan')

  if (!record) return <div>Không tìm thấy hồ sơ</div>

  const pricing = calculatePricing(
    record.standardPrice,
    record.transactionType,
    record.origin,
    record.inspection,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-6">
          <div>
            <div className="text-sm text-muted">{record.id}</div>
            <h2 className="mt-1 text-2xl font-bold">
              {record.device.model} {record.device.storage} {record.device.color}
            </h2>
            <div className="mt-3 text-3xl font-bold text-brand">
              {formatVnd(record.finalPrice ?? record.estimatedPrice)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone={statusTone(record.status)}>{record.status}</Badge>
            <div className="flex flex-wrap justify-end gap-2">
              {(record.status === 'Chờ kỹ thuật' || record.status === 'Đang kiểm tra') && (
                <Link to={`/inspection/${record.id}`}>
                  <Button size="sm">Kiểm tra kỹ thuật</Button>
                </Link>
              )}
              {(record.status === 'Chờ khách' || record.status === 'Đã định giá') && (
                <Link to={`/trade-in/${record.id}/quotation`}>
                  <Button size="sm">Báo giá</Button>
                </Link>
              )}
              {record.status === 'Chờ thu ngân' && (
                <Link to={`/cashier/${record.id}`}>
                  <Button size="sm">Thu ngân</Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              tab === t ? 'bg-brand text-white' : 'bg-white text-slate-600 border border-border'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Tổng quan' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="font-medium">{record.customer.name}</div>
              <div>{record.customer.phone}</div>
              <div>{record.customer.type}</div>
              {record.customer.note && <div className="text-muted">{record.customer.note}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Thiết bị & giao dịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>
                {record.device.model} · {record.device.storage} · {record.device.color}
              </div>
              <div>{record.device.type}</div>
              <div>Khả năng bán lại: {record.device.marketability}</div>
              <div>
                Mua iTamLoan: {record.origin.boughtAtItamloan ? 'Có' : 'Không'}
              </div>
              <div>Giao dịch: {record.transactionType}</div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l border-border pl-4">
                {record.timeline.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand" />
                    <div className="text-xs text-muted">{e.at}</div>
                    <div className="font-medium">{e.actor}</div>
                    <div className="text-sm">{e.action}</div>
                    {e.detail && <div className="text-sm text-muted">{e.detail}</div>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'Kiểm tra kỹ thuật' && (
        <Card>
          <CardContent className="space-y-3 pt-5 text-sm">
            <div>Ngoại hình: <strong>{record.inspection.exterior ?? '—'}</strong></div>
            <div>
              Pin:{' '}
              <strong>
                {record.inspection.batteryType ?? '—'}
                {record.inspection.batteryHealth != null ? ` · ${record.inspection.batteryHealth}%` : ''}
              </strong>
            </div>
            <div>
              Zin:{' '}
              <strong>
                {record.inspection.isOriginal == null
                  ? '—'
                  : record.inspection.isOriginal
                    ? 'Còn zin'
                    : 'Đã sửa chữa'}
              </strong>
            </div>
            <div>
              Lỗi:{' '}
              {record.inspection.features.filter((f) => f.status === 'fail').map((f) => f.label).join(', ') ||
                'Không'}
            </div>
            {record.inspection.techNote && <div>Ghi chú: {record.inspection.techNote}</div>}
          </CardContent>
        </Card>
      )}

      {tab === 'Định giá' && (
        <Card>
          <CardContent className="space-y-2 pt-5">
            {pricing.lines.map((l, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{l.label}</span>
                <span className="font-medium">
                  {l.kind === 'note' && l.label.includes('Chưa cấu hình')
                    ? 'Chưa cấu hình'
                    : l.kind === 'base'
                      ? formatVnd(l.amount)
                      : formatSignedVnd(l.amount)}
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-3 text-lg font-bold text-brand">
              {formatVnd(record.finalPrice ?? record.estimatedPrice ?? pricing.estimatedPrice)}
            </div>
            <p className="text-xs text-muted">{pricing.disclaimer}</p>
          </CardContent>
        </Card>
      )}

      {tab === 'Lịch sử' && (
        <Card>
          <CardContent className="pt-5">
            <ol className="space-y-4">
              {record.timeline.map((e) => (
                <li key={e.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="font-medium">
                    {e.at} — {e.actor}
                  </div>
                  <div>{e.action}</div>
                  {e.detail && <div className="text-muted">{e.detail}</div>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
