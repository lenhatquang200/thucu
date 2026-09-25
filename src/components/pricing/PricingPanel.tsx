import { calculatePricing } from '@/lib/pricing'
import { formatSignedVnd, formatVnd } from '@/lib/utils'
import type { InspectionInfo, OriginInfo, TransactionType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function PricingPanel({
  standardPrice,
  transactionType,
  origin,
  inspection,
}: {
  standardPrice: number
  transactionType: TransactionType
  origin: OriginInfo
  inspection: InspectionInfo
}) {
  const result = calculatePricing(standardPrice, transactionType, origin, inspection)

  return (
    <Card className="sticky top-4 border-brand/20">
      <CardHeader className="bg-brand text-white">
        <CardTitle className="text-white">Định giá dự kiến</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {result.lines.map((line, i) => (
          <div key={i} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-600">{line.label}</span>
            <span
              className={
                line.kind === 'base'
                  ? 'font-semibold text-slate-900'
                  : line.kind === 'add'
                    ? 'font-medium text-success'
                    : line.kind === 'sub'
                      ? 'font-medium text-danger'
                      : 'text-muted'
              }
            >
              {line.kind === 'note' && line.amount === 0
                ? line.label.includes('Chưa cấu hình')
                  ? 'Chưa cấu hình'
                  : '0 ₫'
                : line.kind === 'base'
                  ? formatVnd(line.amount)
                  : formatSignedVnd(line.amount)}
            </span>
          </div>
        ))}
        <div className="border-t border-border pt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Giá thu dự kiến</div>
          <div className="mt-1 text-2xl font-bold text-brand">{formatVnd(result.estimatedPrice)}</div>
        </div>
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          {result.disclaimer}
        </p>
      </CardContent>
    </Card>
  )
}
