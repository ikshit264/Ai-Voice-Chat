"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import Navigation from "@/components/Navigation"
import LoadingSpinner from "@/components/LoadingSpinner"
import type { ChatSession } from "@/types/chat"
import { MessageSquare, Trash2, Calendar, ArrowRight } from "lucide-react"

export default function Dashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Generate a user ID if not exists
    const storedUserId = localStorage.getItem("user-id")
    const newUserId = storedUserId || `user-${Date.now()}`
    if (!storedUserId) {
      localStorage.setItem("user-id", newUserId)
    }
    setUserId(newUserId)

    fetchSessions(newUserId)
  }, [])

  const fetchSessions = async (userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/conversations?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }
      const data = await response.json()

      // Group conversations by sessionId and format as ChatSessions
      const sessionsMap = new Map<string, ChatSession>()

      data.conversations.forEach((conv: any) => {
        if (!sessionsMap.has(conv.sessionId)) {
          sessionsMap.set(conv.sessionId, {
            id: conv.sessionId,
            title: `Chat ${new Date(conv.timestamp).toLocaleDateString()}`,
            messages: [],
            createdAt: new Date(conv.timestamp),
            updatedAt: new Date(conv.timestamp),
            userId: conv.userId || userId,
            templateId: conv.templateId,
          })
        } else {
          const session = sessionsMap.get(conv.sessionId)!
          if (new Date(conv.timestamp) > session.updatedAt) {
            session.updatedAt = new Date(conv.timestamp)
          }
        }

        // Add messages
        const session = sessionsMap.get(conv.sessionId)!
        session.messages.push({
          id: `user-${conv.timestamp}`,
          role: "user",
          content: conv.originalInput,
          timestamp: new Date(conv.timestamp),
          isVoice: conv.isVoice,
        })
        session.messages.push({
          id: `assistant-${conv.timestamp}`,
          role: "assistant",
          content: conv.aiResponse,
          timestamp: new Date(conv.timestamp),
          enhancedInput: conv.enhancedInput,
        })
      })

      // Convert map to array and sort by updatedAt
      const sessionsArray = Array.from(sessionsMap.values())
      sessionsArray.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

      setSessions(sessionsArray)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load your chat history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/conversations?sessionId=${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete conversation")
      }

      setSessions((prev) => prev.filter((session) => session.id !== sessionId))

      toast({
        title: "Chat deleted",
        description: "The chat has been removed from your history",
      })
    } catch (error) {
      console.error("Error deleting session:", error)
      toast({
        title: "Error",
        description: "Failed to delete the chat",
        variant: "destructive",
      })
    }
  }

  const handleContinueChat = (sessionId: string) => {
    router.push(`/?session=${sessionId}`)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Chat History</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage your previous conversations</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => router.push("/")}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              New Chat
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No chats yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start a new conversation to see your chat history here.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start chatting
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <li key={session.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <MessageSquare className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600 truncate">{session.title}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>Created: {formatDate(session.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleContinueChat(session.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Continue <ArrowRight className="ml-1 h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {session.messages.length / 2} messages
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Last updated: {formatDate(session.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
