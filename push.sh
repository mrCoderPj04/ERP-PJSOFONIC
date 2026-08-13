#!/usr/bin/env bash
set -e

echo "🚀 Pushing PJSOFONIC ERP Frontend..."
git init
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/mrCoderPj04/ERP-PJSOFONIC.git
git add .
git commit -m "feat: complete PJSOFONIC ERP frontend with EMS auth, CRM ingestion, quality testing, real-time chat, logo & gitignore" || true
git branch -M main
git push -u origin main --force
echo "✅ Frontend pushed to https://github.com/mrCoderPj04/ERP-PJSOFONIC.git"
