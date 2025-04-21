# Electron App Size Optimization Guide

## Problem Statement

The Shortcut Shortcut app was found to be 2.22GB when packaged for macOS, which is significantly larger than expected for an Electron application. For comparison:

- VS Code (Electron-based): ~200MB
- Slack (Electron-based): ~300MB
- Discord (Electron-based): ~100MB

## Implemented Optimizations

The following optimizations have been implemented to reduce the app size:

### 1. Dependency Management

- Moved TypeScript type definitions (`@types/*`) to `devDependencies` instead of `dependencies`
- Moved TypeScript itself to `devDependencies`
- These types are only needed during development, not at runtime

### 2. Webpack Optimizations

- Added TerserPlugin for advanced minification
- Configured code splitting with optimized chunk strategy (vendors, React, MUI)
- Enabled bundle hashing for better cache management
- Added BundleAnalyzer for size monitoring
- Configured advanced HTML minification
- Dropped console logs in production

### 3. Electron-Builder Configuration

- Enabled ASAR archiving for better compression
- Added comprehensive exclusion patterns to remove:
  - Source maps (*.map files)
  - TypeScript files (*.ts, *.tsx)
  - Documentation, test files, examples
  - Node module metadata (READMEs, etc.)
  - Duplicate ESM modules when CJS is sufficient

### 4. Post-Build Cleanup Scripts

- Created `afterPack.js` script that runs after packaging to remove:
  - Development files
  - Unnecessary node_modules content
  - Documentation and test files
  - Empty directories

- Created `afterSign.js` script for final verification and cleanup

## Expected Results

These optimizations should reduce the app size from 2.22GB to a more reasonable size (likely under 300MB) by addressing several key issues:

1. **Removal of Development Files**: Source maps, TypeScript files, and type definitions are not needed in production.

2. **Smaller Bundle Size**: Code splitting, tree-shaking, and better minification reduce the JavaScript bundle size.

3. **Optimized Dependencies**: Properly categorizing dependencies and removing duplicate code.

4. **Efficient Packaging**: Using ASAR and removing unnecessary files creates a more compact distribution.

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
du -sh release/mac/*.app

# For Windows builds
du -sh release/win-unpacked/

# For Linux builds
du -sh release/linux-unpacked/
```

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
