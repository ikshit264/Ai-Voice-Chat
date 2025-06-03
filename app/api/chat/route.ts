import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"
import { enhanceText, createChatChain, splitTextIfNeeded } from "@/lib/langchain"

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { message, sessionId, geminiKey, isVoice, templateId, systemPrompt } = await request.json()

    if (!message || !geminiKey) {
      return NextResponse.json({ error: "Message and Gemini API key are required" }, { status: 400 })
    }

    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Step 1: Enhance the input text
    let enhancedInput = message
    try {
      enhancedInput = await enhanceText(message)
    } catch (error) {
      console.warn("Text enhancement failed, using original text:", error)
    }

    // Step 2: Split text if needed
    const textChunks = splitTextIfNeeded(enhancedInput)

    // Step 3: Process with Gemini
    let fullResponse = ""
    try {
      const chain = await createChatChain(geminiKey, systemPrompt)

      for (const chunk of textChunks) {
        const response = await chain.invoke({ input: chunk })
        fullResponse += response + " "
      }
    } catch (error) {
      console.error("Gemini API error:", error)
      throw new Error("Failed to get response from Gemini AI. Please try again.")
    }

    const finalResponse = fullResponse.trim()

    // Step 4: Store messages in database
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId,
          role: "USER",
          content: message,
          originalInput: message,
          enhancedInput,
          isVoice: isVoice || false,
        },
        {
          sessionId,
          role: "ASSISTANT",
          content: finalResponse,
        },
      ],
    })

    // Update session timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      response: finalResponse,
      enhancedInput: enhancedInput !== message ? enhancedInput : undefined,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Chat processing failed" }, { status: 500 })
  }
})
