import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Toast } from '../../context/AppContext'

const config = {
  success: { icon: <CheckCircle size={15} />, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  error:   { icon: <XCircle size={15} />,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)' },
  warning: { icon: <AlertTriangle size={15} />, color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)' },
  info:    { icon: <Info size={15} />,          color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useApp()
  const [visible, setVisible] = useState(false)
  const cfg = config[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.color}`,
      borderRadius: 8,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      minWidth: 280,
      maxWidth: 380,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      transform: visible ? 'translateX(0)' : 'translateX(110%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.25s ease, opacity 0.25s ease',
    }}>
      <span style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{toast.title}</div>
        {toast.message && <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2, lineHeight: 1.5 }}>{toast.message}</div>}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2, flexShrink: 0 }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

export default function ToastLayer() {
  const { toasts } = useApp()
  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
      alignItems: 'flex-end',
    }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}
