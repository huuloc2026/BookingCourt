#!/bin/bash

# Quick setup script for the NestJS project
echo "🚀 Setting up NestJS Boilerplate API..."
echo "====================================="

# Check if PostgreSQL is running
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "✅ PostgreSQL is running"
else
  echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
  echo "   You can start it with: sudo systemctl start postgresql"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

# Build the project
echo "🏗️ Building the project..."
npm run build

# Build the project
echo "🏗️ Copying env.example to .env..."
cp .env.example .env

echo ""
echo "🎉 Setup completed successfully!"
echo "📚 Available commands:"
echo "  npm run start:dev    - Start development server"
echo "  npm run start:prod   - Start production server"
echo "  npm run build        - Build the application"
echo "  npm run lint         - Run linting"
echo "  npm run test         - Run tests"
echo "  ./test-api.sh        - Test the API endpoints"
echo ""
echo "📖 Documentation:"
echo "  API Docs: http://localhost:8888/api/docs"
echo "  Health Check: http://localhost:8888/api/health"
echo ""
echo "🔧 Database commands:"
echo "  npx prisma studio    - Open Prisma Studio (database GUI)"
echo "  npx prisma migrate dev - Run migrations"
echo "  npx prisma generate  - Generate Prisma client"
