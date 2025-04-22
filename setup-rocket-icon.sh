#!/bin/bash

# Script to set up the custom rocket icon for all platforms
# Run this script before building the app to ensure icons are available

echo "🚀 Setting up Custom Rocket Icon for Shortcut Shortcut..."
echo "=============================================================="

# Create buildResources directory if it doesn't exist
mkdir -p buildResources

echo "📝 Icon Setup Instructions"
echo ""
echo "1. Save the neon rocket icon as 'buildResources/icon.png'"
echo "   - This should be a high-resolution PNG image (at least 1024x1024)"
echo "   - The image should be square for best results on all platforms"
echo ""
echo "2. Electron-builder will use this image to generate platform-specific icons:"
echo "   - For macOS: .icns format"
echo "   - For Windows: .ico format"
echo "   - For Linux: multiple PNG resolutions"
echo ""
echo "3. To avoid conversion errors, ensure the icon.png is:"
echo "   - A valid PNG file (not corrupted or truncated)"
echo "   - Has proper transparency where needed"
echo "   - Sized correctly (square, high resolution)"
echo ""
echo "📋 Current Configuration"
echo "- electron-builder is configured to use: buildResources/icon.png"
echo "- This file path is set in package.json"
echo ""
echo "🚨 Troubleshooting"
echo "If you encounter icon conversion errors during build:"
echo "- Check that icon.png is a valid, non-corrupted PNG file"
echo "- Try creating platform-specific icons manually and place them in buildResources"
echo "- For macOS: icon.icns"
echo "- For Windows: icon.ico"
echo ""
echo "✅ Setup complete!"
echo "Save your neon rocket icon as 'buildResources/icon.png' and run the build script."
echo "=============================================================="
