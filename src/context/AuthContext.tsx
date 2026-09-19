import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authApi } from "../lib/api"

export interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin" | "superadmin"
  phone?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAuthModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  loginWithPassword: (email: string, password: string) => Promise<void>
  sendLoginOtp: (email: string) => Promise<void>
  verifyLoginOtp: (email: string, otp: string) => Promise<void>
  sendSignupOtp: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>
  verifySignupOtp: (email: string, otp: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("psg_token")
      if (!token) {
        setIsLoading(false)
        return
      }
      const res = await authApi.getMe()
      setUser(res.data.data)
    } catch {
      localStorage.removeItem("psg_token")
      localStorage.removeItem("psg_user")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const loginWithPassword = async (email: string, password: string) => {
    const res = await authApi.loginWithPassword({ email, password })
    const { token } = res.data.meta || {}
    if (token) localStorage.setItem("psg_token", token)
    localStorage.setItem("psg_user", JSON.stringify(res.data.data))
    setUser(res.data.data)
    closeAuthModal()
  }

  const sendLoginOtp = async (email: string) => {
    await authApi.sendLoginOtp({ email })
  }

  const verifyLoginOtp = async (email: string, otp: string) => {
    const res = await authApi.verifyLoginOtp({ email, otp })
    const { token } = res.data.meta || {}
    if (token) localStorage.setItem("psg_token", token)
    localStorage.setItem("psg_user", JSON.stringify(res.data.data))
    setUser(res.data.data)
    closeAuthModal()
  }

  const sendSignupOtp = async (data: { name: string; email: string; phone: string; password: string }) => {
    await authApi.sendSignupOtp(data)
  }

  const verifySignupOtp = async (email: string, otp: string) => {
    const res = await authApi.verifySignupOtp({ email, otp })
    const { token } = res.data.meta || {}
    if (token) localStorage.setItem("psg_token", token)
    localStorage.setItem("psg_user", JSON.stringify(res.data.data))
    setUser(res.data.data)
    closeAuthModal()
  }

  const logout = () => {
    localStorage.removeItem("psg_token")
    localStorage.removeItem("psg_user")
    setUser(null)
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithPassword,
        sendLoginOtp,
        verifyLoginOtp,
        sendSignupOtp,
        verifySignupOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
