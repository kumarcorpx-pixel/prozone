"use client"

import { useState } from "react"
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"

interface DocPreviewProps {
  docId: string
  docName: string
  mimeType?: string
  fileUrl?: string
  onClose: () => void
}

export function DocumentPreview({ docId, docName, mimeType, fileUrl, onClose }: DocPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const downloadUrl = `/api/documents/${docId}/download`
  const isImage = mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl || "")
  const isPdf = mimeType === "application/pdf" || /\.pdf$/i.test(fileUrl || "")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{docName}</h3>
            <p className="text-xs text-gray-500">{isPdf ? "PDF Document" : isImage ? "Image" : "Document"}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isImage && (
              <>
                <button onClick={() => setZoom(z => Math.max(z - 25, 25))} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500" title="Zoom out">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs text-gray-500 w-10 text-center">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(z + 25, 300))} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500" title="Zoom in">
                  <ZoomIn className="h-4 w-4" />
                </button>
              </>
            )}
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500" title="Download">
              <Download className="h-4 w-4" />
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500" title="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <iframe src={`${downloadUrl}#toolbar=1`} className="w-full h-[75vh]" title={docName} />
          ) : isImage ? (
            <div className="overflow-auto p-4 flex items-center justify-center w-full h-full">
              <img
                src={downloadUrl}
                alt={docName}
                className="max-w-none transition-transform"
                style={{ width: `${zoom}%` }}
              />
            </div>
          ) : (
            <div className="text-center p-12">
              <p className="text-gray-500 mb-4">Preview not available for this file type.</p>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a]">
                <Download className="h-4 w-4" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
