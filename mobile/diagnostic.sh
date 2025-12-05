#!/bin/bash

# ============================================
# FallHelp Mobile App Diagnostic Script
# ============================================

echo "🔍 FallHelp Mobile App - Diagnostic Check"
echo "=========================================="
echo ""

# 1. Check Node version
echo "1️⃣  Node.js Version:"
node --version
npm --version
echo ""

# 2. Check dependencies
echo "2️⃣  Checking Dependencies..."
if [ -d "node_modules" ]; then
  echo "   ✅ node_modules exists"
  echo "   📦 Package count: $(find node_modules -maxdepth 1 -type d | wc -l)"
else
  echo "   ❌ node_modules missing - running npm install"
  npm install
fi
echo ""

# 3. Check TypeScript
echo "3️⃣  TypeScript Check:"
npx tsc --version
echo ""

# 4. Test build
echo "4️⃣  Testing Expo Build..."
npx expo export --platform web --dry-run 2>&1 | head -20
echo ""

# 5. Check Config
echo "5️⃣  Configuration:"
echo "   API_URL: $(grep -m1 'API_URL' constants/Config.ts | tail -1)"
echo "   SOCKET_URL: $(grep -m1 'SOCKET_URL' constants/Config.ts | tail -1)"
echo ""

# 6. Run tests
echo "6️⃣  Running Jest Tests..."
npm test -- --passWithNoTests 2>&1 | tail -20
echo ""

echo "=========================================="
echo "✅ Diagnostic check complete!"
echo "=========================================="
