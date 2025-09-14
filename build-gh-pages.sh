#!/bin/bash

# VibeCaaS GitHub Pages Build Script
# This script builds the frontend for GitHub Pages deployment

set -e

echo "🚀 Starting VibeCaaS GitHub Pages Build..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to frontend
cd frontend

# Backup original next.config.js
if [ -f "next.config.js" ]; then
    cp next.config.js next.config.js.backup
fi

# Use GitHub Pages config
cp next.config.gh-pages.js next.config.js

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the static site
echo "🔨 Building static site..."
npm run build

# Restore original config
if [ -f "next.config.js.backup" ]; then
    mv next.config.js.backup next.config.js
fi

# Create .nojekyll file to prevent Jekyll processing
touch out/.nojekyll

# Copy CNAME file if it exists
if [ -f "../CNAME" ]; then
    cp ../CNAME out/
fi

# Verify build output
echo "🔍 Verifying build output..."
if [ ! -f "out/index.html" ]; then
    echo "❌ Error: Build failed - index.html not found"
    exit 1
fi

echo "✅ Build successful!"

# Show build output
echo "📁 Build output:"
ls -la out/

echo ""
echo "✨ Build complete! The static site is ready in frontend/out/"
echo ""