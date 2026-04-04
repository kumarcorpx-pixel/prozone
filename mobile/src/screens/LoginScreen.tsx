import React, { useState } from "react"
import { useAuth } from "../lib/auth-context"

export function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password")
      return
    }
    setError("")
    setLoading(true)
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Login failed")
    }
    setLoading(false)
  }

  return (
    <div className="login-screen">
      <div className="login-header">
        <div className="login-logo">Y</div>
        <h1 className="login-title">CorporatePRO</h1>
        <p className="login-subtitle">YABS Public Relations Management</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? <span className="spinner-sm" /> : null}
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="login-footer">corporatepro.cloud</p>
    </div>
  )
}
