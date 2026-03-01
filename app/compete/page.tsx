'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Home, Loader2, Search } from 'lucide-react'
import { getProblems } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Loading from './loading'
import { ProtectedRoute } from '@/components/protected-route'

interface Problem {
  id: string
  title: string
  difficulty: string
  category: string
  acceptance_rate?: number
}

export default function competePageWrapper() {
  return (
    <ProtectedRoute>
      <CompetePage/>
    </ProtectedRoute>
  )
}

function CompetePage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchProblems()
  }, [selectedDifficulty, selectedCategory])

  const fetchProblems = async () => {
    setLoading(true)
    try {
      const response = await getProblems({
        difficulty: selectedDifficulty || undefined,
        category: selectedCategory || undefined,
        mode: 'compete'
      })

      if (response.success && response.problems) {
        setProblems(response.problems)
      } else {
        // Sample problems for demo
        setProblems([
          {
            id: '1',
            title: 'Two Sum',
            difficulty: 'Easy',
            category: 'Arrays',
            acceptance_rate: 47.3,
          },
          {
            id: '2',
            title: 'Longest Substring Without Repeating Characters',
            difficulty: 'Medium',
            category: 'Strings',
            acceptance_rate: 33.1,
          },
          {
            id: '3',
            title: 'Median of Two Sorted Arrays',
            difficulty: 'Hard',
            category: 'Arrays',
            acceptance_rate: 27.5,
          },
          {
            id: '4',
            title: 'Binary Search',
            difficulty: 'Easy',
            category: 'Searching',
            acceptance_rate: 52.1,
          },
          {
            id: '5',
            title: 'Merge K Sorted Lists',
            difficulty: 'Hard',
            category: 'Linked Lists',
            acceptance_rate: 35.8,
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProblems = problems.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const difficulties = ['Easy', 'Medium', 'Hard']
  const categories = ['Arrays', 'Math']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-500 bg-green-500/10'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'hard':
        return 'text-red-500 bg-red-500/10'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground mode-compete">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <Home className="w-5 h-5 text-accent" />
            </Link>
            <div className="w-px h-6 bg-border" />
            <BookOpen className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-accent">Compete DSA</h1>
          </div>
          <nav className="flex items-center gap-6">
            {/* <Link href="/code" className="text-foreground hover:text-accent transition">
              Practice
            </Link> */}
            <Link href="/learn" className="text-foreground hover:text-accent transition">
              Learn
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Difficulty Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Difficulty</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedDifficulty === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty(null)}
              >
                All
              </Button>
              {difficulties.map((d) => (
                <Button
                  key={d}
                  variant={selectedDifficulty === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(d)}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Category</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  variant={selectedCategory === c ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems List */}
        <Suspense fallback={<Loading />}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-card/50 font-semibold text-muted-foreground">
                <div className="col-span-6">Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Acceptance</div>
              </div>

              {/* Table Body */}
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <Link key={problem.id} href={`/compete/${problem.id}`}>
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-card/50 transition cursor-pointer">
                      <div className="col-span-6 font-medium hover:text-accent">{problem.title}</div>
                      <div className={`col-span-2 px-2 py-1 rounded text-sm font-semibold w-fit ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </div>
                      <div className="col-span-2 text-muted-foreground">{problem.category}</div>
                      <div className="col-span-2 text-muted-foreground">{problem.acceptance_rate}%</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">No problems found</div>
              )}
            </div>
          )}
        </Suspense>
      </main>
    </div>
  )
}
