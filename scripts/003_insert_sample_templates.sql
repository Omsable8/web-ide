-- ============================================================================
-- Insert Sample Problem: Two Sum
-- ============================================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints)
VALUES (
    'Two Sum',
    'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    'Easy',
    'Array',
    'Hash Map',
    'Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]',
    '2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Insert Python Template for Two Sum
-- ============================================================================

WITH problem AS (
    SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1
)
INSERT INTO code_templates (problem_id, language, template_code, input_params, return_type, description)
SELECT 
    problem.id,
    'python',
    'def solve(nums, target):
    """
    Find two numbers in nums that add up to target.
    
    Args:
        nums: List[int] - array of integers
        target: int - target sum
    
    Returns:
        List[int] - indices of two numbers that add up to target
    
    Example:
        >>> solve([2, 7, 11, 15], 9)
        [0, 1]
    """
    # Write your solution here
    pass',
    '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]'::jsonb,
    'array',
    'Python template for Two Sum problem'
FROM problem
ON CONFLICT (problem_id, language) DO NOTHING;

-- ============================================================================
-- Insert C++ Template for Two Sum
-- ============================================================================

WITH problem AS (
    SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1
)
INSERT INTO code_templates (problem_id, language, template_code, input_params, return_type, description)
SELECT 
    problem.id,
    'cpp',
    '#include <iostream>
#include <vector>
using namespace std;

vector<int> solve(vector<int> nums, int target) {
    /*
     * Find two numbers in nums that add up to target.
     * 
     * Args:
     *     nums: vector<int> - array of integers
     *     target: int - target sum
     * 
     * Returns:
     *     vector<int> - indices of two numbers that add up to target
     * 
     * Example:
     *     Input: nums = [2, 7, 11, 15], target = 9
     *     Output: [0, 1]
     */
    
    // Write your solution here
    vector<int> result;
    return result;
}',
    '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]'::jsonb,
    'array',
    'C++ template for Two Sum problem'
FROM problem
ON CONFLICT (problem_id, language) DO NOTHING;

-- ============================================================================
-- Insert Java Template for Two Sum
-- ============================================================================

WITH problem AS (
    SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1
)
INSERT INTO code_templates (problem_id, language, template_code, input_params, return_type, description)
SELECT 
    problem.id,
    'java',
    'public class Solution {
    /**
     * Find two numbers in nums that add up to target.
     * 
     * Args:
     *     nums: int[] - array of integers
     *     target: int - target sum
     * 
     * Returns:
     *     int[] - indices of two numbers that add up to target
     * 
     * Example:
     *     Input: nums = [2, 7, 11, 15], target = 9
     *     Output: [0, 1]
     */
    public static int[] solve(int[] nums, int target) {
        // Write your solution here
        return new int[0];
    }
}',
    '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]'::jsonb,
    'array',
    'Java template for Two Sum problem'
FROM problem
ON CONFLICT (problem_id, language) DO NOTHING;

-- ============================================================================
-- Insert Test Cases with Structured Input
-- ============================================================================

-- Test Case 1: Example from problem description
WITH problem AS (
    SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1
)
INSERT INTO test_cases (problem_id, input_params, expected_output, is_example)
SELECT 
    problem.id,
    '[
        {"name": "nums", "type": "array", "value": "2,7,11,15"},
        {"name": "target", "type": "integer", "value": 9}
    ]'::jsonb,
    '[0,1]',
    true
FROM problem;

-- Test Case 2: Example from problem description
WITH problem AS (
    SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1
)
INSERT INTO test_cases (problem_id, input_params, expected_output, is_example)
SELECT 
    problem.id,
    '[
        {"name": "nums", "type": "array", "value": "3,2,4"},
        {"name": "target", "type": "integer", "value": 6}
    ]'::jsonb,
    '[1,2]',
    true
FROM problem;

-- Test Case 3: Hidden test case
WITH problem AS (
    SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1
)
INSERT INTO test_cases (problem_id, input_params, expected_output, is_example)
SELECT 
    problem.id,
    '[
        {"name": "nums", "type": "array", "value": "3,3"},
        {"name": "target", "type": "integer", "value": 6}
    ]'::jsonb,
    '[0,1]',
    false
FROM problem;

-- Test Case 4: Another hidden test case
WITH problem AS (
    SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1
)
INSERT INTO test_cases (problem_id, input_params, expected_output, is_example)
SELECT 
    problem.id,
    '[
        {"name": "nums", "type": "array", "value": "3,2,3"},
        {"name": "target", "type": "integer", "value": 6}
    ]'::jsonb,
    '[0,2]',
    false
FROM problem;

-- ============================================================================
-- Verification Queries (Run these to verify setup)
-- ============================================================================

-- Verify problem was inserted
-- SELECT id, title, difficulty, category, topic FROM problems WHERE title = 'Two Sum';

-- Verify templates were inserted
-- SELECT problem_id, language, return_type FROM code_templates WHERE problem_id = (SELECT id FROM problems WHERE title = 'Two Sum');

-- Verify test cases were inserted
-- SELECT COUNT(*) as test_count FROM test_cases WHERE problem_id = (SELECT id FROM problems WHERE title = 'Two Sum');