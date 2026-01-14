"use server"

import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function signUp(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("name") as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile record
  if (data.user) {
    const { error: profileError } = await (supabase.from("profiles") as any).insert({
      id: data.user.id,
      email: email,
      full_name: fullName,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
    }
  }

  return { success: true, message: "Controleer uw e-mail om uw account te bevestigen." }
}

export async function signIn(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return {
    ...user,
    profile,
  }
}
