/* Problems: the problem lab. Each problem is registered with DSA.problem(data) and walks from
   understanding the question to a brute-force idea and an optimal solution with Python code.
   App fields: id, title, difficulty, topics, ds, alg, patterns, statement, examples, constraints,
   understanding, brute {idea, steps, code, complexity}, optimal {...}, related.
   Convenience fields added at the end: description, starterCode, approaches[].
   API on the DSA.problems array: all(), get(id), byTopic(topicId), byDifficulty(level). */
(function () {
  "use strict";
  var DSA = window.DSA;
  if (!DSA || !DSA.problem || !DSA.h) return;
  var h = DSA.h;
  function py(lines) { return lines.join("\n"); }

  /* 1 ---------------------------------------------------------------- */
  DSA.problem({
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["arrays", "hash-tables", "hashing-pattern", "dictionaries"],
    ds: ["Array", "Hash table"],
    alg: ["Linear scan"],
    patterns: ["Hashing", "Complement lookup"],
    statement: "<p>Given a list of integers <code>nums</code> and an integer <code>target</code>, return the <strong>indices</strong> of the two different elements whose sum equals <code>target</code>.</p><p>Exactly one valid answer exists, and you may not use the same element twice. Return the indices in any order.</p>",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explain: "nums[0] + nums[1] = 2 + 7 = 9." },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", explain: "2 + 4 = 6. Index 0 cannot be paired with itself." },
      { input: "nums = [3, 3], target = 6", output: "[0, 1]" }
    ],
    constraints: ["<code>2 ≤ len(nums) ≤ 10⁴</code>", "<code>-10⁹ ≤ nums[i], target ≤ 10⁹</code>", "Exactly one valid pair exists."],
    understanding: "<p>For every number <code>x</code> we need to know whether its <dfn>complement</dfn> <code>target - x</code> appears somewhere <em>else</em> in the list. The whole problem is about how fast we can answer “have I seen this value, and where?”.</p>" +
      h.callout("tip", "Key question", "<p>Whenever a problem asks “does some earlier element satisfy a relation with the current one?”, think of a hash map from value to index.</p>"),
    brute: {
      idea: "Try every pair of indices <code>(i, j)</code> with <code>i &lt; j</code> and check whether the two values add up to the target.",
      steps: ["Loop <code>i</code> over every index.", "Loop <code>j</code> over every index after <code>i</code>.", "If <code>nums[i] + nums[j] == target</code>, return <code>[i, j]</code>."],
      code: py([
        "def two_sum(nums, target):",
        "    n = len(nums)",
        "    for i in range(n):",
        "        for j in range(i + 1, n):",
        "            if nums[i] + nums[j] == target:",
        "                return [i, j]",
        "    return []"
      ]),
      complexity: { time: "O(n²)", space: "O(1)", why: "There are n(n−1)/2 pairs. Only two index variables are used." }
    },
    optimal: {
      idea: "Walk the list once, keeping a dictionary <code>seen</code> that maps each value to its index. Before storing the current value, check whether its complement is already in the dictionary.",
      steps: ["Create an empty dictionary <code>seen</code>.", "For each index <code>i</code> and value <code>x</code>, compute <code>need = target - x</code>.", "If <code>need</code> is in <code>seen</code>, return <code>[seen[need], i]</code>.", "Otherwise store <code>seen[x] = i</code> and continue."],
      code: py([
        "def two_sum(nums, target):",
        "    seen = {}                    # value -> index",
        "    for i, x in enumerate(nums):",
        "        need = target - x",
        "        if need in seen:         # O(1) average lookup",
        "            return [seen[need], i]",
        "        seen[x] = i              # store AFTER checking, so x never pairs with itself",
        "    return []"
      ]),
      complexity: { time: "O(n)", space: "O(n)", why: "One pass with O(1) average dictionary operations; the dictionary may hold up to n entries." }
    },
    related: ["longest-substring-without-repeating", "maximum-subarray"]
  });

  /* 2 ---------------------------------------------------------------- */
  DSA.problem({
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: ["stacks", "strings"],
    ds: ["Stack", "String"],
    alg: ["Linear scan"],
    patterns: ["Stack matching"],
    statement: "<p>Given a string <code>s</code> containing only the characters <code>()[]{}</code>, decide whether it is <strong>valid</strong>.</p><p>A string is valid when every opening bracket is closed by the same type of bracket, brackets close in the correct order, and every closing bracket has a matching opening bracket.</p>",
    examples: [
      { input: "s = \"()[]{}\"", output: "True" },
      { input: "s = \"([{}])\"", output: "True", explain: "Each bracket closes the most recent unclosed one." },
      { input: "s = \"(]\"", output: "False", explain: "A square bracket cannot close a round one." },
      { input: "s = \"([)]\"", output: "False", explain: "The order of closing is wrong." }
    ],
    constraints: ["<code>1 ≤ len(s) ≤ 10⁴</code>", "<code>s</code> contains only <code>()[]{}</code>."],
    understanding: "<p>The bracket that must close next is always the <strong>most recently opened</strong> one that is still open. “Most recent first” is exactly last-in, first-out, so a " + h.link("stacks", "stack") + " is the natural tool.</p>" +
      h.diagram("s = ( [ { } ] )\n\nread (   stack: (\nread [   stack: ( [\nread {   stack: ( [ {\nread }   pop {  ok   stack: ( [\nread ]   pop [  ok   stack: (\nread )   pop (  ok   stack: (empty)  -> valid", "The stack always holds the brackets still waiting to be closed."),
    brute: {
      idea: "Repeatedly delete adjacent matching pairs <code>()</code>, <code>[]</code>, <code>{}</code> until nothing changes. The string is valid if it becomes empty.",
      steps: ["While the string contains <code>()</code>, <code>[]</code> or <code>{}</code>, remove those pairs.", "Return whether the remaining string is empty."],
      code: py([
        "def is_valid(s):",
        "    prev = None",
        "    while prev != s:",
        "        prev = s",
        "        s = s.replace(\"()\", \"\").replace(\"[]\", \"\").replace(\"{}\", \"\")",
        "    return s == \"\""
      ]),
      complexity: { time: "O(n²)", space: "O(n)", why: "Each round removes at least one pair and copies the string, up to n/2 rounds of O(n) work." }
    },
    optimal: {
      idea: "Scan left to right. Push opening brackets onto a stack. For a closing bracket, the top of the stack must be its matching opener; pop it. At the end the stack must be empty.",
      steps: ["Map each closer to its opener: <code>{')': '(', ']': '[', '}': '{'}</code>.", "For an opener, push it.", "For a closer, fail if the stack is empty or the top does not match; otherwise pop.", "Return <code>True</code> only if the stack is empty."],
      code: py([
        "def is_valid(s):",
        "    pairs = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}",
        "    stack = []",
        "    for ch in s:",
        "        if ch in pairs:                       # closing bracket",
        "            if not stack or stack[-1] != pairs[ch]:",
        "                return False",
        "            stack.pop()",
        "        else:                                 # opening bracket",
        "            stack.append(ch)",
        "    return not stack                          # leftovers were never closed"
      ]),
      complexity: { time: "O(n)", space: "O(n)", why: "Each character is pushed and popped at most once; the stack can hold up to n openers." }
    },
    related: ["reverse-linked-list"]
  });

  /* 3 ---------------------------------------------------------------- */
  DSA.problem({
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    topics: ["singly-linked-lists", "references-and-values", "recursion"],
    ds: ["Linked list"],
    alg: ["Pointer manipulation", "Recursion"],
    patterns: ["In-place reversal"],
    statement: "<p>Given the <code>head</code> of a singly linked list, reverse the list in place and return the new head.</p>" +
      h.code(py(["class ListNode:", "    def __init__(self, val=0, next=None):", "        self.val = val", "        self.next = next"]), "Node definition"),
    examples: [
      { input: "head = 1 -> 2 -> 3 -> 4 -> 5", output: "5 -> 4 -> 3 -> 2 -> 1" },
      { input: "head = 1 -> 2", output: "2 -> 1" },
      { input: "head = None", output: "None", explain: "An empty list stays empty." }
    ],
    constraints: ["<code>0 ≤ number of nodes ≤ 5000</code>", "<code>-5000 ≤ node.val ≤ 5000</code>"],
    understanding: "<p>Reversing does not move any nodes; it only flips the direction of every <code>next</code> pointer. The danger is losing the rest of the list: once you overwrite <code>curr.next</code>, the old next node is unreachable unless you saved it first.</p>" +
      h.diagram("before:  None   1 -> 2 -> 3 -> None\n          prev  curr\n\nstep:    save nxt = curr.next\n         curr.next = prev\n         prev = curr; curr = nxt\n\nafter 1: None <- 1    2 -> 3 -> None\n                prev curr", "Three pointers: prev, curr and the saved next."),
    brute: {
      idea: "Copy the values into a Python list, then walk the linked list again and write the values back in reverse order.",
      steps: ["Traverse and append every value to an array.", "Traverse again, assigning values popped from the end of the array."],
      code: py([
        "def reverse_list(head):",
        "    vals = []",
        "    node = head",
        "    while node:",
        "        vals.append(node.val)",
        "        node = node.next",
        "    node = head",
        "    while node:",
        "        node.val = vals.pop()",
        "        node = node.next",
        "    return head"
      ]),
      complexity: { time: "O(n)", space: "O(n)", why: "Two passes and an auxiliary array of n values. It also changes values rather than links, which interviewers usually disallow." }
    },
    optimal: {
      idea: "Iterate once with three pointers. For each node, remember its next node, point it backwards at <code>prev</code>, then advance both pointers.",
      steps: ["Start with <code>prev = None</code>, <code>curr = head</code>.", "Save <code>nxt = curr.next</code>.", "Set <code>curr.next = prev</code>.", "Move <code>prev = curr</code>, <code>curr = nxt</code>.", "When <code>curr</code> is <code>None</code>, <code>prev</code> is the new head."],
      code: py([
        "def reverse_list(head):",
        "    prev, curr = None, head",
        "    while curr:",
        "        nxt = curr.next      # 1. don't lose the rest of the list",
        "        curr.next = prev     # 2. flip the pointer",
        "        prev = curr          # 3. advance",
        "        curr = nxt",
        "    return prev",
        "",
        "# Recursive version (O(n) stack space):",
        "def reverse_list_rec(head):",
        "    if head is None or head.next is None:",
        "        return head",
        "    new_head = reverse_list_rec(head.next)",
        "    head.next.next = head",
        "    head.next = None",
        "    return new_head"
      ]),
      complexity: { time: "O(n)", space: "O(1)", why: "Each node is visited once and only three pointers are stored. The recursive version uses O(n) call-stack space." }
    },
    related: ["merge-two-sorted-lists", "valid-parentheses"]
  });

  /* 4 ---------------------------------------------------------------- */
  DSA.problem({
    id: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topics: ["singly-linked-lists", "merge-sort", "two-pointers"],
    ds: ["Linked list"],
    alg: ["Merge"],
    patterns: ["Two pointers", "Dummy head"],
    statement: "<p>You are given the heads of two sorted singly linked lists <code>list1</code> and <code>list2</code>. Splice their nodes together into one sorted list and return its head. Reuse the existing nodes rather than creating new ones.</p>",
    examples: [
      { input: "list1 = 1 -> 2 -> 4, list2 = 1 -> 3 -> 4", output: "1 -> 1 -> 2 -> 3 -> 4 -> 4" },
      { input: "list1 = None, list2 = None", output: "None" },
      { input: "list1 = None, list2 = 0", output: "0" }
    ],
    constraints: ["<code>0 ≤ nodes in each list ≤ 50</code>", "<code>-100 ≤ node.val ≤ 100</code>", "Both lists are sorted in non-decreasing order."],
    understanding: "<p>This is exactly the <em>merge</em> step of " + h.link("merge-sort", "merge sort") + ". The smallest remaining node overall is always the smaller of the two current heads, so we repeatedly take that one.</p>" +
      h.callout("tip", "Dummy head trick", "<p>Starting from a fake node <code>dummy</code> removes the special case of “which list provides the first node?”. The answer is <code>dummy.next</code>.</p>"),
    brute: {
      idea: "Collect every value from both lists into one array, sort it, and build a new linked list.",
      steps: ["Traverse both lists into an array.", "Sort the array.", "Create new nodes from the sorted values."],
      code: py([
        "def merge_two_lists(list1, list2):",
        "    vals = []",
        "    for node in (list1, list2):",
        "        while node:",
        "            vals.append(node.val)",
        "            node = node.next",
        "    vals.sort()",
        "    dummy = tail = ListNode()",
        "    for v in vals:",
        "        tail.next = ListNode(v)",
        "        tail = tail.next",
        "    return dummy.next"
      ]),
      complexity: { time: "O((n+m) log(n+m))", space: "O(n+m)", why: "Sorting dominates, and it ignores the fact that the inputs are already sorted." }
    },
    optimal: {
      idea: "Keep one pointer in each list and a <code>tail</code> pointer on the output. Attach whichever current node is smaller, advance that list, and when one list runs out, attach the remainder of the other.",
      steps: ["Create <code>dummy</code> and set <code>tail = dummy</code>.", "While both lists have nodes, link the smaller head to <code>tail.next</code> and advance.", "Attach the non-empty remainder.", "Return <code>dummy.next</code>."],
      code: py([
        "def merge_two_lists(list1, list2):",
        "    dummy = tail = ListNode()",
        "    while list1 and list2:",
        "        if list1.val <= list2.val:     # <= keeps the merge stable",
        "            tail.next, list1 = list1, list1.next",
        "        else:",
        "            tail.next, list2 = list2, list2.next",
        "        tail = tail.next",
        "    tail.next = list1 or list2         # one of them is already exhausted",
        "    return dummy.next"
      ]),
      complexity: { time: "O(n + m)", space: "O(1)", why: "Each node is linked exactly once and only a few pointers are used." }
    },
    related: ["reverse-linked-list"]
  });

  /* 5 ---------------------------------------------------------------- */
  DSA.problem({
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    topics: ["arrays", "dynamic-programming", "dp-1d", "greedy", "prefix-sum"],
    ds: ["Array"],
    alg: ["Kadane's algorithm", "Dynamic programming"],
    patterns: ["Running best", "1D DP"],
    statement: "<p>Given an integer list <code>nums</code>, find the contiguous, non-empty subarray with the largest sum and return that sum.</p>",
    examples: [
      { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", explain: "The subarray [4, -1, 2, 1] has sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [-3, -1, -2]", output: "-1", explain: "The subarray must be non-empty, so the best is the single largest element." }
    ],
    constraints: ["<code>1 ≤ len(nums) ≤ 10⁵</code>", "<code>-10⁴ ≤ nums[i] ≤ 10⁴</code>"],
    understanding: "<p>Define <code>best_end[i]</code> as the largest sum of a subarray that <strong>ends exactly at index i</strong>. Such a subarray either extends the best one ending at <code>i-1</code> or starts fresh at <code>i</code>:</p>" +
      h.plain("best_end[i] = max(nums[i], best_end[i-1] + nums[i])\nanswer      = max over all i of best_end[i]", "Recurrence") +
      "<p>If the running sum becomes negative, it can only hurt whatever comes next, so we drop it. That single observation is <dfn>Kadane's algorithm</dfn>.</p>",
    brute: {
      idea: "Try every start index and extend the end index one step at a time, keeping a running sum so each subarray costs O(1) to evaluate.",
      steps: ["For each start <code>i</code>, set <code>total = 0</code>.", "For each end <code>j ≥ i</code>, add <code>nums[j]</code> and update the best.", "Return the best seen."],
      code: py([
        "def max_sub_array(nums):",
        "    best = nums[0]",
        "    for i in range(len(nums)):",
        "        total = 0",
        "        for j in range(i, len(nums)):",
        "            total += nums[j]",
        "            best = max(best, total)",
        "    return best"
      ]),
      complexity: { time: "O(n²)", space: "O(1)", why: "There are about n²/2 (start, end) pairs, each updated in O(1)." }
    },
    optimal: {
      idea: "Kadane's algorithm: carry the best sum of a subarray ending at the current index. At each element choose between extending it and restarting, and record the global maximum.",
      steps: ["Set <code>cur = best = nums[0]</code>.", "For each later <code>x</code>: <code>cur = max(x, cur + x)</code>.", "Update <code>best = max(best, cur)</code>.", "Return <code>best</code>."],
      code: py([
        "def max_sub_array(nums):",
        "    cur = best = nums[0]",
        "    for x in nums[1:]:",
        "        cur = max(x, cur + x)   # extend the run, or start a new one at x",
        "        best = max(best, cur)",
        "    return best"
      ]),
      complexity: { time: "O(n)", space: "O(1)", why: "One pass; the DP table collapses to a single variable because each state depends only on the previous one." }
    },
    related: ["climbing-stairs", "two-sum"]
  });

  /* 6 ---------------------------------------------------------------- */
  DSA.problem({
    id: "binary-search-problem",
    title: "Binary Search",
    difficulty: "Easy",
    topics: ["binary-search", "binary-search-pattern", "arrays", "logarithms"],
    ds: ["Array"],
    alg: ["Binary search"],
    patterns: ["Halving the search space"],
    statement: "<p>Given a list of integers <code>nums</code> sorted in ascending order and an integer <code>target</code>, return the index of <code>target</code>, or <code>-1</code> if it is not present. Your algorithm must run in <strong>O(log n)</strong> time.</p>" + h.viz("binary-search"),
    examples: [
      { input: "nums = [-1, 0, 3, 5, 9, 12], target = 9", output: "4" },
      { input: "nums = [-1, 0, 3, 5, 9, 12], target = 2", output: "-1", explain: "2 is not in the list." }
    ],
    constraints: ["<code>1 ≤ len(nums) ≤ 10⁴</code>", "All values are distinct.", "<code>nums</code> is sorted ascending."],
    understanding: "<p>Because the list is sorted, comparing <code>target</code> with the middle element tells us which half cannot contain it. Discarding half of the remaining range each step means at most about <code>log₂ n</code> steps — 14 steps for 10,000 elements.</p>" +
      h.callout("mistake", "Off-by-one traps", "<p>Decide on one invariant and stick to it. With a closed range <code>[lo, hi]</code> the loop condition is <code>lo &lt;= hi</code> and you move to <code>mid + 1</code> or <code>mid - 1</code>, never to <code>mid</code>.</p>"),
    brute: {
      idea: "Linear search: check every element from left to right.",
      steps: ["For each index <code>i</code>, return <code>i</code> if <code>nums[i] == target</code>.", "Return <code>-1</code> after the loop."],
      code: py([
        "def search(nums, target):",
        "    for i, x in enumerate(nums):",
        "        if x == target:",
        "            return i",
        "    return -1"
      ]),
      complexity: { time: "O(n)", space: "O(1)", why: "Correct, but it ignores the sorted order and misses the required O(log n)." }
    },
    optimal: {
      idea: "Maintain a closed range <code>[lo, hi]</code> that must contain the target if it exists. Compare with the middle element and shrink the range to the half that can still contain it.",
      steps: ["Set <code>lo = 0</code>, <code>hi = len(nums) - 1</code>.", "While <code>lo &lt;= hi</code>, compute <code>mid = (lo + hi) // 2</code>.", "If equal, return <code>mid</code>; if smaller, set <code>lo = mid + 1</code>; else set <code>hi = mid - 1</code>.", "Return <code>-1</code> when the range is empty."],
      code: py([
        "def search(nums, target):",
        "    lo, hi = 0, len(nums) - 1",
        "    while lo <= hi:                 # range [lo, hi] is non-empty",
        "        mid = (lo + hi) // 2",
        "        if nums[mid] == target:",
        "            return mid",
        "        if nums[mid] < target:",
        "            lo = mid + 1            # target can only be to the right",
        "        else:",
        "            hi = mid - 1            # target can only be to the left",
        "    return -1"
      ]),
      complexity: { time: "O(log n)", space: "O(1)", why: "The range halves every iteration; only three integers are stored." }
    },
    related: ["two-sum"]
  });

  /* 7 ---------------------------------------------------------------- */
  DSA.problem({
    id: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    topics: ["binary-trees", "trees", "recursion", "tree-dfs", "tree-bfs"],
    ds: ["Binary tree"],
    alg: ["DFS", "BFS"],
    patterns: ["Tree recursion"],
    statement: "<p>Given the <code>root</code> of a binary tree, invert it (swap every node's left and right children, at every level) and return the root.</p>" +
      h.code(py(["class TreeNode:", "    def __init__(self, val=0, left=None, right=None):", "        self.val = val", "        self.left = left", "        self.right = right"]), "Node definition"),
    examples: [
      { input: "root = [4, 2, 7, 1, 3, 6, 9]", output: "[4, 7, 2, 9, 6, 3, 1]", explain: "Level-order listing. The tree becomes its mirror image." },
      { input: "root = [2, 1, 3]", output: "[2, 3, 1]" },
      { input: "root = []", output: "[]" }
    ],
    constraints: ["<code>0 ≤ number of nodes ≤ 100</code>", "<code>-100 ≤ node.val ≤ 100</code>"],
    understanding: h.diagram("      4                4\n    /   \\            /   \\\n   2     7    =>    7     2\n  / \\   / \\        / \\   / \\\n 1   3 6   9      9   6 3   1", "Inverting produces the mirror image of the tree.") +
      "<p>The mirror of a tree is: the same root, whose left child is the mirror of the old right subtree and whose right child is the mirror of the old left subtree. That definition is already a recursive algorithm.</p>",
    brute: {
      idea: "Breadth-first: visit nodes level by level with a queue and swap the children of each node as it is dequeued. This is just as efficient as recursion and avoids deep call stacks on skewed trees.",
      steps: ["Put the root in a queue.", "Dequeue a node and swap its <code>left</code> and <code>right</code>.", "Enqueue its non-empty children.", "Repeat until the queue is empty."],
      code: py([
        "from collections import deque",
        "",
        "def invert_tree(root):",
        "    if root is None:",
        "        return None",
        "    queue = deque([root])",
        "    while queue:",
        "        node = queue.popleft()",
        "        node.left, node.right = node.right, node.left",
        "        if node.left:",
        "            queue.append(node.left)",
        "        if node.right:",
        "            queue.append(node.right)",
        "    return root"
      ]),
      complexity: { time: "O(n)", space: "O(w)", why: "Every node is visited once; the queue holds at most one level, w ≤ n/2 nodes." }
    },
    optimal: {
      idea: "Recursive DFS: invert both subtrees, then attach them swapped. The base case is an empty tree.",
      steps: ["If <code>root</code> is <code>None</code>, return <code>None</code>.", "Recursively invert the left and right subtrees.", "Assign them swapped and return <code>root</code>."],
      code: py([
        "def invert_tree(root):",
        "    if root is None:",
        "        return None",
        "    root.left, root.right = invert_tree(root.right), invert_tree(root.left)",
        "    return root"
      ]),
      complexity: { time: "O(n)", space: "O(h)", why: "Each node is processed once; the call stack grows to the tree height h (log n when balanced, n when skewed)." }
    },
    related: ["number-of-islands"]
  });

  /* 8 ---------------------------------------------------------------- */
  DSA.problem({
    id: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    topics: ["graphs", "graph-bfs", "graph-dfs", "disjoint-set-union"],
    ds: ["Grid", "Graph", "Queue"],
    alg: ["BFS", "DFS", "Flood fill"],
    patterns: ["Connected components"],
    statement: "<p>Given an <code>m × n</code> grid of <code>\"1\"</code> (land) and <code>\"0\"</code> (water), return the number of islands. An island is a group of land cells connected <strong>horizontally or vertically</strong>, and the grid is surrounded by water.</p>",
    examples: [
      { input: "grid = [\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"0\",\"0\",\"1\",\"0\",\"0\"],\n  [\"0\",\"0\",\"0\",\"1\",\"1\"]\n]", output: "3" },
      { input: "grid = [[\"1\",\"0\",\"1\"]]", output: "2", explain: "Diagonal or separated cells do not join." }
    ],
    constraints: ["<code>1 ≤ m, n ≤ 300</code>", "<code>grid[i][j]</code> is <code>\"0\"</code> or <code>\"1\"</code>."],
    understanding: "<p>Treat every land cell as a " + h.link("graphs", "graph") + " vertex with edges to its up/down/left/right land neighbours. The answer is the number of <dfn>connected components</dfn>. Each time we find unvisited land we have found a new island; we then <em>flood</em> the whole island so it is never counted again.</p>" +
      h.diagram("1 1 0 0 0      A A . . .\n1 1 0 0 0  =>  A A . . .\n0 0 1 0 0      . . B . .\n0 0 0 1 1      . . . C C", "Three components: A, B and C.") + h.viz("graph"),
    brute: {
      idea: "Count components without marking: for every land cell, BFS to collect its whole island, and count the island only if this cell is the smallest (first in row-major order) cell of its island. Correct, but each island is re-explored once per cell.",
      steps: ["For each land cell, BFS to find all cells of its island.", "Count it if the starting cell equals the minimum cell of that island.", "Return the count."],
      code: py([
        "from collections import deque",
        "",
        "def num_islands(grid):",
        "    m, n = len(grid), len(grid[0])",
        "    def island(r, c):",
        "        seen, q = {(r, c)}, deque([(r, c)])",
        "        while q:",
        "            r0, c0 = q.popleft()",
        "            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
        "                nr, nc = r0 + dr, c0 + dc",
        "                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == \"1\" and (nr, nc) not in seen:",
        "                    seen.add((nr, nc))",
        "                    q.append((nr, nc))",
        "        return seen",
        "    count = 0",
        "    for r in range(m):",
        "        for c in range(n):",
        "            if grid[r][c] == \"1\" and min(island(r, c)) == (r, c):",
        "                count += 1",
        "    return count"
      ]),
      complexity: { time: "O((mn)²)", space: "O(mn)", why: "One big island of mn cells is explored mn times." }
    },
    optimal: {
      idea: "Scan the grid once. When you meet unvisited land, increase the count and run BFS (or DFS) from it, marking every reached land cell as visited so the island is flooded and never counted again.",
      steps: ["Loop over every cell.", "On a <code>\"1\"</code>, increment the count and mark it <code>\"0\"</code> (visited).", "BFS from it with a queue, marking each land neighbour when it is enqueued.", "Return the count."],
      code: py([
        "from collections import deque",
        "",
        "def num_islands(grid):",
        "    if not grid:",
        "        return 0",
        "    m, n = len(grid), len(grid[0])",
        "    count = 0",
        "    for r in range(m):",
        "        for c in range(n):",
        "            if grid[r][c] != \"1\":",
        "                continue",
        "            count += 1                       # found a new island",
        "            grid[r][c] = \"0\"                 # mark when enqueued, not when popped",
        "            q = deque([(r, c)])",
        "            while q:",
        "                r0, c0 = q.popleft()",
        "                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
        "                    nr, nc = r0 + dr, c0 + dc",
        "                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == \"1\":",
        "                        grid[nr][nc] = \"0\"",
        "                        q.append((nr, nc))",
        "    return count"
      ]),
      complexity: { time: "O(m·n)", space: "O(min(m, n))", why: "Every cell is marked and dequeued at most once. The BFS frontier is bounded by the grid's shorter side. (This version modifies the input; copy it first if that is not allowed.)" }
    },
    related: ["invert-binary-tree"]
  });

  /* 9 ---------------------------------------------------------------- */
  DSA.problem({
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topics: ["dynamic-programming", "dp-1d", "memoization", "tabulation", "recursion"],
    ds: ["Array"],
    alg: ["Dynamic programming"],
    patterns: ["1D DP", "Fibonacci"],
    statement: "<p>You are climbing a staircase with <code>n</code> steps. Each move you climb either <strong>1 or 2</strong> steps. In how many distinct ways can you reach the top?</p>",
    examples: [
      { input: "n = 2", output: "2", explain: "1+1, or 2." },
      { input: "n = 3", output: "3", explain: "1+1+1, 1+2, 2+1." },
      { input: "n = 5", output: "8" }
    ],
    constraints: ["<code>1 ≤ n ≤ 45</code>"],
    understanding: "<p>Think about the <strong>last move</strong>. To stand on step <code>n</code> you came either from step <code>n-1</code> (one step) or from step <code>n-2</code> (two steps). Those two groups of paths do not overlap, so:</p>" +
      h.plain("ways(n) = ways(n-1) + ways(n-2)\nways(1) = 1,  ways(2) = 2", "Recurrence") +
      "<p>That is the Fibonacci recurrence. Written naively it recomputes the same subproblems exponentially many times — watch it happen below.</p>" + h.viz("dp"),
    brute: {
      idea: "Translate the recurrence directly into recursion.",
      steps: ["Return <code>n</code> when <code>n ≤ 2</code>.", "Otherwise return <code>ways(n-1) + ways(n-2)</code>."],
      code: py([
        "def climb_stairs(n):",
        "    if n <= 2:",
        "        return n",
        "    return climb_stairs(n - 1) + climb_stairs(n - 2)"
      ]),
      complexity: { time: "O(2ⁿ)", space: "O(n)", why: "The call tree roughly doubles at each level (about φⁿ ≈ 1.618ⁿ calls); recursion depth is n. n = 45 takes billions of calls." }
    },
    optimal: {
      idea: "Bottom-up tabulation. Each answer needs only the previous two, so keep two variables and roll them forward.",
      steps: ["Handle <code>n ≤ 2</code>.", "Keep <code>a = ways(i-2)</code>, <code>b = ways(i-1)</code>.", "For <code>i</code> from 3 to <code>n</code>: <code>a, b = b, a + b</code>.", "Return <code>b</code>."],
      code: py([
        "def climb_stairs(n):",
        "    if n <= 2:",
        "        return n",
        "    a, b = 1, 2            # ways(1), ways(2)",
        "    for _ in range(3, n + 1):",
        "        a, b = b, a + b",
        "    return b",
        "",
        "# Top-down with memoization gives the same O(n) time:",
        "from functools import lru_cache",
        "",
        "@lru_cache(maxsize=None)",
        "def climb_memo(n):",
        "    return n if n <= 2 else climb_memo(n - 1) + climb_memo(n - 2)"
      ]),
      complexity: { time: "O(n)", space: "O(1)", why: "Each subproblem is solved once; only the last two values are stored (memoization would use O(n))." }
    },
    related: ["maximum-subarray"]
  });

  /* 10 --------------------------------------------------------------- */
  DSA.problem({
    id: "longest-substring-without-repeating",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topics: ["sliding-window", "strings", "hash-tables", "sets", "two-pointers"],
    ds: ["String", "Hash table"],
    alg: ["Sliding window"],
    patterns: ["Sliding window", "Hashing"],
    statement: "<p>Given a string <code>s</code>, return the length of the longest <strong>substring</strong> (contiguous) that contains no repeated characters.</p>",
    examples: [
      { input: "s = \"abcabcbb\"", output: "3", explain: "\"abc\" has length 3." },
      { input: "s = \"bbbbb\"", output: "1", explain: "\"b\"." },
      { input: "s = \"pwwkew\"", output: "3", explain: "\"wke\". Note \"pwke\" is a subsequence, not a substring." },
      { input: "s = \"\"", output: "0" }
    ],
    constraints: ["<code>0 ≤ len(s) ≤ 5 · 10⁴</code>", "<code>s</code> may contain letters, digits, symbols and spaces."],
    understanding: "<p>Keep a window <code>s[left..right]</code> that never contains a duplicate. Move <code>right</code> forward one character at a time. If the new character already appears inside the window, jump <code>left</code> just past its previous position. Both pointers only move forward.</p>" +
      h.diagram("s = a b c a b c b b\n    L     R            window \"abc\"   best 3\n      L     R          saw 'a' at 0 -> L = 1, window \"bca\"\n        L     R        saw 'b' at 1 -> L = 2, window \"cab\"", "The window slides; it never shrinks past characters it still needs."),
    brute: {
      idea: "Check every substring and keep the longest one whose characters are all distinct.",
      steps: ["For each start <code>i</code>, grow the end <code>j</code> while adding characters to a set.", "Stop growing when a repeat appears.", "Track the longest length."],
      code: py([
        "def length_of_longest_substring(s):",
        "    best = 0",
        "    for i in range(len(s)):",
        "        seen = set()",
        "        for j in range(i, len(s)):",
        "            if s[j] in seen:",
        "                break",
        "            seen.add(s[j])",
        "            best = max(best, j - i + 1)",
        "    return best"
      ]),
      complexity: { time: "O(n · k)", space: "O(k)", why: "k is the alphabet size bounding each inner run; with an unbounded alphabet this is O(n²)." }
    },
    optimal: {
      idea: "Sliding window with a dictionary storing the last index where each character was seen. When the current character was last seen inside the window, move <code>left</code> to one past that index.",
      steps: ["Set <code>left = 0</code>, <code>last = {}</code>, <code>best = 0</code>.", "For each <code>right</code>, <code>ch = s[right]</code>.", "If <code>ch</code> is in <code>last</code> and <code>last[ch] &gt;= left</code>, set <code>left = last[ch] + 1</code>.", "Update <code>last[ch] = right</code> and <code>best = max(best, right - left + 1)</code>."],
      code: py([
        "def length_of_longest_substring(s):",
        "    last = {}              # char -> last index seen",
        "    left = best = 0",
        "    for right, ch in enumerate(s):",
        "        if ch in last and last[ch] >= left:   # duplicate inside the window",
        "            left = last[ch] + 1",
        "        last[ch] = right",
        "        best = max(best, right - left + 1)",
        "    return best"
      ]),
      complexity: { time: "O(n)", space: "O(min(n, k))", why: "Each index is visited once by right and left never moves backwards; the dictionary holds at most one entry per distinct character." }
    },
    related: ["two-sum", "valid-parentheses"]
  });

  /* ---------- Convenience fields + query API ---------- */
  var STARTER = {
    "two-sum": "def two_sum(nums, target):\n    pass",
    "valid-parentheses": "def is_valid(s):\n    pass",
    "reverse-linked-list": "def reverse_list(head):\n    pass",
    "merge-two-sorted-lists": "def merge_two_lists(list1, list2):\n    pass",
    "maximum-subarray": "def max_sub_array(nums):\n    pass",
    "binary-search-problem": "def search(nums, target):\n    pass",
    "invert-binary-tree": "def invert_tree(root):\n    pass",
    "number-of-islands": "def num_islands(grid):\n    pass",
    "climbing-stairs": "def climb_stairs(n):\n    pass",
    "longest-substring-without-repeating": "def length_of_longest_substring(s):\n    pass"
  };
  function strip(s) { return String(s || "").replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); }
  function approach(name, a) {
    return { name: name, time: a.complexity.time, space: a.complexity.space, explanation: strip(a.idea) + (a.steps ? "\n" + a.steps.map(function (s, i) { return (i + 1) + ". " + strip(s); }).join("\n") : ""), code: a.code };
  }

  var list = DSA.problems;
  list.forEach(function (p) {
    if (p.description == null) p.description = strip(p.statement);
    if (p.starterCode == null) p.starterCode = STARTER[p.id] || "def solve():\n    pass";
    if (!p.approaches) p.approaches = [p.brute && approach("Brute Force", p.brute), p.optimal && approach("Optimal", p.optimal)].filter(Boolean);
  });

  /* Methods live on the array so existing code that treats DSA.problems as a list keeps working. */
  function define(name, fn) { Object.defineProperty(list, name, { value: fn, enumerable: false, configurable: true, writable: true }); }
  define("all", function () { return list.slice(); });
  define("get", function (id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; });
  define("byTopic", function (topicId) { return list.filter(function (p) { return (p.topics || []).indexOf(topicId) >= 0; }); });
  define("byDifficulty", function (level) { return list.filter(function (p) { return p.difficulty === level; }); });
})();
