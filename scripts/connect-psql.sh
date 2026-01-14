#!/bin/bash
# PostgreSQL Connection Script for Supabase
# Usage: ./scripts/connect-psql.sh

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Database connection details
DB_HOST="${POSTGRES_HOST:-db.ftleeapkwqztmvlawudk.supabase.co}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DATABASE:-postgres}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ POSTGRES_PASSWORD not found in .env.local"
  echo ""
  echo "Please add to .env.local:"
  echo "POSTGRES_PASSWORD=your_password_here"
  echo ""
  echo "Or run manually:"
  echo "psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER"
  exit 1
fi

echo "🔌 Connecting to Supabase PostgreSQL..."
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Use PGPASSWORD environment variable for password
export PGPASSWORD="$DB_PASSWORD"

# Connect to database
psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER"

