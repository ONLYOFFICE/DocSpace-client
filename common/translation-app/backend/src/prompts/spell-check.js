/**
 * LLM prompt for translation spell-check / verification.
 */

/**
 * Prompt for verifying a translation against the English source.
 *
 * @param {Object} params
 * @param {string} params.englishContent
 * @param {string} params.translatedContent
 * @param {string} params.languageName - Human-readable language name
 * @param {string} [params.contextBlock] - Optional context from metadata
 * @returns {string}
 */
function spellCheck({ englishContent, translatedContent, languageName, contextBlock }) {
  return `
# Translation Verification Task

You are a translation quality checker for ONLYOFFICE DocSpace UI strings. Your ONLY task is to find CRITICAL translation errors.

## Content to verify:
- **English:** "${englishContent}"
- **${languageName}:** "${translatedContent}"
${contextBlock ? `\n## Additional context (from metadata):\n${contextBlock}\n` : ""}

## Your task:
Check if the ${languageName} translation accurately conveys the SAME MEANING as the English text AND preserves all technical markup.

## Report ONLY these CRITICAL issues:
1. **incorrect_translation** - Translation has completely wrong or opposite meaning
2. **missing_content** - Important words or information are missing from the translation
3. **wrong_language** - Text is in the wrong language or wrong script (e.g. Latin used where Cyrillic is required)
4. **missing_variable** - One or more {{variable}} tokens from the English are absent or renamed in the translation
5. **missing_tag** - One or more React Trans tags (<0>, </0>, <1>, </1>, etc.) or HTML tags (<br/>, <strong>, etc.) are dropped, added, or altered

## Variable and tag rules (CRITICAL):
- Every {{variable}} in the English MUST appear in the translation with identical spelling and braces. Count them — the translation must contain exactly the same number.
- Every numbered React tag <N> / </N> must be present and matched in the translation.
- All HTML tags must be copied character-for-character (tag name, attributes, order).

## DO NOT report:
- Minor grammar improvements
- Style preferences
- Alternative wording that means the same thing
- Punctuation differences
- Capitalization differences
- Formal vs informal tone

## Response format:
Return a JSON array. Each issue must have:
- "type": One of: incorrect_translation, missing_content, wrong_language, missing_variable, missing_tag
- "description": Brief explanation of the critical error
- "suggestion": Corrected translation

If the translation correctly conveys the meaning and preserves all markup, return an empty array [].

**IMPORTANT:**
- Respond with ONLY the JSON array
- Be strict: only report CRITICAL errors that change meaning or break markup
- Do not escape [ ] brackets in strings
  `;
}

module.exports = { spellCheck };
