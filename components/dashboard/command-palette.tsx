"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Building2, Users, FileText, X, Command } from "lucide-react"

interface SearchResult {
  id: string
  type: "company" | "employee" | "document"
  name: string
  subtitle?: string
}

interface SearchResponse {
  companies?: SearchResult[]
  employees?: SearchResult[]
  documents?: SearchResult[]
}

interface CommandPaletteProps {
  basePath?: string
  isOpen?: boolean
  onClose?: () => void
}

const categoryConfig = {
  companies: { label: "Companies", icon: Building2 },
  employees: { label: "Employees", icon: Users },
  documents: { label: "Documents", icon: FileText },
} as const

type Category = keyof typeof categoryConfig

export function CommandPalette({ basePath = "/admin", isOpen: externalOpen, onClose: externalClose }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = (v: boolean | ((prev: boolean) => boolean)) => {
    const newVal = typeof v === "function" ? v(open) : v
    setInternalOpen(newVal)
    if (!newVal && externalClose) externalClose()
  }
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResponse>({})
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Build flat list of all results for arrow key navigation
  const flatResults: { category: Category; item: SearchResult }[] = []
  for (const cat of ["companies", "employees", "documents"] as Category[]) {
    const items = results[cat]
    if (items?.length) {
      for (const item of items) {
        flatResults.push({ category: cat, item })
      }
    }
  }

  // Open / close with Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("")
      setResults({})
      setActiveIndex(0)
      // Small delay so the DOM is ready
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({})
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        )
        if (res.ok) {
          const data: SearchResponse = await res.json()
          setResults(data)
        }
      } catch {
        // Aborted or network error — ignore
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setResults({})
  }, [])

  const navigate = useCallback(
    (category: Category, item: SearchResult) => {
      close()
      if (category === "companies") {
        router.push(`${basePath}/companies/${item.id}`)
      } else if (category === "employees") {
        router.push(`${basePath}/employees/${item.id}`)
      } else {
        // Documents — fallback to companies list
        router.push(`${basePath}/companies`)
      }
    },
    [basePath, close, router]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault()
      close()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % Math.max(flatResults.length, 1))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + Math.max(flatResults.length, 1)) % Math.max(flatResults.length, 1))
      return
    }
    if (e.key === "Enter" && flatResults[activeIndex]) {
      e.preventDefault()
      const { category, item } = flatResults[activeIndex]
      navigate(category, item)
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector("[data-active='true']")
    active?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  if (!open) return null

  const hasQuery = query.trim().length > 0
  const hasResults = flatResults.length > 0

  let flatIndex = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-200">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, employees, documents..."
            className="flex-1 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {loading && hasQuery && (
            <div className="px-4 py-8 text-center">
              <div className="inline-block h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && !hasQuery && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              <Command className="h-5 w-5 mx-auto mb-2 text-gray-300" />
              No results
            </div>
          )}

          {!loading && hasQuery && !hasResults && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading &&
            hasResults &&
            (["companies", "employees", "documents"] as Category[]).map((cat) => {
              const items = results[cat]
              if (!items?.length) return null
              const { label, icon: Icon } = categoryConfig[cat]

              return (
                <div key={cat}>
                  <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {label}
                    </span>
                  </div>
                  {items.map((item) => {
                    const idx = flatIndex++
                    const isActive = idx === activeIndex
                    return (
                      <button
                        key={`${cat}-${item.id}`}
                        data-active={isActive}
                        onClick={() => navigate(cat, item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1a3a6b]" : "text-gray-400"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          {item.subtitle && (
                            <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                          )}
                        </div>
                        {isActive && (
                          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-200/60 border border-gray-200 rounded">
                            &#x23CE;
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-200/60 border border-gray-200 rounded text-[10px] font-medium">&#x2191;</kbd>
              <kbd className="px-1 py-0.5 bg-gray-200/60 border border-gray-200 rounded text-[10px] font-medium">&#x2193;</kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-200/60 border border-gray-200 rounded text-[10px] font-medium">&#x23CE;</kbd>
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-200/60 border border-gray-200 rounded text-[10px] font-medium">esc</kbd>
              close
            </span>
          </div>
          <span className="text-xs text-gray-300">
            <Command className="inline h-3 w-3" />K
          </span>
        </div>
      </div>
    </div>
  )
}
