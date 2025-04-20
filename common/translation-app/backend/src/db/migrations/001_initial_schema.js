/**
 * Initial database schema migration
 * 
 * Creates the following tables:
 * - translations_metadata: Core metadata for translation keys
 * - figma_references: Figma file and node references for translation keys
 * - comments: Discussion comments on translation keys
 * - code_usages: Tracks where translation keys are used in code
 * - approvals: Workflow for translation review and approval
 * - history: Audit log of changes to translations
 */

/**
 * @param {object} db - Database instance
 */
function up(db) {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create translations_metadata table
  db.exec(`
    CREATE TABLE IF NOT EXISTS translations_metadata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      language TEXT NOT NULL,
      namespace TEXT NOT NULL,
      key_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'normal',
      context TEXT,
      notes TEXT,
      ai_translated BOOLEAN NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_name, language, namespace, key_path)
    )
  `);

  // Create figma_references table
  db.exec(`
    CREATE TABLE IF NOT EXISTS figma_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metadata_id INTEGER NOT NULL,
      figma_file_key TEXT NOT NULL,
      figma_node_id TEXT NOT NULL,
      component_name TEXT,
      screen_name TEXT,
      thumbnail_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (metadata_id) REFERENCES translations_metadata(id) ON DELETE CASCADE
    )
  `);

  // Create comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metadata_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      parent_id INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (metadata_id) REFERENCES translations_metadata(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    )
  `);

  // Create code_usages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS code_usages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      namespace TEXT NOT NULL,
      key_path TEXT NOT NULL,
      file_path TEXT NOT NULL,
      line_number INTEGER NOT NULL,
      context TEXT,
      last_verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_name, namespace, key_path, file_path, line_number)
    )
  `);

  // Create approvals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metadata_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewer_id TEXT,
      reviewer_name TEXT,
      comments TEXT,
      approved_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (metadata_id) REFERENCES translations_metadata(id) ON DELETE CASCADE
    )
  `);

  // Create history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      language TEXT NOT NULL,
      namespace TEXT NOT NULL,
      key_path TEXT NOT NULL,
      action_type TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      user_id TEXT,
      user_name TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_translations_metadata_lookup 
    ON translations_metadata(project_name, language, namespace);
    
    CREATE INDEX IF NOT EXISTS idx_code_usages_lookup 
    ON code_usages(project_name, namespace, key_path);
    
    CREATE INDEX IF NOT EXISTS idx_history_lookup 
    ON history(project_name, language, namespace, key_path);
  `);
}

/**
 * @param {object} db - Database instance
 */
function down(db) {
  // Drop all tables in reverse order of creation
  db.exec(`
    DROP TABLE IF EXISTS history;
    DROP TABLE IF EXISTS approvals;
    DROP TABLE IF EXISTS code_usages;
    DROP TABLE IF EXISTS comments;
    DROP TABLE IF EXISTS figma_references;
    DROP TABLE IF EXISTS translations_metadata;
  `);
}

module.exports = {
  up,
  down
};
