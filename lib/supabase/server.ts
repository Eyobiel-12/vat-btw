import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/types"
import { validateSupabaseEnv } from "./env"

export async function getSupabaseServerClient() {
  // Validate environment variables
  const { url, key } = validateSupabaseEnv()
  
  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Component - cookies are read-only
        }
      },
    },
  })
}
