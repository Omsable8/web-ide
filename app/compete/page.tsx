'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Zap } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'

export default function CompetePageWrapper() {
  return (
    <ProtectedRoute>
      <CompetePage />
    </ProtectedRoute>
  )
}

function CompetePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <Home className="w-5 h-5 text-accent" />
            </Link>
            <div className="w-px h-6 bg-border" />
            <Zap className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-accent">Compete</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/learn" className="text-foreground hover:text-accent transition">
              Learn
            </Link>
            <Link href="/code" className="text-foreground hover:text-accent transition">
              Practice
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <Zap className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
          <h2 className="text-3xl font-bold text-accent mb-2">Coming Soon</h2>
          <p className="text-muted-foreground mb-8">
            Compete against other programmers and test your skills in timed challenges
          </p>
          <Link href="/learn">
            <Button className="bg-accent hover:bg-accent/90">Go to Learn</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
