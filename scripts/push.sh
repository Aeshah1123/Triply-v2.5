#!/bin/bash
cd /Users/samalruhili/Downloads/Triply-v2.3-master
git add -A
git commit -m "feat: Complete bilingual support with AI assistant translations

- Added full Arabic and English translation system
- Translated AI assistant with 10 questions in both languages
- Updated all components to use translation context
- Fixed contact form and booking section translations
- Added GitHub Pages deployment configuration
- Updated vite.config.js for correct base path
- Created comprehensive deployment guide"
git push origin main --force
echo "✅ Done! Changes pushed to GitHub"
