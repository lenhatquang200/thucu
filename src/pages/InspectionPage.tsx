import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PricingPanel } from '@/components/pricing/PricingPanel'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Label, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Stepper } from '@/components/ui/Stepper'
import { useApp } from '@/context/AppContext'
import { calculatePricing, within30Days } from '@/lib/pricing'
import { cn, formatSignedVnd, formatVnd, nowTime } from '@/lib/utils'
import type { BatteryType, ExteriorGrade, FeatureStatus, InspectionInfo } from '@/types'

const STEPS = ['Ngoại hình', 'Pin', 'Tính năng', 'Zin / sửa chữa', 'Kết quả']

const EXTERIOR: { value: ExteriorGrade; desc: string }[] = [
  { value: '99', desc: 'Không trừ giá' },
  { value: '98', desc: '-5%' },
  { value: '97', desc: '-10%' },
  { value: 'Máy xấu', desc: '-20%' },
  { value: 'Máy xác', desc: 'Từ 10% giá chuẩn' },
]

function batteryHint(type: BatteryType | null, health: number | null) {
  if (type === 'Pin đã thay') return 'Pin bên thứ ba / đã thay — Chưa cấu hình mức trừ cụ thể theo giá máy'
  if (type !== 'Pin zin' || health == null) return null
  if (health >= 95) return '95% trở lên — Không trừ'
  if (health >= 90) return '90–94% — -500.000 ₫'
  if (health >= 87) return '87–89% — -800.000 ₫'
  return 'Dưới 86% — -1.000.000 ₫'
}

export function InspectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecord, upsertRecord, staffName } = useApp()
  const record = getRecord(id!)

  const [step, setStep] = useState(0)
  const [doneOpen, setDoneOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const [inspection, setInspection] = useState<InspectionInfo>(
    () =>
      record?.inspection ?? {
        exterior: null,
        exteriorNote: '',
        batteryType: null,
        batteryHealth: null,
        features: [],
        isOriginal: null,
        techNote: '',
      },
  )

  const pricing = useMemo(() => {
    if (!record) return null
    return calculatePricing(record.standardPrice, record.transactionType, record.origin, inspection)
  }, [record, inspection])

  if (!record) {
    return <div>Không tìm thấy hồ sơ</div>
  }

  const current = record
  const estimated = pricing?.estimatedPrice ?? current.standardPrice
  const delta = estimated - current.standardPrice

  function patch(partial: Partial<InspectionInfo>) {
    setInspection((prev) => ({ ...prev, ...partial }))
  }

  function setFeature(key: string, status: FeatureStatus) {
    setInspection((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.key === key ? { ...f, status } : f)),
    }))
  }

  function saveDraft() {
    upsertRecord({
      ...current,
      inspection,
      status: current.status === 'Chờ kỹ thuật' ? 'Đang kiểm tra' : current.status,
      handler: staffName,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...current.timeline,
        ...(current.status === 'Chờ kỹ thuật'
          ? [{ id: `t-${Date.now()}`, at: nowTime(), actor: staffName, action: 'Bắt đầu kiểm tra' }]
          : []),
      ],
    })
  }

  function complete() {
    if (!pricing) return
    const next = {
      ...current,
      inspection,
      estimatedPrice: pricing.estimatedPrice,
      status: 'Chờ khách' as const,
      handler: staffName,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...current.timeline,
        {
          id: `t-${Date.now()}`,
          at: nowTime(),
          actor: staffName,
          action: 'Hoàn tất kiểm tra',
          detail: `Giá đề xuất ${formatVnd(pricing.estimatedPrice)}`,
        },
      ],
    }
    upsertRecord(next)
    setDoneOpen(true)
  }

  return (
    <div className="relative">
      <div className="sticky top-16 z-30 -mx-4 mb-4 border-b border-brand/20 bg-brand text-white shadow-md md:-mx-6">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left md:px-6"
          onClick={() => setPriceOpen((v) => !v)}
        >
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide text-white/80">
              Giá thu dự kiến
            </div>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold tabular-nums">{formatVnd(estimated)}</span>
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  delta < 0 ? 'text-red-200' : delta > 0 ? 'text-emerald-200' : 'text-white/70',
                )}
              >
                {delta === 0 ? 'Không đổi' : formatSignedVnd(delta)}
              </span>
            </div>
            <div className="mt-0.5 truncate text-xs text-white/70">
              Chuẩn {formatVnd(current.standardPrice)} · {current.device.model} {current.device.storage}
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs">
            Chi tiết
            {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>
        {priceOpen && pricing && (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto border-t border-white/15 bg-brand-dark px-4 py-3 md:px-6">
            {pricing.lines.map((line, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-white/80">{line.label}</span>
                <span
                  className={cn(
                    'shrink-0 font-medium tabular-nums',
                    line.kind === 'add' && 'text-emerald-200',
                    line.kind === 'sub' && 'text-red-200',
                    line.kind === 'base' && 'text-white',
                    line.kind === 'note' && 'text-white/60',
                  )}
                >
                  {line.kind === 'note' && line.label.includes('Chưa cấu hình')
                    ? 'Chưa cấu hình'
                    : line.kind === 'base'
                      ? formatVnd(line.amount)
                      : line.kind === 'note'
                        ? '0 ₫'
                        : formatSignedVnd(line.amount)}
                </span>
              </div>
            ))}
            <p className="pt-1 text-[11px] leading-relaxed text-white/60">{pricing.disclaimer}</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-white p-4 sm:p-5">
            <div>
              <div className="text-sm text-muted">{current.id}</div>
              <div className="mt-1 text-xl font-bold">{current.device.model}</div>
              <div className="mt-1 text-sm text-slate-600">
                {current.device.storage} · {current.device.color}
              </div>
              <div className="mt-3 text-sm">
                Giá chuẩn <span className="text-lg font-bold text-brand">{formatVnd(current.standardPrice)}</span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-slate-700">
              <div>
                Khách: <strong>{current.customer.name}</strong>
              </div>
              <div>
                Máy mua tại iTamLoan: <strong>{current.origin.boughtAtItamloan ? 'Có' : 'Không'}</strong>
              </div>
              {current.origin.purchaseDate && (
                <div>
                  Ngày mua: <strong>{new Date(current.origin.purchaseDate).toLocaleDateString('vi-VN')}</strong>
                  {within30Days(current.origin.purchaseDate) && (
                    <Badge className="ml-2" tone="success">
                      Trong chính sách 30 ngày
                    </Badge>
                  )}
                </div>
              )}
              <div>
                Giao dịch:{' '}
                <strong>
                  {current.transactionType === 'Thu đổi máy cũ'
                    ? 'Thu đổi máy qua sử dụng'
                    : current.transactionType}
                </strong>
              </div>
            </div>
          </div>

          <Stepper steps={STEPS} current={step} />

          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ngoại hình</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
                  {EXTERIOR.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => patch({ exterior: opt.value })}
                      className={cn(
                        'rounded-xl border p-4 text-left sm:p-5',
                        inspection.exterior === opt.value
                          ? 'border-brand bg-brand-light ring-2 ring-brand/20'
                          : 'border-border hover:bg-slate-50',
                      )}
                    >
                      <div className="text-xl font-bold sm:text-2xl">{opt.value}</div>
                      <div className="mt-1 text-xs text-muted sm:text-sm">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <Field className="mt-4">
                  <Label>Ghi chú ngoại hình</Label>
                  <Textarea
                    value={inspection.exteriorNote}
                    onChange={(e) => patch({ exteriorNote: e.target.value })}
                  />
                </Field>
                <div>
                  <Label>Hình ảnh thiết bị</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {['Upload ảnh mặt trước', 'Upload ảnh mặt sau', 'Upload ảnh cạnh máy'].map((label) => (
                      <div
                        key={label}
                        className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 text-center text-sm text-muted"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Kiểm tra pin</CardTitle>
              </CardHeader>
              <CardContent>
                <Field>
                  <Label>Loại pin</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Pin zin', 'Pin đã thay'] as BatteryType[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() =>
                          patch({
                            batteryType: v,
                            batteryHealth: v === 'Pin đã thay' ? null : inspection.batteryHealth ?? 91,
                          })
                        }
                        className={cn(
                          'rounded-lg border px-4 py-3 text-sm font-medium',
                          inspection.batteryType === v
                            ? 'border-brand bg-brand-light text-brand'
                            : 'border-border',
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </Field>
                {inspection.batteryType === 'Pin zin' && (
                  <Field>
                    <Label>Dung lượng pin (%)</Label>
                    <input
                      type="range"
                      min={70}
                      max={100}
                      value={inspection.batteryHealth ?? 91}
                      onChange={(e) => patch({ batteryHealth: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="mt-2 text-2xl font-bold text-brand">{inspection.batteryHealth ?? 91}%</div>
                  </Field>
                )}
                {batteryHint(inspection.batteryType, inspection.batteryHealth) && (
                  <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {batteryHint(inspection.batteryType, inspection.batteryHealth)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Checklist tính năng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-3 sm:p-5">
                {inspection.features.map((f) => (
                  <div
                    key={f.key}
                    className={cn(
                      'rounded-xl border p-3 sm:p-4',
                      f.status === 'fail' ? 'border-red-200 bg-red-50/60' : 'border-border bg-white',
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 font-medium text-slate-900">{f.label}</div>
                      <span
                        className={cn(
                          'shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold',
                          f.status === 'fail' ? 'bg-red-100 text-danger' : 'bg-slate-100 text-muted',
                        )}
                      >
                        {f.impact}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFeature(f.key, 'ok')}
                        className={cn(
                          'rounded-lg border px-3 py-3 text-sm font-semibold transition',
                          f.status === 'ok'
                            ? 'border-success bg-green-100 text-success'
                            : 'border-border bg-white text-slate-600',
                        )}
                      >
                        Tốt
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeature(f.key, 'fail')}
                        className={cn(
                          'rounded-lg border px-3 py-3 text-sm font-semibold transition',
                          f.status === 'fail'
                            ? 'border-danger bg-red-100 text-danger'
                            : 'border-border bg-white text-slate-600',
                        )}
                      >
                        Lỗi
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Máy còn zin?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { v: true, label: 'Còn zin' },
                    { v: false, label: 'Đã sửa chữa' },
                  ].map((opt) => (
                    <button
                      key={String(opt.v)}
                      type="button"
                      onClick={() => patch({ isOriginal: opt.v })}
                      className={cn(
                        'rounded-xl border p-5 text-left',
                        inspection.isOriginal === opt.v
                          ? 'border-brand bg-brand-light ring-2 ring-brand/20'
                          : 'border-border',
                      )}
                    >
                      <div className="font-semibold">{opt.label}</div>
                      {!opt.v && <div className="mt-1 text-sm text-danger">Ảnh hưởng giá: -20%</div>}
                    </button>
                  ))}
                </div>
                <Field className="mt-4">
                  <Label>Ghi chú kỹ thuật</Label>
                  <Textarea
                    value={inspection.techNote}
                    onChange={(e) => patch({ techNote: e.target.value })}
                  />
                </Field>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Kết quả kiểm tra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-muted">Ngoại hình</div>
                    <div className="font-semibold">{inspection.exterior ?? '—'}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-muted">Pin</div>
                    <div className="font-semibold">
                      {inspection.batteryType ?? '—'}
                      {inspection.batteryHealth != null ? ` · ${inspection.batteryHealth}%` : ''}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-muted">Tính năng lỗi</div>
                    <div className="font-semibold">
                      {inspection.features.filter((f) => f.status === 'fail').map((f) => f.label).join(', ') ||
                        'Không có'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-muted">Zin / sửa chữa</div>
                    <div className="font-semibold">
                      {inspection.isOriginal == null ? '—' : inspection.isOriginal ? 'Còn zin' : 'Đã sửa chữa'}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-brand/30 bg-brand-light p-4">
                  <div className="text-xs uppercase text-brand">Giá thu dự kiến</div>
                  <div className="text-3xl font-bold text-brand">{formatVnd(pricing?.estimatedPrice)}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex flex-wrap justify-between gap-3 pb-20 xl:pb-0">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Quay lại
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={saveDraft}>
                Lưu kiểm tra
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>Tiếp tục</Button>
              ) : (
                <Button onClick={complete}>Hoàn tất kiểm tra</Button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="xl:sticky xl:top-40">
            <PricingPanel
              standardPrice={current.standardPrice}
              transactionType={current.transactionType}
              origin={current.origin}
              inspection={inspection}
            />
          </div>
        </div>
      </div>

      <Modal open={doneOpen} title="Đã hoàn tất kiểm tra" onClose={() => navigate(`/trade-in/${current.id}/quotation`)}>
        <p className="text-sm text-slate-600">Hồ sơ chuyển sang: Chờ nhân viên kinh doanh báo giá</p>
        <div className="mt-4 rounded-xl bg-brand-light p-4">
          <div className="text-xs uppercase text-brand">Giá đề xuất</div>
          <div className="text-2xl font-bold text-brand">{formatVnd(pricing?.estimatedPrice)}</div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(`/trade-in/${current.id}`)}>
            Xem hồ sơ
          </Button>
          <Link to={`/trade-in/${current.id}/quotation`}>
            <Button>Sang báo giá</Button>
          </Link>
        </div>
      </Modal>
    </div>
  )
}
