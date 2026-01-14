"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { InsertTables, UpdateTables } from "@/lib/supabase/types"

export async function getClients() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Niet ingelogd")

  const { data, error } = await supabase.from("clients").select("*").order("name")

  if (error) {
    // More detailed error handling
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      throw new Error(
        "Database tabel 'clients' bestaat niet. Voer de database setup uit: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new"
      )
    }
    if (error.code === "PGRST301" || error.message.includes("schema cache")) {
      throw new Error(
        "Database schema cache probleem. Wacht even en probeer opnieuw, of refresh de schema cache in Supabase dashboard."
      )
    }
    throw new Error(error.message)
  }
  return data || []
}

export async function getClient(clientId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).single()

  if (error) {
    // More detailed error handling
    if (error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("schema cache")) {
      throw new Error(
        "Database tabel 'clients' bestaat niet of is niet beschikbaar. Voer de database setup uit in Supabase SQL Editor."
      )
    }
    if (error.code === "PGRST116") {
      throw new Error("Klant niet gevonden")
    }
    throw new Error(error.message)
  }
  return data
}

export async function createClient(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Niet ingelogd" }

  // Ensure profile exists (clients.user_id references profiles.id, not auth.users.id)
  const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()
  
  if (!existingProfile) {
    // Create profile if it doesn't exist
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || null,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return { error: "Fout bij aanmaken van gebruikersprofiel. Probeer opnieuw in te loggen." }
    }
  }

  // Validate required fields
  const name = (formData.get("name") as string)?.trim()
  if (!name || name.length === 0) {
    return { error: "Naam is verplicht" }
  }

  // Validate email format if provided
  const email = (formData.get("email") as string)?.trim()
  if (email && email.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Ongeldig e-mailadres formaat" }
    }
  }

  const clientData: InsertTables<"clients"> = {
    user_id: user.id, // This now references profiles.id which we just ensured exists
    name: name,
    company_name: (formData.get("company_name") as string)?.trim() || null,
    kvk_number: (formData.get("kvk_number") as string)?.trim() || null,
    btw_number: (formData.get("btw_number") as string)?.trim() || null,
    address: (formData.get("address") as string)?.trim() || null,
    postal_code: (formData.get("postal_code") as string)?.trim() || null,
    city: (formData.get("city") as string)?.trim() || null,
    email: email || null,
    phone: (formData.get("phone") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
  }

  const { data, error } = await supabase.from("clients").insert(clientData).select().single()

  if (error) {
    // More user-friendly error messages
    if (error.code === "23505") {
      return { error: "Een klant met deze gegevens bestaat al" }
    }
    if (error.code === "23503") {
      return { error: "Ongeldige gebruikersgegevens. Probeer opnieuw in te loggen." }
    }
    return { error: error.message || "Fout bij aanmaken van klant" }
  }

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateClient(clientId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const clientData: UpdateTables<"clients"> = {
    name: formData.get("name") as string,
    company_name: (formData.get("company_name") as string) || null,
    kvk_number: (formData.get("kvk_number") || null) as string | null,
    btw_number: (formData.get("btw_number") as string) || null,
    address: (formData.get("address") as string) || null,
    postal_code: (formData.get("postal_code") as string) || null,
    city: (formData.get("city") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    notes: (formData.get("notes") as string) || null,
  }

  const { error } = await supabase.from("clients").update(clientData).eq("id", clientId)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { success: true }
}

export async function deleteClient(clientId: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from("clients").delete().eq("id", clientId)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function bulkImportClients(clients: Array<{ name: string; email?: string | null; company_name?: string | null }>) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Niet ingelogd" }

  // Ensure profile exists
  const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()
  
  if (!existingProfile) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || null,
    })

    if (profileError) {
      return { error: "Fout bij aanmaken van gebruikersprofiel. Probeer opnieuw in te loggen." }
    }
  }

  // Prepare client data
  const clientsData: InsertTables<"clients">[] = clients.map((client) => ({
    user_id: user.id,
    name: client.name.trim(),
    company_name: client.company_name?.trim() || null,
    email: client.email?.trim() || null,
    kvk_number: null,
    btw_number: null,
    address: null,
    postal_code: null,
    city: null,
    phone: null,
    notes: null,
  }))

  // Insert clients in batches to avoid timeout
  const batchSize = 50
  const results = { success: 0, errors: 0, errorsList: [] as string[] }

  for (let i = 0; i < clientsData.length; i += batchSize) {
    const batch = clientsData.slice(i, i + batchSize)
    const { error } = await supabase.from("clients").insert(batch)

    if (error) {
      // If it's a duplicate error, try to insert individually to get better error messages
      if (error.code === "23505") {
        for (const client of batch) {
          const { error: singleError } = await supabase.from("clients").insert(client)
          if (singleError) {
            results.errors++
            results.errorsList.push(`${client.name}: ${singleError.message}`)
          } else {
            results.success++
          }
        }
      } else {
        results.errors += batch.length
        results.errorsList.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
      }
    } else {
      results.success += batch.length
    }
  }

  revalidatePath("/dashboard")
  
  if (results.errors > 0) {
    return {
      success: true,
      imported: results.success,
      errors: results.errors,
      errorsList: results.errorsList,
      warning: `${results.success} klanten geïmporteerd, ${results.errors} fouten opgetreden`,
    }
  }

  return { success: true, imported: results.success }
}
