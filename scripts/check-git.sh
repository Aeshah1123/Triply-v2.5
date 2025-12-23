#!/bin/bash

echo "==================================="
echo "🔍 Git Status Diagnostic"
echo "==================================="
echo ""

cd /Users/samalruhili/Downloads/Triply-v2.3-master

echo "📁 Current Directory:"
pwd
echo ""

echo "🌿 Current Branch:"
git branch --show-current
echo ""

echo "🔗 Remote URL:"
git remote -v
echo ""

echo "📊 Last 3 Commits:"
git log --oneline -3
echo ""

echo "📝 Uncommitted Changes:"
git status --short | head -10
echo ""

echo "==================================="
echo "✅ Diagnostic Complete"
echo "==================================="
