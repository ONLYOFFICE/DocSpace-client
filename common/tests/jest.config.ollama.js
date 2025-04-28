// Custom Jest configuration for Ollama tests
// This configuration extends the base configuration but with different timeout settings

// Clone the base config
const baseConfig = require('./jest.config.js');

// Create a new configuration specifically for Ollama tests
module.exports = {
  ...baseConfig,
  // Set a reasonable timeout for Ollama tests (1 hour)
  testTimeout: 3600000,
  // Only run the Ollama tests
  testMatch: ['<rootDir>/test/ollama.test.js']
};
