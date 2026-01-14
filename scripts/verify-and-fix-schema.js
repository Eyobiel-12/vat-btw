#!/usr/bin/env node
/**
 * Verify database schema and provide fix instructions
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

async function verifySchema() {
  console.log('🔍 Verifying database schema...\n')
  
  const tables = ['profiles', 'clients', 'grootboek_accounts', 'btw_codes', 'boekingsregels', 'btw_aangiftes', 'upload_logs']
  
  let allGood = true
  const issues = []
  
  for (const table of tables) {
    try {
      // Try to query the table
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${table} - Table does not exist`)
          issues.push(`Table '${table}' does not exist`)
          allGood = false
        } else if (error.message.includes('schema cache') || error.code === 'PGRST301') {
          console.log(`⚠️  ${table} - Schema cache issue detected`)
          issues.push(`Schema cache issue for '${table}'`)
          allGood = false
        } else {
          console.log(`✅ ${table} - Exists (but has error: ${error.message})`)
        }
      } else {
        console.log(`✅ ${table} - Exists and accessible`)
      }
    } catch (err) {
      console.log(`❌ ${table} - Error: ${err.message}`)
      issues.push(`Error checking '${table}': ${err.message}`)
      allGood = false
    }
  }
  
  console.log('')
  
  if (allGood) {
    console.log('✅ All tables exist and are accessible!\n')
  } else {
    console.log('❌ Issues found:\n')
    issues.forEach(issue => console.log(`  - ${issue}`))
    console.log('\n📋 Fix Instructions:\n')
    console.log('1. Open Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new\n')
    console.log('2. Run the setup script:')
    console.log('   - Copy contents of: scripts/setup.sql')
    console.log('   - Paste in SQL Editor')
    console.log('   - Click "Run"\n')
    console.log('3. Refresh schema cache:')
    console.log('   - Go to: Settings > API')
    console.log('   - Click "Reload schema" or wait 30 seconds\n')
    console.log('4. Verify again:')
    console.log('   pnpm db:check\n')
  }
}

verifySchema().catch(console.error)

