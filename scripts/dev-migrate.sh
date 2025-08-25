#!/bin/bash

# Development migration script that uses .env.local for Prisma CLI
echo "🔧 Running development database migration..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please create it for local development."
    exit 1
fi

# Temporarily backup .env if it exists
if [ -f .env ]; then
    echo "📦 Backing up .env to .env.backup"
    mv .env .env.backup
fi

# Copy .env.local to .env for Prisma CLI
echo "🔄 Using .env.local configuration for migration..."
cp .env.local .env

# Run the migration
echo "🗄️ Running Prisma migration..."
npx prisma migrate dev

# Store the exit code
migration_exit_code=$?

# Restore original .env if backup exists
if [ -f .env.backup ]; then
    echo "♻️ Restoring original .env"
    mv .env.backup .env
else
    # If no backup, remove the temporary .env
    rm .env
fi

# Check migration result
if [ $migration_exit_code -eq 0 ]; then
    echo "✅ Development migration completed successfully!"
    echo "💡 You can now run: npm run dev"
else
    echo "❌ Migration failed with exit code $migration_exit_code"
    exit $migration_exit_code
fi
