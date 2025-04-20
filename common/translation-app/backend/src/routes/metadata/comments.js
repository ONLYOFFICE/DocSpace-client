/**
 * Routes for managing translation comments
 */
const { comments, history } = require('../../db/repository');

/**
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get comments for a specific translation key
  fastify.get('/:projectName/:language/:namespace/key', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const { keyPath, threaded = true } = request.query;
      
      if (!keyPath) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Key path is required' 
        });
      }
      
      let commentsList;
      
      // If threaded=true, return comments in thread structure
      if (threaded === true || threaded === 'true') {
        commentsList = comments.getThreadStructure(
          projectName, language, namespace, keyPath
        );
      } else {
        commentsList = comments.findByTranslationKey(
          projectName, language, namespace, keyPath
        );
      }
      
      return { 
        success: true, 
        data: commentsList 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get comments' 
      });
    }
  });
  
  // Add a comment to a translation key
  fastify.post('/:projectName/:language/:namespace/key', async (request, reply) => {
    try {
      const { projectName, language, namespace } = request.params;
      const { 
        keyPath, 
        text, 
        userId, 
        userName, 
        parentId = null 
      } = request.body;
      
      if (!keyPath || !text || !userId || !userName) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Missing required fields: keyPath, text, userId, userName' 
        });
      }
      
      const newComment = comments.addComment(
        projectName, 
        language, 
        namespace, 
        keyPath, 
        {
          text,
          userId,
          userName,
          parentId
        }
      );
      
      // Record the comment activity in history
      history.recordChange(
        projectName,
        language,
        namespace,
        keyPath,
        'comment',
        null,
        text,
        userId,
        userName
      );
      
      // Broadcast update to connected clients
      fastify.io.emit('comment:added', { 
        projectName, 
        language, 
        namespace, 
        keyPath,
        comment: newComment
      });
      
      return { 
        success: true, 
        data: newComment,
        message: 'Comment added successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to add comment' 
      });
    }
  });
  
  // Delete a comment
  fastify.delete('/:commentId', async (request, reply) => {
    try {
      const { commentId } = request.params;
      
      // Get the comment first to capture details for the history
      const comment = comments.getById(commentId);
      
      if (!comment) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Comment not found' 
        });
      }
      
      // Delete the comment
      const success = comments.delete(commentId);
      
      if (!success) {
        return reply.code(500).send({ 
          success: false, 
          error: 'Failed to delete comment' 
        });
      }
      
      // Broadcast update to connected clients
      fastify.io.emit('comment:deleted', { commentId });
      
      return { 
        success: true, 
        message: 'Comment deleted successfully' 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to delete comment' 
      });
    }
  });
  
  // Get recent comments for a project
  fastify.get('/:projectName/recent', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { limit = 20 } = request.query;
      
      const recentComments = comments.getRecentComments(
        projectName, 
        parseInt(limit)
      );
      
      return { 
        success: true, 
        data: recentComments 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get recent comments' 
      });
    }
  });
}

module.exports = routes;
