const fsUtils = require('../utils/fsUtils');

/**
 * Translations route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get translations for a namespace
  fastify.get('/:projectName/:language/:namespace', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const translations = await fsUtils.readTranslationFile(projectName, language, namespace);
      
      if (translations === null) {
        return reply.code(404).send({ success: false, error: 'Translation file not found' });
      }
      
      return { success: true, data: translations };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to get translations' });
    }
  });

  // Update translations for a namespace
  fastify.put('/:projectName/:language/:namespace', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const translations = request.body;
      
      if (!translations || typeof translations !== 'object') {
        return reply.code(400).send({ success: false, error: 'Invalid translation data' });
      }
      
      const success = await fsUtils.writeTranslationFile(
        projectName,
        language,
        namespace,
        translations
      );
      
      if (!success) {
        return reply.code(500).send({ success: false, error: 'Failed to update translations' });
      }
      
      // Broadcast update to connected clients
      fastify.io.emit('translations:updated', { projectName, language, namespace });
      
      return { success: true, message: 'Translations updated successfully' };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to update translations' });
    }
  });

  // Update a single translation key
  fastify.put('/:projectName/:language/:namespace/key', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const { key, value, isAiTranslated = false } = request.body;
      
      if (!key || typeof key !== 'string') {
        return reply.code(400).send({ success: false, error: 'Key is required' });
      }
      
      // Get current translations
      const translations = await fsUtils.readTranslationFile(projectName, language, namespace);
      
      if (translations === null) {
        return reply.code(404).send({ success: false, error: 'Translation file not found' });
      }
      
      // Update the key path
      const keyParts = key.split('.');
      let current = translations;
      
      // Create or navigate to nested objects
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        
        if (!current[part] || typeof current[part] !== 'object') {
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
        console.log(`Key ${key} in ${projectName}/${language}/${namespace} was translated by AI`);
      }
      
      // Write back the updated translations
      const success = await fsUtils.writeTranslationFile(
        projectName,
        language,
        namespace,
        translations
      );
      
      if (!success) {
        return reply.code(500).send({ success: false, error: 'Failed to update translation key' });
      }
      
      // Broadcast update to connected clients
      fastify.io.emit('translation:updated', { projectName, language, namespace, key });
      
      return { success: true, message: 'Translation key updated successfully' };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to update translation key' });
    }
  });
}

module.exports = routes;
