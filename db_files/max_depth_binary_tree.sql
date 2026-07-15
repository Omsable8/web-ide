-- =========================================================
-- PROBLEM: Max Depth of Binary Tree
-- Difficulty: Easy | Category: Trees | Topic: DFS / Recursion
-- NOTE: tree type "tree", LeetCode-style level-order array with "null" tokens.
-- stdin: count of tokens, then space-separated tokens (ints and literal "null").
-- Driver builds tree via queue-based level-order construction.
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Max Depth of Binary Tree', 
'Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.', 
'Easy', 'Trees', 'DFS / Recursion', 
'[{"input": "root = [3,9,20,null,null,15,7]", "output": "3"}]', 
'0 <= number of nodes <= 10^4, -100 <= node.val <= 100', 'O(n)', 'O(h)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Max Depth of Binary Tree'), false, '[
  [{"name": "root", "type": "tree", "value": [3,9,20,null,null,15,7]}],
  [{"name": "root", "type": "tree", "value": [1,null,2]}],
  [{"name": "root", "type": "tree", "value": []}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Max Depth of Binary Tree'), true, '[
  [{"name": "root", "type": "tree", "value": [1]}],
  [{"name": "root", "type": "tree", "value": [1,2]}],
  [{"name": "root", "type": "tree", "value": [1,null,2]}],
  [{"name": "root", "type": "tree", "value": [1,2,3]}],
  [{"name": "root", "type": "tree", "value": [1,2,3,4,5,6,7]}],
  [{"name": "root", "type": "tree", "value": [1,2,null,3,null,4,null,5]}],
  [{"name": "root", "type": "tree", "value": [5,4,8,11,null,13,4,7,2,null,null,null,1]}],
  [{"name": "root", "type": "tree", "value": [0]}],
  [{"name": "root", "type": "tree", "value": [-1,-2,-3]}],
  [{"name": "root", "type": "tree", "value": [1,null,2,null,3,null,4]}],
  [{"name": "root", "type": "tree", "value": [1,2,3,null,null,4,5]}],
  [{"name": "root", "type": "tree", "value": [10,5,15,3,7,null,18]}],
  [{"name": "root", "type": "tree", "value": [1,2,2,3,3,null,null,4,4]}],
  [{"name": "root", "type": "tree", "value": [100,50,150,25,75,125,175]}],
  [{"name": "root", "type": "tree", "value": [1,2,3,4,null,null,5,6,null,null,7]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Max Depth of Binary Tree'), '[{"level": 1, "title": "Conceptual", "content": "The depth of a tree rooted at a node is 1 (for the node itself) plus the deeper of its two subtrees. This naturally suggests solving the problem recursively."}, {"level": 2, "title": "Strategy", "content": "If the current node is null, its depth is 0. Otherwise, recursively find the depth of the left subtree and the right subtree, take the larger of the two, and add 1 for the current node."}, {"level": 3, "title": "Implementation", "content": "maxDepth(node): if node is null, return 0. Otherwise return 1 + max(maxDepth(node.left), maxDepth(node.right))."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Max Depth of Binary Tree'), 'java', 'maxDepth', '[{"name": "root", "type": "tree"}]', 'integer',
$$class Solution {
    public int maxDepth(TreeNode root) {
        // Write your solution here
        return 0;
    }
}$$,
$$import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
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
                String leftTok = tokens[i++];
                if (!leftTok.equals("null")) {
                    curr.left = new TreeNode(Integer.parseInt(leftTok));
                    queue.add(curr.left);
                }
            }
            if (i < tokens.length) {
                String rightTok = tokens[i++];
                if (!rightTok.equals("null")) {
                    curr.right = new TreeNode(Integer.parseInt(rightTok));
                    queue.add(curr.right);
                }
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
            String[] tokens;
            if (n > 0) {
                tokens = sc.nextLine().trim().split("\\s+");
            } else if(n==0 && tc!=t-1){
                sc.nextLine();
                tokens = new String[0];
            }else{tokens = new String[0];}
            TreeNode root = buildTree(tokens);
            int result = sol.maxDepth(root);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}$$),

((SELECT id FROM problems WHERE title='Max Depth of Binary Tree'), 'python', 'maxDepth', '[{"name": "root", "type": "tree"}]', 'integer',
$$class Solution:
    def maxDepth(self, root: 'TreeNode') -> int:
        # Write your solution here
        return 0
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
            left_tok = tokens[i]; i += 1
            if left_tok != None:
                curr.left = TreeNode(int(left_tok))
                queue.append(curr.left)
        if i < len(tokens):
            right_tok = tokens[i]; i += 1
            if right_tok != None:
                curr.right = TreeNode(int(right_tok))
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
        if n > 0:
            tokens = data[idx].strip().split(); idx += 1
        else:
            tokens = []
            idx += 1
        root = build_tree(tokens)
        result = sol.maxDepth(root)
        output.append(str(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def maxDepth(self, root: 'TreeNode') -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
$$),

((SELECT id FROM problems WHERE title='Max Depth of Binary Tree'), 'cpp', 'maxDepth', '[{"name": "root", "type": "tree"}]', 'integer',
$$class Solution {
public:
    int maxDepth(TreeNode* root) {
        // Write your solution here
        return 0;
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
        TreeNode* curr = q.front();
        q.pop();
        if (i < tokens.size()) {
            string leftTok = tokens[i++];
            if (leftTok != "null") {
                curr->left = new TreeNode(stoi(leftTok));
                q.push(curr->left);
            }
        }
        if (i < tokens.size()) {
            string rightTok = tokens[i++];
            if (rightTok != "null") {
                curr->right = new TreeNode(stoi(rightTok));
                q.push(curr->right);
            }
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
        int n;
        cin >> n;
        cin.ignore();
        vector<string> tokens;
        if (n > 0) {
            string line;
            getline(cin, line);
            stringstream ss(line);
            string tok;
            while (ss >> tok) tokens.push_back(tok);
        } else {
            string line;
            getline(cin, line);
        }
        TreeNode* root = buildTree(tokens);
        int result = sol.maxDepth(root);
        out << result << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};$$);