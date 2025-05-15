/**
 * Routes for managing Figma references for translations using file-based metadata
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
      
      // Find the metadata file
      const metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      // Get Figma references from metadata
      const references = metadata.data.figma_references || [];
      
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
      
      // Find or create metadata file
      let metadata = await findMetadataFile(projectName, namespace, keyPath);
      
      if (!metadata) {
        return reply.code(404).send({
          success: false,
          error: 'Metadata not found for this key'
        });
      }
      
      // Create new reference
      const newReference = {
        id: Date.now().toString(),
        figma_file_key: figmaFileKey,
        figma_node_id: figmaNodeId,
        component_name: componentName || '',
        screen_name: screenName || '',
        thumbnail_url: thumbnailUrl || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Initialize figma_references array if not exists
      if (!metadata.data.figma_references) {
        metadata.data.figma_references = [];
      }
      
      // Add reference to metadata
      metadata.data.figma_references.push(newReference);
      
      // Record the activity in history
      if (userId && userName) {
        if (!metadata.data.history) {
          metadata.data.history = [];
        }
        
        metadata.data.history.push({
          action: 'figma_reference_added',
          old_value: null,
          new_value: `Figma reference added: ${figmaFileKey}/${figmaNodeId}`,
          user_id: userId,
          user_name: userName,
          timestamp: new Date().toISOString()
        });
      }
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
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
  fastify.delete('/:projectName/:language/:namespace/key/reference/:referenceId', async (request, reply) => {
    try {
      const { projectName, language, namespace, referenceId } = request.params;
      const { keyPath, userId, userName } = request.query;
      
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
      
      if (!metadata.data.figma_references) {
        return reply.code(404).send({
          success: false,
          error: 'No Figma references found for this key'
        });
      }
      
      // Find the reference to delete
      const referenceIndex = metadata.data.figma_references.findIndex(ref => ref.id === referenceId);
      
      if (referenceIndex === -1) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Figma reference not found' 
        });
      }
      
      // Store the reference for history
      const reference = metadata.data.figma_references[referenceIndex];
      const figmaFileKey = reference.figma_file_key;
      const figmaNodeId = reference.figma_node_id;
      
      // Remove the reference
      metadata.data.figma_references.splice(referenceIndex, 1);
      
      // Record the deletion in history
      if (userId && userName) {
        if (!metadata.data.history) {
          metadata.data.history = [];
        }
        
        metadata.data.history.push({
          action: 'figma_reference_deleted',
          old_value: `Figma reference: ${figmaFileKey}/${figmaNodeId}`,
          new_value: null,
          user_id: userId,
          user_name: userName,
          timestamp: new Date().toISOString()
        });
      }
      
      // Update timestamp
      metadata.data.updated_at = new Date().toISOString();
      
      // Save updated metadata
      await writeJsonWithConsistentEol(metadata.filePath, metadata.data);
      
      // Broadcast update to connected clients
      fastify.io.emit('figma:reference_deleted', { 
        projectName, 
        language, 
        namespace, 
        keyPath,
        referenceId
      });
      
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
      
      const projectReferences = [];
      
      // Iterate through all metadata files for the project
      const localesPath = projectLocalesMap[projectName];
      if (!localesPath) {
        throw new Error(`Project ${projectName} not found in configuration`);
      }
      
      const projectPath = path.join(appRootPath, localesPath);
      const metaDir = path.join(projectPath, '.meta');
      
      const namespaces = await fs.readdir(metaDir);
      
      for (const namespace of namespaces) {
        const namespacePath = path.join(metaDir, namespace);
        const files = await fs.readdir(namespacePath);
        
        for (const file of files) {
          const filePath = path.join(namespacePath, file);
          const data = await fs.readJson(filePath);
          
          if (data.figma_references) {
            projectReferences.push(...data.figma_references);
          }
        }
      }
      
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
