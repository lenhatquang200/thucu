import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVnd(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫'
}

export function formatSignedVnd(amount: number) {
  const abs = formatVnd(Math.abs(amount)).replace(' ₫', '')
  if (amount > 0) return `+${abs} ₫`
  if (amount < 0) return `-${abs} ₫`
  return '0 ₫'
}

export function todayLabel() {
  return new Date().toLocaleDateString('vi-VN')
}

export function nowTime() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export function genId(prefix = 'TC') {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}${String(n).slice(0, 6)}`
}
