-- =========================================================
-- PROBLEM: Maximum Subarray Sum
-- Difficulty: Medium | Category: Arrays | Topic: Kadane's Algorithm / DP
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Maximum Subarray Sum', 'Given an array of integers nums, find the contiguous subarray (containing at least one number) which has the largest sum, and return that sum.', 'Medium', 'Arrays', 'Kadane''s Algorithm', '[{"input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", "output": "6"}]', '1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Maximum Subarray Sum'), false, '[
  [{"name": "nums", "type": "array", "value": [-2, 1, -3, 4, -1, 2, 1, -5, 4]}],
  [{"name": "nums", "type": "array", "value": [1]}],
  [{"name": "nums", "type": "array", "value": [5, 4, -1, 7, 8]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Maximum Subarray Sum'), true, '[
  [{"name": "nums", "type": "array", "value": [-1]}],
  [{"name": "nums", "type": "array", "value": [-5, -4, -3, -2, -1]}],
  [{"name": "nums", "type": "array", "value": [1, 2, 3, 4, 5]}],
  [{"name": "nums", "type": "array", "value": [0, 0, 0, 0]}],
  [{"name": "nums", "type": "array", "value": [-2, -1]}],
  [{"name": "nums", "type": "array", "value": [3, -2, 5, -1]}],
  [{"name": "nums", "type": "array", "value": [-10000, 10000]}],
  [{"name": "nums", "type": "array", "value": [10000, -10000, 10000]}],
  [{"name": "nums", "type": "array", "value": [2, -1, 2, 3, -9, 9]}],
  [{"name": "nums", "type": "array", "value": [-1, -2, -3, 0]}],
  [{"name": "nums", "type": "array", "value": [4, -1, -2, 1, 5]}],
  [{"name": "nums", "type": "array", "value": [1, -1, 1, -1, 1, -1, 1]}],
  [{"name": "nums", "type": "array", "value": [-3, 4, -1, -2, 1, 5]}],
  [{"name": "nums", "type": "array", "value": [8, -19, 5, -4, 20]}],
  [{"name": "nums", "type": "array", "value": [-100, -200, -50, -1]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Maximum Subarray Sum'), '[{"level": 1, "title": "Conceptual", "content": "At each position, you have a choice: either extend the existing subarray ending at the previous position, or start a brand new subarray from the current element. Which gives a bigger sum?"}, {"level": 2, "title": "Strategy", "content": "This is Kadane''s Algorithm. Track two values as you iterate: current_sum (best sum ending at the current index) and max_sum (best sum found so far overall)."}, {"level": 3, "title": "Implementation", "content": "current_sum = max(nums[i], current_sum + nums[i]). Then update max_sum = max(max_sum, current_sum). Initialize both to nums[0] before the loop."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Maximum Subarray Sum'), 'java', 'maxSubArray', '[{"name": "nums", "type": "array"}]', 'int',
$$class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        
    }
}
$$,

$$import java.util.*;

---INSERT USER CODE HERE---

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = Integer.parseInt(sc.nextLine().trim());
        StringBuilder sb = new StringBuilder();

        Solution sol = new Solution();
        for (int tc = 0; tc < t; tc++) {
            int n = Integer.parseInt(sc.nextLine().trim());
            int[] nums = new int[n];
            if (n > 0) {
                String[] parts = sc.nextLine().trim().split("\\s+");
                for (int i = 0; i < n; i++) {
                    nums[i] = Integer.parseInt(parts[i]);
                }
            } else {
                sc.nextLine();
            }

            int result = sol.maxSubArray(nums);
            sb.append(result);
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,

$$class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}$$),

((SELECT id FROM problems WHERE title='Maximum Subarray Sum'), 'python', 'maxSubArray', '[{"name": "nums", "type": "array"}]', 'int',

$$class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        # Write your solution here
        pass$$,

$$import sys

---INSERT USER CODE HERE---

def main():
    data = sys.stdin.read().split('\n')
    idx = 0
    t = int(data[idx].strip()); idx += 1

    sol = Solution()
    output = []
    for _ in range(t):
        n = int(data[idx].strip()); idx += 1
        if n > 0:
            nums = list(map(int, data[idx].strip().split())); idx += 1
        else:
            nums = []
            idx += 1

        result = sol.maxSubArray(nums)
        output.append(str(result))
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        current_sum = nums[0]
        max_sum = nums[0]
        for i in range(1, len(nums)):
            current_sum = max(nums[i], current_sum + nums[i])
            max_sum = max(max_sum, current_sum)
        return max_sum$$),

-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='Maximum Subarray Sum'), 'cpp', 'maxSubArray', '[{"name": "nums", "type": "array"}]', 'int',

$$class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your solution here
        
    }
};$$,

$$#include <bits/stdc++.h>
using namespace std;

---INSERT USER CODE HERE---

int main() {
    int t;
    cin >> t;

    Solution sol;
    ostringstream out;

    for (int tc = 0; tc < t; tc++) {
        int n;
        cin >> n;
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];

        int result = sol.maxSubArray(nums);
        out << result << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            currentSum = max(nums[i], currentSum + nums[i]);
            maxSum = max(maxSum, currentSum);
        }
        return maxSum;
    }
};$$);