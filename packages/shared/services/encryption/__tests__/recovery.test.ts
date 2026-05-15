// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, it, expect } from "vitest";

import {
  generateRecoveryMnemonic,
  validateMnemonic,
  splitMnemonicForDisplay,
  normalizeMnemonic,
  pickQuizPositions,
  verifyQuizAnswers,
  RECOVERY_QUIZ_QUESTION_COUNT,
} from "../recovery";

// All-zeros 32-byte entropy → SHA-256 first byte = 0x66 → last word index 102
// → "art". 23 leading "abandon" + "art".
const KNOWN_VALID =
  "abandon abandon abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon abandon abandon art";

describe("recovery", () => {
  describe("generateRecoveryMnemonic", () => {
    it("returns exactly 24 space-separated words", async () => {
      const mnemonic = await generateRecoveryMnemonic();
      const words = mnemonic.trim().split(/\s+/);
      expect(words).toHaveLength(24);
    });

    it("produces unique mnemonics on each call", async () => {
      const a = await generateRecoveryMnemonic();
      const b = await generateRecoveryMnemonic();
      expect(a).not.toBe(b);
    });

    it("every produced mnemonic passes its own checksum", async () => {
      for (let i = 0; i < 5; i++) {
        const mnemonic = await generateRecoveryMnemonic();
        expect(await validateMnemonic(mnemonic)).toBe(true);
      }
    });
  });

  describe("validateMnemonic", () => {
    it("accepts the canonical all-zeros vector", async () => {
      expect(await validateMnemonic(KNOWN_VALID)).toBe(true);
    });

    it("rejects mnemonics with the wrong number of words", async () => {
      expect(await validateMnemonic("only three words here")).toBe(false);
      const tooMany = `${KNOWN_VALID} extra`;
      expect(await validateMnemonic(tooMany)).toBe(false);
    });

    it("rejects mnemonics containing words not in the wordlist", async () => {
      const bad = KNOWN_VALID.replace("art", "zzznotaword");
      expect(await validateMnemonic(bad)).toBe(false);
    });

    it("rejects mnemonics with bad checksum", async () => {
      // Replace the checksum-sensitive last word with another valid word
      const wrong = KNOWN_VALID.replace("art", "abandon");
      expect(await validateMnemonic(wrong)).toBe(false);
    });

    it("normalizes whitespace and case", async () => {
      const messy = `  ABANDON   abandon\tabandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon ART  `;
      expect(await validateMnemonic(messy)).toBe(true);
    });
  });

  describe("splitMnemonicForDisplay", () => {
    it("splits a 24-word mnemonic into 6 groups of 4", () => {
      const groups = splitMnemonicForDisplay(KNOWN_VALID, 4);
      expect(groups).toHaveLength(6);
      for (const g of groups) {
        expect(g).toHaveLength(4);
      }
    });

    it("splits into groups of 3 (8 groups)", () => {
      const groups = splitMnemonicForDisplay(KNOWN_VALID, 3);
      expect(groups).toHaveLength(8);
    });
  });

  describe("normalizeMnemonic", () => {
    it("lower-cases and collapses whitespace", () => {
      expect(normalizeMnemonic("  ABANDON\tART  ")).toBe("abandon art");
    });
  });

  describe("pickQuizPositions", () => {
    function sequencer(values: number[]): () => number {
      let i = 0;
      return () => values[i++ % values.length];
    }

    it("returns RECOVERY_QUIZ_QUESTION_COUNT positions by default", () => {
      const positions = pickQuizPositions(
        24,
        undefined,
        sequencer([0.1, 0.5, 0.9]),
      );
      expect(positions).toHaveLength(RECOVERY_QUIZ_QUESTION_COUNT);
    });

    it("positions are unique and sorted ascending", () => {
      const rng = sequencer([0.05, 0.5, 0.95, 0.4, 0.7]);
      const positions = pickQuizPositions(24, 3, rng);
      expect(new Set(positions).size).toBe(positions.length);
      const sorted = [...positions].sort((a, b) => a - b);
      expect(positions).toEqual(sorted);
    });

    it("positions are within [0, wordCount)", () => {
      const positions = pickQuizPositions(
        24,
        3,
        sequencer([0.0, 0.4, 0.99999]),
      );
      for (const p of positions) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThan(24);
      }
    });

    it("returns at most wordCount positions when asked for more", () => {
      const positions = pickQuizPositions(3, 10, sequencer([0, 0.4, 0.8]));
      expect(positions.length).toBeLessThanOrEqual(3);
    });

    it("returns empty array when questionCount is 0", () => {
      expect(pickQuizPositions(24, 0)).toEqual([]);
    });

    it("does not hang when rng returns a constant value (falls back to fill)", () => {
      const positions = pickQuizPositions(24, 3, () => 0.5);
      expect(positions).toHaveLength(3);
      for (const p of positions) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThan(24);
      }
    });
  });

  describe("verifyQuizAnswers", () => {
    it("accepts correct answers in the same order as positions", () => {
      // KNOWN_VALID: positions 0..22 are "abandon", 23 is "art"
      expect(
        verifyQuizAnswers(KNOWN_VALID, [0, 12, 23], ["abandon", "abandon", "art"]),
      ).toBe(true);
    });

    it("is case-insensitive and trims whitespace", () => {
      expect(
        verifyQuizAnswers(KNOWN_VALID, [0, 23], ["  ABANDON ", "ART"]),
      ).toBe(true);
    });

    it("rejects when any answer is wrong", () => {
      expect(
        verifyQuizAnswers(KNOWN_VALID, [0, 23], ["abandon", "abandon"]),
      ).toBe(false);
    });

    it("rejects when length of answers does not match positions", () => {
      expect(verifyQuizAnswers(KNOWN_VALID, [0, 12], ["abandon"])).toBe(false);
      expect(
        verifyQuizAnswers(KNOWN_VALID, [0], ["abandon", "abandon"]),
      ).toBe(false);
    });

    it("rejects empty quizzes", () => {
      expect(verifyQuizAnswers(KNOWN_VALID, [], [])).toBe(false);
    });

    it("rejects out-of-range positions", () => {
      expect(verifyQuizAnswers(KNOWN_VALID, [99], ["abandon"])).toBe(false);
      expect(verifyQuizAnswers(KNOWN_VALID, [-1], ["abandon"])).toBe(false);
    });

    it("normalizes NFKD diacritics consistently with input", () => {
      const mnemonic = "ábandon abandon abandon";
      // The same canonical string passed for both → match.
      expect(verifyQuizAnswers(mnemonic, [0], ["ábandon"])).toBe(true);
    });
  });
});
