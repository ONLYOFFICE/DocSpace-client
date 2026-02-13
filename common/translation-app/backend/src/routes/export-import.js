const fs = require("fs-extra");
const path = require("path");
const fsUtils = require("../utils/fsUtils");

/**
 * Export and import routes for translation files
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Export untranslated keys for a specific language
  fastify.get("/export/:projectName/:language", async (request, reply) => {
    try {
      const { projectName, language } = request.params;
      const { baseLanguage = "en", exportAll = false } = request.query;

      // Convert exportAll from string to boolean
      const shouldExportAll = exportAll === "true" || exportAll === true;

      // Validate language exists
      const languages = await fsUtils.getAvailableLanguages(projectName);
      if (!languages.includes(language)) {
        return reply.code(404).send({
          success: false,
          error: `Language '${language}' not found in project '${projectName}'`,
        });
      }

      // Validate base language exists
      if (!languages.includes(baseLanguage)) {
        return reply.code(404).send({
          success: false,
          error: `Base language '${baseLanguage}' not found in project '${projectName}'`,
        });
      }

      // Get all namespaces for the project
      const namespaces = await fsUtils.getNamespaces(projectName, baseLanguage);

      // Initialize result object
      const exportData = {
        projectName,
        language,
        baseLanguage,
        untranslatedKeys: {},
        metadata: {}, // Add metadata section for all keys
      };

      // For each namespace, find untranslated keys
      for (const namespace of namespaces) {
        // Read translation files for base and target languages
        const baseTranslations = await fsUtils.readTranslationFile(
          projectName,
          baseLanguage,
          namespace
        );

        const targetTranslations = await fsUtils.readTranslationFile(
          projectName,
          language,
          namespace
        );

        if (!baseTranslations) {
          continue; // Skip if base translations not found
        }

        // Fetch all metadata for this namespace
        try {
          const metadataFiles = await fsUtils.findNamespaceMetadataFiles(
            projectName,
            namespace
          );
          if (metadataFiles && metadataFiles.length > 0) {
            // Initialize namespace in metadata section
            exportData.metadata[namespace] = {};

            // Add each metadata file's content
            for (const metaFile of metadataFiles) {
              if (metaFile.data && metaFile.filePath) {
                // Extract key path from file path
                const fileName = path.basename(metaFile.filePath, ".json");
                exportData.metadata[namespace][fileName] = {
                  comment: metaFile.data?.comment?.text || "",
                };
              }
            }
          }
        } catch (error) {
          console.error(
            `Error fetching metadata for namespace ${namespace}:`,
            error
          );
        }

        const untranslatedKeys = {};
        let hasUntranslatedKeys = false;

        // Helper function to recursively find keys (untranslated or all based on shouldExportAll)
        const findUntranslatedKeys = async (baseObj, targetObj, path = "") => {
          for (const key in baseObj) {
            const currentPath = path ? `${path}.${key}` : key;

            // Skip if base value is empty or null
            if (baseObj[key] === null || baseObj[key] === "") continue;

            // If nested object, recurse
            if (typeof baseObj[key] === "object" && baseObj[key] !== null) {
              const nestedTarget =
                targetObj && typeof targetObj === "object"
                  ? targetObj[key]
                  : {};
              await findUntranslatedKeys(
                baseObj[key],
                nestedTarget,
                currentPath
              );
            }
            // If string value in base language
            else if (typeof baseObj[key] === "string") {
              // Check if key exists and is not empty in target language
              const isUntranslated =
                !targetObj ||
                !(key in targetObj) ||
                targetObj[key] === null ||
                targetObj[key] === "";

              // Include key if it's untranslated or if we're exporting all keys
              if (isUntranslated || shouldExportAll) {
                // Get metadata for this key from our pre-collected metadata
                let comment = "";

                // Check if we already have metadata for this key
                if (
                  exportData.metadata[namespace] &&
                  exportData.metadata[namespace][currentPath]
                ) {
                  comment =
                    exportData.metadata[namespace][currentPath].comment || "";
                } else {
                  // Fallback to fetching metadata directly if not found in pre-collected metadata
                  try {
                    const metadata = await fsUtils.findMetadataFile(
                      projectName,
                      namespace,
                      currentPath
                    );

                    if (metadata && metadata.data) {
                      comment = metadata.data.context || "";

                      // Add to our metadata collection for future reference
                      if (!exportData.metadata[namespace]) {
                        exportData.metadata[namespace] = {};
                      }
                      exportData.metadata[namespace][currentPath] = {
                        comment,
                      };
                    }
                  } catch (error) {
                    console.error(
                      `Error fetching metadata for ${currentPath}:`,
                      error
                    );
                  }
                }

                // Add to untranslated keys
                if (!untranslatedKeys[namespace]) {
                  untranslatedKeys[namespace] = {};
                }

                untranslatedKeys[namespace][currentPath] = {
                  baseValue: baseObj[key],
                  targetValue:
                    targetObj && key in targetObj ? targetObj[key] : "",
                  comment,
                };

                hasUntranslatedKeys = true;
              }
            }
          }
        };

        await findUntranslatedKeys(baseTranslations, targetTranslations);

        // Only add namespace if it has untranslated keys
        if (hasUntranslatedKeys) {
          exportData.untranslatedKeys[namespace] = untranslatedKeys[namespace];
        }
      }

      // Check if there are any untranslated keys
      const hasUntranslatedKeys =
        Object.keys(exportData.untranslatedKeys).length > 0;

      if (!hasUntranslatedKeys) {
        return reply.code(500).send({
          success: false,
          error: `No untranslated keys found for language '${language}' in project '${projectName}'`,
        });
      }

      exportData.metadata = undefined;

      // Set filename for download
      const fileType = shouldExportAll ? "all-keys" : "untranslated-keys";
      const filename = `${projectName}-${fileType}-from-${baseLanguage}-to-${language}.json`;

      // Set headers for file download
      reply.header("Content-Disposition", `attachment; filename=${filename}`);
      reply.header("Content-Type", "application/json");

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      request.log.error(error);
      const errorType = shouldExportAll ? "all keys" : "untranslated keys";
      return reply.code(500).send({
        success: false,
        error: `Failed to export ${errorType}`,
      });
    }
  });

  // Import translated keys
  fastify.post("/import", async (request, reply) => {
    try {
      const importData = request.body;

      if (
        !importData ||
        !importData.projectName ||
        !importData.language ||
        !importData.baseLanguage ||
        !importData.untranslatedKeys
      ) {
        return reply.code(400).send({
          success: false,
          error:
            "Missing required fields: projectName, language, baseLanguage, and untranslatedKeys",
        });
      }

      // Validate import data structure
      if (
        !importData.untranslatedKeys ||
        typeof importData.untranslatedKeys !== "object"
      ) {
        return reply.code(400).send({
          success: false,
          error: "Invalid import data format",
        });
      }

      const projectName = importData.projectName;
      const language = importData.language;

      const results = {
        success: true,
        updated: 0,
        errors: [],
        namespaces: [],
      };

      // Process each namespace in the import data
      for (const namespace in importData.untranslatedKeys) {
        const namespaceData = importData.untranslatedKeys[namespace];

        // Read current translations for this namespace
        const currentTranslations = await fsUtils.readTranslationFile(
          projectName,
          language,
          namespace
        );

        if (!currentTranslations) {
          results.errors.push(`Namespace '${namespace}' not found in project`);
          continue;
        }

        let namespaceUpdated = false;

        // Update each key in the namespace
        for (const keyPath in namespaceData) {
          const importedData = namespaceData[keyPath];

          // Skip if no target value provided
          if (!importedData.targetValue || importedData.targetValue === "") {
            continue;
          }

          // Update the key in the translations object
          const keyParts = keyPath.split(".");
          let current = currentTranslations;

          // Navigate to nested objects
          for (let i = 0; i < keyParts.length - 1; i++) {
            const part = keyParts[i];

            if (!current[part] || typeof current[part] !== "object") {
              current[part] = {};
            }

            current = current[part];
          }

          // Set the value at the final key
          const finalKey = keyParts[keyParts.length - 1];
          current[finalKey] = importedData.targetValue;

          results.updated++;
          namespaceUpdated = true;
        }

        // Write back the updated translations if any changes were made
        if (namespaceUpdated) {
          const success = await fsUtils.writeTranslationFile(
            projectName,
            language,
            namespace,
            currentTranslations
          );

          if (success) {
            results.namespaces.push(namespace);
          } else {
            results.errors.push(`Failed to update namespace '${namespace}'`);
          }
        }
      }

      // Broadcast update to connected clients
      if (results.updated > 0) {
        fastify.io.emit("translations:bulk-updated", {
          projectName,
          language,
          namespaces: results.namespaces,
        });
      }

      return {
        success: true,
        message: `Successfully imported ${results.updated} translations`,
        details: results,
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to import translations",
      });
    }
  });
}

module.exports = routes;
