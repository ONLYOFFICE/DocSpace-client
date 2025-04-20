/**
 * Database configuration for the translation app
 */
const path = require('path');
const { appRootPath } = require('../config/config');

// Database configuration
const dbConfig = {
  // Database file path
  dbPath: process.env.DB_PATH || path.join(appRootPath, 'db', 'translations.sqlite'),
  
  // Connection options
  connectionOptions: {
    readonly: false,      // Read-write mode
    fileMustExist: false, // Create the file if it doesn't exist
    timeout: 5000,        // Timeout in ms
    verbose: process.env.NODE_ENV === 'development'
  }
};

module.exports = {
  dbConfig
};
