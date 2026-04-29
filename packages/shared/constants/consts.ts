// Technical constants and abbreviations (LDAP, PDF, SSO, etc.).
// Data: public/locales/.constants/consts.json
import { parseLocaleConstants } from "./parse-locale-constants";
import rawData from "../../../public/locales/.constants/consts.json";
import { setConstLookup } from "@docspace/ui-kit/constants/consts";

const { get, keys } = parseLocaleConstants(rawData as Record<string, string>);

/** Get a constant name, optionally localized. */
export const getConstName = get;

/** Set of all constant key names (for tests). */
export const constKeys = keys;

// Register our lookup with ui-kit so its components resolve const names
// via real data. Without this, ui-kit's getConstName returns the key as-is.
setConstLookup(get);
