#!/usr/bin/env node
/**
 * Generate Metadata for Translation Files
 *
 * This script scans the locales directories and generates metadata files
 * for all translation keys, preserving existing metadata where available.
 */
const fs = require("fs-extra");
const { writeJsonWithConsistentEol } = require("../utils/fsUtils");
const path = require("path");
const glob = require("glob");
const crypto = require("crypto");
const { appRootPath, projectLocalesMap } = require("../config/config");

// Time constants
const NOW = new Date().toISOString();

/**
 * Calculate SHA1 hash for a string
 * @param {string} content - Content to hash
 * @returns {string} SHA1 hash
 */
function calculateSha1(content) {
  return crypto.createHash("sha1").update(content).digest("hex");
}

/**
 * Extract all keys from a translation object (handles nested objects)
 * @param {Object} obj - Translation object
 * @param {string} prefix - Current key prefix
 * @returns {Array} Array of full key paths
 */
function extractKeys(obj, prefix = "") {
  let keys = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(extractKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Get value at a specific key path in an object
 * @param {Object} obj - Object to traverse
 * @param {string} keyPath - Dot-notation path to the value
 * @returns {any} Value at the key path or undefined
 */
function getValueAtPath(obj, keyPath) {
  return keyPath.split(".").reduce((o, k) => o && o[k], obj);
}

/**
 * Creates or updates metadata for a project
 * @param {string} projectName - Project name
 * @returns {Promise<Object>} Statistics
 */
async function generateMetadata(projectName) {
  console.log(`Generating metadata for project: ${projectName}`);

  // Debug variable to track current namespace
  let currentNamespace = null;

  const stats = {
    totalNamespaces: 0,
    totalFiles: 0,
    totalKeys: 0,
    newKeys: 0,
    updatedKeys: 0,
    unchangedKeys: 0,
    metadataFiles: 0,
    deletedMetadataFiles: 0,
    deletedEmptyNamespaces: 0,
    namespaces: {},
    errors: [],
  };

  try {
    // Get the project locales path
    const localesPath = projectLocalesMap[projectName];
    if (!localesPath) {
      throw new Error(`No locales path defined for project: ${projectName}`);
    }

    const projectPath = path.join(appRootPath, localesPath);
    console.log(`Project path: ${projectPath}`);

    // Check if the project path exists
    if (!(await fs.pathExists(projectPath))) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }

    const metaDir = path.join(projectPath, ".meta");
    console.log(`Metadata directory: ${metaDir}`);

    // Create metadata directory if it doesn't exist
    try {
      await fs.ensureDir(metaDir);
      console.log(`Metadata directory created/verified: ${metaDir}`);
    } catch (dirError) {
      console.error(`Error creating metadata directory: ${metaDir}`, dirError);
      throw dirError;
    }

    // Track existing and active metadata files
    const existingMetaFiles = new Set();
    const activeMetaFiles = new Set();
    const existingNamespaces = new Set();

    // Find all existing metadata files
    if (await fs.pathExists(metaDir)) {
      const metaGlobPattern = path.join(metaDir, "**", "*.json").replace(/\\/g, "/");
      const existingFiles = glob.sync(metaGlobPattern);
      existingFiles.forEach(file => existingMetaFiles.add(file));
      console.log(`Found ${existingFiles.length} existing metadata files`);

      // Track existing namespace directories
      try {
        const namespaceDirs = await fs.readdir(metaDir);
        namespaceDirs.forEach(dir => {
          const nsPath = path.join(metaDir, dir);
          if (fs.statSync(nsPath).isDirectory()) {
            existingNamespaces.add(nsPath);
          }
        });
        console.log(`Found ${existingNamespaces.size} existing namespace directories`);
      } catch (error) {
        console.error(`Error reading namespace directories: ${error.message}`);
      }
    }

    // Find all language directories
    const languageDirs = await fs.readdir(projectPath);
    const languages = languageDirs.filter(
      (dir) =>
        dir !== ".meta" &&
        fs.statSync(path.join(projectPath, dir)).isDirectory()
    );

    console.log(`Found ${languages.length} languages: ${languages.join(", ")}`);

    // Base language (usually English)
    const baseLanguage = languages.includes("en") ? "en" : languages[0];

    // Process all translation files in the base language
    // Use normalized path with forward slashes for glob to work on all platforms
    const globPattern = path
      .join(projectPath, baseLanguage, "**", "*.json")
      .replace(/\\/g, "/");
    const translationFiles = glob.sync(globPattern);

    console.log(
      `Found ${translationFiles.length} translation files in ${baseLanguage}`
    );
    stats.totalFiles = translationFiles.length;

    // Process each translation file
    for (const filePath of translationFiles) {
      // Outside the try block to ensure variables are accessible in all blocks
      let namespace;

      try {
        // Get the namespace from the file path
        const relativePath = path.relative(
          path.join(projectPath, baseLanguage),
          filePath
        );
        namespace = relativePath.replace(/\.json$/, "");

        // Update the debug variable
        currentNamespace = namespace;

        console.log(`Processing namespace: ${namespace}`);

        // Set up namespace stats if not exists
        if (!stats.namespaces[namespace]) {
          stats.namespaces[namespace] = {
            totalKeys: 0,
            newKeys: 0,
            updatedKeys: 0,
            unchangedKeys: 0,
          };
        }

        // Create namespace directory within meta
        const namespaceMetaDir = path.join(metaDir, namespace);
        await fs.ensureDir(namespaceMetaDir);
        console.log(
          `Namespace directory created/verified: ${namespaceMetaDir}`
        );

        // Read the base language file
        const baseContent = await fs.readJson(filePath);

        // Extract all keys
        const keys = extractKeys(baseContent);
        stats.totalKeys += keys.length;
        stats.namespaces[namespace].totalKeys += keys.length;

        // Process each key
        for (const keyPath of keys) {
          const baseValue = getValueAtPath(baseContent, keyPath);

          // Skip if not a string (e.g., nested objects without leaf nodes)
          if (typeof baseValue !== "string") continue;

          // Calculate content hash for detecting changes
          const contentHash = calculateSha1(baseValue);

          // Create a sanitized filename from the key path
          // Replace dots with underscores and other invalid chars
          const sanitizedKeyPath = keyPath
            .replace(/\.json$/, "")
            .replace(/\./g, "_")
            .replace(/[^a-zA-Z0-9_-]/g, "");
          const keyMetaFile = path.join(
            metaDir,
            namespace,
            `${sanitizedKeyPath}.json`
          );
          console.log(`Key metadata file path: ${keyMetaFile}`);
          
          // Add this metadata file to the active set
          activeMetaFiles.add(keyMetaFile);

          // Read existing metadata for this key if available
          let keyMetadata = null;
          let hasChanges = false;
          try {
            if (await fs.pathExists(keyMetaFile)) {
              keyMetadata = await fs.readJson(keyMetaFile);
            }
          } catch (keyReadError) {
            console.error(
              `Error reading metadata file for key ${keyPath}:`,
              keyReadError
            );
            // Continue with empty metadata
          }

          const now = new Date().toISOString();

          if (
            !keyMetadata ||
            keyMetadata.content_en_sha1_hash !== contentHash
          ) {
            hasChanges = true;
            // New key - create metadata
            keyMetadata = {
              key_path: keyPath, // Store the original key path
              content: baseValue,
              content_en_sha1_hash: contentHash,
              created_at: now,
              updated_at: now,
              comment: {
                text: "",
                is_auto: false,
                updated_at: null,
              },
              usage: [],
              languages: {
                [baseLanguage]: {
                  ai_translated: false,
                  ai_model: null,
                  ai_spell_check_issues: [],
                  approved_at: null,
                },
              },
            };
            stats.newKeys++;
            stats.namespaces[namespace].newKeys++;
          }

          // Process other languages for this key
          for (const lang of languages) {
            if (lang === baseLanguage) continue;

            try {
              // Construct path to the translation file in this language
              const langFilePath = filePath.replace(
                `/${baseLanguage}/`,
                `/${lang}/`
              );

              if (await fs.pathExists(langFilePath)) {
                // Read translation file
                const langContent = await fs.readJson(langFilePath);

                // Get translated value
                const translatedValue = getValueAtPath(langContent, keyPath);

                // Skip if not found or not a string
                if (typeof translatedValue !== "string") continue;

                // Update languages metadata
                if (!keyMetadata.languages[lang]) {
                  keyMetadata.languages[lang] = {
                    ai_translated: false, // Default to false
                    ai_model: null,
                    ai_spell_check_issues: [],
                    approved_at: null,
                  };
                }
              }
            } catch (langError) {
              console.error(
                `Error processing language ${lang} for key ${keyPath}:`,
                langError
              );
              stats.errors.push({
                type: "language",
                file: filePath,
                language: lang,
                key: keyPath,
                error: langError.message,
              });
            }
          }

          // Save individual key metadata file only if it doesn't already exist
          try {
            const metaFileExists = await fs.pathExists(keyMetaFile);

            if (metaFileExists && !hasChanges) {
              console.log(
                `Skipping existing metadata file for key: ${keyPath}`
              );
              // Count the existing file in our stats
              stats.metadataFiles++;
            } else {
              console.log(`Saving key metadata to: ${keyMetaFile}`);
              await writeJsonWithConsistentEol(keyMetaFile, keyMetadata);
              console.log(`Saved metadata for key: ${keyPath}`);
              // Count the newly created file in our stats
              stats.metadataFiles++;
            }
          } catch (keySaveError) {
            console.error(
              `Error saving metadata file for key ${keyPath}:`,
              keySaveError
            );
            stats.errors.push({
              type: "key-save",
              namespace: namespace,
              key: keyPath,
              error: keySaveError.message,
            });
          }
        }
      } catch (fileError) {
        console.error(`Error processing file ${filePath}:`, fileError);
        stats.errors.push({
          type: "file",
          file: filePath,
          error: fileError.message,
        });
      }

      // No need to save a namespace file anymore since we're using per-key files
      console.log(
        `Processed metadata for namespace: ${namespace} with ${stats.namespaces[namespace].totalKeys} keys`
      );
      console.log(`- ${stats.namespaces[namespace].newKeys} new keys`);
      console.log(`- ${stats.namespaces[namespace].updatedKeys} updated keys`);
      console.log(
        `- ${stats.namespaces[namespace].unchangedKeys} unchanged keys`
      );
    }

    // Clean up stale metadata files
    console.log("Checking for stale metadata files...");
    const staleFiles = [...existingMetaFiles].filter(file => !activeMetaFiles.has(file));
    
    if (staleFiles.length > 0) {
      console.log(`Found ${staleFiles.length} stale metadata files to remove`);
      
      for (const staleFile of staleFiles) {
        try {
          await fs.remove(staleFile);
          console.log(`Removed stale metadata file: ${staleFile}`);
          stats.deletedMetadataFiles++;
        } catch (error) {
          console.error(`Error removing stale metadata file ${staleFile}:`, error);
          stats.errors.push({
            type: "stale-file-removal",
            file: staleFile,
            error: error.message,
          });
        }
      }
    } else {
      console.log("No stale metadata files found");
    }

    // Clean up empty namespace directories
    console.log("Checking for empty namespace directories...");
    for (const namespaceDir of existingNamespaces) {
      try {
        const files = await fs.readdir(namespaceDir);
        if (files.length === 0) {
          await fs.rmdir(namespaceDir);
          console.log(`Removed empty namespace directory: ${namespaceDir}`);
          stats.deletedEmptyNamespaces++;
        }
      } catch (error) {
        console.error(`Error checking/removing namespace directory ${namespaceDir}:`, error);
        stats.errors.push({
          type: "namespace-dir-removal",
          directory: namespaceDir,
          error: error.message,
        });
      }
    }

    console.log("Metadata generation completed");
    console.log("Stats:", JSON.stringify(stats, null, 2));

    return stats;
  } catch (error) {
    console.error(
      `Error generating metadata for project ${projectName} (current namespace: ${currentNamespace}):`,
      error
    );
    stats.errors.push({
      type: "project",
      project: projectName,
      error: error.message,
      namespace: currentNamespace,
    });

    // Continue execution and return stats even after error
    console.log("Metadata generation completed with errors");
    console.log("Stats:", JSON.stringify(stats, null, 2));
    return stats;
  }
}

/**
 * Generate metadata for all projects
 * @returns {Promise<Object>} Overall statistics
 */
async function generateAllMetadata() {
  const projects = Object.keys(projectLocalesMap);
  console.log(
    `Generating metadata for ${projects.length} projects: ${projects.join(", ")}`
  );

  const overallStats = {
    totalProjects: projects.length,
    totalNamespaces: 0,
    totalKeys: 0,
    metadataFiles: 0, // Counter for metadata files (new or existing)
    newKeys: 0,
    updatedKeys: 0,
    unchangedKeys: 0,
    processingErrors: 0,
    projectStats: {},
  };

  for (const project of projects) {
    try {
      console.log(`\n--- Processing project: ${project} ---`);
      const projectStats = await generateMetadata(project);

      // Update overall statistics
      overallStats.totalKeys += projectStats.totalKeys || 0;
      overallStats.newKeys += projectStats.newKeys || 0;
      overallStats.updatedKeys += projectStats.updatedKeys || 0;
      overallStats.unchangedKeys += projectStats.unchangedKeys || 0;
      overallStats.metadataFiles += projectStats.metadataFiles || 0;
      overallStats.totalNamespaces += Object.keys(
        projectStats.namespaces || {}
      ).length;
      
      // Add cleanup stats to overall stats
      if (!overallStats.deletedMetadataFiles) overallStats.deletedMetadataFiles = 0;
      if (!overallStats.deletedEmptyNamespaces) overallStats.deletedEmptyNamespaces = 0;
      overallStats.deletedMetadataFiles += projectStats.deletedMetadataFiles || 0;
      overallStats.deletedEmptyNamespaces += projectStats.deletedEmptyNamespaces || 0;

      // Log namespace statistics
      if (
        projectStats.namespaces &&
        Object.keys(projectStats.namespaces).length > 0
      ) {
        console.log(`\nNamespace statistics for project ${project}:`);
        Object.entries(projectStats.namespaces).forEach(
          ([namespace, stats]) => {
            console.log(
              `  - ${namespace}: ${stats.totalKeys} keys (${stats.newKeys} new, ${stats.updatedKeys} updated)`
            );
          }
        );
      }

      overallStats.projectStats[project] = projectStats;
    } catch (error) {
      console.error(`Error processing project ${project}:`, error);
      overallStats.processingErrors++;
    }
  }

  return overallStats;
}

// Run the script if executed directly
if (require.main === module) {
  generateAllMetadata()
    .then((stats) => {
      console.log("\n=== Complete metadata generation finished ===");
      console.log(
        `Processed ${stats.totalProjects} projects with ${stats.totalNamespaces} namespaces`
      );
      console.log(
        `Total keys: ${stats.totalKeys} (${stats.newKeys} new, ${stats.updatedKeys} updated, ${stats.unchangedKeys} unchanged)`
      );
      console.log(
        `Metadata files: ${stats.metadataFiles} files (existing files were skipped)`
      );
      console.log(
        `Cleanup: ${stats.deletedMetadataFiles} stale metadata files removed, ${stats.deletedEmptyNamespaces} empty namespace directories removed`
      );

      if (stats.processingErrors > 0) {
        console.log(
          `\nWARNING: Encountered ${stats.processingErrors} errors during processing`
        );
      }

      console.log("\nDetailed stats:", JSON.stringify(stats, null, 2));
    })
    .catch((error) => {
      console.error("Fatal error during metadata generation:", error);
      process.exit(1);
    });
}

module.exports = {
  generateMetadata,
  generateAllMetadata,
};
