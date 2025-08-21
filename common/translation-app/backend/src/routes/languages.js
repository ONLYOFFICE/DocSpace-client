const fsUtils = require('../utils/fsUtils');
const { translationConfig } = require('../config/config');

/**
 * Languages route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get all languages for a project
  fastify.get('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const languages = await fsUtils.getAvailableLanguages(projectName);
      
      return { 
        success: true, 
        data: {
          languages,
          baseLanguage: translationConfig.baseLanguage
        } 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to get languages' });
    }
  });

  // Add a new language to a project
  fastify.post('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { language } = request.body;
      
      if (!language || typeof language !== 'string') {
        return reply.code(400).send({ success: false, error: 'Language code is required' });
      }
      
      const success = await fsUtils.createLanguageFolder(projectName, language);
      
      if (!success) {
        return reply.code(500).send({ success: false, error: 'Failed to create language folder' });
      }
      
      // Broadcast update to connected clients
      fastify.io.emit('language:created', { projectName, language });
      
      return { success: true, message: `Language ${language} created successfully` };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to add language' });
    }
  });
}

module.exports = routes;
