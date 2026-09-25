import type { PricingRule } from '@/types'

export const PRICING_RULES: PricingRule[] = [
  { id: 'r1', name: 'Thu đổi máy mới', group: 'Thu đổi', condition: 'Giao dịch = máy mới', adjustmentType: 'Cộng tiền', value: 300000, active: true },
  { id: 'r2', name: 'Thu đổi máy cũ', group: 'Thu đổi', condition: 'Giao dịch = máy cũ', adjustmentType: 'Cộng tiền', value: 500000, active: true },
  { id: 'r3', name: 'Pin 90–94%', group: 'Pin', condition: 'Pin zin 90–94%', adjustmentType: 'Trừ tiền', value: 500000, active: true },
  { id: 'r4', name: 'Pin 87–89%', group: 'Pin', condition: 'Pin zin 87–89%', adjustmentType: 'Trừ tiền', value: 800000, active: true },
  { id: 'r5', name: 'Pin dưới 86%', group: 'Pin', condition: 'Pin zin < 86%', adjustmentType: 'Trừ tiền', value: 1000000, active: true },
  { id: 'r6', name: 'Ngoại hình 98', group: 'Ngoại hình', condition: 'Grade = 98', adjustmentType: 'Trừ %', value: 5, active: true },
  { id: 'r7', name: 'Ngoại hình 97', group: 'Ngoại hình', condition: 'Grade = 97', adjustmentType: 'Trừ %', value: 10, active: true },
  { id: 'r8', name: 'Máy xấu', group: 'Ngoại hình', condition: 'Grade = Máy xấu', adjustmentType: 'Trừ %', value: 20, active: true },
  { id: 'r9', name: 'Camera sau lỗi', group: 'Tính năng', condition: 'Failed', adjustmentType: 'Trừ %', value: 20, active: true },
  { id: 'r10', name: 'Màn hình lỗi', group: 'Tính năng', condition: 'Failed', adjustmentType: 'Trừ %', value: 50, active: true },
  { id: 'r11', name: 'Máy đã sửa chữa', group: 'Tính năng', condition: 'Không còn zin', adjustmentType: 'Trừ %', value: 20, active: true },
  { id: 'r12', name: 'Máy mua tại iTamLoan', group: 'Nguồn máy', condition: 'Mua tại cửa hàng', adjustmentType: 'Cộng tiền', value: 500000, active: true },
]
