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

import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
import OwnerReactSvgUrl from "PUBLIC_DIR/images/file.actions.owner.react.svg?url";
import EditRoomReactSvgUrl from "PUBLIC_DIR/images/settings.react.svg?url";
import MoreOptionsReactSvgUrl from "PUBLIC_DIR/images/plugin.more.react.svg?url";
import MuteReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";
import UnmuteReactSvgUrl from "PUBLIC_DIR/images/unmute.react.svg?url";

import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import useDownloadActions from "@/app/(docspace)/_hooks/useDownloadActions";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import type {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";

import { RoomsRefreshContext } from "../_contexts/RoomsRefreshContext";

type TRoomItem = TFolderItem & {
  pinned?: boolean;
  mute?: boolean;
  security?: {
    Pin?: boolean;
    ChangeOwner?: boolean;
    Download?: boolean;
    EditRoom?: boolean;
    Mute?: boolean;
  };
};

export default function useRoomContextMenuModel(
  onEditRoom?: (item: TRoomItem) => void,
  onRoomChanged?: (id: number) => void,
) {
  const { t } = useTranslation(["Common", "Files"]);
  const refreshRooms = useContext(RoomsRefreshContext);
  const filesSelectionStore = useFilesSelectionStore();
  const { openFolder } = useFolderActions({ t });
  const { downloadAction } = useDownloadActions();

  const getContextMenuModel = useCallback(
    (item: TFolderItem | TFileItem): ContextMenuModel[] => {
      const room = item as TRoomItem;
      const handlePin = async () => {
        if (room.pinned) {
          await api.rooms.unpinRoom(room.id);
        } else {
          await api.rooms.pinRoom(room.id);
        }
        refreshRooms?.();
      };

      const handleArchive = async () => {
        await api.rooms.archiveRoom(room.id);
        refreshRooms?.();
      };

      const handleMute = async () => {
        await api.settings.muteRoomNotification(room.id, !room.mute);
        onRoomChanged?.(room.id);
      };

      const mainItems: ContextMenuModel[] = [
        {
          id: "option_open",
          key: "open",
          label: t("Common:Open"),
          icon: FolderReactSvgUrl,
          onClick: () => openFolder(room.id, room.title),
        },
        {
          id: "option_select",
          key: "select",
          label: t("Common:SelectAction"),
          icon: CheckBoxReactSvgUrl,
          onClick: () => filesSelectionStore.addSelection(item),
        },
        { key: "separator-pin", isSeparator: true },
        {
          id: room.pinned ? "option_unpin" : "option_pin",
          key: room.pinned ? "unpin" : "pin",
          label: room.pinned ? t("Files:Unpin") : t("Files:PinToTop"),
          icon: room.pinned ? UnpinReactSvgUrl : PinReactSvgUrl,
          onClick: handlePin,
          disabled: !room.security?.Pin,
        },
        {
          id: room.mute ? "option_unmute-room" : "option_mute-room",
          key: room.mute ? "unmute-room" : "mute-room",
          label: room.mute
            ? t("Files:EnableNotifications")
            : t("Files:DisableNotifications"),
          icon: room.mute ? UnmuteReactSvgUrl : MuteReactSvgUrl,
          onClick: handleMute,
          disabled: !room.security?.Mute,
        },
        { key: "separator-mute", isSeparator: true },
        {
          id: "option_edit-room",
          key: "edit-room",
          label: t("Files:EditRoom"),
          icon: EditRoomReactSvgUrl,
          onClick: () => onEditRoom?.(room),
          disabled: !room.security?.EditRoom,
        },
        {
          id: "option_more-options",
          key: "more-options",
          label: t("Common:MoreOptions"),
          icon: MoreOptionsReactSvgUrl,
          items: [
            {
              id: "option_download",
              key: "download",
              label: t("Common:Download"),
              icon: DownloadReactSvgUrl,
              onClick: () => downloadAction(item),
              disabled: !room.security?.Download,
            },
            {
              id: "option_duplicate",
              key: "duplicate",
              label: t("Common:Duplicate"),
              icon: DuplicateReactSvgUrl,
              disabled: true,
            },
            { key: "separator-owner", isSeparator: true },
            {
              id: "option_change-room-owner",
              key: "change-room-owner",
              label: t("Files:ChangeRoomOwner"),
              icon: OwnerReactSvgUrl,
              disabled: !room.security?.ChangeOwner,
            },
          ],
        },
        { key: "separator-archive", isSeparator: true },
        {
          id: "option_move-to-archive",
          key: "move-to-archive",
          label: t("Files:MoveToArchive"),
          icon: RoomArchiveSvgUrl,
          onClick: handleArchive,
        },
      ];

      return mainItems;
    },
    [t, openFolder, downloadAction, refreshRooms, onEditRoom, onRoomChanged],
  );

  const getSelectionContextMenuModel = useCallback((): ContextMenuModel[] => {
    return [
      {
        id: "option_download",
        key: "download",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => downloadAction(),
      },
    ];
  }, [t, downloadAction]);

  const getContextModel = useCallback(
    (item: TFolderItem | TFileItem, skipSelect = false) => {
      if (
        !skipSelect &&
        filesSelectionStore.selection.length &&
        filesSelectionStore.isCheckedItem(item)
      ) {
        return getSelectionContextMenuModel();
      }
      return getContextMenuModel(item);
    },
    [filesSelectionStore, getContextMenuModel, getSelectionContextMenuModel],
  );

  return { getContextModel };
}

