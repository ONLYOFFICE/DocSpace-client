/**
 * LLM prompt for auto-generating translation key descriptions.
 */

/**
 * Prompt for generating a comment/description for a translation key.
 *
 * @param {Object} params
 * @param {string} params.keyPath - The translation key name
 * @param {string} params.content - English content of the key
 * @param {Array<{file_path: string, line_number: number, context: string}>} params.usages
 * @returns {string}
 */
function autoComment({ keyPath, content, usages }) {
  const processedUsages = (usages || []).slice(0, 3).map((u) => ({
    ...u,
    context: u.context
      ? u.context.substring(0, 300) + (u.context.length > 300 ? "..." : "")
      : "",
  }));

  return `
# Translation Key Description Task

## Context Information
- **Key Name:** ${keyPath}
- **English Content:** "${content}"
- **Usage Contexts:**
${processedUsages
  .map(
    (u) =>
      `  - **File:** ${u.file_path}\n    **Line:** ${u.line_number}\n    **Context:** ${u.context}`,
  )
  .join("\n")}

## Instructions
You are a helpful assistant that creates concise descriptions for translation keys.
Based on this information, please write a short, clear description of what this translation key is used for.

- Keep it to 1-3 sentences
- Explain the purpose of this text in the UI
- Mention where it appears (button, dialog, etc.) if apparent
- Provide context helpful for translators

**Important:** Respond with ONLY the description, no additional text.
  `;
}

module.exports = { autoComment };
