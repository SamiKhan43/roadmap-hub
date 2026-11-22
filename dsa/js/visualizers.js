/* Visualizers. Every visualizer is built on the same step player:
   an operation produces a list of frames {s: state snapshot, log: html}; the player shows them
   one at a time with back / step / play / reset and a speed control.
   Registry: DSA.viz[id] = {id, title, topics, desc, mount(el, preset)}; DSA.vizOrder lists ids. */
(function () {
  "use strict";
  var DSA = (window.DSA = window.DSA || {});
  var esc = DSA.h.esc;
  DSA.viz = {};
  DSA.vizOrder = [];

  function reg(def) { DSA.viz[def.id] = def; DSA.vizOrder.push(def.id); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function num(v) { var n = Number(String(v).trim()); return String(v).trim() !== "" && isFinite(n) && Math.floor(n) === n ? n : null; }
  function parseList(text) {
    var parts = String(text).split(/[\s,]+/).filter(Boolean);
    var out = [];
    for (var i = 0; i < parts.length; i++) { var n = num(parts[i]); if (n === null) return null; out.push(n); }
    return out;
  }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  var SPEEDS = [1600, 1100, 750, 450, 220];

  /* ---------- Step player ---------- */
  function player(el, cfg) {
    var root = document.createElement("div");
    root.className = "viz";
    root.setAttribute("data-viz-id", cfg.id);
    var topics = (DSA.viz[cfg.id] && DSA.viz[cfg.id].topics) || [];
    root.innerHTML =
      '<div class="viz-head"><strong>' + esc(cfg.title) + '</strong><span class="tag-row">' +
      topics.slice(0, 3).map(function (t) { return DSA.topics[t] ? '<a class="chip" href="#/topic/' + t + '">' + esc(DSA.topics[t].title) + "</a>" : ""; }).join("") +
      "</span></div>" +
      '<div class="viz-controls">' + cfg.controls + '<span class="viz-error" role="alert"></span></div>' +
      '<div class="viz-stage' + (cfg.stageClass ? " " + cfg.stageClass : "") + '"></div>' +
      '<div class="viz-log" aria-live="polite"><span class="step">Ready</span><span class="msg"></span></div>' +
      '<div class="viz-player">' +
      '<button type="button" class="btn btn-small" data-p="back" aria-label="Previous step">← Back</button>' +
      '<button type="button" class="btn btn-small" data-p="step" aria-label="Next step">Step →</button>' +
      '<button type="button" class="btn btn-small btn-primary" data-p="play">Play</button>' +
      '<button type="button" class="btn btn-small" data-p="reset" aria-label="Go to the first step">Reset</button>' +
      '<label class="speed">Speed <input type="range" min="1" max="5" value="3" data-p="speed" aria-label="Animation speed"></label>' +
      "</div>";
    el.innerHTML = "";
    el.appendChild(root);

    var stage = root.querySelector(".viz-stage");
    var stepEl = root.querySelector(".viz-log .step");
    var msgEl = root.querySelector(".viz-log .msg");
    var errEl = root.querySelector(".viz-error");
    var bBack = root.querySelector('[data-p="back"]'), bStep = root.querySelector('[data-p="step"]');
    var bPlay = root.querySelector('[data-p="play"]'), bReset = root.querySelector('[data-p="reset"]');
    var speedIn = root.querySelector('[data-p="speed"]');
    var frames = [], i = 0, timer = null, used = false;

    function show(n) {
      i = Math.max(0, Math.min(frames.length - 1, n));
      var f = frames[i];
      stage.innerHTML = cfg.render(f.s);
      stepEl.textContent = frames.length > 1 ? "Step " + (i + 1) + "/" + frames.length : "Ready";
      msgEl.innerHTML = f.log || "";
      bBack.disabled = i === 0;
      bStep.disabled = i >= frames.length - 1;
      bReset.disabled = frames.length < 2;
      bPlay.disabled = frames.length < 2;
    }
    function stop() { if (timer) { clearTimeout(timer); timer = null; } bPlay.textContent = "Play"; }
    function tick() {
      if (!document.body.contains(root)) { stop(); return; }
      if (i >= frames.length - 1) { stop(); return; }
      show(i + 1);
      timer = setTimeout(tick, SPEEDS[speedIn.value - 1]);
    }
    function play() {
      if (frames.length < 2) return;
      if (i >= frames.length - 1) show(0);
      bPlay.textContent = "Pause";
      timer = setTimeout(tick, Math.min(500, SPEEDS[speedIn.value - 1]));
    }
    function explored() {
      if (used) return;
      used = true;
      if (DSA.progress) DSA.progress.markViz(cfg.id);
    }
    bBack.addEventListener("click", function () { stop(); explored(); show(i - 1); });
    bStep.addEventListener("click", function () { stop(); explored(); show(i + 1); });
    bReset.addEventListener("click", function () { stop(); show(0); });
    bPlay.addEventListener("click", function () { explored(); if (timer) stop(); else play(); });

    var api = {
      root: root,
      controls: root.querySelector(".viz-controls"),
      val: function (name) { var f = root.querySelector('[name="' + name + '"]'); return f ? f.value : ""; },
      error: function (msg) { errEl.textContent = msg || ""; return false; },
      /* load(frames, autoplay): replace the current animation. */
      load: function (fr, autoplay) {
        stop();
        errEl.textContent = "";
        frames = fr && fr.length ? fr : [{ s: {}, log: "" }];
        show(0);
        if (autoplay !== false && frames.length > 1) { explored(); play(); }
      },
      /* still(state, log): show a single frame (no animation). */
      still: function (s, log) { stop(); frames = [{ s: s, log: log }]; show(0); },
      touch: explored
    };
    root.querySelector(".viz-controls").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT") {
        var btn = root.querySelector(".viz-controls [data-default]");
        if (btn) { e.preventDefault(); btn.click(); }
      }
    });
    cfg.bind(api);
    return api;
  }

  function on(api, action, fn) {
    api.controls.querySelectorAll('[data-a="' + action + '"]').forEach(function (b) { b.addEventListener("click", fn); });
  }
  function btn(action, label, primary, isDefault) {
    return '<button type="button" class="btn btn-small' + (primary ? " btn-primary" : "") + '" data-a="' + action + '"' + (isDefault ? " data-default" : "") + ">" + label + "</button>";
  }
  function field(name, label, value, wide, type) {
    return '<label>' + label + ' <input class="input' + (wide ? " wide" : "") + '" name="' + name + '" value="' + esc(value) + '"' + (type ? ' type="' + type + '"' : "") + ' autocomplete="off"></label>';
  }
  function select(name, label, options, selected) {
    return '<label>' + label + ' <select class="select" name="' + name + '">' + options.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === selected ? " selected" : "") + ">" + esc(o[1]) + "</option>";
    }).join("") + "</select></label>";
  }
  var SEP = '<span class="sep" aria-hidden="true"></span>';
  function panels(list) {
    return '<div class="side-panels">' + list.map(function (p) { return '<div class="box"><b>' + esc(p[0]) + "</b>" + p[1] + "</div>"; }).join("") + "</div>";
  }

  /* ---------- 1. Array ---------- */
  reg({
    id: "array", title: "Array: memory and operations", topics: ["arrays", "dynamic-arrays", "linear-search"],
    desc: "A fixed block of 8 slots starting at address 1000, 4 bytes per integer. Read, update, insert, delete and search, and watch elements shift.",
    mount: function (el) {
      var CAP = 8, BASE = 1000, SIZE = 4, START = [12, 7, 31, 5, 18];
      var data = START.slice();
      function addr(i) { return BASE + i * SIZE; }
      function S(arr, cls, tags) { return { arr: arr.slice(), cls: cls || {}, tags: tags || {} }; }
      function render(s) {
        var h = '<div class="v-row">';
        for (var i = 0; i < CAP; i++) {
          var has = i < s.arr.length && s.arr[i] !== null && s.arr[i] !== undefined;
          h += '<div class="v-cell' + (has ? "" : " is-empty") + (s.cls[i] ? " " + s.cls[i] : "") + '"><span class="tag">' + (s.tags[i] || "") + '</span><span class="v">' + (has ? s.arr[i] : "·") + '</span><span class="i">[' + i + ']</span><span class="a">' + addr(i) + "</span></div>";
        }
        h += "</div>";
        return h + panels([["length", String(s.arr.filter(function (v) { return v !== null; }).length)], ["capacity", CAP + " slots"], ["address of [i]", "1000 + i × 4"]]);
      }
      var api = player(el, {
        id: "array", title: "Array: memory and operations",
        controls: field("idx", "Index", "2") + field("val", "Value", "42") + SEP +
          btn("read", "Read [i]", true, true) + btn("update", "Update [i]") + btn("insert", "Insert at i") + btn("delete", "Delete [i]") + btn("search", "Search value") + SEP + btn("reset", "Reset data"),
        render: render,
        bind: function (api) {
          function idx(maxInclusive) {
            var k = num(api.val("idx"));
            if (k === null || k < 0 || k > maxInclusive) { api.error("Index must be a whole number from 0 to " + maxInclusive + "."); return null; }
            return k;
          }
          function value() {
            var v = num(api.val("val"));
            if (v === null || Math.abs(v) > 999) { api.error("Value must be a whole number between -999 and 999."); return null; }
            return v;
          }
          on(api, "read", function () {
            if (!data.length) return api.error("The array is empty.");
            var k = idx(data.length - 1); if (k === null) return;
            api.load([
              { s: S(data, {}, {}), log: "Read <code>arr[" + k + "]</code>. The computer does not walk the array; it computes the address directly." },
              { s: S(data, (function () { var c = {}; c[k] = "is-active"; return c; })(), (function () { var t = {}; t[k] = "read"; return t; })()), log: "address = 1000 + " + k + " × 4 = <b>" + addr(k) + "</b>. One multiplication, one addition, one memory read → value <b>" + data[k] + "</b>. Same cost for index 0 or index 1,000,000: <b>O(1)</b>." }
            ]);
          });
          on(api, "update", function () {
            if (!data.length) return api.error("The array is empty.");
            var k = idx(data.length - 1); if (k === null) return;
            var v = value(); if (v === null) return;
            var old = data[k];
            var before = S(data, {}, {});
            data[k] = v;
            var c = {}; c[k] = "is-new"; var t = {}; t[k] = "write";
            api.load([
              { s: before, log: "Update <code>arr[" + k + "] = " + v + "</code>." },
              { s: S(data, c, t), log: "Jump to address " + addr(k) + " and overwrite " + old + " with " + v + ". Nothing else moves: <b>O(1)</b>." }
            ]);
          });
          on(api, "insert", function () {
            if (data.length >= CAP) return api.error("All 8 slots are used. A fixed array cannot grow; a dynamic array would allocate a bigger block and copy everything (see Dynamic Arrays).");
            var k = idx(data.length); if (k === null) return;
            var v = value(); if (v === null) return;
            var n = data.length, work = data.slice(), fr = [];
            var c0 = {}; for (var a = k; a < n; a++) c0[a] = "is-compare";
            fr.push({ s: S(work, c0, {}), log: "Insert " + v + " at index " + k + ". Arrays are contiguous, so there is no gap to use: the " + (n - k) + " element" + (n - k === 1 ? "" : "s") + " from index " + k + " to " + (n - 1) + " must each move one slot right first." + (n === k ? " Here index " + k + " is the end, so nothing moves." : "") });
            for (var j = n - 1; j >= k; j--) {
              work[j + 1] = work[j];
              var c = {}; c[j] = "is-compare"; c[j + 1] = "is-active";
              var t = {}; t[j + 1] = "←copy";
              fr.push({ s: S(work, c, t), log: "Copy arr[" + j + "] = " + work[j] + " from address " + addr(j) + " to " + addr(j + 1) + ". We go right-to-left so nothing is overwritten before it is copied." });
            }
            work[k] = v;
            var cN = {}; cN[k] = "is-new"; var tN = {}; tN[k] = "new";
            fr.push({ s: S(work, cN, tN), log: "Write " + v + " into index " + k + " (address " + addr(k) + "). Elements moved: <b>" + (n - k) + "</b>. Worst case (insert at index 0) moves all n elements: <b>O(n)</b>. Insert at the end moves none: <b>O(1)</b>." });
            data = work;
            api.load(fr);
          });
          on(api, "delete", function () {
            if (!data.length) return api.error("The array is empty.");
            var k = idx(data.length - 1); if (k === null) return;
            var n = data.length, work = data.slice(), fr = [], removed = work[k];
            var c0 = {}; c0[k] = "is-out"; var t0 = {}; t0[k] = "delete";
            fr.push({ s: S(work, c0, t0), log: "Delete arr[" + k + "] = " + removed + ". Leaving a hole would break the rule that index i lives at 1000 + i × 4, so everything after it shifts left." });
            for (var j = k; j < n - 1; j++) {
              work[j] = work[j + 1];
              var c = {}; c[j] = "is-active"; c[j + 1] = "is-compare";
              var t = {}; t[j] = "copy←";
              fr.push({ s: S(work, c, t), log: "Copy arr[" + (j + 1) + "] = " + work[j] + " into index " + j + "." });
            }
            work.pop();
            fr.push({ s: S(work, {}, {}), log: "Shrink the length to " + (n - 1) + ". Elements moved: <b>" + (n - 1 - k) + "</b>. Deleting the first element moves n − 1 elements: <b>O(n)</b>; deleting the last moves none: <b>O(1)</b>." });
            data = work;
            api.load(fr);
          });
          on(api, "search", function () {
            var v = value(); if (v === null) return;
            var fr = [{ s: S(data, {}, {}), log: "Search for " + v + ". The array is not sorted, so the only safe method is to check each element in turn (linear search)." }];
            for (var j = 0; j < data.length; j++) {
              var c = {}; for (var a = 0; a < j; a++) c[a] = "is-out"; c[j] = data[j] === v ? "is-active" : "is-compare";
              var t = {}; t[j] = data[j] === v ? "found" : "≠";
              fr.push({ s: S(data, c, t), log: data[j] === v ? "arr[" + j + "] = " + v + ". Found after <b>" + (j + 1) + "</b> comparison" + (j ? "s" : "") + "." : "Compare arr[" + j + "] = " + data[j] + " with " + v + ": not equal, move on." });
              if (data[j] === v) { api.load(fr); return; }
            }
            fr.push({ s: S(data, {}, {}), log: v + " is not in the array. We had to check all <b>" + data.length + "</b> elements — the worst case, <b>O(n)</b>." });
            api.load(fr);
          });
          on(api, "reset", function () { data = START.slice(); api.still(S(data), "Data reset to [" + data.join(", ") + "]."); });
          api.still(S(data), "Each slot has an index (green) and a memory address (grey). Pick an operation.");
        }
      });
      return api;
    }
  });

  /* ---------- 2. Singly linked list ---------- */
  reg({
    id: "linked-list", title: "Singly linked list", topics: ["singly-linked-lists", "references-and-values"],
    desc: "Nodes scattered in memory, each holding a value and the address of the next node.",
    mount: function (el) {
      var MAX = 8, seed = 7;
      function newAddr() { seed = (seed * 37 + 11) % 251; return "0x" + (256 + seed * 13).toString(16).toUpperCase(); }
      function mk(v) { return { v: v, a: newAddr() }; }
      var START = [4, 9, 15, 23];
      var list = START.map(mk);
      function S(nodes, opt) { opt = opt || {}; return { nodes: clone(nodes), cls: opt.cls || {}, lab: opt.lab || {}, pending: opt.pending || null }; }
      function nodeHtml(n, cls, label, nextAddr) {
        return '<div class="ll-label"><small>' + (label || "") + '</small><div class="ll-node' + (cls ? " " + cls : "") + '"><span class="d">' + esc(n.v) + '</span><span class="p">' + (nextAddr || "None") + '</span></div><small style="color:var(--quiet)">@' + n.a + "</small></div>";
      }
      function render(s) {
        var h = "";
        if (s.pending) {
          h += '<div class="ll-row" style="margin-bottom:1rem">' + nodeHtml(s.pending.node, "is-new", "new node", s.pending.next) + "</div>";
        }
        h += '<div class="ll-row"><div class="ll-label"><small>head</small><div class="ll-null" style="border-style:solid">' + (s.nodes[0] ? s.nodes[0].a : "None") + "</div><small></small></div>";
        s.nodes.forEach(function (n, i) {
          h += '<span class="ll-arrow">→</span>' + nodeHtml(n, s.cls[i], s.lab[i], s.nodes[i + 1] ? s.nodes[i + 1].a : null);
        });
        h += '<span class="ll-arrow">→</span><span class="ll-null">None</span></div>';
        return h + panels([["length", String(s.nodes.length)], ["node", "value | next address"], ["access list[i]", "walk i links: O(n)"]]);
      }
      function c1(i, v) { var o = {}; if (i >= 0) o[i] = v; return o; }
      return player(el, {
        id: "linked-list", title: "Singly linked list",
        controls: field("val", "Value", "7") + field("idx", "Index", "2") + SEP +
          btn("head", "Insert at head", true, true) + btn("at", "Insert at index") + btn("append", "Append") + btn("del", "Delete value") + btn("find", "Search") + SEP + btn("reset", "Reset"),
        render: render,
        bind: function (api) {
          function value() { var v = num(api.val("val")); if (v === null || Math.abs(v) > 999) { api.error("Value must be a whole number between -999 and 999."); return null; } return v; }
          function full() { if (list.length >= MAX) { api.error("This demo holds at most " + MAX + " nodes. Delete one first."); return true; } return false; }
          function insertAt(k, v) {
            var node = mk(v), fr = [];
            fr.push({ s: S(list, { pending: { node: node, next: null } }), log: "Create a new node with value " + v + ". It gets whatever free memory is available — here address " + node.a + ". Its next is None for now." });
            if (k === 0) {
              fr.push({ s: S(list, { pending: { node: node, next: list[0] ? list[0].a : null } }), log: "new.next = head. The new node now points at the old first node" + (list[0] ? " (" + list[0].a + ")" : "") + "." });
              list.unshift(node);
              fr.push({ s: S(list, { cls: c1(0, "is-new"), lab: c1(0, "head") }), log: "head = new. Two pointer assignments, no shifting: insert at head is <b>O(1)</b>." });
              return fr;
            }
            for (var j = 0; j < k; j++) {
              fr.push({ s: S(list, { cls: c1(j, "is-active"), lab: c1(j, "cur"), pending: { node: node, next: null } }), log: j === 0 ? "Start at head. We need the node just before position " + k + " (index " + (k - 1) + ")." : "cur = cur.next → index " + j + "." });
            }
            var prev = list[k - 1], nxt = list[k];
            fr.push({ s: S(list, { cls: c1(k - 1, "is-active"), lab: c1(k - 1, "cur"), pending: { node: node, next: nxt ? nxt.a : null } }), log: "new.next = cur.next" + (nxt ? " (" + nxt.a + ")" : " (None)") + ". Do this first, or we would lose the rest of the list." });
            list.splice(k, 0, node);
            var cls = c1(k, "is-new"); cls[k - 1] = "is-active";
            fr.push({ s: S(list, { cls: cls, lab: c1(k - 1, "cur") }), log: "cur.next = new (" + node.a + "). The link itself is O(1); finding the spot took " + (k - 1) + " step" + (k - 1 === 1 ? "" : "s") + " of walking, so insert at index i is <b>O(i)</b>, O(n) worst case. " + prev.v + " → " + v + (nxt ? " → " + nxt.v : "") + "." });
            return fr;
          }
          on(api, "head", function () { if (full()) return; var v = value(); if (v === null) return; api.load(insertAt(0, v)); });
          on(api, "at", function () {
            if (full()) return; var v = value(); if (v === null) return;
            var k = num(api.val("idx"));
            if (k === null || k < 0 || k > list.length) return api.error("Index must be from 0 to " + list.length + ".");
            api.load(insertAt(k, v));
          });
          on(api, "append", function () { if (full()) return; var v = value(); if (v === null) return; api.load(insertAt(list.length, v)); });
          on(api, "find", function () {
            var v = value(); if (v === null) return;
            var fr = [{ s: S(list), log: "Search for " + v + ". There are no indices to jump to: we can only follow next pointers from head." }];
            for (var j = 0; j < list.length; j++) {
              var hit = list[j].v === v;
              fr.push({ s: S(list, { cls: c1(j, hit ? "is-new" : "is-active"), lab: c1(j, "cur") }), log: hit ? "cur.value = " + v + ". Found at position " + j + " after " + (j + 1) + " step" + (j ? "s" : "") + "." : "cur.value = " + list[j].v + " ≠ " + v + ". cur = cur.next." });
              if (hit) return api.load(fr);
            }
            fr.push({ s: S(list), log: "cur is None: reached the end. " + v + " is not in the list. <b>O(n)</b>." });
            api.load(fr);
          });
          on(api, "del", function () {
            var v = value(); if (v === null) return;
            if (!list.length) return api.error("The list is empty.");
            var fr = [{ s: S(list), log: "Delete the first node holding " + v + ". We track two pointers: prev and cur." }];
            for (var j = 0; j < list.length; j++) {
              var lab = c1(j, "cur"); if (j > 0) lab[j - 1] = "prev";
              if (list[j].v === v) {
                fr.push({ s: S(list, { cls: c1(j, "is-remove"), lab: lab }), log: "Found " + v + " at position " + j + "." });
                var after = list[j + 1];
                list.splice(j, 1);
                fr.push({ s: S(list, { cls: j > 0 ? c1(j - 1, "is-active") : {}, lab: j > 0 ? c1(j - 1, "prev") : c1(0, "head") }),
                  log: (j === 0 ? "head = head.next" : "prev.next = cur.next") + (after ? " (" + after.a + ")" : " (None)") + ". Nothing points at the removed node any more, so Python's garbage collector will free it. No shifting: the unlink is O(1), the search was O(n)." });
                return api.load(fr);
              }
              fr.push({ s: S(list, { cls: c1(j, "is-active"), lab: lab }), log: list[j].v + " ≠ " + v + ". Move prev and cur one node forward." });
            }
            fr.push({ s: S(list), log: v + " was not found; the list is unchanged." });
            api.load(fr);
          });
          on(api, "reset", function () { seed = 7; list = START.map(mk); api.still(S(list), "Reset."); });
          api.still(S(list), "Each node stores a value and the address of the next node. Addresses are not consecutive — nodes live wherever memory was free.");
        }
      });
    }
  });

  /* ---------- 3. Stack ---------- */
  reg({
    id: "stack", title: "Stack (LIFO)", topics: ["stacks", "call-stack"],
    desc: "Push and pop at the top only. The last item in is the first out.",
    mount: function (el) {
      var CAP = 7, data = [3, 8];
      function S(arr, cls, note) { return { arr: arr.slice(), cls: cls || {}, note: note || "" }; }
      function render(s) {
        var h = '<div class="stack-box" aria-label="Stack, bottom to top">';
        s.arr.forEach(function (v, i) {
          h += '<div class="stack-item' + (s.cls[i] ? " " + s.cls[i] : "") + '">' + esc(v) + (i === s.arr.length - 1 ? ' <small style="color:var(--quiet)">← top</small>' : "") + "</div>";
        });
        if (!s.arr.length) h += '<div class="stack-item" style="border-style:dashed;color:var(--quiet)">empty</div>';
        h += "</div>";
        return h + panels([["size", String(s.arr.length)], ["top", s.arr.length ? String(s.arr[s.arr.length - 1]) : "—"], ["Python", "stack.append(x)<br>stack.pop()<br>stack[-1]"]]);
      }
      return player(el, {
        id: "stack", title: "Stack (LIFO)",
        controls: field("val", "Value", "5") + SEP + btn("push", "Push", true, true) + btn("pop", "Pop") + btn("peek", "Peek") + SEP + btn("clear", "Clear"),
        render: render,
        bind: function (api) {
          on(api, "push", function () {
            var v = num(api.val("val")); if (v === null || Math.abs(v) > 999) return api.error("Value must be a whole number between -999 and 999.");
            if (data.length >= CAP) return api.error("Stack overflow: this demo stack holds " + CAP + " items. Pop first.");
            var before = S(data); data.push(v);
            var c = {}; c[data.length - 1] = "is-active";
            api.load([{ s: before, log: "push(" + v + "): the new item goes on top." }, { s: S(data, c), log: v + " is the new top. Size " + (data.length - 1) + " → " + data.length + ". Only the top changes, so push is <b>O(1)</b>." }]);
            api.controls.querySelector('[name="val"]').value = String(randInt(1, 99));
          });
          on(api, "pop", function () {
            if (!data.length) return api.load([{ s: S(data), log: "pop() on an empty stack: <b>stack underflow</b>. In Python, <code>[].pop()</code> raises IndexError — check <code>if stack:</code> first." }]);
            var c = {}; c[data.length - 1] = "is-remove";
            var fr = [{ s: S(data, c), log: "pop(): take the top item, " + data[data.length - 1] + "." }];
            var v = data.pop();
            var c2 = {}; if (data.length) c2[data.length - 1] = "is-active";
            fr.push({ s: S(data, c2), log: "Returned " + v + ". " + (data.length ? data[data.length - 1] + " is the top again." : "The stack is now empty.") + " <b>O(1)</b>: nothing below the top is touched." });
            api.load(fr);
          });
          on(api, "peek", function () {
            if (!data.length) return api.load([{ s: S(data), log: "peek() on an empty stack: there is nothing to look at." }]);
            var c = {}; c[data.length - 1] = "is-active";
            api.load([{ s: S(data), log: "peek(): look at the top without removing it." }, { s: S(data, c), log: "Top is " + data[data.length - 1] + ". The stack is unchanged. <b>O(1)</b>." }]);
          });
          on(api, "clear", function () { data = []; api.still(S(data), "Cleared."); });
          api.still(S(data), "Items enter and leave from the top only — like a stack of plates.");
        }
      });
    }
  });

  /* ---------- 4. Queue ---------- */
  reg({
    id: "queue", title: "Queue (FIFO)", topics: ["queues", "graph-bfs"],
    desc: "Enqueue at the rear, dequeue at the front. The first item in is the first out.",
    mount: function (el) {
      var CAP = 8, data = [6, 2, 9];
      function S(arr, cls) { return { arr: arr.slice(), cls: cls || {} }; }
      function render(s) {
        var h = '<div class="queue-box" aria-label="Queue, front on the left">';
        if (!s.arr.length) h += '<div class="v-cell is-empty"><span class="tag"></span><span class="v">empty</span></div>';
        s.arr.forEach(function (v, i) {
          var tag = s.arr.length === 1 ? "front·rear" : i === 0 ? "front" : i === s.arr.length - 1 ? "rear" : "";
          h += '<div class="v-cell' + (s.cls[i] ? " " + s.cls[i] : "") + '"><span class="tag">' + tag + '</span><span class="v">' + esc(v) + "</span></div>";
        });
        h += "</div>";
        return h + panels([["size", String(s.arr.length)], ["front", s.arr.length ? String(s.arr[0]) : "—"], ["rear", s.arr.length ? String(s.arr[s.arr.length - 1]) : "—"], ["Python", "from collections import deque<br>q.append(x) · q.popleft()"]]);
      }
      return player(el, {
        id: "queue", title: "Queue (FIFO)",
        controls: field("val", "Value", "4") + SEP + btn("enq", "Enqueue", true, true) + btn("deq", "Dequeue") + btn("peek", "Peek front") + SEP + btn("clear", "Clear"),
        render: render,
        bind: function (api) {
          on(api, "enq", function () {
            var v = num(api.val("val")); if (v === null || Math.abs(v) > 999) return api.error("Value must be a whole number between -999 and 999.");
            if (data.length >= CAP) return api.error("This demo queue holds " + CAP + " items. Dequeue first.");
            var before = S(data); data.push(v);
            var c = {}; c[data.length - 1] = "is-new";
            api.load([{ s: before, log: "enqueue(" + v + "): join at the rear, like the back of a line." }, { s: S(data, c), log: v + " is the new rear. <b>O(1)</b>." }]);
            api.controls.querySelector('[name="val"]').value = String(randInt(1, 99));
          });
          on(api, "deq", function () {
            if (!data.length) return api.load([{ s: S(data), log: "dequeue() on an empty queue: nothing to remove. <code>deque().popleft()</code> raises IndexError." }]);
            var fr = [{ s: S(data, { 0: "is-compare" }), log: "dequeue(): the front item, " + data[0] + ", has waited longest, so it leaves first." }];
            var v = data.shift();
            fr.push({ s: S(data, data.length ? { 0: "is-active" } : {}), log: "Returned " + v + "." + (data.length ? " " + data[0] + " is the new front." : " The queue is empty.") + " With a deque this is <b>O(1)</b>. With a plain list, <code>list.pop(0)</code> shifts every other element left: O(n)." });
            api.load(fr);
          });
          on(api, "peek", function () {
            if (!data.length) return api.load([{ s: S(data), log: "The queue is empty." }]);
            api.load([{ s: S(data), log: "peek(): look at the front." }, { s: S(data, { 0: "is-active" }), log: "Front is " + data[0] + "; the queue is unchanged." }]);
          });
          on(api, "clear", function () { data = []; api.still(S(data), "Cleared."); });
          api.still(S(data), "Items join at the rear and leave from the front.");
        }
      });
    }
  });

  /* ---------- 5. Hash table ---------- */
  reg({
    id: "hash-table", title: "Hash table with chaining", topics: ["hash-tables", "hash-functions", "hash-collisions", "chaining"],
    desc: "Keys are turned into bucket numbers by a hash function. Keys that land in the same bucket share a chain.",
    mount: function (el) {
      var M = 7;
      var buckets;
      function hashParts(k) { var codes = []; for (var i = 0; i < k.length; i++) codes.push(k.charCodeAt(i)); var sum = codes.reduce(function (a, b) { return a + b; }, 0); return { codes: codes, sum: sum, idx: sum % M }; }
      function init() { buckets = []; for (var i = 0; i < M; i++) buckets.push([]); [["cat", 3], ["dog", 5], ["ant", 2], ["owl", 8]].forEach(function (p) { buckets[hashParts(p[0]).idx].push({ k: p[0], v: p[1] }); }); }
      init();
      function count() { return buckets.reduce(function (a, b) { return a + b.length; }, 0); }
      function S(opt) { opt = opt || {}; return { b: clone(buckets), calc: opt.calc || "", ab: opt.ab == null ? -1 : opt.ab, ent: opt.ent || {} }; }
      function render(s) {
        var h = '<div class="hash-calc">' + (s.calc || "hash(key) = (sum of character codes) mod " + M) + "</div><div class=\"hash-buckets\">";
        s.b.forEach(function (chain, i) {
          h += '<div class="bucket' + (s.ab === i ? " is-active" : "") + '"><span class="idx">' + i + "</span>";
          if (!chain.length) h += '<span class="arrow">∅</span>';
          chain.forEach(function (e, j) {
            h += '<span class="arrow">→</span><span class="entry' + (s.ent[i + ":" + j] ? " " + s.ent[i + ":" + j] : "") + '">' + esc(e.k) + ": " + esc(e.v) + "</span>";
          });
          h += "</div>";
        });
        var n = s.b.reduce(function (a, c) { return a + c.length; }, 0);
        return h + "</div>" + panels([["entries", String(n)], ["buckets", String(M)], ["load factor", (n / M).toFixed(2) + " = n / buckets"]]);
      }
      return player(el, {
        id: "hash-table", title: "Hash table with chaining",
        controls: field("key", "Key", "bat") + field("val", "Value", "4") + SEP + btn("put", "Put", true, true) + btn("get", "Get") + btn("del", "Delete") + SEP + btn("reset", "Reset"),
        render: render,
        bind: function (api) {
          function key() { var k = api.val("key").trim().toLowerCase(); if (!/^[a-z]{1,10}$/.test(k)) { api.error("Use 1–10 letters a–z for the key."); return null; } return k; }
          function calcFrames(k) {
            var p = hashParts(k);
            return [
              { s: S({ calc: 'hash("' + esc(k) + '") = ' + p.codes.map(function (c, i) { return "'" + k[i] + "'" + c; }).join(" + ") + " = <b>" + p.sum + "</b>" }), log: "Step 1: turn the key into a number. This demo adds the character codes (a real hash mixes the bits much more)." },
              { s: S({ calc: p.sum + " mod " + M + " = <b>" + p.idx + "</b>", ab: p.idx }), log: "Step 2: squeeze the number into the table range with modulo: bucket <b>" + p.idx + "</b>. Same key → same bucket, every time." }
            ];
          }
          function walk(fr, k, p, onHit) {
            var chain = buckets[p.idx];
            for (var j = 0; j < chain.length; j++) {
              var e = {}; e[p.idx + ":" + j] = "is-active";
              if (chain[j].k === k) { onHit(j, e); return true; }
              fr.push({ s: S({ calc: "bucket " + p.idx + ": compare keys", ab: p.idx, ent: e }), log: '"' + esc(chain[j].k) + '" ≠ "' + esc(k) + '": a different key that happens to share this bucket. Keep walking the chain.' });
            }
            return false;
          }
          on(api, "put", function () {
            var k = key(); if (k === null) return;
            var v = num(api.val("val")); if (v === null || Math.abs(v) > 999) return api.error("Value must be a whole number between -999 and 999.");
            var p = hashParts(k), fr = calcFrames(k);
            var hit = walk(fr, k, p, function (j) {
              buckets[p.idx][j].v = v;
              var e = {}; e[p.idx + ":" + j] = "is-new";
              fr.push({ s: S({ calc: "bucket " + p.idx + ": key exists", ab: p.idx, ent: e }), log: '"' + esc(k) + '" is already here, so put() replaces its value with ' + v + ". Keys are unique." });
            });
            if (!hit) {
              if (count() >= 14) return api.error("This demo holds 14 entries. Delete one first.");
              var collide = buckets[p.idx].length > 0;
              buckets[p.idx].push({ k: k, v: v });
              var e = {}; buckets[p.idx].forEach(function (_, j) { e[p.idx + ":" + j] = j === buckets[p.idx].length - 1 ? "is-new" : collide ? "is-collision" : ""; });
              fr.push({ s: S({ calc: "bucket " + p.idx + (collide ? ": collision" : ": empty"), ab: p.idx, ent: e }),
                log: collide ? "<b>Collision</b>: bucket " + p.idx + " already holds another key. With chaining we simply add the new entry to that bucket's list. Lookups in this bucket now compare " + buckets[p.idx].length + " keys." : "Bucket " + p.idx + " was empty: store the entry there. Average cost <b>O(1)</b>." });
            }
            api.load(fr);
          });
          on(api, "get", function () {
            var k = key(); if (k === null) return;
            var p = hashParts(k), fr = calcFrames(k);
            var hit = walk(fr, k, p, function (j, e) { fr.push({ s: S({ calc: "bucket " + p.idx + ": found", ab: p.idx, ent: e }), log: 'Found "' + esc(k) + '" → <b>' + buckets[p.idx][j].v + "</b>. We only looked inside one bucket, never at the rest of the table." }); });
            if (!hit) fr.push({ s: S({ calc: "bucket " + p.idx + ": not found", ab: p.idx }), log: 'End of bucket ' + p.idx + ': "' + esc(k) + '" is not in the table. Python would raise KeyError (or return None with dict.get).' });
            api.load(fr);
          });
          on(api, "del", function () {
            var k = key(); if (k === null) return;
            var p = hashParts(k), fr = calcFrames(k);
            var hit = walk(fr, k, p, function (j, e) {
              var e2 = {}; e2[p.idx + ":" + j] = "is-collision";
              fr.push({ s: S({ calc: "bucket " + p.idx + ": found", ab: p.idx, ent: e2 }), log: 'Found "' + esc(k) + '". Remove it from the chain.' });
              buckets[p.idx].splice(j, 1);
              fr.push({ s: S({ calc: "bucket " + p.idx + ": removed", ab: p.idx }), log: "Removed. Average O(1); a bucket with a long chain makes it slower." });
            });
            if (!hit) fr.push({ s: S({ calc: "bucket " + p.idx + ": not found", ab: p.idx }), log: '"' + esc(k) + '" is not in the table; nothing to delete.' });
            api.load(fr);
          });
          on(api, "reset", function () { init(); api.still(S(), "Reset."); });
          api.still(S(), 'Try putting "tac" — it has the same letters as "cat", so the same sum and the same bucket.');
        }
      });
    }
  });

  /* ---------- 6. Binary search tree ---------- */
  reg({
    id: "bst", title: "Binary search tree", topics: ["binary-search-trees", "tree-traversals", "bst-search", "bst-insertion"],
    desc: "Insert and search by comparing left/right, then walk the tree in-order, pre-order, post-order or level-order.",
    mount: function (el, preset) {
      var START = [50, 30, 70, 20, 40, 60, 80];
      var root = null;
      function ins(v) { var n = { v: v, l: null, r: null }; if (!root) { root = n; return; } var c = root; for (;;) { if (v < c.v) { if (!c.l) { c.l = n; return; } c = c.l; } else { if (!c.r) { c.r = n; return; } c = c.r; } } }
      function build(list) { root = null; list.forEach(ins); }
      build(START);
      function size(n) { return n ? 1 + size(n.l) + size(n.r) : 0; }
      function S(opt) { opt = opt || {}; return { t: clone(root), act: opt.act == null ? null : opt.act, vis: opt.vis || [], found: opt.found == null ? null : opt.found, path: opt.path || [], out: opt.out || null, queue: opt.queue || null, label: opt.label || "" }; }
      function render(s) {
        if (!s.t) return '<p style="text-align:center;color:var(--quiet)">Empty tree. Insert a value.</p>';
        var pos = {}, order = 0, maxD = 0;
        (function lay(n, d) { if (!n) return; lay(n.l, d + 1); pos[n.v] = { x: order++, d: d }; maxD = Math.max(maxD, d); lay(n.r, d + 1); })(s.t, 0);
        var GX = 46, GY = 62, W = Math.max(order * GX + 20, 200), H = (maxD + 1) * GY + 10;
        function X(v) { return 10 + GX / 2 + pos[v].x * GX; } function Y(v) { return 30 + pos[v].d * GY; }
        var edges = "", nodes = "";
        (function walk(n) {
          if (!n) return;
          [n.l, n.r].forEach(function (c) {
            if (!c) return;
            var on = s.path.indexOf(n.v) >= 0 && s.path.indexOf(c.v) >= 0;
            edges += '<line class="e-line' + (on ? " is-active" : "") + '" x1="' + X(n.v) + '" y1="' + Y(n.v) + '" x2="' + X(c.v) + '" y2="' + Y(c.v) + '"/>';
            walk(c);
          });
          var cls = s.found === n.v ? "is-found" : s.act === n.v ? "is-active" : s.vis.indexOf(n.v) >= 0 ? "is-visited" : "";
          nodes += '<circle class="n-circle ' + cls + '" cx="' + X(n.v) + '" cy="' + Y(n.v) + '" r="17"/><text x="' + X(n.v) + '" y="' + (Y(n.v) + 4) + '" text-anchor="middle">' + n.v + "</text>";
        })(s.t);
        var h = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" role="img" aria-label="Binary search tree">' + edges + nodes + "</svg>";
        var p = [["nodes", String(size(s.t))], ["height", String(maxD) + " edges"]];
        if (s.out) p.push([s.label || "visit order", s.out.length ? s.out.join(" → ") : "—"]);
        if (s.queue) p.push(["queue (front → rear)", s.queue.length ? s.queue.join(", ") : "empty"]);
        return h + panels(p);
      }
      return player(el, {
        id: "bst", title: "Binary search tree", stageClass: "svg-stage",
        controls: field("val", "Value", "65") + btn("ins", "Insert", true, true) + btn("find", "Search") + SEP +
          select("trav", "Traversal", [["in", "In-order"], ["pre", "Pre-order"], ["post", "Post-order"], ["level", "Level-order"]], preset && /^(in|pre|post|level)$/.test(preset) ? preset : "in") +
          btn("walk", "Run traversal") + SEP + btn("rand", "Random tree") + btn("reset", "Reset"),
        render: render,
        bind: function (api) {
          function value() { var v = num(api.val("val")); if (v === null || v < 1 || v > 99) { api.error("Use a whole number from 1 to 99."); return null; } return v; }
          on(api, "ins", function () {
            var v = value(); if (v === null) return;
            if (size(root) >= 15) return api.error("This demo holds 15 nodes. Reset first.");
            var fr = [], path = [];
            if (!root) { ins(v); return api.load([{ s: S({ found: v }), log: "The tree was empty, so " + v + " becomes the root." }]); }
            var c = root;
            for (;;) {
              path.push(c.v);
              if (v === c.v) { fr.push({ s: S({ act: c.v, path: path.slice() }), log: v + " is already in the tree. This BST keeps unique values, so nothing is inserted." }); return api.load(fr); }
              var dir = v < c.v ? "left" : "right", next = v < c.v ? c.l : c.r;
              fr.push({ s: S({ act: c.v, path: path.slice() }), log: v + (v < c.v ? " < " : " > ") + c.v + " → go " + dir + "." + (next ? "" : " The " + dir + " child is empty: this is where " + v + " belongs.") });
              if (!next) break;
              c = next;
            }
            ins(v); path.push(v);
            fr.push({ s: S({ found: v, path: path }), log: "Attach " + v + " as the " + (v < c.v ? "left" : "right") + " child of " + c.v + ". We compared against " + (path.length - 1) + " node" + (path.length === 2 ? "" : "s") + " — one per level, so insertion costs O(height): O(log n) when balanced, O(n) for a chain." });
            api.load(fr);
          });
          on(api, "find", function () {
            var v = value(); if (v === null) return;
            var fr = [], path = [], c = root;
            while (c) {
              path.push(c.v);
              if (c.v === v) { fr.push({ s: S({ found: v, path: path.slice() }), log: "Found " + v + " after " + path.length + " comparison" + (path.length > 1 ? "s" : "") + "." }); return api.load(fr); }
              fr.push({ s: S({ act: c.v, path: path.slice() }), log: v + (v < c.v ? " < " : " > ") + c.v + " → everything " + (v < c.v ? "right" : "left") + " of here is ruled out. Go " + (v < c.v ? "left" : "right") + "." });
              c = v < c.v ? c.l : c.r;
            }
            fr.push({ s: S({ path: path }), log: "Reached an empty child: " + v + " is not in the tree. " + path.length + " comparisons." });
            api.load(fr);
          });
          on(api, "walk", function () {
            if (!root) return api.error("The tree is empty.");
            var kind = api.val("trav"), out = [], fr = [];
            var names = { "in": "In-order (left, node, right) — gives sorted order in a BST", pre: "Pre-order (node, left, right) — copies a tree's shape", post: "Post-order (left, right, node) — children before parents, used for deleting", level: "Level-order — row by row with a queue" };
            fr.push({ s: S({ out: [], label: kind + "-order", queue: kind === "level" ? [root.v] : null }), log: names[kind] + "." });
            if (kind === "level") {
              var q = [root];
              while (q.length) {
                var n = q.shift(); out.push(n.v);
                if (n.l) q.push(n.l); if (n.r) q.push(n.r);
                fr.push({ s: S({ act: n.v, vis: out.slice(), out: out.slice(), label: "level-order", queue: q.map(function (x) { return x.v; }) }), log: "Dequeue " + n.v + " and visit it. Enqueue its children" + (n.l || n.r ? " (" + [n.l, n.r].filter(Boolean).map(function (x) { return x.v; }).join(", ") + ")" : ": none") + "." });
              }
            } else {
              (function rec(n) {
                if (!n) return;
                if (kind === "pre") { out.push(n.v); fr.push({ s: S({ act: n.v, vis: out.slice(), out: out.slice(), label: "pre-order" }), log: "Visit " + n.v + " before its children." }); }
                rec(n.l);
                if (kind === "in") { out.push(n.v); fr.push({ s: S({ act: n.v, vis: out.slice(), out: out.slice(), label: "in-order" }), log: "Left subtree of " + n.v + " done → visit " + n.v + "." }); }
                rec(n.r);
                if (kind === "post") { out.push(n.v); fr.push({ s: S({ act: n.v, vis: out.slice(), out: out.slice(), label: "post-order" }), log: "Both subtrees of " + n.v + " done → visit " + n.v + "." }); }
              })(root);
            }
            fr.push({ s: S({ vis: out.slice(), out: out, label: kind + "-order" }), log: "Done: every node visited exactly once, so any traversal is <b>O(n)</b>." });
            api.load(fr);
          });
          on(api, "rand", function () { var set = {}, list = []; while (list.length < 9) { var r = randInt(5, 95); if (!set[r]) { set[r] = 1; list.push(r); } } build(list); api.still(S(), "Inserted in this order: " + list.join(", ") + "."); });
          on(api, "reset", function () { build(START); api.still(S(), "Reset."); });
          api.still(S(), "Every value in a node's left subtree is smaller than the node; every value in the right subtree is larger.");
        }
      });
    }
  });

  /* ---------- 7. Graph BFS / DFS ---------- */
  reg({
    id: "graph", title: "Graph traversal: BFS and DFS", topics: ["graphs", "graph-bfs", "graph-dfs", "adjacency-list"],
    desc: "An undirected graph stored as an adjacency list. Breadth-first search uses a queue; depth-first search uses a stack.",
    mount: function (el, preset) {
      var adj;
      function init() { adj = { A: ["B", "C"], B: ["A", "D"], C: ["A", "D", "E"], D: ["B", "C", "F"], E: ["C", "F"], F: ["D", "E"] }; }
      init();
      function names() { return Object.keys(adj).sort(); }
      function S(opt) { opt = opt || {}; return { adj: clone(adj), act: opt.act || null, vis: opt.vis || [], fr: opt.fr || [], edge: opt.edge || null, box: opt.box || null, boxName: opt.boxName || "", order: opt.order || null }; }
      function render(s) {
        var vs = Object.keys(s.adj).sort(), n = vs.length, W = 420, H = 300, cx = W / 2, cy = H / 2, R = 115, P = {};
        vs.forEach(function (v, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / Math.max(n, 1); P[v] = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }; });
        var e = "", nd = "", seen = {};
        vs.forEach(function (u) { s.adj[u].forEach(function (v) {
          var k = u < v ? u + v : v + u; if (seen[k] || !P[v]) return; seen[k] = 1;
          var on = s.edge && ((s.edge[0] === u && s.edge[1] === v) || (s.edge[0] === v && s.edge[1] === u));
          e += '<line class="e-line' + (on ? " is-active" : "") + '" x1="' + P[u].x + '" y1="' + P[u].y + '" x2="' + P[v].x + '" y2="' + P[v].y + '"/>';
        }); });
        vs.forEach(function (v) {
          var cls = s.act === v ? "is-active" : s.fr.indexOf(v) >= 0 ? "is-frontier" : s.vis.indexOf(v) >= 0 ? "is-visited" : "";
          nd += '<circle class="n-circle ' + cls + '" cx="' + P[v].x + '" cy="' + P[v].y + '" r="18"/><text x="' + P[v].x + '" y="' + (P[v].y + 4) + '" text-anchor="middle">' + esc(v) + "</text>";
        });
        var h = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" role="img" aria-label="Graph">' + e + nd + "</svg>";
        var p = [];
        if (s.box) p.push([s.boxName, s.box.length ? s.box.join(", ") : "empty"]);
        if (s.order) p.push(["visited order", s.order.length ? s.order.join(" → ") : "—"]);
        p.push(["adjacency list", vs.map(function (v) { return esc(v) + ": " + s.adj[v].map(esc).join(", "); }).join("<br>")]);
        return h + panels(p);
      }
      return player(el, {
        id: "graph", title: "Graph traversal: BFS and DFS", stageClass: "svg-stage",
        controls: field("start", "Start", "A") + btn("bfs", "Run BFS", preset !== "dfs", true) + btn("dfs", "Run DFS", preset === "dfs") + SEP +
          field("v", "Vertex", "G") + btn("addv", "Add vertex") + field("e", "Edge", "F G") + btn("adde", "Add edge") + SEP + btn("reset", "Reset"),
        render: render,
        bind: function (api) {
          function start() { var s = api.val("start").trim().toUpperCase(); if (!adj[s]) { api.error("Start must be one of: " + names().join(", ") + "."); return null; } return s; }
          on(api, "bfs", function () {
            var s = start(); if (!s) return;
            var vis = [s], q = [s], order = [], fr = [];
            fr.push({ s: S({ fr: [s], vis: vis.slice(), box: q.slice(), boxName: "queue (front → rear)", order: [] }), log: "Mark " + s + " as visited and put it in the queue. BFS explores in rings: everything 1 edge away, then 2, then 3." });
            while (q.length) {
              var u = q.shift(); order.push(u);
              fr.push({ s: S({ act: u, fr: q.slice(), vis: vis.slice(), box: q.slice(), boxName: "queue (front → rear)", order: order.slice() }), log: "Dequeue " + u + " (the oldest entry) and look at its neighbours: " + adj[u].join(", ") + "." });
              adj[u].slice().sort().forEach(function (v) {
                if (vis.indexOf(v) >= 0) { fr.push({ s: S({ act: u, fr: q.slice(), vis: vis.slice(), edge: [u, v], box: q.slice(), boxName: "queue (front → rear)", order: order.slice() }), log: v + " is already visited — skip it. This check is what stops BFS looping forever on cycles." }); return; }
                vis.push(v); q.push(v);
                fr.push({ s: S({ act: u, fr: q.slice(), vis: vis.slice(), edge: [u, v], box: q.slice(), boxName: "queue (front → rear)", order: order.slice() }), log: "Discover " + v + ": mark visited and enqueue it." });
              });
            }
            fr.push({ s: S({ vis: vis.slice(), box: [], boxName: "queue (front → rear)", order: order }), log: "Queue empty: done. Each vertex was enqueued once and each edge examined from both ends: <b>O(V + E)</b>." });
            api.load(fr);
          });
          on(api, "dfs", function () {
            var s = start(); if (!s) return;
            var vis = [], st = [s], order = [], fr = [];
            fr.push({ s: S({ fr: [s], box: st.slice(), boxName: "stack (bottom → top)", order: [] }), log: "Push " + s + " on the stack. DFS goes as deep as it can before backing up." });
            while (st.length) {
              var u = st.pop();
              if (vis.indexOf(u) >= 0) { fr.push({ s: S({ act: u, vis: vis.slice(), fr: st.slice(), box: st.slice(), boxName: "stack (bottom → top)", order: order.slice() }), log: "Pop " + u + ": already visited, skip." }); continue; }
              vis.push(u); order.push(u);
              var nb = adj[u].slice().sort().reverse().filter(function (v) { return vis.indexOf(v) < 0; });
              nb.forEach(function (v) { st.push(v); });
              fr.push({ s: S({ act: u, vis: vis.slice(), fr: st.slice(), box: st.slice(), boxName: "stack (bottom → top)", order: order.slice() }), log: "Pop " + u + " (the newest entry) and visit it." + (nb.length ? " Push unvisited neighbours " + nb.slice().reverse().join(", ") + " (in reverse, so " + nb[nb.length - 1] + " is explored next)." : " No unvisited neighbours — back up.") });
            }
            fr.push({ s: S({ vis: vis.slice(), box: [], boxName: "stack (bottom → top)", order: order }), log: "Stack empty: done. Also <b>O(V + E)</b> — same cost as BFS, different order." });
            api.load(fr);
          });
          on(api, "addv", function () {
            var v = api.val("v").trim().toUpperCase();
            if (!/^[A-Z]$/.test(v)) return api.error("A vertex is one letter A–Z.");
            if (adj[v]) return api.error(v + " already exists.");
            if (names().length >= 10) return api.error("This demo holds 10 vertices.");
            adj[v] = [];
            api.still(S({ act: v }), "Added vertex " + v + " with no edges: adj[\"" + v + "\"] = []. Add an edge to connect it.");
          });
          on(api, "adde", function () {
            var p = api.val("e").trim().toUpperCase().split(/[\s,\-]+/);
            if (p.length !== 2 || !adj[p[0]] || !adj[p[1]]) return api.error("Write two existing vertices, e.g. \"A D\".");
            if (p[0] === p[1]) return api.error("Self-loops are not allowed in this demo.");
            if (adj[p[0]].indexOf(p[1]) >= 0) return api.error("That edge already exists.");
            adj[p[0]].push(p[1]); adj[p[1]].push(p[0]);
            api.still(S({ edge: p }), "Added edge " + p[0] + "–" + p[1] + ". Undirected, so it is stored twice: in " + p[0] + "'s list and in " + p[1] + "'s list.");
          });
          on(api, "reset", function () { init(); api.still(S(), "Reset."); });
          api.still(S(), "Pick a start vertex and run BFS or DFS. Orange = waiting in the queue/stack, green outline = visited.");
        }
      });
    }
  });

  /* ---------- 8. Sorting ---------- */
  var SORTS = { bubble: "Bubble sort", selection: "Selection sort", insertion: "Insertion sort", merge: "Merge sort", quick: "Quick sort" };
  function sortFrames(kind, input) {
    var a = input.slice(), n = a.length, fr = [], sorted = [], cmp = 0, wr = 0;
    function F(cls, log) { fr.push({ s: { a: a.slice(), cls: cls }, log: log + ' <span class="mono" style="color:var(--quiet)">· comparisons ' + cmp + " · moves " + wr + "</span>" }); }
    function base() { var c = {}; sorted.forEach(function (i) { c[i] = "is-sorted"; }); return c; }
    function w(c, k, v) { c[k] = v; return c; }
    F({}, SORTS[kind] + " on " + n + " values.");
    if (kind === "bubble") {
      for (var i = 0; i < n - 1; i++) {
        var swapped = false;
        for (var j = 0; j < n - 1 - i; j++) {
          cmp++; var c = base(); c[j] = c[j + 1] = "is-compare";
          F(c, "Pass " + (i + 1) + ": compare a[" + j + "]=" + a[j] + " and a[" + (j + 1) + "]=" + a[j + 1] + (a[j] > a[j + 1] ? " → out of order." : " → in order."));
          if (a[j] > a[j + 1]) { var t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; wr++; swapped = true; var c2 = base(); c2[j] = c2[j + 1] = "is-swap"; F(c2, "Swap them. The larger value bubbles right."); }
        }
        sorted.push(n - 1 - i);
        F(base(), "End of pass " + (i + 1) + ": the largest unsorted value has reached index " + (n - 1 - i) + ".");
        if (!swapped) { for (var k = 0; k < n; k++) if (sorted.indexOf(k) < 0) sorted.push(k); F(base(), "No swaps in this pass, so the array is already sorted — stop early (best case O(n))."); break; }
      }
    } else if (kind === "selection") {
      for (var i2 = 0; i2 < n - 1; i2++) {
        var m = i2;
        for (var j2 = i2 + 1; j2 < n; j2++) {
          cmp++; var c3 = base(); c3[m] = "is-pivot"; c3[j2] = "is-compare";
          F(c3, "Smallest so far is a[" + m + "]=" + a[m] + ". Compare with a[" + j2 + "]=" + a[j2] + ".");
          if (a[j2] < a[m]) m = j2;
        }
        if (m !== i2) { var t2 = a[i2]; a[i2] = a[m]; a[m] = t2; wr++; }
        sorted.push(i2);
        var c4 = base(); if (m !== i2) c4[m] = "is-swap";
        F(c4, m !== i2 ? "Swap the minimum into index " + i2 + "." : "a[" + i2 + "] is already the minimum; no swap.");
      }
      sorted.push(n - 1); F(base(), "The last element is automatically in place. Always n(n−1)/2 comparisons: O(n²) even if the input was sorted.");
    } else if (kind === "insertion") {
      sorted.push(0);
      for (var i3 = 1; i3 < n; i3++) {
        var key = a[i3], j3 = i3 - 1;
        F(w(base(), i3, "is-pivot"), "Take key = " + key + ". Indices 0.." + (i3 - 1) + " are sorted; slide key left into its place.");
        while (j3 >= 0) {
          cmp++;
          if (a[j3] <= key) { F(w(base(), j3, "is-compare"), a[j3] + " ≤ " + key + ": stop here."); break; }
          a[j3 + 1] = a[j3]; a[j3] = key; wr++;
          var c5 = base(); c5[j3] = "is-pivot"; c5[j3 + 1] = "is-swap";
          F(c5, a[j3 + 1] + " > " + key + ": shift it right.");
          j3--;
        }
        sorted.push(i3);
        F(base(), "Sorted prefix now covers indices 0.." + i3 + ".");
      }
    } else if (kind === "merge") {
      (function ms(lo, hi) {
        if (hi - lo < 1) return;
        var mid = (lo + hi) >> 1;
        var cr = {}; for (var x = lo; x <= hi; x++) cr[x] = "is-range";
        F(cr, "Split [" + lo + ".." + hi + "] into [" + lo + ".." + mid + "] and [" + (mid + 1) + ".." + hi + "].");
        ms(lo, mid); ms(mid + 1, hi);
        var L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1), i = 0, j = 0, k = lo;
        while (i < L.length && j < R.length) {
          cmp++;
          var take = L[i] <= R[j] ? L[i++] : R[j++];
          a[k] = take; wr++;
          var cm = {}; for (var y = lo; y <= hi; y++) cm[y] = "is-range"; cm[k] = "is-swap";
          F(cm, "Merge: smaller front of the two halves is " + take + " → write to a[" + k + "].");
          k++;
        }
        while (i < L.length) { a[k] = L[i++]; wr++; k++; }
        while (j < R.length) { a[k] = R[j++]; wr++; k++; }
        var cd = {}; for (var z = lo; z <= hi; z++) cd[z] = "is-sorted";
        F(cd, "[" + lo + ".." + hi + "] is merged and sorted.");
      })(0, n - 1);
      for (var q = 0; q < n; q++) sorted.push(q);
      F(base(), "Done. log₂ n levels of splitting × O(n) merging per level = <b>O(n log n)</b>, using O(n) extra memory.");
    } else if (kind === "quick") {
      (function qs(lo, hi) {
        if (lo > hi) return;
        if (lo === hi) { sorted.push(lo); F(base(), "Single element at " + lo + " is in place."); return; }
        var p = a[hi], i = lo;
        var c6 = base(); for (var x = lo; x <= hi; x++) c6[x] = "is-range"; c6[hi] = "is-pivot";
        F(c6, "Partition [" + lo + ".." + hi + "] around pivot " + p + " (last element). Smaller values go left of it.");
        for (var j = lo; j < hi; j++) {
          cmp++;
          var c7 = base(); for (var y = lo; y <= hi; y++) c7[y] = "is-range"; c7[hi] = "is-pivot"; c7[j] = "is-compare";
          if (a[j] < p) {
            var t = a[i]; a[i] = a[j]; a[j] = t; wr++;
            c7[i] = "is-swap";
            F(c7, a[i] + " < " + p + ": swap it into the left zone (index " + i + ").");
            i++;
          } else F(c7, a[j] + " ≥ " + p + ": leave it on the right.");
        }
        var t3 = a[i]; a[i] = a[hi]; a[hi] = t3; wr++;
        sorted.push(i);
        F(base(), "Put pivot " + p + " at index " + i + ": its final position. Recurse on each side.");
        qs(lo, i - 1); qs(i + 1, hi);
      })(0, n - 1);
      F(base(), "Done. Average <b>O(n log n)</b>; worst case O(n²) when pivots are always the smallest or largest (e.g. already-sorted input with a last-element pivot).");
    }
    return fr;
  }
  reg({
    id: "sorting", title: "Sorting algorithms", topics: ["bubble-sort", "selection-sort", "insertion-sort", "merge-sort", "quick-sort"],
    desc: "Watch comparisons (orange), swaps/writes (red), pivots (blue) and the sorted region (green).",
    mount: function (el, preset) {
      var data = [38, 27, 43, 3, 9, 82, 10, 55];
      function render(s) {
        var max = Math.max.apply(null, s.a.concat([1]));
        return '<div class="bars" style="padding-bottom:1.5rem">' + s.a.map(function (v, i) {
          return '<div class="bar' + (s.cls[i] ? " " + s.cls[i] : "") + '" style="height:' + Math.max(8, Math.round(180 * v / max)) + 'px"><span>' + v + "</span></div>";
        }).join("") + "</div>";
      }
      return player(el, {
        id: "sorting", title: "Sorting algorithms",
        controls: select("alg", "Algorithm", Object.keys(SORTS).map(function (k) { return [k, SORTS[k]]; }), SORTS[preset] ? preset : "bubble") +
          field("arr", "Values", data.join(", "), true) + btn("run", "Sort", true, true) + btn("rand", "Random") + btn("sorted", "Already sorted") + btn("rev", "Reversed"),
        render: render,
        bind: function (api) {
          var input = api.controls.querySelector('[name="arr"]');
          function read() { var l = parseList(input.value); if (!l || l.length < 2 || l.length > 16 || l.some(function (v) { return v < 1 || v > 99; })) { api.error("Enter 2–16 whole numbers from 1 to 99, separated by commas."); return null; } return l; }
          on(api, "run", function () { var l = read(); if (!l) return; api.load(sortFrames(api.val("alg"), l)); });
          function setInput(l) { input.value = l.join(", "); api.still({ a: l, cls: {} }, "New input. Press Sort."); }
          on(api, "rand", function () { var l = []; for (var i = 0; i < 10; i++) l.push(randInt(3, 99)); setInput(l); });
          on(api, "sorted", function () { setInput([5, 12, 18, 27, 33, 41, 56, 70]); });
          on(api, "rev", function () { setInput([70, 56, 41, 33, 27, 18, 12, 5]); });
          api.controls.querySelector('[name="alg"]').addEventListener("change", function () { var l = read(); if (l) api.still({ a: l, cls: {} }, SORTS[api.val("alg")] + " selected. Press Sort."); });
          api.still({ a: data, cls: {} }, "Choose an algorithm and press Sort. Try “Already sorted” and “Reversed” to see best and worst cases.");
        }
      });
    }
  });

  /* ---------- 9. Binary search ---------- */
  reg({
    id: "binary-search", title: "Binary search", topics: ["binary-search", "binary-search-variations", "logarithms"],
    desc: "L, M and R on a sorted array. Every comparison discards half of what is left.",
    mount: function (el, preset) {
      var data = [2, 5, 8, 8, 8, 12, 16, 23, 38, 42, 56, 72, 91];
      function S(o) { return { a: data.slice(), L: o.L, R: o.R, M: o.M, hit: o.hit == null ? -1 : o.hit, ans: o.ans == null ? -1 : o.ans }; }
      function render(s) {
        var h = '<div class="v-row">';
        s.a.forEach(function (v, i) {
          var out = s.L != null && (i < s.L || i > s.R);
          var tags = []; if (i === s.L) tags.push("L"); if (i === s.M) tags.push("M"); if (i === s.R) tags.push("R");
          var cls = i === s.hit ? " is-active" : i === s.ans ? " is-done" : i === s.M ? " is-compare" : out ? " is-out" : "";
          h += '<div class="v-cell' + cls + '"><span class="tag">' + tags.join("") + '</span><span class="v">' + v + '</span><span class="i">' + i + "</span></div>";
        });
        h += "</div>";
        var left = s.L != null && s.L <= s.R ? s.R - s.L + 1 : 0;
        return h + panels([["range left", s.L != null ? left + " of " + s.a.length : String(s.a.length)], ["max steps", "⌊log₂ " + s.a.length + "⌋ + 1 = " + (Math.floor(Math.log2(s.a.length)) + 1)]]);
      }
      return player(el, {
        id: "binary-search", title: "Binary search",
        controls: field("t", "Target", "23") + select("mode", "Find", [["any", "Any match"], ["first", "First occurrence"], ["last", "Last occurrence"]], /^(first|last)$/.test(preset || "") ? preset : "any") +
          btn("run", "Search", true, true) + SEP + btn("rand", "New sorted array"),
        render: render,
        bind: function (api) {
          on(api, "run", function () {
            var t = num(api.val("t")); if (t === null) return api.error("Target must be a whole number.");
            var mode = api.val("mode"), L = 0, R = data.length - 1, ans = -1, step = 0, fr = [];
            fr.push({ s: S({ L: L, R: R }), log: "Search for " + t + (mode === "any" ? "" : " (" + mode + " occurrence)") + ". The array is sorted, so one comparison tells us which half cannot contain it. L = 0, R = " + R + "." });
            while (L <= R) {
              step++;
              var M = (L + R) >> 1;
              fr.push({ s: S({ L: L, R: R, M: M, ans: ans }), log: "Step " + step + ": M = (L + R) // 2 = (" + L + " + " + R + ") // 2 = " + M + ". a[M] = " + data[M] + "." });
              if (data[M] === t) {
                ans = M;
                if (mode === "any") { fr.push({ s: S({ L: L, R: R, M: M, hit: M }), log: "a[" + M + "] = " + t + ": found in " + step + " step" + (step > 1 ? "s" : "") + "." }); return api.load(fr); }
                if (mode === "first") { fr.push({ s: S({ L: L, R: R, M: M, ans: ans }), log: "Match at " + M + ", but an earlier copy may exist. Record it and keep searching left: R = M − 1 = " + (M - 1) + "." }); R = M - 1; }
                else { fr.push({ s: S({ L: L, R: R, M: M, ans: ans }), log: "Match at " + M + ", but a later copy may exist. Record it and keep searching right: L = M + 1 = " + (M + 1) + "." }); L = M + 1; }
              } else if (data[M] < t) {
                fr.push({ s: S({ L: M + 1, R: R, ans: ans }), log: data[M] + " < " + t + ": the target can only be to the right. L = M + 1 = " + (M + 1) + ". " + Math.max(0, R - M) + " candidates remain." });
                L = M + 1;
              } else {
                fr.push({ s: S({ L: L, R: M - 1, ans: ans }), log: data[M] + " > " + t + ": the target can only be to the left. R = M − 1 = " + (M - 1) + ". " + Math.max(0, M - L) + " candidates remain." });
                R = M - 1;
              }
            }
            fr.push({ s: S({ L: L, R: R, ans: ans, hit: ans }), log: ans >= 0 ? (mode === "first" ? "First" : "Last") + " occurrence of " + t + " is at index <b>" + ans + "</b>, found in " + step + " steps." : "L > R: the range is empty, so " + t + " is not in the array. " + step + " steps — never more than ⌊log₂ n⌋ + 1." });
            api.load(fr);
          });
          on(api, "rand", function () {
            var set = [], v = randInt(1, 6);
            for (var i = 0; i < 15; i++) { set.push(v); v += randInt(0, 9); }
            data = set; api.still(S({}), "New array (duplicates possible). Pick a target.");
          });
          api.still(S({}), "Only works on sorted data. Try target 8 with “First occurrence” and “Last occurrence”.");
        }
      });
    }
  });

  /* ---------- 10. Dynamic programming: Fibonacci ---------- */
  reg({
    id: "dp", title: "Fibonacci: recursion tree vs memoization", topics: ["memoization", "dynamic-programming", "recursion", "exponential-complexity", "tabulation"],
    desc: "The same answer three ways. Count how many calls each makes.",
    mount: function (el, preset) {
      function S(o) { return { nodes: o.nodes || [], act: o.act == null ? -1 : o.act, memo: o.memo || [], read: o.read || [], write: o.write == null ? -1 : o.write, n: o.n, calls: o.calls || 0, hits: o.hits || 0, mode: o.mode }; }
      function render(s) {
        var h = "";
        if (s.nodes.length) {
          var leaves = 0, maxD = 0, X = {}, kids = {};
          s.nodes.forEach(function (nd) { if (nd.p >= 0) (kids[nd.p] = kids[nd.p] || []).push(nd.id); maxD = Math.max(maxD, nd.d); });
          (function lay(id) { var k = kids[id]; if (!k) { X[id] = leaves++; return; } k.forEach(lay); X[id] = (X[k[0]] + X[k[k.length - 1]]) / 2; })(0);
          var GX = 38, GY = 54, W = Math.max(leaves * GX + 20, 200), H = (maxD + 1) * GY + 16;
          var e = "", c = "";
          s.nodes.forEach(function (nd) {
            var x = 10 + GX / 2 + X[nd.id] * GX, y = 22 + nd.d * GY;
            if (nd.p >= 0) { var px = 10 + GX / 2 + X[nd.p] * GX, py = 22 + s.nodes[nd.p].d * GY; e += '<line class="e-line" x1="' + px + '" y1="' + py + '" x2="' + x + '" y2="' + y + '"/>'; }
            var cls = nd.id === s.act ? "is-active" : nd.hit ? "is-found" : nd.val != null ? "is-visited" : "is-frontier";
            c += '<circle class="n-circle ' + cls + '" cx="' + x + '" cy="' + y + '" r="15"/><text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" style="font-size:11px">f' + nd.n + "</text>";
            if (nd.val != null) c += '<text class="small" x="' + x + '" y="' + (y + 27) + '" text-anchor="middle">' + nd.val + "</text>";
          });
          h += '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" role="img" aria-label="Call tree">' + e + c + "</svg>";
        }
        if (s.mode !== "naive") {
          h += '<table class="dp-table"><tr><th>i</th>';
          for (var i = 0; i <= s.n; i++) h += "<th>" + i + "</th>";
          h += "</tr><tr><th>" + (s.mode === "memo" ? "memo" : "dp") + "</th>";
          for (var j = 0; j <= s.n; j++) {
            var cl = j === s.write ? "is-active" : s.read.indexOf(j) >= 0 ? "is-read" : s.memo[j] != null ? "is-filled" : "";
            h += '<td class="' + cl + '">' + (s.memo[j] != null ? s.memo[j] : "·") + "</td>";
          }
          h += "</tr></table>";
        }
        var fib = [0, 1]; for (var k = 2; k <= s.n; k++) fib[k] = fib[k - 1] + fib[k - 2];
        return h + panels([["calls so far", String(s.calls)], [s.mode === "memo" ? "memo hits" : "plain recursion would make", s.mode === "memo" ? String(s.hits) : String(2 * (fib[s.n + 1] || 1) - 1) + " calls"], ["answer", "fib(" + s.n + ") = " + fib[s.n]]]);
      }
      return player(el, {
        id: "dp", title: "Fibonacci: recursion tree vs memoization", stageClass: "svg-stage",
        controls: field("n", "n", "5") + select("mode", "Method", [["naive", "Plain recursion"], ["memo", "Memoization (top-down)"], ["tab", "Tabulation (bottom-up)"]], /^(naive|memo|tab)$/.test(preset || "") ? preset : "naive") + btn("run", "Run", true, true),
        render: render,
        bind: function (api) {
          on(api, "run", function () {
            var n = num(api.val("n")), mode = api.val("mode");
            var lim = mode === "tab" ? 20 : 7;
            if (n === null || n < 0 || n > lim) return api.error("n must be from 0 to " + lim + (mode === "tab" ? "" : " (the tree gets too wide to draw)") + ".");
            var fr = [], nodes = [], memo = [], calls = 0, hits = 0;
            if (mode === "tab") {
              memo = [];
              fr.push({ s: S({ n: n, mode: mode, memo: memo.slice() }), log: "Bottom-up: no recursion. Fill a table from the smallest subproblem upward." });
              memo[0] = 0; fr.push({ s: S({ n: n, mode: mode, memo: memo.slice(), write: 0 }), log: "Base case dp[0] = 0." });
              if (n >= 1) { memo[1] = 1; fr.push({ s: S({ n: n, mode: mode, memo: memo.slice(), write: 1 }), log: "Base case dp[1] = 1." }); }
              for (var i = 2; i <= n; i++) {
                memo[i] = memo[i - 1] + memo[i - 2];
                fr.push({ s: S({ n: n, mode: mode, memo: memo.slice(), write: i, read: [i - 1, i - 2], calls: i - 1 }), log: "dp[" + i + "] = dp[" + (i - 1) + "] + dp[" + (i - 2) + "] = " + memo[i - 1] + " + " + memo[i - 2] + " = " + memo[i] + "." });
              }
              fr.push({ s: S({ n: n, mode: mode, memo: memo.slice(), calls: Math.max(0, n - 1) }), log: "Done: n − 1 additions, <b>O(n)</b> time. Only the last two values are ever read, so this can be cut to O(1) memory." });
              return api.load(fr);
            }
            function snap(act, extra) { extra = extra || {}; return S({ nodes: clone(nodes), act: act, n: n, mode: mode, memo: memo.slice(), read: extra.read || [], write: extra.write == null ? -1 : extra.write, calls: calls, hits: hits }); }
            (function f(k, p, d) {
              calls++;
              var id = nodes.length; nodes.push({ id: id, n: k, p: p, d: d, val: null, hit: false });
              if (mode === "memo" && memo[k] != null) {
                hits++; nodes[id].val = memo[k]; nodes[id].hit = true;
                fr.push({ s: snap(id, { read: [k] }), log: "f(" + k + ") is already in the memo → return " + memo[k] + " immediately, no further calls." });
                return memo[k];
              }
              if (k < 2) {
                nodes[id].val = k; if (mode === "memo") memo[k] = k;
                fr.push({ s: snap(id, { write: mode === "memo" ? k : -1 }), log: "f(" + k + ") is a base case → " + k + "." });
                return k;
              }
              fr.push({ s: snap(id), log: "f(" + k + ") needs f(" + (k - 1) + ") and f(" + (k - 2) + ")." });
              var v = f(k - 1, id, d + 1) + f(k - 2, id, d + 1);
              nodes[id].val = v; if (mode === "memo") memo[k] = v;
              fr.push({ s: snap(id, { write: mode === "memo" ? k : -1 }), log: "f(" + k + ") = " + (v - (memo[k - 2] != null ? memo[k - 2] : 0)) + " + … = " + v + "." + (mode === "memo" ? " Store it in memo[" + k + "]." : "") });
              return v;
            })(n, -1, 0);
            fr.push({ s: snap(-1), log: mode === "naive" ? "Done: <b>" + calls + " calls</b> for fib(" + n + "). The same subproblems are solved again and again (look how often f2 appears). Calls roughly multiply by 1.6 each time n grows by 1: <b>O(2ⁿ)</b>." : "Done: <b>" + calls + " calls</b> (" + hits + " answered from the memo). Each f(k) is computed once: <b>O(n)</b> time, O(n) memory." });
            api.load(fr);
          });
          api.still(S({ n: 5, mode: "naive" }), "Run plain recursion for n = 5, then switch to memoization and compare the call counts.");
        }
      });
    }
  });

  /* ---------- 11. Complexity growth chart ---------- */
  var GROWTH = [
    { k: "1", name: "O(1)", f: function () { return 1; }, c: "var(--muted)" },
    { k: "log", name: "O(log n)", f: function (n) { return Math.max(1, Math.log2(n)); }, c: "var(--info)" },
    { k: "n", name: "O(n)", f: function (n) { return n; }, c: "var(--accent)" },
    { k: "nlog", name: "O(n log n)", f: function (n) { return n * Math.max(1, Math.log2(n)); }, c: "#7fd1b9" },
    { k: "n2", name: "O(n²)", f: function (n) { return n * n; }, c: "var(--warn)" },
    { k: "2n", name: "O(2ⁿ)", f: function (n) { return Math.pow(2, n); }, c: "var(--danger)" },
    { k: "fact", name: "O(n!)", f: function (n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }, c: "#e58fd0" }
  ];
  function fmtNum(x) {
    if (!isFinite(x)) return "∞";
    if (x < 1e6) return (Math.round(x * 10) / 10).toLocaleString("en-US");
    return x.toExponential(2).replace("e+", " × 10^");
  }
  function fmtTime(ops) {
    var s = ops / 1e8;
    if (s < 1e-6) return (s * 1e9).toFixed(0) + " ns";
    if (s < 1e-3) return (s * 1e6).toFixed(1) + " µs";
    if (s < 1) return (s * 1e3).toFixed(1) + " ms";
    if (s < 60) return s.toFixed(1) + " s";
    if (s < 3600) return (s / 60).toFixed(1) + " min";
    if (s < 86400) return (s / 3600).toFixed(1) + " hours";
    if (s < 3.15e7) return (s / 86400).toFixed(1) + " days";
    if (s < 4.3e17) return fmtNum(s / 3.15e7) + " years";
    return "longer than the age of the universe";
  }
  reg({
    id: "growth", title: "Complexity growth chart", topics: ["big-o-notation", "time-complexity", "why-complexity-matters"],
    desc: "How the common growth classes compare as n increases, and what that means in real time at 100 million simple steps per second.",
    mount: function (el) {
      function render(s) {
        var n = s.n, W = 640, H = 300, PL = 46, PB = 26, PT = 10, ymax = Math.max(16, n * n);
        function px(x) { return PL + (x - 1) / Math.max(1, n - 1) * (W - PL - 10); }
        function py(y) { return H - PB - Math.min(y, ymax * 1.6) / ymax * (H - PB - PT); }
        var h = '<svg class="growth-chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Growth curves up to n = ' + n + '"><defs><clipPath id="gclip"><rect x="' + PL + '" y="' + PT + '" width="' + (W - PL) + '" height="' + (H - PB - PT) + '"/></clipPath></defs>';
        for (var g = 0; g <= 4; g++) { var yy = PT + g * (H - PB - PT) / 4; h += '<line class="grid" x1="' + PL + '" x2="' + (W - 10) + '" y1="' + yy + '" y2="' + yy + '"/><text x="' + (PL - 6) + '" y="' + (yy + 3) + '" text-anchor="end">' + fmtNum(ymax * (4 - g) / 4) + "</text>"; }
        h += '<line class="axis" x1="' + PL + '" x2="' + (W - 10) + '" y1="' + (H - PB) + '" y2="' + (H - PB) + '"/><line class="axis" x1="' + PL + '" x2="' + PL + '" y1="' + PT + '" y2="' + (H - PB) + '"/>';
        h += '<text x="' + PL + '" y="' + (H - 8) + '">n = 1</text><text x="' + (W - 10) + '" y="' + (H - 8) + '" text-anchor="end">n = ' + n + "</text>";
        h += '<g clip-path="url(#gclip)">';
        GROWTH.forEach(function (G) {
          var d = "", steps = Math.max(2, n);
          for (var x = 1; x <= steps; x++) d += (x === 1 ? "M" : "L") + px(x).toFixed(1) + " " + py(G.f(x)).toFixed(1) + " ";
          h += '<path d="' + d + '" style="stroke:' + G.c + '"/>';
        });
        h += "</g></svg>";
        h += '<table class="growth-table"><thead><tr><th>Class</th><th>Steps at n = ' + n + "</th><th>Time at 10⁸ steps/s</th></tr></thead><tbody>";
        GROWTH.forEach(function (G) { var v = G.f(n); h += '<tr><td><span class="swatch" style="background:' + G.c + '"></span>' + G.name + "</td><td>" + fmtNum(v) + "</td><td>" + fmtTime(v) + "</td></tr>"; });
        return h + "</tbody></table>";
      }
      return player(el, {
        id: "growth", title: "Complexity growth chart",
        controls: '<label>n <input type="range" min="2" max="60" value="12" name="n" aria-label="Input size n"></label><span class="mono" data-nval>12</span>' + SEP + btn("anim", "Animate n from 2", true) + '<span style="color:var(--quiet);font-size:.72rem">Y axis is clipped at n²; curves above it have left the chart.</span>',
        render: render,
        bind: function (api) {
          var range = api.controls.querySelector('[name="n"]'), out = api.controls.querySelector("[data-nval]");
          range.addEventListener("input", function () { out.textContent = range.value; api.touch(); api.still({ n: Number(range.value) }, "n = " + range.value + ". Compare the rows of the table: that is what the Big O class predicts."); });
          on(api, "anim", function () {
            var to = Number(range.value), fr = [];
            for (var k = 2; k <= to; k++) fr.push({ s: { n: k }, log: "n = " + k + ": n² = " + fmtNum(k * k) + ", 2ⁿ = " + fmtNum(Math.pow(2, k)) + "." });
            api.load(fr);
          });
          api.still({ n: 12 }, "Drag the slider. At n = 60, O(n²) is 3,600 steps; O(2ⁿ) is over a quintillion.");
        }
      });
    }
  });

  /* ---------- Mounting ---------- */
  DSA.mountViz = function (el, id, preset) {
    var def = DSA.viz[id];
    if (!def) { el.innerHTML = '<p class="viz-error">Visualizer “' + esc(id) + "” is not available.</p>"; return null; }
    try { return def.mount(el, preset); }
    catch (e) { el.innerHTML = '<p class="viz-error">This visualizer failed to load.</p>'; if (window.console) console.error(e); return null; }
  };
  DSA.mountVizSlots = function (root) {
    root.querySelectorAll(".viz-slot[data-viz]").forEach(function (slot) {
      DSA.mountViz(slot, slot.getAttribute("data-viz"), slot.getAttribute("data-preset"));
    });
  };
})();
