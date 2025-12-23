#!/bin/bash
set -e

echo "🚀 Starting Git operations..."

cd /Users/samalruhili/Downloads/Triply-v2.3-master || exit 1

echo "📍 Current directory: $(pwd)"

# Remove old remote if exists
echo "🔗 Configuring remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Ya-az/Triply-v2.3.git

echo "✅ Remote configured:"
git remote -v

# Ensure we're on main branch
echo "🌿 Switching to main branch..."
git checkout main 2>/dev/null || git checkout -b main

# Add all changes
echo "📦 Adding all changes..."
git add -A

# Commit
echo "💾 Creating commit..."
git commit -m "feat: Complete bilingual support (Arabic/English)

- Implemented full i18n system with ar.js and en.js
- Translated AI assistant with 10 questions in both languages
- Updated all components to use translation context
- Fixed contact form with dynamic translations
- Completed booking pages translation
- Added GitHub Pages deployment configuration
- All static text now uses translation keys" 2>/dev/null || echo "No changes to commit"

# Push with force
echo "⬆️ Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "✅ SUCCESS! Changes pushed to GitHub"
echo "🌐 Check: https://github.com/Ya-az/Triply-v2.3"
echo "📄 View commits: https://github.com/Ya-az/Triply-v2.3/commits/main"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/Ya-az/Triply-v2.3/settings/pages"
echo "2. Select Source: GitHub Actions"
echo "3. Wait for deployment"
echo "4. Visit: https://ya-az.github.io/Triply-v2.3/"
