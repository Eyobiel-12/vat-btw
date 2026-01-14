"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { InsertTables } from "@/lib/supabase/types"

export interface BTWCalculationResult {
  rubriek_1a_omzet: number
  rubriek_1a_btw: number
  rubriek_1b_omzet: number
  rubriek_1b_btw: number
  rubriek_1c_omzet: number
  rubriek_1c_btw: number
  rubriek_1d_omzet: number
  rubriek_1d_btw: number
  rubriek_1e_omzet: number
  rubriek_2a_omzet: number
  rubriek_3a_omzet: number
  rubriek_3b_omzet: number
  rubriek_4a_omzet: number
  rubriek_4a_btw: number
  rubriek_4b_omzet: number
  rubriek_4b_btw: number
  rubriek_5a_btw: number
  rubriek_5b_btw: number
  rubriek_5b_grondslag?: number // Track grondslag for voorbelasting
  rubriek_5c_btw: number
  rubriek_5d_btw: number
  rubriek_5e_btw: number
  totalTransactions?: number
  transactionsWithBTW?: number
}

export async function calculateBTW(
  clientId: string,
  jaar: number,
  periodeType: "maand" | "kwartaal" | "jaar",
  periode: number,
): Promise<BTWCalculationResult> {
  const supabase = await getSupabaseServerClient()

  // First, get ALL boekingsregels for the period (to count total)
  let allQuery = supabase
    .from("boekingsregels")
    .select("id, btw_code")
    .eq("client_id", clientId)
    .eq("jaar", jaar)

  // Filter by period for counting
  if (periodeType === "maand") {
    allQuery = allQuery.eq("periode", periode)
  } else if (periodeType === "kwartaal") {
    const startMonth = (periode - 1) * 3 + 1
    const endMonth = periode * 3
    allQuery = allQuery.gte("periode", startMonth).lte("periode", endMonth)
  }

  const { data: allRegels } = await allQuery
  const totalTransactions = allRegels?.length || 0
  const transactionsWithBTW = allRegels?.filter((r: any) => r.btw_code).length || 0

  // Get boekingsregels for the period WITH BTW codes (for calculation)
  let query = supabase
    .from("boekingsregels")
    .select("*, grootboek_accounts(*)")
    .eq("client_id", clientId)
    .eq("jaar", jaar)
    .not("btw_code", "is", null) // Only include entries with BTW codes

  // Filter by period
  if (periodeType === "maand") {
    query = query.eq("periode", periode)
  } else if (periodeType === "kwartaal") {
    const startMonth = (periode - 1) * 3 + 1
    const endMonth = periode * 3
    query = query.gte("periode", startMonth).lte("periode", endMonth)
  }

  const { data: boekingsregels, error } = await query

  if (error) throw new Error(error.message)

  // Initialize result
  const result: BTWCalculationResult = {
    rubriek_1a_omzet: 0,
    rubriek_1a_btw: 0,
    rubriek_1b_omzet: 0,
    rubriek_1b_btw: 0,
    rubriek_1c_omzet: 0,
    rubriek_1c_btw: 0,
    rubriek_1d_omzet: 0,
    rubriek_1d_btw: 0,
    rubriek_1e_omzet: 0,
    rubriek_2a_omzet: 0,
    rubriek_3a_omzet: 0,
    rubriek_3b_omzet: 0,
    rubriek_4a_omzet: 0,
    rubriek_4a_btw: 0,
    rubriek_4b_omzet: 0,
    rubriek_4b_btw: 0,
    rubriek_5a_btw: 0,
    rubriek_5b_btw: 0,
    rubriek_5b_grondslag: 0, // Track grondslag for voorbelasting
    rubriek_5c_btw: 0,
    rubriek_5d_btw: 0,
    rubriek_5e_btw: 0,
  }

  // Calculate BTW per rubriek based on btw_code
  for (const regel of boekingsregels || []) {
    // Determine base amount: for omzet (credit) or kosten (debet)
    // BTW verschuldigd is on credit side (omzet), voorbelasting is on debet side (kosten)
    const regelAny = regel as any
    const baseAmount = regelAny.credit > 0 ? regelAny.credit : regelAny.debet
    const btwBedrag = regelAny.btw_bedrag || 0

    // Skip if no BTW code or base amount is zero
    if (!regelAny.btw_code || baseAmount === 0) continue

    switch (regelAny.btw_code) {
      case "1a":
        // Verschuldigd BTW hoog - typically on credit (omzet)
        if (regelAny.credit > 0) {
          result.rubriek_1a_omzet += baseAmount
          result.rubriek_1a_btw += Math.abs(btwBedrag)
        }
        break
      case "1b":
        // Verschuldigd BTW laag - typically on credit (omzet)
        if (regelAny.credit > 0) {
          result.rubriek_1b_omzet += baseAmount
          result.rubriek_1b_btw += Math.abs(btwBedrag)
        }
        break
      case "1c":
        // Verschuldigd BTW overig - typically on credit (omzet)
        if (regelAny.credit > 0) {
          result.rubriek_1c_omzet += baseAmount
          result.rubriek_1c_btw += Math.abs(btwBedrag)
        }
        break
      case "1d":
        // Privégebruik - typically on credit
        if (regelAny.credit > 0) {
          result.rubriek_1d_omzet += baseAmount
          result.rubriek_1d_btw += Math.abs(btwBedrag)
        }
        break
      case "1e":
        // Vrijgestelde omzet - typically on credit
        if (regelAny.credit > 0) {
          result.rubriek_1e_omzet += baseAmount
        }
        break
      case "2a":
        // Export buiten EU - typically on credit
        if (regelAny.credit > 0) {
          result.rubriek_2a_omzet += baseAmount
        }
        break
      case "3a":
        // Intracommunautaire leveringen - typically on credit
        if (regelAny.credit > 0) {
          result.rubriek_3a_omzet += baseAmount
        }
        break
      case "3b":
        // Intracommunautaire diensten - typically on credit
        if (regelAny.credit > 0) {
          result.rubriek_3b_omzet += baseAmount
        }
        break
      case "4a":
        // Verwervingen binnen EU - typically on debet (inkopen)
        if (regelAny.debet > 0) {
          result.rubriek_4a_omzet += baseAmount
          result.rubriek_4a_btw += Math.abs(btwBedrag)
        }
        break
      case "4b":
        // Import buiten EU - typically on debet (inkopen)
        if (regelAny.debet > 0) {
          result.rubriek_4b_omzet += baseAmount
          result.rubriek_4b_btw += Math.abs(btwBedrag)
        }
        break
      case "5b":
      case "5b-laag":
        // Voorbelasting - typically on debet (kosten/inkopen)
        if (regelAny.debet > 0) {
          result.rubriek_5b_btw += Math.abs(btwBedrag)
          // Track grondslag: debet is usually the expense amount (grondslag)
          // If btw_bedrag is separate, then debet = grondslag, total = debet + btw_bedrag
          // For voorbelasting entries, the debet typically represents the base amount (grondslag)
          // and btw_bedrag is the BTW on top of that
          const grondslag = regelAny.debet // Debet is the base expense amount
          result.rubriek_5b_grondslag = (result.rubriek_5b_grondslag || 0) + grondslag
        }
        break
    }
  }

  // Calculate totals
  result.rubriek_5a_btw =
    result.rubriek_1a_btw +
    result.rubriek_1b_btw +
    result.rubriek_1c_btw +
    result.rubriek_1d_btw +
    result.rubriek_4a_btw +
    result.rubriek_4b_btw

  result.rubriek_5c_btw = result.rubriek_5a_btw - result.rubriek_5b_btw
  result.rubriek_5e_btw = result.rubriek_5c_btw - result.rubriek_5d_btw

  // Add metadata about transactions
  result.totalTransactions = totalTransactions
  result.transactionsWithBTW = transactionsWithBTW
  
  return result
}

export async function saveBTWAangifte(
  clientId: string,
  jaar: number,
  periodeType: "maand" | "kwartaal" | "jaar",
  periode: number,
  calculation: BTWCalculationResult,
) {
  const supabase = await getSupabaseServerClient()

  // Extract only the fields that exist in the database table
  // Exclude totalTransactions and transactionsWithBTW as they're not stored in the database
  const {
    totalTransactions,
    transactionsWithBTW,
    ...calculationData
  } = calculation

  const aangifteData: InsertTables<"btw_aangiftes"> = {
    client_id: clientId,
    jaar,
    periode_type: periodeType,
    periode,
    ...calculationData,
    status: "concept",
  }

  const { data, error } = await (supabase
    .from("btw_aangiftes") as any)
    .upsert(aangifteData, {
      onConflict: "client_id,periode_type,periode,jaar",
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}/btw`)
  return { success: true, data }
}

export async function getBTWAangiftes(clientId: string, jaar?: number) {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("btw_aangiftes")
    .select("*")
    .eq("client_id", clientId)
    .order("jaar", { ascending: false })
    .order("periode", { ascending: false })

  if (jaar) query = query.eq("jaar", jaar)

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data
}

export async function updateBTWAangifteStatus(
  aangifteId: string,
  clientId: string,
  status: "concept" | "definitief" | "ingediend",
) {
  const supabase = await getSupabaseServerClient()

  const updateData: { status: string; ingediend_op?: string } = { status }

  if (status === "ingediend") {
    updateData.ingediend_op = new Date().toISOString()
  }

  const { error } = await (supabase.from("btw_aangiftes") as any).update(updateData).eq("id", aangifteId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}/btw`)
  return { success: true }
}
