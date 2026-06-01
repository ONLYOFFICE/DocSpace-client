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

import { FC, useMemo } from "react";
import { inject, observer } from "mobx-react";

import { ShareAccessRights } from "@docspace/ui-kit/enums";

import {
  AccessTagManagement,
  TagManagement as TagManagementShared,
} from "@docspace/shared/components/tag-management";

import type {
  InjectedTagManagementProps,
  TagManagementProps,
  TagManagementWrapperProps,
} from "./TagManagement.types";

const TagManagement: FC<TagManagementWrapperProps> = ({
  access: roomAccess,
  isAdmin,
  isArchiveFolder,
  ...props
}) => {
  const access = useMemo(() => {
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
  }, [roomAccess, isAdmin, isArchiveFolder]);

  return <TagManagementShared {...props} access={access} />;
};

export default inject<TStore, TagManagementProps, InjectedTagManagementProps>(
  ({ filesActionsStore, authStore, treeFoldersStore }) => ({
    isAdmin: authStore.isAdmin,
    onSelectTag: filesActionsStore.selectTag,
    isArchiveFolder: treeFoldersStore.isArchiveFolderRoot,
  }),
)(observer(TagManagement as FC<TagManagementProps>));
