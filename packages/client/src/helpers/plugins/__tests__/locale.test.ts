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

import { describe, expect, it } from "vitest";

import { getLocalizedText } from "../locale";

describe("getLocalizedText", () => {
  it("takes the text of the language", () => {
    expect(getLocalizedText({ en: "Hello", ru: "Privet" }, "ru", "fallback")).toBe("Privet");
  });

  it("falls back when the language is missing", () => {
    expect(getLocalizedText({ en: "Hello" }, "ru", "fallback")).toBe("fallback");
  });

  it("takes another region of the same language before falling back", () => {
    expect(
      getLocalizedText({ "en-US": "Hello", ru: "Privet" }, "en-GB", "fallback"),
    ).toBe("Hello");
    expect(getLocalizedText({ de: "Hallo" }, "de-AT", "fallback")).toBe("Hallo");
    expect(getLocalizedText({ "pt-BR": "Ola" }, "pt", "fallback")).toBe("Ola");
    expect(getLocalizedText({ "en-US": "" }, "en-GB", "fallback")).toBe(
      "fallback",
    );
  });

  it("prefers the bare language to another region", () => {
    expect(
      getLocalizedText({ "en-US": "Color", en: "Colour" }, "en-AU", "fallback"),
    ).toBe("Colour");
  });

  it("falls back when the plugin has no translations", () => {
    expect(getLocalizedText(undefined, "ru", "fallback")).toBe("fallback");
  });
});
