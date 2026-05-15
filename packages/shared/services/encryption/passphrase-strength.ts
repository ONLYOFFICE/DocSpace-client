// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the
// Free Software Foundation. In accordance with Section 7(a) of the GNU AGPL its
// Section 15 shall be amended to the effect that Ascensio System SIA expressly
// excludes the warranty of non-infringement of any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied
// warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE.
// For details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html

export const PASSPHRASE_MIN_LENGTH = 12;

export type PassphraseStrength = "weak" | "fair" | "good" | "strong";

export type PassphraseStrengthResult = {
  strength: PassphraseStrength;
  score: number;
  suggestions: string[];
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

export function checkPassphraseStrength(
  passphrase: string,
  minLength: number = PASSPHRASE_MIN_LENGTH,
): PassphraseStrengthResult {
  const suggestions: string[] = [];
  let score = 0;

  if (passphrase.length >= minLength) score += 25;
  else suggestions.push(`Use at least ${minLength} characters`);

  if (passphrase.length >= minLength + 4) score += 10;
  if (passphrase.length >= minLength + 8) score += 10;

  if (/[a-z]/.test(passphrase)) score += 15;
  else suggestions.push("Add lowercase letters");

  if (/[A-Z]/.test(passphrase)) score += 15;
  else suggestions.push("Add uppercase letters");

  if (/\d/.test(passphrase)) score += 15;
  else suggestions.push("Add numbers");

  if (/[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/`~]/.test(passphrase)) score += 10;
  else suggestions.push("Add special characters");

  const matchesPattern = containsCommonPattern(passphrase);
  if (matchesPattern) {
    score = Math.min(score, 25);
    suggestions.push("Avoid common words and keyboard patterns");
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
