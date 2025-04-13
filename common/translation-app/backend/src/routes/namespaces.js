const fsUtils = require('../utils/fsUtils');
const { translationConfig } = require('../config/config');

/**
 * Namespaces route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get all namespaces for a project and language
  fastify.get('/:projectName/:language', async (request, reply) => {
    try {
      const { projectName, language } = request.params;
      const namespaces = await fsUtils.getNamespaces(projectName, language);
      
      return { success: true, data: namespaces };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to get namespaces' });
    }
  });

  // Create a new namespace
  fastify.post('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { namespace, content } = request.body;
      
      if (!namespace || typeof namespace !== 'string') {
        return reply.code(400).send({ success: false, error: 'Namespace name is required' });
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
        return reply.code(500).send({ success: false, error: 'Failed to create namespace' });
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
      fastify.io.emit('namespace:created', { projectName, namespace });
      
      return { success: true, message: `Namespace ${namespace} created successfully` };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to create namespace' });
    }
  });
}

module.exports = routes;
