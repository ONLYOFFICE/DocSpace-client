/**
 * Repository for managing comments table
 */
const BaseRepository = require('./base');
const translationsMetadataRepo = require('./translations-metadata');

class CommentsRepository extends BaseRepository {
  constructor() {
    super('comments');
  }

  /**
   * Find comments by translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {Array} Array of comments
   */
  findByTranslationKey(projectName, language, namespace, keyPath) {
    // First find the metadata record
    const metadata = translationsMetadataRepo.findForTranslationKey(
      projectName, language, namespace, keyPath
    );
    
    if (!metadata) {
      return [];
    }
    
    // Find comments by metadata ID, ordered by creation time
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE metadata_id = ? 
      ORDER BY created_at ASC
    `;
    
    return this.query(query, [metadata.id]);
  }

  /**
   * Add a comment to a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @param {object} commentData - Comment data
   * @returns {object} Created comment
   */
  addComment(projectName, language, namespace, keyPath, commentData) {
    // Make sure the metadata exists
    const metadata = translationsMetadataRepo.findOrCreate(
      projectName, language, namespace, keyPath
    );
    
    // Create the comment
    return this.create({
      metadata_id: metadata.id,
      user_id: commentData.userId,
      user_name: commentData.userName,
      comment_text: commentData.text,
      parent_id: commentData.parentId || null
    });
  }

  /**
   * Get thread structure (comments with replies)
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {Array} Array of comments with nested replies
   */
  getThreadStructure(projectName, language, namespace, keyPath) {
    // Get all comments for this translation key
    const allComments = this.findByTranslationKey(
      projectName, language, namespace, keyPath
    );
    
    // Separate root comments from replies
    const rootComments = allComments.filter(c => !c.parent_id);
    const replies = allComments.filter(c => c.parent_id);
    
    // Build comment threads
    return rootComments.map(root => {
      const rootWithReplies = { ...root, replies: [] };
      
      // Add replies to this root comment
      rootWithReplies.replies = replies
        .filter(reply => reply.parent_id === root.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      return rootWithReplies;
    });
  }

  /**
   * Get recent comments for a project
   * @param {string} projectName - Project name
   * @param {number} limit - Maximum number of comments to return
   * @returns {Array} Array of recent comments with translation metadata
   */
  getRecentComments(projectName, limit = 20) {
    const query = `
      SELECT c.*, t.project_name, t.language, t.namespace, t.key_path
      FROM comments c
      JOIN translations_metadata t ON c.metadata_id = t.id
      WHERE t.project_name = ?
      ORDER BY c.created_at DESC
      LIMIT ?
    `;
    
    return this.query(query, [projectName, limit]);
  }

  /**
   * Delete all comments for a translation key
   * @param {string} projectName - Project name
   * @param {string} language - Language code
   * @param {string} namespace - Namespace name
   * @param {string} keyPath - Translation key path
   * @returns {number} Number of deleted comments
   */
  deleteForTranslationKey(projectName, language, namespace, keyPath) {
    // First find the metadata record
    const metadata = translationsMetadataRepo.findForTranslationKey(
      projectName, language, namespace, keyPath
    );
    
    if (!metadata) {
      return 0;
    }
    
    // Delete comments by metadata ID
    return this.deleteBy({ metadata_id: metadata.id });
  }
}

module.exports = new CommentsRepository();
