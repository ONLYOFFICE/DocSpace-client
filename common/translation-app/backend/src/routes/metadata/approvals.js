/**
 * Routes for managing translation approvals using file-based metadata
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
 * Find all metadata files for a project and language
 * @param {string} projectName - Project name
 * @param {string} language - Language code
 * @returns {Promise<Array<{filePath: string, data: object, namespace: string}>>} Metadata files
 */
async function findProjectMetadataFiles(projectName, language) {
  const localesPath = projectLocalesMap[projectName];
  if (!localesPath) {
    throw new Error(`Project ${projectName} not found in configuration`);
  }
  
  const projectPath = path.join(appRootPath, localesPath);
  const metaDir = path.join(projectPath, '.meta');
  
  if (!await fs.pathExists(metaDir)) {
    return [];
  }
  
  const result = [];
  const namespaceDirs = await fs.readdir(metaDir);
  
  for (const namespace of namespaceDirs) {
    const namespacePath = path.join(metaDir, namespace);
    if (!(await fs.stat(namespacePath)).isDirectory()) continue;
    
    const files = await fs.readdir(namespacePath);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const filePath = path.join(namespacePath, file);
        const data = await fs.readJson(filePath);
        
        // Only include files that have approval data for the specified language
        if (data.approvals && data.approvals[language]) {
          result.push({ filePath, data, namespace });
        }
      } catch (error) {
        console.error(`Error reading metadata file ${file}:`, error);
      }
    }
  }
  
  return result;
}

/**
 * Record change to history in metadata file
 * @param {string} projectName - Project name
 * @param {string} language - Language code
 * @param {string} namespace - Namespace
 * @param {string} keyPath - Key path
 * @param {string} action - Action type
 * @param {string} prevValue - Previous value
 * @param {string} message - Change message
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @returns {Promise<object>} History entry
 */
async function recordChangeToHistory(projectName, language, namespace, keyPath, action, prevValue, message, userId, userName) {
  const metadata = await findMetadataFile(projectName, namespace, keyPath);
  
  if (!metadata) {
    throw new Error(`Metadata not found for key: ${namespace}:${keyPath}`);
  }
  
  // Create history entry
  const historyEntry = {
    id: Date.now().toString(),
    project_name: projectName,
    language,
    namespace,
    key_path: keyPath,
    action,
    previous_value: prevValue,
    message,
    user_id: userId,
    user_name: userName,
    timestamp: new Date().toISOString()
  };
  
  // Initialize history array if not exists
  if (!metadata.data.history) {
    metadata.data.history = [];
  }
  
  // Add new history entry
  metadata.data.history.push(historyEntry);
  
  // Update timestamp
  metadata.data.updated_at = new Date().toISOString();
  
  // Save updated metadata
  await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
  
  return historyEntry;
}

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
      
      // Find the metadata file
      const metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      // Get approval information from metadata
      const approval = metadata.data.approvals && metadata.data.approvals[language];
      
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
      
      // Find the metadata file
      let metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      // Create approval object
      const approval = {
        status,
        reviewer_id: reviewerId,
        reviewer_name: reviewerName,
        comments: comments || '',
        updated_at: new Date().toISOString()
      };
      
      // Initialize approvals object if not exists
      if (!metadata.data.approvals) {
        metadata.data.approvals = {};
      }
      
      // Update approval for language
      metadata.data.approvals[language] = approval;
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
      // Record the activity in history
      if (reviewerId && reviewerName) {
        await recordChangeToHistory(
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
      
      // Get all metadata files for this project and language
      const metadataFiles = await findProjectMetadataFiles(projectName, language);
      
      // Extract all approvals matching the status filter
      const projectApprovals = [];
      
      for (const { data, namespace } of metadataFiles) {
        if (data.approvals && data.approvals[language]) {
          const approval = data.approvals[language];
          
          // Apply status filter if provided
          if (status && approval.status !== status) {
            continue;
          }
          
          // Add context to approval
          projectApprovals.push({
            ...approval,
            key_path: data.key_path,
            namespace,
            language,
            project_name: projectName
          });
        }
      }
      
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
      
      // Get all projects
      const projects = Object.keys(projectLocalesMap);
      
      // Initialize result
      const pendingCounts = [];
      
      // For each project, find approvals assigned to this reviewer
      for (const projectName of projects) {
        // Get language folders
        const localesPath = projectLocalesMap[projectName];
        const projectPath = path.join(appRootPath, localesPath);
        
        if (!await fs.pathExists(projectPath)) {
          continue;
        }
        
        const languageFolders = await fs.readdir(projectPath);
        
        for (const language of languageFolders) {
          // Skip non-language folders and .meta folder
          if (language === '.meta' || language.startsWith('.')) {
            continue;
          }
          
          // Get metadata files for this project and language
          const metadataFiles = await findProjectMetadataFiles(projectName, language);
          
          // Count pending approvals for this reviewer
          let pendingCount = 0;
          
          for (const { data } of metadataFiles) {
            if (data.approvals && 
                data.approvals[language] && 
                data.approvals[language].reviewer_id === reviewerId && 
                data.approvals[language].status === 'pending') {
              pendingCount++;
            }
          }
          
          if (pendingCount > 0) {
            pendingCounts.push({
              project_name: projectName,
              language,
              count: pendingCount
            });
          }
        }
      }
      
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
      
      // Get all metadata files for this project and language
      const metadataFiles = await findProjectMetadataFiles(projectName, language);
      
      // Initialize counters
      const stats = {
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        needs_review: 0,
        not_started: 0
      };
      
      // Process each metadata file
      for (const { data } of metadataFiles) {
        if (data.approvals && data.approvals[language]) {
          stats.total++;
          
          const status = data.approvals[language].status;
          
          if (status === 'approved') {
            stats.approved++;
          } else if (status === 'rejected') {
            stats.rejected++;
          } else if (status === 'pending') {
            stats.pending++;
          } else if (status === 'needs_review') {
            stats.needs_review++;
          }
        } else {
          // No approval record means not started
          stats.total++;
          stats.not_started++;
        }
      }
      
      // Calculate percentages
      if (stats.total > 0) {
        stats.approved_percent = Math.round((stats.approved / stats.total) * 100);
        stats.rejected_percent = Math.round((stats.rejected / stats.total) * 100);
        stats.pending_percent = Math.round((stats.pending / stats.total) * 100);
        stats.needs_review_percent = Math.round((stats.needs_review / stats.total) * 100);
        stats.not_started_percent = Math.round((stats.not_started / stats.total) * 100);
      }
      
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
