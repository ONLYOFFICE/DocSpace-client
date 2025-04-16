/**
 * Language utilities for DocSpace Translation App
 */

/**
 * Maps language codes to human-readable language names
 * Based on DocSpace Common.json Culture_* entries
 */
export const languageMap: Record<string, string> = {
  // Base languages
  en: 'English',
  'en-GB': 'English (United Kingdom)',
  'en-US': 'English (United States)',
  fr: 'French',
  de: 'German',
  'de-CH': 'German (Switzerland)',
  es: 'Spanish',
  'es-MX': 'Spanish (Mexico)',
  it: 'Italian',
  pt: 'Portuguese',
  'pt-BR': 'Portuguese (Brazil)',
  ru: 'Russian',
  zh: 'Chinese',
  'zh-CN': 'Chinese (Simplified)',
  ja: 'Japanese',
  'ja-JP': 'Japanese',
  ko: 'Korean',
  'ko-KR': 'Korean',
  ar: 'Arabic',
  'ar-SA': 'Arabic (Saudi Arabia)',
  tr: 'Turkish',
  pl: 'Polish',
  nl: 'Dutch',
  cs: 'Czech',
  sk: 'Slovak',
  bg: 'Bulgarian',
  az: 'Azerbaijani',
  'el-GR': 'Greek',
  fi: 'Finnish',
  'hy-AM': 'Armenian',
  'lo-LA': 'Lao',
  lv: 'Latvian',
  ro: 'Romanian',
  si: 'Sinhala',
  sl: 'Slovenian',
  'sr-Cyrl-RS': 'Serbian (Cyrillic)',
  'sr-Latn-RS': 'Serbian (Latin)',
  'uk-UA': 'Ukrainian',
  vi: 'Vietnamese',
};

/**
 * Gets the human-readable language name from a language code
 * @param code Language code (e.g., 'en', 'fr', 'zh-CN')
 * @returns Human-readable language name or uppercase code if not found
 */
export function getLanguageName(code: string): string {
  return languageMap[code] || code.toUpperCase();
}

/**
 * Gets language information for AI translation prompts
 * @param code Language code
 * @returns Object with language information
 */
export function getLanguageInfo(code: string): {
  code: string;
  name: string;
  isRightToLeft: boolean;
} {
  // List of RTL languages
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  const isRtl = rtlLanguages.some(rtlCode => code.startsWith(rtlCode));
  
  return {
    code,
    name: getLanguageName(code),
    isRightToLeft: isRtl
  };
}
