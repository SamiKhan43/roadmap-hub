(() => {
  const APP_ROOT = window.ROADMAP_HUB_SUPABASE || {};
  const cfg = APP_ROOT.config || window.ROADMAP_HUB_SUPABASE_CONFIG || {};
  const basePath = (cfg.siteBasePath || ((window.location.pathname || "/").includes("/roadmap-hub/") ? "/roadmap-hub" : ""));
  const APP_PATHS = {
    home: `${basePath}/` || "/",
    login: `${basePath}/auth/index.html` || "/auth/index.html",
    dashboard: `${basePath}/dashboard.html` || "/dashboard.html",
    profile: `${basePath}/profile.html` || "/profile.html",
    callback: `${basePath}/auth/callback.html` || "/auth/callback.html"
  };

  const localProgressKeys = [
    "sql",
    "postgresql",
    "fastapi",
    "auth",
    "http",
    "protocols",
    "git-github"
  ];

  const roadmapKeyMap = {
    sql: "sql",
    postgresql: "postgresql",
    fastapi: "fastapi",
    auth: "auth",
    http: "http",
    protocols: "protocols",
    "git-github": "git-github"
  };

  const getLocalStorageKey = (key) => (key === "protocols" ? "rm:protocols:done" : `rm:${key}:t`);

  const readLocalProgress = (key) => {
    try {
      const storageKey = getLocalStorageKey(key);
      const value = localStorage.getItem(storageKey);
      if (!value) {
        return [];
      }
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
    } catch (error) {
      console.warn("Unable to read local progress", error);
      return [];
    }
  };

  const writeLocalProgress = (key, topics) => {
    const values = Array.from(new Set((topics || []).filter(Boolean).map(String))).sort();
    localStorage.setItem(getLocalStorageKey(key), JSON.stringify(values));
  };

  const readAllLocalProgress = () => {
    const merged = {};
    localProgressKeys.forEach((key) => {
      merged[key] = readLocalProgress(key);
    });
    return merged;
  };

  const normalizeProgressPayload = (userId, roadmapId, topicId, completed) => ({
    user_id: userId,
    roadmap_id: roadmapId,
    topic_id: String(topicId),
    completed: Boolean(completed),
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  });

  const getSupabaseClient = () => {
    const client = APP_ROOT.getClient ? APP_ROOT.getClient() : null;
    return client || (window.ROADMAP_HUB_SUPABASE && window.ROADMAP_HUB_SUPABASE.getClient ? window.ROADMAP_HUB_SUPABASE.getClient() : null);
  };

  const isConfigured = () => Boolean(getSupabaseClient());

  const getAuthenticatedUser = async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { session: null, error: new Error("Supabase is not configured.") };
    }

    const result = await client.auth.getSession();
    return { session: result.data?.session || null, error: result.error || null };
  };

  const renderAuthNavigation = async () => {
    const client = getSupabaseClient();
    const slots = document.querySelectorAll("[data-auth-nav]");
    const isHomePage = Boolean(document.getElementById("nav-content"));
    if (!slots.length) {
      return;
    }

    if (!client) {
      slots.forEach((slot) => {
        slot.innerHTML = `<a class="nav-link" href="${APP_PATHS.login}">Sign In</a>`;
      });
      return;
    }

    const authState = await client.auth.getSession();
    const session = authState.data?.session || null;
    const dashboardHref = `${basePath}/dashboard.html` || "/dashboard.html";
    const profileHref = `${basePath}/profile.html` || "/profile.html";
    const loginHref = `${basePath}/auth/index.html` || "/auth/index.html";

    const html = session && isHomePage
      ? `
        <div class="account-menu">
          <button type="button" class="nav-account" data-account-toggle aria-expanded="false" aria-controls="account-menu-panel">
            <i data-lucide="user-round" class="h-4 w-4" aria-hidden="true"></i>
            <span>Account</span>
            <i data-lucide="chevron-down" class="h-3.5 w-3.5" aria-hidden="true"></i>
          </button>
          <div class="account-menu__panel" id="account-menu-panel" aria-label="Account options" hidden>
            <a href="${dashboardHref}">Dashboard</a>
            <a href="${profileHref}">Profile</a>
            <button type="button" data-auth-logout>Sign out</button>
            <p class="account-menu__status" data-account-status role="status" aria-live="polite" hidden></p>
          </div>
        </div>
      `
      : session
      ? `
        <a class="nav-link" href="${dashboardHref}">Dashboard</a>
        <a class="nav-link" href="${profileHref}">Profile</a>
        <button type="button" class="nav-link" data-auth-logout>Log Out</button>
      `
      : `<a class="nav-link" href="${loginHref}">Sign In</a>`;

    slots.forEach((slot) => {
      slot.innerHTML = html;
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }

    if (isHomePage && session) {
      slots.forEach((slot) => {
        const toggle = slot.querySelector("[data-account-toggle]");
        const panel = slot.querySelector(".account-menu__panel");
        const status = slot.querySelector("[data-account-status]");
        if (!toggle || !panel) {
          return;
        }

        const close = (returnFocus = false) => {
          panel.hidden = true;
          toggle.setAttribute("aria-expanded", "false");
          if (returnFocus) {
            toggle.focus();
          }
        };

        toggle.addEventListener("click", () => {
          const open = panel.hidden;
          panel.hidden = !open;
          toggle.setAttribute("aria-expanded", String(open));
        });

        slot.addEventListener("click", (event) => {
          if (event.target.closest("a")) {
            close();
          }
        });

        document.addEventListener("click", (event) => {
          if (!slot.contains(event.target)) {
            close();
          }
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && !panel.hidden) {
            close(true);
          }
        });

        const logoutButton = slot.querySelector("[data-auth-logout]");
        logoutButton?.addEventListener("click", async () => {
          logoutButton.disabled = true;
          if (status) {
            status.hidden = true;
            status.textContent = "";
          }
          try {
            const { error } = await client.auth.signOut();
            if (error) {
              throw error;
            }
            window.location.href = APP_PATHS.home;
          } catch (error) {
            if (status) {
              status.textContent = error?.message || "Sign out failed. Please try again.";
              status.hidden = false;
            }
            logoutButton.disabled = false;
          }
        });
      });
      return;
    }

    document.querySelectorAll("[data-auth-logout]").forEach((button) => {
      button.addEventListener("click", async () => {
        const logoutClient = getSupabaseClient();
        if (!logoutClient) {
          return;
        }
        await logoutClient.auth.signOut();
        window.location.href = `${basePath}/` || "/";
      });
    });
  };

  const migrationKey = "roadmap-hub-progress-migration";

  const migrateLocalProgressToCloud = async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { moved: 0, skipped: true };
    }

    const migrationComplete = sessionStorage.getItem(migrationKey) === "done";
    if (migrationComplete) {
      return { moved: 0, skipped: true };
    }

    const currentSession = await client.auth.getSession();
    const user = currentSession.data?.session?.user;
    if (!user) {
      return { moved: 0, skipped: true };
    }

    const localProgress = readAllLocalProgress();
    const rows = [];
    Object.entries(localProgress).forEach(([roadmapId, topics]) => {
      topics.forEach((topicId) => {
        rows.push(normalizeProgressPayload(user.id, roadmapKeyMap[roadmapId] || roadmapId, topicId, true));
      });
    });

    if (!rows.length) {
      sessionStorage.setItem(migrationKey, "done");
      return { moved: 0, skipped: true };
    }

    const { error } = await client.from("progress").upsert(rows, { onConflict: "user_id,roadmap_id,topic_id", ignoreDuplicates: false });
    if (error) {
      console.warn("Cloud migration failed", error);
      return { moved: 0, skipped: false, error };
    }

    sessionStorage.setItem(migrationKey, "done");
    return { moved: rows.length, skipped: false };
  };

  const upsertTopicProgress = async (roadmapKey, topicId, completed) => {
    const client = getSupabaseClient();
    if (!client) {
      return { status: "local-only" };
    }

    const currentSession = await client.auth.getSession();
    const user = currentSession.data?.session?.user;
    if (!user) {
      return { status: "local-only" };
    }

    const row = normalizeProgressPayload(user.id, roadmapKeyMap[roadmapKey] || roadmapKey, topicId, completed);
    const { error } = await client.from("progress").upsert([row], { onConflict: "user_id,roadmap_id,topic_id", ignoreDuplicates: false });

    if (error) {
      console.warn("Supabase sync failed", error);
      return { status: "local-only", error };
    }

    return { status: "synced" };
  };

  const syncRoadmapProgress = async (roadmapKey, topicId, completed) => {
    const localTopics = readLocalProgress(roadmapKey);
    const nextTopics = new Set(localTopics);
    if (completed) {
      nextTopics.add(String(topicId));
    } else {
      nextTopics.delete(String(topicId));
    }
    writeLocalProgress(roadmapKey, [...nextTopics]);
    const result = await upsertTopicProgress(roadmapKey, topicId, completed);
    return result;
  };

  const getProfileFromSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }

    const sessionResult = await client.auth.getSession();
    const user = sessionResult.data?.session?.user;
    if (!user) {
      return null;
    }

    const { data, error } = await client.from("profiles").select("*").eq("id", user.id).single();
    return error ? null : data;
  };

  const setPageNotice = (message, type = "error") => {
    const target = document.getElementById("auth-status") || document.getElementById("page-status");
    if (!target) {
      return;
    }
    target.textContent = message;
    target.dataset.state = type;
  };

  const configureAuthPage = async () => {
    const loginForm = document.getElementById("auth-form");
    if (!loginForm) {
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setPageNotice("Add your Supabase project URL and publishable key before enabling email or GitHub auth.");
      const buttons = document.querySelectorAll("[data-auth-action]");
      buttons.forEach((button) => {
        button.disabled = true;
      });
      return;
    }

    const session = await client.auth.getSession();
    if (session.data?.session) {
      window.location.href = `${basePath}/dashboard.html` || "/dashboard.html";
      return;
    }

    const modeToggle = document.getElementById("auth-mode");
    const formTitle = document.getElementById("auth-form-title");

    const setMode = (mode) => {
      const isSignUp = mode === "signup";
      if (formTitle) {
        formTitle.textContent = isSignUp ? "Create your account" : "Welcome back";
      }
      if (modeToggle) {
        modeToggle.textContent = isSignUp ? "Already have an account? Sign in" : "Need an account? Create one";
      }
      const button = document.getElementById("auth-submit");
      if (button) {
        button.textContent = isSignUp ? "Create account" : "Sign in";
      }
      loginForm.dataset.mode = mode;
    };

    if (modeToggle) {
      modeToggle.addEventListener("click", () => {
        const currentMode = loginForm.dataset.mode === "signup" ? "signin" : "signup";
        setMode(currentMode);
      });
    }

    setMode("signin");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      const mode = loginForm.dataset.mode || "signin";

      if (!email || !password || (mode === "signup" && password.length < 8)) {
        setPageNotice(mode === "signup" ? "Please enter a valid email and a password with at least 8 characters." : "Please enter both your email and password.", "error");
        return;
      }

      const submitButton = document.getElementById("auth-submit");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = mode === "signup" ? "Creating account..." : "Signing in...";
      }

      try {
        let result;
        if (mode === "signup") {
          result = await client.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: email.split("@")[0]
              }
            }
          });
        } else {
          result = await client.auth.signInWithPassword({ email, password });
        }

        if (result.error) {
          throw result.error;
        }

        setPageNotice(mode === "signup" ? "Account created. Check your email to confirm your address before signing in." : "Signed in successfully.", "success");

        if (mode === "signin") {
          window.location.href = `${basePath}/dashboard.html` || "/dashboard.html";
        }
      } catch (error) {
        const message = error?.message || "Authentication failed.";
        setPageNotice(message, "error");
      } finally {
        const submitButton = document.getElementById("auth-submit");
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = loginForm.dataset.mode === "signup" ? "Create account" : "Sign in";
        }
      }
    });

    const githubButton = document.getElementById("github-oauth");
    if (githubButton) {
      githubButton.addEventListener("click", async () => {
        githubButton.disabled = true;
        githubButton.textContent = "Redirecting to GitHub...";
        try {
          const redirectTo = cfg.redirectUrl || `${window.location.origin}${basePath}/auth/callback.html`;
          const { error } = await client.auth.signInWithOAuth({
            provider: "github",
            options: {
              redirectTo,
              scopes: "read:user user:email"
            }
          });
          if (error) {
            throw error;
          }
        } catch (error) {
          githubButton.disabled = false;
          githubButton.textContent = "Continue with GitHub";
          setPageNotice(error?.message || "GitHub sign-in could not be started.", "error");
        }
      });
    }
  };

  const initAuthStatus = async () => {
    await renderAuthNavigation();
  };

  window.ROADMAP_HUB_PROGRESS = {
    readLocalProgress,
    writeLocalProgress,
    readAllLocalProgress,
    migrateLocalProgressToCloud,
    syncRoadmapProgress,
    getAuthenticatedUser,
    getProfileFromSupabase,
    configureAuthPage,
    isConfigured,
    APP_PATHS
  };

  document.addEventListener("DOMContentLoaded", async () => {
    initAuthStatus();
    configureAuthPage();
  });
})();
