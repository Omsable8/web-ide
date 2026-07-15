-- =========================================================
-- PROBLEM: Longest Common Prefix
-- Difficulty: Medium | Category: Strings | Topic: Strings
-- NOTE: array of strings passed as type "array" with string values
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Longest Common Prefix', 'Given an array of strings strs, return the longest common prefix string amongst all strings in the array. If there is no common prefix, return an empty string.', 'Medium', 'Strings', 'Strings', '[{"input": "strs = [\"flower\", \"flow\", \"flight\"]", "output": "fl"}]', '1 <= strs.length <= 200, 0 <= strs[i].length <= 200, strs[i] consists of lowercase English letters', 'O(n*m)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Longest Common Prefix'), false, '[
  [{"name": "strs", "type": "array", "value": ["flower", "flow", "flight"]}],
  [{"name": "strs", "type": "array", "value": ["dog", "racecar", "car"]}],
  [{"name": "strs", "type": "array", "value": ["single"]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Longest Common Prefix'), true, '[
  [{"name": "strs", "type": "array", "value": ["a"]}],
  [{"name": "strs", "type": "array", "value": ["a", "a"]}],
  [{"name": "strs", "type": "array", "value": ["a", "b"]}],
  [{"name": "strs", "type": "array", "value": ["ab", "a"]}],
  [{"name": "strs", "type": "array", "value": ["abc", "abc", "abc"]}],
  [{"name": "strs", "type": "array", "value": ["interview", "internet", "internal"]}],
  [{"name": "strs", "type": "array", "value": ["prefix", "pre", "press"]}],
  [{"name": "strs", "type": "array", "value": ["", "abc"]}],
  [{"name": "strs", "type": "array", "value": ["abc", ""]}],
  [{"name": "strs", "type": "array", "value": ["coding", "code", "coder"]}],
  [{"name": "strs", "type": "array", "value": ["xyz", "xy", "x"]}],
  [{"name": "strs", "type": "array", "value": ["throne", "throne"]}],
  [{"name": "strs", "type": "array", "value": ["throne", "dungeon"]}],
  [{"name": "strs", "type": "array", "value": ["aa", "a"]}],
  [{"name": "strs", "type": "array", "value": ["abcdef", "abcxyz", "abcmno"]}],
  [{"name": "strs", "type": "array", "value": ["test", "testing", "tester"]}],
  [{"name": "strs", "type": "array", "value": ["maple", "mapleide", "maples"]}],
  [{"name": "strs", "type": "array", "value": ["apple", "app", "application"]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Longest Common Prefix'), '[{"level": 1, "title": "Conceptual", "content": "The common prefix can never be longer than the shortest string in the array. Start there as your upper bound."}, {"level": 2, "title": "Strategy", "content": "Take the first string as your candidate prefix. Compare it character by character against every other string, shrinking the candidate prefix whenever a mismatch is found."}, {"level": 3, "title": "Implementation", "content": "Let prefix = strs[0]. For each subsequent string s, while s does not start with prefix, remove the last character from prefix. If prefix becomes empty, return \"\" immediately."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Longest Common Prefix'), 'java', 'longestCommonPrefix', '[{"name": "strs", "type": "array"}]', 'string',
$$class Solution {
    public String longestCommonPrefix(String[] strs) {
        // Write your solution here
        return "";
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
            String[] strs = new String[n];
            for (int i = 0; i < n; i++) {
                strs[i] = sc.nextLine();
            }
            String result = sol.longestCommonPrefix(strs);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public String longestCommonPrefix(String[] strs) {
        String prefix = strs[0];
        for (int i = 1; i < strs.length; i++) {
            while (!strs[i].startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length() - 1);
                if (prefix.isEmpty()) return "";
            }
        }
        return prefix;
    }
}$$),

((SELECT id FROM problems WHERE title='Longest Common Prefix'), 'python', 'longestCommonPrefix', '[{"name": "strs", "type": "array"}]', 'string',
$$class Solution:
    def longestCommonPrefix(self, strs: list[str]) -> str:
        # Write your solution here
        return ""
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
        strs = []
        for _ in range(n):
            strs = data[idx].split(' ')
        idx += 1
        result = sol.longestCommonPrefix(strs)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def longestCommonPrefix(self, strs: list[str]) -> str:
        prefix = strs[0]
        for s in strs[1:]:
            while not s.startswith(prefix):
                prefix = prefix[:-1]
                if not prefix:
                    return ""
        return prefix
$$),

((SELECT id FROM problems WHERE title='Longest Common Prefix'), 'cpp', 'longestCommonPrefix', '[{"name": "strs", "type": "array"}]', 'string',
$$class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        // Write your solution here
        return "";
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
        int n;
        cin >> n;
        cin.ignore();
        vector<string> strs(n);
        for (int i = 0; i < n; i++) {
            cin >> strs[i];
        }
        string result = sol.longestCommonPrefix(strs);
        out << result << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        string prefix = strs[0];
        for (int i = 1; i < (int)strs.size(); i++) {
            while (strs[i].find(prefix) != 0) {
                prefix = prefix.substr(0, prefix.size() - 1);
                if (prefix.empty()) return "";
            }
        }
        return prefix;
    }
};$$);
