import { NextResponse } from "next/server"
import { serviceCatalog } from "@/lib/service-catalog"

export async function GET() {
  try {
    // Try Supabase first
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()

      const { data: services, error } = await supabase
        .from("services")
        .select("*")
        .order("category", { ascending: true })

      if (!error && services && services.length > 0) {
        return NextResponse.json({ services })
      }
    }

    // Fallback to service catalog
    return NextResponse.json({ services: serviceCatalog })
  } catch {
    // Fallback to service catalog on any error
    return NextResponse.json({ services: serviceCatalog })
  }
}
