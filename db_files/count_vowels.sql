-- =========================================================
-- PROBLEM: Count Vowels
-- Difficulty: Easy | Category: Strings | Topic: Traversal
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Count Vowels', 
'Given a string s, return the number of vowels (a, e, i, o, u) present in the string. Treat both uppercase and lowercase vowels as valid.', 
'Easy', 'Strings', 'Traversal', 
'[{"input": "s = \"Hello World\"", "output": "3"}]', 
'1 <= s.length <= 10^4, s consists of printable ASCII characters', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Count Vowels'), false, '[
  [{"name": "s", "type": "string", "value": "Hello World"}],
  [{"name": "s", "type": "string", "value": "xyz"}],
  [{"name": "s", "type": "string", "value": "AEIOU"}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Count Vowels'), true, '[
  [{"name": "s", "type": "string", "value": "a"}],
  [{"name": "s", "type": "string", "value": "b"}],
  [{"name": "s", "type": "string", "value": "aeiou"}],
  [{"name": "s", "type": "string", "value": "AaEeIiOoUu"}],
  [{"name": "s", "type": "string", "value": "bcdfg"}],
  [{"name": "s", "type": "string", "value": "Programming"}],
  [{"name": "s", "type": "string", "value": "Education"}],
  [{"name": "s", "type": "string", "value": "12345"}],
  [{"name": "s", "type": "string", "value": "MapleIDE"}],
  [{"name": "s", "type": "string", "value": "Quick Brown Fox"}],
  [{"name": "s", "type": "string", "value": "Z"}],
  [{"name": "s", "type": "string", "value": "AEIOUaeiou12345"}],
  [{"name": "s", "type": "string", "value": "Sphinx of black quartz"}],
  [{"name": "s", "type": "string", "value": "y"}],
  [{"name": "s", "type": "string", "value": "Algorithm Engineering"}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Count Vowels'), '[{"level": 1, "title": "Conceptual", "content": "There are only 5 vowel letters (a, e, i, o, u), but remember the string can contain both uppercase and lowercase versions of these letters."}, {"level": 2, "title": "Strategy", "content": "Iterate through every character in the string. For each character, check if it matches any of the vowels (consider converting to lowercase first to simplify the comparison)."}, {"level": 3, "title": "Implementation", "content": "Create a set or string containing \"aeiouAEIOU\". For each character c in s, if the set contains c, increment a counter. Return the counter at the end."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
-- ---------- JAVA ----------
((SELECT id FROM problems WHERE title='Count Vowels'), 'java', 'countVowels', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution {
    public int countVowels(String s) {
        // Write your solution here
        return 0;
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

            int result = sol.countVowels(s);
            sb.append(result);
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,

$$class Solution {
    public int countVowels(String s) {
        String vowels = "aeiouAEIOU";
        int count = 0;
        for (char c : s.toCharArray()) {
            if (vowels.indexOf(c) != -1) {
                count++;
            }
        }
        return count;
    }
}$$),

-- ---------- PYTHON ----------
((SELECT id FROM problems WHERE title='Count Vowels'), 'python', 'countVowels', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution:
    def countVowels(self, s: str) -> int:
        # Write your solution here
        return 0
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

        result = sol.countVowels(s)
        output.append(str(result))
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def countVowels(self, s: str) -> int:
        vowels = set("aeiouAEIOU")
        count = 0
        for c in s:
            if c in vowels:
                count += 1
        return count
$$),

-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='Count Vowels'), 'cpp', 'countVowels', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution {
public:
    int countVowels(string s) {
        // Write your solution here
        return 0;
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

        int result = sol.countVowels(s);
        out << result << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    int countVowels(string s) {
        string vowels = "aeiouAEIOU";
        int count = 0;
        for (char c : s) {
            if (vowels.find(c) != string::npos) {
                count++;
            }
        }
        return count;
    }
};$$);
