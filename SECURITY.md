# Security

## GitHub OAuth

For GitHub sign-in, the browser sends an OAuth request to Supabase with the GitHub provider. Supabase redirects to GitHub and then returns the authenticated result to the fixed callback page at `/roadmap-hub/auth/callback.html`. The GitHub OAuth client secret is configured only in the Supabase GitHub provider settings and must never be committed to this repository.

The browser receives only a Supabase session. It does not receive or store the GitHub client secret. OAuth callback destinations are limited to known production/local callback paths; arbitrary redirect query parameters are not used.

## Supabase authentication

Supabase Auth supports email/password and GitHub OAuth sessions. The shared client uses the Supabase project URL and publishable key, enables session persistence and token refresh, uses PKCE, and rejects client keys that are `service_role`, secret, or JWT keys without an `anon` role. Authenticated pages call `getSession()` for local state and `getUser()` to verify the signed-in user with Supabase before displaying or writing private data.

The project URL and publishable key are public configuration and may be included in frontend code. They are not substitutes for RLS or server-side authorization.

## Information collected

Depending on use, the application collects:

- Email address and authentication provider metadata.
- GitHub profile metadata exposed by Supabase, such as name, username, and avatar URL.
- Optional profile display name and username.
- Roadmap, topic, and completion status data.
- Completion timestamps and local progress state.

Anonymous browsing does not require account authentication.

## Information stored

Without an account, completed topic IDs are stored in browser `localStorage` under roadmap-specific `rm:*` keys.

With Supabase configured and an authenticated session, profiles and progress are stored in the `profiles` and `progress` tables. Supabase Auth also maintains its session in browser storage. The application does not manually write passwords or tokens to local storage.

The project does not intentionally collect analytics or payment information.

## User data protection

The frontend does not expose service-role or GitHub secrets. Database row access is scoped by RLS policies. Profile and progress pages use the authenticated user's ID and do not accept an owner ID supplied by another user. Display values are written with DOM text APIs or escaped in HTML-rendering paths.

GitHub Pages provides HTTPS for the production site. Public code and assets are not encrypted as secrets because they are intentionally served to browsers.

## Database permissions

`supabase/schema.sql` creates `profiles` and `progress`, enables RLS on both tables, revokes broad table privileges, and grants only the operations needed by the `authenticated` role:

- Profiles: select, insert, and update only for the authenticated user's matching profile.
- Progress: select, insert, update, and delete only for rows whose `user_id` equals `auth.uid()`.

The migration includes length constraints for profile names, roadmap IDs, and topic IDs. The `handle_new_user` trigger creates a profile after authentication account creation. The SQL must be run in the intended Supabase project and policies must be verified in its dashboard.

## Implemented security measures

- Publishable-key-only frontend configuration.
- Rejection of service-role, secret, and non-anonymous JWT keys in the browser client.
- Supabase PKCE session handling and automatic refresh.
- Server-side Supabase verification through `getUser()` on private pages.
- Fixed OAuth callback and redirect allowlists.
- RLS and authenticated-role table grants.
- Local-only sign-out with removal of app authentication storage.
- Input length validation for profile and progress fields.
- Escaping and text-only DOM output for untrusted/rendered values.
- Fixed internal navigation paths.

## Known limitations

- Live OAuth provider behavior and live database RLS cannot be proven from repository files alone.
- GitHub Pages is a static host and cannot hide public frontend configuration or enforce server-only authorization.
- Browser local progress may be inspected or modified by the device user; it is not a security boundary.
- Third-party CDNs used by the site are external dependencies and should be considered in supply-chain and availability reviews.
- Email confirmation, password policy, OAuth redirect URLs, and provider secrets are Supabase/GitHub dashboard settings and must be configured manually.
- CSP headers cannot be configured directly by repository files on standard GitHub Pages.

## Reporting vulnerabilities

Do not publish secrets or sensitive account data in public issues. Report suspected vulnerabilities privately to the repository maintainer through GitHub Security Advisories for this repository, or contact the maintainer through the contact method listed on their GitHub profile.

Include affected URL/file, reproduction steps, impact, and any relevant sanitized logs. Avoid accessing or modifying another user's data while testing.
