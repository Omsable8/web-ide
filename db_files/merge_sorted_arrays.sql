-- =========================================================
-- PROBLEM: Merge Sorted Arrays
-- Difficulty: Medium | Category: Two Pointers | Topic: Arrays
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Merge Sorted Arrays', 'Given two sorted integer arrays nums1 and nums2, merge them into a single array that is also sorted in ascending order, and return it.', 'Medium', 'Two Pointers', 'Arrays', '[{"input": "nums1 = [1, 3, 5], nums2 = [2, 4, 6]", "output": "[1, 2, 3, 4, 5, 6]"}]', '0 <= nums1.length, nums2.length <= 10^4, -10^4 <= nums1[i], nums2[i] <= 10^4', 'O(n+m)', 'O(n+m)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Merge Sorted Arrays'), false, '[
  [{"name": "nums1", "type": "array", "value": [1, 3, 5]}, {"name": "nums2", "type": "array", "value": [2, 4, 6]}],
  [{"name": "nums1", "type": "array", "value": [1, 2, 3]}, {"name": "nums2", "type": "array", "value": []}],
  [{"name": "nums1", "type": "array", "value": []}, {"name": "nums2", "type": "array", "value": [1, 2, 3]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Merge Sorted Arrays'), true, '[
  [{"name": "nums1", "type": "array", "value": []}, {"name": "nums2", "type": "array", "value": []}],
  [{"name": "nums1", "type": "array", "value": [1]}, {"name": "nums2", "type": "array", "value": [2]}],
  [{"name": "nums1", "type": "array", "value": [2]}, {"name": "nums2", "type": "array", "value": [1]}],
  [{"name": "nums1", "type": "array", "value": [1, 1, 1]}, {"name": "nums2", "type": "array", "value": [1, 1]}],
  [{"name": "nums1", "type": "array", "value": [-5, -3, -1]}, {"name": "nums2", "type": "array", "value": [-4, -2, 0]}],
  [{"name": "nums1", "type": "array", "value": [1, 5, 9]}, {"name": "nums2", "type": "array", "value": [2, 3, 4, 6, 7, 8]}],
  [{"name": "nums1", "type": "array", "value": [10000]}, {"name": "nums2", "type": "array", "value": [-10000]}],
  [{"name": "nums1", "type": "array", "value": [0, 0, 0]}, {"name": "nums2", "type": "array", "value": [0, 0]}],
  [{"name": "nums1", "type": "array", "value": [1, 3, 5, 7, 9]}, {"name": "nums2", "type": "array", "value": [1, 3, 5, 7, 9]}],
  [{"name": "nums1", "type": "array", "value": [-10, -5, 0]}, {"name": "nums2", "type": "array", "value": [-8, -3, 5]}],
  [{"name": "nums1", "type": "array", "value": [2, 4, 6, 8]}, {"name": "nums2", "type": "array", "value": [1, 3, 5, 7]}],
  [{"name": "nums1", "type": "array", "value": [100, 200]}, {"name": "nums2", "type": "array", "value": [150]}],
  [{"name": "nums1", "type": "array", "value": [5]}, {"name": "nums2", "type": "array", "value": [5]}],
  [{"name": "nums1", "type": "array", "value": [1, 2, 3, 4, 5]}, {"name": "nums2", "type": "array", "value": [6, 7, 8, 9, 10]}],
  [{"name": "nums1", "type": "array", "value": [6, 7, 8, 9, 10]}, {"name": "nums2", "type": "array", "value": [1, 2, 3, 4, 5]}],
  [{"name": "nums1", "type": "array", "value": [-1, 0, 1]}, {"name": "nums2", "type": "array", "value": [-1, 0, 1]}],
  [{"name": "nums1", "type": "array", "value": [3, 6, 9, 12]}, {"name": "nums2", "type": "array", "value": [1, 4, 7, 10]}],
  [{"name": "nums1", "type": "array", "value": [1000, -1000]}, {"name": "nums2", "type": "array", "value": [0]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Merge Sorted Arrays'), '[{"level": 1, "title": "Conceptual", "content": "Since both arrays are already sorted, you never need to look back once you have moved forward. At each step, the smaller of the two current front elements belongs next in the result."}, {"level": 2, "title": "Strategy", "content": "Use two pointers, one for each array, both starting at index 0. Compare the elements at both pointers, append the smaller one to the result, and advance that pointer. Repeat until one array is exhausted, then append the rest of the other."}, {"level": 3, "title": "Implementation", "content": "i = 0, j = 0. While i < nums1.length and j < nums2.length: compare nums1[i] and nums2[j], append the smaller, advance its pointer. After the loop, append any remaining elements from whichever array still has leftovers."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Merge Sorted Arrays'), 'java', 'mergeSortedArrays', '[{"name": "nums1", "type": "array"}, {"name": "nums2", "type": "array"}]', 'array',
$$class Solution {
    public int[] mergeSortedArrays(int[] nums1, int[] nums2) {
        // Write your solution here
        return new int[0];
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
            int n1 = Integer.parseInt(sc.nextLine().trim());
            int[] nums1 = new int[n1];
            if (n1 > 0) {
                String[] parts = sc.nextLine().trim().split("\\s+");
                for (int i = 0; i < n1; i++) nums1[i] = Integer.parseInt(parts[i]);
            } else {
                sc.nextLine();
            }
            int n2 = Integer.parseInt(sc.nextLine().trim());
            int[] nums2 = new int[n2];
            if (n2 > 0) {
                String[] parts = sc.nextLine().trim().split("\\s+");
                for (int i = 0; i < n2; i++) nums2[i] = Integer.parseInt(parts[i]);
            } else {
                sc.nextLine();
            }
            int[] result = sol.mergeSortedArrays(nums1, nums2);
            sb.append(Arrays.toString(result));
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int[] mergeSortedArrays(int[] nums1, int[] nums2) {
        int[] result = new int[nums1.length + nums2.length];
        int i = 0, j = 0, k = 0;
        while (i < nums1.length && j < nums2.length) {
            if (nums1[i] <= nums2[j]) {
                result[k++] = nums1[i++];
            } else {
                result[k++] = nums2[j++];
            }
        }
        while (i < nums1.length) result[k++] = nums1[i++];
        while (j < nums2.length) result[k++] = nums2[j++];
        return result;
    }
}$$),

((SELECT id FROM problems WHERE title='Merge Sorted Arrays'), 'python', 'mergeSortedArrays', '[{"name": "nums1", "type": "array"}, {"name": "nums2", "type": "array"}]', 'array',
$$class Solution:
    def mergeSortedArrays(self, nums1: list[int], nums2: list[int]) -> list[int]:
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
        n1 = int(data[idx].strip()); idx += 1
        if n1 > 0:
            nums1 = list(map(int, data[idx].strip().split())); idx += 1
        else:
            nums1 = []
            idx += 1
        n2 = int(data[idx].strip()); idx += 1
        if n2 > 0:
            nums2 = list(map(int, data[idx].strip().split())); idx += 1
        else:
            nums2 = []
            idx += 1
        result = sol.mergeSortedArrays(nums1, nums2)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def mergeSortedArrays(self, nums1: list[int], nums2: list[int]) -> list[int]:
        result = []
        i, j = 0, 0
        while i < len(nums1) and j < len(nums2):
            if nums1[i] <= nums2[j]:
                result.append(nums1[i])
                i += 1
            else:
                result.append(nums2[j])
                j += 1
        result.extend(nums1[i:])
        result.extend(nums2[j:])
        return result
$$),

((SELECT id FROM problems WHERE title='Merge Sorted Arrays'), 'cpp', 'mergeSortedArrays', '[{"name": "nums1", "type": "array"}, {"name": "nums2", "type": "array"}]', 'array',
$$class Solution {
public:
    vector<int> mergeSortedArrays(vector<int>& nums1, vector<int>& nums2) {
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
        int n1;
        cin >> n1;
        vector<int> nums1(n1);
        for (int i = 0; i < n1; i++) cin >> nums1[i];
        int n2;
        cin >> n2;
        vector<int> nums2(n2);
        for (int i = 0; i < n2; i++) cin >> nums2[i];
        vector<int> result = sol.mergeSortedArrays(nums1, nums2);
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
    vector<int> mergeSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> result;
        int i = 0, j = 0;
        while (i < (int)nums1.size() && j < (int)nums2.size()) {
            if (nums1[i] <= nums2[j]) result.push_back(nums1[i++]);
            else result.push_back(nums2[j++]);
        }
        while (i < (int)nums1.size()) result.push_back(nums1[i++]);
        while (j < (int)nums2.size()) result.push_back(nums2[j++]);
        return result;
    }
};$$);
