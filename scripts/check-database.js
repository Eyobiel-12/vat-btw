#!/usr/bin/env node
/**
 * Quick database check script
 * Verifies if database tables exist
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const tables = [
  'profiles',
  'clients', 
  'grootboek_accounts',
  'btw_codes',
  'boekingsregels',
  'btw_aangiftes',
  'upload_logs'
]

async function checkDatabase() {
  console.log('🔍 Checking database tables...\n')
  
  let allExist = true
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log(`❌ ${table} - Table does not exist`)
        allExist = false
      } else {
        console.log(`✅ ${table} - Exists`)
      }
    } catch (err) {
      if (err.code === '42P01') {
        console.log(`❌ ${table} - Table does not exist`)
        allExist = false
      } else {
        console.log(`⚠️  ${table} - Error checking: ${err.message}`)
      }
    }
  }
  
  console.log('')
  
  if (allExist) {
    console.log('✅ All tables exist! Database is set up correctly.\n')
  } else {
    console.log('❌ Some tables are missing. Run the setup.sql script in Supabase SQL Editor.\n')
    console.log('📋 File: scripts/setup.sql')
    console.log('🔗 Open: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new\n')
  }
}

checkDatabase().catch(console.error)

