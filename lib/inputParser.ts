export type InputType = 'string' | 'integer' | 'array' | 'array_of_arrays' | 'boolean'

export interface InputField {
  name: string
  type: InputType
  label: string
  placeholder: string
  helpText: string
}

/**
 * Get default input fields for common problem types
 * These match the template input_params structure
 */
export function getDefaultInputFields(language: string, templateInputParams: any[]): InputField[] {
  return templateInputParams.map((param) => ({
    name: param.name,
    type: param.type as InputType,
    label: param.name,
    placeholder: getPlaceholder(param.type),
    helpText: getHelpText(param.type),
  }))
}

function getPlaceholder(type: InputType): string {
  switch (type) {
    case 'string':
      return 'Enter a string (e.g., "hello")'
    case 'integer':
      return 'Enter an integer (e.g., 42)'
    case 'array':
      return 'Comma-separated values (e.g., 1,2,3)'
    case 'array_of_arrays':
      return 'Semicolon-separated arrays (e.g., 1,2;3,4)'
    case 'boolean':
      return 'true or false'
    default:
      return ''
  }
}

function getHelpText(type: InputType): string {
  switch (type) {
    case 'string':
      return 'Type a string value. No quotes needed.'
    case 'integer':
      return 'Type an integer number.'
    case 'array':
      return 'Enter numbers separated by commas. Example: 1, 2, 3'
    case 'array_of_arrays':
      return 'Enter rows separated by semicolons, elements by commas. Example: 1,2,3; 4,5,6'
    case 'boolean':
      return 'Enter "true" or "false"'
    default:
      return ''
  }
}

/**
 * Validate user input based on type
 */
export function validateInput(value: string, type: InputType): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'This field is required' }
  }

  switch (type) {
    case 'integer':
      if (!/^-?\d+$/.test(value.trim())) {
        return { valid: false, error: 'Must be a valid integer' }
      }
      break

    case 'array':
      if (!/^[\d\s,\-]+$/.test(value.trim())) {
        return { valid: false, error: 'Invalid array format. Use comma-separated numbers.' }
      }
      break

    case 'array_of_arrays':
      if (!/^[\d\s,\-;]+$/.test(value.trim())) {
        return { valid: false, error: 'Invalid format. Use commas for elements, semicolons for rows.' }
      }
      break

    case 'boolean':
      if (!['true', 'false', 'True', 'False', 'TRUE', 'FALSE'].includes(value.trim())) {
        return { valid: false, error: 'Must be "true" or "false"' }
      }
      break

    case 'string':
      // String accepts anything
      break
  }

  return { valid: true }
}

/**
 * Format raw user input into the correct type structure
 */
export function formatInputValue(rawValue: string, type: InputType): any {
  const value = rawValue.trim()

  switch (type) {
    case 'string':
      return value
    case 'integer':
      return parseInt(value, 10)
    case 'array':
      return value.split(',').map((v) => v.trim())
    case 'array_of_arrays':
      return value.split(';').map((row) => row.split(',').map((v) => v.trim()))
    case 'boolean':
      return value.toLowerCase() === 'true'
    default:
      return value
  }
}

/**
 * Format output value to string for display
 */
export function formatOutputValue(value: any): string {
  if (value === null || value === undefined) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}