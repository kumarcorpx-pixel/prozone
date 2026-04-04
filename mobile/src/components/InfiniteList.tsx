import React, { useEffect, useRef, useCallback } from "react"

interface Props {
  children: React.ReactNode
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  empty?: boolean
}

export function InfiniteList({ children, loading, hasMore, onLoadMore, empty }: Props) {
  const sentinel = useRef<HTMLDivElement>(null)
  // Stabilize callback ref to prevent infinite re-render
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  const loadingRef = useRef(loading)
  loadingRef.current = loading

  useEffect(() => {
    if (!sentinel.current || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
          onLoadMoreRef.current()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [hasMore])

  if (empty) {
    return (
      <div className="empty-state">
        <p className="empty-icon">📭</p>
        <p className="empty-text">No items found</p>
      </div>
    )
  }

  return (
    <div className="list-container">
      {children}
      {loading && (
        <div className="list-loading">
          <div className="spinner-sm" />
          <span>Loading...</span>
        </div>
      )}
      {hasMore && <div ref={sentinel} className="sentinel" />}
    </div>
  )
}
