-- =========================================================
-- PROBLEM: Find the Missing Number
-- Difficulty: Easy | Category: Arrays | Topic: Math
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Find the Missing Number', 'Given an array containing N distinct numbers taken from the range 0 to N (inclusive), find the one number that is missing from the array.', 
'Easy', 'Arrays', 'Math', '[{"input": "arr = [3, 0, 1]", "output": "2"}]', '1 <= arr.length <= 10^4, 0 <= arr[i] <= arr.length, all values are distinct', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Find the Missing Number'), false, '[
  [{"name": "arr", "type": "array", "value": [3, 0, 1]}],
  [{"name": "arr", "type": "array", "value": [0, 1]}],
  [{"name": "arr", "type": "array", "value": [9, 6, 4, 2, 3, 5, 7, 0, 1]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Find the Missing Number'), true, '[
  [{"name": "arr", "type": "array", "value": [1]}],
  [{"name": "arr", "type": "array", "value": [0]}],
  [{"name": "arr", "type": "array", "value": [1, 0]}],
  [{"name": "arr", "type": "array", "value": [2, 0]}],
  [{"name": "arr", "type": "array", "value": [0, 2]}],
  [{"name": "arr", "type": "array", "value": [3, 1, 0]}],
  [{"name": "arr", "type": "array", "value": [1, 2, 3]}],
  [{"name": "arr", "type": "array", "value": [0, 1, 2]}],
  [{"name": "arr", "type": "array", "value": [5, 3, 1, 4, 0]}],
  [{"name": "arr", "type": "array", "value": [4, 0, 2, 1]}],
  [{"name": "arr", "type": "array", "value": [8, 7, 6, 5, 4, 3, 2, 0]}],
  [{"name": "arr", "type": "array", "value": [0, 1, 2, 3, 4, 5, 6, 8]}],
  [{"name": "arr", "type": "array", "value": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]}],
  [{"name": "arr", "type": "array", "value": [6, 1, 4, 0, 2, 3, 5]}],
  [{"name": "arr", "type": "array", "value": [2, 3, 1, 5, 4, 6, 0, 7]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Find the Missing Number'), 
'[{"level": 1, "title": "Conceptual", "content": "If N numbers (0 to N) were all present, what would their sum be? There is a well-known formula for the sum of the first N natural numbers."}, 
{"level": 2, "title": "Strategy", "content": "Compute the expected total sum using the formula n * (n + 1) / 2, where n is the length of the array. Then subtract the actual sum of the array elements."}, 
{"level": 3, "title": "Implementation", "content": "expected_sum = n * (n + 1) / 2. actual_sum = sum of all elements in arr. The missing number is expected_sum - actual_sum."}]'::jsonb);


-- ---------- JAVA ----------
INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES 
((SELECT id FROM problems WHERE title='Find the Missing Number'), 'java', 'findMissingNumber', '[{"name": "arr", "type": "array"}]', 'int', 
$$class Solution {
    public int findMissingNumber(int[] arr) {
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
            int[] arr = new int[n];
            if (n > 0) {
                String[] parts = sc.nextLine().trim().split("\\s+");
                for (int i = 0; i < n; i++) {
                    arr[i] = Integer.parseInt(parts[i]);
                }
            } else {
                sc.nextLine();
            }

            int result = sol.findMissingNumber(arr);
            sb.append(result);
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,

$$class Solution {
    public int findMissingNumber(int[] arr) {
        int n = arr.length;
        long expectedSum = (long) n * (n + 1) / 2;
        long actualSum = 0;
        for (int num : arr) {
            actualSum += num;
        }
        return (int) (expectedSum - actualSum);
    }
}$$),

-- ---------- PYTHON ----------
((SELECT id FROM problems WHERE title='Find the Missing Number'), 'python', 'findMissingNumber', '[{"name": "arr", "type": "array"}]', 'int', 
$$class Solution:
    def findMissingNumber(self, arr: list[int]) -> int:
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
            arr = list(map(int, data[idx].strip().split())); idx += 1
        else:
            arr = []
            idx += 1

        result = sol.findMissingNumber(arr)
        output.append(str(result))
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def findMissingNumber(self, arr: list[int]) -> int:
        n = len(arr)
        expected_sum = n * (n + 1) // 2
        actual_sum = sum(arr)
        return expected_sum - actual_sum$$),

-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='Find the Missing Number'), 'cpp', 'findMissingNumber', '[{"name": "arr", "type": "array"}]', 'int', 
$$class Solution {
public:
    int findMissingNumber(vector<int>& arr) {
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
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];

        int result = sol.findMissingNumber(arr);
        out << result << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    int findMissingNumber(vector<int>& arr) {
        long long n = arr.size();
        long long expectedSum = n * (n + 1) / 2;
        long long actualSum = 0;
        for (int num : arr) actualSum += num;
        return (int)(expectedSum - actualSum);
    }
};
$$);