#!/bin/bash

echo "🔍 Verifying VibeCaaS Demo Deployment..."
echo "========================================"

# Check if build directory exists
if [ ! -d "out" ]; then
    echo "❌ Build directory 'out' not found. Please run 'npm run build' first."
    exit 1
fi

echo "✅ Build directory exists"

# Check for required files
required_files=("index.html" "404.html" ".nojekyll" "demo/index.html")

for file in "${required_files[@]}"; do
    if [ -f "out/$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check file sizes
echo ""
echo "📊 File sizes:"
ls -lh out/*.html out/.nojekyll

# Check demo directory
echo ""
echo "📁 Demo directory contents:"
ls -la out/demo/

# Check _next directory
echo ""
echo "📁 Static assets:"
ls -la out/_next/static/

echo ""
echo "🎉 Deployment verification complete!"
echo "The demo is ready for GitHub Pages deployment."
echo ""
echo "To test locally: npm run serve-demo"
echo "To deploy: Push to main branch"