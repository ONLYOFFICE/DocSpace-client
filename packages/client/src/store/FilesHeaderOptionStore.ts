// (c) Copyright Ascensio System SIA 2009-2025
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

import type { TFunction } from "i18next";
import { makeAutoObservable } from "mobx";

import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/downloadAs.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";
import DefaultQuotaReactSvgUrl from "PUBLIC_DIR/images/default.quota.react.svg?url";
import RemoveOutlineSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import { isDesktop } from "@docspace/shared/utils";
import { toastr } from "@docspace/shared/components/toast";
import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import { showInfoPanel } from "SRC_DIR/helpers/info-panel";

import type FilesActionsStore from "./FilesActionsStore";
import type FilesStore from "./FilesStore";
import type DialogsStore from "./DialogsStore";

export default class FilesHeaderOptionStore {
  private t!: TFunction;

  constructor(
    private filesActionsStore: FilesActionsStore,
    private filesStore: FilesStore,
    private dialogsStore: DialogsStore,
    private currentQuotaStore: CurrentQuotasStore,
  ) {
    makeAutoObservable(this);
  }

  private openCopyPanel = () => this.dialogsStore.setCopyPanelVisible(true);

  private downloadHandle = () =>
    this.filesActionsStore
      .downloadAction(this.t("Common:ArchivingData"))
      ?.catch((err) => toastr.error(err));

  private downloadAsHandle = () =>
    this.dialogsStore.setDownloadDialogVisible(true);

  private moveToHandle = () => this.dialogsStore.setMoveToPanelVisible(true);

  private pinHandle = () => this.filesActionsStore.pinRooms(this.t);

  private unpinHandle = () => this.filesActionsStore.unpinRooms(this.t);

  private archiveHandle = () => this.filesActionsStore.archiveRooms("archive");

  private unarchiveHandle = () =>
    this.filesActionsStore.archiveRooms("unarchive");

  private changeRoomQuotaHandle = () =>
    this.filesActionsStore.changeRoomQuota(this.filesStore.selection, this.t);

  private changeAIAgentQuotaHandle = () =>
    this.filesActionsStore.changeAIAgentQuota(
      this.filesStore.selection,
      this.t,
    );

  private resetRoomQuotaHandle = () =>
    this.filesActionsStore.resetRoomQuota(this.filesStore.selection, this.t);

  private resetAIAgentQuotaHandle = () =>
    this.filesActionsStore.resetAIAgentQuota(this.filesStore.selection, this.t);

  private disableRoomQuotaHandle = () =>
    this.filesActionsStore.disableRoomQuota(this.filesStore.selection, this.t);

  private disableAIAgentQuotaHandle = () =>
    this.filesActionsStore.disableAIAgentQuota(
      this.filesStore.selection,
      this.t,
    );

  private isAvailableOption = (option: string) =>
    this.filesActionsStore.isAvailableOption(option);

  private onClickCreateRoom = () => this.filesActionsStore.onClickCreateRoom();

  private deleteRooms = () => this.filesActionsStore.deleteRooms(this.t);

  private deleteAgents = () => this.filesActionsStore.deleteRooms(this.t);

  private deleteAction = () => {
    const { confirmDelete } = this.filesActionsStore.filesSettingsStore;

    if (confirmDelete) {
      this.dialogsStore.setDeleteDialogVisible(true);
    } else {
      const translations = {
        deleteFromTrash: this.t("Translations:TrashItemsDeleteSuccess", {
          sectionName: this.t("Common:TrashSection"),
        }),
      };

      this.filesActionsStore
        .deleteAction(translations)
        .catch((err) => toastr.error(err));
    }
  };

  private onClickRemoveFromRecent = () =>
    this.filesActionsStore.onClickRemoveFromRecent(this.filesStore.selection);

  private retryVectorization = () =>
    this.filesActionsStore.retryVectorization(this.filesStore.selection);

  public getOption = (option: string, t: TFunction) => {
    const { showStorageInfo } = this.currentQuotaStore;

    this.t = t;

    switch (option) {
      case "show-info":
        if (isDesktop()) return null;
        return {
          id: "menu-show-info",
          key: "show-info",
          label: t("Common:Info"),
          iconUrl: InfoOutlineReactSvgUrl,
          onClick: showInfoPanel,
        };
      case "copy":
        if (!this.isAvailableOption("copy")) return null;
        return {
          id: "menu-copy",
          label: t("Common:Copy"),
          onClick: this.openCopyPanel,
          iconUrl: CopyToReactSvgUrl,
        };

      case "create-room":
        if (!this.isAvailableOption("create-room")) return null;
        return {
          id: "menu-create-room",
          label: t("Common:CreateRoom"),
          onClick: this.onClickCreateRoom,
          iconUrl: CatalogRoomsReactSvgUrl,
        };

      case "download":
        if (!this.isAvailableOption("download")) return null;
        return {
          id: "menu-download",
          label: t("Common:Download"),
          onClick: this.downloadHandle,
          iconUrl: DownloadReactSvgUrl,
        };

      case "downloadAs":
        if (!this.isAvailableOption("downloadAs")) return null;
        return {
          id: "menu-download-as",
          label: t("Common:DownloadAs"),
          onClick: this.downloadAsHandle,
          iconUrl: DownloadAsReactSvgUrl,
        };

      case "moveTo":
        if (!this.isAvailableOption("moveTo")) return null;
        return {
          id: "menu-move-to",
          label: t("Common:MoveTo"),
          onClick: this.moveToHandle,
          iconUrl: MoveReactSvgUrl,
        };
      case "pin":
        return {
          id: "menu-pin",
          key: "pin",
          label: t("Pin"),
          iconUrl: PinReactSvgUrl,
          onClick: this.pinHandle,
          disabled: false,
        };
      case "unpin":
        return {
          id: "menu-unpin",
          key: "unpin",
          label: t("Unpin"),
          iconUrl: UnpinReactSvgUrl,
          onClick: this.unpinHandle,
          disabled: false,
        };
      case "archive":
        if (!this.isAvailableOption("archive")) return null;
        return {
          id: "menu-archive",
          key: "archive",
          label: t("MoveToArchive"),
          iconUrl: RoomArchiveSvgUrl,
          onClick: this.archiveHandle,
          disabled: false,
        };
      case "unarchive":
        if (!this.isAvailableOption("unarchive")) return null;
        return {
          id: "menu-unarchive",
          key: "unarchive",
          label: t("Common:Restore"),
          iconUrl: MoveReactSvgUrl,
          onClick: this.unarchiveHandle,
          disabled: false,
        };
      case "change-quota":
        if (!this.isAvailableOption("change-quota")) return null;
        return {
          id: "menu-change-quota",
          key: "change-quota",
          label: t("Common:ChangeQuota"),
          iconUrl: ChangQuotaReactSvgUrl,
          onClick: this.changeRoomQuotaHandle,
          disabled: !showStorageInfo,
        };
      case "change-agent-quota":
        if (!this.isAvailableOption("change-agent-quota")) return null;
        return {
          id: "menu-change-agent-quota",
          key: "change-agent-quota",
          label: t("Common:ChangeQuota"),
          iconUrl: ChangQuotaReactSvgUrl,
          onClick: this.changeAIAgentQuotaHandle,
          disabled: !showStorageInfo,
        };
      case "default-quota":
        if (!this.isAvailableOption("default-quota")) return null;
        return {
          id: "menu-default-quota",
          key: "default-quota",
          label: t("Common:SetToDefault"),
          iconUrl: DefaultQuotaReactSvgUrl,
          onClick: this.resetRoomQuotaHandle,
          disabled: !showStorageInfo,
        };
      case "default-agent-quota":
        if (!this.isAvailableOption("default-agent-quota")) return null;
        return {
          id: "menu-default-agent-quota",
          key: "default-agent-quota",
          label: t("Common:SetToDefault"),
          iconUrl: DefaultQuotaReactSvgUrl,
          onClick: this.resetAIAgentQuotaHandle,
          disabled: !showStorageInfo,
        };
      case "disable-quota":
        if (!this.isAvailableOption("disable-quota")) return null;
        return {
          id: "menu-disable-quota",
          key: "disable-quota",
          label: t("Common:DisableQuota"),
          iconUrl: DisableQuotaReactSvgUrl,
          onClick: this.disableRoomQuotaHandle,
          disabled: !showStorageInfo,
        };
      case "disable-agent-quota":
        if (!this.isAvailableOption("disable-agent-quota")) return null;
        return {
          id: "menu-disable-agent-quota",
          key: "disable-agent-quota",
          label: t("Common:DisableQuota"),
          iconUrl: DisableQuotaReactSvgUrl,
          onClick: this.disableAIAgentQuotaHandle,
          disabled: !showStorageInfo,
        };

      case "delete-room":
        if (!this.isAvailableOption("delete-room")) return null;
        return {
          id: "menu-delete-room",
          label: t("Common:Delete"),
          onClick: this.deleteRooms,
          iconUrl: DeleteReactSvgUrl,
        };

      case "delete-agent":
        if (!this.isAvailableOption("delete-agent")) return null;
        return {
          id: "menu-delete-agent",
          label: t("Common:Delete"),
          onClick: this.deleteAgents,
          iconUrl: DeleteReactSvgUrl,
        };

      case "delete":
        if (!this.isAvailableOption("delete")) return null;
        return {
          id: "menu-delete",
          label: t("Common:Delete"),
          onClick: this.deleteAction,
          iconUrl: DeleteReactSvgUrl,
        };
      case "remove-from-recent":
        return {
          id: "menu-remove-from-recent",
          label: t("Common:RemoveFromList"),
          onClick: this.onClickRemoveFromRecent,
          iconUrl: RemoveOutlineSvgUrl,
        };
      case "vectorization":
        if (!this.isAvailableOption("vectorization")) return null;
        return {
          id: "menu-vectorization",
          label: t("Files:Vectorization"),
          iconUrl: RefreshReactSvgUrl,
          onClick: this.retryVectorization,
        };
      default:
        break;
    }
  };
}
