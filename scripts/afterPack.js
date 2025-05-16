/**
 * After-pack script for electron-builder
 * This script runs after the app is packaged but before it's signed
 * It removes unnecessary files to reduce the final app size
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Recursively delete unnecessary files from the packaged app
 * @param {string} directory - The directory to clean
 */
function cleanupDirectory(directory) {
  console.log(`🧹 Cleaning up directory: ${directory}`);
  
  // List of patterns to remove
  const patternsToRemove = [
    // Source maps
    '**/*.js.map',
    '**/*.map',
    
    // Development files
    '**/*.d.ts',
    '**/*.ts',
    '**/*.tsx',
    
    // Documentation
    '**/node_modules/**/docs/**',
    '**/node_modules/**/documentation/**',
    '**/node_modules/**/*.md',
    '**/node_modules/**/*.markdown',
    '**/node_modules/**/README',
    '**/node_modules/**/readme',
    '**/node_modules/**/CONTRIBUTING*',
    '**/node_modules/**/CHANGELOG*',
    '**/node_modules/**/HISTORY*',
    '**/node_modules/**/AUTHORS*',
    
    // Tests
    '**/node_modules/**/test/**',
    '**/node_modules/**/tests/**',
    '**/node_modules/**/__tests__/**',
    '**/node_modules/**/mocha/**',
    '**/node_modules/**/jest/**',
    '**/node_modules/**/*.spec.*',
    '**/node_modules/**/*.test.*',
    
    // Examples
    '**/node_modules/**/example/**',
    '**/node_modules/**/examples/**',
    '**/node_modules/**/demo/**',
    '**/node_modules/**/demos/**',
    
    // Other unnecessary files
    '**/node_modules/**/.bin/**',
    '**/node_modules/**/.github/**',
    '**/node_modules/**/.vscode/**',
    '**/node_modules/**/.idea/**',
    '**/node_modules/**/.editorconfig',
    '**/node_modules/**/.eslintrc*',
    '**/node_modules/**/.prettierrc*',
    '**/node_modules/**/.travis.yml',
    '**/node_modules/**/.circle*',
    '**/node_modules/**/.nyc_output/**',
    '**/node_modules/**/coverage/**',
    '**/LICENSE*',
    '**/license*',
    '**/CHANGELOG*',
    '**/changelog*',
    
    // Specific large packages to prune
    '**/node_modules/@mui/**/esm/**', // Keep only the CJS version
    '**/node_modules/@emotion/**/esm/**',
    '**/node_modules/framer-motion/**/dist/es/**', // Keep only CJS
    '**/node_modules/@rive-app/**/dist/esm/**', // Keep only CJS
    '**/node_modules/react-dom/**/esm/**',
    '**/node_modules/react/**/esm/**',
    
    // Development tooling
    '**/node_modules/typescript/**',
    '**/node_modules/@types/**',
    '**/node_modules/@babel/**',
    '**/node_modules/webpack*/**',
    '**/node_modules/*webpack*/**',
    '**/node_modules/prettier/**',
    '**/node_modules/eslint/**',
    '**/node_modules/*eslint*/**',
    
    // Language files except English
    '**/node_modules/**/locale/*',
    '**/node_modules/**/locales/*',
    '**/node_modules/**/i18n/*',
    '!**/node_modules/**/locale/en*',
    '!**/node_modules/**/locales/en*',
    '!**/node_modules/**/i18n/en*',
    
    // Source files when we have dist
    '**/node_modules/**/src/**',
    '**/node_modules/**/lib/**',
  ];
  
  // Create a glob pattern string for 'find' command
  const findPatterns = patternsToRemove.map(pattern => {
    // Escape spaces and other special characters
    const escaped = pattern.replace(/(\s|\(|\)|\[|\]|\|)/g, '\\$1');
    return `-path "${escaped}"`;
  }).join(' -o ');
  
  try {
    // Find and delete files matching the patterns
    const command = `find "${directory}" ${findPatterns} -type f -delete`;
    execSync(command, { stdio: 'inherit' });
    
    // Remove empty directories
    execSync(`find "${directory}" -type d -empty -delete`, { stdio: 'inherit' });
    
    // Extra cleanup for large package directories
    const largePackages = [
      '@mui',
      '@emotion',
      'framer-motion',
      '@rive-app',
      'electron',
      'typescript',
      '@types',
      '@babel',
      'webpack',
      'app-builder-bin',
      'app-builder-lib',
    ];
    
    console.log('🔍 Performing additional cleanup on large packages...');
    for (const pkg of largePackages) {
      const pkgPath = path.join(directory, 'node_modules', pkg);
      if (fs.existsSync(pkgPath)) {
        console.log(`  Processing ${pkg}...`);
        try {
          // Apply more aggressive cleanup for specific packages
          if (pkg === '@mui' || pkg === '@emotion' || pkg === 'framer-motion') {
            // Keep only CJS, remove ESM
            execSync(`find "${pkgPath}" -path "*/esm/*" -delete`, { stdio: 'inherit' });
            execSync(`find "${pkgPath}" -path "*/es/*" -delete`, { stdio: 'inherit' });
          }
          
          // Remove extra files that might have been missed
          execSync(`find "${pkgPath}" -name "*.d.ts" -delete`, { stdio: 'inherit' });
          execSync(`find "${pkgPath}" -name "*.ts" -not -name "*.d.ts" -delete`, { stdio: 'inherit' });
          execSync(`find "${pkgPath}" -name "*test*" -type d -exec rm -rf {} +`, { stdio: 'inherit' });
          execSync(`find "${pkgPath}" -name "*demo*" -type d -exec rm -rf {} +`, { stdio: 'inherit' });
          
          // Remove source directories when we have dist
          if (fs.existsSync(path.join(pkgPath, 'dist'))) {
            if (fs.existsSync(path.join(pkgPath, 'src'))) {
              execSync(`rm -rf "${path.join(pkgPath, 'src')}"`, { stdio: 'inherit' });
            }
            if (fs.existsSync(path.join(pkgPath, 'lib'))) {
              execSync(`rm -rf "${path.join(pkgPath, 'lib')}"`, { stdio: 'inherit' });
            }
          }
        } catch (err) {
          console.warn(`   Warning: Error processing ${pkg}:`, err.message);
        }
      }
    }
    
    // Final empty directory cleanup
    execSync(`find "${directory}" -type d -empty -delete`, { stdio: 'inherit' });
    
    console.log('✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

/**
 * Main function that runs after packaging
 * @param {Object} context - The electron-builder context
 */
module.exports = async function(context) {
  console.log('📦 Running afterPack.js script...');
  
  // Get platform-specific app directory
  const platform = context.electronPlatformName;
  const appOutDir = context.appOutDir;
  let appDirectory;
  
  if (platform === 'darwin') {
    // macOS: the app is in a .app bundle
    appDirectory = path.join(appOutDir, context.packager.appInfo.productFilename + '.app', 'Contents', 'Resources', 'app.asar.unpacked');
  } else if (platform === 'win32') {
    // Windows
    appDirectory = path.join(appOutDir, 'resources', 'app.asar.unpacked');
  } else {
    // Linux
    appDirectory = path.join(appOutDir, 'resources', 'app.asar.unpacked');
  }
  
  // Check if unpacked directory exists (depends on your asar configuration)
  if (fs.existsSync(appDirectory)) {
    console.log(`📂 App directory found: ${appDirectory}`);
    cleanupDirectory(appDirectory);
  } else {
    console.log(`⚠️ No unpacked app directory found at ${appDirectory}`);
  }
  
  console.log('✨ afterPack script completed!');
};
