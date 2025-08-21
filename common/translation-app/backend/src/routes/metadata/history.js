/**
 * Routes for managing translation history using file-based metadata
 */
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
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
 * Find all metadata files for a project
 * @param {string} projectName - Project name
 * @returns {Promise<Array<{filePath: string, data: object}>>} Metadata files
 */
async function findProjectMetadataFiles(projectName) {
  const localesPath = projectLocalesMap[projectName];
  if (!localesPath) {
    throw new Error(`Project ${projectName} not found in configuration`);
  }
  
  const projectPath = path.join(appRootPath, localesPath);
  const metaDir = path.join(projectPath, '.meta');
  
  if (!await fs.pathExists(metaDir)) {
    return [];
  }
  
  const files = glob.sync(path.join(metaDir, '**/*.json'));
  const result = [];
  
  for (const filePath of files) {
    try {
      const data = await fs.readJson(filePath);
      result.push({ filePath, data });
    } catch (error) {
      console.error(`Error reading metadata file ${filePath}:`, error);
    }
  }
  
  return result;
}

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
      
      // Find the metadata file
      const metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      // Get history from metadata
      let historyEntries = metadata.data.history || [];
      
      // Sort by timestamp (newest first)
      historyEntries = historyEntries.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      // Apply limit
      if (limit) {
        historyEntries = historyEntries.slice(0, parseInt(limit));
      }
      
      return { 
        success: true, 
        data: historyEntries 
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
      
      // Get all metadata files for this project
      const metadataFiles = await findProjectMetadataFiles(projectName);
      
      // Extract history entries from all files
      const allChanges = [];
      
      for (const { data } of metadataFiles) {
        // Skip files that don't match the language filter
        if (language && data.language !== language) {
          continue;
        }
        
        if (data.history && Array.isArray(data.history)) {
          // Add context to each history entry
          const entriesWithContext = data.history.map(entry => ({
            ...entry,
            key_path: data.key_path,
            namespace: data.namespace,
            project: data.project
          }));
          
          allChanges.push(...entriesWithContext);
        }
      }
      
      // Sort by timestamp (newest first)
      const sortedChanges = allChanges.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      // Apply limit
      const limitedChanges = limit ? sortedChanges.slice(0, parseInt(limit)) : sortedChanges;
      
      return { 
        success: true, 
        data: limitedChanges 
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
      
      // Get all metadata files for this project
      const metadataFiles = await findProjectMetadataFiles(projectName);
      
      // Set cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      
      // Extract history entries from all files
      const allChanges = [];
      
      for (const { data } of metadataFiles) {
        // Skip files that don't match the language filter
        if (language && data.language !== language) {
          continue;
        }
        
        if (data.history && Array.isArray(data.history)) {
          // Filter by date
          const recentEntries = data.history.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= cutoffDate;
          });
          
          // Add context to each history entry
          const entriesWithContext = recentEntries.map(entry => ({
            ...entry,
            key_path: data.key_path,
            namespace: data.namespace,
            project: data.project
          }));
          
          allChanges.push(...entriesWithContext);
        }
      }
      
      // Calculate statistics
      const stats = {
        total_changes: allChanges.length,
        changes_by_user: {},
        changes_by_action: {},
        changes_by_day: {}
      };
      
      // Process changes
      allChanges.forEach(change => {
        // Count by user
        const userId = change.user_id || 'unknown';
        stats.changes_by_user[userId] = (stats.changes_by_user[userId] || 0) + 1;
        
        // Count by action
        const action = change.action || 'unknown';
        stats.changes_by_action[action] = (stats.changes_by_action[action] || 0) + 1;
        
        // Count by day
        const day = new Date(change.timestamp).toISOString().split('T')[0];
        stats.changes_by_day[day] = (stats.changes_by_day[day] || 0) + 1;
      });
      
      return { 
        success: true, 
        data: stats 
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
        action, 
        oldValue, 
        newValue, 
        userId, 
        userName 
      } = request.body;
      
      if (!namespace || !keyPath || !action || !userId || !userName) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Missing required fields' 
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
      
      // Create history entry
      const historyEntry = {
        action,
        old_value: oldValue,
        new_value: newValue,
        user_id: userId,
        user_name: userName,
        timestamp: new Date().toISOString()
      };
      
      // Add to history
      if (!metadata.data.history) {
        metadata.data.history = [];
      }
      
      metadata.data.history.push(historyEntry);
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
      // Broadcast update to connected clients
      fastify.io.emit('history:recorded', { 
        projectName, 
        language, 
        namespace, 
        keyPath,
        action
      });
      
      return { 
        success: true, 
        data: historyEntry 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to record history entry' 
      });
    }
  });

  // Get all history for a project (admin)  
  fastify.get('/:projectName/all', async (request, reply) => {
    try {
      const { projectName } = request.params;
      const { limit = 100 } = request.query;
      
      // Get all metadata files for this project
      const metadataFiles = await findProjectMetadataFiles(projectName);
      
      // Extract all history entries
      const allHistory = [];
      
      for (const { data } of metadataFiles) {
        if (data.history && Array.isArray(data.history)) {
          // Add context to each history entry
          const entriesWithContext = data.history.map(entry => ({
            ...entry,
            key_path: data.key_path,
            namespace: data.namespace,
            project: data.project
          }));
          
          allHistory.push(...entriesWithContext);
        }
      }
      
      // Sort by timestamp (newest first)
      const sortedHistory = allHistory.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      // Apply limit
      const limitedHistory = limit ? sortedHistory.slice(0, parseInt(limit)) : sortedHistory;
      
      return { 
        success: true, 
        data: limitedHistory,
        total: allHistory.length
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get all history' 
      });
    }
  });
  
  // Cleanup old history records (admin function)
  fastify.delete('/cleanup', async (request, reply) => {
    try {
      const { daysToKeep = 90 } = request.body;
      
      const deletedCount = await cleanupOldRecords(parseInt(daysToKeep));
      
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
