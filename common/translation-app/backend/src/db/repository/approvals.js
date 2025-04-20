/**
 * Repository for managing approvals table
 */
const BaseRepository = require('./base');
const translationsMetadataRepo = require('./translations-metadata');

class ApprovalsRepository extends BaseRepository {
  constructor() {
    super('approvals');
  }

  /**
   * Find approval status for a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {object|null} Approval record or null if not found
   */
  findForTranslationKey(projectName, language, namespace, keyPath) {
    // First find the metadata record
    const metadata = translationsMetadataRepo.findForTranslationKey(
      projectName, language, namespace, keyPath
    );
    
    if (!metadata) {
      return null;
    }
    
    // Find approval by metadata ID
    return this.findOneBy({ metadata_id: metadata.id });
  }

  /**
   * Create or update approval status for a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @param {object} approvalData - Approval data
   * @returns {object} Created/updated approval record
   */
  setApprovalStatus(projectName, language, namespace, keyPath, approvalData) {
    // Make sure the metadata exists
    const metadata = translationsMetadataRepo.findOrCreate(
      projectName, language, namespace, keyPath
    );
    
    // Find existing approval
    const existing = this.findOneBy({ metadata_id: metadata.id });
    
    // Prepare data
    const data = {
      status: approvalData.status,
      reviewer_id: approvalData.reviewerId || null,
      reviewer_name: approvalData.reviewerName || null,
      comments: approvalData.comments || null,
      updated_at: new Date().toISOString()
    };
    
    // Set approved_at timestamp if status is 'approved'
    if (approvalData.status === 'approved') {
      data.approved_at = new Date().toISOString();
    }
    
    if (existing) {
      // Update existing record
      return this.update(existing.id, data);
    }
    
    // Create new record
    data.metadata_id = metadata.id;
    data.created_at = new Date().toISOString();
    return this.create(data);
  }

  /**
   * Get approvals for a project language
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} status - Filter by status (optional)
   * @returns {Array} Array of approvals with translation metadata
   */
  getProjectApprovals(projectName, language, status = null) {
    let query = `
      SELECT a.*, t.project_name, t.language, t.namespace, t.key_path, t.priority
      FROM approvals a
      JOIN translations_metadata t ON a.metadata_id = t.id
      WHERE t.project_name = ? AND t.language = ?
    `;
    
    const params = [projectName, language];
    
    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY t.priority DESC, a.updated_at DESC`;
    
    return this.query(query, params);
  }

  /**
   * Get pending approvals count for a reviewer
   * @param {string} reviewerId - Reviewer ID
   * @returns {object} Counts by project and priority
   */
  getPendingApprovalCounts(reviewerId) {
    const query = `
      SELECT 
        t.project_name,
        t.priority,
        COUNT(*) as count
      FROM approvals a
      JOIN translations_metadata t ON a.metadata_id = t.id
      WHERE a.reviewer_id = ? AND a.status = 'pending'
      GROUP BY t.project_name, t.priority
    `;
    
    return this.query(query, [reviewerId]);
  }

  /**
   * Get approval statistics
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @returns {object} Approval statistics
   */
  getApprovalStatistics(projectName, language) {
    const query = `
      SELECT 
        a.status,
        COUNT(*) as count
      FROM approvals a
      JOIN translations_metadata t ON a.metadata_id = t.id
      WHERE t.project_name = ? AND t.language = ?
      GROUP BY a.status
    `;
    
    const statusCounts = this.query(query, [projectName, language]);
    
    // Format into a more convenient structure
    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    statusCounts.forEach(row => {
      stats[row.status] = row.count;
      stats.total += row.count;
    });
    
    return stats;
  }

  /**
   * Delete all approvals for a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {number} Number of deleted approvals
   */
  deleteForTranslationKey(projectName, language, namespace, keyPath) {
    // First find the metadata record
    const metadata = translationsMetadataRepo.findForTranslationKey(
      projectName, language, namespace, keyPath
    );
    
    if (!metadata) {
      return 0;
    }
    
    // Delete approvals by metadata ID
    return this.deleteBy({ metadata_id: metadata.id });
  }
}

module.exports = new ApprovalsRepository();
