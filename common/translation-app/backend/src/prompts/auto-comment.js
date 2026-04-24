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
      ? u.context.substring(0, 400) + (u.context.length > 400 ? "..." : "")
      : "",
  }));

  return `
You write short descriptions of UI strings for translators of ONLYOFFICE DocSpace.

**Key:** ${keyPath}
**English:** "${content}"
**Code usage:**
${processedUsages
  .map((u) => `  ${u.file_path}:${u.line_number}\n  ${u.context}`)
  .join("\n\n")}

Write ONE description (1-2 sentences) that answers:
- What UI element is this? (button label, dialog title, toast message, tooltip, placeholder, error text, etc.)
- What does it do or when does it appear?
- Any context a translator needs (e.g. "this is a noun, not a verb", "appears as a short label", "part of a sentence with variables").

Rules:
- Be specific and concise. No filler words.
- Do NOT start with "This translation key is used..." or "This key displays..."
- Do NOT repeat the English text verbatim.
- If the string contains {{variables}} or <tags>, mention what they represent.
- If the UI element type is clear from code (Button, Dialog title, Toast), state it directly.

Reply with ONLY the description, nothing else.
  `;
}

module.exports = { autoComment };
