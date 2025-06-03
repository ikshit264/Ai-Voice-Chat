"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
}

interface AuthContextType {
  user: User | null
  login: (credential: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")

      if (!accessToken || !refreshToken) {
        setIsLoading(false)
        return
      }

      // Try to use access token first
      const response = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else if (response.status === 401) {
        // Try to refresh token
        await refreshAccessToken()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) return

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)

        // Get user data with new token
        const userResponse = await fetch("/api/user/me", {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }
      } else {
        // Refresh failed, clear tokens
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
    }
  }

  const login = async (credential: string) => {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      })

      console.log(response);

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)
        setUser(data.user)
      } else {
        throw new Error("Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")

      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
