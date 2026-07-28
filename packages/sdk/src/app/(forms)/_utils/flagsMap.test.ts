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

import {
  resolveCountryCode,
  getFlagUrl,
  getFlagUrlForFolder,
} from "./flagsMap";

describe("resolveCountryCode", () => {
  describe("alias matching", () => {
    it("matches canonical country names", () => {
      expect(resolveCountryCode("United States")).toBe("US");
      expect(resolveCountryCode("United Kingdom")).toBe("GB");
      expect(resolveCountryCode("Germany")).toBe("DE");
      expect(resolveCountryCode("France")).toBe("FR");
      expect(resolveCountryCode("Brazil")).toBe("BR");
    });

    it("matches alternate spellings", () => {
      expect(resolveCountryCode("USA")).toBe("US");
      expect(resolveCountryCode("U.S.A.")).toBe("US");
      expect(resolveCountryCode("America")).toBe("US");
      expect(resolveCountryCode("Great Britain")).toBe("GB");
      expect(resolveCountryCode("UK")).toBe("GB");
      expect(resolveCountryCode("Türkiye")).toBe("TR");
      expect(resolveCountryCode("Czechia")).toBe("CZ");
    });

    it("is case-insensitive and trims whitespace", () => {
      expect(resolveCountryCode("germany")).toBe("DE");
      expect(resolveCountryCode("GERMANY")).toBe("DE");
      expect(resolveCountryCode("  Germany  ")).toBe("DE");
      expect(resolveCountryCode("\tFrance\n")).toBe("FR");
    });

    it("preserves backward-compat for language-named folders", () => {
      // Existing libraries may still have folders titled by language.
      expect(resolveCountryCode("English")).toBe("US");
      expect(resolveCountryCode("German")).toBe("DE");
      expect(resolveCountryCode("French")).toBe("FR");
      expect(resolveCountryCode("Russian")).toBe("RU");
      expect(resolveCountryCode("Chinese")).toBe("CN");
    });
  });

  describe("explicit code prefixes", () => {
    it("matches bracketed prefix [XX]", () => {
      expect(resolveCountryCode("[US] United States")).toBe("US");
      expect(resolveCountryCode("[us] United States")).toBe("US");
      expect(resolveCountryCode("[DE]Germany")).toBe("DE");
      expect(resolveCountryCode("  [GB]  Britain  ")).toBe("GB");
    });

    it("matches separator prefix XX — Title", () => {
      expect(resolveCountryCode("US — United States")).toBe("US");
      expect(resolveCountryCode("US – United States")).toBe("US");
      expect(resolveCountryCode("US - United States")).toBe("US");
      expect(resolveCountryCode("US: United States")).toBe("US");
      expect(resolveCountryCode("US | United States")).toBe("US");
    });

    it("matches whole-string code", () => {
      expect(resolveCountryCode("US")).toBe("US");
      expect(resolveCountryCode("us")).toBe("US");
      expect(resolveCountryCode(" DE ")).toBe("DE");
    });

    it("rejects unknown code in bracket prefix and falls through", () => {
      // [XX] is not a known code, alias also misses → undefined.
      expect(resolveCountryCode("[XX] Foo")).toBeUndefined();
    });

    it("does not falsely match natural-language two-letter prefixes", () => {
      // "It" is a valid IT code, but without separator we must not match.
      expect(resolveCountryCode("It is what it is")).toBeUndefined();
      expect(resolveCountryCode("Is this real")).toBeUndefined();
    });
  });

  describe("invalid input", () => {
    it("returns undefined for empty / whitespace / null / undefined", () => {
      expect(resolveCountryCode("")).toBeUndefined();
      expect(resolveCountryCode("   ")).toBeUndefined();
      expect(resolveCountryCode(null)).toBeUndefined();
      expect(resolveCountryCode(undefined)).toBeUndefined();
    });

    it("returns undefined for unknown titles", () => {
      expect(resolveCountryCode("Atlantis")).toBeUndefined();
      expect(resolveCountryCode("???")).toBeUndefined();
    });
  });
});

describe("getFlagUrl", () => {
  it("returns a URL string for known codes (case-insensitive)", () => {
    expect(getFlagUrl("US")).toBeTypeOf("string");
    expect(getFlagUrl("US")).not.toBe("");
    expect(getFlagUrl("us")).toBe(getFlagUrl("US"));
  });

  it("returns undefined for unknown / empty codes", () => {
    expect(getFlagUrl("XX")).toBeUndefined();
    expect(getFlagUrl("")).toBeUndefined();
    expect(getFlagUrl(undefined)).toBeUndefined();
  });
});

describe("getFlagUrlForFolder", () => {
  it("resolves folder title to a flag URL", () => {
    expect(getFlagUrlForFolder({ title: "United States" })).toBe(
      getFlagUrl("US"),
    );
    expect(getFlagUrlForFolder({ title: "[DE] Deutschland" })).toBe(
      getFlagUrl("DE"),
    );
  });

  it("returns undefined for unrecognised folders", () => {
    expect(getFlagUrlForFolder({ title: "Random Folder" })).toBeUndefined();
    expect(getFlagUrlForFolder({ title: "" })).toBeUndefined();
    expect(getFlagUrlForFolder(null)).toBeUndefined();
    expect(getFlagUrlForFolder(undefined)).toBeUndefined();
  });
});
