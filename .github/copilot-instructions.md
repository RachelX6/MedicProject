## Project snapshot (quick)

- Framework: Next.js (pages router). See `package.json` scripts: `dev`, `build`, `start`, `lint`.
- Auth & backend: Supabase (client in `lib/supabase.js`, auth helpers in `_app.js`).
- Protected routes: server-side middleware in `middleware.js` rewrites unauthenticated users to `/401`.
- Serverless logic: Supabase Functions invoked both via `supabase.functions.invoke(...)` and direct fetch to `${supabase.supabaseUrl}/functions/v1/...` (see `pages/timesheet.js`).

## Why this structure

- The app is a thin Next.js front-end that uses Supabase for auth, Postgres tables, and serverless functions. Pages are client components (most pages use `'use client'`) and call Supabase from the browser.
- Middleware centralizes auth: protected routes are defined in `middleware.js` so pages themselves can assume a session exists.

## Key files to read first

- `lib/supabase.js` — Supabase client + anon key used by some serverless fetches.
- `pages/_app.js` — wraps the app with Supabase `SessionContextProvider` and creates the browser client.
- `middleware.js` — shows protected routes and how unauthenticated requests are handled (rewrite to `/401`).
- `hooks/useProfile.js` and `components/Layout.js` — canonical patterns for reading user profile data from two tables: `volunteer_profiles` and `private_volunteer_profiles`.
- `pages/timesheet.js` — demonstrates invoking Supabase Functions and calling function endpoints with the user's access token.

## Patterns and conventions an agent should follow

- Auth helpers: use `useUser()` and `useSupabaseClient()` from `@supabase/auth-helpers-react` in client components. Example: `const supabase = useSupabaseClient()` and `const user = useUser()` (see `pages/profile.js`).
- Database reads: the code prefers `.from('table').select(...).eq('user_id', user.id).single()` and tolerates empty results (`PGRST116`), merging public + private fields in the UI layer (see `pages/profile.js`).
- Error handling: many pages catch errors, log to console, and surface simple alerts or UI messages. Keep error shapes consistent with Supabase SDK responses.
- Serverless invocations: prefer `supabase.functions.invoke(name, { body })` when possible; if access token is required, code fetches `${supabase.supabaseUrl}/functions/v1/<fn>` with Authorization: `Bearer ${accessToken}` (see `pages/timesheet.js`).

## Useful code snippets (copyable examples)

- Create browser client (already in `_app.js`):

  const [supabaseClient] = useState(() => createPagesBrowserClient())

- Get session/token for serverless fetch (timesheet):

  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token

- Invoke a Supabase Function (JS):

  const { error } = await supabase.functions.invoke('update_reservations', { body: { action: 'complete', reservation_id } })

## Dev/run/test commands

- Start dev server: `npm run dev` (Next.js default, port 3000).
- Build: `npm run build`; Production start: `npm run start`.
- Lint: `npm run lint`.

Note: there are no repository tests in the workspace. Use the browser and the Supabase project to validate flows that require the DB/auth.

## Integration points / external deps

- Supabase project (url + anon key present in `lib/supabase.js`) — many flows depend on the remote DB and Functions. Treat the anon key in `lib/supabase.js` as development-only; operations requiring user identity use the auth helpers.
- Third-party UI: `lucide-react` icons are used in `components/Layout.js`.

## Common pitfalls to avoid

- Changing protected-route behavior without updating `middleware.js` may break client expectations. Middleware rewrites to `/401`, not a 401 response.
- Some pages assume `user` exists (middleware ensures it for protected routes). When editing a page that is protected, preserve that assumption or add early guards: `if (!user) return <LoadingOverlay/>`.
- Supabase Functions sometimes require a Bearer token — check `pages/timesheet.js` for how access tokens are fetched.

## When to change server vs client

- Keep business logic that needs DB secrets or heavy compute in Supabase Functions (already used). UI-only transformations belong in pages/components.

## If you need to add features

- For authenticated pages: add route to `middleware.js` matcher. Update UI to assume `useUser()` will return a user.
- For new DB fields: update both `volunteer_profiles` and `private_volunteer_profiles` reads where applicable and merge in `pages/profile.js` or the `useProfile` hook.

---

If any section is unclear or you'd like examples expanded (e.g., more sample edits, testing guidance, or adding TypeScript types), tell me which part to expand and I'll update this file.
