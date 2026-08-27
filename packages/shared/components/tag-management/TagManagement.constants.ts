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

export const ROW_HEIGHT = 30;
export const MARGIN_BOTTOM = 10;
export const MAX_BODY_HEIGHT = 220;
export const ICON_SIZE = 16;
export const LOADER_SIZE = 16;

export const TAGS_QUERY_KEY = ["tags"];

// Stable keys so the pending state of these mutations can be read from the
// mutation cache by any mounted tag list, not only by the component that
// started them. Renaming and deleting a tag change it everywhere, so the
// progress has to outlive the popup that triggered it.
export const TAG_RENAME_MUTATION_KEY = ["tags", "rename"];
export const TAG_REMOVE_MUTATION_KEY = ["tags", "remove"];

// Binding a tag only changes one room, so its key carries the room and the
// progress stays inside that room's lists.
export const getTagBindMutationKey = (roomId: string | number) => [
  "tags",
  "bind",
  roomId,
];

// How long a settled rename or delete is kept in the mutation cache. That
// record is the only thing that can tell the list the name the room still
// reports and the one the tags query already has are the same tag - the two
// sources cannot work it out on their own, and the host is not required to
// reload the room at all (the client passes no onTagsChanged), so the stale
// copy can outlive any short window. The default five minutes is shorter than
// that, and once the record expires the tag is listed twice, under both names.
// Bounded anyway rather than kept forever, which useRoomTagList can afford:
// it ignores a record that no longer matches what the query says.
export const TAG_MUTATION_RECORD_GC_TIME = 30 * 60 * 1000;

// Creating a tag also binds it to the room it was created from.
export const getTagCreateMutationKey = (roomId: string | number) => [
  "tags",
  "create",
  roomId,
];

export const EVENT_OPTIONS: AddEventListenerOptions = {
  capture: true,
};

export const EDIT_TAG_DONT_SHOW_AGAIN_KEY = "edit-tag-dont-show-again";
export const EDIT_TAG_MODAL_ID = "edit-tag-modal";

export const DELETE_TAG_DONT_SHOW_AGAIN_KEY = "delete-tag-dont-show-again";
export const DELETE_TAG_MODAL_ID = "delete-tag-modal";
export const EDIT_TAG_FORM_NAME = "edit-tag-form";

// Separators for the key the room tags are hashed into. Control characters are
// used because a tag label can contain anything printable: with a space or a
// comma, ["a b"] and ["a", "b"] would produce the same key. Written as escapes
// on purpose - a raw byte here makes the file binary to git and grep.
export const KEY_FIELD_SEPARATOR = "\u0001";
export const KEY_ENTRY_SEPARATOR = "\u0000";
