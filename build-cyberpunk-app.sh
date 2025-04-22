#!/bin/bash

# Build script for the cyberpunk-styled shortcut app

echo "🧪 Building cyberpunk-styled Shortcut Shortcut application..."

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf release

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  yarn install
fi

# Build the application
echo "🔧 Building application..."
yarn build

# Add rocket emoji as app icon
echo "🚀 Setting rocket emoji as app icon..."
# The electron-builder will automatically use the icon.png from buildResources
# which is configured in package.json

echo "✨ Build complete! Your cyberpunk-styled application is ready in the release directory."
echo "🚀 To run the application, find the executable in the release folder."
