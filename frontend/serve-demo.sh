#!/bin/bash

# Serve the demo locally
echo "🚀 Starting VibeCaaS Demo Server..."
echo "📁 Serving from: $(pwd)/out"
echo "🌐 Demo will be available at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Build directory 'out' not found. Please run 'npm run build' first."
    exit 1
fi

# Serve the static files
npx serve out -p 8080 -s