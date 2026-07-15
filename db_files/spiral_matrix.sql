-- =========================================================
-- PROBLEM: Spiral Matrix Traversal
-- Difficulty: Medium | Category: 2D Arrays | Topic: Matrix
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Spiral Matrix Traversal', 
'Given an m x n matrix, return all elements of the matrix in spiral order (clockwise from the top-left corner).', 
'Medium', '2D Arrays', 'Matrix', 
'[{"input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]", "output": "[1,2,3,6,9,8,7,4,5]"}]', 
'1 <= rows, cols <= 10, -100 <= matrix[i][j] <= 100', 'O(rows*cols)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Spiral Matrix Traversal'), false, '[
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3],[4,5,6],[7,8,9]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3,4],[5,6,7,8],[9,10,11,12]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1]]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Spiral Matrix Traversal'), true, '[
  [{"name": "matrix", "type": "2d_array", "value": [[1,2],[3,4]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1],[2],[3]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3,4]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1],[2],[3],[4]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3],[4,5,6]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2],[3,4],[5,6]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3,4,5]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[7,8,9],[4,5,6],[1,2,3]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[-1,-2,-3],[-4,-5,-6],[-7,-8,-9]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[0,0,0],[0,0,0],[0,0,0]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3],[4,5,6],[7,8,9],[10,11,12]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3,4],[5,6,7,8]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[100,-100,50],[0,25,-50],[75,-75,10]]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Spiral Matrix Traversal'), '[{"level": 1, "title": "Conceptual", "content": "Think of four boundaries: top row, bottom row, left column, right column. A spiral traversal means repeatedly: move right along the top, down the right side, left along the bottom, up the left side, then shrink the boundaries inward."}, {"level": 2, "title": "Strategy", "content": "Maintain four boundary pointers (top, bottom, left, right). In each iteration: collect the top row left-to-right, then the right column top-to-bottom, then the bottom row right-to-left (if still valid), then the left column bottom-to-top (if still valid). After each edge is collected, shrink the corresponding boundary inward."}, {"level": 3, "title": "Implementation", "content": "while top <= bottom and left <= right: traverse top row, then right column, then (if top < bottom) bottom row reversed, then (if left < right) left column upward. After each pass increment top, decrement right, decrement bottom, increment left respectively."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Spiral Matrix Traversal'), 'java', 'spiralOrder', '[{"name": "matrix", "type": "2d_array"}]', 'array',
$$class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        // Write your solution here
        return new ArrayList<>();
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
            String[] dims = sc.nextLine().trim().split("\\s+");
            int rows = Integer.parseInt(dims[0]);
            int cols = Integer.parseInt(dims[1]);
            int[][] matrix = new int[rows][cols];
            for (int i = 0; i < rows; i++) {
                String[] parts = sc.nextLine().trim().split("\\s+");
                for (int j = 0; j < cols; j++) matrix[i][j] = Integer.parseInt(parts[j]);
            }
            List<Integer> result = sol.spiralOrder(matrix);
            sb.append(result.toString());
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> result = new ArrayList<>();
        int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int i = left; i <= right; i++) result.add(matrix[top][i]);
            top++;
            for (int i = top; i <= bottom; i++) result.add(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int i = right; i >= left; i--) result.add(matrix[bottom][i]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) result.add(matrix[i][left]);
                left++;
            }
        }
        return result;
    }
}$$),

((SELECT id FROM problems WHERE title='Spiral Matrix Traversal'), 'python', 'spiralOrder', '[{"name": "matrix", "type": "2d_array"}]', 'array',
$$class Solution:
    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:
        # Write your solution here
        return []
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
        dims = data[idx].strip().split(); idx += 1
        rows, cols = int(dims[0]), int(dims[1])
        matrix = []
        for _ in range(rows):
            row = list(map(int, data[idx].strip().split())); idx += 1
            matrix.append(row)
        result = sol.spiralOrder(matrix)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:
        result = []
        top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
        while top <= bottom and left <= right:
            for i in range(left, right + 1): result.append(matrix[top][i])
            top += 1
            for i in range(top, bottom + 1): result.append(matrix[i][right])
            right -= 1
            if top <= bottom:
                for i in range(right, left - 1, -1): result.append(matrix[bottom][i])
                bottom -= 1
            if left <= right:
                for i in range(bottom, top - 1, -1): result.append(matrix[i][left])
                left += 1
        return result
$$),

((SELECT id FROM problems WHERE title='Spiral Matrix Traversal'), 'cpp', 'spiralOrder', '[{"name": "matrix", "type": "2d_array"}]', 'array',
$$class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        // Write your solution here
        return {};
    }
};$$,
$$#include <bits/stdc++.h>
using namespace std;

---INSERT USER CODE HERE---

int main() {
    int t;
    cin >> t;
    Solution sol;
    ostringstream out;
    for (int tc = 0; tc < t; tc++) {
        int rows, cols;
        cin >> rows >> cols;
        vector<vector<int>> matrix(rows, vector<int>(cols));
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < cols; j++)
                cin >> matrix[i][j];
        vector<int> result = sol.spiralOrder(matrix);
        out << "[";
        for (int i = 0; i < (int)result.size(); i++) {
            out << result[i];
            if (i < (int)result.size() - 1) out << ", ";
        }
        out << "]" << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> result;
        int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;
        while (top <= bottom && left <= right) {
            for (int i = left; i <= right; i++) result.push_back(matrix[top][i]);
            top++;
            for (int i = top; i <= bottom; i++) result.push_back(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int i = right; i >= left; i--) result.push_back(matrix[bottom][i]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) result.push_back(matrix[i][left]);
                left++;
            }
        }
        return result;
    }
};$$);
