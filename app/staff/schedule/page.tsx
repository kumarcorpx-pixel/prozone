"use client"

import { useState, useEffect } from "react"
import { fetchRequests } from "@/lib/data-fetcher"
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { CalendarCheck, MapPin, X, Clock, ExternalLink, Calendar, Loader2 } from "lucide-react"

const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
}

interface CalEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  location?: string
  htmlLink?: string
}

export default function SchedulePage() {
  const [locations, setLocations] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState("")
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [calEvents, setCalEvents] = useState<CalEvent[]>([])
  const [calConnected, setCalConnected] = useState<boolean | null>(null)
  const [calLoading, setCalLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const r = await fetchRequests()
      setRequests(r)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    async function loadCalendar() {
      try {
        const now = new Date()
        const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const res = await fetch(`/api/calendar/events?start=${now.toISOString()}&end=${end.toISOString()}`)
        const data = await res.json()
        if (data.connected) {
          setCalConnected(true)
          setCalEvents(data.events || [])
        } else {
          setCalConnected(false)
        }
      } catch {
        setCalConnected(false)
      }
      setCalLoading(false)
    }
    loadCalendar()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  const todaysTasks = requests
    .flatMap(req => {
      const items = getChecklistForServiceType(req.service_type)
      return items.slice(0, 3).map((item, i) => ({
        id: `${req.id}-${i}`,
        request: req.service_type,
        company: req.company?.name || "N/A",
        item,
        priority: req.priority,
      }))
    })
    .sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3))
    .slice(0, 12)

  const addLocation = () => {
    if (!locationInput.trim()) return
    setLocations(prev => [...prev, locationInput.trim()])
    setLocationInput("")
  }

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  const formatEventTime = (event: CalEvent) => {
    const start = event.start.dateTime || event.start.date
    if (!start) return "All day"
    const d = new Date(start)
    if (event.start.date && !event.start.dateTime) return "All day"
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  }

  const formatEventDate = (event: CalEvent) => {
    const start = event.start.dateTime || event.start.date
    if (!start) return ""
    return new Date(start).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-[#1a3a6b]" />
          Today&apos;s Schedule
        </h1>
        <p className="text-sm text-gray-500 mt-1">{today}</p>
      </div>

      {/* Google Calendar Events */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-[#1a3a6b]" />
          Calendar Events (Next 7 Days)
        </h3>
        {calLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading calendar...
          </div>
        ) : calConnected === false ? (
          <div className="py-3">
            <p className="text-sm text-gray-500 mb-2">Google Calendar not connected yet.</p>
            <a
              href="/api/auth/google"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <Calendar className="h-4 w-4" />
              Connect Google Calendar
            </a>
          </div>
        ) : calEvents.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No upcoming events in the next 7 days.</p>
        ) : (
          <div className="space-y-2">
            {calEvents.slice(0, 8).map(event => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs font-medium text-blue-700 bg-blue-100 rounded px-2 py-1 whitespace-nowrap">
                  {formatEventTime(event)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.summary}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{formatEventDate(event)}</span>
                    {event.location && (
                      <>
                        <span className="text-xs text-gray-400">&middot;</span>
                        <span className="text-xs text-gray-500 truncate">{event.location}</span>
                      </>
                    )}
                  </div>
                </div>
                {event.htmlLink && (
                  <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex-shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Where I'm going */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-[#1a3a6b]" />
          Where I&apos;m going today
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
            placeholder="e.g., MOHRE Tasheel - Al Quoz"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onKeyDown={e => e.key === "Enter" && addLocation()}
          />
          <button onClick={addLocation} className="px-4 py-2 bg-[#1a3a6b] text-white text-sm rounded-lg hover:bg-[#15305a]">
            Add
          </button>
        </div>
        {locations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {locations.map((loc, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full">
                <MapPin className="h-3 w-3" />
                {loc}
                <button onClick={() => setLocations(prev => prev.filter((_, j) => j !== i))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-[#1a3a6b]" />
          Priority Tasks ({todaysTasks.length - completedTasks.size} remaining)
        </h3>
        <div className="space-y-2">
          {todaysTasks.map(task => {
            const done = completedTasks.has(task.id)
            return (
              <label key={task.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${done ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}>
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => {
                    setCompletedTasks(prev => {
                      const next = new Set(prev)
                      done ? next.delete(task.id) : next.add(task.id)
                      return next
                    })
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${done ? "line-through text-gray-400" : "text-gray-700"}`}>{task.item}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{task.request}</span>
                    <span className="text-xs text-gray-400">&middot;</span>
                    <span className="text-xs text-gray-500">{task.company}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || "bg-gray-100"}`}>
                  {task.priority}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
