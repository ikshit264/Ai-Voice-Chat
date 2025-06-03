import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const userId = searchParams.get("userId")

    const db = await getDatabase()
    let query = {}

    if (sessionId) {
      query = { sessionId }
    } else if (userId) {
      query = { userId }
    } else {
      return NextResponse.json({ error: "Session ID or User ID is required" }, { status: 400 })
    }

    const conversations = await db.collection("conversations").find(query).sort({ timestamp: 1 }).toArray()

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    await db.collection("conversations").deleteMany({ sessionId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete conversations error:", error)
    return NextResponse.json({ error: "Failed to delete conversations" }, { status: 500 })
  }
}
