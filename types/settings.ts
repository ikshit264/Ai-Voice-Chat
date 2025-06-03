export interface UserSettings {
  id: string
  name: string
  email?: string
  prefersDarkMode?: boolean
  speakResponses?: boolean
  defaultTemplateId?: string
}

export interface ChatTemplate {
  id: string
  name: string
  description: string
  systemPrompt: string
  createdAt: Date
  updatedAt: Date
  userId: string
  isDefault?: boolean
}
