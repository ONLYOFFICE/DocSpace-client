/**
 * Database connection manager for the translation app
 */
const Database = require("better-sqlite3");
const fs = require("fs-extra");
const path = require("path");
const { dbConfig } = require("./config");

// Singleton connection instance
let db = null;

/**
 * Ensures the database directory exists
 */
function ensureDatabaseDirectory() {
  const dbDir = path.dirname(dbConfig.dbPath);
  fs.ensureDirSync(dbDir);
}

/**
 * Initializes database connection
 * @returns {object} Database connection instance
 */
function initializeDatabase() {
  if (db) {
    return db;
  }

  try {
    // Ensure the database directory exists
    ensureDatabaseDirectory();

    // Create new database connection
    db = new Database(
      path.join(dbConfig.dbPath, "translations.sqlite"),
      dbConfig.connectionOptions
    );

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // For better performance in concurrent environments
    db.pragma("journal_mode = WAL");

    console.log(`Connected to SQLite database at ${dbConfig.dbPath}`);

    return db;
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    throw error;
  }
}

/**
 * Returns database connection instance (creates if needed)
 * @returns {object} Database connection instance
 */
function getDatabase() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

/**
 * Closes the database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log("Database connection closed");
  }
}

// Create database connection on module import
initializeDatabase();

process.on("exit", () => {
  closeDatabase();
});

module.exports = {
  getDatabase,
  closeDatabase,
  initializeDatabase,
};
