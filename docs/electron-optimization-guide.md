# Electron App Size Optimization Guide 🚀

## Problem Statement

The Shortcut Shortcut app was initially found to be 2.22GB when packaged for macOS, which is significantly larger than expected for an Electron application. For comparison:

- VS Code (Electron-based): ~200MB
- Slack (Electron-based): ~300MB
- Discord (Electron-based): ~100MB

## Optimization Journey

Our optimization efforts have progressed through multiple stages:
- Initial size: **2.22GB**
- After first round of optimizations: **1.07GB**
- Target size: **200-300MB**

## Core Optimizations Implemented

### 1. Dependency Management

- Moved TypeScript type definitions (`@types/*`) to `devDependencies` instead of `dependencies`
- Moved TypeScript itself to `devDependencies`
- These types are only needed during development, not at runtime
- Reviewed and optimized package.json to ensure proper categorization of dependencies

### 2. Webpack Optimizations

- Added TerserPlugin for advanced minification with multiple compression passes
- Configured code splitting with optimized chunk strategy:
  - React, Router, MUI, Emotion, Framer Motion, Rive, DnD Kit
- Enabled bundle hashing for better cache management
- Added BundleAnalyzer for size monitoring
- Configured advanced HTML minification
- Dropped console logs in production
- Added deterministic IDs for better caching
- Implemented performance budgets for better size monitoring
- Added tree-shaking improvements with mainFields configuration

### 3. Electron-Builder Configuration

- Enabled ASAR archiving for better compression
- Added comprehensive exclusion patterns to remove:
  - Source maps (*.map files)
  - TypeScript files (*.ts, *.tsx)
  - Documentation, test files, examples
  - Node module metadata (READMEs, etc.)
  - Duplicate ESM modules when CJS is sufficient
- Maximum compression setting for macOS builds
- Removal of unnecessary build targets (keeping only DMG)
- Disabled npmRebuild and buildDependenciesFromSource flags
- Optimized DMG configuration for better presentation

### 4. Enhanced Cleanup Scripts

#### afterPack.js:
- **More aggressive pattern matching** for removing unnecessary files
- **Targeted cleanup for large packages**:
  - @mui, @emotion, framer-motion, @rive-app, electron, etc.
- **Language file cleanup** (keeping only English)
- **Development tooling removal**:
  - TypeScript, Babel, Webpack, test frameworks
- **Source directory removal** when dist directories exist
- **Multiple cleanup passes** to ensure thorough file removal

#### afterSign.js:
- Final verification and cleanup
- Removal of any remaining unnecessary files

## Size Contributors Analysis

From our analysis, the primary size contributors were:

| Package | Size |
|---------|------|
| electron | 257MB |
| app-builder-bin | 207MB |
| @mui | 192MB |

Most of these are development dependencies that should now be properly excluded from the final build.

## How to Monitor App Size

To analyze the bundle size during development:

```bash
# Generate a bundle analysis report
yarn analyze
```

This will create a visual report showing the size of each module in your application bundle.

To check the final app size after building:

```bash
# For macOS builds
yarn build:mac && du -sh release/mac/*.dmg

# For specific app directory size
du -sh release/mac/*.app

# For Windows builds
du -sh release/win-unpacked/

# For Linux builds
du -sh release/linux-unpacked/
```

## Further Size Reduction Suggestions

If the build is still too large after these changes, consider:

1. **Analyze bundle size** with `yarn analyze` to identify remaining large modules
2. **Lazy-load non-critical components** using dynamic imports
3. **Review Rive animations** and optimize or lazy-load them
4. **Consider lighter alternatives** to heavy dependencies
5. **Move more dependencies to devDependencies** if they're not needed at runtime
6. **Electron native module optimization** - ensure only necessary Electron modules are included

## Best Practices for Maintaining Small App Size

1. **Keep dependencies lean**:
   - Regularly audit dependencies with `yarn why <package>`
   - Prefer smaller alternatives when available
   - Use dynamic imports for rarely used features

2. **Use code splitting effectively**:
   - Split routes and large features with dynamic imports
   - Lazy load components that aren't needed on initial render

3. **Watch for asset bloat**:
   - Optimize images and other assets
   - Use SVGs when possible
   - Avoid including large assets in the app bundle

4. **Regular maintenance**:
   - Periodically run `yarn analyze` to identify size regressions
   - Update the cleanup scripts when adding new dependencies with unique patterns
   - Consider a size budget and CI checks to prevent size increases

5. **Use electron-builder effectively**:
   - Avoid custom build scripts when possible
   - Leverage built-in optimizations
   - Always use ASAR packaging

## Troubleshooting

If the app size increases unexpectedly:

1. Run `yarn analyze` to identify which modules have grown
2. Check for new dependencies or updated packages
3. Verify that the optimizations in webpack.config.js are still applied correctly
4. Ensure the electron-builder configuration properly excludes development files
5. Check that no large assets have been inadvertently added to the project
