// @ts-nocheck
const { google } = require("googleapis")
import { getAuthenticatedClient } from "./google-auth"

export async function createCalendarEvent(
  refreshToken: string,
  event: { title: string; description?: string; location?: string; startDateTime: string; endDateTime: string; reminderMinutes?: number; colorId?: string }
): Promise<string> {
  try {
    const auth = getAuthenticatedClient(refreshToken)
    const calendar = google.calendar({ version: "v3", auth })
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        description: event.description || "",
        location: event.location || "Dubai, UAE",
        start: { dateTime: event.startDateTime, timeZone: "Asia/Dubai" },
        end: { dateTime: event.endDateTime, timeZone: "Asia/Dubai" },
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: event.reminderMinutes || 60 }],
        },
        colorId: event.colorId || "1",
      },
    })
    return res.data.id
  } catch (err: any) {
    console.error("[Calendar] Create error:", err.message)
    throw err
  }
}

export async function updateCalendarEvent(refreshToken: string, eventId: string, updates: any): Promise<void> {
  try {
    const auth = getAuthenticatedClient(refreshToken)
    const calendar = google.calendar({ version: "v3", auth })
    await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: updates,
    })
  } catch (err: any) {
    console.error("[Calendar] Update error:", err.message)
  }
}

export async function deleteCalendarEvent(refreshToken: string, eventId: string): Promise<void> {
  try {
    const auth = getAuthenticatedClient(refreshToken)
    const calendar = google.calendar({ version: "v3", auth })
    await calendar.events.delete({ calendarId: "primary", eventId })
  } catch (err: any) {
    console.error("[Calendar] Delete error:", err.message)
  }
}

export async function getCalendarEvents(refreshToken: string, startDate: string, endDate: string) {
  try {
    const auth = getAuthenticatedClient(refreshToken)
    const calendar = google.calendar({ version: "v3", auth })
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    })
    return (res.data.items || []).map((e: any) => ({
      id: e.id,
      title: e.summary,
      description: e.description,
      location: e.location,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      status: e.status,
    }))
  } catch (err: any) {
    console.error("[Calendar] List error:", err.message)
    return []
  }
}
