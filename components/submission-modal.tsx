'use client'

import { CheckCircle2, XCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubmissionModalProps {
  result: {
    total: number
    passed: number
    accepted: boolean
  }
  onClose: () => void
}

export function SubmissionModal({ result, onClose }: SubmissionModalProps) {
  const failed = result.total - result.passed

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border-2 border-border rounded-lg shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Submission Results</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex justify-center">
            {result.accepted ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-500">Accepted!</h3>
                  <p className="text-sm text-muted-foreground">All tests passed</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <XCircle className="w-16 h-16 text-red-500" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-500">Failed</h3>
                  <p className="text-sm text-muted-foreground">Some tests did not pass</p>
                </div>
              </div>
            )}
          </div>

          {/* Test Statistics */}
          <div className="bg-background/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Tests:</span>
              <span className="text-sm font-semibold text-foreground">{result.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Passed:</span>
              <span className="text-sm font-semibold text-green-400">{result.passed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Failed:</span>
              <span className="text-sm font-semibold text-red-400">{failed}</span>
            </div>
          </div>

          {/* Pass Rate */}
          <div className="bg-background/50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {Math.round((result.passed / result.total) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Pass Rate</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button
            onClick={onClose}
            className="w-full bg-accent hover:bg-accent/90"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
