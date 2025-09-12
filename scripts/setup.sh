#!/bin/bash

# VibeCaaS Platform Setup Script
echo "🚀 Setting up VibeCaaS Platform..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ pnpm version: $(pnpm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate placeholder frames
echo "🎬 Generating placeholder frames..."
node scripts/generate-frames.js

# Build packages
echo "🔨 Building packages..."
pnpm build

echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "  pnpm dev"
echo ""
echo "🧪 To run tests:"
echo "  pnpm test"
echo "  pnpm test:e2e"
echo ""
echo "📊 To run Lighthouse:"
echo "  pnpm lighthouse"
echo ""
echo "🌐 Apps will be available at:"
echo "  Marketing: http://localhost:3000"
echo "  IDE Shell: http://localhost:3001"