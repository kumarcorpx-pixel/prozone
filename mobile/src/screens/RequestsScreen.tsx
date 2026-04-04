import React, { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api"
import { ScreenHeader } from "../components/ScreenHeader"
import { InfiniteList } from "../components/InfiniteList"
import { ErrorMessage } from "../components/ErrorMessage"

const STATUS_FILTERS = ["all", "pending", "assigned", "in_progress", "completed"]

export function RequestsScreen() {
  const [requests, setRequests] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const load = useCallback(async (p: number, status: string, append = false) => {
    setLoading(true)
    setError("")
    const statusParam = status !== "all" ? `&status=${status}` : ""
    const res = await api.get(`/api/v1/requests?page=${p}&limit=20${statusParam}`)
    if (res.success && res.data) {
      setRequests(prev => append ? [...prev, ...res.data] : res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } else {
      setError(res.error || "Failed to load requests")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    load(1, statusFilter)
  }, [statusFilter, load])

  const loadMore = () => {
    if (page < totalPages && !loading) {
      const next = page + 1
      setPage(next)
      load(next, statusFilter, true)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "badge-amber", assigned: "badge-blue", in_progress: "badge-blue",
      under_review: "badge-purple", completed: "badge-green", rejected: "badge-red",
    }
    return map[status] || "badge-gray"
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })

  return (
    <div className="screen">
      <ScreenHeader title="Service Requests" />
      <div className="content-pad">
        {/* Filter pills */}
        <div className="filter-pills">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`pill ${statusFilter === s ? "pill-active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {error && <ErrorMessage message={error} onRetry={() => load(1, statusFilter)} />}
        <InfiniteList loading={loading} hasMore={page < totalPages} onLoadMore={loadMore} empty={requests.length === 0 && !loading && !error}>
          {requests.map((r) => (
            <div key={r.id} className="list-card">
              <div className="list-card-header">
                <div className="list-card-info">
                  <h3 className="list-card-title">{r.serviceType || "Service Request"}</h3>
                  <p className="list-card-sub">{r.company?.name || "No company"}</p>
                </div>
                <span className={`badge ${getStatusBadge(r.status)}`}>
                  {r.status?.replace(/_/g, " ")}
                </span>
              </div>
              {r.description && <p className="list-card-desc">{r.description}</p>}
              <div className="list-card-meta">
                <span>Priority: {r.priority}</span>
                {r.assignedTo && <span>PRO: {r.assignedTo.fullName}</span>}
                <span>{formatDate(r.createdAt)}</span>
              </div>
            </div>
          ))}
        </InfiniteList>
      </div>
    </div>
  )
}
