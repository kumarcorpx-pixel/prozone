import React from "react"
import { useNavigate, useLocation } from "react-router-dom"

const tabs = [
  { path: "/", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { path: "/companies", label: "Companies", icon: "M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18Z" },
  { path: "/employees", label: "People", icon: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" },
  { path: "/requests", label: "Requests", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8Z" },
  { path: "/documents", label: "Docs", icon: "M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7Z" },
]

export function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`tab-item ${active ? "tab-active" : ""}`}
            onClick={() => navigate(tab.path)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={tab.icon} />
              {tab.path === "/employees" && <circle cx="9" cy="7" r="4" />}
            </svg>
            <span className="tab-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
