#!/bin/bash

# Production deployment script
set -e

echo "🚀 Starting production deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Check if required environment variables are set
required_vars=("JWT_SECRET" "ADMIN_PASSWORD" "SERVICE_API_KEY")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ ERROR: $var environment variable is not set"
    exit 1
  fi
done

echo "✅ Environment variables validated"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "✅ Production deployment completed successfully!"