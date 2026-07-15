-- =========================================================
-- PROBLEM: Two Sum
-- Difficulty: Medium | Category: Arrays | Topic: Hashmaps
-- Multi-param example: nums (array) + target (integer)
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Two Sum', 
'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. Assume exactly one solution exists, and you may not use the same element twice. Return the indices in ascending order.', 
'Medium', 'Arrays', 'Hashmaps', 
'[{"input": "nums = [2, 7, 11, 15], target = 9", "output": "[0, 1]"}]', 
'2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9, exactly one valid answer exists', 
'O(n)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Two Sum'), false, '[
  [{"name": "nums", "type": "array", "value": [2, 7, 11, 15]}, {"name": "target", "type": "integer", "value": 9}],
  [{"name": "nums", "type": "array", "value": [3, 2, 4]}, {"name": "target", "type": "integer", "value": 6}],
  [{"name": "nums", "type": "array", "value": [3, 3]}, {"name": "target", "type": "integer", "value": 6}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Two Sum'), true, '[
  [{"name": "nums", "type": "array", "value": [1, 2]}, {"name": "target", "type": "integer", "value": 3}],
  [{"name": "nums", "type": "array", "value": [0, 4, 3, 0]}, {"name": "target", "type": "integer", "value": 0}],
  [{"name": "nums", "type": "array", "value": [-1, -2, -3, -4, -5]}, {"name": "target", "type": "integer", "value": -8}],
  [{"name": "nums", "type": "array", "value": [-3, 4, 3, 90]}, {"name": "target", "type": "integer", "value": 0}],
  [{"name": "nums", "type": "array", "value": [5, 75, 25]}, {"name": "target", "type": "integer", "value": 100}],
  [{"name": "nums", "type": "array", "value": [1, 5, 3, 9, 2]}, {"name": "target", "type": "integer", "value": 11}],
  [{"name": "nums", "type": "array", "value": [10, 20, 30, 40, 50]}, {"name": "target", "type": "integer", "value": 90}],
  [{"name": "nums", "type": "array", "value": [1, 1, 1, 1, 4]}, {"name": "target", "type": "integer", "value": 8}],
  [{"name": "nums", "type": "array", "value": [-10, 20, 10, -20]}, {"name": "target", "type": "integer", "value": 0}],
  [{"name": "nums", "type": "array", "value": [1000000000, -1000000000, 5]}, {"name": "target", "type": "integer", "value": 0}],
  [{"name": "nums", "type": "array", "value": [2, 5, 5, 11]}, {"name": "target", "type": "integer", "value": 10}],
  [{"name": "nums", "type": "array", "value": [8, 2, 7, 11]}, {"name": "target", "type": "integer", "value": 9}],
  [{"name": "nums", "type": "array", "value": [1, 3, 5, 7, 9, 2]}, {"name": "target", "type": "integer", "value": 11}],
  [{"name": "nums", "type": "array", "value": [6, 4, 8, 2, 10]}, {"name": "target", "type": "integer", "value": 12}],
  [{"name": "nums", "type": "array", "value": [-5, -3, -1, 0, 2, 4]}, {"name": "target", "type": "integer", "value": -4}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Two Sum'), 
'[{"level": 1, "title": "Conceptual", "content": "For each number, you need to find if its complement (target - number) also exists in the array. A brute force check of every pair works but is slow."}, {"level": 2, "title": "Strategy", "content": "Use a hashmap to store numbers you have already seen along with their index. As you iterate, check if the complement of the current number already exists in the map."}, {"level": 3, "title": "Implementation", "content": "For each index i, compute complement = target - nums[i]. If complement is in your hashmap, return [map.get(complement), i]. Otherwise, add nums[i] -> i to the map and continue."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
-- ---------- JAVA ----------
((SELECT id FROM problems WHERE title='Two Sum'), 'java', 'twoSum', '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]', 'array', 
$$class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
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
                for (int i = 0; i < n; i++) {
                    nums[i] = Integer.parseInt(parts[i]);
                }
            } else {
                sc.nextLine();
            }
            int target = Integer.parseInt(sc.nextLine().trim());

            int[] result = sol.twoSum(nums, target);
            sb.append(Arrays.toString(result));
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }
} $$),

((SELECT id FROM problems WHERE title='Two Sum'), 'python', 'twoSum', '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]', 'array', 

$$class Solution:
    def two_sum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass
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

        result = sol.two_sum(nums, target)
        output.append(str(result))
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def two_sum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return [-1, -1]
$$),

-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='Two Sum'), 'cpp', 'twoSum', '[{"name": "nums", "type": "array"}, {"name": "target", "type": "integer"}]', 'array', 
$$class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
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
        int target;
        cin >> target;

        vector<int> result = sol.twoSum(nums, target);
        out << "[" << result[0] << ", " << result[1] << "]";
        out << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {-1, -1};
    }
};$$);