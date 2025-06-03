"use client"

import type { ChatMessage } from "@/types/chat"

interface ChatHistoryProps {
  messages: ChatMessage[]
}

export default function ChatHistory({ messages }: ChatHistoryProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Start a conversation by typing a message or using voice input!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {message.role === "user" && message.isVoice && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="text-xs opacity-75">{message.role === "user" ? "You" : "AI"}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.enhancedInput && (
              <div className="mt-2 pt-2 border-t border-gray-300 opacity-75">
                <p className="text-xs">Enhanced: {message.enhancedInput}</p>
              </div>
            )}
            <p className="text-xs opacity-50 mt-1">{message.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
