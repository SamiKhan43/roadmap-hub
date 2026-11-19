(() => {
  "use strict";

  const content = window.GitGuideContent;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const STORAGE_KEY = "roadmap-hub-git-github-progress";
  const overviewView = $("#overview-view");
  const lessonView = $("#lesson-view");
  const lessonArticle = $("#lesson-article");
  const scenarioDetail = $("#scenario-detail");
  const searchInput = $("#docs-search");
  const searchResults = $("#search-results");
  let activeLessonIndex = 0;
  let completed = loadProgress();
  let savedProgress = new Set(completed);
  let graph = createInitialGraph();

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      const valid = new Set(content.lessons.map(lesson => lesson.id));
      return [...new Set(saved.filter(id => typeof id === "string" && valid.has(id)))];
    } catch (error) {
      showStorageError("Progress could not be read from this browser.");
      return [];
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
      $("#storage-warning").hidden = true;
    } catch (error) {
      showStorageError("Progress could not be saved. It will be available only until you leave this page.");
      return;
    }
    const sync = window.ROADMAP_HUB_PROGRESS?.syncProgressChanges;
    if (sync) sync("git-github",[...savedProgress],completed).catch(error=>console.warn("Progress sync failed",error));
    savedProgress = new Set(completed);
  }

  function showStorageError(message) {
    const warning = $("#storage-warning");
    if (warning) {
      warning.textContent = message;
      warning.hidden = false;
    }
    $("#progress-message").textContent = message;
  }

  function updateProgress() {
    const total = content.lessons.length;
    const count = completed.length;
    $("#progress-count").textContent = `${count} / ${total}`;
    $("#progress-fill").style.width = `${Math.round((count / total) * 100)}%`;
    $("#progress-message").textContent = `${count} of ${total} guides complete.`;
  }

  function setActiveNavigation(kind, id, navKey) {
    const matches = $$(".side-link").filter(button =>
      button.dataset.kind === kind && (kind === "overview" || button.dataset.id === id)
    );
    const selected = navKey
      ? matches.find(button => button.dataset.navKey === navKey)
      : matches[0];
    $$(".side-link").forEach(button => {
      const active = button === selected;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function setOverviewMode(showOverview) {
    overviewView.hidden = !showOverview;
    $$(".overview-extra").forEach(section => { section.hidden = !showOverview; });
    lessonView.hidden = showOverview;
    if (showOverview) {
      document.title = "Git & GitHub | Roadmap Hub";
    }
  }

  function addParagraph(parent, text) {
    parent.appendChild(element("p", "", text));
  }

  function renderLesson(id, updateHistory = true, navKey, sectionHeading) {
    const index = content.lessons.findIndex(lesson => lesson.id === id);
    if (index < 0) return;
    activeLessonIndex = index;
    const lesson = content.lessons[index];
    lessonArticle.replaceChildren();

    const header = element("header", "lesson-article");
    header.appendChild(element("p", "eyebrow", `GUIDE ${String(index + 1).padStart(2, "0")} / ${content.lessons.length}`));
    const title = element("h1", "", lesson.title);
    title.tabIndex = -1;
    header.appendChild(title);
    header.appendChild(element("p", "lesson-summary", lesson.summary));
    lessonArticle.appendChild(header);

    lesson.sections.forEach(section => {
      const part = element("section", "lesson-part");
      part.appendChild(element("h2", "", section.heading));
      if (section.text) addParagraph(part, section.text);
      if (section.code) {
        const code = element("pre", "code-block");
        code.textContent = section.code;
        part.appendChild(code);
      }
      if (section.bullets) {
        const list = element("ul");
        section.bullets.forEach(item => list.appendChild(element("li", "", item)));
        part.appendChild(list);
      }
      lessonArticle.appendChild(part);
    });

    const completeButton = $("#lesson-complete");
    const isComplete = completed.includes(id);
    completeButton.textContent = isComplete ? "Completed ✓ (undo)" : "Mark guide complete";
    completeButton.classList.toggle("is-done", isComplete);
    $("#lesson-previous").disabled = index === 0;
    $("#lesson-next").disabled = index === content.lessons.length - 1;
    setOverviewMode(false);
    setActiveNavigation("lesson", id, navKey);
    document.title = `${lesson.title} | Git & GitHub`;
    if (updateHistory) history.pushState(null, "", `#lesson-${id}`);
    title.focus({ preventScroll: true });
    closeMobileNavigation();
    const selectedPart = sectionHeading && $$(".lesson-part", lessonArticle).find(part => $("h2", part).textContent === sectionHeading);
    if (selectedPart) selectedPart.scrollIntoView({ block: "start", behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderScenario(id, updateHistory = true) {
    const scenario = content.scenarios.find(item => item.id === id);
    if (!scenario) return;
    const parts = [
      ["Situation", scenario.situation],
      ["Symptoms", scenario.symptoms],
      ["Diagnosis", scenario.diagnosis],
      ["Understanding the Problem", scenario.understanding],
      ["Solution", scenario.solution],
      ["Verification", scenario.verification],
      ["Prevention", scenario.prevention]
    ];
    scenarioDetail.replaceChildren();
    scenarioDetail.appendChild(element("p", "eyebrow", scenario.group.toUpperCase()));
    const scenarioTitle = element("h3", "", scenario.title);
    scenarioTitle.tabIndex = -1;
    scenarioDetail.appendChild(scenarioTitle);
    parts.forEach(([heading, text]) => {
      const part = element("section", "scenario-part");
      part.appendChild(element("h4", "", heading));
      const paragraph = element("p", "", text);
      if (heading === "Solution" && /reset --hard|force push|revert|rebase|reset/i.test(text)) {
        paragraph.classList.add("risk-copy");
      }
      part.appendChild(paragraph);
      if (heading === "Solution" && scenario.commands) {
        const code = element("pre", "code-block");
        code.textContent = scenario.commands;
        part.appendChild(code);
      }
      scenarioDetail.appendChild(part);
    });
    scenarioDetail.hidden = false;
    $$(".scenario-card").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.id === id));
    });
    setActiveNavigation("scenario", id);
    if (updateHistory) history.pushState(null, "", `#scenario-${id}`);
    closeMobileNavigation();
    scenarioTitle.focus({ preventScroll: true });
    scenarioDetail.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function renderTopicPanels() {
    const ids = ["fundamentals", "daily-workflows", "branching", "github-collaboration"];
    const panels = $("#topic-panels");
    ids.forEach((id, index) => {
      const lesson = content.lessons.find(item => item.id === id);
      const button = element("button", "area-panel");
      button.type = "button";
      button.dataset.kind = "lesson";
      button.dataset.id = id;
      button.appendChild(element("div", "area-panel-top"));
      const top = $(".area-panel-top", button);
      top.append(element("span", "area-index", `0${index + 1}`), element("span", "area-arrow", "↗"));
      button.append(element("h3", "", lesson.title), element("p", "", lesson.summary));
      panels.appendChild(button);
    });
  }

  function renderScenarios() {
    const list = $("#scenario-list");
    content.scenarios.forEach(scenario => {
      const button = element("button", "scenario-card");
      button.type = "button";
      button.dataset.id = scenario.id;
      button.setAttribute("aria-pressed", "false");
      button.append(element("strong", "", scenario.title), element("span", "", scenario.group));
      button.addEventListener("click", () => renderScenario(scenario.id));
      list.appendChild(button);
    });
  }

  function renderCommands(filter = "") {
    const list = $("#command-list");
    const query = filter.trim().toLowerCase();
    list.replaceChildren();
    let visible = 0;
    content.commands.forEach(command => {
      const searchable = `${command.name} ${command.category} ${command.synopsis} ${command.usage} ${command.risk}`.toLowerCase();
      if (query && !searchable.includes(query)) return;
      visible += 1;
      const entry = element("details", "command-entry");
      entry.dataset.command = command.name;
      const summary = element("summary");
      summary.append(element("span", "command-name", command.name), element("span", "command-copy", command.synopsis), element("span", "command-category", command.category));
      entry.appendChild(summary);
      const description = element("div", "command-description");
      addParagraph(description, `When to use it: ${command.usage}`);
      const risk = element("p", `command-risk${/destruct|rewrit|force|discard|local and time|remove/i.test(command.risk) ? " is-caution" : ""}`);
      risk.append(element("strong", "", "Potential consequences: "), document.createTextNode(command.risk));
      description.appendChild(risk);
      entry.appendChild(description);
      list.appendChild(entry);
    });
    $("#command-empty").hidden = visible > 0;
  }

  function routeToCommand(id) {
    const command = content.commands.find(item => item.name === id);
    if (!command) return;
    setOverviewMode(true);
    $("#command-filter").value = "";
    renderCommands();
    const target = $(`[data-command="${CSS.escape(command.name)}"]`, $("#command-list"));
    if (target) {
      target.open = true;
      setActiveNavigation("command", id);
      history.pushState(null, "", "#commands");
      document.title = `Command reference | Git & GitHub`;
      $("summary", target).focus({ preventScroll: true });
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    closeMobileNavigation();
  }

  function searchIndex() {
    const items = [];
    content.lessons.forEach(lesson => {
      const body = lesson.sections.map(section => `${section.heading} ${section.text || ""} ${(section.bullets || []).join(" ")}`).join(" ");
      items.push({ kind: "lesson", id: lesson.id, title: lesson.title, description: lesson.summary, text: `${lesson.title} ${lesson.summary} ${body}` });
    });
    content.scenarios.forEach(scenario => {
      items.push({ kind: "scenario", id: scenario.id, title: scenario.title, description: scenario.situation, text: Object.values(scenario).join(" ") });
    });
    content.commands.forEach(command => {
      items.push({ kind: "command", id: command.name, title: command.name, description: command.synopsis, text: Object.values(command).join(" ") });
    });
    return items;
  }

  const searchableItems = searchIndex();

  function renderSearch(query) {
    searchResults.replaceChildren();
    if (!query) {
      searchResults.hidden = true;
      searchInput.setAttribute("aria-expanded", "false");
      return;
    }
    const normalized = query.toLowerCase();
    const matches = searchableItems.filter(item => item.text.toLowerCase().includes(normalized)).slice(0, 10);
    if (!matches.length) {
      searchResults.appendChild(element("p", "search-empty", "No documentation matches that search."));
    } else {
      matches.forEach(item => {
        const button = element("button", "search-result");
        button.type = "button";
        button.setAttribute("role", "option");
        button.dataset.kind = item.kind;
        button.dataset.id = item.id;
        button.append(element("strong", "", item.title), element("span", "", `${item.kind === "scenario" ? "Troubleshooting" : item.kind === "command" ? "Command reference" : "Guide"} · ${item.description}`));
        searchResults.appendChild(button);
      });
    }
    searchResults.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function createInitialGraph() {
    return {
      commits: [
        { id: "A1", parents: [], lane: 0, type: "main", subject: "Initial" },
        { id: "A2", parents: ["A1"], lane: 0, type: "main", subject: "API setup" }
      ],
      branches: { main: "A2" },
      current: "main",
      sequence: 3,
      rebaseSequence: 1,
      message: "Start by creating a feature branch or adding a commit."
    };
  }

  function currentHead() {
    return graph.branches[graph.current];
  }

  function commitById(id) {
    return graph.commits.find(commit => commit.id === id);
  }

  function ancestors(id) {
    const found = new Set();
    const stack = [id];
    while (stack.length) {
      const next = stack.pop();
      if (!next || found.has(next)) continue;
      found.add(next);
      const commit = commitById(next);
      if (commit) stack.push(...commit.parents);
    }
    return found;
  }

  function isAncestor(possibleAncestor, commit) {
    return ancestors(commit).has(possibleAncestor);
  }

  function appendCommit(parent, lane, type, subject, secondParent) {
    const id = `C${graph.sequence++}`;
    const parents = secondParent ? [parent, secondParent] : [parent];
    graph.commits.push({ id, parents, lane, type, subject });
    return id;
  }

  function operation(name) {
    const head = currentHead();
    if (name === "restart") {
      graph = createInitialGraph();
    } else if (name === "branch") {
      if (graph.branches.feature) graph.message = "The feature branch already exists. Switch to it or restart the graph.";
      else {
        graph.branches.feature = head;
        graph.message = `Created feature at ${head}. The branch label points to the same commit; no commit was copied.`;
      }
    } else if (name === "switch") {
      if (!graph.branches.feature) graph.message = "Create the feature branch before switching to it.";
      else {
        graph.current = graph.current === "main" ? "feature" : "main";
        graph.message = `HEAD now follows ${graph.current} at ${currentHead()}. The branch references did not move.`;
      }
    } else if (name === "commit") {
      const lane = graph.current === "main" ? 0 : 1;
      const id = appendCommit(head, lane, graph.current, `${graph.current} change`);
      graph.branches[graph.current] = id;
      graph.message = `Created ${id} on ${graph.current}. Only the current branch reference advanced.`;
    } else if (name === "main-commit") {
      const id = appendCommit(graph.branches.main, 0, "main", "main change");
      graph.branches.main = id;
      graph.message = `Created ${id} on main. If main is checked out, HEAD follows the moved main reference.`;
    } else if (name === "merge") {
      if (!graph.branches.feature) graph.message = "Create a feature branch before merging.";
      else if (graph.current !== "main") graph.message = "Merge applies into the current branch. Switch to main first.";
      else if (isAncestor(graph.branches.feature, graph.branches.main)) graph.message = "Main already contains the feature tip; there is nothing new to merge.";
      else if (isAncestor(graph.branches.main, graph.branches.feature)) {
        graph.branches.main = graph.branches.feature;
        graph.message = "Fast-forward merge: main moved to the feature tip; no merge commit was needed.";
      } else {
        const id = appendCommit(graph.branches.main, 0, "merge", "merge feature", graph.branches.feature);
        graph.branches.main = id;
        graph.message = `Three-way merge created ${id} with both branch tips as parents.`;
      }
    } else if (name === "rebase") {
      if (!graph.branches.feature) graph.message = "Create a feature branch before rebasing.";
      else {
        const featureAncestors = ancestors(graph.branches.feature);
        const mainAncestors = ancestors(graph.branches.main);
        const commitsToReplay = graph.commits.filter(commit =>
          featureAncestors.has(commit.id) && !mainAncestors.has(commit.id) && commit.type !== "merge"
        );
        if (!commitsToReplay.length) {
          graph.message = "There are no feature-only commits to replay onto main.";
        } else {
          commitsToReplay.forEach(commit => { commit.lane = 2; });
          let parent = graph.branches.main;
          let rewritten;
          commitsToReplay.forEach(commit => {
            rewritten = `R${graph.rebaseSequence++}`;
            graph.commits.push({ id: rewritten, parents: [parent], lane: 1, type: "feature", subject: `rebased ${commit.id}` });
            parent = rewritten;
          });
          graph.branches.feature = rewritten;
          graph.message = `Replayed ${commitsToReplay.length} feature commit(s) on main. New commit IDs were created; the original local commits are shown in gray.`;
        }
      }
    } else if (name === "reset") {
      const commit = commitById(head);
      if (!commit || commit.parents.length === 0) graph.message = "The current branch is already at its first commit.";
      else {
        graph.branches[graph.current] = commit.parents[0];
        graph.message = `Reset moved ${graph.current} from ${head} to ${commit.parents[0]}. The abandoned commit remains visible here, but real resets can make work harder to recover.`;
      }
    } else if (name === "revert") {
      if (!head) graph.message = "There is no commit to revert.";
      else {
        const id = appendCommit(head, graph.current === "main" ? 0 : 1, "revert", `revert ${head}`);
        graph.branches[graph.current] = id;
        graph.message = `Revert added ${id}; it preserves ancestry and records an inverse change rather than moving the branch backward.`;
      }
    }
    drawGraph();
  }

  function drawGraph() {
    const svg = $("#commit-graph");
    svg.replaceChildren();
    const ns = "http://www.w3.org/2000/svg";
    const make = (name, attrs = {}, text) => {
      const node = document.createElementNS(ns, name);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const xStep = 88;
    const positions = new Map();
    graph.commits.forEach((commit, index) => positions.set(commit.id, { x: 45 + index * xStep, y: 58 + commit.lane * 66 }));
    const width = Math.max(460, 110 + graph.commits.length * xStep);
    svg.setAttribute("viewBox", `0 0 ${width} 245`);
    svg.setAttribute("height", "245");
    svg.setAttribute("width", String(width));
    svg.appendChild(make("title", { id: "graph-title" }, "Git commit graph"));
    const branchY = new Map([[0, "main"], [1, "feature"], [2, "rewritten history"]]);
    branchY.forEach((label, lane) => {
      if (graph.commits.some(commit => commit.lane === lane)) {
        svg.appendChild(make("text", { x: "12", y: String(62 + lane * 66), class: "graph-branch-label" }, label));
      }
    });
    graph.commits.forEach(commit => {
      const child = positions.get(commit.id);
      commit.parents.forEach(parentId => {
        const parent = positions.get(parentId);
        if (!parent || !child) return;
        const middleX = (parent.x + child.x) / 2;
        const path = `M ${parent.x} ${parent.y} C ${middleX} ${parent.y}, ${middleX} ${child.y}, ${child.x} ${child.y}`;
        svg.appendChild(make("path", { d: path, class: `graph-edge${commit.type === "merge" ? " is-merge" : ""}` }));
      });
    });
    graph.commits.forEach(commit => {
      const point = positions.get(commit.id);
      const group = make("g", { "aria-label": `${commit.id}: ${commit.subject}` });
      group.appendChild(make("circle", { cx: point.x, cy: point.y, r: "16", class: `graph-commit is-${commit.type}` }));
      group.appendChild(make("text", { x: point.x, y: point.y, class: "graph-commit-label" }, commit.id));
      svg.appendChild(group);
    });
    Object.entries(graph.branches).forEach(([name, id], index) => {
      const point = positions.get(id);
      if (!point) return;
      svg.appendChild(make("text", {
        x: point.x + 19,
        y: point.y + 4 + index * 13,
        class: `graph-ref${name === "feature" ? " is-feature" : ""}`
      }, name));
    });
    const head = positions.get(currentHead());
    if (head) {
      svg.appendChild(make("circle", { cx: head.x, cy: head.y, r: "22", fill: "none", stroke: "#dce5df", "stroke-width": "1", "stroke-dasharray": "3 3" }));
      svg.appendChild(make("text", { x: head.x, y: head.y - 27, class: "graph-ref" }, "HEAD"));
    }
    $("#graph-message").textContent = graph.message;
    $("#graph-state").textContent = `HEAD → ${graph.current} → ${currentHead()}`;
  }

  function closeMobileNavigation() {
    document.body.classList.remove("nav-open");
    $("#mobile-menu-button").setAttribute("aria-expanded", "false");
    $("#mobile-menu-button .sr-only").textContent = "Open navigation";
  }

  function openView(kind, id, navKey, sectionHeading) {
    searchResults.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    if (kind === "overview") {
      setOverviewMode(true);
      setActiveNavigation("overview");
      history.pushState(null, "", "#overview");
      $("#page-title").focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (kind === "lesson") {
      renderLesson(id, true, navKey, sectionHeading);
    } else if (kind === "scenario") {
      setOverviewMode(true);
      renderScenario(id);
    } else if (kind === "command") {
      routeToCommand(id);
    } else if (kind === "section") {
      setOverviewMode(true);
      const target = document.getElementById(id);
      if (target) {
        setActiveNavigation("section", id);
        history.pushState(null, "", `#${id}`);
        const heading = $("h2", target);
        if (heading) {
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
        }
        target.scrollIntoView({ block: "start", behavior: "smooth" });
      }
      closeMobileNavigation();
    }
  }

  renderTopicPanels();
  renderScenarios();
  renderCommands();
  updateProgress();
  drawGraph();

  document.addEventListener("click", event => {
    const route = event.target.closest("[data-kind]");
    if (route) {
      openView(route.dataset.kind, route.dataset.id, route.dataset.navKey, route.dataset.section);
      return;
    }
    if (!event.target.closest(".topbar")) {
      searchResults.hidden = true;
      searchInput.setAttribute("aria-expanded", "false");
    }
  });

  $("#lesson-complete").addEventListener("click", () => {
    const id = content.lessons[activeLessonIndex].id;
    completed = completed.includes(id) ? completed.filter(item => item !== id) : [...completed, id];
    saveProgress();
    updateProgress();
    const done = completed.includes(id);
    $("#lesson-complete").textContent = done ? "Completed ✓ (undo)" : "Mark guide complete";
    $("#lesson-complete").classList.toggle("is-done", done);
  });
  $("#lesson-previous").addEventListener("click", () => {
    if (activeLessonIndex > 0) renderLesson(content.lessons[activeLessonIndex - 1].id);
  });
  $("#lesson-next").addEventListener("click", () => {
    if (activeLessonIndex < content.lessons.length - 1) renderLesson(content.lessons[activeLessonIndex + 1].id);
  });
  $("#command-filter").addEventListener("input", event => renderCommands(event.target.value));
  $("#docs-search").addEventListener("input", event => renderSearch(event.target.value.trim()));
  $("#docs-search").addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.currentTarget.value = "";
      renderSearch("");
      event.currentTarget.blur();
    } else if (event.key === "ArrowDown" && !searchResults.hidden) {
      event.preventDefault();
      $(".search-result", searchResults)?.focus();
    }
  });
  $("#visual-lab").addEventListener("click", event => {
    const button = event.target.closest("[data-op]");
    if (button) operation(button.dataset.op);
  });

  $("#mobile-menu-button").addEventListener("click", event => {
    const open = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    event.currentTarget.setAttribute("aria-expanded", String(open));
    event.currentTarget.querySelector(".sr-only").textContent = open ? "Close navigation" : "Open navigation";
  });
  $("#sidebar-scrim").addEventListener("click", closeMobileNavigation);
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      searchInput.focus();
    } else if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeMobileNavigation();
      $("#mobile-menu-button").focus();
    }
  });

  window.addEventListener("popstate", () => {
    const hash = location.hash.slice(1);
    if (hash.startsWith("lesson-")) renderLesson(hash.slice(7), false);
    else if (hash.startsWith("scenario-")) {
      setOverviewMode(true);
      renderScenario(hash.slice(9), false);
    } else if (["commands", "visual-lab", "troubleshooting"].includes(hash)) {
      setOverviewMode(true);
      document.getElementById(hash).scrollIntoView({ block: "start" });
    } else {
      setOverviewMode(true);
      setActiveNavigation("overview");
    }
  });

  if (location.hash.startsWith("#lesson-")) renderLesson(location.hash.slice(8), false);
  else if (location.hash.startsWith("#scenario-")) renderScenario(location.hash.slice(10), false);
  else if (["#commands", "#visual-lab", "#troubleshooting"].includes(location.hash)) {
    document.getElementById(location.hash.slice(1)).scrollIntoView();
  } else setActiveNavigation("overview");
})();
