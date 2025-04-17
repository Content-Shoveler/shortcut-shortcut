#!/bin/bash

# Script to build and package the Shortcut Epic Templates app for macOS
# Using a direct approach instead of electron-builder

# Set up error handling
set -e

echo "🚀 Building Shortcut Epic Templates for macOS..."
echo "================================================"

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf dist/release 2>/dev/null || true
mkdir -p dist/release

# Build the application (both main and renderer processes)
echo "🔨 Building the application..."
yarn webpack --env NODE_ENV=production
yarn webpack --env NODE_ENV=production --env WEBPACK_TARGET=main

# Download Electron binary if needed
echo "📥 Preparing Electron..."
APP_NAME="Shortcut Epic Templates"
APP_DIR="dist/release/${APP_NAME}.app"
ELECTRON_DIR="node_modules/electron/dist/Electron.app"

# Create macOS app structure
echo "📂 Creating app structure..."
mkdir -p "${APP_DIR}/Contents/Resources/app"
mkdir -p "${APP_DIR}/Contents/MacOS"

# Copy Electron framework
echo "📝 Copying Electron framework..."
cp -r "${ELECTRON_DIR}/Contents/Frameworks" "${APP_DIR}/Contents/"
cp -r "${ELECTRON_DIR}/Contents/MacOS" "${APP_DIR}/Contents/"
cp -r "${ELECTRON_DIR}/Contents/Resources/electron.icns" "${APP_DIR}/Contents/Resources/"
cp "${ELECTRON_DIR}/Contents/Info.plist" "${APP_DIR}/Contents/"

# Copy app files
echo "📝 Copying app files..."
cp -r dist/*.js dist/index.html "${APP_DIR}/Contents/Resources/app/"
# Copy map files if they exist
if ls dist/*.js.map 1> /dev/null 2>&1; then
  cp -r dist/*.js.map "${APP_DIR}/Contents/Resources/app/"
fi

# Create package.json for the app
echo "📝 Creating app package.json..."
node -e "const pkg = require('./package.json'); delete pkg.build; delete pkg.devDependencies; pkg.main = 'main.js'; require('fs').writeFileSync('${APP_DIR}/Contents/Resources/app/package.json', JSON.stringify(pkg, null, 2));"

# Update Info.plist
echo "📝 Updating Info.plist..."
sed -i '' "s/Electron/${APP_NAME}/g" "${APP_DIR}/Contents/Info.plist"

# Make the app executable
echo "🔑 Making app executable..."
chmod +x "${APP_DIR}/Contents/MacOS/Electron"

# Create a ZIP file for easy sharing
echo "🗜️ Creating ZIP file for sharing..."
cd dist/release
zip -r ../Shortcut-Epic-Templates-macOS.zip "${APP_NAME}.app"
cd ../..

echo "✅ Build completed successfully!"
echo "================================================"
echo "📋 Distribution files:"
echo "   - App: dist/release/${APP_NAME}.app"
echo "   - Zip: dist/Shortcut-Epic-Templates-macOS.zip"
echo ""
echo "🎉 To share with friends, send them the ZIP file."
echo "   They can unzip it and move the app to their Applications folder."
echo ""
echo "⚠️  Note: Recipients may need to right-click and select 'Open' the first time"
echo "   since the app isn't signed with an Apple Developer certificate."
