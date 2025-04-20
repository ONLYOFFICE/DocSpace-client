/**
 * Routes for managing Figma references for translations
 */
const { figmaReferences, history } = require('../../db/repository');

/**
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get Figma references for a specific translation key
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
      
      const references = figmaReferences.findByTranslationKey(
        projectName, language, namespace, keyPath
      );
      
      return { 
        success: true, 
        data: references 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get Figma references' 
      });
    }
  });
  
  // Add a Figma reference to a translation key
  fastify.post('/:projectName/:language/:namespace/key', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const { 
        keyPath, 
        figmaFileKey, 
        figmaNodeId, 
        componentName, 
        screenName, 
        thumbnailUrl,
        userId,
        userName
      } = request.body;
      
      if (!keyPath || !figmaFileKey || !figmaNodeId) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Missing required fields: keyPath, figmaFileKey, figmaNodeId' 
        });
      }
      
      const newReference = figmaReferences.addReference(
        projectName, 
        language, 
        namespace, 
        keyPath, 
        {
          figmaFileKey,
          figmaNodeId,
          componentName,
          screenName,
          thumbnailUrl
        }
      );
      
      // Record the activity in history
      if (userId && userName) {
        history.recordChange(
          projectName,
          language,
          namespace,
          keyPath,
          'figma_reference_added',
          null,
          `Figma reference added: ${figmaFileKey}/${figmaNodeId}`,
          userId,
          userName
        );
      }
      
      // Broadcast update to connected clients
      fastify.io.emit('figma:reference_added', { 
        projectName, 
        language, 
        namespace, 
        keyPath,
        reference: newReference
      });
      
      return { 
        success: true, 
        data: newReference,
        message: 'Figma reference added successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to add Figma reference' 
      });
    }
  });
  
  // Delete a Figma reference
  fastify.delete('/:referenceId', async (request, reply) => {
    try {
      const { referenceId } = request.params;
      
      // Get the reference first to capture details for the history
      const reference = figmaReferences.getById(referenceId);
      
      if (!reference) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Figma reference not found' 
        });
      }
      
      // Delete the reference
      const success = figmaReferences.delete(referenceId);
      
      if (!success) {
        return reply.code(500).send({ 
          success: false, 
          error: 'Failed to delete Figma reference' 
        });
      }
      
      // Broadcast update to connected clients
      fastify.io.emit('figma:reference_deleted', { referenceId });
      
      return { 
        success: true, 
        message: 'Figma reference deleted successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to delete Figma reference' 
      });
    }
  });
  
  // Get all Figma references for a project
  fastify.get('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      
      const projectReferences = figmaReferences.getProjectReferences(projectName);
      
      return { 
        success: true, 
        data: projectReferences 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get project Figma references' 
      });
    }
  });
  
  // Get all references by Figma file key
  fastify.get('/file/:figmaFileKey', async (request, reply) => {
    try {
      const { figmaFileKey } = request.params;
      
      const fileReferences = figmaReferences.getReferencesByFigmaFile(figmaFileKey);
      
      return { 
        success: true, 
        data: fileReferences 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get Figma file references' 
      });
    }
  });
  
  // Update thumbnail URL for a reference
  fastify.put('/:referenceId/thumbnail', async (request, reply) => {
    try {
      const { referenceId } = request.params;
      const { thumbnailUrl } = request.body;
      
      if (!thumbnailUrl) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Thumbnail URL is required' 
        });
      }
      
      const reference = figmaReferences.getById(referenceId);
      
      if (!reference) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Figma reference not found' 
        });
      }
      
      const updatedReference = figmaReferences.updateThumbnail(referenceId, thumbnailUrl);
      
      // Broadcast update to connected clients
      fastify.io.emit('figma:thumbnail_updated', { 
        referenceId, 
        thumbnailUrl 
      });
      
      return { 
        success: true, 
        data: updatedReference,
        message: 'Thumbnail updated successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to update thumbnail URL' 
      });
    }
  });
}

module.exports = routes;
