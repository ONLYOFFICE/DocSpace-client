const { 
  initializeDatabase,
  getKeyUsages,
  getKeyComment,
  storeTranslationKey,
  setKeyAutoComment
} = require('../utils/dbUtils');
const { analyzeCodebase } = require('../utils/keyUsageUtils');

/**
 * Registers API routes for translation key usage functionality
 * @param {object} fastify - Fastify instance
 */
async function keyUsageRoutes(fastify) {
  // Get usage information for a key
  fastify.get('/api/key-usage/:key', async (request, reply) => {
    try {
      const { key } = request.params;
      
      const db = await initializeDatabase();
      
      // Get key ID
      const keyRecord = await db.get('SELECT id FROM translation_keys WHERE key = ?', key);
      
      if (!keyRecord) {
        return reply.code(404).send({ error: 'Key not found' });
      }
      
      // Get usage information
      const usages = await db.all(`
        SELECT file_path, line_number, context, module
        FROM key_usages
        WHERE key_id = ?
        ORDER BY module, file_path
      `, keyRecord.id);
      
      // Get comment
      const comment = await db.get(`
        SELECT comment, is_auto, updated_at
        FROM key_comments
        WHERE key_id = ?
      `, keyRecord.id);
      
      await db.close();
      
      return {
        key,
        usages,
        comment: comment || null
      };
    } catch (error) {
      console.error(`Error getting key usage for ${request.params.key}:`, error);
      return reply.code(500).send({ error: 'Failed to get key usage information' });
    }
  });
  
  // Get all keys for a module
  fastify.get('/api/key-usage/module/:module', async (request, reply) => {
    try {
      const { module } = request.params;
      
      const db = await initializeDatabase();
      
      const keys = await db.all(`
        SELECT DISTINCT tk.key
        FROM translation_keys tk
        JOIN key_usages ku ON tk.id = ku.key_id
        WHERE ku.module = ?
        ORDER BY tk.key
      `, module);
      
      await db.close();
      
      return {
        module,
        keys: keys.map(k => k.key)
      };
    } catch (error) {
      console.error(`Error getting keys for module ${request.params.module}:`, error);
      return reply.code(500).send({ error: 'Failed to get keys for module' });
    }
  });
  
  // Get all modules
  fastify.get('/api/key-usage/modules', async (request, reply) => {
    try {
      const db = await initializeDatabase();
      
      const modules = await db.all(`
        SELECT DISTINCT module
        FROM key_usages
        ORDER BY module
      `);
      
      await db.close();
      
      return {
        modules: modules.map(m => m.module)
      };
    } catch (error) {
      console.error('Error getting modules:', error);
      return reply.code(500).send({ error: 'Failed to get modules' });
    }
  });
  
  // Set a custom comment for a key
  fastify.post('/api/key-usage/:key/comment', async (request, reply) => {
    try {
      const { key } = request.params;
      const { comment } = request.body;
      
      if (!comment) {
        return reply.code(400).send({ error: 'Comment is required' });
      }
      
      const db = await initializeDatabase();
      
      // Get or create key
      let keyRecord = await db.get('SELECT id FROM translation_keys WHERE key = ?', key);
      
      if (!keyRecord) {
        // Create a new key entry
        await db.run('INSERT INTO translation_keys (key) VALUES (?)', key);
        keyRecord = await db.get('SELECT id FROM translation_keys WHERE key = ?', key);
      }
      
      // Set custom comment (is_auto = 0)
      await db.run(
        'INSERT OR REPLACE INTO key_comments (key_id, comment, is_auto, updated_at) VALUES (?, ?, 0, CURRENT_TIMESTAMP)',
        [keyRecord.id, comment]
      );
      
      await db.close();
      
      return { success: true };
    } catch (error) {
      console.error(`Error setting comment for key ${request.params.key}:`, error);
      return reply.code(500).send({ error: 'Failed to set comment' });
    }
  });
  
  // Trigger a codebase analysis
  fastify.post('/api/key-usage/analyze', async (request, reply) => {
    try {
      // Start analysis in the background
      analyzeCodebase().catch(err => {
        console.error('Background analysis error:', err);
      });
      
      // Return immediately with status
      return { 
        success: true, 
        message: 'Analysis started in background. This may take several minutes to complete.' 
      };
    } catch (error) {
      console.error('Error starting analysis:', error);
      return reply.code(500).send({ error: 'Failed to start analysis' });
    }
  });

  // Search for keys by prefix
  fastify.get('/api/key-usage/search', async (request, reply) => {
    try {
      const { query } = request.query;
      
      if (!query) {
        return reply.code(400).send({ error: 'Search query is required' });
      }
      
      const db = await initializeDatabase();
      
      const keys = await db.all(`
        SELECT tk.key
        FROM translation_keys tk
        WHERE tk.key LIKE ?
        ORDER BY tk.key
        LIMIT 50
      `, `${query}%`);
      
      await db.close();
      
      return {
        keys: keys.map(k => k.key)
      };
    } catch (error) {
      console.error(`Error searching for keys with query ${request.query.query}:`, error);
      return reply.code(500).send({ error: 'Failed to search for keys' });
    }
  });

  // Get statistics about key usage
  fastify.get('/api/key-usage/stats', async (request, reply) => {
    try {
      const db = await initializeDatabase();
      
      const stats = await db.get(`
        SELECT 
          COUNT(DISTINCT tk.id) as totalKeys,
          COUNT(DISTINCT ku.module) as totalModules,
          COUNT(DISTINCT ku.file_path) as totalFiles,
          COUNT(DISTINCT ku.id) as totalUsages
        FROM translation_keys tk
        LEFT JOIN key_usages ku ON tk.id = ku.key_id
      `);
      
      const moduleStats = await db.all(`
        SELECT 
          module, 
          COUNT(DISTINCT key_id) as keyCount,
          COUNT(DISTINCT file_path) as fileCount
        FROM key_usages
        GROUP BY module
        ORDER BY keyCount DESC
      `);
      
      await db.close();
      
      return {
        totalKeys: stats.totalKeys,
        totalModules: stats.totalModules,
        totalFiles: stats.totalFiles,
        totalUsages: stats.totalUsages,
        moduleStats
      };
    } catch (error) {
      console.error('Error getting key usage statistics:', error);
      return reply.code(500).send({ error: 'Failed to get key usage statistics' });
    }
  });
}

module.exports = keyUsageRoutes;
