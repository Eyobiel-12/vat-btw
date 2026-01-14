# Database Setup Scripts

## Quick Setup

### Option 1: Automated Check (Recommended)

Check if your database is set up:

```bash
pnpm db:check
```

### Option 2: Manual Setup

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new

2. **Run the setup script:**
   - Copy the contents of `scripts/setup.sql`
   - Paste into the SQL Editor
   - Click "Run"

That's it! The script will:
- ✅ Create all required tables
- ✅ Set up indexes for performance
- ✅ Configure Row Level Security (RLS)
- ✅ Insert default BTW codes
- ✅ Set up triggers for auto-updating timestamps

### Option 3: View Setup SQL

```bash
pnpm db:setup
```

This will display the SQL script in your terminal.

## What Gets Created

### Tables
- `profiles` - User profiles
- `clients` - Client/company information
- `grootboek_accounts` - Chart of accounts
- `btw_codes` - BTW code reference table
- `boekingsregels` - Journal entries/transactions
- `btw_aangiftes` - VAT return summaries
- `upload_logs` - File upload tracking

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- BTW codes are publicly readable

### Default Data
- Pre-configured Dutch BTW codes (1a, 1b, 5b, etc.)

## Verification

After running the setup, verify with:

```bash
pnpm db:check
```

You should see ✅ for all tables.

