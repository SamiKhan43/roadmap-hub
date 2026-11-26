/* DSA top bar: account avatar menu (uses the existing Supabase client). */
(function () {
  "use strict";
  var slot = document.getElementById("dsa-acct");
  if (!slot) return;
  var LOGIN = "../auth/index.html", DASH = "../dashboard.html", PROFILE = "../profile.html", HOME = "../index.html";
  var client = null, last = "__init";

  function signedOut() {
    slot.innerHTML = '<a class="acct-signin" href="' + LOGIN + '">Sign in</a>';
  }
  function signedIn(user) {
    var m = user.user_metadata || {};
    var name = m.full_name || m.name || (user.email || "Account").split("@")[0];
    var img = m.avatar_url || m.picture || "";
    slot.innerHTML =
      '<button type="button" class="acct-btn" aria-haspopup="true" aria-expanded="false" aria-label="Account menu"><span class="acct-avatar"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>' +
      '<div class="acct-menu" hidden><div class="acct-who"><b></b><span></span></div>' +
      '<a href="' + DASH + '">Dashboard</a><a href="' + PROFILE + '">Profile</a>' +
      '<button type="button" data-out>Sign out</button></div>';
    slot.querySelector(".acct-who b").textContent = name;
    slot.querySelector(".acct-who span").textContent = user.email || "";
    var av = slot.querySelector(".acct-avatar");
    av.textContent = name.charAt(0).toUpperCase();
    if (/^https:\/\//.test(img)) {
      var im = new Image(); im.alt = ""; im.referrerPolicy = "no-referrer";
      im.onerror = function () { im.remove(); }; im.src = img; av.appendChild(im);
    }
  }
  function render(session) {
    var user = session && session.user, key = user ? user.id : "";
    if (key === last) return; last = key;
    user ? signedIn(user) : signedOut();
  }

  function toggle(open) {
    var b = slot.querySelector(".acct-btn"), m = slot.querySelector(".acct-menu");
    if (!b || !m) return;
    m.hidden = !open; b.setAttribute("aria-expanded", String(open));
  }
  slot.addEventListener("click", function (e) {
    if (e.target.closest(".acct-btn")) { var m = slot.querySelector(".acct-menu"); toggle(m.hidden); return; }
    if (e.target.closest("[data-out]") && client) {
      var go = function () { location.href = HOME; };
      client.auth.signOut().then(go, go);
    }
  });
  document.addEventListener("click", function (e) { if (!e.target.closest("#dsa-acct")) toggle(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });

  function connect() {
    var api = window.ROADMAP_HUB_SUPABASE;
    try { client = api && api.getClient && api.getClient(); } catch (err) { client = null; }
    if (!client) { render(null); return; }
    client.auth.getSession().then(function (r) { render(r && r.data && r.data.session); }, function () { render(null); });
    client.auth.onAuthStateChange(function (_e, s) { render(s); });
  }
  signedOut(); last = "";
  if (document.readyState === "complete") connect(); else window.addEventListener("load", connect);
})();
