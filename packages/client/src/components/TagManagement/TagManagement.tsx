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

import { FC, useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";

import { ShareAccessRights } from "@docspace/ui-kit/enums";

import {
  AccessTagManagement,
  TagManagement as TagManagementShared,
  type TagChange,
} from "@docspace/shared/components/tag-management";

import type {
  InjectedTagManagementProps,
  TagManagementProps,
  TagManagementWrapperProps,
} from "./TagManagement.types";

// The one place the tag permissions are derived from the room access. The
// info panel asks it too, to decide whether an empty room still gets a Tags
// row with the add button.
export const getTagManagementAccess = (
  roomAccess: ShareAccessRights,
  isAdmin: boolean | undefined,
  isArchiveFolder: boolean | undefined,
): AccessTagManagement => {
  const isRoomManager = roomAccess === ShareAccessRights.RoomManager;
  const isRoomOwner =
    roomAccess === ShareAccessRights.None ||
    roomAccess === ShareAccessRights.FullAccess;

  const canEdit = isAdmin && !isArchiveFolder;
  const canRemove = isAdmin && !isArchiveFolder;

  const canCreate =
    (isAdmin || isRoomOwner || isRoomManager) && !isArchiveFolder;

  const canBindTag = canCreate;
  const canSearch = canCreate;

  return {
    canEdit,
    canRemove,
    canCreate,
    canBindTag,
    canSearch,
  } satisfies AccessTagManagement;
};

const TagManagement: FC<TagManagementWrapperProps> = ({
  access: roomAccess,
  isAdmin,
  isArchiveFolder,
  applyTagChangeToRooms,
  applyTagChangeToOpenRoom,
  applyTagChangeToTags,
  onTagsChanged,
  ...props
}) => {
  const access = useMemo(
    () => getTagManagementAccess(roomAccess, isAdmin, isArchiveFolder),
    [roomAccess, isAdmin, isArchiveFolder],
  );

  // Every change is written straight into the stores that hold the tags, from
  // the change itself - nothing is fetched again. Each store decides what the
  // change means for it: the rooms list and the open room patch the one room a
  // bind was sent for and every room a rename or a removal reaches, while the
  // shared list of tags hears only about the tag itself.
  //
  // The socket says the same thing for a bind, a moment later; applying a
  // change that is already applied writes nothing.
  const handleTagsChanged = useCallback(
    (change: TagChange) => {
      applyTagChangeToRooms(change);
      applyTagChangeToOpenRoom(change);
      applyTagChangeToTags(change);

      onTagsChanged?.(change);
    },
    [
      applyTagChangeToRooms,
      applyTagChangeToOpenRoom,
      applyTagChangeToTags,
      onTagsChanged,
    ],
  );

  return (
    <TagManagementShared
      {...props}
      access={access}
      onTagsChanged={handleTagsChanged}
    />
  );
};

export default inject<TStore, TagManagementProps, InjectedTagManagementProps>(
  ({
    filesActionsStore,
    authStore,
    treeFoldersStore,
    filesStore,
    selectedFolderStore,
    tagsStore,
  }) => ({
    isAdmin: authStore.isAdmin,
    onSelectTag: filesActionsStore.selectTag,
    isArchiveFolder: treeFoldersStore.isArchiveFolderRoot,
    applyTagChangeToRooms: filesStore.applyTagChange,
    applyTagChangeToOpenRoom: selectedFolderStore.applyTagChange,
    applyTagChangeToTags: tagsStore.applyTagChange,
  }),
)(observer(TagManagement as FC<TagManagementProps>));
