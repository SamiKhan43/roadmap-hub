(function (DSA) {
  "use strict";
  var h = DSA.h;
  var recipes = {
    "linear-search": ["Check candidates one by one and stop on a match.", "O(n) time, O(1) extra space.", "Do not assume the target exists; finish the scan before reporting absence."],
    "binary-search": ["Keep a sorted search interval and discard half after each comparison.", "O(log n) time, O(1) iterative space.", "The input must be sorted under the same ordering used by comparisons."],
    "binary-search-variations": ["Change the boundary update to find the first/last valid position, not merely any match.", "O(log n) time per boundary search.", "Write down whether each endpoint is inclusive and what the loop invariant means."],
    "binary-search-on-answer": ["Search a monotone range of candidate answers using a feasibility check.", "O(log R) checks over range R, multiplied by one check's cost.", "Prove the predicate changes direction only once."],
    "bubble-sort": ["Compare adjacent items and move an out-of-order value toward its final position.", "O(n²) average/worst time; O(1) extra space.", "A swap should occur only when the chosen ordering says the pair is inverted."],
    "selection-sort": ["Select the smallest remaining value and place it at the next output position.", "O(n²) comparisons; O(1) extra space.", "It keeps doing quadratic comparisons even when input is already sorted."],
    "insertion-sort": ["Grow a sorted prefix by shifting larger values and inserting the next item.", "O(n²) average/worst; O(n) best for already sorted input.", "Shift rather than overwrite values that still need to be compared."],
    "merge-sort": ["Split the input, sort each half, then merge two sorted runs.", "O(n log n) time; typically O(n) auxiliary space.", "The merge step must consume both remaining tails after one side empties."],
    "quick-sort": ["Partition around a pivot, then sort the two resulting ranges.", "Expected O(n log n), worst O(n²); stack depends on partition balance.", "Duplicate-heavy or already ordered input can expose poor pivot choices."],
    "heap-sort": ["Build a heap, then repeatedly move the maximum to the sorted suffix.", "O(n log n) time and O(1) auxiliary array space.", "A heap guarantees only parent-child ordering, not a sorted array."],
    "counting-sort": ["Count occurrences of each key and reconstruct the ordered output.", "O(n + k) time and space for key range k.", "Use it when the key range is reasonably small; it is not comparison sorting."],
    "radix-sort": ["Sort by one digit/position at a time with a stable pass.", "O(d(n + k)) for d digits and bucket range k.", "Each digit pass must be stable for earlier passes to keep their ordering."],
    "bucket-sort": ["Distribute values into ranges, sort buckets, and concatenate them.", "Expected linear time under a suitable distribution; extra space is required.", "Poorly distributed data may put nearly everything in one bucket."],
    "tree-dfs": ["Visit a node, then recursively or iteratively explore each child before returning.", "O(n) time; O(h) stack space for a tree of height h.", "An iterative implementation must preserve the same child visitation order if order matters."],
    "tree-bfs": ["Use a FIFO queue to visit nodes level by level.", "O(n) time and up to O(width) queue space.", "Mark or otherwise control visited nodes when extending the pattern to graphs."],
    "bst-search": ["Compare the target with the current key and follow the matching ordered child.", "O(h) time; O(log n) only when height is balanced.", "A skewed search tree degrades to a linked-list path."],
    "bst-insertion": ["Follow comparisons to a missing child and attach the new node there.", "O(h) time.", "Define what happens when a duplicate key is inserted."],
    "bst-deletion": ["Remove a leaf, splice a single child, or replace a two-child node with its successor/predecessor.", "O(h) search and repair.", "The replacement must preserve the ordering invariant on both sides."],
    "graph-bfs": ["Explore a queue in increasing edge distance from the source.", "O(V + E) with adjacency lists.", "Mark a vertex when enqueued to avoid duplicate queue entries."],
    "graph-dfs": ["Follow one path deeply, then backtrack using recursion or an explicit stack.", "O(V + E) with adjacency lists.", "Track visited state; a graph can contain cycles and disconnected components."],
    "topological-sort": ["Repeatedly choose a zero-indegree vertex, or use DFS finishing order.", "O(V + E).", "A topological order exists only for a directed acyclic graph."],
    "cycle-detection": ["Use a traversal state or parent relationship to distinguish a back edge from the edge just traversed.", "O(V + E) for standard graph traversals.", "Directed and undirected graphs need different cycle checks."],
    dijkstra: ["Repeatedly finalize the nearest unsettled vertex and relax its outgoing edges.", "O((V + E) log V) with a binary heap and adjacency lists.", "Dijkstra requires non-negative edge weights."],
    "bellman-ford": ["Relax every edge repeatedly; one extra pass detects reachable negative cycles.", "O(VE) time and O(V) distance storage.", "Use infinity carefully and do not relax from an unreachable vertex."],
    "floyd-warshall": ["Use each vertex in turn as a possible intermediate on every pair's path.", "O(V³) time and O(V²) space.", "Initialize diagonal and unreachable distances correctly; handle negative cycles explicitly."],
    kruskal: ["Sort edges by weight and add an edge only when it joins two components.", "O(E log E), dominated by sorting.", "Union-find prevents cycles; the result is a forest if the graph is disconnected."],
    prim: ["Grow one connected tree by repeatedly adding its cheapest outgoing edge.", "O(E log V) with a heap and adjacency lists.", "Start again for disconnected components if a minimum spanning forest is required."],
    scc: ["Group vertices that can each reach one another using a two-pass or low-link DFS method.", "O(V + E) for Kosaraju or Tarjan.", "Keep discovery/finish order and reverse-graph traversal rules precise."],
    "brute-force": ["Enumerate a clear candidate space first, then identify redundant work.", "Often exponential or polynomial in the candidate count.", "Pruning is safe only when it cannot discard a valid answer."],
    "two-pointers": ["Move two indices according to an invariant instead of restarting a scan.", "Often O(n) when each pointer moves only forward.", "The movement rule must be justified by ordering or another monotone property."],
    "sliding-window": ["Maintain information for a contiguous window as its left and right edges move.", "Often O(n), since each edge advances at most n times.", "A simple shrinking rule may fail when values can be negative."],
    "fast-slow-pointers": ["Move pointers at different speeds to detect a cycle or locate a midpoint.", "O(n) time and O(1) extra space in common list problems.", "Handle null termination before dereferencing the fast pointer."],
    "prefix-sum": ["Store cumulative totals so a range sum is a difference of two prefixes.", "O(n) preprocessing and O(1) range-sum queries.", "For an inclusive range [l, r], use prefix[r + 1] - prefix[l]."],
    "difference-arrays": ["Store boundary changes, then take a prefix sum to recover values.", "O(1) per range update and O(n) to materialize the result.", "Allocate an extra endpoint when an update ends at the final index."],
    "hashing-pattern": ["Use a set or map to remember information that would otherwise require a repeated scan.", "Often O(n) expected time with O(n) extra space.", "Hash lookup is average-case, and duplicate handling must match the problem."],
    "monotonic-stack": ["Keep a stack ordered by a key; pop values that can no longer be the next answer.", "O(n) amortized when each item is pushed and popped once.", "Choose strictly versus non-strict comparisons based on duplicate behavior."],
    "monotonic-queue": ["Discard dominated candidates while preserving the indices still inside the window.", "O(n) total for a sequence of window queries.", "Expire old indices from the front as the left boundary moves."],
    intervals: ["Sort intervals, then merge or select them according to their endpoints.", "Usually O(n log n) from sorting, then O(n) scanning.", "Specify whether touching endpoints overlap."],
    greedy: ["Make the locally preferred choice, then prove it can be part of an optimal solution.", "Often dominated by sorting or one scan.", "A plausible local choice is not enough; supply an exchange or cut argument."],
    "divide-and-conquer": ["Split into smaller independent pieces, solve them, and combine their results.", "Derive a recurrence from subproblem count, size, and combine work.", "Check that subproblems shrink and that combine work is accounted for."],
    backtracking: ["Build a partial candidate, recurse on choices, and undo state on return.", "Worst case is often exponential in the search depth.", "Undo every mutation so sibling branches do not share accidental state."],
    "recursion-patterns": ["Define the base case, make progress toward it, and combine child results.", "Time and stack space depend on the recursion tree and maximum depth.", "Every recursive path must reach a base case."],
    "dynamic-programming": ["Reuse answers to overlapping subproblems with a recurrence and a well-defined state.", "State count × work per state; memory depends on retained states.", "Define what a state means before writing a recurrence."],
    memoization: ["Cache a recursive result by a complete state key and return cached values on repeats.", "At most one computation per reachable state, plus cache overhead.", "A key that omits relevant state can silently reuse the wrong answer."],
    tabulation: ["Evaluate a dependency table in an order where every needed state is already available.", "Usually O(number of states × work per state).", "Choose an iteration order consistent with the recurrence dependencies."],
    "dp-1d": ["Represent the answer at position i using a small set of earlier states.", "Often O(n) time; memory can sometimes be reduced to the needed previous states.", "Do not overwrite a state before all transitions that need its old value are complete."],
    "dp-2d": ["Use two dimensions to represent progress through two indices or choices.", "Often O(nm) states for dimensions n and m.", "Boundary rows and columns encode empty-prefix or impossible states."],
    knapsack: ["For each item and capacity, choose whether to include it subject to the capacity rule.", "O(nW) for n items and integer capacity W in the basic DP.", "Loop direction distinguishes 0/1 items from unbounded reuse in a one-dimensional table."],
    lcs: ["Compare prefixes of two sequences; matching symbols extend a prior common subsequence.", "O(nm) time and usually O(nm) space.", "A subsequence preserves order but need not be contiguous."],
    lis: ["Track increasing subsequence lengths, or maintain minimal tails for each length.", "O(n²) basic DP; O(n log n) with binary-search tails.", "The tails array is not itself necessarily a valid subsequence."]
  };
  var codeSamples = {
    "binary-search": "def binary_search(values, target):\n    lo, hi = 0, len(values) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if values[mid] == target:\n            return mid\n        if values[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1",
    "graph-bfs": "from collections import deque\n\ndef bfs(graph, start):\n    queue = deque([start])\n    seen = {start}\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in graph.get(node, []):\n            if neighbor not in seen:\n                seen.add(neighbor)\n                queue.append(neighbor)\n    return order",
    "prefix-sum": "def range_sum(values, left, right):\n    prefix = [0]\n    for value in values:\n        prefix.append(prefix[-1] + value)\n    return prefix[right + 1] - prefix[left]",
    "backtracking": "def subsets(values):\n    result = []\n    chosen = []\n\n    def search(index):\n        if index == len(values):\n            result.append(chosen[:])\n            return\n        search(index + 1)\n        chosen.append(values[index])\n        search(index + 1)\n        chosen.pop()\n\n    search(0)\n    return result",
    memoization: "from functools import lru_cache\n\n@lru_cache(None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)",
    "merge-sort": "def merge(left, right):\n    out = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            out.append(left[i])\n            i += 1\n        else:\n            out.append(right[j])\n            j += 1\n    return out + left[i:] + right[j:]\n\ndef merge_sort(values):\n    if len(values) < 2:\n        return values\n    mid = len(values) // 2\n    return merge(merge_sort(values[:mid]), merge_sort(values[mid:]))"
  };
  var diagrams = {
    "binary-search": "sorted: [2, 5, 8, 12, 16, 23]\n          ^ middle\nkeep only the half that can contain target",
    "merge-sort": "[8, 3, 5, 1]\n     /       \\\n [8, 3]     [5, 1]\n    \\         /\n       merge",
    "quick-sort": "less than pivot | pivot | greater than pivot\n     recurse    | fixed |    recurse",
    "graph-bfs": "distance 0:        A\n                   / \\\ndistance 1:      B   C\n                   \\ /\ndistance 2:        D",
    "graph-dfs": "A → B → D\n    ↑ backtrack to C after D",
    "topological-sort": "prerequisite → dependent\n       A → C → D\n       B ───↗",
    "dynamic-programming": "state(0) → state(1) → state(2)\n   \\\\________ cached reuse ________/",
    memoization: "solve(5)\n  ├─ solve(4)\n  │   └─ solve(3) [cache]\n  └─ solve(3) [reuse]",
    "prefix-sum": "prefix: [0, 4, 9, 12, 18]\nrange [1, 3] = prefix[4] - prefix[1]"
  };
  var workedExamples = {
    "linear-search": "In [4, 9, 2, 7], searching for 2 checks 4, then 9, then 2 and returns index 2. If the target is absent, every element must be checked.",
    "binary-search": "For [2, 5, 8, 12, 16, 23], target 16: compare with 8, discard the left half, then compare with 16. The sorted order is what makes that discarded half impossible.",
    "binary-search-variations": "In [1, 2, 2, 2, 5], ordinary search may return any 2. A lower-bound search keeps moving left after a match and returns index 1, the first position whose value is at least 2.",
    "binary-search-on-answer": "Split workloads [7, 2, 5, 10, 8] across two workers. A maximum load of 18 is feasible ([7,2,5] and [10,8]); 17 is not, so the smallest feasible limit is 18.",
    "bubble-sort": "Starting with [4, 1, 3], compare neighbors: swap 4 and 1, then 4 and 3. The first pass leaves the largest value, 4, at the end.",
    "selection-sort": "For [4, 2, 3], scan the unsorted suffix, find 2, and swap it into position 0. Repeat on [4, 3]; the sorted prefix grows by one each pass.",
    "insertion-sort": "For [4, 2, 3], hold 2, shift 4 right, and insert 2; then shift 4 and insert 3. At each step the prefix to the left is sorted.",
    "merge-sort": "Split [8, 3, 5, 1] into [8, 3] and [5, 1], sort them to [3, 8] and [1, 5], then repeatedly take the smaller front value to produce [1, 3, 5, 8].",
    "quick-sort": "Partition [4, 2, 5, 1] around pivot 4 into smaller values [2, 1] and larger values [5]. Once the pivot is in its final position, only the two sides need sorting.",
    "heap-sort": "Build a max-heap from [3, 1, 4, 2]. Move root 4 to the array's end, restore the heap over the remaining prefix, and repeat; the sorted suffix grows from right to left.",
    "counting-sort": "For keys [2, 0, 2, 1], counts are [1, 1, 2]; emit 0 once, 1 once, then 2 twice. This works well when the integer key range is small.",
    "radix-sort": "Sort [21, 13, 12] stably by ones digit to get [21, 12, 13], then by tens digit to get [12, 13, 21]. Stability preserves the order established by earlier digits.",
    "bucket-sort": "For values in [0, 1), distribute 0.12, 0.81, 0.25 into range buckets, sort within each bucket, then concatenate. Balanced buckets make the expected work small.",
    "tree-dfs": "On a tree with root A and children B and C, preorder visits A, then all of B's subtree, then C's. The call stack remembers where to resume after a child is finished.",
    "tree-bfs": "With root A and children B, C, enqueue B and C before visiting either subtree; the queue therefore emits A, B, C, then their children level by level.",
    "bst-search": "In a BST rooted at 8, search for 6: compare at 8 and go left; at 3 go right; then compare at 6. Each ordering comparison rules out one whole subtree.",
    "bst-insertion": "Insert 6 into a BST rooted at 8 with left child 3: go left at 8, right at 3, and attach 6 at the missing child position.",
    "bst-deletion": "To delete a node with two children, replace its key with its inorder successor (the smallest key in its right subtree), then remove that successor, which has at most one child.",
    "graph-bfs": "For edges A–B, A–C, B–D, C–D, BFS from A discovers B and C at distance 1, then D at distance 2. FIFO order makes the first discovery a shortest unweighted path.",
    "graph-dfs": "Starting at A, DFS follows A→B→D until no unvisited neighbor remains, backtracks, then explores C. The visited set prevents cycles from sending it around forever.",
    "topological-sort": "For prerequisites A→C, B→C, C→D, repeatedly remove a zero-indegree vertex: A and B can come first, then C, then D. A remaining cycle means no valid order exists.",
    "cycle-detection": "In an undirected DFS, an edge to an already visited vertex signals a cycle only when it is not the edge back to the current node's parent.",
    dijkstra: "With A→B cost 4, A→C cost 1, and C→B cost 2, the tentative distance to B starts at 4, then improves to 3 through C. Non-negative edges make a minimum unsettled distance safe to finalize.",
    "bellman-ford": "For S→A cost 4, S→B cost 5, and B→A cost −3, relaxing edges can improve A from 4 to 2. Repeating enough passes propagates paths with more edges; a further improvement reveals a reachable negative cycle.",
    "floyd-warshall": "If A→B costs 3 and B→C costs 4, the iteration that allows B as an intermediate updates A→C from infinity to 7.",
    kruskal: "Sort edges by weight and scan them: add an edge only when its endpoints are in different components. Union-find skips a cycle-forming edge without needing to rebuild the chosen tree.",
    prim: "Start at A and repeatedly choose the cheapest edge leaving the growing tree. The next edge connects one new vertex, so the tree expands without forming a cycle.",
    scc: "In A→B, B→A, and B→C, A and B can reach each other and form one strongly connected component; C is separate unless a path leads back from C.",
    "brute-force": "For a small list, compare every pair and keep the pair with the smallest difference. This gives a correct baseline and makes the repeated work visible before choosing a faster method.",
    "two-pointers": "In sorted [1, 2, 4, 7], seek a pair summing to 6: start at both ends, see 1+7 is too large, move the right pointer left, then 2+4 succeeds.",
    "sliding-window": "For positive values [2, 1, 3, 2] and target at least 5, expand to [2,1,3], record length 3, then shrink from the left while the sum stays at least 5. Positivity is what makes this shrinking rule safe.",
    "fast-slow-pointers": "In a linked list with a cycle, move slow one link and fast two. They eventually meet inside the cycle; if fast reaches null instead, the list is acyclic.",
    "prefix-sum": "For [4, 5, 3, 6], prefixes [0, 4, 9, 12, 18] give the sum from index 1 through 3 as prefix[4] − prefix[1] = 14.",
    "difference-arrays": "To add 5 to indices 1 through 3, record +5 at 1 and −5 at 4. A prefix scan applies the update to exactly that interval.",
    "hashing-pattern": "To find a repeated value in [4, 7, 4], keep a set of values already seen. The second 4 is detected with one expected constant-time membership check.",
    "binary-search-pattern": "If a capacity limit is feasible at 20, then every larger limit is feasible too. That monotone true/false boundary can be found with binary search even when the answer is not an array index.",
    "monotonic-stack": "For [2, 1, 3], the next greater value for 1 is 3. When 3 arrives, pop 1 (and then any smaller unresolved values); each item is pushed and popped at most once.",
    "monotonic-queue": "For window size 3 over [1, 3, 2, 5], keep candidate indices in decreasing value order. Before adding 5, discard 2 because it is older and smaller; 5 dominates it for future maxima.",
    intervals: "Sort [1,3], [2,5], [7,8] by start. The first two overlap and merge to [1,5]; [7,8] stays separate.",
    greedy: "For interval scheduling, sort by finish time and take the first interval that does not overlap the last choice. The exchange argument shows an optimal schedule can begin with that earliest-finishing interval.",
    "divide-and-conquer": "Merge sort divides eight values into halves until singletons, solves those trivial cases, then combines sorted pairs. The combine step does linear work at each of log₂(8) levels.",
    backtracking: "To generate subsets of [a,b], decide include/exclude for a, then include/exclude for b. Undo the choice after each recursive branch so one candidate cannot leak into its sibling.",
    "recursion-patterns": "A recursive list sum returns 0 for an empty list; otherwise it returns the first value plus the sum of the tail. The base case and shrinking tail explain both termination and the result.",
    "dynamic-programming": "For climbing stairs by 1 or 2 steps, ways[n] = ways[n−1] + ways[n−2]. The same smaller stair counts recur, so compute each once and reuse it.",
    memoization: "Naive Fibonacci recomputes fib(3) from both fib(5) and fib(4). A cache stores fib(3) after its first calculation and returns it immediately on the next request.",
    tabulation: "For Fibonacci, start with table [0,1] and fill left to right; when computing table[i], both preceding values are already available.",
    "dp-1d": "For house values [2, 7, 9, 3], let best[i] be the best total through i. At each house choose skip it or add its value to the best total two positions back.",
    "dp-2d": "For grid paths, let dp[r][c] count ways to reach a cell; when movement is only right or down, the value is dp[r−1][c] + dp[r][c−1]. Boundary cells have one valid route along the edge.",
    knapsack: "With capacity 5 and items (weight 2, value 3) and (weight 3, value 4), the best value is 7 by taking both. In 0/1 knapsack, each item may contribute at most once.",
    lcs: "For \"ABC\" and \"AC\", the longest common subsequence is \"AC\": it preserves order in both strings but skips B, so the answer need not be contiguous.",
    lis: "For [3, 1, 2, 5], an increasing subsequence is [1, 2, 5] of length 3. The O(n log n) method tracks the smallest tail for each length, not necessarily the final subsequence itself.",
    "bit-manipulation": "For binary 1010 and 1100, AND is 1000, OR is 1110, and XOR is 0110. XOR keeps exactly the bit positions where the inputs differ.",
    bitmasking: "With three choices, mask 101₂ represents selecting items 0 and 2. Bit i tests membership, so a subset becomes one integer and all subsets fit in 2ⁿ masks.",
    "segment-trees": "For values [2, 5, 1, 4], a segment tree stores summaries for ranges; a query for indices 1–3 combines the summaries for [1,1] and [2,3] rather than scanning all three values.",
    "fenwick-trees": "A Fenwick tree stores partial sums in cells selected by the lowest set bit. Updating index 3 changes the few covering cells; a prefix query gathers those same disjoint ranges.",
    "sparse-tables": "For a static range-minimum query, precompute answers for ranges of length 1, 2, 4, 8, and so on. A query can combine two overlapping power-of-two ranges because min is idempotent.",
    "advanced-tries": "A compressed trie stores a whole shared path as one edge label, reducing nodes for long unary chains. An XOR trie instead follows bits to choose a value that maximizes XOR with a query.",
    kmp: "When matching pattern \"ababaca\", a mismatch after a long prefix does not restart at the beginning: the prefix table keeps the longest suffix that is also a prefix and resumes there.",
    "z-algorithm": "For text \"aaaa\", Z[1] is 3 because the suffix beginning at index 1 shares three characters with the prefix. Reusing the current match window avoids comparing those characters again.",
    "rolling-hash": "A rolling hash for a window can subtract the outgoing character's weighted contribution and add the incoming one, avoiding rehashing the whole substring. Verify matching hashes character-by-character because collisions are possible.",
    "advanced-graphs": "A bridge in a DFS tree is an edge whose child subtree has no back edge to an ancestor. Removing it disconnects the graph; low-link values summarize whether such a back route exists.",
    "network-flow": "In a small delivery network, each edge capacity limits how much can pass through it. Repeatedly augment flow along residual paths until none remains; the final flow equals the capacity of a minimum cut.",
    lca: "In a rooted tree, the lowest common ancestor of nodes 4 and 5 is their deepest shared ancestor. Binary lifting stores 2ᵏ ancestors so a node can be raised quickly by the bits of a depth difference.",
    hld: "Heavy-light decomposition splits a tree path into a logarithmic number of heavy-chain segments. A path query then becomes several range queries over a base array, often backed by a segment tree.",
    "advanced-dp": "In assignment problems, a bitmask can record which tasks are already used; dp[mask] stores the best cost for that subset. This turns permutations into a recurrence over subsets, usually O(n·2ⁿ), so it suits small n."
  };
  var whyWorks = {
    "linear-search": "Every earlier candidate has been checked and rejected. If the target exists, scanning the whole list must reach it; if the scan ends, no untested candidate remains.",
    "binary-search": "Maintain the invariant that, if the target exists, it is still inside the current inclusive interval. Sorted order proves every discarded value cannot be the target; the interval shrinks until a match or emptiness.",
    "binary-search-variations": "A boundary search keeps one side known to satisfy a predicate and the other known not to. Moving on equality as well as inequality is what finds the first or last valid position.",
    "binary-search-on-answer": "The check must be monotone: once a candidate answer is feasible, every less restrictive candidate must also be feasible (or the reverse). Binary search is valid only after proving that property.",
    "merge-sort": "Each recursive half is sorted by induction; merging always takes the smaller next item, so the output is ordered and contains exactly both halves' values.",
    "quick-sort": "Partitioning puts every value on the correct side of the pivot. Once both smaller ranges are sorted recursively, their order around the pivot makes the whole range sorted.",
    "bubble-sort": "After one left-to-right pass, the largest remaining value has moved to the end of the unsorted prefix. Repeating leaves a sorted suffix; if a pass makes no swaps, the whole array is already sorted.",
    "selection-sort": "At each pass, the selected minimum is no greater than any value left in the suffix, so placing it next extends a sorted prefix.",
    "insertion-sort": "Before each step the prefix is sorted. Shifting only values larger than the held key creates the correct gap, and inserting the key restores the sorted-prefix invariant.",
    "heap-sort": "The heap property puts the maximum at the root. Moving it to the final unsorted position and restoring the heap leaves the remaining prefix valid for the next extraction.",
    "counting-sort": "The count for each key records exactly how many times it occurs. Emitting keys in order reproduces every input value once and in sorted order.",
    "radix-sort": "A stable pass orders values by the current digit without changing the order established by less-significant digits. Repeating for every digit therefore orders the full keys.",
    "bucket-sort": "Each bucket represents an ordered value range. Sorting within each bucket and concatenating buckets from low to high preserves the global order.",
    "tree-dfs": "Every child subtree is visited before its parent call returns. Induction over subtree size shows every node is visited once, provided the structure is a tree or a visited set prevents cycles.",
    "tree-bfs": "A FIFO queue processes all nodes at depth d before nodes at depth d + 1. Enqueuing each child once therefore visits the tree level by level.",
    "bst-search": "The BST invariant says every key in the left subtree is smaller and every key in the right subtree is larger. One comparison can rule out the entire opposite subtree.",
    "bst-insertion": "Following the ordering rule reaches a null child whose ancestors have already ruled out every other position. Attaching the key there preserves the BST invariant.",
    "bst-deletion": "A leaf can be removed, a one-child node can be replaced by its child, and a two-child node can be replaced by its successor. Each case preserves the ordering relation around the changed position.",
    "graph-bfs": "FIFO processing visits vertices in nondecreasing distance from the source. Therefore the first time a vertex is discovered, no shorter unprocessed path can reach it.",
    "graph-dfs": "DFS explores every reachable edge from a vertex before returning from that branch. A visited set ensures each vertex and edge is handled finitely, even with cycles.",
    "topological-sort": "A zero-indegree vertex has no remaining prerequisite, so it is safe to place next. If vertices remain but none has indegree zero, the remaining directed graph contains a cycle.",
    "cycle-detection": "A back edge to an ancestor closes a directed cycle; in an undirected traversal, the parent edge is not a cycle, so it must be excluded.",
    dijkstra: "With non-negative weights, a path through an unsettled vertex cannot later make the smallest tentative distance smaller. Negative edges break that proof.",
    "bellman-ford": "After k full relaxation passes, every shortest path using at most k edges has been considered. A further improvement after |V|−1 passes implies a reachable negative cycle.",
    "floyd-warshall": "After processing intermediate vertex k, the table contains shortest paths whose intermediate vertices come only from the processed set. The recurrence compares skipping k with routing through k.",
    kruskal: "The cut property says a lightest edge crossing a cut is safe for some minimum spanning tree. Union-find adds such edges only when they connect separate components.",
    prim: "At each step, the lightest edge crossing from the current tree to an outside vertex is safe by the cut property; adding it expands a minimum spanning tree without a cycle.",
    scc: "In the condensation graph, components form a DAG. Finish-time order from the first DFS lets the second pass on reversed edges start at a component without accidentally crossing into an unassigned one.",
    "two-pointers": "Sorted order makes each pointer move decisive: if the sum is too large, only lowering the right value can help; if too small, only raising the left value can help.",
    "sliding-window": "For nonnegative values, extending the right edge cannot decrease the sum and moving the left edge cannot increase it. That monotonicity justifies advancing each boundary without revisiting earlier windows.",
    "prefix-sum": "A prefix contains all values before its endpoint. Subtracting the prefix before the requested range cancels everything outside it.",
    "brute-force": "The method is correct when its candidate generator covers every valid answer and its test accepts exactly the valid ones. Its cost is the size of that candidate space.",
    "fast-slow-pointers": "In a cycle of length μ + λ, the fast pointer gains one link on slow per step; after enough steps their distance is a multiple of λ, so they meet. Reaching null proves no cycle exists.",
    "difference-arrays": "The difference representation records only where a value changes. Prefix-summing those changes reconstructs the original values and applies each range update between its two boundaries.",
    "hashing-pattern": "A set or map records all prior values under the required equality rule. Membership answers whether a matching value has appeared, avoiding a rescan of the prefix.",
    "binary-search-pattern": "Monotonicity means feasible answers form a contiguous prefix or suffix. Binary search can discard one side without losing the transition point.",
    "monotonic-stack": "When a new value is larger, it is the first greater value for every smaller value popped before reaching an equal-or-larger blocker; each index is pushed and popped once.",
    "monotonic-queue": "A newer candidate at least as large as an older one will outlive it and be no smaller, so the older candidate can never become a future maximum. Expiring indices keeps the front valid for the current window.",
    intervals: "Sorting by start places possible overlaps next to the interval that can merge with them. Extending the current end until there is a gap therefore captures each connected overlap group.",
    "divide-and-conquer": "If subproblems become smaller and their answers contain enough information to combine, induction proves the result: solve the smallest cases directly, then combine correct answers for smaller instances.",
    greedy: "A greedy choice is correct only when an exchange argument, cut property, or other proof shows an optimal solution can include it. Local attractiveness alone is not a proof.",
    backtracking: "The recursion explores every allowed next choice; undoing state restores the exact parent state before another branch. Pruning is valid only when the rejected partial state cannot lead to a solution.",
    "dynamic-programming": "A recurrence is correct when its states fully describe the subproblem and every valid solution is covered by its transitions. Solving smaller dependencies first then gives each state the right answer.",
    "recursion-patterns": "A base case gives the answer for the smallest instance; each recursive call reduces the instance, and combining its correct smaller answer proves the larger result.",
    memoization: "Caching is correct when the cache key contains every part of the state that can affect the result. Then repeated calls to the same subproblem can safely reuse its first answer.",
    tabulation: "A bottom-up order is correct when every dependency of a state has already been computed. The table then follows the recurrence without requiring recursive calls.",
    knapsack: "For each item, every feasible solution either excludes it or includes it once; comparing those cases covers all subsets. The recurrence's loop order must preserve that one-use rule.",
    lcs: "For matching final characters, an optimal common subsequence can include that character after an optimal pair of shorter prefixes. For a mismatch, at least one final character must be skipped.",
    lis: "For each length, keeping the smallest possible tail leaves at least as much room for future values as any larger tail. Replacing a tail preserves the best achievable lengths.",
    "dp-1d": "The state definition records enough information about the processed prefix. Considering every legal way to reach position i from earlier states ensures the best value is not skipped.",
    "dp-2d": "Each table cell represents a pair of prefix states. Its recurrence covers the valid final choice, and a dependency-respecting fill order ensures the referenced smaller states are ready.",
    "bit-manipulation": "Each bit position represents an independent Boolean value. Applying AND, OR, or XOR position by position gives exactly the desired per-bit truth table.",
    bitmasking: "An n-bit mask has one bit for each of n choices, so each subset has exactly one representation. Setting, clearing, or testing a bit changes only the corresponding membership.",
    "sparse-tables": "A range is covered by two power-of-two blocks of the largest fitting size. For an idempotent operation such as min, overlap does not change the result, allowing O(1) queries.",
    "advanced-tries": "Every key follows a unique sequence of edge labels or bits. Compression only joins paths with no branching, so lookup and prefix relationships are preserved.",
    kmp: "The prefix table records the longest pattern prefix that is also a suffix of the matched text. After a mismatch, that overlap is the only alignment that can still match without rechecking known characters.",
    "z-algorithm": "Inside a known prefix-match window, previously computed Z values reveal which characters already match. Comparisons are needed only beyond the known boundary, keeping total work linear.",
    "rolling-hash": "The rolling update is algebraically the same polynomial hash for the next window, with the old leading term removed and the new symbol appended; equal hashes still require verification.",
    "segment-trees": "Every range is partitioned into stored disjoint segments. Combining their summaries answers the query, and an update touches only the nodes on one root-to-leaf path.",
    "fenwick-trees": "Each Fenwick cell represents a fixed interval determined by its lowest set bit. Prefix queries decompose a prefix into disjoint stored intervals; point updates visit exactly the intervals containing that index.",
    "advanced-graphs": "A DFS low-link value records the earliest ancestor reachable from a subtree. Comparing it with the parent's discovery time identifies whether a back edge can bypass a tree edge.",
    "network-flow": "An augmenting path increases flow while respecting residual capacity; reverse residual edges allow earlier choices to be repaired. When no path remains, the resulting cut has the same capacity as the flow.",
    lca: "After equalizing depths, lifting both nodes by the largest ancestor powers that keep them distinct leaves them just below their lowest shared ancestor.",
    hld: "Choosing a largest child as heavy ensures every light edge reduces the remaining subtree size by at least a constant factor. A root-to-leaf path therefore crosses only O(log n) light edges.",
    "advanced-dp": "A state such as a subset mask plus a current endpoint captures what future choices need. Transitions enumerate each valid next choice, so each complete solution corresponds to a path through the state graph."
  };
  var vizFor = {
    "linear-search": "array", "binary-search": "binary-search", "binary-search-variations": "binary-search",
    "bubble-sort": "sorting", "selection-sort": "sorting", "insertion-sort": "sorting", "merge-sort": "sorting", "quick-sort": "sorting",
    "tree-dfs": "bst", "tree-bfs": "bst", "bst-search": "bst", "bst-insertion": "bst", "graph-bfs": "graph", "graph-dfs": "graph",
    memoization: "dp", tabulation: "dp", "dynamic-programming": "dp"
  };

  function register(tp) {
    if (tp.aliasOf) return;
    var title = h.esc(tp.title), summary = h.esc(tp.sum);
    var recipe = recipes[tp.id] || ["Identify the invariant, make one well-defined step, and repeat until the stopping condition holds.", "Analyse the number of states or items processed and the work per step.", "Prove why each step is safe and define behavior for boundary cases."];
    var example = workedExamples[tp.id] || tp.sum;
    var picture = diagrams[tp.id];
    var code = codeSamples[tp.id];
    var visualizer = vizFor[tp.id];
    var html = "<p><strong>" + title + ":</strong> " + summary + "</p>" +
      '<div class="worked-example"><span class="worked-label">Worked example</span><p>' + h.esc(example) + "</p></div>" +
      (picture ? h.diagram(picture, "A compact view of the process.") : "") +
      h.callout("info", "Core technique", h.esc(recipe[0]));
    if (code) html += h.code(code, "Python pattern");
    if (visualizer) html += h.viz(visualizer);
    DSA.lesson(tp.id, {
      minutes: 16,
      lede: tp.sum,
      sections: [
        { id: "approach", title: "Understand the approach", html: html },
        { id: "correctness-cost", title: "Correctness and complexity", html: "<p><strong>Why it works:</strong> " + h.esc(whyWorks[tp.id] || recipe[0]) + "</p>" +
          "<p><strong>Typical cost:</strong> " + h.esc(recipe[1]) + "</p>" +
          h.callout("mistake", "Check preconditions", h.esc(recipe[2])) +
          "<p>For variants, use the same structure but re-derive the invariant and boundary behavior; a familiar name does not guarantee the same assumptions.</p>" },
        { id: "implementation", title: "Implementation checklist", html: "<ol><li>Clarify input size, ordering, duplicates, and whether a solution is guaranteed to exist.</li><li>Choose a state representation and write the invariant in one sentence.</li><li>Handle empty and smallest inputs explicitly.</li><li>Test a normal case, a boundary case, and a case that exercises the main failure mode.</li></ol>" +
          "<p><strong>Prerequisites:</strong> " + (tp.pre.filter(function (id) { return DSA.topics[id]; }).map(function (id) { return h.link(id, DSA.topics[id].title); }).join(", ") || "No prerequisites.") + "</p>" }
      ],
      practice: [
        { q: "For " + tp.title + ", state the key invariant or decision rule and identify one condition required for it to work.",
          hint: "Use the technique description above, then look for ordering, weights, graph type, or state assumptions.",
          answer: "The central idea is: " + tp.sum + " A suitable invariant or decision rule is: " + recipe[0] + " Its typical cost is " + recipe[1] + " The important caveat is: " + recipe[2] }
      ]
    });
  }

  ["algorithms", "patterns", "advanced"].forEach(function (domainId) {
    DSA.domains.filter(function (domain) { return domain.id === domainId; })
      .forEach(function (domain) { domain.groups.forEach(function (group) { group.topics.forEach(register); }); });
  });
})(window.DSA = window.DSA || {});
