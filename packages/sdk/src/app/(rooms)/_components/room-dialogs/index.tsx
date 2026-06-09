// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React from "react";
import { observer } from "mobx-react";

import api from "@docspace/shared/api";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TLogo } from "@docspace/ui-kit/types";

import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { useInfoPanelStore } from "@/app/(docspace)/_store/InfoPanelStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";
import { normalizeRoomLogo } from "@/app/(docspace)/_utils/getRoomIconLogo";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";

import InvitePanel from "../invite-panel";
import ChangeRoomOwnerDialog from "../change-room-owner-dialog";
import CreateEditRoomDialog from "../create-edit-room-dialog";
import useRoomActions from "../../_hooks/useRoomActions";

/**
 * Store-driven room dialogs (edit / invite / change owner) mounted once at the
 * docs layout level so they can be opened from any single-room `⋮` menu while
 * inside a room, and refresh the info panel / header without a reload. The
 * active-rooms list keeps its own copies (see RoomsList).
 */
const RoomDialogs = observer(() => {
  const dialogsStore = useDialogsStore();
  const infoPanelStore = useInfoPanelStore();
  const filesListStore = useFilesListStore();
  const navigationStore = useNavigationStore();
  const docsUserStore = useDocsUserStore();
  const { roomChanged } = useRoomActions();

  const { editingRoomData, invitingRoomData, changingOwnerRoomData } =
    dialogsStore;

  const onRoomEdited = React.useCallback(
    async (roomId: number) => {
      try {
        const updated = await api.rooms.getRoomInfo(roomId);
        navigationStore.setCurrentTitle(updated.title);
        const rawLogo = (updated as unknown as { logo?: TLogo }).logo;
        const fresh = {
          ...(updated as unknown as TFolder),
          isRoom: true,
          ...normalizeRoomLogo(rawLogo),
        } as unknown as TFolder;
        if (filesListStore.currentFolder?.id === roomId) {
          filesListStore.setCurrentFolder(fresh);
        }
        if (infoPanelStore.selection?.id === roomId) {
          infoPanelStore.setSelection(fresh);
        }
      } catch {
        // best-effort refresh; stale data clears on next navigation
      }
    },
    [navigationStore, filesListStore, infoPanelStore],
  );

  return (
    <>
      {editingRoomData ? (
        <CreateEditRoomDialog
          visible={dialogsStore.isDialogOpen(SDKDialogs.EditRoom)}
          onClose={dialogsStore.closeEditRoomDialog}
          room={editingRoomData}
          onRoomEdited={onRoomEdited}
        />
      ) : null}
      {invitingRoomData ? (
        <InvitePanel
          visible={dialogsStore.isDialogOpen(SDKDialogs.Invite)}
          onClose={dialogsStore.closeInviteDialog}
          roomId={invitingRoomData.roomId}
          roomType={invitingRoomData.roomType}
          isPrivateRoom={invitingRoomData.isPrivateRoom}
          user={docsUserStore.user ?? undefined}
          onMembersUpdated={() =>
            infoPanelStore.setIsMembersPanelUpdating(true)
          }
        />
      ) : null}
      {changingOwnerRoomData ? (
        <ChangeRoomOwnerDialog
          visible={dialogsStore.isDialogOpen(SDKDialogs.ChangeOwner)}
          onClose={dialogsStore.closeChangeOwnerDialog}
          roomId={changingOwnerRoomData.roomId}
          roomOwnerId={changingOwnerRoomData.roomOwnerId}
          currentUserId={docsUserStore.user?.id}
          onChanged={roomChanged}
        />
      ) : null}
    </>
  );
});

export default RoomDialogs;
