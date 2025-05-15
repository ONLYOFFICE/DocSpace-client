/**
 * Utility script to verify file-based metadata structure
 */
const fs = require('fs-extra');
const { writeJsonWithConsistentEol } = require('../src/utils/fsUtils');
const path = require('path');
const appRootPath = require('app-root-path').toString();
const { projectLocalesMap, appRootPath: configRootPath } = require('../src/config/config');

console.log("Verifying file-based metadata structure...");

// Helper function to find metadata file
async function findMetadataFile(projectName, namespace, keyPath) {
  const localesPath = projectLocalesMap[projectName];
  if (!localesPath) {
    throw new Error(`Project ${projectName} not found in configuration`);
  }
  
  const projectPath = path.join(appRootPath, localesPath);
  const metaDir = path.join(projectPath, '.meta');
  const namespacePath = path.join(metaDir, namespace);
  const metadataFilePath = path.join(namespacePath, `${keyPath}.json`);
  
  if (await fs.pathExists(metadataFilePath)) {
    const data = await fs.readJson(metadataFilePath);
    return { filePath: metadataFilePath, data };
  }
  
  return null;
}

// Helper function to create metadata file
async function createMetadataFile(projectName, namespace, keyPath, data = {}) {
  const localesPath = projectLocalesMap[projectName];
  if (!localesPath) {
    throw new Error(`Project ${projectName} not found in configuration`);
  }
  
  const projectPath = path.join(appRootPath, localesPath);
  const metaDir = path.join(projectPath, '.meta');
  const namespacePath = path.join(metaDir, namespace);
  const metadataFilePath = path.join(namespacePath, `${keyPath}.json`);
  
  // Create directories if they don't exist
  await fs.ensureDir(namespacePath);
  
  // Default metadata structure
  const metadata = {
    key_path: keyPath,
    namespace,
    project_name: projectName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...data
  };
  
  // Write metadata file
  await writeJsonWithConsistentEol(metadataFilePath, metadata);
  
  return { filePath: metadataFilePath, data: metadata };
}

/**
 * Main function to run the verification script
 */
async function main() {
  // Verify projects configuration
  console.log("\nVerifying projects configuration:");
  const projectNames = Object.keys(projectLocalesMap);
  
  if (projectNames.length === 0) {
    console.error("❌ No projects found in configuration");
    process.exit(1);
  }
  
  console.log(`Found ${projectNames.length} projects:`);
  for (const projectName of projectNames) {
    const localesPath = projectLocalesMap[projectName];
    console.log(`- ${projectName}: ${localesPath}`);
    
    // Check if the project directory exists
    const projectPath = path.join(appRootPath, localesPath);
    if (await fs.pathExists(projectPath)) {
      console.log(`  ✅ Project directory exists: ${projectPath}`);
    } else {
      console.error(`  ❌ Project directory does not exist: ${projectPath}`);
      continue;
    }
    
    // Check if .meta directory exists
    const metaDir = path.join(projectPath, '.meta');
    if (await fs.pathExists(metaDir)) {
      console.log(`  ✅ Metadata directory exists: ${metaDir}`);
      
      // List namespace directories
      const namespaceDirs = await fs.readdir(metaDir);
      console.log(`  Found ${namespaceDirs.length} namespace directories:`);
      for (const namespace of namespaceDirs) {
        const namespacePath = path.join(metaDir, namespace);
        const stats = await fs.stat(namespacePath);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(namespacePath);
          const jsonFiles = files.filter(file => file.endsWith('.json'));
          console.log(`    - ${namespace}: ${jsonFiles.length} metadata files`);
          
          // Validate a random JSON file if available
          if (jsonFiles.length > 0) {
            const randomFile = jsonFiles[Math.floor(Math.random() * jsonFiles.length)];
            const filePath = path.join(namespacePath, randomFile);
            try {
              const data = await fs.readJson(filePath);
              console.log(`      ✅ Validated JSON file: ${randomFile}`);
            } catch (error) {
              console.error(`      ❌ Invalid JSON file: ${randomFile}`);
            }
          }
        }
      }
    } else {
      console.log(`  ⚠️ Metadata directory does not exist: ${metaDir} (will be created for tests)`);
      await fs.ensureDir(metaDir);
    }
  }
  
  // Test metadata operations
  console.log("\nTesting metadata operations:");
  
  // Test creating metadata
  console.log("\nCreating test metadata...");
  try {
    const testProject = projectNames[0] || 'TestProject';
    const testNamespace = 'common';
    const testKeyPath = 'test.verify.key';
  
  // Create test metadata
  const testMetadata = await createMetadataFile(testProject, testNamespace, testKeyPath);
  console.log("✅ Test metadata created:", testMetadata.filePath);
  
  // Add a Figma reference
  testMetadata.data.figma = {
    figmaFileKey: "test123",
    figmaNodeId: "node123",
    componentName: "TestComponent",
    screenName: "TestScreen",
    thumbnailUrl: "https://example.com/thumbnail.png",
    updated_at: new Date().toISOString()
  };
  
  // Add a comment
  testMetadata.data.comments = [
    {
      id: Date.now().toString(),
      text: "This is a test comment",
      user_id: "test-user",
      user_name: "Test User",
      created_at: new Date().toISOString()
    }
  ];

  // Add a code usage
  testMetadata.data.usage = [
    {
      id: Date.now().toString(),
      file_path: "/test/file.js",
      line_number: 123,
      context: "t('test.key', 'Default text')",
      created_at: new Date().toISOString()
    }
  ];
  
  // Add an approval
  testMetadata.data.approvals = {
    en: {
      status: "approved",
      reviewer_id: "test-reviewer",
      reviewer_name: "Test Reviewer",
      comments: "Looks good!",
      updated_at: new Date().toISOString()
    }
  };
  
  // Add history entry
  testMetadata.data.history = [
    {
      id: Date.now().toString(),
      project_name: testProject,
      language: "en",
      namespace: testNamespace,
      key_path: testKeyPath,
      action: "created",
      previous_value: null,
      message: "Initial creation",
      user_id: "test-user",
      user_name: "Test User",
      timestamp: new Date().toISOString()
    }
  ];
  
  // Save updated test metadata
  await writeJsonWithConsistentEol(testMetadata.filePath, testMetadata.data);
  console.log("✅ Test metadata updated with all sections");
  
  // Retrieve the metadata to verify it was saved correctly
  const retrievedMetadata = await findMetadataFile(testProject, testNamespace, testKeyPath);
  if (retrievedMetadata) {
    console.log("✅ Successfully retrieved test metadata");
    console.log("  Metadata contains:");
    console.log(`  - Key path: ${retrievedMetadata.data.key_path}`);
    console.log(`  - Comments: ${retrievedMetadata.data.comments?.length || 0}`);
    console.log(`  - Figma references: ${retrievedMetadata.data.figma ? 'Yes' : 'No'}`);
    console.log(`  - Code usages: ${retrievedMetadata.data.usage?.length || 0}`);
    console.log(`  - Approvals: ${Object.keys(retrievedMetadata.data.approvals || {}).length}`);
    console.log(`  - History entries: ${retrievedMetadata.data.history?.length || 0}`);
  } else {
    console.error("❌ Failed to retrieve test metadata");
    throw new Error("Metadata retrieval failed");
  }
  
  // Clean up test data
  console.log("\nCleaning up test metadata...");
  await fs.remove(testMetadata.filePath);
    console.log("✅ Test metadata cleaned up");
    
  } catch (error) {
    console.error("❌ Error during metadata tests:", error);
    process.exit(1);
  }
  
  console.log("\n✅ All file-based metadata verification tests passed!");
}

// Run the main function
main().catch(error => {
  console.error("Unhandled error in main function:", error);
  process.exit(1);
});
