#!/bin/bash

# Development Prisma command wrapper that uses .env.local
echo "🔧 Running Prisma command with development configuration..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please create it for local development."
    exit 1
fi

# Check if command was provided
if [ $# -eq 0 ]; then
    echo "❌ Please provide a Prisma command."
    echo "Usage: $0 <prisma-command>"
    echo "Examples:"
    echo "  $0 migrate dev"
    echo "  $0 migrate reset"
    echo "  $0 db push"
    echo "  $0 studio"
    echo "  $0 generate"
    exit 1
fi

# Temporarily backup .env if it exists
if [ -f .env ]; then
    echo "📦 Backing up .env to .env.backup"
    mv .env .env.backup
fi

# Copy .env.local to .env for Prisma CLI
echo "🔄 Using .env.local configuration..."
cp .env.local .env

# Run the Prisma command with all arguments
echo "🗄️ Running: npx prisma $*"
npx prisma "$@"

# Store the exit code
prisma_exit_code=$?

# Restore original .env if backup exists
if [ -f .env.backup ]; then
    echo "♻️ Restoring original .env"
    mv .env.backup .env
else
    # If no backup, remove the temporary .env
    rm .env
fi

# Check command result
if [ $prisma_exit_code -eq 0 ]; then
    echo "✅ Prisma command completed successfully!"
else
    echo "❌ Prisma command failed with exit code $prisma_exit_code"
    exit $prisma_exit_code
fi
