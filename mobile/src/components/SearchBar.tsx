import React, { useRef, useEffect } from "react"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Search..." }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const handleChange = (v: string) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(v), 300)
  }

  return (
    <div className="search-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        defaultValue={value}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  )
}
