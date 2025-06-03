import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { RunnableSequence } from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"

export async function enhanceText(text: string): Promise<string> {
  try {
    // Check if Hugging Face API key is available
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn("HUGGINGFACE_API_KEY not found, using original text")
      return text
    }

    // Using Hugging Face API for text enhancement
    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-base", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Improve the grammar and clarity of this text while keeping the original meaning: "${text}"`,
        parameters: {
          max_length: 200,
          temperature: 0.3,
        },
      }),
    })

    if (!response.ok) {
      console.warn("Text enhancement failed, using original text")
      return text
    }

    const result = await response.json()

    // Handle different response formats from Hugging Face
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text.trim()
    } else if (result.generated_text) {
      return result.generated_text.trim()
    }

    return text
  } catch (error) {
    console.error("Text enhancement error:", error)
    return text // Fallback to original text
  }
}

export async function createChatChain(geminiApiKey: string, systemPrompt?: string) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: geminiApiKey,
    model: "gemini-1.5-flash", // Using gemini-1.5-flash as gemini-2.0-flash isn't available yet
    temperature: 0.7,
    maxOutputTokens: 1000,
  })

  const defaultPrompt = `You are a helpful AI assistant. Respond to the user's message in a conversational and friendly manner.`

  const promptTemplate = PromptTemplate.fromTemplate(
    `${systemPrompt || defaultPrompt}

User message: {input}

Response:`,
  )

  const chain = RunnableSequence.from([promptTemplate, model, new StringOutputParser()])

  return chain
}

export function splitTextIfNeeded(text: string, maxTokens = 2000): string[] {
  // Simple token estimation (roughly 4 characters per token)
  const estimatedTokens = text.length / 4

  if (estimatedTokens <= maxTokens) {
    return [text]
  }

  // Split by sentences first
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim())
  const chunks: string[] = []
  let currentChunk = ""

  for (const sentence of sentences) {
    const potentialChunk = currentChunk + sentence + "."

    if (potentialChunk.length / 4 > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence + "."
    } else {
      currentChunk = potentialChunk
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks.length > 0 ? chunks : [text]
}
