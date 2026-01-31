-- =========================================================
-- 1. CLEAN SLATE
-- =========================================================
TRUNCATE hints, test_cases, code_templates, problems RESTART IDENTITY CASCADE;

-- =========================================================
-- 2. SCHEMA EVOLUTION
-- =========================================================

-- A. Update code_templates: Add driver_code AND solution_code
ALTER TABLE code_templates ADD COLUMN IF NOT EXISTS driver_code text;
ALTER TABLE code_templates ADD COLUMN IF NOT EXISTS solution_code text;

-- B. Update hints: Use single JSONB column for all levels
ALTER TABLE hints DROP COLUMN IF EXISTS level;
ALTER TABLE hints DROP COLUMN IF EXISTS content;
ALTER TABLE hints DROP COLUMN IF EXISTS title;
ALTER TABLE hints ADD COLUMN IF NOT EXISTS hints_data jsonb DEFAULT '[]'::jsonb;

-- C. Update test_cases: Ensure input_params is JSONB and clean up
ALTER TABLE test_cases DROP COLUMN IF EXISTS input; 
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS input_params jsonb DEFAULT '[]'::jsonb;

-- =========================================================
-- 3. SEED DATA: TWO SUM
-- =========================================================
DO $$
DECLARE
    v_problem_id UUID;
BEGIN
    -- -----------------------------------------------------
    -- A. INSERT PROBLEM
    -- -----------------------------------------------------
    INSERT INTO problems (
        title, description, difficulty, category, topic, 
        examples, constraints, time_complexity, space_complexity
    ) VALUES (
        'Two Sum',
        'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
        'Easy',
        'Arrays & Hashing',
        'Array',
        '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}]',
        '2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9',
        'O(n)',
        'O(n)'
    ) RETURNING id INTO v_problem_id;

    -- -----------------------------------------------------
    -- B. INSERT HINTS
    -- -----------------------------------------------------
    INSERT INTO hints (problem_id, hints_data)
    VALUES (
        v_problem_id,
        '[
            {"level": 1, "title": "Conceptual Help", "content": "Brute force is O(n^2). Can you do better?"},
            {"level": 2, "title": "Algorithm Help", "content": "Use a Hash Map to store seen values."},
            {"level": 3, "title": "Code Help", "content": "Check if (target - n) exists in map."}
        ]'::jsonb
    );

    -- -----------------------------------------------------
    -- C. INSERT TEST CASES (Nested Structure)
    -- -----------------------------------------------------
    -- Row 1: Public Test Cases (Outer List -> List of Params)
    INSERT INTO test_cases (problem_id, is_hidden, input_params)
    VALUES (
        v_problem_id, 
        false, 
        '[
            [
                {"name": "nums", "type": "array", "value": [2, 7, 11, 15]},
                {"name": "target", "type": "integer", "value": 9}
            ],
            [
                {"name": "nums", "type": "array", "value": [3, 2, 4]},
                {"name": "target", "type": "integer", "value": 6}
            ]
        ]'::jsonb
    );

    -- Row 2: Private Test Cases
    INSERT INTO test_cases (problem_id, is_hidden, input_params)
    VALUES (
        v_problem_id, 
        true, 
        '[
            [
                {"name": "nums", "type": "array", "value": [3, 3]},
                {"name": "target", "type": "integer", "value": 6}
            ],
            [
                {"name": "nums", "type": "array", "value": [1, 2, 3, 4, 5]},
                {"name": "target", "type": "integer", "value": 9}
            ]
        ]'::jsonb
    );

    -- -----------------------------------------------------
    -- D. INSERT TEMPLATES (Driver & Solution)
    -- -----------------------------------------------------
    INSERT INTO code_templates (
        problem_id, language, template_code, function_name, 
        input_params, return_type, driver_code, solution_code
    ) VALUES (
        v_problem_id,
        'python',
        -- User Template
        'class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass',
        'twoSum',
        -- Signature Definition (No Values here)
        '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]'::jsonb,
        'array',
        -- Hidden Driver (Updated to handle your specific param structure)
        'import sys, json
if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    sol = Solution()
    for line in lines:
        try:
            # line is one inner list: [{"name": "nums", "value": ...}, ...]
            raw_params = json.loads(line)
            # Extract just the values to pass to function
            kwargs = {p["name"]: p["value"] for p in raw_params}
            result = sol.twoSum(**kwargs)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps(None))',
        -- Trusted Solution Code
        'class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        prevMap = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i
        return []'
    );
END $$;