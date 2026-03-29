// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"

const { exec } = require("child_process")
const { promisify } = require("util")
const fs = require("fs")
const path = require("path")

const execAsync = promisify(exec)

const BACKUP_DIR = "/var/backups/prozone"
const RETENTION_DAYS = 30

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "default-cron-secret"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    // Generate timestamp filename
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:]/g, "").replace("T", "_").split(".")[0]
    // Format: prozone_2026-03-27_120000.sql.gz
    const dateStr = now.toISOString().split("T")[0]
    const timeStr = now.toISOString().split("T")[1].split(".")[0].replace(/:/g, "")
    const filename = `prozone_${dateStr}_${timeStr}.sql.gz`
    const filepath = path.join(BACKUP_DIR, filename)

    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 })
    }

    // Run pg_dump and compress with gzip
    await execAsync(`pg_dump "${databaseUrl}" | gzip > "${filepath}"`)

    // Verify file was created
    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: "Backup file was not created" }, { status: 500 })
    }

    const stats = fs.statSync(filepath)

    // Delete backups older than 30 days
    let deletedCount = 0
    const cutoffDate = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000)
    const files = fs.readdirSync(BACKUP_DIR)

    for (const file of files) {
      if (!file.startsWith("prozone_") || !file.endsWith(".sql.gz")) continue
      const filePath = path.join(BACKUP_DIR, file)
      const fileStat = fs.statSync(filePath)
      if (fileStat.mtime < cutoffDate) {
        fs.unlinkSync(filePath)
        deletedCount++
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      backup: {
        filename,
        path: filepath,
        size: stats.size,
      },
      cleanup: {
        deletedCount,
        retentionDays: RETENTION_DAYS,
      },
    })
  } catch (err) {
    console.error("[Cron Backup] Error:", err instanceof Error ? err.message : "unknown")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
