const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const { exec } = require("child_process");
const { appRootPath, projectLocalesMap } = require("../config/config");
const { writeJsonWithConsistentEol } = require("../utils/fsUtils");

/**
 * Finds all metadata files across all projects for a specific key
 * @param {string} key - Translation key to look for
 * @returns {Promise<Array<{project: string, namespace: string, key: string, metaPath: string}>>}
 */
async function findMetadataFiles(key) {
  const metadataFiles = [];

  // Parse key for potential namespace:key format
  let searchNamespace = null;
  let searchKey = key;

  if (key.includes(":")) {
    const parts = key.split(":");
    searchNamespace = parts[0];
    searchKey = parts[1];
  }

  const projects = Object.keys(projectLocalesMap);

  for (const project of projects) {
    const localesPath = projectLocalesMap[project];
    if (!localesPath) continue;

    const projectPath = path.join(appRootPath, localesPath);
    const metaDir = path.join(projectPath, ".meta");

    if (!(await fs.pathExists(metaDir))) continue;

    // Get all namespace directories
    const namespaceDirs = await fs.readdir(metaDir);

    for (const namespace of namespaceDirs) {
      // If namespace filter is specified, skip non-matching namespaces
      if (searchNamespace && namespace !== searchNamespace) continue;

      const namespacePath = path.join(metaDir, namespace);
      if (!(await fs.stat(namespacePath)).isDirectory()) continue;

      // Get all key files in this namespace
      // Use normalized path with forward slashes for glob to work on all platforms
      const namespacePathPattern = path
        .join(namespacePath, "*.json")
        .replace(/\\/g, "/");

      const keyFiles = glob.sync(namespacePathPattern);

      for (const keyFile of keyFiles) {
        try {
          const keyData = await fs.readJson(keyFile);
          const keyPath = keyData.key_path || path.basename(keyFile, ".json");

          // If looking for a specific key, check if this matches
          if (keyPath === searchKey) {
            metadataFiles.push({
              project,
              namespace,
              key: keyPath,
              metaPath: keyFile,
              data: keyData,
            });
          }
        } catch (error) {
          console.error(`Error reading metadata file ${keyFile}:`, error);
        }
      }
    }
  }

  return metadataFiles;
}

/**
 * Search for a specific key in the codebase
 * @param {string} key - The translation key to search for
 * @param {string} namespace - Optional namespace to restrict the search pattern
 * @returns {Promise<Array<Object>>} - Array of usage locations with file paths and line numbers
 */
async function findKeyUsageInCodebase(key, namespace) {
  return new Promise((resolve, reject) => {
    const usages = [];
    const searchPattern = namespace ? `${namespace}:${key}` : key;

    // Use different search patterns to catch common translation usage patterns
    const searchPatterns = [
      `t\("${searchPattern}"\)`, // t("Common:Key")
      `t\([\'\"]+${searchPattern}[\'\"]+\)`, // t('Common:Key')
      `useTranslation\([\'\"]${namespace || ".*"}[\'\"]\).+${key}`, // useTranslation().t("Key")
      `\{t\([\'\"]${searchPattern}[\'\"]\)\}`, // {t("Common:Key")}
    ];

    const rootPath = path.resolve(appRootPath, "..");

    // Get all code file patterns
    const patterns = [
      `${rootPath}/**/*.ts`,
      `${rootPath}/**/*.tsx`,
      `${rootPath}/**/*.js`,
      `${rootPath}/**/*.jsx`,
    ];

    try {
      // Use glob to find all code files
      const codeFiles = glob.sync(patterns, {
        ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
      });

      let pendingSearches = 0;
      const results = [];

      if (codeFiles.length === 0) {
        resolve([]);
        return;
      }

      // Search each pattern in each file
      for (const pattern of searchPatterns) {
        pendingSearches++;

        const grepCommand = `grep -n "${pattern}" ${codeFiles.join(" ")} 2>/dev/null || true`;

        exec(grepCommand, (error, stdout) => {
          if (stdout) {
            const lines = stdout.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              // Parse grep output (format: path/to/file.js:line_number:matched_line)
              const match = line.match(/^(.+):(\d+):(.*)$/);

              if (match) {
                const [, filePath, lineNumber, context] = match;

                results.push({
                  file_path: filePath,
                  line_number: parseInt(lineNumber),
                  context: context.trim(),
                  module: filePath.includes("/packages/")
                    ? filePath.match(/\/packages\/([^\/]+)/)[1]
                    : path.basename(path.dirname(filePath)),
                });
              }
            }
          }

          pendingSearches--;
          if (pendingSearches === 0) {
            // Remove duplicates
            const uniqueResults = results.filter(
              (result, index, self) =>
                index ===
                self.findIndex(
                  (r) =>
                    r.file_path === result.file_path &&
                    r.line_number === result.line_number
                )
            );
            resolve(uniqueResults);
          }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Registers API routes for translation key usage functionality
 * @param {object} fastify - Fastify instance
 */
async function keyUsageRoutes(fastify) {
  // Get usage information for a key
  fastify.get("/api/key-usage/:key", async (request, reply) => {
    try {
      const { key } = request.params;
      const findInCode = request.query.findInCode === "true";

      // Find metadata files for this key
      const metadataFiles = await findMetadataFiles(key);

      if (metadataFiles.length === 0 && !findInCode) {
        return reply.code(404).send({ error: "Key not found in metadata" });
      }

      // Extract namespace if present in the key
      let namespace = null;
      let keyName = key;

      if (key.includes(":")) {
        const parts = key.split(":");
        namespace = parts[0];
        keyName = parts[1];
      }

      // Collect all usage information
      let allUsages = [];
      let comment = null;
      let languages = [];

      // Process metadata from files
      for (const file of metadataFiles) {
        // Get comment if available
        if (file.data.comment.text !== "") {
          // Format comment data as expected by the frontend
          comment = {
            comment: file.data.comment.text || "",
            is_auto: file.data.comment.is_auto || false,
            updated_at: file.data.comment.updated_at || file.data.updated_at,
          };
        }

        // Get usages from metadata
        if (file.data.usage && Array.isArray(file.data.usage)) {
          allUsages = [...allUsages, ...file.data.usage];
        }

        if (file.data.languages) {
          languages = file.data.languages;
        }
      }

      // If requested, add usage from codebase search
      if (findInCode) {
        try {
          const codeUsages = await findKeyUsageInCodebase(keyName, namespace);
          allUsages = [...allUsages, ...codeUsages];
        } catch (error) {
          console.error("Error searching for key usage in codebase:", error);
          // Don't fail the whole request if code search fails
        }
      }

      // Format response to match frontend expectations
      const result = {
        key,
        usages: allUsages,
        comment,
        languages,
      };

      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // Find key usage in codebase
  fastify.get("/api/find-key-usage/:key", async (request, reply) => {
    try {
      const { key } = request.params;

      // Extract namespace if present in the key
      let namespace = null;
      let keyName = key;

      if (key.includes(":")) {
        const parts = key.split(":");
        namespace = parts[0];
        keyName = parts[1];
      }

      const codeUsages = await findKeyUsageInCodebase(keyName, namespace);

      return reply.send({
        key,
        usages: codeUsages,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get list of keys with usage information
  fastify.get("/api/keys-with-usage", async (request, reply) => {
    try {
      const { project, namespace, limit = 20 } = request.query;
      const keysWithUsage = [];

      // Iterate through projects to find keys with usage data
      const projects = project ? [project] : Object.keys(projectLocalesMap);

      // Find all metadata files that have usage information
      for (const projectName of projects) {
        const localesPath = projectLocalesMap[projectName];
        if (!localesPath) continue;

        const projectPath = path.join(appRootPath, localesPath);
        const metaDir = path.join(projectPath, ".meta");

        if (!(await fs.pathExists(metaDir))) continue;

        // Get all namespace directories
        const namespaceDirs = await fs.readdir(metaDir);

        for (const nsName of namespaceDirs) {
          // If namespace filter is specified, skip non-matching namespaces
          if (namespace && nsName !== namespace) continue;

          const namespacePath = path.join(metaDir, nsName);
          if (!(await fs.stat(namespacePath)).isDirectory()) continue;

          // Get all key files in this namespace
          // Use normalized path with forward slashes for glob to work on all platforms
          const namespacePathPattern = path
            .join(namespacePath, "*.json")
            .replace(/\\/g, "/");
          const keyFiles = glob.sync(namespacePathPattern);

          for (const keyFile of keyFiles) {
            try {
              const keyData = await fs.readJson(keyFile);
              const keyPath =
                keyData.key_path || path.basename(keyFile, ".json");

              // Check if this key has usage data
              if (keyData.usage && keyData.usage.length > 0) {
                keysWithUsage.push({
                  key: keyPath,
                  namespace: nsName,
                  project: projectName,
                  usage_count: keyData.usage.length,
                });
              }
            } catch (error) {
              console.error(`Error reading metadata file ${keyFile}:`, error);
            }
          }
        }
      }

      // Sort by usage count (highest first)
      keysWithUsage.sort((a, b) => b.usage_count - a.usage_count);

      // Apply limit
      const limitedResults = limit
        ? keysWithUsage.slice(0, parseInt(limit))
        : keysWithUsage;

      return reply.send(limitedResults);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // Approve or unapprove a translation for a specific language
  fastify.post(
    "/api/key-usage/:key/approve/:language",
    async (request, reply) => {
      try {
        const { key, language } = request.params;
        const { approved } = request.body;

        // Find metadata files for this key
        const metadataFiles = await findMetadataFiles(key);

        if (metadataFiles.length === 0) {
          return reply.code(404).send({ error: "Key not found in metadata" });
        }

        // Update the metadata file with the approval status
        for (const file of metadataFiles) {
          // Ensure the languages object exists
          if (!file.data.languages) {
            file.data.languages = {};
          }

          // Ensure the specific language entry exists
          if (!file.data.languages[language]) {
            file.data.languages[language] = {
              ai_translated: false,
              ai_model: null,
              ai_spell_check_issues: [],
              approved_at: null,
            };
          }

          // Update the approved_at timestamp
          file.data.languages[language].approved_at = approved
            ? new Date().toISOString()
            : null;

          // Write the updated metadata back to the file
          await writeJsonWithConsistentEol(file.metaPath, file.data);
        }

        // Re-fetch the updated metadata
        const updatedMetadataFiles = await findMetadataFiles(key);
        const updatedFile = updatedMetadataFiles[0];

        return reply.send({
          success: true,
          message: approved
            ? "Translation approved"
            : "Translation approval removed",
          data: updatedFile ? updatedFile.data : null,
        });
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: error.message });
      }
    }
  );

  // Get all keys for a module
  fastify.get("/api/key-usage/module/:module", async (request, reply) => {
    try {
      const { module } = request.params;
      const keysForModule = [];

      // Look through all metadata files to find keys with usage in the specified module
      const projects = Object.keys(projectLocalesMap);

      for (const project of projects) {
        const localesPath = projectLocalesMap[project];
        if (!localesPath) continue;

        const projectPath = path.join(appRootPath, localesPath);
        const metaDir = path.join(projectPath, ".meta");

        if (!(await fs.pathExists(metaDir))) continue;

        // Get all namespace directories
        const namespaceDirs = await fs.readdir(metaDir);

        for (const namespace of namespaceDirs) {
          const namespacePath = path.join(metaDir, namespace);
          if (!(await fs.stat(namespacePath)).isDirectory()) continue;

          // Get all key files in this namespace
          // Use normalized path with forward slashes for glob to work on all platforms
          const namespacePathPattern = path
            .join(namespacePath, "*.json")
            .replace(/\\/g, "/");
          const keyFiles = glob.sync(namespacePathPattern);

          for (const keyFile of keyFiles) {
            try {
              const keyData = await fs.readJson(keyFile);
              const keyPath =
                keyData.key_path || path.basename(keyFile, ".json");

              // Check if this key has usage in the specified module
              if (keyData.usage && keyData.usage.length > 0) {
                const usageInModule = keyData.usage.some((u) => {
                  return (
                    u.module === module ||
                    (u.file_path &&
                      u.file_path.includes(`/packages/${module}/`))
                  );
                });

                if (usageInModule) {
                  keysForModule.push({
                    key: keyPath,
                    namespace,
                    project,
                  });
                }
              }
            } catch (error) {
              console.error(`Error reading metadata file ${keyFile}:`, error);
            }
          }
        }
      }

      // Sort keys alphabetically
      keysForModule.sort((a, b) => a.key.localeCompare(b.key));

      return reply.send({
        module,
        keys: keysForModule.map((k) =>
          k.namespace && k.namespace !== "Common"
            ? `${k.namespace}:${k.key}`
            : k.key
        ),
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to get keys for module" });
    }
  });

  // Get all modules
  fastify.get("/api/key-usage/modules", async (request, reply) => {
    try {
      const modules = new Set();

      // Look through all metadata files to find unique modules
      const projects = Object.keys(projectLocalesMap);

      for (const project of projects) {
        const localesPath = projectLocalesMap[project];
        if (!localesPath) continue;

        const projectPath = path.join(appRootPath, localesPath);
        const metaDir = path.join(projectPath, ".meta");

        if (!(await fs.pathExists(metaDir))) continue;

        // Get all namespace directories
        const namespaceDirs = await fs.readdir(metaDir);

        for (const namespace of namespaceDirs) {
          const namespacePath = path.join(metaDir, namespace);
          if (!(await fs.stat(namespacePath)).isDirectory()) continue;

          // Get all key files in this namespace
          // Use normalized path with forward slashes for glob to work on all platforms
          const namespacePathPattern = path
            .join(namespacePath, "*.json")
            .replace(/\\/g, "/");
          const keyFiles = glob.sync(namespacePathPattern);

          for (const keyFile of keyFiles) {
            try {
              const keyData = await fs.readJson(keyFile);

              // Extract module information from usage data
              if (keyData.usage && keyData.usage.length > 0) {
                for (const usage of keyData.usage) {
                  if (usage.module) {
                    modules.add(usage.module);
                  } else if (usage.file_path) {
                    // Try to extract module from file path
                    const moduleMatch = usage.file_path.match(
                      /\/packages\/([^\/]+)\//
                    );
                    if (moduleMatch) {
                      modules.add(moduleMatch[1]);
                    }
                  }
                }
              }
            } catch (error) {
              console.error(`Error reading metadata file ${keyFile}:`, error);
            }
          }
        }
      }

      // Sort modules alphabetically
      const modulesList = [...modules].sort();

      return reply.send(modulesList);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to get modules" });
    }
  });

  // Update metadata with usage information from code search
  fastify.post("/api/update-key-usage/:key", async (request, reply) => {
    try {
      const { key } = request.params;

      // Extract namespace if present in the key
      let namespace = null;
      let keyName = key;

      if (key.includes(":")) {
        const parts = key.split(":");
        namespace = parts[0];
        keyName = parts[1];
      }

      // Find metadata files for this key
      const metadataFiles = await findMetadataFiles(key);

      if (metadataFiles.length === 0) {
        return reply.code(404).send({ error: "Key not found in metadata" });
      }

      // Search for key usage in codebase
      const codeUsages = await findKeyUsageInCodebase(keyName, namespace);

      // Update each metadata file with the usage information
      const updatedFiles = [];

      for (const file of metadataFiles) {
        try {
          file.data.usage = codeUsages;
          file.data.updated_at = new Date().toISOString();

          await writeJsonWithConsistentEol(file.metaPath, file.data);

          updatedFiles.push({
            project: file.project,
            namespace: file.namespace,
            key: file.key,
            usages: codeUsages.length,
          });
        } catch (error) {
          console.error(
            `Error updating metadata file ${file.metaPath}:`,
            error
          );
        }
      }

      return reply.send({
        key,
        updatedFiles,
        usagesFound: codeUsages.length,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // Set a custom comment for a key
  fastify.post("/api/key-usage/:key/comment", async (request, reply) => {
    try {
      const { key } = request.params;
      const { comment } = request.body;

      if (!comment) {
        return reply.code(400).send({ error: "Comment is required" });
      }

      // Find metadata files for this key
      const metadataFiles = await findMetadataFiles(key);

      if (metadataFiles.length === 0) {
        return reply.code(404).send({ error: "Key not found in metadata" });
      }

      // Update each metadata file with the comment
      const updatedFiles = [];

      for (const file of metadataFiles) {
        try {
          // Add or update comment in the metadata
          // Store comment in the correct format expected by the application
          file.data.comment.text = comment;
          file.data.comment.is_auto = false;
          file.data.comment.updated_at = new Date().toISOString();
          file.data.updated_at = new Date().toISOString();

          await writeJsonWithConsistentEol(file.metaPath, file.data);

          updatedFiles.push({
            project: file.project,
            namespace: file.namespace,
            key: file.key,
          });
        } catch (error) {
          console.error(
            `Error updating comment in metadata file ${file.metaPath}:`,
            error
          );
        }
      }

      if (updatedFiles.length === 0) {
        return reply
          .code(500)
          .send({ error: "Failed to update any metadata files with comment" });
      }

      return reply.send({
        success: true,
        updatedFiles,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to set comment" });
    }
  });

  // Trigger a codebase analysis for all keys
  fastify.post("/api/key-usage/analyze", async (request, reply) => {
    try {
      // Start the background analysis process
      const analyzeAllKeys = async () => {
        const allMetadataFiles = await findAllMetadataFiles();
        let processedCount = 0;
        let updatedCount = 0;

        for (const file of allMetadataFiles) {
          try {
            // Extract namespace and key name
            let namespace = file.namespace;
            let keyName = file.key;

            // Skip special prefixes/namespaces if needed
            if (namespace === "Common") {
              namespace = null;
            }

            // Find usage for this key in the codebase
            const codeUsages = await findKeyUsageInCodebase(keyName, namespace);

            // Update the metadata file with usage information
            if (codeUsages.length > 0 || !file.data.usage) {
              file.data.usage = codeUsages;
              file.data.updated_at = new Date().toISOString();

              await writeJsonWithConsistentEol(file.metaPath, file.data);
              updatedCount++;
            }

            processedCount++;

            // Log progress occasionally
            if (processedCount % 50 === 0) {
              console.log(
                `Analyzed ${processedCount}/${allMetadataFiles.length} keys (${updatedCount} updated)`
              );
            }
          } catch (error) {
            console.error(`Error analyzing key ${file.key}:`, error);
          }
        }

        console.log(
          `Analysis complete. Processed ${processedCount} keys, updated ${updatedCount} metadata files.`
        );
      };

      // Run the analysis in the background
      analyzeAllKeys().catch((err) => {
        console.error("Background analysis error:", err);
      });

      // Return immediately with status
      return reply.send({
        success: true,
        message:
          "Analysis started in background. This may take several minutes to complete.",
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to start analysis" });
    }
  });

  // Search for keys by prefix or pattern
  fastify.get("/api/key-usage/search", async (request, reply) => {
    try {
      const { query, project, namespace } = request.query;

      if (!query) {
        return reply.code(400).send({ error: "Search query is required" });
      }

      const matchingKeys = [];
      const queryLower = query.toLowerCase();

      // Determine which projects to search
      const projects = project ? [project] : Object.keys(projectLocalesMap);

      // Find all keys that match the query
      for (const projectName of projects) {
        const localesPath = projectLocalesMap[projectName];
        if (!localesPath) continue;

        const projectPath = path.join(appRootPath, localesPath);
        const metaDir = path.join(projectPath, ".meta");

        if (!(await fs.pathExists(metaDir))) continue;

        // Get all namespace directories
        const namespaceDirs = await fs.readdir(metaDir);

        for (const ns of namespaceDirs) {
          // Skip if namespace filter is provided and doesn't match
          if (namespace && ns !== namespace) continue;

          const namespacePath = path.join(metaDir, ns);
          if (!(await fs.stat(namespacePath)).isDirectory()) continue;

          // Get all key files in this namespace
          // Use normalized path with forward slashes for glob to work on all platforms
          const namespacePathPattern = path
            .join(namespacePath, "*.json")
            .replace(/\\/g, "/");
          const keyFiles = glob.sync(namespacePathPattern);

          for (const keyFile of keyFiles) {
            try {
              const fileName = path.basename(keyFile, ".json");
              const keyData = await fs.readJson(keyFile);
              const keyPath = keyData.key_path || fileName;

              // Check if key matches the query (case insensitive)
              if (keyPath.toLowerCase().includes(queryLower)) {
                const fullKey = ns !== "Common" ? `${ns}:${keyPath}` : keyPath;

                matchingKeys.push({
                  key: fullKey,
                  namespace: ns,
                  project: projectName,
                });
              }
            } catch (error) {
              console.error(`Error reading metadata file ${keyFile}:`, error);
            }
          }
        }
      }

      // Sort keys alphabetically and limit to 100 results
      matchingKeys.sort((a, b) => a.key.localeCompare(b.key));
      const limitedResults = matchingKeys.slice(0, 100);

      return reply.send(limitedResults.map((k) => k.key));
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to search for keys" });
    }
  });

  // Get statistics about key usage
  fastify.get("/api/key-usage/stats", async (request, reply) => {
    try {
      const allMetadataFiles = await findAllMetadataFiles();
      const totalKeys = allMetadataFiles.length;
      const totalModules = new Set();
      const totalFiles = new Set();
      let totalUsages = 0;

      for (const file of allMetadataFiles) {
        if (file.data && file.data.usage) {
          totalUsages += file.data.usage.length;
          for (const usage of file.data.usage) {
            if (usage.module) {
              totalModules.add(usage.module);
            }
            if (usage.file_path) {
              totalFiles.add(usage.file_path);
            }
          }
        }
      }

      const moduleStats = [];

      for (const module of totalModules) {
        const keyCount = allMetadataFiles.filter(
          (file) =>
            file.data &&
            file.data.usage &&
            file.data.usage.some((u) => u.module === module)
        ).length;

        const fileCount = allMetadataFiles.filter(
          (file) =>
            file.data &&
            file.data.usage &&
            file.data.usage.some(
              (u) => u.file_path && u.file_path.includes(`/packages/${module}/`)
            )
        ).length;

        moduleStats.push({
          module,
          keyCount,
          fileCount,
        });
      }

      moduleStats.sort((a, b) => b.keyCount - a.keyCount);

      return reply.send({
        totalKeys,
        totalModules: totalModules.size,
        totalFiles: totalFiles.size,
        totalUsages,
        moduleStats,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to get key usage stats" });
    }
  });

  // Get missing usage keys
  fastify.get("/api/key-usage/missing", async (request, reply) => {
    try {
      const missingUsageKeys = [];
      const allMetadataFiles = await findAllMetadataFiles();

      for (const file of allMetadataFiles) {
        if (!file.data || !file.data.usage || file.data.usage.length === 0) {
          const fullKey =
            file.namespace && file.namespace !== "Common"
              ? `${file.namespace}:${file.key}`
              : file.key;

          missingUsageKeys.push(fullKey);
        }
      }

      // Sort keys alphabetically
      missingUsageKeys.sort();

      return reply.send({
        keys: missingUsageKeys,
      });
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ error: "Failed to get missing usage keys" });
    }
  });
}

module.exports = keyUsageRoutes;
