import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "../lib/auth-context"
import { api } from "../lib/api"
import { useNavigate } from "react-router-dom"
import { ErrorMessage } from "../components/ErrorMessage"

export function DashboardScreen() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ companies: 0, employees: 0, requests: 0, documents: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [compRes, empRes, reqRes, docRes] = await Promise.all([
        api.get("/api/v1/companies?limit=1"),
        api.get("/api/v1/employees?limit=1"),
        api.get("/api/v1/requests?limit=1"),
        api.get("/api/v1/documents?limit=1"),
      ])
      // Check if any call failed
      if (!compRes.success && !empRes.success && !reqRes.success && !docRes.success) {
        setError(compRes.error || "Failed to load dashboard")
        setLoading(false)
        return
      }
      setStats({
        companies: compRes.meta?.total || 0,
        employees: empRes.meta?.total || 0,
        requests: reqRes.meta?.total || 0,
        documents: docRes.meta?.total || 0,
      })
    } catch {
      setError("Failed to load dashboard data")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"

  return (
    <div className="screen">
      <div className="header-banner">
        <div className="header-top">
          <div>
            <p className="header-greeting">{greeting}</p>
            <h1 className="header-name">{user?.full_name}</h1>
            <p className="header-role">{user?.role === "admin" ? "Administrator" : user?.role === "pro_staff" ? "PRO Staff" : "Client"}</p>
          </div>
          <button className="btn-icon" onClick={logout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </button>
        </div>
      </div>

      <div className="content-pad">
        {error && <ErrorMessage message={error} onRetry={loadStats} />}
        {/* Stats Grid */}
        <div className="stats-grid">
          <button className="stat-card" onClick={() => navigate("/companies")}>
            <div className="stat-icon stat-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18Z" /><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2" /><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2" /></svg>
            </div>
            <p className="stat-value">{loading ? "-" : stats.companies}</p>
            <p className="stat-label">Companies</p>
          </button>

          <button className="stat-card" onClick={() => navigate("/employees")}>
            <div className="stat-icon stat-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <p className="stat-value">{loading ? "-" : stats.employees}</p>
            <p className="stat-label">Employees</p>
          </button>

          <button className="stat-card" onClick={() => navigate("/requests")}>
            <div className="stat-icon stat-icon-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z" /><path d="M14 2v6h6" /></svg>
            </div>
            <p className="stat-value">{loading ? "-" : stats.requests}</p>
            <p className="stat-label">Requests</p>
          </button>

          <button className="stat-card" onClick={() => navigate("/documents")}>
            <div className="stat-icon stat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7Z" /><path d="M14 2v4a2 2 0 002 2h4" /></svg>
            </div>
            <p className="stat-value">{loading ? "-" : stats.documents}</p>
            <p className="stat-label">Documents</p>
          </button>
        </div>

        {/* Quick Actions */}
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <button className="action-card" onClick={() => navigate("/companies")}>
            <span className="action-emoji">🏢</span>
            <span>View Companies</span>
          </button>
          <button className="action-card" onClick={() => navigate("/employees")}>
            <span className="action-emoji">👥</span>
            <span>View Employees</span>
          </button>
          <button className="action-card" onClick={() => navigate("/requests")}>
            <span className="action-emoji">📋</span>
            <span>Service Requests</span>
          </button>
          <button className="action-card" onClick={() => navigate("/documents")}>
            <span className="action-emoji">📄</span>
            <span>Documents</span>
          </button>
        </div>
      </div>
    </div>
  )
}
