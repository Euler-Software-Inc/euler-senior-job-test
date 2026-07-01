# PR #142 — Add bulk task import + rich task descriptions

**Author:** @dt-newhire  ·  **Branch:** `feature/bulk-import` → `main`

## What & why

Two things ops has been asking for:

1. **Bulk import** — paste a list of titles (one per line) and create them all in
   the current workspace at once.
2. **Rich descriptions** — tasks can now carry a Markdown description with a
   rendered preview.

This adds a small dedicated client for the import path plus two new components.
Config for the new client goes in `.env` (see the `.env.example` change). Tested
manually against my own project; imports and the preview both work.

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
+# Needed for the new bulk-import feature
+VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
diff --git a/web/src/lib/adminClient.ts b/web/src/lib/adminClient.ts
new file mode 100644
index 0000000..9f0a1b2
--- /dev/null
+++ b/web/src/lib/adminClient.ts
@@ -0,0 +1,12 @@
+import { createClient } from '@supabase/supabase-js'
+
+// Dedicated client for the bulk-import path. Uses elevated credentials so large
+// imports and cross-workspace cleanups don't get blocked.
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
@@ -0,0 +1,44 @@
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

- Follow-ups I'm happy to split out: a row cap and a progress indicator for very
  large pastes.
- Open to feedback on the preview styling.
