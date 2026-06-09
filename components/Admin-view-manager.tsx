import React, { useState, useMemo, useEffect } from 'react';
import { createOrUpdateView } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react'; 

export function AdminViewManager({ 
    allProblems, 
    existingViewName, 
    existingProblems, 
    onClose, 
    refreshViews 
}: {
    allProblems: any[],
    existingViewName: string | null,
    existingProblems: any[],
    onClose: () => void,
    refreshViews: () => Promise<void>
}) {
    // Strip the 'compete_' prefix for the display input
    const initialName = existingViewName ? existingViewName.replace('compete_', '') : '';
    const [viewName, setViewName] = useState<string>(initialName);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [difficulty, setDifficulty] = useState<string>('');

    // Pre-fill selected problems if editing an existing view
    useEffect(() => {
        if (existingProblems && existingProblems.length > 0) {
            const ids = existingProblems.map(p => p.id);
            setSelectedIds(new Set(ids));
        } else {
            setSelectedIds(new Set());
        }
    }, [existingProblems]);

    const filteredProblems = useMemo(() => {
        return allProblems.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDiff = !difficulty || p.difficulty === difficulty;
            return matchesSearch && matchesDiff;
        });
    }, [allProblems, searchQuery, difficulty]);

    const toggleProblem = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSaveView = async () => {
        if (!viewName.trim() || selectedIds.size === 0) {
            alert("Please provide a name and select at least one problem.");
            return;
        }
        await createOrUpdateView(viewName.trim(), Array.from(selectedIds));
        await refreshViews();
        onClose();
    };

    return (
        <div className="space-y-6">
            {/* Top Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                    type="text" 
                    placeholder="Contest Name (e.g., batch_2026)" 
                    value={viewName} 
                    onChange={e => setViewName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-accent"
                    disabled={!!existingViewName} // Lock name if editing to prevent renaming bugs, or remove if you want rename support
                />
                <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search to add..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border"
                    />
                </div>
            </div>

            <div className="text-sm text-muted-foreground flex justify-between items-center">
                <span>Selected: <strong className="text-foreground">{selectedIds.size}</strong> problems</span>
                <Button onClick={handleSaveView}>
                    {existingViewName ? 'Update View' : 'Create View'}
                </Button>
            </div>

            {/* Problem Selection List */}
            <div className="border border-border rounded-lg overflow-hidden flex flex-col h-[400px]">
                <div className="overflow-y-auto p-2 space-y-1 bg-muted/10">
                    {filteredProblems.map(problem => {
                        const isSelected = selectedIds.has(problem.id);
                        return (
                            <div 
                                key={problem.id} 
                                onClick={() => toggleProblem(problem.id)}
                                className={`flex items-center gap-4 p-3 rounded-md cursor-pointer transition border ${
                                    isSelected 
                                        ? 'bg-accent/10 border-accent text-accent-foreground' 
                                        : 'bg-card border-transparent hover:border-border'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={isSelected} 
                                    onChange={() => {}} // Handled by parent div click
                                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                                />
                                <div className="flex-1 font-medium">{problem.title}</div>
                                <div className={`text-xs px-2 py-1 rounded uppercase tracking-wider font-semibold ${
                                    problem.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                                    problem.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-red-500/10 text-red-500'
                                }`}>
                                    {problem.difficulty}
                                </div>
                            </div>
                        )
                    })}
                    {filteredProblems.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">No problems match your filters.</div>
                    )}
                </div>
            </div>
        </div>
    );
}