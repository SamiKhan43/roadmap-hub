/*! Roadmap Hub – shared navigation. Add ONE tag right after <body>:
    <script src="<relative path>/assets/hub-nav.js"></script>
   Works at any folder depth, injects its own CSS, hides the legacy header, and shows auth state. */
(function () {
  "use strict";
  if (window.__hubNav) return;
  window.__hubNav = true;

  var cs = document.currentScript;
  var BASE = cs && cs.src ? new URL("../", cs.src).href : "/";
  var GITHUB = "https://github.com/SamiKhan43/roadmap-hub";
  var u = function (p) { return BASE + p; };

  /* ---------- data ---------- */
  var I = {
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    arrows: '<path d="m17 4 4 4-4 4M21 8H8M7 20l-4-4 4-4M3 16h13"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
    braces: '<path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1"/>',
    branch: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M18 10c0 5-12 2-12 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    dash: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    cube: '<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    up: '<path d="M7 17 17 7M8 7h9v9"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
    enter: '<path d="M9 10 4 15l5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>'
  };
  var ico = function (n, c) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (c ? ' class="' + c + '"' : "") + ">" + I[n] + "</svg>"; };

  var R = [
    { s: "backend-engineer-roadmap", t: "Backend Engineer", d: "Full path from fundamentals to senior", g: "Backend", i: "server", c: "198,243,106" },
    { s: "fastapi-roadmap", t: "FastAPI", d: "Build, secure and deploy Python APIs", g: "Backend", i: "zap", c: "34,211,238" },
    { s: "Auth-roadmap", t: "Auth & Authorization", d: "Sessions, tokens, permissions, identity", g: "Backend", i: "lock", c: "251,191,36" },
    { s: "sql-roadmap", t: "SQL", d: "From first SELECT to real database work", g: "Databases", i: "database", c: "52,211,153" },
    { s: "postgres-roadmap", t: "PostgreSQL", d: "Design, query and run Postgres", g: "Databases", i: "database", c: "129,140,248" },
    { s: "http-roadmap", t: "HTTP", d: "What happens between browser and server", g: "Networking", i: "arrows", c: "125,211,252" },
    { s: "protocols", t: "Protocols", d: "How systems talk across the network", g: "Networking", i: "radio", c: "198,243,106" },
    { s: "dsa", t: "Data Structures & Algorithms", d: "Structures, algorithms and patterns", g: "Foundations", i: "braces", c: "198,243,106" },
    { s: "git-github", t: "Git & GitHub", d: "Version control and collaboration", g: "Foundations", i: "branch", c: "158,188,255" }
  ];
  var COLS = [["Backend", "Databases"], ["Networking", "Foundations"]];
  var PAGES = [
    { t: "Home", p: "index.html", i: "home", k: "start" },
    { t: "Dashboard", p: "dashboard.html", i: "dash", k: "progress overview" },
    { t: "Skill Map", p: "skill-map.html", i: "map", k: "learn next paths" },
    { t: "Architecture Library", p: "architecture/index.html", i: "cube", k: "systems internals" },
    { t: "PostgreSQL internals", p: "architecture/postgresql/index.html", i: "cube", k: "architecture" },
    { t: "Web server architecture", p: "architecture/web-server/index.html", i: "cube", k: "architecture" },
    { t: "Computer fundamentals", p: "architecture/computer-fundamentals-module/computer-fundamentals/index.html", i: "cube", k: "architecture cpu memory" },
    { t: "Memory management", p: "architecture/computer-fundamentals-module/memory-management/index.html", i: "cube", k: "architecture ram" },
    { t: "Setup Guides", p: "setup-guides/index.html", i: "wrench", k: "install tools environment" },
    { t: "Profile", p: "profile.html", i: "user", k: "account settings" },
    { t: "Sign in", p: "auth/index.html", i: "user", k: "login account" }
  ];

  /* ---------- where are we? ---------- */
  var path = decodeURIComponent(location.pathname).toLowerCase();
  var rel = location.href.toLowerCase().indexOf(BASE.toLowerCase()) === 0 ? location.href.slice(BASE.length).split(/[?#]/)[0].toLowerCase() : path;
  var current = null;
  R.forEach(function (r) { var s = r.s.toLowerCase(); if (rel === s + ".html" || rel.indexOf(s + "/") === 0) current = r; });
  var section = current ? "roadmaps" :
    rel.indexOf("architecture/") === 0 ? "architecture" :
    rel.indexOf("skill-map") === 0 ? "skill-map" :
    rel.indexOf("setup-guides/") === 0 ? "setup-guides" :
    rel.indexOf("dashboard") === 0 ? "dashboard" : "";
  var isStatic = rel.indexOf("dsa/") === 0;
  var isDash = rel.indexOf("dashboard") === 0;

  /* ---------- early CSS so there is no flash ---------- */
  var css = document.createElement("link");
  css.rel = "stylesheet"; css.href = u("assets/hub-nav.css");
  document.head.appendChild(css);
  var early = document.createElement("style");
  early.textContent = "body>header:not(.hn)" + (isStatic || isDash ? "{}" : "{display:none!important}") + ".hn{position:sticky;top:0;height:60px;background:#0d0f0e;z-index:1000}";
  document.head.appendChild(early);

  /* ---------- markup ---------- */
  var cur = function (b) { return b ? ' aria-current="page"' : ""; };
  var row = function (r) {
    return '<a class="hn-row" role="menuitem" style="--hn-rgb:' + r.c + '" href="' + u(r.s) + '/"' + cur(current === r) + '><span class="hn-tile">' + ico(r.i) + '</span><span><strong>' + r.t + "</strong><small>" + r.d + "</small></span></a>";
  };
  var mega = COLS.map(function (col) {
    return "<div>" + col.map(function (g) {
      return '<p class="hn-group-label">' + g + "</p>" + R.filter(function (r) { return r.g === g; }).map(row).join("");
    }).join("") + "</div>";
  }).join("");

  var crumb = current
    ? '<div class="hn-crumb" style="--hn-rgb:' + current.c + '"><span class="hn-crumb-label" title="' + current.t + '"><span class="hn-dot"></span>' + current.t + "</span></div>"
    : "";

  var html =
    '<a class="hn-skip" href="#hn-main">Skip to content</a>' +
    '<div class="hn-bar"><div class="hn-left">' +
    '<a class="hn-brand" href="' + u("index.html") + '" aria-label="Roadmap Hub home"><img class="hn-full" src="' + u("logos/logo-horizontal-dark.svg") + '" alt="Roadmap Hub"><img class="hn-mark" src="' + u("logos/mascot-dark.svg") + '" alt=""></a>' +
    crumb +
    '</div><ul class="hn-links" role="menubar" aria-label="Primary">' +
    '<li class="hn-item" role="none"><button class="hn-link" type="button" role="menuitem" data-hn-toggle="hn-m-roadmaps" aria-haspopup="true" aria-expanded="false"' + (section === "roadmaps" ? ' aria-current="page"' : "") + '>Roadmaps' + ico("chev", "hn-chev") + "</button>" +
    '<div class="hn-menu" id="hn-m-roadmaps" role="menu" aria-label="Roadmaps"><div class="hn-cols">' + mega + '</div><div class="hn-menu-foot"><span>' + R.length + ' learning paths</span><a href="' + u("index.html") + '#roadmaps">Browse all ' + ico("up") + "</a></div></div></li>" +
    '<li role="none"><a class="hn-link" role="menuitem" href="' + u("architecture/index.html") + '"' + cur(section === "architecture") + ">Architecture</a></li>" +
    '<li role="none"><a class="hn-link" role="menuitem" href="' + u("skill-map.html") + '"' + cur(section === "skill-map") + ">Skill Map</a></li>" +
    '<li role="none"><a class="hn-link" role="menuitem" href="' + u("setup-guides/index.html") + '"' + cur(section === "setup-guides") + ">Setup Guides</a></li>" +
    "</ul>" +
    '<div class="hn-right">' +
    '<button class="hn-search" type="button" id="hn-search" aria-label="Search roadmaps and pages" aria-keyshortcuts="Control+K Meta+K">' + ico("search") + "<span>Search</span></button>" +
    '<a class="hn-icon hn-gh" href="' + GITHUB + '" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">' + ico("github") + "</a>" +
    '<div class="hn-item" id="hn-auth"><span class="hn-skel"></span></div>' +
    '<button class="hn-icon hn-burger" type="button" id="hn-burger" aria-label="Open menu" aria-expanded="false" aria-controls="hn-sheet">' + ico("menu") + "</button>" +
    "</div></div>" +
    '';

  var sheetHtml =
    '<a class="hn-big" href="' + u("index.html") + '">Home</a>' +
    '<p class="hn-group-label" style="margin-top:20px">Roadmaps</p>' +
    R.map(row).join("") +
    '<div style="margin-top:14px">' +
    '<a class="hn-big" href="' + u("architecture/index.html") + '"' + cur(section === "architecture") + ">Architecture Library" + ico("chev").replace("<svg", '<svg style="transform:rotate(-90deg)"') + "</a>" +
    '<a class="hn-big" href="' + u("skill-map.html") + '"' + cur(section === "skill-map") + ">Skill Map" + ico("chev").replace("<svg", '<svg style="transform:rotate(-90deg)"') + "</a>" +
    '<a class="hn-big" href="' + u("setup-guides/index.html") + '"' + cur(section === "setup-guides") + ">Setup Guides" + ico("chev").replace("<svg", '<svg style="transform:rotate(-90deg)"') + "</a></div>" +
    '<div id="hn-sheet-auth"></div>' +
    '<div class="hn-sheet-cta"><a class="hn-ghost" href="' + GITHUB + '" target="_blank" rel="noopener noreferrer">' + ico("github") + " GitHub</a></div>";

  var nav = document.createElement("div"); nav.setAttribute("role", "banner");
  nav.className = "hn" + (isStatic ? " hn--static" : "") + (current && /^(sql|postgres|fastapi|http)-roadmap$|^auth-roadmap$/i.test(current.s) ? " hn--under" : "");
  nav.innerHTML = html;
  var sheet = document.createElement("div");
  sheet.className = "hn-sheet"; sheet.id = "hn-sheet"; sheet.innerHTML = sheetHtml;
  var pal = document.createElement("div");
  pal.className = "hn-pal";
  pal.innerHTML = '<div class="hn-pal-box" role="dialog" aria-modal="true" aria-label="Search"><div class="hn-pal-in">' + ico("search") +
    '<input id="hn-pal-q" type="text" placeholder="Search roadmaps and pages…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="hn-pal-list"></div>' +
    '<ul class="hn-pal-list" id="hn-pal-list" role="listbox"></ul>' +
    '<div class="hn-pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd>navigate</span><span><kbd>↵</kbd>open</span><span><kbd>Esc</kbd>close</span></div></div>';

  (document.body || document.documentElement).insertBefore(nav, (document.body || document.documentElement).firstChild);
  document.body.appendChild(sheet);
  document.body.appendChild(pal);
  if (current) nav.style.setProperty("--hn-rgb", current.c);

  /* ---------- dropdowns ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var openMenu = null;
  function setMenu(btn, open) {
    var m = document.getElementById(btn.getAttribute("data-hn-toggle"));
    if (!m) return;
    m.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    openMenu = open ? btn : (openMenu === btn ? null : openMenu);
  }
  function closeMenus() { nav.querySelectorAll("[data-hn-toggle]").forEach(function (b) { setMenu(b, false); }); }
  nav.addEventListener("click", function (e) {
    var b = e.target.closest("[data-hn-toggle]");
    if (!b) return;
    var was = b.getAttribute("aria-expanded") === "true";
    closeMenus(); setMenu(b, !was);
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".hn-item")) closeMenus(); });
  var timer;
  nav.addEventListener("mouseover", function (e) {
    if (!window.matchMedia("(hover:hover)").matches) return;
    var it = e.target.closest(".hn-item"); var b = it && it.querySelector("[data-hn-toggle]");
    clearTimeout(timer);
    if (b && it.id !== "hn-auth") timer = setTimeout(function () { closeMenus(); setMenu(b, true); }, 90);
  });
  nav.addEventListener("mouseleave", function () { clearTimeout(timer); timer = setTimeout(closeMenus, 220); });
  nav.addEventListener("mouseenter", function () { clearTimeout(timer); });

  /* ---------- mobile sheet ---------- */
  var burger = $("#hn-burger");
  function setSheet(open) {
    sheet.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    burger.innerHTML = ico(open ? "x" : "menu");
    document.body.classList.toggle("hn-lock", open);
  }
  burger.addEventListener("click", function () { setSheet(!sheet.classList.contains("is-open")); });
  sheet.addEventListener("click", function (e) { if (e.target.closest("a")) setSheet(false); });
  window.matchMedia("(min-width:901px)").addEventListener("change", function (m) { if (m.matches) setSheet(false); });

  /* ---------- command palette ---------- */
  var items = R.map(function (r) { return { t: r.t, p: r.s + "/", i: r.i, c: r.c, tag: "Roadmap", k: r.g + " " + r.d + " " + r.s }; })
    .concat(PAGES.map(function (p) { return { t: p.t, p: p.p, i: p.i, c: "198,243,106", tag: "Page", k: p.k }; }));
  var q = $("#hn-pal-q"), list = $("#hn-pal-list"), sel = 0, shown = [], returnTo = null;
  function paint() {
    var terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    shown = items.filter(function (x) { var h = (x.t + " " + x.k).toLowerCase(); return terms.every(function (t) { return h.indexOf(t) > -1; }); }).slice(0, 9);
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.innerHTML = shown.length ? shown.map(function (x, n) {
      return '<li class="hn-pal-item" role="option" id="hn-o' + n + '" aria-selected="' + (n === sel) + '"><a href="' + u(x.p) + '"><span class="hn-tile" style="--hn-rgb:' + x.c + '">' + ico(x.i) + "</span><b>" + x.t + "</b><small>" + x.tag + "</small></a></li>";
    }).join("") : '<li class="hn-pal-empty">No matches for “' + q.value.replace(/[<>&]/g, "") + "”</li>";
    q.setAttribute("aria-activedescendant", shown.length ? "hn-o" + sel : "");
  }
  function openPal() { closeMenus(); setSheet(false); returnTo = document.activeElement; pal.classList.add("is-open"); q.value = ""; sel = 0; paint(); q.focus(); }
  function closePal() { pal.classList.remove("is-open"); if (returnTo && returnTo.focus) returnTo.focus(); }
  $("#hn-search").addEventListener("click", openPal);
  pal.addEventListener("mousedown", function (e) { if (e.target === pal) closePal(); });
  list.addEventListener("mousemove", function (e) { var li = e.target.closest(".hn-pal-item"); if (li) { sel = +li.id.slice(4); list.querySelectorAll("[aria-selected]").forEach(function (o, n) { o.setAttribute("aria-selected", n === sel); }); } });
  q.addEventListener("input", function () { sel = 0; paint(); });
  q.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); if (!shown.length) return;
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length; paint();
      var o = document.getElementById("hn-o" + sel); if (o) o.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); location.href = u(shown[sel].p); }
  });
  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); e.stopImmediatePropagation(); pal.classList.contains("is-open") ? closePal() : openPal(); }
    else if (e.key === "Escape") {
      if (pal.classList.contains("is-open")) closePal();
      else if (sheet.classList.contains("is-open")) { setSheet(false); burger.focus(); }
      else if (openMenu) { var b = openMenu; closeMenus(); b.focus(); }
    }
  }, true);

  /* ---------- auth ---------- */
  var authSlot = $("#hn-auth"), sheetAuth = $("#hn-sheet-auth"), client = null, lastKey = "__init";
  var login = u("auth/index.html");
  function initialOf(s) { return (s || "?").trim().charAt(0).toUpperCase(); }
  function render(session) {
    var user = session && session.user, key = user ? user.id : "";
    if (key === lastKey) return; lastKey = key;
    if (!user) {
      authSlot.innerHTML = '<a class="hn-cta hn-signin" href="' + login + '">Sign in</a>';
      sheetAuth.innerHTML = '<div class="hn-sheet-cta"><a class="hn-cta" href="' + login + '">Sign in</a></div>';
      return;
    }
    var meta = user.user_metadata || {};
    var name = meta.full_name || meta.name || (user.email || "Account").split("@")[0];
    var img = meta.avatar_url || meta.picture || "";
    var okImg = /^https:\/\//.test(img) ? img : "";
    authSlot.innerHTML =
      '<button class="hn-acct" type="button" data-hn-toggle="hn-m-acct" aria-haspopup="true" aria-expanded="false" aria-label="Account menu"><span class="hn-avatar"></span>' + ico("chev", "hn-chev") + "</button>" +
      '<div class="hn-menu hn-menu--acct" id="hn-m-acct" role="menu"><div class="hn-who"><b></b><span></span></div>' +
      '<a class="hn-acct-row" role="menuitem" href="' + u("dashboard.html") + '">' + ico("dash") + "Dashboard</a>" +
      '<a class="hn-acct-row" role="menuitem" href="' + u("profile.html") + '">' + ico("user") + "Profile</a>" +
      '<a class="hn-acct-row" role="menuitem" href="' + u("skill-map.html") + '">' + ico("map") + "Skill Map</a>" +
      '<button class="hn-acct-row hn-acct-row--out" type="button" role="menuitem" data-hn-out>' + ico("out") + "Sign out</button></div>";
    authSlot.querySelector(".hn-who b").textContent = name;
    authSlot.querySelector(".hn-who span").textContent = user.email || "";
    var av = authSlot.querySelector(".hn-avatar"); av.textContent = initialOf(name);
    if (okImg) { var im = new Image(); im.alt = ""; im.referrerPolicy = "no-referrer"; im.onerror = function () { im.remove(); }; im.src = okImg; av.appendChild(im); }
    sheetAuth.innerHTML =
      '<p class="hn-group-label">Account · ' + "</p>" +
      '<a class="hn-row" href="' + u("dashboard.html") + '"><span class="hn-tile" style="--hn-rgb:198,243,106">' + ico("dash") + "</span><span><strong>Dashboard</strong></span></a>" +
      '<a class="hn-row" href="' + u("profile.html") + '"><span class="hn-tile" style="--hn-rgb:198,243,106">' + ico("user") + "</span><span><strong>Profile</strong></span></a>" +
      '<button class="hn-row" style="width:100%;text-align:left" type="button" data-hn-out><span class="hn-tile" style="--hn-rgb:255,143,143">' + ico("out") + "</span><span><strong>Sign out</strong></span></button>";
    sheetAuth.querySelector(".hn-group-label").textContent = "Signed in as " + name;
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-hn-out]") || !client) return;
    var done = function () { location.href = u("index.html"); };
    client.auth.signOut().then(done, done);
  });
  function load(src, cb) { var s = document.createElement("script"); s.src = src; s.onload = cb; s.onerror = cb; document.head.appendChild(s); }
  function connect() {
    var api = window.ROADMAP_HUB_SUPABASE;
    try { client = api && api.getClient && api.getClient(); } catch (err) { client = null; }
    if (!client) { render(null); return; }
    client.auth.getSession().then(function (r) { render(r && r.data && r.data.session); }, function () { render(null); });
    client.auth.onAuthStateChange(function (_e, s) { render(s); });
  }
  function boot() {
    if (window.ROADMAP_HUB_SUPABASE) return connect();
    load(u("assets/supabase-config.js"), function () {
      var next = function () { load(u("assets/supabase-client.js"), connect); };
      window.supabase ? next() : load("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", next);
    });
  }

  /* ---------- page hookups (need parsed DOM) ---------- */
  function hookup() {
    if (isDash) document.body.classList.add("hn-dashboard");
    var legacy = document.querySelector("header:not(.hn)");
    if (legacy && !legacy.closest("main,article,section,aside,.hn")) legacy.classList.add(isStatic || isDash ? "hn-legacy-sub" : "hn-legacy");
    var main = document.querySelector("#main-content, #main, main");
    if (main) { if (!main.id) main.id = "main-content"; $(".hn-skip").setAttribute("href", "#" + main.id); }
  }
  var ready = function () { hookup(); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ready) : ready();
  document.readyState === "complete" ? boot() : window.addEventListener("load", boot);
})();
