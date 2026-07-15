-- =========================================================
-- PROBLEM: Detect Cycle in Linked List
-- Difficulty: Medium | Category: Linked Lists | Topic: Fast & Slow Pointers
-- NOTE: cycle cannot be serialized as a plain array (infinite). Uses LeetCode convention:
-- "head" linked_list array (no nulls, terminates normally) + "pos" integer = index where
-- tail connects to form a cycle (-1 means no cycle). Driver builds list then manually
-- wires tail->next to node at index pos if pos != -1.
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Detect Cycle in Linked List', 'Given the head of a linked list and an integer pos indicating the index (0-based) of the node that the tail connects to (or -1 if there is no cycle), return true if there is a cycle in the linked list, or false otherwise.', 'Medium', 'Linked Lists', 'Fast & Slow Pointers', '[{"input": "head = [3,2,0,-4], pos = 1", "output": "true"}]', '0 <= number of nodes <= 10^4, -10^5 <= node.val <= 10^5, -1 <= pos < number of nodes', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Detect Cycle in Linked List'), false, '[
  [{"name": "head", "type": "linked_list", "value": [3,2,0,-4]}, {"name": "pos", "type": "integer", "value": 1}],
  [{"name": "head", "type": "linked_list", "value": [1,2]}, {"name": "pos", "type": "integer", "value": 0}],
  [{"name": "head", "type": "linked_list", "value": [1]}, {"name": "pos", "type": "integer", "value": -1}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Detect Cycle in Linked List'), true, '[
  [{"name": "head", "type": "linked_list", "value": []}, {"name": "pos", "type": "integer", "value": -1}],
  [{"name": "head", "type": "linked_list", "value": [1]}, {"name": "pos", "type": "integer", "value": 0}],
  [{"name": "head", "type": "linked_list", "value": [1,2,3]}, {"name": "pos", "type": "integer", "value": -1}],
  [{"name": "head", "type": "linked_list", "value": [1,2,3]}, {"name": "pos", "type": "integer", "value": 2}],
  [{"name": "head", "type": "linked_list", "value": [1,2,3,4,5]}, {"name": "pos", "type": "integer", "value": 0}],
  [{"name": "head", "type": "linked_list", "value": [1,2,3,4,5]}, {"name": "pos", "type": "integer", "value": 4}],
  [{"name": "head", "type": "linked_list", "value": [1,2,3,4,5]}, {"name": "pos", "type": "integer", "value": -1}],
  [{"name": "head", "type": "linked_list", "value": [5,4,3,2,1]}, {"name": "pos", "type": "integer", "value": 2}],
  [{"name": "head", "type": "linked_list", "value": [-1,-2,-3]}, {"name": "pos", "type": "integer", "value": 1}],
  [{"name": "head", "type": "linked_list", "value": [0,0,0,0]}, {"name": "pos", "type": "integer", "value": -1}],
  [{"name": "head", "type": "linked_list", "value": [0,0,0,0]}, {"name": "pos", "type": "integer", "value": 3}],
  [{"name": "head", "type": "linked_list", "value": [10,20,30,40,50,60]}, {"name": "pos", "type": "integer", "value": 5}],
  [{"name": "head", "type": "linked_list", "value": [100000,-100000]}, {"name": "pos", "type": "integer", "value": -1}],
  [{"name": "head", "type": "linked_list", "value": [1,2,3,4,5,6,7,8]}, {"name": "pos", "type": "integer", "value": 3}],
  [{"name": "head", "type": "linked_list", "value": [7,7,7]}, {"name": "pos", "type": "integer", "value": 0}],
  [{"name": "head", "type": "linked_list", "value": [2,4,6,8,10]}, {"name": "pos", "type": "integer", "value": -1}],
  [{"name": "head", "type": "linked_list", "value": [9,8,7,6]}, {"name": "pos", "type": "integer", "value": 1}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Detect Cycle in Linked List'), '[{"level": 1, "title": "Conceptual", "content": "If you walk through a linked list with a cycle forever, you would never reach null. Two pointers moving at different speeds will eventually meet if and only if a cycle exists."}, {"level": 2, "title": "Strategy", "content": "Use Floyd''s Tortoise and Hare algorithm. Move a slow pointer one step at a time and a fast pointer two steps at a time. If they ever point to the same node, there is a cycle. If the fast pointer reaches null, there is no cycle."}, {"level": 3, "title": "Implementation", "content": "slow = head, fast = head. While fast != null and fast.next != null: slow = slow.next; fast = fast.next.next; if slow == fast, return true. If the loop exits naturally, return false."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Detect Cycle in Linked List'), 'java', 'hasCycle', '[{"name": "head", "type": "linked_list"}]', 'boolean',
$$class Solution {
    public boolean hasCycle(ListNode head) {
        // Write your solution here
        return false;
    }
}$$,
$$import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

---INSERT USER CODE HERE---

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = Integer.parseInt(sc.nextLine().trim());
        StringBuilder sb = new StringBuilder();
        Solution sol = new Solution();
        for (int tc = 0; tc < t; tc++) {
            int n = Integer.parseInt(sc.nextLine().trim());
            String[] tokens = n > 0 ? sc.nextLine().trim().split("\\s+") : new String[0];
            if (n == 0) sc.nextLine();
            int pos = Integer.parseInt(sc.nextLine().trim());

            ListNode[] nodes = new ListNode[n];
            for (int i = 0; i < n; i++) nodes[i] = new ListNode(Integer.parseInt(tokens[i]));
            for (int i = 0; i < n - 1; i++) nodes[i].next = nodes[i + 1];
            if (pos != -1 && n > 0) nodes[n - 1].next = nodes[pos];

            ListNode head = n > 0 ? nodes[0] : null;
            boolean result = sol.hasCycle(head);
            sb.append(result);
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}$$),

((SELECT id FROM problems WHERE title='Detect Cycle in Linked List'), 'python', 'hasCycle', '[{"name": "head", "type": "linked_list"}]', 'boolean',
$$class Solution:
    def hasCycle(self, head: 'ListNode') -> bool:
        # Write your solution here
        return False
$$,
$$import sys

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

---INSERT USER CODE HERE---

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
        pos = int(data[idx].strip()); idx += 1

        nodes = [ListNode(int(tokens[i])) for i in range(n)]
        for i in range(n - 1):
            nodes[i].next = nodes[i + 1]
        if pos != -1 and n > 0:
            nodes[-1].next = nodes[pos]

        head = nodes[0] if n > 0 else None
        result = sol.hasCycle(head)
        output.append(str(result).lower())
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def hasCycle(self, head: 'ListNode') -> bool:
        slow, fast = head, head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False
$$),

((SELECT id FROM problems WHERE title='Detect Cycle in Linked List'), 'cpp', 'hasCycle', '[{"name": "head", "type": "linked_list"}]', 'boolean',
$$class Solution {
public:
    bool hasCycle(ListNode* head) {
        // Write your solution here
        return false;
    }
};$$,
$$#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode* next) : val(x), next(next) {}
};

---INSERT USER CODE HERE---

int main() {
    int t;
    cin >> t;
    Solution sol;
    ostringstream out;
    for (int tc = 0; tc < t; tc++) {
        int n;
        cin >> n;
        vector<int> vals(n);
        for (int i = 0; i < n; i++) cin >> vals[i];
        int pos;
        cin >> pos;

        vector<ListNode*> nodes(n);
        for (int i = 0; i < n; i++) nodes[i] = new ListNode(vals[i]);
        for (int i = 0; i < n - 1; i++) nodes[i]->next = nodes[i + 1];
        if (pos != -1 && n > 0) nodes[n - 1]->next = nodes[pos];

        ListNode* head = n > 0 ? nodes[0] : nullptr;
        bool result = sol.hasCycle(head);
        out << (result ? "true" : "false") << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};$$);