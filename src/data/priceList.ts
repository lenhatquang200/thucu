import type { PriceItem } from '@/types'

export const PRICE_LIST: PriceItem[] = [
  { id: 'p1', model: 'iPhone 17 Pro Max', type: 'Chính hãng', storage: '256GB', color: 'Cosmic Orange', condition: 'Máy 99', battery: '≥95%', price: 27000000 },
  { id: 'p2', model: 'iPhone 17 Pro Max', type: 'Chính hãng', storage: '512GB', color: 'Cosmic Orange', condition: 'Máy 99', battery: '≥95%', price: 30000000 },
  { id: 'p3', model: 'iPhone 17 Pro', type: 'Chính hãng', storage: '256GB', color: 'Silver', condition: 'Máy 99', battery: '≥95%', price: 24000000 },
  { id: 'p4', model: 'iPhone 17 Pro', type: 'Chính hãng', storage: '256GB', color: 'Deep Blue', condition: 'Máy 99', battery: '≥95%', price: 24000000 },
  { id: 'p5', model: 'iPhone 16 Pro Max', type: 'Chính hãng', storage: '256GB', color: 'Black Titanium', condition: 'Máy 99', battery: '≥95%', price: 22000000 },
  { id: 'p6', model: 'iPhone 16 Pro Max', type: 'Chính hãng', storage: '256GB', color: 'Natural Titanium', condition: 'Máy 99', battery: '≥95%', price: 21800000 },
  { id: 'p7', model: 'iPhone 16 Pro Max', type: 'Chính hãng', storage: '512GB', color: 'Black Titanium', condition: 'Máy 99', battery: '≥95%', price: 25000000 },
  { id: 'p8', model: 'iPhone 16 Pro', type: 'Chính hãng', storage: '256GB', color: 'Black Titanium', condition: 'Máy 99', battery: '≥95%', price: 18000000 },
  { id: 'p9', model: 'iPhone 16 Pro', type: 'Chính hãng', storage: '256GB', color: 'Natural Titanium', condition: 'Máy 99', battery: '≥95%', price: 17800000 },
  { id: 'p10', model: 'iPhone 16 Pro', type: 'Chính hãng', storage: '128GB', color: 'Black Titanium', condition: 'Máy 99', battery: '≥95%', price: 16500000 },
  { id: 'p11', model: 'iPhone 16 Pro', type: 'Quốc tế', storage: '256GB', color: 'Black Titanium', condition: 'Máy 99', battery: '≥95%', price: 17200000 },
  { id: 'p12', model: 'iPhone 15 Pro Max', type: 'Chính hãng', storage: '256GB', color: 'Natural Titanium', condition: 'Máy 99', battery: '≥95%', price: 18000000 },
  { id: 'p13', model: 'iPhone 15 Pro Max', type: 'Chính hãng', storage: '256GB', color: 'Blue Titanium', condition: 'Máy 99', battery: '≥95%', price: 17800000 },
  { id: 'p14', model: 'iPhone 15 Pro Max', type: 'Chính hãng', storage: '512GB', color: 'Natural Titanium', condition: 'Máy 99', battery: '≥95%', price: 20000000 },
  { id: 'p15', model: 'iPhone 15 Pro', type: 'Chính hãng', storage: '128GB', color: 'Black Titanium', condition: 'Máy 99', battery: '≥95%', price: 13000000 },
  { id: 'p16', model: 'iPhone 15 Pro', type: 'Chính hãng', storage: '256GB', color: 'Blue Titanium', condition: 'Máy 99', battery: '≥95%', price: 14500000 },
  { id: 'p17', model: 'iPhone 15 Pro', type: 'Quốc tế', storage: '128GB', color: 'Black Titanium', condition: 'Máy 99', battery: '≥95%', price: 12500000 },
]

export function findStandardPrice(model: string, storage: string, color: string, type: string) {
  const item = PRICE_LIST.find(
    (p) => p.model === model && p.storage === storage && p.color === color && p.type === type,
  )
  return item?.price ?? null
}

export function getModels() {
  return [...new Set(PRICE_LIST.map((p) => p.model))]
}

export function getStorages(model: string) {
  return [...new Set(PRICE_LIST.filter((p) => p.model === model).map((p) => p.storage))]
}

export function getColors(model: string, storage: string) {
  return [...new Set(PRICE_LIST.filter((p) => p.model === model && p.storage === storage).map((p) => p.color))]
}

export function getTypes(model: string, storage: string, color: string) {
  return [...new Set(PRICE_LIST.filter((p) => p.model === model && p.storage === storage && p.color === color).map((p) => p.type))]
}
