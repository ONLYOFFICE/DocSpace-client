/**
 * Routes for managing code usages for translations using file-based metadata
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
        result.push({ filePath, data, namespace });
      } catch (error) {
        console.error(`Error reading metadata file ${file}:`, error);
      }
    }
  }
  
  return result;
}

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
      
      // Find the metadata file
      const metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      // Get usage information from metadata
      const usages = metadata.data.usage || [];
      
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
      
      // Find the metadata file
      let metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      // Create new usage entry
      const usage = {
        id: Date.now().toString(),
        file_path: filePath,
        line_number: lineNumber,
        context: context || '',
        created_at: new Date().toISOString()
      };
      
      // Initialize usage array if not exists
      if (!metadata.data.usage) {
        metadata.data.usage = [];
      }
      
      // Check if similar usage already exists
      const existingIndex = metadata.data.usage.findIndex(u => 
        u.file_path === filePath && u.line_number === lineNumber
      );
      
      if (existingIndex >= 0) {
        // Update existing usage
        metadata.data.usage[existingIndex] = {
          ...metadata.data.usage[existingIndex],
          context: context || metadata.data.usage[existingIndex].context,
          updated_at: new Date().toISOString()
        };
      } else {
        // Add new usage
        metadata.data.usage.push(usage);
      }
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
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
  // Get all usages for a project
  fastify.get('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      
      // Get all metadata files for this project
      const metadataFiles = await findProjectMetadataFiles(projectName);
      
      // Extract all usages
      const allUsages = [];
      
      for (const { data, namespace } of metadataFiles) {
        if (data.usage && Array.isArray(data.usage)) {
          // Add context to each usage
          const usagesWithContext = data.usage.map(usage => ({
            ...usage,
            key_path: data.key_path,
            namespace,
            project: projectName
          }));
          
          allUsages.push(...usagesWithContext);
        }
      }
      
      return { 
        success: true, 
        data: allUsages,
        count: allUsages.length
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
  
  // Delete a code usage
  fastify.delete('/:projectName/:namespace/key/usage/:usageId', async (request, reply) => {
    try {
      const { projectName, namespace, usageId } = request.params;
      const { keyPath } = request.query;
      
      if (!keyPath) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Key path is required' 
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
      
      if (!metadata.data.usage) {
        return reply.code(404).send({
          success: false,
          error: 'No usage information found for this key'
        });
      }
      
      // Find the usage to delete
      const usageIndex = metadata.data.usage.findIndex(u => u.id === usageId);
      
      if (usageIndex === -1) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Code usage not found' 
        });
      }
      
      // Remove the usage
      metadata.data.usage.splice(usageIndex, 1);
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
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
  
  // Get all usages for a project
  fastify.get('/:projectName/all', async (request, reply) => {
    try {
      const { projectName } = request.params;
      
      // Get all metadata files for this project
      const metadataFiles = await findProjectMetadataFiles(projectName);
      
      // Extract all usages
      const allUsages = [];
      
      for (const { data, namespace } of metadataFiles) {
        if (data.usage && Array.isArray(data.usage)) {
          // Add context to each usage
          const usagesWithContext = data.usage.map(usage => ({
            ...usage,
            key_path: data.key_path,
            namespace,
            project: projectName
          }));
          
          allUsages.push(...usagesWithContext);
        }
      }
      
      return { 
        success: true, 
        data: allUsages,
        count: allUsages.length
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to get all code usages' 
      });
    }
  });
};

module.exports = routes;
