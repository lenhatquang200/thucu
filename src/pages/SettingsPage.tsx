import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'

export function SettingsPage() {
  const { role, staffName } = useApp()

  function resetDemo() {
    localStorage.removeItem('itamloan-tradein-demo-v1')
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            Nhân viên: <strong>{staffName}</strong>
          </div>
          <div>
            Vai trò hiện tại: <strong>{role}</strong>
          </div>
          <div className="text-muted">Đổi vai trò từ header — không cần đăng nhập.</div>
          <Button variant="outline" onClick={resetDemo}>
            Reset dữ liệu demo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
