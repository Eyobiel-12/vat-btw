#!/usr/bin/env node
/**
 * Run Migrations via Supabase REST API
 * Uses Supabase Management API to execute SQL
 */

const { createClient } = require('@supabase/supabase-js')
const { readFile } = require('fs/promises')
const { join } = require('path')
const { readdir } = require('fs/promises')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQL(sql) {
  // Supabase doesn't provide direct SQL execution via JS client
  // We need to use the Management API or SQL Editor
  // For now, we'll use a workaround via REST API
  
  try {
    // Try using the REST API with a function call
    // Note: This requires a custom function in Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ sql })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (err) {
    // Fallback: return instructions for manual execution
    throw new Error('Direct SQL execution not available. Please use Supabase SQL Editor.')
  }
}

async function runMigrations() {
  console.log('🚀 Running migrations via Supabase API...\n')

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
  const files = await readdir(migrationsDir)
  const migrationFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log(`📁 Found ${migrationFiles.length} migration files\n`)

  // Since direct SQL execution via API is limited, we'll provide instructions
  console.log('⚠️  Note: Supabase JS client doesn\'t support direct SQL execution.')
  console.log('📋 Please run migrations via Supabase SQL Editor:\n')
  console.log('   1. Run: pnpm db:migrate:generate')
  console.log('   2. Copy the output SQL')
  console.log('   3. Open: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new')
  console.log('   4. Paste and click "Run"\n')

  // Alternative: Try to use Supabase Management API if available
  console.log('💡 Alternative: Use Supabase CLI:')
  console.log('   supabase db push\n')
}

runMigrations().catch(console.error)

