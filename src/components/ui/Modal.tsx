import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose?: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: number
  closeable?: boolean
}

export default function Modal({ open, onClose, title, subtitle, children, width = 520, closeable = true }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}
      onClick={e => { if (closeable && e.target === e.currentTarget) onClose?.() }}
    >
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'modalIn 0.2s ease',
      }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          {closeable && onClose && (
            <button onClick={onClose} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
