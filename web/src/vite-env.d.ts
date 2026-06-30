/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  // The anon (publishable) key is safe to expose in the client — it is
  // protected by Row-Level Security. NEVER add the service-role key here.
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
