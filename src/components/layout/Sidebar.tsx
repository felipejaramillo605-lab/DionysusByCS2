import {
  LayoutDashboard, ShoppingCart, Monitor, CreditCard, FileText,
  Package, BarChart3, Settings, Shield, ChevronLeft, ChevronRight,
  Utensils, Building2, LogOut, UserCircle,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Module } from '../../App'

interface SidebarProps {
  active: Module
  onNavigate: (m: Module) => void
  collapsed: boolean
  onToggle: () => void
}

const nav: { id: Module; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard',       icon: <LayoutDashboard size={16} /> },
  { id: 'orders',    label: 'Pedidos',          icon: <ShoppingCart size={16} />, badge: '6' },
  { id: 'kds',       label: 'Cocina / KDS',     icon: <Monitor size={16} />, badge: '3' },
  { id: 'pos',       label: 'POS / Caja',       icon: <CreditCard size={16} /> },
  { id: 'billing',   label: 'Facturación',      icon: <FileText size={16} /> },
  { id: 'inventory', label: 'Inventario',       icon: <Package size={16} /> },
  { id: 'reports',   label: 'Reportes & BI',    icon: <BarChart3 size={16} /> },
  { id: 'admin',     label: 'Administración',   icon: <Settings size={16} /> },
  { id: 'audit',     label: 'Auditoría',        icon: <Shield size={16} /> },
]

export default function Sidebar({ active, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { user, logout, addToast } = useApp()

  const handleLogout = () => {
    logout()
    addToast({ type: 'info', title: 'Sesión cerrada', message: 'Refresh token invalidado. Hasta pronto.' })
  }

  return (
    <aside style={{
      width: collapsed ? 52 : 220,
      minWidth: collapsed ? 52 : 220,
      background: 'var(--sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s, min-width 0.2s',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '16px 0' : '16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Utensils size={14} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.2 }}>RestaurantERP</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>COLOMBIA · v1.0</div>
          </div>
        )}
      </div>

      {/* Company selector */}
      {!collapsed && (
        <div style={{
          margin: '10px 10px 4px',
          background: 'var(--secondary)',
          borderRadius: 6,
          padding: '8px 10px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={13} color="var(--muted-foreground)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Parrilla del Chef S.A.S
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>Sucursal Chapinero</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {nav.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '8px 0' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--secondary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--sidebar-foreground)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                position: 'relative',
                transition: 'background 0.12s',
                width: '100%',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 18, background: 'var(--primary)', borderRadius: '0 2px 2px 0',
                }} />
              )}
              <span style={{ color: isActive ? 'var(--primary)' : 'inherit', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span style={{
                  background: 'var(--primary)', color: '#fff', borderRadius: 10,
                  fontSize: 10, fontWeight: 700, padding: '1px 6px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* User info + account link */}
        {!collapsed && user && (
          <button
            onClick={() => onNavigate('account')}
            title="Mi cuenta"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)',
              background: active === 'account' ? 'var(--secondary)' : 'rgba(249,115,22,0.06)',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--secondary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = active === 'account' ? 'var(--secondary)' : 'rgba(249,115,22,0.06)'}
          >
            <UserCircle size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.nombre}
              </div>
              <div style={{ fontSize: 10, color: 'var(--primary)' }}>{user.rol}</div>
            </div>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 8,
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 6, border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.06)',
            color: '#ef4444', cursor: 'pointer', width: '100%',
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.14)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'}
        >
          <LogOut size={14} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          style={{
            width: '100%', padding: '5px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--muted-foreground)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  )
}
