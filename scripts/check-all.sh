#!/bin/bash

# VibeCaaS Platform - Run All Checks
echo "🔍 Running all checks for VibeCaaS Platform..."

# Exit on any error
set -e

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Type checking..."
pnpm type-check

echo "🧹 Linting..."
pnpm lint

echo "🧪 Running unit tests..."
cd packages/motion && pnpm test && cd ../..

echo "🏗️ Building packages..."
pnpm build

echo "🌐 Installing Playwright browsers..."
cd tests/e2e && pnpm exec playwright install && cd ../..

echo "🎭 Running E2E tests..."
pnpm test:e2e

echo "✅ All checks passed successfully!"
echo ""
echo "📊 Summary:"
echo "  ✓ Type checking: PASSED"
echo "  ✓ Linting: PASSED"
echo "  ✓ Unit tests: PASSED"
echo "  ✓ Build: PASSED"
echo "  ✓ E2E tests: PASSED"
echo ""
echo "🚀 Ready for deployment!"