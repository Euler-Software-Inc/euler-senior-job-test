# Senior Engineer — Take-Home Assessment

Welcome, and thanks for taking the time. This isn't a puzzle test — every task here mirrors work you'd actually do on our team. We care most about **how you reason, how you handle unfamiliar code, and how fast you adapt**, not about memorized trivia.

**A few ground rules:**
- **Use AI tools freely.** We expect it and we'll ask you about how you used them afterward.
- Estimated effort is **6–10 hours**, at your own pace. Take what you need by **[due date]**.
- Everything runs on **free tools** — no paid services required.
- There are no trick questions. When in doubt, make a call and explain your reasoning.

---

## The scenario

**Nimbus** is a small SaaS product moving off a no-code platform onto a real codebase. You've been handed the early-stage app: it works *mostly*, but it's rough, it's missing a key capability, and a data migration still looms. Your job is to stabilize it, extend it, review a teammate's change, and plan the move.

**Stack:** React + Vite + TypeScript on the frontend, talking directly to a free **Supabase** project (Postgres, Auth, and row-level security).

## Getting started

1. **Fork** [repo URL] and clone your fork.
2. Follow the `README` to install, create a free Supabase project, and add your keys to `.env`.
3. Work on a branch. When done, open a PR **to your own fork** (or just share the repo link) with everything below.

---

## Task 1 — Stabilize & extend the app · ~6h

The main task, all on the same codebase, in three parts.

**1a · Bug hunt (~1.5h).** The app misbehaves in a couple of ways:
- The task list sometimes shows results from a *previous* search.
- The app gets noticeably sluggish after switching between workspaces several times.

Find the **root cause** of each, fix them, and note what each bug actually was in your PR description.

**1b · Performance (~1h).** Find and fix at least one *real* performance issue beyond the bugs above. Tell us how you spotted it and what you changed.

**1c · Multi-tenancy & roles (~3.5h).** The app has no real access control yet. Add:
- **Workspace isolation** — a user only ever sees their own workspace's data, enforced **at the database level with Supabase row-level security (RLS)**, not just hidden in the UI.
- **Roles** — *Admin* (manage members + all data), *Member* (create/edit), *Viewer* (read-only), enforced through your **RLS policies**, with the UI reflecting them as defense-in-depth.

Add automated tests for the access rules (e.g. signed in as different users/roles), and include a short note justifying your tenancy strategy (e.g. shared tables with RLS vs schema-per-tenant) and why.

## Task 2 — Review a pull request · ~1h

In `/review/PR.md` you'll find a teammate's proposed change. Review it the way you would on a real PR:
- Give an **overall verdict** (approve / request changes) and flag issues, if any, by severity.
- Security is part of the bar for any approval here — we don't ship changes that put the product or its data at risk. Weigh it alongside correctness, readability, and maintainability.
- Not everything that looks off is actually wrong. If something seems suspicious but turns out fine, say so — and say why.

## Task 3 — Migration plan · ~2h

Write a short plan in `MIGRATION.md` (~1–2 pages) covering two things:
1. **Target stack** — recommend the stack you'd take Nimbus forward on, and argue for it: the tradeoffs, and why you'd choose it over the alternatives.
2. **Data migration** — pick **one specific slice** (e.g. migrating the users or tasks table from the old platform into your Postgres schema) and lay out the steps, the risks, and how you'd avoid downtime or data loss.

## Task 4 — Project walkthrough · ~30 min

Record a **5–10 minute video** (Loom or similar). **No need to show real or employer code** — just talk us through a project you've worked on:
- What was the architecture, and one hard technical decision you made?
- How did you approach **performance, scalability, and security**?
- What would you do differently today?

Add the video link to your `README`.

---

## What happens after you submit

We'll meet for **60–90 minutes** to:
- Walk through your thinking on each task — the challenges, what you tried, and why you chose what you chose.
- Talk through your migration plan.
- Open the app together and make a **small change live, using AI**, so we can see how you work in real time.

## Before you submit — checklist

- [ ] Bugs fixed, with a note on what each one was
- [ ] At least one performance fix, explained
- [ ] Workspace isolation + roles working, enforced **at the DB level**, with tests
- [ ] Tenancy-strategy note included
- [ ] PR review written, with a verdict
- [ ] `MIGRATION.md` included
- [ ] Walkthrough video link in your `README`

Stuck on setup or unsure about scope? Reach out to **[contact]**. We'd much rather see how you think than a flawless submission — have fun with it.
