import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Fetch profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      // Return basic user info if no profile exists
      return NextResponse.json({
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || null,
        role: user.user_metadata?.role || "client",
        createdAt: user.created_at,
      })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: profile.full_name,
      role: profile.role,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
