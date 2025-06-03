"use client"

import { useState } from "react"

export default function GettingStarted() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blue-800">Getting Started</h3>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 hover:text-blue-800 text-sm">
          {isExpanded ? "Hide" : "Show"} Instructions
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 text-sm text-blue-700">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Get your Gemini API Key</p>
              <p className="text-blue-600">
                Visit{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  Google AI Studio
                </a>{" "}
                to create your free API key
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <p className="font-medium">Configure API Key</p>
              <p className="text-blue-600">Enter your API key in the configuration section below</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Start Chatting</p>
              <p className="text-blue-600">Use voice input (microphone button) or type your messages</p>
            </div>
          </div>

          <div className="bg-blue-100 rounded-lg p-3 mt-4">
            <p className="font-medium text-blue-800">💡 Pro Tips:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700">
              <li>Allow microphone permissions for voice input</li>
              <li>Voice responses are automatically read aloud</li>
              <li>All conversations are saved automatically</li>
              <li>Use "New Chat" to start fresh conversations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
