#!/bin/bash

# Environment Setup Script for Deployment
# Prepares environment for contract deployment

set -e

echo "🔧 Setting up deployment environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Check Clarinet
if ! command -v clarinet &> /dev/null; then
    echo "⚠️  Clarinet CLI not found"
    echo "Install from: https://github.com/hirosystems/clarinet"
    exit 1
fi

echo "✅ Clarinet found: $(clarinet --version)"

# Check if .env exists in frontend
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found"
    echo "Creating from .env.example..."
    cp frontend/.env.example frontend/.env
    echo "📝 Please update frontend/.env with your values"
fi

echo "✅ Environment file exists"

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo "✅ Dependencies installed"
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update frontend/.env with contract addresses"
echo "2. Fund your deployment wallet with STX"
echo "3. Run deployment script for your target network"
