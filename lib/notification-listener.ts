"use client"

const NTFY_BASE_URL = process.env.NEXT_PUBLIC_NTFY_BASE_URL || "https://notify.corporatepro.cloud"

export function startNotificationListener(topic: string, onNotification?: (data: any) => void): () => void {
  if (typeof window === "undefined") return () => {}

  // Request browser notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }

  const url = `${NTFY_BASE_URL}/${topic}/sse`
  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        const n = new Notification(data.title || "YABS Notification", {
          body: data.message || "",
          icon: "/favicon.ico",
          tag: data.id,
        })
        if (data.click) {
          n.onclick = () => window.open(data.click, "_blank")
        }
      }
      if (onNotification) onNotification(data)
    } catch {}
  }

  eventSource.onerror = () => {
    // EventSource auto-reconnects
    console.log("[Ntfy] Connection error, will retry...")
  }

  return () => eventSource.close()
}
