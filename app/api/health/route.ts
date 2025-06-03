import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  const status = {
    mongodb: false,
    huggingface: false,
    ready: false,
  }

  // Check MongoDB connection
  try {
    await getDatabase()
    status.mongodb = true
  } catch (error) {
    console.error("MongoDB health check failed:", error)
  }

  // Check Hugging Face API key
  status.huggingface = !!process.env.HUGGINGFACE_API_KEY

  status.ready = status.mongodb

  return NextResponse.json(status)
}
