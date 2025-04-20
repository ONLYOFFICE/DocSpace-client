/**
 * Routes for managing translation history
 */
const { history } = require('../../db/repository');

/**
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get history for a specific translation key
  fastify.get('/:projectName/:language/:namespace/key', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const { keyPath, limit = 20 } = request.query;
      
      if (!keyPath) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Key path is required' 
        });
      }
      
      const translationHistory = history.getTranslationHistory(
        projectName,
        language,
        namespace,
        keyPath,
        parseInt(limit)
      );
      
      return { 
        success: true, 
        data: translationHistory 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get translation history' 
      });
    }
  });
  
  // Get recent changes for a project
  fastify.get('/:projectName/recent', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { language, limit = 50 } = request.query;
      
      const recentChanges = history.getRecentChanges(
        projectName,
        language || null,
        parseInt(limit)
      );
      
      return { 
        success: true, 
        data: recentChanges 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get recent changes' 
      });
    }
  });
  
  // Get change statistics for a project
  fastify.get('/:projectName/stats', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { language, days = 30 } = request.query;
      
      const changeStats = history.getChangeStatistics(
        projectName,
        language || null,
        parseInt(days)
      );
      
      return { 
        success: true, 
        data: changeStats 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get change statistics' 
      });
    }
  });
  
  // Add a history record manually
  fastify.post('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { 
        language, 
        namespace, 
        keyPath, 
        actionType, 
        previousValue, 
        newValue, 
        userId, 
        userName 
      } = request.body;
      
      if (!language || !namespace || !keyPath || !actionType) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Missing required fields: language, namespace, keyPath, actionType' 
        });
      }
      
      const historyRecord = history.recordChange(
        projectName,
        language,
        namespace,
        keyPath,
        actionType,
        previousValue || null,
        newValue || null,
        userId || null,
        userName || null
      );
      
      return { 
        success: true, 
        data: historyRecord,
        message: 'History record created successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to create history record' 
      });
    }
  });
  
  // Cleanup old history records (admin function)
  fastify.delete('/cleanup', async (request, reply) => {
    try {
      const { daysToKeep = 90 } = request.body;
      
      const deletedCount = history.cleanupOldRecords(parseInt(daysToKeep));
      
      return { 
        success: true, 
        data: { deletedCount },
        message: `Deleted ${deletedCount} old history records successfully` 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to cleanup history records' 
      });
    }
  });
}

module.exports = routes;
