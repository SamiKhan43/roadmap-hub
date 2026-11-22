/* Progress: topic statuses, solved problems and explored visualizations.
   Storage keys (all JSON):
     rm:dsa:status   {topicId: "learning"|"understood"|"practiced"}  (missing = not started)
     rm:dsa:t        [topicId, ...]  understood + practiced, mirrored for Roadmap Hub
     rm:dsa:problems [problemId, ...]
     rm:dsa:viz      [vizId, ...]
   No XP, streaks or coins — just honest state. */
(function () {
  "use strict";
  var DSA = (window.DSA = window.DSA || {});
  var esc = DSA.h.esc;

  var KEY_STATUS = "rm:dsa:status";
  var KEY_DONE = "rm:dsa:t";
  var KEY_PROBLEMS = "rm:dsa:problems";
  var KEY_VIZ = "rm:dsa:viz";
  var STATUSES = ["not-started", "learning", "understood", "practiced"];
  var LABELS = { "not-started": "Not started", learning: "Learning", understood: "Understood", practiced: "Practiced" };

  var ok = true;
  var listeners = [];

  (function probe() {
    try {
      var k = "rm:dsa:__probe";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
    } catch (e) { ok = false; }
  })();

  function read(key) {
    var raw;
    try { raw = window.localStorage.getItem(key); } catch (e) { ok = false; return null; }
    if (raw == null) return null;
    try { return JSON.parse(raw); } catch (e) { return null; } /* corrupt value: ignore it */
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { ok = false; return false; }
  }

  function canonical(id) {
    var t = DSA.topics[id];
    return t && t.aliasOf && DSA.topics[t.aliasOf] ? t.aliasOf : id;
  }
  function isDone(st) { return st === "understood" || st === "practiced"; }
  function arrayOfStrings(v) { return Array.isArray(v) ? v.filter(function (x) { return typeof x === "string"; }) : []; }
  function unique(list) { var seen = {}; return list.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); }

  var status = {}, problems = [], viz = [];

  function load() {
    var raw = read(KEY_STATUS);
    status = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      Object.keys(raw).forEach(function (id) {
        var cid = canonical(id);
        if (DSA.topics[cid] && STATUSES.indexOf(raw[id]) > 0) status[cid] = raw[id];
      });
    }
    /* rm:dsa:t may have been written by Roadmap Hub account sync. When it exists it is
       authoritative for "done": add anything it lists, and step back anything it dropped. */
    var doneRaw = read(KEY_DONE);
    var changed = false;
    if (Array.isArray(doneRaw)) {
      var done = {};
      arrayOfStrings(doneRaw).forEach(function (id) { var cid = canonical(id); if (DSA.topics[cid]) done[cid] = 1; });
      Object.keys(done).forEach(function (id) { if (!isDone(status[id])) { status[id] = "understood"; changed = true; } });
      Object.keys(status).forEach(function (id) { if (isDone(status[id]) && !done[id]) { status[id] = "learning"; changed = true; } });
    }
    if (changed) write(KEY_STATUS, status);
    problems = unique(arrayOfStrings(read(KEY_PROBLEMS)));
    viz = unique(arrayOfStrings(read(KEY_VIZ)));
  }

  function doneList() {
    return DSA.order.filter(function (id) { return isDone(status[id]); });
  }
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* listener error */ } }); }

  function sync(prev, next) {
    if (prev.join("|") === next.join("|")) return;
    var api = window.ROADMAP_HUB_PROGRESS;
    if (api && typeof api.syncProgressChanges === "function") {
      try {
        var result = api.syncProgressChanges("dsa", prev, next);
        if (result && typeof result.catch === "function") {
          result.catch(function (e) {
            if (window.console) console.warn("Roadmap Hub progress sync failed", e);
          });
        }
      } catch (e) {
        if (window.console) console.warn("Roadmap Hub progress sync failed", e);
      }
    }
  }

  function get(id) { return status[canonical(id)] || "not-started"; }

  function set(id, st) {
    id = canonical(id);
    if (!DSA.topics[id] || STATUSES.indexOf(st) < 0) return;
    var prev = doneList();
    if (st === "not-started") delete status[id]; else status[id] = st;
    write(KEY_STATUS, status);
    var next = doneList();
    write(KEY_DONE, next);
    sync(prev, next);
    emit();
  }

  function setSolved(pid, solved) {
    var has = problems.indexOf(pid) >= 0;
    if (solved && !has) problems.push(pid);
    if (!solved && has) problems.splice(problems.indexOf(pid), 1);
    write(KEY_PROBLEMS, problems);
    emit();
  }

  function markViz(id) {
    if (viz.indexOf(id) >= 0) return;
    viz.push(id);
    write(KEY_VIZ, viz);
    emit();
  }

  function reset() {
    var prev = doneList();
    status = {}; problems = []; viz = [];
    write(KEY_STATUS, status); write(KEY_DONE, []); write(KEY_PROBLEMS, problems); write(KEY_VIZ, viz);
    sync(prev, []);
    emit();
  }

  /* Real (non-alias) topics, optionally limited to one domain. */
  function topicIds(domainId) {
    return DSA.order.filter(function (id) {
      var t = DSA.topics[id];
      return !t.aliasOf && (!domainId || t.domain === domainId);
    });
  }
  function counts(ids) {
    var c = { total: ids.length, "not-started": 0, learning: 0, understood: 0, practiced: 0, done: 0 };
    ids.forEach(function (id) { var s = get(id); c[s]++; if (isDone(s)) c.done++; });
    return c;
  }

  function warningHtml() {
    return ok ? "" : '<p class="storage-warning" role="status">This browser is blocking local storage (private mode or a strict privacy setting), so progress cannot be saved. Everything still works, but changes will be lost when you close the page.</p>';
  }

  function pickerHtml(id) {
    var cur = get(id);
    return '<div class="status-picker" role="group" aria-label="Learning status" data-status-for="' + esc(id) + '">' +
      STATUSES.map(function (s) {
        return '<button type="button" data-set-status="' + s + '" aria-pressed="' + (s === cur) + '"><span class="status-dot" data-status="' + s + '"></span>' + LABELS[s] + "</button>";
      }).join("") + "</div>";
  }

  function meterHtml(c) {
    function seg(cls, n) { return n ? '<i class="' + cls + '" style="width:' + (100 * n / c.total).toFixed(2) + '%"></i>' : ""; }
    return '<div class="meter" role="img" aria-label="' + c.practiced + ' practiced, ' + c.understood + ' understood, ' + c.learning + ' learning, of ' + c.total + '">' +
      seg("m-practiced", c.practiced) + seg("m-understood", c.understood) + seg("m-learning", c.learning) + "</div>";
  }

  function renderPage() {
    var all = counts(topicIds());
    var pTotal = DSA.problems.length;
    var solved = problems.filter(function (p) { return DSA.problems.some(function (x) { return x.id === p; }); }).length;
    var vTotal = DSA.vizOrder ? DSA.vizOrder.length : 0;
    var vSeen = viz.filter(function (v) { return DSA.viz && DSA.viz[v]; }).length;
    function topicLinks(st, empty) {
      var ids = topicIds().filter(function (id) { return get(id) === st; });
      return ids.length ? '<ul class="progress-topic-list">' + ids.map(function (id) {
        return '<li><a href="#/topic/' + esc(id) + '">' + esc(DSA.topics[id].title) + '</a><span>' + esc(DSA.topics[id].domainTitle) + "</span></li>";
      }).join("") + "</ul>" : '<p class="progress-empty">' + empty + "</p>";
    }
    var html = warningHtml() +
      '<div class="section-head"><div><span class="eyebrow">Your progress</span><h1>Progress</h1>' +
      "<p>Statuses you set on topics, problems you marked as solved and visualizations you have used. Saved in this browser; synced to your Roadmap Hub account when you are signed in.</p></div></div>" +
      '<div class="stat-grid">' +
      '<div class="progress-overall"><span class="metric-label">Curriculum complete</span><strong>' + all.done + " / " + all.total + '</strong><span class="metric-detail">Topics understood or practiced</span><span class="overall-track" role="progressbar" aria-label="Curriculum topics complete" aria-valuemin="0" aria-valuemax="' + all.total + '" aria-valuenow="' + all.done + '"><i style="width:' + (all.total ? (100 * all.done / all.total) : 0) + '%"></i></span></div>' +
      "<div><span class=\"metric-label\">In progress</span><strong>" + all.learning + '</strong><span class="metric-detail">Topics marked as learning</span></div>' +
      "<div><span class=\"metric-label\">Practice</span><strong>" + solved + " / " + pTotal + '</strong><span class="metric-detail">Problems marked solved</span></div>' +
      "<div><span class=\"metric-label\">Explored</span><strong>" + vSeen + " / " + vTotal + '</strong><span class="metric-detail">Visualizations used</span></div>' +
      "</div>" +
      '<div class="progress-focus"><section><span class="eyebrow">Current work</span><h2>Topics in progress</h2>' + topicLinks("learning", "No topics are currently marked as learning.") + '</section>' +
      '<section><span class="eyebrow">Next step</span><h2>Ready to practice</h2>' + topicLinks("understood", "No topics are waiting for practice yet.") + "</section></div>" +
      '<div class="map-legend progress-legend"><span><span class="status-dot" data-status="practiced"></span>Practiced</span><span><span class="status-dot" data-status="understood"></span>Understood</span><span><span class="status-dot" data-status="learning"></span>Learning</span></div>' +
      '<div class="progress-domains">' +
      DSA.domains.map(function (d) {
        var c = counts(topicIds(d.id));
        return '<div class="pd"><a class="text-link" href="#/" data-jump-domain="' + d.id + '"><span class="mono">' + d.num + "</span> " + esc(d.title) + "</a>" +
          meterHtml(c) + "<small>" + c.done + " / " + c.total + " done</small></div>";
      }).join("") + "</div>" +
      '<div class="danger-zone"><p>Reset clears every topic status, solved problem and explored visualization stored for this section. If you are signed in, finished topics are removed from your account too.</p>' +
      '<button type="button" class="btn" data-reset-progress>Reset DSA progress</button></div>';
    return html;
  }

  function bindPage(root) {
    var btn = root.querySelector("[data-reset-progress]");
    if (btn) btn.addEventListener("click", function () {
      if (window.confirm("Reset all Data Structures & Algorithms progress? This cannot be undone.")) reset();
    });
  }

  load();

  /* Another tab, or Roadmap Hub sync, may change storage. */
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key.indexOf("rm:dsa:") === 0) { load(); emit(); }
  });
  window.addEventListener("focus", function () {
    var before = JSON.stringify([status, problems, viz]);
    load();
    if (JSON.stringify([status, problems, viz]) !== before) emit();
  });

  DSA.progress = {
    STATUSES: STATUSES, LABELS: LABELS,
    get ok() { return ok; },
    get: get, set: set, isDone: isDone, canonical: canonical,
    doneList: doneList, counts: counts, topicIds: topicIds,
    isSolved: function (pid) { return problems.indexOf(pid) >= 0; },
    setSolved: setSolved, solvedList: function () { return problems.slice(); },
    vizSeen: function (id) { return viz.indexOf(id) >= 0; }, markViz: markViz,
    reset: reset, reload: function () { load(); emit(); },
    onChange: function (fn) { listeners.push(fn); },
    warningHtml: warningHtml, pickerHtml: pickerHtml, meterHtml: meterHtml,
    renderPage: renderPage, bindPage: bindPage
  };
})();
