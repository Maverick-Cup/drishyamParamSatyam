/**
 * copy_standalone_assets.js
 * Automatically runs after 'next build'.
 * Copies static assets and public directory into .next/standalone
 * so the standalone Node server has all styles, scripts, and media available.
 */

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const root = process.cwd();
  const standaloneDir = path.join(root, '.next', 'standalone');

  if (fs.existsSync(standaloneDir)) {
    console.log('📦 Mirroring static assets to .next/standalone...');

    // 1. Copy public -> .next/standalone/public
    const srcPublic = path.join(root, 'public');
    const destPublic = path.join(standaloneDir, 'public');
    copyDir(srcPublic, destPublic);
    console.log('   ✅ Copied public/ -> .next/standalone/public/');

    // 2. Copy .next/static -> .next/standalone/.next/static
    const srcStatic = path.join(root, '.next', 'static');
    const destStatic = path.join(standaloneDir, '.next', 'static');
    copyDir(srcStatic, destStatic);
    console.log('   ✅ Copied .next/static/ -> .next/standalone/.next/static/');

    console.log('✨ Standalone packaging complete. Zero missing static assets.');
  } else {
    console.log('ℹ️ No .next/standalone directory detected; skipping mirror.');
  }
} catch (err) {
  console.error('❌ Failed to copy standalone assets:', err.message);
  process.exit(1);
}
