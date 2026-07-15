-- =========================================================
-- PROBLEM: Reverse a Stack
-- Difficulty: Medium | Category: Stacks | Topic: Recursion
-- NOTE: stack passed/returned as plain array, bottom at index 0, top at end
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Reverse a Stack', 'Given a stack of integers represented as an array (where the last element is the top of the stack), reverse the stack using only stack operations (push and pop) without using any other data structure like an array, list, or queue to copy elements. Return the reversed stack as an array.', 'Medium', 'Stacks', 'Recursion', '[{"input": "stack = [1, 2, 3, 4]", "output": "[4, 3, 2, 1]"}]', '0 <= stack.length <= 10^3, -10^4 <= stack[i] <= 10^4', 'O(n^2)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse a Stack'), false, '[
  [{"name": "stack", "type": "array", "value": [1, 2, 3, 4]}],
  [{"name": "stack", "type": "array", "value": [5]}],
  [{"name": "stack", "type": "array", "value": []}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Reverse a Stack'), true, '[
  [{"name": "stack", "type": "array", "value": [1, 2]}],
  [{"name": "stack", "type": "array", "value": [2, 1]}],
  [{"name": "stack", "type": "array", "value": [0, 0, 0]}],
  [{"name": "stack", "type": "array", "value": [-1, -2, -3]}],
  [{"name": "stack", "type": "array", "value": [10, 20, 30, 40, 50]}],
  [{"name": "stack", "type": "array", "value": [1, 1, 1, 1]}],
  [{"name": "stack", "type": "array", "value": [10000, -10000]}],
  [{"name": "stack", "type": "array", "value": [5, 4, 3, 2, 1]}],
  [{"name": "stack", "type": "array", "value": [1, 2, 3, 4, 5, 6, 7]}],
  [{"name": "stack", "type": "array", "value": [-5, 0, 5]}],
  [{"name": "stack", "type": "array", "value": [3, -3, 3, -3]}],
  [{"name": "stack", "type": "array", "value": [9, 8, 7, 6, 5, 4, 3, 2, 1]}],
  [{"name": "stack", "type": "array", "value": [100]}],
  [{"name": "stack", "type": "array", "value": [-100, 100]}],
  [{"name": "stack", "type": "array", "value": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}],
  [{"name": "stack", "type": "array", "value": [7, 7, 8, 8, 9, 9]}],
  [{"name": "stack", "type": "array", "value": [0]}],
  [{"name": "stack", "type": "array", "value": [4, 3, 2, 1, 0, -1]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse a Stack'), '[{"level": 1, "title": "Conceptual", "content": "Recursion gives you an implicit call stack you can use as extra storage, without needing an explicit second data structure. Think about removing the bottom element and reinserting it at the top after reversing the rest."}, {"level": 2, "title": "Strategy", "content": "Write a helper function that pops the top element, recursively reverses the remaining stack, and then inserts the popped element at the very bottom of the now-reversed stack."}, {"level": 3, "title": "Implementation", "content": "reverseStack(stack): if stack is empty, return. Pop top into temp. Recursively call reverseStack(stack). Then call insertAtBottom(stack, temp), which itself recursively pops everything, pushes temp first, then pushes everything back."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Reverse a Stack'), 'java', 'reverseStack', '[{"name": "stack", "type": "array"}]', 'array',
$$class Solution {
    public int[] reverseStack(int[] stack) {
        // Write your solution here
        return stack;
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
            int[] stack = new int[n];
            if (n > 0) {
                String[] parts = sc.nextLine().trim().split("\\s+");
                for (int i = 0; i < n; i++) stack[i] = Integer.parseInt(parts[i]);
            } else {
                sc.nextLine();
            }
            int[] result = sol.reverseStack(stack);
            sb.append(Arrays.toString(result));
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int[] reverseStack(int[] stack) {
        Deque<Integer> st = new ArrayDeque<>();
        for (int x : stack) st.push(x);
        reverse(st);
        int[] result = new int[stack.length];
        for (int i = 0; i < stack.length; i++) {
            result[i] = st.pollLast();
        }
        return result;
    }

    private void reverse(Deque<Integer> st) {
        if (st.isEmpty()) return;
        int top = st.pop();
        reverse(st);
        insertAtBottom(st, top);
    }

    private void insertAtBottom(Deque<Integer> st, int item) {
        if (st.isEmpty()) {
            st.push(item);
            return;
        }
        int top = st.pop();
        insertAtBottom(st, item);
        st.push(top);
    }
}$$),

((SELECT id FROM problems WHERE title='Reverse a Stack'), 'python', 'reverseStack', '[{"name": "stack", "type": "array"}]', 'array',
$$class Solution:
    def reverseStack(self, stack: list[int]) -> list[int]:
        # Write your solution here
        return stack
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
            stack = list(map(int, data[idx].strip().split())); idx += 1
        else:
            stack = []
            idx += 1
        result = sol.reverseStack(stack)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def insertAtBottom(self, stack: list[int], item: int) -> None:
        if not stack:
            stack.append(item)
            return
        top = stack.pop()
        self.insertAtBottom(stack, item)
        stack.append(top)

    def reverseHelper(self, stack: list[int]) -> None:
        if not stack:
            return
        top = stack.pop()
        self.reverseHelper(stack)
        self.insertAtBottom(stack, top)

    def reverseStack(self, stack: list[int]) -> list[int]:
        self.reverseHelper(stack)
        return stack
$$),

((SELECT id FROM problems WHERE title='Reverse a Stack'), 'cpp', 'reverseStack', '[{"name": "stack", "type": "array"}]', 'array',
$$class Solution {
public:
    vector<int> reverseStack(vector<int>& stack) {
        // Write your solution here
        return stack;
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
        vector<int> stack(n);
        for (int i = 0; i < n; i++) cin >> stack[i];
        vector<int> result = sol.reverseStack(stack);
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
    void insertAtBottom(vector<int>& stack, int item) {
        if (stack.empty()) {
            stack.push_back(item);
            return;
        }
        int top = stack.back();
        stack.pop_back();
        insertAtBottom(stack, item);
        stack.push_back(top);
    }

    void reverseHelper(vector<int>& stack) {
        if (stack.empty()) return;
        int top = stack.back();
        stack.pop_back();
        reverseHelper(stack);
        insertAtBottom(stack, top);
    }

    vector<int> reverseStack(vector<int>& stack) {
        reverseHelper(stack);
        return stack;
    }
};$$);
