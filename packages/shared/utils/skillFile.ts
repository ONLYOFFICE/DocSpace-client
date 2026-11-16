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

import { FolderType, RoomsType } from "../enums";

/**
 * A skill is a Markdown file of an Instructions room (a skill set): a
 * frontmatter with its `name` and `description`, then its instructions. The
 * name is what the chat calls the skill by (`/name`); the AI service derives
 * it from the title when it creates the file, and `toSkillName` here folds
 * a title the same way.
 */

export const SKILL_EXTENSION = ".md";

/** `MAX_NAME_LENGTH` of the AI service's skill names. */
export const SKILL_NAME_MAX_LENGTH = 64;

export type TSkillFile = {
  name: string;
  description: string;
  /** The instructions: the file after its frontmatter. */
  body: string;
};

const NAME_CHAR = /[\p{L}\p{N}]/u;

/** Lower-cased, every run of other characters folded into one hyphen, as the AI service names a skill. */
export const toSkillName = (title: string): string => {
  let name = "";
  for (const ch of title.normalize("NFKC").toLowerCase()) {
    const next = NAME_CHAR.test(ch) ? ch : "-";
    if (next === "-" && (name === "" || name.endsWith("-"))) continue;
    if (name.length + next.length > SKILL_NAME_MAX_LENGTH) break;
    name += next;
  }
  return name.replace(/-+$/, "");
};

/** The name a skill file is called by when its frontmatter is not at hand: its title without the extension. */
export const getSkillNameByTitle = (title: string): string =>
  toSkillName(
    title.toLowerCase().endsWith(SKILL_EXTENSION)
      ? title.slice(0, -SKILL_EXTENSION.length)
      : title,
  );

/** What the user types in the chat to call the skill. */
export const toSkillCommand = (name: string): string => `/${name}`;

/** The folder the list is open on, as far as telling a skill needs it. */
export type TSkillFolder = {
  id?: number | string | null;
  roomType?: RoomsType | null;
  parentRoomType?: FolderType | null;
};

/**
 * A file of an Instructions room that the chat reads as a skill. The file
 * says what room it is in only when the server sends it so; a file listed
 * in the open folder is also told by that folder being a skill set.
 */
export const isSkillFile = (
  item: {
    fileExst?: string;
    folderId?: number | string;
    parentRoomType?: FolderType | null;
  },
  openFolder?: TSkillFolder | null,
): boolean => {
  if (item.fileExst?.toLowerCase() !== SKILL_EXTENSION) return false;
  if (item.parentRoomType === FolderType.InstructionsRoom) return true;
  if (!openFolder) return false;
  const isSkillSet =
    openFolder.roomType === RoomsType.InstructionsRoom ||
    openFolder.parentRoomType === FolderType.InstructionsRoom;
  return (
    isSkillSet &&
    item.folderId !== undefined &&
    String(item.folderId) === String(openFolder.id)
  );
};

const unquote = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed === "string") return parsed;
    } catch {
      // Not a JSON string: taken without its quotes below.
    }
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length > 1)
    return trimmed.slice(1, -1);
  return trimmed;
};

/**
 * Reads a skill file. A file without a frontmatter is all instructions; a
 * frontmatter key other than `name` and `description` is dropped.
 */
export const parseSkillFile = (text: string): TSkillFile => {
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) return { name: "", description: "", body: source.trim() };

  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    fields[line.slice(0, separator).trim()] = unquote(
      line.slice(separator + 1),
    );
  }

  return {
    name: fields.name ?? "",
    description: fields.description ?? "",
    body: source.slice(match[0].length).trim(),
  };
};

/** Writes a skill file the way the AI service does: quoted one-line fields, then the instructions. */
export const buildSkillFile = ({ name, description, body }: TSkillFile) =>
  `---\nname: ${JSON.stringify(name)}\ndescription: ${JSON.stringify(
    description.replace(/\s+/g, " ").trim(),
  )}\n---\n\n${body.trim()}\n`;
