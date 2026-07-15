-- =========================================================
-- PROBLEM: Bubble Sort
-- Difficulty: Medium | Category: Sorting & Searching | Topic: Sorting
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Bubble Sort', 'Given an array of integers nums, sort the array in ascending order using the bubble sort algorithm and return it. Repeatedly step through the array, compare adjacent elements, and swap them if they are in the wrong order, until no swaps are needed.', 'Medium', 'Sorting & Searching', 'Sorting', '[{"input": "nums = [5, 2, 9, 1, 5, 6]", "output": "[1, 2, 5, 5, 6, 9]"}]', '1 <= nums.length <= 10^3, -10^4 <= nums[i] <= 10^4', 'O(n^2)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Bubble Sort'), false, '[
  [{"name": "nums", "type": "array", "value": [5, 2, 9, 1, 5, 6]}],
  [{"name": "nums", "type": "array", "value": [3, 1, 2]}],
  [{"name": "nums", "type": "array", "value": [1]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Bubble Sort'), true, '[
  [{"name": "nums", "type": "array", "value": [2, 1]}],
  [{"name": "nums", "type": "array", "value": [1, 2]}],
  [{"name": "nums", "type": "array", "value": [0, 0, 0]}],
  [{"name": "nums", "type": "array", "value": [5, 4, 3, 2, 1]}],
  [{"name": "nums", "type": "array", "value": [1, 2, 3, 4, 5]}],
  [{"name": "nums", "type": "array", "value": [-1, -5, -3, -2, -4]}],
  [{"name": "nums", "type": "array", "value": [10000, -10000, 0]}],
  [{"name": "nums", "type": "array", "value": [3, 3, 3, 3]}],
  [{"name": "nums", "type": "array", "value": [9, 1, 8, 2, 7, 3, 6, 4, 5]}],
  [{"name": "nums", "type": "array", "value": [-2, -1, 0, 1, 2]}],
  [{"name": "nums", "type": "array", "value": [100, -50, 0, 50, -100]}],
  [{"name": "nums", "type": "array", "value": [7, 7, 1, 1, 9, 9]}],
  [{"name": "nums", "type": "array", "value": [4, 3, 2, 1, 0]}],
  [{"name": "nums", "type": "array", "value": [50, 20, 40, 10, 30]}],
  [{"name": "nums", "type": "array", "value": [1, -1, 2, -2, 3, -3]}],
  [{"name": "nums", "type": "array", "value": [8, 6, 4, 2, 9, 7, 5, 3, 1]}],
  [{"name": "nums", "type": "array", "value": [-10000, 10000, -5000, 5000]}],
  [{"name": "nums", "type": "array", "value": [6, 5, 4, 3, 2, 1, 0, -1]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Bubble Sort'), '[{"level": 1, "title": "Conceptual", "content": "Compare every pair of adjacent elements. If the left one is bigger than the right one, swap them. Repeating this enough times across the whole array eventually sorts it."}, {"level": 2, "title": "Strategy", "content": "Use a nested loop. The outer loop controls how many full passes you make; the inner loop compares and swaps adjacent pairs. After each full pass, the largest remaining unsorted element bubbles to its correct position at the end."}, {"level": 3, "title": "Implementation", "content": "for i from 0 to n-1: for j from 0 to n-i-2: if nums[j] > nums[j+1], swap them. After the loops finish, the array is sorted in place."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Bubble Sort'), 'java', 'bubbleSort', '[{"name": "nums", "type": "array"}]', 'array',
$$class Solution {
    public int[] bubbleSort(int[] nums) {
        // Write your solution here
        return nums;
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
            int[] result = sol.bubbleSort(nums);
            sb.append(Arrays.toString(result));
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int[] bubbleSort(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (nums[j] > nums[j + 1]) {
                    int temp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = temp;
                }
            }
        }
        return nums;
    }
}$$),

((SELECT id FROM problems WHERE title='Bubble Sort'), 'python', 'bubbleSort', '[{"name": "nums", "type": "array"}]', 'array',
$$class Solution:
    def bubbleSort(self, nums: list[int]) -> list[int]:
        # Write your solution here
        return nums
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
        result = sol.bubbleSort(nums)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def bubbleSort(self, nums: list[int]) -> list[int]:
        n = len(nums)
        for i in range(n):
            for j in range(n - i - 1):
                if nums[j] > nums[j + 1]:
                    nums[j], nums[j + 1] = nums[j + 1], nums[j]
        return nums
$$),

((SELECT id FROM problems WHERE title='Bubble Sort'), 'cpp', 'bubbleSort', '[{"name": "nums", "type": "array"}]', 'array',
$$class Solution {
public:
    vector<int> bubbleSort(vector<int>& nums) {
        // Write your solution here
        return nums;
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
        vector<int> result = sol.bubbleSort(nums);
        out << "[";
        for (int i = 0; i < (int)result.size(); i++) {
            out << result[i];
            if (i < (int)result.size() - 1) out << ", ";
        }
        out << "]" << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    vector<int> bubbleSort(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (nums[j] > nums[j + 1]) {
                    swap(nums[j], nums[j + 1]);
                }
            }
        }
        return nums;
    }
};$$);
