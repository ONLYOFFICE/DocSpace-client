/**
 * Routes for managing translations metadata
 */
const { translationsMetadata } = require('../../db/repository');

/**
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get metadata for a specific translation key
  fastify.get('/:projectName/:language/:namespace/key', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const { keyPath } = request.query;
      
      if (!keyPath) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Key path is required' 
        });
      }
      
      const metadata = translationsMetadata.findForTranslationKey(
        projectName, language, namespace, keyPath
      );
      
      if (!metadata) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Metadata not found for this key' 
        });
      }
      
      return { success: true, data: metadata };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get translation metadata' 
      });
    }
  });
  
  // Get metadata for all keys in a namespace
  fastify.get('/:projectName/:language/:namespace', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      
      const metadataList = translationsMetadata.findForNamespace(
        projectName, language, namespace
      );
      
      return { 
        success: true, 
        data: metadataList 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get namespace metadata' 
      });
    }
  });
  
  // Create or update metadata for a translation key
  fastify.put('/:projectName/:language/:namespace/key', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const { keyPath, status, priority, context, notes } = request.body;
      
      if (!keyPath) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Key path is required' 
        });
      }
      
      let metadata = translationsMetadata.findForTranslationKey(
        projectName, language, namespace, keyPath
      );
      
      if (metadata) {
        // Update existing metadata
        metadata = translationsMetadata.update(metadata.id, {
          status: status || metadata.status,
          priority: priority || metadata.priority,
          context: context !== undefined ? context : metadata.context,
          notes: notes !== undefined ? notes : metadata.notes,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new metadata
        metadata = translationsMetadata.create({
          project_name: projectName,
          language,
          namespace,
          key_path: keyPath,
          status: status || 'pending',
          priority: priority || 'normal',
          context,
          notes,
          ai_translated: 0
        });
      }
      
      // Broadcast update to connected clients
      fastify.io.emit('metadata:updated', { 
        projectName, 
        language, 
        namespace, 
        keyPath 
      });
      
      return { 
        success: true, 
        data: metadata,
        message: 'Metadata updated successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to update translation metadata' 
      });
    }
  });
  
  // Get all pending translations for a project
  fastify.get('/:projectName/pending', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { language } = request.query;
      
      const pendingTranslations = translationsMetadata.getPendingTranslations(
        projectName, language || null
      );
      
      return { 
        success: true, 
        data: pendingTranslations 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get pending translations' 
      });
    }
  });
  
  // Get all AI translated items for a project
  fastify.get('/:projectName/ai-translated', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { language } = request.query;
      
      const aiTranslatedItems = translationsMetadata.getAiTranslatedItems(
        projectName, language || null
      );
      
      return { 
        success: true, 
        data: aiTranslatedItems 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get AI translated items' 
      });
    }
  });
}

module.exports = routes;
