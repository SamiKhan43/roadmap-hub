# Security Audit Report

| Security Check | Status | Details |
| --- | --- | --- |
| GitHub OAuth | NEEDS MANUAL VERIFICATION | Repository uses Supabase OAuth with the GitHub provider and fixed callback/redirect paths. Client secret placement and live provider behavior require dashboard verification. |
| Supabase authentication | NEEDS MANUAL VERIFICATION | Shared client uses a publishable key and `getUser()` verification. Live email/OAuth confirmation, provider settings, and session behavior require manual testing. |
| API key exposure | PASS | Repository contains a Supabase publishable key only. It contains no GitHub OAuth secret or Supabase `service_role` key; the client rejects secret/service-role keys. |
| RLS policies | NEEDS MANUAL VERIFICATION | `supabase/schema.sql` enables RLS, grants authenticated operations, and creates own-row policies for both tables. Live policy evaluation and dashboard configuration require manual verification. |
| Session management | NEEDS MANUAL VERIFICATION | The code persists Supabase sessions and verifies users with `getUser()` before private operations. Live refresh and expired-session behavior require testing. |
| OAuth callback | NEEDS MANUAL VERIFICATION | Callback verifies a session and user, then redirects only to fixed dashboard/login paths. Live PKCE exchange and callback configuration require manual testing. |
| XSS protection | PASS | Untrusted values use text nodes or escaped HTML in identified rendering paths. Static roadmap and guide content are repository-controlled. The setup-guide parser escapes text and restricts generated links. |
| Redirect validation | PASS | Browser OAuth redirects are fixed/allowlisted to the production Pages callback or localhost callback. No user-controlled `next`/`returnTo` parameter is used. |
| User data isolation | NEEDS MANUAL VERIFICATION | SQL policies and frontend queries scope to `auth.uid()`/the authenticated user. Live cross-user access tests in Supabase are still required. |
| Logout | NEEDS MANUAL VERIFICATION | Sign-out uses Supabase local scope and removes app/Supabase auth storage entries. Live sign-out behavior across the installed browser needs testing. |
