-- =========================================================
-- PROBLEM: Binary Search
-- Difficulty: Easy | Category: Sorting & Searching | Topic: Binary Search
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Binary Search', 'Given a sorted array of distinct integers nums and an integer target, return the index of target if it exists in nums, or -1 if it does not.', 'Easy', 'Sorting & Searching', 'Binary Search', '[{"input": "nums = [-1, 0, 3, 5, 9, 12], target = 9", "output": "4"}]', '1 <= nums.length <= 10^4, -10^4 <= nums[i], target <= 10^4, nums is sorted in strictly ascending order', 'O(log n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Binary Search'), false, '[
  [{"name": "nums", "type": "array", "value": [-1, 0, 3, 5, 9, 12]}, {"name": "target", "type": "integer", "value": 9}],
  [{"name": "nums", "type": "array", "value": [-1, 0, 3, 5, 9, 12]}, {"name": "target", "type": "integer", "value": 2}],
  [{"name": "nums", "type": "array", "value": [5]}, {"name": "target", "type": "integer", "value": 5}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Binary Search'), true, '[
  [{"name": "nums", "type": "array", "value": [5]}, {"name": "target", "type": "integer", "value": 1}],
  [{"name": "nums", "type": "array", "value": [1, 2]}, {"name": "target", "type": "integer", "value": 1}],
  [{"name": "nums", "type": "array", "value": [1, 2]}, {"name": "target", "type": "integer", "value": 2}],
  [{"name": "nums", "type": "array", "value": [1, 2, 3, 4, 5]}, {"name": "target", "type": "integer", "value": 5}],
  [{"name": "nums", "type": "array", "value": [1, 2, 3, 4, 5]}, {"name": "target", "type": "integer", "value": 1}],
  [{"name": "nums", "type": "array", "value": [1, 2, 3, 4, 5]}, {"name": "target", "type": "integer", "value": 3}],
  [{"name": "nums", "type": "array", "value": [-10000, -5, 0, 5, 10000]}, {"name": "target", "type": "integer", "value": -10000}],
  [{"name": "nums", "type": "array", "value": [-10000, -5, 0, 5, 10000]}, {"name": "target", "type": "integer", "value": 10000}],
  [{"name": "nums", "type": "array", "value": [-10000, -5, 0, 5, 10000]}, {"name": "target", "type": "integer", "value": 7}],
  [{"name": "nums", "type": "array", "value": [2, 4, 6, 8, 10, 12, 14]}, {"name": "target", "type": "integer", "value": 8}],
  [{"name": "nums", "type": "array", "value": [2, 4, 6, 8, 10, 12, 14]}, {"name": "target", "type": "integer", "value": 1}],
  [{"name": "nums", "type": "array", "value": [2, 4, 6, 8, 10, 12, 14]}, {"name": "target", "type": "integer", "value": 15}],
  [{"name": "nums", "type": "array", "value": [1, 3, 5, 7, 9, 11, 13, 15]}, {"name": "target", "type": "integer", "value": 13}],
  [{"name": "nums", "type": "array", "value": [0]}, {"name": "target", "type": "integer", "value": 0}],
  [{"name": "nums", "type": "array", "value": [-3, -2, -1, 0, 1, 2, 3]}, {"name": "target", "type": "integer", "value": 0}],
  [{"name": "nums", "type": "array", "value": [-3, -2, -1, 0, 1, 2, 3]}, {"name": "target", "type": "integer", "value": -3}],
  [{"name": "nums", "type": "array", "value": [100, 200, 300, 400, 500]}, {"name": "target", "type": "integer", "value": 250}],
  [{"name": "nums", "type": "array", "value": [1, 5, 9, 13, 17, 21, 25, 29, 33]}, {"name": "target", "type": "integer", "value": 29}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Binary Search'), '[{"level": 1, "title": "Conceptual", "content": "Since the array is sorted, checking the middle element tells you whether the target is in the left half or the right half, letting you discard half the search space each time."}, {"level": 2, "title": "Strategy", "content": "Maintain left and right boundaries. Repeatedly compute mid = (left + right) / 2. If nums[mid] equals target, you are done. If nums[mid] is less than target, search the right half; otherwise search the left half."}, {"level": 3, "title": "Implementation", "content": "while (left <= right): mid = left + (right - left) / 2. If nums[mid] == target return mid. If nums[mid] < target, left = mid + 1. Else right = mid - 1. Return -1 if the loop ends."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Binary Search'), 'java', 'search', '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]', 'integer',
$$class Solution {
    public int search(int[] nums, int target) {
        // Write your solution here
        return -1;
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
            int target = Integer.parseInt(sc.nextLine().trim());
            int result = sol.search(nums, target);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}$$),

((SELECT id FROM problems WHERE title='Binary Search'), 'python', 'search', '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]', 'integer',
$$class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Write your solution here
        return -1
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
        target = int(data[idx].strip()); idx += 1
        result = sol.search(nums, target)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1
$$),

((SELECT id FROM problems WHERE title='Binary Search'), 'cpp', 'search', '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]', 'integer',
$$class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your solution here
        return -1;
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
        int target;
        cin >> target;
        int result = sol.search(nums, target);
        out << result << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = (int)nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};$$);
