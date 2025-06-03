export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isVoice?: boolean
  enhancedInput?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  userId: string
  templateId?: string
}

export interface ConversationRecord {
  sessionId: string
  originalInput: string
  enhancedInput: string
  aiResponse: string
  timestamp: Date
  isVoice: boolean
  userId?: string
  templateId?: string
}
