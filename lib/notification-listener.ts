"use client"

const NTFY_BASE_URL = process.env.NEXT_PUBLIC_NTFY_BASE_URL || "https://notify.corporatepro.cloud"

export function startNotificationListener(
  topic: string,
  onNotification?: (data: any) => void,
  onStatusChange?: (connected: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {}

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }

  let abortController = new AbortController()
  let retryCount = 0
  const maxRetries = 5

  async function connect() {
    try {
      const url = `${NTFY_BASE_URL}/${topic}/json?poll=1&since=all`

      // Try SSE first without auth (works if ntfy allows anonymous read)
      const sseUrl = `${NTFY_BASE_URL}/${topic}/sse`
      const eventSource = new EventSource(sseUrl)

      eventSource.onopen = () => {
        retryCount = 0
        onStatusChange?.(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.event === "message") {
            if ("Notification" in window && Notification.permission === "granted") {
              const n = new Notification(data.title || "YABS Notification", {
                body: data.message || "",
                icon: "/icons/icon-192.png",
                tag: data.id,
              })
              if (data.click) {
                n.onclick = () => window.open(data.click, "_blank")
              }
            }
            onNotification?.(data)
          }
        } catch {}
      }

      eventSource.onerror = () => {
        eventSource.close()
        onStatusChange?.(false)
        retryCount++
        if (retryCount <= maxRetries) {
          setTimeout(connect, Math.min(retryCount * 5000, 30000))
        }
      }

      // Store cleanup
      abortController.signal.addEventListener("abort", () => {
        eventSource.close()
        onStatusChange?.(false)
      })
    } catch {
      onStatusChange?.(false)
    }
  }

  connect()

  return () => {
    abortController.abort()
    abortController = new AbortController()
  }
}
