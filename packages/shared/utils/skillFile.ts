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
  /**
   * The frontmatter lines that are neither the name nor the description
   * (`license`, `allowed-tools`, a comment, ...), as the file has them, so a
   * file read and written again keeps them. Absent when there are none.
   */
  extra?: string;
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

/** A key at the start of a frontmatter line: `name:`, `allowed-tools:`. */
const KEY_LINE = /^([A-Za-z_][\w-]*)[ \t]*:(.*)$/;

/** The header of a YAML block scalar: `|` or `>`, with its optional chomping and indentation marks. */
const BLOCK_SCALAR = /^([|>])[+\-\d]*$/;

/**
 * The value of a field written over several lines. A literal block (`|`)
 * keeps its line breaks and a folded one (`>`) reads as one paragraph, as
 * does a plain value continued on indented lines.
 */
const readValue = (inline: string, continuation: string[]): string => {
  const head = inline.trim();
  const block = BLOCK_SCALAR.exec(head);
  const lines = continuation.map((line) => line.trim());
  if (block) {
    const text = block[1] === "|" ? lines.join("\n") : lines.filter(Boolean).join(" ");
    return text.trim();
  }
  if (!lines.some(Boolean)) return unquote(head);
  return unquote([head, ...lines].filter(Boolean).join(" "));
};

/**
 * Reads a skill file. A file without a frontmatter is all instructions. The
 * `name` and the `description` are read whether they are written on one
 * line or over several; every other line of the frontmatter is kept as it
 * is in `extra`.
 */
export const parseSkillFile = (text: string): TSkillFile => {
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) return { name: "", description: "", body: source.trim() };

  const fields: Record<string, string> = {};
  const extra: string[] = [];
  const lines = match[1].split("\n");
  for (let i = 0; i < lines.length; ) {
    const key = KEY_LINE.exec(lines[i]);
    // The lines of the entry: everything up to the next line that starts at
    // the margin, which is the next key or a comment.
    let end = i + 1;
    while (end < lines.length && (lines[end] === "" || /^[ \t]/.test(lines[end]))) end += 1;
    if (key && (key[1] === "name" || key[1] === "description")) {
      fields[key[1]] = readValue(key[2], lines.slice(i + 1, end));
    } else {
      extra.push(...lines.slice(i, end));
    }
    i = end;
  }
  while (extra.length && extra[extra.length - 1].trim() === "") extra.pop();

  return {
    name: fields.name ?? "",
    description: fields.description ?? "",
    body: source.slice(match[0].length).trim(),
    ...(extra.some((line) => line.trim() !== "") ? { extra: extra.join("\n") } : {}),
  };
};

/**
 * Writes a skill file the way the AI service does: quoted one-line fields,
 * then the instructions. The other frontmatter lines a file was read with
 * (`extra`) follow the two fields unchanged.
 */
export const buildSkillFile = ({ name, description, body, extra }: TSkillFile) =>
  `---\nname: ${JSON.stringify(name)}\ndescription: ${JSON.stringify(
    description.replace(/\s+/g, " ").trim(),
  )}\n${extra ? `${extra}\n` : ""}---\n\n${body.trim()}\n`;
