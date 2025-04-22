# Neon Rocket Icon for Shortcut Shortcut

This directory contains the app icon resources needed for building the Shortcut Shortcut Electron app across all platforms.

## Primary Icon File

The main icon file used by electron-builder is:
- **icon.png** - A high-resolution PNG version of the neon rocket icon

## Platform-Specific Icon Files (Optional)

For better control, you can also provide platform-specific icons:
- **macOS**: `icon.icns` 
- **Windows**: `icon.ico` 
- **Linux**: Multiple PNG files at different resolutions

## Icon Configuration

In package.json, we've configured electron-builder to use the icon from this directory:
```json
"build": {
  "icon": "buildResources/icon.png",
  ...
}
```

## Icon Requirements for Best Results

- **Square format**: All icons should have equal width and height
- **Transparency**: Include proper alpha channel for transparent backgrounds
- **High resolution**: Original PNG should be at least 1024x1024 pixels
- **Complete file**: Ensure PNG is not truncated or corrupted (to avoid EOF errors)

## Troubleshooting Icon Issues

If you encounter build errors related to icons:

1. **EOF errors**: These typically indicate a corrupted or truncated image file
   - Solution: Regenerate the icon from a reliable source

2. **Format conversion failures**:
   - Try pre-converting the icons to platform-specific formats manually
   - Place the converted files in this directory (icon.icns, icon.ico)

3. **macOS specific**:
   - For custom macOS builds, the icon is copied during the build process
   - The build scripts look for `buildResources/icon.icns` as a priority

## Creating Platform-Specific Icons

For manual icon conversion:

1. **macOS (icon.icns)**:
   - Use `iconutil` on macOS to convert iconset to icns
   - Or use online converters like https://cloudconvert.com/png-to-icns

2. **Windows (icon.ico)**:
   - Use online converters like https://convertio.co/png-ico/
   - Include multiple resolutions (16x16, 32x32, 48x48, 64x64, 128x128)

3. **Linux (PNG files)**:
   - Save the icon at multiple resolutions
   - Standard sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
