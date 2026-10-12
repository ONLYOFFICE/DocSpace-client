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

import type { TagType } from "@onlyoffice/apps-ui-kit/components/tag";

import type {
  TTag,
  TagChange,
  TagsChangedHandler,
} from "./TagManagement.types";
import { TagChangeType } from "./TagManagement.types";

/**
 * The room's tags after the change, or the same array when it does not apply.
 *
 * Here rather than in each host: the rules are the same wherever a room's tags
 * are kept, and written out five times they would be the same rules five
 * slightly different ways. The array is returned unchanged when nothing
 * applies, so a store can compare by identity and write nothing.
 */
export const applyTagChangeToRoomTags = (
  tags: string[],
  change: TagChange,
): string[] => {
  switch (change.type) {
    // A tag created here is added to the room it was created in, so both read
    // the same way.
    case TagChangeType.Bound:
    case TagChangeType.Created:
      return tags.includes(change.label) ? tags : [change.label, ...tags];

    // A create that failed reads here like an unbind: out of the room it was
    // typed in, and out of no other.
    case TagChangeType.Unbound:
    case TagChangeType.Uncreated:
      return tags.includes(change.label)
        ? tags.filter((tag) => tag !== change.label)
        : tags;

    case TagChangeType.Renamed:
      return tags.includes(change.oldLabel)
        ? tags.map((tag) => (tag === change.oldLabel ? change.newLabel : tag))
        : tags;

    case TagChangeType.Removed:
      return tags.includes(change.label)
        ? tags.filter((tag) => tag !== change.label)
        : tags;

    default:
      return tags;
  }
};

/**
 * The same for the shared list of every tag there is - the one the filter
 * offers. Binding and unbinding do not reach it: they say which room carries a
 * tag, not which tags exist.
 */
export const applyTagChangeToTagList = (
  tags: string[],
  change: TagChange,
): string[] => {
  switch (change.type) {
    case TagChangeType.Created:
      return tags.includes(change.label) ? tags : [change.label, ...tags];

    case TagChangeType.Renamed:
      return tags.includes(change.oldLabel)
        ? tags.map((tag) => (tag === change.oldLabel ? change.newLabel : tag))
        : tags;

    // A create that failed takes the name back out of the list, where the
    // create had just put it - this is the one place `Uncreated` reads like a
    // removal, because the tag never came to exist.
    case TagChangeType.Uncreated:
    case TagChangeType.Removed:
      return tags.includes(change.label)
        ? tags.filter((tag) => tag !== change.label)
        : tags;

    default:
      return tags;
  }
};

/**
 * True when the change reaches every room, not just the one it was sent for.
 *
 * A predicate rather than a boolean, so a false answer leaves the caller with
 * the changes that do name a room - and `change.roomId` to read.
 */
export const isSharedTagChange = (
  change: TagChange,
): change is Extract<
  TagChange,
  { type: TagChangeType.Renamed | TagChangeType.Removed }
> =>
  change.type === TagChangeType.Renamed ||
  change.type === TagChangeType.Removed;

/**
 * The change that undoes this one, for a request that was told before it was
 * sent and then failed.
 *
 * A removal has none: it takes the tag out of every room that carried it, and
 * which rooms those were is exactly what is no longer known. So a removal is
 * the one change told only once the server has agreed to it.
 */
export const undoTagChange = (
  change: TagChange,
  onTagsChanged?: TagsChangedHandler,
) => {
  const inverse = inverseTagChange(change);

  if (inverse) onTagsChanged?.(inverse);
};

export const inverseTagChange = (change: TagChange): TagChange | undefined => {
  switch (change.type) {
    case TagChangeType.Bound:
      return {
        type: TagChangeType.Unbound,
        roomId: change.roomId,
        label: change.label,
      };

    case TagChangeType.Unbound:
      return {
        type: TagChangeType.Bound,
        roomId: change.roomId,
        label: change.label,
      };

    // Not a `Removed`: that reaches every room, and the name the room was
    // trying to invent may already belong to a tag other rooms carry.
    case TagChangeType.Created:
      return {
        type: TagChangeType.Uncreated,
        roomId: change.roomId,
        label: change.label,
      };

    case TagChangeType.Renamed:
      return {
        type: TagChangeType.Renamed,
        oldLabel: change.newLabel,
        newLabel: change.oldLabel,
      };

    default:
      return undefined;
  }
};

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

// What a rejected request carries is not typed, and the toast wants an Error.
export const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));
