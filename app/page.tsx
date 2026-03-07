'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Code2, BookOpen, Zap, LogOut, User, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsClient(true)
    // Sync initial state with actual document class
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    if (root.classList.contains('dark')) {
      root.classList.remove('dark')
      setIsDark(false)
      localStorage.setItem('editorTheme', 'light')
    } else {
      root.classList.add('dark')
      setIsDark(true)
      localStorage.setItem('editorTheme', 'dark')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-accent">MAPLE</h1>
          </div>
          <nav className="flex items-center gap-6">
            {/* Theme toggle - always visible */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-md border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isClient && user ? (
              <>
                <Link href="/learn" className="text-foreground hover:text-accent transition">Learn</Link>
                <Link href="/code" className="text-foreground hover:text-accent transition">Practice</Link>
                <Link href="/compete" className="text-foreground hover:text-accent transition">Compete</Link>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {user.name}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-accent hover:bg-accent/90">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-background to-card py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-accent mb-4">Mode-based AI-assisted Programming and Learning Environment</h2>
          <p className="text-xl text-muted-foreground mb-8">Practice problems, get AI hints, and track your progress</p>
          {isClient && user ? (
            <div className="flex gap-4 justify-center">
              <Link href="/learn">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start Learning
                </Button>
              </Link>
              <Link href="/code">
                <Button size="lg" variant="outline">
                  <Code2 className="w-5 h-5 mr-2" />
                  Practice Code
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-accent mb-12 text-center">Why Learn Here?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <BookOpen className="w-10 h-10 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-accent mb-2">Curated Problems</h4>
            <p className="text-muted-foreground">Carefully selected DSA problems from easy to advanced</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Code2 className="w-10 h-10 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-accent mb-2">Live Code Editor</h4>
            <p className="text-muted-foreground">Monaco Editor with multi-language support</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Zap className="w-10 h-10 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-accent mb-2">AI Guidance</h4>
            <p className="text-muted-foreground">3-level hint system and AI debugging assistant</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 MAPLE. Master DSA one problem at a time.</p>
        </div>
      </footer>
    </div>
  )
}
