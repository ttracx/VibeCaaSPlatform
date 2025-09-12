#!/bin/bash

# VibeCaaS Demo Deployment Script
# This script builds and deploys the demo to GitHub Pages

set -e

echo "🚀 Starting VibeCaaS Demo Deployment..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the demo
echo "📦 Building the demo..."
cd frontend
npm install --legacy-peer-deps
npm run build

# Verify build output
echo "🔍 Verifying build output..."
if [ ! -f "out/index.html" ]; then
    echo "❌ Error: Build failed - index.html not found"
    exit 1
fi

if [ ! -f "out/.nojekyll" ]; then
    echo "❌ Error: Build failed - .nojekyll not found"
    exit 1
fi

echo "✅ Build successful!"

# Show build output
echo "📁 Build output:"
ls -la out/

# Instructions for manual deployment
echo ""
echo "🎯 Next steps:"
echo "1. Commit and push your changes to the main branch"
echo "2. GitHub Actions will automatically deploy to GitHub Pages"
echo "3. Or manually push the out/ directory to the gh-pages branch:"
echo "   git subtree push --prefix frontend/out origin gh-pages"
echo ""
echo "🌐 Your demo will be available at:"
echo "   https://your-username.github.io/your-repository-name"
echo ""
echo "✨ Deployment preparation complete!"