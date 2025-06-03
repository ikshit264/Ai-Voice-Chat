"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/LoginForm"
import ChatInterface from "@/components/ChatInterface"
import LoadingSpinner from "@/components/LoadingSpinner"

interface Message {
  id: string
  role: "USER" | "ASSISTANT"
  content: string
  createdAt: Date
  isVoice?: boolean
}

export default function Home() {
  const { user, isLoading: authLoading } = useAuth()
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [geminiKey, setGeminiKey] = useState("")

  useEffect(() => {
    if (user) {
      // Load Gemini key from localStorage
      const savedKey = localStorage.getItem(`gemini-key-${user.id}`)
      if (savedKey) {
        setGeminiKey(savedKey)
      }

      // Create or load session
      createNewSession()
    }
  }, [user])

  const createNewSession = async () => {
    if (!user) return

    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: "New Chat",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSession(data.session.id)
        setMessages([])
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    }
  }

  const handleSendMessage = async (message: string, isVoice = false) => {
    if (!currentSession || !geminiKey) return

    setIsLoading(true)

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "USER",
      content: message,
      createdAt: new Date(),
      isVoice,
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message,
          sessionId: currentSession,
          geminiKey,
          isVoice,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "ASSISTANT",
          content: data.response,
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Send message error:", error)
      // Remove user message on error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!geminiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center">Setup Required</h2>
          <p className="text-gray-600 text-center">Please enter your Gemini API key to start chatting</p>
          <input
            type="password"
            placeholder="Enter Gemini API key..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const key = (e.target as HTMLInputElement).value
                if (key.trim()) {
                  setGeminiKey(key.trim())
                  localStorage.setItem(`gemini-key-${user.id}`, key.trim())
                }
              }
            }}
          />
          <p className="text-xs text-gray-500">
            Get your API key from{" "}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ChatInterface
      sessionId={currentSession}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
    />
  )
}
