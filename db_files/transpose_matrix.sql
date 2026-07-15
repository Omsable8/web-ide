-- =========================================================
-- PROBLEM: Transpose Matrix
-- Difficulty: Easy | Category: 2D Arrays | Topic: Matrix
-- stdin: rows cols, then each row space-separated on its own line
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Transpose Matrix', 
'Given a 2D integer matrix, return its transpose. The transpose of a matrix is obtained by flipping rows and columns, i.e. the row and column indices of every element are swapped.', 
'Easy', '2D Arrays', 'Matrix', 
'[{"input": "matrix = [[1,2,3],[4,5,6]]", "output": "[[1,4],[2,5],[3,6]]"}]', 
'1 <= rows, cols <= 100, -1000 <= matrix[i][j] <= 1000', 'O(rows*cols)', 'O(rows*cols)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Transpose Matrix'), false, '[
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3],[4,5,6]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2],[3,4]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[5]]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Transpose Matrix'), true, '[
  [{"name": "matrix", "type": "2d_array", "value": [[1]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1],[2]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[0,0],[0,0]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[-1,-2],[-3,-4]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3,4]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1],[2],[3],[4]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3],[4,5,6],[7,8,9]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,1],[1,1],[1,1]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1000,-1000],[-1000,1000]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3],[4,5,6]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[10,20,30,40],[50,60,70,80]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[2,4],[6,8],[10,12]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[-5,0,5],[10,-10,0]]}],
  [{"name": "matrix", "type": "2d_array", "value": [[1,2,3,4,5]]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Transpose Matrix'), '[{"level": 1, "title": "Conceptual", "content": "In the transposed matrix, the element that was at row i, column j moves to row j, column i. The number of rows and columns swap as well."}, {"level": 2, "title": "Strategy", "content": "Create a new matrix with dimensions cols x rows (swapped from the original). Iterate through every cell of the original matrix and place it into its mirrored position in the new matrix."}, {"level": 3, "title": "Implementation", "content": "result[j][i] = matrix[i][j] for every valid i, j. Initialize result as a new 2D array of size cols by rows before filling it in with two nested loops."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Transpose Matrix'), 'java', 'transpose', '[{"name": "matrix", "type": "2d_array"}]', '2d_array',
$$class Solution {
    public int[][] transpose(int[][] matrix) {
        // Write your solution here
        return new int[0][0];
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
                for (int j = 0; j < cols; j++) {
                    matrix[i][j] = Integer.parseInt(parts[j]);
                }
            }
            int[][] result = sol.transpose(matrix);
            sb.append(Arrays.deepToString(result));
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int[][] transpose(int[][] matrix) {
        int rows = matrix.length;
        int cols = matrix[0].length;
        int[][] result = new int[cols][rows];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                result[j][i] = matrix[i][j];
            }
        }
        return result;
    }
}$$),

((SELECT id FROM problems WHERE title='Transpose Matrix'), 'python', 'transpose', '[{"name": "matrix", "type": "2d_array"}]', '2d_array',
$$class Solution:
    def transpose(self, matrix: list[list[int]]) -> list[list[int]]:
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
        result = sol.transpose(matrix)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def transpose(self, matrix: list[list[int]]) -> list[list[int]]:
        rows = len(matrix)
        cols = len(matrix[0])
        result = [[0] * rows for _ in range(cols)]
        for i in range(rows):
            for j in range(cols):
                result[j][i] = matrix[i][j]
        return result
$$),

((SELECT id FROM problems WHERE title='Transpose Matrix'), 'cpp', 'transpose', '[{"name": "matrix", "type": "2d_array"}]', '2d_array',
$$class Solution {
public:
    vector<vector<int>> transpose(vector<vector<int>>& matrix) {
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
        vector<vector<int>> result = sol.transpose(matrix);
        out << "[";
        for (int i = 0; i < (int)result.size(); i++) {
            out << "[";
            for (int j = 0; j < (int)result[i].size(); j++) {
                out << result[i][j];
                if (j < (int)result[i].size() - 1) out << ", ";
            }
            out << "]";
            if (i < (int)result.size() - 1) out << ", ";
        }
        out << "]" << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    vector<vector<int>> transpose(vector<vector<int>>& matrix) {
        int rows = matrix.size();
        int cols = matrix[0].size();
        vector<vector<int>> result(cols, vector<int>(rows));
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                result[j][i] = matrix[i][j];
            }
        }
        return result;
    }
};$$);