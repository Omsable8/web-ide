-- =========================================================
-- PROBLEM: Check Palindrome
-- Difficulty: Easy | Category: Strings | Topic: Two Pointers
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Check Palindrome', 
'Given a string s, determine if it is a palindrome. A palindrome reads the same forward and backward. Return true if it is a palindrome, false otherwise. Comparison is case-sensitive and considers all characters including spaces and punctuation.', 
'Easy', 'Strings', 'Two Pointers', 
'[{"input": "s = \"racecar\"", "output": "true"}]', 
'1 <= s.length <= 10^4, s consists of printable ASCII characters', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Check Palindrome'), false, '[
  [{"name": "s", "type": "string", "value": "racecar"}],
  [{"name": "s", "type": "string", "value": "hello"}],
  [{"name": "s", "type": "string", "value": "a"}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Check Palindrome'), true, '[
  [{"name": "s", "type": "string", "value": "noon"}],
  [{"name": "s", "type": "string", "value": "abc"}],
  [{"name": "s", "type": "string", "value": "aa"}],
  [{"name": "s", "type": "string", "value": "ab"}],
  [{"name": "s", "type": "string", "value": "aba"}],
  [{"name": "s", "type": "string", "value": "abca"}],
  [{"name": "s", "type": "string", "value": "Z"}],
  [{"name": "s", "type": "string", "value": "deified"}],
  [{"name": "s", "type": "string", "value": "level"}],
  [{"name": "s", "type": "string", "value": "world"}],
  [{"name": "s", "type": "string", "value": "12321"}],
  [{"name": "s", "type": "string", "value": "12345"}],
  [{"name": "s", "type": "string", "value": "Racecar"}],
  [{"name": "s", "type": "string", "value": "madamimadam"}],
  [{"name": "s", "type": "string", "value": "abcdefggfedcba"}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Check Palindrome'), '[{"level": 1, "title": "Conceptual", "content": "A palindrome reads the same from the front and from the back. If you compare characters from both ends moving inward, they should all match."}, {"level": 2, "title": "Strategy", "content": "Use two pointers, one at the start (left = 0) and one at the end (right = length - 1). Compare characters at both pointers, then move them toward the center."}, {"level": 3, "title": "Implementation", "content": "while (left < right): if s[left] != s[right], return false immediately. Otherwise left++ and right--. If the loop finishes without mismatches, return true."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
-- ---------- JAVA ----------
((SELECT id FROM problems WHERE title='Check Palindrome'), 'java', 'isPalindrome', '[{"name": "s", "type": "string"}]', 'boolean',
$$class Solution {
    public boolean isPalindrome(String s) {
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

            boolean result = sol.isPalindrome(s);
            sb.append(result);
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,

$$class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}$$),

-- ---------- PYTHON ----------
((SELECT id FROM problems WHERE title='Check Palindrome'), 'python', 'isPalindrome', '[{"name": "s", "type": "string"}]', 'boolean',
$$class Solution:
    def isPalindrome(self, s: str) -> bool:
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

        result = sol.isPalindrome(s)
        output.append(str(result).lower())
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1
        while left < right:
            if s[left] != s[right]:
                return False
            left += 1
            right -= 1
        return True
$$),

-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='Check Palindrome'), 'cpp', 'isPalindrome', '[{"name": "s", "type": "string"}]', 'boolean',
$$class Solution {
public:
    bool isPalindrome(string s) {
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

        bool result = sol.isPalindrome(s);
        out << (result ? "true" : "false") << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = (int)s.size() - 1;
        while (left < right) {
            if (s[left] != s[right]) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
};$$);
