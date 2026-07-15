-- =========================================================
-- PROBLEM: Longest Substring Without Repeating Characters
-- Difficulty: Medium | Category: Sliding Window | Topic: Strings / Hashmaps
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Longest Substring Without Repeating Characters',
 'Given a string s, find the length of the longest substring that contains no repeating characters.', 
 'Medium', 'Sliding Window', 
 'Strings / Hashmaps', 
 '[{"input": "s = \"abcabcbb\"", "output": "3"}]', 
 '0 <= s.length <= 5*10^4, s consists of English letters, digits, symbols and spaces', 'O(n)', 'O(min(n, 128))', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Longest Substring Without Repeating Characters'), false, '[
  [{"name": "s", "type": "string", "value": "abcabcbb"}],
  [{"name": "s", "type": "string", "value": "bbbbb"}],
  [{"name": "s", "type": "string", "value": "pwwkew"}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Longest Substring Without Repeating Characters'), true, '[
  [{"name": "s", "type": "string", "value": ""}],
  [{"name": "s", "type": "string", "value": "a"}],
  [{"name": "s", "type": "string", "value": "au"}],
  [{"name": "s", "type": "string", "value": "aa"}],
  [{"name": "s", "type": "string", "value": "dvdf"}],
  [{"name": "s", "type": "string", "value": "anviaj"}],
  [{"name": "s", "type": "string", "value": "abcdef"}],
  [{"name": "s", "type": "string", "value": "abcdabcd"}],
  [{"name": "s", "type": "string", "value": "aab"}],
  [{"name": "s", "type": "string", "value": "tmmzuxt"}],
  [{"name": "s", "type": "string", "value": "ohvhjdml"}],
  [{"name": "s", "type": "string", "value": "abba"}],
  [{"name": "s", "type": "string", "value": "ckilbkd"}],
  [{"name": "s", "type": "string", "value": "aababcabcdabcde"}],
  [{"name": "s", "type": "string", "value": "nfpdmpi"}],
  [{"name": "s", "type": "string", "value": "aabaab"}],
  [{"name": "s", "type": "string", "value": "abcdeafbdgcbb"}],
  [{"name": "s", "type": "string", "value": "wobgrovw"}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Longest Substring Without Repeating Characters'), '[{"level": 1, "title": "Conceptual", "content": "Checking every possible substring is O(n^3) and too slow. Instead, think about maintaining a window of characters that are all unique, expanding it as long as no repeat exists and shrinking it when one is found."}, {"level": 2, "title": "Strategy", "content": "Use a sliding window with two pointers (left, right) and a hashmap to track the last seen index of each character. When a repeating character is found inside the window, jump the left pointer past its previous occurrence to remove the duplicate."}, {"level": 3, "title": "Implementation", "content": "map = {} (char -> last index), left = 0, maxLen = 0. For right from 0 to n-1: if s[right] in map and map[s[right]] >= left, set left = map[s[right]] + 1. Update map[s[right]] = right. maxLen = max(maxLen, right - left + 1). Return maxLen."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Longest Substring Without Repeating Characters'), 'java', 'lengthOfLongestSubstring', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution {
    public int lengthOfLongestSubstring(String s) {
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
            int result = sol.lengthOfLongestSubstring(s);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}$$),

((SELECT id FROM problems WHERE title='Longest Substring Without Repeating Characters'), 'python', 'lengthOfLongestSubstring', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
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
        result = sol.lengthOfLongestSubstring(s)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        for right, c in enumerate(s):
            if c in char_map and char_map[c] >= left:
                left = char_map[c] + 1
            char_map[c] = right
            max_len = max(max_len, right - left + 1)
        return max_len
$$),

((SELECT id FROM problems WHERE title='Longest Substring Without Repeating Characters'), 'cpp', 'lengthOfLongestSubstring', '[{"name": "s", "type": "string"}]', 'integer',
$$class Solution {
public:
    int lengthOfLongestSubstring(string s) {
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
        int result = sol.lengthOfLongestSubstring(s);
        out << result << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> charMap;
        int left = 0, maxLen = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            char c = s[right];
            if (charMap.count(c) && charMap[c] >= left) {
                left = charMap[c] + 1;
            }
            charMap[c] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};$$);
