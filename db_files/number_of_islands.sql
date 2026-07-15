-- =========================================================
-- PROBLEM: Number of Islands
-- Difficulty: Medium | Category: 2D Arrays | Topic: Graph / DFS
-- Grid contains '1' (land) and '0' (water) encoded as integers 1 and 0.
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Number of Islands', 'Given an m x n grid of 0s and 1s, where 1 represents land and 0 represents water, return the number of islands. An island is surrounded by water and formed by connecting adjacent land cells horizontally or vertically. You may assume all four edges of the grid are surrounded by water.', 'Medium', '2D Arrays', 'Graph / DFS', '[{"input": "grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]", "output": "3"}]', '1 <= rows, cols <= 300, grid[i][j] is 0 or 1', 'O(rows*cols)', 'O(rows*cols)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Number of Islands'), false, '[
  [{"name": "grid", "type": "2d_array", "value": [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1]]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Number of Islands'), true, '[
  [{"name": "grid", "type": "2d_array", "value": [[0]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,0],[0,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,1],[1,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[0,0],[0,0]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,0,1],[0,1,0],[1,0,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,1,1],[0,0,0],[1,1,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,0,0,1,0],[0,0,1,0,0],[1,0,0,0,1],[0,0,0,1,0]]}],
  [{"name": "grid", "type": "2d_array", "value": [[0,1,0],[1,0,1],[0,1,0]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,1,1,1,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1],[1],[1],[1],[1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,0,0,0,1],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[1,0,0,0,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,1,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[0,0,0,0,0],[0,1,1,1,0],[0,1,0,1,0],[0,1,1,1,0],[0,0,0,0,0]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,1,1],[1,0,1],[1,1,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,0,1,0,1,0],[0,1,0,1,0,1]]}],
  [{"name": "grid", "type": "2d_array", "value": [[1,1,0,1,1],[1,1,0,1,1],[0,0,0,0,0],[1,1,0,1,1],[1,1,0,1,1]]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Number of Islands'), '[{"level": 1, "title": "Conceptual", "content": "Each connected group of 1s forms one island. If you could mark every cell of an island as visited once you discover it, you could simply count how many separate discoveries you make."}, {"level": 2, "title": "Strategy", "content": "Iterate over every cell. When you find an unvisited 1, increment the island count, then flood-fill (DFS or BFS) in all four directions from that cell, marking each connected land cell as visited so it is not counted again."}, {"level": 3, "title": "Implementation", "content": "For each cell (i,j): if grid[i][j] == 1, count++ and call dfs(i,j) which sets grid[i][j] = 0 (marks visited) then recursively calls itself on valid neighbouring cells that are still 1. Return count."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Number of Islands'), 'java', 'numIslands', '[{"name": "grid", "type": "2d_array"}]', 'integer',
$$class Solution {
    public int numIslands(int[][] grid) {
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
            String[] dims = sc.nextLine().trim().split("\\s+");
            int rows = Integer.parseInt(dims[0]);
            int cols = Integer.parseInt(dims[1]);
            int[][] grid = new int[rows][cols];
            for (int i = 0; i < rows; i++) {
                String[] parts = sc.nextLine().trim().split("\\s+");
                for (int j = 0; j < cols; j++) grid[i][j] = Integer.parseInt(parts[j]);
            }
            int result = sol.numIslands(grid);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int numIslands(int[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == 1) {
                    count++;
                    dfs(grid, i, j);
                }
            }
        }
        return count;
    }

    private void dfs(int[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != 1) return;
        grid[i][j] = 0;
        dfs(grid, i + 1, j);
        dfs(grid, i - 1, j);
        dfs(grid, i, j + 1);
        dfs(grid, i, j - 1);
    }
}$$),

((SELECT id FROM problems WHERE title='Number of Islands'), 'python', 'numIslands', '[{"name": "grid", "type": "2d_array"}]', 'integer',
$$class Solution:
    def numIslands(self, grid: list[list[int]]) -> int:
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
        dims = data[idx].strip().split(); idx += 1
        rows, cols = int(dims[0]), int(dims[1])
        grid = []
        for _ in range(rows):
            row = list(map(int, data[idx].strip().split())); idx += 1
            grid.append(row)
        result = sol.numIslands(grid)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def numIslands(self, grid: list[list[int]]) -> int:
        def dfs(i, j):
            if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]) or grid[i][j] != 1:
                return
            grid[i][j] = 0
            dfs(i + 1, j); dfs(i - 1, j)
            dfs(i, j + 1); dfs(i, j - 1)

        count = 0
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] == 1:
                    count += 1
                    dfs(i, j)
        return count
$$),

((SELECT id FROM problems WHERE title='Number of Islands'), 'cpp', 'numIslands', '[{"name": "grid", "type": "2d_array"}]', 'integer',
$$class Solution {
public:
    int numIslands(vector<vector<int>>& grid) {
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
    Solution sol;
    ostringstream out;
    for (int tc = 0; tc < t; tc++) {
        int rows, cols;
        cin >> rows >> cols;
        vector<vector<int>> grid(rows, vector<int>(cols));
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < cols; j++)
                cin >> grid[i][j];
        int result = sol.numIslands(grid);
        out << result << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    void dfs(vector<vector<int>>& grid, int i, int j) {
        if (i < 0 || i >= (int)grid.size() || j < 0 || j >= (int)grid[0].size() || grid[i][j] != 1) return;
        grid[i][j] = 0;
        dfs(grid, i + 1, j); dfs(grid, i - 1, j);
        dfs(grid, i, j + 1); dfs(grid, i, j - 1);
    }

    int numIslands(vector<vector<int>>& grid) {
        int count = 0;
        for (int i = 0; i < (int)grid.size(); i++) {
            for (int j = 0; j < (int)grid[0].size(); j++) {
                if (grid[i][j] == 1) {
                    count++;
                    dfs(grid, i, j);
                }
            }
        }
        return count;
    }
};$$);
