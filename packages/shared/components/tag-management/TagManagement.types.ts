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

import type { TagClickEvent, TagType } from "@docspace/ui-kit/components/tag";
import type { EDIT_TAG_FORM_NAME } from "./TagManagement.constants";

export type AccessTagManagement = {
  canRemove?: boolean;
  canCreate?: boolean;
  canSearch?: boolean;
  canEdit?: boolean;
  canBindTag?: boolean;
};
export interface TagManagementPopupProps {
  tags: Array<TagType | string>;
  roomId: string | number;
  onClose: VoidFunction;
  anchor: React.RefObject<HTMLElement | null>;

  /** Asks the user to confirm the rename. False means they refused. */
  confirmEditTag: () => Promise<boolean>;
  /** The same for a delete. */
  confirmDeleteTag: (label: string) => Promise<boolean>;
  onTagsChanged?: TagsChangedHandler;

  roomName: string;
  access: AccessTagManagement;
}

export type TTag = {
  label: string;
  checked: boolean;
};

/**
 * What happened to a tag, as told to whoever holds the rooms.
 *
 * The kinds are apart because their reach is: binding a tag, unbinding it and
 * creating one are sent for a single room and change only that room, while
 * renaming and removing change the tag itself - and with it every room that
 * carries it. So the first ones name their room and the last two do not,
 * rather than leaving the reader to guess.
 *
 * `Uncreated` is what a failed create is told as. It cannot be a `Removed`:
 * that one reaches every room, and a name a room was trying to invent may
 * already belong to a tag other rooms carry - which a `Removed` would strip
 * from them. So it names its room like a create, and only the tag list, where
 * the create had put the new name, hears it as a removal.
 */
export enum TagChangeType {
  Bound = "bound",
  Unbound = "unbound",
  Created = "created",
  Uncreated = "uncreated",
  Renamed = "renamed",
  Removed = "removed",
}

export type TagChange =
  | { type: TagChangeType.Bound; roomId: string | number; label: string }
  | { type: TagChangeType.Unbound; roomId: string | number; label: string }
  | { type: TagChangeType.Created; roomId: string | number; label: string }
  | { type: TagChangeType.Uncreated; roomId: string | number; label: string }
  | { type: TagChangeType.Renamed; oldLabel: string; newLabel: string }
  | { type: TagChangeType.Removed; label: string };

export type TagsChangedHandler = (change: TagChange) => void;

export interface TagManagementProviderProps {
  children: React.ReactNode;
  fetchedTags: string[];
  roomTags: Array<TagType | string>;
  /** The mutations are made once here and shared - see useTagMutations. */
  roomId: string | number;
  access: AccessTagManagement;
}

/** The list itself. The mutations are added to it by the provider. */
export interface ITagManagementStateContext {
  tags: TTag[];
  roomId: string | number;
  setTags: React.Dispatch<React.SetStateAction<TTag[]>>;
  searchValue: string;
  deferredSearchValue: string;
  filteredTags: TTag[];
  showCreateTag: boolean;
  setSearchValue: (value: string) => void;
  clearSearch: () => void;

  access: AccessTagManagement;
}

export interface UpdateTagNameParams {
  oldLabel: string;
  newLabel: string;
}

export interface TagManagementContentProps {
  confirmDeleteTag: (label: string) => Promise<boolean>;
  confirmEditTag: () => Promise<boolean>;
  onTagsChanged?: TagsChangedHandler;
}

export interface TagManagementFilterProps {
  roomName: string;
  onTagsChanged?: TagsChangedHandler;
}

export interface TagManagementProps {
  id: string | number;
  tags: Array<TagType | string>;
  columnCount: number;
  className?: string;
  isActive?: boolean;
  onSelectTag: (tag: TagClickEvent) => void;
  access: AccessTagManagement;
  roomName: string;
  onTagsChanged?: TagsChangedHandler;
}

export interface FormValues {
  [EDIT_TAG_FORM_NAME]: string;
}
