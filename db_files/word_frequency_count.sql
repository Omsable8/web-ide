-- =========================================================
-- PROBLEM: Word Frequency Count
-- Difficulty: Medium | Category: Hashmaps | Topic: Strings
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Word Frequency Count', 'Given a string s containing words separated by single spaces, find the word that occurs most frequently. If there is a tie, return the word that appears first in the string. Words are case-sensitive.', 'Medium', 'Hashmaps', 'Strings', '[{"input": "s = \"the cat sat on the mat the cat ran\"", "output": "the"}]', '1 <= s.length <= 10^4, s consists of lowercase English letters and single spaces, no leading/trailing spaces', 'O(n)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Word Frequency Count'), false, '[
  [{"name": "s", "type": "string", "value": "the cat sat on the mat the cat ran"}],
  [{"name": "s", "type": "string", "value": "a b a b c"}],
  [{"name": "s", "type": "string", "value": "single"}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Word Frequency Count'), true, '[
  [{"name": "s", "type": "string", "value": "a"}],
  [{"name": "s", "type": "string", "value": "a a"}],
  [{"name": "s", "type": "string", "value": "a b"}],
  [{"name": "s", "type": "string", "value": "x y x y x"}],
  [{"name": "s", "type": "string", "value": "dog cat dog bird cat dog"}],
  [{"name": "s", "type": "string", "value": "apple banana apple cherry banana apple"}],
  [{"name": "s", "type": "string", "value": "hello world hello"}],
  [{"name": "s", "type": "string", "value": "one two three four five"}],
  [{"name": "s", "type": "string", "value": "red blue red blue red green"}],
  [{"name": "s", "type": "string", "value": "ab ab cd cd ef ef"}],
  [{"name": "s", "type": "string", "value": "test test test test"}],
  [{"name": "s", "type": "string", "value": "code code data data data"}],
  [{"name": "s", "type": "string", "value": "z y x w v z y x z"}],
  [{"name": "s", "type": "string", "value": "maple maple ide ide ide"}],
  [{"name": "s", "type": "string", "value": "alpha beta alpha beta gamma alpha"}],
  [{"name": "s", "type": "string", "value": "sun moon sun star moon sun"}],
  [{"name": "s", "type": "string", "value": "p q r p q p"}],
  [{"name": "s", "type": "string", "value": "fast slow fast fast slow slow fast"}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Word Frequency Count'), '[{"level": 1, "title": "Conceptual", "content": "First split the string into individual words using the space character as a delimiter."}, {"level": 2, "title": "Strategy", "content": "Use a hashmap to count occurrences of each word as you scan through the word list. Keep track of the best (word, count) pair you have seen so far."}, {"level": 3, "title": "Implementation", "content": "Split s by spaces. For each word, increment counts[word]. Only update your best answer when a strictly higher count is found, so the first word to reach the max frequency wins ties."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Word Frequency Count'), 'java', 'mostFrequentWord', '[{"name": "s", "type": "string"}]', 'string',
$$class Solution {
    public String mostFrequentWord(String s) {
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
            String s = sc.nextLine();
            String result = sol.mostFrequentWord(s);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public String mostFrequentWord(String s) {
        String[] words = s.split(" ");
        Map<String, Integer> counts = new HashMap<>();
        String best = words[0];
        int bestCount = 0;
        for (String w : words) {
            int c = counts.getOrDefault(w, 0) + 1;
            counts.put(w, c);
            if (c > bestCount) {
                bestCount = c;
                best = w;
            }
        }
        return best;
    }
}$$),

((SELECT id FROM problems WHERE title='Word Frequency Count'), 'python', 'mostFrequentWord', '[{"name": "s", "type": "string"}]', 'string',
$$class Solution:
    def mostFrequentWord(self, s: str) -> str:
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
        s = data[idx]; idx += 1
        result = sol.mostFrequentWord(s)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def mostFrequentWord(self, s: str) -> str:
        words = s.split(' ')
        counts = {}
        best = words[0]
        best_count = 0
        for w in words:
            counts[w] = counts.get(w, 0) + 1
            if counts[w] > best_count:
                best_count = counts[w]
                best = w
        return best
$$),

((SELECT id FROM problems WHERE title='Word Frequency Count'), 'cpp', 'mostFrequentWord', '[{"name": "s", "type": "string"}]', 'string',
$$class Solution {
public:
    string mostFrequentWord(string s) {
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
        string s;
        getline(cin, s);
        string result = sol.mostFrequentWord(s);
        out << result << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    string mostFrequentWord(string s) {
        stringstream ss(s);
        string word, best;
        unordered_map<string, int> counts;
        int bestCount = 0;
        bool first = true;
        while (ss >> word) {
            if (first) { best = word; first = false; }
            counts[word]++;
            if (counts[word] > bestCount) {
                bestCount = counts[word];
                best = word;
            }
        }
        return best;
    }
};$$);
