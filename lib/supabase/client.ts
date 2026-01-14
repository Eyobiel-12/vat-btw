import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"
import { validateSupabaseEnv } from "./env"

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  if (client) return client

  // Validate environment variables
  const { url, key } = validateSupabaseEnv()

  client = createBrowserClient<Database>(url, key)

  return client
}
