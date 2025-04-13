const fs = require('fs-extra');
const path = require('path');
const { appRootPath, projectLocalesMap, translationConfig } = require('../config/config');

/**
 * Resolves a project's locales directory path
 * @param {string} projectName - Name of the project
 * @returns {string} - Absolute path to the project's locales directory
 */
function resolveProjectPath(projectName) {
  if (!projectLocalesMap[projectName]) {
    throw new Error(`Project "${projectName}" not found in configuration`);
  }
  return path.join(appRootPath, projectLocalesMap[projectName]);
}

/**
 * Gets all available languages for a project
 * @param {string} projectName - Name of the project
 * @returns {Promise<string[]>} - Array of language codes
 */
async function getAvailableLanguages(projectName) {
  try {
    const projectPath = resolveProjectPath(projectName);
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    console.error(`Error getting available languages for project ${projectName}:`, error);
    return [];
  }
}

/**
 * Gets all namespace files for a specific language in a project
 * @param {string} projectName - Name of the project
 * @param {string} language - Language code
 * @returns {Promise<string[]>} - Array of namespace files
 */
async function getNamespaces(projectName, language) {
  try {
    const langPath = path.join(resolveProjectPath(projectName), language);
    const entries = await fs.readdir(langPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && path.extname(entry.name) === '.json')
      .map(entry => path.basename(entry.name, '.json'));
  } catch (error) {
    console.error(`Error getting namespaces for project ${projectName}, language ${language}:`, error);
    return [];
  }
}

/**
 * Reads translation file content
 * @param {string} projectName - Name of the project
 * @param {string} language - Language code
 * @param {string} namespace - Namespace name
 * @returns {Promise<Object|null>} - Translation data
 */
async function readTranslationFile(projectName, language, namespace) {
  try {
    const filePath = path.join(resolveProjectPath(projectName), language, `${namespace}.json`);
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      return null;
    }
    const content = await fs.readJson(filePath);
    return content;
  } catch (error) {
    console.error(`Error reading translation file for project ${projectName}, language ${language}, namespace ${namespace}:`, error);
    return null;
  }
}

/**
 * Writes translation file content
 * @param {string} projectName - Name of the project
 * @param {string} language - Language code
 * @param {string} namespace - Namespace name
 * @param {Object} content - Translation data
 * @returns {Promise<boolean>} - Success status
 */
async function writeTranslationFile(projectName, language, namespace, content) {
  try {
    const langPath = path.join(resolveProjectPath(projectName), language);
    await fs.ensureDir(langPath);
    
    const filePath = path.join(langPath, `${namespace}.json`);
    await fs.writeJson(filePath, content, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error writing translation file for project ${projectName}, language ${language}, namespace ${namespace}:`, error);
    return false;
  }
}

/**
 * Creates a new language folder for a project
 * @param {string} projectName - Name of the project
 * @param {string} language - Language code to create
 * @returns {Promise<boolean>} - Success status
 */
async function createLanguageFolder(projectName, language) {
  try {
    const langPath = path.join(resolveProjectPath(projectName), language);
    await fs.ensureDir(langPath);
    
    // Copy files from base language if it exists
    const baseLanguage = translationConfig.baseLanguage;
    const baseLanguagePath = path.join(resolveProjectPath(projectName), baseLanguage);
    
    if (await fs.pathExists(baseLanguagePath)) {
      const namespaces = await getNamespaces(projectName, baseLanguage);
      
      for (const namespace of namespaces) {
        const baseContent = await readTranslationFile(projectName, baseLanguage, namespace);
        if (baseContent) {
          // Create empty translations for the new language using the base structure
          const emptyContent = createEmptyTranslations(baseContent);
          await writeTranslationFile(projectName, language, namespace, emptyContent);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating language folder for project ${projectName}, language ${language}:`, error);
    return false;
  }
}

/**
 * Creates an empty translation object with the same structure as the source
 * @param {Object} source - Source translation object
 * @returns {Object} - Empty translation object
 */
function createEmptyTranslations(source) {
  const result = {};
  
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = createEmptyTranslations(value);
    } else {
      result[key] = "";
    }
  }
  
  return result;
}

/**
 * Validates if a file is a valid JSON translation file
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - Validation result
 */
async function validateTranslationFile(filePath) {
  try {
    await fs.readJson(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  resolveProjectPath,
  getAvailableLanguages,
  getNamespaces,
  readTranslationFile,
  writeTranslationFile,
  createLanguageFolder,
  validateTranslationFile
};
