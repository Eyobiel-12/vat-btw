#!/bin/bash
# Run Migrations via psql
# Usage: ./scripts/run-migrations-psql.sh

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
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

MIGRATIONS_DIR="supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
  exit 1
fi

echo "🚀 Running database migrations via psql..."
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo ""

# Get migration files in order
MIGRATION_FILES=$(ls -1 "$MIGRATIONS_DIR"/*.sql | sort)

for migration_file in $MIGRATION_FILES; do
  filename=$(basename "$migration_file")
  echo "📝 Running: $filename"
  
  if psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -f "$migration_file" > /dev/null 2>&1; then
    echo "   ✅ Success"
  else
    echo "   ❌ Failed"
    echo "   Check output above for errors"
    exit 1
  fi
done

echo ""
echo "✅ All migrations completed!"
echo ""
echo "🔄 Refreshing schema cache..."
psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -c "NOTIFY pgrst, 'reload schema';" > /dev/null 2>&1

echo "✅ Schema cache refresh triggered"
echo ""
echo "📋 Next steps:"
echo "   1. Wait 30 seconds for schema cache to refresh"
echo "   2. Run: pnpm db:verify"
echo "   3. Refresh your browser"

