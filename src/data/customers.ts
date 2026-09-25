export const MOCK_CUSTOMERS: Record<string, { name: string; type: 'Khách thường' | 'Khách thân thiết'; purchaseCount: number }> = {
  '0909123456': { name: 'Nguyễn Văn Minh', type: 'Khách thân thiết', purchaseCount: 4 },
  '0912345678': { name: 'Trần Minh B', type: 'Khách thường', purchaseCount: 1 },
  '0987654321': { name: 'Lê Anh C', type: 'Khách thân thiết', purchaseCount: 6 },
  '0903111222': { name: 'Phạm Thu D', type: 'Khách thường', purchaseCount: 0 },
  '0933444555': { name: 'Hoàng Đức E', type: 'Khách thân thiết', purchaseCount: 3 },
}

export function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, '')
}

export function lookupCustomer(phone: string) {
  return MOCK_CUSTOMERS[normalizePhone(phone)] ?? null
}
