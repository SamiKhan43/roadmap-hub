/* App: hash router, knowledge map + inspector, lessons, visual playground, problem lab,
   progress page, global search and small global behaviours.
   Depends on: helpers.js, curriculum.js, lessons-*.js, problems.js, visualizers.js, progress.js */
(function () {
  "use strict";
  var DSA = window.DSA;
  if (!DSA || !DSA.h || !DSA.topics || !DSA.progress) {
    var v0 = document.getElementById("view");
    if (v0) v0.innerHTML = '<p class="noscript">The DSA section failed to load one of its scripts. Refresh the page to try again.</p>';
    return;
  }
  var h = DSA.h, esc = h.esc, P = DSA.progress;
  var view = document.getElementById("view");
  var main = document.getElementById("main");

  var LEVEL = { b: "Beginner", i: "Intermediate", a: "Advanced" };
  var LEVEL_CLS = { b: "is-beginner", i: "is-intermediate", a: "is-advanced" };
  var DIFF_CLS = { Easy: "is-beginner", Medium: "is-intermediate", Hard: "is-advanced" };

  /* ---------- Small utilities ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function topic(id) { return DSA.topics[id]; }
  function realIds() { return DSA.order.filter(function (id) { return !DSA.topics[id].aliasOf; }); }
  function domainOf(id) { var t = topic(id); return DSA.domains.filter(function (d) { return d.id === t.domain; })[0]; }
  function problemById(id) { return DSA.problems.filter(function (p) { return p.id === id; })[0]; }
  function lessonFor(id) { return DSA.lessons[id] || null; }
  function vizFor(id) { return (DSA.vizOrder || []).filter(function (v) { return (DSA.viz[v].topics || []).indexOf(id) >= 0; }); }
  function problemsFor(id) {
    var l = lessonFor(id), ids = (l && l.problems) || [];
    DSA.problems.forEach(function (p) { if ((p.topics || []).indexOf(id) >= 0 && ids.indexOf(p.id) < 0) ids.push(p.id); });
    return ids.filter(problemById);
  }
  function levelChip(lv) { return '<span class="chip ' + (LEVEL_CLS[lv] || "") + '">' + esc(LEVEL[lv] || lv) + "</span>"; }
  function diffChip(d) { return '<span class="chip ' + (DIFF_CLS[String(d).split("/")[0].trim()] || "") + '">' + esc(d) + "</span>"; }
  function dot(id) { return '<span class="status-dot" data-dot-for="' + esc(id) + '" data-status="' + P.get(id) + '"></span>'; }
  function list(v) { return Array.isArray(v) ? v : v ? [v] : []; }
  function stripTags(s) { return String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }
  function firstSentence(s) { var t = stripTags(s); var m = t.match(/^.{0,160}?[.!?](\s|$)/); return m ? m[0].trim() : t.slice(0, 140) + (t.length > 140 ? "…" : ""); }
  function ss(key, val) {
    try { if (val === undefined) return window.sessionStorage.getItem(key); window.sessionStorage.setItem(key, val); } catch (e) { /* ignore */ }
    return null;
  }
  function complexityHtml(c) {
    if (!c) return "";
    if (typeof c === "string") return "<p><strong>Complexity:</strong> " + c + "</p>";
    return '<div class="tag-row complexity-metrics">' +
      (c.time ? '<span class="chip">Time ' + esc(c.time) + "</span>" : "") +
      (c.space ? '<span class="chip">Space ' + esc(c.space) + "</span>" : "") + "</div>" +
      (c.why ? "<p>" + c.why + "</p>" : "");
  }

  /* ---------- Router ---------- */
  var cleanup = [];
  var current = { name: "", arg: "" };

  function parse() {
    var raw = (location.hash || "#/").replace(/^#/, "");
    if (raw.charAt(0) !== "/") raw = "/" + raw;
    var parts = raw.split("?")[0].split("/").filter(Boolean).map(function (p) { try { return decodeURIComponent(p); } catch (e) { return p; } });
    var name = parts[0] || "map";
    return { name: name, arg: parts[1] || "" };
  }

  function teardown() { cleanup.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } }); cleanup = []; }

  function setNav(name) {
    var key = name === "topic" ? "map" : name;
    document.body.classList.toggle("is-map-view", name === "map");
    $$(".dsa-nav a[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $$("#mobile-nav a").forEach(function (a) {
      var href = a.getAttribute("href");
      var k = href === "#/" ? "map" : href.replace("#/", "");
      if (k === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  var firstRender = true;
  function route() {
    var r = parse();
    closeInspector(false);
    if (r.name !== "map" && railObserver) { railObserver.disconnect(); railObserver = null; }
    teardown();
    closeSearch();
    closeMenu();
    current = r;
    setNav(r.name);
    try {
      if (r.name === "map") renderMap();
      else if (r.name === "topic") renderTopic(r.arg);
      else if (r.name === "playground") renderPlayground(r.arg);
      else if (r.name === "lab") { if (r.arg) renderProblem(r.arg); else renderLab(); }
      else if (r.name === "progress") renderProgress();
      else renderNotFound();
    } catch (e) {
      if (window.console) console.error(e);
      view.innerHTML = '<div class="pending-lesson"><h2>Something went wrong</h2><p>This page could not be shown. <a class="text-link" href="#/">Back to the knowledge map</a>.</p></div>';
    }
    if (pendingJump && r.name === "map") { jumpToDomain(pendingJump); pendingJump = null; }
    else if (!firstRender) window.scrollTo(0, 0);
    if (!firstRender && main) { try { main.focus({ preventScroll: true }); } catch (e) { /* old browsers */ } }
    firstRender = false;
  }

  function setTitle(t) { document.title = (t ? t + " | " : "") + "Data Structures & Algorithms | Roadmap Hub"; }

  function renderNotFound() {
    setTitle("Not found");
    view.innerHTML = '<div class="pending-lesson"><span class="eyebrow">404</span><h2>That page does not exist</h2><p>The link may be old or mistyped.</p><p><a class="btn btn-primary" href="#/">Open the knowledge map</a></p></div>';
  }

  /* ---------- Knowledge map ---------- */
  var mapState = { q: "" };
  var railObserver = null;
  var inspectorFocus = null;

  function pct(c) { return c.total ? Math.round(100 * c.done / c.total) : 0; }

  function summaryHtml() {
    var all = P.counts(P.topicIds());
    var percent = pct(all);
    return '<span class="map-progress-label eyebrow">Your roadmap progress</span>' +
      '<strong class="map-progress-value">' + all.done + '<small> / ' + all.total + " topics complete</small></strong>" +
      '<span class="map-progress-track" role="progressbar" aria-label="Roadmap topics complete" aria-valuemin="0" aria-valuemax="' + all.total + '" aria-valuenow="' + all.done + '"><i style="width:' + percent + '%"></i></span>' +
      '<span class="map-progress-details"><span>' + all.learning + " learning</span><span>" + Object.keys(DSA.lessons).length + " lessons</span><span>" + DSA.domains.length + " phases</span></span>";
  }
  function domainRailHtml() {
    return DSA.domains.map(function (d) {
      var c = P.counts(P.topicIds(d.id));
      return '<button class="rail-item" type="button" data-jump-domain="' + d.id + '" data-domain-rail="' + d.id + '" aria-label="' +
        esc(d.title + ", " + c.done + " of " + c.total + " topics complete") + '">' +
        '<span class="code">' + d.num + '</span><span class="name">' + esc(d.title) + '</span>' +
        '<span class="rail-meta" data-domain-count="' + d.id + '">' + c.done + " / " + c.total + '</span>' +
        '<span class="bar"><i data-domain-progress="' + d.id + '" style="width:' + pct(c) + '%"></i></span></button>';
    }).join("");
  }
  function nodeHtml(tp) {
    var status = P.get(tp.id);
    return '<li><button type="button" class="node" data-topic="' + tp.id + '" data-status="' + status + '" aria-pressed="false" aria-label="' +
      esc(tp.title + ". " + tp.sum + " " + LEVEL[tp.level] + " topic. " + P.LABELS[status]) + '">' +
      '<span class="node-index" aria-hidden="true"></span><span class="node-content"><span class="node-top"><span class="node-level">' + esc(LEVEL[tp.level]) + '</span>' +
      dot(tp.id) + '</span><span class="node-title">' + esc(tp.title) + '</span>' +
      '<span class="node-summary">' + esc(tp.sum) + '</span>' +
      '<span class="node-meta"><span title="Prerequisites">' + tp.pre.length + ' prerequisite' + (tp.pre.length === 1 ? "" : "s") + '</span><span title="Topics unlocked">' + tp.unlocks.length + ' next' +
      '</span><span class="node-status" data-status-label="' + tp.id + '">' + esc(P.LABELS[status]) + '</span></span></span></button></li>';
  }
  function refreshDomainProgress() {
    DSA.domains.forEach(function (d) {
      var c = P.counts(P.topicIds(d.id)), progress = pct(c);
      var count = $('[data-domain-count="' + d.id + '"]', view);
      var railBar = $('[data-domain-progress="' + d.id + '"]', view);
      var stageCount = $('[data-domain-stage-count="' + d.id + '"]', view);
      var stageBar = $('[data-domain-stage-progress="' + d.id + '"]', view);
      var block = $("#domain-" + d.id, view);
      if (count) count.textContent = c.done + " / " + c.total;
      if (railBar) railBar.style.width = progress + "%";
      if (stageCount) stageCount.textContent = c.done + " / " + c.total + " topics";
      if (stageBar) stageBar.style.width = progress + "%";
      if (block) block.classList.toggle("complete", c.total > 0 && c.done === c.total);
    });
  }
  function markActiveDomain(did) {
    $$("button[data-domain-rail]", view).forEach(function (item) {
      var active = item.getAttribute("data-domain-rail") === did;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "location"); else item.removeAttribute("aria-current");
    });
  }
  function openInspector() {
    var panel = $(".inspector", view);
    if (!panel) return;
    if (!panel.classList.contains("is-open")) {
      inspectorFocus = document.activeElement;
      panel.classList.add("is-open");
      var scrim = $(".inspector-scrim", view);
      if (scrim) scrim.classList.add("is-open");
      document.body.classList.add("dsa-inspector-open");
      var close = $("[data-close-inspector]", panel);
      if (close) close.focus();
    }
  }
  function closeInspector(restoreFocus) {
    var panel = $(".inspector", view);
    if (!panel) return;
    var wasOpen = panel.classList.contains("is-open");
    panel.classList.remove("is-open");
    var scrim = $(".inspector-scrim", view);
    if (scrim) scrim.classList.remove("is-open");
    document.body.classList.remove("dsa-inspector-open");
    if (restoreFocus !== false && wasOpen && inspectorFocus && document.body.contains(inspectorFocus)) inspectorFocus.focus();
    inspectorFocus = null;
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $(".inspector.is-open", view)) closeInspector();
  });

  function renderMap() {
    setTitle("Knowledge map");
    var html = P.warningHtml() +
      '<section class="page-head"><div class="page-title"><span class="eyebrow">A guided learning path</span><h1>Data Structures &amp; Algorithms</h1>' +
      "<p>A connected learning map from programming foundations to advanced algorithms. Follow prerequisites, open topics for lessons and examples, and track your progress as you practice.</p></div>" +
      '<div class="progress-summary" data-map-summary>' + summaryHtml() + "</div>" +
      '<details class="map-help"><summary aria-label="Show map legend" title="Show map legend">?</summary>' +
      '<div class="map-legend" role="note" aria-label="Map legend">' +
      '<span><span class="legend-node"></span>Topic card</span><span><span class="legend-node is-selected"></span>Selected relationship</span>' +
      '<span><span class="level-dot is-beginner"></span>Beginner</span><span><span class="level-dot is-intermediate"></span>Intermediate</span><span><span class="level-dot is-advanced"></span>Advanced</span>' +
      '<span><span class="status-dot" data-status="learning"></span>Learning</span><span><span class="status-dot" data-status="understood"></span>Understood</span><span><span class="status-dot" data-status="practiced"></span>Practiced</span>' +
      "</div></details></section>" +
      '<div class="map-layout"><aside class="domain-rail" aria-label="Learning phases"><h2 class="eyebrow">The journey</h2><nav data-domain-rail>' +
      domainRailHtml() + '</nav></aside><div class="map-canvas" id="map-canvas">' +
      '<div data-map-domains>' +
      DSA.domains.map(function (d) {
        var c = P.counts(P.topicIds(d.id)), progress = pct(c);
        return '<section class="domain-block" data-domain="' + d.id + '" id="domain-' + d.id + '"><header class="domain-head"><span class="num">' + d.num +
          '</span><div class="domain-title"><span class="eyebrow">Phase ' + d.num + '</span><h2>' + esc(d.title) + '</h2><p>' + esc(d.desc) + '</p></div>' +
          '<div class="stage-meter"><span data-domain-stage-count="' + d.id + '">' + c.done + " / " + c.total + ' topics</span><span class="bar"><i data-domain-stage-progress="' + d.id + '" style="width:' + progress + '%"></i></span></div></header>' +
          '<div class="group-grid">' + d.groups.map(function (g) {
            var tps = g.topics.filter(function (tp) { return !tp.aliasOf; });
            return '<section class="group-col" data-group="' + g.id + '"><h3>' + esc(g.title) + '<span>' + tps.length + ' topics</span></h3><ul class="node-list">' + tps.map(nodeHtml).join("") + "</ul></section>";
          }).join("") + "</div></section>";
      }).join("") +
      '<p class="map-empty" data-map-empty hidden>No topics match your search. <button type="button" class="btn btn-small" data-clear-search>Clear search</button></p>' +
      '</div></div><div class="inspector-scrim" data-close-inspector></div><aside class="inspector" role="dialog" aria-modal="false" aria-label="Topic inspector">' +
      '<button class="inspector-close" type="button" data-close-inspector aria-label="Close topic details">Esc ×</button><div class="inspector-inner" data-inspector></div></aside></div>';
    view.innerHTML = html;

    var sel = ss("rm:dsa:selected");
    if (!sel || !topic(sel) || topic(sel).aliasOf) sel = realIds().filter(function (id) { return !P.isDone(P.get(id)); })[0] || DSA.order[0];
    select(sel, false);
    applySearchFilter();
    refreshDomainProgress();
    if (railObserver) railObserver.disconnect();
    if (window.IntersectionObserver) {
      railObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          markActiveDomain(entry.target.getAttribute("data-domain"));
        });
      }, {
        rootMargin: "-" + Math.round(window.innerHeight * .2) + "px 0px -" +
          Math.round(window.innerHeight * .65) + "px 0px"
      });
      $$(".domain-block", view).forEach(function (block) { railObserver.observe(block); });
    }

    view.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-inspector]")) { closeInspector(); return; }
      if (e.target.closest("[data-clear-search]")) {
        mapState.q = "";
        if (input) input.value = "";
        closeSearch(true);
        applySearchFilter();
        return;
      }
      var n = e.target.closest("[data-topic]");
      if (n) { select(n.getAttribute("data-topic"), true); return; }
      var s = e.target.closest("[data-select]");
      if (s) { e.preventDefault(); select(s.getAttribute("data-select"), true, true); return; }
    });
  }

  function select(id, userAction, scrollNode) {
    var t = topic(id);
    if (!t) return;
    if (t.aliasOf) { id = t.aliasOf; t = topic(id); }
    ss("rm:dsa:selected", id);
    var rel = {};
    t.pre.forEach(function (p) { rel[p] = "is-prereq"; });
    t.unlocks.forEach(function (p) { if (!rel[p]) rel[p] = "is-unlocks"; });
    t.rel.forEach(function (p) { if (!rel[p]) rel[p] = "is-related"; });
    $$(".node[data-topic]", view).forEach(function (n) {
      var nid = n.getAttribute("data-topic");
      n.classList.remove("is-selected", "is-prereq", "is-unlocks", "is-related");
      if (nid === id) n.classList.add("is-selected"); else if (rel[nid]) n.classList.add(rel[nid]);
      n.setAttribute("aria-pressed", String(nid === id));
    });
    renderInspector(id);
    if (userAction) openInspector();
    if (scrollNode) {
      var node = $('.node[data-topic="' + id + '"]', view);
      if (node) {
        node.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }

  function relList(ids, emptyText) {
    ids = ids.filter(topic);
    if (!ids.length) return '<ul class="rel-list"><li class="none">' + emptyText + "</li></ul>";
    return '<ul class="rel-list">' + ids.map(function (id) {
      return '<li><button type="button" data-select="' + id + '">' + dot(id) + "<span>" + esc(topic(id).title) + "</span></button></li>";
    }).join("") + "</ul>";
  }

  function renderInspector(id) {
    var box = $("[data-inspector]", view);
    if (!box) return;
    var t = topic(id), l = lessonFor(id), vz = vizFor(id), pr = problemsFor(id);
    box.setAttribute("data-current", id);
    box.innerHTML =
      '<span class="eyebrow">' + esc(domainOf(id).num + " · " + t.groupTitle) + "</span>" +
      "<h2>" + esc(t.title) + "</h2>" +
      '<div class="row">' + levelChip(t.level) + (l ? '<span class="chip">' + (l.minutes || 10) + " min lesson</span>" : '<span class="chip">Lesson in preparation</span>') + "</div>" +
      '<section class="inspector-section"><h3>What you will learn</h3><p>' + esc(t.sum) + "</p></section>" +
      "<h3>Your status</h3>" + P.pickerHtml(id) +
      '<div class="row inspector-action"><a class="btn btn-primary" href="#/topic/' + id + '">' + (l ? "Start lesson" : "Open topic") + " →</a></div>" +
      "<h3>Before you begin</h3>" + relList(t.pre, "No prerequisites — a good place to start.") +
      "<h3>Builds toward</h3>" + relList(t.unlocks, "No later topic lists this as a prerequisite yet.") +
      (t.rel.length ? "<h3>Related topics</h3>" + relList(t.rel, "No related topics listed.") : "") +
      (vz.length ? '<h3>Visualizers</h3><div class="tag-row">' + vz.map(function (v) { return '<a class="chip" href="#/playground/' + v + '">' + esc(DSA.viz[v].title) + "</a>"; }).join("") + "</div>" : "") +
      (pr.length ? '<h3>Practice problems</h3><div class="tag-row">' + pr.map(function (p) { return '<a class="chip" href="#/lab/' + p + '">' + esc(problemById(p).title) + "</a>"; }).join("") + "</div>" : "");
  }

  function applySearchFilter() {
    var q = mapState.q.trim().toLowerCase();
    var any = false;
    $$(".domain-block", view).forEach(function (block) {
      var blockAny = false;
      $$(".group-col", block).forEach(function (col) {
        var colAny = false;
        $$(".node[data-topic]", col).forEach(function (n) {
          var t = topic(n.getAttribute("data-topic"));
          var ok = !q || (t.title + " " + t.sum + " " + t.id).toLowerCase().indexOf(q) >= 0;
          n.classList.toggle("is-hidden", !ok);
          n.parentNode.hidden = !ok;
          if (ok) colAny = true;
        });
        col.hidden = !colAny;
        if (colAny) blockAny = true;
      });
      block.hidden = !blockAny;
      if (blockAny) any = true;
    });
    var empty = $("[data-map-empty]", view);
    if (empty) empty.hidden = any;
  }

  var pendingJump = null;
  function jumpToDomain(did) {
    if (mapState.q) {
      mapState.q = "";
      if (input) input.value = "";
      closeSearch(true);
      applySearchFilter();
    }
    var el = document.getElementById("domain-" + did);
    if (!el) return;
    el.hidden = false;
    markActiveDomain(did);
  }

  function refreshMap() {
    var s = $("[data-map-summary]", view); if (s) s.innerHTML = summaryHtml();
    refreshDomainProgress();
    var ins = $("[data-inspector]", view);
    if (ins && ins.getAttribute("data-current")) renderInspector(ins.getAttribute("data-current"));
    if (mapState.q) applySearchFilter();
  }

  /* ---------- Lesson ---------- */
  function renderTopic(id) {
    var t = topic(id);
    if (!t) { renderNotFound(); return; }
    if (t.aliasOf && topic(t.aliasOf)) { location.replace("#/topic/" + t.aliasOf); return; }
    var l = lessonFor(id), d = domainOf(id);
    setTitle(t.title);
    var ids = realIds(), idx = ids.indexOf(id);
    var prev = idx > 0 ? ids[idx - 1] : null, next = idx < ids.length - 1 ? ids[idx + 1] : null;
    var vz = vizFor(id), pr = problemsFor(id);

    var head = '<header class="lesson-head"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Learning map</a><span>/</span><a href="#/" data-jump-domain="' + d.id + '">' + esc(d.title) + "</a><span>/</span><span>" + esc(t.groupTitle) + "</span></nav>" +
      '<span class="eyebrow">' + d.num + " · " + esc(LEVEL[t.level]) + "</span><h1>" + esc(t.title) + "</h1></header>";

    var sections = [], body = "";
    if (l) {
      (l.sections || []).forEach(function (s, i) { sections.push({ id: "sec-" + (s.id || i), title: s.title, html: s.html }); });
      var embedded = (l.sections || []).map(function (s) { return s.html || ""; }).join(" ");
      var extraViz = list(l.viz).filter(function (v) { return DSA.viz[v] && embedded.indexOf('data-viz="' + v + '"') < 0; });
      if (extraViz.length) sections.push({ id: "sec-try-it", title: "Try it yourself", html: "<p>Change the input, then step through the animation one frame at a time. Predict the next frame before you press Step.</p>" + extraViz.map(function (v) { return h.viz(v); }).join("") });
      if (l.practice && l.practice.length) sections.push({ id: "sec-practice", title: "Check your understanding", practice: true });
      if (pr.length) sections.push({ id: "sec-problems", title: "Practice problems", problems: true });

      body = '<p class="lede">' + (l.lede || esc(t.sum)) + "</p>" +
        '<div class="lesson-meta">' + levelChip(t.level) + '<span class="chip">' + (l.minutes || 10) + ' min read</span><span class="chip">' + sections.length + " sections</span>" +
        '<span class="chip">' + dot(id) + '<span data-status-label="' + id + '">' + P.LABELS[P.get(id)] + "</span></span></div>" +
        sections.map(function (s, i) {
          var inner;
          if (s.practice) inner = practiceHtml(l.practice);
          else if (s.problems) inner = problemTable(pr);
          else inner = s.html;
          return '<section class="lesson-section" id="' + esc(s.id) + '"><h2><span class="n">' + (i < 9 ? "0" : "") + (i + 1) + "</span>" + esc(s.title) + '</h2><div class="prose">' + inner + "</div></section>";
        }).join("");
    } else {
      body = '<p class="lede">' + esc(t.sum) + "</p>" +
        '<div class="lesson-meta">' + levelChip(t.level) + '<span class="chip">Lesson in preparation</span></div>' +
        '<div class="pending-lesson"><h2>This lesson is being written</h2>' +
        '<div class="prose"><p>The full textbook-style lesson for <strong>' + esc(t.title) + "</strong> is not published yet. Here is what it will cover and how to prepare:</p>" +
        "<p><strong>Scope:</strong> " + esc(t.sum) + "</p>" +
        (t.pre.length ? "<p><strong>Study these first:</strong></p><ul class=\"check-list\">" + t.pre.filter(topic).map(function (p) { return "<li>" + h.link(p, topic(p).title) + (lessonFor(p) ? "" : ' <span class="chip">soon</span>') + "</li>"; }).join("") + "</ul>" : "<p>It has no prerequisites, so you can start here once it is ready.</p>") +
        (t.rel.length ? "<p><strong>Related topics:</strong> " + t.rel.filter(topic).map(function (p) { return h.link(p, topic(p).title); }).join(", ") + "</p>" : "") +
        (vz.length ? "<p><strong>You can already explore:</strong> " + vz.map(function (v) { return '<a class="text-link" href="#/playground/' + v + '">' + esc(DSA.viz[v].title) + "</a>"; }).join(", ") + "</p>" : "") +
        (pr.length ? "<p><strong>Problems that use it:</strong> " + pr.map(function (p) { return '<a class="text-link" href="#/lab/' + p + '">' + esc(problemById(p).title) + "</a>"; }).join(", ") + "</p>" : "") +
        "<p>You can still track it: set a status on the right while you learn it from other sources.</p></div></div>";
    }

    var nav = '<nav class="lesson-nav" aria-label="Previous and next topic">' +
      (prev ? '<a href="#/topic/' + prev + '"><small>← Previous</small>' + esc(topic(prev).title) + "</a>" : "<span></span>") +
      (next ? '<a class="next" href="#/topic/' + next + '"><small>Next →</small>' + esc(topic(next).title) + "</a>" : "<span></span>") + "</nav>";

    var toc = sections.length ? '<nav class="lesson-toc" aria-label="On this page"><span class="eyebrow">On this page</span><ol>' +
      sections.map(function (s) { return '<li><a href="#/topic/' + id + '" data-toc="' + esc(s.id) + '">' + esc(s.title) + "</a></li>"; }).join("") + "</ol></nav>" : '<nav class="lesson-toc" aria-label="On this page"></nav>';

    function asideLinks(ids2, empty) {
      ids2 = ids2.filter(topic);
      return ids2.length ? '<ul class="aside-links">' + ids2.map(function (p) { return '<li><a href="#/topic/' + p + '">' + dot(p) + esc(topic(p).title) + "</a></li>"; }).join("") + "</ul>" :       '<p class="small aside-empty">' + empty + "</p>";
    }
    var aside = '<aside class="lesson-aside" aria-label="Topic details">' +
      '<div class="aside-block"><h3>Prerequisites</h3>' + asideLinks(t.pre, "None") + "</div>" +
      '<div class="aside-block"><h3>Unlocks</h3>' + asideLinks(t.unlocks, "Nothing yet") + "</div>" +
      (t.rel.length ? '<div class="aside-block"><h3>Related</h3>' + asideLinks(t.rel, "") + "</div>" : "") +
      (vz.length ? '<div class="aside-block"><h3>Visualizers</h3><ul class="aside-links">' + vz.map(function (v) { return '<li><a href="#/playground/' + v + '">' + esc(DSA.viz[v].title) + "</a></li>"; }).join("") + "</ul></div>" : "") +
      (pr.length ? '<div class="aside-block"><h3>Problems</h3><ul class="aside-links">' + pr.map(function (p) { return '<li><a href="#/lab/' + p + '">' + (P.isSolved(p) ? "✓ " : "") + esc(problemById(p).title) + "</a></li>"; }).join("") + "</ul></div>" : "") +
      '<div class="aside-block"><a class="text-link" href="#/" data-select-on-map="' + id + '">← Show on the map</a></div>' +
      "</aside>";

    var completion = '<section class="lesson-completion" aria-label="Lesson completion"><span class="eyebrow">Keep your place</span><h2>How far have you got?</h2><p>Choose the status that best reflects your understanding. You can update it at any time.</p>' + P.pickerHtml(id) + "</section>";
    view.innerHTML = P.warningHtml() + '<div class="lesson-layout">' + toc + '<article class="lesson">' + head + body + completion + nav + "</article>" + aside + "</div>";
    if (DSA.mountVizSlots) DSA.mountVizSlots(view);
    bindToc();
  }

  function practiceHtml(items) {
    return '<ol class="practice">' + items.map(function (p) {
      return '<li><div class="q"><p>' + p.q + "</p></div>" +
        (p.hint ? "<details><summary>Hint</summary><div><p>" + p.hint + "</p></div></details>" : "") +
        "<details><summary>Show answer</summary><div><p>" + p.answer + "</p></div></details></li>";
    }).join("") + "</ol>";
  }

  function problemTable(ids) {
    return '<div class="table-wrap"><table class="list-table"><thead><tr><th>Problem</th><th>Difficulty</th><th class="hide-sm">Pattern</th></tr></thead><tbody>' +
      ids.map(function (pid) {
        var p = problemById(pid);
        return '<tr><td><a href="#/lab/' + p.id + '">' + (P.isSolved(p.id) ? "✓ " : "") + esc(p.title) + '</a><span class="desc">' + esc(firstSentence(p.statement)) + "</span></td><td>" + diffChip(p.difficulty) + '</td><td class="hide-sm">' + esc(list(p.patterns).join(", ")) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function bindToc() {
    var links = $$("[data-toc]", view);
    if (!links.length) return;
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.getElementById(a.getAttribute("data-toc"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    var ticking = false;
    function spy() {
      ticking = false;
      var active = null;
      links.forEach(function (a) {
        var s = document.getElementById(a.getAttribute("data-toc"));
        if (s && s.getBoundingClientRect().top < 140) active = a;
      });
      if (!active) active = links[0];
      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4) active = links[links.length - 1];
      links.forEach(function (a) { a.classList.toggle("is-active", a === active); });
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(spy); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanup.push(function () { window.removeEventListener("scroll", onScroll); });
    spy();
  }

  /* ---------- Visual playground ---------- */
  function renderPlayground(vid) {
    var ids = DSA.vizOrder || [];
    if (vid && !DSA.viz[vid]) { renderNotFound(); return; }
    setTitle(vid ? DSA.viz[vid].title : "Visual playground");
    var menu = '<nav class="viz-menu" aria-label="Visualizers"><a href="#/playground"' + (!vid ? ' aria-current="page"' : "") + "><span>All visualizers</span></a>" +
      ids.map(function (v) {
        return '<a href="#/playground/' + v + '"' + (v === vid ? ' aria-current="page"' : "") + "><span>" + esc(DSA.viz[v].title) + '</span><span class="seen" data-seen="' + v + '">' + (P.vizSeen(v) ? "SEEN" : "") + "</span></a>";
      }).join("") + "</nav>";
    var content;
    if (!vid) {
      content = '<div class="table-wrap"><table class="list-table"><thead><tr><th>Visualizer</th><th class="hide-sm">Topics</th><th>Status</th></tr></thead><tbody>' +
        ids.map(function (v) {
          var z = DSA.viz[v];
          return '<tr><td><a href="#/playground/' + v + '">' + esc(z.title) + '</a><span class="desc">' + esc(z.desc || "") + '</span></td><td class="hide-sm"><div class="tag-row">' +
            (z.topics || []).filter(topic).slice(0, 4).map(function (tid) { return '<a class="chip" href="#/topic/' + tid + '">' + esc(topic(tid).title) + "</a>"; }).join("") +
            '</div></td><td><span class="mono viz-state" data-seen="' + v + '">' + (P.vizSeen(v) ? "EXPLORED" : "") + "</span></td></tr>";
        }).join("") + "</tbody></table></div>";
    } else {
      var z = DSA.viz[vid];
      content = '<div><p class="viz-description">' + esc(z.desc || "") + '</p><div data-viz-mount></div></div>';
    }
    view.innerHTML = '<div class="section-head"><div><span class="eyebrow">Visual playground</span><h1>' + (vid ? esc(DSA.viz[vid].title) : "See algorithms run") + "</h1>" +
      "<p>" + (vid ? "Every operation is broken into steps. Use Step and Back to move one frame at a time, or Play to animate." : "Interactive, step-by-step visualizations. Enter your own input and watch memory, pointers and comparisons change.") + "</p></div>" +
      (vid ? '<a class="btn btn-small" href="#/playground">← All visualizers</a>' : "") + "</div>" +
      '<div class="viz-index">' + menu + content + "</div>";
    if (vid) DSA.mountViz($("[data-viz-mount]", view), vid);
  }

  /* ---------- Problem lab ---------- */
  var labState = { q: "", diff: "", ds: "", alg: "", pattern: "", status: "" };
  function uniq(arr) { var o = {}; arr.forEach(function (x) { if (x) o[x] = 1; }); return Object.keys(o).sort(); }
  function opts(label, key, values) {
    return '<select class="select" data-lf="' + key + '"><option value="">' + esc(label) + "</option>" +
      values.map(function (v) { return '<option value="' + esc(v) + '"' + (labState[key] === v ? " selected" : "") + ">" + esc(v) + "</option>"; }).join("") + "</select>";
  }
  function renderLab() {
    setTitle("Problem lab");
    var ps = DSA.problems;
    var solved = ps.filter(function (p) { return P.isSolved(p.id); }).length;
    view.innerHTML = '<div class="section-head"><div><span class="eyebrow">Problem lab</span><h1>Practice problems</h1>' +
      "<p>Each problem walks from understanding the question to a brute-force idea, then an optimal solution with Python code and an honest complexity analysis.</p></div>" +
      '<div class="lab-summary"><span data-lab-count>' + solved + " / " + ps.length + ' solved</span><span data-lab-results>' + ps.length + ' problems</span></div></div>' +
      '<div class="lab-browser"><aside class="lab-filters" aria-label="Filter problems"><div class="filter-heading"><h2>Find a problem</h2><button class="text-link" type="button" data-clear-lab-filters>Clear</button></div>' +
      '<label class="lab-search"><span>Search</span><input class="input" type="search" data-lf="q" placeholder="Title or concept" value="' + esc(labState.q) + '"></label>' +
      '<label class="lab-filter"><span>Difficulty</span>' + opts("Any difficulty", "diff", uniq(ps.map(function (p) { return p.difficulty; }))) + "</label>" +
      '<label class="lab-filter"><span>Data structure</span>' + opts("Any structure", "ds", uniq([].concat.apply([], ps.map(function (p) { return list(p.ds); })))) + "</label>" +
      '<label class="lab-filter"><span>Algorithm</span>' + opts("Any algorithm", "alg", uniq([].concat.apply([], ps.map(function (p) { return list(p.alg); })))) + "</label>" +
      '<label class="lab-filter"><span>Pattern</span>' + opts("Any pattern", "pattern", uniq([].concat.apply([], ps.map(function (p) { return list(p.patterns); })))) + "</label>" +
      '<label class="lab-filter"><span>Status</span><select class="select" data-lf="status"><option value="">Any status</option><option value="solved"' + (labState.status === "solved" ? " selected" : "") + '>Solved</option><option value="unsolved"' + (labState.status === "unsolved" ? " selected" : "") + ">Not solved</option></select></label></aside>" +
      '<section class="lab-results" aria-label="Problem results"><div class="problem-list" data-lab-rows></div><p class="map-empty" data-lab-empty hidden>No problems match these filters.</p></section></div>';
    $$("[data-lf]", view).forEach(function (el) {
      el.addEventListener(el.tagName === "SELECT" ? "change" : "input", function () { labState[el.getAttribute("data-lf")] = el.value; labRows(); });
    });
    $("[data-clear-lab-filters]", view).addEventListener("click", function () {
      Object.keys(labState).forEach(function (key) { labState[key] = ""; });
      $$("[data-lf]", view).forEach(function (el) { el.value = ""; });
      labRows();
    });
    labRows();
  }
  function labRows() {
    var body = $("[data-lab-rows]", view);
    if (!body) return;
    var q = labState.q.trim().toLowerCase();
    var rows = DSA.problems.filter(function (p) {
      if (labState.diff && p.difficulty !== labState.diff) return false;
      if (labState.ds && list(p.ds).indexOf(labState.ds) < 0) return false;
      if (labState.alg && list(p.alg).indexOf(labState.alg) < 0) return false;
      if (labState.pattern && list(p.patterns).indexOf(labState.pattern) < 0) return false;
      if (labState.status === "solved" && !P.isSolved(p.id)) return false;
      if (labState.status === "unsolved" && P.isSolved(p.id)) return false;
      if (q && (p.title + " " + stripTags(p.statement) + " " + list(p.patterns).join(" ") + " " + list(p.ds).join(" ")).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    body.innerHTML = rows.map(function (p) {
      return '<article class="problem-row"><div class="problem-row-copy"><a class="problem-title" href="#/lab/' + p.id + '">' + esc(p.title) + '</a><p>' + esc(firstSentence(p.statement)) + "</p>" +
        '<div class="tag-row">' + list(p.patterns).slice(0, 3).map(function (x) { return '<span class="problem-pattern">' + esc(x) + "</span>"; }).join("") + "</div></div>" +
        '<div class="problem-row-meta">' + diffChip(p.difficulty) + (P.isSolved(p.id) ? '<span class="solved-label">Solved</span>' : "") + "</div></article>";
    }).join("");
    var empty = $("[data-lab-empty]", view); if (empty) empty.hidden = rows.length > 0;
    var c = $("[data-lab-count]", view);
    if (c) c.textContent = DSA.problems.filter(function (p) { return P.isSolved(p.id); }).length + " / " + DSA.problems.length + " solved";
    var results = $("[data-lab-results]", view);
    if (results) results.textContent = rows.length + (rows.length === 1 ? " problem" : " problems");
  }

  function renderProblem(pid) {
    var p = problemById(pid);
    if (!p) { renderNotFound(); return; }
    setTitle(p.title);
    var idx = DSA.problems.indexOf(p);
    var prev = DSA.problems[idx - 1], next = DSA.problems[idx + 1];
    var secs = [];
    secs.push({ id: "statement", title: "Problem", html: p.statement });
    if (p.examples && p.examples.length) secs.push({ id: "examples", title: "Examples", html: p.examples.map(function (ex, i) {
      return '<div class="example"><div><b>Example ' + (i + 1) + "</b></div><div><b>Input</b>" + esc(ex.input) + "</div><div><b>Output</b>" + esc(ex.output) + "</div>" + (ex.explain ? "<div><b>Why</b>" + esc(ex.explain) + "</div>" : "") + "</div>";
    }).join("") });
    if (p.constraints && p.constraints.length) secs.push({ id: "constraints", title: "Constraints", html: '<ul class="check-list">' + p.constraints.map(function (c) { return "<li>" + c + "</li>"; }).join("") + "</ul>" });
    if (p.understanding) secs.push({ id: "understanding", title: "Understand the problem", html: p.understanding });
    if (p.brute) secs.push({ id: "brute", title: "Brute force", html: approachHtml(p.brute, "Brute force") });
    if (p.optimal) secs.push({ id: "optimal", title: "Optimal solution", html: approachHtml(p.optimal, "Optimal") });

    var topics = list(p.topics).filter(topic);
    var related = list(p.related).filter(problemById);
    view.innerHTML = '<div class="problem-layout"><article class="lesson">' +
      '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/lab">Problem lab</a><span>/</span><span>' + esc(p.title) + "</span></nav>" +
      '<span class="eyebrow">Problem ' + (idx + 1 < 10 ? "0" : "") + (idx + 1) + "</span><h1>" + esc(p.title) + "</h1>" +
      '<div class="lesson-meta">' + diffChip(p.difficulty) + list(p.ds).map(function (x) { return '<span class="chip">' + esc(x) + "</span>"; }).join("") +
      list(p.patterns).map(function (x) { return '<span class="chip">' + esc(x) + "</span>"; }).join("") + "</div>" +
      secs.map(function (s, i) { return '<section class="lesson-section" id="p-' + s.id + '"><h2><span class="n">0' + (i + 1) + "</span>" + esc(s.title) + '</h2><div class="prose">' + s.html + "</div></section>"; }).join("") +
      '<nav class="lesson-nav" aria-label="Previous and next problem">' +
      (prev ? '<a href="#/lab/' + prev.id + '"><small>← Previous</small>' + esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a class="next" href="#/lab/' + next.id + '"><small>Next →</small>' + esc(next.title) + "</a>" : "<span></span>") + "</nav>" +
      "</article>" +
      '<aside class="lesson-aside" aria-label="Problem details">' +
      '<div class="aside-block"><h3>Your progress</h3><label class="solved-toggle"><input type="checkbox" data-solved="' + p.id + '"' + (P.isSolved(p.id) ? " checked" : "") + "> Mark as solved</label></div>" +
      (topics.length ? '<div class="aside-block"><h3>Topics used</h3><ul class="aside-links">' + topics.map(function (t) { return '<li><a href="#/topic/' + t + '">' + dot(t) + esc(topic(t).title) + "</a></li>"; }).join("") + "</ul></div>" : "") +
      (list(p.alg).length ? '<div class="aside-block"><h3>Algorithm</h3><div class="tag-row">' + list(p.alg).map(function (x) { return '<span class="chip">' + esc(x) + "</span>"; }).join("") + "</div></div>" : "") +
      (related.length ? '<div class="aside-block"><h3>Related problems</h3><ul class="aside-links">' + related.map(function (r) { return '<li><a href="#/lab/' + r + '">' + esc(problemById(r).title) + "</a></li>"; }).join("") + "</ul></div>" : "") +
      '<div class="aside-block"><a class="text-link" href="#/lab">← All problems</a></div></aside></div>';
    var cb = $("[data-solved]", view);
    if (cb) cb.addEventListener("change", function () { P.setSolved(p.id, cb.checked); });
  }

  function approachHtml(a, label) {
    var html = '<div class="approach"><h3>Idea</h3>' + (a.idea ? "<p>" + a.idea + "</p>" : "");
    if (a.steps && a.steps.length) html += "<ol>" + a.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>";
    if (a.code) html += '<details' + (label === "Optimal" ? " open" : "") + '><summary class="btn btn-small">Show / hide Python code</summary>' + h.code(a.code, label + " · Python") + "</details>";
    html += "<h3>Complexity</h3>" + complexityHtml(a.complexity) + "</div>";
    return html;
  }

  /* ---------- Progress ---------- */
  function renderProgress() {
    setTitle("Progress");
    view.innerHTML = P.renderPage();
    P.bindPage(view);
  }

  /* ---------- Reacting to progress changes ---------- */
  P.onChange(function () {
    $$("[data-status-for]").forEach(function (g) {
      var cur = P.get(g.getAttribute("data-status-for"));
      $$("[data-set-status]", g).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-status") === cur)); });
    });
    $$("[data-dot-for]").forEach(function (d) { d.setAttribute("data-status", P.get(d.getAttribute("data-dot-for"))); });
    $$(".node[data-topic]").forEach(function (n) { n.setAttribute("data-status", P.get(n.getAttribute("data-topic"))); });
    $$("[data-status-label]").forEach(function (s) { s.textContent = P.LABELS[P.get(s.getAttribute("data-status-label"))]; });
    $$("[data-seen]").forEach(function (s) {
      var v = s.getAttribute("data-seen");
      s.textContent = P.vizSeen(v) ? (s.tagName === "SPAN" && s.classList.contains("seen") ? "SEEN" : "EXPLORED") : "";
    });
    $$("[data-solved]").forEach(function (c) { c.checked = P.isSolved(c.getAttribute("data-solved")); });
    if (current.name === "map") refreshMap();
    else if (current.name === "lab" && !current.arg) labRows();
    else if (current.name === "progress") renderProgress();
  });

  /* ---------- Global search ---------- */
  var input = document.getElementById("global-search");
  var results = document.getElementById("search-results");
  var activeIdx = -1, hits = [];

  function searchIndex() {
    var items = realIds().map(function (id) {
      var t = topic(id);
      return { kind: "Topic", title: t.title, href: "#/topic/" + id, meta: domainOf(id).title + (lessonFor(id) ? " · lesson" : ""), text: (t.sum + " " + id).toLowerCase() };
    });
    DSA.problems.forEach(function (p) { items.push({ kind: "Problem", title: p.title, href: "#/lab/" + p.id, meta: p.difficulty + " · " + list(p.patterns).join(", "), text: (stripTags(p.statement) + " " + list(p.ds).join(" ") + " " + list(p.patterns).join(" ")).toLowerCase() }); });
    (DSA.vizOrder || []).forEach(function (v) { items.push({ kind: "Visualizer", title: DSA.viz[v].title, href: "#/playground/" + v, meta: "Visual playground", text: (DSA.viz[v].desc || "").toLowerCase() }); });
    return items;
  }
  var INDEX = null;
  function doSearch(q) {
    INDEX = INDEX || searchIndex();
    q = q.trim().toLowerCase();
    if (!q) return [];
    var words = q.split(/\s+/);
    return INDEX.map(function (it) {
      var title = it.title.toLowerCase(), score = 0;
      if (title === q) score = 100; else if (title.indexOf(q) === 0) score = 80; else if (title.indexOf(q) >= 0) score = 60;
      else if (words.every(function (w) { return title.indexOf(w) >= 0; })) score = 45;
      else if (words.every(function (w) { return (title + " " + it.text).indexOf(w) >= 0; })) score = 20;
      if (score && it.kind === "Topic") score += 2;
      return { it: it, score: score };
    }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 12).map(function (x) { return x.it; });
  }
  function renderResults() {
    if (!input.value.trim()) { closeSearch(true); return; }
    hits = doSearch(input.value);
    activeIdx = hits.length ? 0 : -1;
    results.innerHTML = hits.length ? hits.map(function (r, i) {
      return '<a href="' + r.href + '" role="option" id="sr-' + i + '" aria-selected="' + (i === activeIdx) + '"' + (i === activeIdx ? ' class="is-active"' : "") + "><strong>" + esc(r.title) + "</strong><small>" + esc(r.kind + " · " + r.meta) + "</small></a>";
    }).join("") : '<div class="empty">No topics or problems match “' + esc(input.value.trim()) + "”.</div>";
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
    if (activeIdx >= 0) input.setAttribute("aria-activedescendant", "sr-0"); else input.removeAttribute("aria-activedescendant");
  }
  function setActive(i) {
    var links = $$("a", results);
    if (!links.length) return;
    activeIdx = (i + links.length) % links.length;
    links.forEach(function (a, k) { a.classList.toggle("is-active", k === activeIdx); a.setAttribute("aria-selected", String(k === activeIdx)); });
    input.setAttribute("aria-activedescendant", "sr-" + activeIdx);
    links[activeIdx].scrollIntoView({ block: "nearest" });
  }
  function closeSearch(keepValue) {
    if (!results) return;
    results.hidden = true;
    results.innerHTML = "";
    if (input) {
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      if (!keepValue) {
        input.value = "";
        if (current.name === "map" && mapState.q) {
          mapState.q = "";
          applySearchFilter();
        }
      }
    }
  }
  if (input && results) {
    input.addEventListener("input", function () {
      renderResults();
      if (current.name === "map") {
        mapState.q = input.value;
        applySearchFilter();
      }
    });
    input.addEventListener("focus", function () { if (input.value.trim()) renderResults(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (results.hidden) renderResults(); else setActive(activeIdx + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIdx - 1); }
      else if (e.key === "Enter") {
        var a = $$("a", results)[activeIdx];
        if (a) { e.preventDefault(); location.hash = a.getAttribute("href"); closeSearch(); input.blur(); }
      } else if (e.key === "Escape") { closeSearch(); input.blur(); }
    });
    results.addEventListener("click", function (e) { if (e.target.closest("a")) setTimeout(function () { closeSearch(); }, 0); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".search-wrap") && !e.target.closest("#search-results")) closeSearch(true); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
    if (input) { e.preventDefault(); input.focus(); input.select(); }
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menu-button"), mobileNav = document.getElementById("mobile-nav");
  function closeMenu() { if (menuBtn && mobileNav) { mobileNav.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); } }
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      var open = mobileNav.hidden;
      mobileNav.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
      var sr = menuBtn.querySelector(".sr-only"); if (sr) sr.textContent = open ? "Close menu" : "Open menu";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mobileNav.hidden) { closeMenu(); menuBtn.focus(); } });
  }

  /* ---------- Global delegated clicks ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(new Error("copy failed")); } catch (err) { reject(err); }
      document.body.removeChild(ta);
    });
  }
  document.addEventListener("click", function (e) {
    var copy = e.target.closest("[data-copy]");
    if (copy) {
      var block = copy.closest(".code"), codeEl = block && block.querySelector("code[data-raw]");
      var text = codeEl ? codeEl.getAttribute("data-raw") : block ? block.querySelector("pre").textContent : "";
      copyText(text).then(function () { copy.textContent = "Copied"; }, function () { copy.textContent = "Press Ctrl+C"; })
        .then(function () { setTimeout(function () { copy.textContent = "Copy"; }, 1600); });
      return;
    }
    var st = e.target.closest("[data-set-status]");
    if (st) {
      var group = st.closest("[data-status-for]");
      if (group) P.set(group.getAttribute("data-status-for"), st.getAttribute("data-set-status"));
      return;
    }
    var jump = e.target.closest("[data-jump-domain]");
    if (jump) {
      e.preventDefault();
      var did = jump.getAttribute("data-jump-domain");
      if (current.name === "map") jumpToDomain(did);
      else { pendingJump = did; location.hash = "#/"; }
      return;
    }
    var onMap = e.target.closest("[data-select-on-map]");
    if (onMap) { ss("rm:dsa:selected", onMap.getAttribute("data-select-on-map")); }
  });

  window.addEventListener("hashchange", route);
  route();
})();
