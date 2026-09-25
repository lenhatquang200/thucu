export type Role = 'Kinh doanh' | 'Kỹ thuật' | 'Thu ngân' | 'Kho' | 'Quản lý'

export type TradeInStatus =
  | 'Nháp'
  | 'Chờ kỹ thuật'
  | 'Đang kiểm tra'
  | 'Đã định giá'
  | 'Chờ khách'
  | 'Khách từ chối'
  | 'Chờ thu ngân'
  | 'Đã thu'
  | 'Đã nhập kho'

export type CustomerType = 'Khách thường' | 'Khách thân thiết'
export type DeviceType = 'Chính hãng' | 'Quốc tế'
export type TransactionType = 'Bán đứt' | 'Thu đổi máy mới' | 'Thu đổi máy cũ'
export type ExteriorGrade = '99' | '98' | '97' | 'Máy xấu' | 'Máy xác'
export type BatteryType = 'Pin zin' | 'Pin đã thay'
export type Marketability = 'Dễ bán' | 'Trung bình' | 'Khó bán' | 'Chưa cấu hình'
export type WarehouseAction = 'Chờ phân loại' | 'Vệ sinh' | 'Cài đặt' | 'Sửa chữa' | 'Sẵn sàng bán' | 'Bán xả'
export type FeatureStatus = 'ok' | 'fail' | null

export type AdjustmentType = 'Cộng tiền' | 'Trừ tiền' | 'Cộng %' | 'Trừ %'
export type RuleGroup = 'Khách hàng' | 'Nguồn máy' | 'Thu đổi' | 'Pin' | 'Ngoại hình' | 'Tính năng'

export interface PriceItem {
  id: string
  model: string
  type: DeviceType
  storage: string
  color: string
  condition: string
  battery: string
  price: number
}

export interface PricingRule {
  id: string
  name: string
  group: RuleGroup
  condition: string
  adjustmentType: AdjustmentType
  value: number
  active: boolean
}

export interface FeatureCheck {
  key: string
  label: string
  impact: string
  percent?: number
  status: FeatureStatus
}

export interface PriceLine {
  label: string
  amount: number
  kind: 'base' | 'add' | 'sub' | 'note'
}

export interface PricingResult {
  standardPrice: number
  lines: PriceLine[]
  estimatedPrice: number
  disclaimer: string
}

export interface TimelineEvent {
  id: string
  at: string
  actor: string
  action: string
  detail?: string
}

export interface CustomerInfo {
  phone: string
  name: string
  type: CustomerType
  note: string
  purchaseCount?: number
}

export interface DeviceInfo {
  model: string
  storage: string
  color: string
  type: DeviceType
  marketability: Marketability
}

export interface OriginInfo {
  boughtAtItamloan: boolean
  purchaseDate?: string
  purchaseKind?: 'Máy mới' | 'Máy qua sử dụng'
  invoicePrice?: number
  invoiceCode?: string
  imei?: string
}

export interface InspectionInfo {
  exterior: ExteriorGrade | null
  exteriorNote: string
  batteryType: BatteryType | null
  batteryHealth: number | null
  features: FeatureCheck[]
  isOriginal: boolean | null
  techNote: string
}

export interface TradeInRecord {
  id: string
  customer: CustomerInfo
  device: DeviceInfo
  origin: OriginInfo
  transactionType: TransactionType
  inspection: InspectionInfo
  standardPrice: number
  estimatedPrice: number | null
  finalPrice: number | null
  status: TradeInStatus
  handler: string
  createdAt: string
  updatedAt: string
  rejectReason?: string
  warehouseAction?: WarehouseAction
  cashierChecks?: {
    device: boolean
    exterior: boolean
    customer: boolean
  }
  timeline: TimelineEvent[]
}

export interface AppState {
  role: Role
  staffName: string
  records: TradeInRecord[]
  priceList: PriceItem[]
  pricingRules: PricingRule[]
}
