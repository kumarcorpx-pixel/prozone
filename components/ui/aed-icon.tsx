export function AedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M6 4C6 4 6 4 6.5 4C9.5 4 12 5.5 13.5 8C15 10.5 15.5 13 15.5 14C15.5 15 15.5 16.5 14.5 18C13.5 19.5 11.5 20 9.5 20C7.5 20 6 19 6 19"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="3" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="14.5" x2="18" y2="14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
