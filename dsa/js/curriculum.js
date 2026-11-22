/* Curriculum: domains -> groups -> topics.
   Topic ids are STABLE: they are used as progress keys (localStorage + Roadmap Hub sync).
   Never rename an id after release; add `aliasOf` instead.
   Fields: id, title, level (b|i|a), pre (true prerequisites), rel (related, not required), sum (one-line scope). */
(function () {
  "use strict";
  var DSA = (window.DSA = window.DSA || {});

  function t(id, title, level, pre, rel, sum, extra) {
    var o = { id: id, title: title, level: level, pre: pre || [], rel: rel || [], sum: sum || "" };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }

  DSA.domains = [
    {
      id: "foundations", num: "01", title: "Programming Foundations",
      desc: "How programs run, how data lives in memory, and the small amount of mathematics every later topic leans on.",
      groups: [
        { id: "core-ideas", title: "Core ideas", topics: [
          t("what-is-an-algorithm", "What is an Algorithm?", "b", [], ["what-is-a-data-structure", "why-complexity-matters"], "A precise, finite sequence of steps that turns input into output — and how to judge one."),
          t("what-is-a-data-structure", "What is a Data Structure?", "b", ["what-is-an-algorithm"], ["arrays", "hash-tables"], "Ways of organising data so the operations you need are fast."),
          t("algorithms-vs-data-structures", "Algorithms vs Data Structures", "b", ["what-is-an-algorithm", "what-is-a-data-structure"], ["big-o-notation"], "How the choice of structure decides which algorithms are possible and how fast they are."),
          t("how-programs-execute", "How Programs Execute", "b", [], ["call-stack", "variables-and-memory"], "Source code, interpreters, instructions, and the line-by-line execution model.")
        ]},
        { id: "language-basics", title: "Language building blocks", topics: [
          t("variables-and-memory", "Variables and Memory", "b", ["how-programs-execute"], ["references-and-values", "arrays"], "Memory as numbered boxes, what a variable really names, and how big values are."),
          t("functions", "Functions", "b", ["variables-and-memory"], ["call-stack", "recursion"], "Packaging steps into reusable units with their own local variables."),
          t("parameters-and-return-values", "Parameters and Return Values", "b", ["functions"], ["references-and-values"], "How data flows into and out of a function."),
          t("loops-and-conditions", "Loops and Conditions", "b", ["variables-and-memory"], ["analyzing-loops"], "Branching and repetition — the source of almost all running time."),
          t("recursion", "Recursion", "b", ["functions", "call-stack"], ["recursion-patterns", "divide-and-conquer", "backtracking", "recurrence-relations"], "Solving a problem by solving smaller copies of the same problem."),
          t("call-stack", "Call Stack", "b", ["functions"], ["stacks", "recursion", "stack-vs-heap"], "How a program remembers where it is when functions call functions.")
        ]},
        { id: "memory-model", title: "Memory model", topics: [
          t("stack-vs-heap", "Stack vs Heap Memory", "i", ["call-stack", "variables-and-memory"], ["dynamic-arrays", "singly-linked-lists"], "Short-lived frames versus long-lived objects."),
          t("references-and-values", "References and Values", "b", ["variables-and-memory"], ["singly-linked-lists", "mutable-immutable"], "Why changing a list inside a function changes it outside, and a number does not."),
          t("mutable-immutable", "Mutable and Immutable Objects", "b", ["references-and-values"], ["strings", "hash-tables"], "Objects that can change in place versus objects that cannot, and why it matters for hashing.")
        ]},
        { id: "math", title: "Mathematics for DSA", topics: [
          t("basic-math", "Basic Mathematics for DSA", "b", [], ["logarithms", "summations"], "Exponents, integer division, modulo, floors and ceilings."),
          t("logarithms", "Logarithms", "b", ["basic-math"], ["logarithmic-complexity", "binary-search"], "How many times you can halve something — the key to O(log n)."),
          t("summations", "Summations", "b", ["basic-math"], ["nested-loops", "quadratic-complexity"], "Adding up the work of loops: 1 + 2 + … + n."),
          t("discrete-math", "Discrete Mathematics Fundamentals", "i", ["basic-math"], ["graphs", "recurrence-relations", "bit-manipulation"], "Sets, logic, proof by induction, counting and basic graph vocabulary.")
        ]}
      ]
    },
    {
      id: "complexity", num: "02", title: "Complexity Analysis",
      desc: "The language for comparing algorithms without running them: how work and memory grow as input grows.",
      groups: [
        { id: "why", title: "Measuring cost", topics: [
          t("why-complexity-matters", "Why Complexity Analysis Matters", "b", ["what-is-an-algorithm"], ["time-complexity"], "Why stopwatch timing is not enough and growth rate is what counts."),
          t("time-complexity", "Time Complexity", "b", ["why-complexity-matters", "loops-and-conditions"], ["big-o-notation", "analyzing-loops"], "Counting basic steps as a function of input size n."),
          t("space-complexity", "Space Complexity", "b", ["time-complexity", "variables-and-memory"], ["call-stack", "memoization"], "Counting extra memory, including the call stack."),
          t("asymptotic-analysis", "Asymptotic Analysis", "i", ["time-complexity"], ["big-o-notation", "big-theta"], "Ignoring constants and small inputs to see the shape of growth.")
        ]},
        { id: "notation", title: "Notation", topics: [
          t("big-o-notation", "Big O Notation", "b", ["time-complexity"], ["big-omega", "big-theta", "worst-case"], "An upper bound on growth — the most common way to describe cost."),
          t("big-omega", "Big Omega", "i", ["big-o-notation"], ["best-case"], "A lower bound on growth."),
          t("big-theta", "Big Theta", "i", ["big-o-notation", "big-omega"], ["asymptotic-analysis"], "A tight bound: both upper and lower."),
          t("best-case", "Best Case", "b", ["time-complexity"], ["big-omega", "linear-search"], "The cheapest possible input of size n."),
          t("average-case", "Average Case", "i", ["best-case", "worst-case"], ["quick-sort", "hash-tables"], "Expected cost over a distribution of inputs."),
          t("worst-case", "Worst Case", "b", ["time-complexity"], ["big-o-notation"], "The most expensive input of size n — the usual guarantee.")
        ]},
        { id: "classes", title: "Growth classes", topics: [
          t("constant-complexity", "Constant — O(1)", "b", ["big-o-notation"], ["arrays", "hash-tables"], "Work that does not depend on n."),
          t("logarithmic-complexity", "Logarithmic — O(log n)", "b", ["big-o-notation", "logarithms"], ["binary-search", "heaps"], "Halving the problem each step."),
          t("linear-complexity", "Linear — O(n)", "b", ["big-o-notation"], ["linear-search"], "Touching each element a constant number of times."),
          t("linearithmic-complexity", "Linearithmic — O(n log n)", "i", ["logarithmic-complexity", "linear-complexity"], ["merge-sort", "heap-sort"], "The cost of efficient comparison sorting."),
          t("quadratic-complexity", "Quadratic — O(n²)", "b", ["linear-complexity", "summations"], ["nested-loops", "bubble-sort"], "Comparing every pair."),
          t("polynomial-complexity", "Polynomial — O(nᵏ)", "i", ["quadratic-complexity"], ["floyd-warshall"], "Any fixed power of n."),
          t("exponential-complexity", "Exponential — O(2ⁿ)", "i", ["quadratic-complexity"], ["backtracking", "memoization", "bitmasking"], "Doubling work for every extra element."),
          t("factorial-complexity", "Factorial — O(n!)", "i", ["exponential-complexity"], ["backtracking"], "Trying every ordering.")
        ]},
        { id: "techniques", title: "Analysis techniques", topics: [
          t("analyzing-loops", "Analyzing Loops", "b", ["time-complexity", "loops-and-conditions"], ["nested-loops"], "Reading cost off single loops, including ones that halve or double."),
          t("nested-loops", "Nested Loops", "b", ["analyzing-loops", "summations"], ["quadratic-complexity"], "Multiplying and summing loop costs."),
          t("recursive-complexity", "Recursive Complexity", "i", ["recursion", "time-complexity"], ["recurrence-relations"], "Counting calls in a recursion tree."),
          t("recurrence-relations", "Recurrence Relations", "i", ["recursive-complexity"], ["merge-sort", "divide-and-conquer"], "T(n) = 2T(n/2) + n and how to solve it, including the Master Theorem."),
          t("amortized-analysis", "Amortized Analysis", "i", ["time-complexity"], ["dynamic-arrays", "union-find"], "Average cost per operation over a long sequence.")
        ]}
      ]
    },
    {
      id: "structures", num: "03", title: "Data Structures",
      desc: "Concrete ways to organise data. Each one makes some operations cheap and others expensive.",
      groups: [
        { id: "linear", title: "Linear structures", topics: [
          t("arrays", "Arrays", "b", ["variables-and-memory", "big-o-notation"], ["dynamic-arrays", "strings", "singly-linked-lists"], "Contiguous, indexed storage with O(1) access."),
          t("dynamic-arrays", "Dynamic Arrays", "b", ["arrays"], ["amortized-analysis", "stacks"], "Arrays that grow: Python lists, capacity and doubling."),
          t("strings", "Strings", "b", ["arrays", "mutable-immutable"], ["hashing-pattern", "two-pointers", "kmp"], "Sequences of characters, encoding, immutability and string building."),
          t("singly-linked-lists", "Singly Linked Lists", "b", ["references-and-values", "arrays"], ["doubly-linked-lists", "fast-slow-pointers"], "Nodes connected by next references."),
          t("doubly-linked-lists", "Doubly Linked Lists", "i", ["singly-linked-lists"], ["deques"], "Nodes with prev and next for O(1) removal anywhere."),
          t("circular-linked-lists", "Circular Linked Lists", "i", ["singly-linked-lists"], ["circular-queues"], "The last node points back to the first."),
          t("stacks", "Stacks", "b", ["arrays"], ["call-stack", "monotonic-stack", "graph-dfs"], "Last in, first out."),
          t("queues", "Queues", "b", ["arrays"], ["graph-bfs", "circular-queues"], "First in, first out."),
          t("circular-queues", "Circular Queues", "i", ["queues"], ["circular-linked-lists"], "A fixed-size queue that wraps around."),
          t("deques", "Deques", "i", ["queues", "stacks"], ["monotonic-queue", "doubly-linked-lists"], "Double-ended queues: push and pop at both ends.")
        ]},
        { id: "hash", title: "Hash-based structures", topics: [
          t("hash-tables", "Hash Tables", "b", ["arrays", "mutable-immutable"], ["sets", "dictionaries", "hashing-pattern"], "Average O(1) lookup by key."),
          t("hash-functions", "Hash Functions", "i", ["hash-tables"], ["rolling-hash"], "Turning keys into bucket numbers: properties of good hashes."),
          t("hash-collisions", "Hash Collisions", "i", ["hash-functions"], ["collision-resolution"], "Why two keys can land in the same bucket, and the pigeonhole principle."),
          t("collision-resolution", "Collision Resolution", "i", ["hash-collisions"], ["chaining", "open-addressing"], "Strategies for sharing buckets."),
          t("chaining", "Chaining", "i", ["collision-resolution", "singly-linked-lists"], ["open-addressing"], "Each bucket holds a small list."),
          t("open-addressing", "Open Addressing", "i", ["collision-resolution"], ["chaining"], "Probing for the next free slot; load factor and deletion tombstones."),
          t("sets", "Sets", "b", ["hash-tables"], ["hashing-pattern"], "Membership tests in O(1) average time."),
          t("dictionaries", "Dictionaries / Maps", "b", ["hash-tables"], ["hashing-pattern", "memoization"], "Key → value storage, Python dict internals.")
        ]},
        { id: "hierarchical", title: "Hierarchical structures", topics: [
          t("trees", "Trees", "b", ["recursion", "singly-linked-lists"], ["binary-trees", "graphs"], "Hierarchies: root, children, leaves, depth and height."),
          t("binary-trees", "Binary Trees", "b", ["trees"], ["tree-traversals", "heaps"], "Trees with at most two children."),
          t("binary-search-trees", "Binary Search Trees", "i", ["binary-trees", "binary-search"], ["avl-trees", "bst-search"], "Ordered binary trees: left < node < right."),
          t("tree-traversals", "Tree Traversals", "b", ["binary-trees", "recursion"], ["tree-dfs", "tree-bfs"], "Pre-order, in-order, post-order and level-order."),
          t("avl-trees", "AVL Trees", "a", ["binary-search-trees"], ["red-black-trees"], "Self-balancing with height-balance factors and rotations."),
          t("red-black-trees", "Red-Black Trees", "a", ["binary-search-trees"], ["avl-trees"], "Self-balancing with colour rules; used by many standard libraries."),
          t("heaps", "Heaps", "i", ["binary-trees", "arrays"], ["priority-queues", "heap-sort"], "Complete binary trees stored in arrays with the heap property."),
          t("priority-queues", "Priority Queues", "i", ["heaps"], ["dijkstra", "greedy"], "Always remove the most important item next; Python heapq."),
          t("tries", "Tries", "i", ["trees", "strings"], ["advanced-tries"], "Prefix trees for words and autocomplete.")
        ]},
        { id: "network", title: "Network structures", topics: [
          t("graphs", "Graphs", "i", ["trees", "discrete-math"], ["graph-bfs", "graph-dfs"], "Vertices and edges: modelling connections."),
          t("directed-graphs", "Directed Graphs", "i", ["graphs"], ["topological-sort", "scc"], "Edges with direction."),
          t("undirected-graphs", "Undirected Graphs", "i", ["graphs"], ["cycle-detection"], "Two-way edges."),
          t("weighted-graphs", "Weighted Graphs", "i", ["graphs"], ["dijkstra", "kruskal"], "Edges with costs."),
          t("adjacency-matrix", "Adjacency Matrix", "i", ["graphs", "arrays"], ["floyd-warshall"], "A V×V grid of connections."),
          t("adjacency-list", "Adjacency List", "i", ["graphs", "dictionaries"], ["graph-bfs"], "Each vertex stores its neighbours."),
          t("disjoint-set-union", "Disjoint Set Union", "i", ["arrays", "trees"], ["kruskal", "amortized-analysis"], "Tracking which elements belong to the same group."),
          t("union-find", "Union-Find", "i", ["disjoint-set-union"], ["kruskal"], "Path compression and union by rank.", { aliasOf: "disjoint-set-union" })
        ]}
      ]
    },
    {
      id: "algorithms", num: "04", title: "Algorithms",
      desc: "Classic procedures for searching, sorting and walking trees and graphs.",
      groups: [
        { id: "searching", title: "Searching", topics: [
          t("linear-search", "Linear Search", "b", ["arrays", "linear-complexity"], ["binary-search"], "Check every element until you find it."),
          t("binary-search", "Binary Search", "b", ["arrays", "logarithms"], ["binary-search-variations", "binary-search-trees"], "Halve a sorted range each step."),
          t("binary-search-variations", "Binary Search Variations", "i", ["binary-search"], ["binary-search-pattern"], "First/last occurrence, insertion point, rotated arrays."),
          t("binary-search-on-answer", "Binary Search on Answer", "i", ["binary-search-variations"], ["greedy"], "Searching over possible answers instead of array positions.")
        ]},
        { id: "sorting", title: "Sorting", topics: [
          t("bubble-sort", "Bubble Sort", "b", ["arrays", "nested-loops"], ["insertion-sort"], "Repeatedly swap adjacent out-of-order pairs."),
          t("selection-sort", "Selection Sort", "b", ["arrays", "nested-loops"], ["heap-sort"], "Repeatedly select the minimum."),
          t("insertion-sort", "Insertion Sort", "b", ["arrays", "nested-loops"], ["bubble-sort"], "Grow a sorted prefix by inserting each element."),
          t("merge-sort", "Merge Sort", "i", ["recursion", "linearithmic-complexity"], ["divide-and-conquer", "recurrence-relations"], "Split, sort halves, merge."),
          t("quick-sort", "Quick Sort", "i", ["recursion", "linearithmic-complexity"], ["divide-and-conquer", "average-case"], "Partition around a pivot."),
          t("heap-sort", "Heap Sort", "i", ["heaps"], ["selection-sort"], "Build a heap, repeatedly extract the maximum."),
          t("counting-sort", "Counting Sort", "i", ["arrays"], ["radix-sort"], "Sorting small integer keys without comparisons."),
          t("radix-sort", "Radix Sort", "i", ["counting-sort"], ["bucket-sort"], "Sort digit by digit."),
          t("bucket-sort", "Bucket Sort", "i", ["arrays", "insertion-sort"], ["radix-sort"], "Scatter into ranges, sort each.")
        ]},
        { id: "tree-algorithms", title: "Tree algorithms", topics: [
          t("tree-traversal-algorithm", "Tree Traversal", "b", ["tree-traversals"], [], "Alias of Tree Traversals in Data Structures.", { aliasOf: "tree-traversals" }),
          t("tree-dfs", "Tree DFS", "b", ["tree-traversals", "stacks"], ["graph-dfs"], "Depth-first walks, recursive and iterative."),
          t("tree-bfs", "Tree BFS", "b", ["tree-traversals", "queues"], ["graph-bfs"], "Level-by-level walks with a queue."),
          t("bst-search", "BST Search", "i", ["binary-search-trees"], ["binary-search"], "Walk left or right by comparison."),
          t("bst-insertion", "BST Insertion", "i", ["bst-search"], ["avl-trees"], "Find the empty spot and attach."),
          t("bst-deletion", "BST Deletion", "i", ["bst-insertion"], ["avl-trees"], "Three cases: leaf, one child, two children.")
        ]},
        { id: "graph-algorithms", title: "Graph algorithms", topics: [
          t("graph-bfs", "Graph BFS", "i", ["graphs", "queues", "adjacency-list"], ["tree-bfs", "dijkstra"], "Explore in rings of distance; shortest paths in unweighted graphs."),
          t("graph-dfs", "Graph DFS", "i", ["graphs", "stacks", "recursion"], ["tree-dfs", "cycle-detection", "topological-sort"], "Go deep, then backtrack."),
          t("topological-sort", "Topological Sorting", "i", ["directed-graphs", "graph-dfs"], ["cycle-detection"], "Ordering tasks so dependencies come first."),
          t("cycle-detection", "Cycle Detection", "i", ["graph-dfs"], ["union-find"], "Finding loops in directed and undirected graphs."),
          t("dijkstra", "Dijkstra", "i", ["weighted-graphs", "priority-queues"], ["bellman-ford"], "Shortest paths with non-negative weights."),
          t("bellman-ford", "Bellman-Ford", "a", ["weighted-graphs"], ["dijkstra"], "Shortest paths with negative weights; detecting negative cycles."),
          t("floyd-warshall", "Floyd-Warshall", "a", ["weighted-graphs", "adjacency-matrix", "dynamic-programming"], ["bellman-ford"], "All-pairs shortest paths."),
          t("kruskal", "Kruskal", "i", ["weighted-graphs", "union-find", "merge-sort"], ["prim"], "Minimum spanning tree by sorting edges."),
          t("prim", "Prim", "i", ["weighted-graphs", "priority-queues"], ["kruskal", "dijkstra"], "Minimum spanning tree by growing from a vertex."),
          t("scc", "Strongly Connected Components", "a", ["directed-graphs", "graph-dfs"], ["topological-sort"], "Kosaraju and Tarjan.")
        ]}
      ]
    },
    {
      id: "patterns", num: "05", title: "Problem-Solving Patterns",
      desc: "Reusable ways of thinking. Recognising the pattern is usually most of the solution.",
      groups: [
        { id: "array-patterns", title: "Array and string patterns", topics: [
          t("brute-force", "Brute Force", "b", ["time-complexity"], ["two-pointers", "hashing-pattern"], "Try everything first, then find what is wasted."),
          t("two-pointers", "Two Pointers", "b", ["arrays"], ["sliding-window", "fast-slow-pointers"], "Two indices moving toward or alongside each other."),
          t("sliding-window", "Sliding Window", "i", ["two-pointers"], ["prefix-sum", "monotonic-queue"], "Maintain a moving range instead of recomputing it."),
          t("fast-slow-pointers", "Fast and Slow Pointers", "i", ["singly-linked-lists", "two-pointers"], ["cycle-detection"], "Floyd's cycle detection and finding middles."),
          t("prefix-sum", "Prefix Sum", "b", ["arrays"], ["difference-arrays", "fenwick-trees"], "Precompute running totals for O(1) range sums."),
          t("difference-arrays", "Difference Arrays", "i", ["prefix-sum"], [], "O(1) range updates."),
          t("hashing-pattern", "Hashing", "b", ["hash-tables"], ["two-pointers"], "Trading memory for time with sets and maps."),
          t("binary-search-pattern", "Binary Search Pattern", "i", ["binary-search-variations"], ["binary-search-on-answer"], "Recognising monotonic conditions."),
          t("monotonic-stack", "Monotonic Stack", "i", ["stacks"], ["monotonic-queue"], "Next greater element and friends."),
          t("monotonic-queue", "Monotonic Queue", "i", ["deques", "sliding-window"], ["monotonic-stack"], "Sliding-window maximum."),
          t("intervals", "Intervals", "i", ["merge-sort"], ["greedy"], "Merging, inserting and scheduling ranges.")
        ]},
        { id: "strategies", title: "Algorithmic strategies", topics: [
          t("greedy", "Greedy Algorithms", "i", ["brute-force"], ["dynamic-programming", "intervals"], "Take the locally best choice — and prove it is safe."),
          t("divide-and-conquer", "Divide and Conquer", "i", ["recursion"], ["merge-sort", "quick-sort"], "Split, solve, combine."),
          t("backtracking", "Backtracking", "i", ["recursion"], ["exponential-complexity"], "Build candidates step by step, undo dead ends."),
          t("recursion-patterns", "Recursion Patterns", "i", ["recursion"], ["backtracking", "tree-dfs"], "Accumulators, helper functions, returning vs passing results.")
        ]},
        { id: "dp", title: "Dynamic programming", topics: [
          t("dynamic-programming", "Dynamic Programming", "i", ["recursion", "memoization"], ["greedy"], "Overlapping subproblems + optimal substructure."),
          t("memoization", "Memoization", "i", ["recursion", "dictionaries"], ["tabulation"], "Cache results of recursive calls."),
          t("tabulation", "Tabulation", "i", ["memoization"], ["dp-1d"], "Fill a table bottom-up."),
          t("dp-1d", "1D Dynamic Programming", "i", ["tabulation"], ["dp-2d"], "Climbing stairs, house robber, coin change."),
          t("dp-2d", "2D Dynamic Programming", "i", ["dp-1d"], ["lcs", "knapsack"], "Grid paths, edit distance."),
          t("knapsack", "Knapsack Problems", "i", ["dp-2d"], [], "0/1 and unbounded knapsack."),
          t("lcs", "Longest Common Subsequence", "i", ["dp-2d"], ["strings"], "Comparing two sequences."),
          t("lis", "Longest Increasing Subsequence", "i", ["dp-1d", "binary-search"], [], "O(n²) DP and the O(n log n) patience method.")
        ]}
      ]
    },
    {
      id: "advanced", num: "06", title: "Advanced Topics",
      desc: "Specialised tools for range queries, string matching and harder graph problems.",
      groups: [
        { id: "bits", title: "Bits", topics: [
          t("bit-manipulation", "Bit Manipulation", "a", ["basic-math"], ["bitmasking"], "AND, OR, XOR, shifts and their tricks."),
          t("bitmasking", "Bitmasking", "a", ["bit-manipulation"], ["advanced-dp", "exponential-complexity"], "Representing subsets as integers.")
        ]},
        { id: "range", title: "Range queries", topics: [
          t("segment-trees", "Segment Trees", "a", ["binary-trees", "recursion"], ["fenwick-trees"], "Range queries and point updates in O(log n)."),
          t("fenwick-trees", "Fenwick Trees", "a", ["prefix-sum", "bit-manipulation"], ["segment-trees"], "Binary indexed trees for prefix sums."),
          t("sparse-tables", "Sparse Tables", "a", ["dynamic-programming"], ["lca"], "O(1) range minimum queries on static data.")
        ]},
        { id: "strings-adv", title: "String algorithms", topics: [
          t("advanced-tries", "Advanced Tries", "a", ["tries"], [], "Compressed tries and XOR tries."),
          t("kmp", "KMP", "a", ["strings"], ["z-algorithm"], "Linear-time pattern matching with a failure table."),
          t("z-algorithm", "Z Algorithm", "a", ["strings"], ["kmp"], "Z-array for matching."),
          t("rolling-hash", "Rolling Hash", "a", ["hash-functions", "strings"], ["kmp"], "Rabin-Karp.")
        ]},
        { id: "graphs-adv", title: "Graphs and DP", topics: [
          t("advanced-graphs", "Advanced Graph Algorithms", "a", ["dijkstra", "graph-dfs"], ["network-flow"], "Bridges, articulation points, 0-1 BFS, A*."),
          t("network-flow", "Network Flow", "a", ["graph-bfs", "weighted-graphs"], [], "Max flow, min cut, Edmonds-Karp."),
          t("lca", "Lowest Common Ancestor", "a", ["trees", "tree-dfs"], ["sparse-tables"], "Binary lifting."),
          t("hld", "Heavy-Light Decomposition", "a", ["lca", "segment-trees"], [], "Path queries on trees."),
          t("advanced-dp", "Advanced Dynamic Programming", "a", ["dp-2d"], ["bitmasking"], "Bitmask, interval, tree and digit DP.")
        ]}
      ]
    }
  ];

  /* Flattened index helpers */
  DSA.topics = {};
  DSA.order = [];
  DSA.domains.forEach(function (d) {
    d.groups.forEach(function (g) {
      g.topics.forEach(function (tp) {
        tp.domain = d.id; tp.group = g.id; tp.groupTitle = g.title; tp.domainTitle = d.title;
        DSA.topics[tp.id] = tp;
        DSA.order.push(tp.id);
      });
    });
  });
  /* Reverse edges: which topics list this one as a prerequisite */
  DSA.order.forEach(function (id) { DSA.topics[id].unlocks = []; });
  DSA.order.forEach(function (id) {
    DSA.topics[id].pre.forEach(function (p) { if (DSA.topics[p]) DSA.topics[p].unlocks.push(id); });
  });
})();
