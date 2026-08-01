import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { Download, TrendingUp } from 'lucide-react'

const weekData = [
  { dia: 'Lun', ventas: 8200000, pedidos: 128, anulaciones: 3 },
  { dia: 'Mar', ventas: 9100000, pedidos: 142, anulaciones: 1 },
  { dia: 'Mié', ventas: 7800000, pedidos: 119, anulaciones: 4 },
  { dia: 'Jue', ventas: 10400000, pedidos: 167, anulaciones: 2 },
  { dia: 'Vie', ventas: 13200000, pedidos: 210, anulaciones: 5 },
  { dia: 'Sáb', ventas: 16800000, pedidos: 268, anulaciones: 3 },
  { dia: 'Dom', ventas: 14580000, pedidos: 228, anulaciones: 2 },
]

const payMethods = [
  { name: 'Tarjeta débito', value: 42, color: '#3b82f6' },
  { name: 'Efectivo', value: 28, color: '#22c55e' },
  { name: 'Tarjeta crédito', value: 18, color: '#a855f7' },
  { name: 'Nequi/QR', value: 12, color: '#f97316' },
]

const taxReport = [
  { semana: 'S1 Jun', iva: 0, inc: 2840000, total: 2840000 },
  { semana: 'S2 Jun', iva: 0, inc: 3120000, total: 3120000 },
  { semana: 'S3 Jun', iva: 0, inc: 2980000, total: 2980000 },
  { semana: 'S4 Jun', iva: 0, inc: 3410000, total: 3410000 },
  { semana: 'S1 Jul', iva: 0, inc: 1840000, total: 1840000 },
]

const topProd = [
  { nombre: 'Costilla BBQ 400g', ventas: 312, ingresos: 14040000 },
  { nombre: 'Bandeja Paisa', ventas: 287, ingresos: 12054000 },
  { nombre: 'Hamburguesa Doble', ventas: 264, ingresos: 10032000 },
  { nombre: 'Lomo al Trapo', ventas: 198, ingresos: 12276000 },
  { nombre: 'Churrasco 300g', ventas: 174, ingresos: 9048000 },
]

const fmtCOP = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
const fmtM = (v: number) => `$${(v / 1000000).toFixed(1)}M`

export default function ReportsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Reportes & BI — Julio 2026</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Parrilla del Chef S.A.S · Sucursal Chapinero</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Semana', 'Mes', 'Trimestre'].map(p => (
            <button key={p} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '1px solid var(--border)', background: p === 'Semana' ? 'var(--primary)' : 'var(--secondary)', color: p === 'Semana' ? '#fff' : 'var(--muted-foreground)' }}>{p}</button>
          ))}
          <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { l: 'Ventas Semana', v: fmtCOP(80080000), sub: '+22% vs semana anterior', c: '#22c55e' },
          { l: 'Pedidos Semana', v: '1,262', sub: 'Promedio 180/día', c: '#3b82f6' },
          { l: 'INC Generado (8%)', v: fmtCOP(6406400), sub: 'Impuesto Nacional al Consumo', c: '#f97316' },
          { l: 'Ticket Promedio', v: fmtCOP(63452), sub: '+4.8% vs semana anterior', c: '#a855f7' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 6 }}>{k.l}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{k.v}</div>
            <div style={{ fontSize: 11, color: k.c, marginTop: 4 }}><TrendingUp size={10} style={{ display: 'inline', marginRight: 4 }} />{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Ventas por Día — Esta Semana</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtM} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={45} />
              <Tooltip contentStyle={{ background: '#131e32', border: '1px solid #1e2d45', borderRadius: 6, fontSize: 12 }} formatter={(v: number) => [fmtCOP(v), 'Ventas']} labelStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="ventas" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Medios de Pago</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={payMethods} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {payMethods.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#131e32', border: '1px solid #1e2d45', borderRadius: 6, fontSize: 12 }} formatter={(v: number) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {payMethods.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--muted-foreground)' }}>{m.name}</span>
                <span className="mono" style={{ fontWeight: 600 }}>{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Tax report */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Impuestos — INC Restaurante</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>INC 8% Art. 512-1 ET · IVA excluido restaurantes</div>
            </div>
            <button style={{ padding: '4px 10px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 5, background: 'var(--secondary)', cursor: 'pointer', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Download size={11} /> CSV Contador
            </button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={taxReport}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
              <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtM} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={45} />
              <Tooltip contentStyle={{ background: '#131e32', border: '1px solid #1e2d45', borderRadius: 6, fontSize: 12 }} formatter={(v: number) => [fmtCOP(v), 'INC']} />
              <Line type="monotone" dataKey="inc" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Productos Más Vendidos — Semana</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Producto', 'Ventas', 'Ingresos'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '4px 8px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProd.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(30,45,69,0.5)' }}>
                  <td style={{ padding: '8px 8px', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)', width: 14 }}>#{i + 1}</span>
                      {p.nombre}
                    </div>
                  </td>
                  <td style={{ padding: '8px 8px' }} className="mono"><span style={{ fontSize: 13, fontWeight: 700 }}>{p.ventas}</span></td>
                  <td style={{ padding: '8px 8px' }} className="mono"><span style={{ fontSize: 12, color: '#22c55e' }}>{fmtCOP(p.ingresos)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIAN compliance summary */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Resumen Documentos Fiscales — Semana</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {[
            { l: 'Docs POS emitidos', v: '1,247', c: '#3b82f6' },
            { l: 'Facturas electrónicas', v: '15', c: '#a855f7' },
            { l: 'Validados DIAN', v: '1,254', c: '#22c55e' },
            { l: 'Rechazados DIAN', v: '4', c: '#ef4444' },
            { l: 'En contingencia', v: '2', c: '#f97316' },
            { l: 'Notas crédito', v: '6', c: '#eab308' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--secondary)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 4 }}>{item.l}</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: item.c }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
