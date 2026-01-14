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

  const { data, error } = await supabase.from("clients").select("*").order("name").eq("user_id", user.id)

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

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Niet ingelogd")

  const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).eq("user_id", user.id).single()

  if (error) {
    // More detailed error handling
    if (error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("schema cache")) {
      throw new Error(
        "Database tabel 'clients' bestaat niet of is niet beschikbaar. Voer de database setup uit in Supabase SQL Editor."
      )
    }
    if (error.code === "PGRST116") {
      throw new Error("Klant niet gevonden of u heeft geen toegang tot deze klant.")
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
  if (!user) throw new Error("Niet ingelogd")

  const name = (formData.get("name") as string)?.trim()
  const company_name = (formData.get("company_name") as string)?.trim() || null
  const btw_number = (formData.get("btw_number") as string)?.trim() || null
  const email = (formData.get("email") as string)?.trim() || null
  const phone = (formData.get("phone") as string)?.trim() || null
  const address = (formData.get("address") as string)?.trim() || null
  const city = (formData.get("city") as string)?.trim() || null
  const postal_code = (formData.get("postal_code") as string)?.trim() || null
  const country = (formData.get("country") as string)?.trim() || "Nederland"

  // Validation
  if (!name || name.length === 0) {
    return { error: "Naam is verplicht" }
  }

  const clientData = {
    user_id: user.id,
    name,
    company_name,
    btw_number,
    email,
    phone,
    address,
    city,
    postal_code,
    country,
  }

  const { data, error } = await (supabase.from("clients") as any).insert(clientData).select().single()

  if (error) {
    if (error.code === "23505") {
      return { error: "Een klant met deze naam bestaat al." }
    }
    return { error: error.message || "Fout bij aanmaken van klant" }
  }

  // Invalidate cache
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/clients", "page")

  return { success: true, data }
}

export async function updateClient(clientId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Niet ingelogd")

  const name = (formData.get("name") as string)?.trim()
  const company_name = (formData.get("company_name") as string)?.trim() || null
  const btw_number = (formData.get("btw_number") as string)?.trim() || null
  const email = (formData.get("email") as string)?.trim() || null
  const phone = (formData.get("phone") as string)?.trim() || null
  const address = (formData.get("address") as string)?.trim() || null
  const city = (formData.get("city") as string)?.trim() || null
  const postal_code = (formData.get("postal_code") as string)?.trim() || null
  const country = (formData.get("country") as string)?.trim() || "Nederland"

  if (!name || name.length === 0) {
    return { error: "Naam is verplicht" }
  }

  const updateData = {
    name,
    company_name,
    btw_number,
    email,
    phone,
    address,
    city,
    postal_code,
    country,
  }

  const { data, error } = await (supabase
    .from("clients") as any)
    .update(updateData)
    .eq("id", clientId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message || "Fout bij bijwerken van klant" }
  }

  // Invalidate cache
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/clients", "page")
  revalidatePath(`/dashboard/clients/${clientId}`, "page")

  return { success: true, data }
}

export async function bulkImportClients(clientsData: Array<Omit<InsertTables<"clients">, "user_id" | "id" | "created_at" | "updated_at">>) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Niet ingelogd")

  // Add user_id to each client
  const clientsWithUserId = clientsData.map((client) => ({
    ...client,
    user_id: user.id,
  }))

  // Use upsert to handle duplicates based on name
  const { data, error } = await (supabase
    .from("clients") as any)
    .upsert(clientsWithUserId, {
      onConflict: "name",
      ignoreDuplicates: false,
    })
    .select()

  if (error) {
    return { error: error.message || "Fout bij importeren van klanten" }
  }

  // Log the import activity
  if (data && data.length > 0) {
    await (supabase.from("upload_logs") as any).insert({
      user_id: user.id,
      client_id: null,
      upload_type: "client_import",
      file_name: "bulk_import",
      records_imported: data.length,
      status: "success",
    })
  }

  // Invalidate cache
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/clients", "page")

  return { success: true, data: data || [] }
}
