-- ==========================================
-- 1. INSERT PROBLEMS
-- ==========================================
INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Largest of Three', 'Given 3 integers a, b, and c, return the largest among them.', 'Easy', 'Math', 'Conditionals', '[{"input": "a = 1, b = 5, c = 3", "output": "5"}]', '-10^4 <= a, b, c <= 10^4', 'O(1)', 'O(1)', 'compete'),
('Count Even Numbers', 'Given an array of N integers, count the number of even integers in the array.', 'Easy', 'Arrays', 'Traversal', '[{"input": "arr = [1, 2, 3, 4, 5]", "output": "2"}]', '1 <= arr.length <= 10^4, -10^4 <= arr[i] <= 10^4', 'O(n)', 'O(1)', 'compete'),
('Left Rotate Array', 'Given an array of N integers and a positive integer K, left rotate the array K times.', 'Hard', 'Arrays', 'Two Pointers', '[{"input": "arr = [1, 2, 3, 4, 5], k = 2", "output": "[3, 4, 5, 1, 2]"}]', '1 <= arr.length <= 10^5, 0 <= k <= 10^5', 'O(n)', 'O(1)', 'compete');


-- ==========================================
-- 2. INSERT TEST CASES
-- ==========================================
-- Largest of Three
INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Largest of Three'), false, '[[{"name": "a", "type": "integer", "value": 1}, {"name": "b", "type": "integer", "value": 5}, {"name": "c", "type": "integer", "value": 3}]]'::jsonb),
((SELECT id FROM problems WHERE title = 'Largest of Three'), true, '[[{"name": "a", "type": "integer", "value": -10}, {"name": "b", "type": "integer", "value": -5}, {"name": "c", "type": "integer", "value": -20}]]'::jsonb);

-- Count Even Numbers
INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Count Even Numbers'), false, '[[{"name": "arr", "type": "array", "value": [1, 2, 3, 4, 5]}]]'::jsonb),
((SELECT id FROM problems WHERE title = 'Count Even Numbers'), true, '[[{"name": "arr", "type": "array", "value": [2, 4, 6, 8]}], [{"name": "arr", "type": "array", "value": [1, 3, 5]}]]'::jsonb);

-- Left Rotate Array
INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Left Rotate Array'), false, '[[{"name": "arr", "type": "array", "value": [1, 2, 3, 4, 5]}, {"name": "k", "type": "integer", "value": 2}]]'::jsonb),
((SELECT id FROM problems WHERE title = 'Left Rotate Array'), true, '[[{"name": "arr", "type": "array", "value": [1, 2, 3, 4, 5]}, {"name": "k", "type": "integer", "value": 7}], [{"name": "arr", "type": "array", "value": [1]}, {"name": "k", "type": "integer", "value": 0}]]'::jsonb);


-- ==========================================
-- 3. INSERT HINTS
-- ==========================================
INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Largest of Three'), '[{"level": 1, "title": "Conceptual", "content": "You can compare the first two numbers using an if condition."}, {"level": 2, "title": "Logic", "content": "Compare the result of the first comparison with the third number."}, {"level": 3, "title": "Built-in functions", "content": "Most languages have a built-in max() function that can simplify this."}]'::jsonb),
((SELECT id FROM problems WHERE title = 'Count Even Numbers'), '[{"level": 1, "title": "Conceptual", "content": "Iterate through the array one element at a time."}, {"level": 2, "title": "Logic", "content": "Use the modulo operator (%) to check if a number is divisible by 2."}, {"level": 3, "title": "Implementation", "content": "Maintain a counter variable and increment it every time you find an even number."}]'::jsonb),
((SELECT id FROM problems WHERE title = 'Left Rotate Array'), '[{"level": 1, "title": "Conceptual", "content": "Left rotating an array by 1 means shifting all elements to the left by 1 and moving the first element to the end."}, {"level": 2, "title": "Optimization", "content": "Rotating K times is the same as rotating K % N times."}, {"level": 3, "title": "Reversal Algorithm", "content": "You can reverse the first K elements, then reverse the remaining N-K elements, and finally reverse the entire array."}]'::jsonb);


-- ==========================================
-- 4. INSERT CODE TEMPLATES
-- ==========================================

-- ------------------------------------------
-- PROBLEM 1: Largest of Three
-- ------------------------------------------
INSERT INTO code_templates (problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code) VALUES 
((SELECT id FROM problems WHERE title = 'Largest of Three'), 'cpp', '#include <iostream>
#include <algorithm>
using namespace std;

class Solution {
public:
    int largest(int a, int b, int c) {
        // Your code here
        return 0;
    }
};', 'largest', '[{"name": "a", "type": "integer"}, {"name": "b", "type": "integer"}, {"name": "c", "type": "integer"}]'::jsonb, 'integer', 'int main() {
    int t;
    if (!(std::cin >> t)) return 0;
    Solution sol;
    while (t--) {
        int a, b, c;
        std::cin >> a >> b >> c;
        std::cout << sol.largest(a, b, c) << "\n";
    }
    return 0;
}', '#include <iostream>
#include <algorithm>
using namespace std;

class Solution {
public:
    int largest(int a, int b, int c) {
        return max({a, b, c});
    }
};'),

((SELECT id FROM problems WHERE title = 'Largest of Three'), 'python', 'import sys, json

class Solution:
    def largest(self, a: int, b: int, c: int) -> int:
        # Your code here
        pass', 'largest', '[{"name": "a", "type": "integer"}, {"name": "b", "type": "integer"}, {"name": "c", "type": "integer"}]'::jsonb, 'integer', '
def get_line():
    return sys.stdin.readline()

if __name__ == "__main__":
    line = get_line()
    if line:        
        t = int(line.strip())
        sol = Solution()
        for _ in range(t):
            try:
                a = int(get_line())
                b = int(get_line())
                c = int(get_line())
                result = sol.largest(a, b, c)
                print(json.dumps(result))
            except Exception:
                print(json.dumps(None))', 'import sys, json

class Solution:
    def largest(self, a: int, b: int, c: int) -> int:
        return max(a, b, c)'),

((SELECT id FROM problems WHERE title = 'Largest of Three'), 'java', 'import java.util.*;

class Solution {
    public int largest(int a, int b, int c) {
        // Your code here
        return 0;
    }
}', 'largest', '[{"name": "a", "type": "integer"}, {"name": "b", "type": "integer"}, {"name": "c", "type": "integer"}]'::jsonb, 'integer', 'public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        Solution sol = new Solution();
        for (int i = 0; i < t; i++) {
            try {
                int a = sc.nextInt();
                int b = sc.nextInt();
                int c = sc.nextInt();
                System.out.println(sol.largest(a, b, c));
            } catch (Exception e) {
                System.out.println("null");
            }
        }
    }
}', 'import java.util.*;

class Solution {
    public int largest(int a, int b, int c) {
        return Math.max(a, Math.max(b, c));
    }
}');

-- ------------------------------------------
-- PROBLEM 2: Count Even Numbers
-- ------------------------------------------
INSERT INTO code_templates (problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code) VALUES 
((SELECT id FROM problems WHERE title = 'Count Even Numbers'), 'cpp', '#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    int countEvens(vector<int>& arr) {
        // Your code here
        return 0;
    }
};', 'countEvens', '[{"name": "arr", "type": "array"}]'::jsonb, 'integer', 'int main() {
    int t;
    if (!(std::cin >> t)) return 0;
    Solution sol;
    while (t--) {
        int n;
        std::cin >> n;
        std::vector<int> arr(n);
        for(int i=0; i<n; i++) std::cin >> arr[i];
        std::cout << sol.countEvens(arr) << "\n";
    }
    return 0;
}', '#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    int countEvens(vector<int>& arr) {
        int count = 0;
        for (int num : arr) {
            if (num % 2 == 0) count++;
        }
        return count;
    }
};'),

((SELECT id FROM problems WHERE title = 'Count Even Numbers'), 'python', 'import sys, json

class Solution:
    def countEvens(self, arr: list[int]) -> int:
        # Your code here
        pass', 'countEvens', '[{"name": "arr", "type": "array"}]'::jsonb, 'integer', 'def get_line():
    return sys.stdin.readline()

if __name__ == "__main__":
    line = get_line()
    if line:
        t = int(line.strip())
        sol = Solution()
        for _ in range(t):
            try:
                n = int(get_line().strip())
                arr = [int(x) for x in get_line().split()] if n > 0 else []
                result = sol.countEvens(arr)
                print(json.dumps(result))
            except Exception:
                print(json.dumps(None))', 'import sys, json

class Solution:
    def countEvens(self, arr: list[int]) -> int:
        return sum(1 for x in arr if x % 2 == 0)'),

((SELECT id FROM problems WHERE title = 'Count Even Numbers'), 'java', 'import java.util.*;

class Solution {
    public int countEvens(int[] arr) {
        // Your code here
        return 0;
    }
}', 'countEvens', '[{"name": "arr", "type": "array"}]'::jsonb, 'integer', 'public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        Solution sol = new Solution();
        for (int i = 0; i < t; i++) {
            try {
                int n = sc.nextInt();
                int[] arr = new int[n];
                for(int j=0; j<n; j++) arr[j] = sc.nextInt();
                System.out.println(sol.countEvens(arr));
            } catch (Exception e) {
                System.out.println("null");
            }
        }
    }
}', 'import java.util.*;

class Solution {
    public int countEvens(int[] arr) {
        int count = 0;
        for (int num : arr) {
            if (num % 2 == 0) count++;
        }
        return count;
    }
}');

-- ------------------------------------------
-- PROBLEM 3: Left Rotate Array
-- ------------------------------------------
INSERT INTO code_templates (problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code) VALUES 
((SELECT id FROM problems WHERE title = 'Left Rotate Array'), 'cpp', '#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> leftRotate(vector<int>& arr, int k) {
        // Your code here
        return {};
    }
};', 'leftRotate', '[{"name": "arr", "type": "array"}, {"name": "k", "type": "integer"}]'::jsonb, 'array', 'int main() {
    int t;
    if (!(std::cin >> t)) return 0;
    Solution sol;
    while (t--) {
        int n;
        std::cin >> n;
        std::vector<int> arr(n);
        for(int i=0; i<n; i++) std::cin >> arr[i];
        int k;
        std::cin >> k;
        std::vector<int> res = sol.leftRotate(arr, k);
        std::cout << "[";
        for(size_t i=0; i<res.size(); i++) {
            std::cout << res[i] << (i < res.size()-1 ? "," : "");
        }
        std::cout << "]\n";
    }
    return 0;
}', '#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> leftRotate(vector<int>& arr, int k) {
        int n = arr.size();
        if (n == 0) return arr;
        k = k % n;
        reverse(arr.begin(), arr.begin() + k);
        reverse(arr.begin() + k, arr.end());
        reverse(arr.begin(), arr.end());
        return arr;
    }
};'),

((SELECT id FROM problems WHERE title = 'Left Rotate Array'), 'python', 'import sys, json

class Solution:
    def leftRotate(self, arr: list[int], k: int) -> list[int]:
        # Your code here
        pass', 'leftRotate', '[{"name": "arr", "type": "array"}, {"name": "k", "type": "integer"}]'::jsonb, 'array', 'def get_line():
    return sys.stdin.readline()

if __name__ == "__main__":
    line = get_line()
    if line:
        t = int(line.strip())
        sol = Solution()
        for _ in range(t):
            try:
                n = int(get_line().strip())
                arr = [int(x) for x in get_line().split()] if n > 0 else []
                k = int(get_line().strip())
                result = sol.leftRotate(arr, k)
                print(json.dumps(result))
            except Exception:
                print(json.dumps(None))', 'import sys, json

class Solution:
    def leftRotate(self, arr: list[int], k: int) -> list[int]:
        n = len(arr)
        if n == 0:
            return arr
        k = k % n
        return arr[k:] + arr[:k]'),

((SELECT id FROM problems WHERE title = 'Left Rotate Array'), 'java', 'import java.util.*;

class Solution {
    public int[] leftRotate(int[] arr, int k) {
        // Your code here
        return new int[]{};
    }
}', 'leftRotate', '[{"name": "arr", "type": "array"}, {"name": "k", "type": "integer"}]'::jsonb, 'array', 'public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        Solution sol = new Solution();
        for (int i = 0; i < t; i++) {
            try {
                int n = sc.nextInt();
                int[] arr = new int[n];
                for(int j=0; j<n; j++) arr[j] = sc.nextInt();
                int k = sc.nextInt();
                
                int[] res = sol.leftRotate(arr, k);
                System.out.println(Arrays.toString(res).replaceAll(" ", ""));
            } catch (Exception e) {
                System.out.println("null");
            }
        }
    }
}', 'import java.util.*;

class Solution {
    public int[] leftRotate(int[] arr, int k) {
        int n = arr.length;
        if (n == 0) return arr;
        k = k % n;
        reverse(arr, 0, k - 1);
        reverse(arr, k, n - 1);
        reverse(arr, 0, n - 1);
        return arr;
    }
    
    private void reverse(int[] arr, int start, int end) {
        while (start < end) {
            int temp = arr[start];
            arr[start] = arr[end];
            arr[end] = temp;
            start++;
            end--;
        }
    }
}');