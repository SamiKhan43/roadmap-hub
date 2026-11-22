(function (DSA) {
  "use strict";
  var h = DSA.h;
  var models = {
    "what-is-an-algorithm": "Input → ordered steps → output",
    "what-is-a-data-structure": "Values → organisation → useful operations",
    "algorithms-vs-data-structures": "Data structure + operations = algorithmic choices",
    "how-programs-execute": "Source → instructions → state changes → result",
    "variables-and-memory": "Name → value → memory location",
    functions: "Arguments → local frame → return value",
    "parameters-and-return-values": "Caller → arguments → function → result",
    "loops-and-conditions": "Test → branch or repeat → update state",
    recursion: "Base case ← smaller subproblem ← original problem",
    "call-stack": "Caller frame → current frame → next call",
    "stack-vs-heap": "Short-lived call frames | longer-lived objects",
    "references-and-values": "Variable → object reference → shared object",
    "mutable-immutable": "Mutation changes an object | rebinding changes a name",
    "basic-math": "Integers · remainders · powers · bounds",
    logarithms: "n → n/2 → n/4 → … → 1",
    summations: "1 + 2 + 3 + … + n",
    "discrete-math": "Sets · logic · counting · proof"
  };
  var examples = {
    "what-is-an-algorithm": "To find the largest value, keep a current maximum, inspect each item once, and return the maximum.",
    "what-is-a-data-structure": "A contact list can be stored in an array for ordered access or a map for fast lookup by name.",
    "algorithms-vs-data-structures": "A set makes membership checks cheap; the same duplicate-detection algorithm is slower with repeated scans of a list.",
    "how-programs-execute": "For x = 2; y = x + 3, execution reads x, computes 5, and binds that result to y.",
    "variables-and-memory": "After count = 3, count names the value 3. Reassigning count changes what the name refers to.",
    functions: "A function that converts Celsius to Fahrenheit has an input, a calculation, and one returned result.",
    "parameters-and-return-values": "In add(2, 5), 2 and 5 are arguments; the returned value 7 flows back to the caller.",
    "loops-and-conditions": "A loop can inspect each score and use an if condition to count only passing scores.",
    recursion: "To count items in a nested list, count one item and recursively count the remaining sublists; an empty list is the base case.",
    "call-stack": "When main calls total and total calls add, each call keeps its own return address and local variables.",
    "stack-vs-heap": "A function's local frame is removed when it returns, while an object referenced elsewhere can remain alive.",
    "references-and-values": "Two variables can point to the same list; appending through either reference changes that one shared list.",
    "mutable-immutable": "Appending changes a list in place; concatenating strings creates a new string value.",
    "basic-math": "For an array of length n, the last valid index is n - 1; modulo gives a wraparound index.",
    logarithms: "Binary search needs about log₂(n) halvings; for 1,024 items, ten halvings reach one candidate.",
    summations: "A nested triangular loop runs 1 + 2 + … + n iterations, which grows quadratically.",
    "discrete-math": "A graph edge set can be treated as a set of pairs; a proof can establish an invariant for every vertex."
  };
  var explanations = {
    "what-is-an-algorithm": "An algorithm specifies a result for a class of inputs, not just one hand-picked example. It must make progress toward stopping; correctness means every allowed input gets the promised output.",
    "what-is-a-data-structure": "A structure is a representation plus rules for operations such as lookup, insertion, and removal. The representation determines which operations are cheap, so choose it from the work the program actually performs.",
    "algorithms-vs-data-structures": "The algorithm describes the steps; the data structure determines how those steps find and update information. The same task can have very different costs when its data is stored differently.",
    "how-programs-execute": "An interpreter or processor follows instructions while program state changes: names are bound, expressions are evaluated, and control moves through branches and calls. Reading code means tracking that state in execution order.",
    "variables-and-memory": "A variable is a name in a program, not necessarily a labelled box containing the whole value. In Python, names refer to objects; assigning a new value rebinds the name, while mutating a referenced object changes that object.",
    functions: "A function gives a piece of work a name and a boundary. Calling it creates a fresh local scope, evaluates its body, and sends a result back; this lets a larger algorithm be composed from smaller steps.",
    "parameters-and-return-values": "Parameters are the local names in a function definition; arguments are the values supplied by the caller. A return value travels back to the caller, while printing only displays text and does not provide a result to later computation.",
    "loops-and-conditions": "A condition chooses a path, while a loop repeats a path until its stopping test changes. For a loop, identify what changes on each iteration and why that change eventually reaches the stopping condition.",
    recursion: "A recursive function reduces a problem to smaller instances of the same problem. Each call must move toward a base case, and the returned answers are combined as calls unwind; without progress, recursion does not terminate.",
    "call-stack": "Each active function call has a frame containing its local bindings and the place to resume after a nested call returns. Frames are removed in last-in, first-out order, which is why deeply nested calls consume stack space.",
    "stack-vs-heap": "The call stack manages active call frames; dynamically allocated objects have a separate lifetime managed by the language runtime. In Python, do not assume a local variable itself lives on a particular physical region: focus on references, object lifetime, and recursion depth.",
    "references-and-values": "When a function receives a reference to a mutable object, both caller and callee can reach that same object. Rebinding the parameter only changes the callee's local name; mutating the object is visible through every reference to it.",
    "mutable-immutable": "A mutable object can change while keeping its identity, as a list does. An immutable value cannot be changed in place; an apparent update creates or selects another value. Immutable values are safer to share and can serve as dictionary keys when hashable.",
    "basic-math": "Integer division, remainders, and careful bounds show up in array indices and loop conditions. For an array of length n, valid indices are 0 through n - 1; modulo can wrap an index, but only when the collection is non-empty.",
    logarithms: "A logarithm answers how many repeated multiplications—or repeated divisions by a fixed factor—fit before reaching a target. If each step halves n, the number of steps is about log₂ n, which explains binary search's growth.",
    summations: "A loop's total work is the sum of its iterations, not always the product of two loop bounds. When the inner loop runs 0, 1, 2, …, n - 1 times, the total is n(n - 1)/2, which grows quadratically.",
    "discrete-math": "DSA uses discrete objects such as sets, integer states, and graph edges. Logic helps state conditions precisely; induction proves a claim for all sizes by proving a base case and showing one size follows from a smaller one."
  };
  var codeSamples = {
    functions: "def rectangle_area(width, height):\n    return width * height\n\narea = rectangle_area(3, 4)  # 12",
    "parameters-and-return-values": "def add_tax(price, rate):\n    return price * (1 + rate)\n\ntotal = add_tax(20, 0.1)  # 22.0",
    "loops-and-conditions": "passed = 0\nfor score in [58, 84, 91]:\n    if score >= 60:\n        passed += 1\n# passed is 2",
    recursion: "def sum_to(n):\n    if n == 0:          # base case\n        return 0\n    return n + sum_to(n - 1)\n\n# sum_to(3) = 3 + 2 + 1 + 0 = 6",
    "references-and-values": "first = [1, 2]\nsecond = first\nsecond.append(3)\n# first is also [1, 2, 3]",
    "mutable-immutable": "items = [1, 2]\nitems.append(3)       # same list, changed\nname = \"Ada\"\nname += \" Lovelace\"   # a new string value"
  };

  function register(tp) {
    if (tp.aliasOf) return;
    var title = h.esc(tp.title), summary = h.esc(tp.sum);
    var prerequisites = tp.pre.filter(function (id) { return DSA.topics[id]; });
    var related = tp.rel.filter(function (id) { return DSA.topics[id]; });
    var start = examples[tp.id] || ("Take a small input and trace how " + tp.title.toLowerCase() + " changes the state. " + tp.sum);
    var links = prerequisites.length ? prerequisites.map(function (id) { return h.link(id, DSA.topics[id].title); }).join(", ") : "No prerequisite is required.";
    var connections = related.length ? related.map(function (id) { return h.link(id, DSA.topics[id].title); }).join(", ") : "Use this idea as a foundation for later topics.";
    var diagram = models[tp.id];

    DSA.lesson(tp.id, {
      minutes: 12,
      lede: tp.sum,
      sections: [
        {
          id: "mental-model",
          title: "Build the mental model",
          html: "<p><strong>" + title + ":</strong> " + summary + "</p>" +
            "<p>" + h.esc(explanations[tp.id] || tp.sum) + "</p>" +
            (diagram ? h.diagram(diagram, "A compact model for " + tp.title + ".") : "") +
            h.callout("tip", "Start small", "Trace one or two values by hand before generalising. Small examples expose missing assumptions early.")
        },
        {
          id: "worked-example",
          title: "Work through an example",
          html: "<p>" + h.esc(start) + "</p>" +
            (codeSamples[tp.id] ? h.code(codeSamples[tp.id], "Python example") : "") +
            "<p>Write down the state before and after each meaningful step. Check that the final result matches the original goal, including the empty and one-item cases.</p>" +
            h.callout("info", "Ask as you trace", "What information must be remembered? What changes, and what must remain true after every step?")
        },
        {
          id: "connections",
          title: "Connect it to the roadmap",
          html: "<p><strong>Study first:</strong> " + links + "</p>" +
            "<p><strong>Next connections:</strong> " + connections + "</p>" +
            "<p>These are learning links, not a requirement to memorise every detail. Return to this concept when a later topic relies on the same model.</p>"
        }
      ],
      practice: [
        {
          q: "Explain " + tp.title + " in your own words. What problem does it help you reason about?",
          hint: "Use the definition above, then describe one tiny input and the state or result you would track.",
          answer: tp.title + " is useful because " + tp.sum + " A good explanation identifies the input, the rule being applied, and the result or guarantee. For example: " + start + " Then test an empty input and a smallest non-empty input to make sure your explanation covers the boundaries."
        }
      ]
    });
  }

  DSA.domains.filter(function (domain) { return domain.id === "foundations"; })
    .forEach(function (domain) { domain.groups.forEach(function (group) { group.topics.forEach(register); }); });
})(window.DSA = window.DSA || {});
