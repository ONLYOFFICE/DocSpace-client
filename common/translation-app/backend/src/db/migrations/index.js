/**
 * Database migration manager for the translation app
 */
const fs = require('fs-extra');
const path = require('path');
const { getDatabase } = require('../connection');

/**
 * Runs all migrations in sequence
 */
function runMigrations() {
  const db = getDatabase();
  
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Get list of already applied migrations
  const appliedMigrations = db.prepare('SELECT name FROM migrations').all().map(row => row.name);
  
  // Get all migration files in order
  const migrationsDir = path.join(__dirname);
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .sort();
  
  console.log('Starting database migrations...');
  
  // Run each migration that hasn't been applied yet
  for (const migrationFile of migrationFiles) {
    const migrationName = path.basename(migrationFile, '.js');
    
    if (!appliedMigrations.includes(migrationName)) {
      console.log(`Applying migration: ${migrationName}`);
      
      try {
        // Run the migration in a transaction
        db.transaction(() => {
          const migration = require(path.join(migrationsDir, migrationFile));
          migration.up(db);
          
          // Record that this migration has been applied
          db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
        })();
        
        console.log(`Migration ${migrationName} applied successfully`);
      } catch (error) {
        console.error(`Error applying migration ${migrationName}:`, error);
        throw error;
      }
    } else {
      console.log(`Migration ${migrationName} already applied, skipping`);
    }
  }
  
  console.log('Database migrations completed');
}

/**
 * Initialize the database with all migrations
 */
function initializeDatabase() {
  try {
    runMigrations();
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

module.exports = {
  runMigrations,
  initializeDatabase
};
