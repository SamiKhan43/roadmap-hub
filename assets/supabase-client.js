(() => {
  const cfg = window.ROADMAP_HUB_SUPABASE_CONFIG || {};
  const hasPlaceholders = !cfg.url || /YOUR_|PROJECT_REF/.test(cfg.url) || !cfg.anonKey || /YOUR_/.test(cfg.anonKey);

  const projectUrl = (() => {
    if (!cfg.url) return null;
    try {
      const url = new URL(cfg.url);
      if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
      if (!url.hostname.endsWith(".supabase.co")) return null;
      return url.origin;
    } catch {
      return null;
    }
  })();

  const isPublishableKey = (key) => {
    if (!key || /service_role|secret/i.test(key)) return false;
    if (key.startsWith("sb_publishable_")) return true;
    if (!key.startsWith("eyJ")) return false;
    try {
      const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.role === "anon";
    } catch {
      return false;
    }
  };

  const productionOrigin = "https://samikhan43.github.io";
  const callbackPath = "/roadmap-hub/auth/callback.html";
  const getSafeRedirectUrl = (requested) => {
    try {
      const redirect = requested ? new URL(requested) : new URL(`${window.location.origin}${callbackPath}`);
      const allowedOrigins = new Set([productionOrigin, "http://localhost:8000"]);
      if (!allowedOrigins.has(redirect.origin)) return null;
      if (redirect.pathname !== callbackPath && !(redirect.origin === "http://localhost:8000" && redirect.pathname === "/auth/callback.html")) return null;
      return redirect.href;
    } catch {
      return null;
    }
  };

  const siteBasePath = (() => {
    const path = window.location.pathname || "/";
    if (path.includes("/roadmap-hub/")) {
      return "/roadmap-hub";
    }
    return "";
  })();

  const resolvedConfig = {
    ...cfg,
    url: projectUrl,
    anonKey: isPublishableKey(cfg.anonKey) ? cfg.anonKey : "",
    siteBasePath,
    redirectUrl: getSafeRedirectUrl(
      window.location.hostname === "localhost"
        ? "http://localhost:8000/auth/callback.html"
        : cfg.redirectUrl || `${window.location.origin}${siteBasePath}/auth/callback.html`
    )
  };

  const client = (window.supabase && !hasPlaceholders && resolvedConfig.url && resolvedConfig.anonKey)
    ? window.supabase.createClient(resolvedConfig.url, resolvedConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce"
        }
      })
    : null;

  window.ROADMAP_HUB_SUPABASE = {
    config: resolvedConfig,
    isConfigured: Boolean(client),
    getClient() {
      if (!this.client && window.supabase && !hasPlaceholders && resolvedConfig.url && resolvedConfig.anonKey) {
        this.client = window.supabase.createClient(resolvedConfig.url, resolvedConfig.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: "pkce"
          }
        });
      }
      return this.client || null;
    },
    client
  };
})();
