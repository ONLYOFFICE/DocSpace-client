const fsUtils = require("../utils/fsUtils");
const { translationConfig } = require("../config/config");

/**
 * Namespaces route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get all namespaces for a project and language
  fastify.get("/:projectName/:language", async (request, reply) => {
    try {
      const { projectName, language } = request.params;
      const { untranslatedOnly, baseLanguage } = request.query;
      
      // Parse boolean query parameter
      const showUntranslatedOnly = untranslatedOnly === 'true';
      
      // Options for the getNamespaces function
      const options = {
        untranslatedOnly: showUntranslatedOnly,
        baseLanguage: baseLanguage || translationConfig.baseLanguage
      };
      
      const namespaces = await fsUtils.getNamespaces(projectName, language, options);

      return { success: true, data: namespaces };
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ success: false, error: "Failed to get namespaces" });
    }
  });

  // Create a new namespace
  fastify.post("/:projectName", async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { namespace, content } = request.body;

      if (!namespace || typeof namespace !== "string") {
        return reply
          .code(400)
          .send({ success: false, error: "Namespace name is required" });
      }

      // Create the namespace file for the base language first
      const baseLanguage = translationConfig.baseLanguage;
      const initialContent = content || {};

      const success = await fsUtils.writeTranslationFile(
        projectName,
        baseLanguage,
        namespace,
        initialContent
      );

      if (!success) {
        return reply
          .code(500)
          .send({ success: false, error: "Failed to create namespace" });
      }

      // Create empty namespace files for all other languages
      const languages = await fsUtils.getAvailableLanguages(projectName);

      for (const language of languages) {
        if (language !== baseLanguage) {
          await fsUtils.writeTranslationFile(
            projectName,
            language,
            namespace,
            {}
          );
        }
      }

      // Broadcast update to connected clients
      fastify.io.emit("namespace:created", { projectName, namespace });

      return {
        success: true,
        message: `Namespace ${namespace} created successfully`,
      };
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ success: false, error: "Failed to create namespace" });
    }
  });

  // Rename a namespace
  fastify.put("/:projectName/rename", async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { oldName, newName } = request.body;

      if (!oldName || typeof oldName !== "string") {
        return reply
          .code(400)
          .send({ success: false, error: "Old namespace name is required" });
      }

      if (!newName || typeof newName !== "string") {
        return reply
          .code(400)
          .send({ success: false, error: "New namespace name is required" });
      }

      await fsUtils.renameNamespace(projectName, oldName, newName);

      // Broadcast update to connected clients
      fastify.io.emit("namespace:renamed", { projectName, oldName, newName });

      return {
        success: true,
        message: `Namespace ${oldName} renamed to ${newName} successfully`,
      };
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({
          success: false,
          error: error.message || "Failed to rename namespace",
        });
    }
  });

  // Move a namespace to another namespace (potentially in a different project)
  fastify.put("/:projectName/move", async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { sourceNamespace, targetProjectName, targetNamespace } =
        request.body;

      if (!sourceNamespace || typeof sourceNamespace !== "string") {
        return reply
          .code(400)
          .send({ success: false, error: "Source namespace is required" });
      }

      if (!targetProjectName || typeof targetProjectName !== "string") {
        return reply
          .code(400)
          .send({ success: false, error: "Target project name is required" });
      }

      if (!targetNamespace || typeof targetNamespace !== "string") {
        return reply
          .code(400)
          .send({ success: false, error: "Target namespace is required" });
      }

      await fsUtils.moveNamespaceTo(
        projectName,
        sourceNamespace,
        targetProjectName,
        targetNamespace
      );

      // Broadcast update to connected clients
      fastify.io.emit("namespace:moved", {
        sourceProjectName: projectName,
        sourceNamespace,
        targetProjectName,
        targetNamespace,
      });

      return {
        success: true,
        message: `Namespace ${sourceNamespace} from project ${projectName} moved to ${targetNamespace} in project ${targetProjectName} successfully`,
      };
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({
          success: false,
          error: error.message || "Failed to move namespace",
        });
    }
  });

  // Delete a namespace
  fastify.delete("/:projectName/:namespace", async (request, reply) => {
    try {
      const { projectName, namespace } = request.params;

      if (!namespace || typeof namespace !== "string") {
        return reply
          .code(400)
          .send({ success: false, error: "Namespace name is required" });
      }

      await fsUtils.deleteNamespace(projectName, namespace);

      // Broadcast update to connected clients
      fastify.io.emit("namespace:deleted", { projectName, namespace });

      return {
        success: true,
        message: `Namespace ${namespace} deleted successfully`,
      };
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({
          success: false,
          error: error.message || "Failed to delete namespace",
        });
    }
  });
}

module.exports = routes;
