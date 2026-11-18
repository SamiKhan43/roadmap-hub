# Supabase setup for Roadmap Hub

This repository is designed to work with optional Supabase authentication and cloud progress sync without requiring a backend service. The code expects a static frontend with a browser-only JavaScript client, and it uses the public Supabase anon key and RLS policies for protection.

## What you must do in the Supabase dashboard

### 1. Copy the project URL

In the Supabase dashboard:

1. Open your project.
2. Go to Project Settings > API.
3. Copy the Project URL value.
4. Paste it into `assets/supabase-config.js` as `url`.

Example:

```js
url: "https://xyz123abc456.supabase.co"
```

### 2. Copy the publishable key

In the same API settings area:

1. Find the `anon` publishable key.
2. Copy it.
3. Paste it into `assets/supabase-config.js` as `anonKey`.

This is the only key that should live in the frontend code. Do not paste the database password, the `service_role` key, or any secret key into the browser.

### 3. Configure the project

After you save the config values, run the SQL in `supabase/schema.sql` inside the Supabase SQL Editor:

```sql
-- paste the contents of supabase/schema.sql here
```

This creates the `profiles` and `progress` tables, the profile trigger, the indexes, and the RLS policies.

### 4. Enable email authentication

In Supabase dashboard:

1. Go to Authentication > Providers.
2. Enable Email.
3. If you want verification before login, enable Email OTP / email confirmation in the email provider settings.
4. Set your site name and email templates if you want custom messages.

### 5. Configure GitHub OAuth

In GitHub:

1. Open GitHub Settings > Developer settings > OAuth Apps.
2. Create a new OAuth app.
3. Set the Homepage URL to `https://samikhan43.github.io/roadmap-hub/`
4. Set the Authorization callback URL to `https://samikhan43.github.io/roadmap-hub/auth/callback.html`
5. Copy the Client ID and Client Secret.

In Supabase dashboard:

1. Open Authentication > Providers > GitHub.
2. Enable GitHub.
3. Paste the Client ID and Client Secret.
4. Save the provider.

### 6. Configure redirect URLs

In Supabase dashboard, check Authentication > URL Configuration:

- Add `https://samikhan43.github.io/roadmap-hub/`
- Add `https://samikhan43.github.io/roadmap-hub/auth/callback.html`
- If you test locally, also add `http://localhost:8000/` and `http://localhost:8000/auth/callback.html`

This matters because GitHub OAuth is not usable until the redirect URL matches the production URL for the GitHub Pages deployment.

## What Copilot implemented in the repo

The repository includes:

- `assets/supabase-config.js` with placeholders for your project URL and anon key.
- `assets/supabase-client.js` as the shared Supabase client bootstrap.
- `assets/supabase-app.js` for auth state, navigation updates, and cloud/local progress syncing.
- `auth/index.html` for sign in and sign up.
- `auth/callback.html` for OAuth redirects.
- `dashboard.html` for the personal dashboard.
- `profile.html` for account details and profile updates.
- `supabase/schema.sql` with the full migration.

## How to test the flow

1. Open the site locally with a static server, such as `python3 -m http.server 8000`.
2. Go to `http://localhost:8000/auth/index.html`.
3. Create an account with email/password.
4. Confirm the email if email confirmation is enabled.
5. Sign in and verify you are redirected to the dashboard.
6. Complete a topic on a roadmap and confirm it syncs to the cloud.
7. Sign out, then sign back in to confirm the session persists.
8. Click `Continue with GitHub` to confirm the OAuth flow completes.
9. Verify progress data appears in the dashboard.

## Troubleshooting

### Redirect mismatch

If GitHub sign-in fails, check the callback URL in GitHub and the redirect URLs in Supabase Authentication > URL Configuration.

### Empty dashboard

This is normal for a new account. Complete a topic, refresh, and confirm the sync writes into the `progress` table.

### Auth session not persisting

Check that the Supabase project is using the correct URL and anon key, and that the browser accepts cookies / session storage for the project domain.

### `permission denied` or RLS errors

For `permission denied for table progress`, run this in the Supabase SQL Editor:

```sql
grant select, insert, update, delete on table public.progress to authenticated;
```

PostgreSQL table grants allow the operation to be attempted; the `progress_*_own` RLS policies still restrict each operation to rows owned by the signed-in user. Do not disable RLS or use a service-role key in the browser. The repository migration, `supabase/schema.sql`, now includes the required client grants.

For other RLS errors, confirm the migration ran successfully and each policy checks `auth.uid()` against the matching user ID.

### Local progress not merging

Make sure the localStorage keys match the roadmap keys used in the site, such as `rm:sql:t`, `rm:postgresql:t`, and `rm:auth:t`.

## Important manual setup checklist

- Copy the Supabase project URL
- Copy the anon publishable key
- Run `supabase/schema.sql`
- Enable Email auth
- Configure GitHub OAuth
- Add redirect URLs
- Verify the GitHub Pages production URL is `https://samikhan43.github.io/roadmap-hub/`

Once those steps are complete, the optional cloud sync will work without exposing any secret key or using a backend server.
