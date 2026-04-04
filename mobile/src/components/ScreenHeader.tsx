import React from "react"
import { useNavigate } from "react-router-dom"

interface Props {
  title: string
  showBack?: boolean
}

export function ScreenHeader({ title, showBack = true }: Props) {
  const navigate = useNavigate()

  return (
    <div className="screen-header">
      {showBack && (
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}
      <h1 className="screen-title">{title}</h1>
    </div>
  )
}
