#!/bin/bash

# =============================================================================
# Snapp Heatmap - Project Setup Script
# =============================================================================

set -e

echo "🚀 Setting up Snapp Heatmap project..."

# =============================================================================
# Check Prerequisites
# =============================================================================

echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker is not installed. You'll need to install PostgreSQL and Redis manually."
    DOCKER_AVAILABLE=false
fi

# Check if Docker Compose is installed
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed"
    COMPOSE_AVAILABLE=true
else
    echo "⚠️  Docker Compose is not installed"
    COMPOSE_AVAILABLE=false
fi

# =============================================================================
# Environment Setup
# =============================================================================

echo "🔧 Setting up environment..."

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f config/env.example ]; then
        cp config/env.example .env
        echo "✅ Created .env file from template"
        echo "⚠️  Please edit .env file with your configuration"
    else
        echo "❌ Environment template not found at config/env.example"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# =============================================================================
# Install Dependencies
# =============================================================================

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install workspace dependencies
echo "Installing scraper dependencies..."
cd scraper && npm install && cd ..

echo "Installing workers dependencies..."
cd workers && npm install && cd ..

echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "✅ All dependencies installed"

# =============================================================================
# Database Setup
# =============================================================================

echo "🗄️  Setting up database..."

if [ "$DOCKER_AVAILABLE" = true ] && [ "$COMPOSE_AVAILABLE" = true ]; then
    echo "Starting database with Docker..."
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    echo "Running database migrations..."
    npm run db:migrate
    
    # Seed database
    echo "Seeding database..."
    npm run db:seed
    
else
    echo "⚠️  Please ensure PostgreSQL and Redis are running manually"
    echo "Then run: npm run db:migrate && npm run db:seed"
fi

# =============================================================================
# Create Logs Directory
# =============================================================================

echo "📁 Creating logs directory..."
mkdir -p logs
echo "✅ Logs directory created"

# =============================================================================
# Build Applications
# =============================================================================

echo "🔨 Building applications..."

# Build backend
echo "Building backend..."
cd backend && npm run build && cd ..

# Build frontend
echo "Building frontend..."
cd frontend && npm run build && cd ..

echo "✅ Applications built successfully"

# =============================================================================
# Setup Complete
# =============================================================================

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the development environment:"
echo "   npm run dev"
echo ""
echo "🚀 Available commands:"
echo "  npm run dev          - Start all services in development mode"
echo "  npm run dev:scraper  - Start scraper only"
echo "  npm run dev:workers  - Start workers only"
echo "  npm run dev:backend  - Start backend API only"
echo "  npm run dev:frontend - Start frontend only"
echo ""
echo "🐳 Docker commands:"
echo "  npm run docker:up    - Start all services with Docker"
echo "  npm run docker:down  - Stop all Docker services"
echo ""
echo "📊 Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  API Health: http://localhost:3001/api/health"
echo ""
echo "Happy coding! 🚕" 