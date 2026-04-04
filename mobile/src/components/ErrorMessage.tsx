import React from "react"

interface Props {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="error-banner">
      <p>{message}</p>
      {onRetry && (
        <button className="error-retry" onClick={onRetry}>Retry</button>
      )}
    </div>
  )
}
