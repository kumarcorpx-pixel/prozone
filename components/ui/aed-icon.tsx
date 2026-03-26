export function AedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* D letter with serifs */}
      <path d="M15 10 L15 90 L18 90 C22 90 24 90 26 89.5 L26 89.5 C28 89 30 88 30 88 L30 88 C55 78 65 62 65 50 C65 38 55 22 30 12 L30 12 C28 11 26 10.5 24 10.2 C22 10 20 10 18 10 Z M25 20 C27 20 29 20.5 31 21.5 C50 29 57 41 57 50 C57 59 50 71 31 78.5 C29 79.5 27 80 25 80 Z" />
      {/* Top horizontal line extending beyond D */}
      <rect x="5" y="34" width="75" height="7" rx="2" />
      {/* Bottom horizontal line extending beyond D */}
      <rect x="5" y="55" width="75" height="7" rx="2" />
      {/* Serif tails at top and bottom of vertical stroke */}
      <path d="M10 10 L10 7 C10 5 12 4 14 5 L20 8 C18 9 16 10 15 10 Z" />
      <path d="M10 90 L10 93 C10 95 12 96 14 95 L20 92 C18 91 16 90 15 90 Z" />
    </svg>
  )
}
