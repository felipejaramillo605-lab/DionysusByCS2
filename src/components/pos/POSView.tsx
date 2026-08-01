import { useState, useCallback } from 'react'
import { Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt, Lock, Unlock, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'

interface CartItem {
  id: string
  nombre: string
  precio: number
  cantidad: number
  incPct: number
}

const MENU = [
  { id: 'p1', nombre: 'Costilla BBQ 400g',    precio: 45000, cat: 'Carnes',          incPct: 8 },
  { id: 'p2', nombre: 'Lomo al Trapo 400g',   precio: 62000, cat: 'Carnes',          incPct: 8 },
  { id: 'p3', nombre: 'Churrasco 300g',        precio: 52000, cat: 'Carnes',          incPct: 8 },
  { id: 'p4', nombre: 'Hamburguesa Doble',     precio: 38000, cat: 'Carnes',          incPct: 8 },
  { id: 'p5', nombre: 'Bandeja Paisa',         precio: 42000, cat: 'Platos',          incPct: 8 },
  { id: 'p6', nombre: 'Arroz con Pollo',       precio: 28000, cat: 'Platos',          incPct: 8 },
  { id: 'p7', nombre: 'Ensalada César',        precio: 18000, cat: 'Platos',          incPct: 0 },
  { id: 'p8', nombre: 'Papas Fritas Grande',   precio: 12000, cat: 'Acompañamientos', incPct: 0 },
  { id: 'p9', nombre: 'Arroz con Coco',        precio:  8000, cat: 'Acompañamientos', incPct: 0 },
  { id: 'p10', nombre: 'Coca Cola 400ml',      precio:  8000, cat: 'Bebidas',         incPct: 0 },
  { id: 'p11', nombre: 'Jugo de Maracuyá',     precio:  9000, cat: 'Bebidas',         incPct: 0 },
  { id: 'p12', nombre: 'Agua Mineral 500ml',   precio:  5000, cat: 'Bebidas',         incPct: 0 },
]

const CATS = ['Todos', ...Array.from(new Set(MENU.map(p => p.cat)))]

const fmtCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

type PayMethod = 'tarjeta' | 'efectivo' | 'nequi'

export default function POSView() {
  const { addToast } = useApp()
  const [cart, setCart]         = useState<CartItem[]>([])
  const [cat, setCat]           = useState('Todos')
  const [cajaAbierta, setCaja]  = useState(true)
  const [descuento, setDescuento] = useState(0)
  const [propina, setPropina]   = useState(0)
  const [payMethod, setPayMethod] = useState<PayMethod>('tarjeta')
  const [loadingCobro, setLoadingCobro] = useState(false)
  const [loadingCaja, setLoadingCaja]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [effectivo, setEfectivo] = useState('')   // cash tendered

  const addItem = useCallback((p: typeof MENU[0]) => {
    if (!cajaAbierta) {
      addToast({ type: 'error', title: 'Caja cerrada', message: 'Abre la caja antes de registrar ventas.' })
      return
    }
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id)
      if (ex) return prev.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1, incPct: p.incPct }]
    })
  }, [cajaAbierta, addToast])

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty  = (id: string, delta: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i).filter(i => i.cantidad > 0))

  const subtotal    = cart.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const incTotal    = cart.reduce((s, i) => s + (i.incPct > 0 ? i.precio * i.cantidad * i.incPct / 100 : 0), 0)
  const descuentoVal= Math.round(subtotal * descuento / 100)
  const propinaVal  = Math.round(subtotal * propina / 100)
  const total       = subtotal + incTotal - descuentoVal + propinaVal
  const cambio      = payMethod === 'efectivo' && effectivo ? Math.max(0, Number(effectivo.replace(/\D/g, '')) - total) : 0

  const filtered = cat === 'Todos' ? MENU : MENU.filter(p => p.cat === cat)

  const handleToggleCaja = useCallback(async () => {
    setLoadingCaja(true)
    await new Promise(r => setTimeout(r, 600))
    setLoadingCaja(false)
    const next = !cajaAbierta
    setCaja(next)
    addToast({
      type: next ? 'success' : 'info',
      title: next ? 'Caja abierta' : 'Caja cerrada',
      message: next ? 'Puedes registrar ventas.' : 'Cierre registrado con auditoría.',
    })
  }, [cajaAbierta, addToast])

  const handleCobrar = useCallback(async () => {
    if (!cajaAbierta) { addToast({ type: 'error', title: 'Caja cerrada', message: 'Abre la caja primero.' }); return }
    if (cart.length === 0) { addToast({ type: 'warning', title: 'Carrito vacío', message: 'Agrega productos antes de cobrar.' }); return }
    if (payMethod === 'efectivo' && effectivo) {
      const tendered = Number(effectivo.replace(/\D/g, ''))
      if (tendered < total) { addToast({ type: 'error', title: 'Efectivo insuficiente', message: `Faltan ${fmtCOP(total - tendered)}.` }); return }
    }

    setLoadingCobro(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoadingCobro(false)
    setSuccess(true)

    addToast({
      type: 'success',
      title: '¡Cobro exitoso!',
      message: `${fmtCOP(total)} · ${payMethod} · Doc. POS generado.`,
    })

    setTimeout(() => {
      setSuccess(false)
      setCart([])
      setDescuento(0)
      setPropina(0)
      setEfectivo('')
    }, 2000)
  }, [cajaAbierta, cart, payMethod, effectivo, total, addToast])

  const handleFactura = useCallback(async () => {
    if (cart.length === 0) { addToast({ type: 'warning', title: 'Carrito vacío', message: 'Agrega productos antes de facturar.' }); return }
    addToast({ type: 'info', title: 'Generando factura electrónica', message: 'Redirigiendo al módulo de Facturación...' })
  }, [cart, addToast])

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 96px)' }}>

      {/* Left: menu grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Caja status bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 8,
          background: cajaAbierta ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
          border: `1px solid ${cajaAbierta ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {cajaAbierta
            ? <Unlock size={14} color="#22c55e" />
            : <Lock size={14} color="#ef4444" />}
          <span style={{ fontSize: 12, fontWeight: 600, color: cajaAbierta ? '#22c55e' : '#ef4444' }}>
            {cajaAbierta ? 'Caja Abierta' : 'Caja Cerrada'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Turno: Ana López · apertura 7:00 am</span>
          <Button
            variant={cajaAbierta ? 'danger' : 'success'}
            size="sm"
            loading={loadingCaja}
            onClick={handleToggleCaja}
            style={{ marginLeft: 'auto' }}
          >
            {cajaAbierta ? 'Cerrar Caja' : 'Abrir Caja'}
          </Button>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)',
              background: cat === c ? 'var(--primary)' : 'var(--card)',
              color: cat === c ? '#fff' : 'var(--muted-foreground)',
              cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
              transition: 'background 0.12s, color 0.12s',
            }}>
              {c}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10, alignContent: 'start' }}>
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => addItem(p)}
              disabled={!cajaAbierta}
              style={{
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8,
                padding: 12, cursor: cajaAbierta ? 'pointer' : 'not-allowed',
                textAlign: 'left', opacity: cajaAbierta ? 1 : 0.45,
                transition: 'border-color 0.12s, transform 0.1s',
              }}
              onMouseEnter={e => { if (cajaAbierta) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.01)' } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              onMouseDown={e => { if (cajaAbierta) (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)' }}
              onMouseUp={e => { if (cajaAbierta) (e.currentTarget as HTMLElement).style.transform = 'scale(1.01)' }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{p.nombre}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                  {fmtCOP(p.precio)}
                </span>
                {p.incPct > 0 && (
                  <span style={{ fontSize: 10, background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '1px 5px', borderRadius: 3 }}>
                    INC {p.incPct}%
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: cart + payment */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Cart */}
        <div style={{ flex: 1, background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            Pedido Actual
            {cart.length > 0 && (
              <button onClick={() => setCart([])} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                Limpiar
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {cart.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: 28, fontSize: 12 }}>
                Toca un producto para agregar
              </div>
            )}
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px', background: 'var(--secondary)', borderRadius: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{fmtCOP(item.precio)}/u</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>
                    <Minus size={10} />
                  </button>
                  <span className="mono" style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.cantidad}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>
                    <Plus size={10} />
                  </button>
                </div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600, minWidth: 68, textAlign: 'right' }}>
                  {fmtCOP(item.precio * item.cantidad)}
                </span>
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Descuento + Propina */}
          {cart.length > 0 && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 5 }}>Descuento</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 5, 10, 15].map(d => (
                      <button key={d} onClick={() => setDescuento(d)} style={{
                        flex: 1, padding: '4px 0', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                        background: descuento === d ? 'rgba(239,68,68,0.15)' : 'var(--secondary)',
                        color: descuento === d ? '#ef4444' : 'var(--muted-foreground)',
                        border: `1px solid ${descuento === d ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                        transition: 'background 0.1s',
                      }}>{d}%</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 5 }}>Propina</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 5, 10].map(p => (
                      <button key={p} onClick={() => setPropina(p)} style={{
                        flex: 1, padding: '4px 0', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                        background: propina === p ? 'rgba(34,197,94,0.15)' : 'var(--secondary)',
                        color: propina === p ? '#22c55e' : 'var(--muted-foreground)',
                        border: `1px solid ${propina === p ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                        transition: 'background 0.1s',
                      }}>{p}%</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <TR l="Subtotal" v={fmtCOP(subtotal)} />
                {incTotal > 0 && <TR l="INC 8% (restaurante)" v={fmtCOP(incTotal)} />}
                {descuentoVal > 0 && <TR l={`Descuento (${descuento}%)`} v={`-${fmtCOP(descuentoVal)}`} c="#ef4444" />}
                {propinaVal > 0 && <TR l={`Propina (${propina}%)`} v={fmtCOP(propinaVal)} c="#22c55e" />}
                <div style={{ borderTop: '2px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>TOTAL</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>{fmtCOP(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment */}
        {cart.length > 0 && (
          <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>Medio de Pago</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
              {([
                { id: 'tarjeta', label: 'Tarjeta',   icon: <CreditCard size={16} /> },
                { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={16} /> },
                { id: 'nequi',   label: 'Nequi/QR',  icon: <Smartphone size={16} /> },
              ] as const).map(m => (
                <button key={m.id} onClick={() => setPayMethod(m.id)} style={{
                  padding: '8px 4px', borderRadius: 6, cursor: 'pointer',
                  background: payMethod === m.id ? 'rgba(249,115,22,0.1)' : 'var(--secondary)',
                  border: `1px solid ${payMethod === m.id ? 'var(--primary)' : 'var(--border)'}`,
                  color: payMethod === m.id ? 'var(--primary)' : 'var(--muted-foreground)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'background 0.12s, border-color 0.12s',
                }}>
                  {m.icon}
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Cash tendered */}
            {payMethod === 'efectivo' && (
              <div>
                <label style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>Efectivo recibido</label>
                <input
                  type="text"
                  value={effectivo}
                  onChange={e => setEfectivo(e.target.value)}
                  placeholder={fmtCOP(total)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--foreground)', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', outline: 'none', boxSizing: 'border-box' }}
                />
                {cambio > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
                    Cambio: <span className="mono">{fmtCOP(cambio)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Cobrar button */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={loadingCobro}
              onClick={handleCobrar}
              icon={success ? <CheckCircle size={16} /> : <Receipt size={16} />}
              style={success ? { background: '#22c55e', borderColor: '#22c55e' } : undefined}
            >
              {success ? '¡Cobrado!' : `Cobrar ${fmtCOP(total)}`}
            </Button>

            <Button variant="outline" fullWidth size="sm" onClick={handleFactura}>
              Generar Factura Electrónica
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function TR({ l, v, c }: { l: string; v: string; c?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--muted-foreground)' }}>{l}</span>
      <span className="mono" style={{ color: c || 'var(--foreground)' }}>{v}</span>
    </div>
  )
}
