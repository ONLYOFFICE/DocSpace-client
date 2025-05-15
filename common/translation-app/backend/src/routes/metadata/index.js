/**
 * Main entry point for metadata routes
 */
const translationsMetadataRoutes = require("./translations-metadata");
const commentsRoutes = require("./comments");
const figmaRoutes = require("./figma");
const codeUsagesRoutes = require("./code-usages");
const approvalsRoutes = require("./approvals");
const historyRoutes = require("./history");

/**
 * Register all metadata related routes
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Register all metadata sub-routes
  fastify.register(translationsMetadataRoutes, { prefix: "/translations" });
  fastify.register(commentsRoutes, { prefix: "/comments" });
  fastify.register(figmaRoutes, { prefix: "/figma" });
  fastify.register(codeUsagesRoutes, { prefix: "/code-usages" });
  fastify.register(approvalsRoutes, { prefix: "/approvals" });
  fastify.register(historyRoutes, { prefix: "/history" });
}

module.exports = routes;
