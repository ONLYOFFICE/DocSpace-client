const fs = require('fs-extra');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { dbPath } = require('../config/config');

/**
 * Initializes the SQLite database for translation key usage tracking
 * @returns {Promise<Object>} SQLite database connection
 */
async function initializeDatabase() {
  try {
    // Ensure the database directory exists
    const dbDir = path.dirname(path.resolve(dbPath));
    await fs.ensureDir(dbDir);
    
    // Use the configured dbPath directly if it has a file extension,
    // otherwise treat it as a directory and append a filename
    const dbFilePath = dbPath.endsWith('.db') || dbPath.endsWith('.sqlite') 
      ? dbPath 
      : path.join(dbPath, 'translations.db');
    
    // Open the database connection
    const db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database
    });
    
    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS translation_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS key_usages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        line_number INTEGER,
        context TEXT,
        module TEXT,
        FOREIGN KEY (key_id) REFERENCES translation_keys (id) ON DELETE CASCADE,
        UNIQUE (key_id, file_path, line_number)
      );
      
      CREATE TABLE IF NOT EXISTS key_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_id INTEGER NOT NULL,
        comment TEXT,
        is_auto BOOLEAN DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (key_id) REFERENCES translation_keys (id) ON DELETE CASCADE,
        UNIQUE (key_id)
      );
    `);
    
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Stores a translation key in the database
 * @param {Object} db - Database connection
 * @param {string} key - Translation key
 * @returns {Promise<number>} - ID of the inserted/existing key
 */
async function storeTranslationKey(db, key) {
  try {
    // Try to insert the key if it doesn't exist yet
    await db.run('INSERT OR IGNORE INTO translation_keys (key) VALUES (?)', key);
    
    // Get the key's ID
    const result = await db.get('SELECT id FROM translation_keys WHERE key = ?', key);
    return result.id;
  } catch (error) {
    console.error(`Error storing translation key "${key}":`, error);
    throw error;
  }
}

/**
 * Records usage of a translation key in a file
 * @param {Object} db - Database connection
 * @param {number} keyId - ID of the translation key
 * @param {string} filePath - Path to the file where the key is used
 * @param {number} lineNumber - Line number where the key is used
 * @param {string} context - Surrounding code context
 * @param {string} module - Module name
 * @returns {Promise<void>}
 */
async function recordKeyUsage(db, keyId, filePath, lineNumber, context, module) {
  try {
    await db.run(
      'INSERT OR REPLACE INTO key_usages (key_id, file_path, line_number, context, module) VALUES (?, ?, ?, ?, ?)',
      [keyId, filePath, lineNumber, context, module]
    );
  } catch (error) {
    console.error(`Error recording key usage for key ID ${keyId} in ${filePath}:`, error);
    throw error;
  }
}

/**
 * Sets or updates an auto-comment for a translation key
 * @param {Object} db - Database connection
 * @param {number} keyId - ID of the translation key
 * @param {string} comment - Comment text
 * @returns {Promise<void>}
 */
async function setKeyAutoComment(db, keyId, comment) {
  try {
    await db.run(
      'INSERT OR REPLACE INTO key_comments (key_id, comment, is_auto, updated_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)',
      [keyId, comment]
    );
  } catch (error) {
    console.error(`Error setting auto-comment for key ID ${keyId}:`, error);
    throw error;
  }
}

/**
 * Gets usage information for a translation key
 * @param {Object} db - Database connection
 * @param {string} key - Translation key
 * @returns {Promise<Array>} - Array of usage information
 */
async function getKeyUsages(db, key) {
  try {
    const result = await db.all(`
      SELECT ku.file_path, ku.line_number, ku.context, ku.module
      FROM key_usages ku
      JOIN translation_keys tk ON ku.key_id = tk.id
      WHERE tk.key = ?
    `, key);
    
    return result;
  } catch (error) {
    console.error(`Error getting usages for key "${key}":`, error);
    throw error;
  }
}

/**
 * Gets comment for a translation key
 * @param {Object} db - Database connection
 * @param {string} key - Translation key
 * @returns {Promise<Object|null>} - Comment information
 */
async function getKeyComment(db, key) {
  try {
    const result = await db.get(`
      SELECT kc.comment, kc.is_auto, kc.updated_at
      FROM key_comments kc
      JOIN translation_keys tk ON kc.key_id = tk.id
      WHERE tk.key = ?
    `, key);
    
    return result;
  } catch (error) {
    console.error(`Error getting comment for key "${key}":`, error);
    throw error;
  }
}

/**
 * Clears all key usage data for a clean rebuild
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
async function clearKeyUsageData(db) {
  try {
    await db.run('DELETE FROM key_usages');
    // Note: We don't delete from translation_keys or key_comments to preserve user-defined comments
  } catch (error) {
    console.error('Error clearing key usage data:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  storeTranslationKey,
  recordKeyUsage,
  setKeyAutoComment,
  getKeyUsages,
  getKeyComment,
  clearKeyUsageData
};
