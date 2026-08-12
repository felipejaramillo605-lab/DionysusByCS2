import { useState } from 'react'
import { AlertTriangle, Package, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'

interface Product {
  id: string
  nombre: string
  categoria: string
  unidad: string
  stock: number
  stockMin: number
  stockMax: number
  costo: number
  bodega: string
  ultimoMovimiento: string
}

const products: Product[] = [
  { id: 'INV-001', nombre: 'Costilla de res (kg)', categoria: 'Carnes', unidad: 'kg', stock: 18.5, stockMin: 10, stockMax: 50, costo: 28000, bodega: 'Nevera 1', ultimoMovimiento: '08:30' },
  { id: 'INV-002', nombre: 'Lomo de res (kg)', categoria: 'Carnes', unidad: 'kg', stock: 7.2, stockMin: 8, stockMax: 40, costo: 35000, bodega: 'Nevera 1', ultimoMovimiento: '08:30' },
  { id: 'INV-003', nombre: 'Pollo entero (kg)', categoria: 'Carnes', unidad: 'kg', stock: 22.0, stockMin: 10, stockMax: 60, costo: 12000, bodega: 'Nevera 2', ultimoMovimiento: '07:00' },
  { id: 'INV-004', nombre: 'Papa criolla (kg)', categoria: 'Verduras', unidad: 'kg', stock: 45.0, stockMin: 20, stockMax: 100, costo: 3500, bodega: 'Bodega Seca', ultimoMovimiento: '06:00' },
  { id: 'INV-005', nombre: 'Arroz blanco (kg)', categoria: 'Granos', unidad: 'kg', stock: 38.0, stockMin: 20, stockMax: 80, costo: 2800, bodega: 'Bodega Seca', ultimoMovimiento: '06:00' },
  { id: 'INV-006', nombre: 'Fríjol rojo (kg)', categoria: 'Granos', unidad: 'kg', stock: 4.5, stockMin: 5, stockMax: 30, costo: 7000, bodega: 'Bodega Seca', ultimoMovimiento: '10:00' },
  { id: 'INV-007', nombre: 'Coca Cola 400ml (und)', categoria: 'Bebidas', unidad: 'und', stock: 120, stockMin: 50, stockMax: 300, costo: 2200, bodega: 'Refrigerador Bar', ultimoMovimiento: '12:00' },
  { id: 'INV-008', nombre: 'Aceite vegetal (lt)', categoria: 'Insumos', unidad: 'lt', stock: 8.0, stockMin: 5, stockMax: 25, costo: 9500, bodega: 'Bodega Seca', ultimoMovimiento: '06:00' },
]

const movements = [
  { hora: '12:46', tipo: 'SALIDA', producto: 'Costilla de res (kg)', cantidad: -1.6, motivo: 'Pedido PED-2847', usuario: 'Sistema' },
  { hora: '12:34', tipo: 'SALIDA', producto: 'Lomo de res (kg)', cantidad: -2.4, motivo: 'Pedido PED-2844', usuario: 'Sistema' },
  { hora: '11:00', tipo: 'ENTRADA', producto: 'Papa criolla (kg)', cantidad: 25.0, motivo: 'OC-2024-089', usuario: 'María García' },
  { hora: '10:30', tipo: 'AJUSTE', producto: 'Fríjol rojo (kg)', cantidad: -0.5, motivo: 'Merma por vencimiento', usuario: 'Pedro López' },
  { hora: '08:30', tipo: 'ENTRADA', producto: 'Costilla de res (kg)', cantidad: 12.0, motivo: 'OC-2024-091', usuario: 'María García' },
  { hora: '07:00', tipo: 'ENTRADA', producto: 'Pollo entero (kg)', cantidad: 15.0, motivo: 'OC-2024-092', usuario: 'Sistema' },
]

const fmtCOP = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

export default function InventoryView() {
  const [selectedCat, setSelectedCat] = useState('Todos')
  const cats = ['Todos', ...Array.from(new Set(products.map(p => p.categoria)))]

  const filtered = selectedCat === 'Todos' ? products : products.filter(p => p.categoria === selectedCat)
  const lowStock = products.filter(p => p.stock < p.stockMin)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>Total Referencias</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{products.length}</div>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#ef4444', marginBottom: 4 }}>
            <AlertTriangle size={12} /> Stock Crítico
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{lowStock.length}</div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>Valor Inventario Est.</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{fmtCOP(products.reduce((s, p) => s + p.stock * p.costo, 0))}</div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>Movimientos Hoy</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{movements.length}</div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
            {lowStock.map(p => p.nombre).join(' · ')} — por debajo del mínimo
          </span>
          <button style={{ marginLeft: 'auto', padding: '4px 12px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>
            Generar OC
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Product table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Category filters */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, overflowX: 'auto' }}>
            {cats.map(c => (
              <button key={c} onClick={() => setSelectedCat(c)} style={{
                padding: '4px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                background: selectedCat === c ? 'var(--primary)' : 'var(--secondary)',
                color: selectedCat === c ? '#fff' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}>{c}</button>
            ))}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
                {['Producto', 'Categoría', 'Stock actual', 'Mín/Máx', 'Costo unit.', 'Bodega', 'Último mov.', 'Estado'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const critical = p.stock < p.stockMin
                const pct = Math.min(100, (p.stock / p.stockMax) * 100)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30,45,69,0.5)', background: critical ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Package size={13} color={critical ? '#ef4444' : 'var(--muted-foreground)'} />
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{p.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: 11, color: 'var(--muted-foreground)' }}>{p.categoria}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: critical ? '#ef4444' : 'var(--foreground)' }}>
                          {p.stock} {p.unidad}
                        </span>
                        <div style={{ width: 50, height: 4, background: 'var(--secondary)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: critical ? '#ef4444' : pct > 50 ? '#22c55e' : '#eab308', borderRadius: 2 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '9px 12px' }} className="mono"><span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{p.stockMin}/{p.stockMax}</span></td>
                    <td style={{ padding: '9px 12px' }} className="mono"><span style={{ fontSize: 12 }}>{fmtCOP(p.costo)}</span></td>
                    <td style={{ padding: '9px 12px', fontSize: 11, color: 'var(--muted-foreground)' }}>{p.bodega}</td>
                    <td style={{ padding: '9px 12px' }} className="mono"><span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{p.ultimoMovimiento}</span></td>
                    <td style={{ padding: '9px 12px' }}>
                      {critical
                        ? <span className="badge badge-danger">Crítico</span>
                        : pct > 70 ? <span className="badge badge-success">OK</span>
                        : <span className="badge badge-warning">Bajo</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Movements */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, overflow: 'auto' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Movimientos de Hoy
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><RefreshCw size={13} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {movements.map((m, i) => (
              <div key={i} style={{ padding: 10, background: 'var(--secondary)', borderRadius: 6, borderLeft: `3px solid ${m.tipo === 'ENTRADA' ? '#22c55e' : m.tipo === 'SALIDA' ? '#ef4444' : '#eab308'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: m.tipo === 'ENTRADA' ? '#22c55e' : m.tipo === 'SALIDA' ? '#ef4444' : '#eab308' }}>
                    {m.tipo === 'ENTRADA' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {m.tipo}
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{m.hora}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{m.producto}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 2 }}>{m.motivo}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{m.usuario}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: m.cantidad > 0 ? '#22c55e' : '#ef4444' }}>
                    {m.cantidad > 0 ? '+' : ''}{m.cantidad}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
