import { Bell, Search, HelpCircle, Wifi } from 'lucide-react'
import type { Module } from '../../App'

const titles: Record<Module, { label: string; sub: string }> = {
  dashboard: { label: 'Dashboard General', sub: 'Resumen operativo en tiempo real' },
  orders: { label: 'Módulo de Pedidos', sub: 'Gestión de órdenes — mesa, domicilio, QR, web' },
  kds: { label: 'Cocina / KDS', sub: 'Kitchen Display System — comandas en tiempo real' },
  pos: { label: 'POS / Caja', sub: 'Punto de venta y gestión de caja' },
  billing: { label: 'Facturación Colombia', sub: 'Factura electrónica · POS electrónico · DIAN' },
  inventory: { label: 'Inventario', sub: 'Productos, recetas, bodegas y movimientos' },
  reports: { label: 'Reportes & BI', sub: 'Ventas, impuestos, rentabilidad y análisis' },
  admin: { label: 'Administración General', sub: 'Compañías, sucursales, usuarios y roles' },
  audit: { label: 'Auditoría & Seguridad', sub: 'Logs de acceso, cambios críticos y sesiones' },
  account: { label: 'Cuenta y Seguridad', sub: 'Perfil, MFA, eliminación de cuenta y sesiones' },
}

export default function TopBar({ module }: { module: Module }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const { label, sub } = titles[module]

  return (
    <header style={{
      height: 56,
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{sub}</div>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--muted)', borderRadius: 6, padding: '6px 12px',
        border: '1px solid var(--border)', width: 220,
      }}>
        <Search size={13} color="var(--muted-foreground)" />
        <input
          placeholder="Buscar pedido, cliente, producto..."
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 12, color: 'var(--foreground)', width: '100%',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>

      {/* Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted-foreground)' }}>
        <Wifi size={13} color="#22c55e" />
        <span style={{ color: '#22c55e', fontWeight: 500 }}>En línea</span>
      </div>

      {/* Date */}
      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>
        <div style={{ color: 'var(--foreground)', fontWeight: 500 }}>{timeStr}</div>
        <div style={{ fontSize: 10, textTransform: 'capitalize' }}>{dateStr}</div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6,
          padding: '6px 8px', cursor: 'pointer', position: 'relative',
          display: 'flex', alignItems: 'center',
        }}>
          <Bell size={14} color="var(--muted-foreground)" />
          <span style={{
            position: 'absolute', top: 2, right: 2, width: 8, height: 8,
            background: 'var(--primary)', borderRadius: '50%',
          }} />
        </button>
        <button style={{
          background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6,
          padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}>
          <HelpCircle size={14} color="var(--muted-foreground)" />
        </button>
      </div>
    </header>
  )
}
