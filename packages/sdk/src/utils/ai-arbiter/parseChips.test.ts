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

import { describe, it, expect } from "vitest";

import { parseChips } from "./parseChips";

describe("parseChips", () => {
  it("extracts pipe-separated options from a trailing OPTIONS line", () => {
    const text = "How many experts?\n[[OPTIONS]] 2 | 3 | 5 | custom";
    const { displayText, options } = parseChips(text);
    expect(displayText).toBe("How many experts?");
    expect(options).toEqual(["2", "3", "5", "custom"]);
  });

  it("returns empty options when no marker is present", () => {
    const text = "Tell me about your domain.";
    const result = parseChips(text);
    expect(result.displayText).toBe(text);
    expect(result.options).toEqual([]);
  });

  it("trims whitespace inside each option", () => {
    const { options } = parseChips(
      "Pick a tone.\n[[OPTIONS]]   formal   |   technical   |   conversational",
    );
    expect(options).toEqual(["formal", "technical", "conversational"]);
  });

  it("strips trailing blank lines after removing the marker", () => {
    const text = "Question?\n\n[[OPTIONS]] yes | no\n\n";
    const result = parseChips(text);
    expect(result.displayText).toBe("Question?");
    expect(result.options).toEqual(["yes", "no"]);
  });

  it("only treats a full-line marker as a chip line", () => {
    const text = "I have many options [[OPTIONS]] but not here";
    const result = parseChips(text);
    expect(result.options).toEqual([]);
    expect(result.displayText).toBe(text);
  });

  it("caps the number of options at 6", () => {
    const text =
      "Pick one\n[[OPTIONS]] a | b | c | d | e | f | g | h";
    const { options } = parseChips(text);
    expect(options).toHaveLength(6);
    expect(options).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("drops options that exceed the per-option length cap", () => {
    const longOption = "x".repeat(80);
    const { options } = parseChips(
      `Q\n[[OPTIONS]] short | ${longOption} | also-short`,
    );
    expect(options).toEqual(["short", "also-short"]);
  });

  it("returns original text when the marker has no usable options", () => {
    const text = "Q\n[[OPTIONS]]    ";
    const result = parseChips(text);
    expect(result.displayText).toBe(text);
    expect(result.options).toEqual([]);
  });

  it("uses the LAST marker if multiple are present", () => {
    const text =
      "First batch?\n[[OPTIONS]] foo | bar\nNow really:\n[[OPTIONS]] yes | no";
    const { displayText, options } = parseChips(text);
    expect(options).toEqual(["yes", "no"]);
    expect(displayText).toContain("[[OPTIONS]] foo | bar");
  });
});
