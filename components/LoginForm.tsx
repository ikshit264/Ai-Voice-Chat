"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

declare global {
  interface Window {
    google: any
  }
}

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleGoogleLogin = async (credential: string) => {
    setIsLoading(true)
    try {
      await login(credential)
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Load the Google Identity script dynamically
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: (response: any) => {
            handleGoogleLogin(response.credential)
          },
        })

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: 300,
          }
        )
      }
    }
    document.body.appendChild(script)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to AI Voice Chat</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to start chatting with AI</p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <div id="google-signin-button"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
