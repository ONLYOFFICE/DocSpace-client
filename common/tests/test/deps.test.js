// Copyright 2024 alexeysafronov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require("fs");
const path = require("path");

describe("Dependencies Tests", () => {
  const basePath = path.resolve(__dirname, "../../../");
  console.log("Base path =", basePath);

  // Helper function to get all files recursively
  const getAllFiles = (dir, acc = [], options = {}) => {
    if (!fs.existsSync(dir)) return acc;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      // Skip node_modules and other build/cache directories
      if (filePath.includes("node_modules") || 
          filePath.includes(".next") || 
          filePath.includes("dist") || 
          filePath.includes("storybook-static")) {
        return;
      }

      if (stats.isDirectory()) {
        getAllFiles(filePath, acc, options);
      } else if (!options.extensions || options.extensions.includes(path.extname(filePath))) {
        acc.push(filePath);
      }
    });
    return acc;
  };

  // Helper function to create dependency usage RegExp
  const createDependencyPattern = (dep) => {
    const depWithoutScope = dep.replace(/^@[^/]+\//, '');
    return new RegExp(
      // Match any of these patterns for both dep and depWithoutScope
      `(?:` +
        // Direct requires and imports
        `require\\(['"](?:${dep}|${depWithoutScope})(?:/[^'"]*)?['"]\\)|` +
        `import\\(['"](?:${dep}|${depWithoutScope})(?:/[^'"]*)?['"]\\)|` +
        `from\\s+['"](?:${dep}|${depWithoutScope})(?:/[^'"]*)?['"]|` +
        
        // Named imports and requires
        `import\\s+{[^}]*?\\b(?:${dep}|${depWithoutScope})\\b[^}]*?}\\s+from|` +
        `(?:const|let|var)\\s+{[^}]*?\\b(?:${dep}|${depWithoutScope})\\b[^}]*?}\\s*=\\s*require|` +
        
        // Webpack requires
        `require\\.resolve\\(['"](?:${dep}|${depWithoutScope})(?:/[^'"]*)?['"]\\)|` +
        
        // JSDoc comments
        `@(?:requires|imports|dependency)\\s+(?:${dep}|${depWithoutScope})\\b` +
      `)`
    );
  };

  // Helper function to get package.json dependencies
  const getPackageDependencies = (packageJsonPath) => {
    const pkgContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(pkgContent);
    return { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  };

  // Helper function to check dependencies usage in a file
  const checkDependenciesInFile = (filePath, dependencies) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const usedDeps = new Set();

    dependencies.forEach(([dep, version]) => {
      if (version === "workspace:*") return;
      if (createDependencyPattern(dep).test(content)) {
        usedDeps.add(dep);
      }
    });

    return usedDeps;
  };

  // Helper function to get all package.json files in a directory
  const findPackageJsonFiles = (dir) => {
    return getAllFiles(dir, [], { extensions: ['.json'] })
      .filter(file => path.basename(file) === 'package.json');
  };

  // Helper function to get all JS/TS files in a directory
  const findJsFiles = (dir) => {
    return getAllFiles(dir, [], {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs']
    });
  };

  test("UnusedDependenciesTest: Verify that all dependencies in package.json files are being used", async () => {
    const workspacePaths = [path.join(basePath, "packages")];
    let sharedDependencyMap = new Map();
    const unusedDependencies = [];
    let message = "Dependencies check results:\n";

    // Common development tools that are often used indirectly
    const commonDevTools = [
      // Build and transpilation
      '@babel/',
      '@types/',
      '@typescript-eslint/',
      '@emotion/',
      '@storybook/',
      'storybook',
      'eslint',
      'prettier',
      'webpack',
      'typescript',
      'babel-',
      'ts-',
      'sass',  // Used by webpack for SCSS/SASS files
      '@svgr', // Used by webpack for SVG files
      
      // Testing
      'jest',
      '@testing-library/',
      '@wojtekmaj/',
      'enzyme',
      'identity-obj-proxy',
      
      // Loaders
      'css-loader',
      'style-loader',
      'file-loader',
      'html-loader',
      'json-loader',
      'svg-inline-loader',
      
      // React ecosystem
      'react-dom', // Used by React
      'react-router', // Used by React Router DOM
      
      // Development utilities
      'cross-env',
      'rimraf',
      'shx',
      'concurrently',
      'nodemon',
      'dotenv',
      'chalk',
      'debug',
      'source-map',
      'pino',
      '@serdnam/pino-cloudwatch-transport',
      'pino-pretty',
      'pino-roll',
      'local-web-server',
      'npm-run-all',
      'serve', // Used for serving the built application
      
      // Type definitions
      '@types/',
      'prop-types',
      
      // Build tools
      'terser',
      'postcss',
      'autoprefixer',
      'cssnano',
      'mini-css-extract-plugin',
      'html-webpack-plugin',
      'copy-webpack-plugin',
      'webpack',
      'workbox',
      'clean-webpack-plugin',
      'external-remotes-plugin'
    ];

    // Components and libraries that might be used dynamically or via webpack
    const dynamicComponents = [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      'react-transition-group',
      'react-virtualized',
      'react-window',
      'react-toastify',
      'react-tooltip',
      'react-markdown',
      'react-svg',
      'react-dropzone',
      'react-colorful',
      'react-device-detect',
      'react-content-loader',
      'react-countdown',
      'react-draggable',
      'react-i18next',
      'react-smartbanner',
      'react-string-format',
      'react-text-mask',
      'react-virtualized-auto-sizer',
      'react-window-infinite-loader',
      'react-json-pretty',
      'react-autosize-textarea',
      '@react-spring/web',
      'remark-gfm',
      'styled-components',
      'framer-motion',
      'mobx',
      'mobx-react',
      'i18next',
      'moment',
      'moment-timezone',
      'luxon',
      'lodash',
      'lodash.debounce',
      'fast-deep-equal',
      'query-string',
      'socket.io-client',
      'firebase',
      'global',
      'cnbuilder',
      'copy-to-clipboard',
      'crypto-js',
      'csvjson-json_beautifier',
      'email-addresses',
      'file-saver',
      'heic2any',
      'hex-rgb',
      'queue-promise',
      'resize-image',
      'sjcl',
      'utif',
      'windows-iana',
      'zoom-level',
      'element-resize-detector',
      'use-resize-observer',
      '@use-gesture/react',
      '@codemirror/lang-javascript',
      '@uiw/codemirror-theme-github',
      '@uiw/react-codemirror',
      '@onlyoffice/docspace-sdk-js',
      '@onlyoffice/document-editor-react',
      'cross-fetch',
      'axios',
      'rc-tree',
      're-resizable',
      'react-hammerjs',
      'react-onclickoutside',
      'react-player',
      'react-scrollbars-custom',
      'react-viewer',
      'screenfull',
      'html-to-react',
      'attr-accept',
      'react-lifecycles-compat'
    ];

    // Map of shared files to their dependencies
    sharedDependencyMap = new Map();

    // First, gather shared dependencies
    workspacePaths.forEach(workspacePath => {
      const subdirs = fs.readdirSync(workspacePath);
      subdirs.forEach(subdir => {
        const fullPath = path.join(workspacePath, subdir);
        if (!fs.statSync(fullPath).isDirectory()) return;

        // Get all JS/TS files
        const jsFiles = findJsFiles(fullPath);

        // Check each JS/TS file for shared dependencies
        jsFiles.forEach(jsFile => {
          const relativePath = path.relative(basePath, jsFile);
          const dependencies = new Set();

          // Check for shared dependencies usage
          if (sharedDependencyMap.size > 0) {
            const usedDeps = checkDependenciesInFile(jsFile, Array.from(sharedDependencyMap.entries()));
            usedDeps.forEach(dep => dependencies.add(dep));
          }

          if (dependencies.size > 0) {
            sharedDependencyMap.set(relativePath, Array.from(dependencies));
          }
        });
      });
    });

    // Then, check each workspace for unused dependencies
    workspacePaths.forEach(workspacePath => {
      const subdirs = fs.readdirSync(workspacePath);
      subdirs.forEach(subdir => {
        const fullPath = path.join(workspacePath, subdir);
        if (!fs.statSync(fullPath).isDirectory()) return;

        // Get package.json files
        const packageJsonFiles = findPackageJsonFiles(fullPath);

        // Process each package.json
        packageJsonFiles.forEach(pkgFile => {
          const allDeps = getPackageDependencies(pkgFile);
          const packageName = JSON.parse(fs.readFileSync(pkgFile, "utf8")).name;

          // Get all JS/TS files
          const jsFiles = findJsFiles(fullPath);
          const usedDeps = new Set();

          // Check each JS/TS file for dependencies
          jsFiles.forEach(jsFile => {
            const fileUsedDeps = checkDependenciesInFile(jsFile, Object.entries(allDeps));
            fileUsedDeps.forEach(dep => usedDeps.add(dep));
          });

          // Check for unused dependencies
          const unused = Object.entries(allDeps)
            .filter(([dep, version]) => {
              if (version === "workspace:*") return false;
              if (dynamicComponents.some(comp => dep.startsWith(comp))) return false;
              if (commonDevTools.some(tool => dep.startsWith(tool))) return false;
              return !usedDeps.has(dep);
            })
            .map(([dep, version]) => `${dep}@${version}`);

          if (unused.length > 0) {
            message += `\nIn ${packageName}:\n  Unused dependencies:\n`;
            unused.forEach(dep => {
              message += `    - "${dep}"\n`;
            });
            unusedDependencies.push(...unused);
          }
        });
      });
    });

    console.log(message);
    expect(unusedDependencies.length, message).toBe(0);
  });
});
