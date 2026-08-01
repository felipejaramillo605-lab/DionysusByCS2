import { useState } from 'react'
import { useApp } from './context/AppContext'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Dashboard from './components/dashboard/Dashboard'
import OrdersView from './components/orders/OrdersView'
import KDSView from './components/orders/KDSView'
import POSView from './components/pos/POSView'
import BillingView from './components/billing/BillingView'
import InventoryView from './components/inventory/InventoryView'
import ReportsView from './components/reports/ReportsView'
import AdminView from './components/admin/AdminView'
import AuditView from './components/security/AuditView'
import AccountView from './components/account/AccountView'
import LoginView from './components/auth/LoginView'
import ConsentModal from './components/auth/ConsentModal'
import ToastLayer from './components/ui/Toast'

export type Module =
  | 'dashboard' | 'orders' | 'kds' | 'pos'
  | 'billing' | 'inventory' | 'reports'
  | 'admin' | 'audit' | 'account'

export default function App() {
  const { isAuthenticated, consentAccepted } = useApp()
  const [activeModule, setActiveModule] = useState<Module>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Not logged in → show login
  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastLayer />
      </>
    )
  }

  // Logged in but hasn't accepted consent → show consent modal
  if (!consentAccepted) {
    return (
      <>
        <ConsentModal />
        <ToastLayer />
      </>
    )
  }

  const views: Record<Module, JSX.Element> = {
    dashboard: <Dashboard onNavigate={setActiveModule} />,
    orders:    <OrdersView />,
    kds:       <KDSView />,
    pos:       <POSView />,
    billing:   <BillingView />,
    inventory: <InventoryView />,
    reports:   <ReportsView />,
    admin:     <AdminView />,
    audit:     <AuditView />,
    account:   <AccountView />,
  }

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
        <Sidebar
          active={activeModule}
          onNavigate={setActiveModule}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TopBar module={activeModule} />
          <main style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
            {views[activeModule]}
          </main>
        </div>
      </div>
      <ToastLayer />
    </>
  )
}
