import type {
  ExteriorGrade,
  FeatureCheck,
  InspectionInfo,
  OriginInfo,
  PricingResult,
  TransactionType,
} from '@/types'

export const FEATURE_TEMPLATE: Omit<FeatureCheck, 'status'>[] = [
  { key: 'screen', label: 'Màn hình & cảm ứng', impact: '-50%', percent: 50 },
  { key: 'faceid', label: 'Face ID', impact: '-30% nhóm', percent: 30 },
  { key: 'cam_front', label: 'Camera trước', impact: '-30% nhóm', percent: 30 },
  { key: 'cam_rear', label: 'Camera sau', impact: '-20%', percent: 20 },
  { key: 'speaker', label: 'Loa', impact: '-5%', percent: 5 },
  { key: 'ringtone', label: 'Chuông', impact: '-5%', percent: 5 },
  { key: 'haptic', label: 'Rung', impact: '-10%', percent: 10 },
  { key: 'buttons', label: 'Phím bấm', impact: '-20%', percent: 20 },
  { key: 'cable_charge', label: 'Sạc cáp', impact: '-20%', percent: 20 },
  { key: 'main_charge', label: 'Sạc main', impact: '-50%', percent: 50 },
  { key: 'signal', label: 'Sóng / IMEI', impact: '-50%', percent: 50 },
  { key: 'wifi', label: 'WiFi', impact: '-50%', percent: 50 },
  { key: 'bluetooth', label: 'Bluetooth', impact: '-50%', percent: 50 },
]

export function createDefaultFeatures(): FeatureCheck[] {
  return FEATURE_TEMPLATE.map((f) => ({ ...f, status: null }))
}

function exteriorAdjustment(grade: ExteriorGrade | null, base: number) {
  if (!grade) return null
  if (grade === '99') return { label: 'Ngoại hình 99', amount: 0 }
  if (grade === '98') return { label: 'Ngoại hình 98', amount: -Math.round(base * 0.05) }
  if (grade === '97') return { label: 'Ngoại hình 97', amount: -Math.round(base * 0.1) }
  if (grade === 'Máy xấu') return { label: 'Máy xấu', amount: -Math.round(base * 0.2) }
  if (grade === 'Máy xác') return { label: 'Máy xác (demo từ 10% giá chuẩn)', amount: -(base - Math.round(base * 0.1)) }
  return null
}

function batteryAdjustment(inspection: InspectionInfo) {
  if (!inspection.batteryType) return null
  if (inspection.batteryType === 'Pin đã thay') {
    return { label: 'Pin bên thứ ba / đã thay', amount: 0, note: 'Chưa cấu hình' }
  }
  const h = inspection.batteryHealth
  if (h == null) return null
  if (h >= 95) return { label: `Pin ${h}%`, amount: 0 }
  if (h >= 90) return { label: `Pin ${h}%`, amount: -500000 }
  if (h >= 87) return { label: `Pin ${h}%`, amount: -800000 }
  return { label: `Pin ${h}%`, amount: -1000000 }
}

function transactionAdjustment(type: TransactionType) {
  if (type === 'Thu đổi máy mới') return { label: 'Thu đổi máy mới', amount: 300000 }
  if (type === 'Thu đổi máy cũ') return { label: 'Thu đổi máy qua sử dụng', amount: 500000 }
  return null
}

function originAdjustment(origin: OriginInfo) {
  if (!origin.boughtAtItamloan) return null
  if (!origin.purchaseDate) {
    return { label: 'Máy mua tại iTamLoan', amount: 500000 }
  }
  const bought = new Date(origin.purchaseDate)
  const now = new Date()
  const days = Math.floor((now.getTime() - bought.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 30) {
    return { label: 'Máy mua tại iTamLoan (≤30 ngày)', amount: 500000 }
  }
  return { label: 'Máy mua tại iTamLoan (>30 ngày)', amount: 500000 }
}

function featureAdjustments(features: FeatureCheck[], base: number) {
  const lines: { label: string; amount: number }[] = []
  const failed = features.filter((f) => f.status === 'fail')
  const faceGroup = failed.filter((f) => f.key === 'faceid' || f.key === 'cam_front')
  const others = failed.filter((f) => f.key !== 'faceid' && f.key !== 'cam_front')

  if (faceGroup.length) {
    lines.push({
      label: faceGroup.map((f) => f.label).join(' + ') + ' lỗi',
      amount: -Math.round(base * 0.3),
    })
  }

  for (const f of others) {
    if (f.percent == null) continue
    lines.push({
      label: `${f.label} lỗi`,
      amount: -Math.round(base * (f.percent / 100)),
    })
  }

  return lines
}

export function calculatePricing(
  standardPrice: number,
  transactionType: TransactionType,
  origin: OriginInfo,
  inspection: InspectionInfo,
): PricingResult {
  const lines: PricingResult['lines'] = [
    { label: 'Giá chuẩn', amount: standardPrice, kind: 'base' },
  ]

  const originAdj = originAdjustment(origin)
  if (originAdj) {
    lines.push({
      label: originAdj.label,
      amount: originAdj.amount,
      kind: originAdj.amount >= 0 ? 'add' : 'sub',
    })
  }

  const txAdj = transactionAdjustment(transactionType)
  if (txAdj) {
    lines.push({ label: txAdj.label, amount: txAdj.amount, kind: 'add' })
  }

  const bat = batteryAdjustment(inspection)
  if (bat) {
    if ('note' in bat && bat.note) {
      lines.push({ label: `${bat.label} — ${bat.note}`, amount: 0, kind: 'note' })
    } else if (bat.amount !== 0) {
      lines.push({ label: bat.label, amount: bat.amount, kind: 'sub' })
    } else {
      lines.push({ label: bat.label, amount: 0, kind: 'note' })
    }
  }

  const ext = exteriorAdjustment(inspection.exterior, standardPrice)
  if (ext) {
    if (ext.amount === 0) {
      lines.push({ label: ext.label + ' — không trừ giá', amount: 0, kind: 'note' })
    } else {
      lines.push({ label: ext.label, amount: ext.amount, kind: 'sub' })
    }
  }

  for (const f of featureAdjustments(inspection.features, standardPrice)) {
    lines.push({ label: f.label, amount: f.amount, kind: 'sub' })
  }

  if (inspection.isOriginal === false) {
    lines.push({
      label: 'Máy đã sửa chữa',
      amount: -Math.round(standardPrice * 0.2),
      kind: 'sub',
    })
  }

  const estimatedPrice = Math.max(
    0,
    lines.reduce((sum, l) => {
      if (l.kind === 'base') return sum + l.amount
      if (l.kind === 'note') return sum
      return sum + l.amount
    }, 0),
  )

  return {
    standardPrice,
    lines,
    estimatedPrice,
    disclaimer:
      'Giá demo được tính theo rule mô phỏng. Công thức chính thức cần xác nhận trước khi triển khai backend.',
  }
}

export function within30Days(dateStr?: string) {
  if (!dateStr) return false
  const bought = new Date(dateStr)
  const now = new Date()
  const days = Math.floor((now.getTime() - bought.getTime()) / (1000 * 60 * 60 * 24))
  return days >= 0 && days <= 30
}

export function marketabilityFor(model: string) {
  if (model.includes('17') || model.includes('16 Pro')) return 'Dễ bán' as const
  if (model.includes('15 Pro')) return 'Trung bình' as const
  return 'Chưa cấu hình' as const
}
