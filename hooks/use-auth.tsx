"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { DUMMY_USER, simulateApiDelay } from "@/lib/dummy-data"

interface User {
  id: string
  name: string
  email: string
  picture: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async () => {
    setIsLoading(true)
    console.log("[v0] Starting Google authentication...")

    try {
      // Simulate Google OAuth flow
      await simulateApiDelay(2000)

      // In a real implementation, this would handle Google OAuth
      setUser(DUMMY_USER)
      console.log("[v0] Authentication successful:", DUMMY_USER.email)
    } catch (error) {
      console.error("[v0] Authentication failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("[v0] Logging out user:", user?.email)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
