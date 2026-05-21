'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminProtectedRoute } from '@/components/admin-protected-route'
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
  AlertTriangle,
  Save,
  Sun,
  Moon
} from 'lucide-react'
import { 
  getAdminProblems, 
  getAdminProblemDetail, 
  AdminProblem, 
  AdminProblemDetail,
  AdminCodeTemplate,
  adminCreateProblem,
  adminUpdateProblem,
  adminUpdateHints,
  adminUpdateTestCases,
  adminUpdateTemplate,
  adminDeleteProblem
} from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

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
  driver_code: string
  solution_code: string
  function_name: string
  input_params: Array<{ name: string; type: string }> | string
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
    mode?: string
  }
  hints: EditableHint[]
  public_test_cases: string
  private_test_cases: string
  code_templates: EditableTemplate[]
}

const getEmptyProblemDetail = (mode: 'learn' | 'compete'): EditableProblemDetail => ({
  problem: {
    title: '',
    description: '',
    difficulty: 'Easy',
    category: '',
    topic: '',
    examples: '',
    constraints: '',
    time_complexity: '',
    space_complexity: '',
    mode
  },
  hints: [],
  public_test_cases: '[]',
  private_test_cases: '[]',
  code_templates: []
})

export default function AdminPage() {
  const [learnProblems, setLearnProblems] = useState<Problem[]>([])
  const [competeProblems, setCompeteProblems] = useState<Problem[]>([])
  const [loadingLearn, setLoadingLearn] = useState(true)
  const [loadingCompete, setLoadingCompete] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Theme state
  const [isDark, setIsDark] = useState(true)
  
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
  
  // Track which section is being updated
  type UpdateType = 'create' | 'problem' | 'hints' | 'testcases' | 'template'
  const [updateType, setUpdateType] = useState<UpdateType>('problem')
  const [templateToUpdate, setTemplateToUpdate] = useState<string>('') // language of template being updated
  const [updatingSection, setUpdatingSection] = useState<string | null>(null) // track which button is loading

  // Collapsible sections
  const [learnExpanded, setLearnExpanded] = useState(true)
  const [competeExpanded, setCompeteExpanded] = useState(true)

  // Initialize theme from document
  useEffect(() => {
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
        // Convert to editable format, ensuring driver_code and solution_code exist
        const templatesWithAllFields = (response.data.code_templates || []).map(t => ({
          ...t,
          driver_code: t.driver_code || '',
          solution_code: t.solution_code || '',
          input_params: typeof t.input_params === 'string' ? t.input_params : JSON.stringify(t.input_params || [])
        }))
        
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
            space_complexity: response.data.problem.space_complexity || '',
            mode: response.data.problem.mode || 'learn'
          },
          hints: response.data.hints || [],
          public_test_cases: JSON.stringify(response.data.public_test_cases || [], null, 2),
          private_test_cases: JSON.stringify(response.data.private_test_cases || [], null, 2),
          code_templates: templatesWithAllFields
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
    setEditableDetail(getEmptyProblemDetail(mode))
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
      const response = await adminDeleteProblem(problemToDelete.id)
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

  const handleUpdate = (type: UpdateType, templateLang?: string) => {
    setUpdateType(type)
    if (templateLang) setTemplateToUpdate(templateLang)
    setShowUpdateConfirm(true)
  }

  const confirmUpdate = async () => {
    if (!editableDetail) return

    setIsUpdating(true)
    setUpdatingSection(updateType === 'template' ? `template-${templateToUpdate}` : updateType)
    
    try {
      if (updateType === 'create' || isNewProblem) {
        // Create new problem with all data
        const response = await adminCreateProblem({
          problem: {
            ...editableDetail.problem,
            mode: currentMode
          } as AdminProblem & { mode: string },
          hints: editableDetail.hints,
          public_test_cases: JSON.parse(editableDetail.public_test_cases || '[]'),
          private_test_cases: JSON.parse(editableDetail.private_test_cases || '[]'),
          code_templates: editableDetail.code_templates.map(t => ({
            ...t,
            input_params: typeof t.input_params === 'string' ? t.input_params : JSON.stringify(t.input_params)
          }))
        })
        if (response.success) {
          await fetchAllProblems()
          closeDialog()
        } else {
          alert('Failed to create problem: ' + (response.error || 'Unknown error'))
        }
      } else if (updateType === 'problem') {
        // Update problem metadata only
        const response = await adminUpdateProblem(editableDetail.problem.id!, editableDetail.problem)
        if (response.success) {
          alert('Problem metadata updated successfully!')
        } else {
          alert('Failed to update problem: ' + (response.error || 'Unknown error'))
        }
      } else if (updateType === 'hints') {
        // Update hints only
        const response = await adminUpdateHints(editableDetail.problem.id!, editableDetail.hints)
        if (response.success) {
          alert('Hints updated successfully!')
        } else {
          alert('Failed to update hints: ' + (response.error || 'Unknown error'))
        }
      } else if (updateType === 'testcases') {
        // Update test cases only
        const response = await adminUpdateTestCases(
          editableDetail.problem.id!,
          JSON.parse(editableDetail.public_test_cases || '[]'),
          JSON.parse(editableDetail.private_test_cases || '[]')
        )
        if (response.success) {
          alert('Test cases updated successfully!')
        } else {
          alert('Failed to update test cases: ' + (response.error || 'Unknown error'))
        }
      } else if (updateType === 'template' && templateToUpdate) {
        // Update specific template
        const template = editableDetail.code_templates.find(t => t.language === templateToUpdate)
        if (template) {
          const response = await adminUpdateTemplate(editableDetail.problem.id!, templateToUpdate, {
            template_code: template.template_code,
            driver_code: template.driver_code,
            solution_code: template.solution_code,
            function_name: template.function_name,
            input_params: template.input_params,
            return_type: template.return_type
          })
          if (response.success) {
            alert(`${templateToUpdate.toUpperCase()} template updated successfully!`)
          } else {
            alert('Failed to update template: ' + (response.error || 'Unknown error'))
          }
        }
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to save: ' + String(error))
    } finally {
      setIsUpdating(false)
      setShowUpdateConfirm(false)
      setUpdatingSection(null)
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
    // For input_params, store as string for editing, will be parsed when sending to backend
    newTemplates[index] = { ...newTemplates[index], [field]: value }
    setEditableDetail({ ...editableDetail, code_templates: newTemplates })
  }

  const addTemplate = () => {
    if (!editableDetail) return
    setEditableDetail({
      ...editableDetail,
      code_templates: [
        ...editableDetail.code_templates,
        { language: 'java', template_code: '', driver_code: '', solution_code: '', function_name: '', input_params: '[]', return_type: '' }
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
    <AdminProtectedRoute>
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
            <Link href="/admin/users" className="text-foreground hover:text-accent transition text-sm">
              User Analytics
            </Link>
            <Link href="/learn" className="text-foreground hover:text-accent transition text-sm">
              Learn
            </Link>
            <Link href="/compete" className="text-foreground hover:text-accent transition text-sm">
              Compete
            </Link>
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-md border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
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

      {/* Problem Detail/Edit Dialog - 4 Column Layout */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[99vw] w-[99vw] h-[92vh] p-0 overflow-hidden flex flex-col" showCloseButton={false}>
          {/* Accessibility: Hidden DialogTitle */}
          <DialogTitle className="sr-only">
            {isNewProblem ? `New Problem — ${currentMode === 'learn' ? 'Learn' : 'Compete'} Mode` : `Edit Problem — ${editableDetail?.problem.title || 'Untitled'}`}
          </DialogTitle>
          
          {/* Compact Header with Title and ID */}
          <div className="px-6 py-3 border-b border-border bg-muted/30 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isNewProblem ? (
                <span className="text-lg font-semibold text-foreground">
                  New Problem — {currentMode === 'learn' ? 'Learn' : 'Compete'} Mode
                </span>
              ) : (
                <>
                  <Input
                    value={editableDetail?.problem.title || ''}
                    onChange={(e) => updateProblemField('title', e.target.value)}
                    placeholder="Problem title"
                    className="text-base font-semibold w-[500px] h-9"
                  />
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {editableDetail?.problem.id?.slice(0, 8)}...
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isNewProblem ? (
                <>
                  <Button variant="outline" size="sm" onClick={closeDialog}>Cancel</Button>
                  <Button size="sm" onClick={() => handleUpdate('create')} disabled={!editableDetail || isUpdating}>
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Problem'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={closeDialog}>Close</Button>
              )}
            </div>
          </div>

          {/* 4-Column Body */}
          {loadingDetail ? (
            <div className="flex-1 flex justify-center items-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : editableDetail ? (
            <div className="flex-1 grid grid-cols-4 divide-x divide-border overflow-hidden">
              
              {/* Column 1: Problem Metadata */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-5 py-3 bg-muted/50 border-b border-border shrink-0">
                  <h3 className="text-base font-semibold text-foreground">Problem Metadata</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {isNewProblem && (
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <Input value={editableDetail.problem.title} onChange={(e) => updateProblemField('title', e.target.value)} placeholder="Problem title" className="mt-2 h-9 text-sm" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Difficulty</Label>
                      <Select value={editableDetail.problem.difficulty} onValueChange={(value) => updateProblemField('difficulty', value)}>
                        <SelectTrigger className="mt-2 h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <Input value={editableDetail.problem.category} onChange={(e) => updateProblemField('category', e.target.value)} placeholder="Arrays" className="mt-2 h-9 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Topic</Label>
                      <Input value={editableDetail.problem.topic} onChange={(e) => updateProblemField('topic', e.target.value)} placeholder="Binary Search" className="mt-2 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Time</Label>
                      <Input value={editableDetail.problem.time_complexity} onChange={(e) => updateProblemField('time_complexity', e.target.value)} placeholder="O(n)" className="mt-2 h-9 text-sm font-mono" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Space Complexity</Label>
                    <Input value={editableDetail.problem.space_complexity} onChange={(e) => updateProblemField('space_complexity', e.target.value)} placeholder="O(1)" className="mt-2 h-9 text-sm font-mono" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea value={editableDetail.problem.description} onChange={(e) => updateProblemField('description', e.target.value)} placeholder="Problem description..." className="mt-2 min-h-[120px] text-sm font-mono resize-none" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Examples</Label>
                    <Textarea value={editableDetail.problem.examples} onChange={(e) => updateProblemField('examples', e.target.value)} placeholder="Input: nums = [1,2,3]..." className="mt-2 min-h-[100px] text-sm font-mono resize-none" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Constraints</Label>
                    <Textarea value={editableDetail.problem.constraints} onChange={(e) => updateProblemField('constraints', e.target.value)} placeholder="1 <= n <= 10^5" className="mt-2 min-h-[80px] text-sm font-mono resize-none" />
                  </div>
                </div>
                {!isNewProblem && (
                  <div className="p-5 border-t border-border shrink-0">
                    <Button onClick={() => handleUpdate('problem')} disabled={updatingSection === 'problem'} variant="secondary" size="sm" className="w-full h-9 text-sm">
                      {updatingSection === 'problem' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Update Metadata
                    </Button>
                  </div>
                )}
              </div>

              {/* Column 2: Hints */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-5 py-3 bg-muted/50 border-b border-border shrink-0 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">Hints <Badge variant="secondary" className="ml-2 text-xs">{editableDetail.hints.length}</Badge></h3>
                  <Button size="sm" variant="ghost" onClick={addHint} className="h-7 px-3 text-xs"><Plus className="w-4 h-4 mr-1" />Add</Button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {editableDetail.hints.length > 0 ? editableDetail.hints.map((hint, index) => (
                    <div key={index} className="bg-muted/30 rounded p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input type="number" value={hint.level} onChange={(e) => updateHint(index, 'level', parseInt(e.target.value) || 1)} className="w-14 h-8 text-sm" min={1} />
                        <Input value={hint.title} onChange={(e) => updateHint(index, 'title', e.target.value)} placeholder="Title" className="flex-1 h-8 text-sm" />
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => removeHint(index)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <Textarea value={hint.content} onChange={(e) => updateHint(index, 'content', e.target.value)} placeholder="Hint content..." className="min-h-[70px] text-sm resize-none" />
                    </div>
                  )) : (
                    <div className="text-muted-foreground text-sm text-center py-10 bg-muted/20 rounded">No hints yet</div>
                  )}
                </div>
                {!isNewProblem && (
                  <div className="p-5 border-t border-border shrink-0">
                    <Button onClick={() => handleUpdate('hints')} disabled={updatingSection === 'hints'} variant="secondary" size="sm" className="w-full h-9 text-sm">
                      {updatingSection === 'hints' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Update Hints
                    </Button>
                  </div>
                )}
              </div>

              {/* Column 3: Test Cases */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-5 py-3 bg-muted/50 border-b border-border shrink-0">
                  <h3 className="text-base font-semibold text-foreground">Test Cases</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Public Test Cases</Label>
                    <Textarea value={editableDetail.public_test_cases} onChange={(e) => setEditableDetail({ ...editableDetail, public_test_cases: e.target.value })} placeholder="Raw JSON array..." className="mt-2 min-h-[200px] text-sm font-mono resize-none" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Private Test Cases</Label>
                    <Textarea value={editableDetail.private_test_cases} onChange={(e) => setEditableDetail({ ...editableDetail, private_test_cases: e.target.value })} placeholder="Raw JSON array..." className="mt-2 min-h-[200px] text-sm font-mono resize-none" />
                  </div>
                </div>
                {!isNewProblem && (
                  <div className="p-5 border-t border-border shrink-0">
                    <Button onClick={() => handleUpdate('testcases')} disabled={updatingSection === 'testcases'} variant="secondary" size="sm" className="w-full h-9 text-sm">
                      {updatingSection === 'testcases' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Update Test Cases
                    </Button>
                  </div>
                )}
              </div>

              {/* Column 4: Code Templates */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-5 py-3 bg-muted/50 border-b border-border shrink-0 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">Templates <Badge variant="secondary" className="ml-2 text-xs">{editableDetail.code_templates.length}</Badge></h3>
                  <Button size="sm" variant="ghost" onClick={addTemplate} className="h-7 px-3 text-xs"><Plus className="w-4 h-4 mr-1" />Add</Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {editableDetail.code_templates.length > 0 ? (
                    <Tabs defaultValue={`${editableDetail.code_templates[0]?.language}-0`} className="h-full flex flex-col">
                      <TabsList className="mx-5 mt-3 shrink-0">
                        {editableDetail.code_templates.map((t, i) => (
                          <TabsTrigger key={i} value={`${t.language}-${i}`} className="text-xs">{t.language.toUpperCase()}</TabsTrigger>
                        ))}
                      </TabsList>
                      {editableDetail.code_templates.map((template, index) => (
                        <TabsContent key={index} value={`${template.language}-${index}`} className="flex-1 overflow-y-auto p-5 space-y-3 mt-0">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <Label className="text-sm font-medium">Language</Label>
                              <Select value={template.language} onValueChange={(v) => updateTemplate(index, 'language', v)}>
                                <SelectTrigger className="mt-2 h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="java">Java</SelectItem>
                                  <SelectItem value="python">Python</SelectItem>
                                  <SelectItem value="cpp">C++</SelectItem>
                                  <SelectItem value="javascript">JavaScript</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium">Function</Label>
                              <Input value={template.function_name} onChange={(e) => updateTemplate(index, 'function_name', e.target.value)} className="mt-2 h-8 text-sm font-mono" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium">Return</Label>
                              <Input value={template.return_type} onChange={(e) => updateTemplate(index, 'return_type', e.target.value)} className="mt-2 h-8 text-sm font-mono" />
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 mt-6 text-destructive" onClick={() => removeTemplate(index)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Input Params (JSON)</Label>
                            <Input value={typeof template.input_params === 'string' ? template.input_params : JSON.stringify(template.input_params)} onChange={(e) => updateTemplate(index, 'input_params', e.target.value)} className="mt-2 h-8 text-sm font-mono" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Template Code</Label>
                            <Textarea value={template.template_code} onChange={(e) => updateTemplate(index, 'template_code', e.target.value)} className="mt-2 min-h-[80px] text-xs font-mono resize-none" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Driver Code</Label>
                            <Textarea value={template.driver_code} onChange={(e) => updateTemplate(index, 'driver_code', e.target.value)} className="mt-2 min-h-[80px] text-xs font-mono resize-none" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Solution Code</Label>
                            <Textarea value={template.solution_code} onChange={(e) => updateTemplate(index, 'solution_code', e.target.value)} className="mt-2 min-h-[80px] text-xs font-mono resize-none" />
                          </div>
                          {!isNewProblem && (
                            <Button onClick={() => handleUpdate('template', template.language)} disabled={updatingSection === `template-${template.language}`} variant="secondary" size="sm" className="w-full h-8 text-xs mt-2">
                              {updatingSection === `template-${template.language}` ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                              Update {template.language.toUpperCase()}
                            </Button>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="text-muted-foreground text-sm text-center py-10 px-5 bg-muted/20 m-5 rounded">No templates yet</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center text-muted-foreground">Failed to load problem details</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Confirmation Dialog */}
      <AlertDialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm {updateType === 'create' || isNewProblem ? 'Creation' : 'Update'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {updateType === 'create' || isNewProblem 
                ? 'Are you sure you want to create this new problem? This will add the problem along with all hints, test cases, and code templates to the database.'
                : updateType === 'problem'
                ? 'Are you sure you want to update the problem metadata? This will modify the title, description, difficulty, category, topic, examples, constraints, and complexity fields.'
                : updateType === 'hints'
                ? 'Are you sure you want to update the hints? This will replace all existing hints with the current hints.'
                : updateType === 'testcases'
                ? 'Are you sure you want to update the test cases? This will modify both public and private test cases.'
                : updateType === 'template'
                ? `Are you sure you want to update the ${templateToUpdate.toUpperCase()} template? This will modify the template code, driver code, solution code, and related fields for this language.`
                : 'Are you sure you want to save these changes?'
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
    </AdminProtectedRoute>
  )
}
