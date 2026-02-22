'use client'

interface Example {
  input: string
  output: string
  explanation?: string
}

interface ExamplesDisplayProps {
  examples: string | Example[]
}

export function ExamplesDisplay({ examples }: ExamplesDisplayProps) {
  let parsedExamples: Example[] = []

  try {
    // Parse if string, otherwise use directly
    if (typeof examples === 'string') {
      parsedExamples = JSON.parse(examples)
    } else {
      parsedExamples = examples
    }
  } catch (error) {
    console.error('[v0] Failed to parse examples:', error)
    return (
      <pre className="bg-background/50 p-3 rounded text-xs text-muted-foreground overflow-x-auto border border-border">
        {typeof examples === 'string' ? examples : JSON.stringify(examples, null, 2)}
      </pre>
    )
  }

  if (!Array.isArray(parsedExamples) || parsedExamples.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {parsedExamples.map((example, index) => (
        <div key={index} className="bg-background/50 border border-border rounded overflow-hidden">
          {/* Example Header */}
          <div className="bg-background/70 px-4 py-2 border-b border-border">
            <h4 className="text-sm font-semibold text-accent">Example {index + 1}:</h4>
          </div>

          {/* Example Content */}
          <div className="p-4 space-y-3 font-mono text-sm">
            {/* Input */}
            <div>
              <span className="text-accent font-semibold">Input:</span>{' '}
              <span className="text-muted-foreground">{example.input}</span>
            </div>

            {/* Output */}
            <div>
              <span className="text-accent font-semibold">Output:</span>{' '}
              <span className="text-muted-foreground">{example.output}</span>
            </div>

            {/* Explanation (if exists) */}
            {example.explanation && (
              <div>
                <div className="text-accent font-semibold mb-1">Explanation:</div>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed ml-0">
                  {example.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
