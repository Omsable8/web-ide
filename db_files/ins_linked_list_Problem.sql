-- Problems
-- INSERT INTO problems (title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode) VALUES 
-- ('Reverse Linked List', 'Given the head of a Singly Linked List, Return the reverse order of the linked_list', 'Medium', 'Linked List', 'Reversal', '[{"input": "[1,2,3,4,5]", "output": "[5,4,3,2,1]"},{"input": "[1]", "output": "[1]"}]', '0 <= list.length <= 10^4', 'O(N)', 'O(1)', 'compete');

-- -- TestCases
-- INSERT INTO test_cases (problem_id, is_hidden, input_params) VALUES 
-- ((SELECT id FROM problems WHERE title = 'Reverse Linked List'), false, '[[{"name":"head", "type":"linked_list","value":[1,2,3,4,5]}], [{"name":"head", "type":"linked_list","value":[1]}]]'::jsonb),
-- ((SELECT id FROM problems WHERE title = 'Reverse Linked List'), true, '[[{"name":"head","type":"linked_list", "value":[]}], [{"name":"head","type":"linked_list", "value":[1,2]}], [{"name":"head","type":"linked_list", "value":[10,20,30,40]}]]'::jsonb);

-- -- hints

-- INSERT INTO hints (problem_id, hints_data) VALUES 
-- ((SELECT id FROM problems WHERE title = 'Reverse Linked List'), '[{"level": 1, "title": "Conceptual", "content": "Traverse the list and figure how to store elements in reverse order"}, {"level": 2, "title": "Logic", "content": "create a stack or 3 pointers"}, {"level": 3, "title": "psuedo code", "content": "Create prev, curr and nxt pointers to store previous, current and next nodes, respectively. In each iteration, change the curr nodes next pointer to point to previous node."}]'::jsonb);

-- templates

INSERT INTO code_templates (problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code) VALUES 
((SELECT id FROM problems WHERE title = 'Reverse Linked List'), 'cpp', $$#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>

using namespace std;

class ListNode {
public:
    int val;
    ListNode* next;

    ListNode(int v) : val(v), next(NULL) {}

    /**
     * Parses a string like "1 2 3 4" and returns the head of a Linked List.
     */
    static ListNode* makeList(string s) {
        if (s == "[]" || s.empty()) return NULL;

        stringstream ss(s);
        string item;
        ListNode* dummy = new ListNode(0);
        ListNode* curr = dummy;

        while (getline(ss, item, ' ')) {
            if (!item.empty()) {
                curr->next = new ListNode(stoi(item));
                curr = curr->next;
            }
        }
        return dummy->next;
    }

    /**
     * Returns a string representation of the list in "[1,2,3]" format.
     */
    string print() {
        string res = "[";
        ListNode* temp = this;
        while (temp != NULL) {
            res += to_string(temp->val);
            if (temp->next != NULL) res += ",";
            temp = temp->next;
        }
        res += "]";
        return res;
    }
};

class Solution {
public:
    ListNode* reverse(ListNode* head) {
        // Your code here
        return NULL;
    }
};$$, 'reverse', '[{"name": "head", "type": "linked_list"}]'::jsonb, 'ListNode*', $$
int main() {
    int t;
    if (!(cin >> t)) return 0;
    Solution sol;
    
    while (t--) {
        string input;
        int length;
        cin>>length;
        for(int i=0;i<length;i++){
            string inp;
            cin >>inp;
            input+= inp+" ";
        }
        
        ListNode* head = ListNode::makeList(input);
        ListNode* reversedHead = sol.reverse(head);

        if (reversedHead == NULL) {
            cout << "[]" << endl;
        } else {
            cout << reversedHead->print() <<"---SEP---";
        }
        
        // Memory cleanup could be added here for production
    }
    return 0;
}
$$, $$#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>

using namespace std;

class ListNode {
public:
    int val;
    ListNode* next;

    ListNode(int v) : val(v), next(NULL) {}

    /**
     * Parses a string like "1 2 3 4" and returns the head of a Linked List.
     */
    static ListNode* makeList(string s) {
        if (s == "[]" || s.empty()) return NULL;

        stringstream ss(s);
        string item;
        ListNode* dummy = new ListNode(0);
        ListNode* curr = dummy;

        while (getline(ss, item, ' ')) {
            if (!item.empty()) {
                curr->next = new ListNode(stoi(item));
                curr = curr->next;
            }
        }
        return dummy->next;
    }

    /**
     * Returns a string representation of the list in "[1,2,3]" format.
     */
    string print() {
        string res = "[";
        ListNode* temp = this;
        while (temp != NULL) {
            res += to_string(temp->val);
            if (temp->next != NULL) res += ",";
            temp = temp->next;
        }
        res += "]";
        return res;
    }
};
class Solution {
public:
    /**
     * Reverses a singly-linked_list.
     * @param head Pointer to the first node of the list.
     * @return Pointer to the new head of the reversed list.
     */
    ListNode* reverse(ListNode* head) {
        ListNode* prev = NULL;
        ListNode* curr = head;
        
        while (curr != NULL) {
            ListNode* nextTemp = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
};$$),

((SELECT id FROM problems WHERE title = 'Reverse Linked List'), 'python', $$import sys

class ListNode:
    """Standard definition for a singly-linked list node."""
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    @staticmethod
    def build_list(n, values):
        """Helper to build a linked list from a list of integers."""
        if n == 0 or not values:
            return None
        head = ListNode(int(values[0]))
        curr = head
        for i in range(1, n):
            curr.next = ListNode(int(values[i]))
            curr = curr.next
        return head

    def to_string(self):
        """Returns the list in [1,2,3] format for verification."""
        res = []
        curr = self
        while curr:
            res.append(str(curr.val))
            curr = curr.next
        comma_sep_lst = ','.join(res)
        return f"[{comma_sep_lst}]"

class Solution:
    def reverse(self, head: ListNode) -> ListNode:
        # Your code here
        return None

$$,'reverse','[{"name": "head", "type": "linked_list"}]'::jsonb, 'ListNode', $$def main():
    # Read number of test cases
    line = sys.stdin.readline()
    if not line:
        return
    t = int(line.strip())
    
    sol = Solution()
    
    for _ in range(t):
        # Read length of the list
        n_line = sys.stdin.readline()
        if not n_line:
            break
        n = int(n_line.strip())
        
        # Read the space-separated values
        val_line = sys.stdin.readline()
        if not val_line:
            values = []
        else:
            values = val_line.strip().split()
        
        # Build, Reverse, and Print
        head = ListNode.build_list(n, values)
        reversed_head = sol.reverse(head)
        
        if reversed_head:
            output = reversed_head.to_string()
        else:
            output = "[]"
            
        sys.stdout.write(f"{output}---SEP---")

if __name__ == "__main__":
    main()
$$, $$import sys

class ListNode:
    """Standard definition for a singly-linked list node."""
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    @staticmethod
    def build_list(n, values):
        """Helper to build a linked list from a list of integers."""
        if n == 0 or not values:
            return None
        head = ListNode(int(values[0]))
        curr = head
        for i in range(1, n):
            curr.next = ListNode(int(values[i]))
            curr = curr.next
        return head

    def to_string(self):
        """Returns the list in [1, 2, 3] format for verification."""
        res = []
        curr = self
        while curr:
            res.append(str(curr.val))
            curr = curr.next
        return f"[{', '.join(res)}]"

class Solution:
    def reverse(self, head: ListNode) -> ListNode:
        """Iterative solution to reverse the linked list."""
        prev = None
        curr = head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev
$$),

((SELECT id FROM problems WHERE title = 'Reverse Linked List'), 'java', $$import java.util.*;

class ListNode {
    int val;
    ListNode next;

    ListNode(int val) {
        this.val = val;
        this.next = null;
    }

    /**
     * Creates a linked list from an array of integers.
     */
    public static ListNode makeList(int[] vals) {
        if (vals == null || vals.length == 0) return null;
        ListNode head = new ListNode(vals[0]);
        ListNode curr = head;
        for (int i = 1; i < vals.length; i++) {
            curr.next = new ListNode(vals[i]);
            curr = curr.next;
        }
        return head;
    }

    /**
     * Returns string representation [1,2,3].
     */
    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        ListNode curr = this;
        while (curr != null) {
            sb.append(curr.val);
            if (curr.next != null) sb.append(",");
            curr = curr.next;
        }
        sb.append("]");
        return sb.toString();
    }
}

class Solution {
    public ListNode reverse(ListNode head) {
        // Your code here
        return null;
    }
}
$$, 'reverse', '[{"name": "head", "type": "linked_list"}]'::jsonb, 'ListNode', $$public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;

        int t = sc.nextInt();
        Solution sol = new Solution();

        while (t-- > 0) {
            if (!sc.hasNextInt()) break;
            int n = sc.nextInt();
            int[] vals = new int[n];
            for (int i = 0; i < n; i++) {
                vals[i] = sc.nextInt();
            }

            ListNode head = ListNode.makeList(vals);
            ListNode reversed = sol.reverse(head);

            if (reversed == null) {
                System.out.print("[]---SEP---");
            } else {
                System.out.print(reversed.toString() + "---SEP---");
            }
        }
        sc.close();
    }
}
$$, $$import java.util.*;

class ListNode {
    int val;
    ListNode next;

    ListNode(int val) {
        this.val = val;
        this.next = null;
    }

    public static ListNode makeList(int[] vals) {
        if (vals == null || vals.length == 0) return null;
        ListNode head = new ListNode(vals[0]);
        ListNode curr = head;
        for (int i = 1; i < vals.length; i++) {
            curr.next = new ListNode(vals[i]);
            curr = curr.next;
        }
        return head;
    }

    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        ListNode curr = this;
        while (curr != null) {
            sb.append(curr.val);
            if (curr.next != null) sb.append(",");
            curr = curr.next;
        }
        sb.append("]");
        return sb.toString();
    }
}

class Solution {
    /**
     * Reverses the linked list iteratively.
     */
    public ListNode reverse(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}
$$);
