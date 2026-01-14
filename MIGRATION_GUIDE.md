# 🗄️ Database Migration Guide

## Quick Start

### Method 1: Generate and Run SQL (Easiest)

```bash
# Generate combined migration SQL
pnpm db:migrate:generate

# Copy the output SQL
# Paste into Supabase SQL Editor: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new
# Click "Run"
# Wait 30 seconds
# Verify: pnpm db:verify
```

### Method 2: Run Individual Migrations

1. Open Supabase SQL Editor:
   https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new

2. Run migrations in order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_row_level_security.sql`
   - `supabase/migrations/20240101000002_seed_btw_codes.sql`

3. Wait 30 seconds

4. Verify:
   ```bash
   pnpm db:verify
   ```

## Migration Structure

```
supabase/
└── migrations/
    ├── 20240101000000_initial_schema.sql      # Tables, indexes, triggers
    ├── 20240101000001_row_level_security.sql  # RLS policies
    └── 20240101000002_seed_btw_codes.sql      # Default BTW codes
```

## What Gets Created

### Tables
- ✅ `profiles` - User profiles
- ✅ `clients` - Client/company information
- ✅ `grootboek_accounts` - Chart of accounts
- ✅ `btw_codes` - BTW code reference table
- ✅ `boekingsregels` - Journal entries/transactions
- ✅ `btw_aangiftes` - VAT return summaries
- ✅ `upload_logs` - File upload tracking

### Security
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ BTW codes are publicly readable

### Default Data
- ✅ Pre-configured Dutch BTW codes (1a, 1b, 5b, etc.)

## Verification

After migrations:

```bash
pnpm db:verify
```

Expected output:
```
✅ profiles - Exists and accessible
✅ clients - Exists and accessible
✅ grootboek_accounts - Exists and accessible
✅ btw_codes - Exists and accessible
✅ boekingsregels - Exists and accessible
✅ btw_aangiftes - Exists and accessible
✅ upload_logs - Exists and accessible

✅ All tables exist and are accessible!
```

## Troubleshooting

### Schema Cache Issues

If you see "schema cache" errors:

1. Wait 30-60 seconds after running migrations
2. Refresh schema cache:
   - Go to: Settings → API
   - Click "Reload schema"
3. Or run in SQL Editor:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

### Migration Already Applied

If you see "already exists" errors, that's fine! The migrations use `IF NOT EXISTS` so they're safe to re-run.

### Need to Reset?

If you need to start fresh:

1. Drop all tables in Supabase SQL Editor (be careful!)
2. Re-run all migrations
3. Verify with `pnpm db:verify`

## Creating New Migrations

1. Create file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Write SQL migration
3. Test in Supabase SQL Editor
4. Commit to version control

Example:
```sql
-- Migration: Add new column
-- Created: 2024-01-13

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS new_field TEXT;
```

## Available Commands

```bash
# Generate combined migration SQL
pnpm db:migrate:generate

# Check database status
pnpm db:check

# Verify schema
pnpm db:verify

# View setup SQL (legacy)
pnpm db:setup
```

## Next Steps

After successful migration:

1. ✅ Verify with `pnpm db:verify`
2. ✅ Refresh your browser
3. ✅ Test the application
4. ✅ Start adding clients and data!

