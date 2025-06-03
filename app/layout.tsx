import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Navigation from "@/components/Navigation"

export const metadata: Metadata = {
  title: "AI Voice Chat",
  description: "Chat with Google Gemini using your voice or text",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
                <Navigation />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
