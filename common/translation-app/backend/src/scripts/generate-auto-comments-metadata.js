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
const {
  appRootPath,
  projectLocalesMap,
  ollamaConfig,
} = require("../config/config");
const axios = require("axios");

const MODEL = process.env.OLLAMA_MODEL || "gemma3:12b";

/**
 * Checks if Ollama is running and available
 * @returns {Promise<boolean>} True if Ollama is running
 */
async function isOllamaRunning() {
  try {
    const response = await axios.get(ollamaConfig.apiUrl + "/api/tags", {
      timeout: 2000, // 2 second timeout
    });
    return response.status === 200;
  } catch (error) {
    console.log("Ollama connection check failed:", error.message);
    return false;
  }
}

/**
 * Generates a comment for a translation key using Ollama with retry mechanism
 * @param {string} keyPath - The key path
 * @param {string} content - The key content
 * @param {Array<Object>} usages - Array of usage objects with file_path, line_number, and context
 * @returns {Promise<string>} Generated comment
 */
async function generateBasicComment(keyPath, content, usages) {
  // Skip if no usages or content is empty
  if (!usages || usages.length === 0 || !content) {
    console.log(
      `Skipping comment generation for ${keyPath}: insufficient data`
    );
    return null;
  }

  // Check if Ollama is connected
  const ollamaRunning = await isOllamaRunning();
  if (!ollamaRunning) {
    console.log("Ollama is not running. Skipping comment generation.");
    return null;
  }

  // Create prompt for Ollama - limit context to prevent request size issues
  // Only use the first 3 usages to keep the prompt size reasonable
  const limitedUsages = usages.slice(0, 3);

  // Truncate context to prevent extremely long prompts
  const processedUsages = limitedUsages.map((u) => ({
    ...u,
    context: u.context
      ? u.context.substring(0, 300) + (u.context.length > 300 ? "..." : "")
      : "",
  }));

  const prompt = `
# Translation Key Description Task

## Context Information
- **Key Name:** ${keyPath}
- **English Content:** "${content}"
- **Usage Contexts:**
${processedUsages.map((u) => `  - **File:** ${u.file_path}\n    **Line:** ${u.line_number}\n    **Context:** ${u.context}`).join("\n")}

## Instructions
You are a helpful assistant that creates concise descriptions for translation keys.
Based on this information, please write a short, clear description of what this translation key is used for.

- Keep it to 1-3 sentences
- Explain the purpose of this text in the UI
- Mention where it appears (button, dialog, etc.) if apparent
- Provide context helpful for translators

**Important:** Respond with ONLY the description, no additional text.
  `;

  // Retry configuration
  const maxRetries = 3;
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      console.log(
        `Generating comment for ${keyPath} (attempt ${retries + 1}/${maxRetries})`
      );

      // Call Ollama API with timeout
      const response = await axios.post(
        ollamaConfig.apiUrl + "/api/generate",
        {
          model: MODEL,
          prompt: prompt,
          stream: false,
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Return the generated comment
      if (response.data && response.data.response) {
        return response.data.response.trim();
      } else {
        throw new Error(
          `Unexpected Ollama response format: ${JSON.stringify(response.data)}`
        );
      }
    } catch (error) {
      lastError = error;
      retries++;

      // Log the error
      console.error(
        `Error calling Ollama (attempt ${retries}/${maxRetries}):`,
        error.message
      );

      // If it's a socket hang up or timeout, wait before retrying
      if (
        error.code === "ECONNRESET" ||
        error.code === "ETIMEDOUT" ||
        error.message.includes("socket hang up") ||
        error.message.includes("timeout")
      ) {
        console.log(
          `Network error detected. Waiting before retry... ${error.message}`
        );
        console.log(
          `ollama api url: '${ollamaConfig.apiUrl}' model: '${MODEL}'`
        );
        console.log(`prompt: ${prompt}`);
        // Wait for a few seconds before retrying (increasing with each retry)
        await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
      } else if (retries < maxRetries) {
        // For other errors, wait a shorter time
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.error(
    `Failed to generate comment for ${keyPath} after ${maxRetries} attempts:`,
    lastError ? lastError.message : "Unknown error"
  );
  return null;
}

/**
 * Creates or updates metadata for a project
 * @param {string} projectName - Project name
 * @returns {Promise<Object>} Statistics
 */
async function generateAutoComment(projectName) {
  console.log(`Generating auto comments metadata for project: ${projectName}`);

  // Debug variable to track current namespace
  let currentNamespace = null;

  const stats = {
    totalProjects: 1, // Start with 1 for the current project
    totalNamespaces: 0,
    totalFiles: 0,
    totalKeys: 0,
    processedKeys: 0,
    updatedComments: 0,
    skippedKeys: 0,
    errors: [],
    namespaces: {},
    startTime: new Date(),
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

    // Process all translation files in the base language
    const metaNamespaceDirs = (await fs.readdir(metaDir)).filter(
      (dir) => dir !== ".DS_Store"
    );

    for (const namespace of metaNamespaceDirs) {
      const namespacePath = path.join(metaDir, namespace);
      if (!(await fs.stat(namespacePath)).isDirectory()) continue;

      // Get all key files in this namespace
      // Use normalized path with forward slashes for glob to work on all platforms
      const globPattern = path
        .join(namespacePath, "*.json")
        .replace(/\\/g, "/");
      const keyFiles = glob.sync(globPattern) || [];

      // Update namespace stats
      stats.namespaces[namespace] = stats.namespaces[namespace] || {
        totalKeys: 0,
        processedKeys: 0,
        updatedComments: 0,
        skippedKeys: 0,
        errors: 0,
      };

      stats.namespaces[namespace].totalKeys = keyFiles.length;
      stats.totalKeys += keyFiles.length;
      stats.totalFiles += keyFiles.length;
      stats.totalNamespaces++;

      let processedCount = 0;

      for (const keyFile of keyFiles) {
        try {
          const keyMeta = await fs.readJson(keyFile);
          const keyPath = keyMeta.key_path || path.basename(keyFile, ".json");

          processedCount++;
          stats.namespaces[namespace].processedKeys++;

          // Show progress information
          console.log(
            `Processing key: ${keyPath} (${processedCount}/${keyFiles.length} in ${namespace})`
          );

          if (!keyMeta.comment || keyMeta.comment.text === "") {
            const comment = await generateBasicComment(
              keyPath,
              keyMeta.content,
              keyMeta.usage
            );

            if (comment && comment !== "") {
              // Initialize comment object if it doesn't exist
              if (!keyMeta.comment) {
                keyMeta.comment = {
                  text: "",
                  is_auto: false,
                  updated_at: null,
                };
              }

              keyMeta.comment.text = comment;
              keyMeta.comment.is_auto = true;
              const now = new Date().toISOString();
              keyMeta.comment.updated_at = now;
              keyMeta.updated_at = now;

              await writeJsonWithConsistentEol(keyFile, keyMeta);

              // Update stats
              stats.namespaces[namespace].updatedComments++;
              stats.updatedComments++;
              console.log(`  ✓ Generated comment for ${keyPath}`);
            } else {
              stats.namespaces[namespace].skippedKeys++;
              stats.skippedKeys++;
              console.log(`  ✗ Skipped ${keyPath}: no comment generated`);
            }
          } else {
            stats.namespaces[namespace].skippedKeys++;
            stats.skippedKeys++;
            console.log(`  ↷ Skipped ${keyPath}: already has a comment`);
          }
        } catch (error) {
          console.error(`Error reading metadata file ${keyFile}:`, error);
          stats.namespaces[namespace].errors++;
          stats.errors.push({
            file: keyFile,
            error: error.message,
          });
        }
      }
    }

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
async function generateAutoCommentsMetadata() {
  const projects = Object.keys(projectLocalesMap);
  console.log(
    `Generating metadata for ${projects.length} projects: ${projects.join(", ")}`
  );

  const overallStats = {
    totalProjects: projects.length,
    totalNamespaces: 0,
    totalFiles: 0,
    totalKeys: 0,
    processedKeys: 0,
    updatedComments: 0,
    skippedKeys: 0,
    errors: [],
    namespaces: {},
    startTime: new Date(),
  };

  for (const project of projects) {
    try {
      console.log(`\n--- Processing project: ${project} ---`);
      const projectStats = await generateAutoComment(project);

      // Update overall statistics
      overallStats.totalKeys += projectStats.totalKeys || 0;
      overallStats.totalFiles += projectStats.totalFiles || 0;
      overallStats.totalNamespaces += projectStats.totalNamespaces || 0;
      overallStats.processedKeys += projectStats.processedKeys || 0;
      overallStats.updatedComments += projectStats.updatedComments || 0;
      overallStats.skippedKeys += projectStats.skippedKeys || 0;

      if (projectStats.errors && projectStats.errors.length) {
        overallStats.errors.push(...projectStats.errors);
      }

      // Merge namespace stats
      if (projectStats.namespaces) {
        Object.entries(projectStats.namespaces).forEach(
          ([namespace, nsStats]) => {
            if (!overallStats.namespaces[namespace]) {
              overallStats.namespaces[namespace] = {
                totalKeys: 0,
                processedKeys: 0,
                updatedComments: 0,
                skippedKeys: 0,
                errors: 0,
              };
            }

            overallStats.namespaces[namespace].totalKeys +=
              nsStats.totalKeys || 0;
            overallStats.namespaces[namespace].processedKeys +=
              nsStats.processedKeys || 0;
            overallStats.namespaces[namespace].updatedComments +=
              nsStats.updatedComments || 0;
            overallStats.namespaces[namespace].skippedKeys +=
              nsStats.skippedKeys || 0;
            overallStats.namespaces[namespace].errors += nsStats.errors || 0;
          }
        );
      }

      console.log(`Namespace statistics for project ${project}:`);
      if (projectStats.namespaces) {
        Object.entries(projectStats.namespaces).forEach(
          ([namespace, nsStats]) => {
            console.log(
              `  - ${namespace}: ${nsStats.totalKeys || 0} keys (${nsStats.updatedComments || 0} comments generated)`
            );
          }
        );
      }
    } catch (error) {
      console.error(`Error processing project ${project}:`, error);
      overallStats.errors.push({
        project,
        error: error.message,
      });
    }
  }

  return overallStats;
}

// Run the script if executed directly
generateAutoCommentsMetadata()
  .then((stats) => {
    // Ensure stats object has all required properties
    stats = {
      totalProjects: stats.totalProjects || 0,
      totalNamespaces: stats.totalNamespaces || 0,
      totalFiles: stats.totalFiles || 0,
      totalKeys: stats.totalKeys || 0,
      processedKeys: stats.processedKeys || 0,
      updatedComments: stats.updatedComments || 0,
      skippedKeys: stats.skippedKeys || 0,
      errors: stats.errors || [],
      namespaces: stats.namespaces || {},
      startTime: stats.startTime || new Date(Date.now() - 1000), // Default to 1 second ago if missing
      ...stats,
    };

    const endTime = new Date();
    const durationMs = endTime - stats.startTime;
    const durationMin = Math.floor(durationMs / 60000) || 0;
    const durationSec = Math.floor((durationMs % 60000) / 1000) || 0;

    console.log("\n=== Auto Comments Generation Summary ===");
    console.log(`Duration: ${durationMin} minutes, ${durationSec} seconds`);
    console.log(
      `Processed ${stats.totalNamespaces} namespaces with ${stats.totalKeys} total keys`
    );
    console.log(`Comments generated: ${stats.updatedComments || 0} keys`);
    console.log(`Skipped: ${stats.skippedKeys || 0} keys`);

    if (stats.errors && stats.errors.length > 0) {
      console.log(
        `\nWARNING: Encountered ${stats.errors.length} errors during processing`
      );
    }

    // Display namespace-specific stats
    console.log("\nNamespace Statistics:");
    Object.entries(stats.namespaces || {}).forEach(([namespace, nsStats]) => {
      if (nsStats) {
        console.log(
          `  ${namespace}: ${nsStats.updatedComments || 0}/${nsStats.totalKeys || 0} comments generated`
        );
      }
    });

    // Only show detailed stats if there are errors
    if (stats.errors && stats.errors.length > 0) {
      console.log("\nError details:");
      stats.errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.file}: ${err.error}`);
      });
    }
  })
  .catch((error) => {
    console.error("Error generating auto comments:", error);
    process.exit(1);
  });
