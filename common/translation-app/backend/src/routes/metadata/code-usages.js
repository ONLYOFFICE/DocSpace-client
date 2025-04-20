/**
 * Routes for managing code usages for translations
 */
const { codeUsages } = require('../../db/repository');

/**
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get code usages for a specific translation key
  fastify.get('/:projectName/:namespace/key', async (request, reply) => {
    try {
      const { projectName, namespace } = request.params;
      const { keyPath } = request.query;
      
      if (!keyPath) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Key path is required' 
        });
      }
      
      const usages = codeUsages.findByTranslationKey(
        projectName, namespace, keyPath
      );
      
      return { 
        success: true, 
        data: usages 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get code usages' 
      });
    }
  });
  
  // Add a code usage reference
  fastify.post('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { 
        namespace, 
        keyPath, 
        filePath, 
        lineNumber, 
        context 
      } = request.body;
      
      if (!namespace || !keyPath || !filePath || lineNumber === undefined) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Missing required fields: namespace, keyPath, filePath, lineNumber' 
        });
      }
      
      const usage = codeUsages.addUsage(
        projectName,
        namespace,
        keyPath,
        filePath,
        lineNumber,
        context
      );
      
      return { 
        success: true, 
        data: usage,
        message: 'Code usage added successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to add code usage' 
      });
    }
  });
  
  // Bulk add code usages from scan results
  fastify.post('/:projectName/bulk', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { usages } = request.body;
      
      if (!Array.isArray(usages) || usages.length === 0) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Usages must be a non-empty array' 
        });
      }
      
      // Format the usages array to add projectName
      const formattedUsages = usages.map(usage => ({
        ...usage,
        projectName
      }));
      
      const count = codeUsages.bulkAddUsages(formattedUsages);
      
      // If this was a full scan, remove old usages
      if (request.body.isFullScan) {
        const cutoffDate = new Date();
        cutoffDate.setMinutes(cutoffDate.getMinutes() - 10); // 10 minutes ago
        
        const deletedCount = codeUsages.deleteOutdatedUsages(projectName, cutoffDate);
        
        return { 
          success: true, 
          data: {
            addedCount: count,
            deletedCount
          },
          message: `Added ${count} code usages and removed ${deletedCount} outdated references` 
        };
      }
      
      return { 
        success: true, 
        data: { addedCount: count },
        message: `Added ${count} code usages successfully` 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to add code usages in bulk' 
      });
    }
  });
  
  // Get all code usages for a project
  fastify.get('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      
      const projectUsages = codeUsages.getProjectUsages(projectName);
      
      return { 
        success: true, 
        data: projectUsages 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get project code usages' 
      });
    }
  });
  
  // Get code usage statistics for a project
  fastify.get('/:projectName/stats', async (request, reply) => {
    try {
      const { projectName } = request.params;
      
      const stats = codeUsages.getUsageStatistics(projectName);
      
      return { 
        success: true, 
        data: stats 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get code usage statistics' 
      });
    }
  });
  
  // Delete a specific code usage
  fastify.delete('/:usageId', async (request, reply) => {
    try {
      const { usageId } = request.params;
      
      const success = codeUsages.delete(usageId);
      
      if (!success) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Code usage not found or could not be deleted' 
        });
      }
      
      return { 
        success: true, 
        message: 'Code usage deleted successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to delete code usage' 
      });
    }
  });
}

module.exports = routes;
