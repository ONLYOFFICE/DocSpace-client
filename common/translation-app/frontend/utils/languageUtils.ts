/**
 * Language utilities for DocSpace Translation App
 */

const cultures = [
  "az",
  "cs",
  "de",
  "en-GB",
  "en-US",
  "es",
  "fr",
  "it",
  "lv",
  "nl",
  "pl",
  "pt-BR",
  "pt",
  "ro",
  "sk",
  "sl",
  "sq-AL",
  "fi",
  "vi",
  "tr",
  "el-GR",
  "bg",
  "ru",
  "sr-Cyrl-RS",
  "sr-Latn-RS",
  "uk-UA",
  "hy-AM",
  "ar-SA",
  "si",
  "lo-LA",
  "zh-CN",
  "ja-JP",
  "ko-KR",
];

/**
 * Maps language codes to human-readable language names
 * Based on DocSpace Common.json Culture_* entries
 * Filtered to only include languages from the cultures array
 */
export const languageMap: Record<string, string> = {
  // Base languages
  en: "English",
  "en-GB": "English (United Kingdom)",
  "en-US": "English (United States)",
  fr: "French",
  de: "German",
  es: "Spanish",
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
  vi: "Vietnamese",
  ro: "Romanian",
  sl: "Slovenian",
  lv: "Latvian",
  "hy-AM": "Armenian",
  "lo-LA": "Lao",
  si: "Sinhala",
  "sr-Cyrl-RS": "Serbian (Cyrillic)",
  "sr-Latn-RS": "Serbian (Latin)",
  "uk-UA": "Ukrainian",
  "sq-AL": "Albanian",
};

// Check if all cultures are in the languageMap, if not, add them with their code as name
cultures.forEach((code) => {
  if (!languageMap[code]) {
    // Extract base code if it's a region-specific code
    const baseCode = code.includes("-") ? code.split("-")[0] : code;

    // If we have a name for the base code, use it as a base for the region name
    if (baseCode !== code && languageMap[baseCode]) {
      languageMap[code] = code;
    } else {
      languageMap[code] = code.toUpperCase();
    }
  }
});

/**
 * Color palette for languages - inspired by national flags but softer/muted
 * Filtered to only include languages from the cultures array
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  // Base languages with softer flag-inspired colors
  en: "#8096c6", // UK - Soft royal blue
  de: "#b3b3a1", // Germany - Soft black/red/gold blend
  fr: "#a2a8d3", // France - Soft blue/white/red blend
  es: "#d9af8b", // Spain - Soft red/yellow blend
  it: "#a5c9b7", // Italy - Soft green/white/red blend
  ru: "#c4b8cf", // Russia - Soft white/blue/red blend
  zh: "#e3bfb5", // China - Soft red with yellow hints
  pt: "#a0c6b8", // Portugal - Soft green/red blend
  ja: "#f0d0d0", // Japan - Soft white/red blend
  ko: "#c3d4e5", // South Korea - Soft blue/red/black blend
  nl: "#c0d3e8", // Netherlands - Soft red/white/blue blend
  pl: "#e0c4c4", // Poland - Soft white/red blend
  cs: "#b7c3e1", // Czech Republic - Soft blue/white/red blend
  fi: "#c8d6e5", // Finland - Soft blue/white blend

  // Additional languages
  tr: "#e5c3c3", // Turkey - Soft red with white
  ar: "#d1d6be", // Arabic (various) - Soft green blend
  vi: "#f3d2b3", // Vietnam - Soft red/yellow blend
  uk: "#c9dfc5", // Ukraine - Soft blue/yellow blend
  ro: "#c7d2e3", // Romania - Soft blue/yellow/red blend
  bg: "#d3dcc5", // Bulgaria - Soft white/green/red blend
  sk: "#cfd5e3", // Slovakia - Soft white/blue/red blend
  az: "#dcc5c5", // Azerbaijan - Soft blue/red/green blend
  sl: "#c7d2e3", // Slovenia - Soft white/blue/red blend
  lv: "#e5c3c3", // Latvia - Soft dark red/white blend
  hy: "#e5c3c3", // Armenia - Soft red/blue/orange blend
  sr: "#d3cfd3", // Serbia - Soft red/blue/white blend
  si: "#f0d0d0", // Sinhala/Sri Lanka - Soft maroon/gold blend
  lo: "#cdd8e0", // Lao - Soft blue/red/white blend
};

// Generate colors for all cultures not yet defined
cultures.forEach((code) => {
  // Check if this culture code already has a color
  if (!LANGUAGE_COLORS[code]) {
    // Extract base code if it's a region-specific code
    const baseCode = code.includes("-") ? code.split("-")[0] : code;

    // If we have a color for the base code, use it
    if (baseCode !== code && LANGUAGE_COLORS[baseCode]) {
      LANGUAGE_COLORS[code] = LANGUAGE_COLORS[baseCode];
    } else {
      // Generate a color hash for this language
      let hash = 0;
      for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Convert to a soft pastel hex color
      let r = ((hash & 0xff) % 156) + 100; // 100-255 range for a softer color
      let g = (((hash >> 8) & 0xff) % 156) + 100;
      let b = (((hash >> 16) & 0xff) % 156) + 100;

      LANGUAGE_COLORS[code] =
        `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  }
});

/**
 * Gets the human-readable language name from a language code
 * @param code Language code (e.g., 'en', 'fr', 'zh-CN')
 * @returns Human-readable language name or uppercase code if not found
 */
export function getLanguageName(code: string): string {
  // Handle case when code is null or undefined
  if (!code) return "Unknown";

  return languageMap[code] || code.toUpperCase();
}

/**
 * Get color for a language code - fallback to a hash-based color for languages not in the palette
 */
/**
 * Get color for a language code - returns a consistent color for each language code
 * Only languages in the cultures array have predefined colors
 */
export const getLanguageColor = (languageCode: string): string => {
  if (!languageCode) return "#cccccc"; // Default gray for unknown

  // Check if this is a language in our supported cultures
  const isSupportedCulture = cultures.includes(languageCode);

  // If not supported and not a region variant of a supported culture, return a neutral gray
  if (
    !isSupportedCulture &&
    !cultures.some((c) => languageCode.startsWith(c.split("-")[0]))
  ) {
    return "#aaaaaa"; // Neutral gray for unsupported languages
  }

  // Use predefined color if available
  if (LANGUAGE_COLORS[languageCode]) {
    return LANGUAGE_COLORS[languageCode];
  }

  // Try base language if this is a regional variant
  if (languageCode.includes("-")) {
    const baseCode = languageCode.split("-")[0];
    if (LANGUAGE_COLORS[baseCode]) {
      return LANGUAGE_COLORS[baseCode];
    }
  }

  // Generate a consistent color based on hash of the language code
  let hash = 0;
  for (let i = 0; i < languageCode.length; i++) {
    hash = languageCode.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to a soft pastel hex color
  let r = ((hash & 0xff) % 156) + 100; // 100-255 range for a softer color
  let g = (((hash >> 8) & 0xff) % 156) + 100;
  let b = (((hash >> 16) & 0xff) % 156) + 100;

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

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
  const rtlLanguages = ["ar", "he", "fa", "ur"];
  const isRtl = rtlLanguages.some((rtlCode) => code.startsWith(rtlCode));

  return {
    code,
    name: getLanguageName(code),
    isRightToLeft: isRtl,
  };
}
