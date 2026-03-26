"use client"

import { useState } from "react"
import { companyDocuments, documentCategories } from "@/lib/company-data"
import { Upload, Download, FileText, Calendar, HardDrive, Filter } from "lucide-react"

const allCategories = ["all", ...Object.keys(documentCategories)] as const

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "---"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExpiryStatus(expiryDate: string | null): { label: string; className: string } | null {
  if (!expiryDate) return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return { label: "Expired", className: "text-red-600 bg-red-50" }
  }
  if (daysUntilExpiry <= 30) {
    return { label: `Expires in ${daysUntilExpiry}d`, className: "text-yellow-600 bg-yellow-50" }
  }
  if (daysUntilExpiry <= 90) {
    return { label: `Expires in ${daysUntilExpiry}d`, className: "text-orange-600 bg-orange-50" }
  }
  return { label: "Valid", className: "text-green-600 bg-green-50" }
}

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredDocuments = companyDocuments.filter((doc) => {
    if (selectedCategory === "all") return true
    return doc.document_type === selectedCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and access all your company documents.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] transition-colors">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
        {allCategories.map((cat) => {
          const catConfig = cat === "all" ? null : documentCategories[cat]
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#1a3a6b] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === "all" ? "All" : catConfig?.label || cat}
            </button>
          )
        })}
      </div>

      {/* Document Cards */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No documents found</p>
          <p className="text-sm text-gray-400 mt-1">
            No documents match the selected category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => {
            const catConfig = documentCategories[doc.document_type] || documentCategories.other
            const expiryStatus = getExpiryStatus(doc.expiry_date)

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-gray-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* File icon */}
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[#1a3a6b]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{doc.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${catConfig.color}`}
                        >
                          {catConfig.label}
                        </span>
                        {expiryStatus && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${expiryStatus.className}`}
                          >
                            {expiryStatus.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Download button */}
                  <button
                    className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/5 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Uploaded:{" "}
                    {new Date(doc.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {doc.expiry_date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Expires:{" "}
                      {new Date(doc.expiry_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatFileSize(doc.file_size)}
                  </span>
                </div>

                {doc.notes && (
                  <p className="text-xs text-gray-400 mt-2 truncate">{doc.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
