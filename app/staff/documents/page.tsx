"use client"

import { demoRequestDocuments, demoRequests } from "@/lib/demo-data"
import { FileText, Download } from "lucide-react"

const docTypeColors: Record<string, string> = {
  required: "bg-blue-100 text-blue-800",
  submitted: "bg-yellow-100 text-yellow-800",
  processed: "bg-purple-100 text-purple-800",
  final: "bg-green-100 text-green-800",
  general: "bg-gray-100 text-gray-600",
}

export default function StaffDocumentsPage() {
  // Get all documents from assigned requests
  const documents = demoRequestDocuments.map((doc) => {
    const request = demoRequests.find((r) => r.id === doc.request_id)
    return { ...doc, request }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Documents from your assigned service requests.
        </p>
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.file_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {doc.request?.service_type} — {doc.request?.company?.name}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  docTypeColors[doc.doc_type] || docTypeColors.general
                }`}
              >
                {doc.doc_type}
              </span>
              <p className="text-xs text-gray-400 hidden sm:block">
                {new Date(doc.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <button
                className="flex-shrink-0 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No documents yet</p>
          <p className="text-sm mt-1">Documents from assigned requests will appear here.</p>
        </div>
      )}
    </div>
  )
}
