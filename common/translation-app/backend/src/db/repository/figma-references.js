/**
 * Repository for managing figma_references table
 */
const BaseRepository = require('./base');
const translationsMetadataRepo = require('./translations-metadata');

class FigmaReferencesRepository extends BaseRepository {
  constructor() {
    super('figma_references');
  }

  /**
   * Find references by translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {Array} Array of Figma references
   */
  findByTranslationKey(projectName, language, namespace, keyPath) {
    // First find the metadata record
    const metadata = translationsMetadataRepo.findForTranslationKey(
      projectName, language, namespace, keyPath
    );
    
    if (!metadata) {
      return [];
    }
    
    // Find references by metadata ID
    return this.findBy({ metadata_id: metadata.id });
  }

  /**
   * Add a Figma reference to a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @param {object} figmaData - Figma reference data
   * @returns {object} Created Figma reference
   */
  addReference(projectName, language, namespace, keyPath, figmaData) {
    // Make sure the metadata exists
    const metadata = translationsMetadataRepo.findOrCreate(
      projectName, language, namespace, keyPath
    );
    
    // Create the reference
    return this.create({
      metadata_id: metadata.id,
      figma_file_key: figmaData.figmaFileKey,
      figma_node_id: figmaData.figmaNodeId,
      component_name: figmaData.componentName || null,
      screen_name: figmaData.screenName || null,
      thumbnail_url: figmaData.thumbnailUrl || null
    });
  }

  /**
   * Update the thumbnail URL for a reference
   * @param {number} id - Reference ID
   * @param {string} thumbnailUrl - New thumbnail URL
   * @returns {object} Updated reference
   */
  updateThumbnail(id, thumbnailUrl) {
    return this.update(id, { thumbnail_url: thumbnailUrl });
  }

  /**
   * Get all Figma references for a project
   * @param {string} projectName - Project name
   * @returns {Array} Array of Figma references with translation metadata
   */
  getProjectReferences(projectName) {
    const query = `
      SELECT f.*, t.project_name, t.language, t.namespace, t.key_path
      FROM figma_references f
      JOIN translations_metadata t ON f.metadata_id = t.id
      WHERE t.project_name = ?
      ORDER BY t.namespace, t.key_path
    `;
    
    return this.query(query, [projectName]);
  }

  /**
   * Get all Figma references by file key
   * @param {string} figmaFileKey - Figma file key
   * @returns {Array} Array of Figma references with translation metadata
   */
  getReferencesByFigmaFile(figmaFileKey) {
    const query = `
      SELECT f.*, t.project_name, t.language, t.namespace, t.key_path
      FROM figma_references f
      JOIN translations_metadata t ON f.metadata_id = t.id
      WHERE f.figma_file_key = ?
      ORDER BY t.namespace, t.key_path
    `;
    
    return this.query(query, [figmaFileKey]);
  }

  /**
   * Delete all references for a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {number} Number of deleted references
   */
  deleteForTranslationKey(projectName, language, namespace, keyPath) {
    // First find the metadata record
    const metadata = translationsMetadataRepo.findForTranslationKey(
      projectName, language, namespace, keyPath
    );
    
    if (!metadata) {
      return 0;
    }
    
    // Delete references by metadata ID
    return this.deleteBy({ metadata_id: metadata.id });
  }
}

module.exports = new FigmaReferencesRepository();
