import { useState } from 'react'
import { Building2, MapPin, Users, Shield, Key, CheckCircle, XCircle, Settings } from 'lucide-react'

const tabs = ['Compañías', 'Sucursales', 'Usuarios & Roles', 'Permisos', 'Configuración Fiscal']

const companies = [
  { nombre: 'Parrilla del Chef S.A.S', nit: '901.234.567-1', sucursales: 3, usuarios: 18, plan: 'Pro', estado: 'Activa', facturacion: 'FE + POS', regimen: 'Responsable IVA' },
  { nombre: 'Fogón Colombiano Ltda', nit: '800.123.456-2', sucursales: 2, usuarios: 11, plan: 'Básico', estado: 'Activa', facturacion: 'POS', regimen: 'No responsable IVA' },
  { nombre: 'Sabores del Llano S.A.S', nit: '700.987.654-3', sucursales: 1, usuarios: 5, plan: 'Prueba', estado: 'Prueba', facturacion: 'POS', regimen: 'No responsable IVA' },
]

const users = [
  { nombre: 'Juan Rodríguez', email: 'juan.r@parrilla.co', rol: 'Mesero', sucursal: 'Chapinero', estado: 'Activo', mfa: false, ultimoAcceso: '12:34' },
  { nombre: 'María Castillo', email: 'maria.c@parrilla.co', rol: 'Cajero', sucursal: 'Chapinero', estado: 'Activo', mfa: true, ultimoAcceso: '11:20' },
  { nombre: 'Pedro García', email: 'pedro.g@parrilla.co', rol: 'Cocina/Bar', sucursal: 'Chapinero', estado: 'Activo', mfa: false, ultimoAcceso: '08:00' },
  { nombre: 'Ana López', email: 'ana.l@parrilla.co', rol: 'Gerente de Sucursal', sucursal: 'Chapinero', estado: 'Activo', mfa: true, ultimoAcceso: 'Ayer' },
  { nombre: 'Carlos Jiménez', email: 'carlos.j@parrilla.co', rol: 'Cajero', sucursal: 'Usaquén', estado: 'Inactivo', mfa: false, ultimoAcceso: 'Hace 3 días' },
]

const permisos = [
  { permiso: 'orders.create', mesero: true, cajero: true, cocina: false, gerente: true },
  { permiso: 'orders.read.branch', mesero: false, cajero: true, cocina: true, gerente: true },
  { permiso: 'orders.cancel', mesero: false, cajero: true, cocina: false, gerente: true },
  { permiso: 'orders.void', mesero: false, cajero: false, cocina: false, gerente: true },
  { permiso: 'orders.discount.advanced', mesero: false, cajero: false, cocina: false, gerente: true },
  { permiso: 'payments.create', mesero: false, cajero: true, cocina: false, gerente: true },
  { permiso: 'payments.reverse', mesero: false, cajero: false, cocina: false, gerente: true },
  { permiso: 'cash.open', mesero: false, cajero: true, cocina: false, gerente: true },
  { permiso: 'cash.close', mesero: false, cajero: true, cocina: false, gerente: true },
  { permiso: 'invoices.create', mesero: false, cajero: true, cocina: false, gerente: true },
  { permiso: 'invoices.send_dian', mesero: false, cajero: true, cocina: false, gerente: true },
  { permiso: 'inventory.adjust', mesero: false, cajero: false, cocina: false, gerente: true },
  { permiso: 'products.update_price', mesero: false, cajero: false, cocina: false, gerente: false },
  { permiso: 'security.logs.view', mesero: false, cajero: false, cocina: false, gerente: false },
]

const rolColor: Record<string, string> = {
  'Mesero': 'badge-info',
  'Cajero': 'badge-orange',
  'Cocina/Bar': 'badge-warning',
  'Gerente de Sucursal': 'badge-success',
  'Administrador de Compañía': 'badge-purple',
  'Inventario': 'badge-muted',
}

export default function AdminView() {
  const [tab, setTab] = useState(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: tab === i ? 'var(--secondary)' : 'transparent',
            color: tab === i ? 'var(--foreground)' : 'var(--muted-foreground)',
            border: 'none', transition: 'background 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Compañías / Clientes — Owner Plataforma</div>
            <button style={{ padding: '7px 14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Nueva Compañía</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {companies.map((c, i) => (
              <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={18} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{c.nombre}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>NIT: {c.nit}</div>
                    </div>
                  </div>
                  <span className={`badge ${c.estado === 'Activa' ? 'badge-success' : 'badge-warning'}`}>{c.estado}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { icon: <MapPin size={11} />, label: `${c.sucursales} sucursales` },
                    { icon: <Users size={11} />, label: `${c.usuarios} usuarios` },
                    { icon: <Shield size={11} />, label: c.facturacion },
                    { icon: <Key size={11} />, label: c.plan },
                  ].map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', background: 'var(--secondary)', padding: '4px 8px', borderRadius: 4, marginBottom: 10 }}>
                  {c.regimen}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ flex: 1, padding: '6px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: 'var(--foreground)' }}>Gestionar</button>
                  <button style={{ padding: '6px 10px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: '#f97316' }}>Acceder</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Usuarios — Parrilla del Chef S.A.S</div>
            <button style={{ padding: '7px 14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Nuevo Usuario</button>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
                  {['Usuario', 'Email', 'Rol', 'Sucursal', 'MFA', 'Último acceso', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30,45,69,0.5)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500 }}>{u.nombre}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--muted-foreground)' }}>{u.email}</td>
                    <td style={{ padding: '10px 14px' }}><span className={`badge ${rolColor[u.rol] || 'badge-muted'}`}>{u.rol}</span></td>
                    <td style={{ padding: '10px 14px', fontSize: 12 }}>{u.sucursal}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {u.mfa
                        ? <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={13} /> Activo</span>
                        : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={13} /> Inactivo</span>}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--muted-foreground)' }} className="mono">{u.ultimoAcceso}</td>
                    <td style={{ padding: '10px 14px' }}><span className={`badge ${u.estado === 'Activo' ? 'badge-success' : 'badge-muted'}`}>{u.estado}</span></td>
                    <td style={{ padding: '10px 14px' }}>
                      <button style={{ padding: '3px 8px', fontSize: 10, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--foreground)' }}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Matriz de Roles y Permisos — RBAC</div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
                  <th style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500, width: 240 }}>Permiso</th>
                  {['Mesero', 'Cajero', 'Cocina/Bar', 'Gerente'].map(r => (
                    <th key={r} style={{ textAlign: 'center', padding: '9px 14px', fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 500 }}>{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permisos.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30,45,69,0.5)' }}>
                    <td style={{ padding: '8px 14px' }} className="mono"><span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{p.permiso}</span></td>
                    {[p.mesero, p.cajero, p.cocina, p.gerente].map((ok, j) => (
                      <td key={j} style={{ padding: '8px 14px', textAlign: 'center' }}>
                        {ok
                          ? <CheckCircle size={14} color="#22c55e" />
                          : <XCircle size={14} color="rgba(100,116,139,0.3)" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: 12, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11, color: 'var(--muted-foreground)' }}>
            <strong style={{ color: '#3b82f6' }}>RLS activo:</strong> Todas las consultas SQL filtran por <code>company_id</code> y <code>branch_id</code> a nivel de base de datos. Ningún usuario puede acceder a datos de otra compañía aunque manipule el ID. El rol de aplicación no tiene BYPASSRLS.
          </div>
        </div>
      )}

      {tab === 4 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={14} /> Configuración Fiscal Colombia
            </div>
            {[
              { l: 'Tipo de compañía', v: 'Restaurante / Expendio' },
              { l: 'Régimen tributario', v: 'Responsable de IVA' },
              { l: 'INC restaurante', v: '8% (Art. 512-1 ET)' },
              { l: 'IVA aplicable', v: 'Excluido (alimentos preparados)' },
              { l: 'Tipo documento principal', v: 'Doc. Equivalente POS Electrónico' },
              { l: 'Resolución POS', v: '18760000001 · Vigente' },
              { l: 'Resolución FE', v: '18760000002 · Vigente' },
              { l: 'Proveedor tecnológico', v: 'TecnoFact S.A.S · Habilitado' },
              { l: 'Contingencia activa', v: 'Configurada · 72h máximo' },
              { l: 'Ley 1581/2012', v: 'Política de datos publicada' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(30,45,69,0.5)', fontSize: 12 }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{row.l}</span>
                <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: 200 }}>{row.v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Parametrización de Impuestos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { nombre: 'INC Estándar Restaurante', tipo: 'INC', tasa: '8%', aplica: 'Comidas y bebidas preparadas en restaurante, para llevar y domicilio', activo: true },
                { nombre: 'IVA Estándar', tipo: 'IVA', tasa: '19%', aplica: 'Productos gravados (no aplica por defecto en restaurantes)', activo: false },
                { nombre: 'Excluido IVA', tipo: 'IVA', tasa: '0%', aplica: 'Alimentos sin transformar, productos básicos', activo: true },
              ].map((imp, i) => (
                <div key={i} style={{ padding: 12, background: 'var(--secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{imp.nombre}</div>
                      <span className={`badge ${imp.tipo === 'INC' ? 'badge-orange' : 'badge-info'}`}>{imp.tipo} {imp.tasa}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 36, height: 18, borderRadius: 9,
                        background: imp.activo ? 'var(--primary)' : 'var(--border)',
                        position: 'relative', cursor: 'pointer',
                      }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: 3, left: imp.activo ? 20 : 4,
                          transition: 'left 0.2s',
                        }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{imp.aplica}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(tab === 1) && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>
          Vista de sucursales — selecciona una compañía desde la pestaña Compañías para gestionar sus sedes.
        </div>
      )}
    </div>
  )
}
