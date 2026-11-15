const explanationButtons = document.querySelectorAll("[data-explanation-choice]");

for (const button of explanationButtons) {
  button.addEventListener("click", () => {
    const mode = button.dataset.explanationChoice;
    document.documentElement.dataset.explanationMode = mode;

    for (const choice of explanationButtons) {
      choice.setAttribute("aria-pressed", String(choice === button));
    }
  });
}

const tocLinks = [...document.querySelectorAll(".docs-toc a")];
const tocDetails = document.querySelector(".toc-details");
const mobileNavigation = window.matchMedia("(max-width: 760px)");
const sections = tocLinks
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function syncNavigation(event) {
  tocDetails.open = !event.matches;
}

syncNavigation(mobileNavigation);
mobileNavigation.addEventListener("change", syncNavigation);

for (const link of tocLinks) {
  link.addEventListener("click", () => {
    if (mobileNavigation.matches) {
      tocDetails.open = false;
    }
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (!visible.length) {
      return;
    }

    const currentId = visible[0].target.id;
    for (const link of tocLinks) {
      if (link.hash === `#${currentId}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }, {
    rootMargin: "-18% 0px -72% 0px",
    threshold: 0
  });

  for (const section of sections) {
    sectionObserver.observe(section);
  }
}

const diagramDetail = document.getElementById("diagram-detail");
const diagramDescriptions = {
  "Postmaster": "Accepts connection requests and starts a backend process; the backend performs session startup and authentication.",
  "Backend process": "Handles one client connection, runs its commands, and participates in its transactions.",
  "Background processes": "Perform server-wide maintenance and I/O tasks rather than serving ordinary client queries.",
  "Shared Buffers": "Caches table and index pages in memory shared by PostgreSQL processes.",
  "WAL Buffers": "Stages change records before they are written to WAL segment files.",
  "Other shared memory": "Holds coordination state such as locks and transaction information.",
  "Shared memory": "Coordinates processes through shared buffers, locks, transaction state, and other shared structures.",
  "Database relation files": "Persist heap, index, and related relation pages; WAL is needed to recover them after a crash.",
  "WAL segments": "Store ordered change records used for recovery and, when configured, archiving or replication.",
  "Application client": "Uses a PostgreSQL driver and protocol connection to send commands and receive results.",
  "SQL protocol session": "Carries SQL commands and responses between an application and its assigned backend.",
  "Parser": "Checks SQL syntax and builds a parse tree.",
  "Analyzer": "Resolves names and types against database catalogs and validates query semantics.",
  "Rewriter": "Applies query rules, including expanding view references to their underlying queries.",
  "Planner / Optimizer": "Compares estimated execution paths and creates a plan for the executor.",
  "Executor": "Runs the plan, reads needed rows, checks visibility, and returns results or applies changes.",
  "Work memory": "Provides an operation-level budget for work such as sorts and hash tables.",
  "Maintenance work memory": "Provides memory for operations such as VACUUM and index creation.",
  "Database cluster": "Is one PostgreSQL instance's data directory and collection of databases, not necessarily a multi-node cluster.",
  "Database": "Contains schemas and database-local relations and catalogs.",
  "Schema": "Groups named objects inside a database.",
  "Heap relation": "Stores table tuple versions in relation pages.",
  "Index relation": "Stores an access-method structure the planner may use to locate rows.",
  "TOAST relation": "Stores oversized values out of line when PostgreSQL's TOAST mechanism requires it.",
  "Pages and tuples": "A page holds tuple data and line pointers; each tuple is a stored row version.",
  "Backend write": "Executes a client write command and generates the corresponding page changes and WAL.",
  "Dirty shared buffer": "Holds a changed page in memory that has not yet been written to its relation file.",
  "COMMIT acknowledgment": "Can follow a durable WAL flush before the changed table page reaches its final relation file.",
  "COMMIT response": "Reports transaction completion to the client after the configured commit durability conditions are met.",
  "Relation file write": "Persists a dirty heap or index page; this can happen after COMMIT has returned.",
  "Old row version": "May remain visible to a snapshot that predates an update.",
  "New row version": "Is created by an update and becomes visible according to transaction status and snapshot rules.",
  "Dirty buffers": "Contain modified relation pages awaiting writes to their data files.",
  "Checkpoint": "Persists required dirty pages and records a recovery starting point in WAL.",
  "Crash recovery": "Replays WAL after a checkpoint to redo changes needed to restore consistency.",
  "Sequential scan": "Reads table pages and checks rows without probing an index.",
  "Index scan": "Uses index entries to find candidate heap tuples, which may still require heap visibility checks.",
  "Primary backend": "Executes application SQL on the primary and generates WAL for its changes.",
  "Primary WAL sender": "Streams primary WAL to a connected replication consumer.",
  "Standby WAL receiver": "Receives a WAL stream on the standby for local writing and replay.",
  "Standby replay": "Applies received WAL to the standby's physical data files.",
  "FastAPI application": "Sends a parameterized INSERT through its PostgreSQL connection.",
  "Query executor": "Performs the INSERT's row and index work after the backend plans the command."
};

function describeDiagramNode(node) {
  const targetSelector = node.dataset.target;
  const target = targetSelector ? document.querySelector(targetSelector) : null;
  const name = node.dataset.component;
  const figure = node.closest("figure");

  for (const diagramNode of document.querySelectorAll(".architecture-diagram .node")) {
    const related = diagramNode === node
      || (name && diagramNode.dataset.component === name)
      || (targetSelector && diagramNode.dataset.target === targetSelector);
    diagramNode.classList.toggle("is-selected", diagramNode === node);
    diagramNode.classList.toggle("is-related", related && diagramNode !== node);
    diagramNode.setAttribute("aria-pressed", String(diagramNode === node));
  }

  if (figure) {
    figure.insertAdjacentElement("afterend", diagramDetail);
  }

  diagramDetail.replaceChildren();
  const section = node.closest(".docs-section");
  const sectionHeading = section?.querySelector("h2")?.textContent.trim();
  const svgTitle = node.querySelector("title")?.textContent.trim();
  const description = diagramDescriptions[name] || svgTitle
    || `${name} is shown as part of the ${sectionHeading || "PostgreSQL"} system flow.`;
  diagramDetail.append(document.createTextNode(`${description} `));

  if (target) {
    const heading = target.querySelector("h2, summary");
    const link = document.createElement("a");
    link.href = `#${target.id}`;
    link.textContent = `Read ${heading ? heading.textContent.trim() : "the related section"}`;
    diagramDetail.append(link);
  } else {
    diagramDetail.append(document.createTextNode("See the related explanation in this guide."));
  }
}

for (const node of document.querySelectorAll(".architecture-diagram .node[role='button']")) {
  node.setAttribute("aria-label", node.dataset.component);
  node.setAttribute("aria-pressed", "false");
  node.addEventListener("click", () => describeDiagramNode(node));
  node.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      describeDiagramNode(node);
    }
  });
}
