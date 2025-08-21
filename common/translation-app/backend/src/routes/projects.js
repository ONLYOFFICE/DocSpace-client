const { projectLocalesMap, translationConfig } = require('../config/config');
const fsUtils = require('../utils/fsUtils');

/**
 * Projects route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get all projects
  fastify.get('/', async (request, reply) => {
    try {
      // Get all projects with file counts
      const projectsPromises = Object.keys(projectLocalesMap).map(async (name) => {
        // Get available languages for this project
        const languages = await fsUtils.getAvailableLanguages(name);
        
        // Calculate file count by summing namespace counts across languages
        let fileCount = 0;
        
        // If there are languages, get one to calculate namespace count
        if (languages.length > 0) {
          // Just check the first language to estimate file count
          const baseLanguage = languages[0];
          const namespaces = await fsUtils.getNamespaces(name, baseLanguage);
          fileCount = namespaces.length;
        }

        // Check if the project has any untranslated keys
        const baseLanguage = translationConfig.baseLanguage || 'en';
        const hasUntranslatedKeys = await fsUtils.projectHasUntranslatedKeys(name, baseLanguage);
        
        return {
          name,
          path: projectLocalesMap[name],
          fileCount,
          languageCount: languages.length,
          fullyTranslated: !hasUntranslatedKeys
        };
      });
      
      const projects = await Promise.all(projectsPromises);
      
      return { success: true, data: projects };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to get projects' });
    }
  });

  // Get project details
  fastify.get('/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params;
      
      if (!projectLocalesMap[projectName]) {
        return reply.code(404).send({ success: false, error: 'Project not found' });
      }
      
      const languages = await fsUtils.getAvailableLanguages(projectName);
      
      return { 
        success: true, 
        data: {
          name: projectName,
          path: projectLocalesMap[projectName],
          languages
        } 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to get project details' });
    }
  });
}

module.exports = routes;
