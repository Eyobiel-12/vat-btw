# BTW Assist - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can copy `.env.example` to `.env.local` and fill in the values.

### 4. Set Up Database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the SQL scripts in order:
   - `scripts/001-create-tables.sql` - Creates all database tables
   - `scripts/002-row-level-security.sql` - Sets up security policies

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### Error: "Missing required Supabase environment variables"

- Make sure you've created `.env.local` in the project root
- Verify the variable names are correct (no typos)
- Restart the dev server after adding environment variables

### Error: "Failed to fetch" or connection errors

- Check that your Supabase project is active
- Verify your Project URL and anon key are correct
- Make sure you've run the database migration scripts

### Database errors

- Ensure you've run both SQL scripts in order
- Check that Row Level Security (RLS) policies are enabled
- Verify your Supabase project has the required extensions enabled

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard routes
│   ├── login/            # Authentication pages
│   └── register/
├── components/           # React components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── actions/         # Server actions
│   └── supabase/       # Supabase client configuration
└── scripts/            # Database migration scripts
```

## Features

- ✅ User authentication (Supabase Auth)
- ✅ Client management
- ✅ Grootboek schema upload (CSV)
- ✅ Boekingsregels upload (CSV)
- ✅ Automatic BTW calculation
- ✅ BTW aangifte overview
- ✅ CSV exports

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **UI:** React, Tailwind CSS, shadcn/ui
- **Language:** TypeScript

## Support

For issues or questions, check the error messages in the application - they now include helpful setup instructions.

