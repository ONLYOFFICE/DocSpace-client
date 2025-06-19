/**
 * Routes for managing translations metadata using file-based storage
 */
const path = require("path");
const fs = require("fs-extra");
const appRootPath = require("app-root-path").toString();
const { projectLocalesMap } = require("../../config/config");

const {
  writeJsonWithConsistentEol,
  findMetadataFile,
  findNamespaceMetadataFiles,
} = require("../../utils/fsUtils");

/**
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get metadata for a specific translation key
  fastify.get(
    "/:projectName/:language/:namespace/key",
    async (request, reply) => {
      try {
        const { projectName, language, namespace } = request.params;
        const { keyPath } = request.query;

        if (!keyPath) {
          return reply.code(400).send({
            success: false,
            error: "Key path is required",
          });
        }

        const metadata = await findMetadataFile(
          projectName,
          namespace,
          keyPath
        );

        if (!metadata) {
          return reply.code(404).send({
            success: false,
            error: "Metadata not found for this key",
          });
        }

        return { success: true, data: metadata.data };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          error: "Failed to get translation metadata",
        });
      }
    }
  );

  // Get metadata for all keys in a namespace
  fastify.get("/:projectName/:language/:namespace", async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;

      const metadataFiles = await findNamespaceMetadataFiles(
        projectName,
        namespace
      );

      // Transform data for response
      const metadataList = metadataFiles.map((file) => file.data);

      return {
        success: true,
        data: metadataList,
        count: metadataList.length,
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to get namespace metadata",
      });
    }
  });

  // Update metadata for a specific key
  fastify.put(
    "/:projectName/:language/:namespace/key",
    async (request, reply) => {
      try {
        const { projectName, language, namespace } = request.params;
        const { keyPath } = request.query;
        const updates = request.body;

        if (!keyPath) {
          return reply.code(400).send({
            success: false,
            error: "Key path is required",
          });
        }

        if (!updates || typeof updates !== "object") {
          return reply.code(400).send({
            success: false,
            error: "Update data must be a valid object",
          });
        }

        // Check if metadata exists
        let metadata = await findMetadataFile(projectName, namespace, keyPath);

        if (!metadata) {
          // Create new metadata file
          const localesPath = projectLocalesMap[projectName];
          if (!localesPath) {
            return reply.code(404).send({
              success: false,
              error: `Project ${projectName} not found in configuration`,
            });
          }

          // Create directories if needed
          const projectPath = path.join(appRootPath, localesPath);
          const metaDir = path.join(projectPath, ".meta");
          const namespacePath = path.join(metaDir, namespace);

          await fs.ensureDir(namespacePath);

          const metadataFilePath = path.join(namespacePath, `${keyPath}.json`);

          // Initialize new metadata
          const newMetadata = {
            key_path: keyPath,
            namespace,
            project: projectName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: updates.status || "new",
            priority: updates.priority || "normal",
            context: updates.context || "",
            notes: updates.notes || "",
            usage: [],
          };

          await writeJsonWithConsistentEol(metadataFilePath, newMetadata);

          return {
            success: true,
            data: newMetadata,
            created: true,
          };
        } else {
          // Update existing metadata
          const updatedData = {
            ...metadata.data,
            ...updates,
            updated_at: new Date().toISOString(),
          };

          // Write updated metadata back to file
          await writeJsonWithConsistentEol(metadata.filePath, updatedData);

          return {
            success: true,
            data: updatedData,
            updated: true,
          };
        }
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          error: "Failed to update translation metadata",
        });
      }
    }
  );

  // Get all metadata
  fastify.get("/:projectName/:language", async (request, reply) => {
    try {
      const { projectName, language } = request.params;
      const allMetadata = [];

      // Get project path
      const localesPath = projectLocalesMap[projectName];
      if (!localesPath) {
        return reply.code(404).send({
          success: false,
          error: `Project ${projectName} not found in configuration`,
        });
      }

      const projectPath = path.join(appRootPath, localesPath);
      const metaDir = path.join(projectPath, ".meta");

      if (!(await fs.pathExists(metaDir))) {
        return { success: true, data: [], count: 0 };
      }

      // Get all namespace directories
      const namespaceDirs = await fs.readdir(metaDir);

      for (const namespace of namespaceDirs) {
        const namespacePath = path.join(metaDir, namespace);
        if (!(await fs.stat(namespacePath)).isDirectory()) continue;

        const metadataFiles = await findNamespaceMetadataFiles(
          projectName,
          namespace
        );
        const namespaceMetadata = metadataFiles.map((file) => file.data);
        allMetadata.push(...namespaceMetadata);
      }

      return {
        success: true,
        data: allMetadata,
        count: allMetadata.length,
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to get all metadata",
      });
    }
  });

  // Delete metadata for a key
  fastify.delete(
    "/:projectName/:language/:namespace/key",
    async (request, reply) => {
      try {
        const { projectName, language, namespace } = request.params;
        const { keyPath } = request.query;

        if (!keyPath) {
          return reply.code(400).send({
            success: false,
            error: "Key path is required",
          });
        }

        const metadata = await findMetadataFile(
          projectName,
          namespace,
          keyPath
        );

        if (!metadata) {
          return reply.code(404).send({
            success: false,
            error: "Metadata not found for this key",
          });
        }

        // Delete the file
        await fs.remove(metadata.filePath);

        return {
          success: true,
          message: `Metadata for key ${keyPath} deleted successfully`,
        };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          error: "Failed to delete translation metadata",
        });
      }
    }
  );
}

module.exports = routes;
