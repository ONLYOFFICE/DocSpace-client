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

import { useCallback } from "react";

import api from "@docspace/shared/api";
import { RoomsType } from "@docspace/shared/enums";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TCreatedBy } from "@docspace/shared/types";
import type { TLogo } from "@docspace/ui-kit/types";

import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import {
  InfoPanelView,
  useInfoPanelStore,
} from "@/app/(docspace)/_store/InfoPanelStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { normalizeRoomLogo } from "@/app/(docspace)/_utils/getRoomIconLogo";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

type RoomItem = TFolderItem | TFileItem;

/**
 * Single-room action handlers (edit/invite/change-owner/archive/delete/info),
 * all routed through `dialogsStore`/`infoPanelStore`. The matching dialogs are
 * mounted once at the layout level, so these handlers work from any consumer
 * (header `⋮`, info-panel `⋮`) without lifting dialog state up.
 */
export default function useRoomActions() {
  const dialogsStore = useDialogsStore();
  const infoPanelStore = useInfoPanelStore();
  const filesListStore = useFilesListStore();

  const editRoom = useCallback(
    (item: RoomItem) => {
      const logo = (item as unknown as { logo?: TLogo }).logo;
      dialogsStore.openEditRoomDialog({
        id: item.id as number,
        title: item.title,
        tags: (item as unknown as { tags?: string[] }).tags ?? [],
        roomLogo: logo?.cover ? undefined : logo?.original,
        roomIconColor: logo?.color,
        roomCover: logo?.cover,
        createdBy: (item as unknown as { createdBy?: TCreatedBy }).createdBy,
      });
    },
    [dialogsStore],
  );

  const inviteRoom = useCallback(
    (item: RoomItem) => {
      dialogsStore.openInviteDialog({
        roomId: item.id as number,
        roomType:
          (item as unknown as { roomType?: RoomsType }).roomType ??
          RoomsType.EditingRoom,
        isPrivateRoom:
          (item as unknown as { private?: boolean }).private ?? false,
      });
    },
    [dialogsStore],
  );

  const changeOwner = useCallback(
    (item: RoomItem) => {
      dialogsStore.openChangeOwnerDialog({
        roomId: item.id as number,
        roomOwnerId: (item as unknown as { createdBy?: { id?: string } })
          .createdBy?.id,
      });
    },
    [dialogsStore],
  );

  const archiveRoom = useCallback(
    (item: RoomItem) => {
      dialogsStore.openArchiveRoomDialog({
        id: item.id as number,
        title: item.title,
      });
    },
    [dialogsStore],
  );

  const deleteRoom = useCallback(
    (item: RoomItem) => {
      dialogsStore.openDeleteRoomDialog({
        id: item.id as number,
        title: item.title,
      });
    },
    [dialogsStore],
  );

  const infoRoom = useCallback(
    (item: RoomItem) => {
      infoPanelStore.open(item as unknown as TFolder);
      infoPanelStore.setView(InfoPanelView.infoDetails);
    },
    [infoPanelStore],
  );

  const roomChanged = useCallback(
    async (id: number) => {
      try {
        const updated = await api.rooms.getRoomInfo(id);
        filesListStore.setCurrentFolder(updated as unknown as TFolder);
        if (infoPanelStore.selection?.id === id) {
          const rawLogo = (updated as unknown as { logo?: TLogo }).logo;
          infoPanelStore.setSelection({
            ...(updated as unknown as TFolder),
            isRoom: true,
            ...normalizeRoomLogo(rawLogo),
          } as unknown as TFolder);
        }
      } catch {
        // ignore — stale data is tolerable until the next navigation
      }
    },
    [filesListStore, infoPanelStore],
  );

  return {
    editRoom,
    inviteRoom,
    changeOwner,
    archiveRoom,
    deleteRoom,
    infoRoom,
    roomChanged,
  };
}
