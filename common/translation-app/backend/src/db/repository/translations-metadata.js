/**
 * Repository for managing translations_metadata table
 */
const BaseRepository = require('./base');

class TranslationsMetadataRepository extends BaseRepository {
  constructor() {
    super('translations_metadata');
  }

  /**
   * Find metadata for a specific translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {object|null} Metadata record or null if not found
   */
  findForTranslationKey(projectName, language, namespace, keyPath) {
    return this.findOneBy({
      project_name: projectName,
      language,
      namespace,
      key_path: keyPath
    });
  }

  /**
   * Find or create metadata for a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {object} Metadata record
   */
  findOrCreate(projectName, language, namespace, keyPath) {
    let metadata = this.findForTranslationKey(projectName, language, namespace, keyPath);
    
    if (!metadata) {
      metadata = this.create({
        project_name: projectName,
        language,
        namespace,
        key_path: keyPath,
        status: 'pending',
        priority: 'normal'
      });
    }
    
    return metadata;
  }

  /**
   * Find all metadata for a namespace
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @returns {Array} Array of metadata records
   */
  findForNamespace(projectName, language, namespace) {
    return this.findBy({
      project_name: projectName,
      language,
      namespace
    });
  }

  /**
   * Update translation status
   * @param {number} id - Metadata record ID
   * @param {string} status - New status
   * @returns {object} Updated metadata record
   */
  updateStatus(id, status) {
    return this.update(id, {
      status,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Update translation priority
   * @param {number} id - Metadata record ID
   * @param {string} priority - New priority
   * @returns {object} Updated metadata record
   */
  updatePriority(id, priority) {
    return this.update(id, {
      priority,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Mark translation as AI translated
   * @param {number} id - Metadata record ID
   * @param {boolean} isAiTranslated - Whether it was AI translated
   * @returns {object} Updated metadata record
   */
  setAiTranslated(id, isAiTranslated = true) {
    return this.update(id, {
      ai_translated: isAiTranslated ? 1 : 0,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get pending translations
   * @param {string} projectName - Project name
   * @param {string} language - Language code (optional)
   * @returns {Array} Array of pending translation metadata
   */
  getPendingTranslations(projectName, language = null) {
    const criteria = {
      project_name: projectName,
      status: 'pending'
    };
    
    if (language) {
      criteria.language = language;
    }
    
    return this.findBy(criteria);
  }

  /**
   * Get AI translated items
   * @param {string} projectName - Project name
   * @param {string} language - Language code (optional)
   * @returns {Array} Array of AI translated metadata
   */
  getAiTranslatedItems(projectName, language = null) {
    const criteria = {
      project_name: projectName,
      ai_translated: 1
    };
    
    if (language) {
      criteria.language = language;
    }
    
    return this.findBy(criteria);
  }
}

module.exports = new TranslationsMetadataRepository();
