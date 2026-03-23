export type InputType = 'string' | 'integer' | 'float' | 'boolean' | 'array' | '2d_array' | 'linked_list'

export interface InputField {
  name: string
  type: InputType
  label: string
  placeholder: string
  helpText: string
}

/**
 * Get default input fields for common problem types
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
      return 'e.g., "hello"'
    case 'integer':
      return 'e.g., 42'
    case 'float':
      return 'e.g., 3.14'
    case 'array':
    case 'linked_list':
      return 'e.g., [1, 2, 3]'
    case '2d_array':
      return 'e.g., [[1, 2], [3, 4]]'
    case 'boolean':
      return 'true or false'
    default:
      return ''
  }
}

function getHelpText(type: InputType): string {
  switch (type) {
    case 'string':
      return 'Type a string value.'
    case 'integer':
      return 'Type a whole number.'
    case 'float':
      return 'Type a decimal number.'
    case 'array':
    case 'linked_list':
      return 'Format: [1, 2, 3]'
    case '2d_array':
      return 'Format: [[1, 2], [3, 4]]'
    case 'boolean':
      return 'Enter true or false'
    default:
      return ''
  }
}

/**
 * Validate user input using Regular Expressions and JSON parsing
 */
export function validateInput(value: string, type: InputType): { valid: boolean; error?: string } {
  const trimmed = value.trim()
  
  if (!trimmed) {
    return { valid: false, error: 'This field is required' }
  }

  switch (type) {
    case 'integer':
      if (!/^-?\d+$/.test(trimmed)) {
        return { valid: false, error: 'Must be a valid integer (e.g., 42, -5)' }
      }
      break

    case 'float':
      if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
        return { valid: false, error: 'Must be a valid number (e.g., 3.14)' }
      }
      break

    case 'boolean':
      if (!/^(true|false)$/i.test(trimmed)) {
        return { valid: false, error: 'Must be exactly "true" or "false"' }
      }
      break

    case 'array':
    case 'linked_list':
      // Regex structural check: starts with [, ends with ], contains no nested brackets
      if (!/^\[\s*(?:(?:[^,\[\]]+)(?:\s*,\s*[^,\[\]]+)*)?\s*\]$/.test(trimmed)) {
        return { valid: false, error: 'Format must be: [1, 2, 3]' }
      }
      // JSON check to ensure data types inside are valid primitives
      try {
        JSON.parse(trimmed.replace(/'/g, '"'))
      } catch {
        return { valid: false, error: 'Invalid array contents. Ensure strings are quoted.' }
      }
      break

    case '2d_array':
      // Regex structural check: [[...], [...]]
      if (!/^\[\s*(?:\[\s*(?:[^,\[\]]+(?:\s*,\s*[^,\[\]]+)*)?\s*\](?:\s*,\s*\[\s*(?:[^,\[\]]+(?:\s*,\s*[^,\[\]]+)*)?\s*\])*)?\s*\]$/.test(trimmed)) {
        return { valid: false, error: 'Format must be: [[1, 2], [3, 4]]' }
      }
      try {
        JSON.parse(trimmed.replace(/'/g, '"'))
      } catch {
        return { valid: false, error: 'Invalid 2D array contents.' }
      }
      break

    case 'string':
      // Strings accept anything for now
      break
  }

  return { valid: true }
}

/**
 * Format raw user input into the exact data structure needed for the backend
 */
export function formatInputValue(rawValue: string, type: InputType): any {
  const value = rawValue.trim()

  switch (type) {
    case 'string':
      return value
    case 'integer':
      return parseInt(value, 10)
    case 'float':
      return parseFloat(value)
    case 'boolean':
      return value.toLowerCase() === 'true'
    case 'array':
    case 'linked_list':
    case '2d_array':
      // JSON.parse automatically strips arbitrary whitespace and converts strings into actual JS Arrays
      // replace() handles cases where users might type ['a', 'b'] instead of ["a", "b"]
      return JSON.parse(value.replace(/'/g, '"'))
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
    return JSON.stringify(value).replace(/,/g, ', ') // Adds nice spacing for UI display
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}