// Shared parser for JSON files with locale-suffix overrides.
//
// Format:
//   "ProviderApple": "Apple"        — default for all languages
//   "ProviderApple-si": "..."       — override for Sinhala
//
// Returns a lookup function: (key, locale?) => string

type Entry = { defaultValue: string; overrides: Record<string, string> };

export function parseLocaleConstants(rawData: Record<string, string>) {
  const parsed: Record<string, Entry> = {};

  for (const [rawKey, value] of Object.entries(rawData)) {
    const match = rawKey.match(
      /^(.+?)-((?:[a-z]{2,3})(?:-[A-Z][a-zA-Z]+-[A-Z]{2}|-[A-Z]{2})?)$/,
    );

    if (match) {
      const [, baseKey, locale] = match;
      if (!parsed[baseKey]) {
        parsed[baseKey] = { defaultValue: "", overrides: {} };
      }
      parsed[baseKey].overrides[locale] = value;
    } else {
      if (!parsed[rawKey]) {
        parsed[rawKey] = { defaultValue: value, overrides: {} };
      } else {
        parsed[rawKey].defaultValue = value;
      }
    }
  }

  const keys = new Set(Object.keys(parsed));

  function get(key: string, locale?: string): string {
    const entry = parsed[key];
    if (!entry) return key;
    if (locale && entry.overrides[locale]) return entry.overrides[locale];
    return entry.defaultValue;
  }

  return { get, keys, parsed };
}
