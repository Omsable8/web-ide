-- =========================================================
-- PROBLEM: Validate Binary Search Tree
-- Difficulty: Hard | Category: Trees | Topic: DFS / BST
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Validate Binary Search Tree', 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST satisfies: the left subtree of every node contains only nodes with values strictly less than the node''s value; the right subtree contains only nodes with values strictly greater; and both subtrees must themselves be valid BSTs.', 'Hard', 'Trees', 'DFS / BST', '[{"input": "root = [2,1,3]", "output": "true"}]', '1 <= number of nodes <= 10^4, -2^31 <= node.val <= 2^31-1', 'O(n)', 'O(h)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Validate Binary Search Tree'), false, '[
  [{"name": "root", "type": "tree", "value": [2,1,3]}],
  [{"name": "root", "type": "tree", "value": [5,1,4,null,null,3,6]}],
  [{"name": "root", "type": "tree", "value": [1]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Validate Binary Search Tree'), true, '[
  [{"name": "root", "type": "tree", "value": [2,2,2]}],
  [{"name": "root", "type": "tree", "value": [1,null,2]}],
  [{"name": "root", "type": "tree", "value": [2,1,3,null,null,null,null]}],
  [{"name": "root", "type": "tree", "value": [5,4,6,null,null,3,7]}],
  [{"name": "root", "type": "tree", "value": [10,5,15,3,7,null,18]}],
  [{"name": "root", "type": "tree", "value": [10,5,15,3,7,12,18]}],
  [{"name": "root", "type": "tree", "value": [3,1,5,0,2,4,6]}],
  [{"name": "root", "type": "tree", "value": [3,1,5,0,2,4,3]}],
  [{"name": "root", "type": "tree", "value": [0]}],
  [{"name": "root", "type": "tree", "value": [-1]}],
  [{"name": "root", "type": "tree", "value": [1,null,1]}],
  [{"name": "root", "type": "tree", "value": [1,1,null]}],
  [{"name": "root", "type": "tree", "value": [5,3,7,2,4,6,8]}],
  [{"name": "root", "type": "tree", "value": [5,3,7,2,6,4,8]}],
  [{"name": "root", "type": "tree", "value": [50,25,75,10,35,60,90,5,15,30,40,55,65,80,100]}],
  [{"name": "root", "type": "tree", "value": [50,25,75,10,35,60,90,5,15,30,40,55,80,70,100]}],
  [{"name": "root", "type": "tree", "value": [100,-100,null]}],
  [{"name": "root", "type": "tree", "value": [-100,null,100]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Validate Binary Search Tree'), '[{"level": 1, "title": "Conceptual", "content": "A common mistake is only checking that a node''s left child is less and right child is greater. That is not enough. Every node in the entire left subtree must be less than the root, not just the immediate child."}, {"level": 2, "title": "Strategy", "content": "Pass down valid (min, max) bounds for each node as you recurse. The root can be any value. When you go left, the current node''s value becomes the new upper bound. When you go right, it becomes the new lower bound."}, {"level": 3, "title": "Implementation", "content": "isValid(node, min, max): if node is null, return true. If node.val <= min or node.val >= max, return false. Return isValid(node.left, min, node.val) AND isValid(node.right, node.val, max). Call with isValid(root, Long.MIN_VALUE, Long.MAX_VALUE)."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Validate Binary Search Tree'), 'java', 'isValidBST', '[{"name": "root", "type": "tree"}]', 'boolean',
$$class Solution {
    public boolean isValidBST(TreeNode root) {
        // Write your solution here
        return false;
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
                String tok = tokens[i++];
                if (!tok.equals("null")) { curr.left = new TreeNode(Integer.parseInt(tok)); queue.add(curr.left); }
            }
            if (i < tokens.length) {
                String tok = tokens[i++];
                if (!tok.equals("null")) { curr.right = new TreeNode(Integer.parseInt(tok)); queue.add(curr.right); }
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
            if (n == 0 && tc != t-1) sc.nextLine();
            TreeNode root = buildTree(tokens);
            boolean result = sol.isValidBST(root);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true;
        if (node.val <= min || node.val >= max) return false;
        return validate(node.left, min, node.val) && validate(node.right, node.val, max);
    }
}$$),

((SELECT id FROM problems WHERE title='Validate Binary Search Tree'), 'python', 'isValidBST', '[{"name": "root", "type": "tree"}]', 'boolean',
$$class Solution:
    def isValidBST(self, root: 'TreeNode') -> bool:
        # Write your solution here
        return False
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
        result = sol.isValidBST(root)
        output.append(str(result).lower())
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def isValidBST(self, root: 'TreeNode') -> bool:
        def validate(node, min_val, max_val):
            if not node:
                return True
            if node.val <= min_val or node.val >= max_val:
                return False
            return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)
        return validate(root, float('-inf'), float('inf'))
$$),

((SELECT id FROM problems WHERE title='Validate Binary Search Tree'), 'cpp', 'isValidBST', '[{"name": "root", "type": "tree"}]', 'boolean',
$$class Solution {
public:
    bool isValidBST(TreeNode* root) {
        // Write your solution here
        return false;
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
        bool result = sol.isValidBST(root);
        out << (result ? "true" : "false") << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return validate(root, LLONG_MIN, LLONG_MAX);
    }

    bool validate(TreeNode* node, long long minVal, long long maxVal) {
        if (!node) return true;
        if (node->val <= minVal || node->val >= maxVal) return false;
        return validate(node->left, minVal, node->val) && validate(node->right, node->val, maxVal);
    }
};$$);
