/**
 * Repository for managing code_usages table
 */
const BaseRepository = require('./base');

class CodeUsagesRepository extends BaseRepository {
  constructor() {
    super('code_usages');
  }

  /**
   * Find code usages by translation key
   * @param {string} projectName - Project name
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {Array} Array of code usages
   */
  findByTranslationKey(projectName, namespace, keyPath) {
    return this.findBy({
      project_name: projectName,
      namespace,
      key_path: keyPath
    });
  }
  
  /**
   * Add a code usage reference
   * @param {string} projectName - Project name
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @param {string} filePath - Path to the file where the key is used
   * @param {number} lineNumber - Line number where the key is used
   * @param {string} context - Code context (optional)
   * @returns {object} Created code usage
   */
  addUsage(projectName, namespace, keyPath, filePath, lineNumber, context = null) {
    return this.transaction(() => {
      // Check if this exact usage already exists
      const existing = this.findOneBy({
        project_name: projectName,
        namespace,
        key_path: keyPath,
        file_path: filePath,
        line_number: lineNumber
      });
      
      if (existing) {
        // Update the existing entry
        return this.update(existing.id, {
          context: context || existing.context,
          last_verified_at: new Date().toISOString()
        });
      }
      
      // Create a new entry
      return this.create({
        project_name: projectName,
        namespace,
        key_path: keyPath,
        file_path: filePath,
        line_number: lineNumber,
        context,
        last_verified_at: new Date().toISOString()
      });
    });
  }

  /**
   * Bulk add code usages from scan results
   * @param {Array} usages - Array of code usage objects
   * @returns {number} Number of usages processed
   */
  bulkAddUsages(usages) {
    return this.transaction(() => {
      let count = 0;
      
      for (const usage of usages) {
        this.addUsage(
          usage.projectName,
          usage.namespace,
          usage.keyPath,
          usage.filePath,
          usage.lineNumber,
          usage.context
        );
        count++;
      }
      
      return count;
    });
  }

  /**
   * Find unused translation keys
   * @param {string} projectName - Project name
   * @param {Array} allKeys - Array of all translation keys
   * @returns {Array} Array of unused keys
   */
  findUnusedKeys(projectName, allKeys) {
    const usedKeys = this.query(`
      SELECT DISTINCT namespace, key_path
      FROM ${this.tableName}
      WHERE project_name = ?
    `, [projectName]);
    
    // Convert to a set for faster lookups
    const usedKeysSet = new Set(usedKeys.map(k => `${k.namespace}:${k.key_path}`));
    
    // Find keys that aren't in the used set
    return allKeys.filter(key => {
      const keyId = `${key.namespace}:${key.keyPath}`;
      return !usedKeysSet.has(keyId);
    });
  }

  /**
   * Get all usages for a project
   * @param {string} projectName - Project name
   * @returns {Array} Array of code usages grouped by namespace and key
   */
  getProjectUsages(projectName) {
    return this.query(`
      SELECT 
        namespace,
        key_path,
        COUNT(*) as usage_count,
        GROUP_CONCAT(DISTINCT file_path) as files
      FROM ${this.tableName}
      WHERE project_name = ?
      GROUP BY namespace, key_path
      ORDER BY namespace, key_path
    `, [projectName]);
  }

  /**
   * Get usage statistics
   * @param {string} projectName - Project name
   * @returns {object} Usage statistics
   */
  getUsageStatistics(projectName) {
    const stats = this.query(`
      SELECT 
        COUNT(DISTINCT CONCAT(namespace, ':', key_path)) as unique_keys,
        COUNT(*) as total_usages,
        COUNT(DISTINCT file_path) as files_count
      FROM ${this.tableName}
      WHERE project_name = ?
    `, [projectName])[0];
    
    // Get most used keys
    const mostUsedKeys = this.query(`
      SELECT 
        namespace,
        key_path,
        COUNT(*) as usage_count
      FROM ${this.tableName}
      WHERE project_name = ?
      GROUP BY namespace, key_path
      ORDER BY usage_count DESC
      LIMIT 10
    `, [projectName]);
    
    return {
      ...stats,
      mostUsedKeys
    };
  }

  /**
   * Delete outdated usages
   * @param {string} projectName - Project name
   * @param {Date} beforeDate - Delete usages last verified before this date
   * @returns {number} Number of deleted usages
   */
  deleteOutdatedUsages(projectName, beforeDate) {
    const query = `
      DELETE FROM ${this.tableName}
      WHERE project_name = ? AND last_verified_at < ?
    `;
    
    const result = this.db.prepare(query).run(
      projectName,
      beforeDate.toISOString()
    );
    
    return result.changes;
  }
}

module.exports = new CodeUsagesRepository();
