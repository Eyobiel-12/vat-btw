export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          company_name: string | null
          kvk_number: string | null
          btw_number: string | null
          address: string | null
          postal_code: string | null
          city: string | null
          email: string | null
          phone: string | null
          notes: string | null
          fiscal_year_start: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company_name?: string | null
          kvk_number?: string | null
          btw_number?: string | null
          address?: string | null
          postal_code?: string | null
          city?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          fiscal_year_start?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company_name?: string | null
          kvk_number?: string | null
          btw_number?: string | null
          address?: string | null
          postal_code?: string | null
          city?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          fiscal_year_start?: number
          created_at?: string
          updated_at?: string
        }
      }
      grootboek_accounts: {
        Row: {
          id: string
          client_id: string
          account_number: string
          account_name: string
          account_type: "activa" | "passiva" | "kosten" | "omzet"
          btw_code: string | null
          btw_percentage: number | null
          rubriek: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          account_number: string
          account_name: string
          account_type: "activa" | "passiva" | "kosten" | "omzet"
          btw_code?: string | null
          btw_percentage?: number | null
          rubriek?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          account_number?: string
          account_name?: string
          account_type?: "activa" | "passiva" | "kosten" | "omzet"
          btw_code?: string | null
          btw_percentage?: number | null
          rubriek?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      btw_codes: {
        Row: {
          id: string
          code: string
          description: string
          percentage: number | null
          rubriek: string
          type: "verschuldigd" | "voorbelasting" | "verlegd" | "geen"
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          description: string
          percentage?: number | null
          rubriek: string
          type: "verschuldigd" | "voorbelasting" | "verlegd" | "geen"
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string
          percentage?: number | null
          rubriek?: string
          type?: "verschuldigd" | "voorbelasting" | "verlegd" | "geen"
          is_active?: boolean
          created_at?: string
        }
      }
      boekingsregels: {
        Row: {
          id: string
          client_id: string
          boekstuk_nummer: string | null
          boekdatum: string
          omschrijving: string
          grootboek_account_id: string | null
          account_number: string
          debet: number
          credit: number
          btw_code: string | null
          btw_bedrag: number
          tegenhrekening: string | null
          factuurnummer: string | null
          relatie: string | null
          periode: number | null
          jaar: number
          is_validated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          boekstuk_nummer?: string | null
          boekdatum: string
          omschrijving: string
          grootboek_account_id?: string | null
          account_number: string
          debet?: number
          credit?: number
          btw_code?: string | null
          btw_bedrag?: number
          tegenhrekening?: string | null
          factuurnummer?: string | null
          relatie?: string | null
          periode?: number | null
          jaar: number
          is_validated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          boekstuk_nummer?: string | null
          boekdatum?: string
          omschrijving?: string
          grootboek_account_id?: string | null
          account_number?: string
          debet?: number
          credit?: number
          btw_code?: string | null
          btw_bedrag?: number
          tegenhrekening?: string | null
          factuurnummer?: string | null
          relatie?: string | null
          periode?: number | null
          jaar?: number
          is_validated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      btw_aangiftes: {
        Row: {
          id: string
          client_id: string
          periode_type: "maand" | "kwartaal" | "jaar"
          periode: number
          jaar: number
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
          rubriek_5c_btw: number
          rubriek_5d_btw: number
          rubriek_5e_btw: number
          status: "concept" | "definitief" | "ingediend"
          ingediend_op: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          periode_type: "maand" | "kwartaal" | "jaar"
          periode: number
          jaar: number
          rubriek_1a_omzet?: number
          rubriek_1a_btw?: number
          rubriek_1b_omzet?: number
          rubriek_1b_btw?: number
          rubriek_1c_omzet?: number
          rubriek_1c_btw?: number
          rubriek_1d_omzet?: number
          rubriek_1d_btw?: number
          rubriek_1e_omzet?: number
          rubriek_2a_omzet?: number
          rubriek_3a_omzet?: number
          rubriek_3b_omzet?: number
          rubriek_4a_omzet?: number
          rubriek_4a_btw?: number
          rubriek_4b_omzet?: number
          rubriek_4b_btw?: number
          rubriek_5a_btw?: number
          rubriek_5b_btw?: number
          rubriek_5c_btw?: number
          rubriek_5d_btw?: number
          rubriek_5e_btw?: number
          status?: "concept" | "definitief" | "ingediend"
          ingediend_op?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          periode_type?: "maand" | "kwartaal" | "jaar"
          periode?: number
          jaar?: number
          rubriek_1a_omzet?: number
          rubriek_1a_btw?: number
          rubriek_1b_omzet?: number
          rubriek_1b_btw?: number
          rubriek_1c_omzet?: number
          rubriek_1c_btw?: number
          rubriek_1d_omzet?: number
          rubriek_1d_btw?: number
          rubriek_1e_omzet?: number
          rubriek_2a_omzet?: number
          rubriek_3a_omzet?: number
          rubriek_3b_omzet?: number
          rubriek_4a_omzet?: number
          rubriek_4a_btw?: number
          rubriek_4b_omzet?: number
          rubriek_4b_btw?: number
          rubriek_5a_btw?: number
          rubriek_5b_btw?: number
          rubriek_5c_btw?: number
          rubriek_5d_btw?: number
          rubriek_5e_btw?: number
          status?: "concept" | "definitief" | "ingediend"
          ingediend_op?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      upload_logs: {
        Row: {
          id: string
          client_id: string
          user_id: string
          file_name: string
          file_type: "grootboek" | "boekingsregels"
          records_processed: number
          records_failed: number
          status: "processing" | "completed" | "failed"
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          file_name: string
          file_type: "grootboek" | "boekingsregels"
          records_processed?: number
          records_failed?: number
          status?: "processing" | "completed" | "failed"
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          file_name?: string
          file_type?: "grootboek" | "boekingsregels"
          records_processed?: number
          records_failed?: number
          status?: "processing" | "completed" | "failed"
          error_message?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
