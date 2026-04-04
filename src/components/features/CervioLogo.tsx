interface LogoProps {
  size?: number
  color?: string
  showText?: boolean
  textSize?: number
}

export function CervioLogo({ size = 32, color = 'currentColor', showText = true, textSize = 20 }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill={color} fillOpacity="0.12"/>
        <circle cx="16" cy="6" r="2.5" fill={color}/>
        <circle cx="7.5" cy="22" r="2.5" fill={color}/>
        <circle cx="24.5" cy="22" r="2.5" fill={color}/>
        <circle cx="16" cy="16" r="4" fill={color}/>
        <line x1="16" y1="8.5" x2="16" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9.7" y1="20.2" x2="13" y2="17.8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="22.3" y1="20.2" x2="19" y2="17.8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="1.5" fill="white" fillOpacity="0.9"/>
      </svg>
      {showText && (
        <span style={{
          fontSize: textSize,
          fontWeight: 700,
          color,
          letterSpacing: -0.5,
          fontFamily: '-apple-system, SF Pro Display, Helvetica Neue, sans-serif',
          lineHeight: 1,
        }}>
          Cervio
        </span>
      )}
    </div>
  )
}

export function CervioLogomark({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill={color} fillOpacity="0.12"/>
      <circle cx="16" cy="6" r="2.5" fill={color}/>
      <circle cx="7.5" cy="22" r="2.5" fill={color}/>
      <circle cx="24.5" cy="22" r="2.5" fill={color}/>
      <circle cx="16" cy="16" r="4" fill={color}/>
      <line x1="16" y1="8.5" x2="16" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9.7" y1="20.2" x2="13" y2="17.8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22.3" y1="20.2" x2="19" y2="17.8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="1.5" fill="white" fillOpacity="0.9"/>
    </svg>
  )
}
