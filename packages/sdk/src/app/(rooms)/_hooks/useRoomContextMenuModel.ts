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
import { copyShareLink } from "@docspace/shared/utils/copy";
import { toastr } from "@docspace/ui-kit/components/toast";
import { RoomsType } from "@docspace/shared/enums";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import PersonReactSvgUrl from "PUBLIC_DIR/images/person.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
import ReconnectSvgUrl from "PUBLIC_DIR/images/reconnect.svg?url";
import EditRoomReactSvgUrl from "PUBLIC_DIR/images/settings.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import LeaveRoomSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import MoreOptionsReactSvgUrl from "PUBLIC_DIR/images/plugin.more.react.svg?url";
import MuteReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";
import UnmuteReactSvgUrl from "PUBLIC_DIR/images/unmute.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";

import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import useDownloadActions from "@/app/(docspace)/_hooks/useDownloadActions";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { useInfoPanelStore } from "@/app/(docspace)/_store/InfoPanelStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";
import type { TFolder } from "@docspace/shared/api/files/types";
import type {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";

import { RoomsRefreshContext } from "../_contexts/RoomsRefreshContext";

type TRoomItem = TFolderItem & {
  pinned?: boolean;
  mute?: boolean;
  inRoom?: boolean;
  private?: boolean;
  roomType?: RoomsType;
  security?: {
    Pin?: boolean;
    ChangeOwner?: boolean;
    Download?: boolean;
    EditRoom?: boolean;
    EditAccess?: boolean;
    Mute?: boolean;
    Move?: boolean;
    Delete?: boolean;
    Embed?: boolean;
    CopySharedLink?: boolean;
  };
};

export default function useRoomContextMenuModel(
  onEditRoom?: (item: TRoomItem) => void,
  onRoomChanged?: (id: number) => void,
  onChangeOwner?: (item: TRoomItem) => void,
  isArchive?: boolean,
  onRestoreRoom?: (item: TRoomItem) => void,
  onDeleteRoom?: (item: TRoomItem) => void,
  onDeleteSelected?: (items: TRoomItem[]) => void,
  onRestoreSelected?: (items: TRoomItem[]) => void,
  onArchiveRoom?: (item: TRoomItem) => void,
  onArchiveSelected?: (items: TRoomItem[]) => void,
  onInfoRoom?: (item: TRoomItem) => void,
  onInviteRoom?: (item: TRoomItem) => void,
) {
  const { t } = useTranslation(["Common", "Files"]);
  const refreshRooms = useContext(RoomsRefreshContext);
  const filesSelectionStore = useFilesSelectionStore();
  const dialogsStore = useDialogsStore();
  const infoPanelStore = useInfoPanelStore();
  const { openFolder } = useFolderActions({ t });
  const { downloadAction } = useDownloadActions();

  const getContextMenuModel = useCallback(
    (item: TFolderItem | TFileItem): ContextMenuModel[] => {
      const room = item as TRoomItem;
      const handlePin = async () => {
        try {
          if (room.pinned) {
            await api.rooms.unpinRoom(room.id);
            toastr.success(t("Common:RoomUnpinned"));
          } else {
            await api.rooms.pinRoom(room.id);
            toastr.success(t("Common:RoomPinned"));
          }
          refreshRooms?.();
        } catch (e) {
          toastr.error(
            room.pinned ? (e as Error) : t("Common:RoomsPinLimitMessage"),
          );
        }
      };
      const handleMute = async () => {
        try {
          await api.settings.muteRoomNotification(room.id, !room.mute);
          toastr.success(
            room.mute
              ? t("Common:RoomNotificationsEnabled")
              : t("Common:RoomNotificationsDisabled"),
          );
          onRoomChanged?.(room.id);
        } catch (e) {
          toastr.error(e as Error);
        }
      };
      const handleLeave = () => {
        filesSelectionStore.setBufferSelection(room);
        dialogsStore.openDialog(SDKDialogs.LeaveRoom);
      };

      if (isArchive) {
        return [
          {
            id: "option_select",
            key: "select",
            label: t("Common:SelectAction"),
            icon: CheckBoxReactSvgUrl,
            onClick: () => filesSelectionStore.addSelection(item),
          },
          {
            id: "option_open",
            key: "open",
            label: t("Common:Open"),
            icon: FolderReactSvgUrl,
            onClick: () => openFolder(room.id, room.title),
          },
          { key: "separator-download", isSeparator: true },
          {
            id: "option_download",
            key: "download",
            label: t("Common:Download"),
            icon: DownloadReactSvgUrl,
            onClick: () => downloadAction(item),
            disabled: !room.security?.Download,
          },
          { key: "separator-restore", isSeparator: true },
          {
            id: "option_unarchive-room",
            key: "unarchive-room",
            label: t("Common:Restore"),
            icon: MoveReactSvgUrl,
            onClick: () => onRestoreRoom?.(room),
          },
          {
            id: "option_delete-room",
            key: "delete-room",
            label: t("Common:DeleteRoom"),
            icon: TrashReactSvgUrl,
            onClick: () => onDeleteRoom?.(room),
          },
        ];
      }

      const moreOptionsItems: ContextMenuModel[] = [
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
        {
          id: "option_room-info",
          key: "room-info",
          label: t("Common:RoomInfo"),
          icon: InfoOutlineReactSvgUrl,
          onClick: () => onInfoRoom?.(room),
        },
        {
          id: "option_embedding-settings",
          key: "embedding-settings",
          label: t("Common:Embed"),
          icon: CodeReactSvgUrl,
          onClick: () => {
            infoPanelStore.setLinkParams(null);
            infoPanelStore.setEmbeddingPanelData({
              visible: true,
              item: room as unknown as TFolder,
            });
          },
          disabled: !room.security?.Embed,
        },
      ];

      if (room.security?.ChangeOwner) {
        moreOptionsItems.push({ key: "separator-owner", isSeparator: true });
        moreOptionsItems.push({
          id: "option_change-room-owner",
          key: "change-room-owner",
          label: t("Common:ChangeRoomOwner"),
          icon: ReconnectSvgUrl,
          onClick: () => onChangeOwner?.(room),
        });
      }

      const isPublicRoomType =
        room.roomType === RoomsType.FormRoom ||
        room.roomType === RoomsType.CustomRoom ||
        room.roomType === RoomsType.PublicRoom;
      const hasShareLinkRights = room.shared
        ? room.security?.CopySharedLink
        : room.security?.EditAccess;
      const canCopyExternalLink = isPublicRoomType && !!hasShareLinkRights;

      const copyLinkItem: ContextMenuModel = {
        id: canCopyExternalLink
          ? "option_external-link"
          : "option_link-for-room-members",
        key: canCopyExternalLink ? "external-link" : "link-for-room-members",
        label: canCopyExternalLink
          ? t("Common:CopySharedLink")
          : t("Common:CopyLink"),
        icon: InvitationLinkReactSvgUrl,
        onClick: async () => {
          try {
            let url: string;
            if (canCopyExternalLink) {
              const link = await api.rooms.getPrimaryLink(room.id);
              url = link.sharedTo.shareLink;
            } else {
              const proxyURL =
                window.ClientConfig?.proxy?.url || window.location.origin;
              url = `${proxyURL}/rooms/shared/${room.id}/filter`;
            }
            copyShareLink(url);
            toastr.success(t("Common:LinkCopySuccess"));
          } catch (e) {
            toastr.error(e as Error);
          }
        },
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
          label: room.pinned ? t("Common:Unpin") : t("Common:PinToTop"),
          icon: room.pinned ? UnpinReactSvgUrl : PinReactSvgUrl,
          onClick: handlePin,
          disabled: !room.security?.Pin,
        },
        {
          id: room.mute ? "option_unmute-room" : "option_mute-room",
          key: room.mute ? "unmute-room" : "mute-room",
          label: room.mute
            ? t("Common:EnableNotifications")
            : t("Common:DisableNotifications"),
          icon: room.mute ? UnmuteReactSvgUrl : MuteReactSvgUrl,
          onClick: handleMute,
          disabled: !room.security?.Mute || !room.inRoom,
        },
        ...(!room.private ? [copyLinkItem] : []),
        { key: "separator-mute", isSeparator: true },
        {
          id: "option_edit-room",
          key: "edit-room",
          label: t("Common:EditRoom"),
          icon: EditRoomReactSvgUrl,
          onClick: () => onEditRoom?.(room),
          disabled: !room.security?.EditRoom,
        },
        {
          id: "option_invite-users-to-room",
          key: "invite-users-to-room",
          label: t("Common:InviteContacts"),
          icon: PersonReactSvgUrl,
          onClick: () => onInviteRoom?.(room),
          disabled: !room.security?.EditAccess,
        },
        {
          id: "option_more-options",
          key: "more-options",
          label: t("Common:MoreOptions"),
          icon: MoreOptionsReactSvgUrl,
          items: moreOptionsItems,
        },
      ];

      const canLeave = !!room.inRoom;
      const canArchive = !!room.security?.Move;
      const canDelete = !!room.security?.Delete;

      if (canLeave || canArchive || canDelete) {
        mainItems.push({ key: "separator-archive", isSeparator: true });
        if (canLeave) {
          mainItems.push({
            id: "option_leave-room",
            key: "leave-room",
            label: t("Common:LeaveTheRoom"),
            icon: LeaveRoomSvgUrl,
            onClick: handleLeave,
          });
        }
        if (canArchive) {
          mainItems.push({
            id: "option_move-to-archive",
            key: "move-to-archive",
            label: t("Common:MoveToArchive"),
            icon: RoomArchiveSvgUrl,
            onClick: () => onArchiveRoom?.(room),
          });
        }
        if (canDelete) {
          mainItems.push({
            id: "option_delete-room",
            key: "delete-room",
            label: t("Common:DeleteRoom"),
            icon: TrashReactSvgUrl,
            onClick: () => onDeleteRoom?.(room),
          });
        }
      }

      return mainItems;
    },
    [
      t,
      openFolder,
      downloadAction,
      refreshRooms,
      onEditRoom,
      onRoomChanged,
      onChangeOwner,
      onRestoreRoom,
      onDeleteRoom,
      onArchiveRoom,
      onInfoRoom,
      onInviteRoom,
      isArchive,
      filesSelectionStore,
      dialogsStore,
      infoPanelStore,
    ],
  );

  const getSelectionContextMenuModel = useCallback((): ContextMenuModel[] => {
    if (isArchive) {
      return [
        {
          id: "option_unarchive-rooms",
          key: "unarchive-rooms",
          label: t("Common:Restore"),
          icon: MoveReactSvgUrl,
          onClick: () =>
            onRestoreSelected?.(filesSelectionStore.selection as TRoomItem[]),
        },
        {
          id: "option_delete-rooms",
          key: "delete-rooms",
          label: t("Common:DeleteRoom"),
          icon: TrashReactSvgUrl,
          onClick: () =>
            onDeleteSelected?.(filesSelectionStore.selection as TRoomItem[]),
        },
      ];
    }

    return [
      {
        id: "option_download",
        key: "download",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => downloadAction(),
      },
      { key: "separator-archive-selected", isSeparator: true },
      {
        id: "option_archive-rooms",
        key: "archive-rooms",
        label: t("Common:MoveToArchive"),
        icon: RoomArchiveSvgUrl,
        onClick: () =>
          onArchiveSelected?.(filesSelectionStore.selection as TRoomItem[]),
      },
      {
        id: "option_delete-rooms",
        key: "delete-rooms",
        label: t("Common:DeleteRoom"),
        icon: TrashReactSvgUrl,
        onClick: () =>
          onDeleteSelected?.(filesSelectionStore.selection as TRoomItem[]),
      },
    ];
  }, [
    t,
    downloadAction,
    isArchive,
    onDeleteSelected,
    onRestoreSelected,
    onArchiveSelected,
    filesSelectionStore,
  ]);

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

