import { useState } from 'react'
import { Shield, AlertTriangle, Eye, Lock, User, FileText, LogIn } from 'lucide-react'

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface AuditLog {
  id: string
  timestamp: string
  usuario: string
  accion: string
  recurso: string
  recursoId: string
  ip: string
  resultado: 'SUCCESS' | 'DENIED' | 'WARNING'
  riskLevel: RiskLevel
  companyId: string
  branchId: string
  detalle?: string
}

const logs: AuditLog[] = [
  { id: 'AL-8847', timestamp: '12:46:23', usuario: 'juan.r@parrilla.co', accion: 'orders.create', recurso: 'Order', recursoId: 'PED-2847', ip: '192.168.1.45', resultado: 'SUCCESS', riskLevel: 'LOW', companyId: 'CMP-001', branchId: 'BRN-001' },
  { id: 'AL-8846', timestamp: '12:44:11', usuario: 'maria.c@parrilla.co', accion: 'orders.discount.advanced', recurso: 'Order', recursoId: 'PED-2846', ip: '192.168.1.23', resultado: 'SUCCESS', riskLevel: 'MEDIUM', companyId: 'CMP-001', branchId: 'BRN-001', detalle: 'Descuento 5% autorizado por gerente' },
  { id: 'AL-8845', timestamp: '12:39:55', usuario: 'intento_externo@hack.io', accion: 'orders.read.branch', recurso: 'Order', recursoId: 'PED-2840', ip: '201.45.123.89', resultado: 'DENIED', riskLevel: 'HIGH', companyId: 'CMP-002', branchId: 'BRN-003', detalle: 'Intento de acceso a compañía diferente bloqueado por RLS' },
  { id: 'AL-8844', timestamp: '12:34:00', usuario: 'admin@erp.co', accion: 'companies.access_as_owner', recurso: 'Company', recursoId: 'CMP-001', ip: '10.0.0.1', resultado: 'SUCCESS', riskLevel: 'HIGH', companyId: 'CMP-001', branchId: 'BRN-001', detalle: 'Owner accedió a compañía como soporte' },
  { id: 'AL-8843', timestamp: '12:28:41', usuario: 'ana.l@parrilla.co', accion: 'users.assign_role', recurso: 'User', recursoId: 'USR-045', ip: '192.168.1.10', resultado: 'SUCCESS', riskLevel: 'MEDIUM', companyId: 'CMP-001', branchId: 'BRN-001' },
  { id: 'AL-8842', timestamp: '12:15:08', usuario: 'carlos.j@parrilla.co', accion: 'cash.open', recurso: 'CashRegister', recursoId: 'CAJA-002', ip: '192.168.2.11', resultado: 'SUCCESS', riskLevel: 'LOW', companyId: 'CMP-001', branchId: 'BRN-002' },
  { id: 'AL-8841', timestamp: '12:10:32', usuario: 'pedro.g@parrilla.co', accion: 'invoices.send_dian', recurso: 'Invoice', recursoId: 'FD-003', ip: '192.168.1.23', resultado: 'WARNING', riskLevel: 'MEDIUM', companyId: 'CMP-001', branchId: 'BRN-001', detalle: 'Documento enviado · respuesta DIAN pendiente' },
  { id: 'AL-8840', timestamp: '11:58:17', usuario: 'desconocido', accion: 'auth.login_failed', recurso: 'Session', recursoId: '—', ip: '187.79.44.201', resultado: 'DENIED', riskLevel: 'CRITICAL', companyId: '—', branchId: '—', detalle: 'Tercer intento fallido · cuenta bloqueada 15 min' },
  { id: 'AL-8839', timestamp: '11:42:00', usuario: 'maria.c@parrilla.co', accion: 'products.update_price', recurso: 'Product', recursoId: 'PRD-012', ip: '192.168.1.23', resultado: 'DENIED', riskLevel: 'HIGH', companyId: 'CMP-001', branchId: 'BRN-001', detalle: 'Sin permiso products.update_price — bloqueado por RBAC' },
]

const riskCls: Record<RiskLevel, string> = {
  LOW: 'badge-success',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-orange',
  CRITICAL: 'badge-danger',
}
const resultColor: Record<string, string> = {
  SUCCESS: '#22c55e',
  DENIED: '#ef4444',
  WARNING: '#eab308',
}
const resultIcon: Record<string, React.ReactNode> = {
  SUCCESS: <Eye size={12} />,
  DENIED: <Lock size={12} />,
  WARNING: <AlertTriangle size={12} />,
}

const actionIcon: Record<string, React.ReactNode> = {
  'auth.login_failed': <LogIn size={12} />,
  'users.assign_role': <User size={12} />,
  'invoices.send_dian': <FileText size={12} />,
  'companies.access_as_owner': <Shield size={12} />,
  default: <Eye size={12} />,
}

export default function AuditView() {
  const [selected, setSelected] = useState<AuditLog | null>(logs[0])
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all')

  const filtered = filterRisk === 'all' ? logs : logs.filter(l => l.riskLevel === filterRisk)

  const summary = {
    total: logs.length,
    high: logs.filter(l => l.riskLevel === 'HIGH' || l.riskLevel === 'CRITICAL').length,
    denied: logs.filter(l => l.resultado === 'DENIED').length,
    sessions: 14,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>Eventos Hoy</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{summary.total}</div>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={11} /> Alto riesgo</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{summary.high}</div>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={11} /> Accesos denegados</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{summary.denied}</div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><LogIn size={11} /> Sesiones activas</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{summary.sessions}</div>
        </div>
      </div>

      {/* BOLA alert */}
      <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={14} color="#ef4444" />
        <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
          AL-8840 · Intento de autenticación repetida desde IP 187.79.44.201 — cuenta bloqueada automáticamente.
        </span>
        <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: '#ef4444' }}>11:58:17</span>
      </div>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 310px)' }}>
        {/* Log list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(f => (
              <button key={f} onClick={() => setFilterRisk(f)} style={{
                padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                background: filterRisk === f ? 'var(--primary)' : 'var(--secondary)',
                color: filterRisk === f ? '#fff' : 'var(--muted-foreground)',
                border: `1px solid ${filterRisk === f ? 'var(--primary)' : 'var(--border)'}`,
              }}>
                {f === 'all' ? 'Todos' : f}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--card)', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Hora', 'Usuario', 'Acción', 'Recurso', 'IP', 'Resultado', 'Riesgo'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={i} onClick={() => setSelected(log)} style={{
                    borderBottom: '1px solid rgba(30,45,69,0.5)', cursor: 'pointer',
                    background: selected?.id === log.id ? 'var(--secondary)' : log.riskLevel === 'CRITICAL' ? 'rgba(239,68,68,0.04)' : 'transparent',
                  }}>
                    <td style={{ padding: '9px 12px' }} className="mono"><span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{log.timestamp}</span></td>
                    <td style={{ padding: '9px 12px', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.usuario}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span className="mono" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>{actionIcon[log.accion] || actionIcon.default}</span>
                        {log.accion}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: 11 }}>
                      <span style={{ color: 'var(--muted-foreground)' }}>{log.recurso}</span> <span className="mono" style={{ fontSize: 10 }}>{log.recursoId}</span>
                    </td>
                    <td style={{ padding: '9px 12px' }} className="mono"><span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{log.ip}</span></td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: resultColor[log.resultado] }}>
                        {resultIcon[log.resultado]} {log.resultado}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <span className={`badge ${riskCls[log.riskLevel]}`}>{log.riskLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width: 290, flexShrink: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{selected.id}</span>
                <span className={`badge ${riskCls[selected.riskLevel]}`}>{selected.riskLevel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: resultColor[selected.resultado], fontSize: 12, fontWeight: 600 }}>
                {resultIcon[selected.resultado]} {selected.resultado}
              </div>
            </div>

            {[
              { title: 'Evento', rows: [
                { l: 'Timestamp', v: selected.timestamp, mono: true },
                { l: 'Acción', v: selected.accion, mono: true },
                { l: 'Recurso', v: `${selected.recurso} / ${selected.recursoId}`, mono: true },
              ]},
              { title: 'Actor', rows: [
                { l: 'Usuario', v: selected.usuario },
                { l: 'IP Address', v: selected.ip, mono: true },
              ]},
              { title: 'Contexto Multi-Tenant', rows: [
                { l: 'company_id', v: selected.companyId, mono: true },
                { l: 'branch_id', v: selected.branchId, mono: true },
              ]},
            ].map((section, i) => (
              <div key={i}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{section.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {section.rows.map((row, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11 }}>
                      <span style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>{row.l}</span>
                      <span className={row.mono ? 'mono' : ''} style={{ color: 'var(--foreground)', textAlign: 'right', wordBreak: 'break-all', fontSize: 11 }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {selected.detalle && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Detalle</div>
                <div style={{ fontSize: 11, background: 'var(--secondary)', padding: 10, borderRadius: 6, color: 'var(--foreground)', lineHeight: 1.6 }}>
                  {selected.detalle}
                </div>
              </div>
            )}

            <div style={{ padding: '8px 10px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, fontSize: 10, color: 'var(--muted-foreground)' }}>
              <strong style={{ color: '#22c55e' }}>RLS verificado:</strong> Evento registrado con company_id inmutable. No editable por usuarios operativos.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
