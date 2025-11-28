#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Allowed licenses regex
const allowedLicenses = /\b(mit|apache-2\.0|bsd|0BSD|CC0-1\.0|CC-BY-4\.0|Public Domain|Python-2\.0|bsd-2-clause|bsd-3-clause|isc|unlicense|unknown|LGPL-3\.0-or-later)\b/i;

// Get all workspace packages
const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  return fs.existsSync(pkgPath);
});

console.log(`Found ${packages.length} workspace packages`);
console.log('Checking licenses for all workspace dependencies...\n');

let hasErrors = false;
const allResults = [];
const invalidLicenses = [];

// Check each workspace package
packages.forEach((pkg, index) => {
  const pkgPath = path.join(packagesDir, pkg);
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  
  if (!fs.existsSync(pkgJsonPath)) {
    return;
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  console.log(`📦 [${index + 1}/${packages.length}] Checking ${pkgJson.name || pkg}...`);

  try {
    // Check if package has dependencies
    const hasDeps = pkgJson.dependencies && Object.keys(pkgJson.dependencies).length > 0;
    
    if (!hasDeps) {
      console.log('   ⏭️  No production dependencies to check\n');
      allResults.push({
        package: pkgJson.name || pkg,
        status: 'skipped',
        count: 0
      });
      return;
    }

    // Run pnpm licenses list for this package
    const output = execSync(
      `pnpm licenses list --prod --json --long`,
      { 
        cwd: pkgPath,
        stdio: 'pipe',
        encoding: 'utf8'
      }
    );
    
    const licenseGroups = JSON.parse(output);
    let depCount = 0;
    let hasInvalid = false;
    
    // Check each license group
    // Format: { "MIT": [ { name: "pkg", versions: ["1.0.0"], license: "MIT" } ] }
    Object.entries(licenseGroups).forEach(([licenseName, packages]) => {
      if (Array.isArray(packages)) {
        packages.forEach(pkgInfo => {
          depCount++;
          
          if (licenseName && !allowedLicenses.test(licenseName)) {
            hasInvalid = true;
            invalidLicenses.push({
              package: pkgJson.name || pkg,
              dependency: pkgInfo.name,
              license: licenseName
            });
          }
        });
      }
    });
    
    if (hasInvalid) {
      console.log(`   ❌ ${depCount} dependencies checked - found invalid licenses\n`);
      hasErrors = true;
      allResults.push({
        package: pkgJson.name || pkg,
        status: 'failure',
        count: depCount
      });
    } else {
      console.log(`   ✅ ${depCount} dependencies checked - all licenses OK\n`);
      allResults.push({
        package: pkgJson.name || pkg,
        status: 'success',
        count: depCount
      });
    }
  } catch (error) {
    console.error(`   ❌ License check failed: ${error.message}\n`);
    hasErrors = true;
    allResults.push({
      package: pkgJson.name || pkg,
      status: 'error'
    });
  }
});

// Print summary
console.log('═══════════════════════════════════════');
console.log('📋 Summary:');
console.log('═══════════════════════════════════════');
allResults.forEach(result => {
  let icon = '✅';
  if (result.status === 'failure' || result.status === 'error') icon = '❌';
  if (result.status === 'skipped') icon = '⏭️';
  
  const count = result.count !== undefined ? ` (${result.count} deps)` : '';
  console.log(`${icon} ${result.package}${count}`);
});
console.log('═══════════════════════════════════════\n');

// Show invalid licenses if any
if (invalidLicenses.length > 0) {
  console.error('❌ Invalid licenses found:');
  console.error('═══════════════════════════════════════');
  invalidLicenses.forEach(({ package: pkg, dependency, license }) => {
    console.error(`  ${pkg} → ${dependency}: ${license}`);
  });
  console.error('═══════════════════════════════════════\n');
}

if (hasErrors) {
  console.error('✗ License check failed for one or more packages');
  process.exit(1);
} else {
  console.log('✓ All workspace packages have valid licenses');
}
