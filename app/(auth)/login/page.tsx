"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/")
  }, [router])
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm text-gray-500">Redirecting...</p>
    </div>
  )
}
