/* Shared helpers used by lesson/problem content files and the app.
   Content files call these to build HTML so formatting stays consistent. */
(function () {
  "use strict";
  var DSA = (window.DSA = window.DSA || {});
  DSA.lessons = DSA.lessons || {};
  DSA.problems = DSA.problems || [];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  var PY_TOKEN = /\b(def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|class|self|import|from|as|pass|break|continue|lambda|yield|try|except|finally|raise|with|global|nonlocal|del)\b|\b(\d+(?:\.\d+)?)\b/g;

  /* Very small Python highlighter: comments, strings, keywords, numbers. */
  function highlightPython(src) {
    var out = "";
    var lines = String(src).split("\n");
    lines.forEach(function (line, li) {
      var codePart = line, comment = "";
      var inStr = null;
      for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (inStr) { if (ch === inStr && line[i - 1] !== "\\") inStr = null; }
        else if (ch === '"' || ch === "'") inStr = ch;
        else if (ch === "#") { codePart = line.slice(0, i); comment = line.slice(i); break; }
      }
      var tokens = codePart.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
      tokens.forEach(function (tok, ti) {
        if (ti % 2 === 1) { out += '<span class="str">' + esc(tok) + "</span>"; return; }
        var e = esc(tok).replace(PY_TOKEN, function (match, keyword) {
          return keyword ? '<span class="kw">' + match + "</span>" : '<span class="num">' + match + "</span>";
        });
        out += e;
      });
      if (comment) out += '<span class="com">' + esc(comment) + "</span>";
      if (li < lines.length - 1) out += "\n";
    });
    return out;
  }

  function dedent(src) {
    var lines = String(src).replace(/^\n+|\s+$/g, "").split("\n");
    var min = Infinity;
    lines.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    return lines.map(function (l) { return l.slice(min === Infinity ? 0 : min); }).join("\n");
  }

  /* code(src, label) -> highlighted Python block with a copy button. */
  function code(src, label) {
    var clean = dedent(src);
    return '<div class="code"><div class="code-head"><span>' + esc(label || "Python") +
      '</span><button type="button" data-copy>Copy</button></div><pre><code data-raw="' + esc(clean) + '">' +
      highlightPython(clean) + "</code></pre></div>";
  }

  /* plain(src, label) -> monospace block without highlighting (output, traces). */
  function plain(src, label) {
    return '<div class="code"><div class="code-head"><span>' + esc(label || "Output") + '</span></div><pre>' + esc(dedent(src)) + "</pre></div>";
  }

  function callout(kind, title, html) {
    var cls = kind === "warn" ? " is-warn" : kind === "info" ? " is-info" : kind === "mistake" ? " is-mistake" : "";
    return '<div class="callout' + cls + '"><span class="callout-title">' + esc(title) + "</span>" + html + "</div>";
  }

  /* figure(innerHtml, caption) */
  function figure(inner, caption) {
    return '<figure class="figure">' + inner + (caption ? "<figcaption>" + caption + "</figcaption>" : "") + "</figure>";
  }

  /* diagram(text, caption) -> preformatted ASCII diagram inside a figure. */
  function diagram(text, caption) {
    return figure("<pre>" + esc(dedent(text)) + "</pre>", caption);
  }

  /* cells(values, opts) -> a row of array cells. opts: {hl:[indices], addr:baseAddress, step:bytes, index:true} */
  function cells(values, opts) {
    opts = opts || {};
    var hl = opts.hl || [];
    var html = '<div class="cells">';
    values.forEach(function (v, i) {
      var cls = "cell" + (hl.indexOf(i) >= 0 ? " is-hl" : "") + (v === null ? " is-empty" : "");
      html += '<div class="' + cls + '"><span class="v">' + (v === null ? "·" : esc(v)) + "</span>";
      if (opts.index !== false) html += '<span class="i">' + i + "</span>";
      if (opts.addr != null) html += '<span class="a">' + (opts.addr + i * (opts.step || 8)) + "</span>";
      html += "</div>";
    });
    return html + "</div>";
  }

  function table(head, rows) {
    var h = '<div class="table-wrap"><table><thead><tr>' + head.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead><tbody>";
    rows.forEach(function (r) { h += "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; });
    return h + "</tbody></table></div>";
  }

  /* viz(id) -> placeholder that the app replaces with a live visualizer. */
  function viz(id, preset) {
    return '<div class="viz-slot" data-viz="' + esc(id) + '"' + (preset ? ' data-preset="' + esc(preset) + '"' : "") + "></div>";
  }

  /* link(topicId, text) -> internal link to another lesson. */
  function link(id, text) {
    return '<a class="text-link" href="#/topic/' + esc(id) + '">' + esc(text) + "</a>";
  }

  DSA.h = { esc: esc, code: code, plain: plain, callout: callout, figure: figure, diagram: diagram, cells: cells, table: table, viz: viz, link: link, highlightPython: highlightPython, dedent: dedent };

  /* Register a lesson. Called from lessons-*.js files. */
  DSA.lesson = function (id, data) { DSA.lessons[id] = data; };
  DSA.problem = function (data) { DSA.problems.push(data); };
})();
