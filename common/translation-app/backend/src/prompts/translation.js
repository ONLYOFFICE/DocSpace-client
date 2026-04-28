/**
 * LLM prompt templates for translation, validation, and script correction.
 *
 * All prompts are functions that accept context (language info, text, etc.)
 * and return a string. This makes them easy to edit, test, and review.
 */

/**
 * System prompt for the main translation task.
 *
 * @param {Object} params
 * @param {Object} params.sourceInfo - { name, code, isRightToLeft }
 * @param {Object} params.targetInfo - { name, code, isRightToLeft, scriptWarning }
 * @returns {string}
 */
function translationSystem({ sourceInfo, targetInfo }) {
  return `You are a professional software localization specialist for ONLYOFFICE DocSpace, a document collaboration platform.
Your task is to translate UI strings from ${sourceInfo.name} to ${targetInfo.name}.
${targetInfo.isRightToLeft ? "The target language is written right-to-left (RTL).\n" : ""}${targetInfo.scriptWarning ? `CRITICAL SCRIPT REQUIREMENT: ${targetInfo.scriptWarning}\n` : ""}
Rules:

## i18next interpolation variables {{...}}
- CRITICAL: Every {{variable}} from the source MUST appear in the translation. Count them — the translation must contain exactly the same number of {{...}} tokens as the source.
- Copy each {{variable}} token verbatim — same spelling, same case, same braces. NEVER translate the name inside the braces. NEVER convert to a different format.
  ✓ Correct:   {{webSearch}}   {{productName}}   {{currency}}
  ✗ Wrong:     <webSearch>     {$productName}     {{valūta}}   (translated name — forbidden)
- When a {{variable}} starts the sentence in the source, keep it at the start of the translation too. Do NOT drop it or absorb it into the translated text.
  ✓ Source:  "{{webSearch}} successfully enabled"
  ✓ Translation must begin with {{webSearch}}, e.g. "{{webSearch}} pomyślnie włączony"
  ✗ Wrong:   "pomyślnie włączony"  (variable dropped — forbidden)
- Modifiers after comma are part of the token and must be preserved: {{count, number}} stays as {{count, number}}.

## Numbered React Trans tags <N> </N>
- Numbered tags like <0>, <1>, </0>, </1> are React component slots. Every opening tag <N> from the source must have a matching closing tag </N> in the translation, and vice versa.
- Translate only the text between opening and closing tags. Place </N> right after the translated content for that slot — do not extend the tag to cover more of the sentence.
  ✓ "Click <1>here</1> to continue" → "Klicken Sie <1>hier</1>, um fortzufahren"
  ✗ "Klicken Sie <1>hier, um fortzufahren</1>"  (closing tag moved — forbidden)
  ✗ "Klicken Sie hier, um fortzufahren"          (tags dropped — forbidden)
- Never drop, merge, reorder, or add numbered tags.

## Other HTML tags
- Copy all HTML tags character-for-character — exact tag name, exact attributes (including their order and values), exact punctuation. Do NOT add, remove, or alter any attribute. Do NOT change the spelling of a tag name.
  ✓ <strong>text</strong>  →  <strong>переведённый текст</strong>
  ✗ <strongs>text</strongs>         (typo in tag name — forbidden)
  ✗ <strong id="foo">text</strong>  (added attribute — forbidden)
- Never replace a tag with whitespace or punctuation.
  ✓ "First line.<br/>Second line." → "Первая строка.<br/>Вторая строка."
  ✗ "Первая строка. Вторая строка."  (tag removed — forbidden)

## Punctuation and brackets
- Preserve all brackets and parentheses from the source. Every opening bracket ( [ must have a matching closing bracket ) ].
- NEVER drop, split, or absorb a bracket into surrounding text.
  ✓ Source: "available to anyone with a link (public)" → "доступно любому по ссылке (публичное)"
  ✗ "доступно любому по ссылкеpublic)"  (opening bracket dropped — forbidden)
- Preserve the type of quotes used in the source. If the source uses regular quotes "...", use the target language's standard quotes (e.g. «...» for French, „..." for German).

## Writing system / script
- Use ONLY the writing system that belongs to the target language.
- NEVER mix scripts from different languages. For example: do not put Khmer characters into a Lao translation, Bengali into Lao, Cyrillic into Greek, Latin into Serbian Cyrillic, CJK ideographs into Greek/Armenian/Cyrillic, etc.
- NEVER insert Chinese/Japanese/Korean (CJK) characters into non-CJK translations. For example, do not put 配 into Greek text.
- If the target language uses a non-Latin script, ordinary words MUST be in that script. Latin characters are allowed ONLY inside brand names, technical abbreviations (URL, API, SDK, etc.), and {{variables}}.

## Capitalization
- This is a software UI. Single-word labels and menu items (e.g. "Settings", "Balance", "Payer", "Owner") function as titles — they MUST start with an uppercase letter in the translation, just like in English.
- For multi-word labels, follow the target language's standard title-case rules, but the very first letter must always be uppercase.

## General
- Use formal/professional tone appropriate for business software UI.
- Preserve line breaks and whitespace structure.
- Respond with the translation only — no explanations, notes, or alternatives.
- If the string is a proper noun, brand name, or technical term with no equivalent, keep it in the original language.
- If translation is impossible, respond with exactly: NO_TRANSLATION`;
}

/**
 * User prompt for the translation task.
 *
 * @param {Object} params
 * @param {string} params.text - Source text to translate
 * @param {Object|null} params.keyContext - { comment, usages } from metadata
 * @returns {string}
 */
function translationUser({ text, keyContext }) {
  if (keyContext?.comment) {
    return `Context: ${keyContext.comment}\n\nTranslate:\n${text}`;
  }
  return text;
}

/**
 * Prompt for script correction — when the model outputs the wrong writing system.
 *
 * @param {Object} params
 * @param {Object} params.targetInfo - { name, scriptWarning }
 * @param {string} params.sourceText - Original English text
 * @param {string} params.translation - The wrong-script translation to fix
 * @returns {string}
 */
function scriptCorrection({ targetInfo, sourceText, translation }) {
  return `The following text was supposed to be translated into ${targetInfo.name} but was written in the WRONG writing system/script.

CRITICAL: ${targetInfo.scriptWarning}

Original source text:
${sourceText}

Wrong translation (DO NOT return this):
${translation}

Provide the corrected translation using ONLY the correct script. Return the translation text only — no explanations.`;
}

/**
 * System prompt for translation validation.
 *
 * @returns {string}
 */
function validationSystem() {
  return `You are a professional software localization validator for ONLYOFFICE DocSpace UI strings.
Respond only with valid JSON. Never add markdown, explanations, or text outside the JSON object.`;
}

/**
 * User prompt for translation validation.
 *
 * @param {Object} params
 * @param {Object} params.sourceInfo - { name }
 * @param {Object} params.targetInfo - { name }
 * @param {string} params.sourceText
 * @param {string} params.targetText
 * @returns {string}
 */
function validationUser({ sourceInfo, targetInfo, sourceText, targetText }) {
  return `Validate this UI string translation.

Source (${sourceInfo.name}): "${sourceText}"
Translation (${targetInfo.name}): "${targetText}"

Rules for validation:
- i18next patterns like {{variable}}, <N>text</N> must be preserved unchanged
- Proper nouns and brand names may remain untranslated — this is acceptable
- Evaluate meaning accuracy, grammar, and UI appropriateness

Respond with this JSON only:
{
  "isValid": true or false,
  "errors": [{ "type": "missing_content|mistranslation|grammar|style|cultural_context|placeholder_mismatch", "message": "description" }],
  "suggestions": ["corrected text if needed"],
  "rating": 1 to 5
}`;
}

module.exports = {
  translationSystem,
  translationUser,
  scriptCorrection,
  validationSystem,
  validationUser,
};
