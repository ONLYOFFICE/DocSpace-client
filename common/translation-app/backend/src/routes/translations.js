const fsUtils = require("../utils/fsUtils");
const statsUtils = require("../utils/statsUtils");

/**
 * Translations route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get translation statistics for all projects
  fastify.get("/stats", async (request, reply) => {
    try {
      const stats = await statsUtils.getAllProjectsTranslationStats();
      return { success: true, data: stats };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to get translation statistics",
      });
    }
  });

  // Get translation statistics for a specific project
  fastify.get("/stats/:projectName", async (request, reply) => {
    try {
      const { projectName } = request.params;
      const stats = await statsUtils.getProjectTranslationStats(projectName);
      return { success: true, data: stats };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to get translation statistics",
      });
    }
  });

  // Get translations for a namespace
  fastify.get("/:projectName/:language/:namespace", async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const translations = await fsUtils.readTranslationFile(
        projectName,
        language,
        namespace
      );

      if (translations === null) {
        return reply
          .code(404)
          .send({ success: false, error: "Translation file not found" });
      }

      return { success: true, data: translations };
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ success: false, error: "Failed to get translations" });
    }
  });

  // Update translations for a namespace
  fastify.put("/:projectName/:language/:namespace", async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const translations = request.body;

      if (!translations || typeof translations !== "object") {
        return reply
          .code(400)
          .send({ success: false, error: "Invalid translation data" });
      }

      const success = await fsUtils.writeTranslationFile(
        projectName,
        language,
        namespace,
        translations
      );

      if (!success) {
        return reply
          .code(500)
          .send({ success: false, error: "Failed to update translations" });
      }

      // Broadcast update to connected clients
      fastify.io.emit("translations:updated", {
        projectName,
        language,
        namespace,
      });

      return { success: true, message: "Translations updated successfully" };
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ success: false, error: "Failed to update translations" });
    }
  });

  // Update a single translation key
  fastify.put(
    "/:projectName/:language/:namespace/key",
    async (request, reply) => {
      try {
        const { projectName, language, namespace } = request.params;
        const { key, value, isAiTranslated = false } = request.body;

        if (!key || typeof key !== "string") {
          return reply
            .code(400)
            .send({ success: false, error: "Key is required" });
        }

        // Get current translations
        const translations = await fsUtils.readTranslationFile(
          projectName,
          language,
          namespace
        );

        if (translations === null) {
          return reply
            .code(404)
            .send({ success: false, error: "Translation file not found" });
        }

        // Update the key path
        const keyParts = key.split(".");
        let current = translations;

        // Create or navigate to nested objects
        for (let i = 0; i < keyParts.length - 1; i++) {
          const part = keyParts[i];

          if (!current[part] || typeof current[part] !== "object") {
            current[part] = {};
          }

          current = current[part];
        }

        // Set the value at the final key
        const finalKey = keyParts[keyParts.length - 1];
        current[finalKey] = value;

        // Optional: Store metadata about AI translation if needed
        // This can be expanded to store more metadata in the future
        if (isAiTranslated) {
          // One approach is to store metadata in a separate file
          // For now we'll just log it
          console.log(
            `Key ${key} in ${projectName}/${language}/${namespace} was translated by AI`
          );
        }

        // Write back the updated translations
        const success = await fsUtils.writeTranslationFile(
          projectName,
          language,
          namespace,
          translations
        );

        if (!success) {
          return reply.code(500).send({
            success: false,
            error: "Failed to update translation key",
          });
        }

        // Broadcast update to connected clients
        fastify.io.emit("translation:updated", {
          projectName,
          language,
          namespace,
          targetLanguage: language,
          key,
          value,
        });

        return {
          success: true,
          message: "Translation key updated successfully",
        };
      } catch (error) {
        request.log.error(error);
        return reply
          .code(500)
          .send({ success: false, error: "Failed to update translation key" });
      }
    }
  );

  // Rename a translation key
  fastify.put("/:projectName/rename-key", async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { namespace, oldKeyPath, newKeyPath } = request.body;

      if (!namespace || !oldKeyPath || !newKeyPath) {
        return reply.code(400).send({
          success: false,
          error: "Namespace, oldKeyPath, and newKeyPath are required",
        });
      }

      // Get available languages
      const languages = await fsUtils.getAvailableLanguages(projectName);

      if (!languages.length) {
        return reply.code(404).send({
          success: false,
          error: "No languages found for project",
        });
      }

      // Update key in all language files
      const results = await Promise.all(
        languages.map(async (language) => {
          // Read the translation file
          const translations = await fsUtils.readTranslationFile(
            projectName,
            language,
            namespace
          );

          if (!translations) return { language, success: false };

          // Find and rename the key
          let success = false;
          const oldKeyParts = oldKeyPath.split(".");
          const newKeyParts = newKeyPath.split(".");

          // Get the value from old key
          let value = translations;
          for (const part of oldKeyParts) {
            if (!value || typeof value !== "object" || !(part in value)) {
              return { language, success: false };
            }
            value = value[part];
          }

          if (value === undefined) {
            return { language, success: false };
          }

          // Create a deep clone of translations
          const updatedTranslations = JSON.parse(JSON.stringify(translations));

          // Set the value at the new key path
          let current = updatedTranslations;
          for (let i = 0; i < newKeyParts.length - 1; i++) {
            const part = newKeyParts[i];
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
          current[newKeyParts[newKeyParts.length - 1]] = value;

          // Remove the old key path
          current = updatedTranslations;
          for (let i = 0; i < oldKeyParts.length - 1; i++) {
            const part = oldKeyParts[i];
            if (!current[part]) break;
            current = current[part];
          }
          delete current[oldKeyParts[oldKeyParts.length - 1]];

          // Write updated translations back to file
          success = await fsUtils.writeTranslationFile(
            projectName,
            language,
            namespace,
            updatedTranslations
          );

          return { language, success };
        })
      );

      const allSucceeded = results.every((r) => r.success);

      if (!allSucceeded) {
        const failedLanguages = results
          .filter((r) => !r.success)
          .map((r) => r.language);
        return reply.code(500).send({
          success: false,
          error: `Failed to rename key in languages: ${failedLanguages.join(
            ", "
          )}`,
        });
      }

      // Broadcast update to connected clients
      fastify.io.emit("translation:key-renamed", {
        projectName,
        namespace,
        oldKeyPath,
        newKeyPath,
      });

      return {
        success: true,
        message: "Translation key renamed successfully in all languages",
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to rename translation key",
      });
    }
  });

  // Move a translation key to another namespace
  fastify.put("/:projectName/move-key", async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { sourceNamespace, targetProjectName, targetNamespace, keyPath } =
        request.body;

      if (
        !sourceNamespace ||
        !targetProjectName ||
        !targetNamespace ||
        !keyPath
      ) {
        return reply.code(400).send({
          success: false,
          error:
            "sourceNamespace, targetProjectName, targetNamespace, and keyPath are required",
        });
      }

      // Move key to another namespace
      const success = await fsUtils.moveKeyToNamespace(
        projectName,
        sourceNamespace,
        targetProjectName,
        targetNamespace,
        keyPath
      );

      // Broadcast update to connected clients
      fastify.io.emit("translation:key-moved", {
        sourceProjectName: projectName,
        sourceNamespace,
        targetProjectName,
        targetNamespace,
        keyPath,
      });

      return {
        success,
        message: "Translation key moved successfully",
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to move translation key",
      });
    }
  });

  // Delete a translation key
  fastify.delete(
    "/:projectName/:namespace/key/:keyPath",
    async (request, reply) => {
      try {
        const { projectName, namespace, keyPath } = request.params;

        if (!keyPath) {
          return reply.code(400).send({
            success: false,
            error: "keyPath is required",
          });
        }

        // Get available languages
        const languages = await fsUtils.getAvailableLanguages(projectName);

        if (!languages.length) {
          return reply.code(404).send({
            success: false,
            error: "No languages found for project",
          });
        }

        // Delete key in all language files
        const results = await Promise.all(
          languages.map(async (language) => {
            // Read the translation file
            const translations = await fsUtils.readTranslationFile(
              projectName,
              language,
              namespace
            );

            if (!translations) return { language, success: false };

            // Create a deep clone of translations
            const updatedTranslations = JSON.parse(
              JSON.stringify(translations)
            );

            // Remove the key
            const keyParts = keyPath.split(".");
            let current = updatedTranslations;

            for (let i = 0; i < keyParts.length - 1; i++) {
              const part = keyParts[i];
              if (!current[part] || typeof current[part] !== "object") {
                // Key path doesn't exist, consider it a success
                return { language, success: true };
              }
              current = current[part];
            }

            const lastKey = keyParts[keyParts.length - 1];

            if (!(lastKey in current)) {
              // Key doesn't exist, consider it a success
              return { language, success: true };
            }

            // Delete the key
            delete current[lastKey];

            // Write updated translations back to file
            const success = await fsUtils.writeTranslationFile(
              projectName,
              language,
              namespace,
              updatedTranslations
            );

            return { language, success };
          })
        );

        const allSucceeded = results.every((r) => r.success);

        if (!allSucceeded) {
          const failedLanguages = results
            .filter((r) => !r.success)
            .map((r) => r.language);
          return reply.code(500).send({
            success: false,
            error: `Failed to delete key in languages: ${failedLanguages.join(
              ", "
            )}`,
          });
        }

        // remove .meta file for this key
        fsUtils.removeMetaFile(projectName, namespace, keyPath);

        // Broadcast update to connected clients
        fastify.io.emit("translation:key-deleted", {
          projectName,
          namespace,
          keyPath,
        });

        return {
          success: true,
          message: "Translation key deleted successfully in all languages",
        };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          error: "Failed to delete translation key",
        });
      }
    }
  );
}

module.exports = routes;
