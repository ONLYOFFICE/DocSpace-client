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

import {
  isMarkdownFile,
  isSupersededPluginItem,
} from "../markdown";

describe("isMarkdownFile", () => {
  it("matches .md in any case only", () => {
    expect(isMarkdownFile(".md")).toBe(true);
    expect(isMarkdownFile(".MD")).toBe(true);
    expect(isMarkdownFile(".markdown")).toBe(false);
    expect(isMarkdownFile(".docx")).toBe(false);
    expect(isMarkdownFile(undefined)).toBe(false);
  });
});

describe("isSupersededPluginItem", () => {
  const markdown = { system: true, pluginName: "Markdown" };

  it("drops the system Markdown plugin's edit and create items", () => {
    expect(
      isSupersededPluginItem(markdown, "markdownit-context-menu-item"),
    ).toBe(true);
    expect(
      isSupersededPluginItem(markdown, "markdown-it-main-button-item"),
    ).toBe(true);
  });

  it("keeps its preview item and every other plugin's items", () => {
    expect(
      isSupersededPluginItem(markdown, "markdownit-context-menu-viewer-item"),
    ).toBe(false);
    expect(
      isSupersededPluginItem(
        { system: false, pluginName: "Markdown" },
        "markdownit-context-menu-item",
      ),
    ).toBe(false);
    expect(
      isSupersededPluginItem(
        { system: true, pluginName: "Drawio" },
        "markdownit-context-menu-item",
      ),
    ).toBe(false);
  });
});
