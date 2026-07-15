-- =========================================================
-- PROBLEM: Level Order Traversal of Binary Tree
-- Difficulty: Medium | Category: Trees | Topic: BFS
-- Output: 2d_array where each inner array is one level
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Level Order Traversal of Binary Tree', 
'Given the root of a binary tree, return the level order traversal of its node values as a 2D array, where each inner array contains the values of nodes at that depth level from left to right.', 
'Medium', 'Trees', 'BFS', 
'[{"input": "root = [3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]"}]', 
'0 <= number of nodes <= 2000, -1000 <= node.val <= 1000', 'O(n)', 'O(n)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Level Order Traversal of Binary Tree'), false, '[
  [{"name": "root", "type": "tree", "value": [3,9,20,null,null,15,7]}],
  [{"name": "root", "type": "tree", "value": [1]}],
  [{"name": "root", "type": "tree", "value": []}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Level Order Traversal of Binary Tree'), true, '[
  [{"name": "root", "type": "tree", "value": [1,2]}],
  [{"name": "root", "type": "tree", "value": [1,null,2]}],
  [{"name": "root", "type": "tree", "value": [1,2,3]}],
  [{"name": "root", "type": "tree", "value": [1,2,3,4,5,6,7]}],
  [{"name": "root", "type": "tree", "value": [1,2,null,3,null,4]}],
  [{"name": "root", "type": "tree", "value": [5,4,8,11,null,13,4,7,2,null,null,null,1]}],
  [{"name": "root", "type": "tree", "value": [0,-1,1]}],
  [{"name": "root", "type": "tree", "value": [10,5,15,3,7,null,18]}],
  [{"name": "root", "type": "tree", "value": [1,2,3,null,null,4,5]}],
  [{"name": "root", "type": "tree", "value": [-10,-5,-3]}],
  [{"name": "root", "type": "tree", "value": [100,50,150,25,75,125,175]}],
  [{"name": "root", "type": "tree", "value": [1,null,2,null,3,null,4]}],
  [{"name": "root", "type": "tree", "value": [4,2,6,1,3,5,7]}],
  [{"name": "root", "type": "tree", "value": [1,2,3,4,null,null,5,6,null,null,7]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Level Order Traversal of Binary Tree'), 
'[{"level": 1, "title": "Conceptual", "content": "Level order means visiting nodes row by row from top to bottom. A queue naturally processes nodes in the order they were added, which matches the left-to-right, top-to-bottom access pattern needed here."}, 
{"level": 2, "title": "Strategy", "content": "Use a queue (BFS). Start by adding the root. At each step, record how many nodes are currently in the queue — that count is exactly how many nodes belong to the current level. Process that many nodes, collect their values, and add their children for the next level."}, 
{"level": 3, "title": "Implementation", "content": "Add root to queue. While queue is not empty: levelSize = queue.size(); collect levelSize nodes into a level list while enqueuing their non-null children. Append the level list to results. Return results when queue is empty."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Level Order Traversal of Binary Tree'), 'java', 'levelOrder', '[{"name": "root", "type": "tree"}]', '2d_array',
$$class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        // Write your solution here
        return new ArrayList<>();
    }
}$$,
$$import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}

---INSERT USER CODE HERE---

public class Main {
    static TreeNode buildTree(String[] tokens) {
        if (tokens.length == 0 || tokens[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(tokens[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        int i = 1;
        while (!queue.isEmpty() && i < tokens.length) {
            TreeNode curr = queue.poll();
            if (i < tokens.length) {
                String t = tokens[i++];
                if (!t.equals("null")) { curr.left = new TreeNode(Integer.parseInt(t)); queue.add(curr.left); }
            }
            if (i < tokens.length) {
                String t = tokens[i++];
                if (!t.equals("null")) { curr.right = new TreeNode(Integer.parseInt(t)); queue.add(curr.right); }
            }
        }
        return root;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = Integer.parseInt(sc.nextLine().trim());
        StringBuilder sb = new StringBuilder();
        Solution sol = new Solution();
        for (int tc = 0; tc < t; tc++) {
            int n = Integer.parseInt(sc.nextLine().trim());
            String[] tokens = n > 0 ? sc.nextLine().trim().split("\\s+") : new String[0];
            if (n == 0) sc.nextLine();
            TreeNode root = buildTree(tokens);
            List<List<Integer>> result = sol.levelOrder(root);
            sb.append(result.toString());
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode curr = queue.poll();
                level.add(curr.val);
                if (curr.left != null) queue.add(curr.left);
                if (curr.right != null) queue.add(curr.right);
            }
            result.add(level);
        }
        return result;
    }
}$$),

((SELECT id FROM problems WHERE title='Level Order Traversal of Binary Tree'), 'python', 'levelOrder', '[{"name": "root", "type": "tree"}]', '2d_array',
$$class Solution:
    def levelOrder(self, root: 'TreeNode') -> list[list[int]]:
        # Write your solution here
        return []
$$,
$$import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

---INSERT USER CODE HERE---

def build_tree(tokens):
    if not tokens or tokens[0] == 'null':
        return None
    root = TreeNode(int(tokens[0]))
    queue = deque([root])
    i = 1
    while queue and i < len(tokens):
        curr = queue.popleft()
        if i < len(tokens):
            tok = tokens[i]; i += 1
            if tok != 'null':
                curr.left = TreeNode(int(tok))
                queue.append(curr.left)
        if i < len(tokens):
            tok = tokens[i]; i += 1
            if tok != 'null':
                curr.right = TreeNode(int(tok))
                queue.append(curr.right)
    return root

def main():
    data = sys.stdin.read().split('\n')
    idx = 0
    t = int(data[idx].strip()); idx += 1
    sol = Solution()
    output = []
    for _ in range(t):
        n = int(data[idx].strip()); idx += 1
        tokens = data[idx].strip().split() if n > 0 else []
        idx += 1
        root = build_tree(tokens)
        result = sol.levelOrder(root)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def levelOrder(self, root: 'TreeNode') -> list[list[int]]:
        if not root:
            return []
        result = []
        queue = deque([root])
        while queue:
            size = len(queue)
            level = []
            for _ in range(size):
                curr = queue.popleft()
                level.append(curr.val)
                if curr.left: queue.append(curr.left)
                if curr.right: queue.append(curr.right)
            result.append(level)
        return result
$$),

((SELECT id FROM problems WHERE title='Level Order Traversal of Binary Tree'), 'cpp', 'levelOrder', '[{"name": "root", "type": "tree"}]', '2d_array',
$$class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        // Write your solution here
        return {};
    }
};$$,
$$#include <bits/stdc++.h>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode* left, TreeNode* right) : val(x), left(left), right(right) {}
};

---INSERT USER CODE HERE---

TreeNode* buildTree(vector<string>& tokens) {
    if (tokens.empty() || tokens[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size()) {
            string tok = tokens[i++];
            if (tok != "null") { curr->left = new TreeNode(stoi(tok)); q.push(curr->left); }
        }
        if (i < tokens.size()) {
            string tok = tokens[i++];
            if (tok != "null") { curr->right = new TreeNode(stoi(tok)); q.push(curr->right); }
        }
    }
    return root;
}

int main() {
    int t;
    cin >> t;
    cin.ignore();
    Solution sol;
    ostringstream out;
    for (int tc = 0; tc < t; tc++) {
        int n; cin >> n; cin.ignore();
        vector<string> tokens;
        if (n > 0) {
            string line; getline(cin, line);
            stringstream ss(line); string tok;
            while (ss >> tok) tokens.push_back(tok);
        } else {
            string line; getline(cin, line);
        }
        TreeNode* root = buildTree(tokens);
        vector<vector<int>> result = sol.levelOrder(root);
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
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (!root) return result;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int size = q.size();
            vector<int> level;
            for (int i = 0; i < size; i++) {
                TreeNode* curr = q.front(); q.pop();
                level.push_back(curr->val);
                if (curr->left) q.push(curr->left);
                if (curr->right) q.push(curr->right);
            }
            result.push_back(level);
        }
        return result;
    }
};$$);
