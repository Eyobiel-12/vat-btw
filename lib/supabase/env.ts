/**
 * Validates Supabase environment variables
 * Throws a helpful error if variables are missing
 */
export function validateSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const missing = []
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!key) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(", ")}\n\n` +
        `Please add these to your .env.local file:\n` +
        `NEXT_PUBLIC_SUPABASE_URL=your-project-url\n` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n` +
        `Get these values from: https://supabase.com/dashboard/project/_/settings/api`
    )
  }

  return { url, key }
}

