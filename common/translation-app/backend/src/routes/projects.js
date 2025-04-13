const { projectLocalesMap } = require('../config/config');
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
      const projects = Object.keys(projectLocalesMap).map(name => ({
        name,
        path: projectLocalesMap[name]
      }));
      
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
