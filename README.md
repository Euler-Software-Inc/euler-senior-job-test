# Nimbus

A small multi-workspace task tracker (React + Vite + TypeScript talking directly
to Supabase). This is the starter codebase for the Euler senior-engineer
take-home assessment.

👉 **Read [`TASKS.md`](./TASKS.md) first — it's the actual assignment.** This
README only gets the app running.

> ⏱️ Setup is designed to take **well under 30 minutes** and runs entirely on
> **free tiers** (Supabase free tier + local dev). No paid services.

---

## Prerequisites

- **Node.js 18+** and npm (`node --version`)
- A free **Supabase** account — <https://supabase.com>
- Git

## 1. Create a free Supabase project

1. Sign in to Supabase and **New project**. Pick any name; choose the free plan
   and a region near you. Save the database password somewhere.
2. Wait for it to finish provisioning (~2 min).
3. **Disable email confirmation** so signups work instantly during the
   assessment: *Authentication → Sign In / Providers → Email →* turn **off**
   "Confirm email", and save. (Optional but recommended.)

## 2. Apply the schema and seed data

Open *SQL Editor* in your Supabase dashboard and run, in order:

1. The contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)
   — creates the tables. **Note:** RLS is intentionally OFF (that's Task 1c).
2. The contents of [`supabase/seed.sql`](./supabase/seed.sql) — creates two
   workspaces (`Acme`, `Globex`) and a pile of tasks.

(If you prefer the Supabase CLI, you can `supabase db push` / `supabase db
reset` instead — both files are CLI-compatible.)

## 3. Configure environment variables

In Supabase, go to *Project Settings → API* and copy the **Project URL** and the
**anon / publishable** key. Then:

```bash
cd web
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

> The anon key is **meant** to be public and is safe in the browser — it's
> protected by RLS. Never put the service-role key in this file. See
> [`web/.env.example`](./web/.env.example) for why.

## 4. Install and run

```bash
cd web
npm install
npm run dev      # http://localhost:5173
```

## 5. Create your login and link it to a workspace

1. In the app, **Create account** with any email + password. (With email
   confirmation disabled, you're signed in immediately.)
2. Back in the Supabase SQL Editor, link your user to a workspace. Replace the
   email with the one you just registered:

   ```sql
   insert into public.memberships (user_id, workspace_id, role)
   select u.id, '11111111-1111-1111-1111-111111111111', 'admin'
   from auth.users u where u.email = 'you@example.com'
   on conflict (user_id, workspace_id) do nothing;
   ```

   (The membership-linking SQL — including a second user as a `viewer` — is also
   at the bottom of [`supabase/seed.sql`](./supabase/seed.sql).)
3. Reload the app. You should see the `Acme` workspace and its tasks, and be
   able to switch workspaces from the top bar.

---

## Commands

All from inside `web/`:

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Vite) |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm test` | Run the test suite once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Where each task lives

Your write-ups and responses already have homes in the repo — just fill them in.
Code goes in the app; the **explanations** the tasks ask for go in these files.

| Task | Where to work | Where your answer goes |
|---|---|---|
| **1a — Bugs** | `web/src/components/TaskList.tsx` (search behavior, the auto-refresh effect, the title updater). Symptoms are in `TASKS.md`. | [`SOLUTION.md`](./SOLUTION.md) → *1a* |
| **1b — Performance** | How tasks are loaded/filtered — start in `web/src/components/TaskList.tsx`. Measure before you fix. | [`SOLUTION.md`](./SOLUTION.md) → *1b* |
| **1c — Multi-tenancy & roles** | `supabase/migrations/0001_init.sql` (RLS off), `supabase/policies/rls_policies.sql` (your policy work), UI gating in `web/src/components/`, tests in `web/src/test/`. | [`SOLUTION.md`](./SOLUTION.md) → *1c* |
| **2 — PR review** | Read [`review/PR.md`](./review/PR.md) | [`review/PR-response.md`](./review/PR-response.md) |
| **3 — Migration plan** | — | [`MIGRATION.md`](./MIGRATION.md) |
| **4 — Walkthrough video** | Record a 5–10 min video | [`VIDEO-WALKTHROUGH.md`](./VIDEO-WALKTHROUGH.md) |

## Project layout

```
.
├── README.md              ← you are here
├── TASKS.md               ← the assignment (read this)
├── SOLUTION.md            ← Task 1 write-up (bugs, perf, tenancy) — fill in
├── MIGRATION.md           ← Task 3 migration plan — fill in
├── VIDEO-WALKTHROUGH.md   ← Task 4 video link — fill in
├── review/
│   ├── PR.md              ← Task 2: the PR to review (given)
│   └── PR-response.md     ← Task 2: your review — fill in
├── web/                   ← React + Vite + TS app
│   ├── .env.example
│   └── src/
│       ├── components/    ← TaskList, TaskItem, Nav, WorkspaceSwitcher
│       ├── context/       ← AuthContext, WorkspaceContext
│       ├── pages/         ← Login, Signup, Dashboard
│       └── test/          ← test setup + RBAC test template
└── supabase/
    ├── migrations/        ← schema (RLS deliberately disabled)
    ├── seed.sql           ← 2 workspaces + tasks + membership template
    ├── policies/          ← RLS policy stubs for Task 1c
    └── functions/         ← Edge Function scaffold (where server secrets live)
```

## Your walkthrough video

Add your 5–10 min walkthrough link to [`VIDEO-WALKTHROUGH.md`](./VIDEO-WALKTHROUGH.md)
before submitting (Task 4).

---

Stuck on setup? It really should be quick — if a step fights you for more than
a few minutes, note it and reach out. We care far more about how you reason than
about a flawless setup.
