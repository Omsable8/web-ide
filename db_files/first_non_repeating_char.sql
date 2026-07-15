-- =========================================================
-- PROBLEM: First Non-Repeating Character
-- Difficulty: Easy | Category: Hashmaps | Topic: Strings
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('First Non-Repeating Character', 
'Given a string s, find the first character that does not repeat anywhere else in the string and return its index. If no such character exists, return -1.', 
'Easy', 'Hashmaps', 'Strings', 
'[{"input": "s = \"leetcode\"", "output": "0"}]', 
'1 <= s.length <= 10^4, s consists of lowercase English letters', 'O(n)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'First Non-Repeating Character'), false, '[
  [{"name": "s", "type": "string", "value": "leetcode"}],
  [{"name": "s", "type": "string", "value": "aabb"}],
  [{"name": "s", "type": "string", "value": "z"}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'First Non-Repeating Character'), true, '[
  [{"name": "s", "type": "string", "value": "a"}],
  [{"name": "s", "type": "string", "value": "aa"}],
  [{"name": "s", "type": "string", "value": "ab"}],
  [{"name": "s", "type": "string", "value": "abab"}],
  [{"name": "s", "type": "string", "value": "abcabcd"}],
  [{"name": "s", "type": "string", "value": "loveleetcode"}],
  [{"name": "s", "type": "string", "value": "aabbccd"}],
  [{"name": "s", "type": "string", "value": "aabbccdd"}],
  [{"name": "s", "type": "string", "value": "xxyyzz"}],
  [{"name": "s", "type": "string", "value": "xxyyzzq"}],
  [{"name": "s", "type": "string", "value": "swiss"}],
  [{"name": "s", "type": "string", "value": "programming"}],
  [{"name": "s", "type": "string", "value": "teeter"}],
  [{"name": "s", "type": "string", "value": "alphabet"}],
  [{"name": "s", "type": "string", "value": "mississippi"}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'First Non-Repeating Character'), '[{"level": 1, "title": "Conceptual", "content": "You need two pieces of information: how many times each character appears, and the order in which characters first appear. A single pass cannot give you both at once."}, {"level": 2, "title": "Strategy", "content": "Make two passes over the string. First pass: build a frequency map of every character. Second pass: go through the string again and return the index of the first character whose frequency is exactly 1."}, {"level": 3, "title": "Implementation", "content": "Build counts using a hashmap in the first loop. In the second loop, for i from 0 to length-1, if counts[s[i]] == 1, return i. If the loop finishes without returning, return -1."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
-- ---------- JAVA ----------
((SELECT id FROM problems WHERE title='First Non-Repeating Character'), 'java', 'firstUniqChar', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution {
    public int firstUniqChar(String s) {
        // Write your solution here
        return -1;
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

            int result = sol.firstUniqChar(s);
            sb.append(result);
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,

$$class Solution {
    public int firstUniqChar(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
        for (int i = 0; i < s.length(); i++) {
            if (counts.get(s.charAt(i)) == 1) {
                return i;
            }
        }
        return -1;
    }
}$$),

-- ---------- PYTHON ----------
((SELECT id FROM problems WHERE title='First Non-Repeating Character'), 'python', 'firstUniqChar', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution:
    def firstUniqChar(self, s: str) -> int:
        # Write your solution here
        return -1
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

        result = sol.firstUniqChar(s)
        output.append(str(result))
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def firstUniqChar(self, s: str) -> int:
        counts = {}
        for c in s:
            counts[c] = counts.get(c, 0) + 1
        for i, c in enumerate(s):
            if counts[c] == 1:
                return i
        return -1
$$),

-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='First Non-Repeating Character'), 'cpp', 'firstUniqChar', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution {
public:
    int firstUniqChar(string s) {
        // Write your solution here
        return -1;
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

        int result = sol.firstUniqChar(s);
        out << result << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    int firstUniqChar(string s) {
        unordered_map<char, int> counts;
        for (char c : s) {
            counts[c]++;
        }
        for (int i = 0; i < (int)s.size(); i++) {
            if (counts[s[i]] == 1) {
                return i;
            }
        }
        return -1;
    }
};$$);
