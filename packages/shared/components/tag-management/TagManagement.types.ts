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

/**
 * A tag action that runs in two observable steps.
 *
 * The first `next()` resolves once the user has answered the confirmation
 * dialog and yields that answer, so the caller knows whether a request is
 * about to be sent. The second `next()` performs it and settles when it is
 * done - it rejects if the request failed. A declined confirmation is a
 * `false` value, not an error.
 */

export type TagActionFlow = AsyncGenerator<boolean, void, void>;

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

  onEditTag?: (oldLabel: string, newLabel: string) => TagActionFlow;
  onDeleteTag?: (label: string) => TagActionFlow;
  onTagsChanged?: VoidFunction;

  roomName: string;
  access: AccessTagManagement;
}

export type TTag = {
  label: string;
  checked: boolean;
};

export interface TagManagementProviderProps {
  children: React.ReactNode;
  roomTags: Array<TagType | string>;
  roomId: string | number;
  access: AccessTagManagement;
}
export interface ITagManagementStateContext {
  /** Derived from the tags query, the room and the running mutations. */
  tags: TTag[];
  /** Labels with an operation still in flight, for the per-row loaders. */
  pendingLabels: ReadonlySet<string>;
  searchValue: string;
  deferredSearchValue: string;
  filteredTags: TTag[];
  showCreateTag: boolean;
  setSearchValue: (value: string) => void;
  clearSearch: () => void;

  access: AccessTagManagement;
}

export type TagManagementContextValue = ITagManagementStateContext;

export interface UpdateTagNameParams {
  oldLabel: string;
  newLabel: string;
}

export interface TagManagementContentProps {
  roomId: string | number;

  onDeleteTag?: (label: string) => TagActionFlow;
  onEditTag?: (oldLabel: string, newLabel: string) => TagActionFlow;
  onTagsChanged?: VoidFunction;
}

export interface TagManagementFilterProps {
  roomId: string | number;
  roomName: string;
  onTagsChanged?: VoidFunction;
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
  onTagsChanged?: VoidFunction;
}

export interface FormValues {
  [EDIT_TAG_FORM_NAME]: string;
}

