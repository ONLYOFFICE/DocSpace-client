// Language display names in their native script.
// These are locale-independent — the same for all UI languages.
// Data lives in public/locales/.constants/cultures.json
import cultureNames from "../../../public/locales/.constants/cultures.json";

export const getCultureLabel = (code: string): string =>
  (cultureNames as Record<string, string>)[code] ?? code;

export default cultureNames;
