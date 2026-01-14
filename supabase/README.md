# Database Migrations

This directory contains PostgreSQL migrations for the BTW Assist application.

## Migration Files

Migrations are numbered sequentially and run in order:

1. `20240101000000_initial_schema.sql` - Creates all database tables, indexes, and triggers
2. `20240101000001_row_level_security.sql` - Sets up Row Level Security (RLS) policies
3. `20240101000002_seed_btw_codes.sql` - Inserts default Dutch BTW codes

## Running Migrations

### Option 1: Via Supabase SQL Editor (Recommended)

1. Generate combined SQL:
   ```bash
   pnpm db:migrate:generate
   ```

2. Copy the output SQL

3. Open Supabase SQL Editor:
   https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new

4. Paste and run the SQL

5. Wait 30 seconds for schema cache refresh

6. Verify:
   ```bash
   pnpm db:verify
   ```

### Option 2: Using Supabase CLI (If Installed)

```bash
# Install Supabase CLI first
npm install -g supabase

# Link to your project
supabase link --project-ref ftleeapkwqztmvlawudk

# Run migrations
supabase db push
```

### Option 3: Manual Execution

Run each migration file in order via Supabase SQL Editor:

1. `20240101000000_initial_schema.sql`
2. `20240101000001_row_level_security.sql`
3. `20240101000002_seed_btw_codes.sql`

## Creating New Migrations

1. Create a new file with timestamp prefix:
   ```
   YYYYMMDDHHMMSS_description.sql
   ```

2. Example:
   ```
   20240113140000_add_new_column.sql
   ```

3. Write your SQL migration

4. Test it in Supabase SQL Editor before committing

## Migration Best Practices

- ✅ Always use `IF NOT EXISTS` for tables/columns
- ✅ Use `DROP POLICY IF EXISTS` before creating policies
- ✅ Test migrations in a development environment first
- ✅ Keep migrations small and focused
- ✅ Never modify existing migrations (create new ones instead)
- ✅ Document what each migration does

## Verifying Migrations

After running migrations, verify with:

```bash
pnpm db:verify
```

All tables should show ✅ if migrations were successful.

## Troubleshooting

### "Table already exists" errors
- This is normal if migrations were partially run
- The `IF NOT EXISTS` clauses should prevent issues
- You can safely re-run migrations

### Schema cache issues
- Wait 30-60 seconds after running migrations
- Refresh schema cache in Supabase dashboard
- Run: `NOTIFY pgrst, 'reload schema';` in SQL Editor

### Permission errors
- Ensure RLS policies were created correctly
- Check that migrations ran in order
- Verify user authentication is working

