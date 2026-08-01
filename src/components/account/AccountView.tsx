import { useState } from 'react'
import { User, Shield, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

type DeleteStep = 1 | 2 | 3 | 4 | 5

export default function AccountView() {
  const { user, logout, addToast } = useApp()
  const [tab, setTab] = useState<'perfil' | 'seguridad' | 'eliminar'>('perfil')

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteStep, setDeleteStep] = useState<DeleteStep>(1)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteOtp, setDeleteOtp] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const openDeleteFlow = () => {
    setDeleteStep(1)
    setDeletePassword('')
    setDeleteReason('')
    setDeleteOtp('')
    setOtpSent(false)
    setDeleteOpen(true)
  }

  const nextStep = async () => {
    if (deleteStep === 2 && !deletePassword) {
      addToast({ type: 'error', title: 'Contraseña requerida', message: 'Ingresa tu contraseña para continuar.' })
      return
    }
    if (deleteStep === 2 && deletePassword !== 'Demo1234!') {
      addToast({ type: 'error', title: 'Contraseña incorrecta', message: 'Verifica tu contraseña e intenta de nuevo.' })
      return
    }
    if (deleteStep === 3 && !deleteReason.trim()) {
      addToast({ type: 'error', title: 'Motivo requerido', message: 'Indica el motivo de eliminación.' })
      return
    }
    if (deleteStep === 4 && !otpSent) {
      setLoadingDelete(true)
      await new Promise(r => setTimeout(r, 700))
      setLoadingDelete(false)
      setOtpSent(true)
      addToast({ type: 'info', title: 'OTP enviado', message: `Código enviado a ${user?.email} · Demo: 999999` })
      return
    }
    if (deleteStep === 4 && deleteOtp !== '999999') {
      addToast({ type: 'error', title: 'OTP incorrecto', message: 'Verifica el código enviado a tu correo.' })
      return
    }
    if (deleteStep === 4 && deleteOtp === '999999') {
      setDeleteStep(5)
      return
    }
    setDeleteStep(s => (s + 1) as DeleteStep)
  }

  const confirmDelete = async () => {
    setLoadingDelete(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoadingDelete(false)
    setDeleteOpen(false)
    addToast({
      type: 'info',
      title: 'Cuenta marcada para eliminación',
      message: 'Soft-delete registrado. Datos anonimizados. Trazabilidad fiscal conservada.',
    })
    setTimeout(() => logout(), 2000)
  }

  if (!user) return null

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={26} color="var(--primary)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user.nombre}</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{user.email} · {user.rol}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
        {(['perfil', 'seguridad', 'eliminar'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '7px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: tab === t ? (t === 'eliminar' ? 'rgba(239,68,68,0.12)' : 'var(--secondary)') : 'transparent',
            color: tab === t ? (t === 'eliminar' ? '#ef4444' : 'var(--foreground)') : 'var(--muted-foreground)',
            border: 'none',
          }}>
            {t === 'perfil' ? 'Mi Perfil' : t === 'seguridad' ? 'Seguridad' : '⚠ Eliminar Cuenta'}
          </button>
        ))}
      </div>

      {/* PERFIL */}
      {tab === 'perfil' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Información de cuenta</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { l: 'Nombre completo', v: user.nombre },
              { l: 'Correo electrónico', v: user.email },
              { l: 'Rol asignado', v: user.rol },
              { l: 'Compañía', v: 'Parrilla del Chef S.A.S' },
              { l: 'Sucursal', v: 'Chapinero · BRN-001' },
              { l: 'ID de usuario', v: user.id },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ fontSize: 10, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.l}</label>
                <div style={{ padding: '9px 12px', background: 'var(--secondary)', borderRadius: 6, fontSize: 13, border: '1px solid var(--border)' }} className={f.l === 'ID de usuario' ? 'mono' : ''}>
                  {f.v}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button variant="outline" onClick={() => addToast({ type: 'info', title: 'Edición de perfil', message: 'Esta función requiere verificación MFA.' })}>
              Editar perfil
            </Button>
          </div>
        </div>
      )}

      {/* SEGURIDAD */}
      {tab === 'seguridad' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Estado de seguridad</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Autenticación MFA', active: user.mfa, desc: 'App autenticadora activa' },
                { label: 'Contraseña', active: true, desc: 'Última actualización hace 30 días' },
                { label: 'Sesiones activas', active: true, desc: '1 sesión · Chrome · 192.168.1.45' },
                { label: 'Refresh token', active: true, desc: 'Rotativo · expira en 7 días' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: item.active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.active
                      ? <CheckCircle size={18} color="#22c55e" />
                      : <AlertTriangle size={18} color="#ef4444" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{item.desc}</div>
                  </div>
                  <span className={`badge ${item.active ? 'badge-success' : 'badge-danger'}`}>
                    {item.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Acciones de seguridad</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="outline" icon={<Lock size={14} />}
                onClick={() => addToast({ type: 'info', title: 'Cambio de contraseña', message: 'OTP enviado a tu correo electrónico.' })}>
                Cambiar contraseña
              </Button>
              <Button variant="outline" icon={<Shield size={14} />}
                onClick={() => addToast({ type: 'info', title: 'Configurar MFA', message: 'Escanea el QR con tu app autenticadora.' })}>
                {user.mfa ? 'Reconfigurar MFA' : 'Activar MFA'}
              </Button>
              <Button variant="danger" icon={<Lock size={14} />}
                onClick={() => addToast({ type: 'warning', title: 'Sesiones cerradas', message: 'Todas las sesiones activas han sido invalidadas.' })}>
                Cerrar todas las sesiones
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ELIMINAR */}
      {tab === 'eliminar' && (
        <div style={{ background: 'rgba(239,68,68,0.04)', border: '2px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Trash2 size={22} color="#ef4444" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#ef4444' }}>Eliminar cuenta</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Esta acción es irreversible</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {[
              'Tu cuenta quedará en soft-delete — datos operativos no se borran físicamente.',
              'Los datos personales serán anonimizados conforme a la Ley 1581/2012.',
              'La trazabilidad fiscal, auditoría y documentos contables se conservan por ley.',
              'No podrás recuperar el acceso una vez confirmado.',
              'Las facturas y documentos DIAN se conservan por el tiempo legal requerido.',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'var(--muted-foreground)' }}>
                <AlertTriangle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                {item}
              </div>
            ))}
          </div>
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={openDeleteFlow}>
            Iniciar proceso de eliminación
          </Button>
        </div>
      )}

      {/* DELETE MODAL */}
      <Modal
        open={deleteOpen}
        onClose={deleteStep < 5 ? () => setDeleteOpen(false) : undefined}
        closeable={deleteStep < 5}
        title={`Eliminar cuenta — Paso ${deleteStep} de 4`}
        subtitle="Proceso irreversible con verificación múltiple"
        width={480}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= deleteStep ? '#ef4444' : 'var(--border)', transition: 'background 0.2s' }} />
            ))}
          </div>

          {/* Step 1: Warning */}
          {deleteStep === 1 && (
            <>
              <div style={{ padding: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8, fontSize: 13 }}>⚠ Advertencia — Acción irreversible</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
                  Al eliminar tu cuenta, tus datos personales serán anonimizados. Los registros financieros, facturas y logs de auditoría se conservarán por obligación legal. No podrás recuperar el acceso.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                <Button variant="danger" onClick={() => setDeleteStep(2)}>Entiendo — Continuar</Button>
              </div>
            </>
          )}

          {/* Step 2: Password */}
          {deleteStep === 2 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Confirma tu contraseña</div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  style={{ width: '100%', padding: '10px 40px 10px 12px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--foreground)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
                <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>Demo: usa Demo1234!</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                <Button variant="danger" onClick={nextStep}>Verificar contraseña</Button>
              </div>
            </>
          )}

          {/* Step 3: Reason */}
          {deleteStep === 3 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Motivo de eliminación</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['Ya no uso el servicio', 'Problemas técnicos', 'Cambio de plataforma', 'Privacidad de datos', 'Otro motivo'].map(r => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', background: deleteReason === r ? 'rgba(239,68,68,0.1)' : 'var(--secondary)', borderRadius: 6, border: `1px solid ${deleteReason === r ? 'rgba(239,68,68,0.4)' : 'var(--border)'}` }}>
                    <input type="radio" checked={deleteReason === r} onChange={() => setDeleteReason(r)} style={{ accentColor: '#ef4444' }} />
                    <span style={{ fontSize: 12 }}>{r}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setDeleteStep(2)}>Atrás</Button>
                <Button variant="danger" onClick={nextStep} disabled={!deleteReason}>Continuar</Button>
              </div>
            </>
          )}

          {/* Step 4: OTP */}
          {deleteStep === 4 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Verificación por correo electrónico</div>
              {!otpSent ? (
                <>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                    Enviaremos un código de verificación a <strong>{user?.email}</strong> para confirmar la eliminación.
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setDeleteStep(3)}>Atrás</Button>
                    <Button variant="danger" loading={loadingDelete} onClick={nextStep}>Enviar código OTP</Button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Ingresa el código enviado a tu correo. <strong style={{ color: 'var(--foreground)' }}>Demo: 999999</strong></div>
                  <input
                    type="text"
                    maxLength={6}
                    value={deleteOtp}
                    onChange={e => setDeleteOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    style={{ padding: '10px 12px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--foreground)', fontSize: 16, fontFamily: 'JetBrains Mono, monospace', outline: 'none', letterSpacing: '0.3em', textAlign: 'center' }}
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setDeleteStep(3)}>Atrás</Button>
                    <Button variant="danger" onClick={nextStep} disabled={deleteOtp.length !== 6}>Verificar OTP</Button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Step 5: Final confirmation */}
          {deleteStep === 5 && (
            <>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <Trash2 size={40} color="#ef4444" style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Confirmación final</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
                  Estás a punto de eliminar la cuenta <strong>{user?.email}</strong>.<br />
                  Motivo registrado: <strong>{deleteReason}</strong>.<br />
                  Esta acción es <strong>irreversible</strong>.
                </div>
              </div>
              <div style={{ padding: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 11, color: '#ef4444', lineHeight: 1.6 }}>
                Se ejecutará: <strong>soft-delete</strong> (deleted_at, deleted_by, deletion_reason). Datos personales anonimizados. Trazabilidad fiscal conservada por ley.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" fullWidth onClick={() => setDeleteOpen(false)}>Cancelar — mantener cuenta</Button>
                <Button variant="danger" fullWidth loading={loadingDelete} icon={<Trash2 size={14} />} onClick={confirmDelete}>
                  Eliminar definitivamente
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
