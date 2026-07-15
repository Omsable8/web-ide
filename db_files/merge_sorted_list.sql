-- =========================================================
-- PROBLEM: Merge Two Sorted Lists
-- Difficulty: Medium | Category: Linked Lists | Topic: Two Pointers
-- =========================================================

INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
('Merge Two Sorted Lists', 'Given the heads of two sorted singly linked lists list1 and list2, merge them into a single sorted linked list and return its head. The merged list should be made by splicing together the nodes of the first two lists.', 'Medium', 'Linked Lists', 'Two Pointers', '[{"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]"}]', '0 <= list length <= 50, -100 <= node.val <= 100, both lists sorted in non-decreasing order', 'O(n+m)', 'O(1)', 'learn');

INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
((SELECT id FROM problems WHERE title = 'Merge Two Sorted Lists'), false, '[
  [{"name": "list1", "type": "linked_list", "value": [1,2,4]}, {"name": "list2", "type": "linked_list", "value": [1,3,4]}],
  [{"name": "list1", "type": "linked_list", "value": []}, {"name": "list2", "type": "linked_list", "value": []}],
  [{"name": "list1", "type": "linked_list", "value": []}, {"name": "list2", "type": "linked_list", "value": [0]}]
]'::jsonb),
((SELECT id FROM problems WHERE title = 'Merge Two Sorted Lists'), true, '[
  [{"name": "list1", "type": "linked_list", "value": [1]}, {"name": "list2", "type": "linked_list", "value": []}],
  [{"name": "list1", "type": "linked_list", "value": []}, {"name": "list2", "type": "linked_list", "value": [1]}],
  [{"name": "list1", "type": "linked_list", "value": [1]}, {"name": "list2", "type": "linked_list", "value": [2]}],
  [{"name": "list1", "type": "linked_list", "value": [2]}, {"name": "list2", "type": "linked_list", "value": [1]}],
  [{"name": "list1", "type": "linked_list", "value": [1,1,1]}, {"name": "list2", "type": "linked_list", "value": [1,1]}],
  [{"name": "list1", "type": "linked_list", "value": [-5,-3,-1]}, {"name": "list2", "type": "linked_list", "value": [-4,-2,0]}],
  [{"name": "list1", "type": "linked_list", "value": [1,5,9]}, {"name": "list2", "type": "linked_list", "value": [2,3,4,6,7,8]}],
  [{"name": "list1", "type": "linked_list", "value": [100]}, {"name": "list2", "type": "linked_list", "value": [-100]}],
  [{"name": "list1", "type": "linked_list", "value": [0,0,0]}, {"name": "list2", "type": "linked_list", "value": [0,0]}],
  [{"name": "list1", "type": "linked_list", "value": [1,3,5,7,9]}, {"name": "list2", "type": "linked_list", "value": [1,3,5,7,9]}],
  [{"name": "list1", "type": "linked_list", "value": [-10,-5,0]}, {"name": "list2", "type": "linked_list", "value": [-8,-3,5]}],
  [{"name": "list1", "type": "linked_list", "value": [2,4,6,8]}, {"name": "list2", "type": "linked_list", "value": [1,3,5,7]}],
  [{"name": "list1", "type": "linked_list", "value": [5]}, {"name": "list2", "type": "linked_list", "value": [5]}],
  [{"name": "list1", "type": "linked_list", "value": [1,2,3,4,5]}, {"name": "list2", "type": "linked_list", "value": [6,7,8,9,10]}],
  [{"name": "list1", "type": "linked_list", "value": [6,7,8,9,10]}, {"name": "list2", "type": "linked_list", "value": [1,2,3,4,5]}],
  [{"name": "list1", "type": "linked_list", "value": [-1,0,1]}, {"name": "list2", "type": "linked_list", "value": [-1,0,1]}],
  [{"name": "list1", "type": "linked_list", "value": [3,6,9,12]}, {"name": "list2", "type": "linked_list", "value": [1,4,7,10]}]
]'::jsonb);

INSERT INTO hints (problem_id, hints_data) VALUES 
((SELECT id FROM problems WHERE title = 'Merge Two Sorted Lists'), '[{"level": 1, "title": "Conceptual", "content": "Since both lists are already sorted, the smallest unattached node between the two list heads always belongs next in the merged result."}, {"level": 2, "title": "Strategy", "content": "Use a dummy head node to simplify edge cases. Walk both lists with two pointers, comparing the current nodes and attaching the smaller one to the result, advancing only that pointer."}, {"level": 3, "title": "Implementation", "content": "dummy = new node, tail = dummy. While both list1 and list2 are non-null: if list1.val <= list2.val, tail.next = list1, list1 = list1.next; else tail.next = list2, list2 = list2.next; tail = tail.next. After the loop, attach whichever list still has remaining nodes. Return dummy.next."}]'::jsonb);

INSERT INTO code_templates (problem_id, language, function_name, input_params, return_type, template_code, driver_code, solution_code) VALUES
((SELECT id FROM problems WHERE title='Merge Two Sorted Lists'), 'java', 'mergeTwoLists', '[{"name": "list1", "type": "linked_list"}, {"name": "list2", "type": "linked_list"}]', 'linked_list',
$$class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
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
            int n1 = Integer.parseInt(sc.nextLine().trim());
            String[] tok1 = n1 > 0 ? sc.nextLine().trim().split("\\s+") : new String[0];
            if (n1 == 0) sc.nextLine();
            int n2 = Integer.parseInt(sc.nextLine().trim());
            String[] tok2 = n2 > 0 ? sc.nextLine().trim().split("\\s+") : new String[0];
            if (n2 == 0) sc.nextLine();

            ListNode list1 = buildList(tok1);
            ListNode list2 = buildList(tok2);
            ListNode result = sol.mergeTwoLists(list1, list2);
            sb.append(serialize(result));
            sb.append("---SEP---");
        }
        System.out.print(sb.toString());
    }
}$$,
$$class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1;
                list1 = list1.next;
            } else {
                tail.next = list2;
                list2 = list2.next;
            }
            tail = tail.next;
        }
        tail.next = (list1 != null) ? list1 : list2;
        return dummy.next;
    }
}$$),

((SELECT id FROM problems WHERE title='Merge Two Sorted Lists'), 'python', 'mergeTwoLists', '[{"name": "list1", "type": "linked_list"}, {"name": "list2", "type": "linked_list"}]', 'linked_list',
$$class Solution:
    def mergeTwoLists(self, list1: 'ListNode', list2: 'ListNode') -> 'ListNode':
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
        n1 = int(data[idx].strip()); idx += 1
        tok1 = data[idx].strip().split() if n1 > 0 else []
        idx += 1
        n2 = int(data[idx].strip()); idx += 1
        tok2 = data[idx].strip().split() if n2 > 0 else []
        idx += 1

        list1 = build_list(tok1)
        list2 = build_list(tok2)
        result = sol.mergeTwoLists(list1, list2)
        output.append(serialize(result))
        output.append('---SEP---')
    print(''.join(output), end='')

main()$$,
$$class Solution:
    def mergeTwoLists(self, list1: 'ListNode', list2: 'ListNode') -> 'ListNode':
        dummy = ListNode(0)
        tail = dummy
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next
        tail.next = list1 if list1 else list2
        return dummy.next
$$),

((SELECT id FROM problems WHERE title='Merge Two Sorted Lists'), 'cpp', 'mergeTwoLists', '[{"name": "list1", "type": "linked_list"}, {"name": "list2", "type": "linked_list"}]', 'linked_list',
$$class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
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
    Solution sol;
    ostringstream out;
    for (int tc = 0; tc < t; tc++) {
        int n1;
        cin >> n1;
        vector<int> v1(n1);
        for (int i = 0; i < n1; i++) cin >> v1[i];
        int n2;
        cin >> n2;
        vector<int> v2(n2);
        for (int i = 0; i < n2; i++) cin >> v2[i];

        ListNode* list1 = buildList(v1);
        ListNode* list2 = buildList(v2);
        ListNode* result = sol.mergeTwoLists(list1, list2);
        out << serialize(result) << "---SEP---";
    }
    cout << out.str();
    return 0;
}$$,
$$class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = list1;
                list1 = list1->next;
            } else {
                tail->next = list2;
                list2 = list2->next;
            }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};$$);