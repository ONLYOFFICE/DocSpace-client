require("dotenv").config();
const path = require("path");

// Root path from environment variable
const appRootPath =
  process.env.APP_ROOT_PATH || path.resolve(__dirname, "../../../../../");

// Configuration for file-based metadata storage
const metadataConfig = {
  // Base directory for metadata files
  metaDir: '.meta',
};


// Fixed mapping between project names and their relative locale paths
const projectLocalesMap = {
  Common: "public/locales",
  Client: "packages/client/public/locales",
  DocEditor: "packages/doceditor/public/locales",
  Login: "packages/login/public/locales",
  Management: "packages/management/public/locales",
};

// Server configuration
const serverConfig = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || "0.0.0.0",
  logger: true,
};

// Ollama configuration
const ollamaConfig = {
  apiUrl: process.env.OLLAMA_API_URL || "http://localhost:11434",
};

// Translation configuration
const translationConfig = {
  baseLanguage: process.env.BASE_LANGUAGE || "en",
};

module.exports = {
  appRootPath,
  projectLocalesMap,
  serverConfig,
  ollamaConfig,
  translationConfig,
  metadataConfig,
};
