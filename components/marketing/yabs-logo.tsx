interface YabsLogoProps {
  variant?: "full" | "compact" | "icon"
  className?: string
  light?: boolean
}

export function YabsLogo({ variant = "full", className = "", light = false }: YabsLogoProps) {
  const primaryColor = light ? "#ffffff" : "#1a3a6b"
  const accentColor = "#ef4444"
  const subtextColor = light ? "rgba(255,255,255,0.7)" : "#6b7280"

  if (variant === "icon") {
    return (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="40" height="40" rx="8" fill={primaryColor} />
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="20" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
          Y
        </text>
        <rect x="28" y="4" width="8" height="8" rx="4" fill={accentColor} />
      </svg>
    )
  }

  if (variant === "compact") {
    return (
      <svg viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <text x="0" y="28" fill={primaryColor} fontSize="30" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-1">
          YABS
        </text>
        <circle cx="92" cy="8" r="5" fill={accentColor} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Main YABS text */}
      <text x="0" y="32" fill={primaryColor} fontSize="34" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-1">
        YABS
      </text>
      {/* Red accent dot */}
      <circle cx="105" cy="8" r="5" fill={accentColor} />
      {/* Divider line */}
      <line x1="112" y1="8" x2="112" y2="42" stroke={light ? "rgba(255,255,255,0.3)" : "#e5e7eb"} strokeWidth="1" />
      {/* Tagline */}
      <text x="118" y="20" fill={subtextColor} fontSize="9" fontWeight="500" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">
        Public Relations
      </text>
      <text x="118" y="32" fill={subtextColor} fontSize="9" fontWeight="500" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">
        Management LLC
      </text>
    </svg>
  )
}
