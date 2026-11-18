(() => {
  const cfg = window.ROADMAP_HUB_SUPABASE_CONFIG || {};
  const hasPlaceholders = !cfg.url || /YOUR_|PROJECT_REF/.test(cfg.url) || !cfg.anonKey || /YOUR_/.test(cfg.anonKey);

  const siteBasePath = (() => {
    const path = window.location.pathname || "/";
    if (path.includes("/roadmap-hub/")) {
      return "/roadmap-hub";
    }
    return "";
  })();

  const resolvedConfig = {
    ...cfg,
    siteBasePath,
    redirectUrl: cfg.redirectUrl || `${window.location.origin}${siteBasePath}/auth/callback.html`
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
