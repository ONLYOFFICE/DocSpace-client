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

import { describe, it, expect } from "vitest";

import {
  PASSPHRASE_MIN_LENGTH,
  checkPassphraseStrength,
  containsCommonPattern,
  isPassphraseAcceptable,
} from "../passphrase-strength";

describe("PASSPHRASE_MIN_LENGTH", () => {
  it("defaults to 12 characters", () => {
    expect(PASSPHRASE_MIN_LENGTH).toBe(12);
  });
});

describe("containsCommonPattern", () => {
  it("returns false for empty input", () => {
    expect(containsCommonPattern("")).toBe(false);
  });

  it("matches well-known passwords case-insensitively", () => {
    expect(containsCommonPattern("Password123")).toBe(true);
    expect(containsCommonPattern("PASSWORD")).toBe(true);
    expect(containsCommonPattern("qwerty12345")).toBe(true);
    expect(containsCommonPattern("MyDocspaceKey!")).toBe(true);
    expect(containsCommonPattern("OnlyOffice2026")).toBe(true);
  });

  it("matches keyboard patterns", () => {
    expect(containsCommonPattern("asdfgh!")).toBe(true);
    expect(containsCommonPattern("zxcvbn1234")).toBe(true);
    expect(containsCommonPattern("1q2w3e4r5t")).toBe(true);
  });

  it("matches sequential digits", () => {
    expect(containsCommonPattern("abc12345678efg")).toBe(true);
    expect(containsCommonPattern("hello1234567890")).toBe(true);
  });

  it("does not match a high-entropy passphrase", () => {
    expect(containsCommonPattern("Tx7$kp!aL2nQz@vR")).toBe(false);
    expect(containsCommonPattern("correct horse battery staple")).toBe(false);
  });
});

describe("checkPassphraseStrength — length-based scoring", () => {
  it("scores empty input as weak with length suggestion", () => {
    const r = checkPassphraseStrength("");
    expect(r.strength).toBe("weak");
    expect(r.suggestions).toContain("Use at least 12 characters");
  });

  it("treats too-short input as weak", () => {
    const r = checkPassphraseStrength("Aa1!");
    expect(r.strength).toBe("weak");
    expect(r.suggestions).toContain("Use at least 12 characters");
  });

  it("rewards length above minimum", () => {
    const baseline = checkPassphraseStrength("Ab1!cd2@ef3#");
    const longer = checkPassphraseStrength("Ab1!cd2@ef3#gh4$");
    expect(longer.score).toBeGreaterThan(baseline.score);
  });

  it("uses provided minLength when supplied", () => {
    const r = checkPassphraseStrength("short", 4);
    expect(r.suggestions).not.toContain("Use at least 12 characters");
  });
});

describe("checkPassphraseStrength — character class additivity", () => {
  it("flags missing lowercase", () => {
    const r = checkPassphraseStrength("ABCDEFGH1234!@");
    expect(r.suggestions).toContain("Add lowercase letters");
  });

  it("flags missing uppercase", () => {
    const r = checkPassphraseStrength("abcdefgh1234!@");
    expect(r.suggestions).toContain("Add uppercase letters");
  });

  it("flags missing digits", () => {
    const r = checkPassphraseStrength("AbCdEfGhIjKl!@");
    expect(r.suggestions).toContain("Add numbers");
  });

  it("flags missing special chars", () => {
    const r = checkPassphraseStrength("AbCdEfGh1234XY");
    expect(r.suggestions).toContain("Add special characters");
  });

  it("returns strong for a high-entropy mixed passphrase", () => {
    const r = checkPassphraseStrength("Tx7$kp!aL2nQz@vR");
    expect(r.strength).toBe("strong");
    expect(r.score).toBeGreaterThanOrEqual(80);
  });
});

describe("checkPassphraseStrength — common-pattern downgrade", () => {
  it("downgrades 'password' variants to weak even with mixed case + digits", () => {
    const r = checkPassphraseStrength("Password1234!");
    expect(r.containsCommonPattern).toBe(true);
    expect(r.strength).toBe("weak");
    expect(r.suggestions).toContain(
      "Avoid common words and keyboard patterns",
    );
  });

  it("downgrades qwerty variants", () => {
    const r = checkPassphraseStrength("Qwerty12345!");
    expect(r.strength).toBe("weak");
  });

  it("downgrades brand-name variants (docspace / onlyoffice)", () => {
    const r = checkPassphraseStrength("MyDocSpace1234!");
    expect(r.strength).toBe("weak");
    const r2 = checkPassphraseStrength("OnlyOffice2026!");
    expect(r2.strength).toBe("weak");
  });

  it("does not downgrade unrelated strong passphrases", () => {
    const r = checkPassphraseStrength("Tx7$kp!aL2nQz@vR");
    expect(r.containsCommonPattern).toBe(false);
    expect(r.strength).toBe("strong");
  });
});

describe("isPassphraseAcceptable", () => {
  it("rejects too-short input", () => {
    expect(isPassphraseAcceptable("Ab1!")).toBe(false);
  });

  it("rejects common-pattern input even at min length", () => {
    expect(isPassphraseAcceptable("Password1234!")).toBe(false);
    expect(isPassphraseAcceptable("Qwerty12345!")).toBe(false);
  });

  it("accepts a non-weak passphrase", () => {
    expect(isPassphraseAcceptable("Tx7$kp!aL2nQz@vR")).toBe(true);
  });

  it("accepts a 'fair' passphrase (no submit gate on fair)", () => {
    const r = checkPassphraseStrength("abcdefghijkl");
    expect(["fair", "good"]).toContain(r.strength);
    expect(isPassphraseAcceptable("abcdefghijkl")).toBe(true);
  });
});
