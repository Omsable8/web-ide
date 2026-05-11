-- Add input_params column to test_cases table if it doesn't exist
ALTER TABLE test_cases 
ADD COLUMN IF NOT EXISTS input_params JSONB DEFAULT '[]'::jsonb;

-- Update existing test cases for Two Sum problem (example)
-- First get the problem_id for Two Sum
UPDATE test_cases
SET input_params = '[
  {"name": "nums", "type": "array", "value": [2, 7, 11, 15]},
  {"name": "target", "type": "integer", "value": 9}
]'::jsonb
WHERE problem_id = (SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1)
  AND expected_output = '[0,1]'
  AND input_params = '[]'::jsonb;

UPDATE test_cases
SET input_params = '[
  {"name": "nums", "type": "array", "value": [3, 2, 4]},
  {"name": "target", "type": "integer", "value": 6}
]'::jsonb
WHERE problem_id = (SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1)
  AND expected_output = '[1,2]'
  AND input_params = '[]'::jsonb;

UPDATE test_cases
SET input_params = '[
  {"name": "nums", "type": "array", "value": [3, 3]},
  {"name": "target", "type": "integer", "value": 6}
]'::jsonb
WHERE problem_id = (SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1)
  AND expected_output = '[0,1]'
  AND input_params = '[]'::jsonb;

-- Create index for faster queries on input_params
CREATE INDEX IF NOT EXISTS idx_test_cases_input_params ON test_cases USING GIN (input_params);