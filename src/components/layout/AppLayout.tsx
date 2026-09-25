import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Boxes,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Table2,
  Wallet,
  Wrench,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import type { Role } from '@/types'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const ROLES: Role[] = ['Kinh doanh', 'Kỹ thuật', 'Thu ngân', 'Kho', 'Quản lý']

const nav = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  {
    label: 'Thu cũ',
    items: [
      { to: '/trade-in', label: 'Hồ sơ thu máy', icon: ShoppingBag },
      { to: '/trade-in/new', label: 'Tiếp nhận máy mới', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Kỹ thuật',
    items: [
      { to: '/tech/pending', label: 'Chờ kiểm tra', icon: Wrench },
      { to: '/tech/done', label: 'Đã kiểm tra', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Thu ngân',
    items: [{ to: '/cashier', label: 'Chờ xác nhận', icon: Wallet }],
  },
  {
    label: 'Kho',
    items: [{ to: '/warehouse', label: 'Máy vừa tiếp nhận', icon: Package }],
  },
  {
    label: 'Dữ liệu',
    items: [
      { to: '/price-list', label: 'Bảng giá chuẩn', icon: Table2 },
      { to: '/pricing-rules', label: 'Quy tắc định giá', icon: Boxes },
    ],
  },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
]

const titles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/trade-in': 'Hồ sơ thu máy',
  '/trade-in/new': 'Tiếp nhận máy mới',
  '/tech/pending': 'Chờ kiểm tra kỹ thuật',
  '/tech/done': 'Đã kiểm tra',
  '/cashier': 'Thu ngân — chờ xác nhận',
  '/warehouse': 'Kho — máy vừa tiếp nhận',
  '/price-list': 'Bảng giá chuẩn',
  '/pricing-rules': 'Quy tắc định giá',
  '/settings': 'Cài đặt',
}

function pageTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname]
  if (pathname.includes('/inspection/')) return 'Kiểm tra kỹ thuật'
  if (pathname.includes('/quotation')) return 'Báo giá khách hàng'
  if (pathname.includes('/cashier/')) return 'Thu ngân xác nhận'
  if (pathname.startsWith('/trade-in/')) return 'Chi tiết hồ sơ'
  return 'iTamLoan Trade-in'
}

export function AppLayout() {
  const { role, setRole, staffName } = useApp()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[260px] border-r border-border bg-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div>
            <div className="text-base font-bold text-brand">iTamLoan Trade-in</div>
            <div className="text-[11px] text-muted">Hệ thống định giá & thu cũ thiết bị</div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-4 overflow-y-auto p-4">
          {nav.map((item) => {
            if ('items' in item && item.items) {
              return (
                <div key={item.label}>
                  <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {item.label}
                  </div>
                  <div className="space-y-1">
                    {item.items.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50',
                            isActive && 'bg-brand-light font-medium text-brand',
                          )
                        }
                      >
                        <sub.icon className="h-4 w-4" />
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to!}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50',
                    isActive && 'bg-brand-light font-medium text-brand',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-white/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-slate-900">{pageTitle(location.pathname)}</h1>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm text-muted">Vai trò hiện tại:</span>
            <Select
              className="w-40"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
            {staffName}
          </div>
        </header>
        <main className="p-4 md:p-6">
          <div className="mb-4 md:hidden">
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
