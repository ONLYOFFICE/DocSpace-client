#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all workspace packages
const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  return fs.existsSync(pkgPath);
});

console.log(`Found ${packages.length} workspace packages`);
console.log('Aggregating licenses from all workspace packages...\n');

const allLicenses = new Map();
const csvRows = [];

// Add CSV header
csvRows.push('"Package","License","Version"');

// Process each workspace package
packages.forEach(pkg => {
  const pkgPath = path.join(packagesDir, pkg);
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  
  if (!fs.existsSync(pkgJsonPath)) {
    return;
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  console.log(`Checking ${pkgJson.name || pkg}...`);

  try {
    // Run pnpm licenses list for this package
    const output = execSync(
      `pnpm licenses list --prod --json --long`,
      { 
        cwd: pkgPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }
    );

    const licenseGroups = JSON.parse(output);
    
    // Add to aggregated map (avoid duplicates)
    // Format: { "MIT": [ { name: "pkg", versions: ["1.0.0"], license: "MIT" } ] }
    Object.entries(licenseGroups).forEach(([licenseName, packages]) => {
      if (Array.isArray(packages)) {
        packages.forEach(pkg => {
          const pkgName = pkg.name;
          const version = pkg.versions?.[0] || '';
          
          if (!allLicenses.has(pkgName)) {
            allLicenses.set(pkgName, {
              license: licenseName,
              version: version
            });
          }
        });
      }
    });
  } catch (error) {
    // If package has no dependencies, skip
    console.log(`  → No production dependencies`);
  }
});

// Convert to CSV rows
allLicenses.forEach((data, module) => {
  const license = (data.license || 'UNKNOWN').replace(/"/g, '""');
  const version = (data.version || '').replace(/"/g, '""');
  
  csvRows.push(`"${module}","${license}","${version}"`);
});

// Write aggregated CSV
const outputPath = path.join(__dirname, '../licenses.csv');
fs.writeFileSync(outputPath, csvRows.join('\n'));

console.log(`\n✓ Aggregated ${allLicenses.size} unique dependencies`);
console.log(`✓ Results saved to licenses.csv`);
