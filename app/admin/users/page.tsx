'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  FileCode,
  MessageSquare,
  TrendingUp,
  Download,
  Search,
  Eye,
  Copy,
  Check,
  Loader2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

import type {
  UserAnalyticsSummary,
  StudentDetailedProfile,
  PlatformStats,
  DifficultyVelocityData,
  AIAssistanceData,
} from '@/lib/analytics-types'

import {
  fetchPlatformStats,
  fetchAllUsersAnalytics,
  fetchStudentDetails,
  fetchDifficultyVelocity,
  fetchAIAssistanceData,
  handleGlobalExportCSV,
  handleStudentExportCSV,
} from '@/lib/api'

export default function UserAnalyticsDashboard() {
  // Platform stats
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Chart data
  const [velocityData, setVelocityData] = useState<DifficultyVelocityData[]>([])
  const [aiAssistanceData, setAiAssistanceData] = useState<AIAssistanceData[]>([])

  // Users table
  const [users, setUsers] = useState<UserAnalyticsSummary[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Student detail modal
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailedProfile | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingStudent, setLoadingStudent] = useState(false)

  // Copy UID state
  const [copiedUid, setCopiedUid] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadPlatformData()
    loadUsers()
  }, [])

  // Reload users when page/search/filter changes
  useEffect(() => {
    loadUsers()
  }, [currentPage, searchQuery, filterCategory])

  async function loadPlatformData() {
    setLoadingStats(true)
    try {
      const [statsRes, velocityRes, aiRes] = await Promise.all([
        fetchPlatformStats(),
        fetchDifficultyVelocity(),
        fetchAIAssistanceData(),
      ])

      if (statsRes.success && statsRes.stats) {
        setPlatformStats(statsRes.stats)
      }
      if (velocityRes.success && velocityRes.data) {
        setVelocityData(velocityRes.data)
      }
      if (aiRes.success && aiRes.data) {
        setAiAssistanceData(aiRes.data)
      }
    } catch (error) {
      console.error('[Dashboard] Error loading platform data:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  async function loadUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetchAllUsersAnalytics(
        currentPage,
        10,
        searchQuery || undefined,
        filterCategory !== 'all' ? filterCategory : undefined
      )
      if (res.success && res.users) {
        setUsers(res.users)
        setTotalPages(res.total_pages || 1)
      }
    } catch (error) {
      console.error('[Dashboard] Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  async function handleViewProfile(uid: string) {
    setLoadingStudent(true)
    setIsModalOpen(true)
    try {
      const res = await fetchStudentDetails(uid)
      if (res.success && res.profile) {
        setSelectedStudent(res.profile)
      }
    } catch (error) {
      console.error('[Dashboard] Error loading student profile:', error)
    } finally {
      setLoadingStudent(false)
    }
  }

  function handleCopyUid(uid: string) {
    navigator.clipboard.writeText(uid)
    setCopiedUid(uid)
    setTimeout(() => setCopiedUid(null), 2000)
  }

  // Chart colors (explicit hex for reliable rendering)
  const CHART_COLORS = {
    attempted: '#3b82f6', // blue-500
    solved: '#10b981',    // emerald-500
    aiMessages: '#8b5cf6', // violet-500
  }

  const velocityChartConfig = {
    attempted: { label: 'Attempted', color: CHART_COLORS.attempted },
    solved: { label: 'Solved', color: CHART_COLORS.solved },
  }

  const pieColors = ['#10b981', '#f59e0b', '#ef4444'] // emerald, amber, crimson

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">User Analytics &amp; System Metrics</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Problem Management
              </Button>
            </Link>
            <Button onClick={handleGlobalExportCSV} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download System CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  platformStats?.total_students.toLocaleString()
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Submissions
              </CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  platformStats?.total_submissions.toLocaleString()
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Messages Exchanged
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  platformStats?.total_ai_messages.toLocaleString()
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Global Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  `${((platformStats?.global_success_rate || 0) * 100).toFixed(1)}%`
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Velocity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Problem Velocity by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={velocityChartConfig} className="h-[280px] w-full">
                <BarChart data={velocityData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="difficulty" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="attempted" fill={CHART_COLORS.attempted} radius={[4, 4, 0, 0]} name="Attempted" />
                  <Bar dataKey="solved" fill={CHART_COLORS.solved} radius={[4, 4, 0, 0]} name="Solved" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* AI Assistance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average AI Assistance per Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ messages: { label: 'Avg Messages', color: CHART_COLORS.aiMessages } }} className="h-[280px] w-full">
                <BarChart data={aiAssistanceData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis dataKey="problem_title" type="category" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avg_ai_messages" fill={CHART_COLORS.aiMessages} radius={[0, 4, 4, 0]} name="Avg Messages" label={{ position: 'right', fontSize: 11 }} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Performance Index</CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or UID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9"
                />
              </div>
              <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="high_performer">High Performers</SelectItem>
                  <SelectItem value="needs_help">Needs Help</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">UID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Attempted</TableHead>
                    <TableHead className="text-center">Solved</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell>
                          <button
                            onClick={() => handleCopyUid(user.uid)}
                            className="inline-flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                          >
                            {user.uid.slice(0, 12)}...
                            {copiedUid === user.uid ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="text-center">{user.problems_attempted}</TableCell>
                        <TableCell className="text-center">{user.problems_solved}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProfile(user.uid)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Student Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col" showCloseButton={false}>
          <DialogTitle className="sr-only">
            Student Profile - {selectedStudent?.user.name || 'Loading'}
          </DialogTitle>

          {loadingStudent ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedStudent ? (
            <>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border bg-muted/30 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedStudent.user.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.user.email} &middot; <span className="font-mono">{selectedStudent.user.uid}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => handleStudentExportCSV(selectedStudent.user.uid)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Student CSV Ledger
                    </Button>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>

              {/* Modal Body - 4 Column Grid */}
              <div className="flex-1 grid grid-cols-4 divide-x divide-border overflow-hidden">
                {/* Left Column: Pie Chart */}
                <div className="flex flex-col overflow-hidden">
                  <div className="px-4 py-3 bg-muted/50 border-b border-border shrink-0">
                    <h3 className="text-sm font-semibold">Completion Distribution</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Easy', value: selectedStudent.difficulty_breakdown.easy.solved, total: selectedStudent.difficulty_breakdown.easy.attempted },
                              { name: 'Medium', value: selectedStudent.difficulty_breakdown.medium.solved, total: selectedStudent.difficulty_breakdown.medium.attempted },
                              { name: 'Hard', value: selectedStudent.difficulty_breakdown.hard.solved, total: selectedStudent.difficulty_breakdown.hard.attempted },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {pieColors.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                          <span>Easy</span>
                        </div>
                        <span className="font-mono">{selectedStudent.difficulty_breakdown.easy.solved}/{selectedStudent.difficulty_breakdown.easy.attempted}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-amber-500" />
                          <span>Medium</span>
                        </div>
                        <span className="font-mono">{selectedStudent.difficulty_breakdown.medium.solved}/{selectedStudent.difficulty_breakdown.medium.attempted}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-red-500" />
                          <span>Hard</span>
                        </div>
                        <span className="font-mono">{selectedStudent.difficulty_breakdown.hard.solved}/{selectedStudent.difficulty_breakdown.hard.attempted}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 3 Columns: Tabs */}
                <div className="col-span-3 flex flex-col overflow-hidden">
                  <Tabs defaultValue="engagement" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 py-3 bg-muted/50 border-b border-border shrink-0">
                      <TabsList>
                        <TabsTrigger value="engagement">Feature Engagement</TabsTrigger>
                        <TabsTrigger value="ai-logs">AI Dialog Streams</TabsTrigger>
                        <TabsTrigger value="history">Code History</TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Tab 1: Feature Engagement */}
                    <TabsContent value="engagement" className="flex-1 overflow-y-auto p-6 mt-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Debugger</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{selectedStudent.feature_usage.debugger_activations}</div>
                            <p className="text-xs text-muted-foreground">activations</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Code Runs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{selectedStudent.feature_usage.code_runs}</div>
                            <p className="text-xs text-muted-foreground">compilations</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Submissions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{selectedStudent.feature_usage.code_submissions}</div>
                            <p className="text-xs text-muted-foreground">submits</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Hints Used</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{selectedStudent.feature_usage.hints_used}</div>
                            <p className="text-xs text-muted-foreground">level (0-3)</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Complexity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{selectedStudent.feature_usage.complexity_analysis}</div>
                            <p className="text-xs text-muted-foreground">analyses</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Tab 2: AI Dialog Streams */}
                    <TabsContent value="ai-logs" className="flex-1 overflow-hidden mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-6 space-y-6">
                          {selectedStudent.ai_chat_logs.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No AI chat logs found</p>
                          ) : (
                            selectedStudent.ai_chat_logs.map((chatSession) => (
                              <div key={chatSession.id} className="border border-border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium">{chatSession.problem_title}</h4>
                                  <Badge variant="secondary" className="font-mono text-xs">
                                    {chatSession.problem_id}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-4">
                                  Session started: {new Date(chatSession.session_start).toLocaleString()}
                                </p>
                                <div className="space-y-3">
                                  {chatSession.messages.map((msg, idx) => (
                                    <div
                                      key={idx}
                                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div
                                        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                                          msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                        }`}
                                      >
                                        {msg.content}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Tab 3: Historical Code Lineage */}
                    <TabsContent value="history" className="flex-1 overflow-hidden mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Problem</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tests</TableHead>
                                <TableHead>Code</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedStudent.submission_history.map((submission) => (
                                <TableRow key={submission.id}>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {new Date(submission.timestamp).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="font-medium">{submission.problem_title}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{submission.language}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={submission.status === 'pass' ? 'default' : 'destructive'}>
                                      {submission.status === 'pass' ? 'Passed' : 'Failed'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {submission.passed_tests}/{submission.total_tests}
                                  </TableCell>
                                  <TableCell>
                                    <Dialog>
                                      <Button variant="ghost" size="sm" asChild>
                                        <span className="cursor-pointer">View Code</span>
                                      </Button>
                                    </Dialog>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Failed to load student profile
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
