-- ==========================================
-- 1. SHIFT ZEROES (C++, Python, Java)
-- ==========================================
INSERT INTO code_templates (problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code) VALUES 
((SELECT id FROM problems WHERE title = 'Shift Zeroes'), 'cpp', '#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> shiftZeroes(vector<int>& nums) {
        // Your code here
        return {};
    }
};', 'shiftZeroes', '[{"name": "nums", "type": "array"}]'::jsonb, 'array', '#include <iostream>
#include <vector>

int main() {
    int t;
    if (!(std::cin >> t)) return 0;
    Solution sol;
    while (t--) {
        int n;
        std::cin >> n;
        std::vector<int> nums(n);
        for(int i=0; i<n; i++) std::cin >> nums[i];
        
        std::vector<int> res = sol.shiftZeroes(nums);
        std::cout << "[";
        for(size_t i=0; i<res.size(); i++) {
            std::cout << res[i] << (i < res.size()-1 ? "," : "");
        }
        std::cout << "]\n";
    }
    return 0;
}', '#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> shiftZeroes(vector<int>& nums) {
        int insertPos = 0;
        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] != 0) {
                nums[insertPos++] = nums[i];
            }
        }
        while (insertPos < nums.size()) {
            nums[insertPos++] = 0;
        }
        return nums;
    }
};'),

((SELECT id FROM problems WHERE title = 'Shift Zeroes'), 'python', 'class Solution:
    def shiftZeroes(self, nums: list[int]) -> list[int]:
        # Your code here
        pass', 'shiftZeroes', '[{"name": "nums", "type": "array"}]'::jsonb, 'array', 'import sys, json

def get_line():
    return sys.stdin.readline()

if __name__ == "__main__":
    line = get_line()
    if line:
        t = int(line.strip())
        sol = Solution()
        for _ in range(t):
            try:
                n = int(get_line().strip())
                nums = [int(x) for x in get_line().split()] if n > 0 else []
                result = sol.shiftZeroes(nums)
                print(json.dumps(result))
            except Exception:
                print(json.dumps(None))', 'class Solution:
    def shiftZeroes(self, nums: list[int]) -> list[int]:
        insert_pos = 0
        for i in range(len(nums)):
            if nums[i] != 0:
                nums[insert_pos], nums[i] = nums[i], nums[insert_pos]
                insert_pos += 1
        return nums'),

((SELECT id FROM problems WHERE title = 'Shift Zeroes'), 'java', 'import java.util.*;

class Solution {
    public int[] shiftZeroes(int[] nums) {
        // Your code here
        return new int[]{};
    }
}', 'shiftZeroes', '[{"name": "nums", "type": "array"}]'::jsonb, 'array', 'public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        Solution sol = new Solution();
        for (int i = 0; i < t; i++) {
            try {
                int n = sc.nextInt();
                int[] nums = new int[n];
                for(int j=0; j<n; j++) nums[j] = sc.nextInt();
                int[] result = sol.shiftZeroes(nums);
                System.out.println(Arrays.toString(result).replaceAll(" ", ""));
            } catch (Exception e) {
                System.out.println("null");
            }
        }
    }
}', 'import java.util.*;

class Solution {
    public int[] shiftZeroes(int[] nums) {
        int insertPos = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                nums[insertPos++] = nums[i];
            }
        }
        while (insertPos < nums.length) {
            nums[insertPos++] = 0;
        }
        return nums;
    }
}');


-- ==========================================
-- 2. SECOND LARGEST ELEMENT (C++, Python, Java)
-- ==========================================
INSERT INTO code_templates (problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code) VALUES 
((SELECT id FROM problems WHERE title = 'Second Largest Element'), 'cpp', '#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    int secondLargest(vector<int>& arr) {
        // Your code here
        return -1;
    }
};', 'secondLargest', '[{"name": "arr", "type": "array"}]'::jsonb, 'integer', '#include <iostream>
#include <vector>

int main() {
    int t;
    if (!(std::cin >> t)) return 0;
    Solution sol;
    while (t--) {
        int n;
        std::cin >> n;
        std::vector<int> arr(n);
        for(int i=0; i<n; i++) std::cin >> arr[i];
        std::cout << sol.secondLargest(arr) << "\n";
    }
    return 0;
}', '#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    int secondLargest(vector<int>& arr) {
        if (arr.size() < 2) return -1;
        int first = -1, second = -1;
        for (int i = 0; i < arr.size(); i++) {
            if (arr[i] > first) {
                second = first;
                first = arr[i];
            } else if (arr[i] > second && arr[i] != first) {
                second = arr[i];
            }
        }
        return second;
    }
};'),

((SELECT id FROM problems WHERE title = 'Second Largest Element'), 'python', 'class Solution:
    def secondLargest(self, arr: list[int]) -> int:
        # Your code here
        pass', 'secondLargest', '[{"name": "arr", "type": "array"}]'::jsonb, 'integer', 'import sys, json

def get_line():
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
                result = sol.secondLargest(arr)
                print(json.dumps(result))
            except Exception:
                print(json.dumps(None))', 'class Solution:
    def secondLargest(self, arr: list[int]) -> int:
        if len(arr) < 2:
            return -1
        first, second = -1, -1
        for num in arr:
            if num > first:
                second = first
                first = num
            elif first > num > second:
                second = num
        return second'),

((SELECT id FROM problems WHERE title = 'Second Largest Element'), 'java', 'import java.util.*;

class Solution {
    public int secondLargest(int[] arr) {
        // Your code here
        return -1;
    }
}', 'secondLargest', '[{"name": "arr", "type": "array"}]'::jsonb, 'integer', '
public class Main {
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
                System.out.println(sol.secondLargest(arr));
            } catch (Exception e) {
                System.out.println("null");
            }
        }
    }
}', 'import java.util.*;

class Solution {
    public int secondLargest(int[] arr) {
        if (arr.length < 2) return -1;
        int first = -1, second = -1;
        for (int num : arr) {
            if (num > first) {
                second = first;
                first = num;
            } else if (num > second && num != first) {
                second = num;
            }
        }
        return second;
    }
}');


-- ==========================================
-- 3. MATRIX MULTIPLICATION (C++, Python, Java)
-- ==========================================
INSERT INTO code_templates (problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code) VALUES 
((SELECT id FROM problems WHERE title = 'Matrix Multiplication'), 'cpp', '#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> multiply(vector<vector<int>>& A, vector<vector<int>>& B) {
        // Your code here
        return {};
    }
};', 'multiply', '[{"name": "A", "type": "2d_array"}, {"name": "B", "type": "2d_array"}]'::jsonb, '2d_array', '#include <iostream>
#include <vector>

int main() {
    int t;
    if (!(std::cin >> t)) return 0;
    Solution sol;
    while (t--) {
        int rA, cA; std::cin >> rA >> cA;
        std::vector<std::vector<int>> A(rA, std::vector<int>(cA));
        for(int i=0; i<rA; i++) for(int j=0; j<cA; j++) std::cin >> A[i][j];
        
        int rB, cB; std::cin >> rB >> cB;
        std::vector<std::vector<int>> B(rB, std::vector<int>(cB));
        for(int i=0; i<rB; i++) for(int j=0; j<cB; j++) std::cin >> B[i][j];
        
        std::vector<std::vector<int>> res = sol.multiply(A, B);
        
        std::cout << "[";
        for(size_t i=0; i<res.size(); i++) {
            std::cout << "[";
            for(size_t j=0; j<res[i].size(); j++) {
                std::cout << res[i][j] << (j < res[i].size()-1 ? "," : "");
            }
            std::cout << "]" << (i < res.size()-1 ? "," : "");
        }
        std::cout << "]\n";
    }
    return 0;
}', '#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> multiply(vector<vector<int>>& A, vector<vector<int>>& B) {
        int rA = A.size(), cA = A[0].size(), cB = B[0].size();
        vector<vector<int>> res(rA, vector<int>(cB, 0));
        for (int i = 0; i < rA; i++) {
            for (int j = 0; j < cB; j++) {
                for (int k = 0; k < cA; k++) {
                    res[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return res;
    }
};'),

((SELECT id FROM problems WHERE title = 'Matrix Multiplication'), 'python', 'class Solution:
    def multiply(self, A: list[list[int]], B: list[list[int]]) -> list[list[int]]:
        # Your code here
        pass', 'multiply', '[{"name": "A", "type": "2d_array"}, {"name": "B", "type": "2d_array"}]'::jsonb, '2d_array', 'import sys, json

def get_line():
    return sys.stdin.readline()

if __name__ == "__main__":
    line = get_line()
    if line:
        t = int(line.strip())
        sol = Solution()
        for _ in range(t):
            try:
                # Read Matrix A
                dimsA = get_line().split()
                rA, cA = int(dimsA[0]), int(dimsA[1])
                A = []
                for _ in range(rA):
                    A.append([int(x) for x in get_line().split()])
                
                # Read Matrix B
                dimsB = get_line().split()
                rB, cB = int(dimsB[0]), int(dimsB[1])
                B = []
                for _ in range(rB):
                    B.append([int(x) for x in get_line().split()])
                
                result = sol.multiply(A, B)
                # Print JSON directly so no whitespace issues in validation
                print(json.dumps(result).replace(" ", ""))
            except Exception:
                print(json.dumps(None))', 'class Solution:
    def multiply(self, A: list[list[int]], B: list[list[int]]) -> list[list[int]]:
        rA, cA, cB = len(A), len(A[0]), len(B[0])
        res = [[0] * cB for _ in range(rA)]
        for i in range(rA):
            for j in range(cB):
                for k in range(cA):
                    res[i][j] += A[i][k] * B[k][j]
        return res'),

((SELECT id FROM problems WHERE title = 'Matrix Multiplication'), 'java', 'import java.util.*;

class Solution {
    public int[][] multiply(int[][] A, int[][] B) {
        // Your code here
        return new int[][]{};
    }
}', 'multiply', '[{"name": "A", "type": "2d_array"}, {"name": "B", "type": "2d_array"}]'::jsonb, '2d_array', 
'public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        Solution sol = new Solution();
        for (int i = 0; i < t; i++) {
            try {
                int rA = sc.nextInt(), cA = sc.nextInt();
                int[][] A = new int[rA][cA];
                for(int r=0; r<rA; r++) for(int c=0; c<cA; c++) A[r][c] = sc.nextInt();
                
                int rB = sc.nextInt(), cB = sc.nextInt();
                int[][] B = new int[rB][cB];
                for(int r=0; r<rB; r++) for(int c=0; c<cB; c++) B[r][c] = sc.nextInt();
                
                int[][] res = sol.multiply(A, B);
                
                StringBuilder sb = new StringBuilder("[");
                for(int r=0; r<res.length; r++) {
                    sb.append("[");
                    for(int c=0; c<res[r].length; c++) {
                        sb.append(res[r][c]);
                        if(c < res[r].length-1) sb.append(",");
                    }
                    sb.append("]");
                    if(r < res.length-1) sb.append(",");
                }
                sb.append("]");
                System.out.println(sb.toString());
                
            } catch (Exception e) {
                System.out.println("null");
            }
        }
    }
}', 
'import java.util.*;

class Solution {
    public int[][] multiply(int[][] A, int[][] B) {
        int rA = A.length, cA = A[0].length, cB = B[0].length;
        int[][] res = new int[rA][cB];
        for (int i = 0; i < rA; i++) {
            for (int j = 0; j < cB; j++) {
                for (int k = 0; k < cA; k++) {
                    res[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return res;
    }
}');
-- ==========================================
-- 4. Leap Year (C++, Python, Java)
-- ==========================================

INSERT INTO code_templates (problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code) 
VALUES ((SELECT id FROM problems WHERE title = 'Leap Year'), 
'cpp', 
'#include <iostream>
using namespace std;

class Solution {
public:
    bool isLeapYear(int year) {
        // Your code here
        return false;
    }
};', 
                        
'isLeapYear', 
'[{"name": "year", "type": "integer"}]'::jsonb, 
'boolean', 
'#include <iostream>
int main() {
    int t;
    if (!(std::cin >> t)) return 0;
    Solution sol;
    while (t--) {
        int year;
        std::cin >> year;
        std::cout << (sol.isLeapYear(year) ? "true" : "false") << "\\n";    
    }
    return 0;
}', 
        
'#include <iostream>
using namespace std;

class Solution {
public:
    bool isLeapYear(int year) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }
};'),

((SELECT id FROM problems WHERE title = 'Leap Year'), 
'python', 
'class Solution:
    def isLeapYear(self, year: int) -> bool:
        # Your code here
        pass', 
'isLeapYear', 
'[{"name": "year", "type": "integer"}]'::jsonb, 
'boolean', 
'import sys, json
def get_line():
    return sys.stdin.readline()

if __name__ == "__main__":
    line = get_line()
    if line:
        t = int(line.strip())
        sol = Solution()
        for _ in range(t):
            try:
                year = int(get_line().strip())
                result = sol.isLeapYear(year)
                print(json.dumps(result))
            except Exception:
                print(json.dumps(None))', 
'class Solution:
    def isLeapYear(self, year: int) -> bool:
        return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)'), 
        
        
((SELECT id FROM problems WHERE title = 'Leap Year'), 
'java', 
'import java.util.*;
class Solution {
    public boolean isLeapYear(int year) {
        // Your code here
        return false;
    }
}', 

'isLeapYear', 
'[{"name": "year", "type": "integer"}]'::jsonb, 
'boolean', 
'public class Main {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        Solution sol = new Solution();
        for (int i = 0; i < t; i++) {
            try {
                int year = sc.nextInt();
                boolean result = sol.isLeapYear(year);
                System.out.println(result ? "true" : "false");
            } catch (Exception e) {
                System.out.println("null");
            }
        }    
    }
}', 
'import java.util.*;

class Solution {
    public boolean isLeapYear(int year) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }
}');
