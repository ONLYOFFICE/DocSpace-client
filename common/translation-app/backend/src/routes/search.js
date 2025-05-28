const fsUtils = require('../utils/fsUtils');
const { projectLocalesMap } = require('../config/config');

/**
 * Search route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Search across projects, namespaces, keys, and values
  fastify.get('/', async (request, reply) => {
    try {
      const { query, projectName } = request.query;
      
      if (!query || query.trim() === '') {
        return reply.code(400).send({ success: false, error: 'Search query is required' });
      }

      // Convert query to lowercase for case-insensitive search
      const searchQuery = query.toLowerCase();
      let results = [];
      
      // If projectName is provided, search only in that project
      const projectNames = projectName ? [projectName] : Object.keys(projectLocalesMap);
      
      for (const project of projectNames) {
        // Get available languages for this project
        const languages = await fsUtils.getAvailableLanguages(project);
        
        if (languages.length === 0) continue;
        
        // Use the first language as reference for namespaces
        const baseLanguage = languages[0];
        const namespaces = await fsUtils.getNamespaces(project, baseLanguage);
        
        // For each namespace, search for the query in keys and values
        for (const namespace of namespaces) {
          // Check if namespace name contains the search query
          const namespaceMatch = namespace.toLowerCase().includes(searchQuery);
          
          // Read translation file
          const translations = await fsUtils.readTranslationFile(project, baseLanguage, namespace);
          
          if (!translations) continue;
          
          // Search for matches in keys and values
          const matches = searchInTranslations(translations, searchQuery);
          
          if (namespaceMatch || matches.length > 0) {
            results.push({
              projectName: project,
              namespace,
              namespaceMatch,
              matches
            });
          }
        }
      }
      
      return { 
        success: true, 
        data: { 
          query: query,
          results,
          totalResults: results.reduce((acc, r) => acc + r.matches.length + (r.namespaceMatch ? 1 : 0), 0)
        } 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to perform search' });
    }
  });
}

/**
 * Recursively searches in translation object for keys and values that match the query
 * @param {Object} translations - Translation object to search in
 * @param {string} query - Search query (lowercase)
 * @param {string} prefix - Current key prefix for nested objects
 * @returns {Array} - Array of matches with key and value information
 */
function searchInTranslations(translations, query, prefix = '') {
  let matches = [];
  
  for (const [key, value] of Object.entries(translations)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      // Recurse into nested objects
      const nestedMatches = searchInTranslations(value, query, fullKey);
      matches = matches.concat(nestedMatches);
    } else {
      // Check if key or value matches the query
      const keyMatch = key.toLowerCase().includes(query);
      const valueMatch = typeof value === 'string' && value.toLowerCase().includes(query);
      
      if (keyMatch || valueMatch) {
        matches.push({
          key: fullKey,
          value: value,
          keyMatch,
          valueMatch
        });
      }
    }
  }
  
  return matches;
}

module.exports = routes;
