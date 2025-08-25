#!/bin/sh

echo "🚀 Starting application..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until nc -z db 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ Database is ready!"

# Setup database schema provider
echo "🔧 Setting up database schema..."
node scripts/setup-database.js

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "🎉 Database setup complete!"

# Start the application
echo "🌟 Starting Next.js application..."
exec "$@"
