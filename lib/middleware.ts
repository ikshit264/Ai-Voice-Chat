import { type NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "./auth"

export function withAuth(handler: (req: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return handler(req, payload.userId)
  }
}
