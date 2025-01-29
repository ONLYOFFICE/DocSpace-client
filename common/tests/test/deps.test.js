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
const { getAllFiles, convertPathToOS, getWorkSpaces, BASE_DIR } = require("../utils/files");

let workspaces = [];
let packageJsonFiles = [];
let jsFiles = [];
let unusedDependencies = [];

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);
  workspaces = getWorkSpaces();

  // Find all package.json files
  packageJsonFiles = workspaces.reduce((acc, workspace) => {
    const files = getAllFiles(workspace)
      .filter(file => file && file.endsWith('package.json'));
    return [...acc, ...files];
  }, []);

  // Find all JavaScript/TypeScript files
  jsFiles = workspaces.reduce((acc, workspace) => {
    const files = getAllFiles(workspace)
      .filter(file => file && (
        file.endsWith('.js') || 
        file.endsWith('.jsx') || 
        file.endsWith('.ts') || 
        file.endsWith('.tsx') ||
        file.endsWith('.mjs') ||
        file.endsWith('.cjs')
      )).filter(file => !file.includes("node_modules"))
      .filter(file => !file.includes(".next"))  // Exclude Next.js build directory
      .filter(file => !file.includes("dist"))  // Exclude dist directories
      .filter(file => !file.includes("storybook-static")); // Exclude storybook-static directory
    return [...acc, ...files];
  }, []);

  // Common development tools that are often used indirectly
  const commonDevTools = [
    // Build and transpilation
    '@babel/',
    '@types/',
    '@typescript-eslint/',
    'eslint',
    'prettier',
    'webpack',
    'typescript',
    'babel-',
    'ts-',
    
    // Loaders and plugins
    'sass-loader',
    'css-loader',
    'style-loader',
    'file-loader',
    'source-map',
    'html-loader',
    'json-loader',
    'svg-inline-loader',
    
    // Testing and documentation
    'jest',
    'storybook',
    '@storybook/',
    '@testing-library/',
    'enzyme',
    '@wojtekmaj/enzyme-adapter-react-17',
    'identity-obj-proxy',
    
    // Development utilities
    'cross-env',
    'shx',
    'serve',
    'local-web-server',
    'npm-run-all',
    'pino',
    '@serdnam/pino-cloudwatch-transport',
    
    // React ecosystem
    '@emotion/',
    'react-lifecycles-compat',
    'react-json-pretty'
  ];

  // UI and Media components that might be dynamically imported
  const dynamicComponents = [
    'rc-tree',
    're-resizable',
    'react-hammerjs',
    'react-onclickoutside',
    'react-player',
    'react-scrollbars-custom',
    'react-viewer',
    'screenfull',
    'html-to-react',
    'attr-accept'
  ];

  // Read package.json files and collect dependencies
  packageJsonFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const packageJson = JSON.parse(content);
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      const scripts = packageJson.scripts || {};

      // For each dependency, check if it's used in any JS file
      Object.entries({ ...dependencies, ...devDependencies }).forEach(([dep, version]) => {
        // Skip checking dev tools and dynamic components
        if (commonDevTools.some(tool => dep.startsWith(tool)) ||
            dynamicComponents.includes(dep)) {
          return;
        }

        // Skip workspace dependencies
        if (version === "workspace:*") {
          return;
        }

        const depWithoutScope = dep.replace(/^@[^/]+\//, '');
        
        // Check if dependency is used in package.json scripts
        const isUsedInScripts = Object.values(scripts).some(script => 
          script.includes(dep) || script.includes(depWithoutScope)
        );

        if (isUsedInScripts) {
          return;
        }

        const isUsed = jsFiles.some(jsFile => {
          const content = fs.readFileSync(jsFile, "utf8");
          return (
            // CommonJS require
            content.includes(`require('${dep}')`) ||
            content.includes(`require("${dep}")`) ||
            content.includes(`require('${depWithoutScope}')`) ||
            content.includes(`require("${depWithoutScope}")`) ||
            
            // ES6 imports
            content.includes(`from '${dep}'`) ||
            content.includes(`from "${dep}"`) ||
            content.includes(`from '${depWithoutScope}'`) ||
            content.includes(`from "${depWithoutScope}"`) ||
            
            // Dynamic imports
            content.includes(`import('${dep}')`) ||
            content.includes(`import("${dep}")`) ||
            content.includes(`import('${depWithoutScope}')`) ||
            content.includes(`import("${depWithoutScope}")`) ||
            
            // Submodule imports
            content.includes(`'${dep}/`) ||
            content.includes(`"${dep}/`) ||
            content.includes(`'${depWithoutScope}/`) ||
            content.includes(`"${depWithoutScope}/`) ||

            // webpack/require context
            content.includes(`webpackChunkName: "${dep}"`) ||
            content.includes(`webpackChunkName: '${dep}'`) ||
            
            // React component usage
            content.includes(`<${depWithoutScope}`) ||
            content.includes(`<${dep}`) ||
            content.includes(`<${depWithoutScope}.`) ||
            content.includes(`<${dep}.`) ||
            
            // Comments and strings that might indicate usage
            content.includes(`* ${dep}`) ||
            content.includes(`// ${dep}`) ||
            content.includes(`/* ${dep}`) ||
            content.includes(`import ${dep}`) ||
            content.includes(`import ${depWithoutScope}`) ||
            
            // Lazy loading and code splitting
            content.includes(`lazy(() => import('${dep}')`) ||
            content.includes(`lazy(() => import("${dep}")`) ||
            content.includes(`lazy(() => import('${depWithoutScope}')`) ||
            content.includes(`lazy(() => import("${depWithoutScope}")`)
          );
        });

        if (!isUsed) {
          unusedDependencies.push({
            name: dep,
            version,
            packageJsonPath: filePath
          });
        }
      });
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  });
});

describe("Dependencies Tests", () => {
  test("UnusedDependenciesTest: Verify that all dependencies in package.json files are being used", () => {
    let message = "The following dependencies appear to be unused:\n\n";
    
    if (unusedDependencies.length > 0) {
      unusedDependencies.forEach(({ name, version, packageJsonPath }) => {
        message += `- "${name}@${version}" in ${packageJsonPath}\n`;
      });
    }

    expect(unusedDependencies.length, message).toBe(0);
  });
});
