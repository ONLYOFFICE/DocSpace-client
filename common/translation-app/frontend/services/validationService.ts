import api, { getLanguages, getTranslations } from "@/lib/api";

export interface ValidationError {
  key: string;
  language: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Validates translations for a namespace, checking for common issues
 * @param projectName Project name
 * @param namespace Namespace to validate
 * @param languages Languages to check (if empty, all available languages will be used)
 * @returns Array of validation errors
 */
export async function validateNamespaceTranslations(
  projectName: string,
  namespace: string,
  languages: string[] = []
): Promise<ValidationError[]> {
  try {
    // If no languages provided, get all available languages
    let languagesToCheck = languages;
    if (languagesToCheck.length === 0) {
      const languagesResponse = await getLanguages(projectName);
      languagesToCheck = languagesResponse.data.data.languages || [];
    }

    if (languagesToCheck.length === 0) {
      return [];
    }

    // Find the base language (usually 'en')
    const baseLanguage = languagesToCheck.includes("en")
      ? "en"
      : languagesToCheck[0];

    // Get base language translations as reference
    const baseTranslationsResponse = await getTranslations(
      projectName,
      baseLanguage,
      namespace
    );

    if (!baseTranslationsResponse.data.success) {
      throw new Error("Failed to get base translations");
    }

    const baseTranslations = baseTranslationsResponse.data.data;
    const errors: ValidationError[] = [];

    // Helper function to recursively flatten translations with path
    const flattenTranslations = (
      obj: any,
      prefix = "",
      result: Record<string, string> = {}
    ) => {
      for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          flattenTranslations(obj[key], newKey, result);
        } else {
          result[newKey] = obj[key];
        }
      }
      return result;
    };

    // Flatten base translations
    const flattenedBase = flattenTranslations(baseTranslations);
    const baseKeys = Object.keys(flattenedBase);

    // Check each language
    for (const language of languagesToCheck) {
      if (language === baseLanguage) continue;

      // Get translations for this language
      const translationsResponse = await getTranslations(
        projectName,
        language,
        namespace
      );

      if (!translationsResponse.data.success) {
        errors.push({
          key: "(file)",
          language,
          message: `Failed to load translation file for ${language}`,
          severity: "error",
        });
        continue;
      }

      const translations = translationsResponse.data.data;
      const flattenedTranslations = flattenTranslations(translations);

      // Missing keys check (keys in base but not in this language)
      for (const key of baseKeys) {
        if (!(key in flattenedTranslations)) {
          errors.push({
            key,
            language,
            message: "Missing translation key",
            severity: "error",
          });
          continue;
        }

        const value = flattenedTranslations[key];

        // Empty translation check
        if (value === null || value === undefined || value.trim() === "") {
          errors.push({
            key,
            language,
            message: "Empty translation",
            severity: "error",
          });
          continue;
        }

        // Check for placeholder consistency
        const basePlaceholders = extractPlaceholders(flattenedBase[key]);
        const translationPlaceholders = extractPlaceholders(value);

        const missingPlaceholders = basePlaceholders.filter(
          (p) => !translationPlaceholders.includes(p)
        );

        const extraPlaceholders = translationPlaceholders.filter(
          (p) => !basePlaceholders.includes(p)
        );

        if (missingPlaceholders.length > 0) {
          errors.push({
            key,
            language,
            message: `Missing placeholders: ${missingPlaceholders.join(", ")}`,
            severity: "error",
          });
        }

        if (extraPlaceholders.length > 0) {
          errors.push({
            key,
            language,
            message: `Extra placeholders: ${extraPlaceholders.join(", ")}`,
            severity: "warning",
          });
        }

        // Check for potential translation issues
        if (isNumericString(flattenedBase[key]) && !isNumericString(value)) {
          errors.push({
            key,
            language,
            message:
              "Numeric value in base language should remain numeric in translation",
            severity: "warning",
          });
        }

        // Issue with significantly different length
        const baseLength = flattenedBase[key].length;
        const translationLength = value.length;

        if (baseLength > 5 && translationLength > 0) {
          const ratio = translationLength / baseLength;

          // If translation is significantly shorter or longer than base
          if (ratio < 0.3 || ratio > 3) {
            errors.push({
              key,
              language,
              message: `Translation length (${translationLength}) is very different from base (${baseLength})`,
              severity: "warning",
            });
          }
        }
      }

      // Extra keys check (keys in this language but not in base)
      for (const key in flattenedTranslations) {
        if (!(key in flattenedBase)) {
          errors.push({
            key,
            language,
            message: "Unexpected translation key (not in base language)",
            severity: "warning",
          });
        }
      }
    }

    return errors;
  } catch (error) {
    console.error("Error validating translations:", error);
    return [
      {
        key: "(system)",
        language: "all",
        message: `Validation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      },
    ];
  }
}

/**
 * Extract placeholders from a string. Supports common formats:
 * - {placeholderName}
 * - {{placeholderName}}
 * - {0}, {1}, {2} (numeric placeholders)
 * - %s, %d (printf style)
 * - $variable (variable style)
 */
function extractPlaceholders(str: string): string[] {
  if (typeof str !== "string") return [];

  const placeholders: string[] = [];

  // Match {placeholder} and {{placeholder}} formats
  const bracketMatches = str.match(/\{\{?([^{}]+)\}?\}/g) || [];
  bracketMatches.forEach((match) => placeholders.push(match));

  // Match %s, %d printf style
  const printfMatches = str.match(/%[sdifoxXeEgGaAcCpn%]/g) || [];
  printfMatches.forEach((match) => placeholders.push(match));

  // Match $variable style
  const variableMatches = str.match(/\$\w+/g) || [];
  variableMatches.forEach((match) => placeholders.push(match));

  return placeholders;
}

/**
 * Check if a string contains only numbers
 */
function isNumericString(str: string): boolean {
  if (typeof str !== "string") return false;
  return /^\d+$/.test(str.trim());
}
