#!/bin/bash

# Script to convert the neon rocket icon to all required formats
# Run this after placing your PNG icon in buildResources/icon.png

echo "🚀 Converting Rocket Icon for all platforms..."
echo "=============================================================="

# Check if the source icon file exists
if [ ! -f "buildResources/icon.png" ]; then
  echo "❌ Error: Source icon not found at buildResources/icon.png"
  echo "Please copy your neon rocket icon to buildResources/icon.png first"
  exit 1
fi

echo "✅ Source icon found: buildResources/icon.png"

# Create necessary directories
mkdir -p buildResources

# For macOS: Create .icns file
echo "🍎 Creating macOS icon (.icns)..."

# Check if we're on macOS and have the required tools
if [ "$(uname)" == "Darwin" ] && [ -x "$(command -v sips)" ] && [ -x "$(command -v iconutil)" ]; then
  echo "  ✓ macOS icon conversion tools found"
  
  # Create temporary iconset directory
  mkdir -p buildResources/icon.iconset
  
  # Generate different icon sizes using sips
  echo "  ⚙️ Generating different sizes for iconset..."
  sips -z 16 16 buildResources/icon.png --out buildResources/icon.iconset/icon_16x16.png
  sips -z 32 32 buildResources/icon.png --out buildResources/icon.iconset/icon_16x16@2x.png
  sips -z 32 32 buildResources/icon.png --out buildResources/icon.iconset/icon_32x32.png
  sips -z 64 64 buildResources/icon.png --out buildResources/icon.iconset/icon_32x32@2x.png
  sips -z 128 128 buildResources/icon.png --out buildResources/icon.iconset/icon_128x128.png
  sips -z 256 256 buildResources/icon.png --out buildResources/icon.iconset/icon_128x128@2x.png
  sips -z 256 256 buildResources/icon.png --out buildResources/icon.iconset/icon_256x256.png
  sips -z 512 512 buildResources/icon.png --out buildResources/icon.iconset/icon_256x256@2x.png
  sips -z 512 512 buildResources/icon.png --out buildResources/icon.iconset/icon_512x512.png
  sips -z 1024 1024 buildResources/icon.png --out buildResources/icon.iconset/icon_512x512@2x.png
  
  # Convert iconset to icns
  echo "  🔄 Converting iconset to .icns format..."
  iconutil -c icns buildResources/icon.iconset -o buildResources/icon.icns
  
  # Clean up
  rm -rf buildResources/icon.iconset
  
  echo "  ✅ macOS icon created: buildResources/icon.icns"
else
  echo "  ⚠️ macOS icon tools not available"
  echo "  Please manually convert your icon to .icns format and place it at buildResources/icon.icns"
  echo "  You can use online converters like https://cloudconvert.com/png-to-icns"
fi

# For Windows: Provide instructions for .ico
echo "🪟 Windows icon (.ico):"
echo "  ⚠️ Automatic .ico conversion not available"
echo "  Please convert your icon.png to .ico format using an online converter"
echo "  and place it at buildResources/icon.ico"
echo "  Recommended converter: https://convertio.co/png-ico/"

# For Linux: Create multiple resolutions
echo "🐧 Creating Linux icons (multiple PNG resolutions)..."
mkdir -p buildResources/linux-icons

# Check if we have the sips command (macOS) or convert command (ImageMagick)
if [ -x "$(command -v sips)" ]; then
  # Using sips (macOS)
  echo "  ⚙️ Using sips to generate different sizes..."
  sips -z 16 16 buildResources/icon.png --out buildResources/linux-icons/16x16.png
  sips -z 32 32 buildResources/icon.png --out buildResources/linux-icons/32x32.png
  sips -z 48 48 buildResources/icon.png --out buildResources/linux-icons/48x48.png
  sips -z 64 64 buildResources/icon.png --out buildResources/linux-icons/64x64.png
  sips -z 128 128 buildResources/icon.png --out buildResources/linux-icons/128x128.png
  sips -z 256 256 buildResources/icon.png --out buildResources/linux-icons/256x256.png
  sips -z 512 512 buildResources/icon.png --out buildResources/linux-icons/512x512.png
  echo "  ✅ Linux icons created in buildResources/linux-icons/"
elif [ -x "$(command -v convert)" ]; then
  # Using ImageMagick
  echo "  ⚙️ Using ImageMagick to generate different sizes..."
  convert buildResources/icon.png -resize 16x16 buildResources/linux-icons/16x16.png
  convert buildResources/icon.png -resize 32x32 buildResources/linux-icons/32x32.png
  convert buildResources/icon.png -resize 48x48 buildResources/linux-icons/48x48.png
  convert buildResources/icon.png -resize 64x64 buildResources/linux-icons/64x64.png
  convert buildResources/icon.png -resize 128x128 buildResources/linux-icons/128x128.png
  convert buildResources/icon.png -resize 256x256 buildResources/linux-icons/256x256.png
  convert buildResources/icon.png -resize 512x512 buildResources/linux-icons/512x512.png
  echo "  ✅ Linux icons created in buildResources/linux-icons/"
else
  echo "  ⚠️ Image resizing tools not available"
  echo "  Please manually create multiple resolutions of your icon"
  echo "  and place them in buildResources/linux-icons/"
fi

echo ""
echo "✅ Icon conversion process complete!"
echo "To use these icons in your builds:"
echo "1. The standard electron-builder process will use buildResources/icon.png"
echo "2. For custom macOS builds, the icon.icns will be used automatically"
echo "3. For custom Windows builds, place icon.ico in buildResources/"
echo "4. For Linux, electron-builder will use the main icon.png"
echo ""
echo "📋 Files generated:"
echo "- buildResources/icon.png (original, unchanged)"
if [ -f "buildResources/icon.icns" ]; then
  echo "- buildResources/icon.icns (for macOS)"
fi
if [ -d "buildResources/linux-icons" ]; then
  echo "- buildResources/linux-icons/ (multiple sizes for Linux)"
fi
echo ""
echo "=============================================================="
