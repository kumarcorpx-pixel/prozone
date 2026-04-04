import React from "react"

interface State {
  hasError: boolean
  error: string
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: "" }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen-center">
          <p className="empty-icon">⚠️</p>
          <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Something went wrong</p>
          <p className="text-muted" style={{ textAlign: "center", maxWidth: 280 }}>{this.state.error}</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => { this.setState({ hasError: false, error: "" }); window.location.reload() }}
          >
            Restart App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
