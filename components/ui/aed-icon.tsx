export function AedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text x="4" y="19" fontSize="22" fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif">D</text>
      <rect x="2" y="9" width="18" height="2" rx="0.5" />
      <rect x="2" y="13.5" width="18" height="2" rx="0.5" />
    </svg>
  )
}
