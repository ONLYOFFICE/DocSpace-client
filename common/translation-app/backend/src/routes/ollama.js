const { ollamaConfig, openRouterConfig, lmstudioConfig } = require("../config/config");
const fsUtils = require("../utils/fsUtils");
const { verifyOllamaConnection } = require("../utils/ollamaUtils");
const prompts = require("../prompts/translation");
const {
  isLMStudioModel,
  isOpenRouterModel,
  getProviderName,
  verifyConnection,
  listOllamaModels,
  listOpenRouterModels,
  listLMStudioModels,
  verifyLMStudioConnection,
  createStreamingChat,
  completionChat,
} = require("../utils/llmProvider");

const DEBUG = true;
function debug(...args) {
  if (DEBUG) console.log("[LLM]", ...args);
}

// Active project translation jobs: jobId -> { cancelled: boolean }
const activeJobs = new Map();

// The active ollama AbortableAsyncIterator — call .abort() to stop an in-flight stream.
let currentOllamaStream = null;
let userAbortRequested = false;

function abortCurrentTranslation() {
  console.log("[ABORT] abortCurrentTranslation called, stream:", !!currentOllamaStream);
  if (currentOllamaStream) {
    userAbortRequested = true;
    currentOllamaStream.abort();
    currentOllamaStream = null;
  }
}

/**
 * Ollama integration route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get available models from Ollama and/or OpenRouter
  fastify.get("/models", async (request, reply) => {
    try {
      const allModels = [];

      // Try Ollama
      try {
        debug(`Attempting to connect to Ollama API at: ${ollamaConfig.apiUrl}`);
        const isOllamaConnected = await verifyOllamaConnection();
        if (isOllamaConnected) {
          const ollamaModels = await listOllamaModels();
          debug(`Ollama: retrieved ${ollamaModels.length} models`);
          allModels.push(...ollamaModels);
        } else {
          debug("Ollama: not available");
        }
      } catch (error) {
        debug(`Ollama error: ${error.message}`);
      }

      // Try LM Studio
      try {
        debug(`Attempting to connect to LM Studio at: ${lmstudioConfig.apiUrl}`);
        const isLMStudioConnected = await verifyLMStudioConnection();
        if (isLMStudioConnected) {
          const lmstudioModels = await listLMStudioModels();
          debug(`LM Studio: retrieved ${lmstudioModels.length} models`);
          allModels.push(...lmstudioModels);
        } else {
          debug("LM Studio: not available");
        }
      } catch (error) {
        debug(`LM Studio error: ${error.message}`);
      }

      // Try OpenRouter
      try {
        const openRouterModels = await listOpenRouterModels();
        debug(`OpenRouter: retrieved ${openRouterModels.length} models`);
        allModels.push(...openRouterModels);
      } catch (error) {
        debug(`OpenRouter: ${error.message}`);
      }

      if (allModels.length === 0) {
        return reply.code(503).send({
          success: false,
          error: "No LLM providers available",
          details: "Neither Ollama, OpenRouter nor LM Studio returned models",
        });
      }

      return { success: true, data: allModels };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to list models",
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
        model,
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
        namespace,
      );

      const targetTranslations = await fsUtils.readTranslationFile(
        projectName,
        targetLanguage,
        namespace,
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
            flattenedTarget[key],
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
            model,
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
        namespace,
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
      const keyContext = await readKeyContext(projectName, namespace, key);
      const debugEmit = (event, data) =>
        fastify.io.emit(event, { namespace, key, targetLanguage, ...data });
      const result = await translateText(
        sourceText,
        sourceLanguage,
        targetLanguage,
        model,
        keyContext,
        debugEmit,
      );

      // Model declined to translate (NO_TRANSLATION) — fall back to source text
      const finalText = result.text ?? sourceText;
      const warnings = result.warnings || [];

      // Update the translation file
      const targetTranslations =
        (await fsUtils.readTranslationFile(
          projectName,
          targetLanguage,
          namespace,
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
      current[finalKey] = finalText;

      // Save the updated translation file
      const success = await fsUtils.writeTranslationFile(
        projectName,
        targetLanguage,
        namespace,
        targetTranslations,
      );

      if (!success) {
        return reply
          .code(500)
          .send({ success: false, error: "Failed to update translation file" });
      }

      // Write integrity warnings to .meta file
      if (warnings.length > 0) {
        try {
          const meta = await fsUtils.findMetadataFile(projectName, namespace, key);
          if (meta) {
            if (!meta.data.languages) meta.data.languages = {};
            if (!meta.data.languages[targetLanguage]) {
              meta.data.languages[targetLanguage] = {
                ai_translated: true,
                ai_model: model,
                ai_spell_check_issues: [],
                approved_at: null,
              };
            }
            meta.data.languages[targetLanguage].ai_spell_check_issues = warnings;
            meta.data.languages[targetLanguage].ai_translated = true;
            meta.data.languages[targetLanguage].ai_model = model;
            meta.data.updated_at = new Date().toISOString();
            await fsUtils.writeJsonWithConsistentEol(meta.filePath, meta.data);
            debug(`[meta] Wrote ${warnings.length} warning(s) for ${namespace}:${key} [${targetLanguage}]`);
          }
        } catch (metaError) {
          debug(`[meta] Failed to write warnings: ${metaError.message}`);
        }
      }

      // Send notification that translation is completed
      fastify.io.emit("translation:completed", {
        projectName,
        targetLanguage,
        namespace,
        key,
        value: finalText,
        warnings,
      });

      return {
        success: true,
        data: {
          sourceText,
          translatedText: finalText,
          warnings,
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
        namespace,
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
          namespace,
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
        0, // Start counter at 0
      );

      // Save the final translations
      let ok = await fsUtils.writeTranslationFile(
        projectName,
        targetLanguage,
        namespace,
        targetTranslations,
      );

      if (!ok) {
        throw new Error("Failed to save translated namespace file");
      }

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

  // Translate all untranslated keys in every namespace of a project
  fastify.post("/translate/project", async (request, reply) => {
    const { projectName, sourceLanguage, targetLanguage, model, jobId } =
      request.body;

    if (!model || !jobId) {
      return reply
        .code(400)
        .send({ success: false, error: "model and jobId are required" });
    }

    // Resolve target languages: "all" expands to every non-source language
    let targetLanguages;
    if (targetLanguage === "all") {
      try {
        const allLangs = await fsUtils.getAvailableLanguages(projectName);
        targetLanguages = allLangs.filter((l) => l !== sourceLanguage);
      } catch (err) {
        return reply
          .code(404)
          .send({ success: false, error: "Project not found" });
      }
    } else {
      targetLanguages = [targetLanguage];
    }

    // Get all namespaces for the source language
    let namespaces;
    try {
      namespaces = await fsUtils.getNamespaces(projectName, sourceLanguage);
    } catch (err) {
      return reply
        .code(404)
        .send({ success: false, error: "Project or language not found" });
    }

    if (!namespaces || namespaces.length === 0) {
      return reply
        .code(404)
        .send({
          success: false,
          error: "No namespaces found for this project",
        });
    }

    // Pre-load source translations once, then build per-language queues
    const sourceByNamespace = {};
    for (const namespace of namespaces) {
      const src = await fsUtils.readTranslationFile(
        projectName,
        sourceLanguage,
        namespace,
      );
      if (src) sourceByNamespace[namespace] = src;
    }

    // Count total keys across all languages
    let totalKeys = 0;
    const langQueues = {};
    for (const lang of targetLanguages) {
      const queue = [];
      for (const namespace of namespaces) {
        const src = sourceByNamespace[namespace];
        if (!src) continue;

        const tgt =
          (await fsUtils.readTranslationFile(projectName, lang, namespace)) ||
          {};
        const flatSrc = flattenObject(src);
        const flatTgt = flattenObject(tgt);
        const missingKeys = Object.keys(flatSrc).filter(
          (k) => typeof flatSrc[k] === "string" && !flatTgt[k],
        );

        if (missingKeys.length > 0) {
          queue.push({
            namespace,
            sourceTranslations: src,
            targetTranslations: tgt,
            missingKeys,
          });
          totalKeys += missingKeys.length;
        }
      }
      langQueues[lang] = queue;
    }

    // Register job and respond immediately
    activeJobs.set(jobId, { cancelled: false });

    reply.send({
      success: true,
      message: "Project translation started",
      data: { jobId, totalKeys, languageCount: targetLanguages.length },
    });

    fastify.io.emit("project-translation:started", {
      jobId,
      projectName,
      targetLanguage,
      targetLanguages,
      totalKeys,
      languageCount: targetLanguages.length,
    });

    let completedKeys = 0;

    try {
      for (const lang of targetLanguages) {
        if (activeJobs.get(jobId)?.cancelled) break;

        fastify.io.emit("project-translation:language-start", {
          jobId,
          projectName,
          currentLanguage: lang,
          totalKeys,
        });

        for (const {
          namespace,
          sourceTranslations,
          targetTranslations,
          missingKeys,
        } of langQueues[lang]) {
          if (activeJobs.get(jobId)?.cancelled) break;

          fastify.io.emit("project-translation:namespace-start", {
            jobId,
            projectName,
            currentLanguage: lang,
            namespace,
            namespaceKeys: missingKeys.length,
          });

          for (const keyPath of missingKeys) {
            if (activeJobs.get(jobId)?.cancelled) break;

            const keyParts = keyPath.split(".");
            let sourceText = sourceTranslations;
            for (const part of keyParts) {
              sourceText = sourceText?.[part];
            }
            if (typeof sourceText !== "string") continue;

            try {
              const keyContext = await readKeyContext(projectName, namespace, keyPath);
              const debugEmit = (event, data) =>
                fastify.io.emit(event, { jobId, namespace, key: keyPath, targetLanguage: lang, ...data });
              const result = await translateText(
                sourceText,
                sourceLanguage,
                lang,
                model,
                keyContext,
                debugEmit,
              );

              const translatedText = result.text ?? sourceText;

              let cursor = targetTranslations;
              for (let i = 0; i < keyParts.length - 1; i++) {
                if (!cursor[keyParts[i]]) cursor[keyParts[i]] = {};
                cursor = cursor[keyParts[i]];
              }
              cursor[keyParts[keyParts.length - 1]] = translatedText;

              // Write warnings to .meta
              if (result.warnings && result.warnings.length > 0) {
                try {
                  const meta = await fsUtils.findMetadataFile(projectName, namespace, keyPath);
                  if (meta) {
                    if (!meta.data.languages) meta.data.languages = {};
                    if (!meta.data.languages[lang]) {
                      meta.data.languages[lang] = { ai_translated: true, ai_model: model, ai_spell_check_issues: [], approved_at: null };
                    }
                    meta.data.languages[lang].ai_spell_check_issues = result.warnings;
                    meta.data.languages[lang].ai_translated = true;
                    meta.data.languages[lang].ai_model = model;
                    meta.data.updated_at = new Date().toISOString();
                    await fsUtils.writeJsonWithConsistentEol(meta.filePath, meta.data);
                  }
                } catch (metaErr) {
                  debug(`[meta] Failed: ${metaErr.message}`);
                }
              }

              completedKeys++;
              fastify.io.emit("project-translation:progress", {
                jobId,
                projectName,
                currentLanguage: lang,
                namespace,
                currentKey: keyPath,
                completedKeys,
                totalKeys,
              });
            } catch (err) {
              fastify.log.error(
                `project-translation: failed on ${lang}/${namespace}/${keyPath}: ${err.message}`,
              );
            }
          }

          await fsUtils.writeTranslationFile(
            projectName,
            lang,
            namespace,
            targetTranslations,
          );
        }
      }

      const wasCancelled = activeJobs.get(jobId)?.cancelled;
      activeJobs.delete(jobId);

      if (wasCancelled) {
        fastify.io.emit("project-translation:stopped", {
          jobId,
          projectName,
          completedKeys,
          totalKeys,
        });
      } else {
        fastify.io.emit("project-translation:completed", {
          jobId,
          projectName,
          completedKeys,
          totalKeys,
        });
      }
    } catch (error) {
      activeJobs.delete(jobId);
      fastify.log.error(error);
      fastify.io.emit("project-translation:error", {
        jobId,
        projectName,
        error: error.message,
      });
    }
  });

  // Stop an active project translation
  fastify.post("/translate/project/stop", async (request, reply) => {
    const { jobId } = request.body;

    if (!jobId) {
      return reply
        .code(400)
        .send({ success: false, error: "jobId is required" });
    }

    const job = activeJobs.get(jobId);
    if (job) {
      job.cancelled = true;
    }

    return { success: true };
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
  counter,
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
        const keyContext = await readKeyContext(projectName, namespace, fullKey);
        const result = await translateText(
          value,
          sourceLanguage,
          targetLanguage,
          model,
          keyContext,
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
        current[finalKey] = result.text ?? value;

        // Write warnings to .meta
        if (result.warnings && result.warnings.length > 0) {
          try {
            const meta = await fsUtils.findMetadataFile(projectName, namespace, fullKey);
            if (meta) {
              if (!meta.data.languages) meta.data.languages = {};
              if (!meta.data.languages[targetLanguage]) {
                meta.data.languages[targetLanguage] = { ai_translated: true, ai_model: model, ai_spell_check_issues: [], approved_at: null };
              }
              meta.data.languages[targetLanguage].ai_spell_check_issues = result.warnings;
              meta.data.languages[targetLanguage].ai_translated = true;
              meta.data.languages[targetLanguage].ai_model = model;
              meta.data.updated_at = new Date().toISOString();
              await fsUtils.writeJsonWithConsistentEol(meta.filePath, meta.data);
            }
          } catch (metaErr) {
            debug(`[meta] Failed: ${metaErr.message}`);
          }
        }
      } catch (error) {
        fastify.log.error(
          `Failed to translate key ${fullKey}: ${error.message}`,
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
        counter,
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

  for (const [, value] of Object.entries(obj)) {
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

  // Languages that require explicit script enforcement in the prompt.
  // Without this, LLMs tend to produce the wrong writing system
  // (e.g. translating sr-Cyrl-RS into Serbian Latin instead of Cyrillic,
  //  or outputting Khmer/Bengali/Thai characters for Lao).
  const scriptWarnings = {
    "sr-Cyrl-RS":
      "Use CYRILLIC script exclusively. Every Serbian word MUST be written in Cyrillic letters (А, Б, В, Г, Д, Е...). " +
      "NEVER use Latin Serbian characters: š, č, ć, ž, đ or any Latin letters for Serbian words. " +
      "The only Latin characters allowed are: brand names, technical abbreviations (URL, API, SDK, etc.), and {{variables}}. " +
      "Example — correct: «Жао нам је», wrong: «Žao nam je».",
    "lo-LA":
      "Use ONLY Lao script (Unicode U+0E80–U+0EFF). " +
      "NEVER output Khmer, Thai, Bengali, Devanagari, or any other Southeast Asian script. " +
      "Lao and Thai look visually similar but use DIFFERENT Unicode blocks — use Lao only. " +
      "Example Lao characters: ກ ຂ ຄ ງ ຈ ສ ຊ ຍ ດ ຕ ຖ ທ ນ ບ ປ ຜ ຝ ພ ຟ ມ ຢ ຣ ລ ວ ຫ ອ ຮ.",
    si:
      "Use ONLY Sinhala script (Unicode U+0D80–U+0DFF). " +
      "NEVER output Kannada, Telugu, Tamil, Malayalam, or any other South Asian script. " +
      "Example Sinhala characters: අ ආ ඇ ක ග ච ජ ට ඩ ණ ත ද න ප බ ම ය ර ල ව ශ ස හ.",
    "hy-AM":
      "Use ONLY Armenian script (Unicode U+0530–U+058F). " +
      "NEVER output Georgian, Cyrillic, or Greek characters. " +
      "Example Armenian characters: Ա Բ Գ Դ Ե Զ Է Ը Թ Ժ Ի Լ Խ Ծ Կ Հ Ձ Ղ Ճ Մ Յ Ն Շ Ո Չ.",
    "el-GR":
      "Use ONLY Greek script (Unicode U+0370–U+03FF). " +
      "NEVER output Cyrillic, Latin, or CJK/Chinese characters for Greek words. " +
      "Cyrillic and Greek have visually similar letters but are DIFFERENT scripts — use Greek only. " +
      "Example — correct: «ποσόστωση», wrong: «配ότα» (contains Chinese character 配 — forbidden).",
  };

  return {
    code,
    name: getLanguageName(code),
    isRightToLeft: isRtl,
    scriptWarning: scriptWarnings[code] || null,
  };
}

/**
 * Read the AI comment and usage context for a key from its .meta file.
 * Returns null if no metadata exists.
 */
async function readKeyContext(projectName, namespace, keyPath) {
  try {
    const metadata = await fsUtils.findMetadataFile(projectName, namespace, keyPath);
    if (!metadata?.data) return null;

    const comment = metadata.data.comment?.text || null;
    const usages = (metadata.data.usage || [])
      .slice(0, 3) // limit to 3 usage examples to keep prompt concise
      .map((u) => u.context?.trim())
      .filter(Boolean);

    if (!comment && usages.length === 0) return null;
    return { comment, usages };
  } catch {
    return null;
  }
}

/**
 * Translate text using Ollama API
 * @param {string} text - Source text to translate
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @param {string} model - Ollama model name
 * @param {object|null} keyContext - Optional key metadata (comment, usages)
 * @param {function|null} debugEmit - Optional callback(event, data) for real-time debug streaming
 */
async function translateText(text, sourceLanguage, targetLanguage, model, keyContext = null, debugEmit = null) {
  // Get language information for better translation context
  const sourceInfo = getLanguageInfo(sourceLanguage);
  const targetInfo = getLanguageInfo(targetLanguage);

  // Create a more detailed prompt with language information
  //     const prompt = `Translate the following text from ${sourceInfo.name} to ${targetInfo.name}.
  // ${targetInfo.isRightToLeft ? 'Note that the target language is written right-to-left.' : ''}
  // Please maintain any formatting, placeholders (like {{variable}}), and HTML tags if present.
  // Return only the translated text without any commentary or explanations.\n\n${text}`;

  const systemPrompt = prompts.translationSystem({ sourceInfo, targetInfo });
  const userPrompt = prompts.translationUser({ text, keyContext });

  try {
    // Verify provider connection
    const isConnected = await verifyConnection(model);
    if (!isConnected) {
      throw new Error(`${getProviderName(model)} service is unavailable`);
    }

    const providerName = getProviderName(model);
    debug(`[${providerName}] model=${model} | ${sourceInfo.name} (${sourceLanguage}) → ${targetInfo.name} (${targetLanguage}) | ${text.length} chars`);
    debug(`System prompt:\n${systemPrompt}\n\nUser prompt:\n${userPrompt}\n`);

    // Emit prompts to UI debug panel before streaming starts
    debugEmit?.("translation:debug:prompt", { systemPrompt, userPrompt, targetLanguage, sourceLanguage });
    const inactivityMs = isLMStudioModel(model)
      ? lmstudioConfig.inactivityTimeout
      : isOpenRouterModel(model)
        ? openRouterConfig.inactivityTimeout
        : ollamaConfig.inactivityTimeout;
    const firstTokenMs = isLMStudioModel(model)
      ? lmstudioConfig.firstTokenTimeout
      : isOpenRouterModel(model)
        ? openRouterConfig.firstTokenTimeout
        : ollamaConfig.firstTokenTimeout;

    debug(`Step 1: creating ${providerName} stream for model ${model}...`);

    let activeTimeout = null;
    let abortFn = null;
    let contentStarted = false; // true after first CONTENT token (not thinking)

    // During thinking phase, use firstTokenTimeout (model may pause for long periods).
    // After first content token arrives, switch to shorter inactivityTimeout.
    const resetTimer = () => {
      clearTimeout(activeTimeout);
      const ms = contentStarted ? inactivityMs : firstTokenMs;
      activeTimeout = setTimeout(() => {
        debug(`[${providerName}] ${contentStarted ? "inactivity" : "first-content"} timeout after ${ms}ms — aborting`);
        abortFn?.();
      }, ms);
    };

    let fullResponse = "";
    let fullThinking = "";
    let tokenCount = 0;
    userAbortRequested = false;

    try {
      const chatResult = await createStreamingChat(model, [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ], {
        temperature: 0.1,
        maxTokens: 8192,
        think: true,
      });

      abortFn = chatResult.abort;
      // Track raw Ollama stream for external abort (stop button)
      if (chatResult.raw) currentOllamaStream = chatResult.raw;

      debug(`[${providerName}] stream created, waiting for tokens...`);

      // Start with firstTokenTimeout — covers cold-start + full reasoning phase
      activeTimeout = setTimeout(() => {
        debug(`[${providerName}] first-token timeout after ${firstTokenMs}ms — aborting`);
        abortFn?.();
      }, firstTokenMs);

      for await (const chunk of chatResult.stream) {
        const thinkingToken = chunk.thinking || "";
        if (thinkingToken) {
          if (tokenCount === 0) debug(`[${providerName}] first thinking token received`);
          tokenCount++;
          fullThinking += thinkingToken;
          // Reset timer but stay on firstTokenMs — model is still reasoning
          resetTimer();
          debugEmit?.("translation:debug:token", { token: thinkingToken, isThinking: true });
        }

        const token = chunk.content || "";
        if (token) {
          if (!contentStarted) {
            debug(`[${providerName}] first content token received — switching to inactivity timeout`);
            contentStarted = true;
          }
          tokenCount++;
          fullResponse += token;
          // Now using inactivityMs — content should stream without long pauses
          resetTimer();

          // Also handle <think> tags for models that inline thinking in content
          const isInlineThinking = (() => {
            const openCount = (fullResponse.match(/<think>/gi) || []).length;
            const closeCount = (fullResponse.match(/<\/think>/gi) || []).length;
            return openCount > closeCount;
          })();

          // If inside inline <think> block, don't switch to short inactivity yet
          if (isInlineThinking) {
            contentStarted = false;
          }

          debugEmit?.("translation:debug:token", { token, isThinking: isInlineThinking });
        }
      }
      debug(`[${providerName}] stream done, ${tokenCount} tokens collected`);
    } catch (streamError) {
      if (userAbortRequested) {
        userAbortRequested = false;
        throw new Error("Aborted by user");
      }
      throw streamError;
    } finally {
      clearTimeout(activeTimeout);
      currentOllamaStream = null;
    }

    debug(`Raw model response:\n${fullResponse}\n`);

    // Collect thinking from both native field and inline <think> tags
    const thinkMatch = fullResponse.match(/<think>([\s\S]*?)<\/think>/i);
    const thinkingText = fullThinking || (thinkMatch ? thinkMatch[1].trim() : null);
    if (thinkingText) {
      debug(`Model thinking:\n${thinkingText}`);
    }

    // Strip thinking tokens — both complete blocks and truncated ones (hit num_predict limit)
    let cleanedResponse = fullResponse
      .replace(/<think>[\s\S]*?<\/think>/gi, "") // complete: <think>...</think>
      .replace(/<think>[\s\S]*/gi, "")            // incomplete: <think>... (no closing tag)
      .trim();

    debug(`Cleaned response:\n${cleanedResponse}\n`);

    // ── Fallback: reasoning-only model ────────────────────────────────────────
    // Some reasoning-distilled models (e.g. certain Qwen3 variants in LM Studio)
    // emit the entire output — including the final answer — inside the reasoning /
    // thinking field and produce zero content tokens.
    // Retry as a non-streaming completion with thinking suppressed via a system
    // instruction so the model outputs the translation directly.
    if (!cleanedResponse && thinkingText) {
      debug("Reasoning-only response detected — retrying with thinking suppressed");
      try {
        const retryResult = await completionChat(
          model,
          [
            {
              role: "system",
              content:
                systemPrompt +
                "\n\nIMPORTANT: Respond with the translated text ONLY. Do not think, reason, or explain.",
            },
            { role: "user", content: userPrompt },
          ],
          { temperature: 0, maxTokens: 512 },
        );
        cleanedResponse = (retryResult || "").trim();
        if (cleanedResponse) {
          debug(`Retry (thinking suppressed) result: "${cleanedResponse}"`);
        }
      } catch (retryErr) {
        debug(`Retry failed: ${retryErr.message}`);
      }
    }

    // Emit final result to UI debug panel (after fallback so it reflects the actual result)
    debugEmit?.("translation:debug:result", {
      result: cleanedResponse,
      thinkingText: thinkingText ?? null,
    });

    if (cleanedResponse === "NO_TRANSLATION") {
      return { text: null, warnings: [] }; // model explicitly declined
    }

    if (!cleanedResponse) {
      throw new Error(
        "Model returned empty response. This appears to be a reasoning-only model " +
        "that produces no output after thinking. Try a non-reasoning model or " +
        "one that outputs text after the thinking phase.",
      );
    }

    // ── Post-translation auto-fixes (best-effort, never reject) ─────────
    // Collect integrity warnings — will be saved to .meta by the caller
    const integrityWarnings = [];
    let finalTranslation = cleanedResponse;

    // 1. Normalize self-closing HTML tags: <br /> → <br/>, <hr /> → <hr/>
    //    Only if the source text does NOT contain the spaced variant (it might be intentional).
    if (!text.includes(" />")) {
      finalTranslation = finalTranslation.replace(/<(\w+)\s+\/>/g, "<$1/>");
    }

    // 2. Auto-repair {{variable}} typos (wrong case, missing braces, truncated name, etc.)
    const srcVars = (text.match(/\{\{[^}]+\}\}/g) || []).sort();
    const tgtVars = (finalTranslation.match(/\{\{[^}]+\}\}/g) || []).sort();
    if (srcVars.length > 0 && srcVars.join(",") !== tgtVars.join(",")) {
      debug(`[integrity] Variable mismatch — attempting repair. source=[${srcVars}] translation=[${tgtVars}]`);
      for (const srcVar of srcVars) {
        if (finalTranslation.includes(srcVar)) continue;

        const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const varName = srcVar.replace(/^\{\{|\}\}$/g, "").replace(/, .+/, "");
        let repaired = false;

        // Level 1: full name with partial braces — {{varName}?, {{varName, {varName}}
        const p1 = new RegExp(`\\{?\\{?\\s*${esc(varName)}\\s*\\}?\\}?`, "gi");
        const m1 = finalTranslation.match(p1);
        if (m1 && m1[0] !== srcVar) {
          debug(`[integrity] L1 repair: "${m1[0]}" → "${srcVar}"`);
          finalTranslation = finalTranslation.replace(m1[0], srcVar);
          repaired = true;
        }

        // Level 2: truncated name — model kept only part of camelCase name
        // e.g. {{productName}} became {{Name}} or {{product}}
        if (!repaired) {
          const parts = varName.split(/(?=[A-Z])/); // ["thirdparty", "Folder", "Name"]
          for (let len = parts.length - 1; len >= 1; len--) {
            const partial = parts.slice(-len).join("");  // try "FolderName", then "Name"
            const p2 = new RegExp(`\\{\\{\\s*${esc(partial)}\\s*\\}\\}`, "gi");
            const m2 = finalTranslation.match(p2);
            if (m2) {
              debug(`[integrity] L2 repair: "${m2[0]}" → "${srcVar}"`);
              finalTranslation = finalTranslation.replace(m2[0], srcVar);
              repaired = true;
              break;
            }
          }
        }

        // Level 3: bare fragment without any braces — "thirdparty}}" or "FolderName"
        if (!repaired) {
          const p3 = new RegExp(`${esc(varName)}\\s*\\}?\\}?`, "gi");
          const m3 = finalTranslation.match(p3);
          if (m3) {
            debug(`[integrity] L3 repair: "${m3[0]}" → "${srcVar}"`);
            finalTranslation = finalTranslation.replace(m3[0], srcVar);
            repaired = true;
          }
        }
      }
      const repairedVars = (finalTranslation.match(/\{\{[^}]+\}\}/g) || []).sort();
      if (srcVars.join(",") !== repairedVars.join(",")) {
        debug(`[integrity] Variable repair incomplete — saving as-is. expected=[${srcVars}] got=[${repairedVars}]`);
        debugEmit?.("translation:debug:warning", { type: "variable_mismatch", expected: srcVars, actual: repairedVars });
        integrityWarnings.push({ type: "variable_mismatch", description: `Expected variables ${srcVars.join(", ")} but got ${repairedVars.join(", ")}` });
      }
    }

    // 3. Auto-repair broken HTML/React tags, then warn if still mismatched
    const tagRegex = /<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*\/?>/g;
    const brokenClosingTag = /<\/>/g; // models sometimes output </> instead of </strong> etc.
    const normalizeTag = (t) => t.replace(/\s+/g, " ").replace(/\s>/g, ">").replace(/\s\/>/g, "/>");
    const srcTags = (text.match(tagRegex) || []).map(normalizeTag).sort();
    let tgtTags = (finalTranslation.match(tagRegex) || []).map(normalizeTag).sort();

    if (srcTags.length > 0 && srcTags.join(",") !== tgtTags.join(",")) {
      // Try to fix </> → correct closing tag from source
      if (brokenClosingTag.test(finalTranslation)) {
        const srcClosingTags = srcTags.filter((t) => t.startsWith("</"));
        const tgtClosingTags = tgtTags.filter((t) => t.startsWith("</"));
        const missingClosing = srcClosingTags.filter((t) => !tgtClosingTags.includes(t));
        if (missingClosing.length > 0) {
          // Replace each </> with the corresponding missing closing tag
          let repaired = finalTranslation;
          for (const tag of missingClosing) {
            repaired = repaired.replace("</>", tag);
          }
          debug(`[integrity] Repaired broken closing tags: </> → ${missingClosing.join(", ")}`);
          finalTranslation = repaired;
          tgtTags = (finalTranslation.match(tagRegex) || []).map(normalizeTag).sort();
        }
      }

      if (srcTags.join(",") !== tgtTags.join(",")) {
        debug(`[integrity] Tag mismatch — saving as-is. source=[${srcTags}] translation=[${tgtTags}]`);
        debugEmit?.("translation:debug:warning", { type: "tag_mismatch", expected: srcTags, actual: tgtTags });
        integrityWarnings.push({ type: "tag_mismatch", description: `Expected tags ${srcTags.join(", ")} but got ${tgtTags.join(", ")}` });
      }
    }

    // 4. Script validation — warn but never block
    if (targetInfo.scriptWarning) {
      const validator = scriptValidators[targetInfo.code];
      if (validator && !validator(finalTranslation, text)) {
        debug(`[integrity] Wrong script detected for ${targetInfo.code} — saving as-is with warning`);
        debugEmit?.("translation:debug:warning", { type: "wrong_script", language: targetInfo.code });
        integrityWarnings.push({ type: "wrong_script", description: `Translation contains characters from wrong writing system for ${targetInfo.code}` });
      }
    }

    return { text: finalTranslation, warnings: integrityWarnings };
  } catch (error) {
    if (error.message === "Aborted by user") {
      debugEmit?.("translation:debug:aborted", {});
    }

    debug(`[${providerName}/${model}] Translation error details:`, {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      systemPrompt,
      userPrompt,
    });

    console.error(`[LLM] Translation error [${providerName}/${model}]:`, error.message);
    throw error;
  }
}

/**
 * Strip {{variables}} and HTML / React Trans tags from a translation string,
 * leaving only the prose characters we want to validate.
 */
function stripMarkupForValidation(text) {
  return text
    .replace(/\{\{[^}]+\}\}/g, "") // {{variables}}
    .replace(/<[^>]+>/g, "");       // <html> / <0> react trans tags
}

/**
 * Script validators: return true if the translation looks correct for the language.
 * Used after translation to decide whether a correction pass is needed.
 *
 * Each validator receives (translationText, sourceText) — sourceText is the
 * original English string, used to distinguish intentionally-unchanged brand
 * names / proper nouns from wrong-script translations.
 */
const scriptValidators = {
  // Algorithm (mirrors the test's WrongScriptTest):
  // 1. Strip variables + tags from both texts.
  // 2. If at least one Cyrillic letter (U+0400–U+04FF) is present → valid.
  //    English brand names (Apple, Google, Windows…) may coexist with Cyrillic prose.
  // 3. Latin Serbian diacritics (š/č/ć/ž/đ) always signal wrong script → invalid.
  // 4. No Cyrillic at all:
  //    a. If nothing meaningful remains (only punctuation/numbers) → valid.
  //    b. If stripped translation equals stripped source → the model intentionally
  //       kept the term unchanged (brand name, proper noun) → valid.
  //    c. Any remaining Latin run ≥ 3 chars → wrong script → invalid.
  "sr-Cyrl-RS": (text, sourceText = "") => {
    const stripped = stripMarkupForValidation(text);
    const strippedSrc = stripMarkupForValidation(sourceText);

    // Step 2: Cyrillic present → valid
    if (/[\u0400-\u04FF]/.test(stripped)) return true;

    // Step 3: Latin Serbian diacritics → always wrong
    if (/[šŠčČćĆžŽđĐ]/.test(stripped)) return false;

    // Step 4a: nothing meaningful left → valid
    const prose = stripped.replace(/[0-9%.,!?;:()\-"'«»\s]/g, "");
    if (!prose) return true;

    // Step 4b: translation unchanged from source (brand name / proper noun) → valid
    if (strippedSrc && stripped.trim() === strippedSrc.trim()) return true;

    // Step 4c: Latin prose remaining → wrong script
    if (/[a-zA-Z]{3,}/.test(stripped.replace(/\b[A-Z]{2,}\b/g, ""))) return false;

    return true;
  },

  // Lao: must contain Lao characters (U+0E80–U+0EFF), must NOT contain
  // Khmer (U+1780–U+17FF), Thai (U+0E00–U+0E7F), Bengali (U+0980–U+09FF),
  // Devanagari (U+0900–U+097F), or other South/Southeast Asian scripts.
  "lo-LA": (text, sourceText = "") => {
    const stripped = stripMarkupForValidation(text);
    const strippedSrc = stripMarkupForValidation(sourceText);

    // Nothing meaningful → valid
    const prose = stripped.replace(/[0-9%.,!?;:()\-"'«»\s\u0000-\u007F]/g, "");
    if (!prose) return true;

    // Unchanged from source → valid (brand name)
    if (strippedSrc && stripped.trim() === strippedSrc.trim()) return true;

    // Must contain Lao
    if (!/[\u0E80-\u0EFF]/.test(stripped)) return false;

    // Must NOT contain foreign scripts
    if (/[\u1780-\u17FF]/.test(stripped)) return false; // Khmer
    if (/[\u0E00-\u0E7F]/.test(stripped)) return false; // Thai
    if (/[\u0980-\u09FF]/.test(stripped)) return false; // Bengali
    if (/[\u0900-\u097F]/.test(stripped)) return false; // Devanagari
    if (/[\u0F00-\u0FFF]/.test(stripped)) return false; // Tibetan
    if (/[\u1000-\u109F]/.test(stripped)) return false; // Myanmar

    return true;
  },

  // Sinhala: must contain Sinhala characters (U+0D80–U+0DFF), must NOT contain
  // Kannada, Telugu, Tamil, Malayalam, or other Indic scripts.
  si: (text, sourceText = "") => {
    const stripped = stripMarkupForValidation(text);
    const strippedSrc = stripMarkupForValidation(sourceText);

    const prose = stripped.replace(/[0-9%.,!?;:()\-"'«»\s\u0000-\u007F]/g, "");
    if (!prose) return true;
    if (strippedSrc && stripped.trim() === strippedSrc.trim()) return true;

    if (!/[\u0D80-\u0DFF]/.test(stripped)) return false;

    if (/[\u0C80-\u0CFF]/.test(stripped)) return false; // Kannada
    if (/[\u0C00-\u0C7F]/.test(stripped)) return false; // Telugu
    if (/[\u0B80-\u0BFF]/.test(stripped)) return false; // Tamil
    if (/[\u0D00-\u0D7F]/.test(stripped)) return false; // Malayalam

    return true;
  },

  // Armenian: must contain Armenian (U+0530–U+058F)
  "hy-AM": (text, sourceText = "") => {
    const stripped = stripMarkupForValidation(text);
    const strippedSrc = stripMarkupForValidation(sourceText);

    const prose = stripped.replace(/[0-9%.,!?;:()\-"'«»\s\u0000-\u007F]/g, "");
    if (!prose) return true;
    if (strippedSrc && stripped.trim() === strippedSrc.trim()) return true;

    if (!/[\u0530-\u058F]/.test(stripped)) return false;

    // Must NOT contain Georgian or Cyrillic
    if (/[\u10A0-\u10FF]/.test(stripped)) return false; // Georgian
    if (/[\u0400-\u04FF]/.test(stripped)) return false; // Cyrillic

    return true;
  },

  // Greek: must contain Greek (U+0370–U+03FF)
  "el-GR": (text, sourceText = "") => {
    const stripped = stripMarkupForValidation(text);
    const strippedSrc = stripMarkupForValidation(sourceText);

    const prose = stripped.replace(/[0-9%.,!?;:()\-"'«»\s\u0000-\u007F]/g, "");
    if (!prose) return true;
    if (strippedSrc && stripped.trim() === strippedSrc.trim()) return true;

    if (!/[\u0370-\u03FF]/.test(stripped)) return false;

    // Must NOT contain Cyrillic (visually similar but wrong)
    if (/[\u0400-\u04FF]/.test(stripped)) return false;

    // Must NOT contain CJK ideographs (model hallucination)
    if (/[\u4E00-\u9FFF]/.test(stripped)) return false;

    return true;
  },
};

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
  model,
) {
  try {
    // Get language information for better context
    const sourceInfo = getLanguageInfo(sourceLanguage);
    const targetInfo = getLanguageInfo(targetLanguage);

    // Verify provider connection
    const isConnected = await verifyConnection(model);
    if (!isConnected) {
      throw new Error(`${getProviderName(model)} service is unavailable`);
    }

    debug(`[${getProviderName(model)}] model=${model} | validation: "${sourceText.substring(0, 60)}" → "${targetText.substring(0, 60)}"`);

    const response = await completionChat(
      model,
      [
        { role: "system", content: prompts.validationSystem() },
        { role: "user", content: prompts.validationUser({ sourceInfo, targetInfo, sourceText, targetText }) },
      ],
      {
        temperature: 0,
        maxTokens: 8192,
        timeout: ollamaConfig.requestTimeout,
      },
    );

    // Parse the JSON response
    try {
      // Strip markdown code fences if present, then extract JSON object
      const cleaned = response
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
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
    debug(`[${getProviderName(model)}/${model}] Validation error:`, error.message);
    console.error(`[LLM] Validation error [${getProviderName(model)}/${model}]:`, error.message);
    throw error;
  }
}

module.exports = routes;
module.exports.abortCurrentTranslation = abortCurrentTranslation;

