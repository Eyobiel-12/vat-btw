"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { InsertTables, UpdateTables } from "@/lib/supabase/types"

export async function getGrootboekAccounts(clientId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("grootboek_accounts")
    .select("*")
    .eq("client_id", clientId)
    .order("account_number")

  if (error) throw new Error(error.message)
  return data
}

export async function getGrootboekAccount(clientId: string, accountNumber: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("grootboek_accounts")
    .select("*")
    .eq("client_id", clientId)
    .eq("account_number", accountNumber)
    .single()

  if (error) return null
  return data
}

export async function getBtwCodes() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("btw_codes").select("*").eq("is_active", true).order("code")

  if (error) throw new Error(error.message)
  return data
}

export async function createGrootboekAccount(clientId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const accountData: InsertTables<"grootboek_accounts"> = {
    client_id: clientId,
    account_number: formData.get("account_number") as string,
    account_name: formData.get("account_name") as string,
    account_type: formData.get("account_type") as "activa" | "passiva" | "kosten" | "omzet",
    btw_code: (formData.get("btw_code") as string) || null,
    btw_percentage: formData.get("btw_percentage") ? Number.parseFloat(formData.get("btw_percentage") as string) : null,
    rubriek: (formData.get("rubriek") as string) || null,
    description: (formData.get("description") as string) || null,
  }

  const { error } = await (supabase.from("grootboek_accounts") as any).insert(accountData)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}/grootboek`)
  return { success: true }
}

export async function updateGrootboekAccount(accountId: string, clientId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const accountData: UpdateTables<"grootboek_accounts"> = {
    account_number: formData.get("account_number") as string,
    account_name: formData.get("account_name") as string,
    account_type: formData.get("account_type") as "activa" | "passiva" | "kosten" | "omzet",
    btw_code: (formData.get("btw_code") as string) || null,
    btw_percentage: formData.get("btw_percentage") ? Number.parseFloat(formData.get("btw_percentage") as string) : null,
    rubriek: (formData.get("rubriek") as string) || null,
    description: (formData.get("description") as string) || null,
  }

  const { error } = await (supabase.from("grootboek_accounts") as any).update(accountData).eq("id", accountId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}/grootboek`)
  return { success: true }
}

export async function deleteGrootboekAccount(accountId: string, clientId: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from("grootboek_accounts").delete().eq("id", accountId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}/grootboek`)
  return { success: true }
}

export async function importGrootboekFromCSV(clientId: string, accounts: InsertTables<"grootboek_accounts">[]) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Niet ingelogd" }

  // Add client_id to all accounts
  const accountsWithClientId = accounts.map((account) => ({
    ...account,
    client_id: clientId,
  }))

  const { data, error } = await (supabase.from("grootboek_accounts") as any).upsert(accountsWithClientId, {
    onConflict: "client_id,account_number",
    ignoreDuplicates: false,
  })

  if (error) return { error: error.message }

  // Log the upload
  await (supabase.from("upload_logs") as any).insert({
    client_id: clientId,
    user_id: user.id,
    file_name: "grootboek_import.csv",
    file_type: "grootboek",
    records_processed: accounts.length,
    status: "completed",
  })

  revalidatePath(`/dashboard/clients/${clientId}/grootboek`)
  return { success: true, count: accounts.length }
}
