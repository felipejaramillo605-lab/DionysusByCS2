import { useState, useCallback } from 'react'
import { Plus, Search, ChevronRight, Clock, Utensils, Bike, User, QrCode, Globe, Phone, AlertTriangle } from 'lucide-react'
import { useApp, canTransition, isTerminal, type OrderStatus, type Order } from '../../context/AppContext'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const STATUS_FLOW: OrderStatus[] = [
  'CREATED', 'CONFIRMED', 'SENT_TO_KITCHEN',
  'IN_PREPARATION', 'READY', 'DELIVERED', 'INVOICED', 'PAID',
]

const BADGE: Record<OrderStatus, { cls: string; label: string }> = {
  CREATED:        { cls: 'badge-muted',    label: 'Creado' },
  CONFIRMED:      { cls: 'badge-info',     label: 'Confirmado' },
  SENT_TO_KITCHEN:{ cls: 'badge-orange',   label: 'En cocina' },
  IN_PREPARATION: { cls: 'badge-warning',  label: 'Preparando' },
  READY:          { cls: 'badge-purple',   label: 'Listo' },
  DELIVERED:      { cls: 'badge-success',  label: 'Entregado' },
  INVOICED:       { cls: 'badge-info',     label: 'Facturado' },
  PAID:           { cls: 'badge-success',  label: 'Pagado' },
  CANCELLED:      { cls: 'badge-danger',   label: 'Cancelado' },
  VOIDED:         { cls: 'badge-danger',   label: 'Anulado' },
  REFUNDED:       { cls: 'badge-danger',   label: 'Reembolsado' },
  PARTIALLY_PAID: { cls: 'badge-warning',  label: 'Pago parcial' },
  PARTIALLY_READY:{ cls: 'badge-warning',  label: 'Parcial' },
  FAILED_INTEGRATION: { cls: 'badge-danger', label: 'Error integración' },
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  mesa:     <Utensils size={13} />,
  domicilio:<Bike size={13} />,
  llevar:   <User size={13} />,
  qr:       <QrCode size={13} />,
  web:      <Globe size={13} />,
  telefono: <Phone size={13} />,
}

// Next logical action for a given state
const PRIMARY_ACTION: Partial<Record<OrderStatus, { to: OrderStatus; label: string; variant: 'primary' | 'success' | 'warning' }>> = {
  CREATED:         { to: 'CONFIRMED',       label: 'Confirmar Pedido', variant: 'primary' },
  CONFIRMED:       { to: 'SENT_TO_KITCHEN', label: 'Enviar a Cocina',  variant: 'primary' },
  SENT_TO_KITCHEN: { to: 'IN_PREPARATION',  label: 'Iniciar Preparación', variant: 'warning' },
  IN_PREPARATION:  { to: 'READY',           label: 'Marcar Listo',    variant: 'success' },
  READY:           { to: 'DELIVERED',       label: 'Entregar Pedido', variant: 'primary' },
  DELIVERED:       { to: 'INVOICED',        label: 'Facturar',        variant: 'primary' },
  INVOICED:        { to: 'PAID',            label: 'Marcar Pagado',   variant: 'success' },
}

const fmtCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

export default function OrdersView() {
  const { orders, transitionOrder } = useApp()
  const [selected, setSelected] = useState<Order | null>(orders[0] ?? null)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null)
  const [cancelModal, setCancelModal] = useState(false)
  const [voidModal, setVoidModal]   = useState(false)
  const [motivo, setMotivo] = useState('')
  const [motivoError, setMotivoError] = useState('')

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.estado === filter
    const q = search.toLowerCase()
    const matchSearch = !q || o.id.toLowerCase().includes(q) ||
      o.mesa?.toLowerCase().includes(q) || o.cliente?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  // Keep selected in sync with mutated orders
  const syncedSelected = selected ? (orders.find(o => o.id === selected.id) ?? null) : null

  const doTransition = useCallback(async (orderId: string, to: OrderStatus, mot?: string) => {
    const key = `${orderId}-${to}`
    setLoadingBtn(key)
    await transitionOrder(orderId, to, mot)
    setLoadingBtn(null)
  }, [transitionOrder])

  const openCancel = () => { setMotivo(''); setMotivoError(''); setCancelModal(true) }
  const openVoid   = () => { setMotivo(''); setMotivoError(''); setVoidModal(true) }

  const confirmCancel = async () => {
    if (!motivo.trim()) { setMotivoError('El motivo es obligatorio para cancelar un pedido.'); return }
    if (!syncedSelected) return
    setCancelModal(false)
    await doTransition(syncedSelected.id, 'CANCELLED', motivo)
  }
  const confirmVoid = async () => {
    if (!motivo.trim()) { setMotivoError('El motivo es obligatorio para anular un pedido.'); return }
    if (!syncedSelected) return
    setVoidModal(false)
    await doTransition(syncedSelected.id, 'VOIDED', motivo)
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 96px)' }}>
      {/* ── List panel ── */}
      <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Search + New */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px' }}>
            <Search size={13} color="var(--muted-foreground)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ID, mesa, cliente..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <Button variant="primary" size="md" icon={<Plus size={14} />}>Nuevo</Button>
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(['all', 'CREATED', 'IN_PREPARATION', 'READY', 'DELIVERED', 'PAID'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: filter === f ? 'var(--primary)' : 'var(--secondary)',
              color: filter === f ? '#fff' : 'var(--muted-foreground)',
              border: '1px solid var(--border)',
            }}>
              {f === 'all' ? 'Todos' : BADGE[f as OrderStatus]?.label}
            </button>
          ))}
        </div>

        {/* Order cards */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted-foreground)', fontSize: 12 }}>
              Sin pedidos que coincidan
            </div>
          )}
          {filtered.map(o => (
            <div
              key={o.id}
              onClick={() => setSelected(o)}
              style={{
                background: syncedSelected?.id === o.id ? 'var(--secondary)' : 'var(--card)',
                border: `1px solid ${syncedSelected?.id === o.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 8, padding: 12, cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>{TYPE_ICON[o.tipo]}</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{o.id}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{o.mesa || o.cliente}</div>
                </div>
                <span className={`badge ${BADGE[o.estado]?.cls}`}>{BADGE[o.estado]?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{o.items.length} productos · {o.cajero}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={11} color="var(--muted-foreground)" />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{o.tiempoTranscurrido}</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, marginLeft: 4 }}>{fmtCOP(o.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail panel ── */}
      {syncedSelected ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
          {/* Header */}
          <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 800 }}>{syncedSelected.id}</span>
                  <span className={`badge ${BADGE[syncedSelected.estado]?.cls}`}>{BADGE[syncedSelected.estado]?.label}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  {syncedSelected.mesa || syncedSelected.cliente} · {syncedSelected.cajero} · Creado {syncedSelected.createdAt}
                </div>
              </div>

              {/* Action buttons */}
              {!isTerminal(syncedSelected.estado) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {/* Primary transition */}
                  {PRIMARY_ACTION[syncedSelected.estado] && (() => {
                    const action = PRIMARY_ACTION[syncedSelected.estado]!
                    const key = `${syncedSelected.id}-${action.to}`
                    return (
                      <Button
                        variant={action.variant}
                        loading={loadingBtn === key}
                        onClick={() => doTransition(syncedSelected.id, action.to)}
                      >
                        {action.label}
                      </Button>
                    )
                  })()}

                  {/* Cancel */}
                  {canTransition(syncedSelected.estado, 'CANCELLED') && (
                    <Button variant="danger" onClick={openCancel}
                      loading={loadingBtn === `${syncedSelected.id}-CANCELLED`}>
                      Cancelar
                    </Button>
                  )}

                  {/* Void (post-kitchen) */}
                  {['IN_PREPARATION', 'READY', 'DELIVERED'].includes(syncedSelected.estado) && (
                    <Button variant="danger" onClick={openVoid}
                      loading={loadingBtn === `${syncedSelected.id}-VOIDED`}>
                      Anular
                    </Button>
                  )}
                </div>
              )}

              {isTerminal(syncedSelected.estado) && (
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                  Estado final — sin acciones disponibles
                </span>
              )}
            </div>

            {/* State machine flow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
              {STATUS_FLOW.map((s, i) => {
                const idx = STATUS_FLOW.indexOf(syncedSelected.estado)
                const done = i < idx
                const active = i === idx
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{
                      padding: '3px 9px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                      background: active ? 'var(--primary)' : done ? 'rgba(34,197,94,0.15)' : 'var(--secondary)',
                      color: active ? '#fff' : done ? '#22c55e' : 'var(--muted-foreground)',
                      border: `1px solid ${active ? 'var(--primary)' : done ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                    }}>
                      {BADGE[s]?.label}
                    </div>
                    {i < STATUS_FLOW.length - 1 && <ChevronRight size={10} color="var(--muted-foreground)" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Items */}
          <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Productos del Pedido</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Producto', 'Cant.', 'P. Unit.', 'Subtotal'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '4px 8px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {syncedSelected.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
                    <td style={{ padding: '9px 8px', fontSize: 13 }}>{item.producto}</td>
                    <td style={{ padding: '9px 8px' }} className="mono"><span style={{ fontWeight: 700 }}>{item.cantidad}</span></td>
                    <td style={{ padding: '9px 8px', fontSize: 12 }} className="mono">{fmtCOP(item.precio)}</td>
                    <td style={{ padding: '9px 8px', fontSize: 13, fontWeight: 600 }} className="mono">{fmtCOP(item.precio * item.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <TRow l="Subtotal" v={fmtCOP(syncedSelected.subtotal)} />
                {syncedSelected.inc > 0 && <TRow l="INC (8%) — Art. 512-1 ET" v={fmtCOP(syncedSelected.inc)} />}
                {syncedSelected.descuento > 0 && (
                  <TRow l={`Descuento${syncedSelected.descuentoMotivo ? ` — ${syncedSelected.descuentoMotivo}` : ''}`} v={`-${fmtCOP(syncedSelected.descuento)}`} c="#ef4444" />
                )}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>TOTAL COP</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)' }}>{fmtCOP(syncedSelected.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit history */}
          <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
              Historial — order_status_history
            </div>
            {syncedSelected.statusHistory.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Sin eventos registrados aún.</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {syncedSelected.statusHistory.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)', minWidth: 48 }}>{ev.ts}</span>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${BADGE[ev.from]?.cls}`}>{BADGE[ev.from]?.label}</span>
                      <ChevronRight size={10} color="var(--muted-foreground)" />
                      <span className={`badge ${BADGE[ev.to]?.cls}`}>{BADGE[ev.to]?.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3 }}>
                      {ev.usuario} · {ev.ip}
                      {ev.motivo && <span style={{ color: '#eab308', marginLeft: 8 }}>Motivo: {ev.motivo}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>
          Selecciona un pedido para ver el detalle
        </div>
      )}

      {/* ── Cancel modal ── */}
      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancelar Pedido" subtitle="Esta acción quedará auditada. El pedido no será eliminado." width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize: 12, color: '#ef4444' }}>El pedido <strong>{syncedSelected?.id}</strong> pasará a estado CANCELADO. No se puede revertir.</span>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
              Motivo de cancelación <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => { setMotivo(e.target.value); setMotivoError('') }}
              placeholder="Describe el motivo de la cancelación..."
              rows={3}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--secondary)', border: `1px solid ${motivoError ? '#ef4444' : 'var(--border)'}`, borderRadius: 6, color: 'var(--foreground)', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
            {motivoError && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{motivoError}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setCancelModal(false)}>Volver</Button>
            <Button variant="danger" onClick={confirmCancel}>Cancelar Pedido</Button>
          </div>
        </div>
      </Modal>

      {/* ── Void modal ── */}
      <Modal open={voidModal} onClose={() => setVoidModal(false)} title="Anular Pedido" subtitle="Requiere autorización. El pedido quedará ANULADO con auditoría completa." width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize: 12, color: '#ef4444' }}>Anular un pedido en cocina requiere autorización de gerente. Acción auditada.</span>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
              Motivo de anulación <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => { setMotivo(e.target.value); setMotivoError('') }}
              placeholder="Describe el motivo de la anulación..."
              rows={3}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--secondary)', border: `1px solid ${motivoError ? '#ef4444' : 'var(--border)'}`, borderRadius: 6, color: 'var(--foreground)', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
            {motivoError && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{motivoError}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setVoidModal(false)}>Volver</Button>
            <Button variant="danger" onClick={confirmVoid}>Anular Pedido</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TRow({ l, v, c }: { l: string; v: string; c?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--muted-foreground)', flex: 1 }}>{l}</span>
      <span className="mono" style={{ color: c || 'var(--foreground)', flexShrink: 0 }}>{v}</span>
    </div>
  )
}
