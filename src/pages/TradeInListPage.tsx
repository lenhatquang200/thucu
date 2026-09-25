import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { useApp } from '@/context/AppContext'
import { getModels } from '@/data/priceList'
import { formatVnd } from '@/lib/utils'
import type { TradeInStatus } from '@/types'

const STATUSES: TradeInStatus[] = [
  'Nháp',
  'Chờ kỹ thuật',
  'Đang kiểm tra',
  'Đã định giá',
  'Chờ khách',
  'Khách từ chối',
  'Chờ thu ngân',
  'Đã thu',
  'Đã nhập kho',
]

function detailPath(id: string, status: TradeInStatus, preferAction?: 'tech' | 'cashier') {
  if (preferAction === 'tech') return `/inspection/${id}`
  if (preferAction === 'cashier') return `/cashier/${id}`
  if (status === 'Chờ kỹ thuật' || status === 'Đang kiểm tra') return `/inspection/${id}`
  if (status === 'Chờ thu ngân') return `/cashier/${id}`
  if (status === 'Chờ khách' || status === 'Đã định giá') return `/trade-in/${id}/quotation`
  return `/trade-in/${id}`
}

export function TradeInListPage({
  statusFilter,
  title,
  preferAction,
}: {
  statusFilter?: TradeInStatus[]
  title?: string
  preferAction?: 'tech' | 'cashier'
}) {
  const { records } = useApp()
  const [q, setQ] = useState('')
  const [model, setModel] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter && !statusFilter.includes(r.status)) return false
      if (status && r.status !== status) return false
      if (model && r.device.model !== model) return false
      if (from && r.createdAt.slice(0, 10) < from) return false
      if (to && r.createdAt.slice(0, 10) > to) return false
      const hay = `${r.id} ${r.customer.name} ${r.customer.phone} ${r.origin.imei ?? ''} ${r.device.model}`.toLowerCase()
      if (q && !hay.includes(q.toLowerCase().replace(/\s/g, ''))) {
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [records, q, model, status, from, to, statusFilter])

  return (
    <div className="space-y-4">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-2 xl:grid-cols-5">
          <Input
            placeholder="Tìm tên / SĐT / IMEI / mã hồ sơ"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">Tất cả model</option>
            {getModels().map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          {!statusFilter && (
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          )}
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-5">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="pb-2 font-medium">Mã</th>
                <th className="pb-2 font-medium">Khách</th>
                <th className="pb-2 font-medium">Máy</th>
                <th className="pb-2 text-right font-medium">Giá chuẩn</th>
                <th className="pb-2 text-right font-medium">Giá thu</th>
                <th className="pb-2 font-medium">Trạng thái</th>
                <th className="pb-2 font-medium">Người xử lý</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/70 hover:bg-slate-50">
                  <td className="py-3">
                    <Link
                      className="font-medium text-brand hover:underline"
                      to={detailPath(r.id, r.status, preferAction)}
                    >
                      {r.id}
                    </Link>
                  </td>
                  <td className="py-3">
                    <div>{r.customer.name}</div>
                    <div className="text-xs text-muted">{r.customer.phone}</div>
                  </td>
                  <td className="py-3">
                    {r.device.model} {r.device.storage}
                    <div className="text-xs text-muted">{r.device.color}</div>
                  </td>
                  <td className="py-3 text-right">{formatVnd(r.standardPrice)}</td>
                  <td className="py-3 text-right font-semibold text-brand">
                    {formatVnd(r.finalPrice ?? r.estimatedPrice)}
                  </td>
                  <td className="py-3">
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                  </td>
                  <td className="py-3">{r.handler}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted">Không có hồ sơ phù hợp</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
