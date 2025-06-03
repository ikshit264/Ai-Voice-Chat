import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"

export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        template: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Get sessions error:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { title, templateId } = await request.json()

    const session = await prisma.chatSession.create({
      data: {
        title: title || "New Chat",
        userId,
        templateId,
      },
      include: {
        template: true,
      },
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Create session error:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
})
