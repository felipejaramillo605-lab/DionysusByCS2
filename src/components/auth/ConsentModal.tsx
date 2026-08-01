import { useState } from 'react'
import { Shield, AlertTriangle, FileText, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'

export default function ConsentModal() {
  const { acceptConsent, logout, user } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [checked3, setChecked3] = useState(false)
  const [loading, setLoading] = useState(false)

  const allChecked = checked1 && checked2 && checked3
  const canAccept = scrolled && allChecked

  const handleAccept = async () => {
    if (!canAccept) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    acceptConsent()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9500,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        width: '100%',
        maxWidth: 620,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Políticas y Consentimientos</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Versión 2026-07-01 · Ley 1581/2012 Colombia</div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}
          onScroll={e => {
            const el = e.currentTarget
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolled(true)
          }}
        >
          {/* DIAN Critical Disclaimer */}
          <div style={{ padding: 16, background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.4)', borderRadius: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={16} color="#ef4444" />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#ef4444' }}>AVISO LEGAL — FACTURACIÓN ELECTRÓNICA DIAN</span>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--foreground)', margin: 0 }}>
              El sistema actualmente <strong>NO constituye un proveedor tecnológico autorizado por la DIAN</strong>. Las facturas o comprobantes generados dentro de la plataforma son únicamente <strong>documentos operativos para conciliación y control interno</strong> mientras se implementan integraciones fiscales autorizadas.
            </p>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--foreground)', margin: '10px 0 0' }}>
              El usuario entiende y acepta que dichos documentos <strong>no constituyen factura electrónica de venta ni documento equivalente electrónico válido ante la DIAN</strong>, salvo que exista integración activa con un proveedor tecnológico autorizado y validación efectiva del documento.
            </p>
          </div>

          {/* Privacy policy */}
          <Section icon={<FileText size={14} />} title="Política de Privacidad y Tratamiento de Datos">
            <p>De conformidad con la <strong>Ley 1581 de 2012</strong> y el Decreto 1377 de 2013, al utilizar RestaurantERP usted autoriza el tratamiento de sus datos personales con las siguientes finalidades:</p>
            <ul style={{ paddingLeft: 18, margin: '10px 0' }}>
              <li>Gestión operativa del restaurante (pedidos, facturación, inventario)</li>
              <li>Comunicaciones relacionadas con el servicio contratado</li>
              <li>Cumplimiento de obligaciones fiscales y contables</li>
              <li>Mejora de la plataforma y análisis estadístico anonimizado</li>
            </ul>
            <p><strong>Datos tratados:</strong> Nombre, correo electrónico, identificación, teléfono, dirección, historial de transacciones, preferencias operativas.</p>
            <p><strong>Sus derechos:</strong> Puede conocer, actualizar, rectificar o solicitar supresión de sus datos contactando a privacidad@erp-restaurante.co. La retención de datos financieros y fiscales se rige por el Estatuto Tributario y normativas contables aplicables.</p>
            <p><strong>Transferencia internacional:</strong> No se realizan transferencias internacionales de datos sin consentimiento explícito.</p>
          </Section>

          <Section icon={<Shield size={14} />} title="Seguridad y Responsabilidad">
            <p>El responsable del tratamiento de datos es RestaurantERP SAS · NIT: [En constitución]. Los datos se almacenan con cifrado en reposo y en tránsito. Los accesos están controlados por roles y se auditan todas las operaciones críticas.</p>
            <p>El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso. RestaurantERP no es responsable por accesos no autorizados derivados del uso indebido de contraseñas por parte del usuario.</p>
          </Section>

          <Section icon={<FileText size={14} />} title="Términos y Condiciones de Uso">
            <p>El acceso al sistema está restringido a usuarios autorizados por la compañía contratante. Queda prohibido:</p>
            <ul style={{ paddingLeft: 18, margin: '10px 0' }}>
              <li>Acceder a datos de otras compañías o sucursales sin autorización</li>
              <li>Manipular o eliminar registros fiscales, auditoría o logs del sistema</li>
              <li>Compartir credenciales de acceso con terceros no autorizados</li>
              <li>Realizar ingeniería inversa o extraer datos masivamente sin autorización</li>
            </ul>
            <p>El incumplimiento puede resultar en suspensión del acceso y acciones legales conforme a la legislación colombiana aplicable.</p>
          </Section>
        </div>

        {/* Checkboxes */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!scrolled && (
            <div style={{ fontSize: 11, color: '#eab308', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <AlertTriangle size={12} /> Desplázate hasta el final para leer el documento completo
            </div>
          )}

          {[
            { id: 1, val: checked1, set: setChecked1, label: 'He leído y acepto la Política de Privacidad y el Tratamiento de mis Datos Personales conforme a la Ley 1581 de 2012.' },
            { id: 2, val: checked2, set: setChecked2, label: 'Entiendo que los documentos generados NO constituyen factura electrónica válida ante la DIAN hasta que exista integración activa con proveedor tecnológico autorizado.' },
            { id: 3, val: checked3, set: setChecked3, label: 'Acepto los Términos y Condiciones de uso de la plataforma.' },
          ].map(item => (
            <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: scrolled ? 'pointer' : 'not-allowed', opacity: scrolled ? 1 : 0.5 }}>
              <div
                onClick={() => scrolled && item.set(v => !v)}
                style={{
                  width: 18, height: 18, borderRadius: 4, border: `2px solid ${item.val ? 'var(--primary)' : 'var(--border)'}`,
                  background: item.val ? 'var(--primary)' : 'transparent',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1, transition: 'background 0.15s, border-color 0.15s', cursor: 'pointer',
                }}
              >
                {item.val && <CheckCircle size={12} color="#fff" />}
              </div>
              <span style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--foreground)' }}>{item.label}</span>
            </label>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button variant="ghost" onClick={logout} size="md">
              Rechazar y salir
            </Button>
            <Button variant="primary" fullWidth loading={loading} onClick={handleAccept} disabled={!canAccept}>
              {!scrolled ? 'Lee el documento completo' : !allChecked ? 'Marca todas las casillas' : 'Aceptar y continuar'}
            </Button>
          </div>

          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', textAlign: 'center' }}>
            Usuario: {user?.email} · IP: 192.168.1.45 · {new Date().toLocaleString('es-CO')}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ color: 'var(--primary)' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--muted-foreground)', paddingLeft: 22 }}>
        {children}
      </div>
    </div>
  )
}
