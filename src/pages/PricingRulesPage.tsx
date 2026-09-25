import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Input, Label, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/context/AppContext'
import { formatVnd, genId } from '@/lib/utils'
import type { AdjustmentType, PricingRule, RuleGroup } from '@/types'

const GROUPS: RuleGroup[] = ['Khách hàng', 'Nguồn máy', 'Thu đổi', 'Pin', 'Ngoại hình', 'Tính năng']
const ADJ: AdjustmentType[] = ['Cộng tiền', 'Trừ tiền', 'Cộng %', 'Trừ %']

function formatAdj(rule: PricingRule) {
  if (rule.adjustmentType.includes('%')) {
    const sign = rule.adjustmentType.startsWith('Cộng') ? '+' : '-'
    return `${sign}${rule.value}%`
  }
  const sign = rule.adjustmentType.startsWith('Cộng') ? 1 : -1
  return (sign > 0 ? '+' : '-') + formatVnd(rule.value).replace(' ₫', '') + ' ₫'
}

export function PricingRulesPage() {
  const { pricingRules, addRule, updateRule } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    group: 'Thu đổi' as RuleGroup,
    condition: '',
    adjustmentType: 'Cộng tiền' as AdjustmentType,
    value: 0,
    active: true,
  })

  function submit() {
    if (!form.name) return
    addRule({
      id: genId('R'),
      ...form,
    })
    setOpen(false)
    setForm({
      name: '',
      group: 'Thu đổi',
      condition: '',
      adjustmentType: 'Cộng tiền',
      value: 0,
      active: true,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quy tắc định giá</CardTitle>
          <Button onClick={() => setOpen(true)}>Thêm quy tắc</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="pb-2 font-medium">Rule</th>
                <th className="pb-2 font-medium">Nhóm</th>
                <th className="pb-2 font-medium">Điều kiện</th>
                <th className="pb-2 text-right font-medium">Điều chỉnh</th>
                <th className="pb-2 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {pricingRules.map((r) => (
                <tr key={r.id} className="border-b border-border/70">
                  <td className="py-3 font-medium">{r.name}</td>
                  <td className="py-3">{r.group}</td>
                  <td className="py-3">{r.condition}</td>
                  <td className="py-3 text-right font-semibold">{formatAdj(r)}</td>
                  <td className="py-3">
                    <button type="button" onClick={() => updateRule({ ...r, active: !r.active })}>
                      <Badge tone={r.active ? 'success' : 'muted'}>{r.active ? 'Active' : 'Off'}</Badge>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 text-sm text-muted">
          Các rule chưa cấu hình: khách thân thiết, máy hot/khó bán, giới hạn giảm tối đa, thứ tự cộng dồn %,
          quyền chỉnh giá cuối của nhân viên, công thức máy xác chính thức.
        </CardContent>
      </Card>

      <Modal open={open} title="Thêm quy tắc" onClose={() => setOpen(false)}>
        <Field>
          <Label>Tên rule</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field>
          <Label>Nhóm</Label>
          <Select
            value={form.group}
            onChange={(e) => setForm((f) => ({ ...f, group: e.target.value as RuleGroup }))}
          >
            {GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>Điều kiện</Label>
          <Input
            value={form.condition}
            onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
          />
        </Field>
        <Field>
          <Label>Loại điều chỉnh</Label>
          <Select
            value={form.adjustmentType}
            onChange={(e) => setForm((f) => ({ ...f, adjustmentType: e.target.value as AdjustmentType }))}
          >
            {ADJ.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>Giá trị</Label>
          <Input
            type="number"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
          />
        </Field>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          Bật
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={submit}>Lưu</Button>
        </div>
      </Modal>
    </div>
  )
}
