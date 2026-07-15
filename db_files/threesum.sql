-- =========================================================
-- PROBLEM: 3Sum
-- Difficulty: Hard | Category: Two Pointers | Topic: Arrays
-- NOTE: returns array of triplets, e.g. [[-1,-1,2],[-1,0,1]], sorted ascending,
-- triplets sorted internally and ordered by first element.
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('3Sum', 'Given an integer array nums, return all the unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0. Each triplet should be sorted in ascending order internally, and the list of triplets should be sorted in ascending order by the first element, then the second. The solution set must not contain duplicate triplets. Return an empty array if no such triplets exist.', 'Hard', 'Two Pointers', 'Arrays', '[{"input": "nums = [-1, 0, 1, 2, -1, -4]", "output": "[[-1, -1, 2], [-1, 0, 1]]"}]', '3 <= nums.length <= 10^3, -10^5 <= nums[i] <= 10^5', 'O(n^2)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = '3Sum'), false, '[
  [{"name": "nums", "type": "array", "value": [-1, 0, 1, 2, -1, -4]}],
  [{"name": "nums", "type": "array", "value": [0, 1, 1]}],
  [{"name": "nums", "type": "array", "value": [0, 0, 0]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = '3Sum'), true, '[
  [{"name": "nums", "type": "array", "value": [0, 0, 0, 0]}],
  [{"name": "nums", "type": "array", "value": [1, 2, 3]}],
  [{"name": "nums", "type": "array", "value": [-2, 0, 1, 1, 2]}],
  [{"name": "nums", "type": "array", "value": [-1, 0, 1]}],
  [{"name": "nums", "type": "array", "value": [3, -2, 1, 0]}],
  [{"name": "nums", "type": "array", "value": [-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6]}],
  [{"name": "nums", "type": "array", "value": [1, -1, -1, 0]}],
  [{"name": "nums", "type": "array", "value": [-5, 2, 3, -3, -2, 0, 5, -5]}],
  [{"name": "nums", "type": "array", "value": [5, -5, 0, 5, -5, 0]}],
  [{"name": "nums", "type": "array", "value": [-1, -1, -1, 2]}],
  [{"name": "nums", "type": "array", "value": [-2, -1, -1, -1, 0, 1, 1, 1, 2]}],
  [{"name": "nums", "type": "array", "value": [100000, -100000, 0]}],
  [{"name": "nums", "type": "array", "value": [-100000, -100000, 200000]}],
  [{"name": "nums", "type": "array", "value": [1, 1, -2]}],
  [{"name": "nums", "type": "array", "value": [-10, -5, 0, 5, 10, -10, 5]}],
  [{"name": "nums", "type": "array", "value": [2, -2, 0, 0, 2, -2]}],
  [{"name": "nums", "type": "array", "value": [-3, -1, 0, 1, 2, -1, -4, 2]}],
  [{"name": "nums", "type": "array", "value": [7, -3, -4, 4, -2, -1, 0, 3]}],
  [{"name": "nums", "type": "array", "value": [1, 2, -2, -1, 0, 3, -3]}],
  [{"name": "nums", "type": "array", "value": [-1, -1, 0, 0, 1, 1]}],
  [{"name": "nums", "type": "array", "value": [4, -1, -3, -1, 0, 2, -3, 1]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = '3Sum'), '[{"level": 1, "title": "Conceptual", "content": "Brute force checking every triplet is O(n^3) and too slow. Sorting the array first opens the door to a much faster two-pointer technique, and also makes it easy to skip duplicate values."}, {"level": 2, "title": "Strategy", "content": "Sort nums. Fix one element nums[i] as the first number of the triplet, then use two pointers (left = i+1, right = end) on the remaining sorted subarray to find pairs that sum to -nums[i], moving the pointers based on whether the current sum is too small or too large."}, {"level": 3, "title": "Implementation", "content": "Sort nums. For i from 0 to n-3 (skip if nums[i] == nums[i-1] to avoid duplicates): set left = i+1, right = n-1. While left < right: sum = nums[i]+nums[left]+nums[right]. If sum == 0, record triplet and move both pointers inward while skipping duplicates. If sum < 0, left++. If sum > 0, right--."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='3Sum'), 'java', 'threeSum', '[{"name": "nums", "type": "array"}]', 'array',
$$class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your solution here
        return new ArrayList<>();
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
            List<List<Integer>> result = sol.threeSum(nums);
            sb.append(result.toString());
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return result;
    }
}$$),

((SELECT id FROM problems WHERE title='3Sum'), 'python', 'threeSum', '[{"name": "nums", "type": "array"}]', 'array',
$$class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        # Write your solution here
        return []
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
        result = sol.threeSum(nums)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        result = []
        n = len(nums)
        for i in range(n - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            left, right = i + 1, n - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total == 0:
                    result.append([nums[i], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif total < 0:
                    left += 1
                else:
                    right -= 1
        return result
$$),

((SELECT id FROM problems WHERE title='3Sum'), 'cpp', 'threeSum', '[{"name": "nums", "type": "array"}]', 'array',
$$class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your solution here
        return {};
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
        vector<vector<int>> result = sol.threeSum(nums);
        out << "[";
        for (int i = 0; i < (int)result.size(); i++) {
            out << "[";
            for (int j = 0; j < (int)result[i].size(); j++) {
                out << result[i][j];
                if (j < (int)result[i].size() - 1) out << ", ";
            }
            out << "]";
            if (i < (int)result.size() - 1) out << ", ";
        }
        out << "]" << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> result;
        int n = nums.size();
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.push_back({nums[i], nums[left], nums[right]});
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return result;
    }
};$$);