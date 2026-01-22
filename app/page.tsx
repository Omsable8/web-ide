'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Code2, BookOpen, Zap } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-accent">CodeLearning</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/learn" className="text-foreground hover:text-accent transition">Learn</Link>
            <Link href="/code" className="text-foreground hover:text-accent transition">Practice</Link>
            <Link href="/compete" className="text-foreground hover:text-accent transition">Compete</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-background to-card py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-accent mb-4">Master DSA & Competitive Programming</h2>
          <p className="text-xl text-muted-foreground mb-8">Practice problems, get AI hints, and track your progress</p>
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
          <p>© 2025 CodeLearning. Master DSA one problem at a time.</p>
        </div>
      </footer>
    </div>
  )
}
