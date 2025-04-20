/**
 * Routes for managing translation approvals
 */
const { approvals, history } = require('../../db/repository');

/**
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get approval status for a specific translation key
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
      
      const approval = approvals.findForTranslationKey(
        projectName, language, namespace, keyPath
      );
      
      if (!approval) {
        return reply.code(404).send({ 
          success: false, 
          error: 'No approval record found for this key' 
        });
      }
      
      return { 
        success: true, 
        data: approval 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get approval status' 
      });
    }
  });
  
  // Set approval status for a translation key
  fastify.put('/:projectName/:language/:namespace/key', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const { 
        keyPath, 
        status, 
        reviewerId, 
        reviewerName, 
        comments 
      } = request.body;
      
      if (!keyPath || !status) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Missing required fields: keyPath, status' 
        });
      }
      
      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected', 'needs_review'];
      if (!validStatuses.includes(status)) {
        return reply.code(400).send({ 
          success: false, 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      
      const approval = approvals.setApprovalStatus(
        projectName,
        language,
        namespace,
        keyPath,
        {
          status,
          reviewerId,
          reviewerName,
          comments
        }
      );
      
      // Record the activity in history
      if (reviewerId && reviewerName) {
        history.recordChange(
          projectName,
          language,
          namespace,
          keyPath,
          `approval_${status}`,
          null,
          comments || `Translation ${status} by ${reviewerName}`,
          reviewerId,
          reviewerName
        );
      }
      
      // Broadcast update to connected clients
      fastify.io.emit('approval:updated', { 
        projectName, 
        language, 
        namespace, 
        keyPath,
        status,
        reviewerName
      });
      
      return { 
        success: true, 
        data: approval,
        message: `Approval status set to ${status} successfully` 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to set approval status' 
      });
    }
  });
  
  // Get all approvals for a project and language
  fastify.get('/:projectName/:language', async (request, reply) => {
    try {
      const { projectName, language } = request.params;
      const { status } = request.query;
      
      const projectApprovals = approvals.getProjectApprovals(
        projectName, 
        language, 
        status || null
      );
      
      return { 
        success: true, 
        data: projectApprovals 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get project approvals' 
      });
    }
  });
  
  // Get pending approval counts for a reviewer
  fastify.get('/reviewer/:reviewerId/pending', async (request, reply) => {
    try {
      const { reviewerId } = request.params;
      
      const pendingCounts = approvals.getPendingApprovalCounts(reviewerId);
      
      return { 
        success: true, 
        data: pendingCounts 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get pending approval counts' 
      });
    }
  });
  
  // Get approval statistics for a project and language
  fastify.get('/:projectName/:language/stats', async (request, reply) => {
    try {
      const { projectName, language } = request.params;
      
      const stats = approvals.getApprovalStatistics(projectName, language);
      
      return { 
        success: true, 
        data: stats 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get approval statistics' 
      });
    }
  });
}

module.exports = routes;
