(function (DSA) {
  "use strict";
  var h = DSA.h;
  var costs = {
    "constant-complexity": ["O(1)", "The number of operations stays bounded as n grows."],
    "logarithmic-complexity": ["O(log n)", "Each step shrinks the remaining search space by a constant factor."],
    "linear-complexity": ["O(n)", "The work grows in proportion to the number of input items."],
    "linearithmic-complexity": ["O(n log n)", "A logarithmic number of levels processes all n items at each level."],
    "quadratic-complexity": ["O(n²)", "A pair of full scans, or a triangular nested loop, can produce quadratic work."],
    "polynomial-complexity": ["O(nᵏ)", "A fixed number of nested dimensions produces polynomial growth."],
    "exponential-complexity": ["O(2ⁿ)", "Making an independent yes/no choice for each item can double the search tree."],
    "factorial-complexity": ["O(n!)", "Enumerating every ordering grows factorially."],
    "time-complexity": ["Depends on the algorithm", "Count the dominant basic operation as a function of input size."],
    "space-complexity": ["Depends on extra state", "Count additional storage, including recursion frames, separately from the input."],
    "why-complexity-matters": ["Compare growth, not one timing", "Input size and hardware vary; asymptotic growth describes how cost scales."],
    "asymptotic-analysis": ["Focus on large n", "Asymptotic notation suppresses constant factors and lower-order terms."],
    "big-o-notation": ["O(g(n))", "An asymptotic upper bound; it does not mean every input takes exactly that time."],
    "big-omega": ["Ω(g(n))", "An asymptotic lower bound on growth."],
    "big-theta": ["Θ(g(n))", "A tight asymptotic bound: both an upper and a lower bound."],
    "best-case": ["Input-dependent", "Describe the least work among inputs of size n."],
    "average-case": ["Expected cost", "The distribution of inputs and the assumptions behind it matter."],
    "worst-case": ["Input-dependent upper cost", "Describe the most work among inputs of size n."],
    "analyzing-loops": ["Count iterations", "A loop that doubles its index has logarithmically many iterations; one that advances by one has linearly many."],
    "nested-loops": ["Multiply or sum iterations", "Independent n-step loops multiply; a shrinking inner range may instead form a sum."],
    "recursive-complexity": ["Count the call tree", "Include the work per call and the number and size of child calls."],
    "recurrence-relations": ["T(n) = work + subcalls", "A recurrence describes a recursive algorithm's total cost."],
    "amortized-analysis": ["Average over a sequence", "A costly operation can still have low amortized cost when it is rare."]
  };
  var examples = {
    "constant-complexity": "Reading values[4] by index takes a fixed number of steps for a normal array, regardless of its length.",
    "logarithmic-complexity": "Binary search halves a sorted range: 16 candidates become 8, 4, 2, then 1.",
    "linear-complexity": "Finding a target in an unsorted list may inspect all n values.",
    "linearithmic-complexity": "Merge sort splits into log₂(n) levels and merges n values per level.",
    "quadratic-complexity": "Comparing every pair among n values performs n(n - 1)/2 comparisons.",
    "exponential-complexity": "A subset search may branch into include/exclude choices for every item.",
    "factorial-complexity": "Trying every schedule of n distinct tasks examines n! permutations.",
    "analyzing-loops": "i = 1; while i < n: i *= 2 runs about log₂(n) iterations.",
    "nested-loops": "for i in range(n): for j in range(i): ... performs 0 + 1 + … + (n - 1) steps.",
    "recursive-complexity": "A recursion tree makes repeated calls visible; count nodes at each depth before summing.",
    "recurrence-relations": "Merge sort satisfies T(n) = 2T(n/2) + Θ(n), which solves to Θ(n log n).",
    "amortized-analysis": "Appending n items to a doubling dynamic array costs O(n) total, or O(1) amortized per append.",
    "why-complexity-matters": "If one program performs about n operations and another performs about n², doubling input size roughly doubles the first workload but quadruples the second.",
    "space-complexity": "A merge sort may use O(n) temporary storage; an iterative binary search uses O(1) extra space, excluding its input.",
    "asymptotic-analysis": "For n = 1,000, n² work is about a million operations while n log₂ n is about ten thousand; constants still matter for small n.",
    "big-o-notation": "3n² + 4n + 10 is O(n²): beyond a sufficiently large n, a constant multiple of n² bounds the lower-order terms too.",
    "big-omega": "A scan that must inspect every item has an Ω(n) lower bound when the answer depends on the final item.",
    "big-theta": "A loop that always visits each of n elements exactly once is Θ(n), both O(n) and Ω(n).",
    "best-case": "Linear search is best-case Θ(1) when the target is at index 0, even though its worst case is Θ(n).",
    "average-case": "For a uniformly random target position in an array, a successful linear search checks about (n + 1) / 2 items.",
    "worst-case": "An unsuccessful linear search inspects all n elements, so its worst-case time is Θ(n).",
    "polynomial-complexity": "A dynamic program with n choices and a capacity W often costs O(nW); this is polynomial in numeric W, but pseudo-polynomial in the bit-length of W.",
    "exponential-complexity": "Enumerating all subsets of 20 items considers 2²⁰ candidates; adding one item doubles that count.",
    "factorial-complexity": "Trying every order of 8 distinct stops means 8! = 40,320 possible tours before pruning.",
    "recursive-complexity": "Naive Fibonacci makes two calls per non-base call and repeats the same subproblems; memoization reduces it to O(n) calls.",
    "time-complexity": "A loop that visits n values and does a fixed amount of work per value performs Θ(n) total work, even if each step has several instructions."
  };
  var explanations = {
    "why-complexity-matters": "A program that works on a hundred items may become unusable on a million. Complexity helps compare how candidate methods scale before implementation, while measurements still decide practical constants and hardware effects.",
    "time-complexity": "Time complexity counts how the number of basic operations grows with input size; it is not a prediction in seconds. Define what n measures and what operation dominates before assigning a bound.",
    "space-complexity": "Space complexity usually means auxiliary memory beyond the input. Count buffers, tables, data structures, and active recursive frames; state explicitly if the input itself is included.",
    "asymptotic-analysis": "Asymptotic analysis compares growth as n becomes large. It intentionally hides constants and lower-order terms, so it is useful for scaling but cannot by itself predict which implementation is faster on a small workload.",
    "big-o-notation": "O(g(n)) means the function is eventually bounded above by a constant times g(n). It is common to report a worst-case algorithm cost in Big O, but the notation itself does not specify which case you analyzed.",
    "big-omega": "Ω(g(n)) is an eventual lower bound: the work grows at least as fast as g(n), up to a constant factor. A best-case result is often expressed this way, but Ω is not synonymous with best case.",
    "big-theta": "Θ(g(n)) is a tight bound: the function is both O(g(n)) and Ω(g(n)). It says the growth rate is pinned down within constant factors.",
    "best-case": "Best case selects the easiest input among all inputs of size n. It can describe a useful adaptive behavior, but it is a poor guarantee if ordinary inputs may be harder.",
    "average-case": "Average case is an expected cost under a stated input distribution. Without the distribution or randomness assumptions, the phrase is incomplete.",
    "worst-case": "Worst case selects the most expensive input of size n. It gives a guarantee that does not depend on inputs being typical.",
    "constant-complexity": "O(1) means the operation count is bounded independently of n; it does not mean the operation takes one instruction. A hash lookup is average O(1), not a worst-case guarantee.",
    "logarithmic-complexity": "O(log n) often comes from shrinking the remaining candidates by a constant factor each step. The base of the logarithm changes the count only by a constant factor.",
    "linear-complexity": "O(n) means work scales proportionally with the number of items. A scan may stop early on some inputs, but if it can inspect every item, the worst case is linear.",
    "linearithmic-complexity": "O(n log n) commonly appears when a problem is split into logarithmically many levels and each level processes n items. Merge sort is the standard example.",
    "quadratic-complexity": "O(n²) often comes from considering pairs, but dependent nested loops may instead sum to a different total. Count actual iterations rather than judging by indentation.",
    "polynomial-complexity": "Polynomial time has a fixed exponent, such as n² or n³. A high-degree polynomial can still be impractical, and an algorithm polynomial in a numeric value may be exponential in that value's encoded input length.",
    "exponential-complexity": "Exponential work grows by a constant factor when n increases by one. It often appears when exploring independent choices; pruning or dynamic programming can help only when the problem structure permits it.",
    "factorial-complexity": "Factorial growth counts permutations: each added distinct item can be placed in every position, multiplying the number of orderings. It becomes infeasible very quickly.",
    "analyzing-loops": "For a loop, find how many times its condition succeeds. Incrementing by one usually gives a linear count; doubling or halving a positive value usually gives a logarithmic count.",
    "nested-loops": "Nested loops do not automatically mean n². If an inner range depends on the outer index, sum its iteration counts; if the ranges are independent, their counts usually multiply.",
    "recursive-complexity": "A recursive running time depends on the number of calls, the size of each subproblem, and work done outside recursive calls. Count repeated subproblems instead of assuming every recursive algorithm is exponential.",
    "recurrence-relations": "A recurrence expresses total cost in terms of smaller inputs plus the work done at the current call. Solve it only after the subproblem sizes and combine cost are stated; the Master Theorem applies only to its matching recurrence form.",
    "amortized-analysis": "Amortized cost bounds a sequence of operations, not an expectation over random inputs. One append may trigger a resize, but occasional expensive resizes are spread across many cheap appends."
  };
  var pitfalls = {
    "why-complexity-matters": "Big O does not account for constants, memory limits, or implementation costs; benchmark real code after reasoning about growth.",
    "time-complexity": "Do not count source lines. One line can perform work proportional to n, while many lines can execute a fixed number of times.",
    "space-complexity": "Do not forget recursion frames or temporary copies, and say whether you are counting auxiliary space or total memory.",
    "asymptotic-analysis": "Dropping constants is an asymptotic comparison, not permission to ignore them in production.",
    "big-o-notation": "Big O is an upper bound, not an exact rate and not automatically a worst-case statement.",
    "big-omega": "Ω describes a lower bound on growth; it does not say the algorithm always performs at least that much work on every input.",
    "big-theta": "A tight bound needs both upper and lower bounds; an O(n²) result alone does not establish Θ(n²).",
    "best-case": "A best case is not a performance guarantee for all inputs.",
    "average-case": "Never give an average-case bound without stating what inputs or random choices are averaged over.",
    "worst-case": "Worst case is a bound over inputs of size n, not necessarily what happens on every input.",
    "constant-complexity": "Constant time can still have a large fixed cost, and average-case hash operations are not worst-case constant.",
    "logarithmic-complexity": "The input must shrink by a multiplicative factor; subtracting one each time is linear, not logarithmic.",
    "linear-complexity": "A single full pass is linear, but nested scans or repeated copying can raise the total.",
    "linearithmic-complexity": "Do not infer n log n from recursion depth alone; include the work at each level.",
    "quadratic-complexity": "A nested loop may have triangular bounds, and an early exit may change best-case but not worst-case cost.",
    "polynomial-complexity": "Polynomial in a number's value is not always polynomial in the number of bits needed to write it.",
    "exponential-complexity": "A branching factor alone is not enough; include the depth and repeated states in the call tree.",
    "factorial-complexity": "Factorial work is about enumerating orderings, not simply having a loop nested n times.",
    "analyzing-loops": "Check initialization and update together; an off-by-one condition can change correctness even when the growth class is unchanged.",
    "nested-loops": "Multiply iteration counts only when each loop's range is independent; otherwise write the sum.",
    "recursive-complexity": "A deep chain of calls can be linear time and linear stack space, not necessarily exponential.",
    "recurrence-relations": "Do not apply the Master Theorem to recurrences that do not match its assumptions.",
    "amortized-analysis": "Amortized cost is not the same as average-case expected cost."
  };

  function register(tp) {
    if (tp.aliasOf) return;
    var cost = costs[tp.id] || ["Depends on the case", tp.sum];
    var title = h.esc(tp.title), summary = h.esc(tp.sum);
    var example = examples[tp.id] || ("For " + tp.title.toLowerCase() + ", name the input size n and identify the operation that dominates. " + tp.sum);
    var code = tp.id === "analyzing-loops"
      ? "n = 16\ni = 1\nwhile i < n:\n    i *= 2"
      : tp.id === "nested-loops"
        ? "n = 5\ndef work():\n    pass\n\nfor i in range(n):\n    for j in range(i):\n        work()"
        : tp.id === "recurrence-relations"
          ? "T(n) = 2T(n / 2) + n\n# two half-size calls + linear merge"
          : null;
    var vizIds = /^(why-complexity-matters|time-complexity|big-o-notation|constant-complexity|logarithmic-complexity|linear-complexity|linearithmic-complexity|quadratic-complexity)$/.test(tp.id) ? ["growth"] : [];
    DSA.lesson(tp.id, {
      minutes: 14,
      lede: tp.sum,
      viz: vizIds,
      sections: [
        {
          id: "cost-model",
          title: "Choose a cost model",
          html: "<p><strong>" + title + ":</strong> " + summary + "</p>" +
            "<p>" + h.esc(explanations[tp.id] || tp.sum) + "</p>" +
            "<p>Start by defining n precisely: it might be the number of array items, graph vertices, or characters. Then count a basic operation or the extra memory needed as a function of n.</p>" +
            h.table(["Measure", "Question to ask"], [
              ["Time", "How many basic steps can execute?"],
              ["Space", "How much additional storage is allocated?"],
              ["Case", "Which inputs or assumptions are being described?"]
            ]) +
            h.callout("mistake", "Common confusion", h.esc(pitfalls[tp.id] || "State the input size and assumptions before comparing bounds."))
        },
        {
          id: "worked-growth",
          title: "Read the growth",
          html: "<p>" + h.esc(example) + "</p>" +
            (code ? tp.id === "recurrence-relations" ? h.plain(code, "Recurrence") : h.code(code, "Cost pattern") : "") +
            (/^(time-complexity|asymptotic-analysis|big-o-notation|analyzing-loops|nested-loops)$/.test(tp.id) ? h.diagram("Define n\n  ↓\nCount dominant work\n  ↓\nState the input case\n  ↓\nDescribe the growth", "A repeatable way to analyse an implementation.") : "") +
            "<p><strong>Typical bound:</strong> " + h.esc(cost[0]) + " — " + h.esc(cost[1]) + "</p>"
        },
        {
          id: "analysis-checklist",
          title: "Check assumptions and trade-offs",
          html: "<ol><li>Say what n represents.</li><li>Count the dominant work; do not assume loops always multiply or recursion is automatically exponential.</li><li>Include auxiliary memory and call-stack depth when relevant.</li><li>Test the reasoning against a small input and a much larger one.</li></ol>" +
            h.callout("tip", "Keep the original question", "An asymptotically faster algorithm can use more memory or have larger constants. Complexity informs a choice; it does not replace requirements.")
        }
      ],
      practice: [
        {
          q: h.esc(tp.title) + ": what is the input size, and what growth would you expect for the example or rule?",
          hint: "Identify the basic operation first; compare the work for n and 2n.",
          answer: "For " + tp.title + ", the key statement is: " + tp.sum + " A correct analysis names n, counts the dominant operation (or extra storage), and states its case assumptions. The representative growth here is " + cost[0] + ": " + cost[1]
        }
      ]
    });
  }

  DSA.domains.filter(function (domain) { return domain.id === "complexity"; })
    .forEach(function (domain) { domain.groups.forEach(function (group) { group.topics.forEach(register); }); });
})(window.DSA = window.DSA || {});
