"use client"

import { useState } from "react"

interface ApiKeyInputProps {
  value: string
  onChange: (key: string) => void
}

export default function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tempKey, setTempKey] = useState(value)

  const handleSave = () => {
    onChange(tempKey)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Google Gemini API Key</h3>
        <button onClick={() => setIsVisible(!isVisible)} className="text-sm text-blue-500 hover:text-blue-600">
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>

      {isVisible && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Save
            </button>
          </div>
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <p className="font-medium mb-1">How to get your Gemini API key:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Go to{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Google AI Studio
                </a>
              </li>
              <li>Sign in with your Google account</li>
              <li>Click "Create API Key"</li>
              <li>Copy and paste the key above</li>
            </ol>
            <p className="mt-2 text-xs text-gray-500">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>
      )}

      {!isVisible && (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${value ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-gray-600">{value ? "API key configured" : "API key required"}</span>
        </div>
      )}
    </div>
  )
}
