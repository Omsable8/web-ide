-- =========================================================
-- PROBLEM: Max Sum Subarray of Size K
-- Difficulty: Easy | Category: Sliding Window | Topic: Arrays
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Max Sum Subarray of Size K', 'Given an array of integers nums and an integer k, find the maximum sum of any contiguous subarray of size exactly k.', 'Easy', 'Sliding Window', 'Arrays', '[{"input": "nums = [2, 1, 5, 1, 3, 2], k = 3", "output": "9"}]', '1 <= k <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Max Sum Subarray of Size K'), false, '[
  [{"name": "nums", "type": "array", "value": [2, 1, 5, 1, 3, 2]}, {"name": "k", "type": "integer", "value": 3}],
  [{"name": "nums", "type": "array", "value": [2, 3, 4, 1, 5]}, {"name": "k", "type": "integer", "value": 2}],
  [{"name": "nums", "type": "array", "value": [5]}, {"name": "k", "type": "integer", "value": 1}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Max Sum Subarray of Size K'), true, '[
  [{"name": "nums", "type": "array", "value": [1, 2]}, {"name": "k", "type": "integer", "value": 1}],
  [{"name": "nums", "type": "array", "value": [1, 2]}, {"name": "k", "type": "integer", "value": 2}],
  [{"name": "nums", "type": "array", "value": [-1, -2, -3]}, {"name": "k", "type": "integer", "value": 2}],
  [{"name": "nums", "type": "array", "value": [0, 0, 0, 0]}, {"name": "k", "type": "integer", "value": 2}],
  [{"name": "nums", "type": "array", "value": [10000, -10000, 10000, -10000]}, {"name": "k", "type": "integer", "value": 2}],
  [{"name": "nums", "type": "array", "value": [1, 1, 1, 1, 1]}, {"name": "k", "type": "integer", "value": 3}],
  [{"name": "nums", "type": "array", "value": [-5, -1, -3, -2]}, {"name": "k", "type": "integer", "value": 1}],
  [{"name": "nums", "type": "array", "value": [4, 2, 1, 7, 8, 1, 2, 8, 1, 0]}, {"name": "k", "type": "integer", "value": 3}],
  [{"name": "nums", "type": "array", "value": [3, -1, 4, -1, 5, -9, 2, 6]}, {"name": "k", "type": "integer", "value": 4}],
  [{"name": "nums", "type": "array", "value": [1, 4, 2, 10, 23, 3, 1, 0, 20]}, {"name": "k", "type": "integer", "value": 4}],
  [{"name": "nums", "type": "array", "value": [100, 200, 300, 400]}, {"name": "k", "type": "integer", "value": 4}],
  [{"name": "nums", "type": "array", "value": [-10, 5, -3, 8, -2, 9]}, {"name": "k", "type": "integer", "value": 3}],
  [{"name": "nums", "type": "array", "value": [1, -1, 1, -1, 1, -1, 1]}, {"name": "k", "type": "integer", "value": 5}],
  [{"name": "nums", "type": "array", "value": [9, 9, 9, 1, 1, 1]}, {"name": "k", "type": "integer", "value": 2}],
  [{"name": "nums", "type": "array", "value": [2, -1, 2, 3, 4, -5]}, {"name": "k", "type": "integer", "value": 3}],
  [{"name": "nums", "type": "array", "value": [5, -2, 3, 1, -1, 4, 2]}, {"name": "k", "type": "integer", "value": 5}],
  [{"name": "nums", "type": "array", "value": [-4, -2, -5, -1, -3]}, {"name": "k", "type": "integer", "value": 2}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Max Sum Subarray of Size K'), '[{"level": 1, "title": "Conceptual", "content": "Recomputing the sum of every window of size k from scratch is wasteful. When the window slides by one position, most elements stay the same; only one leaves and one enters."}, {"level": 2, "title": "Strategy", "content": "Compute the sum of the first window of size k. Then slide the window one step at a time: subtract the element leaving on the left, add the element entering on the right, and track the maximum sum seen."}, {"level": 3, "title": "Implementation", "content": "windowSum = sum of nums[0..k-1]. maxSum = windowSum. For i from k to n-1: windowSum += nums[i] - nums[i-k]; maxSum = max(maxSum, windowSum). Return maxSum."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Max Sum Subarray of Size K'), 'java', 'maxSumSubarray', '[{"name": "nums", "type": "array"}, {"name": "k", "type": "integer"}]', 'integer',
$$class Solution {
    public int maxSumSubarray(int[] nums, int k) {
        // Write your solution here
        return 0;
    }
}$$,
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
                for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(parts[i]);
            } else {
                sc.nextLine();
            }
            int k = Integer.parseInt(sc.nextLine().trim());
            int result = sol.maxSumSubarray(nums, k);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int maxSumSubarray(int[] nums, int k) {
        int windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += nums[i];
        int maxSum = windowSum;
        for (int i = k; i < nums.length; i++) {
            windowSum += nums[i] - nums[i - k];
            maxSum = Math.max(maxSum, windowSum);
        }
        return maxSum;
    }
}$$),

((SELECT id FROM problems WHERE title='Max Sum Subarray of Size K'), 'python', 'maxSumSubarray', '[{"name": "nums", "type": "array"}, {"name": "k", "type": "integer"}]', 'integer',
$$class Solution:
    def maxSumSubarray(self, nums: list[int], k: int) -> int:
        # Write your solution here
        return 0
$$,
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
        k = int(data[idx].strip()); idx += 1
        result = sol.maxSumSubarray(nums, k)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def maxSumSubarray(self, nums: list[int], k: int) -> int:
        window_sum = sum(nums[:k])
        max_sum = window_sum
        for i in range(k, len(nums)):
            window_sum += nums[i] - nums[i - k]
            max_sum = max(max_sum, window_sum)
        return max_sum
$$),

((SELECT id FROM problems WHERE title='Max Sum Subarray of Size K'), 'cpp', 'maxSumSubarray', '[{"name": "nums", "type": "array"}, {"name": "k", "type": "integer"}]', 'integer',
$$class Solution {
public:
    int maxSumSubarray(vector<int>& nums, int k) {
        // Write your solution here
        return 0;
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
        int k;
        cin >> k;
        int result = sol.maxSumSubarray(nums, k);
        out << result << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    int maxSumSubarray(vector<int>& nums, int k) {
        int windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += nums[i];
        int maxSum = windowSum;
        for (int i = k; i < (int)nums.size(); i++) {
            windowSum += nums[i] - nums[i - k];
            maxSum = max(maxSum, windowSum);
        }
        return maxSum;
    }
};$$);