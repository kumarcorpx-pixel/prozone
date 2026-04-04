import React, { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api"
import { ScreenHeader } from "../components/ScreenHeader"
import { SearchBar } from "../components/SearchBar"
import { InfiniteList } from "../components/InfiniteList"
import { ErrorMessage } from "../components/ErrorMessage"

export function EmployeesScreen() {
  const [employees, setEmployees] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const load = useCallback(async (p: number, query: string, append = false) => {
    setLoading(true)
    setError("")
    const res = await api.get(`/api/v1/employees?page=${p}&limit=20&search=${encodeURIComponent(query)}`)
    if (res.success && res.data) {
      setEmployees(prev => append ? [...prev, ...res.data] : res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } else {
      setError(res.error || "Failed to load employees")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    load(1, search)
  }, [search, load])

  const loadMore = () => {
    if (page < totalPages && !loading) {
      const next = page + 1
      setPage(next)
      load(next, search, true)
    }
  }

  const formatDate = (d: string | null) => {
    if (!d) return "N/A"
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getVisaColor = (status: string | null) => {
    if (status === "valid") return "badge-green"
    if (status === "expired") return "badge-red"
    if (status === "expiring_soon") return "badge-amber"
    return "badge-gray"
  }

  return (
    <div className="screen">
      <ScreenHeader title="Employees" />
      <div className="content-pad">
        <SearchBar value={search} onChange={setSearch} placeholder="Search employees..." />
        {error && <ErrorMessage message={error} onRetry={() => load(1, search)} />}
        <InfiniteList loading={loading} hasMore={page < totalPages} onLoadMore={loadMore} empty={employees.length === 0 && !loading && !error}>
          {employees.map((e) => (
            <div key={e.id} className="list-card">
              <div className="list-card-header">
                <div className="avatar avatar-green">{e.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="list-card-info">
                  <h3 className="list-card-title">{e.fullName}</h3>
                  <p className="list-card-sub">{e.designation || "No designation"} {e.company?.name ? `· ${e.company.name}` : ""}</p>
                </div>
                <span className={`badge ${getVisaColor(e.visaStatus)}`}>
                  {e.visaStatus ? e.visaStatus.replace(/_/g, " ") : "N/A"}
                </span>
              </div>
              <div className="list-card-meta">
                <span>🌍 {e.nationality || "N/A"}</span>
                <span>EID: {e.emiratesId || "N/A"}</span>
              </div>
              <div className="list-card-meta">
                <span>Visa: {formatDate(e.visaExpiry)}</span>
                <span>Passport: {formatDate(e.passportExpiry)}</span>
                <span>EID: {formatDate(e.emiratesIdExpiry)}</span>
              </div>
            </div>
          ))}
        </InfiniteList>
      </div>
    </div>
  )
}
