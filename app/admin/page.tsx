'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Home, 
  Loader2, 
  Search, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { getAdminProblems, getAdminProblemDetail, AdminProblem, AdminProblemDetail, updateProblem, deleteProblem, createProblem } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Problem {
  id: string
  title: string
  difficulty: string
  category: string
  acceptance_rate?: number
}

interface EditableHint {
  level: number
  title: string
  content: string
}

interface EditableTemplate {
  id?: string
  language: string
  template_code: string
  function_name: string
  input_params: Array<{ name: string; type: string }>
  return_type: string
}

interface EditableProblemDetail {
  problem: {
    id?: string
    title: string
    description: string
    difficulty: string
    category: string
    topic: string
    examples: string
    constraints: string
    time_complexity: string
    space_complexity: string
  }
  hints: EditableHint[]
  public_test_cases: string
  private_test_cases: string
  code_templates: EditableTemplate[]
}

const emptyProblemDetail: EditableProblemDetail = {
  problem: {
    title: '',
    description: '',
    difficulty: 'Easy',
    category: '',
    topic: '',
    examples: '',
    constraints: '',
    time_complexity: '',
    space_complexity: ''
  },
  hints: [],
  public_test_cases: '',
  private_test_cases: '',
  code_templates: []
}

export default function AdminPage() {
  const [learnProblems, setLearnProblems] = useState<Problem[]>([])
  const [competeProblems, setCompeteProblems] = useState<Problem[]>([])
  const [loadingLearn, setLoadingLearn] = useState(true)
  const [loadingCompete, setLoadingCompete] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Popup state
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [editableDetail, setEditableDetail] = useState<EditableProblemDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewProblem, setIsNewProblem] = useState(false)
  const [currentMode, setCurrentMode] = useState<'learn' | 'compete'>('learn')

  // Confirmation dialogs
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [problemToDelete, setProblemToDelete] = useState<Problem | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Collapsible sections
  const [learnExpanded, setLearnExpanded] = useState(true)
  const [competeExpanded, setCompeteExpanded] = useState(true)

  useEffect(() => {
    fetchAllProblems()
  }, [])

  const fetchAllProblems = async () => {
    setLoadingLearn(true)
    try {
      const learnResponse = await getAdminProblems('learn')
      if (learnResponse.success && learnResponse.problems) {
        setLearnProblems(learnResponse.problems)
      }
    } catch (error) {
      console.error('Failed to fetch learn problems:', error)
    } finally {
      setLoadingLearn(false)
    }

    setLoadingCompete(true)
    try {
      const competeResponse = await getAdminProblems('compete')
      if (competeResponse.success && competeResponse.problems) {
        setCompeteProblems(competeResponse.problems)
      }
    } catch (error) {
      console.error('Failed to fetch compete problems:', error)
    } finally {
      setLoadingCompete(false)
    }
  }

  const handleProblemClick = async (problem: Problem) => {
    setSelectedProblem(problem)
    setIsNewProblem(false)
    setIsDialogOpen(true)
    setLoadingDetail(true)
    setEditableDetail(null)

    try {
      const response = await getAdminProblemDetail(problem.id)
      if (response.success && response.data) {
        // Convert to editable format
        setEditableDetail({
          problem: {
            id: response.data.problem.id,
            title: response.data.problem.title || '',
            description: response.data.problem.description || '',
            difficulty: response.data.problem.difficulty || 'Easy',
            category: response.data.problem.category || '',
            topic: response.data.problem.topic || '',
            examples: response.data.problem.examples || '',
            constraints: response.data.problem.constraints || '',
            time_complexity: response.data.problem.time_complexity || '',
            space_complexity: response.data.problem.space_complexity || ''
          },
          hints: response.data.hints || [],
          public_test_cases: JSON.stringify(response.data.public_test_cases || [], null, 2),
          private_test_cases: JSON.stringify(response.data.private_test_cases || [], null, 2),
          code_templates: response.data.code_templates || []
        })
      }
    } catch (error) {
      console.error('Failed to fetch problem details:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleAddProblem = (mode: 'learn' | 'compete') => {
    setCurrentMode(mode)
    setSelectedProblem(null)
    setIsNewProblem(true)
    setEditableDetail({ ...emptyProblemDetail })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedProblem(null)
    setEditableDetail(null)
    setIsNewProblem(false)
  }

  const handleDeleteClick = (e: React.MouseEvent, problem: Problem) => {
    e.stopPropagation()
    setProblemToDelete(problem)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!problemToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await deleteProblem(problemToDelete.id)
      if (response.success) {
        // Refresh the problems list
        await fetchAllProblems()
      } else {
        alert('Failed to delete problem: ' + (response.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete problem')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setProblemToDelete(null)
    }
  }

  const handleUpdate = () => {
    setShowUpdateConfirm(true)
  }

  const confirmUpdate = async () => {
    if (!editableDetail) return

    setIsUpdating(true)
    try {
      if (isNewProblem) {
        const response = await createProblem({
          ...editableDetail.problem,
          // Include mode information
        } as AdminProblem)
        if (response.success) {
          await fetchAllProblems()
          closeDialog()
        } else {
          alert('Failed to create problem: ' + (response.error || 'Unknown error'))
        }
      } else {
        const response = await updateProblem(editableDetail.problem.id!, editableDetail.problem as AdminProblem)
        if (response.success) {
          await fetchAllProblems()
          closeDialog()
        } else {
          alert('Failed to update problem: ' + (response.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to save problem')
    } finally {
      setIsUpdating(false)
      setShowUpdateConfirm(false)
    }
  }

  const updateProblemField = (field: keyof EditableProblemDetail['problem'], value: string) => {
    if (!editableDetail) return
    setEditableDetail({
      ...editableDetail,
      problem: { ...editableDetail.problem, [field]: value }
    })
  }

  const updateHint = (index: number, field: keyof EditableHint, value: string | number) => {
    if (!editableDetail) return
    const newHints = [...editableDetail.hints]
    newHints[index] = { ...newHints[index], [field]: value }
    setEditableDetail({ ...editableDetail, hints: newHints })
  }

  const addHint = () => {
    if (!editableDetail) return
    const newLevel = editableDetail.hints.length + 1
    setEditableDetail({
      ...editableDetail,
      hints: [...editableDetail.hints, { level: newLevel, title: '', content: '' }]
    })
  }

  const removeHint = (index: number) => {
    if (!editableDetail) return
    const newHints = editableDetail.hints.filter((_, i) => i !== index)
    setEditableDetail({ ...editableDetail, hints: newHints })
  }

  const updateTemplate = (index: number, field: keyof EditableTemplate, value: string) => {
    if (!editableDetail) return
    const newTemplates = [...editableDetail.code_templates]
    newTemplates[index] = { ...newTemplates[index], [field]: value }
    setEditableDetail({ ...editableDetail, code_templates: newTemplates })
  }

  const addTemplate = () => {
    if (!editableDetail) return
    setEditableDetail({
      ...editableDetail,
      code_templates: [
        ...editableDetail.code_templates,
        { language: 'java', template_code: '', function_name: '', input_params: [], return_type: '' }
      ]
    })
  }

  const removeTemplate = (index: number) => {
    if (!editableDetail) return
    const newTemplates = editableDetail.code_templates.filter((_, i) => i !== index)
    setEditableDetail({ ...editableDetail, code_templates: newTemplates })
  }

  const filterProblems = (problems: Problem[]) => {
    return problems.filter((p) => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-500 bg-green-500/10'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'hard':
        return 'text-red-500 bg-red-500/10'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  const ProblemsList = ({ 
    problems, 
    loading, 
    title, 
    expanded, 
    onToggle,
    mode
  }: { 
    problems: Problem[]
    loading: boolean
    title: string
    expanded: boolean
    onToggle: () => void
    mode: 'learn' | 'compete'
  }) => (
    <div className="mb-6">
      <div 
        className="flex items-center gap-2 cursor-pointer p-3 bg-card border border-border rounded-t-lg hover:bg-accent/5 transition"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <Badge variant="secondary" className="ml-2">
          {problems.length} problems
        </Badge>
        <div className="ml-auto">
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1" 
            onClick={(e) => {
              e.stopPropagation()
              handleAddProblem(mode)
            }}
          >
            <Plus className="w-4 h-4" />
            Add Problem
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="bg-card border border-t-0 border-border rounded-b-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 font-semibold text-muted-foreground text-sm">
                <div className="col-span-6">Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1">Acceptance</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Table Body */}
              {filterProblems(problems).length > 0 ? (
                filterProblems(problems).map((problem) => (
                  <div 
                    key={problem.id} 
                    className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-accent/5 transition cursor-pointer items-center"
                    onClick={() => handleProblemClick(problem)}
                  >
                    <div className="col-span-6 font-medium text-foreground hover:text-accent">
                      {problem.title}
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="col-span-2 text-muted-foreground text-sm">{problem.category}</div>
                    <div className="col-span-1 text-muted-foreground text-sm">{problem.acceptance_rate || 0}%</div>
                    <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteClick(e, problem)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">No problems found</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )

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
            <Settings className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-accent">Admin Panel</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/learn" className="text-foreground hover:text-accent transition text-sm">
              Learn
            </Link>
            <Link href="/compete" className="text-foreground hover:text-accent transition text-sm">
              Compete
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Learn Problems Section */}
        <ProblemsList 
          problems={learnProblems}
          loading={loadingLearn}
          title="Learn Mode Problems"
          expanded={learnExpanded}
          onToggle={() => setLearnExpanded(!learnExpanded)}
          mode="learn"
        />

        {/* Compete Problems Section */}
        <ProblemsList 
          problems={competeProblems}
          loading={loadingCompete}
          title="Compete Mode Problems"
          expanded={competeExpanded}
          onToggle={() => setCompeteExpanded(!competeExpanded)}
          mode="compete"
        />
      </main>

      {/* Problem Detail/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-8 py-4 border-b border-border shrink-0">
            <DialogTitle className="text-xl font-bold">
              {isNewProblem ? `Add New Problem — ${currentMode === 'learn' ? 'Learn' : 'Compete'} Mode` : 'Edit Problem'}
            </DialogTitle>
            <DialogDescription>
              {isNewProblem ? 'Fill in the details to create a new problem.' : 'Modify the problem details below. Click Update Problem when done.'}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {loadingDetail ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : editableDetail ? (
              <div className="px-8 py-6 space-y-6">

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editableDetail.problem.title}
                    onChange={(e) => updateProblemField('title', e.target.value)}
                    placeholder="Problem title"
                    className="mt-1"
                  />
                </div>

                {/* Metadata fields */}
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={editableDetail.problem.difficulty}
                      onValueChange={(value) => updateProblemField('difficulty', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={editableDetail.problem.category}
                      onChange={(e) => updateProblemField('category', e.target.value)}
                      placeholder="e.g., Arrays"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={editableDetail.problem.topic}
                      onChange={(e) => updateProblemField('topic', e.target.value)}
                      placeholder="e.g., Binary Search"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time_complexity">Time Complexity</Label>
                    <Input
                      id="time_complexity"
                      value={editableDetail.problem.time_complexity}
                      onChange={(e) => updateProblemField('time_complexity', e.target.value)}
                      placeholder="e.g., O(n)"
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="space_complexity">Space Complexity</Label>
                    <Input
                      id="space_complexity"
                      value={editableDetail.problem.space_complexity}
                      onChange={(e) => updateProblemField('space_complexity', e.target.value)}
                      placeholder="e.g., O(1)"
                      className="mt-1 font-mono"
                    />
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editableDetail.problem.description}
                    onChange={(e) => updateProblemField('description', e.target.value)}
                    placeholder="Problem description..."
                    className="mt-1 min-h-[150px] font-mono text-sm resize-none"
                  />
                </div>

                {/* Examples */}
                <div>
                  <Label htmlFor="examples">Examples</Label>
                  <Textarea
                    id="examples"
                    value={editableDetail.problem.examples}
                    onChange={(e) => updateProblemField('examples', e.target.value)}
                    placeholder="Input: nums = [1,2,3]\nOutput: 6"
                    className="mt-1 min-h-[100px] font-mono text-sm resize-none"
                  />
                </div>

                {/* Constraints */}
                <div>
                  <Label htmlFor="constraints">Constraints</Label>
                  <Textarea
                    id="constraints"
                    value={editableDetail.problem.constraints}
                    onChange={(e) => updateProblemField('constraints', e.target.value)}
                    placeholder="1 <= nums.length <= 10^5"
                    className="mt-1 min-h-[80px] font-mono text-sm resize-none"
                  />
                </div>

                <Separator />

                {/* Hints */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">
                      Hints
                      <Badge variant="secondary" className="ml-2">{editableDetail.hints.length}</Badge>
                    </Label>
                    <Button size="sm" variant="outline" onClick={addHint}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Hint
                    </Button>
                  </div>
                  {editableDetail.hints.length > 0 ? (
                    <div className="space-y-3">
                      {editableDetail.hints.map((hint, index) => (
                        <div key={index} className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 grid grid-cols-4 gap-2">
                              <div>
                                <Label className="text-xs">Level</Label>
                                <Input
                                  type="number"
                                  value={hint.level}
                                  onChange={(e) => updateHint(index, 'level', parseInt(e.target.value) || 1)}
                                  className="mt-1"
                                  min={1}
                                />
                              </div>
                              <div className="col-span-3">
                                <Label className="text-xs">Title</Label>
                                <Input
                                  value={hint.title}
                                  onChange={(e) => updateHint(index, 'title', e.target.value)}
                                  placeholder="Hint title"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive h-8 w-8 p-0 mt-5 shrink-0"
                              onClick={() => removeHint(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <Label className="text-xs">Content</Label>
                            <Textarea
                              value={hint.content}
                              onChange={(e) => updateHint(index, 'content', e.target.value)}
                              placeholder="Hint content..."
                              className="mt-1 min-h-[60px] resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm text-center py-6 bg-muted/20 rounded-lg">
                      No hints added yet
                    </div>
                  )}
                </div>

                <Separator />

                {/* Test Cases */}
                <div>
                  <Label className="text-base font-semibold">Test Cases</Label>
                  <Tabs defaultValue="public" className="mt-3">
                    <TabsList>
                      <TabsTrigger value="public">Public</TabsTrigger>
                      <TabsTrigger value="private">Private</TabsTrigger>
                    </TabsList>
                    <TabsContent value="public">
                      <Textarea
                        value={editableDetail.public_test_cases}
                        onChange={(e) => setEditableDetail({ ...editableDetail, public_test_cases: e.target.value })}
                        placeholder="Raw JSON array of public test cases..."
                        className="min-h-[180px] font-mono text-xs resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Raw JSON — public (visible) test cases</p>
                    </TabsContent>
                    <TabsContent value="private">
                      <Textarea
                        value={editableDetail.private_test_cases}
                        onChange={(e) => setEditableDetail({ ...editableDetail, private_test_cases: e.target.value })}
                        placeholder="Raw JSON array of private test cases..."
                        className="min-h-[180px] font-mono text-xs resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Raw JSON — private (hidden) test cases</p>
                    </TabsContent>
                  </Tabs>
                </div>

                <Separator />

                {/* Code Templates */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">
                      Code Templates
                      <Badge variant="secondary" className="ml-2">{editableDetail.code_templates.length}</Badge>
                    </Label>
                    <Button size="sm" variant="outline" onClick={addTemplate}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Template
                    </Button>
                  </div>
                  {editableDetail.code_templates.length > 0 ? (
                    <Tabs defaultValue={editableDetail.code_templates[0]?.language || 'java'}>
                      <TabsList className="mb-3">
                        {editableDetail.code_templates.map((template, index) => (
                          <TabsTrigger key={index} value={`${template.language}-${index}`}>
                            {template.language.toUpperCase()}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {editableDetail.code_templates.map((template, index) => (
                        <TabsContent key={index} value={`${template.language}-${index}`}>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <div className="flex items-end gap-3">
                              <div className="flex-1 grid grid-cols-4 gap-3">
                                <div>
                                  <Label className="text-xs">Language</Label>
                                  <Select
                                    value={template.language}
                                    onValueChange={(value) => updateTemplate(index, 'language', value)}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="java">Java</SelectItem>
                                      <SelectItem value="python">Python</SelectItem>
                                      <SelectItem value="cpp">C++</SelectItem>
                                      <SelectItem value="javascript">JavaScript</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">Function Name</Label>
                                  <Input
                                    value={template.function_name}
                                    onChange={(e) => updateTemplate(index, 'function_name', e.target.value)}
                                    placeholder="e.g., twoSum"
                                    className="mt-1 font-mono"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Return Type</Label>
                                  <Input
                                    value={template.return_type}
                                    onChange={(e) => updateTemplate(index, 'return_type', e.target.value)}
                                    placeholder="e.g., int[]"
                                    className="mt-1 font-mono"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive h-9 w-9 p-0 mb-0.5"
                                    onClick={() => removeTemplate(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Template Code</Label>
                              <Textarea
                                value={template.template_code}
                                onChange={(e) => updateTemplate(index, 'template_code', e.target.value)}
                                placeholder={"public int[] twoSum(int[] nums, int target) {\n    // Your code here\n}"}
                                className="mt-1 min-h-[160px] font-mono text-sm resize-none"
                              />
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="text-muted-foreground text-sm text-center py-6 bg-muted/20 rounded-lg">
                      No code templates added yet
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                Failed to load problem details
              </div>
            )}
          </div>

          <DialogFooter className="px-8 py-4 border-t border-border bg-muted/30 shrink-0">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editableDetail || isUpdating}
              className="min-w-[140px]"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isNewProblem ? 'Create Problem' : 'Update Problem'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Confirmation Dialog */}
      <AlertDialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm {isNewProblem ? 'Creation' : 'Update'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isNewProblem 
                ? 'Are you sure you want to create this new problem? This will add it to the database.'
                : 'Are you sure you want to update this problem? This will modify the existing data in the database.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdate} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Problem
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{problemToDelete?.title}&quot;? This action cannot be undone and will permanently remove the problem along with all its test cases, hints, and code templates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
