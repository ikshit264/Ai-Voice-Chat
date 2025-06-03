"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import type { UserSettings } from "@/types/settings"

interface UserSettingsProps {
  userId: string
}

export default function UserSettings({ userId }: UserSettingsProps) {
  const [settings, setSettings] = useState<UserSettings>({
    id: userId,
    name: "",
    email: "",
    prefersDarkMode: false,
    speakResponses: true,
  })

  useEffect(() => {
    loadSettings()
  }, [userId])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem(`user-settings-${userId}`)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...parsed, id: userId })
      } catch (error) {
        console.error("Failed to parse settings:", error)
      }
    } else {
      // Default settings
      const defaultSettings: UserSettings = {
        id: userId,
        name: "",
        prefersDarkMode: false,
        speakResponses: true,
      }
      setSettings(defaultSettings)
      saveSettings(defaultSettings)
    }
  }

  const saveSettings = (updatedSettings: UserSettings) => {
    localStorage.setItem(`user-settings-${userId}`, JSON.stringify(updatedSettings))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value

    const updatedSettings = { ...settings, [name]: newValue }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)

    toast({
      title: "Settings updated",
      description: "Your preferences have been saved",
      variant: "success",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={settings.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={settings.email || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="your.email@example.com"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="prefersDarkMode"
              name="prefersDarkMode"
              checked={settings.prefersDarkMode}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="prefersDarkMode" className="ml-2 block text-sm text-gray-700">
              Dark Mode
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="speakResponses"
              name="speakResponses"
              checked={settings.speakResponses}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="speakResponses" className="ml-2 block text-sm text-gray-700">
              Speak AI responses aloud
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
