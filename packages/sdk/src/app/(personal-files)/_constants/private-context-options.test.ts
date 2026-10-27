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

import { AVAILABLE_CONTEXT_ITEMS as C } from "@/app/(docspace)/_enums/context-items";

import { getPrivateFileContextOptions } from "./private-context-options";

describe("getPrivateFileContextOptions", () => {
  it("Encrypted file that must be converted: no open or preview entry", () => {
    const options = getPrivateFileContextOptions({
      mustConvert: true,
      hasKeys: true,
    });

    for (const key of [C.preview, C.view, C.openPDF, C.edit]) {
      expect(options.has(key)).toBe(false);
    }
    expect(options.has(C.downloadEncrypted)).toBe(true);
  });

  it("Archived private room opened: copy, download without decryption and preview as in an active room", () => {
    const options = getPrivateFileContextOptions({ hasKeys: true });

    for (const key of [C.copy, C.downloadEncrypted, C.preview, C.download]) {
      expect(options.has(key)).toBe(true);
    }
    for (const key of [C.rename, C.downloadAs, C.markAsFavorite]) {
      expect(options.has(key)).toBe(false);
    }
  });

  it("offers neither opening nor decrypted download without keys", () => {
    const options = getPrivateFileContextOptions({ hasKeys: false });

    expect(options.has(C.preview)).toBe(false);
    expect(options.has(C.download)).toBe(false);
    expect(options.has(C.downloadEncrypted)).toBe(true);
  });
});
