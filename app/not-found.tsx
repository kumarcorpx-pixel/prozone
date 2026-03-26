import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-white/20 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1a3a6b] font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
        >
          Back to Home
        </Link>
        <p className="mt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} YABS Public Relations Management LLC
        </p>
      </div>
    </div>
  )
}
