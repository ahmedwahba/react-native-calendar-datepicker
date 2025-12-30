#!/bin/bash

# Deploy script for GitHub Pages
# This script handles large files and Git configuration issues

set -e

echo "🚀 Starting deployment to GitHub Pages..."

# Increase Git HTTP buffer for large files
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M

# Ensure .nojekyll file exists
touch dist/.nojekyll

# Deploy using gh-pages
echo "📦 Deploying dist folder to gh-pages branch..."
npx gh-pages --nojekyll -d dist

echo "✅ Deployment complete!"
