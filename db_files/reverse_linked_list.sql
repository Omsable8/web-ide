-- =========================================================
-- PROBLEM: Reverse a Linked List
-- Difficulty: Easy | Category: Linked Lists | Topic: Pointers
-- NOTE: list represented as type "linked_list", level-order array with "null" sentinel
-- (a singly linked list has no branching so "null" only ever appears as a terminator,
-- but we keep the convention consistent with build_stdin's null-token handling)
-- Driver builds a ListNode chain from the array, runs solution, serializes back to array.
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Reverse a Linked List', 'Given the head of a singly linked list, reverse the list and return the new head.', 'Easy', 'Linked Lists', 'Pointers', '[{"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}]', '0 <= list length <= 5000, -10^5 <= node.val <= 10^5', 'O(n)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse a Linked List'), false, '[
  [{"name": "head", "type": "linked_list", "value": [1,2,3,4,5]}],
  [{"name": "head", "type": "linked_list", "value": [1,2]}],
  [{"name": "head", "type": "linked_list", "value": []}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Reverse a Linked List'), true, '[
  [{"name": "head", "type": "linked_list", "value": [1]}],
  [{"name": "head", "type": "linked_list", "value": [0,0]}],
  [{"name": "head", "type": "linked_list", "value": [-1,-2,-3]}],
  [{"name": "head", "type": "linked_list", "value": [5,4,3,2,1]}],
  [{"name": "head", "type": "linked_list", "value": [100000,-100000]}],
  [{"name": "head", "type": "linked_list", "value": [1,1,1,1]}],
  [{"name": "head", "type": "linked_list", "value": [3,1,4,1,5,9,2,6]}],
  [{"name": "head", "type": "linked_list", "value": [10,20,30]}],
  [{"name": "head", "type": "linked_list", "value": [-5,0,5]}],
  [{"name": "head", "type": "linked_list", "value": [2,2,2]}],
  [{"name": "head", "type": "linked_list", "value": [7]}],
  [{"name": "head", "type": "linked_list", "value": [1,2,3,4,5,6,7,8,9,10]}],
  [{"name": "head", "type": "linked_list", "value": [-100000,100000]}],
  [{"name": "head", "type": "linked_list", "value": [9,8,7,6,5]}],
  [{"name": "head", "type": "linked_list", "value": [4,3,2,1,0,-1]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse a Linked List'), '[{"level": 1, "title": "Conceptual", "content": "Each node points to the next one. To reverse the list, every node needs to point to its previous node instead. The tricky part is not losing track of the rest of the list once you change a pointer."}, {"level": 2, "title": "Strategy", "content": "Walk through the list one node at a time, keeping track of the previous node. Before reversing the current node''s pointer, save a reference to the next node so you do not lose the rest of the list."}, {"level": 3, "title": "Implementation", "content": "prev = null, curr = head. While curr is not null: next = curr.next; curr.next = prev; prev = curr; curr = next. Return prev as the new head."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Reverse a Linked List'), 'java', 'reverseList', '[{"name": "head", "type": "linked_list"}]', 'linked_list',
$$class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        return null;
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
    static ListNode buildList(String[] tokens) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (String tok : tokens) {
            if (tok.isEmpty()) continue;
            curr.next = new ListNode(Integer.parseInt(tok));
            curr = curr.next;
        }
        return dummy.next;
    }

    static String serialize(ListNode head) {
        StringBuilder sb = new StringBuilder("[");
        ListNode curr = head;
        boolean first = true;
        while (curr != null) {
            if (!first) sb.append(", ");
            sb.append(curr.val);
            first = false;
            curr = curr.next;
        }
        sb.append("]");
        return sb.toString();
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
            } else if(n==0 && tc != t-1){
                sc.nextLine();
                tokens = new String[0];
            }else{tokens = new String[0];}
            ListNode head = buildList(tokens);
            ListNode result = sol.reverseList(head);
            sb.append(serialize(result));
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}$$),

((SELECT id FROM problems WHERE title='Reverse a Linked List'), 'python', 'reverseList', '[{"name": "head", "type": "linked_list"}]', 'linked_list',
$$class Solution:
    def reverseList(self, head: 'ListNode') -> 'ListNode':
        # Write your solution here
        return None
$$,
$$import sys

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

---INSERT USER CODE HERE---

def build_list(tokens):
    dummy = ListNode(0)
    curr = dummy
    for tok in tokens:
        if tok == '':
            continue
        curr.next = ListNode(int(tok))
        curr = curr.next
    return dummy.next

def serialize(head):
    vals = []
    curr = head
    while curr:
        vals.append(str(curr.val))
        curr = curr.next
    return '[' + ', '.join(vals) + ']'

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
        head = build_list(tokens)
        result = sol.reverseList(head)
        output.append(serialize(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def reverseList(self, head: 'ListNode') -> 'ListNode':
        prev = None
        curr = head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev
$$),

((SELECT id FROM problems WHERE title='Reverse a Linked List'), 'cpp', 'reverseList', '[{"name": "head", "type": "linked_list"}]', 'linked_list',
$$class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your solution here
        return nullptr;
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

ListNode* buildList(vector<int>& vals) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    for (int v : vals) {
        curr->next = new ListNode(v);
        curr = curr->next;
    }
    return dummy.next;
}

string serialize(ListNode* head) {
    ostringstream out;
    out << "[";
    ListNode* curr = head;
    bool first = true;
    while (curr) {
        if (!first) out << ", ";
        out << curr->val;
        first = false;
        curr = curr->next;
    }
    out << "]";
    return out.str();
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
        vector<int> vals(n);
        for (int i = 0; i < n; i++) cin >> vals[i];
        cin.ignore();
        ListNode* head = buildList(vals);
        ListNode* result = sol.reverseList(head);
        out << serialize(result) << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
};$$);