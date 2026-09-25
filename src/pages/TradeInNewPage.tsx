import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Stepper } from '@/components/ui/Stepper'
import { useApp } from '@/context/AppContext'
import { lookupCustomer, normalizePhone } from '@/data/customers'
import {
  findStandardPrice,
  getColors,
  getModels,
  getStorages,
  getTypes,
} from '@/data/priceList'
import { createDefaultFeatures, marketabilityFor, within30Days } from '@/lib/pricing'
import { formatVnd, genId, nowTime } from '@/lib/utils'
import type {
  CustomerType,
  DeviceType,
  OriginInfo,
  TradeInRecord,
  TransactionType,
} from '@/types'

const STEPS = ['Thông tin khách', 'Thiết bị', 'Nguồn máy', 'Hình thức giao dịch', 'Xác nhận']

export function TradeInNewPage() {
  const navigate = useNavigate()
  const { staffName, upsertRecord } = useApp()
  const [step, setStep] = useState(0)

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [customerType, setCustomerType] = useState<CustomerType>('Khách thường')
  const [note, setNote] = useState('')
  const [purchaseCount, setPurchaseCount] = useState<number | undefined>()

  const [model, setModel] = useState('')
  const [storage, setStorage] = useState('')
  const [color, setColor] = useState('')
  const [type, setType] = useState<DeviceType | ''>('')

  const [boughtAt, setBoughtAt] = useState<boolean | null>(null)
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseKind, setPurchaseKind] = useState<'Máy mới' | 'Máy qua sử dụng'>('Máy mới')
  const [invoicePrice, setInvoicePrice] = useState('')
  const [invoiceCode, setInvoiceCode] = useState('')
  const [imei, setImei] = useState('')

  const [tx, setTx] = useState<TransactionType>('Bán đứt')

  const found = useMemo(() => lookupCustomer(phone), [phone])
  const standardPrice = model && storage && color && type ? findStandardPrice(model, storage, color, type) : null
  const marketability = model ? marketabilityFor(model) : 'Chưa cấu hình'

  function onPhoneBlur() {
    const c = lookupCustomer(phone)
    if (c) {
      setName(c.name)
      setCustomerType(c.type)
      setPurchaseCount(c.purchaseCount)
    }
  }

  function buildOrigin(): OriginInfo {
    if (!boughtAt) return { boughtAtItamloan: false }
    return {
      boughtAtItamloan: true,
      purchaseDate,
      purchaseKind,
      invoicePrice: invoicePrice ? Number(invoicePrice) : undefined,
      invoiceCode,
      imei,
    }
  }

  function buildRecord(status: TradeInRecord['status']): TradeInRecord {
    const id = genId()
    return {
      id,
      customer: {
        phone: normalizePhone(phone),
        name,
        type: customerType,
        note,
        purchaseCount,
      },
      device: {
        model,
        storage,
        color,
        type: type as DeviceType,
        marketability,
      },
      origin: buildOrigin(),
      transactionType: tx,
      inspection: {
        exterior: null,
        exteriorNote: '',
        batteryType: null,
        batteryHealth: null,
        features: createDefaultFeatures(),
        isOriginal: null,
        techNote: '',
      },
      standardPrice: standardPrice ?? 0,
      estimatedPrice: null,
      finalPrice: null,
      status,
      handler: staffName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: 't1',
          at: nowTime(),
          actor: staffName,
          action: status === 'Nháp' ? 'Lưu nháp' : 'Tiếp nhận máy',
        },
      ],
    }
  }

  function save(status: TradeInRecord['status']) {
    if (!phone || !name || !model || !storage || !color || !type || boughtAt === null) return
    const record = buildRecord(status)
    upsertRecord(record)
    navigate(`/trade-in/${record.id}`)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <Field>
              <Label>Số điện thoại *</Label>
              <Input
                value={phone}
                placeholder="0909 123 456"
                onChange={(e) => setPhone(e.target.value)}
                onBlur={onPhoneBlur}
              />
            </Field>
            {found && (
              <div className="mb-4 rounded-lg border border-brand/20 bg-brand-light p-4">
                <div className="font-semibold text-brand">{found.name}</div>
                <div className="mt-1 text-sm text-slate-700">{found.type}</div>
                <div className="text-sm text-muted">Đã mua {found.purchaseCount} sản phẩm</div>
              </div>
            )}
            <Field>
              <Label>Tên khách hàng</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field>
              <Label>Loại khách hàng</Label>
              <Select value={customerType} onChange={(e) => setCustomerType(e.target.value as CustomerType)}>
                <option>Khách thường</option>
                <option>Khách thân thiết</option>
              </Select>
              {customerType === 'Khách thân thiết' && (
                <p className="mt-2 text-xs text-muted">Điều chỉnh giá khách thân thiết: Chưa cấu hình</p>
              )}
            </Field>
            <Field>
              <Label>Ghi chú</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin máy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <Label>Model *</Label>
                <Select
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value)
                    setStorage('')
                    setColor('')
                    setType('')
                  }}
                >
                  <option value="">Chọn model</option>
                  {getModels().map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label>Dung lượng *</Label>
                <Select
                  value={storage}
                  disabled={!model}
                  onChange={(e) => {
                    setStorage(e.target.value)
                    setColor('')
                    setType('')
                  }}
                >
                  <option value="">Chọn dung lượng</option>
                  {getStorages(model).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label>Màu *</Label>
                <Select
                  value={color}
                  disabled={!storage}
                  onChange={(e) => {
                    setColor(e.target.value)
                    setType('')
                  }}
                >
                  <option value="">Chọn màu</option>
                  {getColors(model, storage).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label>Loại *</Label>
                <Select value={type} disabled={!color} onChange={(e) => setType(e.target.value as DeviceType)}>
                  <option value="">Chọn loại</option>
                  {getTypes(model, storage, color).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {standardPrice != null && (
              <div className="mt-2 rounded-xl border border-brand/30 bg-brand-light p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-brand">Giá thu chuẩn</div>
                <div className="mt-1 text-3xl font-bold text-brand">{formatVnd(standardPrice)}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                  <Badge tone="brand">Máy 99</Badge>
                  <Badge tone="brand">Pin ≥ 95%</Badge>
                  <Badge tone="brand">Full tính năng</Badge>
                </div>
              </div>
            )}

            {model && (
              <div className="mt-4 rounded-lg border border-border p-4">
                <div className="text-sm text-muted">Khả năng bán lại</div>
                <div className="mt-1 font-semibold">
                  {model} — {marketability}
                </div>
                {marketability !== 'Chưa cấu hình' && (
                  <p className="mt-1 text-xs text-muted">Mức cộng/trừ theo khả năng bán lại: Chưa cấu hình</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Nguồn gốc máy</CardTitle>
          </CardHeader>
          <CardContent>
            <Field>
              <Label>Máy này có mua tại iTamLoan?</Label>
              <div className="flex gap-3">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setBoughtAt(v)}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                      boughtAt === v ? 'border-brand bg-brand-light text-brand' : 'border-border'
                    }`}
                  >
                    {v ? 'Có' : 'Không'}
                  </button>
                ))}
              </div>
            </Field>

            {boughtAt && (
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                <Field>
                  <Label>Ngày mua</Label>
                  <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                  {within30Days(purchaseDate) && (
                    <div className="mt-2">
                      <Badge tone="success">Trong chính sách 30 ngày</Badge>
                    </div>
                  )}
                </Field>
                <Field>
                  <Label>Loại máy lúc mua</Label>
                  <Select
                    value={purchaseKind}
                    onChange={(e) => setPurchaseKind(e.target.value as 'Máy mới' | 'Máy qua sử dụng')}
                  >
                    <option>Máy mới</option>
                    <option>Máy qua sử dụng</option>
                  </Select>
                </Field>
                <Field>
                  <Label>Giá trên hóa đơn</Label>
                  <Input
                    type="number"
                    value={invoicePrice}
                    onChange={(e) => setInvoicePrice(e.target.value)}
                    placeholder="28990000"
                  />
                </Field>
                <Field>
                  <Label>Mã hóa đơn</Label>
                  <Input value={invoiceCode} onChange={(e) => setInvoiceCode(e.target.value)} />
                </Field>
                <Field className="md:col-span-2">
                  <Label>IMEI</Label>
                  <Input value={imei} onChange={(e) => setImei(e.target.value)} />
                </Field>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Hình thức giao dịch</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {(
              [
                { value: 'Bán đứt' as const, desc: 'Thu máy, thanh toán tiền mặt' },
                { value: 'Thu đổi máy mới' as const, desc: '+300.000 ₫' },
                { value: 'Thu đổi máy cũ' as const, desc: '+500.000 ₫' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTx(opt.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  tx === opt.value ? 'border-brand bg-brand-light ring-2 ring-brand/20' : 'border-border hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold">{opt.value === 'Thu đổi máy cũ' ? 'Thu đổi lấy máy qua sử dụng' : opt.value === 'Thu đổi máy mới' ? 'Thu đổi lấy máy mới' : opt.value}</div>
                <div className="mt-1 text-sm text-muted">{opt.desc}</div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Xác nhận hồ sơ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Khách hàng" value={`${name} — ${phone}`} />
              <Info label="Loại khách" value={customerType} />
              <Info label="Máy" value={`${model} ${storage} ${color}`} />
              <Info label="Loại máy" value={type || '—'} />
              <Info label="Giá chuẩn" value={formatVnd(standardPrice)} />
              <Info label="Mua tại iTamLoan" value={boughtAt ? 'Có' : 'Không'} />
              <Info
                label="Giao dịch"
                value={
                  tx === 'Thu đổi máy cũ'
                    ? 'Thu đổi lấy máy qua sử dụng'
                    : tx === 'Thu đổi máy mới'
                      ? 'Thu đổi lấy máy mới'
                      : tx
                }
              />
              <Info label="Khả năng bán lại" value={marketability} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Quay lại
        </Button>
        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 0 && (!phone || !name)) ||
                (step === 1 && (!model || !storage || !color || !type)) ||
                (step === 2 && boughtAt === null)
              }
            >
              Tiếp tục
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => save('Nháp')}>
                Lưu nháp
              </Button>
              <Button onClick={() => save('Chờ kỹ thuật')}>Chuyển cho kỹ thuật</Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  )
}
