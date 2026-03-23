'use client'

import React, { useState } from 'react'
import { InputField, validateInput, formatInputValue } from '@/lib/inputParser'
import { CustomTestCase, InputParam } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X } from 'lucide-react'

interface StructuredTestInputProps {
  inputFields: InputField[]
  onAddTest: (test: CustomTestCase) => void
  onClose: () => void
}

export function StructuredTestInput({ inputFields, onAddTest, onClose }: StructuredTestInputProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [expectedOutput, setExpectedOutput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }))
    // Clear error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [fieldName]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    inputFields.forEach((field) => {
      const validation = validateInput(formValues[field.name] || '', field.type)
      if (!validation.valid) {
        newErrors[field.name] = validation.error || 'Invalid input'
      }
    })

    if (!expectedOutput.trim()) {
      newErrors['expectedOutput'] = 'Expected output is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTest = () => {
    if (!validateForm()) return

    const inputParams: InputParam[] = inputFields.map((field) => ({
      name: field.name,
      type: field.type,
      value: formatInputValue(formValues[field.name], field.type),
    }))

    onAddTest({
      input_params: inputParams
    })

    // Reset form
    setFormValues({})
    setExpectedOutput('')
    setErrors({})
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">Add Custom Test Case</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Input Fields */}
          {inputFields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name} className="text-sm font-medium mb-1 block">
                {field.label}
                <span className="text-xs text-muted-foreground ml-2">({field.type})</span>
              </Label>
              <Input
                id={field.name}
                type="text"
                placeholder={field.placeholder}
                value={formValues[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className={errors[field.name] ? 'border-red-500' : ''}
              />
              {errors[field.name] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            </div>
          ))}

          {/* Expected Output */}
          <div>
            <Label htmlFor="expectedOutput" className="text-sm font-medium mb-1 block">
              Expected Output
            </Label>
            <Input
              id="expectedOutput"
              type="text"
              placeholder="Enter expected output"
              value={expectedOutput}
              onChange={(e) => {
                setExpectedOutput(e.target.value)
                setErrors((prev) => ({ ...prev, expectedOutput: '' }))
              }}
              className={errors['expectedOutput'] ? 'border-red-500' : ''}
            />
            {errors['expectedOutput'] && (
              <p className="text-xs text-red-500 mt-1">{errors['expectedOutput']}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              The expected output from your solution
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button onClick={handleAddTest} className="flex-1">
              Add Test Case
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}