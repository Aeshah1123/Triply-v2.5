#!/bin/bash

echo "🚀 Starting deployment to GitHub Pages..."

cd /Users/samalruhili/Downloads/Triply-v2.3-master

echo "📦 Building project..."
npm run build

echo "📝 Adding changes to git..."
git add .

echo "💾 Creating commit..."
git commit -m "chore: Ensure GitHub Pages deployment is configured correctly" || echo "No changes to commit"

echo "⬆️ Pushing to GitHub..."
git push origin main

echo "✅ Done! Check your repository at: https://github.com/Ya-az/Triply-v2.3"
echo "🌐 Site will be available at: https://ya-az.github.io/Triply-v2.3/"
echo ""
echo "📌 Next steps:"
echo "1. Go to https://github.com/Ya-az/Triply-v2.3/settings/pages"
echo "2. Under 'Source', select 'GitHub Actions'"
echo "3. Wait for the Actions workflow to complete"
echo "4. Your site will be live!"
