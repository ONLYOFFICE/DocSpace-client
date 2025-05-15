#!/usr/bin/env node

/**
 * Translation Key Usage Setup Script
 *
 * This script helps set up the environment for tracking translation key usage:
 * 1. Installs required dependencies
 * 2. Creates metadata directories if they don't exist
 * 3. Runs initial analysis of codebase
 *
 * Run with: node setup-key-usage.js
 */

const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const { projectLocalesMap } = require("./src/config/config");
const appRootPath = require('app-root-path').toString();

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  },

  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
  },
};

/**
 * Main setup function
 */
async function main() {
  console.log(
    `${colors.bright}${colors.fg.cyan}Translation Key Usage - Setup${colors.reset}\n`
  );

  // Step 1: Check and install dependencies
  console.log(
    `${colors.fg.yellow}[1/3] Checking and installing dependencies...${colors.reset}`
  );
  try {
    const packageJsonPath = path.resolve(__dirname, "package.json");
    const packageJson = require(packageJsonPath);

    const requiredDeps = {
      "fs-extra": "^11.1.0",
      "app-root-path": "^3.1.0",
      "glob": "^10.2.7"
    };

    let needsInstall = false;

    for (const [dep, version] of Object.entries(requiredDeps)) {
      if (!packageJson.dependencies[dep]) {
        console.log(`  Adding ${dep}@${version} to dependencies`);
        packageJson.dependencies[dep] = version;
        needsInstall = true;
      } else {
        console.log(
          `  ${dep} already installed (${packageJson.dependencies[dep]})`
        );
      }
    }

    if (needsInstall) {
      // Write updated package.json
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Run npm install
      console.log(`  Running npm install...`);
      execSync("npm install", { stdio: "inherit", cwd: __dirname });
    }

    console.log(`${colors.fg.green}✓ Dependencies ready${colors.reset}\n`);
  } catch (error) {
    console.error(
      `${colors.fg.red}✗ Error setting up dependencies:${colors.reset}`,
      error
    );
    process.exit(1);
  }

  // Step 2: Set up metadata directories
  console.log(
    `${colors.fg.yellow}[2/3] Setting up metadata directories...${colors.reset}`
  );
  try {
    // Ensure metadata directories exist for each project
    const projects = Object.keys(projectLocalesMap);
    
    for (const project of projects) {
      const localesPath = projectLocalesMap[project];
      if (!localesPath) continue;
      
      const projectPath = path.join(appRootPath, localesPath);
      const metaDir = path.join(projectPath, '.meta');
      
      await fs.ensureDir(metaDir);
      console.log(`  Created metadata directory: ${metaDir}`);
    }
    
    console.log(
      `${colors.fg.green}✓ Metadata directories ready${colors.reset}\n`
    );
  } catch (error) {
    console.error(
      `${colors.fg.red}✗ Error setting up metadata directories:${colors.reset}`,
      error
    );
    process.exit(1);
  }

  // Step 3: Run initial analysis
  console.log(
    `${colors.fg.yellow}[3/3] Running initial codebase analysis...${colors.reset}`
  );
  try {
    console.log("  This may take a few minutes depending on codebase size.");
    console.log("  Analyzing codebase to find translation key usage...");

    // Call the analysis script with update-only flag
    execSync("node src/scripts/analyze-key-usage.js --update-only", {
      stdio: "inherit",
      cwd: __dirname,
    });

    console.log(`${colors.fg.green}✓ Analysis complete${colors.reset}\n`);
  } catch (error) {
    console.error(
      `${colors.fg.red}✗ Error running analysis:${colors.reset}`,
      error
    );
    process.exit(1);
  }

  // All done!
  console.log(
    `${colors.bright}${colors.fg.green}Setup Complete!${colors.reset}`
  );
  console.log(`\n${colors.bright}Next steps:${colors.reset}`);
  console.log(`1. Restart your server to load the new routes`);
  console.log(
    `2. Use the API endpoints at /api/key-usage/* to access key usage data`
  );
  console.log(`3. Integrate the UI components into your application`);
  console.log(`\n${colors.bright}View key usage in the UI:${colors.reset}`);
  console.log(
    `- Add the KeyUsageSearch component to your app for full key exploration`
  );
  console.log(
    `- Add TranslationKeyInfo to your translation editor for inline key information\n`
  );
}

// Run the setup
main().catch((error) => {
  console.error(`${colors.fg.red}Unexpected error:${colors.reset}`, error);
  process.exit(1);
});
