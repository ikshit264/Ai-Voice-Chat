"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/Navigation"
import UserSettings from "@/components/UserSettings"
import TemplateManager from "@/components/TemplateManager"
import ApiKeyInput from "@/components/ApiKeyInput"
import { toast } from "@/components/ui/use-toast"

export default function Settings() {
  const [userId, setUserId] = useState<string>("")
  const [geminiKey, setGeminiKey] = useState<string>("")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")

  useEffect(() => {
    // Generate a user ID if not exists
    const storedUserId = localStorage.getItem("user-id")
    const newUserId = storedUserId || `user-${Date.now()}`
    if (!storedUserId) {
      localStorage.setItem("user-id", newUserId)
    }
    setUserId(newUserId)

    // Load Gemini key
    const savedKey = localStorage.getItem("gemini-api-key")
    if (savedKey) {
      setGeminiKey(savedKey)
    }

    // Load selected template
    const savedSettings = localStorage.getItem(`user-settings-${newUserId}`)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (parsed.defaultTemplateId) {
          setSelectedTemplateId(parsed.defaultTemplateId)
        }
      } catch (error) {
        console.error("Failed to parse settings:", error)
      }
    }
  }, [])

  const handleKeyUpdate = (key: string) => {
    setGeminiKey(key)
    localStorage.setItem("gemini-api-key", key)
    toast({
      title: "API Key Updated",
      description: "Your Gemini API key has been saved",
      variant: "success",
    })
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)

    // Update user settings with default template
    const savedSettings = localStorage.getItem(`user-settings-${userId}`)
    let settings = {}
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings)
      } catch (error) {
        console.error("Failed to parse settings:", error)
      }
    }

    const updatedSettings = { ...settings, defaultTemplateId: templateId }
    localStorage.setItem(`user-settings-${userId}`, JSON.stringify(updatedSettings))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account preferences and chat templates</p>
        </div>

        <div className="space-y-8">
          {/* API Key Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
            <ApiKeyInput value={geminiKey} onChange={handleKeyUpdate} />
          </div>

          {/* User Settings Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Settings</h2>
            <UserSettings userId={userId} />
          </div>

          {/* Template Manager Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Chat Templates</h2>
            <TemplateManager
              userId={userId}
              onTemplateSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplateId}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
