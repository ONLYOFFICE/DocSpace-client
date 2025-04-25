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

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  getAllFiles,
  convertPathToOS,
  getWorkSpaces,
  BASE_DIR,
} = require("../utils/files");
const {
  validateTranslationBatch,
  getLanguageInfo,
} = require("../utils/ollama");

// Global variables to store translation files data
let workspaces = [];
let translationFiles = [];

// Initialize data before running tests
beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  workspaces = getWorkSpaces();
  workspaces.push(path.resolve(BASE_DIR, "public/locales"));

  const translations = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir).filter(
      (filePath) =>
        filePath &&
        filePath.endsWith(".json") &&
        filePath.includes(convertPathToOS("public/locales"))
    );
  });

  console.log(`Found translations by *.json filter = ${translations.length}.`);

  for (const tPath of translations) {
    try {
      const fileContent = fs.readFileSync(tPath, "utf8");
      const hash = crypto.createHash("md5").update(fileContent).digest("hex");
      const jsonTranslation = JSON.parse(fileContent);

      const translationFile = {
        path: tPath,
        fileName: path.basename(tPath),
        translations: Object.entries(jsonTranslation).map(([key, value]) => ({
          key,
          value,
        })),
        md5hash: hash,
        language: path.dirname(tPath).split(path.sep).pop(),
      };

      translationFiles.push(translationFile);
    } catch (ex) {
      console.log(
        `File path = ${tPath} failed to parse with error: ${ex.message}`
      );
    }
  }

  console.log(`Found translationFiles = ${translationFiles.length}.`);
});

describe("Ollama Translation Validation Tests", () => {
  test(
    "Validate translations using Ollama LLM",
    async () => {
      const model = "gemma3:12b";
      const sourceLanguage = "en";

      // Create a detailed message for reporting validation issues
      let message = `\n=== TRANSLATION VALIDATION REPORT ===\n\n`;
      message += `Test configuration:\n`;
      message += `- Model: ${model}\n`;
      message += `- Source language: ${sourceLanguage}\n\n`;
      message += `Validation results:\n\n`;

      // No limit on the number of keys to validate
      const maxSampleKeys = Number.MAX_SAFE_INTEGER; // Effectively no limit
      // Include all available languages
      const targetLanguages = null; // null means test all languages
      // Process all languages for each key in a single batch
      // No limit on languages per batch

      // Track validation results
      const validationResults = {
        totalKeys: 0,
        totalTranslations: 0,
        validTranslations: 0,
        invalidTranslations: 0,
        errorsByLanguage: {},
      };

      // Get all English translation files
      const englishFiles = translationFiles.filter(
        (file) => file.language === sourceLanguage
      );

      console.log(`\nStarting batch translation validation...\n`);
      console.log(`Testing all keys across all available languages`);

      // For each file, get corresponding translations in target languages
      for (const enFile of englishFiles) {
        const namespace = path.basename(enFile.fileName, ".json");
        // Process all files regardless of size
        // Previously skipped files with more than 100 translations

        // Use all appropriate translation keys
        const sampleKeys = enFile.translations
          .filter(
            (t) =>
              t.value &&
              typeof t.value === "string" &&
              t.value.length > 10 &&
              t.value.length < 100
          )
          .map((t) => t.key);

        if (sampleKeys.length === 0) continue;

        // Get target language files for this namespace
        const targetFiles = translationFiles.filter((file) => {
          return (
            file.language !== sourceLanguage &&
            path.basename(file.fileName) === enFile.fileName &&
            (targetLanguages === null ||
              targetLanguages.includes(file.language))
          );
        });

        if (targetFiles.length === 0) continue;

        // For each sampled key
        for (const key of sampleKeys) {
          const sourceText = enFile.translations.find(
            (t) => t.key === key
          )?.value;
          if (!sourceText) continue;

          // Prepare translations for this key
          const keyTranslations = [];

          for (const targetFile of targetFiles) {
            const targetText = targetFile.translations.find(
              (t) => t.key === key
            )?.value;
            if (targetText) {
              keyTranslations.push({
                language: targetFile.language,
                text: targetText,
              });
            }
          }

          if (keyTranslations.length === 0) continue;

          validationResults.totalKeys++;

          // Process all translations for this key in a single API call
          // Validate all translations for this key
          const result = await validateTranslationBatch(
            key,
            sourceText,
            keyTranslations,
            sourceLanguage,
            model
          );

          // Process results
          if (result && result.results) {
            result.results.forEach((langResult) => {
              validationResults.totalTranslations++;

              if (langResult.isValid) {
                validationResults.validTranslations++;
              } else {
                validationResults.invalidTranslations++;

                // Track errors by language
                if (!validationResults.errorsByLanguage[langResult.language]) {
                  validationResults.errorsByLanguage[langResult.language] = [];
                }

                validationResults.errorsByLanguage[langResult.language].push({
                  namespace,
                  key,
                  sourceText,
                  targetText: keyTranslations.find(
                    (t) => t.language === langResult.language
                  )?.text,
                  errors: langResult.errors,
                  suggestions: langResult.suggestions,
                });
              }
            });

            // Log batch summary
            message += `• Key: "${key}" (${namespace})\n`;
            message += `  - Languages validated: ${result.results.length}\n`;
            message += `  - Valid translations: ${result.summary.validCount}\n`;
            message += `  - Invalid translations: ${result.summary.invalidCount}\n`;

            // Add information about the source text
            message += `  - Source text: "${sourceText.substring(0, 50)}${sourceText.length > 50 ? "..." : ""}"\n`;

            // Log any common issues across languages
            if (
              result.summary.commonIssues &&
              result.summary.commonIssues.length > 0
            ) {
              message += `  - Common issues across languages:\n`;
              result.summary.commonIssues.forEach((issue) => {
                message += `    * ${issue}\n`;
              });
            }

            // Log specific language issues (up to 3)
            const invalidResults = result.results.filter((r) => !r.isValid);
            if (invalidResults.length > 0) {
              message += `  - Sample problems (${invalidResults.length} languages with issues):\n`;
              invalidResults.slice(0, 3).forEach((invalid) => {
                const langInfo = getLanguageInfo(invalid.language);
                const targetText =
                  keyTranslations.find((t) => t.language === invalid.language)
                    ?.text || "";
                message += `    * ${langInfo.name} (${invalid.language}): "${targetText.substring(0, 40)}${targetText.length > 40 ? "..." : ""}"\n`;
                invalid.errors.forEach((err) => {
                  message += `      - ${err.type}: ${err.message}\n`;
                });
              });
              if (invalidResults.length > 3) {
                message += `    * Plus ${invalidResults.length - 3} more languages with issues\n`;
              }
            }

            message += `\n`;
          }

          // Limit to maxSampleKeys across all files for faster test
          if (validationResults.totalKeys >= maxSampleKeys) {
            break;
          }
        }

        // Limit to maxSampleKeys across all files for faster test
        if (validationResults.totalKeys >= maxSampleKeys) {
          break;
        }
      }

      // Append validation summary to message
      message += `=== VALIDATION SUMMARY ===\n\n`;
      message += `Statistics:\n`;
      message += `- Total keys validated: ${validationResults.totalKeys}\n`;
      message += `- Total translations validated: ${validationResults.totalTranslations}\n`;
      message += `- Valid translations: ${validationResults.validTranslations} (${Math.round((validationResults.validTranslations / validationResults.totalTranslations) * 100)}%)\n`;
      message += `- Invalid translations: ${validationResults.invalidTranslations} (${Math.round((validationResults.invalidTranslations / validationResults.totalTranslations) * 100)}%)\n\n`;

      // Calculate and add language-specific statistics
      const languageStats = Object.entries(validationResults.errorsByLanguage)
        .map(([lang, errors]) => ({
          language: lang,
          languageName: getLanguageInfo(lang).name,
          errorCount: errors.length,
          errorRate: Math.round(
            (errors.length / validationResults.totalKeys) * 100
          ),
        }))
        .sort((a, b) => b.errorCount - a.errorCount);

      if (languageStats.length > 0) {
        message += `Languages with highest error rates:\n`;
        languageStats.slice(0, 5).forEach((stat) => {
          message += `- ${stat.languageName} (${stat.language}): ${stat.errorCount} errors (${stat.errorRate}% of keys have issues)\n`;
        });
        message += `\n`;
      }

      // Log validation results to console
      console.log(`\nTranslation validation summary:\n`);
      console.log(`Total keys validated: ${validationResults.totalKeys}`);
      console.log(
        `Total translations validated: ${validationResults.totalTranslations}`
      );
      console.log(
        `Valid translations: ${validationResults.validTranslations} (${Math.round((validationResults.validTranslations / validationResults.totalTranslations) * 100)}%)`
      );
      console.log(
        `Invalid translations: ${validationResults.invalidTranslations} (${Math.round((validationResults.invalidTranslations / validationResults.totalTranslations) * 100)}%)`
      );

      // Log detailed errors by language
      if (Object.keys(validationResults.errorsByLanguage).length > 0) {
        console.log(`\nDetailed errors by language:\n`);

        Object.entries(validationResults.errorsByLanguage).forEach(
          ([language, errors]) => {
            const langInfo = getLanguageInfo(language);
            console.log(
              `${langInfo.name} (${language}): ${errors.length} errors`
            );

            errors.slice(0, 3).forEach((error, index) => {
              // Show max 3 errors per language
              console.log(
                `  ${index + 1}. Namespace: ${error.namespace}, Key: ${error.key}`
              );
              console.log(
                `     Source: "${error.sourceText.substring(0, 50)}${error.sourceText.length > 50 ? "..." : ""}"`
              );
              console.log(
                `     Target: "${error.targetText.substring(0, 50)}${error.targetText.length > 50 ? "..." : ""}"`
              );
              console.log(
                `     Errors: ${error.errors.map((e) => e.message).join("; ")}`
              );
            });

            if (errors.length > 3) {
              console.log(`  ... and ${errors.length - 3} more errors`);
            }
            console.log("");
          }
        );
      }

      // Test assertions
      expect(validationResults.totalTranslations).toBeGreaterThan(0);
      // Allow some invalid translations but the majority should be valid
      expect(
        validationResults.validTranslations /
          validationResults.totalTranslations,
        message
      ).toBeGreaterThanOrEqual(0.6);
    },
    Number.MAX_SAFE_INTEGER
  ); // Disable timeout completely for this test
});
