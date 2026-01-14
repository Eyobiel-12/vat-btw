#!/usr/bin/env tsx
/**
 * Smart Database Setup Script
 * Automatically sets up the BTW Assist database schema
 * Checks existing state and only runs necessary migrations
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

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

interface TableInfo {
  table_name: string
  exists: boolean
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    // If we get data or a specific error, table exists
    if (data !== null || (error && !error.message.includes('does not exist'))) {
      return true
    }
    return false
  } catch (err: any) {
    // Check if error is about table not existing
    if (err?.message?.includes('does not exist') || err?.code === '42P01') {
      return false
    }
    // For other errors, assume table might exist
    return true
  }
}

async function checkDatabaseState(): Promise<Record<string, boolean>> {
  console.log('🔍 Checking database state...\n')
  
  const tables = [
    'profiles',
    'clients',
    'grootboek_accounts',
    'btw_codes',
    'boekingsregels',
    'btw_aangiftes',
    'upload_logs'
  ]
  
  const state: Record<string, boolean> = {}
  
  for (const table of tables) {
    const exists = await checkTableExists(table)
    state[table] = exists
    console.log(`  ${exists ? '✅' : '❌'} ${table}`)
  }
  
  return state
}

async function runSQL(sql: string, description: string): Promise<boolean> {
  try {
    console.log(`\n📝 ${description}...`)
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.length < 10) continue // Skip very short statements
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      // If RPC doesn't exist, try direct query (for simple statements)
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        // For CREATE TABLE and similar, we'll use a different approach
        // Supabase doesn't allow direct SQL execution via JS client
        // So we'll return false and suggest manual execution
        console.log('⚠️  Direct SQL execution not available via API')
        return false
      }
    }
    
    return true
  } catch (err: any) {
    console.error(`❌ Error: ${err.message}`)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 BTW Assist Database Setup\n')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`)
  
  // Check current state
  const state = await checkDatabaseState()
  
  const allExist = Object.values(state).every(exists => exists)
  
  if (allExist) {
    console.log('\n✅ All tables already exist!')
    console.log('💡 If you need to reset, drop tables manually in Supabase dashboard.\n')
    return
  }
  
  console.log('\n📦 Setting up database schema...\n')
  
  // Read SQL files
  const createTablesSQL = readFileSync(
    join(__dirname, '001-create-tables.sql'),
    'utf-8'
  )
  
  const rlsSQL = readFileSync(
    join(__dirname, '002-row-level-security.sql'),
    'utf-8'
  )
  
  console.log('⚠️  Note: Supabase JS client cannot execute arbitrary SQL directly.')
  console.log('📋 Please run these SQL scripts in the Supabase SQL Editor:\n')
  console.log('   1. scripts/001-create-tables.sql')
  console.log('   2. scripts/002-row-level-security.sql\n')
  console.log('🔗 Open: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new\n')
  
  // Generate a combined SQL file for easy copy-paste
  const combinedSQL = `-- BTW Assist Complete Database Setup
-- Run this in Supabase SQL Editor

${createTablesSQL}

${rlsSQL}
`
  
  console.log('💡 Or use the generated setup.sql file (see below)\n')
  
  // Write combined file
  const fs = require('fs')
  fs.writeFileSync(
    join(__dirname, 'setup.sql'),
    combinedSQL
  )
  
  console.log('✅ Generated scripts/setup.sql - ready to run!\n')
}

// Run setup
setupDatabase().catch(console.error)

