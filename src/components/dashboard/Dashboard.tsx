import { TrendingUp, ShoppingCart, Users, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import type { Module } from '../../App'

const salesData = [
  { hora: '8am', ventas: 280000, pedidos: 4 },
  { hora: '9am', ventas: 520000, pedidos: 8 },
  { hora: '10am', ventas: 380000, pedidos: 6 },
  { hora: '11am', ventas: 890000, pedidos: 14 },
  { hora: '12pm', ventas: 2340000, pedidos: 38 },
  { hora: '1pm', ventas: 2890000, pedidos: 46 },
  { hora: '2pm', ventas: 1950000, pedidos: 31 },
  { hora: '3pm', ventas: 720000, pedidos: 11 },
  { hora: '4pm', ventas: 480000, pedidos: 7 },
  { hora: '5pm', ventas: 680000, pedidos: 10 },
  { hora: '6pm', ventas: 1340000, pedidos: 21 },
  { hora: '7pm', ventas: 1980000, pedidos: 32 },
]

const topProducts = [
  { nombre: 'Costilla BBQ 400g', ventas: 48, total: 2880000 },
  { nombre: 'Hamburguesa Doble', ventas: 41, total: 1640000 },
  { nombre: 'Bandeja Paisa', ventas: 37, total: 1480000 },
  { nombre: 'Lomo al Trapo', ventas: 29, total: 1740000 },
  { nombre: 'Churrasco 300g', ventas: 26, total: 1300000 },
]

const recentOrders = [
  { id: 'PED-2847', mesa: 'Mesa 7', items: 4, total: 168000, estado: 'IN_PREPARATION', tiempo: '12 min' },
  { id: 'PED-2846', mesa: 'Mesa 3', items: 2, total: 89000, estado: 'READY', tiempo: '18 min' },
  { id: 'PED-2845', mesa: 'Domicilio', items: 3, total: 124000, estado: 'DELIVERED', tiempo: '35 min' },
  { id: 'PED-2844', mesa: 'Mesa 12', items: 6, total: 312000, estado: 'PAID', tiempo: '52 min' },
  { id: 'PED-2843', mesa: 'Mesa 1', items: 1, total: 38000, estado: 'CANCELLED', tiempo: '64 min' },
]

const estadoBadge: Record<string, { cls: string; label: string }> = {
  CREATED: { cls: 'badge-muted', label: 'Creado' },
  CONFIRMED: { cls: 'badge-info', label: 'Confirmado' },
  SENT_TO_KITCHEN: { cls: 'badge-orange', label: 'En cocina' },
  IN_PREPARATION: { cls: 'badge-warning', label: 'Preparando' },
  READY: { cls: 'badge-purple', label: 'Listo' },
  DELIVERED: { cls: 'badge-success', label: 'Entregado' },
  INVOICED: { cls: 'badge-info', label: 'Facturado' },
  PAID: { cls: 'badge-success', label: 'Pagado' },
  CANCELLED: { cls: 'badge-danger', label: 'Anulado' },
}

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`
const fmtCOP = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

interface Props { onNavigate: (m: Module) => void }

export default function Dashboard({ onNavigate }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KPICard icon={<DollarSign size={18} />} label="Ventas Hoy" value={fmtCOP(14580000)} sub="+18.4% vs ayer" color="#22c55e" />
        <KPICard icon={<ShoppingCart size={18} />} label="Pedidos Hoy" value="228" sub="12 activos ahora" color="#f97316" />
        <KPICard icon={<Users size={18} />} label="Mesas Ocupadas" value="9 / 15" sub="60% ocupación" color="#3b82f6" />
        <KPICard icon={<TrendingUp size={18} />} label="Ticket Promedio" value={fmtCOP(63947)} sub="+5.2% vs ayer" color="#a855f7" />
      </div>

      {/* Status strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <StatusStrip icon={<Clock size={13} />} label="En Preparación" count={5} color="#eab308" onClick={() => onNavigate('kds')} />
        <StatusStrip icon={<CheckCircle size={13} />} label="Listos para entregar" count={3} color="#22c55e" onClick={() => onNavigate('kds')} />
        <StatusStrip icon={<AlertTriangle size={13} />} label="Caja abierta" count={1} color="#f97316" onClick={() => onNavigate('pos')} />
        <StatusStrip icon={<XCircle size={13} />} label="Docs DIAN pendientes" count={2} color="#ef4444" onClick={() => onNavigate('billing')} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        {/* Sales chart */}
        <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Ventas por hora — Hoy</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Sucursal Chapinero · 8 jul 2026</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={salesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
              <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: '#131e32', border: '1px solid #1e2d45', borderRadius: 6, fontSize: 12 }}
                formatter={(v: number) => [fmtCOP(v), 'Ventas']}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="ventas" stroke="#f97316" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 13 }}>Top Productos Hoy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topProducts.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--foreground)' }}>{p.nombre}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{p.ventas} uds</span>
                </div>
                <div style={{ height: 4, background: 'var(--secondary)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${(p.ventas / 48) * 100}%`, background: 'var(--primary)', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Recent orders */}
        <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Pedidos Recientes</div>
            <button onClick={() => onNavigate('orders')} style={{ fontSize: 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todos →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Origen', 'Items', 'Total', 'Estado', 'Tiempo'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '4px 8px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500, letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => {
                const badge = estadoBadge[o.estado]
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30,45,69,0.5)' }}>
                    <td style={{ padding: '7px 8px' }} className="mono"><span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{o.id}</span></td>
                    <td style={{ padding: '7px 8px', fontSize: 12 }}>{o.mesa}</td>
                    <td style={{ padding: '7px 8px', fontSize: 12 }} className="mono">{o.items}</td>
                    <td style={{ padding: '7px 8px', fontSize: 12 }} className="mono">{fmtCOP(o.total)}</td>
                    <td style={{ padding: '7px 8px' }}><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                    <td style={{ padding: '7px 8px', fontSize: 11, color: 'var(--muted-foreground)' }} className="mono">{o.tiempo}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pedidos por hora bar */}
        <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Pedidos por Hora</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Volumen operativo del día</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={salesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
              <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                contentStyle={{ background: '#131e32', border: '1px solid #1e2d45', borderRadius: 6, fontSize: 12 }}
                formatter={(v: number) => [v, 'Pedidos']}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="pedidos" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-company panel */}
      <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Vista Multi-Compañía — Owner Plataforma</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { nombre: 'Parrilla del Chef S.A.S', nit: '901.234.567-1', sucursales: 3, ventas: 48900000, estado: 'Activa' },
            { nombre: 'Fogón Colombiano Ltda', nit: '800.123.456-2', sucursales: 2, ventas: 31200000, estado: 'Activa' },
            { nombre: 'Sabores del Llano S.A.S', nit: '700.987.654-3', sucursales: 1, ventas: 12400000, estado: 'Prueba' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'var(--secondary)', borderRadius: 6, padding: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{c.nombre}</div>
                <span className={`badge ${c.estado === 'Activa' ? 'badge-success' : 'badge-warning'}`}>{c.estado}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }} className="mono">NIT: {c.nit}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8 }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{c.sucursales} sucursales</span>
                <span style={{ color: 'var(--foreground)', fontWeight: 600 }} className="mono">{fmtCOP(c.ventas)}/mes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KPICard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>{label}</div>
        <div style={{ padding: 6, background: `${color}18`, borderRadius: 6, color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
      <div style={{ fontSize: 11, color }}>{sub}</div>
    </div>
  )
}

function StatusStrip({ icon, label, count, color, onClick }: { icon: React.ReactNode; label: string; count: number; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 8,
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', width: '100%', textAlign: 'left',
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 12, color: 'var(--foreground)' }}>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color }}>{count}</span>
    </button>
  )
}
