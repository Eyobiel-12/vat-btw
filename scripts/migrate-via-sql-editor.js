#!/usr/bin/env node
/**
 * Migration Helper - Generates SQL for Supabase SQL Editor
 * This script reads all migrations and outputs them in order
 * for easy copy-paste into Supabase SQL Editor
 */

const { readdir, readFile } = require('fs/promises')
const { join } = require('path')

async function generateMigrationSQL() {
  console.log('📋 Generating combined migration SQL...\n')

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
  const files = await readdir(migrationsDir)
  const migrationFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log(`Found ${migrationFiles.length} migration files:\n`)

  let combinedSQL = `-- ============================================
-- BTW Assist Database Migrations
-- Generated: ${new Date().toISOString()}
-- 
-- Instructions:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run" or press Cmd/Ctrl + Enter
-- 4. Wait 30 seconds for schema cache refresh
-- 5. Run: pnpm db:verify
-- ============================================\n\n`

  for (const file of migrationFiles) {
    console.log(`  ✓ ${file}`)
    const sql = await readFile(join(migrationsDir, file), 'utf-8')
    combinedSQL += `-- ============================================
-- Migration: ${file}
-- ============================================\n\n`
    combinedSQL += sql
    combinedSQL += '\n\n'
  }

  combinedSQL += `-- ============================================
-- Refresh Schema Cache
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- Migrations Complete!
-- Wait 30 seconds, then run: pnpm db:verify
-- ============================================
`

  console.log('\n✅ Combined SQL generated!\n')
  console.log('📋 Copy the output below and paste into Supabase SQL Editor:')
  console.log('   https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new\n')
  console.log('='.repeat(80))
  console.log(combinedSQL)
  console.log('='.repeat(80))
}

generateMigrationSQL().catch(console.error)

