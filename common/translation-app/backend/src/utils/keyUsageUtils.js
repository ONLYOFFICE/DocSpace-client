const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const { appRootPath, projectLocalesMap } = require('../config/config');
const { getAllFiles, convertPathToOS, getWorkSpaces, BASE_DIR, moduleWorkspaces } = require('../../../../tests/utils/files');
const { initializeDatabase, storeTranslationKey, recordKeyUsage, setKeyAutoComment, clearKeyUsageData } = require('./dbUtils');

/**
 * Extracts code context surrounding a specific line
 * @param {string} filePath - Path to the file
 * @param {number} targetLine - Line number to get context for
 * @param {number} contextLines - Number of context lines before and after
 * @returns {Promise<string>} - Code context
 */
async function getCodeContext(filePath, targetLine, contextLines = 2) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const lines = [];
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;
    
    if (lineNumber >= targetLine - contextLines && lineNumber <= targetLine + contextLines) {
      // Add line prefix indicator and line content
      const prefix = lineNumber === targetLine ? '> ' : '  ';
      lines.push(`${prefix}${lineNumber}: ${line}`);
    }
    
    if (lineNumber > targetLine + contextLines) {
      break;
    }
  }

  return lines.join('\n');
}

/**
 * Identifies which module a file belongs to
 * @param {string} filePath - Path to the file
 * @returns {string} - Module name
 */
function identifyModule(filePath) {
  for (const [projectName, localePath] of Object.entries(projectLocalesMap)) {
    if (filePath.includes(localePath)) {
      return projectName;
    }
  }

  // Check module workspaces
  for (const workspace of moduleWorkspaces) {
    if (filePath.includes(workspace)) {
      // Convert path like "packages/client" to "Client"
      const parts = workspace.split('/');
      if (parts.length > 1) {
        return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      }
      return workspace;
    }
  }

  return 'Common';
}

/**
 * Extracts translation keys from a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array>} - Array of translation keys with line numbers
 */
async function extractTranslationKeys(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const keys = [];

    // Common translation patterns in the codebase
    const patterns = [
      // t("key") or t.s("key") or t("key", {options})
      { regex: /[.{\s(]t\??\.?\.?\s*\(\s*["'`]([a-zA-Z0-9_.:\s{}/-]+)["'`]/g, group: 1 },
      // i18nKey="key"
      { regex: /i18nKey=["']([a-zA-Z0-9_.:-]+)["']/g, group: 1 },
      // tKey: "key"
      { regex: /tKey:\s*["']([a-zA-Z0-9_.:-]+)["']/g, group: 1 },
      // getTitle("key")
      { regex: /getTitle\(["']([a-zA-Z0-9_.:-]+)["']\)/g, group: 1 },
      // t.getTitle("key") 
      { regex: /t\.getTitle\(["']([a-zA-Z0-9_.:-]+)["']\)/g, group: 1 },
      // withTranslation(["key1", "key2"])
      { regex: /withTranslation\(\s*\[\s*["']([a-zA-Z0-9_.:-]+)["']/g, group: 1 },
      // useTranslation("namespace")
      { regex: /useTranslation\(\s*["']([a-zA-Z0-9_.:-]+)["']\)/g, group: 1 }
    ];

    // Extract line numbers for matched keys
    const lines = fileContent.split('\n');
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];
      
      for (const pattern of patterns) {
        const matches = [...line.matchAll(pattern.regex)];
        for (const match of matches) {
          const key = match[pattern.group];
          if (key && key.trim()) {
            keys.push({
              key: key.trim(),
              lineNumber: lineNumber + 1,
              matchText: match[0]
            });
          }
        }
      }
    }

    return keys;
  } catch (error) {
    console.error(`Error extracting translation keys from ${filePath}:`, error);
    return [];
  }
}

/**
 * Analyzes the codebase and records translation key usage in the database
 * @returns {Promise<void>}
 */
async function analyzeCodebase() {
  let db = null;
  
  try {
    console.log('Initializing database...');
    db = await initializeDatabase();
    
    // Clear existing usage data for a clean rebuild
    await clearKeyUsageData(db);
    
    console.log('Getting workspaces...');
    const workspaces = getWorkSpaces();
    workspaces.push(path.resolve(BASE_DIR, 'public/locales'));
    
    console.log('Finding JavaScript and TypeScript files...');
    const searchPattern = /\.(js|jsx|ts|tsx)$/;
    const javascripts = workspaces.flatMap(wsPath => {
      const clientDir = path.resolve(BASE_DIR, wsPath);
      
      return getAllFiles(clientDir).filter(
        filePath => 
          filePath && 
          searchPattern.test(filePath) && 
          !filePath.includes('.test.') && 
          !filePath.includes('.stories.')
      );
    });
    
    console.log(`Found ${javascripts.length} JavaScript and TypeScript files to analyze`);
    
    // Process files in batches to avoid memory issues
    const batchSize = 100;
    let processedCount = 0;
    
    for (let i = 0; i < javascripts.length; i += batchSize) {
      const batch = javascripts.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (filePath) => {
        const keys = await extractTranslationKeys(filePath);
        
        for (const { key, lineNumber, matchText } of keys) {
          const keyId = await storeTranslationKey(db, key);
          
          const context = await getCodeContext(filePath, lineNumber);
          const module = identifyModule(filePath);
          
          // Store relative path from project root
          const relativePath = path.relative(appRootPath, filePath);
          
          await recordKeyUsage(db, keyId, relativePath, lineNumber, context, module);
        }
      }));
      
      processedCount += batch.length;
      console.log(`Processed ${processedCount}/${javascripts.length} files`);
    }
    
    console.log('Generating initial auto-comments...');
    await generateAutoComments(db);
    
    console.log('Analysis complete');
  } catch (error) {
    console.error('Error analyzing codebase:', error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

/**
 * Generates automatic comments for translation keys based on their usage patterns
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
async function generateAutoComments(db) {
  try {
    // Get all keys
    const keys = await db.all('SELECT id, key FROM translation_keys');
    
    for (const { id, key } of keys) {
      // Get key usage information
      const usages = await db.all(`
        SELECT file_path, module, COUNT(*) as count
        FROM key_usages
        WHERE key_id = ?
        GROUP BY module
        ORDER BY count DESC
      `, id);
      
      if (usages.length === 0) continue;
      
      // Generate auto-comment based on usage patterns
      let comment = '';
      
      // Add module information
      const modules = [...new Set(usages.map(u => u.module))];
      if (modules.length === 1) {
        comment += `Used in ${modules[0]} module. `;
      } else {
        comment += `Used across multiple modules (${modules.join(', ')}). `;
      }
      
      // Add file count
      const fileCount = usages.reduce((sum, u) => sum + u.count, 0);
      comment += `Found in ${fileCount} location${fileCount !== 1 ? 's' : ''}.`;
      
      // Store auto-comment
      await setKeyAutoComment(db, id, comment);
    }
  } catch (error) {
    console.error('Error generating auto-comments:', error);
  }
}

module.exports = {
  analyzeCodebase,
  extractTranslationKeys,
  getCodeContext,
  identifyModule
};
