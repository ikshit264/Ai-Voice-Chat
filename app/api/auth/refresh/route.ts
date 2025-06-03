import { type NextRequest, NextResponse } from "next/server"
import {
  verifyRefreshToken,
  generateTokens,
  storeRefreshToken,
  removeRefreshToken,
  findValidRefreshToken,
} from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 })
    }

    // Verify the refresh token exists in database
    const storedToken = await findValidRefreshToken(refreshToken)
    if (!storedToken) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Verify the token signature
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    })

    // Remove old refresh token and store new one
    await removeRefreshToken(refreshToken)
    await storeRefreshToken(user.id, newRefreshToken)

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 })
  }
}
