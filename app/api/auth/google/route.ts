import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTokens, storeRefreshToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    console.log("Received credential:", credential)


    // Verify Google token (you'll need to implement this)
    const googleUser = await verifyGoogleToken(credential)
    console.log("Google user data:", googleUser)


    if (!googleUser) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })
    console.log("User record:", user)


    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          googleId: googleUser.sub,
          emailVerified: new Date(),
        },
      })

      // Create default preferences
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
        },
      })

      // Create default template
      await prisma.chatTemplate.create({
        data: {
          name: "General Assistant",
          description: "A helpful AI assistant for general questions",
          systemPrompt:
            "You are a helpful AI assistant. Respond to the user's message in a conversational and friendly manner.",
          userId: user.id,
          isDefault: true,
        },
      })
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    })

    await storeRefreshToken(user.id, refreshToken)
    console.log("Generated tokens:", { accessToken, refreshToken })


    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      accessToken,
      refreshToken,
    })
  }  catch (error: any) {
    console.error("Google auth error:", error.message ?? error, error.stack ?? '')
    return NextResponse.json({ error: error.message ?? "Authentication failed" }, { status: 500 })
  }
  
}

async function verifyGoogleToken(credential: string) {
  // Implement Google token verification
  // You can use google-auth-library for this
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    const data = await response.json()

    if (data.error) {
      return null
    }

    return {
      sub: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
    }
  } catch {
    return null
  }
}
