'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { checkAdminStatus } from '@/lib/api'

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from sessionStorage on mount, then check admin status
  useEffect(() => {
    
    const storedUser = sessionStorage.getItem('user')
    const storedIsAdmin = sessionStorage.getItem('isAdmin') === 'true'
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        // Use cached admin status immediately, then re-verify in background
        setIsAdmin(storedIsAdmin)
        checkAdminStatus().then((result) => {
          setIsAdmin(result)
          sessionStorage.setItem('isAdmin', String(result))
        })
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('isAdmin')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Login failed')

      const data = await response.json()

      if (data.success && data.user) {
        const innerUser = data.user

        const userData: User = {
          name: innerUser.name,
          email: innerUser.email,
        }

        // Check admin status before resolving
        const adminResult = await checkAdminStatus()

        setUser(userData)
        setIsAdmin(adminResult)

        sessionStorage.setItem('user', JSON.stringify(userData))
        sessionStorage.setItem('isAdmin', String(adminResult))
      } else {
        console.error('Login failed or user data missing:', data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST', credentials:'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) throw new Error('Signup failed')

      const data = await response.json()

      if (data.success && data.user) {
        const innerUser = data.user

        const userData: User = {
          name: innerUser.name,
          email: innerUser.email,
        }

        // New signups are never admins
        setUser(userData)
        setIsAdmin(false)

        sessionStorage.setItem('user', JSON.stringify(userData))
        sessionStorage.setItem('isAdmin', 'false')
      } else {
        console.error('Signup failed or user data missing:', data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    
    setUser(null)
    setIsAdmin(false)
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('isAdmin')
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
