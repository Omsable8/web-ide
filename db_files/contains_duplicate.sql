-- =========================================================
-- PROBLEM: Contains Duplicate
-- Difficulty: Easy | Category: Hashmaps | Topic: Sets
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Contains Duplicate', 'Given an array of integers nums, return true if any value appears at least twice in the array, and false if every element is distinct.', 'Easy', 'Hashmaps', 'Sets', '[{"input": "nums = [1, 2, 3, 1]", "output": "true"}]', '1 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9', 'O(n)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Contains Duplicate'), false, '[
  [{"name": "nums", "type": "array", "value": [1, 2, 3, 1]}],
  [{"name": "nums", "type": "array", "value": [1, 2, 3, 4]}],
  [{"name": "nums", "type": "array", "value": [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Contains Duplicate'), true, '[
  [{"name": "nums", "type": "array", "value": [1]}],
  [{"name": "nums", "type": "array", "value": [1, 1]}],
  [{"name": "nums", "type": "array", "value": [0, 0]}],
  [{"name": "nums", "type": "array", "value": [-1, -1, 2]}],
  [{"name": "nums", "type": "array", "value": [5, 4, 3, 2, 1]}],
  [{"name": "nums", "type": "array", "value": [1, 2, 3, 4, 5, 1]}],
  [{"name": "nums", "type": "array", "value": [1000000000, -1000000000, 1000000000]}],
  [{"name": "nums", "type": "array", "value": [7, 7, 7, 7, 7]}],
  [{"name": "nums", "type": "array", "value": [10, 20, 30, 40, 50]}],
  [{"name": "nums", "type": "array", "value": [0, -1, 1, -2, 2]}],
  [{"name": "nums", "type": "array", "value": [3, 1, 4, 1, 5]}],
  [{"name": "nums", "type": "array", "value": [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]}],
  [{"name": "nums", "type": "array", "value": [2, 2]}],
  [{"name": "nums", "type": "array", "value": [-5, -4, -3, -2, -1, 0]}],
  [{"name": "nums", "type": "array", "value": [100, 200, 300, 100]}],
  [{"name": "nums", "type": "array", "value": [1, 2]}],
  [{"name": "nums", "type": "array", "value": [6, 5, 4, 3, 2, 1, 6]}],
  [{"name": "nums", "type": "array", "value": [11, 22, 33, 44, 55, 66]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Contains Duplicate'), '[{"level": 1, "title": "Conceptual", "content": "A set only stores unique values. Comparing the size of a set built from the array to the original array length tells you something useful."}, {"level": 2, "title": "Strategy", "content": "Iterate through the array while adding each element to a set. If an element is already in the set before you add it, you found a duplicate."}, {"level": 3, "title": "Implementation", "content": "For each num in nums: if set.contains(num) return true; otherwise set.add(num). If the loop completes, return false."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Contains Duplicate'), 'java', 'containsDuplicate', '[{"name": "nums", "type": "array"}]', 'boolean',
$$class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Write your solution here
        return false;
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
            boolean result = sol.containsDuplicate(nums);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (seen.contains(num)) return true;
            seen.add(num);
        }
        return false;
    }
}$$),

((SELECT id FROM problems WHERE title='Contains Duplicate'), 'python', 'containsDuplicate', '[{"name": "nums", "type": "array"}]', 'boolean',
$$class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        # Write your solution here
        return False
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
        result = sol.containsDuplicate(nums)
        output.append(str(result).lower())
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        seen = set()
        for num in nums:
            if num in seen:
                return True
            seen.add(num)
        return False
$$),

((SELECT id FROM problems WHERE title='Contains Duplicate'), 'cpp', 'containsDuplicate', '[{"name": "nums", "type": "array"}]', 'boolean',
$$class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        // Write your solution here
        return false;
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
        bool result = sol.containsDuplicate(nums);
        out << (result ? "true" : "false") << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int num : nums) {
            if (seen.count(num)) return true;
            seen.insert(num);
        }
        return false;
    }
};$$);
