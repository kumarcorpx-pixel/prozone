export function AedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="700" fontFamily="serif">
        د.إ
      </text>
    </svg>
  )
}
