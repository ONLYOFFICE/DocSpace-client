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

/**
 * Markdown files are edited by a plugin, not by the document editor: the
 * enabled plugin that registers a file item for `.md` (the system Markdown
 * plugin) opens them, and the client offers "Edit" and "Markdown file" in
 * its own menus only while such a plugin is enabled. Without one a `.md`
 * file can only be viewed.
 */
export const MARKDOWN_EXTENSION = ".md";

export const isMarkdownFile = (fileExst?: string | null) =>
  fileExst?.toLowerCase() === MARKDOWN_EXTENSION;

/**
 * Items of the system Markdown plugin that the client menus now offer
 * themselves: its "Edit markdown" context item (the native "Edit") and its
 * "Markdown" main button item (the native "Markdown file" in "+ New").
 * Showing both would list the same action twice. Its "Preview markdown"
 * item stays: the native "Preview" opens the document viewer instead.
 */
const SUPERSEDED_MARKDOWN_PLUGIN_ITEMS = new Set([
  "markdownit-context-menu-item",
  "markdown-it-main-button-item",
]);

const MARKDOWN_PLUGIN_NAME = "Markdown";

export const isSupersededPluginItem = (
  plugin: { system?: boolean; pluginName?: string },
  key: string,
) =>
  !!plugin.system &&
  plugin.pluginName === MARKDOWN_PLUGIN_NAME &&
  SUPERSEDED_MARKDOWN_PLUGIN_ITEMS.has(key);
