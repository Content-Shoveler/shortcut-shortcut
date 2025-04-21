// Script to manage Electron main process files
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📋 Preparing main process files...');

// Make sure we have the dist directory
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Creating dist directory...');
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
}

// Log the existing structure of the dist directory before building
console.log('Current dist directory structure:');
try {
  const distFiles = fs.readdirSync(path.join(__dirname, 'dist'));
  console.log(distFiles);
} catch (err) {
  console.log('No files in dist directory yet.');
}

// Always rebuild main process files to ensure they're up to date
console.log('🔨 Building main process files...');
try {
  execSync('yarn webpack --env NODE_ENV=production --env WEBPACK_TARGET=main', { 
    stdio: 'inherit' 
  });
} catch (err) {
  console.error('❌ Error building main process files:', err);
  process.exit(1);
}

// Copy main.js to root (for Electron entry point)
try {
  fs.copyFileSync(
    path.join(__dirname, 'dist', 'main.js'), 
    path.join(__dirname, 'main.js')
  );
  console.log('✅ Successfully copied main.js to root');
} catch (err) {
  console.error('❌ Error copying main.js:', err);
  process.exit(1);
}

// Copy preload.js to root
try {
  fs.copyFileSync(
    path.join(__dirname, 'dist', 'preload.js'), 
    path.join(__dirname, 'preload.js')
  );
  console.log('✅ Successfully copied preload.js to root');
} catch (err) {
  console.error('❌ Error copying preload.js:', err);
  process.exit(1);
}

console.log('✨ Copy process completed successfully!');

// Log the final structure of the dist directory
console.log('Final dist directory structure:');
try {
  const distFiles = fs.readdirSync(path.join(__dirname, 'dist'));
  console.log(distFiles);
  
  // Check if index.html is present
  if (distFiles.includes('index.html')) {
    console.log('✅ index.html is present in dist directory');
  } else {
    console.warn('⚠️ WARNING: index.html is not found in dist directory!');
  }
} catch (err) {
  console.error('❌ Error checking dist directory:', err);
}

// Verify paths in production build
console.log('\n📂 Production build verification:');
console.log('- main.js is copied to root directory');
console.log('- preload.js is copied to root directory');
console.log('- index.html remains in dist/ directory (will be loaded by main.js)');
