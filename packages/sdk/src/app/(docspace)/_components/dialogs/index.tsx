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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { FolderType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";
import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import CreateEditRoomDialog from "@/app/(rooms)/_components/create-edit-room-dialog";
import MoveToArchiveDialog from "@/app/(rooms)/_components/move-to-archive-dialog";
import DeleteRoomDialog from "@/app/(rooms)/_components/delete-room-dialog";

import DownloadDialog from "./components/download-dialog";

export const Dialogs = () => {
  const { t } = useTranslation(["Common"]);
  const dialogsStore = useDialogsStore();
  const navigationStore = useNavigationStore();
  const activeItemsStore = useActiveItemsStore();
  const { openFolder } = useFolderActions({ t });

  const onRoomEdited = React.useCallback(
    async (roomId: number) => {
      try {
        const updatedRoom = await api.rooms.getRoomInfo(roomId);
        navigationStore.setCurrentTitle(updatedRoom.title);
      } catch {
        // title refresh is best-effort; old title stays until next navigation
      }
    },
    [navigationStore],
  );

  const navigateToParent = React.useCallback(() => {
    const parent = navigationStore.navigationItems?.[0];
    if (parent) openFolder(parent.id, parent.title);
  }, [navigationStore, openFolder]);

  const onArchiveConfirm = React.useCallback(async () => {
    const room = dialogsStore.archivingRoomData;
    if (!room) return;
    activeItemsStore.addActiveItems([], [room.id]);
    try {
      const tree = await api.files.getFoldersTree();
      const archiveFolderId = (
        tree as unknown as { rootFolderType: number; id: number }[]
      ).find((f) => f.rootFolderType === FolderType.Archive)?.id;
      if (archiveFolderId == null) throw new Error("Archive folder not found");
      await api.files.moveToFolder(
        archiveFolderId,
        [room.id],
        [],
        0,
        false,
        false,
        true,
      );
      navigateToParent();
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      activeItemsStore.removeActiveItems([], [room.id]);
    }
  }, [dialogsStore, activeItemsStore, navigateToParent]);

  const onDeleteConfirm = React.useCallback(async () => {
    const room = dialogsStore.deletingRoomData;
    if (!room) return;
    activeItemsStore.addActiveItems([], [room.id]);
    try {
      await api.files.removeFiles([room.id], [], false, true, true);
      navigateToParent();
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      activeItemsStore.removeActiveItems([], [room.id]);
    }
  }, [dialogsStore, activeItemsStore, navigateToParent]);

  return (
    <>
      {dialogsStore.isDialogOpen(SDKDialogs.DownloadDialog) && (
        <DownloadDialog />
      )}
      {dialogsStore.editingRoomData && (
        <CreateEditRoomDialog
          visible={dialogsStore.isDialogOpen(SDKDialogs.EditRoom)}
          onClose={dialogsStore.closeEditRoomDialog}
          room={dialogsStore.editingRoomData}
          onRoomEdited={onRoomEdited}
        />
      )}
      {dialogsStore.archivingRoomData && (
        <MoveToArchiveDialog
          visible={dialogsStore.isDialogOpen(SDKDialogs.ArchiveRoom)}
          onClose={dialogsStore.closeArchiveRoomDialog}
          onConfirm={onArchiveConfirm}
        />
      )}
      {dialogsStore.deletingRoomData && (
        <DeleteRoomDialog
          visible={dialogsStore.isDialogOpen(SDKDialogs.DeleteRoom)}
          onClose={dialogsStore.closeDeleteRoomDialog}
          roomName={dialogsStore.deletingRoomData.title}
          onConfirm={onDeleteConfirm}
        />
      )}
    </>
  );
};

export default observer(Dialogs);

