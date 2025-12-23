const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);
const { resolver: { sourceExts } } = config;

sourceExts.push('ts', 'tsx');

if (config.resolver) {
  // 1. Watch all files within the Repository
  config.watchFolders = [libraryRoot];
  // 2. Let Metro know where to resolve packages, and in what order
  // Prioritize demo's node_modules first to avoid loading TypeScript source files from parent
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(libraryRoot, 'node_modules'),
  ];
  // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
  config.resolver.disableHierarchicalLookup = true;
  
  // 4. Metro will handle TypeScript files automatically via sourceExts
  // The index.js wrapper is only for Node.js context (config loading)
  // Metro will resolve TypeScript source files during bundling
  config.resolver.sourceExts = [...sourceExts];
}

module.exports = withNativeWind(config, { input: './global.css' });
