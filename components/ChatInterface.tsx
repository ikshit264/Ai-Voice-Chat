"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Play, Pause, Volume2 } from "lucide-react"
import VoiceRecorder from "./VoiceRecorder"
import { useVoiceManager } from "@/hooks/useVoiceManager"

interface Message {
  id: string
  role: "USER" | "ASSISTANT"
  content: string
  createdAt: Date
  isVoice?: boolean
}

interface ChatInterfaceProps {
  sessionId: string
  messages: Message[]
  onSendMessage: (message: string, isVoice?: boolean) => Promise<void>
  isLoading: boolean
}

export default function ChatInterface({ sessionId, messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { currentlyPlaying, isPaused, speak, pause, resume, stop } = useVoiceManager()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-play the latest assistant message
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      if (latestMessage.role === "ASSISTANT" && !currentlyPlaying) {
        speak(latestMessage.content, latestMessage.id)
      }
    }
  }, [messages, speak, currentlyPlaying])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput("")
    await onSendMessage(message, false)
  }

  const handleVoiceInput = async (transcript: string) => {
    await onSendMessage(transcript, true)
  }

  const handlePlayPause = (messageId: string, content: string) => {
    if (currentlyPlaying === messageId) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      stop()
      speak(content, messageId)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm">Send a message or use voice input to begin chatting with AI</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "USER" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.isVoice && (
                        <div className="flex items-center gap-1 mt-1 opacity-70">
                          <Volume2 className="w-3 h-3" />
                          <span className="text-xs">Voice message</span>
                        </div>
                      )}
                    </div>

                    {message.role === "ASSISTANT" && (
                      <button
                        onClick={() => handlePlayPause(message.id, message.content)}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label={currentlyPlaying === message.id ? (isPaused ? "Resume" : "Pause") : "Play"}
                      >
                        {currentlyPlaying === message.id && !isPaused ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Message AI..."
                className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-32"
                rows={1}
                style={{
                  minHeight: "48px",
                  height: "auto",
                }}
                disabled={isLoading}
              />
            </div>

            <VoiceRecorder onTranscript={handleVoiceInput} disabled={isLoading} />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
