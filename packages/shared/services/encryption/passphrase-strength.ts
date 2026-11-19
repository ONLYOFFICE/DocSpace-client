/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const PASSPHRASE_MIN_LENGTH = 12;

/** The rules of a new passphrase, in the shape the kit's password input takes. */
// Spec: private-rooms/key-management, "A new passphrase needs no particular characters"
export const PASSPHRASE_SETTINGS = {
  minLength: PASSPHRASE_MIN_LENGTH,
  upperCase: false,
  digits: false,
  specSymbols: false,
  digitsRegexStr: "(?=.*\\d)",
  upperCaseRegexStr: "(?=.*[A-Z])",
  specSymbolsRegexStr: "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
} as const;

/** What the generator draws a passphrase by. */
// Spec: private-rooms/key-management, "A generated passphrase fills both fields"
export const PASSPHRASE_GENERATOR_SETTINGS = {
  ...PASSPHRASE_SETTINGS,
  upperCase: true,
  digits: true,
  specSymbols: true,
} as const;

export type PassphraseStrength = "weak" | "fair" | "good" | "strong";

/**
 * Discriminated union of suggestion kinds. UI maps each to a localized
 * message; producers (`checkPassphraseStrength`) never emit raw English.
 */
export type PassphraseSuggestion =
  | { kind: "min-length"; value: number }
  | { kind: "lowercase" }
  | { kind: "uppercase" }
  | { kind: "digits" }
  | { kind: "special" }
  | { kind: "common-pattern" };

export type PassphraseStrengthResult = {
  strength: PassphraseStrength;
  score: number;
  suggestions: PassphraseSuggestion[];
  containsCommonPattern: boolean;
};

const COMMON_PATTERNS: ReadonlyArray<string> = [
  "password",
  "passw0rd",
  "passphrase",
  "qwerty",
  "asdfgh",
  "zxcvbn",
  "iloveyou",
  "welcome",
  "letmein",
  "admin",
  "administrator",
  "trustno1",
  "abc123",
  "abc12345",
  "12345",
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "0987654321",
  "qazwsx",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1q2w3e",
  "1q2w3e4r",
  "1q2w3e4r5t",
  "111111",
  "222222",
  "333333",
  "1qaz2wsx",
  "qwer1234",
  "monkey",
  "dragon",
  "master",
  "shadow",
  "freedom",
  "whatever",
  "starwars",
  "superman",
  "batman",
  "princess",
  "sunshine",
  "michael",
  "jennifer",
  "robert",
  "soccer",
  "baseball",
  "football",
  "basketball",
  "summer",
  "winter",
  "computer",
  "internet",
  "samsung",
  "google",
  "facebook",
  "twitter",
  "docspace",
  "onlyoffice",
];

export function containsCommonPattern(passphrase: string): boolean {
  if (!passphrase) return false;
  const normalized = passphrase.toLowerCase();
  for (const pattern of COMMON_PATTERNS) {
    if (normalized.includes(pattern)) return true;
  }
  return false;
}

// Spec: private-rooms/key-management, "The strength grade counts letters of every script"
const LOWERCASE_OR_CASELESS_LETTER = /[\p{Ll}\p{Lo}\p{Lm}]/u;
const UPPERCASE_LETTER = /[\p{Lu}\p{Lt}]/u;
const DECIMAL_DIGIT = /\p{Nd}/u;
const PUNCTUATION_OR_SYMBOL = /[\p{P}\p{S}]/u;

export function checkPassphraseStrength(
  passphrase: string,
  minLength: number = PASSPHRASE_MIN_LENGTH,
): PassphraseStrengthResult {
  const suggestions: PassphraseSuggestion[] = [];
  let score = 0;

  if (passphrase.length >= minLength) score += 25;
  else suggestions.push({ kind: "min-length", value: minLength });

  if (passphrase.length >= minLength + 4) score += 10;
  if (passphrase.length >= minLength + 8) score += 10;

  if (LOWERCASE_OR_CASELESS_LETTER.test(passphrase)) score += 15;
  else suggestions.push({ kind: "lowercase" });

  if (UPPERCASE_LETTER.test(passphrase)) score += 15;
  else suggestions.push({ kind: "uppercase" });

  if (DECIMAL_DIGIT.test(passphrase)) score += 15;
  else suggestions.push({ kind: "digits" });

  if (PUNCTUATION_OR_SYMBOL.test(passphrase)) score += 10;
  else suggestions.push({ kind: "special" });

  const matchesPattern = containsCommonPattern(passphrase);
  if (matchesPattern) {
    score = Math.min(score, 25);
    suggestions.push({ kind: "common-pattern" });
  }

  const belowMinLength = passphrase.length < minLength;

  let strength: PassphraseStrength;
  if (belowMinLength || matchesPattern) strength = "weak";
  else if (score >= 80) strength = "strong";
  else if (score >= 60) strength = "good";
  else if (score >= 40) strength = "fair";
  else strength = "weak";

  return {
    strength,
    score: Math.min(score, 100),
    suggestions,
    containsCommonPattern: matchesPattern,
  };
}

export function isPassphraseAcceptable(
  passphrase: string,
  minLength: number = PASSPHRASE_MIN_LENGTH,
): boolean {
  if (passphrase.length < minLength) return false;
  const result = checkPassphraseStrength(passphrase, minLength);
  return result.strength !== "weak";
}

/**
 * Whether a new passphrase meets the length and the common-pattern rule; the
 * kit's password input checks the length with PASSPHRASE_SETTINGS.
 */
export function meetsPassphraseRules(passphrase: string): boolean {
  if (passphrase.trim().length < PASSPHRASE_SETTINGS.minLength) return false;
  return !containsCommonPattern(passphrase);
}

// Spec: private-rooms/key-management, "The strength grade does not contradict the passphrase rules"
export function getShownPassphraseStrength(
  passphrase: string,
): PassphraseStrength {
  if (!meetsPassphraseRules(passphrase)) return "weak";
  const { strength } = checkPassphraseStrength(passphrase);
  return strength === "weak" ? "fair" : strength;
}
