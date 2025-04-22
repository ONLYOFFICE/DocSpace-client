const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");
const { appRootPath, projectLocalesMap } = require("../config/config");
const {
  getAllFiles,
  convertPathToOS,
  getWorkSpaces,
  BASE_DIR,
  moduleWorkspaces,
} = require("../../../../tests/utils/files");
const {
  initializeDatabase,
  storeTranslationKey,
  recordKeyUsage,
  setKeyAutoComment,
  clearKeyUsageData,
} = require("./dbUtils");

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
    crlfDelay: Infinity,
  });

  const lines = [];
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;

    if (
      lineNumber >= targetLine - contextLines &&
      lineNumber <= targetLine + contextLines
    ) {
      // Add line prefix indicator and line content
      const prefix = lineNumber === targetLine ? "> " : "  ";
      lines.push(`${prefix}${lineNumber}: ${line}`);
    }

    if (lineNumber > targetLine + contextLines) {
      break;
    }
  }

  return lines.join("\n");
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
      const parts = workspace.split("/");
      if (parts.length > 1) {
        return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      }
      return workspace;
    }
  }

  return "Common";
}

/**
 * Extracts translation keys from a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array>} - Array of translation keys with line numbers
 */
async function extractTranslationKeys(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const keys = [];

    // Common translation patterns in the codebase
    const patterns = [
      // t("key") or t.s("key") or t("key", {options})
      {
        regex: /[.{\s(]t\??\.?\.?\s*\(\s*["'`]([a-zA-Z0-9_.:\s{}/-]+)["'`]/g,
        group: 1,
      },
      // i18nKey="key"
      { regex: /i18nKey=["']([a-zA-Z0-9_.:-]+)["']/g, group: 1 },
      // tKey: "key"
      { regex: /tKey:\s*["']([a-zA-Z0-9_.:-]+)["']/g, group: 1 },
      // getTitle("key")
      { regex: /getTitle\(["']([a-zA-Z0-9_.:-]+)["']\)/g, group: 1 },
      // t.getTitle("key")
      { regex: /t\.getTitle\(["']([a-zA-Z0-9_.:-]+)["']\)/g, group: 1 },
      // withTranslation(["key1", "key2"])
      {
        regex: /withTranslation\(\s*\[\s*["']([a-zA-Z0-9_.:-]+)["']/g,
        group: 1,
      },
      // useTranslation("namespace")
      { regex: /useTranslation\(\s*["']([a-zA-Z0-9_.:-]+)["']\)/g, group: 1 },
    ];

    // Extract line numbers for matched keys
    const lines = fileContent.split("\n");
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
              matchText: match[0],
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
    console.log("Initializing database...");
    db = await initializeDatabase();

    // Clear existing usage data for a clean rebuild
    await clearKeyUsageData(db);

    console.log("Getting workspaces...");
    const workspaces = getWorkSpaces();
    workspaces.push(path.resolve(BASE_DIR, "public/locales"));

    console.log("Finding JavaScript and TypeScript files...");
    const searchPattern = /\.(js|jsx|ts|tsx)$/;
    const javascripts = workspaces.flatMap((wsPath) => {
      const clientDir = path.resolve(BASE_DIR, wsPath);

      return getAllFiles(clientDir).filter(
        (filePath) =>
          filePath &&
          searchPattern.test(filePath) &&
          !filePath.includes(".test.") &&
          !filePath.includes(".stories.")
      );
    });

    console.log(
      `Found ${javascripts.length} JavaScript and TypeScript files to analyze`
    );

    // Process files in batches to avoid memory issues
    const batchSize = 100;
    let processedCount = 0;

    for (let i = 0; i < javascripts.length; i += batchSize) {
      const batch = javascripts.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (filePath) => {
          const keys = await extractTranslationKeys(filePath);

          for (const { key, lineNumber, matchText } of keys) {
            const keyId = await storeTranslationKey(db, key);

            const context = await getCodeContext(filePath, lineNumber);
            const module = identifyModule(filePath);

            // Store relative path from project root
            const relativePath = path.relative(appRootPath, filePath);

            await recordKeyUsage(
              db,
              keyId,
              relativePath,
              lineNumber,
              context,
              module
            );
          }
        })
      );

      processedCount += batch.length;
      console.log(`Processed ${processedCount}/${javascripts.length} files`);
    }

    console.log("Generating initial auto-comments...");
    await generateAutoComments(db);

    console.log("Analysis complete");
  } catch (error) {
    console.error("Error analyzing codebase:", error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

const { Ollama } = require("ollama");
const { ollamaConfig } = require("../config/config");

/**
 * Verify Ollama is available
 * @returns {Promise<boolean>} true if Ollama is available
 */
async function verifyOllamaConnection() {
  try {
    const response = await fetch(`${ollamaConfig.apiUrl}/api/tags`);
    if (!response.ok) {
      console.log(
        `Ollama connection failed: ${response.status} ${response.statusText}`
      );
      return false;
    }
    const data = await response.json();
    return true;
  } catch (error) {
    console.log(`Ollama connection error: ${error.message}`);
    return false;
  }
}

/**
 * Generate an enhanced comment for a translation key using Ollama
 * @param {string} key - The translation key
 * @param {Array} usages - Usage information for the key
 * @param {Array} contexts - Context lines from code where the key is used
 * @returns {Promise<string>} Enhanced comment
 */
async function generateEnhancedComment(key, usages, contexts = []) {
  try {
    // First check if Ollama is available
    const isConnected = await verifyOllamaConnection();
    if (!isConnected) {
      console.log("Ollama service unavailable, falling back to basic comment");
      return generateBasicComment(key, usages);
    }

    // Extract useful information for the prompt
    const modules = [...new Set(usages.map((u) => u.module))];
    const fileCount = usages.reduce((sum, u) => sum + u.count, 0);
    const keySegments = key.split(":");
    const keyName = keySegments.length > 1 ? keySegments[1] : key;

    // Get up to 5 file paths where the key is used
    const sampleUsages = usages.slice(0, 5).map((u) => u.file_path);

    // Create context string from actual code snippets if available
    let contextString = "";
    if (contexts && contexts.length > 0) {
      contextString =
        "\nCode contexts where this key appears:\n" +
        contexts
          .slice(0, 3)
          .map((ctx) => `"${ctx.trim()}"`)
          .join("\n");
    }

    // Create a prompt for Ollama
    const prompt = `You are an expert localization assistant helping translators understand how translation keys are used in a software application.

Translation key: "${key}"

Usage information:
- ${modules.length === 1 ? `Used in the ${modules[0]} module` : `Used across multiple modules: ${modules.join(", ")}`}
- Found in ${fileCount} location${fileCount !== 1 ? "s" : ""}
- Sample file paths: ${sampleUsages.join(", ")}${contextString}

Instructions:
1. Write a clear, concise comment (max 2-3 sentences) explaining what this translation key likely represents
2. Include any relevant context about how and where it's used
3. If the key name suggests specific formatting needs (like placeholders, HTML, plural forms), mention them
4. Provide guidance that would help a translator produce an accurate translation

Your comment should be informative and helpful for translators who need to understand the context to translate correctly.`;

    // Use Ollama to generate the comment
    const ollamaClient = new Ollama({ host: ollamaConfig.apiUrl });
    const model = process.env.OLLAMA_DEFAULT_MODEL || "gemma3:12b";

    console.log(
      `Generating enhanced comment for key: ${key} using model: ${model}`
    );

    const { response } = await ollamaClient.generate({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2, // Slightly creative but mostly factual
      },
    });

    // Clean up the response - remove any extraneous formatting
    const cleanedResponse = response
      .trim()
      .replace(/^Comment:\s*/i, "")
      .replace(/^\*\*.*?\*\*:\s*/i, "");

    // Combine with basic usage info to ensure key data is always present
    const basicInfo = generateBasicComment(key, usages);
    return `${cleanedResponse}\n\n(${basicInfo})`;
  } catch (error) {
    console.error("Error generating enhanced comment:", error);
    // Fall back to basic comment if there's an error
    return generateBasicComment(key, usages);
  }
}

/**
 * Generate a basic comment without using Ollama
 * @param {string} key - The translation key
 * @param {Array} usages - Usage information for the key
 * @returns {string} Basic comment
 */
function generateBasicComment(key, usages) {
  let comment = "";

  // Add module information
  const modules = [...new Set(usages.map((u) => u.module))];
  if (modules.length === 1) {
    comment += `Used in ${modules[0]} module. `;
  } else {
    comment += `Used across multiple modules (${modules.join(", ")}). `;
  }

  // Add file count
  const fileCount = usages.reduce((sum, u) => sum + u.count, 0);
  comment += `Found in ${fileCount} location${fileCount !== 1 ? "s" : ""}.`;

  return comment;
}

/**
 * Retrieves code context for a key from usage locations
 * @param {Object} db - Database connection
 * @param {number} keyId - Key ID
 * @returns {Promise<Array>} Array of context snippets
 */
async function getCodeContexts(db, keyId) {
  try {
    const contexts = await db.all(
      `
      SELECT context
      FROM key_usages
      WHERE key_id = ?
      LIMIT 5
    `,
      keyId
    );

    return contexts.map((c) => c.context);
  } catch (error) {
    console.error("Error getting code contexts:", error);
    return [];
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
    const keys = await db.all("SELECT id, key FROM translation_keys");

    console.log(`Generating auto-comments for ${keys.length} keys`);
    let processed = 0;

    for (const { id, key } of keys) {
      // Get key usage information
      const usages = await db.all(
        `
        SELECT file_path, module, COUNT(*) as count
        FROM key_usages
        WHERE key_id = ?
        GROUP BY module
        ORDER BY count DESC
      `,
        id
      );

      if (usages.length === 0) continue;

      // Get code contexts where this key is used
      const contexts = await getCodeContexts(db, id);

      // Generate enhanced comment using Ollama
      const comment = await generateEnhancedComment(key, usages, contexts);

      // Store auto-comment
      await setKeyAutoComment(db, id, comment);

      processed++;
      if (processed % 10 === 0) {
        console.log(`Processed ${processed}/${keys.length} keys`);
      }
    }

    console.log(`Completed generating auto-comments for ${processed} keys`);
  } catch (error) {
    console.error("Error generating auto-comments:", error);
  }
}

module.exports = {
  analyzeCodebase,
  extractTranslationKeys,
  getCodeContext,
  identifyModule,
};
