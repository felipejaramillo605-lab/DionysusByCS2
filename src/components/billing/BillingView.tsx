import { useState, useCallback } from 'react'
import {
  RefreshCw, Send, AlertTriangle, CheckCircle, Clock,
  XCircle, FileText, Download, Plus,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

type DocType = 'FE' | 'POS' | 'NC' | 'ND'
type DocStatus =
  | 'DRAFT' | 'SENT_TO_PROVIDER' | 'VALIDATED_BY_DIAN'
  | 'REJECTED_BY_DIAN' | 'FAILED_PROVIDER' | 'CONTINGENCY' | 'VOIDED'

interface FiscalDoc {
  id: string
  tipo: DocType
  consecutivo: string
  prefijo: string
  resolucion: string
  fecha: string
  adquirente: string
  nit: string
  subtotal: number
  iva: number
  inc: number
  total: number
  medioPago: string
  estado: DocStatus
  cufe?: string
  intentos: number
  pedidoId: string
  logs: { ts: string; evento: string; ok: boolean }[]
}

const SEED_DOCS: FiscalDoc[] = [
  {
    id: 'FD-001', tipo: 'POS', consecutivo: '00000847', prefijo: 'POS', resolucion: '18760000001',
    fecha: '2026-07-08 12:34', adquirente: 'Consumidor Final', nit: '222222222',
    subtotal: 106000, iva: 0, inc: 8480, total: 114480, medioPago: 'Tarjeta débito',
    estado: 'VALIDATED_BY_DIAN', cufe: 'a8f3d2e1b9c74f2d8e...', intentos: 1, pedidoId: 'PED-2847',
    logs: [
      { ts: '12:34:01', evento: 'Documento POS generado', ok: true },
      { ts: '12:34:02', evento: 'XML enviado a proveedor TecnoFact', ok: true },
      { ts: '12:34:08', evento: 'Validado por DIAN · CUFE asignado', ok: true },
    ],
  },
  {
    id: 'FD-002', tipo: 'FE', consecutivo: '00000312', prefijo: 'FACT', resolucion: '18760000002',
    fecha: '2026-07-08 11:54', adquirente: 'Parrilla Eventos S.A.S', nit: '900.456.789-1',
    subtotal: 237000, iva: 0, inc: 18960, total: 232260, medioPago: 'Transferencia',
    estado: 'VALIDATED_BY_DIAN', cufe: 'f4e9a1d8c2b3...', intentos: 1, pedidoId: 'PED-2844',
    logs: [
      { ts: '11:54:10', evento: 'Factura electrónica generada', ok: true },
      { ts: '11:54:12', evento: 'XML UBL 2.1 enviado', ok: true },
      { ts: '11:54:20', evento: 'Validado DIAN · CUFE asignado', ok: true },
    ],
  },
  {
    id: 'FD-003', tipo: 'POS', consecutivo: '00000846', prefijo: 'POS', resolucion: '18760000001',
    fecha: '2026-07-08 12:11', adquirente: 'Consumidor Final', nit: '222222222',
    subtotal: 100000, iva: 0, inc: 8000, total: 108000, medioPago: 'Nequi',
    estado: 'SENT_TO_PROVIDER', cufe: undefined, intentos: 2, pedidoId: 'PED-2845',
    logs: [
      { ts: '12:11:05', evento: 'Documento generado', ok: true },
      { ts: '12:11:06', evento: 'Intento 1 — timeout proveedor', ok: false },
      { ts: '12:11:30', evento: 'Intento 2 — esperando respuesta', ok: false },
    ],
  },
  {
    id: 'FD-004', tipo: 'NC', consecutivo: '00000021', prefijo: 'NC', resolucion: '18760000003',
    fecha: '2026-07-08 10:30', adquirente: 'Carlos Vargas', nit: '79.456.123',
    subtotal: 42000, iva: 0, inc: 3360, total: 45360, medioPago: 'Efectivo',
    estado: 'VALIDATED_BY_DIAN', cufe: 'b2c5f8a4d1e7...', intentos: 1, pedidoId: 'PED-2830',
    logs: [
      { ts: '10:30:01', evento: 'Nota crédito generada', ok: true },
      { ts: '10:30:03', evento: 'Enviada a proveedor', ok: true },
      { ts: '10:30:10', evento: 'Validada DIAN', ok: true },
    ],
  },
  {
    id: 'FD-005', tipo: 'POS', consecutivo: '00000845', prefijo: 'POS', resolucion: '18760000001',
    fecha: '2026-07-08 09:15', adquirente: 'Consumidor Final', nit: '222222222',
    subtotal: 59000, iva: 0, inc: 4720, total: 63720, medioPago: 'Efectivo',
    estado: 'REJECTED_BY_DIAN', intentos: 3, pedidoId: 'PED-2838',
    logs: [
      { ts: '09:15:01', evento: 'Documento generado', ok: true },
      { ts: '09:15:03', evento: 'Enviado a proveedor', ok: true },
      { ts: '09:15:15', evento: 'Rechazado DIAN — error en resolución', ok: false },
    ],
  },
  {
    id: 'FD-006', tipo: 'POS', consecutivo: '00000844', prefijo: 'POS', resolucion: '18760000001',
    fecha: '2026-07-08 08:45', adquirente: 'Consumidor Final', nit: '222222222',
    subtotal: 28000, iva: 0, inc: 2240, total: 30240, medioPago: 'Efectivo',
    estado: 'CONTINGENCY', intentos: 0, pedidoId: 'PED-2835',
    logs: [
      { ts: '08:45:00', evento: 'Documento generado — modo contingencia activo', ok: true },
      { ts: '08:45:01', evento: 'Proveedor no disponible · contingencia 72h', ok: false },
    ],
  },
]

const TIPO_LABEL: Record<DocType, string> = {
  FE: 'Factura Electrónica',
  POS: 'Doc. Equiv. POS',
  NC: 'Nota Crédito',
  ND: 'Nota Débito',
}
const TIPO_CLS: Record<DocType, string> = {
  FE: 'badge-info', POS: 'badge-orange', NC: 'badge-warning', ND: 'badge-purple',
}
const ESTADO_CFG: Record<DocStatus, { cls: string; label: string; icon: React.ReactNode }> = {
  DRAFT:              { cls: 'badge-muted',    label: 'Borrador',          icon: <FileText size={10} /> },
  SENT_TO_PROVIDER:   { cls: 'badge-warning',  label: 'Enviado proveedor', icon: <Clock size={10} /> },
  VALIDATED_BY_DIAN:  { cls: 'badge-success',  label: 'Validado DIAN',     icon: <CheckCircle size={10} /> },
  REJECTED_BY_DIAN:   { cls: 'badge-danger',   label: 'Rechazado DIAN',    icon: <XCircle size={10} /> },
  FAILED_PROVIDER:    { cls: 'badge-danger',   label: 'Fallo proveedor',   icon: <AlertTriangle size={10} /> },
  CONTINGENCY:        { cls: 'badge-orange',   label: 'Contingencia',      icon: <AlertTriangle size={10} /> },
  VOIDED:             { cls: 'badge-muted',    label: 'Anulado',           icon: <XCircle size={10} /> },
}

const fmtCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

export default function BillingView() {
  const { addToast } = useApp()
  const [docs, setDocs] = useState<FiscalDoc[]>(SEED_DOCS)
  const [selected, setSelected] = useState<FiscalDoc | null>(docs[0])
  const [filterEstado, setFilterEstado] = useState<DocStatus | 'all'>('all')
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [newDocModal, setNewDocModal] = useState(false)
  const [creditNoteModal, setCreditNoteModal] = useState(false)
  const [creditNoteMotivo, setCreditNoteMotivo] = useState('')

  const setLoad = (key: string, val: boolean) =>
    setLoading(prev => ({ ...prev, [key]: val }))

  // Retry DIAN integration
  const handleRetry = useCallback(async (doc: FiscalDoc) => {
    setLoad(doc.id + '-retry', true)
    await new Promise(r => setTimeout(r, 1200))

    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const success = Math.random() > 0.4 // 60% chance of success on retry

    setDocs(prev => prev.map(d => {
      if (d.id !== doc.id) return d
      const newLog = { ts: now, evento: success ? 'Reintento exitoso — validado DIAN' : 'Reintento fallido — sin respuesta', ok: success }
      return {
        ...d,
        intentos: d.intentos + 1,
        estado: success ? 'VALIDATED_BY_DIAN' : d.estado,
        cufe: success ? `cufe_retry_${Date.now()}` : d.cufe,
        logs: [...d.logs, newLog],
      }
    }))

    // Keep selected in sync
    setSelected(prev => {
      if (!prev || prev.id !== doc.id) return prev
      const updated = docs.find(d => d.id === doc.id)
      return updated ?? prev
    })

    setLoad(doc.id + '-retry', false)
    addToast({
      type: success ? 'success' : 'error',
      title: success ? 'Reintento exitoso' : 'Reintento fallido',
      message: success ? `${doc.id} validado por DIAN.` : `${doc.id} sin respuesta — intenta de nuevo.`,
    })
  }, [docs, addToast])

  // Download PDF (simulated)
  const handleDownload = useCallback(async (doc: FiscalDoc, type: 'pdf' | 'xml') => {
    const key = doc.id + '-' + type
    setLoad(key, true)
    await new Promise(r => setTimeout(r, 800))
    setLoad(key, false)
    addToast({
      type: 'success',
      title: type === 'pdf' ? 'Representación gráfica' : 'XML generado',
      message: `${doc.prefijo}-${doc.consecutivo} listo para descarga.`,
    })
  }, [addToast])

  // Send to customer
  const handleSend = useCallback(async (doc: FiscalDoc) => {
    setLoad(doc.id + '-send', true)
    await new Promise(r => setTimeout(r, 700))
    setLoad(doc.id + '-send', false)
    addToast({ type: 'success', title: 'Enviado al cliente', message: `Documento ${doc.id} enviado por correo.` })
  }, [addToast])

  // Generate new POS doc
  const handleNewDoc = useCallback(async () => {
    setLoad('new-doc', true)
    await new Promise(r => setTimeout(r, 1000))
    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    const newDoc: FiscalDoc = {
      id: `FD-${String(docs.length + 1).padStart(3, '0')}`,
      tipo: 'POS', consecutivo: `0000${848 + docs.length}`, prefijo: 'POS',
      resolucion: '18760000001', fecha: `2026-07-08 ${now}`,
      adquirente: 'Consumidor Final', nit: '222222222',
      subtotal: 45000, iva: 0, inc: 3600, total: 48600,
      medioPago: 'Efectivo', estado: 'DRAFT',
      intentos: 0, pedidoId: 'PED-NUEVO',
      logs: [{ ts: now, evento: 'Documento creado en borrador', ok: true }],
    }
    setDocs(prev => [newDoc, ...prev])
    setSelected(newDoc)
    setLoad('new-doc', false)
    setNewDocModal(false)
    addToast({ type: 'success', title: 'Documento creado', message: `${newDoc.id} en borrador. Lista para envío.` })
  }, [docs, addToast])

  // Send DRAFT doc
  const handleSendDian = useCallback(async (doc: FiscalDoc) => {
    setLoad(doc.id + '-send-dian', true)
    await new Promise(r => setTimeout(r, 1100))
    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setDocs(prev => prev.map(d => d.id !== doc.id ? d : {
      ...d,
      estado: 'SENT_TO_PROVIDER',
      intentos: 1,
      logs: [...d.logs, { ts: now, evento: 'XML enviado a TecnoFact S.A.S', ok: true }],
    }))
    setSelected(prev => prev?.id === doc.id ? { ...prev, estado: 'SENT_TO_PROVIDER', intentos: 1 } : prev)
    setLoad(doc.id + '-send-dian', false)
    addToast({ type: 'info', title: 'Enviado al proveedor', message: `${doc.id} en tránsito hacia DIAN.` })
  }, [addToast])

  // Credit note
  const handleCreditNote = useCallback(async () => {
    if (!selected || !creditNoteMotivo.trim()) return
    setLoad('credit-note', true)
    await new Promise(r => setTimeout(r, 900))
    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    const nc: FiscalDoc = {
      id: `FD-NC-${Date.now().toString().slice(-4)}`,
      tipo: 'NC', consecutivo: `0000${22 + docs.filter(d => d.tipo === 'NC').length}`,
      prefijo: 'NC', resolucion: '18760000003',
      fecha: `2026-07-08 ${now}`, adquirente: selected.adquirente, nit: selected.nit,
      subtotal: selected.subtotal, iva: selected.iva, inc: selected.inc, total: selected.total,
      medioPago: selected.medioPago, estado: 'DRAFT',
      intentos: 0, pedidoId: selected.pedidoId,
      logs: [{ ts: now, evento: `Nota crédito creada — Motivo: ${creditNoteMotivo}`, ok: true }],
    }
    setDocs(prev => [nc, ...prev])
    setSelected(nc)
    setLoad('credit-note', false)
    setCreditNoteModal(false)
    setCreditNoteMotivo('')
    addToast({ type: 'success', title: 'Nota crédito creada', message: `${nc.id} asociada a ${selected.id}.` })
  }, [selected, creditNoteMotivo, docs, addToast])

  const filtered = filterEstado === 'all' ? docs : docs.filter(d => d.estado === filterEstado)
  // Keep selected in sync with docs mutations
  const syncSelected = selected ? (docs.find(d => d.id === selected.id) ?? selected) : null

  const counts = {
    total: docs.length,
    validados: docs.filter(d => d.estado === 'VALIDATED_BY_DIAN').length,
    pendientes: docs.filter(d => d.estado === 'SENT_TO_PROVIDER').length,
    rechazados: docs.filter(d => d.estado === 'REJECTED_BY_DIAN').length,
    contingencia: docs.filter(d => d.estado === 'CONTINGENCY').length,
    totalFacturado: docs.filter(d => d.estado === 'VALIDATED_BY_DIAN').reduce((s, d) => s + d.total, 0),
  }

  const needsAttention = counts.rechazados + counts.contingencia

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[
          { l: 'Docs Hoy', v: counts.total, c: '#3b82f6' },
          { l: 'Validados DIAN', v: counts.validados, c: '#22c55e' },
          { l: 'En tránsito', v: counts.pendientes, c: '#eab308' },
          { l: 'Rechazados', v: counts.rechazados, c: '#ef4444' },
          { l: 'Contingencia', v: counts.contingencia, c: '#f97316' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 5 }}>{k.l}</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      {needsAttention > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
            {counts.rechazados > 0 && `${counts.rechazados} doc(s) rechazado(s) por DIAN. `}
            {counts.contingencia > 0 && `${counts.contingencia} doc(s) en contingencia.`}
            {' '}Usa "Reintentar" para reenviar.
          </span>
        </div>
      )}

      {/* DIAN Disclaimer */}
      <div style={{ padding: '10px 14px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 8, fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
        <strong style={{ color: '#eab308' }}>⚠ Aviso legal:</strong> Los documentos generados son operativos internos. No constituyen factura electrónica válida ante la DIAN hasta que exista integración activa con proveedor tecnológico autorizado y validación efectiva.
        {' '}<span className="mono" style={{ color: 'var(--muted-foreground)' }}>Res. 000165/2023 · Res. 000008/2024 · INC Art. 512-1 ET</span>
      </div>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 340px)' }}>

        {/* Doc list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Status filters */}
            <div style={{ flex: 1, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(['all', 'VALIDATED_BY_DIAN', 'SENT_TO_PROVIDER', 'REJECTED_BY_DIAN', 'CONTINGENCY', 'DRAFT'] as const).map(f => (
                <button key={f} onClick={() => setFilterEstado(f)} style={{
                  padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                  background: filterEstado === f ? 'var(--primary)' : 'var(--secondary)',
                  color: filterEstado === f ? '#fff' : 'var(--muted-foreground)',
                  border: '1px solid var(--border)',
                }}>
                  {f === 'all' ? 'Todos' : ESTADO_CFG[f as DocStatus]?.label}
                </button>
              ))}
            </div>
            <Button
              variant="primary" size="sm"
              icon={<Plus size={13} />}
              loading={loading['new-doc']}
              onClick={() => setNewDocModal(true)}
            >
              Nuevo POS
            </Button>
          </div>

          <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--card)', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Tipo', 'Consecutivo', 'Fecha', 'Total', 'Estado', 'Intentos', 'Acciones'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => {
                  const cfg = ESTADO_CFG[doc.estado]
                  const isSelected = syncSelected?.id === doc.id
                  const canRetry = ['REJECTED_BY_DIAN', 'FAILED_PROVIDER', 'CONTINGENCY', 'SENT_TO_PROVIDER'].includes(doc.estado)
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => setSelected(doc)}
                      style={{
                        borderBottom: '1px solid rgba(30,45,69,0.5)',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--secondary)' : 'transparent',
                        transition: 'background 0.12s',
                      }}
                    >
                      <td style={{ padding: '9px 12px' }}>
                        <span className={`badge ${TIPO_CLS[doc.tipo]}`}>{TIPO_LABEL[doc.tipo]}</span>
                      </td>
                      <td style={{ padding: '9px 12px' }} className="mono">
                        <span style={{ fontSize: 12 }}>{doc.prefijo}-{doc.consecutivo}</span>
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: 11, color: 'var(--muted-foreground)' }}>{doc.fecha}</td>
                      <td style={{ padding: '9px 12px' }} className="mono">
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtCOP(doc.total)}</span>
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <span className={`badge ${cfg.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px' }} className="mono">
                        <span style={{ fontSize: 12, color: doc.intentos >= 3 ? '#ef4444' : 'var(--muted-foreground)' }}>
                          {doc.intentos}
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {doc.estado === 'DRAFT' && (
                            <Button variant="primary" size="sm"
                              icon={<Send size={11} />}
                              loading={loading[doc.id + '-send-dian']}
                              onClick={e => { e.stopPropagation(); handleSendDian(doc) }}
                            >
                              Enviar
                            </Button>
                          )}
                          {canRetry && doc.estado !== 'DRAFT' && (
                            <Button variant="warning" size="sm"
                              icon={<RefreshCw size={11} />}
                              loading={loading[doc.id + '-retry']}
                              onClick={e => { e.stopPropagation(); handleRetry(doc) }}
                            >
                              Reintentar
                            </Button>
                          )}
                          <Button variant="outline" size="sm"
                            icon={<Download size={11} />}
                            loading={loading[doc.id + '-pdf']}
                            onClick={e => { e.stopPropagation(); handleDownload(doc, 'pdf') }}
                          >
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {syncSelected && (
          <div style={{ width: 300, flexShrink: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                {syncSelected.prefijo}-{syncSelected.consecutivo}
              </div>
              <span className={`badge ${ESTADO_CFG[syncSelected.estado].cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {ESTADO_CFG[syncSelected.estado].icon} {ESTADO_CFG[syncSelected.estado].label}
              </span>
            </div>

            <Sec title="Información Fiscal">
              <DR l="Tipo" v={TIPO_LABEL[syncSelected.tipo]} />
              <DR l="Resolución" v={syncSelected.resolucion} mono />
              <DR l="Fecha" v={syncSelected.fecha} />
              <DR l="Pedido" v={syncSelected.pedidoId} mono />
              <DR l="Intentos DIAN" v={String(syncSelected.intentos)} mono />
            </Sec>

            <Sec title="Adquirente">
              <DR l="Nombre" v={syncSelected.adquirente} />
              <DR l="NIT / CC" v={syncSelected.nit} mono />
              <DR l="Medio pago" v={syncSelected.medioPago} />
            </Sec>

            <Sec title="Valores COP">
              <DR l="Subtotal" v={fmtCOP(syncSelected.subtotal)} mono />
              {syncSelected.inc > 0 && <DR l="INC (8%)" v={fmtCOP(syncSelected.inc)} mono />}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ fontSize: 13 }}>TOTAL</span>
                <span className="mono" style={{ color: 'var(--primary)' }}>{fmtCOP(syncSelected.total)}</span>
              </div>
            </Sec>

            {syncSelected.cufe && (
              <Sec title="CUFE / Trazabilidad">
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)', wordBreak: 'break-all', lineHeight: 1.6, background: 'var(--secondary)', padding: 8, borderRadius: 5 }}>
                  {syncSelected.cufe}
                </div>
              </Sec>
            )}

            <Sec title="Log de Eventos">
              {syncSelected.logs.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: ev.ok ? '#22c55e' : '#ef4444', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: 'var(--foreground)', lineHeight: 1.4 }}>{ev.evento}</div>
                    <div className="mono" style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{ev.ts}</div>
                  </div>
                </div>
              ))}
            </Sec>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {syncSelected.estado === 'DRAFT' && (
                <Button variant="primary" fullWidth
                  icon={<Send size={13} />}
                  loading={loading[syncSelected.id + '-send-dian']}
                  onClick={() => handleSendDian(syncSelected)}
                >
                  Enviar a DIAN
                </Button>
              )}
              {['REJECTED_BY_DIAN', 'FAILED_PROVIDER', 'CONTINGENCY', 'SENT_TO_PROVIDER'].includes(syncSelected.estado) && (
                <Button variant="warning" fullWidth
                  icon={<RefreshCw size={13} />}
                  loading={loading[syncSelected.id + '-retry']}
                  onClick={() => handleRetry(syncSelected)}
                >
                  Reintentar integración
                </Button>
              )}
              {syncSelected.estado === 'VALIDATED_BY_DIAN' && syncSelected.tipo !== 'NC' && (
                <Button variant="outline" fullWidth
                  icon={<FileText size={13} />}
                  loading={loading['credit-note']}
                  onClick={() => setCreditNoteModal(true)}
                >
                  Generar Nota Crédito
                </Button>
              )}
              <div style={{ display: 'flex', gap: 7 }}>
                <Button variant="outline" fullWidth size="sm"
                  icon={<Download size={12} />}
                  loading={loading[syncSelected.id + '-pdf']}
                  onClick={() => handleDownload(syncSelected, 'pdf')}
                >
                  PDF
                </Button>
                <Button variant="outline" fullWidth size="sm"
                  icon={<Download size={12} />}
                  loading={loading[syncSelected.id + '-xml']}
                  onClick={() => handleDownload(syncSelected, 'xml')}
                >
                  XML
                </Button>
                <Button variant="outline" fullWidth size="sm"
                  icon={<Send size={12} />}
                  loading={loading[syncSelected.id + '-send']}
                  onClick={() => handleSend(syncSelected)}
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New doc modal */}
      <Modal open={newDocModal} onClose={() => setNewDocModal(false)} title="Generar Documento POS" subtitle="Documento equivalente electrónico — operativo interno" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: 12, background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 8, fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
            <strong style={{ color: '#eab308' }}>Aviso:</strong> Este documento es operativo. No es válido ante la DIAN hasta integración activa con proveedor tecnológico autorizado.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { l: 'Tipo', v: 'Documento Equivalente POS' },
              { l: 'Resolución', v: '18760000001 · Vigente' },
              { l: 'Proveedor', v: 'TecnoFact S.A.S · Habilitado' },
              { l: 'INC aplicable', v: '8% — Art. 512-1 ET' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{r.l}</span>
                <span style={{ fontWeight: 500 }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setNewDocModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={loading['new-doc']} onClick={handleNewDoc}>
              Generar documento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Credit note modal */}
      <Modal open={creditNoteModal} onClose={() => setCreditNoteModal(false)} title="Generar Nota Crédito" subtitle={`Asociada a ${syncSelected?.id}`} width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
              Motivo de la nota crédito <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={creditNoteMotivo}
              onChange={e => setCreditNoteMotivo(e.target.value)}
              placeholder="Describe el motivo (devolución, error en precio, descuento post-venta...)"
              rows={3}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--foreground)', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setCreditNoteModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={loading['credit-note']}
              disabled={!creditNoteMotivo.trim()}
              onClick={handleCreditNote}
            >
              Crear Nota Crédito
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{children}</div>
    </div>
  )
}

function DR({ l, v, mono }: { l: string; v: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{l}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: 11, color: 'var(--foreground)', textAlign: 'right' }}>{v}</span>
    </div>
  )
}
