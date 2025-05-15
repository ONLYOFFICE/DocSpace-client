/**
 * Routes for managing translation comments using file-based metadata
 */
const path = require('path');
const fs = require('fs-extra');
const appRootPath = require('app-root-path').toString();
const { projectLocalesMap } = require('../../config/config');
const { writeJsonWithConsistentEol } = require('../../utils/fsUtils');

/**
 * Find metadata file for a specific key
 * @param {string} projectName - Project name
 * @param {string} namespace - Namespace
 * @param {string} keyPath - Key path
 * @returns {Promise<{filePath: string, data: object}>} Metadata file info
 */
async function findMetadataFile(projectName, namespace, keyPath) {
  const localesPath = projectLocalesMap[projectName];
  if (!localesPath) {
    throw new Error(`Project ${projectName} not found in configuration`);
  }
  
  const projectPath = path.join(appRootPath, localesPath);
  const metaDir = path.join(projectPath, '.meta');
  const namespacePath = path.join(metaDir, namespace);
  const metadataFilePath = path.join(namespacePath, `${keyPath}.json`);
  
  if (await fs.pathExists(metadataFilePath)) {
    const data = await fs.readJson(metadataFilePath);
    return { filePath: metadataFilePath, data };
  }
  
  return null;
}

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
      
      // Find the metadata file
      const metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata || !metadata.data) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      // Get comments from metadata
      const allComments = metadata.data.comments || [];
      
      let commentsList;
      
      // If threaded=true, return comments in thread structure
      if (threaded === true || threaded === 'true') {
        // Organize comments in thread structure
        const threadsMap = {};
        
        // First pass: collect top-level comments and initialize threads
        const topLevelComments = allComments.filter(comment => !comment.parentId);
        topLevelComments.forEach(comment => {
          threadsMap[comment.id] = {
            ...comment,
            replies: []
          };
        });
        
        // Second pass: organize replies
        allComments.filter(comment => comment.parentId).forEach(reply => {
          const parentThread = threadsMap[reply.parentId];
          if (parentThread) {
            parentThread.replies.push(reply);
          }
        });
        
        // Return thread structure
        commentsList = Object.values(threadsMap);
      } else {
        // Return flat list
        commentsList = allComments;
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
      
      // Find the metadata file
      let metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      if (!metadata.data.comments) {
        metadata.data.comments = [];
      }
      
      // Create new comment
      const newComment = {
        id: Date.now().toString(), // Use timestamp as ID
        text,
        userId,
        userName,
        parentId: parentId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add comment to metadata
      metadata.data.comments.push(newComment);
      
      // Record the comment activity in history
      if (!metadata.data.history) {
        metadata.data.history = [];
      }
      
      metadata.data.history.push({
        action: 'comment',
        old_value: null,
        new_value: text,
        user_id: userId,
        user_name: userName,
        timestamp: new Date().toISOString()
      });
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
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
  fastify.delete('/:projectName/:language/:namespace/key/comment/:commentId', async (request, reply) => {
    try {
      const { projectName, language, namespace, commentId } = request.params;
      const { keyPath, userId, userName } = request.query;
      
      if (!keyPath || !userId || !userName) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Missing required fields: keyPath, userId, userName' 
        });
      }
      
      // Find the metadata file
      let metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      if (!metadata.data.comments) {
        return reply.code(404).send({
          success: false,
          error: 'No comments found for this key'
        });
      }
      
      // Find the comment to delete
      const commentIndex = metadata.data.comments.findIndex(c => c.id === commentId);
      
      if (commentIndex === -1) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Comment not found' 
        });
      }
      
      // Store the comment text for history
      const commentText = metadata.data.comments[commentIndex].text;
      
      // Remove the comment
      metadata.data.comments.splice(commentIndex, 1);
      
      // Record the deletion in history
      if (!metadata.data.history) {
        metadata.data.history = [];
      }
      
      metadata.data.history.push({
        action: 'comment_delete',
        old_value: commentText,
        new_value: null,
        user_id: userId,
        user_name: userName,
        timestamp: new Date().toISOString()
      });
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
      // Broadcast update to connected clients
      fastify.io.emit('comment:deleted', { 
        projectName, 
        language, 
        namespace, 
        keyPath,
        commentId
      });
      
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
  
  // Update a comment
  fastify.put('/:projectName/:language/:namespace/key/comment/:commentId', async (request, reply) => {
    try {
      const { projectName, language, namespace, commentId } = request.params;
      const { keyPath, text, userId, userName } = request.body;
      
      if (!keyPath || !text || !userId || !userName) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Missing required fields: keyPath, text, userId, userName' 
        });
      }
      
      // Find the metadata file
      let metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      if (!metadata.data.comments) {
        return reply.code(404).send({
          success: false,
          error: 'No comments found for this key'
        });
      }
      
      // Find the comment to update
      const commentIndex = metadata.data.comments.findIndex(c => c.id === commentId);
      
      if (commentIndex === -1) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Comment not found' 
        });
      }
      
      // Store original comment for history
      const originalComment = metadata.data.comments[commentIndex];
      
      // Update the comment
      metadata.data.comments[commentIndex] = {
        ...originalComment,
        text,
        updatedBy: userId,
        updated_at: new Date().toISOString()
      };
      
      // Record the update in history
      if (!metadata.data.history) {
        metadata.data.history = [];
      }
      
      metadata.data.history.push({
        action: 'comment_update',
        old_value: originalComment.text,
        new_value: text,
        user_id: userId,
        user_name: userName,
        timestamp: new Date().toISOString()
      });
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
      // Broadcast update to connected clients
      fastify.io.emit('comment:updated', { 
        projectName, 
        language, 
        namespace, 
        keyPath,
        comment: metadata.data.comments[commentIndex]
      });
      
      return { 
        success: true, 
        data: metadata.data.comments[commentIndex] 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to update comment' 
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
