import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<Variant, { bg: string; color: string; border: string; hoverBg: string }> = {
  primary: { bg: 'var(--primary)', color: '#fff', border: 'var(--primary)', hoverBg: '#ea6c0c' },
  danger:  { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.4)', hoverBg: 'rgba(239,68,68,0.2)' },
  success: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.4)', hoverBg: 'rgba(34,197,94,0.2)' },
  warning: { bg: 'rgba(234,179,8,0.12)', color: '#eab308', border: 'rgba(234,179,8,0.4)', hoverBg: 'rgba(234,179,8,0.2)' },
  ghost:   { bg: 'transparent', color: 'var(--muted-foreground)', border: 'transparent', hoverBg: 'rgba(255,255,255,0.06)' },
  outline: { bg: 'var(--secondary)', color: 'var(--foreground)', border: 'var(--border)', hoverBg: 'rgba(255,255,255,0.06)' },
}

const sizeStyles: Record<Size, { padding: string; fontSize: string; height: string }> = {
  sm: { padding: '4px 10px', fontSize: '11px', height: '28px' },
  md: { padding: '7px 14px', fontSize: '12px', height: '34px' },
  lg: { padding: '10px 18px', fontSize: '14px', height: '42px' },
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Button({
  variant = 'primary', size = 'md', loading = false,
  icon, children, fullWidth, disabled, onClick, style, ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const vs = variantStyles[variant]
  const ss = sizeStyles[size]
  const isDisabled = disabled || loading

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return
    setPressed(true)
    setTimeout(() => setPressed(false), 150)
    onClick?.(e)
  }

  return (
    <button
      {...rest}
      disabled={isDisabled}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: ss.height,
        padding: ss.padding,
        fontSize: ss.fontSize,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        borderRadius: 6,
        border: `1px solid ${vs.border}`,
        background: hovered && !isDisabled ? vs.hoverBg : vs.bg,
        color: vs.color,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.15s ease, background 0.15s ease, opacity 0.15s ease',
        width: fullWidth ? '100%' : undefined,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {loading ? <Spinner size={parseInt(ss.fontSize) + 2} /> : icon}
      {children}
    </button>
  )
}
