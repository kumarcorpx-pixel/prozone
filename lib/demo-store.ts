"use client"

// localStorage-backed state management for demo mode
// Persists status updates, notes, checklist completions, and timeline entries

const STORE_KEY = "prozone_demo_store"

interface DemoStore {
  requestStatuses: Record<string, string>  // request_id → status
  checklistItems: Record<string, Record<string, boolean>>  // request_id → { item_text → completed }
  notes: { id: string; request_id: string; user_name: string; user_role: string; content: string; created_at: string }[]
  timelineEntries: { id: string; request_id: string; message: string; created_by: string; created_at: string; status?: string }[]
  govReferences: Record<string, Record<string, string>>  // request_id → { field_name → value }
  visitLogs: { id: string; request_id: string; location: string; time: string; description: string; created_at: string }[]
}

function getStore(): DemoStore {
  if (typeof window === "undefined") return defaultStore()
  try {
    const stored = localStorage.getItem(STORE_KEY)
    return stored ? JSON.parse(stored) : defaultStore()
  } catch {
    return defaultStore()
  }
}

function saveStore(store: DemoStore) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

function defaultStore(): DemoStore {
  return {
    requestStatuses: {},
    checklistItems: {},
    notes: [],
    timelineEntries: [],
    govReferences: {},
    visitLogs: [],
  }
}

// Status
export function getRequestStatus(requestId: string, defaultStatus: string): string {
  return getStore().requestStatuses[requestId] || defaultStatus
}

export function setRequestStatus(requestId: string, status: string, userName: string) {
  const store = getStore()
  const oldStatus = store.requestStatuses[requestId]
  store.requestStatuses[requestId] = status
  // Auto-create timeline entry
  store.timelineEntries.push({
    id: `tl-${Date.now()}`,
    request_id: requestId,
    message: `Status changed${oldStatus ? ` from ${oldStatus}` : ""} to ${status}`,
    created_by: userName,
    created_at: new Date().toISOString(),
    status,
  })
  saveStore(store)
}

// Checklist
export function isChecklistItemCompleted(requestId: string, item: string): boolean | undefined {
  return getStore().checklistItems[requestId]?.[item]
}

export function toggleChecklistItem(requestId: string, item: string, completed: boolean, userName: string) {
  const store = getStore()
  if (!store.checklistItems[requestId]) store.checklistItems[requestId] = {}
  store.checklistItems[requestId][item] = completed
  store.timelineEntries.push({
    id: `tl-${Date.now()}`,
    request_id: requestId,
    message: completed ? `Completed: "${item}"` : `Unchecked: "${item}"`,
    created_by: userName,
    created_at: new Date().toISOString(),
  })
  saveStore(store)
}

// Notes
export function addNote(requestId: string, userName: string, userRole: string, content: string) {
  const store = getStore()
  const note = {
    id: `note-${Date.now()}`,
    request_id: requestId,
    user_name: userName,
    user_role: userRole,
    content,
    created_at: new Date().toISOString(),
  }
  store.notes.push(note)
  store.timelineEntries.push({
    id: `tl-${Date.now()}-note`,
    request_id: requestId,
    message: `Added note: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
    created_by: userName,
    created_at: new Date().toISOString(),
  })
  saveStore(store)
  return note
}

export function getNotes(requestId: string) {
  return getStore().notes.filter(n => n.request_id === requestId)
}

// Timeline
export function getTimelineEntries(requestId: string) {
  return getStore().timelineEntries.filter(t => t.request_id === requestId)
}

// Government References
export function getGovReferences(requestId: string): Record<string, string> {
  return getStore().govReferences[requestId] || {}
}

export function setGovReference(requestId: string, field: string, value: string) {
  const store = getStore()
  if (!store.govReferences[requestId]) store.govReferences[requestId] = {}
  store.govReferences[requestId][field] = value
  saveStore(store)
}

// Visit Logs
export function addVisitLog(requestId: string, location: string, time: string, description: string) {
  const store = getStore()
  const log = {
    id: `visit-${Date.now()}`,
    request_id: requestId,
    location, time, description,
    created_at: new Date().toISOString(),
  }
  store.visitLogs.push(log)
  saveStore(store)
  return log
}

export function getVisitLogs(requestId: string) {
  return getStore().visitLogs.filter(v => v.request_id === requestId)
}

// Reset
export function resetDemoStore() {
  if (typeof window !== "undefined") localStorage.removeItem(STORE_KEY)
}
