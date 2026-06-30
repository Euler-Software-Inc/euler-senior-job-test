// Supabase Edge Function (Deno) — EXAMPLE / SCAFFOLD.
//
// This exists to show WHERE privileged, secret-bearing work belongs: on the
// server, never in the Vite client bundle. The service-role key is read from
// the function's environment at runtime here — it is never exposed to the
// browser. (Contrast this with /review/PR.md, where a teammate tries to put a
// service-role key behind a VITE_ var in the frontend — that ships it to every
// visitor. Don't do that.)
//
// You don't strictly need this function to complete the assessment, but it's a
// realistic home for any operation that must bypass or run above RLS (e.g.
// admin user provisioning). Deploy with:  supabase functions deploy admin-create-task
//
// Local secrets are set via:  supabase secrets set SERVICE_ROLE_KEY=... (or it
// is injected automatically as SUPABASE_SERVICE_ROLE_KEY in the platform).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Server-side env. These never reach the client.
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // The service-role client bypasses RLS — only ever safe here, on the server.
  const admin = createClient(supabaseUrl, serviceRoleKey)

  let body: { workspace_id?: string; title?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Validate input before trusting it (the service-role client has no RLS net).
  if (!body.workspace_id || !body.title?.trim()) {
    return new Response(
      JSON.stringify({ error: 'workspace_id and title are required' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }

  const { data, error } = await admin
    .from('tasks')
    .insert({ workspace_id: body.workspace_id, title: body.title.trim() })
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ task: data }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  })
})
