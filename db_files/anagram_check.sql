-- =========================================================
-- PROBLEM: Anagram Check
-- Difficulty: Medium | Category: Strings | Topic: Hashmaps
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Anagram Check', 
'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is formed by rearranging the letters of a word using all the original letters exactly once. Comparison is case-sensitive.', 
'Medium', 
'Strings', 
'Hashmaps', 
'[{"input": "s = \"anagram\", t = \"nagaram\"", "output": "true"}]', 
'1 <= s.length, t.length <= 10^4, s and t consist of lowercase English letters', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Anagram Check'), false, '[
  [{"name": "s", "type": "string", "value": "anagram"}, {"name": "t", "type": "string", "value": "nagaram"}],
  [{"name": "s", "type": "string", "value": "rat"}, {"name": "t", "type": "string", "value": "car"}],
  [{"name": "s", "type": "string", "value": "listen"}, {"name": "t", "type": "string", "value": "silent"}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Anagram Check'), true, '[
  [{"name": "s", "type": "string", "value": "a"}, {"name": "t", "type": "string", "value": "a"}],
  [{"name": "s", "type": "string", "value": "a"}, {"name": "t", "type": "string", "value": "b"}],
  [{"name": "s", "type": "string", "value": "ab"}, {"name": "t", "type": "string", "value": "ba"}],
  [{"name": "s", "type": "string", "value": "abc"}, {"name": "t", "type": "string", "value": "abd"}],
  [{"name": "s", "type": "string", "value": "aabbcc"}, {"name": "t", "type": "string", "value": "abcabc"}],
  [{"name": "s", "type": "string", "value": "aabbcc"}, {"name": "t", "type": "string", "value": "aabbc"}],
  [{"name": "s", "type": "string", "value": "night"}, {"name": "t", "type": "string", "value": "thing"}],
  [{"name": "s", "type": "string", "value": "dormitory"}, {"name": "t", "type": "string", "value": "dirtyroom"}],
  [{"name": "s", "type": "string", "value": "school"}, {"name": "t", "type": "string", "value": "cohols"}],
  [{"name": "s", "type": "string", "value": "elbow"}, {"name": "t", "type": "string", "value": "below"}],
  [{"name": "s", "type": "string", "value": "aaaa"}, {"name": "t", "type": "string", "value": "aaab"}],
  [{"name": "s", "type": "string", "value": "abcd"}, {"name": "t", "type": "string", "value": "dcba"}],
  [{"name": "s", "type": "string", "value": "xyz"}, {"name": "t", "type": "string", "value": "zyx"}],
  [{"name": "s", "type": "string", "value": "programming"}, {"name": "t", "type": "string", "value": "gramprogimn"}],
  [{"name": "s", "type": "string", "value": "abcdefgh"}, {"name": "t", "type": "string", "value": "hgfedcba"}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Anagram Check'), '[{"level": 1, "title": "Conceptual", "content": "Two strings are anagrams if they contain exactly the same characters with the same frequencies, just in a different order. First check: do they even have the same length?"}, {"level": 2, "title": "Strategy", "content": "Use a hashmap (or fixed-size array for lowercase letters) to count the frequency of each character in s, then decrement the counts as you go through t. If any count goes negative, they are not anagrams."}, {"level": 3, "title": "Implementation", "content": "If s.length() != t.length(), return false. Otherwise build a frequency map from s, then iterate over t decrementing counts. At the end, check that all counts in the map are exactly zero."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
-- ---------- JAVA ----------
((SELECT id FROM problems WHERE title='Anagram Check'), 'java', 'isAnagram', '[{"name": "s", "type": "string"}, {"name": "t", "type": "string"}]', 'boolean',
$$class Solution {
    public boolean isAnagram(String s, String t) {
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
            String tt = sc.nextLine();

            boolean result = sol.isAnagram(s, tt);
            sb.append(result);
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,

$$class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) {
            return false;
        }
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
        for (char c : t.toCharArray()) {
            if (!counts.containsKey(c) || counts.get(c) == 0) {
                return false;
            }
            counts.put(c, counts.get(c) - 1);
        }
        return true;
    }
}$$),

-- ---------- PYTHON ----------
((SELECT id FROM problems WHERE title='Anagram Check'), 'python', 'isAnagram', '[{"name": "s", "type": "string"}, {"name": "t", "type": "string"}]', 'boolean',
$$class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # Write your solution here
        return False
$$,

$$import sys

---INSERT USER CODE HERE---

def main():
    data = sys.stdin.read().split('\n')
    idx = 0
    t_count = int(data[idx].strip()); idx += 1

    sol = Solution()
    output = []
    for _ in range(t_count):
        s = data[idx]; idx += 1
        t = data[idx]; idx += 1

        result = sol.isAnagram(s, t)
        output.append(str(result).lower())
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        counts = {}
        for c in s:
            counts[c] = counts.get(c, 0) + 1
        for c in t:
            if counts.get(c, 0) == 0:
                return False
            counts[c] -= 1
        return True
$$),

-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='Anagram Check'), 'cpp', 'isAnagram', '[{"name": "s", "type": "string"}, {"name": "t", "type": "string"}]', 'boolean',
$$class Solution {
public:
    bool isAnagram(string s, string t) {
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
        string s, tt;
        getline(cin, s);
        getline(cin, tt);

        bool result = sol.isAnagram(s, tt);
        out << (result ? "true" : "false") << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) {
            return false;
        }
        unordered_map<char, int> counts;
        for (char c : s) {
            counts[c]++;
        }
        for (char c : t) {
            if (counts.find(c) == counts.end() || counts[c] == 0) {
                return false;
            }
            counts[c]--;
        }
        return true;
    }
};$$);
