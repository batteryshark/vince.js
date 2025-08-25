#!/bin/bash

# Cleanup script for development build artifacts
echo "🧹 Cleaning up development build artifacts..."

# Remove Next.js build output
rm -rf .next

# Remove TypeScript build output (if any)
rm -rf .swc

# Check if user wants to clean database
if [ "$1" = "--with-db" ] || [ "$1" = "-d" ]; then
    echo "🗄️ Cleaning development database..."
    rm -f prisma/dev.db
    rm -f prisma/dev.db-journal
    echo "📝 Database cleaned. Run 'npm run db:migrate:dev' before next startup."
else
    echo "💡 To also clean the database, run: ./cleanup_dev.sh --with-db"
fi

echo "✅ Cleanup complete!"