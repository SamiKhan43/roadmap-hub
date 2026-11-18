# Supabase Setup Guide

This guide covers Supabase Auth for a browser-based web application, including dashboard setup, email and Google sign-in, sessions, password recovery, PostgreSQL profiles, and row-level security (RLS). It also includes a small working project using HTML, CSS, JavaScript, and the official Supabase JavaScript client.

The examples use a Vite development server so project settings can be read from environment variables. A publishable key is public by design; database policies, not a hidden frontend key, protect user data.

## 1. Understand PostgreSQL and Supabase Auth

Supabase provides a managed PostgreSQL database and a separate authentication service called **Supabase Auth**. Auth stores and manages account and authentication data in the protected `auth` schema of the project's PostgreSQL database. Application code should use Supabase Auth APIs rather than directly editing its internal tables.

Supabase Auth manages common authentication work for you:

- Registering accounts and verifying email addresses
- Checking login credentials and securely storing password hashes
- Creating, refreshing, and ending user sessions
- Sending password reset links
- Connecting external identity providers such as Google through OAuth

Without an authentication service, you would have to design and maintain password hashing, credential verification, token issuance and validation, session expiration, refresh, account recovery, and related security protections. Supabase Auth implements these flows and exposes them through client libraries and APIs, so your application does not need to handle raw passwords or build its own session system.

Authentication and authorization are related but different:

- **Authentication** establishes who signed in. Supabase Auth issues a signed access token (JWT) for the session.
- **Authorization** determines what that user may do. PostgreSQL RLS policies can use the authenticated user's ID to allow or deny each row.

Use your own PostgreSQL tables for application-specific information such as a username, preferences, or records created by the user. Link each user's application records to the Auth user ID, then use RLS to restrict access to the matching rows.

## 2. Configure Supabase Auth in the dashboard

### Open your project and enable email authentication

1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select the project you want to configure.
3. In the project navigation, open **Authentication**.
4. Open **Sign In / Providers** (some dashboard layouts label this **Providers**).
5. Select the **Email** provider. Email and password sign-in is enabled by default for hosted projects; confirm that the provider is enabled.
6. In the Email provider settings, choose whether to require **Confirm email** before a new account can sign in. Email confirmation is enabled by default for hosted projects.
7. Save any changes.

When confirmation is required, the flow is:

1. The user submits an email and password in your application.
2. `signUp()` creates the account and Supabase sends a confirmation message.
3. Until confirmation, the signup response normally has a user but no active session. Do not treat this as a signed-in user.
4. The user opens the message and follows its link. Supabase verifies the address and redirects to an allowed application URL. In a client-only flow, the app may receive a session as part of this confirmation redirect; otherwise, ask the user to sign in.
5. If email confirmation is disabled, a session can be returned immediately after signup.

The built-in email service is intended for testing, has strict delivery limits, and may only send to authorized team addresses. For real users, configure a custom mail provider that supports SMTP:

1. Get the SMTP host, port, username, password, and verified sender address from your email provider.
2. In your project, open **Authentication > Emails > SMTP Settings**.
3. Enable custom SMTP and enter the provider's settings and sender details.
4. Save the settings and test a confirmation or password reset email.

Never put SMTP credentials in browser code or a public repository. See the [Supabase custom SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp) for provider and deliverability details.

### Configure redirect URLs

In the dashboard, open **Authentication > URL Configuration**:

1. Set **Site URL** to your deployed application's base URL. Supabase uses it when an auth request does not supply a redirect.
2. Add the exact local and production app URLs under **Redirect URLs** (also called the redirect URL allow list).
3. Save the configuration.

For Vite's default development server, allow `http://localhost:5173/**`. For production, allow only the URL patterns your app needs, for example `https://example.com/**`. Avoid broad production wildcards. A URL passed from JavaScript as `emailRedirectTo` or `redirectTo` must match this allow list.

### Find registered users

Open **Authentication > Users** in the project dashboard to view registered Auth users and their account status. Do not use the dashboard user list as an application profile store; store app-specific fields in your own PostgreSQL tables.

## 3. Create a JavaScript client

### Find the Project URL and publishable key

In the dashboard, open your project's **Connect** dialog or **Project Settings > API Keys**:

- Copy the **Project URL**, such as `https://abcdefghijk.supabase.co`.
- Copy a **publishable key**, which starts with `sb_publishable_`.

The publishable key identifies the application and is designed to be included in frontend code. It does not grant a user permission to read every row; RLS and database grants still control data access.

Never expose a **secret key** (starts with `sb_secret_`) or legacy `service_role` credential in browser code, HTML, a frontend environment variable, or a public repository. These credentials have elevated access and bypass RLS. Keep them on a trusted server only. Supabase is moving from legacy `anon` and `service_role` keys to publishable and secret keys, so use the current key types for new projects.

### Install the package and configure environment variables

Create a vanilla Vite project and install the official client:

```bash
npm create vite@latest supabase-auth-demo -- --template vanilla
cd supabase-auth-demo
npm install
npm install @supabase/supabase-js
npm run dev
```

Create `.env.local` in the project root:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
```

Replace both example values with your project's URL and publishable key. Add `.env.local` to `.gitignore` and do not commit real project configuration unnecessarily. Vite exposes variables prefixed with `VITE_` to browser code, so these variables are **not secret storage**; only put the URL and publishable key here. A secret key must never have a `VITE_` prefix.

Create `src/supabaseClient.js`:

```js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
```

The client uses browser storage and refreshes sessions automatically by default. Restart the Vite server after changing `.env.local`.

## 4. Implement authentication features

The examples below use the `supabase` client created above. Supabase methods return an `error` value instead of throwing for normal Auth and database errors, so check it after every request.

### Sign up with email and password

Validate input in the browser for a helpful experience, but remember that the client is not a security boundary. Supabase enforces the configured password requirements.

```js
async function signUp(email, password, username) {
  if (!email || !password || password.length < 8) {
    showMessage("Enter a valid email and a password of at least 8 characters.", true);
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
      data: { username },
    },
  });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  if (!data.session) {
    showMessage("Account request received. Check your email for a confirmation link, then sign in.");
    return;
  }

  showMessage("Your account is ready.");
}
```

If email confirmation is enabled, `data.session` is normally `null` until the user confirms their address. The response may also avoid identifying whether an email is already registered. Display a neutral success message and do not rely on `data.user` being present for every signup response.

The redirect URL passed as `emailRedirectTo` must be included in **Authentication > URL Configuration > Redirect URLs**.

### Log in

```js
async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showMessage(`Could not sign in: ${error.message}`, true);
    return;
  }

  showMessage(`Signed in as ${data.user.email}.`);
}
```

Incorrect credentials, an unconfirmed email, or an account created with a different provider can prevent sign-in. Supabase may use a generic credential error so that an attacker cannot discover which email addresses have accounts.

### Log out

```js
async function logOut() {
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    showMessage(`Could not sign out: ${error.message}`, true);
    return;
  }

  showMessage("You have signed out.");
}
```

The explicit `local` scope signs out this browser session. The default scope signs out all of the user's sessions, so choose the behavior intentionally.

### Retrieve a session and keep the UI in sync

Use `getSession()` to read the current browser session. In a browser-only client, the SDK stores and refreshes the session automatically. Use `getUser()` when you need user details verified by a request to the Auth server; do not treat locally stored session values as a security check on a trusted server.

```js
const { data: { session }, error } = await supabase.auth.getSession();

if (error) {
  showMessage(`Could not restore the session: ${error.message}`, true);
} else if (session) {
  console.log("Current session:", session);
  console.log("Signed-in user:", session.user);
} else {
  console.log("No user is signed in.");
}

const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError) {
  showMessage(`Could not verify the current user: ${userError.message}`, true);
}
```

Subscribe to auth changes so the interface responds to signup, sign-in, sign-out, token refresh, and browser refresh:

```js
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  renderSignedInState(session);
  if (event === "TOKEN_REFRESHED") console.log("Session refreshed.");
});

// When the page or component is removed:
subscription.unsubscribe();
```

Keep the callback synchronous; do not `await` another Supabase request inside it. Schedule follow-up database requests after the callback returns. The client refreshes an expired access token when possible. If the refresh token is expired, revoked, or otherwise invalid, the session ends and the user must sign in again. Handle `null` sessions and show the signed-out screen rather than assuming a session will always exist.

### Request a password reset and update the password

First request a reset email. The redirect must be in the project's allowed redirect URLs:

```js
async function requestPasswordReset(email) {
  const redirectTo = `${window.location.origin}${window.location.pathname}#update-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    showMessage(`Could not send the reset email: ${error.message}`, true);
    return;
  }

  showMessage("If the address can receive a reset email, a link has been sent.");
}
```

When the user follows the link, Supabase returns them to the application with a recovery session. Show a form for a new password after receiving `PASSWORD_RECOVERY`, then call `updateUser()`:

```js
supabase.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") showPasswordUpdateForm();
});

async function updatePassword(newPassword) {
  if (newPassword.length < 8) {
    showMessage("Use a password of at least 8 characters.", true);
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    showMessage(`Could not update the password: ${error.message}`, true);
    return;
  }

  showMessage("Your password has been updated. You can now sign in with it.");
}
```

### Configure and use Google OAuth

The Google Cloud callback and the redirect back to your app are different URLs:

- **Google's authorized redirect URI** is Supabase's callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`. Copy the exact value shown on the Google provider page in your Supabase dashboard.
- **Supabase's app redirect URL** is where the user returns after the OAuth flow, such as `http://localhost:5173/` or your production site. Add it under **Authentication > URL Configuration > Redirect URLs**.

Configure Google:

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project and open **Google Auth Platform**.
2. Configure the consent screen's branding and audience. Choose the appropriate audience for your app, and add test users if the app is in testing mode.
3. Under **Data Access**, include the `openid`, `.../auth/userinfo.email`, and `.../auth/userinfo.profile` scopes required for basic Google sign-in.
4. Under **Clients**, create an OAuth client ID with application type **Web application**.
5. Add your app's origin (for example `http://localhost:5173`) to **Authorized JavaScript origins**.
6. Add the Supabase callback URL shown on the Supabase Google provider setup page to **Authorized redirect URIs**.
7. Save the Google Client ID and Client Secret.
8. In Supabase, open **Authentication > Sign In / Providers > Google**, enable Google, enter the Client ID and Client Secret, and save.
9. Add the local and production app return URLs to **Authentication > URL Configuration > Redirect URLs**.

The Google Client Secret belongs in Supabase's provider settings, not in frontend code. During OAuth, the browser goes to Google, Google returns to Supabase, and Supabase establishes a Supabase session before redirecting the browser back to the app.

Start Google sign-in from the frontend:

```js
async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });

  if (error) showMessage(`Could not start Google sign-in: ${error.message}`, true);
}
```

`signInWithOAuth()` redirects the page to Google; handle the resulting session using the same session listener as email sign-in.

## 5. Connect Auth users to PostgreSQL profiles

`auth.users` is maintained by Supabase Auth and contains account identity and authentication-related fields. Do not add application columns to this managed table. A `public.profiles` table is application data that your app controls.

Use the Auth user's UUID as the profile's primary key and foreign key. This gives every profile exactly one owner, links it to the account that Auth manages, and lets `auth.uid()` match a profile row in an RLS policy.

Open **SQL Editor** in your Supabase project and run:

```sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
```

RLS policies limit which rows a role can access; PostgreSQL grants determine which operations the role may attempt at all. This example revokes existing client grants, grants only the required operations, and gives each signed-in user access only to a row whose `id` matches their Auth user ID. It intentionally does not allow profile deletion.

Never put a secret or service-role key in the browser to work around an RLS error. Fix the table grants or policies instead.

### Insert and retrieve the user's profile

Signup stores the username in Auth user metadata, but the profile table remains the authoritative application record. When confirmation is enabled, signup usually has no session, so it cannot insert a protected profile row yet. Insert or update the profile after a session is established:

```js
async function saveProfileForUser(user) {
  const username = user.user_metadata?.username ?? null;
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, username },
      { onConflict: "id" },
    )
    .select("id, username, created_at")
    .single();

  if (error) {
    showMessage(`Could not save your profile: ${error.message}`, true);
    return null;
  }

  return data;
}
```

Run this after signup only if `signUp()` returned a session, or after the user signs in following email confirmation. The ID comes from the authenticated user; do not accept another user's profile ID from a form.

Retrieve the signed-in user's profile:

```js
async function loadMyProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    showMessage(`Could not verify your account: ${userError.message}`, true);
    return null;
  }
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    showMessage(`Could not load your profile: ${error.message}`, true);
    return null;
  }
  return data;
}
```

Even if a client accidentally requests another user's ID, the RLS policy will not return that user's row.

## 6. Protect application pages and data

For a browser-only application, check the session to decide what to display and redirect signed-out visitors for a smoother user experience:

```js
const { data: { session }, error } = await supabase.auth.getSession();

if (error) {
  showMessage(`Could not check your session: ${error.message}`, true);
} else if (!session) {
  window.location.assign("/login.html");
} else {
  document.querySelector("#welcome").textContent =
    `Signed in as ${session.user.email}`;
}
```

Use `textContent` for user-provided information rather than inserting it as HTML. To show a logout button, call `supabase.auth.signOut({ scope: "local" })` and handle its error as shown above. A session listener should also update the page or redirect when the user signs out or the session expires.

Frontend route checks are not sufficient security: a visitor can bypass JavaScript and call the Data API directly. Enforce data permissions in PostgreSQL with RLS policies and least-privilege grants. Never rely on a hidden page, a disabled button, or a frontend check to protect database records.

## 7. Practical project: a small login and signup website

This project uses a single page with signup, login, password reset, a protected dashboard, and a profile. It uses the project and client setup in section 3.

### Create `index.html`

Replace the starter `index.html` created by Vite:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Supabase Auth Demo</title>
  </head>
  <body>
    <main class="card">
      <h1>Account demo</h1>
      <p id="message" role="status" aria-live="polite"></p>

      <section id="signed-out">
        <form id="signup-form">
          <h2>Create account</h2>
          <label>Username <input name="username" autocomplete="username"></label>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>Password <input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
          <button type="submit">Sign up</button>
        </form>

        <form id="login-form">
          <h2>Sign in</h2>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>Password <input name="password" type="password" autocomplete="current-password" required></label>
          <button type="submit">Log in</button>
        </form>

        <form id="reset-form">
          <h2>Forgot password?</h2>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <button type="submit">Send reset email</button>
        </form>

        <button id="google-button" type="button">Continue with Google</button>
      </section>

      <section id="recovery" hidden>
        <form id="password-form">
          <h2>Choose a new password</h2>
          <label>New password <input name="password" type="password" minlength="8" required></label>
          <button type="submit">Update password</button>
        </form>
      </section>

      <section id="dashboard" hidden>
        <h2>Dashboard</h2>
        <p>Signed in as <span id="user-email"></span></p>
        <p>Username: <span id="profile-username"></span></p>
        <p>Profile created: <span id="profile-created"></span></p>
        <button id="logout-button" type="button">Log out</button>
      </section>
    </main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### Create `src/style.css`

```css
body {
  margin: 0;
  padding: 2rem 1rem;
  background: #f3f4f6;
  color: #172033;
  font: 16px/1.5 system-ui, sans-serif;
}

.card {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 0.5rem 2rem #17203318;
}

form {
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

label {
  display: grid;
  gap: 0.25rem;
}

input, button {
  box-sizing: border-box;
  min-height: 2.75rem;
  padding: 0.6rem;
  font: inherit;
}

button {
  cursor: pointer;
}

#message[data-error="true"] {
  color: #b42318;
}
```

### Create `src/main.js`

This file connects the forms to Supabase Auth, maintains the dashboard state, and reads the profile. It calls the profile upsert only after a real session exists, including after a confirmed user signs in.

```js
import { supabase } from "./supabaseClient.js";
import "./style.css";

const $ = (selector) => document.querySelector(selector);
const signedOut = $("#signed-out");
const recovery = $("#recovery");
const dashboard = $("#dashboard");
const message = $("#message");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.dataset.error = String(isError);
}

function showSignedOut() {
  signedOut.hidden = false;
  recovery.hidden = true;
  dashboard.hidden = true;
}

function showRecovery() {
  signedOut.hidden = true;
  recovery.hidden = false;
  dashboard.hidden = true;
}

async function showDashboard(session) {
  if (!session) {
    showSignedOut();
    return;
  }

  signedOut.hidden = true;
  recovery.hidden = true;
  dashboard.hidden = false;
  $("#user-email").textContent = session.user.email ?? "";

  const { data: existingProfile, error: readError } = await supabase
    .from("profiles")
    .select("username, created_at")
    .eq("id", session.user.id)
    .maybeSingle();

  if (readError) {
    showMessage(`Could not load your profile: ${readError.message}`, true);
    return;
  }

  let data = existingProfile;
  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: session.user.id,
        username: session.user.user_metadata?.username ?? null,
      })
      .select("username, created_at")
      .single();

    if (insertError) {
      showMessage(`Could not create your profile: ${insertError.message}`, true);
      return;
    }

    data = newProfile;
  }

  $("#profile-username").textContent = data.username ?? "Not set";
  $("#profile-created").textContent = new Date(data.created_at).toLocaleDateString();
}

$("#signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get("email")).trim();
  const password = String(form.get("password"));
  const username = String(form.get("username")).trim();
  if (password.length < 8) {
    showMessage("Use a password of at least 8 characters.", true);
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
      data: { username },
    },
  });

  if (error) {
    showMessage(error.message, true);
  } else if (!data.session) {
    showMessage("Check your email for a confirmation link. Then return here to sign in.");
  } else {
    showMessage("Account created.");
  }
});

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email")).trim(),
    password: String(form.get("password")),
  });

  if (error) showMessage(`Could not sign in: ${error.message}`, true);
});

$("#reset-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get("email")).trim();
  const redirectTo = `${window.location.origin}${window.location.pathname}#update-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) showMessage(`Could not send the reset email: ${error.message}`, true);
  else showMessage("If the address can receive a reset email, a link has been sent.");
});

$("#password-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const password = String(form.get("password"));
  if (password.length < 8) {
    showMessage("Use a password of at least 8 characters.", true);
    return;
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) showMessage(`Could not update the password: ${error.message}`, true);
  else {
    window.history.replaceState(null, "", window.location.pathname);
    showMessage("Password updated. You can sign in with your new password.");
  }
});

$("#google-button").addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });

  if (error) showMessage(`Could not start Google sign-in: ${error.message}`, true);
});

$("#logout-button").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) showMessage(`Could not sign out: ${error.message}`, true);
  else showMessage("You have signed out.");
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "INITIAL_SESSION") return;

  if (event === "PASSWORD_RECOVERY") {
    queueMicrotask(() => showRecovery());
    return;
  }

  queueMicrotask(() => {
    if (session) void showDashboard(session);
    else showSignedOut();
  });
});

const { data: { session }, error } = await supabase.auth.getSession();
if (error) {
  showSignedOut();
  showMessage(`Could not restore your session: ${error.message}`, true);
} else if (window.location.hash === "#update-password") {
  showRecovery();
} else {
  await showDashboard(session);
}
```

### Run the project

1. Run `npm run dev` from the project directory.
2. Open the local URL Vite prints, usually `http://localhost:5173`.
3. Check that the local app URL is in **Authentication > URL Configuration > Redirect URLs**.
4. Sign up. If confirmation is enabled, open the email and confirm the account, then sign in.
5. Confirm the dashboard displays the Auth user's email and profile data.
6. Test password reset and Google sign-in after configuring their dashboard settings.
7. Sign out and refresh the page. The dashboard should remain protected and show the signed-out forms.

The files work together as follows: `index.html` contains the forms and dashboard, `style.css` styles them, `supabaseClient.js` creates the shared client, and `main.js` connects user actions to Auth and profile queries. The SQL profile policies remain the database's actual access control.

## 8. Choose an authentication architecture

### Architecture A: Supabase Auth

```text
Frontend
   |
   v
Supabase Auth
   |
   v
Supabase PostgreSQL
```

Supabase Auth validates email/password or the OAuth identity, issues Supabase access and refresh tokens, and manages the session. The Supabase client sends the user's access token with database requests. PostgreSQL uses the token identity with RLS to decide which rows the user can access. The frontend uses a publishable key; RLS and grants protect the data.

Choose this approach when you want managed authentication, direct client-to-Supabase data access, and database-enforced per-user permissions without implementing a separate auth service.

### Architecture B: Custom backend authentication

```text
Frontend
   |
   v
FastAPI Backend
   |
   v
PostgreSQL
```

In a custom design, your FastAPI application is responsible for the authentication system: validating credentials, securely hashing and verifying passwords, issuing and validating its own tokens or sessions, handling expiration and refresh, and authorizing API requests. The browser calls FastAPI; FastAPI connects to PostgreSQL using its server-side database credentials. Do not copy Supabase Auth users, tokens, or assumptions into a separate custom auth implementation without a deliberate integration design.

Choose this approach when your application needs its own API boundary, custom identity lifecycle or authorization rules, backend-only data access, or must use an existing authentication system. It requires more engineering and security maintenance.

### Using Supabase Auth with FastAPI

These are distinct architectures, but Supabase Auth can authenticate users who call a FastAPI backend. The browser signs in with Supabase Auth and sends its Supabase access token as a bearer token to FastAPI. FastAPI must verify the token using a trusted Supabase-supported verification method and validate expected claims, issuer, and signature before trusting the user ID. It must not trust a user ID supplied separately by the browser.

The backend can then either:

- Use a Supabase client or request context that forwards the user's JWT to the Data API so PostgreSQL RLS continues to run as that user; or
- Connect directly to PostgreSQL and enforce authorization in FastAPI, using appropriately restricted database roles and policies.

Do not use a secret/service-role key for user-scoped requests that should obey RLS. A privileged key bypasses RLS; if a trusted backend uses one for administrative work, it must independently authorize every operation and never expose that key to the browser. Supabase Auth still owns authentication in this hybrid design; FastAPI verifies the Supabase token rather than creating a separate password session.

## 9. Troubleshooting and security checklist

### Confirmation or reset email does not arrive

- Check spam and verify the address.
- For the default email service, check its recipient restrictions and low rate limit.
- For production delivery, configure custom SMTP, verify the sender domain with your email provider, and review the SMTP provider's delivery logs.
- Check **Authentication > Emails** for the relevant template and confirm the link uses the correct redirect variables.

### Redirect URL is rejected or goes to the wrong page

- Check **Authentication > URL Configuration** and add the exact app URL used by the flow.
- Confirm the **Site URL** is the deployed site, not a development URL.
- For Google, make sure Google Cloud's authorized redirect URI is the Supabase callback URL; the application's return URL is configured separately in Supabase.

### Google login fails

- Confirm Google is enabled under **Authentication > Sign In / Providers > Google** and that the client ID and secret are correct.
- Confirm the Google Cloud authorized redirect URI exactly matches the callback shown by Supabase.
- For a Google app in testing mode, add the account as a test user.
- Check the browser console and Supabase Auth logs for the provider error.

### `Invalid login credentials`

Check the email and password, confirm the account's email if required, and ensure the account was not created exclusively through a different sign-in provider. The error may intentionally not reveal which condition occurred.

### Profile query returns an RLS or permission error

- Run the profile SQL in the correct project.
- Confirm RLS is enabled and each policy uses `auth.uid()` and the profile `id`.
- Confirm the `authenticated` role has the required table grant.
- Confirm the request has an active session. Do not resolve the error by exposing a secret key.

### Session is missing after refresh

Confirm the Project URL and publishable key match the intended project, and inspect browser storage and console errors. The Supabase client persists and refreshes browser sessions by default. If a session is expired, revoked, or cannot refresh, show the signed-out UI and ask the user to log in again.

## 10. Official documentation

- [Supabase Auth overview](https://supabase.com/docs/guides/auth)
- [JavaScript sign up](https://supabase.com/docs/reference/javascript/auth-signup)
- [JavaScript password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [JavaScript Auth sessions](https://supabase.com/docs/guides/auth/sessions)
- [Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [PostgreSQL Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
