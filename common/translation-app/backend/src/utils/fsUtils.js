const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const {
  appRootPath,
  projectLocalesMap,
  translationConfig,
} = require("../config/config");

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
      .filter((entry) => entry.isDirectory() && entry.name !== ".meta")
      .map((entry) => entry.name);
  } catch (error) {
    console.error(
      `Error getting available languages for project ${projectName}:`,
      error
    );
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
    const { untranslatedOnly = false, baseLanguage = "en" } = options;
    const langPath = path.join(resolveProjectPath(projectName), language);
    const entries = await fs.readdir(langPath, { withFileTypes: true });

    // Get all namespace files
    const namespaces = entries
      .filter((entry) => entry.isFile() && path.extname(entry.name) === ".json")
      .map((entry) => path.basename(entry.name, ".json"));

    // If untranslatedOnly is false, return all namespaces
    if (!untranslatedOnly) {
      return namespaces;
    }

    // Otherwise, filter namespaces with untranslated keys
    const namespaceWithUntranslatedKeys = [];

    // Get available languages to compare with
    const languages = await getAvailableLanguages(projectName);
    const targetLanguages = languages.filter((lang) => lang !== baseLanguage);

    // Check each namespace for untranslated keys
    for (const namespace of namespaces) {
      // Get base language translations for this namespace
      const baseTranslations = await readTranslationFile(
        projectName,
        baseLanguage,
        namespace
      );
      if (!baseTranslations) continue;

      // Check if this namespace has untranslated keys in any target language
      let hasUntranslatedKeys = false;

      // Logic to determine if a nested object has untranslated keys
      const checkForUntranslatedKeys = async (targetLang) => {
        const targetTranslations = await readTranslationFile(
          projectName,
          targetLang,
          namespace
        );
        if (!targetTranslations) return true; // Missing translation file means untranslated

        // Compare keys recursively
        const compareObjects = (baseObj, targetObj, path = "") => {
          for (const key in baseObj) {
            const currentPath = path ? `${path}.${key}` : key;

            // Skip if base value is empty or null
            if (baseObj[key] === null || baseObj[key] === "") continue;

            // Check if key exists in target
            if (!(key in targetObj)) return true;

            // If nested object, recurse
            if (
              typeof baseObj[key] === "object" &&
              baseObj[key] !== null &&
              typeof targetObj[key] === "object" &&
              targetObj[key] !== null
            ) {
              if (compareObjects(baseObj[key], targetObj[key], currentPath))
                return true;
            }
            // If value is missing or empty in target language
            else if (
              typeof baseObj[key] === "string" &&
              (targetObj[key] === null || targetObj[key] === "")
            ) {
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
    console.error(
      `Error getting namespaces for project ${projectName}, language ${language}:`,
      error
    );
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
    const filePath = path.join(
      resolveProjectPath(projectName),
      language,
      `${namespace}.json`
    );
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      console.log(
        `Translation file not found: ${filePath}, creating empty file...`
      );
      await writeTranslationFile(projectName, language, namespace, {});
      return {};
    }
    const content = await fs.readJson(filePath);
    return content;
  } catch (error) {
    console.error(
      `Error reading translation file for project ${projectName}, language ${language}, namespace ${namespace}:`,
      error
    );
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
    await writeJsonWithConsistentEol(filePath, content);
    return true;
  } catch (error) {
    console.error(
      `Error writing translation file for project ${projectName}, language ${language}, namespace ${namespace}:`,
      error
    );
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
    const baseLanguagePath = path.join(
      resolveProjectPath(projectName),
      baseLanguage
    );

    if (await fs.pathExists(baseLanguagePath)) {
      const namespaces = await getNamespaces(projectName, baseLanguage);

      for (const namespace of namespaces) {
        const baseContent = await readTranslationFile(
          projectName,
          baseLanguage,
          namespace
        );
        if (baseContent) {
          // Create empty translations for the new language using the base structure
          const emptyContent = createEmptyTranslations(baseContent);
          await writeTranslationFile(
            projectName,
            language,
            namespace,
            emptyContent
          );
        }
      }
    }

    return true;
  } catch (error) {
    console.error(
      `Error creating language folder for project ${projectName}, language ${language}:`,
      error
    );
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
    if (typeof value === "object" && value !== null) {
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

        await renameMetaNamespace(projectName, oldName, newName);
      }
    }

    return true;
  } catch (error) {
    console.error(
      `Error renaming namespace from ${oldName} to ${newName} for project ${projectName}:`,
      error
    );
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
async function moveNamespaceTo(
  sourceProjectName,
  sourceNamespace,
  targetProjectName,
  targetNamespace
) {
  try {
    // Check if the source namespace exists and target namespace exists
    const baseLanguage = translationConfig.baseLanguage;
    const sourceNamespaces = await getNamespaces(
      sourceProjectName,
      baseLanguage
    );

    if (!sourceNamespaces.includes(sourceNamespace)) {
      throw new Error(
        `Source namespace "${sourceNamespace}" does not exist in project ${sourceProjectName}`
      );
    }

    // Get all available languages from both projects
    const sourceLanguages = await getAvailableLanguages(sourceProjectName);
    const targetLanguages = await getAvailableLanguages(targetProjectName);

    // Process the move for each language
    for (const language of sourceLanguages) {
      // Skip if the language doesn't exist in the target project
      if (!targetLanguages.includes(language)) {
        console.warn(
          `Language ${language} not found in target project ${targetProjectName}. Skipping.`
        );
        continue;
      }

      // Read source content
      const sourceContent = await readTranslationFile(
        sourceProjectName,
        language,
        sourceNamespace
      );
      if (!sourceContent) {
        console.warn(
          `No content found for ${language}/${sourceNamespace} in project ${sourceProjectName}. Skipping.`
        );
        continue;
      }

      // Read target content if it exists, or create empty
      let targetContent =
        (await readTranslationFile(
          targetProjectName,
          language,
          targetNamespace
        )) || {};

      // Merge content (source takes precedence in case of conflicts)
      targetContent = { ...targetContent, ...sourceContent };

      // Write merged content to target
      await writeTranslationFile(
        targetProjectName,
        language,
        targetNamespace,
        targetContent
      );
    }

    await moveMetaNamespace(
      sourceProjectName,
      sourceNamespace,
      targetProjectName,
      targetNamespace
    );

    // Delete the source namespace now that content is moved
    await deleteNamespace(sourceProjectName, sourceNamespace);

    return true;
  } catch (error) {
    console.error(
      `Error moving namespace ${sourceNamespace} from project ${sourceProjectName} to ${targetNamespace} in project ${targetProjectName}:`,
      error
    );
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
        await removeMetaNamespace(projectName, namespace);
        deletedAny = true;
      }
    }

    if (!deletedAny) {
      throw new Error(
        `Namespace "${namespace}" not found in project ${projectName}`
      );
    }

    return true;
  } catch (error) {
    console.error(
      `Error deleting namespace ${namespace} for project ${projectName}:`,
      error
    );
    throw error; // Re-throw to handle in route
  }
}

/**
 * Checks if a project has any untranslated keys in any namespace
 * @param {string} projectName - Name of the project
 * @param {string} baseLanguage - The base language to compare against (typically 'en')
 * @returns {Promise<boolean>} - Returns true if the project has untranslated keys, false if all are translated
 */
async function projectHasUntranslatedKeys(projectName, baseLanguage = "en") {
  try {
    // Get all languages and namespaces
    const languages = await getAvailableLanguages(projectName);
    const targetLanguages = languages.filter((lang) => lang !== baseLanguage);

    // If there are no other languages, consider the project fully translated
    if (targetLanguages.length === 0) return false;

    const namespaces = await getNamespaces(projectName, baseLanguage);

    // Check each namespace for untranslated content
    for (const namespace of namespaces) {
      const baseTranslations = await readTranslationFile(
        projectName,
        baseLanguage,
        namespace
      );
      if (!baseTranslations) continue;

      // Check each target language for untranslated content in this namespace
      for (const targetLang of targetLanguages) {
        const targetTranslations = await readTranslationFile(
          projectName,
          targetLang,
          namespace
        );
        if (!targetTranslations) return true; // Missing translation file means untranslated

        // Compare keys recursively
        const hasUntranslated = compareTranslations(
          baseTranslations,
          targetTranslations
        );
        if (hasUntranslated) return true;
      }
    }

    // If we get here, all keys in all namespaces are translated
    return false;
  } catch (error) {
    console.error(
      `Error checking untranslated keys for project ${projectName}:`,
      error
    );
    // In case of error, assume there are untranslated keys
    return true;
  }
}

/**
 * Helper function to compare two translation objects recursively
 * @param {Object} baseObj - The base language translation object
 * @param {Object} targetObj - The target language translation object
 * @returns {boolean} - Returns true if untranslated keys are found
 */
function compareTranslations(baseObj, targetObj, path = "") {
  for (const key in baseObj) {
    const currentPath = path ? `${path}.${key}` : key;

    // Skip if base value is empty or null
    if (baseObj[key] === null || baseObj[key] === "") continue;

    // Check if key exists in target
    if (!(key in targetObj)) return true;

    // If nested object, recurse
    if (
      typeof baseObj[key] === "object" &&
      baseObj[key] !== null &&
      typeof targetObj[key] === "object" &&
      targetObj[key] !== null
    ) {
      if (compareTranslations(baseObj[key], targetObj[key], currentPath))
        return true;
    }
    // If value is missing or empty in target language
    else if (
      typeof baseObj[key] === "string" &&
      (targetObj[key] === null || targetObj[key] === "")
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Writes JSON to a file with consistent line endings across platforms
 * @param {string} filePath - Path to the file
 * @param {Object} content - JSON content to write
 * @param {Object} options - Options object
 * @param {number} options.spaces - Number of spaces for indentation (default: 2)
 * @returns {Promise<void>}
 */
async function writeJsonWithConsistentEol(filePath, content, options = {}) {
  try {
    const spaces = options.spaces || 2;
    await fs.ensureDir(path.dirname(filePath));

    // Use JSON.stringify with explicit options to ensure consistent line endings
    const jsonContent = JSON.stringify(content, null, spaces);
    await fs.writeFile(filePath, jsonContent, { encoding: "utf8" });
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Writes JSON to a file with consistent line endings across platforms (Synchronous version)
 * @param {string} filePath - Path to the file
 * @param {Object} content - JSON content to write
 * @param {Object} options - Options object
 * @param {number} options.spaces - Number of spaces for indentation (default: 2)
 */
function writeJsonWithConsistentEolSync(filePath, content, options = {}) {
  try {
    const spaces = options.spaces || 2;
    fs.ensureDirSync(path.dirname(filePath));

    // Use JSON.stringify with explicit options to ensure consistent line endings
    const jsonContent = JSON.stringify(content, null, spaces);
    fs.writeFileSync(filePath, jsonContent, { encoding: "utf8" });
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Find metadata file for a specific key
 * @param {string} projectName - Project name
 * @param {string} namespace - Namespace
 * @param {string} keyPath - Key path
 * @returns {Promise<{filePath: string, data: object}>} Metadata file info
 */
async function findMetadataFile(projectName, namespace, keyPath) {
  const localesPath = projectLocalesMap[projectName];
  if (!localesPath) {
    throw new Error(`Project ${projectName} not found in configuration`);
  }

  const projectPath = path.join(appRootPath, localesPath);
  const metaDir = path.join(projectPath, ".meta");
  const namespacePath = path.join(metaDir, namespace);
  const metadataFilePath = path.join(namespacePath, `${keyPath}.json`);

  if (await fs.pathExists(metadataFilePath)) {
    const data = await fs.readJson(metadataFilePath);
    return { filePath: metadataFilePath, data };
  }

  return null;
}

/**
 * Find all metadata files for a namespace
 * @param {string} projectName - Project name
 * @param {string} namespace - Namespace
 * @returns {Promise<Array<{filePath: string, data: object}>>} Metadata files
 */
async function findNamespaceMetadataFiles(projectName, namespace) {
  const localesPath = projectLocalesMap[projectName];
  if (!localesPath) {
    throw new Error(`Project ${projectName} not found in configuration`);
  }

  const projectPath = path.join(appRootPath, localesPath);
  const metaDir = path.join(projectPath, ".meta");
  const namespacePath = path.join(metaDir, namespace);

  if (!(await fs.pathExists(namespacePath))) {
    return [];
  }

  // Use normalized path with forward slashes for glob to work on all platforms
  const namespacePathPattern = path
    .join(namespacePath, "*.json")
    .replace(/\\/g, "/");
  const files = glob.sync(namespacePathPattern);
  const result = [];

  for (const filePath of files) {
    try {
      const data = await fs.readJson(filePath);
      result.push({ filePath, data });
    } catch (error) {
      console.error(`Error reading metadata file ${filePath}:`, error);
    }
  }

  return result;
}

/**
 * Remove metadata file for a specific key
 * @param {string} projectName - Project name
 * @param {string} namespace - Namespace
 * @param {string} keyPath - Key path
 * @returns {Promise<boolean>} Success status
 */
async function removeMetaFile(projectName, namespace, keyPath) {
  try {
    const localesPath = projectLocalesMap[projectName];
    if (!localesPath) {
      throw new Error(`Project ${projectName} not found in configuration`);
    }

    const projectPath = path.join(appRootPath, localesPath);
    const metaDir = path.join(projectPath, ".meta");
    const namespacePath = path.join(metaDir, namespace);
    const metadataFilePath = path.join(namespacePath, `${keyPath}.json`);

    if (await fs.pathExists(metadataFilePath)) {
      await fs.remove(metadataFilePath);
      console.log(`Removed metadata file: ${metadataFilePath}`);
      return true;
    } else {
      console.log(`Metadata file not found: ${metadataFilePath}`);
      return false;
    }
  } catch (error) {
    console.error(
      `Error removing metadata file for project ${projectName}, namespace ${namespace}, key ${keyPath}:`,
      error
    );
    return false;
  }
}

/**
 * Removes a namespace directory and its contents
 * @param {string} projectName - Name of the project
 * @param {string} namespace - Namespace to remove
 * @returns {Promise<boolean>} Success status
 */
async function removeMetaNamespace(projectName, namespace) {
  try {
    const localesPath = projectLocalesMap[projectName];
    if (!localesPath) {
      throw new Error(`Project ${projectName} not found in configuration`);
    }

    const projectPath = path.join(appRootPath, localesPath);
    const metaDir = path.join(projectPath, ".meta");
    const namespacePath = path.join(metaDir, namespace);

    if (await fs.pathExists(namespacePath)) {
      await fs.remove(namespacePath);
      console.log(`Removed metadata namespace: ${namespacePath}`);
      return true;
    } else {
      console.log(`Metadata namespace not found: ${namespacePath}`);
      return false;
    }
  } catch (error) {
    console.error(
      `Error removing metadata namespace for project ${projectName}, namespace ${namespace}:`,
      error
    );
    return false;
  }
}

/**
 * Renames a namespace directory and its contents
 * @param {string} projectName - Name of the project
 * @param {string} oldName - Current namespace name
 * @param {string} newName - New namespace name
 * @returns {Promise<boolean>} - Success status
 */
async function renameMetaNamespace(projectName, oldName, newName) {
  try {
    const localesPath = projectLocalesMap[projectName];
    if (!localesPath) {
      throw new Error(`Project ${projectName} not found in configuration`);
    }

    const projectPath = path.join(appRootPath, localesPath);
    const metaDir = path.join(projectPath, ".meta");
    const oldNamespacePath = path.join(metaDir, oldName);
    const newNamespacePath = path.join(metaDir, newName);

    if (await fs.pathExists(oldNamespacePath)) {
      await fs.move(oldNamespacePath, newNamespacePath, { overwrite: false });
      console.log(
        `Renamed metadata namespace: ${oldNamespacePath} -> ${newNamespacePath}`
      );
      return true;
    } else {
      console.log(`Metadata namespace not found: ${oldNamespacePath}`);
      return false;
    }
  } catch (error) {
    console.error(
      `Error renaming metadata namespace for project ${projectName}, namespace ${oldName}:`,
      error
    );
    return false;
  }
}

/**
 * Moves a namespace directory and its contents
 * @param {string} sourceProjectName - Source project name
 * @param {string} sourceNamespace - Source namespace name
 * @param {string} targetProjectName - Target project name
 * @param {string} targetNamespace - Target namespace name
 * @returns {Promise<boolean>} - Success status
 */
async function moveMetaNamespace(
  sourceProjectName,
  sourceNamespace,
  targetProjectName,
  targetNamespace
) {
  try {
    const localesPath = projectLocalesMap[sourceProjectName];
    if (!localesPath) {
      throw new Error(
        `Project ${sourceProjectName} not found in configuration`
      );
    }

    const sourceProjectPath = path.join(appRootPath, localesPath);
    const sourceMetaDir = path.join(sourceProjectPath, ".meta");
    const sourceNamespacePath = path.join(sourceMetaDir, sourceNamespace);
    const targetProjectPath = path.join(
      appRootPath,
      projectLocalesMap[targetProjectName]
    );
    const targetMetaDir = path.join(targetProjectPath, ".meta");
    const targetNamespacePath = path.join(targetMetaDir, targetNamespace);

    if (await fs.pathExists(sourceNamespacePath)) {
      // TODO: move all files from source namespace to target namespace
      const files = await fs.readdir(sourceNamespacePath);
      for (const file of files) {
        await fs.move(
          path.join(sourceNamespacePath, file),
          path.join(targetNamespacePath, file),
          {
            overwrite: false,
          }
        );
      }

      await fs.remove(sourceNamespacePath);
      console.log(
        `Moved metadata namespace: ${sourceNamespacePath} -> ${targetNamespacePath}`
      );
      return true;
    } else {
      console.log(`Metadata namespace not found: ${sourceNamespacePath}`);
      return false;
    }
  } catch (error) {
    console.error(
      `Error moving metadata namespace for project ${sourceProjectName}, namespace ${sourceNamespace}:`,
      error
    );
    return false;
  }
}

module.exports = {
  resolveProjectPath,
  getAvailableLanguages,
  getNamespaces,
  readTranslationFile,
  writeTranslationFile,
  projectHasUntranslatedKeys,
  createLanguageFolder,
  createEmptyTranslations,
  validateTranslationFile,
  renameNamespace,
  moveNamespaceTo,
  deleteNamespace,
  writeJsonWithConsistentEol,
  writeJsonWithConsistentEolSync,
  findMetadataFile,
  findNamespaceMetadataFiles,
  removeMetaFile,
};
