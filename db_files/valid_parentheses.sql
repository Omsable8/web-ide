-- =========================================================
-- PROBLEM: Valid Parentheses
-- Difficulty: Easy | Category: Stacks | Topic: Matching
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Valid Parentheses', 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid. A string is valid if every opening bracket has a matching closing bracket of the same type, and brackets close in the correct order.', 'Easy', 'Stacks', 'Matching', '[{"input": "s = \"()[]{}\"", "output": "true"}]', '1 <= s.length <= 10^4, s consists only of bracket characters ()[]{}', 'O(n)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Valid Parentheses'), false, '[
  [{"name": "s", "type": "string", "value": "()"}],
  [{"name": "s", "type": "string", "value": "()[]{}"}],
  [{"name": "s", "type": "string", "value": "(]"}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Valid Parentheses'), true, '[
  [{"name": "s", "type": "string", "value": "["}],
  [{"name": "s", "type": "string", "value": "]"}],
  [{"name": "s", "type": "string", "value": "{[]}"}],
  [{"name": "s", "type": "string", "value": "([)]"}],
  [{"name": "s", "type": "string", "value": "{[()]}"}],
  [{"name": "s", "type": "string", "value": "((("}],
  [{"name": "s", "type": "string", "value": ")))"}],
  [{"name": "s", "type": "string", "value": "(("}],
  [{"name": "s", "type": "string", "value": "))"}],
  [{"name": "s", "type": "string", "value": "(){}[]"}],
  [{"name": "s", "type": "string", "value": "{[}]"}],
  [{"name": "s", "type": "string", "value": "{{[[(())]]}}"}],
  [{"name": "s", "type": "string", "value": "(}"}],
  [{"name": "s", "type": "string", "value": "[{()}]"}],
  [{"name": "s", "type": "string", "value": "[(])"}],
  [{"name": "s", "type": "string", "value": "((()))"}],
  [{"name": "s", "type": "string", "value": "[[{{(())}}]]"}],
  [{"name": "s", "type": "string", "value": "((((()))))"}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Valid Parentheses'), '[{"level": 1, "title": "Conceptual", "content": "The most recently opened bracket must be the next one to close. This last-in-first-out behavior maps directly to a data structure you may already know."}, {"level": 2, "title": "Strategy", "content": "Use a stack. Push opening brackets onto the stack. When you see a closing bracket, check if it matches the bracket on top of the stack; if so, pop it. If not, or the stack is empty, the string is invalid."}, {"level": 3, "title": "Implementation", "content": "Map each closing bracket to its opening counterpart. For each char: if it is an opener, push it. If it is a closer, check stack.isEmpty() or stack.pop() != matching opener -> return false. At the end, return stack.isEmpty()."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Valid Parentheses'), 'java', 'isValid', '[{"name": "s", "type": "string"}]', 'boolean',
$$class Solution {
    public boolean isValid(String s) {
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
            String s = sc.nextLine();
            boolean result = sol.isValid(s);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        Map<Character, Character> pairs = new HashMap<>();
        pairs.put(')', '(');
        pairs.put(']', '[');
        pairs.put('}', '{');
        for (char c : s.toCharArray()) {
            if (pairs.containsValue(c)) {
                stack.push(c);
            } else if (pairs.containsKey(c)) {
                if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;
            }
        }
        return stack.isEmpty();
    }
}$$),

((SELECT id FROM problems WHERE title='Valid Parentheses'), 'python', 'isValid', '[{"name": "s", "type": "string"}]', 'boolean',
$$class Solution:
    def isValid(self, s: str) -> bool:
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
        s = data[idx]; idx += 1
        result = sol.isValid(s)
        output.append(str(result).lower())
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {')': '(', ']': '[', '}': '{'}
        for c in s:
            if c in pairs.values():
                stack.append(c)
            elif c in pairs:
                if not stack or stack.pop() != pairs[c]:
                    return False
        return len(stack) == 0
$$),

((SELECT id FROM problems WHERE title='Valid Parentheses'), 'cpp', 'isValid', '[{"name": "s", "type": "string"}]', 'boolean',
$$class Solution {
public:
    bool isValid(string s) {
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
    cin.ignore();
    Solution sol;
    ostringstream out;
    for (int tc = 0; tc < t; tc++) {
        string s;
        getline(cin, s);
        bool result = sol.isValid(s);
        out << (result ? "true" : "false") << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') {
                st.push(c);
            } else if (pairs.count(c)) {
                if (st.empty() || st.top() != pairs[c]) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};$$);
