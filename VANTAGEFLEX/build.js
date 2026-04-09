#!/usr/bin/env node
/**
 * Build script for Cloudflare Pages
 * Copies all static files to dist/ directory
 */

const fs = require('fs');
const path = require('path');

const srcDir = '.';
const distDir = './dist';

// Files and directories to copy
const include = [
  '*.html',
  '*.css',
  '*.js',
  '_headers',
  '_redirects',
  '_routes.json',
  'README.md'
];

// Files to exclude
const exclude = [
  'build.js',
  'package.json',
  'package-lock.json',
  'node_modules',
  'dist',
  'wrangler.toml',
  '.git',
  '.gitignore'
];

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip excluded items
    if (exclude.some(e => srcPath.includes(e))) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// Clean and create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy root files
const rootFiles = fs.readdirSync(srcDir);
for (const file of rootFiles) {
  if (exclude.includes(file)) continue;
  
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(distDir, file);
  const stat = fs.statSync(srcPath);
  
  if (stat.isDirectory()) {
    copyDir(srcPath, destPath);
  } else {
    copyFile(srcPath, destPath);
  }
}

console.log('\n✅ Build complete! Files copied to dist/');
