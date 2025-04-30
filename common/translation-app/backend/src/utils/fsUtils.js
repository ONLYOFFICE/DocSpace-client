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
 * @param {Object} options - Additional options
 * @param {boolean} options.untranslatedOnly - Filter namespaces that have untranslated keys
 * @param {string} options.baseLanguage - Base language to compare against (required if untranslatedOnly is true)
 * @returns {Promise<string[]>} - Array of namespace files
 */
async function getNamespaces(projectName, language, options = {}) {
  try {
    const { untranslatedOnly = false, baseLanguage = 'en' } = options;
    const langPath = path.join(resolveProjectPath(projectName), language);
    const entries = await fs.readdir(langPath, { withFileTypes: true });
    
    // Get all namespace files
    const namespaces = entries
      .filter(entry => entry.isFile() && path.extname(entry.name) === '.json')
      .map(entry => path.basename(entry.name, '.json'));
    
    // If untranslatedOnly is false, return all namespaces
    if (!untranslatedOnly) {
      return namespaces;
    }
    
    // Otherwise, filter namespaces with untranslated keys
    const namespaceWithUntranslatedKeys = [];
    
    // Get available languages to compare with
    const languages = await getAvailableLanguages(projectName);
    const targetLanguages = languages.filter(lang => lang !== baseLanguage);
    
    // Check each namespace for untranslated keys
    for (const namespace of namespaces) {
      // Get base language translations for this namespace
      const baseTranslations = await readTranslationFile(projectName, baseLanguage, namespace);
      if (!baseTranslations) continue;
      
      // Check if this namespace has untranslated keys in any target language
      let hasUntranslatedKeys = false;
      
      // Logic to determine if a nested object has untranslated keys
      const checkForUntranslatedKeys = async (targetLang) => {
        const targetTranslations = await readTranslationFile(projectName, targetLang, namespace);
        if (!targetTranslations) return true; // Missing translation file means untranslated
        
        // Compare keys recursively
        const compareObjects = (baseObj, targetObj, path = '') => {
          for (const key in baseObj) {
            const currentPath = path ? `${path}.${key}` : key;
            
            // Skip if base value is empty or null
            if (baseObj[key] === null || baseObj[key] === '') continue;
            
            // Check if key exists in target
            if (!(key in targetObj)) return true;
            
            // If nested object, recurse
            if (typeof baseObj[key] === 'object' && baseObj[key] !== null && 
                typeof targetObj[key] === 'object' && targetObj[key] !== null) {
              if (compareObjects(baseObj[key], targetObj[key], currentPath)) return true;
            } 
            // If value is missing or empty in target language
            else if (typeof baseObj[key] === 'string' && 
                    (targetObj[key] === null || targetObj[key] === '')) {
              return true;
            }
          }
          return false;
        };
        
        return compareObjects(baseTranslations, targetTranslations);
      };
      
      // Check each target language for untranslated content
      for (const targetLang of targetLanguages) {
        if (await checkForUntranslatedKeys(targetLang)) {
          hasUntranslatedKeys = true;
          break; // Found an untranslated key, no need to check other languages
        }
      }
      
      if (hasUntranslatedKeys) {
        namespaceWithUntranslatedKeys.push(namespace);
      }
    }
    
    return namespaceWithUntranslatedKeys;
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

/**
 * Renames a namespace across all language folders for a project
 * @param {string} projectName - Name of the project
 * @param {string} oldName - Current namespace name
 * @param {string} newName - New namespace name
 * @returns {Promise<boolean>} - Success status
 */
async function renameNamespace(projectName, oldName, newName) {
  try {
    // Check if new name already exists
    const baseLanguage = translationConfig.baseLanguage;
    const baseNamespaces = await getNamespaces(projectName, baseLanguage);
    
    if (baseNamespaces.includes(newName)) {
      throw new Error(`Namespace "${newName}" already exists`);
    }
    
    // Rename the namespace file in all language folders
    const languages = await getAvailableLanguages(projectName);
    const projectPath = resolveProjectPath(projectName);
    
    for (const language of languages) {
      const oldPath = path.join(projectPath, language, `${oldName}.json`);
      const newPath = path.join(projectPath, language, `${newName}.json`);
      
      // Only rename if old file exists
      if (await fs.pathExists(oldPath)) {
        await fs.move(oldPath, newPath, { overwrite: false });
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error renaming namespace from ${oldName} to ${newName} for project ${projectName}:`, error);
    throw error; // Re-throw to handle in route
  }
}

/**
 * Moves namespace content from one namespace to another, potentially across projects
 * @param {string} sourceProjectName - Source project name
 * @param {string} sourceNamespace - Source namespace name
 * @param {string} targetProjectName - Target project name
 * @param {string} targetNamespace - Target namespace name
 * @returns {Promise<boolean>} - Success status
 */
async function moveNamespaceTo(sourceProjectName, sourceNamespace, targetProjectName, targetNamespace) {
  try {
    // Check if the source namespace exists and target namespace exists
    const baseLanguage = translationConfig.baseLanguage;
    const sourceNamespaces = await getNamespaces(sourceProjectName, baseLanguage);
    
    if (!sourceNamespaces.includes(sourceNamespace)) {
      throw new Error(`Source namespace "${sourceNamespace}" does not exist in project ${sourceProjectName}`);
    }
    
    // Get all available languages from both projects
    const sourceLanguages = await getAvailableLanguages(sourceProjectName);
    const targetLanguages = await getAvailableLanguages(targetProjectName);
    
    // Process the move for each language
    for (const language of sourceLanguages) {
      // Skip if the language doesn't exist in the target project
      if (!targetLanguages.includes(language)) {
        console.warn(`Language ${language} not found in target project ${targetProjectName}. Skipping.`);
        continue;
      }
      
      // Read source content
      const sourceContent = await readTranslationFile(sourceProjectName, language, sourceNamespace);
      if (!sourceContent) {
        console.warn(`No content found for ${language}/${sourceNamespace} in project ${sourceProjectName}. Skipping.`);
        continue;
      }
      
      // Read target content if it exists, or create empty
      let targetContent = await readTranslationFile(targetProjectName, language, targetNamespace) || {};
      
      // Merge content (source takes precedence in case of conflicts)
      targetContent = { ...targetContent, ...sourceContent };
      
      // Write merged content to target
      await writeTranslationFile(targetProjectName, language, targetNamespace, targetContent);
    }
    
    // Delete the source namespace now that content is moved
    await deleteNamespace(sourceProjectName, sourceNamespace);
    
    return true;
  } catch (error) {
    console.error(`Error moving namespace ${sourceNamespace} from project ${sourceProjectName} to ${targetNamespace} in project ${targetProjectName}:`, error);
    throw error; // Re-throw to handle in route
  }
}

/**
 * Deletes a namespace across all language folders for a project
 * @param {string} projectName - Name of the project
 * @param {string} namespace - Namespace to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deleteNamespace(projectName, namespace) {
  try {
    const languages = await getAvailableLanguages(projectName);
    const projectPath = resolveProjectPath(projectName);
    let deletedAny = false;
    
    for (const language of languages) {
      const filePath = path.join(projectPath, language, `${namespace}.json`);
      
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        deletedAny = true;
      }
    }
    
    if (!deletedAny) {
      throw new Error(`Namespace "${namespace}" not found in project ${projectName}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting namespace ${namespace} for project ${projectName}:`, error);
    throw error; // Re-throw to handle in route
  }
}

module.exports = {
  resolveProjectPath,
  getAvailableLanguages,
  getNamespaces,
  readTranslationFile,
  writeTranslationFile,
  createLanguageFolder,
  createEmptyTranslations,
  validateTranslationFile,
  renameNamespace,
  moveNamespaceTo,
  deleteNamespace
};
