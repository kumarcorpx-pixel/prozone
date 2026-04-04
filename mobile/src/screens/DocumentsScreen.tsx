import React, { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api"
import { ScreenHeader } from "../components/ScreenHeader"
import { SearchBar } from "../components/SearchBar"
import { InfiniteList } from "../components/InfiniteList"
import { ErrorMessage } from "../components/ErrorMessage"

const DOC_TYPES: Record<string, { label: string; icon: string }> = {
  trade_license: { label: "Trade License", icon: "TL" },
  visa: { label: "Visa", icon: "VS" },
  emirates_id: { label: "Emirates ID", icon: "EID" },
  passport: { label: "Passport", icon: "PP" },
  labor_card: { label: "Labor Card", icon: "LC" },
  establishment_card: { label: "Establishment Card", icon: "EC" },
  ejari: { label: "Ejari", icon: "EJ" },
  other: { label: "Other", icon: "OT" },
}

export function DocumentsScreen() {
  const [documents, setDocuments] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const load = useCallback(async (p: number, append = false) => {
    setLoading(true)
    setError("")
    const res = await api.get(`/api/v1/documents?page=${p}&limit=20`)
    if (res.success && res.data) {
      setDocuments(prev => append ? [...prev, ...res.data] : res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } else {
      setError(res.error || "Failed to load documents")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    load(1)
  }, [load])

  const loadMore = () => {
    if (page < totalPages && !loading) {
      const next = page + 1
      setPage(next)
      load(next, true)
    }
  }

  const getExpiryStyle = (d: string | null) => {
    if (!d) return "border-l-gray"
    const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
    if (days < 0) return "border-l-red"
    if (days <= 30) return "border-l-amber"
    if (days <= 90) return "border-l-yellow"
    return "border-l-green"
  }

  const formatDate = (d: string | null) => {
    if (!d) return "N/A"
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getDocInfo = (type: string) => DOC_TYPES[type] || DOC_TYPES.other

  return (
    <div className="screen">
      <ScreenHeader title="Documents" />
      <div className="content-pad">
        <InfiniteList loading={loading} hasMore={page < totalPages} onLoadMore={loadMore} empty={documents.length === 0 && !loading}>
          {documents.map((doc) => {
            const info = getDocInfo(doc.documentType)
            return (
              <div key={doc.id} className={`list-card doc-card ${getExpiryStyle(doc.expiryDate)}`}>
                <div className="list-card-header">
                  <div className="doc-icon">{info.icon}</div>
                  <div className="list-card-info">
                    <h3 className="list-card-title">{doc.name}</h3>
                    <p className="list-card-sub">{info.label} {doc.company?.name ? `· ${doc.company.name}` : ""}</p>
                  </div>
                  <span className={`badge ${doc.status === "valid" ? "badge-green" : doc.status === "expired" ? "badge-red" : "badge-gray"}`}>
                    {doc.status || "N/A"}
                  </span>
                </div>
                <div className="list-card-meta">
                  {doc.referenceNumber && <span>#{doc.referenceNumber}</span>}
                  {doc.issuingAuthority && <span>{doc.issuingAuthority}</span>}
                  <span>Exp: {formatDate(doc.expiryDate)}</span>
                </div>
                {doc.employee && (
                  <div className="list-card-meta">
                    <span>👤 {doc.employee.fullName}</span>
                    {doc.uploadedBy && <span>By: {doc.uploadedBy.fullName}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </InfiniteList>
      </div>
    </div>
  )
}
