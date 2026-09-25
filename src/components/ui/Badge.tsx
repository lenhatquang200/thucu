import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const tones: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-light text-brand',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  muted: 'bg-slate-50 text-slate-500 border border-border',
}

export function Badge({
  className,
  tone = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  )
}

export function statusTone(status: string): keyof typeof tones {
  switch (status) {
    case 'Nháp':
      return 'muted'
    case 'Chờ kỹ thuật':
    case 'Đang kiểm tra':
      return 'warning'
    case 'Đã định giá':
    case 'Chờ khách':
      return 'brand'
    case 'Khách từ chối':
      return 'danger'
    case 'Chờ thu ngân':
      return 'warning'
    case 'Đã thu':
    case 'Đã nhập kho':
      return 'success'
    default:
      return 'default'
  }
}
