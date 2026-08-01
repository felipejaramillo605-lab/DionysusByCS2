import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'CREATED' | 'CONFIRMED' | 'SENT_TO_KITCHEN'
  | 'IN_PREPARATION' | 'READY' | 'DELIVERED'
  | 'INVOICED' | 'PAID' | 'CANCELLED' | 'VOIDED'
  | 'REFUNDED' | 'PARTIALLY_PAID' | 'FAILED_INTEGRATION'

export type OrderType = 'mesa' | 'domicilio' | 'llevar' | 'qr' | 'web' | 'telefono'

export interface OrderItem {
  producto: string
  cantidad: number
  precio: number
  notas?: string
}

export interface OrderStatusEvent {
  from: OrderStatus
  to: OrderStatus
  usuarioId: string
  usuario: string
  ts: string
  motivo?: string
  ip: string
}

export interface Order {
  id: string
  tipo: OrderType
  mesa?: string
  cliente?: string
  items: OrderItem[]
  subtotal: number
  iva: number
  inc: number
  descuento: number
  descuentoMotivo?: string
  descuentoAutorizador?: string
  total: number
  estado: OrderStatus
  cajero: string
  createdAt: string
  updatedAt: string
  tiempoTranscurrido: string
  statusHistory: OrderStatusEvent[]
  idempotencyKey?: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

export interface AuditEntry {
  id: string
  ts: string
  usuario: string
  accion: string
  recurso: string
  recursoId: string
  resultado: 'SUCCESS' | 'DENIED' | 'WARNING'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  companyId: string
  branchId: string
  detalle?: string
  ip: string
}

export interface User {
  id: string
  nombre: string
  email: string
  rol: string
  companyId: string
  branchId: string
  mfa: boolean
  consentAccepted: boolean
  consentVersion: string
}

// ─── Order state machine ───────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SENT_TO_KITCHEN', 'CANCELLED'],
  SENT_TO_KITCHEN: ['IN_PREPARATION', 'CANCELLED'],
  IN_PREPARATION: ['READY', 'PARTIALLY_READY', 'CANCELLED'],
  PARTIALLY_READY: ['READY'],
  READY: ['DELIVERED'],
  DELIVERED: ['INVOICED', 'PARTIALLY_PAID'],
  INVOICED: ['PAID', 'REFUNDED', 'VOIDED'],
  PAID: ['REFUNDED'],
  CANCELLED: [],
  VOIDED: [],
  REFUNDED: [],
  PARTIALLY_PAID: ['PAID', 'REFUNDED'],
  FAILED_INTEGRATION: ['INVOICED'],
}

const TERMINAL_STATES: OrderStatus[] = ['PAID', 'CANCELLED', 'VOIDED', 'REFUNDED']

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL_STATES.includes(status)
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const CURRENT_USER: User = {
  id: 'USR-001',
  nombre: 'Ana López',
  email: 'ana.l@parrilla.co',
  rol: 'Gerente de Sucursal',
  companyId: 'CMP-001',
  branchId: 'BRN-001',
  mfa: true,
  consentAccepted: false,
  consentVersion: '2026-07-01',
}

function makeHistory(eventos: Array<{ from: OrderStatus; to: OrderStatus; usuario: string; ts: string; motivo?: string }>): OrderStatusEvent[] {
  return eventos.map(e => ({ ...e, usuarioId: 'USR-001', ip: '192.168.1.45' }))
}

const SEED_ORDERS: Order[] = [
  {
    id: 'PED-2847', tipo: 'mesa', mesa: 'Mesa 7',
    items: [
      { producto: 'Costilla BBQ 400g', cantidad: 2, precio: 45000 },
      { producto: 'Coca Cola 400ml', cantidad: 2, precio: 8000 },
    ],
    subtotal: 106000, iva: 0, inc: 8480, descuento: 0, total: 114480,
    estado: 'IN_PREPARATION', cajero: 'Juan Rodríguez',
    createdAt: '12:34', updatedAt: '12:42', tiempoTranscurrido: '12 min',
    statusHistory: makeHistory([
      { from: 'CREATED', to: 'CONFIRMED', usuario: 'Juan Rodríguez', ts: '12:34' },
      { from: 'CONFIRMED', to: 'SENT_TO_KITCHEN', usuario: 'Juan Rodríguez', ts: '12:35' },
      { from: 'SENT_TO_KITCHEN', to: 'IN_PREPARATION', usuario: 'Sistema KDS', ts: '12:36' },
    ]),
  },
  {
    id: 'PED-2846', tipo: 'mesa', mesa: 'Mesa 3',
    items: [
      { producto: 'Bandeja Paisa', cantidad: 1, precio: 42000 },
      { producto: 'Jugo de Maracuyá', cantidad: 1, precio: 9000 },
    ],
    subtotal: 51000, iva: 0, inc: 4080, descuento: 5100,
    descuentoMotivo: '5% descuento cliente frecuente', descuentoAutorizador: 'Ana López',
    total: 49980, estado: 'READY', cajero: 'María Castillo',
    createdAt: '12:28', updatedAt: '12:46', tiempoTranscurrido: '18 min',
    statusHistory: makeHistory([
      { from: 'CREATED', to: 'CONFIRMED', usuario: 'María Castillo', ts: '12:28' },
      { from: 'CONFIRMED', to: 'SENT_TO_KITCHEN', usuario: 'María Castillo', ts: '12:29' },
      { from: 'SENT_TO_KITCHEN', to: 'IN_PREPARATION', usuario: 'Sistema KDS', ts: '12:31' },
      { from: 'IN_PREPARATION', to: 'READY', usuario: 'Pedro García', ts: '12:46' },
    ]),
  },
  {
    id: 'PED-2845', tipo: 'domicilio', cliente: 'Carlos Vargas',
    items: [
      { producto: 'Hamburguesa Doble', cantidad: 2, precio: 38000 },
      { producto: 'Papas Fritas Grande', cantidad: 2, precio: 12000 },
    ],
    subtotal: 100000, iva: 0, inc: 8000, descuento: 0, total: 108000,
    estado: 'DELIVERED', cajero: 'Luis Pérez',
    createdAt: '12:11', updatedAt: '12:46', tiempoTranscurrido: '35 min',
    statusHistory: makeHistory([
      { from: 'CREATED', to: 'CONFIRMED', usuario: 'Luis Pérez', ts: '12:11' },
      { from: 'CONFIRMED', to: 'SENT_TO_KITCHEN', usuario: 'Luis Pérez', ts: '12:12' },
      { from: 'SENT_TO_KITCHEN', to: 'IN_PREPARATION', usuario: 'Sistema KDS', ts: '12:14' },
      { from: 'IN_PREPARATION', to: 'READY', usuario: 'Pedro García', ts: '12:35' },
      { from: 'READY', to: 'DELIVERED', usuario: 'Luis Pérez', ts: '12:46' },
    ]),
  },
  {
    id: 'PED-2844', tipo: 'mesa', mesa: 'Mesa 12',
    items: [
      { producto: 'Lomo al Trapo 400g', cantidad: 3, precio: 62000 },
      { producto: 'Ensalada César', cantidad: 2, precio: 18000 },
      { producto: 'Agua Mineral', cantidad: 3, precio: 5000 },
    ],
    subtotal: 237000, iva: 0, inc: 18960, descuento: 23700, total: 232260,
    estado: 'PAID', cajero: 'Ana López',
    createdAt: '11:54', updatedAt: '12:46', tiempoTranscurrido: '52 min',
    statusHistory: makeHistory([
      { from: 'CREATED', to: 'CONFIRMED', usuario: 'Ana López', ts: '11:54' },
      { from: 'CONFIRMED', to: 'SENT_TO_KITCHEN', usuario: 'Ana López', ts: '11:55' },
      { from: 'SENT_TO_KITCHEN', to: 'IN_PREPARATION', usuario: 'Sistema KDS', ts: '11:57' },
      { from: 'IN_PREPARATION', to: 'READY', usuario: 'Pedro García', ts: '12:20' },
      { from: 'READY', to: 'DELIVERED', usuario: 'Ana López', ts: '12:25' },
      { from: 'DELIVERED', to: 'INVOICED', usuario: 'María Castillo', ts: '12:40' },
      { from: 'INVOICED', to: 'PAID', usuario: 'María Castillo', ts: '12:46' },
    ]),
  },
  {
    id: 'PED-2843', tipo: 'qr', mesa: 'Mesa 5 (QR)',
    items: [{ producto: 'Arroz con Pollo', cantidad: 1, precio: 28000 }],
    subtotal: 28000, iva: 0, inc: 2240, descuento: 0, total: 30240,
    estado: 'CANCELLED', cajero: 'Sistema QR',
    createdAt: '11:42', updatedAt: '11:55', tiempoTranscurrido: '64 min',
    statusHistory: makeHistory([
      { from: 'CREATED', to: 'CONFIRMED', usuario: 'Sistema QR', ts: '11:42' },
      { from: 'CONFIRMED', to: 'CANCELLED', usuario: 'Ana López', ts: '11:55', motivo: 'Cliente canceló pedido antes de cocina' },
    ]),
  },
  {
    id: 'PED-2842', tipo: 'llevar', cliente: 'Pedro Gómez',
    items: [
      { producto: 'Churrasco 300g', cantidad: 1, precio: 52000 },
      { producto: 'Gaseosa Mediana', cantidad: 1, precio: 7000 },
    ],
    subtotal: 59000, iva: 0, inc: 4720, descuento: 0, total: 63720,
    estado: 'CREATED', cajero: 'Juan Rodríguez',
    createdAt: '12:48', updatedAt: '12:48', tiempoTranscurrido: '2 min',
    statusHistory: [],
  },
]

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  // Auth
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  consentAccepted: boolean
  acceptConsent: () => void

  // Orders
  orders: Order[]
  transitionOrder: (orderId: string, to: OrderStatus, motivo?: string) => Promise<{ ok: boolean; error?: string }>
  getOrder: (id: string) => Order | undefined

  // Toasts
  toasts: Toast[]
  addToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Audit
  auditLogs: AuditEntry[]
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const toastIdRef = useRef(0)

  // ── Toasts ──
  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = String(++toastIdRef.current)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id))
  }, [])

  // ── Audit ──
  const pushAudit = useCallback((entry: Omit<AuditEntry, 'id' | 'ts' | 'ip' | 'companyId' | 'branchId'>) => {
    const id = `AL-${Date.now()}`
    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setAuditLogs(prev => [{
      ...entry, id, ts: now, ip: '192.168.1.45',
      companyId: user?.companyId ?? '—', branchId: user?.branchId ?? '—',
    }, ...prev])
  }, [user])

  // ── Auth ──
  const login = useCallback(async (email: string, _password: string): Promise<{ ok: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 900))

    const validEmails = ['ana.l@parrilla.co', 'admin@erp.co', 'demo@erp.co']
    if (!validEmails.includes(email.toLowerCase().trim())) {
      return { ok: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' }
    }

    const loggedUser: User = { ...CURRENT_USER, email, consentAccepted: false }
    setUser(loggedUser)
    setConsentAccepted(false)

    pushAudit({
      usuario: email,
      accion: 'auth.login_success',
      recurso: 'Session',
      recursoId: `SES-${Date.now()}`,
      resultado: 'SUCCESS',
      riskLevel: 'LOW',
      detalle: 'Inicio de sesión exitoso',
    })

    return { ok: true }
  }, [pushAudit])

  const logout = useCallback(() => {
    if (user) {
      pushAudit({
        usuario: user.email,
        accion: 'auth.logout',
        recurso: 'Session',
        recursoId: 'CURRENT',
        resultado: 'SUCCESS',
        riskLevel: 'LOW',
        detalle: 'Cierre de sesión. Refresh token invalidado.',
      })
    }
    setUser(null)
    setConsentAccepted(false)
    localStorage.clear()
    sessionStorage.clear()
  }, [user, pushAudit])

  const acceptConsent = useCallback(() => {
    setConsentAccepted(true)
    if (user) {
      pushAudit({
        usuario: user.email,
        accion: 'user.consent_accepted',
        recurso: 'UserConsent',
        recursoId: `CNS-${Date.now()}`,
        resultado: 'SUCCESS',
        riskLevel: 'LOW',
        detalle: 'Política de privacidad v2026-07-01 aceptada. Tratamiento de datos autorizado.',
      })
    }
  }, [user, pushAudit])

  // ── Orders ──
  const transitionOrder = useCallback(async (
    orderId: string,
    to: OrderStatus,
    motivo?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return { ok: false, error: 'Pedido no encontrado' }

    if (!canTransition(order.estado, to)) {
      const msg = `Transición inválida: ${order.estado} → ${to}`
      addToast({ type: 'error', title: 'Transición no permitida', message: msg })
      pushAudit({
        usuario: user?.email ?? 'desconocido',
        accion: `orders.transition_denied.${to}`,
        recurso: 'Order',
        recursoId: orderId,
        resultado: 'DENIED',
        riskLevel: 'MEDIUM',
        detalle: msg,
      })
      return { ok: false, error: msg }
    }

    if (['VOIDED', 'CANCELLED'].includes(to) && !motivo) {
      return { ok: false, error: 'Se requiere motivo para anular o cancelar' }
    }

    // Simulated network call
    await new Promise(r => setTimeout(r, 500))

    const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    const event: OrderStatusEvent = {
      from: order.estado,
      to,
      usuarioId: user?.id ?? 'USR-001',
      usuario: user?.nombre ?? 'Usuario',
      ts: now,
      motivo,
      ip: '192.168.1.45',
    }

    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, estado: to, updatedAt: now, statusHistory: [...o.statusHistory, event] }
        : o
    ))

    pushAudit({
      usuario: user?.email ?? 'sistema',
      accion: `orders.transition.${to.toLowerCase()}`,
      recurso: 'Order',
      recursoId: orderId,
      resultado: 'SUCCESS',
      riskLevel: ['VOIDED', 'CANCELLED', 'REFUNDED'].includes(to) ? 'HIGH' : 'LOW',
      detalle: motivo ? `Motivo: ${motivo}` : undefined,
    })

    addToast({
      type: 'success',
      title: 'Estado actualizado',
      message: `${orderId} → ${to}`,
    })

    return { ok: true }
  }, [orders, user, addToast, pushAudit])

  const getOrder = useCallback((id: string) => orders.find(o => o.id === id), [orders])

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user,
      login, logout, consentAccepted, acceptConsent,
      orders, transitionOrder, getOrder,
      toasts, addToast, removeToast,
      auditLogs,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
