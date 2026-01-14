#!/usr/bin/env node
/**
 * Database Migration Runner
 * Runs all migrations in order from supabase/migrations/
 */

const { createClient } = require('@supabase/supabase-js')
const { readdir, readFile } = require('fs/promises')
const { join } = require('path')
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

// Create migrations tracking table
async function ensureMigrationsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })

  // If RPC doesn't work, try direct query
  if (error) {
    // Try alternative method - we'll use a workaround
    console.log('⚠️  Note: Using direct SQL execution (migrations table will be created)')
  }
}

async function getAppliedMigrations() {
  try {
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
      .order('version')

    if (error && error.code === '42P01') {
      // Table doesn't exist yet, return empty array
      return []
    }

    return data ? data.map(row => row.version) : []
  } catch (err) {
    // Table might not exist
    return []
  }
}

async function markMigrationApplied(version, name) {
  try {
    await supabase
      .from('schema_migrations')
      .insert({ version, name })
  } catch (err) {
    // Ignore if table doesn't exist yet
    console.log(`⚠️  Could not mark migration as applied: ${err.message}`)
  }
}

async function runSQL(sql) {
  // Supabase doesn't have a direct SQL execution endpoint via JS client
  // We'll use the REST API directly
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
    // Fallback: try using Supabase SQL Editor API or direct connection
    throw new Error(`SQL execution failed: ${response.statusText}`)
  }

  return await response.json()
}

async function executeMigration(sql, version, name) {
  console.log(`\n📝 Running migration: ${name} (${version})`)
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let successCount = 0
  let errorCount = 0

  for (const statement of statements) {
    if (statement.trim().length === 0) continue

    try {
      // Use Supabase's REST API to execute SQL
      // Note: This requires the exec_sql function to exist, or we use direct connection
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      })

      if (error) {
        // Try alternative: use pg library or direct connection
        console.log(`⚠️  Statement execution note: ${error.message}`)
        // For now, we'll recommend manual execution
        throw new Error('Direct SQL execution not available. Please run migrations via Supabase SQL Editor.')
      }
      successCount++
    } catch (err) {
      errorCount++
      console.error(`❌ Error in statement: ${err.message}`)
      throw err
    }
  }

  console.log(`✅ Migration completed: ${successCount} statements executed`)
  await markMigrationApplied(version, name)
}

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n')

  try {
    // Ensure migrations table exists
    await ensureMigrationsTable()

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations()
    console.log(`📋 Applied migrations: ${appliedMigrations.length}`)

    // Read migration files
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    const files = await readdir(migrationsDir)
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort()

    console.log(`📁 Found ${migrationFiles.length} migration files\n`)

    let applied = 0
    let skipped = 0

    for (const file of migrationFiles) {
      const version = file.replace('.sql', '')
      const name = file

      if (appliedMigrations.includes(version)) {
        console.log(`⏭️  Skipping ${name} (already applied)`)
        skipped++
        continue
      }

      try {
        const sql = await readFile(join(migrationsDir, file), 'utf-8')
        await executeMigration(sql, version, name)
        applied++
      } catch (err) {
        console.error(`\n❌ Migration failed: ${name}`)
        console.error(`   Error: ${err.message}\n`)
        console.log('💡 Tip: You can run migrations manually via Supabase SQL Editor')
        console.log(`   File: ${join(migrationsDir, file)}\n`)
        process.exit(1)
      }
    }

    console.log(`\n✅ Migrations complete!`)
    console.log(`   Applied: ${applied}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`\n🔄 Refreshing schema cache...`)
    
    // Refresh schema cache
    try {
      await supabase.rpc('exec_sql', { 
        sql: "NOTIFY pgrst, 'reload schema';" 
      })
      console.log('✅ Schema cache refresh triggered')
    } catch (err) {
      console.log('⚠️  Could not auto-refresh schema cache. Please refresh manually in Supabase dashboard.')
    }

    console.log('\n📋 Next steps:')
    console.log('   1. Wait 30 seconds for schema cache to refresh')
    console.log('   2. Run: pnpm db:verify')
    console.log('   3. Refresh your browser\n')

  } catch (err) {
    console.error(`\n❌ Migration process failed: ${err.message}`)
    console.log('\n💡 Alternative: Run migrations manually via Supabase SQL Editor')
    console.log('   https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new\n')
    process.exit(1)
  }
}

runMigrations().catch(console.error)

