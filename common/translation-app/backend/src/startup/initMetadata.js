/**
 * Translation Metadata Initialization
 * 
 * This module handles initialization of translation metadata on server startup.
 * It ensures all translation keys are properly tracked with metadata.
 */
const path = require('path');
const { generateAllMetadata } = require('../scripts/generate-metadata');
const { projectLocalesMap, appRootPath } = require('../config/config');

/**
 * Initialize metadata for all translation files
 * This is called during server startup
 * @returns {Promise<void>}
 */
async function initializeMetadata() {
  console.log('Initializing translation metadata...');
  
  try {
    const stats = await generateAllMetadata();
    
    // Log summary statistics
    console.log('\n=== Translation Metadata Initialization Summary ===');
    console.log(`Projects processed: ${stats.totalProjects}`);
    console.log(`Namespaces processed: ${stats.totalNamespaces}`);
    console.log(`Total keys: ${stats.totalKeys}`);
    console.log(`New keys added: ${stats.newKeys}`);
    console.log(`Keys updated: ${stats.updatedKeys}`);
    console.log(`Keys unchanged: ${stats.unchangedKeys}`);
    
    // Calculate total files from project stats
    let totalFiles = 0;
    Object.values(stats.projectStats).forEach(projectStat => {
      totalFiles += projectStat.totalFiles || 0;
    });
    console.log(`Translation files scanned: ${totalFiles}`);
    
    if (stats.processingErrors > 0) {
      console.warn(`\nWarning: ${stats.processingErrors} errors occurred during metadata initialization`);
    }
    
    console.log('\nMetadata stored in:');
    Object.keys(stats.projectStats).forEach(project => {
      const localesPath = projectLocalesMap[project];
      if (localesPath) {
        console.log(`- ${path.join(appRootPath, localesPath, '.meta')}`);
      }
    });
    console.log('================================================');
    
    return stats;
  } catch (error) {
    console.error('Error initializing translation metadata:', error);
    // Don't throw the error to prevent server startup failure
  }
}

module.exports = {
  initializeMetadata
};
