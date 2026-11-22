(function (DSA) {
  "use strict";
  var h = DSA.h;
  var operations = {
    arrays: ["Index access O(1)", "Search O(n)", "Middle insertion/deletion O(n)"],
    "dynamic-arrays": ["Index access O(1)", "Append O(1) amortized", "Insert/delete in the middle O(n)"],
    strings: ["Indexing is often O(1)", "Search depends on the algorithm", "Repeated immutable concatenation may copy data"],
    "singly-linked-lists": ["Head insertion O(1)", "Search O(n)", "Deletion O(1) once the previous node is known"],
    "doubly-linked-lists": ["Insert/remove at a known node O(1)", "Search O(n)", "Each node uses extra space for prev"],
    "circular-linked-lists": ["Move to the next node O(1)", "Search O(n)", "There is no null end marker"],
    stacks: ["Push O(1)", "Pop O(1)", "Top O(1)"],
    queues: ["Enqueue O(1)", "Dequeue O(1) with a suitable queue", "Front O(1)"],
    "circular-queues": ["Enqueue/dequeue O(1)", "Fixed capacity", "Wrap indices with modulo"],
    deques: ["Push/pop at either end O(1)", "Middle lookup O(n)", "Useful for both-end windows"],
    "hash-tables": ["Lookup/insert/delete O(1) average", "Worst case can be O(n)", "Cost depends on hashing and load factor"],
    "hash-functions": ["Hash computation depends on key length", "A hash maps keys to a fixed-size range", "A hash is not proof of key equality"],
    "hash-collisions": ["Collisions are unavoidable in a finite table", "Resolution work depends on collision strategy", "Equality confirms a matching key"],
    "collision-resolution": ["Chaining and probing are common", "Expected cost depends on load factor", "Deletion must preserve future lookups"],
    chaining: ["Expected lookup O(1) at a controlled load factor", "Worst-case bucket search O(n)", "Buckets store multiple entries"],
    "open-addressing": ["Expected lookup O(1) at a controlled load factor", "Probing can degrade as the table fills", "Deletion needs tombstones or rehashing"],
    sets: ["Membership O(1) average with a hash set", "Iteration O(n)", "Elements must have stable equality/hash behavior"],
    dictionaries: ["Lookup/insert O(1) average", "Iteration O(n)", "Keys must be hashable and comparable"],
    trees: ["Search depends on shape", "Traversal O(n)", "Height determines path length"],
    "binary-trees": ["Traversal O(n)", "Height can be n", "Each node has at most two children"],
    "binary-search-trees": ["Search/insert/delete O(h)", "Balanced h = O(log n)", "Skewed h = O(n)"],
    "tree-traversals": ["Every node visited O(n)", "Recursive extra space O(h)", "Level order uses a queue"],
    "avl-trees": ["Search/insert/delete O(log n)", "Rotations restore height balance", "Stricter balance can mean more rotations"],
    "red-black-trees": ["Search/insert/delete O(log n)", "Colour rules bound the height", "Balancing uses recolouring and rotations"],
    heaps: ["Peek O(1)", "Insert/remove top O(log n)", "Build heap O(n)"],
    "priority-queues": ["Peek O(1) with a binary heap", "Insert/remove top O(log n)", "A heap is not fully sorted"],
    tries: ["Lookup O(L) for key length L", "Prefix queries share path work", "Space depends on branching and representation"],
    graphs: ["BFS/DFS O(V + E) with adjacency lists", "Matrix storage O(V²)", "Choose representation for expected operations"],
    "directed-graphs": ["Adjacency-list storage O(V + E)", "Reachability depends on traversal", "Edge direction matters"],
    "undirected-graphs": ["Adjacency-list storage O(V + E)", "Each edge is usually stored twice", "Traversal O(V + E)"],
    "weighted-graphs": ["Storage O(V + E) in a list", "Algorithm depends on weight constraints", "Negative weights change valid shortest-path choices"],
    "adjacency-matrix": ["Check edge O(1)", "Space O(V²)", "Scan a vertex's neighbors O(V)"],
    "adjacency-list": ["Space O(V + E)", "Neighbor scan O(degree)", "Check a specific edge may take O(degree)"],
    "disjoint-set-union": ["Find/union nearly O(1) amortized", "Initialize n items O(n)", "Path compression and rank are essential"],
    "union-find": ["Find/union nearly O(1) amortized", "Initialize n items O(n)", "Path compression and rank are essential"]
  };
  var diagrams = {
    arrays: "index:  0    1    2    3\n       +----+----+----+----+\nvalue: |  8 |  3 |  5 |  1 |\n       +----+----+----+----+",
    "singly-linked-lists": "[8 | next] → [3 | next] → [5 | null]",
    "doubly-linked-lists": "null ← [prev | 8 | next] ⇄ [prev | 3 | next] → null",
    stacks: "top → | 5 |  ← pop next\n      | 3 |\n      | 8 |",
    queues: "front → [8] [3] [5] ← back\n         dequeue   enqueue",
    "hash-tables": "hash(key) → bucket\n   8  ───────→ [8] → [18]\n  12  ───────→ [12]",
    "binary-trees": "        8\n      /   \\\n     3     12\n    / \\",
    heaps: "       min\n      /   \\\n   next   next\n(array: [min, ...])",
    tries: "root\n ├─ c ─ a ─ t*\n └─ d ─ o ─ g*",
    graphs: "A ─── B\n|   /  |\nC ─── D",
    "adjacency-list": "A: [B, C]\nB: [A, D]\nC: [A, D]\nD: [B, C]",
    "adjacency-matrix": "     A B C\nA    0 1 1\nB    1 0 0\nC    1 0 0",
    "disjoint-set-union": "before: {1} {2} {3}    union(1, 2)\nafter:  {1, 2} {3}    find(1) == find(2)"
  };
  var teaching = {
    arrays: "Array elements occupy indexed positions, so an index can be translated directly to an address. This is why reading index 4 is constant time, while inserting near the front shifts later elements; use an array when order and index access matter.",
    "dynamic-arrays": "A dynamic array keeps a separate capacity from its current length. When full, it allocates a larger buffer and copies items; doubling capacity makes appends O(1) amortized, though one resize is O(n). Python lists use this idea.",
    strings: "A string is a sequence of text units, but a character is not always one byte: Unicode encodings use variable-width storage. Since Python strings are immutable, repeated concatenation can copy prefixes; collect pieces and join when building many parts.",
    "singly-linked-lists": "Each node stores a value and a reference to the next node; the list itself usually keeps a head reference. Inserting after a known node is constant time, but reaching the tenth item still requires following nine links.",
    "doubly-linked-lists": "A node stores both previous and next links, letting a caller unlink a known node without searching for its predecessor. The trade is an extra reference per node and more pointer updates to keep both directions consistent.",
    "circular-linked-lists": "The last node links back to the head instead of ending at null. A round-robin scheduler can advance forever through participants, but traversal must stop after returning to its start or it will loop indefinitely.",
    stacks: "A stack exposes one end: push adds there and pop removes the newest item. Function calls, undo history, and expression parsing all use this last-in, first-out rule; it is not a good fit when the oldest item must leave first.",
    queues: "A queue adds at the back and removes from the front, preserving arrival order. Breadth-first search relies on this order so every node at distance d is processed before any node at distance d + 1.",
    "circular-queues": "A circular queue reuses a fixed array by wrapping front and back indices with modulo capacity. Track the number of stored items or reserve a slot so empty and full states are distinguishable.",
    deques: "A deque supports insertion and removal at both ends, combining stack-like and queue-like behavior. A sliding-window maximum uses one end to add candidates and the other to discard expired or dominated candidates.",
    "hash-tables": "A hash table maps a key to a bucket index, then checks candidate keys for equality. Lookup is expected O(1) when hashes spread keys well and the load factor is controlled; collisions mean it is not guaranteed constant time.",
    "hash-functions": "A hash function maps a key into a fixed range so the table can choose a bucket. Equal keys must have equal hashes, but equal hashes do not imply equal keys; collisions are resolved with an equality check.",
    "hash-collisions": "A collision occurs when distinct keys map to the same bucket, which must happen eventually when many keys share a finite table. For example, two names may share an index even though the names themselves are different.",
    "collision-resolution": "Collision resolution defines how a table finds all keys that share an initial bucket. Chaining stores multiple entries together; open addressing probes other slots. Deletion must preserve the route future lookups use.",
    chaining: "With chaining, each table slot points to a collection of entries. A bucket can contain multiple keys, so lookup scans that bucket and compares keys; performance worsens when many keys pile into one chain.",
    "open-addressing": "Open addressing keeps entries in the table array and probes for another slot after a collision. Linear probing is cache-friendly but creates clusters; deletion commonly leaves a tombstone so searches do not stop too early.",
    sets: "A set stores distinct values and answers membership questions without exposing positions. A hash set is useful for duplicate detection: add each item once and test whether it was seen before; iteration order may not be meaningful.",
    dictionaries: "A dictionary associates each key with a value, usually through a hash table. It supports updating a record by ID or counting frequencies; keys must obey stable equality and hashing while stored.",
    trees: "A tree models parent-child relationships without cycles, with one root in the usual rooted form. File systems and organization charts fit naturally; depth measures distance from the root, while height measures distance down to a deepest leaf.",
    "binary-trees": "A binary tree limits each node to a left and right child; it says nothing by itself about value order or balance. That distinction matters: an ordinary binary tree can still require visiting every node to find a value.",
    "binary-search-trees": "A binary search tree maintains smaller keys in the left subtree and larger keys in the right (after defining duplicate handling). Search follows one path, taking O(h); if inserts make the tree a chain, h becomes n.",
    "tree-traversals": "Preorder visits a node before its children, inorder visits between them, and postorder visits after them; level order uses a queue. Inorder traversal of a binary search tree yields sorted keys because of its ordering invariant.",
    "avl-trees": "An AVL tree keeps the heights of a node's child subtrees within one of each other. Insertions and deletions may trigger rotations that restore this balance, keeping search paths logarithmic at the cost of stricter rebalancing.",
    "red-black-trees": "Red-black trees use color rules to prevent any root-to-leaf path from becoming much longer than another. Their balance is less strict than AVL balance, which often means fewer rotations while still guaranteeing logarithmic operations.",
    heaps: "A binary heap is a complete tree stored compactly in an array; each parent is ordered against its children, but siblings need not be ordered. The root is therefore the minimum or maximum, making heaps useful for repeatedly selecting an extreme.",
    "priority-queues": "A priority queue removes the item with highest priority, not necessarily the item that arrived first. A binary heap supports peek in O(1) and insertion/removal in O(log n); it does not provide fast lookup of arbitrary items.",
    tries: "A trie shares prefixes among keys by storing one character or symbol per edge. Searching a word of length L follows at most L edges, which makes prefix queries natural; memory depends on how children are represented.",
    graphs: "A graph is a set of vertices plus edges describing relationships. A transit map, dependency network, or social network is a graph; unlike a tree, it may contain cycles, multiple paths, and disconnected components.",
    "directed-graphs": "A directed edge has a source and destination, so u → v does not imply v → u. Prerequisite schedules and web links are directed; direction changes reachability and determines whether a topological ordering can exist.",
    "undirected-graphs": "An undirected edge represents a two-way relationship, so {u, v} can be traversed in either direction. Friendship or a two-way road is often modelled this way; a traversal must still track visited vertices to avoid cycles.",
    "weighted-graphs": "A weighted graph attaches a cost, distance, or duration to each edge. The meaning and sign of weights constrain the algorithm: Dijkstra needs non-negative weights, while negative edges require different reasoning.",
    "adjacency-matrix": "An adjacency matrix stores whether (or how strongly) each vertex pair is connected in a V by V grid. It gives O(1) edge tests but uses O(V²) space, even when almost all pairs have no edge.",
    "adjacency-list": "An adjacency list stores each vertex's outgoing neighbors. It uses O(V + E) space and lets a traversal scan only actual edges, which is usually a good fit for sparse graphs.",
    "disjoint-set-union": "Disjoint-set union maintains non-overlapping groups as they merge. Find returns a representative for a group and union joins two groups; path compression and union by size/rank make a long sequence of operations nearly constant amortized time."
  };
  var mistakes = {
    arrays: "Indexing is O(1), but inserting at the front is not: later elements must move. Also remember that a length-n array ends at index n - 1.",
    "dynamic-arrays": "Append is O(1) amortized, not O(1) for every append. A resize copies the current contents and can take O(n) once.",
    strings: "A displayed character is not necessarily one byte, and a substring search is not automatically constant time. Account for encoding and the actual operation.",
    "singly-linked-lists": "Only pointer changes at a known node are constant time; finding that node still takes O(n), and removing it usually requires its predecessor.",
    "doubly-linked-lists": "Update both neighbor links when inserting or removing. Changing only next can leave backward traversal inconsistent.",
    "circular-linked-lists": "There is no null end marker. Stop after a complete cycle or a traversal can continue forever.",
    stacks: "Check for an empty stack before reading or popping its top; stack order is last-in, first-out.",
    queues: "Do not implement repeated front removals by shifting every element in an array. A ring buffer or deque keeps enqueue/dequeue efficient.",
    "circular-queues": "Head and tail can coincide in both empty and full states. Store a count or reserve a slot to distinguish them.",
    deques: "Fast operations apply at the two ends; finding or changing a middle element still requires linear traversal in typical implementations.",
    "hash-tables": "A hash match is only a candidate match. Always use key equality to distinguish collisions, and treat O(1) as an average-case expectation.",
    "hash-functions": "A good distribution does not make collisions impossible, and a normal table hash is not a cryptographic security hash.",
    "hash-collisions": "Different keys can have the same hash or bucket; never treat equal hashes as proof that keys are equal.",
    "collision-resolution": "A deletion strategy must not make a later key unreachable; open-addressed tables often need tombstones.",
    chaining: "A chain can grow to O(n) in the worst case. Expected constant lookup depends on a controlled load factor and a suitable hash distribution.",
    "open-addressing": "A table that is nearly full can require many probes. Tombstones also accumulate and may require cleanup or rehashing.",
    sets: "Sets do not promise list-style indexing or a stable order. Use membership and uniqueness operations rather than relying on iteration position.",
    dictionaries: "Dictionary keys must be hashable, and their equality/hash behavior must stay stable while they are stored.",
    trees: "Do not confuse depth with height; one counts from the root down, the other from a node to its deepest descendant.",
    "binary-trees": "At most two children does not mean balanced or ordered. A plain binary tree offers no logarithmic search guarantee.",
    "binary-search-trees": "The search bound is O(h), not automatically O(log n). Sorted insertions can make an unbalanced BST a chain.",
    "tree-traversals": "Inorder produces sorted values only for a binary search tree, not for every binary tree.",
    "avl-trees": "Balance is about subtree heights, not equal node counts. Recompute heights and choose the correct rotation case after updates.",
    "red-black-trees": "The color rules guarantee logarithmic height, not perfectly equal root-to-leaf paths. Do not mix their balancing cases with AVL rotations.",
    heaps: "A heap is only partially ordered. Apart from the root, do not assume array order identifies the next smallest value.",
    "priority-queues": "A priority queue is not FIFO unless priority and arrival order are explicitly combined; a heap also does not sort all values.",
    tries: "A node can represent a prefix that is not itself a complete key. Store terminal markers so \"car\" and \"cart\" remain distinct words.",
    graphs: "An edge set alone does not guarantee connectedness or acyclicity. Traversal code must handle repeated visits and possibly multiple components.",
    "directed-graphs": "Do not treat u → v as a two-way edge. Reverse reachability requires following the reversed graph or a separate edge.",
    "undirected-graphs": "An undirected edge is usually stored in both adjacency lists, so edge counts and traversal logic must account for the duplicate storage.",
    "weighted-graphs": "Negative weights change which shortest-path algorithms are valid; Dijkstra cannot be used just because a graph has weights.",
    "adjacency-matrix": "O(1) edge tests come with O(V²) memory and O(V) neighbor scans, even when the graph has few edges.",
    "adjacency-list": "Checking whether a particular edge exists may require scanning one neighbor list; that is O(degree), not always O(1).",
    "disjoint-set-union": "Union-find answers whether elements share a component; it does not store a meaningful path between them or support splitting a component."
  };
  var vizFor = {
    arrays: "array", "dynamic-arrays": "array", "singly-linked-lists": "linked-list", "references-and-values": "linked-list",
    stacks: "stack", queues: "queue", "hash-tables": "hash-table", "hash-functions": "hash-table",
    "hash-collisions": "hash-table", chaining: "hash-table", "binary-search-trees": "bst",
    "tree-traversals": "bst", graphs: "graph", "graph-bfs": "graph"
  };

  function register(tp) {
    if (tp.aliasOf) return;
    var title = h.esc(tp.title), summary = h.esc(tp.sum);
    var trade = operations[tp.id] || ["Cost depends on the representation and operation", "Measure the operations your application performs most", "Account for both stored data and structural overhead"];
    var picture = diagrams[tp.id];
    var viz = vizFor[tp.id];
    var core = "<p><strong>" + title + ":</strong> " + summary + "</p>" +
      "<p>" + h.esc(teaching[tp.id] || tp.sum) + "</p>" +
      (picture ? h.diagram(picture, "A simplified view of " + tp.title + ".") : "");
    if (viz) core += h.viz(viz);
    DSA.lesson(tp.id, {
      minutes: 15,
      lede: tp.sum,
      sections: [
        { id: "representation", title: "Representation and invariant", html: core +
          h.callout("tip", "State the invariant", "Write down what must remain true after every update—for example, which end is the front or how a key maps to its bucket.") },
        { id: "operations", title: "Operation costs", html: h.table(["Operation or concern", "Typical cost / consequence"], [
          ["Common operation", h.esc(trade[0])],
          ["Another operation", h.esc(trade[1])],
          ["Trade-off", h.esc(trade[2])]
        ]) +
          "<p>These are typical bounds for a conventional implementation. The exact guarantee depends on representation, assumptions, and whether the operation is amortized or worst-case.</p>" +
          h.callout("mistake", "Common mistake", h.esc(mistakes[tp.id] || "Check the structure's guarantees against the operations your code actually performs.")) },
        { id: "selection", title: "When to use it", html: "<p>" + h.esc(tp.sum) + "</p>" +
          "<p>Before implementing, check empty input, repeated values, boundary positions, and update behavior. Confirm that equality, ordering, and mutation semantics match the rest of the program.</p>" +
          "<p><strong>Prerequisites:</strong> " + (tp.pre.filter(function (id) { return DSA.topics[id]; }).map(function (id) { return h.link(id, DSA.topics[id].title); }).join(", ") || "No prerequisites.") + "</p>" }
      ],
      practice: [
        { q: "Which operation should drive your choice of " + tp.title + ", and what is one limitation to remember?",
          hint: "Name the frequent operation, its expected cost, and a workload where another structure could be better.",
          answer: "Choose " + tp.title + " when its strengths match the workload: " + tp.sum + " One limitation is that " + trade[2].toLowerCase() + " Check the actual operation mix and memory constraints before deciding." }
      ]
    });
  }

  DSA.domains.filter(function (domain) { return domain.id === "structures"; })
    .forEach(function (domain) { domain.groups.forEach(function (group) { group.topics.forEach(register); }); });
})(window.DSA = window.DSA || {});
