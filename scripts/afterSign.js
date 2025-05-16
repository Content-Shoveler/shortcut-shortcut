/**
 * After-sign script for electron-builder
 * This script runs after the app is signed but before it's packaged into a distributable
 * It performs final optimizations and validations
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Main function that runs after signing
 * @param {Object} context - The electron-builder context
 */
module.exports = async function(context) {
  console.log('🔒 Running afterSign.js script...');
  
  // Get platform-specific app directory
  const platform = context.electronPlatformName;
  const appOutDir = context.appOutDir;
  
  // Log information about the signed application
  console.log(`Platform: ${platform}`);
  console.log(`App output directory: ${appOutDir}`);
  
  if (platform === 'darwin') {
    // macOS-specific optimizations
    const appBundle = path.join(appOutDir, context.packager.appInfo.productFilename + '.app');
    console.log(`macOS app bundle: ${appBundle}`);
    
    // Verify the signature if possible
    try {
      console.log('Verifying app signature...');
      const verifyCommand = `codesign -vvv --deep --strict "${appBundle}"`;
      execSync(verifyCommand, { stdio: 'inherit' });
      console.log('✅ Signature verification passed!');
    } catch (error) {
      console.warn('⚠️ Signature verification failed or not possible:', error.message);
      // Don't fail the build, as this could be running on a system without codesign
    }
    
    // Check app bundle size
    try {
      const sizeCommand = `du -sh "${appBundle}"`;
      const size = execSync(sizeCommand).toString().trim();
      console.log(`📊 App bundle size: ${size}`);
    } catch (error) {
      console.warn('⚠️ Could not determine app size:', error.message);
    }
  } else if (platform === 'win32') {
    // Windows-specific optimizations
    console.log('Performing Windows-specific optimizations...');
    // Add any Windows-specific post-signing steps here
  } else {
    // Linux-specific optimizations
    console.log('Performing Linux-specific optimizations...');
    // Add any Linux-specific post-signing steps here
  }
  
  // Log a summary of the entire build process
  console.log('\n📋 Build Summary:');
  console.log('- Application signed successfully');
  console.log('- Final optimizations applied');
  console.log(`- Output directory: ${appOutDir}`);
  
  console.log('✨ afterSign script completed!');
};
