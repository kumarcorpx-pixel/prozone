"use client"

import Link from "next/link"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] px-4">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="h-8 w-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-4">Something Went Wrong</h2>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-white text-[#1a3a6b] font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
          >
            Back to Home
          </Link>
        </div>
        <p className="mt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} YABS Public Relations Management LLC
        </p>
      </div>
    </div>
  )
}
