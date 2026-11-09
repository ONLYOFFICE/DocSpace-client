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

const SKILL_NAME_MAX_LENGTH = 64;
const SKILL_DESCRIPTION_MAX_LENGTH = 1024;
const DEFAULT_SKILL_NAME = "skill";

/**
 * A skill name the Files service accepts: 1 to 64 lowercase Latin letters
 * and digits joined by single hyphens. A title with none of them (all
 * Cyrillic, say) falls back to a generic name the user can change.
 */
export const getSkillName = (title: string) => {
  const name = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, SKILL_NAME_MAX_LENGTH)
    .replace(/^-+|-+$/g, "");

  return name || DEFAULT_SKILL_NAME;
};

/**
 * The text of a new file in an Instructions room. The Files service refuses
 * a skill without its `name` / `description` frontmatter, so an empty file
 * could never be created there: the new file starts with the frontmatter,
 * named after its title, for the user to fill in the editor. The
 * description is written as a JSON string, which is valid YAML whatever the
 * title holds (a colon or a hash would break a plain scalar), and loses any
 * angle brackets, which the service reads as XML tags.
 */
export const getNewSkillContent = (title: string) => {
  const description =
    title.replace(/[<>]/g, "").trim().slice(0, SKILL_DESCRIPTION_MAX_LENGTH) ||
    DEFAULT_SKILL_NAME;

  return [
    "---",
    `name: ${getSkillName(title)}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    "",
  ].join("\n");
};
