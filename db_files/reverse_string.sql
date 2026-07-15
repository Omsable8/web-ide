-- =========================================================
-- PROBLEM: Reverse a String
-- Difficulty: Easy | Category: Strings | Topic: Two Pointers
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Reverse a String', 'Given a string s, reverse the string and return it.', 'Easy', 'Strings', 'Two Pointers', '[{"input": "s = \"hello\"", "output": "olleh"}]', '1 <= s.length <= 10^4, s consists of printable ASCII characters', 'O(n)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse a String'), false, '[
  [{"name": "s", "type": "string", "value": "hello"}],
  [{"name": "s", "type": "string", "value": "World"}],
  [{"name": "s", "type": "string", "value": "a"}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Reverse a String'), true, '[
  [{"name": "s", "type": "string", "value": "ab"}],
  [{"name": "s", "type": "string", "value": "racecar"}],
  [{"name": "s", "type": "string", "value": "OpenAI"}],
  [{"name": "s", "type": "string", "value": "12345"}],
  [{"name": "s", "type": "string", "value": "Z"}],
  [{"name": "s", "type": "string", "value": "noon"}],
  [{"name": "s", "type": "string", "value": "Programming"}],
  [{"name": "s", "type": "string", "value": "AAAA"}],
  [{"name": "s", "type": "string", "value": "abcdefg"}],
  [{"name": "s", "type": "string", "value": "x9y8z7"}],
  [{"name": "s", "type": "string", "value": "MapleIDE"}],
  [{"name": "s", "type": "string", "value": "ab ba"}],
  [{"name": "s", "type": "string", "value": "Q"}],
  [{"name": "s", "type": "string", "value": "DataStructures"}],
  [{"name": "s", "type": "string", "value": "reverseMe123"}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse a String'), '[{"level": 1, "title": "Conceptual", "content": "A string is similar to an array of characters. The same idea used to reverse an array of numbers can be applied here."}, {"level": 2, "title": "Strategy", "content": "Convert the string into a character array (or list), then use two pointers from both ends to swap characters, moving inward until they meet."}, {"level": 3, "title": "Implementation", "content": "char[] arr = s.toCharArray(); use left=0, right=arr.length-1, swap arr[left] and arr[right] while left < right, then join the array back into a string."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Reverse a String'), 'java', 'reverseString', '[{"name": "s", "type": "string"}]', 'string',

-- ---------- JAVA ----------
$$class Solution {
    public String reverseString(String s) {
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
            String s = sc.nextLine();

            String result = sol.reverseString(s);
            sb.append(result);
            sb.append("---SEP---");
        }

        System.out.print(sb.toString());
    }
}$$,

$$class Solution {
    public String reverseString(String s) {
        char[] arr = s.toCharArray();
        int left = 0, right = arr.length - 1;
        while (left < right) {
            char temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
        return new String(arr);
    }
}$$),

-- ---------- PYTHON ----------
((SELECT id FROM problems WHERE title='Reverse a String'), 'python', 'reverseString', '[{"name": "s", "type": "string"}]', 'string',

$$class Solution:
    def reverseString(self, s: str) -> str:
        # Write your solution here
        pass$$,


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

        result = sol.reverseString(s)
        output.append(str(result))
        output.append('---SEP---')

    print(''.join(output), end='')

main()$$,

$$class Solution:
    def reverseString(self, s: str) -> str:
        chars = list(s)
        left, right = 0, len(chars) - 1
        while left < right:
            chars[left], chars[right] = chars[right], chars[left]
            left += 1
            right -= 1
        return ''.join(chars)
$$),


-- ---------- CPP ----------
((SELECT id FROM problems WHERE title='Reverse a String'), 'cpp', 'reverseString', '[{"name": "s", "type": "string"}]', 'string',

$$class Solution {
public:
    string reverseString(string s) {
        // Write your solution here
        
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

        string result = sol.reverseString(s);
        out << result << "---SEP---";
    }

    cout << out.str();
    return 0;
}$$,

$$class Solution {
public:
    string reverseString(string s) {
        int left = 0, right = (int)s.size() - 1;
        while (left < right) {
            swap(s[left], s[right]);
            left++;
            right--;
        }
        return s;
    }
};$$);