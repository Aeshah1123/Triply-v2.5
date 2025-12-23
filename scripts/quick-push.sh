#!/bin/bash
cd /Users/samalruhili/Downloads/Triply-v2.3-master
git remote set-url origin https://github.com/Ya-az/Triply-v2.4.git
git checkout main
git add .
git commit -m "feat: Complete bilingual Triply website (Arabic/English)"
git push -u origin main --force
echo "✅ Done! https://github.com/Ya-az/Triply-v2.4"
