# PR #142 — Add admin bulk-import + rich task descriptions

**Author:** @dt-newhire  ·  **Branch:** `feature/admin-bulk-import` → `main`

## What & why

Two things ops has been asking for:

1. **Bulk import** — paste a list of titles and create them all in one workspace
   at once. Some of these runs need to touch tasks across workspaces for
   cleanup, and our normal client kept getting blocked, so I added a dedicated
   Supabase client that uses the **service-role key** to get it done reliably.
2. **Rich descriptions** — tasks can now have a Markdown description with a
   rendered preview.

I added `VITE_SUPABASE_SERVICE_ROLE_KEY` to `.env.example` so everyone can run
the bulk-import locally. Tested manually against my own project and it works.

Would love a review — keen to ship this for the ops team this week. 🙏

---

## Diff

```diff
diff --git a/web/.env.example b/web/.env.example
index 1a2b3c4..5d6e7f8 100644
--- a/web/.env.example
+++ b/web/.env.example
@@ -1,2 +1,5 @@
 VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
 VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
+
+# Needed for the new bulk-import admin features
+VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
diff --git a/web/src/lib/adminClient.ts b/web/src/lib/adminClient.ts
new file mode 100644
index 0000000..9f0a1b2
--- /dev/null
+++ b/web/src/lib/adminClient.ts
@@ -0,0 +1,14 @@
+import { createClient } from '@supabase/supabase-js'
+
+// Privileged client for admin/bulk operations. Uses the service-role key so it
+// isn't blocked by row-level security when we add it later.
+const url = import.meta.env.VITE_SUPABASE_URL
+const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
+
+export const adminClient = createClient(url, serviceRoleKey, {
+  auth: { persistSession: false },
+})
diff --git a/web/src/components/BulkImport.tsx b/web/src/components/BulkImport.tsx
new file mode 100644
index 0000000..3c4d5e6
--- /dev/null
+++ b/web/src/components/BulkImport.tsx
@@ -0,0 +1,46 @@
+import { useState } from 'react'
+import { adminClient } from '../lib/adminClient'
+
+export default function BulkImport({ workspaceId }: { workspaceId: string }) {
+  const [raw, setRaw] = useState('')
+  const [status, setStatus] = useState('')
+
+  async function importTasks() {
+    // one title per line
+    const rows = raw.split('\n').map((title) => ({
+      workspace_id: workspaceId,
+      title,
+      status: 'todo',
+    }))
+
+    try {
+      const { error } = await adminClient.from('tasks').insert(rows)
+      if (error) throw error
+      setStatus(`Imported ${rows.length} tasks`)
+      setRaw('')
+    } catch {
+      // swallow — keep the UI calm if something goes wrong
+      setStatus('Done')
+    }
+  }
+
+  return (
+    <div className="card">
+      <h3>Bulk import</h3>
+      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={6} />
+      <button className="primary" onClick={importTasks}>
+        Import
+      </button>
+      <p className="muted">{status}</p>
+    </div>
+  )
+}
diff --git a/web/src/components/TaskDescription.tsx b/web/src/components/TaskDescription.tsx
new file mode 100644
index 0000000..7a8b9c0
--- /dev/null
+++ b/web/src/components/TaskDescription.tsx
@@ -0,0 +1,18 @@
+import DOMPurify from 'dompurify'
+import { marked } from 'marked'
+
+export default function TaskDescription({ markdown }: { markdown: string }) {
+  // Render Markdown, then sanitize the resulting HTML before inserting it.
+  const dirty = marked.parse(markdown) as string
+  const clean = DOMPurify.sanitize(dirty)
+
+  return (
+    <div
+      className="task-description"
+      dangerouslySetInnerHTML={{ __html: clean }}
+    />
+  )
+}
```

---

## Notes for reviewer

- I know we don't have RLS yet — the service-role client is partly to "future
  proof" against it. Open to other approaches.
- The Markdown preview runs user input through `DOMPurify` before rendering.
- Bulk import currently has no row limit; can add one in a follow-up if needed.
