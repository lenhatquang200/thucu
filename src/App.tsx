import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppProvider } from '@/context/AppContext'
import { CashierPage } from '@/pages/CashierPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InspectionPage } from '@/pages/InspectionPage'
import { PriceListPage } from '@/pages/PriceListPage'
import { PricingRulesPage } from '@/pages/PricingRulesPage'
import { QuotationPage } from '@/pages/QuotationPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TradeInDetailPage } from '@/pages/TradeInDetailPage'
import { TradeInListPage } from '@/pages/TradeInListPage'
import { TradeInNewPage } from '@/pages/TradeInNewPage'
import { WarehousePage } from '@/pages/WarehousePage'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trade-in" element={<TradeInListPage />} />
          <Route path="/trade-in/new" element={<TradeInNewPage />} />
          <Route path="/trade-in/:id" element={<TradeInDetailPage />} />
          <Route path="/trade-in/:id/quotation" element={<QuotationPage />} />
          <Route path="/inspection/:id" element={<InspectionPage />} />
          <Route
            path="/tech/pending"
            element={
              <TradeInListPage
                title="Chờ kiểm tra"
                statusFilter={['Chờ kỹ thuật', 'Đang kiểm tra']}
                preferAction="tech"
              />
            }
          />
          <Route
            path="/tech/done"
            element={
              <TradeInListPage
                title="Đã kiểm tra"
                statusFilter={['Đã định giá', 'Chờ khách', 'Khách từ chối', 'Chờ thu ngân', 'Đã thu', 'Đã nhập kho']}
              />
            }
          />
          <Route
            path="/cashier"
            element={
              <TradeInListPage
                title="Chờ thu ngân xác nhận"
                statusFilter={['Chờ thu ngân']}
                preferAction="cashier"
              />
            }
          />
          <Route path="/cashier/:id" element={<CashierPage />} />
          <Route path="/warehouse" element={<WarehousePage />} />
          <Route path="/price-list" element={<PriceListPage />} />
          <Route path="/pricing-rules" element={<PricingRulesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
