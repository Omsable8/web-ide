# Database Schema Guide

## Proposed Code Templates Schema

The `code_templates` table is the central hub for storing language-specific solution templates for each problem.

### Table Definition

```sql
CREATE TABLE code_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    template_code TEXT NOT NULL,
    input_params JSONB NOT NULL DEFAULT '[]'::jsonb,
    return_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(problem_id, language)
);
```

### Schema Explanation

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Primary key | `550e8400-e29b-41d4-a716-446655440000` |
| `problem_id` | UUID | References problems table | Problem ID from `problems` table |
| `language` | VARCHAR(50) | Programming language | `python`, `cpp`, `java` |
| `template_code` | TEXT | Solution template with docstring | Function skeleton with TODO |
| `input_params` | JSONB | Parameter definitions | `[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]` |
| `return_type` | VARCHAR(50) | Expected return type | `array`, `integer`, `string`, `boolean` |
| `description` | TEXT | Template description | "Python template for Two Sum problem" |
| `created_at` | TIMESTAMP | Creation timestamp | `2024-01-28 10:00:00` |
| `updated_at` | TIMESTAMP | Last update timestamp | `2024-01-28 10:00:00` |

### JSONB Structure for input_params

```json
[
  {
    "name": "nums",
    "type": "array"
  },
  {
    "name": "target",
    "type": "integer"
  }
]
```

### Example Record

```sql
INSERT INTO code_templates (problem_id, language, template_code, input_params, return_type, description)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'python',
  'def solve(nums, target):
    """Find two numbers that add up to target."""
    pass',
  '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]'::jsonb,
  'array',
  'Python template for Two Sum'
);
```

## Enhanced Test Cases Schema

The `test_cases` table now includes structured input parameters for organized test data.

### Updated Table Structure

```sql
ALTER TABLE test_cases 
ADD COLUMN IF NOT EXISTS input_params JSONB DEFAULT '[]'::jsonb;

CREATE INDEX idx_test_cases_input_params ON test_cases USING GIN (input_params);
```

### JSONB Structure for input_params in Test Cases

```json
[
  {
    "name": "nums",
    "type": "array",
    "value": "2,7,11,15"
  },
  {
    "name": "target",
    "type": "integer",
    "value": 9
  }
]
```

### Example Test Case Record

```sql
INSERT INTO test_cases (problem_id, input_params, expected_output, is_example)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '[
    {"name": "nums", "type": "array", "value": "2,7,11,15"},
    {"name": "target", "type": "integer", "value": 9}
  ]'::jsonb,
  '[0,1]',
  true
);
```

## Data Type Mapping

The frontend parses string values from `input_params` based on type:

| Type | Storage | Parsing | Example |
|------|---------|---------|---------|
| `array` | Comma-separated string | Split by comma, parse numbers | `"2,7,11,15"` → `[2, 7, 11, 15]` |
| `integer` | String number | `parseInt()` | `"9"` → `9` |
| `number` | String decimal | `parseFloat()` | `"3.14"` → `3.14` |
| `string` | Raw string | No parsing | `"hello"` → `"hello"` |
| `boolean` | String "true"/"false" | `.toLowerCase() === 'true'` | `"true"` → `true` |

## Insertion Scripts

### Script 002: Create Code Templates Table
**Location**: `/scripts/002_create_code_templates.sql`
- Creates the `code_templates` table with proper indexes and RLS policies
- Enables public read access for all users
- Restricts writes to authenticated users

### Script 003: Insert Sample Templates & Test Cases
**Location**: `/scripts/003_insert_sample_templates.sql`
- Inserts Two Sum problem with full metadata
- Creates three language templates (Python, C++, Java)
- Inserts 4 test cases with proper `input_params` structure
- Includes hidden and example test cases

### Script 004: Update Test Cases Schema
**Location**: `/scripts/004_update_test_cases_schema.sql`
- Adds `input_params` JSONB column to existing `test_cases` table
- Creates GIN index for efficient JSONB queries
- Updates Two Sum test cases with structured parameters

## Querying Examples

### Get all templates for a problem

```sql
SELECT language, return_type, input_params 
FROM code_templates 
WHERE problem_id = 'problem-uuid'
ORDER BY language;
```

### Get test cases with structured parameters

```sql
SELECT input_params, expected_output, is_example
FROM test_cases
WHERE problem_id = 'problem-uuid'
AND is_example = true
ORDER BY created_at;
```

### Query array values in JSONB

```sql
SELECT id, input_params -> 0 -> 'value' as first_param_value
FROM test_cases
WHERE input_params @> '[{"name": "nums"}]'::jsonb;
```

### Get template by language

```sql
SELECT template_code, input_params
FROM code_templates
WHERE problem_id = 'problem-uuid'
AND language = 'python';
```

## Frontend Integration

### TypeScript Interfaces

```typescript
interface InputParam {
  name: string;
  type: string;
  value?: any;
}

interface TestCase {
  id: string;
  input_params: InputParam[];
  expected_output: string;
  is_hidden: boolean;
}

interface CodeTemplate {
  id: string;
  problem_id: string;
  language: string;
  template_code: string;
  input_params: Array<{ name: string; type: string }>;
  return_type: string;
}
```

### Parsing Test Case Values

```typescript
const parseParamValue = (value: string, type: string) => {
  if (type === 'array') {
    return value.split(',').map(v => {
      const trimmed = v.trim();
      return isNaN(Number(trimmed)) ? trimmed : Number(trimmed);
    });
  } else if (type === 'integer' || type === 'number') {
    return Number(value);
  } else if (type === 'boolean') {
    return value.toLowerCase() === 'true';
  }
  return value;
};
```

## Advantages of This Schema

1. **Structured Data**: Parameters are organized with clear names and types
2. **Type Safety**: Type information enables proper parsing and validation
3. **Scalability**: Easy to add new parameter types
4. **Flexibility**: Supports complex array and nested structures
5. **Searchability**: JSONB allows efficient querying of specific parameters
6. **User-Friendly UI**: Enables separated input fields for each parameter (LeetCode-style)
7. **Backend Validation**: Type information allows validation of user input before execution
8. **Documentation**: Parameter names and types serve as self-documenting test cases

## Migration Order

1. Run `001_create_dsa_tables.sql` (if not already done)
2. Run `002_create_code_templates.sql` (if not already done)
3. Run `004_update_test_cases_schema.sql` (add input_params to existing table)
4. Run `003_insert_sample_templates.sql` (populate with sample data)

Execute in Supabase:
```bash
# In Supabase SQL editor, run the files in order
```
