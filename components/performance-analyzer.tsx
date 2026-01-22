import React from 'react';
import { Gauge, Zap, Database, Loader2 } from 'lucide-react';

interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  explanation?: string;
  loading?: boolean;
}

interface PerformanceAnalyzerProps {
  analysis?: ComplexityAnalysis;
  loading?: boolean;
}

export const PerformanceAnalyzer: React.FC<PerformanceAnalyzerProps> = ({ 
  analysis = {
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    explanation: 'Single pass through the array using a Hash Map lookup.',
    loading: false
  },
  loading = false
}) => {
  return (
    <div className="flex flex-col h-full bg-card p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
           <Gauge size={14} /> Complexity Analysis
        </h3>
        
        {loading || analysis?.loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="ml-2 text-sm text-muted-foreground">Analyzing code...</span>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500" /> Time Complexity
                   </span>
                   <span className="text-lg font-mono font-bold text-green-500">{analysis?.timeComplexity || 'O(n)'}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                   {analysis?.explanation || 'Running analysis...'}
                </p>
                
                {/* Visual Bar */}
                <div className="mt-3 h-2 bg-background rounded-full overflow-hidden flex">
                   <div className="w-[10%] bg-green-500 h-full" title="O(1)" />
                   <div className="w-[20%] bg-green-400 h-full" title="O(log n)" />
                   <div className="w-[30%] bg-yellow-500 h-full border-r-2 border-white/20" title="O(n) - Current" />
                   <div className="w-[40%] bg-red-500/20 h-full" title="O(n^2)" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                   <span>O(1)</span>
                   <span>O(n²)</span>
                </div>
             </div>

             <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Database size={14} className="text-accent" /> Space Complexity
                   </span>
                   <span className="text-lg font-mono font-bold text-yellow-500">{analysis?.spaceComplexity || 'O(n)'}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                   Auxiliary space required for the algorithm.
                </p>
                 {/* Visual Bar */}
                 <div className="mt-3 h-2 bg-background rounded-full overflow-hidden flex">
                   <div className="w-[10%] bg-green-500 h-full" title="O(1)" />
                   <div className="w-[20%] bg-green-400 h-full" title="O(log n)" />
                   <div className="w-[30%] bg-yellow-500 h-full border-r-2 border-white/20" title="O(n) - Current" />
                   <div className="w-[40%] bg-red-500/20 h-full" title="O(n^2)" />
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
