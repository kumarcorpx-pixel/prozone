"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, FileUp } from "lucide-react"

const documentCategories = [
  "Trade License",
  "Visa Application",
  "Emirates ID",
  "Passport Copy",
  "Labour Card",
  "Tenancy Contract",
  "MOA / AOA",
  "Power of Attorney",
  "Bank Statement",
  "Tax Certificate",
  "Insurance Policy",
  "Other",
]

interface UploadDialogProps {
  open: boolean
  onClose: () => void
  onUpload: (data: { file: File; category: string; notes: string }) => void
}

export function UploadDialog({ open, onClose, onUpload }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState("")
  const [notes, setNotes] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }, [])

  const handleSubmit = () => {
    if (!file || !category) return
    onUpload({ file, category, notes })
    resetForm()
  }

  const resetForm = () => {
    setFile(null)
    setCategory("")
    setNotes("")
    setDragOver(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#1a3a6b] bg-blue-50"
              : file
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileUp className="h-8 w-8 text-green-500" />
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                }}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-[#1a3a6b]">Click to upload</span> or drag and
                drop
              </p>
              <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
            </div>
          )}
        </div>

        {/* Category select */}
        <div className="mt-4">
          <label htmlFor="doc-category" className="block text-sm font-medium text-gray-700 mb-1">
            Document Category <span className="text-red-500">*</span>
          </label>
          <select
            id="doc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
          >
            <option value="">Select category...</option>
            {documentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Notes textarea */}
        <div className="mt-4">
          <label htmlFor="doc-notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="doc-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any notes about this document..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || !category}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}
