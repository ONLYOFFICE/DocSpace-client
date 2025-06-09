#!/usr/bin/env node
/**
 * Verify Language Translations and Update Spell Check Issues Metadata
 *
 * This script scans the locales directories, compares non-English translations with English ones,
 * and updates the ai_spell_check_issues field in the metadata files with issues found by Ollama.
 */
const fs = require("fs-extra");
const { writeJsonWithConsistentEol } = require("../utils/fsUtils");
const path = require("path");
const glob = require("glob");
const {
  appRootPath,
  projectLocalesMap,
  ollamaConfig,
} = require("../config/config");
const axios = require("axios");

const MODEL = process.env.OLLAMA_SPELLCHECK_MODEL || "gemma3:12b";
const LANGUAGES_TO_CHECK = process.argv[2] ? process.argv[2].split(",") : null;

const languageMap = {
  en: "English",
  "en-GB": "English (United Kingdom)",
  "en-US": "English (United States)",
  fr: "French",
  de: "German",
  "de-CH": "German (Switzerland)",
  es: "Spanish",
  "es-MX": "Spanish (Mexico)",
  it: "Italian",
  pt: "Portuguese",
  "pt-BR": "Portuguese (Brazil)",
  ru: "Russian",
  zh: "Chinese",
  "zh-CN": "Chinese (Simplified)",
  ja: "Japanese",
  "ja-JP": "Japanese",
  ko: "Korean",
  "ko-KR": "Korean",
  ar: "Arabic",
  "ar-SA": "Arabic (Saudi Arabia)",
  tr: "Turkish",
  pl: "Polish",
  nl: "Dutch",
  cs: "Czech",
  sk: "Slovak",
  bg: "Bulgarian",
  az: "Azerbaijani",
  "el-GR": "Greek",
  fi: "Finnish",
  "hy-AM": "Armenian",
  "lo-LA": "Lao",
  lv: "Latvian",
  ro: "Romanian",
  si: "Sinhala",
  sl: "Slovenian",
  "sq-AL": "Albanian",
  "sr-Cyrl-RS": "Serbian (Cyrillic)",
  "sr-Latn-RS": "Serbian (Latin)",
  "uk-UA": "Ukrainian",
  vi: "Vietnamese",
};

/**
 * Checks if Ollama is running and available
 * @returns {Promise<boolean>} True if Ollama is running
 */
async function isOllamaRunning() {
  try {
    const response = await axios.get(ollamaConfig.apiUrl + "/api/tags", {
      timeout: 2000, // 2 second timeout
    });
    return response.status === 200;
  } catch (error) {
    console.log("Ollama connection check failed:", error.message);
    return false;
  }
}

/**
 * Verifies a translation against the English version using Ollama with retry mechanism
 * @param {string} keyPath - The key path
 * @param {string} englishContent - The English content
 * @param {string} translatedContent - The translated content
 * @param {string} language - The language code
 * @returns {Promise<Array>} Array of identified issues
 */
async function verifyTranslation(
  keyPath,
  englishContent,
  translatedContent,
  language
) {
  // Skip if content is empty
  if (!englishContent || !translatedContent) {
    console.log(
      `Skipping verification for ${keyPath} in ${language}: insufficient data`
    );
    return [];
  }

  // Check if Ollama is connected
  const ollamaRunning = await isOllamaRunning();
  if (!ollamaRunning) {
    console.log("Ollama is not running. Skipping verification.");
    return [];
  }

  const languageName = languageMap[language] || language;

  // Create prompt for Ollama
  const prompt = `
# Translation Verification Task

## Context Information
- **Key Name:** ${keyPath}
- **English Content:** "${englishContent}"
- **${languageName} Translation:** "${translatedContent}"

## Instructions
You are a helpful assistant that verifies translations for accuracy and spelling.
Analyze the translation and identify any issues such as:
- Spelling errors
- Grammatical mistakes
- Missing content
- Incorrect translations
- Formatting issues
- Cultural appropriateness issues

Return a JSON array of issues found. Each issue should be an object with:
- "type": The type of issue (spelling, grammar, missing_content, incorrect_translation, formatting, cultural)
- "description": A clear description of the issue
- "suggestion": A suggested correction (if applicable)

If no issues are found, return an empty array [].

**Important:** Respond with ONLY the JSON array, no additional text.
  `;

  // Retry configuration
  const maxRetries = 3;
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      console.log(
        `Verifying translation for ${keyPath} in ${language} (attempt ${retries + 1}/${maxRetries})`
      );

      // Call Ollama API with timeout
      const response = await axios.post(
        ollamaConfig.apiUrl + "/api/generate",
        {
          model: MODEL,
          prompt: prompt,
          stream: false,
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Parse the response
      if (response.data && response.data.response) {
        const responseText = response.data.response.trim();
        try {
          // Check if response is wrapped in markdown code blocks and extract the JSON
          let jsonText = responseText;

          // Handle markdown code blocks (```json ... ```)
          const markdownMatch = responseText.match(
            /```(?:json)?\s*([\s\S]*?)```/
          );
          if (markdownMatch && markdownMatch[1]) {
            jsonText = markdownMatch[1].trim();
          }

          // Try to parse as JSON
          const issues = JSON.parse(jsonText);
          if (Array.isArray(issues)) {
            return issues;
          } else {
            console.warn(
              `Unexpected response format for ${keyPath} in ${language}: not an array`
            );
            return [];
          }
        } catch (parseError) {
          console.warn(
            `Failed to parse Ollama response as JSON for ${keyPath} in ${language}: ${parseError.message}`
          );
          console.warn(`Response was: ${responseText}`);
          return [];
        }
      } else {
        throw new Error(
          `Unexpected Ollama response format: ${JSON.stringify(response.data)}`
        );
      }
    } catch (error) {
      lastError = error;
      retries++;

      // Log the error
      console.error(
        `Error calling Ollama (attempt ${retries}/${maxRetries}):`,
        error.message
      );

      // If it's a socket hang up or timeout, wait before retrying
      if (
        error.code === "ECONNRESET" ||
        error.code === "ETIMEDOUT" ||
        error.message.includes("socket hang up") ||
        error.message.includes("timeout")
      ) {
        console.log(
          `Network error detected. Waiting before retry... ${error.message}`
        );
        console.log(
          `ollama api url: '${ollamaConfig.apiUrl}' model: '${MODEL}'`
        );
        // Wait for a few seconds before retrying (increasing with each retry)
        await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
      } else if (retries < maxRetries) {
        // For other errors, wait a shorter time
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.error(
    `Failed to verify translation for ${keyPath} in ${language} after ${maxRetries} attempts:`,
    lastError ? lastError.message : "Unknown error"
  );
  return [];
}

/**
 * Gets all available languages from the locales directory
 * @param {string} projectPath - Path to the project locales directory
 * @returns {Array<string>} Array of language codes
 */
async function getAvailableLanguages(projectPath) {
  const items = await fs.readdir(projectPath);

  return items.filter((item) => {
    const itemPath = path.join(projectPath, item);
    return fs.statSync(itemPath).isDirectory() && item !== ".meta";
  });
}

/**
 * Gets translation content for a specific key and language
 * @param {string} projectPath - Path to the project
 * @param {string} namespace - Namespace of the translation
 * @param {string} key - Key of the translation
 * @param {string} language - Language code
 * @returns {string|null} Translation content or null if not found
 */
async function getTranslationContent(projectPath, namespace, key, language) {
  try {
    const filePath = path.join(projectPath, language, `${namespace}.json`);
    if (!(await fs.pathExists(filePath))) {
      return null;
    }

    const content = await fs.readJson(filePath);
    return content[key] || null;
  } catch (error) {
    console.error(
      `Error reading translation for ${key} in ${language}: ${error.message}`
    );
    return null;
  }
}

/**
 * Verifies translations and updates metadata for a project
 * @param {string} projectName - Project name
 * @returns {Promise<Object>} Statistics
 */
async function verifyTranslationsSpellCheck(projectName) {
  console.log(`Verifying translations for project: ${projectName}`);

  const stats = {
    totalProjects: 1,
    totalNamespaces: 0,
    totalFiles: 0,
    totalKeys: 0,
    processedKeys: 0,
    updatedIssues: 0,
    skippedKeys: 0,
    errors: [],
    languages: {},
    startTime: new Date(),
  };

  try {
    // Get the project locales path
    const localesPath = projectLocalesMap[projectName];
    if (!localesPath) {
      throw new Error(`No locales path defined for project: ${projectName}`);
    }

    const projectPath = path.join(appRootPath, localesPath);
    console.log(`Project path: ${projectPath}`);

    // Get all available languages
    const allLanguages = await getAvailableLanguages(projectPath);
    console.log(
      `Found ${allLanguages.length} languages: ${allLanguages.join(", ")}`
    );

    // Filter languages if specified
    const languages = LANGUAGES_TO_CHECK
      ? allLanguages.filter((lang) => LANGUAGES_TO_CHECK.includes(lang))
      : allLanguages.filter((lang) => lang !== "en"); // Skip English as it's the reference

    console.log(
      `Will check ${languages.length} languages: ${languages.join(", ")}`
    );

    // Initialize language stats
    languages.forEach((lang) => {
      stats.languages[lang] = {
        processed: 0,
        updated: 0,
        issues: 0,
      };
    });

    // Find all metadata files
    // Use normalized path with forward slashes for glob to work on all platforms
    const metaPattern = path
      .join(projectPath, ".meta", "**", "*.json")
      .replace(/\\/g, "/");

    const metaFiles = glob.sync(metaPattern) || [];

    console.log(`Found ${metaFiles.length} metadata files`);

    stats.totalFiles = metaFiles.length;

    // Process each metadata file
    for (const metaFile of metaFiles) {
      try {
        // Extract namespace and key from the metadata file path
        const metaPathParts = metaFile.split(path.sep);
        const key = path.basename(metaFile, ".json");
        const namespace = metaPathParts[metaPathParts.length - 2];
        const keyPath = `${namespace}:${key}`;

        console.log(`Processing metadata for ${keyPath}`);

        // Read the metadata file
        const metadata = await fs.readJson(metaFile);

        // Get the English content
        const englishContent = await getTranslationContent(
          projectPath,
          namespace,
          key,
          "en"
        );
        if (!englishContent) {
          console.log(`Skipping ${keyPath}: English content not found`);
          stats.skippedKeys++;
          continue;
        }

        stats.totalKeys++;

        // Process each language
        for (const language of languages) {
          try {
            // Get the translated content
            const translatedContent = await getTranslationContent(
              projectPath,
              namespace,
              key,
              language
            );
            if (!translatedContent) {
              console.log(
                `Skipping ${keyPath} for ${language}: Translation not found`
              );
              continue;
            }

            // Verify the translation
            const issues = await verifyTranslation(
              keyPath,
              englishContent,
              translatedContent,
              language
            );

            // Update the metadata
            if (!metadata.languages) {
              metadata.languages = {};
            }

            if (!metadata.languages[language]) {
              metadata.languages[language] = {
                ai_translated: false,
                ai_model: null,
                ai_spell_check_issues: [],
                approved_at: null,
              };
            }

            // Update the spell check issues
            metadata.languages[language].ai_spell_check_issues = issues;
            metadata.updated_at = new Date().toISOString();

            // Update stats
            stats.processedKeys++;
            stats.languages[language].processed++;

            if (issues.length > 0) {
              stats.updatedIssues++;
              stats.languages[language].updated++;
              stats.languages[language].issues += issues.length;
              console.log(
                `Found ${issues.length} issues for ${keyPath} in ${language}`
              );
            }
          } catch (langError) {
            console.error(
              `Error processing ${keyPath} for ${language}: ${langError.message}`
            );
            stats.errors.push({
              file: metaFile,
              key: keyPath,
              language,
              error: langError.message,
            });
          }
        }

        // Write the updated metadata back to the file
        await writeJsonWithConsistentEol(metaFile, metadata);
      } catch (fileError) {
        console.error(
          `Error processing metadata file ${metaFile}: ${fileError.message}`
        );
        stats.errors.push({
          file: metaFile,
          error: fileError.message,
        });
      }
    }

    stats.endTime = new Date();
    stats.duration = (stats.endTime - stats.startTime) / 1000; // in seconds

    return stats;
  } catch (error) {
    console.error(
      `Error verifying translations for project ${projectName}: ${error.message}`
    );
    stats.errors.push({
      project: projectName,
      error: error.message,
    });
    stats.endTime = new Date();
    stats.duration = (stats.endTime - stats.startTime) / 1000; // in seconds
    return stats;
  }
}

/**
 * Verifies translations for all projects
 * @returns {Promise<Object>} Overall statistics
 */
async function verifyAllTranslationsSpellCheck() {
  console.log("Starting translation verification process...");

  const overallStats = {
    projects: {},
    totalProjects: 0,
    totalNamespaces: 0,
    totalFiles: 0,
    totalKeys: 0,
    processedKeys: 0,
    updatedIssues: 0,
    skippedKeys: 0,
    errors: [],
    languages: {},
    startTime: new Date(),
  };

  // Get all projects
  const projects = Object.keys(projectLocalesMap);
  overallStats.totalProjects = projects.length;

  // Process each project
  for (const project of projects) {
    try {
      console.log(`\n=== Processing project: ${project} ===\n`);
      const projectStats = await verifyTranslationsSpellCheck(project);

      // Add project stats to overall stats
      overallStats.projects[project] = projectStats;
      overallStats.totalNamespaces += projectStats.totalNamespaces || 0;
      overallStats.totalFiles += projectStats.totalFiles || 0;
      overallStats.totalKeys += projectStats.totalKeys || 0;
      overallStats.processedKeys += projectStats.processedKeys || 0;
      overallStats.updatedIssues += projectStats.updatedIssues || 0;
      overallStats.skippedKeys += projectStats.skippedKeys || 0;

      // Merge language stats
      Object.entries(projectStats.languages || {}).forEach(
        ([lang, langStats]) => {
          if (!overallStats.languages[lang]) {
            overallStats.languages[lang] = {
              processed: 0,
              updated: 0,
              issues: 0,
            };
          }

          overallStats.languages[lang].processed += langStats.processed || 0;
          overallStats.languages[lang].updated += langStats.updated || 0;
          overallStats.languages[lang].issues += langStats.issues || 0;
        }
      );

      // Merge errors
      overallStats.errors = overallStats.errors.concat(
        projectStats.errors || []
      );
    } catch (error) {
      console.error(`Error processing project ${project}: ${error.message}`);
      overallStats.errors.push({
        project,
        error: error.message,
      });
    }
  }

  overallStats.endTime = new Date();
  overallStats.duration =
    (overallStats.endTime - overallStats.startTime) / 1000; // in seconds

  return overallStats;
}

// Run the script if executed directly
verifyAllTranslationsSpellCheck()
  .then((stats) => {
    console.log("\n=== Translation Verification Complete ===\n");

    // Print summary statistics
    console.log("Summary:");
    console.log(`- Total projects: ${stats.totalProjects}`);
    console.log(`- Total files: ${stats.totalFiles}`);
    console.log(`- Total keys: ${stats.totalKeys}`);
    console.log(`- Processed keys: ${stats.processedKeys}`);
    console.log(`- Updated with issues: ${stats.updatedIssues}`);
    console.log(`- Skipped keys: ${stats.skippedKeys}`);
    console.log(`- Errors: ${stats.errors.length}`);
    console.log(`- Duration: ${stats.duration.toFixed(2)} seconds`);

    // Print language statistics
    console.log("\nLanguage Statistics:");
    Object.entries(stats.languages).forEach(([lang, langStats]) => {
      console.log(
        `- ${lang}: Processed ${langStats.processed}, Updated ${langStats.updated}, Total Issues ${langStats.issues}`
      );
    });

    // Print errors if any
    if (stats.errors.length > 0) {
      console.log("\nErrors:");
      stats.errors.slice(0, 10).forEach((error, index) => {
        console.log(
          `${index + 1}. ${error.file || error.project}: ${error.error}`
        );
      });

      if (stats.errors.length > 10) {
        console.log(`... and ${stats.errors.length - 10} more errors`);
      }
    }

    console.log("\nDone!");
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
