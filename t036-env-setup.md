# T036 — Add the Missing Environment Variables

`backend/config.ts` requires `SUPABASE_SERVICE_ROLE_KEY`, and it's read on
**every authenticated API request** (via `auth.middleware.ts`). It is
currently missing from `.env`, so every authenticated request will fail
until this is fixed. This file walks through fixing it. **Nobody should
paste the actual key into a chat, a commit, or anywhere public** — it grants
full admin access to your database, bypassing Row-Level Security entirely.

## 1. Get the service role key
1. Go to https://supabase.com/dashboard and open the Smart Stock Savvy
   project.
2. **Project Settings → API**.
3. Under "Project API keys", copy the **`service_role`** secret (not the
   `anon`/`publishable` one you already have).

> A safe placeholder template listing every variable the app needs is
> committed at [`.env.example`](../.env.example) — copy it to `.env` and
> fill in real values rather than typing variable names from memory.

## 2. Add it locally (for each developer's machine)
Open `.env` in the project root (it already exists and is git-ignored — do
**not** remove it from `.gitignore`) and add:
```
SUPABASE_SERVICE_ROLE_KEY=<paste the service_role key here>
OPENAI_API_KEY=<optional — only needed for the agent-assistant chat feature>
```
Restart `npm run dev` after saving.

## 3. Add it to the deployed environment
Wherever the app is actually hosted (Lovable project settings, or whatever
platform serves the published URL):
1. Find the project's **Environment Variables / Secrets** section.
2. Add `SUPABASE_SERVICE_ROLE_KEY` with the same value as above.
3. Optionally add `OPENAI_API_KEY` if you want the "Inventory assistant"
   chat feature to work (without it, `hasOpenAIConfig()` returns false and
   that one feature is disabled gracefully — everything else still works).
4. Redeploy / restart the app so it picks up the new variable.

## 4. Verify it worked
After redeploying, log in to the live app and open the **Dashboard**. If
you see inventory data and recommendations load (not a spinner forever, not
an error), the key is working. If you still see errors, check the server
logs for `Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY`.

## 5. Update the tracker
Once confirmed working, update the **T036** row in
`docs/project-implementation.md`: change Status to `Completed`, fill in who
did it and when, and note the evidence (e.g. "Dashboard loads live data at
<url> as of <date>").
