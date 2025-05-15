#!/usr/bin/env node
/**
 * Generate Metadata for Translation Files
 *
 * This script scans the locales directories and generates metadata files
 * for all translation keys, preserving existing metadata where available.
 */
const fs = require('fs-extra');
const { writeJsonWithConsistentEol } = require('../utils/fsUtils');
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
    totalFiles: 0,
    totalKeys: 0,
    newKeys: 0,
    updatedKeys: 0,
    unchangedKeys: 0,
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
    const translationFiles = glob.sync(
      `${projectPath}/${baseLanguage}/**/*.json`
    );

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

          // Read existing metadata for this key if available
          let keyMetadata = null;
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

          if (!keyMetadata) {
            // New key - create metadata
            keyMetadata = {
              key_path: keyPath, // Store the original key path
              content_en_sha1_hash: contentHash,
              created_at: now,
              updated_at: now,
              comment_text: "", // Empty by default
              comment_ai: false,
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
          } else {
            // Existing key - check for content changes
            if (keyMetadata.content_en_sha1_hash !== contentHash) {
              // Content changed - update hash and timestamp
              keyMetadata.content_en_sha1_hash = contentHash;
              keyMetadata.updated_at = now;
              stats.updatedKeys++;
              stats.namespaces[namespace].updatedKeys++;
            } else {
              stats.unchangedKeys++;
              stats.namespaces[namespace].unchangedKeys++;
            }

            // Ensure key path is stored
            keyMetadata.key_path = keyPath;

            // Ensure base language exists in languages object
            if (!keyMetadata.languages[baseLanguage]) {
              keyMetadata.languages[baseLanguage] = {
                ai_translated: false,
                ai_model: null,
                ai_spell_check_issues: [],
                approved_at: null,
              };
            }
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

          // Save individual key metadata file
          try {
            console.log(`Saving key metadata to: ${keyMetaFile}`);
            await writeJsonWithConsistentEol(keyMetaFile, keyMetadata);
            console.log(`Saved metadata for key: ${keyPath}`);
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
      overallStats.totalNamespaces += Object.keys(
        projectStats.namespaces || {}
      ).length;

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
      console.log("Complete metadata generation finished");
      console.log("Overall stats:", JSON.stringify(stats, null, 2));
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
