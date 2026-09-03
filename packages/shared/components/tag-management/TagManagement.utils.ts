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
import unionBy from "lodash/unionBy";
import isString from "lodash/isString";

import type { TagType } from "@docspace/ui-kit/components/tag";

import type {
  MutationSnapshot,
  TTag,
  UpdateTagNameParams,
} from "./TagManagement.types";
import {
  KEY_ENTRY_SEPARATOR,
  KEY_FIELD_SEPARATOR,
} from "./TagManagement.constants";

export function transformTagsData(
  roomTags: Array<TagType | string | TTag>,
  checked: boolean = false,
): TTag[] {
  return roomTags.map((tag) => ({
    label: isString(tag) ? tag : tag.label,
    checked,
  }));
}

export function unionTagsData(
  roomTags: Array<TagType | string>,
  data: string[] | undefined,
): TTag[] {
  const temp: TTag[] = transformTagsData(
    roomTags.filter(
      (tag) => isString(tag) || !("isDefault" in tag) || !tag.isDefault,
    ),
    true,
  );

  if (!data) return temp;

  return unionBy(temp, transformTagsData(data, false), "label");
}

function fuzzyMatch(text: string, query: string) {
  text = text.toLowerCase();
  query = query.toLowerCase();
  let ti = 0,
    qi = 0;

  while (ti < text.length && qi < query.length) {
    if (text[ti] === query[qi]) qi++;
    ti++;
  }

  return qi === query.length;
}

export function searchFilter(list: TTag[], query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return list;

  return list
    .map((item) => {
      const text = item.label.trim().toLowerCase();
      let score = 0;

      if (text === q) score = 200;
      else if (text.startsWith(q)) score = 150;
      else if (text.includes(q)) score = 100 - text.indexOf(q);
      else if (fuzzyMatch(text, q)) score = 50;

      return { item, score };
    })
    .filter((obj) => obj.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((obj) => obj.item);
}

export const stopPropagation = (event: React.MouseEvent) =>
  event.stopPropagation();

/**
 * Whether `name` already belongs to a listed tag.
 *
 * The one rule every caller compares names by: exact, ignoring surrounding
 * whitespace only - tags are case-sensitive, so "tag" and "Tag" are two
 * different names. `exceptLabel` excludes the tag being renamed itself.
 */
export const isTagNameTaken = (
  tags: readonly TTag[],
  name: string,
  exceptLabel?: string,
) => {
  const searched = name.trim();

  return tags.some(
    (tag) => tag.label !== exceptLabel && tag.label.trim() === searched,
  );
};

export const isTag = (variables: unknown): variables is TTag =>
  typeof variables === "object" &&
  variables !== null &&
  "label" in variables &&
  typeof variables.label === "string" &&
  "checked" in variables &&
  typeof variables.checked === "boolean";

export const isUpdateTagNameParams = (
  variables: unknown,
): variables is UpdateTagNameParams =>
  typeof variables === "object" &&
  variables !== null &&
  "oldLabel" in variables &&
  typeof variables.oldLabel === "string" &&
  "newLabel" in variables &&
  typeof variables.newLabel === "string";

export const selectSnapshot = (mutation: {
  state: { variables: unknown; status: string };
}): MutationSnapshot => ({
  variables: mutation.state.variables,
  isPending: mutation.state.status === "pending",
});

// A mutation counts towards the overlay while it runs and after it succeeded:
// its effect is real from the moment it is sent, and it stays true until the
// server data catches up. Failed ones drop out, which is the rollback.
export const isApplied = (mutation: { state: { status: string } }) =>
  mutation.state.status === "pending" || mutation.state.status === "success";

/**
 * The room tags flattened into a string.
 *
 * `roomTags` comes from the host's store and can be an array that is mutated in
 * place, so its identity is not a reliable signal that it changed. This is what
 * a derivation over it can be keyed on instead.
 */
export const roomTagsToKey = (roomTags: Array<TagType | string>) =>
  roomTags
    .map((tag) => {
      // A bare string is a plain tag: the same thing as an object without the
      // default flag, so it has to produce the same key.
      const label = typeof tag === "string" ? tag : tag.label;
      const isDefault = typeof tag === "string" ? false : Boolean(tag.isDefault);

      return `${label}${KEY_FIELD_SEPARATOR}${isDefault ? 1 : 0}`;
    })
    .join(KEY_ENTRY_SEPARATOR);
