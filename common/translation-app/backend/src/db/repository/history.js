/**
 * Repository for managing history table
 */
const BaseRepository = require('./base');

class HistoryRepository extends BaseRepository {
  constructor() {
    super('history');
  }

  /**
   * Record a translation change event
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @param {string} actionType - Type of action (create, update, delete)
   * @param {string} previousValue - Previous translation value
   * @param {string} newValue - New translation value
   * @param {string} userId - User ID (optional)
   * @param {string} userName - User name (optional)
   * @returns {object} Created history record
   */
  recordChange(projectName, language, namespace, keyPath, actionType, previousValue, newValue, userId = null, userName = null) {
    return this.create({
      project_name: projectName,
      language,
      namespace,
      key_path: keyPath,
      action_type: actionType,
      previous_value: previousValue,
      new_value: newValue,
      user_id: userId,
      user_name: userName
    });
  }

  /**
   * Get history for a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @param {number} limit - Maximum number of records to return
   * @returns {Array} Array of history records
   */
  getTranslationHistory(projectName, language, namespace, keyPath, limit = 20) {
    const query = `
      SELECT *
      FROM ${this.tableName}
      WHERE project_name = ? AND language = ? AND namespace = ? AND key_path = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
    
    return this.query(query, [projectName, language, namespace, keyPath, limit]);
  }

  /**
   * Get recent changes for a project
   * @param {string} projectName - Project name
   * @param {string} language - Language code (optional)
   * @param {number} limit - Maximum number of records to return
   * @returns {Array} Array of recent changes
   */
  getRecentChanges(projectName, language = null, limit = 50) {
    let query = `
      SELECT *
      FROM ${this.tableName}
      WHERE project_name = ?
    `;
    
    const params = [projectName];
    
    if (language) {
      query += ` AND language = ?`;
      params.push(language);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);
    
    return this.query(query, params);
  }

  /**
   * Get change history statistics
   * @param {string} projectName - Project name
   * @param {string} language - Language code (optional)
   * @param {number} days - Number of days to include in stats
   * @returns {object} Change statistics
   */
  getChangeStatistics(projectName, language = null, days = 30) {
    // Calculate the date for filtering
    const date = new Date();
    date.setDate(date.getDate() - days);
    const fromDate = date.toISOString();
    
    // Base query parts
    let whereClause = `WHERE project_name = ? AND created_at >= ?`;
    const params = [projectName, fromDate];
    
    if (language) {
      whereClause += ` AND language = ?`;
      params.push(language);
    }
    
    // Get action type counts
    const actionCounts = this.query(`
      SELECT 
        action_type,
        COUNT(*) as count
      FROM ${this.tableName}
      ${whereClause}
      GROUP BY action_type
    `, params);
    
    // Get daily activity
    const dailyActivity = this.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM ${this.tableName}
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, params);
    
    // Get user activity
    const userActivity = this.query(`
      SELECT 
        user_name,
        COUNT(*) as count
      FROM ${this.tableName}
      ${whereClause}
      AND user_name IS NOT NULL
      GROUP BY user_name
      ORDER BY count DESC
      LIMIT 10
    `, params);
    
    return {
      actionCounts: actionCounts.reduce((acc, row) => {
        acc[row.action_type] = row.count;
        return acc;
      }, {}),
      dailyActivity,
      userActivity,
      totalChanges: dailyActivity.reduce((sum, day) => sum + day.count, 0)
    };
  }

  /**
   * Clean up old history records
   * @param {number} daysToKeep - Number of days of history to keep
   * @returns {number} Number of deleted records
   */
  cleanupOldRecords(daysToKeep = 90) {
    // Calculate the cutoff date
    const date = new Date();
    date.setDate(date.getDate() - daysToKeep);
    const cutoffDate = date.toISOString();
    
    const query = `
      DELETE FROM ${this.tableName}
      WHERE created_at < ?
    `;
    
    const result = this.db.prepare(query).run(cutoffDate);
    return result.changes;
  }
}

module.exports = new HistoryRepository();
