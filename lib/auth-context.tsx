'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  uid: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()

      // 1. Check if the request was successful based on your Flask response
      if (data.success && data.user) {
        const innerUser = data.user // To make it cleaner

        const userData: User = {
          uid: innerUser.uid,
          name: innerUser.name,
          email: innerUser.email,
        }

        // 2. Update state
        setUser(userData)

        // 3. Update LocalStorage
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('uid', innerUser.uid)

        console.log("Login successful, storage updated.")
      } 
      else {
        console.error("Login failed or user data missing:", data)
      }
    }
    finally {
      setIsLoading(false)
    }
  }
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        throw new Error('Signup failed')
      }

      const data = await response.json()
      // 1. Check if the request was successful based on your Flask response
      if (data.success && data.user) {
        const innerUser = data.user // To make it cleaner

        const userData: User = {
          uid: innerUser.uid,
          name: innerUser.name,
          email: innerUser.email,
        }

        // 2. Update state
        setUser(userData)

        // 3. Update LocalStorage
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('uid', innerUser.uid)

        console.log("Login successful, storage updated.")
      } 
      else {
        console.error("Login failed or user data missing:", data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('uid')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
