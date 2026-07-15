
-- =========================================================
-- PROBLEM: Reverse an Array
-- Difficulty: Easy | Category: Arrays | Topic: Two Pointers
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Reverse an Array', 'Given an array of N integers, reverse the array in-place and return it.', 'Easy', 'Arrays', 'Two Pointers', '[{"input": "arr = [1, 2, 3, 4, 5]", "output": "[5, 4, 3, 2, 1]"}]', '1 <= arr.length <= 10^4, -10^4 <= arr[i] <= 10^4', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse an Array'), false, '[
  [{"name": "arr", "type": "array", "value": [1, 2, 3, 4, 5]}],
  [{"name": "arr", "type": "array", "value": [10, 20]}],
  [{"name": "arr", "type": "array", "value": [7]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Reverse an Array'), true, '[
  [{"name": "arr", "type": "array", "value": [1, 2]}],
  [{"name": "arr", "type": "array", "value": [5, 4, 3, 2, 1]}],
  [{"name": "arr", "type": "array", "value": [0, 0, 0]}],
  [{"name": "arr", "type": "array", "value": [-1, -2, -3, -4]}],
  [{"name": "arr", "type": "array", "value": [10000, -10000]}],
  [{"name": "arr", "type": "array", "value": [3, 3, 3, 3]}],
  [{"name": "arr", "type": "array", "value": [1, 2, 3]}],
  [{"name": "arr", "type": "array", "value": [0, 1, 0]}],
  [{"name": "arr", "type": "array", "value": [100, 200, 300, 400, 500, 600]}],
  [{"name": "arr", "type": "array", "value": [-5, 0, 5]}],
  [{"name": "arr", "type": "array", "value": [1, 1, 2, 2]}],
  [{"name": "arr", "type": "array", "value": [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]}],
  [{"name": "arr", "type": "array", "value": [-10000, 0, 10000]}],
  [{"name": "arr", "type": "array", "value": [42]}],
  [{"name": "arr", "type": "array", "value": [1, -1, 1, -1, 1]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse an Array'), '[{"level": 1, "title": "Conceptual", "content": "Think about what reversing means for two elements at opposite ends of the array. What should happen to the first and last element?"}, {"level": 2, "title": "Strategy", "content": "Use two pointers, one starting at the beginning (left = 0) and one at the end (right = length - 1). Swap them and move toward the center."}, {"level": 3, "title": "Implementation", "content": "Use a while loop: while (left < right). Swap arr[left] and arr[right] using a temp variable, then do left++ and right--."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Reverse an Array'), 'java', 'reverse', '[{"name": "arr", "type": "array"}]', 'array',

-- ---------- JAVA ----------
$$class Solution {
    public int[] reverse(int[] arr) {
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
            int[] arr = new int[n];
            if (n > 0) {
                String[] parts = sc.nextLine().trim().split("\\s+");
                for (int i = 0; i < n; i++) {
                    arr[i] = Integer.parseInt(parts[i]);
                }
            } else {
                sc.nextLine();
            }

            int[] result = sol.reverse(arr);
            sb.append(Arrays.toString(result));
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,

$$class Solution {
    public int[] reverse(int[] arr) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
        return arr;
    }
}$$),

-- ---------- PYTHON ----------
((SELECT id FROM problems WHERE title='Reverse an Array'), 'python', 'reverse', '[{"name": "arr", "type": "array"}]', 'array',

$$class Solution:
    def reverse(self, arr: list[int]) -> list[int]:
        # Write your solution here
        pass $$,

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

        result = sol.reverse(arr)
        output.append(str(result))
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def reverse(self, arr: list[int]) -> list[int]:
        left, right = 0, len(arr) - 1
        while left < right:
            arr[left], arr[right] = arr[right], arr[left]
            left += 1
            right -= 1
        return arr$$),


-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='Reverse an Array'), 'cpp', 'reverse', '[{"name": "arr", "type": "array"}]', 'array',

$$class Solution {
public:
    vector<int> reverse(vector<int>& arr) {
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

        vector<int> result = sol.reverse(arr);

        out << "[";
        for (int i = 0; i < (int)result.size(); i++) {
            out << result[i];
            if (i < (int)result.size() - 1) out << ", ";
        }
        out << "]";
        out << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    vector<int> reverse(vector<int>& arr) {
        int left = 0, right = arr.size() - 1;
        while (left < right) {
            swap(arr[left], arr[right]);
            left++;
            right--;
        }
        return arr;
    }
}; $$);