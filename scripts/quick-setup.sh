#!/bin/bash
# Quick database setup helper script

echo "🚀 BTW Assist - Database Setup Helper"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found!"
  echo "   Please create it with your Supabase credentials"
  exit 1
fi

# Check database status
echo "🔍 Checking database status..."
pnpm db:check

echo ""
echo "📋 To set up the database:"
echo "   1. Open: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new"
echo "   2. Copy contents of: scripts/setup.sql"
echo "   3. Paste and run in SQL Editor"
echo ""
echo "💡 Or run: pnpm db:setup (to view the SQL)"

