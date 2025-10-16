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
const { translate } = require("@vitalets/google-translate-api");
const { HttpsProxyAgent } = require("https-proxy-agent");

const MODEL = process.env.OLLAMA_SPELLCHECK_MODEL || "gemma3n:latest";
const LANGUAGES_TO_CHECK = process.argv[2] ? process.argv[2].split(",") : null;
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT, 10) || 90000;
const USE_GOOGLE_PRECHECK = process.env.USE_GOOGLE_PRECHECK !== "false"; // Default true
const SIMILARITY_THRESHOLD =
  parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.85; // 85% similarity
const GOOGLE_TRANSLATE_DELAY =
  parseInt(process.env.GOOGLE_TRANSLATE_DELAY, 10) || 100; // 100ms delay between requests
const PROXY_TIMEOUT = parseInt(process.env.PROXY_TIMEOUT, 10) || 5000; // 5 seconds max for proxy request
const PROXY_API_URL =
  process.env.PROXY_API_URL ||
  "https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps";
const PROXY_BLACKLIST_FILE = path.join(appRootPath, "proxy-blacklist.json");
const CHECKPOINT_FILE = path.join(appRootPath, "verification-checkpoint.json");

// Dynamic proxy list - will be loaded from API
let PROXY_LIST = [];
let currentProxyIndex = 0;
const failedProxies = new Set();
const proxyBlacklist = new Set(); // Persistent blacklist
let useProxyMode = false; // Start without proxy, enable only on rate limit
let lastDirectAttempt = 0; // Timestamp of last direct connection attempt
let directConnectionAttempts = 0; // Counter for direct connection attempts
const DIRECT_RETRY_INTERVAL = 60000; // Try direct connection every 60 seconds

// Checkpoint data
let checkpoint = {
  lastProject: null,
  lastMetadataFile: null,
  lastLanguage: null,
  tsvFilename: null,
  processedKeys: new Set(),
};

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
    if (response.status === 200) {
      console.log("Successfully connected to Ollama.");
      return true;
    }
    console.log(
      `Ollama connection check failed with status: ${response.status}`
    );
    return false;
  } catch (error) {
    console.log(`Ollama connection check failed: ${error.message}`);
    return false;
  }
}

/**
 * Load checkpoint from file
 * @returns {Object} Checkpoint data
 */
function loadCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = fs.readFileSync(CHECKPOINT_FILE, "utf8");
      const loaded = JSON.parse(data);
      console.log(`📍 Loaded checkpoint from file`);
      console.log(`   Last project: ${loaded.lastProject || "none"}`);
      console.log(`   Last file: ${loaded.lastMetadataFile || "none"}`);
      console.log(`   Last language: ${loaded.lastLanguage || "none"}`);
      console.log(`   Processed keys: ${loaded.processedKeys?.length || 0}`);
      return {
        lastProject: loaded.lastProject,
        lastMetadataFile: loaded.lastMetadataFile,
        lastLanguage: loaded.lastLanguage,
        tsvFilename: loaded.tsvFilename,
        processedKeys: new Set(loaded.processedKeys || []),
      };
    }
  } catch (error) {
    console.warn(`⚠️  Failed to load checkpoint: ${error.message}`);
  }
  return {
    lastProject: null,
    lastMetadataFile: null,
    lastLanguage: null,
    tsvFilename: null,
    processedKeys: new Set(),
  };
}

/**
 * Save checkpoint to file
 */
function saveCheckpoint() {
  try {
    const data = {
      lastProject: checkpoint.lastProject,
      lastMetadataFile: checkpoint.lastMetadataFile,
      lastLanguage: checkpoint.lastLanguage,
      tsvFilename: checkpoint.tsvFilename,
      processedKeys: Array.from(checkpoint.processedKeys),
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`❌ Failed to save checkpoint: ${error.message}`);
  }
}

/**
 * Clear checkpoint file
 */
function clearCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE);
      console.log(`🗑️  Cleared checkpoint file`);
    }
  } catch (error) {
    console.error(`❌ Failed to clear checkpoint: ${error.message}`);
  }
}

/**
 * Load proxy blacklist from file
 * @returns {Set<string>} Set of blacklisted proxy URLs
 */
function loadProxyBlacklist() {
  try {
    if (fs.existsSync(PROXY_BLACKLIST_FILE)) {
      const data = fs.readFileSync(PROXY_BLACKLIST_FILE, "utf8");
      const blacklist = JSON.parse(data);
      console.log(
        `📋 Loaded ${blacklist.length} blacklisted proxies from file`
      );
      return new Set(blacklist);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to load proxy blacklist: ${error.message}`);
  }
  return new Set();
}

/**
 * Save proxy blacklist to file
 */
function saveProxyBlacklist() {
  try {
    const blacklistArray = Array.from(proxyBlacklist);
    fs.writeFileSync(
      PROXY_BLACKLIST_FILE,
      JSON.stringify(blacklistArray, null, 2),
      "utf8"
    );
    console.log(
      `💾 Saved ${blacklistArray.length} blacklisted proxies to file`
    );
  } catch (error) {
    console.error(`❌ Failed to save proxy blacklist: ${error.message}`);
  }
}

/**
 * Fetch fresh proxy list from API
 * @returns {Promise<Array>} Array of proxy URLs
 */
async function fetchProxyList() {
  try {
    console.log("🔄 Fetching fresh proxy list from API...");
    const response = await axios.get(PROXY_API_URL, { timeout: 10000 });

    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      const allProxies = response.data.data
        .filter((proxy) => proxy.protocols && proxy.protocols.includes("http"))
        .map((proxy) => {
          const protocol = proxy.protocols.includes("https") ? "https" : "http";
          return `${protocol}://${proxy.ip}:${proxy.port}`;
        });

      // Filter out blacklisted proxies
      const proxies = allProxies.filter((proxy) => !proxyBlacklist.has(proxy));

      const filtered = allProxies.length - proxies.length;
      console.log(
        `✅ Loaded ${proxies.length} fresh proxies (filtered ${filtered} blacklisted)`
      );
      return proxies;
    }

    console.warn("⚠️  Failed to parse proxy list from API");
    return [];
  } catch (error) {
    console.error(`❌ Failed to fetch proxy list: ${error.message}`);
    return [];
  }
}

/**
 * Enable proxy mode when rate limit is hit
 */
async function enableProxyMode() {
  if (!useProxyMode) {
    useProxyMode = true;
    lastDirectAttempt = Date.now();
    console.log("\n⚠️  Rate limit detected! Enabling proxy mode...");

    // Fetch fresh proxy list if empty
    if (PROXY_LIST.length === 0) {
      PROXY_LIST = await fetchProxyList();

      if (PROXY_LIST.length === 0) {
        console.error("❌ No proxies available! Continuing without proxy...");
        useProxyMode = false;
        return;
      }
    }

    console.log(
      `📡 Available proxies: ${PROXY_LIST.length - failedProxies.size}/${
        PROXY_LIST.length
      }\n`
    );
  }
}

/**
 * Disable proxy mode when direct connection works again
 */
function disableProxyMode() {
  if (useProxyMode) {
    useProxyMode = false;
    console.log("\n✅ Rate limit lifted! Disabling proxy mode...\n");
  }
}

/**
 * Check if we should try direct connection
 * @returns {boolean} True if should try direct
 */
function shouldTryDirectConnection() {
  if (!useProxyMode) {
    return true; // Always use direct if not in proxy mode
  }
  
  const now = Date.now();
  const timeSinceLastAttempt = now - lastDirectAttempt;
  
  // Try direct connection every DIRECT_RETRY_INTERVAL
  if (timeSinceLastAttempt >= DIRECT_RETRY_INTERVAL) {
    lastDirectAttempt = now;
    directConnectionAttempts++;
    console.log(`🔍 Attempting direct connection (attempt #${directConnectionAttempts})...`);
    return true;
  }
  
  return false;
}

/**
 * Get next working proxy from the list
 * @returns {Promise<string|null>} Proxy URL or null if proxy mode is disabled
 */
async function getNextProxy() {
  if (!useProxyMode || PROXY_LIST.length === 0) {
    return null;
  }

  const availableProxies = PROXY_LIST.filter(
    (_, index) => !failedProxies.has(index)
  );

  if (availableProxies.length === 0) {
    // All proxies failed - try to fetch fresh list
    console.log("⚠️  All proxies failed, fetching fresh list...");
    failedProxies.clear();
    currentProxyIndex = 0;

    // Try to fetch new proxies
    const newProxies = await fetchProxyList();
    if (newProxies.length > 0) {
      PROXY_LIST = newProxies;
      console.log(`✅ Loaded ${PROXY_LIST.length} new proxies`);
      return PROXY_LIST[0];
    }

    // If still no proxies, return first one from old list
    return PROXY_LIST.length > 0 ? PROXY_LIST[0] : null;
  }

  // Round-robin through available proxies
  const proxy = PROXY_LIST[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % PROXY_LIST.length;

  // Skip failed proxies
  if (failedProxies.has(currentProxyIndex - 1)) {
    return await getNextProxy();
  }

  return proxy;
}

/**
 * Mark proxy as failed
 * @param {string} proxyUrl - Proxy URL to mark as failed
 * @param {string} reason - Reason for failure
 */
function markProxyAsFailed(proxyUrl, reason = "unknown") {
  const index = PROXY_LIST.indexOf(proxyUrl);
  if (index !== -1 && !failedProxies.has(index)) {
    failedProxies.add(index);

    // Add to persistent blacklist for certain errors
    const permanentErrors = [
      "ECONNREFUSED",
      "ETIMEDOUT",
      "timeout",
      "ENOTFOUND",
      "EHOSTUNREACH",
    ];
    if (permanentErrors.includes(reason) || reason.startsWith("slow:")) {
      if (!proxyBlacklist.has(proxyUrl)) {
        proxyBlacklist.add(proxyUrl);
        // Save blacklist every 10 new entries to avoid too many writes
        if (proxyBlacklist.size % 10 === 0) {
          saveProxyBlacklist();
        }
      }
    }

    const remaining = PROXY_LIST.length - failedProxies.size;
    console.log(
      `❌ Proxy failed (${reason}): ${proxyUrl} | Remaining: ${remaining}/${PROXY_LIST.length}`
    );
  }
}

/**
 * Quick pre-check using Google Translate to see if translation is accurate
 * @param {string} translatedContent - The translated content
 * @param {string} englishContent - The English content
 * @param {string} language - The language code
 * @returns {Promise<boolean>} True if translation seems accurate, false otherwise
 */
async function quickTranslationCheck(
  translatedContent,
  englishContent,
  language
) {
  const maxRetries = 3;
  let lastError = null;
  let triedDirect = false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let proxyUrl = null;
    const startTime = Date.now();
    const tryDirect = shouldTryDirectConnection();

    try {
      // Add delay to avoid rate limiting (only when not using proxy)
      if (!useProxyMode || tryDirect) {
        await new Promise((resolve) =>
          setTimeout(resolve, GOOGLE_TRANSLATE_DELAY)
        );
      }

      // Get proxy only if proxy mode is enabled AND not trying direct
      if (!tryDirect) {
        proxyUrl = await getNextProxy();
      } else {
        triedDirect = true;
      }
      
      const fetchOptions = {};

      if (proxyUrl) {
        fetchOptions.agent = new HttpsProxyAgent(proxyUrl);
      }

      // Translate the foreign language back to English with timeout
      const translatePromise = translate(translatedContent, {
        from: language,
        to: "en",
        fetchOptions,
      });

      let result;

      if (proxyUrl) {
        // Add timeout for proxy requests
        const timeoutPromise = new Promise((_, reject) => {
          const timer = setTimeout(() => {
            reject(new Error("PROXY_TIMEOUT"));
          }, PROXY_TIMEOUT);
          // Ensure timer is cleared
          return timer;
        });

        try {
          result = await Promise.race([translatePromise, timeoutPromise]);
        } catch (raceError) {
          // Re-throw to be caught by outer catch
          throw raceError;
        }
      } else {
        result = await translatePromise;
      }

      const requestTime = Date.now() - startTime;

      // Mark slow proxies as failed
      if (proxyUrl && requestTime > PROXY_TIMEOUT * 0.8) {
        markProxyAsFailed(proxyUrl, `slow: ${requestTime}ms`);
      }

      const backTranslated = result.text.toLowerCase().trim();
      const original = englishContent.toLowerCase().trim();

      // Calculate simple similarity
      const similarity = calculateSimilarity(backTranslated, original);

      // If direct connection succeeded while in proxy mode, disable proxy mode
      if (triedDirect && useProxyMode) {
        disableProxyMode();
      }

      return similarity >= SIMILARITY_THRESHOLD;
    } catch (error) {
      lastError = error;

      // Enable proxy mode on rate limit
      if (error.message && error.message.includes("Too Many Requests")) {
        // If we tried direct and got rate limited, stay in proxy mode
        if (triedDirect) {
          console.log("⚠️  Direct connection still rate limited, continuing with proxies");
        }
        await enableProxyMode();
        // Retry immediately with proxy
        continue;
      }

      // Mark proxy as failed if it was used
      if (proxyUrl) {
        if (error.message === "PROXY_TIMEOUT") {
          markProxyAsFailed(proxyUrl, "timeout");
        } else if (
          error.code === "ECONNREFUSED" ||
          error.code === "ETIMEDOUT"
        ) {
          markProxyAsFailed(proxyUrl, error.code);
        } else if (error.code) {
          markProxyAsFailed(proxyUrl, error.code);
        } else {
          // Unknown error with proxy
          markProxyAsFailed(proxyUrl, "error");
        }
      }

      // If it's the last attempt, log and return false
      if (attempt === maxRetries - 1) {
        if (error.message.includes("Too Many Requests")) {
          console.warn(
            `Google Translate rate limit reached for ${language}, falling back to Ollama`
          );
        } else {
          console.warn(
            `Google Translate failed for ${language} after ${maxRetries} attempts: ${error.message}`
          );
        }
        return false;
      }

      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return false;
}

/**
 * Calculate similarity between two strings (0-1 scale)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score between 0 and 1
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  // Simple word-based comparison
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity
  return intersection.size / union.size;
}

/**
 * Verifies a translation against the English version using Ollama with retry mechanism
 * @param {string} keyPath - The key path
 * @param {string} englishContent - The English content
 * @param {string} translatedContent - The translated content
 * @param {string} language - The language code
 * @param {Object} progress - Progress tracking object with current, total, keyIndex, totalKeys
 * @returns {Promise<Array>} Array of identified issues
 */
async function verifyTranslation(
  keyPath,
  englishContent,
  translatedContent,
  language,
  progress = null
) {
  // Skip if content is empty
  if (!englishContent || !translatedContent) {
    console.log(
      `Skipping verification for ${keyPath} in ${language}: insufficient data`
    );
    return [];
  }

  // Quick pre-check with Google Translate if enabled
  if (USE_GOOGLE_PRECHECK) {
    const keyProgressStr =
      progress && progress.keyIndex && progress.totalKeys
        ? `[${progress.keyIndex}/${progress.totalKeys}] `
        : "";
    const langProgressStr = progress
      ? ` [${progress.current}/${progress.total}]`
      : "";

    console.log(
      `${keyProgressStr}Quick check for ${keyPath} in ${language}${langProgressStr}`
    );

    const isAccurate = await quickTranslationCheck(
      translatedContent,
      englishContent,
      language
    );

    if (isAccurate) {
      console.log(
        `${keyProgressStr}✓ Translation seems accurate, skipping Ollama check for ${keyPath} in ${language}${langProgressStr}`
      );
      return [];
    }

    console.log(
      `${keyProgressStr}⚠ Translation may have issues, proceeding with Ollama check for ${keyPath} in ${language}${langProgressStr}`
    );
  }

  const languageName = languageMap[language] || language;

  // Create prompt for Ollama
  const prompt = `
# Translation Verification Task

You are a translation quality checker. Your ONLY task is to find CRITICAL translation errors.

## Content to verify:
- **English:** "${englishContent}"
- **${languageName}:** "${translatedContent}"

## Your task:
Check if the ${languageName} translation accurately conveys the SAME MEANING as the English text.

## Report ONLY these CRITICAL issues:
1. **incorrect_translation** - Translation has completely wrong or opposite meaning
2. **missing_content** - Important words or information are missing
3. **wrong_language** - Text is in the wrong language

## DO NOT report:
- Minor grammar improvements
- Style preferences
- Alternative wording that means the same thing
- Punctuation differences
- Capitalization differences

## Response format:
Return a JSON array. Each issue must have:
- "type": One of: incorrect_translation, missing_content, wrong_language
- "description": Brief explanation of the critical error
- "suggestion": Corrected translation

If the translation correctly conveys the meaning, return an empty array [].

**IMPORTANT:** 
- Respond with ONLY the JSON array
- Be strict: only report CRITICAL errors that change meaning
- Do not escape [ ] brackets in strings
  `;

  // Retry configuration
  const maxRetries = 3;
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      const keyProgressStr =
        progress && progress.keyIndex && progress.totalKeys
          ? `[${progress.keyIndex}/${progress.totalKeys}] `
          : "";
      const langProgressStr = progress
        ? ` [${progress.current}/${progress.total}]`
        : "";
      const retryStr =
        retries > 0 ? ` (attempt ${retries + 1}/${maxRetries})` : "";
      console.log(
        `${keyProgressStr}Verifying translation for ${keyPath} in ${language}${langProgressStr}${retryStr}`
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
          timeout: OLLAMA_TIMEOUT, // 90 second timeout
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

          // Remove markdown code blocks if present
          // Handle both ```json and ``` variants
          if (jsonText.startsWith("```")) {
            // Find the first newline after opening ```
            const firstNewline = jsonText.indexOf("\n");
            if (firstNewline !== -1) {
              jsonText = jsonText.substring(firstNewline + 1);
            }
            // Remove closing ```
            const lastBackticks = jsonText.lastIndexOf("```");
            if (lastBackticks !== -1) {
              jsonText = jsonText.substring(0, lastBackticks);
            }
            jsonText = jsonText.trim();
          }

          // Check if response is truncated or corrupted
          if (jsonText.includes(">]>]>]>]") || jsonText.length > 10000) {
            console.warn(
              `Corrupted or truncated response for ${keyPath} in ${language}, skipping`
            );
            return [];
          }

          // Clean up common JSON issues from LLM responses
          // Fix improperly escaped brackets in strings
          jsonText = jsonText.replace(/\\\[/g, "[").replace(/\\\]/g, "]");

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
          console.warn(`Response was: ${responseText.substring(0, 500)}...`);
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
 * Gets translation content from the in-memory cache
 * @param {Object} translations - The translations cache
 * @param {string} namespace - Namespace of the translation
 * @param {string} key - Key of the translation
 * @param {string} language - Language code
 * @returns {string|null} Translation content or null if not found
 */
function getTranslationContent(translations, namespace, key, language) {
  try {
    return translations[language]?.[namespace]?.[key] || null;
  } catch (error) {
    console.error(
      `Error reading translation for ${key} in ${language} from cache: ${error.message}`
    );
    return null;
  }
}

/**
 * Loads all translation files for a project into memory
 * @param {string} projectPath - Path to the project locales directory
 * @param {Array<string>} languages - Array of languages to load
 * @returns {Promise<Object>} A map of translations: { [lang]: { [ns]: { [key]: val } } }
 */
async function loadAllTranslations(projectPath, languages) {
  const translations = {};
  const allLangs = ["en", ...languages]; // Also load English

  for (const lang of allLangs) {
    translations[lang] = {};
    const langPath = path.join(projectPath, lang);
    if (!(await fs.pathExists(langPath))) continue;

    const nsFiles = await fs.readdir(langPath);
    for (const nsFile of nsFiles) {
      if (path.extname(nsFile) === ".json") {
        const namespace = path.basename(nsFile, ".json");
        const filePath = path.join(langPath, nsFile);
        try {
          translations[lang][namespace] = await fs.readJson(filePath);
        } catch (error) {
          console.error(
            `Error reading JSON file ${filePath}: ${error.message}`
          );
        }
      }
    }
  }
  return translations;
}

/**
 * Verifies translations and updates metadata for a project
 * @param {string} projectName - Project name
 * @param {string} tsvFilename - TSV filename for incremental writing
 * @param {Object} counters - Object to track totalIssuesFound
 * @returns {Promise<Object>} Statistics
 */
async function verifyTranslationsSpellCheck(project, tsvFilename, counters) {
  const resuming = checkpoint.lastProject === project && checkpoint.lastMetadataFile !== null;
  console.log(`Verifying translations for project: ${project}`);

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
    const localesPath = projectLocalesMap[project];
    if (!localesPath) {
      throw new Error(`No locales path defined for project: ${project}`);
    }

    const projectPath = path.join(appRootPath, localesPath);
    console.log(`Project path: ${projectPath}`);

    const allLanguages = await getAvailableLanguages(projectPath);
    console.log(
      `Found ${allLanguages.length} languages: ${allLanguages.join(", ")}`
    );

    const languages = LANGUAGES_TO_CHECK
      ? allLanguages.filter((lang) => LANGUAGES_TO_CHECK.includes(lang))
      : allLanguages.filter((lang) => lang !== "en");

    console.log(
      `Will check ${languages.length} languages: ${languages.join(", ")}`
    );

    languages.forEach((lang) => {
      stats.languages[lang] = { processed: 0, updated: 0, issues: 0 };
    });

    // Pre-load all translation files
    console.log("Loading all translation files into memory...");
    const translations = await loadAllTranslations(projectPath, languages);
    console.log("Translation files loaded.");

    const metaPattern = path
      .join(projectPath, ".meta", "**", "*.json")
      .replace(/\\/g, "/");
    const metadataFiles = glob.sync(metaPattern);
    console.log(`Found ${metadataFiles.length} metadata files`);

    // Skip files until we reach checkpoint if resuming
    let skipUntilFile = resuming ? checkpoint.lastMetadataFile : null;

    for (const metadataFile of metadataFiles) {
      // Skip files until checkpoint
      if (skipUntilFile && metadataFile !== skipUntilFile) {
        continue;
      }
      if (skipUntilFile && metadataFile === skipUntilFile) {
        console.log(` Resuming from file: ${path.basename(metadataFile)}`);
        skipUntilFile = null; // Found checkpoint, process from here
      }

      try {
        const metaPathParts = metadataFile.split(path.sep);
        const key = path.basename(metadataFile, ".json");
        const namespace = metaPathParts[metaPathParts.length - 2];
        const keyPath = `${namespace}:${key}`;

        const metadata = await fs.readJson(metadataFile);

        const englishContent = getTranslationContent(
          translations,
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
        stats.totalFiles++;

        let metadataUpdated = false;

        for (let langIndex = 0; langIndex < languages.length; langIndex++) {
          const language = languages[langIndex];
          
          // Save checkpoint when starting new language
          if (checkpoint.lastLanguage !== language) {
            checkpoint.lastProject = project;
            checkpoint.lastMetadataFile = metadataFile;
            checkpoint.lastLanguage = language;
            saveCheckpoint();
          }
          
          try {
            const translatedContent = getTranslationContent(
              translations,
              namespace,
              key,
              language
            );
            if (!translatedContent) {
              continue;
            }

            const progress = {
              current: langIndex + 1,
              total: languages.length,
              keyIndex: stats.totalKeys,
              totalKeys: metadataFiles.length,
            };

            const issues = await verifyTranslation(
              keyPath,
              englishContent,
              translatedContent,
              language,
              progress
            );

            if (!metadata.languages) metadata.languages = {};
            if (!metadata.languages[language]) {
              metadata.languages[language] = {
                ai_translated: false,
                ai_model: null,
                ai_spell_check_issues: [],
                approved_at: null,
              };
            }

            metadata.languages[language].ai_spell_check_issues = issues;
            metadataUpdated = true;

            stats.processedKeys++;
            stats.languages[language].processed++;

            if (issues.length > 0) {
              stats.updatedIssues++;
              stats.languages[language].updated++;
              stats.languages[language].issues += issues.length;
              console.log(
                `Found ${issues.length} issues for ${keyPath} in ${language}`
              );

              // Save issues to CSV immediately
              for (const issue of issues) {
                const issueData = {
                  project: project,
                  metadataFile: metadataFile,
                  keyPath: keyPath,
                  language: language,
                  englishContent: englishContent,
                  translatedContent: translatedContent,
                  issueType: issue.type,
                  description: issue.description,
                  suggestion: issue.suggestion || "",
                };
                await appendIssueToTSV(
                  tsvFilename,
                  project,
                  metadataFile,
                  keyPath,
                  language,
                  englishContent,
                  translatedContent,
                  issue
                );
                counters.totalIssuesFound++;
              }
            }
          } catch (langError) {
            console.error(
              `Error processing ${keyPath} for ${language}: ${langError.message}`
            );
            stats.errors.push({
              file: metadataFile,
              key: keyPath,
              language,
              error: langError.message,
            });
            // Save checkpoint on error
            saveCheckpoint();
          }
        }

        if (metadataUpdated) {
          metadata.updated_at = new Date().toISOString();
          await writeJsonWithConsistentEol(metadataFile, metadata);
        }
      } catch (fileError) {
        console.error(
          `Error processing metadata file ${metadataFile}: ${fileError.message}`
        );
        stats.errors.push({ file: metadataFile, error: fileError.message });
        // Save checkpoint on error
        saveCheckpoint();
      }
    }

    stats.endTime = new Date();
    stats.duration = (stats.endTime - stats.startTime) / 1000;

    return stats;
  } catch (error) {
    console.error(
      `Error verifying translations for project ${project}: ${error.message}`
    );
    stats.errors.push({ project: project, error: error.message });
    stats.endTime = new Date();
    stats.duration = (stats.endTime - stats.startTime) / 1000;
    return stats;
  }
}

/**
 * Appends issue to TSV file
 * @param {string} tsvFilename - TSV filename
 * @param {string} project - Project name
 * @param {string} metadataFile - Metadata file path
 * @param {string} keyPath - Translation key path
 * @param {string} language - Language code
 * @param {string} englishContent - English content
 * @param {string} translatedContent - Translated content
 * @param {Object} issue - Issue object
 */
function appendIssueToTSV(
  tsvFilename,
  project,
  metadataFile,
  keyPath,
  language,
  englishContent,
  translatedContent,
  issue
) {
  const tsvPath = path.join(appRootPath, tsvFilename);
  const row = [
    project,
    metadataFile,
    keyPath,
    language,
    escapeTsvField(englishContent),
    escapeTsvField(translatedContent),
    issue.type || "",
    escapeTsvField(issue.description || ""),
    escapeTsvField(issue.suggestion || ""),
  ].join("\t");

  fs.appendFileSync(tsvPath, row + "\n", "utf8");
  
  // Update checkpoint (will be saved when language changes)
  checkpoint.lastProject = project;
  checkpoint.lastMetadataFile = metadataFile;
  checkpoint.lastLanguage = language;
  checkpoint.processedKeys.add(`${project}:${metadataFile}:${keyPath}:${language}`);
}

/**
 * Verifies translations for all projects
 * @returns {Promise<Object>} Overall statistics
 */
async function verifyAllTranslationsSpellCheck() {
  console.log("Starting translation verification process...");

  // Load checkpoint
  checkpoint = loadCheckpoint();
  const resuming = checkpoint.lastProject !== null;

  // Load proxy blacklist at startup
  proxyBlacklist.clear();
  const loadedBlacklist = loadProxyBlacklist();
  loadedBlacklist.forEach((proxy) => proxyBlacklist.add(proxy));

  // console all variables
  console.log("OLLAMA_MODEL: ", MODEL);
  console.log("OLLAMA_TIMEOUT: ", OLLAMA_TIMEOUT);
  console.log("LANGUAGES_TO_CHECK: ", LANGUAGES_TO_CHECK);
  console.log("USE_GOOGLE_PRECHECK: ", USE_GOOGLE_PRECHECK);
  console.log("SIMILARITY_THRESHOLD: ", SIMILARITY_THRESHOLD);
  console.log("GOOGLE_TRANSLATE_DELAY: ", GOOGLE_TRANSLATE_DELAY, "ms");
  console.log(
    "PROXY_MODE: ",
    useProxyMode ? "enabled" : "disabled (will enable on rate limit)"
  );
  console.log("PROXY_TIMEOUT: ", PROXY_TIMEOUT, "ms");
  console.log("PROXY_API_URL: ", PROXY_API_URL);
  console.log("PROXY_BLACKLIST_FILE: ", PROXY_BLACKLIST_FILE);
  console.log("BLACKLISTED_PROXIES: ", proxyBlacklist.size);
  console.log("CHECKPOINT_FILE: ", CHECKPOINT_FILE);
  console.log("RESUMING: ", resuming ? "yes" : "no");
  console.log("DIRECT_RETRY_INTERVAL: ", DIRECT_RETRY_INTERVAL / 1000, "seconds");

  const ollamaRunning = await isOllamaRunning();
  if (!ollamaRunning) {
    console.error("Ollama is not running. Aborting verification process.");
    process.exit(1);
  }

  // Use existing TSV file if resuming, otherwise create new one
  let tsvFilename;
  if (resuming && checkpoint.tsvFilename) {
    tsvFilename = checkpoint.tsvFilename;
    console.log(` Resuming with existing TSV file: ${tsvFilename}`);
  } else {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    tsvFilename = `spell-check-issues-${timestamp}.tsv`;
    checkpoint.tsvFilename = tsvFilename;
    saveCheckpoint();
  }
  const tsvPath = path.join(appRootPath, tsvFilename);
  
  // Only write header if file doesn't exist (new run)
  if (!fs.existsSync(tsvPath)) {
    const tsvHeader =
      "Project\tMetadata File\tKey\tLanguage\tEnglish Content\tTranslated Content\tIssue Type\tDescription\tSuggestion\n";
    fs.writeFileSync(tsvPath, tsvHeader, "utf8");
    console.log(` Created TSV file: ${tsvPath}`);
  } else {
    console.log(` Continuing with existing TSV file: ${tsvPath}`);
  }
  console.log("Issues will be saved incrementally as they are found.\n");

  const counters = { totalIssuesFound: 0 };

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

  const projects = Object.keys(projectLocalesMap);
  overallStats.totalProjects = projects.length;

  // Skip to the checkpoint project if resuming
  let skipUntilProject = resuming ? checkpoint.lastProject : null;
  let foundCheckpoint = !resuming;

  for (const project of projects) {
    // Skip projects until we reach the checkpoint
    if (skipUntilProject && project !== skipUntilProject) {
      console.log(` Skipping project: ${project} (already processed)`);
      continue;
    }
    if (skipUntilProject && project === skipUntilProject) {
      foundCheckpoint = true;
      console.log(` Resuming from project: ${project}`);
    }

    try {
      console.log(` Processing project: ${project}`);
      const projectStats = await verifyTranslationsSpellCheck(
        project,
        tsvFilename,
        counters
      );

      overallStats.projects[project] = projectStats;
      overallStats.totalNamespaces += projectStats.totalNamespaces || 0;
      overallStats.totalFiles += projectStats.totalFiles || 0;
      overallStats.totalKeys += projectStats.totalKeys || 0;
      overallStats.processedKeys += projectStats.processedKeys || 0;
      overallStats.updatedIssues += projectStats.updatedIssues || 0;
      overallStats.skippedKeys += projectStats.skippedKeys || 0;

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

      overallStats.errors = overallStats.errors.concat(
        projectStats.errors || []
      );
    } catch (error) {
      console.error(`Error processing project ${project}: ${error.message}`);
      overallStats.errors.push({ project, error: error.message });
    }
  }

  overallStats.endTime = new Date();
  overallStats.duration =
    (overallStats.endTime - overallStats.startTime) / 1000; // in seconds

  // Report final TSV status
  if (counters.totalIssuesFound > 0) {
    console.log(` Total issues saved to TSV: ${counters.totalIssuesFound}`);
    console.log(` TSV file location: ${tsvPath}`);
  } else {
    // Remove empty TSV file if no issues found
    await fs.unlink(tsvPath).catch(() => {});
    console.log("\nNo issues found - TSV file not created.");
  }

  // Clear checkpoint on successful completion
  clearCheckpoint();

  return overallStats;
}

// Run the script if executed directly
verifyAllTranslationsSpellCheck()
  .then((stats) => {
    // Save final blacklist
    if (proxyBlacklist.size > 0) {
      saveProxyBlacklist();
    }

    console.log("\n=== Verification Complete ===");
    console.log(`Total issues found: ${stats.updatedIssues}`);
    if (checkpoint.tsvFilename) {
      console.log(
        `Results saved to: ${path.join(appRootPath, checkpoint.tsvFilename)}`
      );
    }
    console.log(`Blacklisted proxies: ${proxyBlacklist.size}`);
    console.log("\nThank you for using the translation verification tool!");

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
    console.error("\n=== Error During Verification ===");
    console.error(error);
    console.log("\n Checkpoint saved. You can resume by running the script again.");
    saveCheckpoint();
    process.exit(1);
  });
