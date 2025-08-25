.PHONY: help setup secrets start stop clean logs

# Default target
help:
	@echo "🔐 API Key Manager - Docker Setup"
	@echo "================================"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup    - Generate secrets and prepare for Docker"
	@echo "  make start    - Start the application with Docker Compose"
	@echo "  make stop     - Stop the Docker containers"
	@echo "  make logs     - Show application logs"
	@echo "  make clean    - Stop containers and remove volumes"
	@echo "  make secrets  - Generate new secrets only"
	@echo ""
	@echo "Quick start: make setup && make start"

# Generate secrets and prepare environment
setup:
	@echo "🔧 Setting up API Key Manager..."
	@node scripts/generate-secrets.js
	@echo ""
	@echo "✅ Setup complete! Run 'make start' to launch the application."

# Generate secrets only
secrets:
	@node scripts/generate-secrets.js

# Start the application
start:
	@echo "🚀 Starting API Key Manager..."
	@docker-compose up -d
	@echo ""
	@echo "🌐 Application starting at: http://localhost:3000"
	@echo "📊 Database UI at: http://localhost:5432"
	@echo ""
	@echo "📋 To view logs: make logs"
	@echo "🛑 To stop: make stop"

# Stop the application
stop:
	@echo "🛑 Stopping API Key Manager..."
	@docker-compose down

# Show logs
logs:
	@docker-compose logs -f

# Clean up everything
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	@docker-compose down -v
	@docker system prune -f
	@echo "✅ Cleanup complete!"
