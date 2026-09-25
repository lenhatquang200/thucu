import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { formatVnd } from '@/lib/utils'

const chartData = [
  { day: '29/08', count: 8 },
  { day: '30/08', count: 11 },
  { day: '31/08', count: 7 },
  { day: '01/09', count: 10 },
  { day: '02/09', count: 14 },
  { day: '03/09', count: 9 },
  { day: '04/09', count: 12 },
]

export function DashboardPage() {
  const { records } = useApp()
  const latest = [...records].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
  const waitingTech = records.filter((r) => r.status === 'Chờ kỹ thuật' || r.status === 'Đang kiểm tra').length
  const waitingCustomer = records.filter((r) => r.status === 'Chờ khách' || r.status === 'Đã định giá').length
  const done = records.filter((r) => r.status === 'Đã thu' || r.status === 'Đã nhập kho').length
  const todayValue = records
    .filter((r) => r.status === 'Đã thu' || r.status === 'Đã nhập kho')
    .reduce((s, r) => s + (r.finalPrice ?? 0), 0)

  const cards = [
    { label: 'Máy tiếp nhận hôm nay', value: '12' },
    { label: 'Chờ kỹ thuật kiểm tra', value: String(waitingTech) },
    { label: 'Chờ khách xác nhận', value: String(waitingCustomer) },
    { label: 'Đã thu thành công', value: String(done) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-5">
              <div className="text-sm text-muted">{c.label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="text-sm text-muted">Tổng giá trị thu hôm nay</div>
          <div className="mt-2 text-3xl font-bold text-brand">{formatVnd(todayValue || 82500000)}</div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Số máy thu 7 ngày gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f4c81" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ mới nhất</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-2 font-medium">Mã</th>
                  <th className="pb-2 font-medium">Máy</th>
                  <th className="pb-2 font-medium">Khách hàng</th>
                  <th className="pb-2 text-right font-medium">Giá dự kiến</th>
                  <th className="pb-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((r) => (
                  <tr key={r.id} className="border-b border-border/70">
                    <td className="py-3">
                      <Link className="font-medium text-brand hover:underline" to={`/trade-in/${r.id}`}>
                        {r.id}
                      </Link>
                    </td>
                    <td className="py-3">
                      {r.device.model} {r.device.storage}
                    </td>
                    <td className="py-3">{r.customer.name}</td>
                    <td className="py-3 text-right font-semibold">{formatVnd(r.estimatedPrice)}</td>
                    <td className="py-3">
                      <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
