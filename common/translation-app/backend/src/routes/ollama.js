const { ollamaConfig } = require("../config/config");
const fsUtils = require("../utils/fsUtils");
const { Ollama } = require("ollama");

// Add debugger to help diagnose connection issues
const DEBUG = true;
function debug(...args) {
  if (DEBUG) console.log("[OLLAMA DEBUG]", ...args);
}

// Helper to verify Ollama connection
async function verifyOllamaConnection() {
  debug(`Verifying Ollama connection to ${ollamaConfig.apiUrl}`);
  try {
    const response = await fetch(`${ollamaConfig.apiUrl}/api/tags`);
    if (!response.ok) {
      debug(
        `Ollama connection failed: ${response.status} ${response.statusText}`
      );
      return false;
    }
    const data = await response.json();
    debug(
      `Ollama connection successful, found ${data.models?.length || 0} models`
    );
    return true;
  } catch (error) {
    debug(`Ollama connection error: ${error.message}`);
    return false;
  }
}

/**
 * Ollama integration route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get available models from Ollama
  fastify.get("/models", async (request, reply) => {
    try {
      debug(`Attempting to connect to Ollama API at: ${ollamaConfig.apiUrl}`);

      // First verify connection using standard fetch
      const isConnected = await verifyOllamaConnection();
      if (!isConnected) {
        return reply.code(503).send({
          success: false,
          error: "Ollama service is unavailable",
          details: "Connection to Ollama API failed",
        });
      }

      debug("Creating ollama client");

      // Create a new Ollama client instance
      const ollamaClient = new Ollama({ host: ollamaConfig.apiUrl });

      debug("Ollama client created, requesting models list");
      // Get models using ollama client with error handling
      try {
        const { models } = await ollamaClient.list();
        debug(`Successfully retrieved ${models?.length || 0} models`);
        return { success: true, data: models || [] };
      } catch (clientError) {
        debug(`Ollama client error: ${clientError.message}`);

        // Fallback to direct fetch if client fails
        debug("Falling back to direct fetch API call");
        const response = await fetch(`${ollamaConfig.apiUrl}/api/tags`);
        const data = await response.json();
        return { success: true, data: data.models || [] };
      }
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to connect to Ollama API",
        details: error.message,
      });
    }
  });

  // Validate translations using LLM
  fastify.post("/validate/translation", async (request, reply) => {
    try {
      const {
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        key,
        sourceText,
        targetText,
        model,
      } = request.body;

      if (!model) {
        return reply
          .code(400)
          .send({ success: false, error: "Model is required" });
      }

      if (!sourceText || !targetText) {
        return reply.code(400).send({
          success: false,
          error: "Source and target texts are required",
        });
      }

      // Send notification that validation is starting
      fastify.io.emit("validation:started", {
        projectName,
        targetLanguage,
        namespace,
        key,
      });

      // Validate with Ollama
      const result = await validateTranslation(
        sourceText,
        targetText,
        sourceLanguage,
        targetLanguage,
        model
      );

      // Send notification that validation is completed
      fastify.io.emit("validation:completed", {
        projectName,
        targetLanguage,
        namespace,
        key,
        result,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to validate translation",
        details: error.message,
      });
    }
  });

  // Validate multiple translations in a namespace
  fastify.post("/validate/namespace", async (request, reply) => {
    try {
      const {
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        model,
        maxKeys = 10, // Limit the number of keys to validate to avoid overloading
      } = request.body;

      if (!model) {
        return reply
          .code(400)
          .send({ success: false, error: "Model is required" });
      }

      // Get source and target translations
      const sourceTranslations = await fsUtils.readTranslationFile(
        projectName,
        sourceLanguage,
        namespace
      );

      const targetTranslations = await fsUtils.readTranslationFile(
        projectName,
        targetLanguage,
        namespace
      );

      if (!sourceTranslations) {
        return reply.code(404).send({
          success: false,
          error: "Source translation file not found",
        });
      }

      if (!targetTranslations) {
        return reply.code(404).send({
          success: false,
          error: "Target translation file not found",
        });
      }

      // Flatten the translations for easier processing
      const flattenedSource = flattenObject(sourceTranslations);
      const flattenedTarget = flattenObject(targetTranslations);

      // Select keys that exist in both source and target
      const keysToValidate = Object.keys(flattenedSource)
        .filter(
          (key) =>
            key in flattenedTarget &&
            typeof flattenedSource[key] === "string" &&
            typeof flattenedTarget[key] === "string" &&
            flattenedSource[key] &&
            flattenedTarget[key]
        )
        .slice(0, maxKeys);

      // Track overall progress
      const totalKeys = keysToValidate.length;
      let completedKeys = 0;

      // Send notification that validation is starting
      fastify.io.emit("validation:batch:started", {
        projectName,
        namespace,
        sourceLanguage,
        targetLanguage,
        total: totalKeys,
      });

      // Create a promise for each key validation
      const results = {};

      // Process keys sequentially to avoid overwhelming the LLM service
      for (const key of keysToValidate) {
        try {
          const sourceText = flattenedSource[key];
          const targetText = flattenedTarget[key];

          // Validate the translation
          const validationResult = await validateTranslation(
            sourceText,
            targetText,
            sourceLanguage,
            targetLanguage,
            model
          );

          results[key] = validationResult;

          // Update progress
          completedKeys++;
          fastify.io.emit("validation:batch:progress", {
            projectName,
            namespace,
            sourceLanguage,
            targetLanguage,
            progress: completedKeys,
            total: totalKeys,
            currentKey: key,
          });
        } catch (error) {
          console.error(`Error validating ${key}:`, error);
          results[key] = {
            isValid: false,
            errors: [{ message: `Validation failed: ${error.message}` }],
            suggestions: [],
          };

          // Update progress even when error occurs
          completedKeys++;
          fastify.io.emit("validation:batch:progress", {
            projectName,
            namespace,
            sourceLanguage,
            targetLanguage,
            progress: completedKeys,
            total: totalKeys,
            currentKey: key,
            error: error.message,
          });
        }
      }

      // Send notification that validation is completed
      fastify.io.emit("validation:batch:completed", {
        projectName,
        namespace,
        sourceLanguage,
        targetLanguage,
        total: totalKeys,
        completed: completedKeys,
      });

      return {
        success: true,
        data: {
          results,
          stats: {
            total: totalKeys,
            completed: completedKeys,
            valid: Object.values(results).filter((r) => r.isValid).length,
            invalid: Object.values(results).filter((r) => !r.isValid).length,
          },
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to validate namespace translations",
        details: error.message,
      });
    }
  });

  // Translate a single key
  fastify.post("/translate/key", async (request, reply) => {
    try {
      const {
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        key,
        model,
      } = request.body;

      if (!model) {
        return reply
          .code(400)
          .send({ success: false, error: "Model is required" });
      }

      // Get source text from the source language file
      const sourceTranslations = await fsUtils.readTranslationFile(
        projectName,
        sourceLanguage,
        namespace
      );

      if (!sourceTranslations) {
        return reply
          .code(404)
          .send({ success: false, error: "Source translation file not found" });
      }

      // Extract source text from the key path
      const keyParts = key.split(".");
      let sourceText = sourceTranslations;
      for (const part of keyParts) {
        if (!sourceText[part]) {
          return reply.code(404).send({
            success: false,
            error: `Key "${key}" not found in source`,
          });
        }
        sourceText = sourceText[part];
      }

      if (typeof sourceText !== "string") {
        return reply
          .code(400)
          .send({ success: false, error: "Source text is not a string" });
      }

      // Send notification that translation is starting
      fastify.io.emit("translation:started", {
        projectName,
        targetLanguage,
        namespace,
        key,
      });

      // Translate with Ollama
      const translatedText = await translateText(
        sourceText,
        sourceLanguage,
        targetLanguage,
        model
      );

      // Update the translation file
      const targetTranslations =
        (await fsUtils.readTranslationFile(
          projectName,
          targetLanguage,
          namespace
        )) || {};

      // Update the key in the target translations
      let current = targetTranslations;
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }

      const finalKey = keyParts[keyParts.length - 1];
      current[finalKey] = translatedText;

      // Save the updated translation file
      const success = await fsUtils.writeTranslationFile(
        projectName,
        targetLanguage,
        namespace,
        targetTranslations
      );

      if (!success) {
        return reply
          .code(500)
          .send({ success: false, error: "Failed to update translation file" });
      }

      // Send notification that translation is completed
      fastify.io.emit("translation:completed", {
        projectName,
        targetLanguage,
        namespace,
        key,
        value: translatedText,
      });

      return {
        success: true,
        data: {
          sourceText,
          translatedText,
        },
      };
    } catch (error) {
      request.log.error(error);

      return reply.code(500).send({
        success: false,
        error: "Translation failed",
        details: error.message,
      });
    }
  });

  // Batch translate all keys in a namespace
  fastify.post("/translate/namespace", async (request, reply) => {
    try {
      const { projectName, sourceLanguage, targetLanguage, namespace, model } =
        request.body;

      if (!model) {
        return reply
          .code(400)
          .send({ success: false, error: "Model is required" });
      }

      // Get source translations
      const sourceTranslations = await fsUtils.readTranslationFile(
        projectName,
        sourceLanguage,
        namespace
      );

      if (!sourceTranslations) {
        return reply
          .code(404)
          .send({ success: false, error: "Source translation file not found" });
      }

      // Get or create target translations
      let targetTranslations =
        (await fsUtils.readTranslationFile(
          projectName,
          targetLanguage,
          namespace
        )) || {};

      // Start translation process asynchronously
      reply.send({
        success: true,
        message: "Batch translation started",
        data: {
          totalKeys: countStringValues(sourceTranslations),
        },
      });

      // Notify clients that batch translation started
      fastify.io.emit("batch-translation:started", {
        projectName,
        targetLanguage,
        namespace,
        totalKeys: countStringValues(sourceTranslations),
      });

      // Use a helper function to translate nested keys
      await translateNestedKeys(
        fastify,
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        sourceTranslations,
        targetTranslations,
        model,
        "", // Start with empty key prefix
        0 // Start counter at 0
      );

      // Save the final translations
      await fsUtils.writeTranslationFile(
        projectName,
        targetLanguage,
        namespace,
        targetTranslations
      );

      // Notify clients that batch translation is completed
      fastify.io.emit("batch-translation:completed", {
        projectName,
        targetLanguage,
        namespace,
      });
    } catch (error) {
      request.log.error(error);
      fastify.io.emit("batch-translation:error", {
        error: "Batch translation failed",
        details: error.message,
      });
    }
  });
}

/**
 * Recursive function to translate all nested keys
 */
async function translateNestedKeys(
  fastify,
  projectName,
  sourceLanguage,
  targetLanguage,
  namespace,
  sourceObj,
  targetObj,
  model,
  prefix,
  counter
) {
  for (const [key, value] of Object.entries(sourceObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string" && value.trim()) {
      // Update counter and notify clients of progress
      counter++;
      fastify.io.emit("batch-translation:progress", {
        projectName,
        targetLanguage,
        namespace,
        currentKey: fullKey,
        counter,
      });

      try {
        // Translate the text
        const translatedText = await translateText(
          value,
          sourceLanguage,
          targetLanguage,
          model
        );

        // Set the translated text in the target object
        let current = targetObj;
        const keyParts = fullKey.split(".");

        for (let i = 0; i < keyParts.length - 1; i++) {
          const part = keyParts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }

        const finalKey = keyParts[keyParts.length - 1];
        current[finalKey] = translatedText;
      } catch (error) {
        fastify.log.error(
          `Failed to translate key ${fullKey}: ${error.message}`
        );
        // Continue with other keys even if one fails
      }
    } else if (typeof value === "object" && value !== null) {
      // Ensure target has this key as an object
      if (!targetObj[key] || typeof targetObj[key] !== "object") {
        targetObj[key] = {};
      }

      // Recursively translate nested object
      counter = await translateNestedKeys(
        fastify,
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        value,
        targetObj[key],
        model,
        fullKey,
        counter
      );
    }
  }

  return counter;
}

/**
 * Count string values in a nested object
 */
function countStringValues(obj) {
  let count = 0;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      count++;
    } else if (typeof value === "object" && value !== null) {
      count += countStringValues(value);
    }
  }

  return count;
}

/**
 * Get a human-readable language name from language code
 */
function getLanguageName(code) {
  // Language mapping based on DocSpace translations
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

  return languageMap[code] || code.toUpperCase();
}

/**
 * Get language information for translation context
 */
function getLanguageInfo(code) {
  // List of RTL languages
  const rtlLanguages = ["ar", "he", "fa", "ur"];
  const isRtl = rtlLanguages.some((rtlCode) => code.startsWith(rtlCode));

  return {
    code,
    name: getLanguageName(code),
    isRightToLeft: isRtl,
  };
}

/**
 * Translate text using Ollama API
 */
async function translateText(text, sourceLanguage, targetLanguage, model) {
  // Get language information for better translation context
  const sourceInfo = getLanguageInfo(sourceLanguage);
  const targetInfo = getLanguageInfo(targetLanguage);

  // Create a more detailed prompt with language information
  //     const prompt = `Translate the following text from ${sourceInfo.name} to ${targetInfo.name}.
  // ${targetInfo.isRightToLeft ? 'Note that the target language is written right-to-left.' : ''}
  // Please maintain any formatting, placeholders (like {{variable}}), and HTML tags if present.
  // Return only the translated text without any commentary or explanations.\n\n${text}`;

  const prompt = `# You are a professional translator.

## Task: Translate from ${sourceInfo.name} to ${targetInfo.name}

### Rules:
${targetInfo.isRightToLeft ? "- Note that the target language is written right-to-left." : ""}
- Preserve all formatting
- Keep {{variables}} unchanged
- Keep HTML tags intact
- Return only the translation
- If you don't know the translation, return "NO_TRANSLATION"

### Text to translate:
${text}`;

  try {
    // First verify Ollama connection
    const isConnected = await verifyOllamaConnection();
    if (!isConnected) {
      throw new Error("Ollama service is unavailable");
    }

    // Configure Ollama API settings
    debug(
      `Connecting to Ollama API at: ${ollamaConfig.apiUrl} for translation`
    );
    debug(`Using model: ${model}`);
    debug(
      `Translating text of length ${text.length} from ${sourceInfo.name} (${sourceLanguage}) to ${targetInfo.name} (${targetLanguage})`
    );

    // Create a new Ollama client instance
    const ollamaClient = new Ollama({ host: ollamaConfig.apiUrl });

    // Generate translation using ollama client
    debug("Sending translation request...");

    const { response } = await ollamaClient.generate({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0, // Lower temperature for more accurate translations
      },
    });

    if (response === "NO_TRANSLATION") {
      throw new Error("Translation not available");
    }

    return response.trim();
  } catch (error) {
    debug("Translation error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      prompt,
    });

    console.error("Translation error:", error);
    throw error;
  }
}

/**
 * Helper to flatten a nested object with dot notation
 */
function flattenObject(obj, prefix = "", result = {}) {
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObject(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

/**
 * Validate a translation using Ollama LLM
 */
async function validateTranslation(
  sourceText,
  targetText,
  sourceLanguage,
  targetLanguage,
  model
) {
  try {
    // Get language information for better context
    const sourceInfo = getLanguageInfo(sourceLanguage);
    const targetInfo = getLanguageInfo(targetLanguage);

    // Create a detailed prompt for validation
    const prompt = `You are a professional translation validator.

Source language: ${sourceInfo.name}
Target language: ${targetInfo.name}

Source text: "${sourceText}"
Translated text: "${targetText}"

Your task is to analyze if the translation is accurate and identify any errors.

Provide your response in this exact JSON format with no extra text:
{
  "isValid": true/false,
  "errors": [{ "type": "error_type", "message": "detailed error description" }],
  "suggestions": ["suggested correction if there are errors"],
  "rating": 1-5 score of translation quality
}

Error types can be: "missing_content", "mistranslation", "grammar", "style", "cultural_context".
Keep your analysis concise and precise.`;

    // Verify Ollama connection
    const isConnected = await verifyOllamaConnection();
    if (!isConnected) {
      throw new Error("Ollama service is unavailable");
    }

    // Configure Ollama API
    debug(`Connecting to Ollama API at: ${ollamaConfig.apiUrl} for validation`);
    debug(`Using model: ${model}`);

    // Create Ollama client
    const ollamaClient = new Ollama({ host: ollamaConfig.apiUrl });

    // Generate validation using ollama client
    debug("Sending validation request...");

    const { response } = await ollamaClient.generate({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0, // Lower temperature for more consistent analysis
      },
    });

    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON format in response");
      }

      const jsonStr = jsonMatch[0];
      const result = JSON.parse(jsonStr);

      // Ensure the result has the expected structure
      return {
        isValid: Boolean(result.isValid),
        errors: Array.isArray(result.errors) ? result.errors : [],
        suggestions: Array.isArray(result.suggestions)
          ? result.suggestions
          : [],
        rating: Number(result.rating) || 0,
      };
    } catch (jsonError) {
      debug("Failed to parse LLM response as JSON:", jsonError);
      debug("Raw response:", response);

      // Fallback: create a structured response based on the text
      return {
        isValid: false,
        errors: [
          {
            type: "validation_error",
            message: "Failed to analyze translation",
          },
        ],
        suggestions: [],
        rating: 0,
        rawResponse: response.trim(),
      };
    }
  } catch (error) {
    debug("Validation error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });
    console.error("Translation validation error:", error);
    throw error;
  }
}

module.exports = routes;
