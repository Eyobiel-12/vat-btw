"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { InsertTables, UpdateTables } from "@/lib/supabase/types"
import { validateBoekingsregel, calculateBTWAmount } from "@/lib/utils/btw-helpers"

export async function getBoekingsregels(clientId: string, jaar?: number, periode?: number) {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("boekingsregels")
    .select("*")
    .eq("client_id", clientId)
    .order("boekdatum", { ascending: false })

  if (jaar) query = query.eq("jaar", jaar)
  if (periode) query = query.eq("periode", periode)

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data
}

export async function createBoekingsregel(clientId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const boekdatum = new Date(formData.get("boekdatum") as string)
  const accountNumber = formData.get("account_number") as string
  const debet = Number.parseFloat(formData.get("debet") as string) || 0
  const credit = Number.parseFloat(formData.get("credit") as string) || 0
  const btwCode = (formData.get("btw_code") as string) || null
  let btwBedrag = Number.parseFloat(formData.get("btw_bedrag") as string) || 0

  // Get grootboek account info for validation
  let accountType: string | undefined
  if (accountNumber) {
    const { data: account } = await supabase
      .from("grootboek_accounts")
      .select("account_type")
      .eq("client_id", clientId)
      .eq("account_number", accountNumber)
      .single()
    
    accountType = account?.account_type
  }

  // Auto-calculate BTW if not provided but BTW code exists
  if (btwCode && btwBedrag === 0) {
    const baseAmount = debet > 0 ? debet : credit
    btwBedrag = calculateBTWAmount(baseAmount, btwCode)
  }

  const regelData: InsertTables<"boekingsregels"> = {
    client_id: clientId,
    boekstuk_nummer: (formData.get("boekstuk_nummer") as string) || null,
    boekdatum: formData.get("boekdatum") as string,
    omschrijving: formData.get("omschrijving") as string,
    account_number: accountNumber,
    debet,
    credit,
    btw_code: btwCode,
    btw_bedrag: btwBedrag,
    tegenhrekening: (formData.get("tegenhrekening") as string) || null,
    factuurnummer: (formData.get("factuurnummer") as string) || null,
    relatie: (formData.get("relatie") as string) || null,
    periode: boekdatum.getMonth() + 1,
    jaar: boekdatum.getFullYear(),
  }

  // Validate the boekingsregel
  const validation = validateBoekingsregel({
    debet,
    credit,
    btw_code: btwCode,
    btw_bedrag: btwBedrag,
    account_number: accountNumber,
    account_type: accountType,
  })

  if (!validation.isValid) {
    return { 
      error: validation.errors.join("; "),
      warnings: validation.warnings 
    }
  }

  const { error } = await supabase.from("boekingsregels").insert(regelData)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}/boekingsregels`)
  return { 
    success: true,
    warnings: validation.warnings.length > 0 ? validation.warnings : undefined
  }
}

export async function updateBoekingsregel(regelId: string, clientId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const boekdatum = new Date(formData.get("boekdatum") as string)

  const regelData: UpdateTables<"boekingsregels"> = {
    boekstuk_nummer: (formData.get("boekstuk_nummer") as string) || null,
    boekdatum: formData.get("boekdatum") as string,
    omschrijving: formData.get("omschrijving") as string,
    account_number: formData.get("account_number") as string,
    debet: Number.parseFloat(formData.get("debet") as string) || 0,
    credit: Number.parseFloat(formData.get("credit") as string) || 0,
    btw_code: (formData.get("btw_code") as string) || null,
    btw_bedrag: Number.parseFloat(formData.get("btw_bedrag") as string) || 0,
    tegenhrekening: (formData.get("tegenhrekening") as string) || null,
    factuurnummer: (formData.get("factuurnummer") as string) || null,
    relatie: (formData.get("relatie") as string) || null,
    periode: boekdatum.getMonth() + 1,
    jaar: boekdatum.getFullYear(),
  }

  const { error } = await supabase.from("boekingsregels").update(regelData).eq("id", regelId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}/boekingsregels`)
  return { success: true }
}

export async function deleteBoekingsregel(regelId: string, clientId: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from("boekingsregels").delete().eq("id", regelId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}/boekingsregels`)
  return { success: true }
}

export async function importBoekingsregelsFromCSV(clientId: string, regels: InsertTables<"boekingsregels">[]) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Niet ingelogd" }

  // Add client_id and calculate periode/jaar
  const regelsWithClientId = regels.map((regel) => {
    const boekdatum = new Date(regel.boekdatum)
    return {
      ...regel,
      client_id: clientId,
      periode: boekdatum.getMonth() + 1,
      jaar: boekdatum.getFullYear(),
    }
  })

  const { error } = await supabase.from("boekingsregels").insert(regelsWithClientId)

  if (error) return { error: error.message }

  // Log the upload
  await supabase.from("upload_logs").insert({
    client_id: clientId,
    user_id: user.id,
    file_name: "boekingsregels_import.csv",
    file_type: "boekingsregels",
    records_processed: regels.length,
    status: "completed",
  })

  revalidatePath(`/dashboard/clients/${clientId}/boekingsregels`)
  return { success: true, count: regels.length }
}
