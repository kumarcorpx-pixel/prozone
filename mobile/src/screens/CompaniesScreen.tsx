import React, { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api"
import { ScreenHeader } from "../components/ScreenHeader"
import { SearchBar } from "../components/SearchBar"
import { InfiniteList } from "../components/InfiniteList"
import { ErrorMessage } from "../components/ErrorMessage"

export function CompaniesScreen() {
  const [companies, setCompanies] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const load = useCallback(async (p: number, query: string, append = false) => {
    setLoading(true)
    setError("")
    const res = await api.get(`/api/v1/companies?page=${p}&limit=20&search=${encodeURIComponent(query)}`)
    if (res.success && res.data) {
      setCompanies(prev => append ? [...prev, ...res.data] : res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } else {
      setError(res.error || "Failed to load companies")
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

  const getStatusColor = (status: string) => {
    if (status === "active") return "badge-green"
    if (status === "expired") return "badge-red"
    return "badge-gray"
  }

  const formatDate = (d: string | null) => {
    if (!d) return "N/A"
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  return (
    <div className="screen">
      <ScreenHeader title="Companies" />
      <div className="content-pad">
        <SearchBar value={search} onChange={setSearch} placeholder="Search companies..." />
        {error && <ErrorMessage message={error} onRetry={() => load(1, search)} />}
        <InfiniteList loading={loading} hasMore={page < totalPages} onLoadMore={loadMore} empty={companies.length === 0 && !loading && !error}>
          {companies.map((c) => (
            <div key={c.id} className="list-card">
              <div className="list-card-header">
                <div className="avatar avatar-blue">{c.name?.slice(0, 2).toUpperCase()}</div>
                <div className="list-card-info">
                  <h3 className="list-card-title">{c.name}</h3>
                  <p className="list-card-sub">{c.tradeName || c.name}</p>
                </div>
                <span className={`badge ${getStatusColor(c.status)}`}>
                  {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
                </span>
              </div>
              <div className="list-card-meta">
                <span>📍 {c.emirate || "N/A"}</span>
                <span>{c.licenseType === "freezone" ? "Free Zone" : "Mainland"}</span>
                <span>License: {c.licenseNumber || "N/A"}</span>
              </div>
              <div className="list-card-meta">
                <span>Expiry: {formatDate(c.licenseExpiry)}</span>
                <span>👥 {c._count?.employees || 0} employees</span>
                <span>📄 {c._count?.documents || 0} docs</span>
              </div>
            </div>
          ))}
        </InfiniteList>
      </div>
    </div>
  )
}
