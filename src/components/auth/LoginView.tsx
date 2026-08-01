import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Utensils, Shield, AlertCircle, ArrowRight, Smartphone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'

type LoginMethod = 'password' | 'otp' | 'google'

const DEMO_ACCOUNTS = [
  { email: 'ana.l@parrilla.co', rol: 'Gerente de Sucursal', mfa: true },
  { email: 'admin@erp.co', rol: 'Owner Plataforma', mfa: true },
  { email: 'demo@erp.co', rol: 'Cajero (Demo)', mfa: false },
]

export default function LoginView() {
  const { login, addToast } = useApp()
  const [method, setMethod] = useState<LoginMethod>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return }
    if (method === 'password' && !password) { setError('Ingresa tu contraseña.'); return }
    if (method === 'otp' && !otpSent) { setError('Primero envía el código OTP.'); return }
    if (method === 'otp' && otpSent && otpCode !== '123456') {
      setError('Código OTP inválido. Intenta de nuevo.')
      return
    }
    if (mfaRequired && !mfaCode) { setError('Ingresa el código MFA de tu app autenticadora.'); return }
    if (mfaRequired && mfaCode !== '000000' && mfaCode.length === 6) {
      setError('Código MFA incorrecto.')
      return
    }
    if (blocked) { setError('Cuenta bloqueada temporalmente por múltiples intentos fallidos. Espera 15 minutos.'); return }

    setLoading(true)
    const result = await login(email, password)
    setLoading(false)

    if (!result.ok) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError(result.error ?? 'Error de autenticación')
      if (newAttempts >= 3) {
        setBlocked(true)
        setError('Cuenta bloqueada por 15 minutos tras múltiples intentos fallidos. Contacta soporte si necesitas acceso.')
        addToast({ type: 'error', title: 'Cuenta bloqueada', message: 'Demasiados intentos fallidos.' })
        setTimeout(() => { setBlocked(false); setAttempts(0) }, 15000)
      }
      return
    }

    // If MFA required but not yet shown
    const acct = DEMO_ACCOUNTS.find(a => a.email === email)
    if (acct?.mfa && !mfaRequired) {
      setMfaRequired(true)
      setLoading(false)
      addToast({ type: 'info', title: 'MFA requerido', message: 'Ingresa el código de tu app autenticadora.' })
    }
  }

  const sendOtp = async () => {
    if (!email.trim()) { setError('Ingresa tu correo para enviar el OTP.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    setOtpSent(true)
    addToast({ type: 'success', title: 'OTP enviado', message: `Código enviado a ${email} · Para demo usa 123456` })
  }

  const fillDemo = (acct: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acct.email)
    setPassword('Demo1234!')
    setError('')
    setMethod('password')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(249,115,22,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.04) 0%, transparent 50%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 32px rgba(249,115,22,0.3)',
          }}>
            <Utensils size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>RestaurantERP</h1>
          <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: '6px 0 0' }}>
            Sistema ERP multi-compañía · Colombia
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 28,
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            {mfaRequired ? 'Verificación MFA' : 'Inicia sesión'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 20 }}>
            {mfaRequired
              ? 'Ingresa el código de 6 dígitos de tu app autenticadora'
              : 'Accede a tu restaurante de forma segura'}
          </div>

          {/* MFA screen */}
          {mfaRequired ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 14, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={16} color="#3b82f6" />
                <span style={{ fontSize: 12, color: '#3b82f6' }}>MFA activo. Para demo usa: <strong>000000</strong></span>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Código MFA (6 dígitos)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  style={inputStyle}
                />
              </div>
              {error && <ErrorMsg msg={error} />}
              <Button variant="primary" fullWidth loading={loading} onClick={handleLogin} icon={<Shield size={14} />}>
                Verificar y acceder
              </Button>
              <button onClick={() => setMfaRequired(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: 12, cursor: 'pointer' }}>
                ← Volver
              </button>
            </div>
          ) : (
            <>
              {/* Method tabs */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--secondary)', padding: 4, borderRadius: 8, marginBottom: 20 }}>
                {([
                  { id: 'password', label: 'Contraseña' },
                  { id: 'otp', label: 'OTP correo' },
                  { id: 'google', label: 'Google' },
                ] as const).map(m => (
                  <button key={m.id} onClick={() => { setMethod(m.id); setError('') }} style={{
                    flex: 1, padding: '6px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    background: method === m.id ? 'var(--card)' : 'transparent',
                    color: method === m.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                    border: 'none', transition: 'background 0.15s',
                  }}>{m.label}</button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Email field */}
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Correo electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} color="var(--muted-foreground)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder="usuario@restaurante.co"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password method */}
                {method === 'password' && (
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Contraseña</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} color="var(--muted-foreground)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError('') }}
                        placeholder="••••••••"
                        style={{ ...inputStyle, paddingLeft: 36, paddingRight: 40 }}
                        disabled={loading}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* OTP method */}
                {method === 'otp' && (
                  <>
                    <Button variant="outline" fullWidth loading={loading && !otpSent} onClick={sendOtp} icon={<Smartphone size={14} />}>
                      {otpSent ? '✓ OTP enviado — reenviar' : 'Enviar código OTP al correo'}
                    </Button>
                    {otpSent && (
                      <div>
                        <label style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Código OTP (6 dígitos)</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          style={inputStyle}
                        />
                        <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 4 }}>Demo: usa 123456</div>
                      </div>
                    )}
                  </>
                )}

                {/* Google OAuth */}
                {method === 'google' && (
                  <div style={{ padding: 14, background: 'var(--secondary)', borderRadius: 8, textAlign: 'center', fontSize: 12, color: 'var(--muted-foreground)', border: '1px dashed var(--border)' }}>
                    <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Google OAuth 2.0</div>
                    Requiere configuración del proveedor OAuth en entorno de producción. Disponible con Google Workspace del dominio autorizado.
                  </div>
                )}

                {/* Blocked warning */}
                {blocked && (
                  <div style={{ padding: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={14} color="#ef4444" />
                    <span style={{ fontSize: 11, color: '#ef4444' }}>Cuenta bloqueada — espera 15 minutos o contacta soporte</span>
                  </div>
                )}

                {error && <ErrorMsg msg={error} />}

                {method !== 'google' && (
                  <Button variant="primary" fullWidth loading={loading} onClick={handleLogin} icon={<ArrowRight size={14} />} disabled={blocked}>
                    {method === 'otp' && !otpSent ? 'Enviar OTP primero' : 'Iniciar sesión'}
                  </Button>
                )}

                {method === 'google' && (
                  <Button variant="outline" fullWidth onClick={() => addToast({ type: 'info', title: 'Google OAuth', message: 'Requiere configuración de dominio en producción.' })}>
                    <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.4 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.4 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.4 29.1 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5 0 9.5-1.7 13-4.4l-6-5.2C29.1 35.9 26.6 37 24 37c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.6 40 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.4 5.7l6 5.2C40.9 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-4z" /></svg>
                    Continuar con Google
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cuentas de demostración</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_ACCOUNTS.map((acct, i) => (
              <button key={i} onClick={() => fillDemo(acct)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {acct.mfa ? <Shield size={13} color="var(--primary)" /> : <Mail size={13} color="var(--primary)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{acct.email}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{acct.rol} {acct.mfa ? '· MFA requerido' : ''}</div>
                </div>
                <ArrowRight size={12} color="var(--muted-foreground)" />
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 10, lineHeight: 1.5 }}>
            Contraseña demo: <strong>Demo1234!</strong> · MFA demo: <strong>000000</strong>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'var(--muted-foreground)' }}>
          Al iniciar sesión aceptas la Política de Privacidad y el Tratamiento de Datos Personales
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--foreground)',
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6 }}>
      <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.5 }}>{msg}</span>
    </div>
  )
}
