import { describe, it } from 'vitest'

/**
 * TEMPLATE for Task 1c — DELETE the `.skip` and implement these once your RLS
 * policies exist.
 *
 * These are *integration* tests: they exercise real Supabase Auth + RLS, not
 * mocks, because the whole point of Task 1c is that the rules hold at the
 * database level even when the client is bypassed.
 *
 * Suggested setup:
 *   - Create a couple of test users (e.g. via supabase.auth.admin in a setup
 *     script using the service-role key — server-side / in test config only,
 *     NEVER in app code).
 *   - Sign each user in with the anon client (createClient(url, ANON_KEY)) so
 *     queries run as that user under RLS.
 *   - Point tests at a disposable/local Supabase project, not production.
 *
 * The cases below describe WHAT to prove. Fill in the bodies.
 */
describe.skip('workspace isolation & roles (RLS)', () => {
  it('a member of workspace A cannot read workspace B tasks', async () => {
    // sign in as a user who only belongs to A
    // select tasks where workspace_id = B  -> expect 0 rows (not an error leak)
  })

  it('a member of workspace A cannot write into workspace B', async () => {
    // insert a task with workspace_id = B as an A-only user -> expect denied
  })

  it('a viewer cannot create, update, or delete tasks', async () => {
    // sign in as a viewer of workspace A
    // insert/update/delete -> expect denied by policy
  })

  it('a member can create and edit but cannot perform admin-only actions', async () => {
    // e.g. managing memberships / deleting -> denied for member, allowed admin
  })

  it('an admin can manage members and all data within their workspace', async () => {
    // admin actions succeed within A, but still NOT in B
  })
})
