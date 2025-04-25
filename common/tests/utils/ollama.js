// Copyright 2025 alexeysafronov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const { Ollama } = require("ollama");

const ollamaApi = "http://localhost:11434";

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

// Helper to verify Ollama connection
async function verifyOllamaConnection() {
  console.log(`Verifying Ollama connection to ${ollamaApi}`);
  try {
    const response = await fetch(`${ollamaApi}/api/tags`);
    if (!response.ok) {
      console.log(
        `Ollama connection failed: ${response.status} ${response.statusText}`
      );
      return false;
    }
    const data = await response.json();
    console.log(
      `Ollama connection successful, found ${data.models?.length || 0} models`
    );
    return true;
  } catch (error) {
    console.log(`Ollama connection error: ${error.message}`);
    return false;
  }
}

/**
 * Validate a translation using Ollama LLM
 */
async function validateTranslation(
  sourceText,
  targetText,
  sourceLanguage,
  targetLanguage,
  model = "gemma3:12b"
) {
  try {
    // Check if source and target texts are identical (indicating no translation)
    if (sourceText === targetText && sourceLanguage !== targetLanguage) {
      console.log(
        "Validation failed: Source and target texts are identical but languages differ"
      );
      return {
        isValid: false,
        errors: [
          {
            type: "missing_translation",
            message:
              "The target text is identical to the source text. No translation was performed.",
          },
        ],
        suggestions: [
          "Please provide an actual translation in the target language",
        ],
        rating: 0,
      };
    }
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
  First, verify if the source text is actually in ${sourceInfo.name} and if the target text is actually in ${targetInfo.name}.
  If there's a language mismatch (e.g., source text is not in ${sourceInfo.name} or target text is not in ${targetInfo.name}), mark the translation as invalid and indicate the detected languages.
  
  Provide your response in this exact JSON format with no extra text:
  {
    "isValid": true/false,
    "errors": [{ "type": "error_type", "message": "detailed error description" }],
    "suggestions": ["suggested correction if there are errors"],
    "sourceLanguageCorrect": true/false,
    "targetLanguageCorrect": true/false,
    "detectedSourceLanguage": "language name if different from expected",
    "detectedTargetLanguage": "language name if different from expected",
    "rating": 1-5 score of translation quality
  }
  
  Error types can be: "missing_content", "mistranslation", "grammar", "style", "cultural_context", "language_mismatch".
  Keep your analysis concise and precise.`;

    // Verify Ollama connection
    const isConnected = await verifyOllamaConnection();
    if (!isConnected) {
      throw new Error("Ollama service is unavailable");
    }

    // Configure Ollama API
    console.log(`Connecting to Ollama API at: ${ollamaApi} for validation`);
    console.log(`Using model: ${model}`);

    // Create Ollama client
    const ollamaClient = new Ollama({ host: ollamaApi });

    // Generate validation using ollama client
    console.log("Sending validation request...");

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
      const output = {
        isValid: Boolean(result.isValid),
        errors: Array.isArray(result.errors) ? result.errors : [],
        suggestions: Array.isArray(result.suggestions)
          ? result.suggestions
          : [],
        rating: Number(result.rating) || 0,
        sourceLanguageCorrect: result.sourceLanguageCorrect !== false,
        targetLanguageCorrect: result.targetLanguageCorrect !== false,
      };

      // Add detected language info if available
      if (result.detectedSourceLanguage)
        output.detectedSourceLanguage = result.detectedSourceLanguage;
      if (result.detectedTargetLanguage)
        output.detectedTargetLanguage = result.detectedTargetLanguage;

      // If there's a language mismatch, ensure the translation is marked invalid
      if (!output.sourceLanguageCorrect || !output.targetLanguageCorrect) {
        output.isValid = false;

        // Add a language mismatch error if not already present
        const hasLanguageMismatchError = output.errors.some(
          (error) => error.type === "language_mismatch"
        );
        if (!hasLanguageMismatchError) {
          let errorMessage = "Language mismatch detected: ";
          if (!output.sourceLanguageCorrect) {
            errorMessage +=
              `Source text is not in ${sourceInfo.name}` +
              (output.detectedSourceLanguage
                ? ` (detected: ${output.detectedSourceLanguage})`
                : "");
          }
          if (!output.sourceLanguageCorrect && !output.targetLanguageCorrect) {
            errorMessage += " and ";
          }
          if (!output.targetLanguageCorrect) {
            errorMessage +=
              `Target text is not in ${targetInfo.name}` +
              (output.detectedTargetLanguage
                ? ` (detected: ${output.detectedTargetLanguage})`
                : "");
          }

          output.errors.push({
            type: "language_mismatch",
            message: errorMessage,
          });
        }
      }

      return output;
    } catch (jsonError) {
      console.log("Failed to parse LLM response as JSON:", jsonError);
      console.log("Raw response:", response);

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
    console.error("Validation error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Validate translations for a single key across multiple languages in one batch
 * This is much more efficient than calling validateTranslation multiple times
 */
async function validateTranslationBatch(
  key,
  sourceText,
  translations,
  sourceLanguage = "en",
  model = "gemma3:12b"
) {
  try {
    // Get source language info
    const sourceInfo = getLanguageInfo(sourceLanguage);

    // Format translations for the prompt
    const translationsFormatted = translations
      .map((t) => {
        const langInfo = getLanguageInfo(t.language);
        return `${langInfo.name} (${t.language}): "${t.text}"`;
      })
      .join("\n");

    // Create a detailed prompt for batch validation
    const prompt = `You are a professional translation validator.

You are evaluating translations of the same text across multiple languages.

Original key: "${key}"
Source language: ${sourceInfo.name} (${sourceLanguage})
Source text: "${sourceText}"

Translations to validate:
${translationsFormatted}

For EACH translation, analyze if it is accurate compared to the source text.
Check for: missing content, mistranslations, grammar issues, or language mismatches.

Provide your response in this exact JSON format with no extra text:
{
  "results": [
    {
      "language": "language-code",
      "isValid": true/false,
      "errors": [{ "type": "error_type", "message": "detailed error description" }],
      "suggestions": ["suggested correction if there are errors"]
    },
    // Repeat for each language
  ],
  "summary": {
    "validCount": number,
    "invalidCount": number,
    "commonIssues": ["description of issues found across multiple languages"]
  }
}

Error types can be: "missing_content", "mistranslation", "grammar", "style", "cultural_context", "language_mismatch".
Keep your analysis concise and precise.`;

    console.log(`\nStarting batch translation validation...\n`);
    console.log(`Testing all keys across all available languages`);
    console.log(`${prompt}\n`);

    // Verify Ollama connection
    const isConnected = await verifyOllamaConnection();
    if (!isConnected) {
      throw new Error("Ollama service is unavailable");
    }

    // Configure Ollama API
    console.log(
      `Connecting to Ollama API at: ${ollamaApi} for batch validation`
    );
    console.log(`Using model: ${model}`);

    // Create Ollama client
    const ollamaClient = new Ollama({ host: ollamaApi });

    // Generate validation using ollama client
    console.log(
      `Sending batch validation request for key: ${key} with ${translations.length} languages...`
    );

    const { response } = await ollamaClient.generate({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0,
      },
    });

    // Parse the JSON response
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON format in response");
      }

      const jsonStr = jsonMatch[0];
      const result = JSON.parse(jsonStr);

      // Ensure the result has the expected structure
      if (!result.results || !Array.isArray(result.results)) {
        throw new Error("Missing results array in response");
      }

      // Format the results to match our expected output
      return {
        key,
        sourceLanguage,
        sourceText,
        results: result.results.map((r) => ({
          language: r.language,
          isValid: Boolean(r.isValid),
          errors: Array.isArray(r.errors) ? r.errors : [],
          suggestions: Array.isArray(r.suggestions) ? r.suggestions : [],
        })),
        summary: result.summary || {
          validCount: result.results.filter((r) => r.isValid).length,
          invalidCount: result.results.filter((r) => !r.isValid).length,
          commonIssues: [],
        },
      };
    } catch (jsonError) {
      console.log("Failed to parse LLM response as JSON:", jsonError);
      console.log("Raw response:", response);

      // Fallback response
      return {
        key,
        sourceLanguage,
        sourceText,
        results: translations.map((t) => ({
          language: t.language,
          isValid: false,
          errors: [
            {
              type: "validation_error",
              message: "Failed to analyze translation",
            },
          ],
          suggestions: [],
        })),
        summary: {
          validCount: 0,
          invalidCount: translations.length,
          commonIssues: ["Validation failed due to JSON parsing error"],
        },
      };
    }
  } catch (error) {
    console.log(`Batch validation error: ${error.message}`);

    // Fallback response for any errors
    return {
      key,
      sourceLanguage,
      sourceText,
      results: translations.map((t) => ({
        language: t.language,
        isValid: false,
        errors: [
          {
            type: "system_error",
            message: `Validation failed: ${error.message}`,
          },
        ],
        suggestions: [],
      })),
      summary: {
        validCount: 0,
        invalidCount: translations.length,
        commonIssues: [`System error: ${error.message}`],
      },
    };
  }
}

module.exports = {
  validateTranslation,
  validateTranslationBatch,
  getLanguageInfo,
};
