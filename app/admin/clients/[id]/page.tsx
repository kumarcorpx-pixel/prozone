"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { fetchCompanies, fetchRequests, fetchDocuments } from "@/lib/data-fetcher"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ArrowLeft, User, Building2, FileText, FolderOpen, Mail, Phone, Calendar } from "lucide-react"
import Link from "next/link"

export default function ClientDetailPage() {
  const { id } = useParams() as { id: string }
  const [client, setClient] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Fetch client user
        const usersRes = await fetch("/api/data/users")
        if (usersRes.ok) {
          const users = await usersRes.json()
          setClient(users.find((u: any) => u.id === id))
        }
        // Fetch related data
        const [comps, reqs, docs] = await Promise.all([fetchCompanies(), fetchRequests(), fetchDocuments()])
        setCompanies(comps.filter((c: any) => c.created_by === id))
        setRequests(reqs.filter((r: any) => r.client_id === id))
        setDocuments(docs)
      } catch {}
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>
  if (!client) return <div className="text-center py-12 text-gray-500">Client not found</div>

  return (
    <div className="space-y-6">
      <Link href="/admin/clients" prefetch={false} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a6b]">
        <ArrowLeft className="h-4 w-4" /> Back to Clients
      </Link>

      {/* Client Profile */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#1a3a6b] flex items-center justify-center">
            <span className="text-white text-xl font-bold">{client.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              {client.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{client.email}</span>}
              {client.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{client.phone}</span>}
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {new Date(client.created_at).toLocaleDateString("en-GB")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Companies */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><Building2 className="h-5 w-5" /> Companies ({companies.length})</h3>
        {companies.length === 0 ? (
          <p className="text-sm text-gray-500">No companies linked to this client</p>
        ) : (
          <div className="space-y-2">
            {companies.map((c: any) => (
              <Link key={c.id} href={`/admin/companies/${c.id}`} prefetch={false} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                <div><p className="font-medium text-gray-900">{c.name}</p><p className="text-xs text-gray-500">{c.emirate} · {c.license_type}</p></div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Requests */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><FileText className="h-5 w-5" /> Requests ({requests.length})</h3>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No requests from this client</p>
        ) : (
          <div className="space-y-2">
            {requests.map((r: any) => (
              <Link key={r.id} href={`/admin/requests/${r.id}`} prefetch={false} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                <div><p className="font-medium text-gray-900">{r.service_type}</p><p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString("en-GB")}</p></div>
                <StatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
