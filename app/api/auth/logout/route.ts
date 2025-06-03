import { type NextRequest, NextResponse } from "next/server"
import { removeRefreshToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (refreshToken) {
      await removeRefreshToken(refreshToken)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
