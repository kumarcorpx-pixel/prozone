import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./lib/auth-context"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { LoginScreen } from "./screens/LoginScreen"
import { DashboardScreen } from "./screens/DashboardScreen"
import { CompaniesScreen } from "./screens/CompaniesScreen"
import { EmployeesScreen } from "./screens/EmployeesScreen"
import { RequestsScreen } from "./screens/RequestsScreen"
import { DocumentsScreen } from "./screens/DocumentsScreen"
import { TabBar } from "./components/TabBar"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="screen-center">
        <div className="spinner" />
        <p className="text-muted mt-12">Loading...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <div className="app-content">{children}</div>
      <TabBar />
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="screen-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginScreen />}
      />
      <Route path="/" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
      <Route path="/companies" element={<ProtectedRoute><CompaniesScreen /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><EmployeesScreen /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><RequestsScreen /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><DocumentsScreen /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
