import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MOCK_CUSTOMERS } from '@/data/customers'
import { MOCK_RECORDS } from '@/data/mockRecords'
import { PRICE_LIST } from '@/data/priceList'
import { PRICING_RULES } from '@/data/pricingRules'
import type { PricingRule, Role, TradeInRecord } from '@/types'

const STORAGE_KEY = 'itamloan-tradein-demo-v1'

interface Store {
  role: Role
  staffName: string
  records: TradeInRecord[]
  pricingRules: PricingRule[]
  setRole: (role: Role) => void
  upsertRecord: (record: TradeInRecord) => void
  getRecord: (id: string) => TradeInRecord | undefined
  addRule: (rule: PricingRule) => void
  updateRule: (rule: PricingRule) => void
}

const AppContext = createContext<Store | null>(null)

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as {
        role: Role
        staffName: string
        records: TradeInRecord[]
        pricingRules: PricingRule[]
      }
      return parsed
    }
  } catch {
    /* ignore */
  }
  return {
    role: 'Kinh doanh' as Role,
    staffName: 'Nguyễn Văn A',
    records: MOCK_RECORDS,
    pricingRules: PRICING_RULES,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadInitial(), [])
  const [role, setRole] = useState<Role>(initial.role)
  const [staffName] = useState(initial.staffName)
  const [records, setRecords] = useState<TradeInRecord[]>(initial.records)
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(initial.pricingRules)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ role, staffName, records, pricingRules }),
    )
  }, [role, staffName, records, pricingRules])

  const value: Store = {
    role,
    staffName,
    records,
    pricingRules,
    setRole,
    upsertRecord: (record) => {
      setRecords((prev) => {
        const idx = prev.findIndex((r) => r.id === record.id)
        if (idx === -1) return [record, ...prev]
        const next = [...prev]
        next[idx] = record
        return next
      })
    },
    getRecord: (id) => records.find((r) => r.id === id),
    addRule: (rule) => setPricingRules((prev) => [rule, ...prev]),
    updateRule: (rule) =>
      setPricingRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r))),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { PRICE_LIST, MOCK_CUSTOMERS }
