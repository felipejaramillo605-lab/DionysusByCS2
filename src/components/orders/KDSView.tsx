import { useApp } from '../../context/AppContext'
import type { Order, OrderStatus } from '../../context/AppContext'
import { Clock, CheckCircle, Flame } from 'lucide-react'
import Button from '../ui/Button'
import { useState } from 'react'

const COL_ESTADOS: OrderStatus[] = ['SENT_TO_KITCHEN', 'IN_PREPARATION', 'READY']

const COL_CFG: Record<string, { label: string; color: string }> = {
  SENT_TO_KITCHEN: { label: 'Nueva comanda',   color: '#f97316' },
  IN_PREPARATION:  { label: 'En preparación',  color: '#eab308' },
  READY:           { label: 'Listo para entregar', color: '#22c55e' },
}

export default function KDSView() {
  const { orders, transitionOrder } = useApp()

  const kdsOrders = orders.filter(o => COL_ESTADOS.includes(o.estado))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 96px)' }}>
      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {COL_ESTADOS.map(col => {
          const count = kdsOrders.filter(o => o.estado === col).length
          const cfg = COL_CFG[col]
          return (
            <div key={col} style={{
              background: 'var(--card)',
              border: `1px solid ${cfg.color}30`,
              borderTop: `3px solid ${cfg.color}`,
              borderRadius: 8, padding: '10px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{cfg.label}</span>
              <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: cfg.color }}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* KDS columns */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, overflow: 'hidden' }}>
        {COL_ESTADOS.map(col => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
            {kdsOrders
              .filter(o => o.estado === col)
              .map(order => (
                <KDSCard key={order.id} order={order} onTransition={transitionOrder} />
              ))
            }
            {kdsOrders.filter(o => o.estado === col).length === 0 && (
              <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px dashed var(--border)', padding: 28, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 12 }}>
                Sin pedidos aquí
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface KDSCardProps {
  order: Order
  onTransition: (id: string, to: OrderStatus, motivo?: string) => Promise<{ ok: boolean; error?: string }>
}

function KDSCard({ order, onTransition }: KDSCardProps) {
  const [itemsDone, setItemsDone] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const urgent = order.tiempoTranscurrido
    ? parseInt(order.tiempoTranscurrido) > 15
    : false
  const borderColor = urgent ? '#ef4444' : COL_CFG[order.estado]?.color ?? '#3b82f6'

  const allDone = itemsDone.size === order.items.length

  const toggleItem = (i: number) =>
    setItemsDone(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const handleAction = async (to: OrderStatus) => {
    setLoading(true)
    await onTransition(order.id, to)
    setLoading(false)
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${borderColor}35`,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 8, padding: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontWeight: 800, fontSize: 14 }}>{order.id}</span>
            {urgent && <Flame size={13} color="#ef4444" />}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
            {order.mesa || order.cliente} · {order.tipo}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} color={urgent ? '#ef4444' : 'var(--muted-foreground)'} />
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: urgent ? '#ef4444' : 'var(--foreground)' }}>
            {order.tiempoTranscurrido}
          </span>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {order.items.map((item, i) => {
          const done = itemsDone.has(i)
          return (
            <div
              key={i}
              onClick={() => order.estado === 'IN_PREPARATION' && toggleItem(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 9px', borderRadius: 6,
                background: done ? 'rgba(34,197,94,0.08)' : 'var(--secondary)',
                border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                cursor: order.estado === 'IN_PREPARATION' ? 'pointer' : 'default',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: done ? '#22c55e' : 'transparent',
                border: `2px solid ${done ? '#22c55e' : 'var(--muted-foreground)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
                {done && <CheckCircle size={11} color="#fff" />}
              </div>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', minWidth: 22 }}>
                {item.cantidad}×
              </span>
              <span style={{
                fontSize: 12, flex: 1,
                color: done ? 'var(--muted-foreground)' : 'var(--foreground)',
                textDecoration: done ? 'line-through' : 'none',
              }}>
                {item.producto}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress bar (IN_PREPARATION only) */}
      {order.estado === 'IN_PREPARATION' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 4 }}>
            <span>Progreso</span>
            <span className="mono">{itemsDone.size}/{order.items.length}</span>
          </div>
          <div style={{ height: 4, background: 'var(--secondary)', borderRadius: 2 }}>
            <div style={{
              height: '100%',
              width: `${(itemsDone.size / order.items.length) * 100}%`,
              background: '#22c55e', borderRadius: 2, transition: 'width 0.25s',
            }} />
          </div>
        </div>
      )}

      {/* Action button */}
      {order.estado === 'SENT_TO_KITCHEN' && (
        <Button variant="warning" fullWidth loading={loading} onClick={() => handleAction('IN_PREPARATION')}>
          Iniciar Preparación
        </Button>
      )}
      {order.estado === 'IN_PREPARATION' && (
        <Button
          variant={allDone ? 'success' : 'outline'}
          fullWidth loading={loading}
          onClick={() => handleAction('READY')}
        >
          {allDone ? '✓ Marcar Listo' : `Listo (${itemsDone.size}/${order.items.length})`}
        </Button>
      )}
      {order.estado === 'READY' && (
        <div style={{ textAlign: 'center', padding: '9px', background: 'rgba(34,197,94,0.1)', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
          ✓ Listo para entregar
        </div>
      )}
    </div>
  )
}
