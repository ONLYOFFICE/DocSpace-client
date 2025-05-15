#!/usr/bin/env node

/**
 * Translation Key Usage Analysis Script
 *
 * This script displays translation key usage information from metadata files
 * and can find key usage directly in the codebase.
 * It works with the new file-based metadata structure in /locales/.meta/{namespace}/{key}.json
 *
 * Run with: node analyze-key-usage.js
 *
 * Options:
 *   --key=<key>: Look up usage for a specific key
 *   --namespace=<namespace>: Filter keys by namespace
 *   --project=<project>: Filter keys by project
 *   --find-usage: Scan codebase to find actual usage of keys
 */

const path = require("path");
const fs = require("fs-extra");
const readline = require("readline");
const glob = require("glob");
const { execSync } = require("child_process");
const { appRootPath, projectLocalesMap } = require("../config/config");

/**
 * Gets the context around a specific line in a file
 * @param {string} filePath - Path to the file
 * @param {number} lineNumber - Line number to focus on
 * @param {number} contextLines - Number of context lines to include before and after
 * @returns {Promise<Array<string>>} - Array of context lines
 */
async function getCodeContext(filePath, lineNumber, contextLines = 2) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const lines = fileContent.split('\n');
    
    const startLine = Math.max(0, lineNumber - contextLines - 1);
    const endLine = Math.min(lines.length - 1, lineNumber + contextLines - 1);
    
    const result = [];
    for (let i = startLine; i <= endLine; i++) {
      const prefix = i === lineNumber - 1 ? '>' : ' ';
      result.push(`${prefix} ${i + 1}: ${lines[i]}`);
    }
    
    return result;
  } catch (error) {
    return [`Error reading file: ${error.message}`];
  }
}

/**
 * Get all project workspaces
 * @returns {Array<string>} - Array of workspace paths
 */
async function getWorkSpaces() {
  // Get the root DocSpace directory
  const rootPath = path.resolve(appRootPath, '..');
  
  // Find all package.json files to identify workspaces
  const packageJsonFiles = glob.sync(`${rootPath}/**/package.json`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  
  // Extract directories containing package.json
  return packageJsonFiles.map(file => path.dirname(file));
}

// Create interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  key: args.find((a) => a.startsWith("--key="))?.split("=")[1],
  namespace: args.find((a) => a.startsWith("--namespace="))?.split("=")[1],
  project: args.find((a) => a.startsWith("--project="))?.split("=")[1],
  findUsage: args.includes("--find-usage"),
};

/**
 * Search for a specific key in the codebase using ripgrep
 * @param {string} key - The translation key to search for
 * @param {string} namespace - Optional namespace to restrict the search pattern
 * @returns {Array<Object>} - Array of usage locations with file paths and line numbers
 */
async function findKeyUsageInCodebase(key, namespace) {
  const usages = [];
  const searchPattern = namespace ? `${namespace}:${key}` : key;
  
  try {
    // Use different search patterns to catch common translation usage patterns
    const searchPatterns = [
      `t\("${searchPattern}"\)`,               // t("Common:Key")
      `t\([\'\"]+${searchPattern}[\'\"]+\)`,    // t('Common:Key')
      `useTranslation\([\'\"]${namespace || '.*'}[\'\"]\).+${key}`,  // useTranslation().t("Key")
      `\{t\([\'\"]${searchPattern}[\'\"]\)\}`, // {t("Common:Key")}
    ];
    
    const rootPath = path.resolve(appRootPath, '..');
    console.log(`Searching for key usage in: ${rootPath}`);
    
    // Get all workspaces
    const workspaces = await getWorkSpaces();
    
    // Search in all code files (ts, tsx, js, jsx)
    for (const workspace of workspaces) {
      for (const pattern of searchPatterns) {
        try {
          const cmd = `cd "${workspace}" && grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -n "${pattern}" .`;
          const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
          
          if (result) {
            const lines = result.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              // Parse grep output (format: ./path/to/file.js:line_number:matched_line)
              const match = line.match(/^(.+):(\d+):(.*)$/);
              
              if (match) {
                const [, relPath, lineNumber, context] = match;
                const filePath = path.join(workspace, relPath);
                
                usages.push({
                  file_path: filePath,
                  line_number: parseInt(lineNumber),
                  context: context.trim(),
                  workspace: path.basename(workspace),
                  module: identifyModule(filePath)
                });
              }
            }
          }
        } catch (error) {
          // No matches found or other grep error - continue with next pattern
        }
      }
    }
  } catch (error) {
    console.error(`Error searching for key usage: ${error.message}`);
  }
  
  return usages;
}

/**
 * Identifies which module a file belongs to based on its path
 * @param {string} filePath - Path to check
 * @returns {string} - Identified module name
 */
function identifyModule(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Check for client packages
  if (normalizedPath.includes('/packages/')) {
    const packageMatch = normalizedPath.match(/\/packages\/([^\/]+)\//); 
    if (packageMatch) {
      return packageMatch[1];
    }
  }
  
  // Check for common modules
  if (normalizedPath.includes('/components/')) {
    return 'components';
  }
  
  if (normalizedPath.includes('/pages/')) {
    return 'pages';
  }
  
  if (normalizedPath.includes('/public/')) {
    return 'public';
  }
  
  // Default to filename if no specific module identified
  return path.basename(path.dirname(filePath));
}

/**
 * Finds all metadata files across all projects or specific project
 * @returns {Promise<Array<{project: string, namespace: string, key: string, metaPath: string}>>}
 */
async function findAllMetadataFiles() {
  const metadataFiles = [];
  const projects = options.project ? [options.project] : Object.keys(projectLocalesMap);
  
  for (const project of projects) {
    const localesPath = projectLocalesMap[project];
    if (!localesPath) continue;
    
    const projectPath = path.join(appRootPath, localesPath);
    const metaDir = path.join(projectPath, ".meta");
    
    if (!await fs.pathExists(metaDir)) continue;
    
    // Get all namespace directories
    const namespaceDirs = await fs.readdir(metaDir);
    
    for (const namespace of namespaceDirs) {
      if (options.namespace && namespace !== options.namespace) continue;
      
      const namespacePath = path.join(metaDir, namespace);
      if (!(await fs.stat(namespacePath)).isDirectory()) continue;
      
      // Get all key files in this namespace
      const keyFiles = glob.sync(path.join(namespacePath, "*.json"));
      
      for (const keyFile of keyFiles) {
        const fileName = path.basename(keyFile, ".json");
        const keyData = await fs.readJson(keyFile);
        const keyPath = keyData.key_path || fileName;
        
        // If looking for a specific key, check if this matches
        if (options.key && keyPath !== options.key) continue;
        
        metadataFiles.push({
          project,
          namespace,
          key: keyPath,
          metaPath: keyFile
        });
      }
    }
  }
  
  return metadataFiles;
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // If a specific key was provided, look it up
    if (options.key) {
      await lookupKey(options.key);
      return;
    }

    // If a specific namespace was provided, list keys by namespace
    if (options.namespace) {
      await listKeysByNamespace(options.namespace);
      return;
    }

    // Show menu
    console.log("\n=== Translation Key Usage Analysis ===\n");
    console.log("1. Look up a specific key");
    console.log("2. Find key usage in codebase");
    console.log("3. List keys with usage information");
    console.log("4. List keys by namespace");
    console.log("5. List keys by project");
    console.log("6. Exit");

    rl.question("\nSelect an option (1-6): ", async (answer) => {
      switch (answer.trim()) {
        case "1":
          rl.question("Enter key to lookup: ", async (key) => {
            await lookupKey(key);
            rl.close();
          });
          break;
        
        case "2":
          rl.question("Enter key to find in codebase: ", async (key) => {
            // Set the find-usage option to true temporarily
            options.findUsage = true;
            await lookupKey(key);
            rl.close();
          });
          break;

        case "3":
          await listKeysWithUsage();
          rl.close();
          break;

        case "4":
          rl.question(
            "Enter namespace (or leave empty for all): ",
            async (namespace) => {
              await listKeysByNamespace(namespace);
              rl.close();
            }
          );
          break;
          
        case "5":
          rl.question(
            "Enter project name (or leave empty for all): ",
            async (project) => {
              await listKeysByProject(project);
              rl.close();
            }
          );
          break;

        case "6":
          console.log("Exiting...");
          rl.close();
          break;

        default:
          console.log("Invalid option");
          rl.close();
      }
    });
  } catch (error) {
    console.error("Error:", error);
    rl.close();
  }
}

/**
 * Looks up usage information for a specific key
 * @param {string} key - Translation key to look up
 */
async function lookupKey(key) {
  // Get metadata information first
  const metadataFiles = await findAllMetadataFiles();
  const keyFiles = metadataFiles.filter(file => file.key === key);
  
  // Parse key for potential namespace:key format
  let namespace = null;
  let keyName = key;
  
  if (key.includes(':')) {
    const parts = key.split(':');
    namespace = parts[0];
    keyName = parts[1];
  }
  
  // Display metadata information if available
  if (keyFiles.length > 0) {
    console.log("\n=== Translation Key Metadata ===");
    console.log(`Key: ${key}`);
    
    for (const keyFile of keyFiles) {
      const keyData = await fs.readJson(keyFile.metaPath);
      
      console.log(`\nProject: ${keyFile.project}`);
      console.log(`Namespace: ${keyFile.namespace}`);
      console.log(`Created: ${keyData.created_at}`);
      console.log(`Updated: ${keyData.updated_at}`);
      
      if (keyData.comment_text) {
        console.log(`Comment: ${keyData.comment_text}`);
        console.log(`Comment type: ${keyData.comment_ai ? "AI-generated" : "User-defined"}`);
      }
      
      // Display metadata usage if available and not finding actual usage
      if (!options.findUsage && keyData.usage && keyData.usage.length > 0) {
        console.log(`\nUsage from metadata (${keyData.usage.length} locations):\n`);
        
        for (const [index, usage] of keyData.usage.entries()) {
          console.log(`${index + 1}. Module: ${usage.module || 'Unknown'}`);
          console.log(`   File: ${usage.file_path || usage.file}${usage.line_number ? `:${usage.line_number}` : ''}`);
          if (usage.context) {
            console.log(`   Context:\n${usage.context}\n`);
          }
        }
      }
      
      // Display language information
      const languages = Object.keys(keyData.languages || {});
      if (languages.length > 0) {
        console.log("\nLanguages:");
        for (const lang of languages) {
          const langInfo = keyData.languages[lang];
          console.log(`  - ${lang}${langInfo.ai_translated ? ' (AI translated)' : ''}${langInfo.approved_at ? ` (Approved: ${langInfo.approved_at})` : ''}`);
        }
      }
    }
  } else if (!options.findUsage) {
    // Only show this message if not finding actual usage
    console.log(`\nKey "${key}" not found in any metadata files.`);
  }
  
  // If findUsage flag is set, search for actual usage in the codebase
  if (options.findUsage) {
    console.log("\n=== Finding Actual Key Usage in Codebase ===");
    console.log(`Searching for key: ${keyName}${namespace ? ` in namespace: ${namespace}` : ''}`);
    console.log("This may take a moment...");
    
    const codeUsages = await findKeyUsageInCodebase(keyName, namespace);
    
    if (codeUsages.length > 0) {
      console.log(`\nFound ${codeUsages.length} usage location(s):\n`);
      
      for (const [index, usage] of codeUsages.entries()) {
        console.log(`${index + 1}. Module: ${usage.module || 'Unknown'}`);
        console.log(`   File: ${usage.file_path}:${usage.line_number}`);
        console.log(`   Context: ${usage.context}`);
        
        // Get additional context lines
        try {
          const contextLines = await getCodeContext(usage.file_path, usage.line_number, 2);
          console.log("   Source:\n");
          for (const line of contextLines) {
            console.log(`     ${line}`);
          }
          console.log("");
        } catch (error) {
          console.log("   (Could not retrieve source context)");
        }
      }
      
      // If the key is found in the codebase but not in metadata, suggest updating metadata
      if (keyFiles.length === 0) {
        console.log("\nNote: This key was found in the codebase but has no metadata file.");
        console.log("Consider running the metadata generation script to update metadata.");
      }
    } else {
      console.log("\nNo usages found in codebase.");
    }
  }
}

/**
 * Lists keys that have usage information
 */
async function listKeysWithUsage() {
  const metadataFiles = await findAllMetadataFiles();
  const keysWithUsage = [];
  
  for (const file of metadataFiles) {
    const keyData = await fs.readJson(file.metaPath);
    
    if (keyData.usage && keyData.usage.length > 0) {
      keysWithUsage.push({
        key: file.key,
        project: file.project,
        namespace: file.namespace,
        usageCount: keyData.usage.length
      });
    }
  }
  
  // Sort by usage count (highest first)
  keysWithUsage.sort((a, b) => b.usageCount - a.usageCount);
  
  console.log("\n=== Translation Keys With Usage Information ===");
  
  if (keysWithUsage.length === 0) {
    console.log("No keys found with usage information.");
    return;
  }
  
  for (const [index, item] of keysWithUsage.entries()) {
    console.log(`${index + 1}. "${item.key}" - ${item.usageCount} usage(s)`);
    console.log(`   Project: ${item.project}, Namespace: ${item.namespace}`);
  }
}

/**
 * Lists translation keys by namespace
 * @param {string} namespaceName - Namespace name to filter by
 */
async function listKeysByNamespace(namespaceName) {
  const metadataFiles = await findAllMetadataFiles();
  
  // Filter by namespace if provided
  const filteredFiles = namespaceName ? 
    metadataFiles.filter(file => file.namespace === namespaceName) : 
    metadataFiles;
  
  if (filteredFiles.length === 0) {
    console.log(
      `No keys found${namespaceName ? ` for namespace "${namespaceName}"` : ""}.`
    );
    return;
  }
  
  console.log(
    `\n=== Translation Keys${namespaceName ? ` for namespace "${namespaceName}"` : ""} ===`
  );
  
  // Group by namespace
  const namespaceGroups = {};
  
  for (const file of filteredFiles) {
    if (!namespaceGroups[file.namespace]) {
      namespaceGroups[file.namespace] = [];
    }
    namespaceGroups[file.namespace].push(file);
  }
  
  // Display by namespace
  for (const namespace of Object.keys(namespaceGroups).sort()) {
    console.log(`\nNamespace: ${namespace}`);
    console.log(`Project: ${namespaceGroups[namespace][0].project}`);
    console.log(`Keys: ${namespaceGroups[namespace].length}`);
    
    // Display up to 20 keys per namespace
    const keysToShow = namespaceGroups[namespace].slice(0, 20);
    for (const [index, file] of keysToShow.entries()) {
      const keyData = await fs.readJson(file.metaPath);
      const usageCount = keyData.usage ? keyData.usage.length : 0;
      console.log(`${index + 1}. "${file.key}"${usageCount > 0 ? ` - ${usageCount} usage(s)` : ""}`);
    }
    
    if (namespaceGroups[namespace].length > 20) {
      console.log(`...and ${namespaceGroups[namespace].length - 20} more keys`);
    }
  }
}

/**
 * Lists translation keys by project
 * @param {string} projectName - Project name to filter by
 */
async function listKeysByProject(projectName) {
  const metadataFiles = await findAllMetadataFiles();
  
  // Filter by project if provided
  const filteredFiles = projectName ? 
    metadataFiles.filter(file => file.project === projectName) : 
    metadataFiles;
  
  if (filteredFiles.length === 0) {
    console.log(
      `No keys found${projectName ? ` for project "${projectName}"` : ""}.`
    );
    return;
  }
  
  console.log(
    `\n=== Translation Keys${projectName ? ` for project "${projectName}"` : ""} ===`
  );
  
  // Group by project
  const projectGroups = {};
  
  for (const file of filteredFiles) {
    if (!projectGroups[file.project]) {
      projectGroups[file.project] = {
        namespaces: new Set(),
        keys: []
      };
    }
    projectGroups[file.project].namespaces.add(file.namespace);
    projectGroups[file.project].keys.push(file);
  }
  
  // Display by project
  for (const project of Object.keys(projectGroups).sort()) {
    const projectInfo = projectGroups[project];
    console.log(`\nProject: ${project}`);
    console.log(`Namespaces: ${projectInfo.namespaces.size}`);
    console.log(`Total keys: ${projectInfo.keys.length}`);
    
    // Display project's namespaces
    console.log("\nNamespaces in this project:");
    let namespaceCount = {};
    for (const file of projectInfo.keys) {
      namespaceCount[file.namespace] = (namespaceCount[file.namespace] || 0) + 1;
    }
    
    for (const namespace of [...projectInfo.namespaces].sort()) {
      console.log(`- ${namespace} (${namespaceCount[namespace]} keys)`);
    }
  }
}

// No database connection needed - using file-based metadata

// Run the script
main().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
