#!/usr/bin/env node

/**
 * Deploy script for GitHub Pages
 * Handles large files and Git configuration issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');

console.log('🚀 Starting deployment to GitHub Pages...');

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist directory does not exist. Run "yarn predeploy" first.');
  process.exit(1);
}

// Ensure .nojekyll file exists
const nojekyllPath = path.join(distPath, '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '');
  console.log('✅ Created .nojekyll file');
}

// Copy index.html to 404.html for SPA client-side routing
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');
if (fs.existsSync(indexPath) && !fs.existsSync(notFoundPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✅ Created 404.html for SPA routing');
}

try {
  // Configure Git for large files
  console.log('⚙️  Configuring Git for large files...');
  execSync('git config http.postBuffer 524288000', { stdio: 'inherit' });
  execSync('git config http.maxRequestBuffer 100M', { stdio: 'inherit' });

  // Clean gh-pages cache if it exists (this fixes "branch already exists" error)
  const cachePath = path.join(__dirname, '..', 'node_modules', '.cache', 'gh-pages');
  if (fs.existsSync(cachePath)) {
    console.log('🧹 Cleaning gh-pages cache...');
    fs.rmSync(cachePath, { recursive: true, force: true });
  }

  // Also clean any local gh-pages cache in the project
  const localCachePath = path.join(__dirname, '..', '.cache', 'gh-pages');
  if (fs.existsSync(localCachePath)) {
    console.log('🧹 Cleaning local gh-pages cache...');
    fs.rmSync(localCachePath, { recursive: true, force: true });
  }

  // Deploy using gh-pages
  // Note: gh-pages will use the existing branch automatically if it exists
  console.log('📦 Deploying dist folder to gh-pages branch...');
  execSync('npx gh-pages --nojekyll -d dist', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });

  console.log('✅ Deployment complete!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  
  // If it's the "branch already exists" error, try cleaning cache and retrying
  if (error.message.includes('already exists') || error.stdout?.includes('already exists')) {
    console.log('\n🔄 Attempting to fix by cleaning cache and retrying...');
    try {
      // Clean cache more aggressively
      const cachePath = path.join(__dirname, '..', 'node_modules', '.cache', 'gh-pages');
      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true, force: true });
      }
      
      // Try again
      execSync('npx gh-pages --nojekyll -d dist --existing', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      });
      console.log('✅ Deployment complete after retry!');
      process.exit(0);
    } catch (retryError) {
      console.error('❌ Retry also failed:', retryError.message);
    }
  }
  
  console.log('\n💡 Tips:');
  console.log('   - Make sure you have push access to the repository');
  console.log('   - Check your Git credentials (use SSH or set up a Personal Access Token)');
  console.log('   - Try manually cleaning: rm -rf node_modules/.cache/gh-pages');
  console.log('   - Try using the GitHub Actions workflow instead (already configured)');
  process.exit(1);
}
