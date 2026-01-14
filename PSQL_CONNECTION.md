# PostgreSQL Direct Connection Guide

## Quick Connection

### Using the Helper Script

```bash
# Connect to database
pnpm db:connect

# Or directly:
./scripts/connect-psql.sh
```

### Manual Connection

```bash
# Set password from environment
export PGPASSWORD="your_password_here"

# Connect
psql -h db.ftleeapkwqztmvlawudk.supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres
```

Or in one line with password prompt:
```bash
psql -h db.ftleeapkwqztmvlawudk.supabase.co -p 5432 -d postgres -U postgres
```

## Running Migrations via psql

### Method 1: Using Script (Recommended)

```bash
pnpm db:migrate:psql
```

This will:
1. ✅ Run all migrations in order
2. ✅ Refresh schema cache
3. ✅ Show success/failure status

### Method 2: Manual Execution

```bash
# Set password
export PGPASSWORD="your_password_here"

# Run each migration
psql -h db.ftleeapkwqztmvlawudk.supabase.co -p 5432 -d postgres -U postgres \
  -f supabase/migrations/20240101000000_initial_schema.sql

psql -h db.ftleeapkwqztmvlawudk.supabase.co -p 5432 -d postgres -U postgres \
  -f supabase/migrations/20240101000001_row_level_security.sql

psql -h db.ftleeapkwqztmvlawudk.supabase.co -p 5432 -d postgres -U postgres \
  -f supabase/migrations/20240101000002_seed_btw_codes.sql

# Refresh schema cache
psql -h db.ftleeapkwqztmvlawudk.supabase.co -p 5432 -d postgres -U postgres \
  -c "NOTIFY pgrst, 'reload schema';"
```

## Useful psql Commands

Once connected:

```sql
-- List all tables
\dt

-- List tables in public schema
\dt public.*

-- Describe a table
\d public.clients

-- List all databases
\l

-- Connect to a different database
\c database_name

-- Show current user
SELECT current_user;

-- Show current database
SELECT current_database();

-- Exit psql
\q
```

## Verify Migrations

After running migrations:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check migration status (if tracking table exists)
SELECT * FROM schema_migrations ORDER BY applied_at;

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Troubleshooting

### "password authentication failed"

- Check your `.env.local` file for `POSTGRES_PASSWORD`
- Verify password in Supabase dashboard: Settings → Database

### "could not connect to server"

- Check if host is correct: `db.ftleeapkwqztmvlawudk.supabase.co`
- Verify port: `5432`
- Check firewall/network settings

### "database does not exist"

- Default database is `postgres`
- List databases: `\l` in psql

### Connection String Format

```
postgresql://postgres:password@db.ftleeapkwqztmvlawudk.supabase.co:5432/postgres
```

## Environment Variables

Make sure `.env.local` contains:

```env
POSTGRES_HOST=db.ftleeapkwqztmvlawudk.supabase.co
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
```

## Security Note

⚠️ **Never commit `.env.local` to version control!**

The password is sensitive. Always use environment variables or `.env.local` file.

