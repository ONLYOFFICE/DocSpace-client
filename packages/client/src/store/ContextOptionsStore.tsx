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

import React from "react";
import FileActionsOwnerReactSvgUrl from "PUBLIC_DIR/images/file.actions.owner.react.svg?url";
import HistoryReactSvgUrl from "PUBLIC_DIR/images/history.react.svg?url";
import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import BackupSvgUrl from "PUBLIC_DIR/images/icons/16/backup.svg?url";
import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import ReconnectSvgUrl from "PUBLIC_DIR/images/reconnect.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import FolderLocationReactSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";
import TickRoundedSvgUrl from "PUBLIC_DIR/images/tick.rounded.svg?url";
import FavoritesReactSvgUrl from "PUBLIC_DIR/images/favorite.react.svg?url";
import FavoritesFillReactSvgUrl from "PUBLIC_DIR/images/favorite.fill.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import CircleCrossSvgUrl from "PUBLIC_DIR/images/icons/16/circle.cross.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/icons/16/locked.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import FormPlusReactSvgUrl from "PUBLIC_DIR/images/form.plus.react.svg?url";
import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import PersonReactSvgUrl from "PUBLIC_DIR/images/person.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import UnmuteReactSvgUrl from "PUBLIC_DIR/images/unmute.react.svg?url";
import MuteReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";
import ShareReactSvgUrl from "PUBLIC_DIR/images/share.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import EditIndexReactSvgUrl from "PUBLIC_DIR/images/edit.index.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import PluginActionsSvgUrl from "PUBLIC_DIR/images/plugin.actions.react.svg?url";
import LeaveRoomSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import CatalogAIAgentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import RemoveOutlineSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import ActionsDocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import ActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FormBlankReactSvgUrl from "PUBLIC_DIR/images/form.blank.react.svg?url";
import FormGalleryReactSvgUrl from "PUBLIC_DIR/images/form.gallery.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import PluginMoreReactSvgUrl from "PUBLIC_DIR/images/plugin.more.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";
import ExportRoomIndexSvgUrl from "PUBLIC_DIR/images/icons/16/export-room-index.react.svg?url";
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";
import HelpCenterReactSvgUrl from "PUBLIC_DIR/images/help.center.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/icons/16/custom-filter.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import AISvgUrl from "PUBLIC_DIR/images/icons/16/AI.svg?url";
import spreadsheetUrl from "PUBLIC_DIR/images/icons/16/spreadsheet.svg?url";
import DotsHorizontalUrl from "PUBLIC_DIR/images/icons/16/dots-horizontal.react.svg?url";

import CreateTemplateSvgUrl from "PUBLIC_DIR/images/template.react.svg?url";
import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";
import TemplateGalleryReactSvgUrl from "PUBLIC_DIR/images/template.gallery.react.svg?url";
import CreateGroupReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import AddToGroupReactSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";

import { makeAutoObservable, runInAction } from "mobx";
import copy from "copy-to-clipboard";
import { isMobile, isTablet } from "react-device-detect";
import { Trans } from "react-i18next";
import type { TFunction } from "i18next";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import type { TTranslation } from "@docspace/shared/types";
import type {
  TFile,
  TFileLink,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TOformFile } from "@docspace/shared/api/oforms/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { UserStore } from "@docspace/shared/store/UserStore";

import {
  isMobile as isMobileUtils,
  isLockedSharedRoom,
  trimSeparator,
} from "@docspace/shared/utils";
import { getDefaultAccessUser } from "@docspace/shared/utils/getDefaultAccessUser";
import { copyShareLink as copyToBuffer } from "@docspace/shared/utils/copy";
import {
  canShowManageLink,
  copyShareLink,
} from "@docspace/shared/components/share/Share.helpers";

import { getGuidanceConfig } from "@docspace/shared/components/guidance/configs";

import {
  connectedCloudsTypeTitleTranslation,
  removeOptions,
} from "SRC_DIR/helpers/filesUtils";
import { getOAuthToken } from "@docspace/ui-kit/utils/get-oauth-token";
import { OPERATIONS_NAME } from "@docspace/ui-kit/constants";
import {
  AnalyticsEvents,
  RoomsType,
  Events,
  FolderType,
  UrlActionType,
  FilesSelectorFilterTypes,
  FilterType,
  FileExtensions,
  ShareAccessRights,
  FormFillingManageAction,
} from "@docspace/shared/enums";

import {
  formRoleMapping,
  getFileLink,
  getFolderLink,
  manageFormFilling,
  removeSharedFolderOrFile,
} from "@docspace/shared/api/files";

import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import { createLoader } from "@docspace/shared/utils/createLoader";
import {
  FILLING_STATUS_ID,
  SHARED_WITH_ME_PATH,
} from "@docspace/shared/constants";
import {
  isFile as isFileUtil,
  isFolder,
  isFolder as isFolderUtil,
  isRoom as isRoomUtil,
} from "@docspace/shared/utils/typeGuards";
import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";
import {
  getInfoPanelOpen,
  openMembersTab,
  openShareTab,
  setInfoPanelMobileHidden,
  showInfoPanel,
} from "SRC_DIR/helpers/info-panel";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import { XlsxUpdateService } from "@docspace/shared/services/xlsx-update.service";
import { showCreatedPDFFormDialog } from "SRC_DIR/components/dialogs/CreatedPDFFormDialog";
import { getBrandName } from "@docspace/shared/constants/brands";
import { getRoomInfo } from "@docspace/shared/api/rooms";
import type { IContextMenuItemClient } from "SRC_DIR/helpers/plugins/types";
import { PersistenceKeys, getPersisted } from "./utils/persistence";
import {
  createMenuGroup,
  filterModel,
  onClickEditAgent,
  onClickEditRoom as onClickEditRoomHelper,
  onClickLinkForPortal,
  onEditRoomTemplate,
  onShowEditingToast,
  onShowInfoPanel as onShowInfoPanelHelper,
  onShowWaitOperationToast,
  onSuggestOformChanges,
  onUploadAction,
  placePlugins,
  systemFolders,
} from "./contextOptionsStore/helpers";
import type {
  TContextItem,
  TContextItemSecurity,
  TContextOption,
  TMenuGroupConfig,
  TStoreCustomEvent,
} from "./contextOptionsStore/helpers";
import { getFilesContextOptionsImpl } from "./contextOptionsStore/filesContextOptions.helpers";
import type DialogsStore from "./DialogsStore";
import type MediaViewerDataStore from "./MediaViewerDataStore";
import type TreeFoldersStore from "./TreeFoldersStore";
import type UploadDataStore from "./UploadDataStore";
import type VersionHistoryStore from "./VersionHistoryStore";
import type FilesSettingsStore from "./FilesSettingsStore";
import type SelectedFolderStore from "./SelectedFolderStore";
import type PublicRoomStore from "./PublicRoomStore";
import type OformsStore from "./OformsStore";
import type PluginStore from "./PluginStore";
import type InfoPanelStore from "./InfoPanelStore";
import type IndexingStore from "./IndexingStore";
import type ClientLoadingStore from "./ClientLoadingStore";
import type GuidanceStore from "./GuidanceStore";

export type { TContextItem } from "./contextOptionsStore/helpers";

const LOADER_TIMER = 500;
let loadingTime: Date | null | undefined;
let timer: ReturnType<typeof setTimeout> | null | undefined;

// multi-select items always carry contextOptions/security in
// the .js FilesStore filesList view-model.
type TSelectionItem = TContextItem & {
  contextOptions: string[];
  security: TContextItemSecurity;
};

// matches the (unexported) GroupItem type of the plugin SDK's
// IContextMenuItem["onGroupClick"].
type TPluginGroupItem = {
  id: number | string;
  itemType: "file" | "folder" | "room";
};

type TFilesStore = {
  activeFiles: unknown[];
  activeFolders: unknown[];
  selection: TSelectionItem[];
  roomsForDelete: unknown[];
  roomsForRestore: unknown[];
  isThirdPartySelection: boolean;
  isFiltered: boolean;
  allFilesIsEditing: boolean;
  canConvertSelected: boolean;
  roomsFilter: { groupId?: string | null } | null;
  addActiveItems: (
    files?: (number | string)[] | null,
    folders?: (number | string)[] | null,
    destFolderId?: number | string,
  ) => void;
  setActiveFiles: (
    activeFiles: (number | string)[],
    destFolderId?: number | string,
  ) => void;
  setSelection: (selection: TSelectionItem[]) => void;
  setBufferSelection: (bufferSelection: unknown) => void;
  getItemUrl: (
    id: number | string,
    isFolder?: boolean,
    needConvert?: boolean,
    canOpenPlayer?: boolean,
    shareKey?: string,
    isAiRoom?: boolean,
  ) => string;
  openDocEditor: (
    id: number | string,
    preview?: boolean,
    shareKey?: string | null,
    editForm?: boolean,
    fillForm?: boolean,
  ) => Window | null | undefined;
  getPrimaryLink: (roomId: number | string) => Promise<TFileLink | undefined>;
  getFilesListItems: (items: unknown[]) => TContextItem[];
  removeFiles: (
    fileIds?: unknown[] | null,
    folderIds?: unknown[] | null,
  ) => void;
  getFilesContextOptions: (
    item: TContextItem,
    optionsToRemove?: string[],
  ) => string[];
};

type TFilesActionsStore = {
  uploadDataStore: UploadDataStore;
  isGroupMenuBlocked: boolean;
  emptyTrashInProgress: boolean;
  emptyPersonalRoomInProgress: boolean;
  isExpiredLinkAsync: (
    item: TContextItem,
    withLoader?: boolean,
  ) => Promise<boolean>;
  openLocationAction: (item: TContextItem) => Promise<unknown>;
  checkAndOpenLocationAction: (item: TContextItem) => Promise<unknown>;
  finalizeVersionAction: (id: number | string) => Promise<unknown>;
  setFavoriteAction: (
    action: "mark" | "remove",
    items: TContextItem[],
  ) => Promise<unknown>;
  lockFileAction: (id: number | string, locked: boolean) => Promise<unknown>;
  setGroupMenuBlocked: (blocked: boolean) => void;
  downloadAction: (label: string, item?: unknown) => Promise<unknown>;
  downloadFiles: (
    fileConvertIds: unknown[],
    folderIds: (number | string)[],
    translations: { label: string },
  ) => Promise<unknown>;
  changeCustomFilter: (item: TContextItem, t: TTranslation) => Promise<unknown>;
  duplicateAction: (item: TContextItem) => Promise<unknown>;
  setThirdpartyInfo: (providerKey?: string) => void;
  askAIAction: (item: TContextItem) => void;
  retryVectorization: (files: TContextItem[]) => Promise<unknown>;
  setPinAction: (
    action: "pin" | "unpin",
    id: number,
    t: TTranslation,
    isAIAgent?: boolean,
  ) => Promise<unknown>;
  setMuteAction: (
    action: "mute" | "unmute",
    item: TContextItem,
    t: TTranslation,
  ) => void;
  exportRoomIndex: (t: TTranslation, roomId: number) => Promise<unknown>;
  removeFilesFromRecent: (
    fileIds: number[],
    t: TTranslation,
  ) => Promise<unknown>;
  onClickRemoveFromRecent: (
    selection: TSelectionItem[],
    t: TTranslation,
  ) => void;
  onCreateRoomFromTemplate: (
    item: TContextItem,
    addSelection?: boolean,
  ) => void;
  setProcessCreatingRoomFromData: (value: boolean) => void;
  deleteAction: (
    translations: Record<string, string>,
    newSelection?: unknown,
    withoutDialog?: boolean,
  ) => Promise<unknown>;
  deleteRoomsAction: (
    itemIds: unknown[],
    translations: Record<string, string>,
  ) => Promise<unknown>;
  deleteItemAction: (
    id: number | string,
    title: string,
    translations: Record<string, unknown>,
    isFile: boolean,
    providerKey?: string,
    isRoom?: boolean,
  ) => Promise<unknown>;
  markAsRead: (
    folderIds: (number | string)[],
    fileIds: (number | string)[],
    item: TContextItem,
  ) => Promise<unknown>;
  onSelectItem: (
    item: { id: number; isFolder?: boolean },
    needSelect?: boolean,
    needClear?: boolean,
  ) => void;
  pinRooms: (t: TTranslation) => void;
  unpinRooms: (t: TTranslation) => void;
  deleteRooms: (t: TTranslation) => void;
};

class ContextOptionsStore {
  settingsStore: SettingsStore;

  dialogsStore: DialogsStore;

  filesActionsStore: TFilesActionsStore;

  filesStore: TFilesStore;

  mediaViewerDataStore: MediaViewerDataStore;

  treeFoldersStore: TreeFoldersStore;

  uploadDataStore: UploadDataStore;

  versionHistoryStore: VersionHistoryStore;

  filesSettingsStore: FilesSettingsStore;

  selectedFolderStore: SelectedFolderStore;

  publicRoomStore: PublicRoomStore;

  oformsStore: OformsStore;

  pluginStore: PluginStore;

  infoPanelStore: InfoPanelStore;

  currentTariffStatusStore: CurrentTariffStatusStore;

  currentQuotaStore: CurrentQuotasStore;

  userStore: UserStore;

  indexingStore: IndexingStore;

  clientLoadingStore: ClientLoadingStore;

  linksIsLoading = false;

  guidanceStore: GuidanceStore;

  // `this.onOwnerChange` is referenced by the "owner-change"
  // option below but is not defined anywhere — the option gets
  // `onClick: undefined` at runtime. `declare` keeps that runtime shape
  // (no own property) while satisfying the type checker.
  declare onOwnerChange?: () => void;

  constructor(
    settingsStore: SettingsStore,
    dialogsStore: DialogsStore,
    filesActionsStore: TFilesActionsStore,
    filesStore: TFilesStore,
    mediaViewerDataStore: MediaViewerDataStore,
    treeFoldersStore: TreeFoldersStore,
    uploadDataStore: UploadDataStore,
    versionHistoryStore: VersionHistoryStore,
    filesSettingsStore: FilesSettingsStore,
    selectedFolderStore: SelectedFolderStore,
    publicRoomStore: PublicRoomStore,
    oformsStore: OformsStore,
    pluginStore: PluginStore,
    infoPanelStore: InfoPanelStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
    currentQuotaStore: CurrentQuotasStore,
    userStore: UserStore,
    indexingStore: IndexingStore,
    clientLoadingStore: ClientLoadingStore,
    guidanceStore: GuidanceStore,
  ) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
    this.dialogsStore = dialogsStore;
    this.filesActionsStore = filesActionsStore;
    this.filesStore = filesStore;
    this.mediaViewerDataStore = mediaViewerDataStore;
    this.treeFoldersStore = treeFoldersStore;
    this.uploadDataStore = uploadDataStore;
    this.versionHistoryStore = versionHistoryStore;
    this.filesSettingsStore = filesSettingsStore;
    this.selectedFolderStore = selectedFolderStore;
    this.publicRoomStore = publicRoomStore;
    this.oformsStore = oformsStore;
    this.pluginStore = pluginStore;
    this.infoPanelStore = infoPanelStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.currentQuotaStore = currentQuotaStore;
    this.userStore = userStore;
    this.indexingStore = indexingStore;
    this.clientLoadingStore = clientLoadingStore;
    this.guidanceStore = guidanceStore;
  }

  onOpenFolder = async (item: TContextItem, t: TTranslation) => {
    const { isExpiredLinkAsync } = this.filesActionsStore;

    if (
      item.external &&
      (item.isLinkExpired || (await isExpiredLinkAsync(item)))
    ) {
      const isRoom = isRoomUtil(item);

      const description = isRoom
        ? t("Common:RoomLinkExpired")
        : t("Common:FolderLinkExpired");

      const title = isRoom
        ? t("Common:RoomNotAvailable")
        : t("Common:FolderNotAvailable");

      return toastr.error(description, title);
    }

    if (isLockedSharedRoom(item as TRoom))
      return this.dialogsStore.setPasswordEntryDialog(true, item as TRoom);

    this.filesActionsStore.openLocationAction(item);
  };

  onClickLinkFillForm = (item: TContextItem) => {
    const isFormRoom =
      this.selectedFolderStore?.roomType === RoomsType.FormRoom ||
      this.selectedFolderStore?.parentRoomType === FolderType.FormRoom;

    if (
      !item.startFilling &&
      item.isPDFForm &&
      !isFormRoom &&
      !this.publicRoomStore.isPublicRoom &&
      item?.security?.Copy
    )
      return this.dialogsStore.setFillPDFDialogData(true, item as TFile);

    return this.gotoDocEditor(item, false, null, false, !isFormRoom);
  };

  onClickReconnectStorage = async (item: TContextItem, t: TTranslation) => {
    const { thirdPartyStore } = this.filesSettingsStore;

    const { openConnectWindow, connectItems } = thirdPartyStore;

    const {
      setRoomCreation,
      setConnectItem,
      setConnectDialogVisible,
      setIsConnectDialogReconnect,
      setSaveAfterReconnectOAuth,
    } = this.dialogsStore;

    setIsConnectDialogReconnect(true);

    setRoomCreation(true);

    // the original .js assumed the provider is always found
    // (crashed otherwise) — the non-null assertion keeps that behavior.
    const provider = connectItems.find(
      (connectItem) => connectItem.providerName === item.providerKey,
    )!;

    const itemThirdParty = {
      title: connectedCloudsTypeTitleTranslation(provider.providerName, t),
      customer_title: "NOTITLE",
      provider_key: provider.providerName,
      link: provider.oauthHref,
      provider_id: item.providerId,
    };

    if (provider.isOauth) {
      const authModal = window.open(
        "",
        t("Common:Authorization"),
        "height=600, width=1020",
      );
      await openConnectWindow(provider.providerName, authModal)
        .then(getOAuthToken)
        .then((token) => {
          // the original .js assumed window.open succeeded
          // (crashed on null) — the non-null assertion keeps that behavior.
          authModal!.close();
          setConnectItem({
            ...itemThirdParty,
            token,
          });

          setSaveAfterReconnectOAuth(true);
        })
        .catch((err: unknown) => {
          if (!err) return;
          toastr.error(err as string);
        });
    } else {
      setConnectItem(itemThirdParty);
      setConnectDialogVisible(true);
    }
  };

  onClickMakeForm = (item: TContextItem, t: TTranslation) => {
    const { setConvertPasswordDialogVisible, setFormCreationInfo } =
      this.dialogsStore;
    // the original .js assumed a file item (fileExst/folderId
    // always present) — the cast keeps identical runtime behavior.
    const { title, id, folderId, fileExst } = item as TContextItem & {
      fileExst: string;
      folderId: number;
    };

    const newTitle =
      title.substring(0, title.length - fileExst.length) +
      this.filesSettingsStore.extsWebRestrictedEditing[0];

    // copyAsAction rejections are untyped (axios error or
    // string) — the structural annotation mirrors the original .js handling.
    type TCopyAsError =
      | string
      | {
          response?: { data?: { error?: { message?: string } } };
          statusText?: string;
          message?: string;
        };

    this.uploadDataStore
      .copyAsAction(id, newTitle, folderId)
      .catch((err: TCopyAsError) => {
        let errorMessage = "";
        if (typeof err === "object") {
          errorMessage =
            err?.response?.data?.error?.message ||
            err?.statusText ||
            err?.message ||
            "";
        } else {
          errorMessage = err;
        }

        if (errorMessage.indexOf("password") == -1) {
          toastr.error(errorMessage, t("Common:Warning"));
          return;
        }

        toastr.error(t("Translations:FileProtected"), t("Common:Warning"));
        setFormCreationInfo({
          newTitle,
          fromExst: fileExst,
          toExst: this.filesSettingsStore.extsWebRestrictedEditing[0],
          fileInfo: item,
        });
        setConvertPasswordDialogVisible(true);
      });
  };

  onClickSubmitToFormGallery = (item: TContextItem) => {
    if (item && !item.exst) {
      const splitTitle = item.title.split(".");
      item.title = splitTitle.slice(0, -1).join(".");
      item.exst = splitTitle.length !== 1 ? `.${splitTitle.at(-1)}` : null;
    }

    this.dialogsStore.setFormItem(item);
    this.dialogsStore.setSubmitToGalleryDialogVisible(true);
  };

  onOpenLocation = (item: TContextItem) => {
    this.filesActionsStore.checkAndOpenLocationAction(item);
  };

  onMoveAction = (item?: TContextItem) => {
    const { id, isFolder } = this.selectedFolderStore;

    setInfoPanelMobileHidden(true);

    const isFolderActions = id === item?.id && isFolder === item?.isFolder;
    if (isFolderActions) {
      this.dialogsStore.setIsFolderActions(true);
    }

    this.dialogsStore.setMoveToPanelVisible(true);
  };

  onRestoreAction = () => {
    setInfoPanelMobileHidden(true);
    this.dialogsStore.setRestorePanelVisible(true);
  };

  onCopyAction = (item?: TContextItem) => {
    const { id, isFolder } = this.selectedFolderStore;

    setInfoPanelMobileHidden(true);

    const isFolderActions = id === item?.id && isFolder === item?.isFolder;
    if (isFolderActions) {
      this.dialogsStore.setIsFolderActions(true);
    }

    this.dialogsStore.setCopyPanelVisible(true);
  };

  showVersionHistory = (
    id: number | string,
    security?: TContextItemSecurity,
    requestToken?: string,
  ) => {
    const { fetchFileVersions, setIsVerHistoryPanel } =
      this.versionHistoryStore;

    if (this.treeFoldersStore.isRecycleBinFolder) return;

    fetchFileVersions(`${id}`, security as TFile["security"], requestToken);
    setIsVerHistoryPanel(true);
    setInfoPanelMobileHidden(true);
  };

  // some call sites pass `item.security` as a second argument
  // which the original .js silently ignored — the optional parameter keeps
  // those calls type-correct without changing runtime behavior.
  finalizeVersion = (id: number | string, _security?: TContextItemSecurity) => {
    this.filesActionsStore.finalizeVersionAction(id).catch((err: unknown) => {
      toastr.error(err as string);
    });
  };

  onClickFavorite = (
    action: "mark" | "remove",
    items: TContextItem[],
    t: TTranslation,
  ) => {
    this.filesActionsStore
      .setFavoriteAction(action, items)
      .then(() =>
        action === "mark"
          ? toastr.success(t("Common:MarkedAsFavorite"))
          : toastr.success(t("Common:RemovedFromFavorites")),
      )
      .catch((err: unknown) => toastr.error(err as string));
  };

  lockFile = (item: TContextItem, t: TTranslation) => {
    const { id, locked } = item;

    this.filesActionsStore
      .lockFileAction(id, !locked)
      .then(() =>
        locked
          ? toastr.success(t("Common:FileUnlocked"))
          : toastr.success(t("Common:FileLocked")),
      )
      .catch((err: unknown) => {
        toastr.error(err as string);
      });
  };

  onCopyLink = async (item: TContextItem, t: TTranslation) => {
    const { shared, navigationPath } = this.selectedFolderStore;

    const isArchive = item.rootFolderType === FolderType.Archive;

    const { href } = item;

    const sharedItem = navigationPath.find((r) => r.shared);

    const isShared = shared || sharedItem || item.shared;

    const isSystemFolder = systemFolders.includes(item.type as FolderType);

    if (isShared && !isArchive && !isSystemFolder && item.canShare) {
      try {
        const itemLink = item.isFolder
          ? await getFolderLink(item.id)
          : await getFileLink(item.id);

        if (
          this.filesSettingsStore.isLinkBlockedByAdmin(
            item as { rootFolderType: FolderType },
            itemLink,
          )
        ) {
          toastr.error(t("Common:LinkBlockedByAdminWarning"));
          return;
        }

        copyToBuffer(itemLink.sharedTo.shareLink);

        if (!item.isFolder && !item.isRoom) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: AnalyticsEvents.FileShared,
            id: item.id,
            parentId: item.folderId,
          });
        }

        item.customFilterEnabled
          ? toastr.success(
              <Trans
                t={t as unknown as TFunction}
                i18nKey="Common:LinkCopySuccessWithCustomFilter"
              />,
            )
          : toastr.success(t("Common:LinkCopySuccess"));
      } catch (error) {
        toastr.error(error as string);
      }
      return;
    }

    if (item.shortWebUrl) {
      copyToBuffer(item.shortWebUrl);
      return toastr.success(t("Common:LinkCopySuccess"));
    }

    if (
      (item.rootFolderType === FolderType.Recent ||
        item.rootFolderType === FolderType.SHARE) &&
      item.webUrl
    ) {
      copy(item.webUrl);
      return toastr.success(t("Common:LinkCopySuccess"));
    }

    if (href) {
      copy(href);

      return toastr.success(t("Common:LinkCopySuccess"));
    }

    const { canConvert } = this.filesSettingsStore;

    const { getItemUrl } = this.filesStore;

    const needConvert = canConvert(item.fileExst as string);

    const canOpenPlayer =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;

    const url = getItemUrl(
      item.id,
      item.isRoom || item.isFolder,
      needConvert,
      canOpenPlayer,
      "",
      item.roomType === RoomsType.AIRoom,
    );

    copy(url);

    toastr.success(t("Common:LinkCopySuccess"));
  };

  onOpenEmbeddingSettings = async (item: TContextItem) => {
    const { setLinkParams, setEmbeddingPanelData } = this.dialogsStore;

    // the original .js sets linkParams without the `link`
    // field required by LinkParamsType — the cast keeps that runtime shape.
    setLinkParams({
      item,
    } as unknown as Parameters<DialogsStore["setLinkParams"]>[0]);

    setEmbeddingPanelData({ visible: true, item });
  };

  onCreateAndCopySharedLink = async (item: TContextItem, t: TTranslation) => {
    const { isExpiredLinkAsync } = this.filesActionsStore;

    if (
      item.external &&
      (item.isLinkExpired || (await isExpiredLinkAsync(item)))
    )
      return toastr.error(
        t("Common:RoomLinkExpired"),
        t("Common:RoomNotAvailable"),
      );

    const primaryLink = await this.filesStore.getPrimaryLink(item.id);

    if (primaryLink) {
      if (
        this.filesSettingsStore.isLinkBlockedByAdmin(
          item as { rootFolderType: FolderType },
          primaryLink,
        )
      ) {
        toastr.error(t("Common:LinkBlockedByAdminWarning"));
        return;
      }

      copyShareLink(
        item as TFile | TFolder | TRoom,
        primaryLink,
        t as unknown as TFunction,
        this.getManageLinkOptions(item),
      );

      this.publicRoomStore.setExternalLink(primaryLink);

      if (item.isRoom || !item.isFolder) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: item.isRoom
            ? AnalyticsEvents.RoomShared
            : AnalyticsEvents.FileShared,
          id: item.id,
          parentId: item.isRoom ? item.parentId : item.folderId,
        });
      }
    }
  };

  /**
   * Confirm pausing form filling before editing
   * @param {Object} item - File item to check
   * @returns {Promise<boolean>} - Returns true if user confirmed to proceed
   */
  confirmPauseFormSubmissions = async (item: TContextItem) => {
    const isParentFormRoom = item.parentRoomType === FolderType.FormRoom;
    const isFormActive = isParentFormRoom && item.startFilling;

    if (!isFormActive) return true;

    // Show confirmation dialog to pause filling
    const confirmed = await new Promise<boolean>((resolve) => {
      this.dialogsStore.setPauseSubmissionsDialogVisible(true, resolve);
    });

    return confirmed;
  };

  showConvertDialog = (item: TContextItem) => {
    const { setConvertItem, setConvertDialogVisible, setConvertDialogData } =
      this.dialogsStore;

    setConvertItem({ ...item, isOpen: true });
    setConvertDialogData({ files: item });
    setConvertDialogVisible(true);
  };

  onClickLinkEdit = async (item: TContextItem) => {
    // Confirm pausing form filling if form is active
    const confirmed = await this.confirmPauseFormSubmissions(item);
    if (!confirmed) return;

    const mustConvert =
      item.viewAccessibility?.MustConvert && item.security?.Convert;

    if (mustConvert) {
      this.showConvertDialog(item);
      return;
    }

    this.gotoDocEditor(item, false, null, item.isPDFForm);
  };

  onPreviewClick = (item: TContextItem) => {
    this.gotoDocEditor(item, true);
  };

  gotoDocEditor = (
    item: TContextItem,
    preview = false,
    shareKey: string | null = null,
    editForm = false,
    fillForm = false,
  ) => {
    const { id } = item;

    this.filesStore.openDocEditor(id, preview, shareKey, editForm, fillForm);
  };

  // isPwa = () => {
  //   return ["fullscreen", "standalone", "minimal-ui"].some(
  //     (displayMode) =>
  //       window.matchMedia("(display-mode: " + displayMode + ")").matches,
  //   );
  // };

  onRemoveSharedFilesOrFolder = async (items: TContextItem[]) => {
    if (!Array.isArray(items) || items.length === 0) return;

    const { addActiveItems } = this.filesStore;
    const { setGroupMenuBlocked } = this.filesActionsStore;
    // const { clearActiveOperations } = this.uploadDataStore;

    const { folderIds, fileIds } = items.reduce<{
      folderIds: number[];
      fileIds: number[];
    }>(
      (acc, item) => {
        if (isFolderUtil(item) || isRoomUtil(item)) acc.folderIds.push(item.id);
        else if (isFileUtil(item)) acc.fileIds.push(item.id);

        return acc;
      },
      { folderIds: [], fileIds: [] },
    );

    try {
      runInAction(() => {
        setGroupMenuBlocked(true);
        addActiveItems(fileIds, folderIds);
      });

      await removeSharedFolderOrFile(folderIds, fileIds);
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      runInAction(() => {
        setGroupMenuBlocked(false);
      });
    }
  };

  onClickDownload = (item: TContextItem, t: TTranslation) => {
    const { viewUrl, isFolder, encrypted } = item;
    const isFile = !isFolder;

    const { openUrl } = this.settingsStore;
    const { downloadAction } = this.filesActionsStore;

    if (isFile && encrypted) {
      downloadAction("", item).catch((err: unknown) =>
        toastr.error(err as string),
      );
    } else if (isFile) {
      // the original .js passed viewUrl through unchecked
      // (files always carry it) — the non-null assertion keeps that behavior.
      openUrl(viewUrl!, UrlActionType.Download);
    } else {
      downloadAction(t("Common:ArchivingData"), item).catch((err: unknown) =>
        toastr.error(err as string),
      );
    }
  };

  onClickDownloadEncrypted = (item: TContextItem, t: TTranslation) => {
    const { openUrl } = this.settingsStore;

    if (item.isFolder || item.roomType) {
      return this.filesActionsStore
        .downloadFiles([], [item.id], { label: t("Common:ArchivingData") })
        .catch((err: unknown) => toastr.error(err as string));
    }

    openUrl(item.viewUrl!, UrlActionType.Download);
  };

  onClickDownloadAs = () => {
    this.dialogsStore.setDownloadDialogVisible(true);
  };

  onSetUpCustomFilter = (item: TContextItem, t: TTranslation) => {
    this.filesActionsStore.changeCustomFilter(item, t);
  };

  // some call sites pass `t` as a second argument which the
  // original .js silently ignored — the optional parameter keeps those calls
  // type-correct without changing runtime behavior.
  onDuplicate = (item: TContextItem, _t?: TTranslation) => {
    if (item.isRoom && this.currentQuotaStore.isWarningRoomsDialog) {
      this.dialogsStore.setQuotaWarningDialogVisible(true);
      return;
    }

    this.filesActionsStore.duplicateAction(item);
  };

  onClickRename = (item: TContextItem) => {
    const event: TStoreCustomEvent = new CustomEvent(Events.RENAME, {
      detail: {
        parentId: this.selectedFolderStore.id,
        context: "context_menu",
      },
    });

    event.item = item;

    window.dispatchEvent(event);
  };

  onChangeThirdPartyInfo = (providerKey?: string) => {
    this.filesActionsStore.setThirdpartyInfo(providerKey);
  };

  // some call sites pass `item` which the original .js
  // silently ignored — the optional parameter keeps those calls type-correct
  // without changing runtime behavior.
  onFillingStatus = (_item?: TContextItem) => {
    this.dialogsStore.setFillingStatusPanelVisible(true);
  };

  startFillingInRoleBasedRoom = (item: TContextItem, t: TTranslation) => {
    if (isMobile)
      return toastr.info(t("Common:MobileStartFillingPdfNotAvailableInfo"));

    const refPage = this.filesStore.openDocEditor(
      item.id,
      false,
      null,
      true,
      false,
    );

    if (refPage) refPage.sessionStorage.setItem(FILLING_STATUS_ID, "true");
  };

  startFillingInFormRoom = async (item: TContextItem) => {
    try {
      await manageFormFilling(item.id, FormFillingManageAction.Start);

      // the original .js assumed a signed-in user and a file
      // item here — the assertions/casts keep identical runtime behavior.
      showCreatedPDFFormDialog(item as TFile, this.userStore.user!.id);
    } catch (error) {
      toastr.error(error as string);
    }
  };

  // the AssignRoles dialog calls this without `t` (only ever
  // for form-room items, where `t` is unused) — the optional parameter and
  // cast keep the original .js behavior.
  onClickStartFilling = (item: TContextItem, t?: TTranslation) => {
    const isFormRoom = item.parentRoomType === FolderType.FormRoom;

    if (isFormRoom) {
      this.startFillingInFormRoom(item);
      return;
    }

    this.startFillingInRoleBasedRoom(item, t as TTranslation);
  };

  onClickResetAndStartFilling = async (item: TContextItem) => {
    const { addActiveItems } = this.filesStore;
    const { clearActiveOperations } = this.uploadDataStore;
    const { setGroupMenuBlocked } = this.filesActionsStore;

    const { endLoader, startLoader } = createLoader();

    try {
      startLoader(() => {
        runInAction(() => {
          setGroupMenuBlocked(true);
          addActiveItems([item.id], null);
        });
      });

      await formRoleMapping({
        formId: item.id,
        roles: [],
      });
    } catch (error) {
      toastr.error(error as string);
      console.error(error);
    } finally {
      endLoader(() =>
        runInAction(() => {
          setGroupMenuBlocked(false);
          clearActiveOperations([item.id]);
        }),
      );
    }
  };

  // when used as a context-menu onClick the first argument is
  // the ui-kit click payload (an object), otherwise a media file id.
  onMediaFileClick = (fileId: number | string | object, item: TContextItem) => {
    const itemId = typeof fileId !== "object" ? fileId : item.id;
    this.mediaViewerDataStore.setMediaViewerData({ visible: true, id: itemId });
    this.mediaViewerDataStore.changeUrl(itemId);
  };

  onClickDeleteSelectedFolder = (t: TTranslation, isRoom?: boolean) => {
    const { setIsFolderActions, setDeleteDialogVisible, setIsRoomDelete } =
      this.dialogsStore;
    const { confirmDelete } = this.filesSettingsStore;
    const { deleteAction, deleteRoomsAction } = this.filesActionsStore;
    const { id: selectedFolderId, getSelectedFolder } =
      this.selectedFolderStore;
    const { isThirdPartySelection, setBufferSelection } = this.filesStore;

    const selectedFolder = getSelectedFolder();

    setIsFolderActions(true);

    if (confirmDelete || isThirdPartySelection) {
      setBufferSelection(selectedFolder);
      // the original .js passes `undefined` through here when
      // the caller omits isRoom — the cast keeps the exact runtime value.
      setIsRoomDelete(isRoom as boolean);
      setDeleteDialogVisible(true);

      return;
    }

    let translations: Record<string, string>;

    if (isRoom) {
      translations = {
        successRemoveRoom: t("Common:RoomRemoved"),
        successRemoveRooms: t("Common:RoomsRemoved"),
      };

      deleteRoomsAction([selectedFolderId], translations).catch(
        (err: unknown) => toastr.error(err as string),
      );
    } else {
      translations = {
        deleteFromTrash: t("Translations:TrashItemsDeleteSuccess", {
          sectionName: t("Common:TrashSection"),
        }),
      };

      deleteAction(translations, [selectedFolder], true).catch((err: unknown) =>
        toastr.error(err as string),
      );
    }
  };

  onClickDelete = (item: TContextItem, t: TTranslation) => {
    const { id, title, providerKey, isFolder, isRoom } = item;

    if (id === this.selectedFolderStore.id && isFolder) {
      this.onClickDeleteSelectedFolder(t, isRoom);

      return;
    }

    this.filesActionsStore.deleteItemAction(
      id,
      title,
      {},
      !isFolder,
      providerKey,
      isRoom,
    );
  };

  // some call sites pass `item` which the original .js
  // silently ignored — the optional parameter keeps those calls type-correct
  // without changing runtime behavior.
  onClickShare = (_item?: TContextItem) => {
    // const { setShareFolderDialogVisible } = this.dialogsStore;

    openShareTab();
    // if (item.isFolder) {
    //   setShareFolderDialogVisible(true);
    // } else {
    // openShareTab();
    // }
  };

  onClickMarkRead = (item: TContextItem) => {
    const { markAsRead } = this.filesActionsStore;

    item.fileExst
      ? markAsRead([], [item.id], item)
      : markAsRead([item.id], [], item);
  };

  onClickUnsubscribe = () => {
    const { setDeleteDialogVisible, setUnsubscribe } = this.dialogsStore;

    setUnsubscribe(true);
    setDeleteDialogVisible(true);
  };

  onOpenPDFEditDialog = (id: number | string) => {
    this.filesStore.openDocEditor(id, false, null, true);
  };

  onDelete = (item: TContextItem, t: TTranslation) => {
    const { isGroupMenuBlocked } = this.filesActionsStore;

    if (item.isEditing) return onShowEditingToast(t);

    if (isGroupMenuBlocked) return onShowWaitOperationToast(t);

    this.onClickDelete(item, t);
  };

  // Kept as a delegating member — external consumers (MediaViewer) call it.
  onShowInfoPanel = (item?: TContextItem, view?: string) =>
    onShowInfoPanelHelper(item, view);

  // Kept as a delegating member — external consumers (Section Header) call it.
  onClickEditRoom = (item: TContextItem) => onClickEditRoomHelper(item);

  onSaveAsTemplate = (item: TContextItem) => {
    const event: TStoreCustomEvent = new CustomEvent(Events.SAVE_AS_TEMPLATE, {
      detail: {
        parentId: this.selectedFolderStore.id,
        context: "context_menu",
      },
    });
    event.item = item;
    window.dispatchEvent(event);
  };

  onCreateRoomTemplate = (item: TContextItem) => {
    this.filesActionsStore.onCreateRoomFromTemplate(item);
  };

  onOpenTemplateAccessOptions = () => {
    this.dialogsStore.setTemplateAccessSettingsVisible(true);
  };

  // onLoadLinks = async (t, item) => {
  //   const promise = new Promise(async (resolve, reject) => {
  //     let linksArray = [];

  //     this.setLoaderTimer(true);
  //     try {
  //       const links = await this.publicRoomStore.fetchExternalLinks(item.id);

  //       for (let link of links) {
  //         const { id, title, shareLink, disabled, isExpired } = link.sharedTo;

  //         if (!disabled && !isExpired) {
  //           linksArray.push({
  //             icon: InvitationLinkReactSvgUrl,
  //             id,
  //             key: `external-link_${id}`,
  //             label: title,
  //             onClick: () => {
  //               copy(shareLink);
  //               toastr.success(t("Common:LinkCopySuccess"));
  //             },
  //           });
  //         }
  //       }

  //       if (!linksArray.length) {
  //         linksArray = [
  //           {
  //             id: "no-external-links-option",
  //             key: "no-external-links",
  //             label: !links.length
  //               ? t("Files:NoExternalLinks")
  //               : t("Files:AllLinksAreDisabled"),
  //             disableColor: true,
  //           },
  //           !isMobile && {
  //             key: "separator0",
  //             isSeparator: true,
  //           },
  //           {
  //             icon: SettingsReactSvgUrl,
  //             id: "manage-option",
  //             key: "manage-links",
  //             label: t("Common:ManageNotifications"),
  //             onClick: () => this.onShowInfoPanel(item, "info_members"),
  //           },
  //         ];
  //       }

  //       this.setLoaderTimer(false, () => resolve(linksArray));
  //     } catch (error) {
  //       toastr.error(error);
  //       this.setLoaderTimer(false);
  //       return reject(linksArray);
  //     }
  //   });

  //   return promise;
  // };

  onMultiLoadPlugins = (items: TSelectionItem[]): TContextOption[] => {
    if (isAIAgents()) return [];

    const { enablePlugins } = this.settingsStore;

    const pluginItems: TContextOption[] = [];
    this.setLoaderTimer(true);

    if (enablePlugins && this.pluginStore.contextMenuItemsList) {
      this.pluginStore.contextMenuItemsList.forEach((option) => {
        const optionItem = option.value;

        // the original .js returns undefined for unknown
        // entries and passes it through to onGroupClick — the cast below
        // keeps that behavior.
        const resolveItemType = (
          item: TSelectionItem,
        ): "file" | "folder" | "room" | undefined => {
          if (isFileUtil(item)) return "file";
          if (isFolderUtil(item)) return "folder";
          if (isRoomUtil(item)) return "room";
        };

        const processOptionItem = (
          value: IContextMenuItemClient,
        ): TContextOption | undefined => {
          const isEveryItemIncludesOption = items.every(({ contextOptions }) =>
            contextOptions.includes(value.key),
          );

          if (!isEveryItemIncludesOption || !value.isGroupAction) return;

          const groupItems = items.map((item) => ({
            id: item.id,
            itemType: resolveItemType(item),
          })) as TPluginGroupItem[];

          // the original .js called onGroupClick without a
          // presence check — the non-null assertions keep that behavior.
          const onClick = async () => {
            if (value.withActiveItem) {
              const { setActiveFiles } = this.filesStore;

              setActiveFiles(items.map((item) => item.id));

              await value.onGroupClick!(groupItems);

              setActiveFiles([]);
            } else {
              value.onGroupClick!(groupItems);
            }
          };

          const processedOptionValue = {
            key: value.key,
            id: value.key,
            label: value.label,
            icon: value.icon,
            disabled: false,
            onClick,
          };

          return processedOptionValue;
        };

        if (optionItem.items && optionItem.items.length > 0) {
          optionItem.items.forEach((nestedItem) => {
            const processedItem = processOptionItem(nestedItem);
            processedItem && pluginItems.push(processedItem);
          });
        } else {
          const item = processOptionItem(optionItem);
          item && pluginItems.push(item);
        }
      });
    }

    this.setLoaderTimer(false);

    return pluginItems;
  };

  onLoadPlugins = (item: TContextItem): TContextOption[] => {
    if (isAIAgents()) return [];
    // callers always pass an item enriched with
    // contextOptions (see getFilesContextOptions) — the cast keeps the
    // original unchecked access.
    const { contextOptions } = item as TSelectionItem;
    const { enablePlugins } = this.settingsStore;

    const pluginItems: TContextOption[] = [];
    this.setLoaderTimer(true);

    if (enablePlugins && this.pluginStore.contextMenuItemsList) {
      this.pluginStore.contextMenuItemsList.forEach((option) => {
        const processOptionValue = (
          value: IContextMenuItemClient,
        ): TContextOption | null | undefined => {
          if (!contextOptions.includes(value.key) || value.isGroupAction)
            return;

          // the original .js called onClick without a
          // presence check — the non-null assertions keep that behavior.
          const onClick = async () => {
            if (value.withActiveItem) {
              const { setActiveFiles } = this.filesStore;

              setActiveFiles([item.id]);

              await value.onClick!(item.id);

              setActiveFiles([]);
            } else {
              value.onClick!(item.id);
            }
          };

          const processedOptionValue: TContextOption = {
            key: value.key,
            id: value.key,
            label: value.label,
            icon: value.icon,
            onClick,
            placement: value.placement,
          };

          const processedItems: TContextOption[] = [];
          // Recursively process nested items if they exist
          if (value.items && value.items.length > 0) {
            value.items.forEach((nestedItem) => {
              const processedItem = processOptionValue(
                nestedItem as IContextMenuItemClient,
              );
              processedItem && processedItems.push(processedItem);
            });

            if (processedItems.length > 0) {
              processedOptionValue.items = processedItems;
            } else {
              // If we have no processed items, we dont render this option
              return null;
            }
          }

          return processedOptionValue;
        };

        const value = processOptionValue(option.value);

        value && pluginItems.push(value);
      });
    }

    this.setLoaderTimer(false);

    return pluginItems;
  };

  // call sites may pass an undefined roomType which the
  // original .js forwarded as-is to getDefaultAccessUser — the cast keeps
  // that behavior.
  onClickInviteUsers = (roomId: number | string, roomType?: RoomsType) => {
    const { isGracePeriod } = this.currentTariffStatusStore;

    if (isGracePeriod) {
      this.dialogsStore.setQuotaWarningDialogVisible(true);
    } else {
      this.dialogsStore.setInvitePanelOptions({
        visible: true,
        roomId,
        hideSelector: false,
        defaultAccess: getDefaultAccessUser(roomType as RoomsType),
      });
    }
  };

  onClickPin = (
    action: "pin" | "unpin",
    id: number,
    t: TTranslation,
    isAIAgent = false,
  ) => {
    this.filesActionsStore.setPinAction(action, id, t, isAIAgent);
  };

  onClickArchive = (action: "archive" | "unarchive") => {
    const { isWarningRoomsDialog } = this.currentQuotaStore;
    const {
      setArchiveDialogVisible,
      setRestoreRoomDialogVisible,
      setQuotaWarningDialogVisible,
    } = this.dialogsStore;

    if (action === "unarchive" && isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    if (action === "archive") {
      setArchiveDialogVisible(true);
    } else {
      setRestoreRoomDialogVisible(true);
    }
  };

  onAddRoomsToGroup = async (
    roomIds: number[],
    groupId: string,
    t: TTranslation,
    groupName: string,
  ) => {
    try {
      await this.dialogsStore.updateRoomGroup(groupId, {
        roomsToAdd: roomIds,
      });
      await this.dialogsStore.getAllRoomGroups();
      const transProps = {
        t: t as unknown as TFunction,
        values: { groupName },
        components: { 1: React.createElement("strong") },
      };
      const keys = {
        single: { tKey: "GroupingRooms:RoomAddedToGroup" },
        multiple: { tKey: "GroupingRooms:RoomsAddedToGroup" },
      };
      const i18nKey =
        roomIds.length === 1 ? keys.single.tKey : keys.multiple.tKey;
      toastr.success(
        React.createElement(Trans, {
          i18nKey,
          ...transProps,
        }),
      );
    } catch (error) {
      console.error("Error adding rooms to group:", error);
      toastr.error(t("Common:Error"));
    }
  };

  onRemoveRoomsFromGroup = async (roomIds: number[], t: TTranslation) => {
    const currentGroupId = this.filesStore.roomsFilter?.groupId;
    if (!currentGroupId) return;

    const currentGroup = this.dialogsStore.roomGroups?.find(
      (g) => String(g.id) === String(currentGroupId),
    );
    const groupName = currentGroup?.name || "";

    try {
      await this.dialogsStore.updateRoomGroup(currentGroupId, {
        roomsToRemove: roomIds,
      });
      await this.dialogsStore.getAllRoomGroups();

      // Remove the rooms from the current view
      this.filesStore.removeFiles(null, roomIds);

      const transProps = {
        t: t as unknown as TFunction,
        values: { groupName },
        components: { 1: React.createElement("strong") },
      };
      const keys = {
        single: { tKey: "GroupingRooms:RoomRemovedFromGroup" },
        multiple: { tKey: "GroupingRooms:RoomsRemovedFromGroup" },
      };
      const i18nKey =
        roomIds.length === 1 ? keys.single.tKey : keys.multiple.tKey;
      toastr.success(
        React.createElement(Trans, {
          i18nKey,
          ...transProps,
        }),
      );
    } catch (error) {
      console.error("Error removing rooms from group:", error);
      toastr.error(t("Common:Error"));
    }
  };

  onChangeRoomOwner = () => this.dialogsStore.setChangeRoomOwnerIsVisible(true);

  onLeaveRoom = () => {
    this.dialogsStore.setLeaveRoomDialogVisible(true);
  };

  onSelect = (item: TContextItem) => {
    const { onSelectItem } = this.filesActionsStore;

    onSelectItem({ id: item.id, isFolder: item.isFolder }, true, false);
  };

  onClickMute = (
    action: "mute" | "unmute",
    item: TContextItem,
    t: TTranslation,
  ) => {
    this.filesActionsStore.setMuteAction(action, item, t);
  };

  onExportRoomIndex = (t: TTranslation, roomId: number) => {
    this.filesActionsStore.exportRoomIndex(t, roomId);
  };

  onEditIndex = () => {
    this.indexingStore.setIsIndexEditingMode(true);
  };

  // call sites may pass an undefined roomType which the
  // original .js forwarded as-is (getGuidanceConfig then returns []) — the
  // cast keeps that behavior.
  onEnableFormFillingGuid = (t: TTranslation, roomType?: RoomsType) => {
    const guidanceConfig = getGuidanceConfig(roomType as RoomsType, t);

    if (!guidanceConfig) {
      return;
    }

    this.guidanceStore.setConfig(guidanceConfig);
    this.dialogsStore.setWelcomeFormFillingTipsVisible(true);
  };

  onClickRemoveFromRecent = (item: TContextItem, t: TTranslation) => {
    this.filesActionsStore.removeFilesFromRecent([item.id], t);
  };

  setLoaderTimer = (isLoading: boolean, cb?: VoidFunction) => {
    if (isLoading) {
      loadingTime = new Date();

      return (timer = setTimeout(() => {
        this.linksIsLoading = true;
      }, LOADER_TIMER));
    }
    if (loadingTime) {
      const currentDate = new Date();

      let ms = Math.abs(loadingTime.getTime() - currentDate.getTime());

      if (timer) {
        ms = Math.abs(ms - LOADER_TIMER);

        clearTimeout(timer);
        timer = null;
      }

      if (ms < LOADER_TIMER) {
        return setTimeout(() => {
          this.linksIsLoading = true;
          loadingTime = null;
          cb && cb();
        }, LOADER_TIMER - ms);
      }
    }

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    loadingTime = null;
    this.linksIsLoading = false;
    cb && cb();
  };

  // some call sites pass `navigate` which the original .js
  // silently ignored — the optional parameter keeps those calls type-correct
  // without changing runtime behavior.
  onCreateTemplate = async (_navigate?: unknown) => {
    this.oformsStore.setIsVisibleInfoPanelTemplateGallery(false);

    const extension = this.oformsStore.currentExtensionGallery.replace(".", "");

    const event: TStoreCustomEvent = new CustomEvent(Events.CREATE, {
      detail: {
        parentId: this.selectedFolderStore.id,
        context: "template",
        extension,
      },
    });

    const payload = {
      extension,
      id: -1,
      fromTemplate: true,
      // the original .js assumed a selected gallery template
      // here (crashed on null) — the non-null assertion keeps that behavior.
      title: this.oformsStore.gallerySelected!.attributes.name_form,
      openEditor: true,
      edit: true,
    };

    event.payload = payload;

    window.dispatchEvent(event);
  };

  onShowOformTemplateInfo = (item: TOformFile) => {
    showInfoPanel();
    this.oformsStore.setGallerySelected(item);
  };

  // the Gallery ItemTitle consumer passes either a full
  // TOformFile or a minimal { attributes } shape (and forwards it as-is);
  // the casts below keep the original unchecked usage.
  getFormGalleryContextOptions = (
    item: TOformFile | { attributes: { name_form: string } } | null,
    t: TTranslation,
    navigate?: unknown,
  ): ContextMenuModel[] => {
    return [
      {
        key: "create",
        label: t("Common:Create"),
        onClick: () => this.onCreateTemplate(navigate),
      },
      {
        key: "template-info",
        label: t("FormGallery:TemplateInfo"),
        onClick: () => this.onShowOformTemplateInfo(item as TOformFile),
      },
      {
        key: "separator",
        isSeparator: true,
      },
      {
        key: "suggest-changes",
        label: t("FormGallery:SuggestChanges"),
        onClick: () => onSuggestOformChanges(item as TOformFile),
      },
    ];
  };

  getRoomsRootContextOptions = (
    item: TContextItem,
    t: TTranslation,
  ): { pinOptions: TContextOption[]; muteOptions: TContextOption[] } => {
    const { id, rootFolderId } = this.selectedFolderStore;
    const isRootRoom = item.isRoom && rootFolderId === id;

    if (!isRootRoom) return { pinOptions: [], muteOptions: [] };

    const pinOptions = [
      {
        id: "option_pin-room",
        key: "pin-room",
        label: t("Common:PinToTop"),
        icon: PinReactSvgUrl,
        onClick: () => this.onClickPin("pin", item.id, t, item.isAIAgent),
        disabled:
          this.publicRoomStore.isPublicRoom ||
          Boolean(item.external && item.isLinkExpired),
      },
      {
        id: "option_unpin-room",
        key: "unpin-room",
        label: t("Common:Unpin"),
        icon: UnpinReactSvgUrl,
        onClick: () => this.onClickPin("unpin", item.id, t, item.isAIAgent),
        disabled:
          this.publicRoomStore.isPublicRoom ||
          Boolean(item.external && item.isLinkExpired),
      },
    ];

    const canMute =
      item.security?.Mute && !this.publicRoomStore.isPublicRoom && item.inRoom;

    const muteOptions = [
      {
        id: "option_unmute-room",
        key: "unmute-room",
        label: t("Common:EnableNotifications"),
        icon: UnmuteReactSvgUrl,
        onClick: () => this.onClickMute("unmute", item, t),
        disabled: !canMute,
      },
      {
        id: "option_mute-room",
        key: "mute-room",
        label: t("Common:DisableNotifications"),
        icon: MuteReactSvgUrl,
        onClick: () => this.onClickMute("mute", item, t),
        disabled: !canMute,
      },
    ];

    return { pinOptions, muteOptions };
  };

  onEmptyTrashAction = () => {
    const { activeFiles, activeFolders } = this.filesStore;
    const isExistActiveItems = [...activeFiles, ...activeFolders].length > 0;

    if (isExistActiveItems || this.filesActionsStore.emptyTrashInProgress)
      return;

    this.dialogsStore.setEmptyTrashDialogVisible(true);
  };

  onEmptyPersonalAction = () => {
    if (this.filesActionsStore.emptyPersonalRoomInProgress) return;

    this.dialogsStore.setEmptyTrashDialogVisible(true);
  };

  onRestoreAllAction = () => {
    const { activeFiles, activeFolders } = this.filesStore;
    const isExistActiveItems = [...activeFiles, ...activeFolders].length > 0;

    if (isExistActiveItems) return;

    this.dialogsStore.setRestoreAllPanelVisible(true);
  };

  onRestoreAllArchiveAction = () => {
    const { activeFiles, activeFolders } = this.filesStore;
    const {
      setQuotaWarningDialogVisible,
      setRestoreAllArchive,
      setRestoreRoomDialogVisible,
    } = this.dialogsStore;

    const isExistActiveItems = [...activeFiles, ...activeFolders].length > 0;

    if (isExistActiveItems) return;

    if (this.currentQuotaStore.isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    setRestoreAllArchive(true);
    setRestoreRoomDialogVisible(true);
  };

  onDownloadAllAction = () => {
    const { getSelectedFolder } = this.selectedFolderStore;
    const { downloadAction } = this.filesActionsStore;

    const selectedFolder = getSelectedFolder();

    downloadAction("", selectedFolder).catch((err: unknown) =>
      toastr.error(err as string),
    );
  };

  onSyncXlsxData = async (item: TContextItem, t: TTranslation) => {
    const { clearSecondaryProgressData, setSecondaryProgressBarData } =
      this.filesActionsStore.uploadDataStore.secondaryProgressDataStore;

    try {
      const response = await XlsxUpdateService.start(item.id, isFolder(item));

      if (!response) return;

      const { form, task, isNewFile } = response;

      if (task.isCompleted) {
        XlsxUpdateService.assertTaskSucceeded(task);
      } else {
        const basePayload = {
          operationId: task.id,
          operation: OPERATIONS_NAME.other,
        };

        setSecondaryProgressBarData({ ...basePayload, percent: 0 });

        await XlsxUpdateService.poll(form.id, task.id, (progress) => {
          setSecondaryProgressBarData({
            ...basePayload,
            percent: progress?.percentage ?? 100,
            completed: progress?.isCompleted ?? true,
          });
        }).catch((error) => {
          clearSecondaryProgressData(task.id, OPERATIONS_NAME.other);
          throw error;
        });
      }

      const messageVar = { formName: form.title };

      toastr.success(
        isNewFile
          ? t("Common:SpreadsheetGenerated", messageVar)
          : t("Common:SpreadsheetUpdated", messageVar),
      );
    } catch (error) {
      toastr.error(error as string);
      console.error(error);
    }
  };

  getHeaderOptions = (
    t: TTranslation,
    item: TContextItem,
  ): ContextMenuModel[] => {
    const {
      isRecycleBinFolder,
      isArchiveFolder,
      isTemplatesFolder,
      isPersonalReadOnly,
    } = this.treeFoldersStore;
    const { roomsForDelete, roomsForRestore } = this.filesStore;

    const canRestoreAll = roomsForRestore.length > 0;
    const canDeleteAll = roomsForDelete.length > 0;

    if (this.publicRoomStore.isPublicRoom) {
      return [
        {
          key: "public-room_share",
          label: t("Common:CopySharedLink"),
          icon: TabletLinkReactSvgUrl,
          onClick: () => {
            copy(window.location.href);
            toastr.success(t("Common:LinkCopySuccess"));
          },
          disabled: this.settingsStore.isFrame,
        },
        {
          key: "separator0",
          isSeparator: true,
          disabled: !item.security?.Download || this.settingsStore.isFrame,
        },
        {
          key: "public-room_edit",
          label: t("Common:Download"),
          icon: DownloadReactSvgUrl,
          onClick: () => {
            this.onClickDownload(item, t);
          },
          disabled: !item.security?.Download,
        },
      ];
    }

    if (isRecycleBinFolder) {
      return [
        {
          id: "header_option_empty-trash",
          key: "empty-trash",
          label: t("Common:EmptySection", {
            sectionName: t("Common:TrashSection"),
          }),
          onClick: this.onEmptyTrashAction,
          icon: ClearTrashReactSvgUrl,
          disabled: false,
        },
        {
          id: "header_option_restore-all",
          key: "restore-all",
          label: t("Common:RestoreAll"),
          onClick: this.onRestoreAllAction,
          icon: MoveReactSvgUrl,
          disabled: false,
        },
      ];
    }

    if (isArchiveFolder) {
      return [
        {
          id: "header_option_empty-archive",
          key: "empty-archive",
          label: t("ArchiveAction"),
          onClick: this.onEmptyTrashAction,
          disabled: !canDeleteAll,
          icon: ClearTrashReactSvgUrl,
        },
        {
          id: "header_option_restore-all",
          key: "restore-all",
          label: t("Common:RestoreAll"),
          onClick: this.onRestoreAllArchiveAction,
          disabled: !canRestoreAll,
          icon: MoveReactSvgUrl,
        },
      ];
    }

    if (isTemplatesFolder) {
      return [];
    }

    if (isPersonalReadOnly) {
      return [
        {
          id: "header_option_download-all",
          key: "download-all",
          label: t("Files:DownloadAll"),
          onClick: this.onDownloadAllAction,
          icon: MoveReactSvgUrl,
          disabled: false,
        },
        {
          id: "header_option_empty-section",
          key: "empty-section",
          label: t("Common:EmptySection", {
            sectionName: t("Common:Files"),
          }),
          onClick: this.onEmptyPersonalAction,
          icon: ClearTrashReactSvgUrl,
          disabled: false,
        },
      ];
    }

    return this.getFilesContextOptions(item, t, false, true);
  };

  handleCopyPrimaryLink = async (item: TContextItem, t: TTranslation) => {
    if (!item.canShare) return;

    const primaryLink = await ShareLinkService.getPrimaryLink(
      item as TFile | TFolder | TRoom,
    );

    if (primaryLink) {
      if (primaryLink.sharedTo?.isExpired) {
        toastr.error(t("Common:LinkExpired"));
        return;
      }

      if (
        this.filesSettingsStore.isLinkBlockedByAdmin(
          item as { rootFolderType: FolderType },
          primaryLink,
        )
      ) {
        toastr.error(t("Common:LinkBlockedByAdminWarning"));
        return;
      }

      copyShareLink(
        item as TFile | TFolder | TRoom,
        primaryLink,
        t as unknown as TFunction,
        this.getManageLinkOptions(item),
      );
      this.infoPanelStore?.setShareChanged(true);

      if (item.isRoom || !item.isFolder) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: item.isRoom
            ? AnalyticsEvents.RoomShared
            : AnalyticsEvents.FileShared,
          id: item.id,
          parentId: item.isRoom ? item.parentId : item.folderId,
        });
      }
    }
  };

  getManageLinkOptions = (item: TContextItem) => {
    const isRoom = isRoomUtil(item);

    const openTab = () => {
      if (isRoom) return openMembersTab();

      openShareTab();
    };

    const infoView = isRoom
      ? this.infoPanelStore.roomsView
      : this.infoPanelStore.fileView;

    const { infoPanelSelection } = this.infoPanelStore;

    // canShowManageLink expects TFile | TFolder while items
    // here are .js view-models — the casts keep the original unchecked call.
    return {
      canShowLink: canShowManageLink(
        item as TFile | TFolder,
        infoPanelSelection as TFile | TFolder | null,
        getInfoPanelOpen(),
        infoView,
      ),
      onClickLink: () => {
        this.filesStore.setSelection([]);
        this.filesStore.setBufferSelection(item);
        openTab();
      },
    };
  };

  _resolveRoom = async (): Promise<TContextItem | null> => {
    const { infoPanelRoom } = this.infoPanelStore;
    const selectedFolder = this.selectedFolderStore.getSelectedFolder();

    // rooms resolved here are TRoom/TSelectedFolder shapes
    // consumed as .js view-models — the casts keep the original duck typing.
    if (infoPanelRoom) return infoPanelRoom as unknown as TContextItem;
    if (selectedFolder.isRoom) return selectedFolder as unknown as TContextItem;

    const roomPath = selectedFolder.pathParts.find((path) => path.roomType);
    if (!roomPath) return null;

    const [room = null] = this.filesStore.getFilesListItems([
      await getRoomInfo(roomPath.id),
    ]);
    return room;
  };

  _syncInfoPanelRoom = (newRoom: TRoom) => {
    const { infoPanelStore } = this;
    if (infoPanelStore.isVisible && infoPanelStore.isDetailsTabActive) {
      infoPanelStore.setInfoPanelRoom(newRoom);
    }
  };

  askAI = async (item: TContextItem) => {
    const skipAi = getPersisted(PersistenceKeys.skipAiModal, false);

    if (item.parentRoomType !== FolderType.FormRoom || skipAi) {
      this.filesActionsStore.askAIAction(item);
      return;
    }

    const { addActiveItems } = this.filesStore;
    const { clearActiveOperations } = this.uploadDataStore;
    const { endLoader, startLoader } = createLoader();

    try {
      startLoader(() => addActiveItems([item.id], null));

      const room = await this._resolveRoom();
      if (!room) return;

      if (room.sendFormToExternalDB || !room.security?.EditRoom) {
        this.filesActionsStore.askAIAction(item);
        return;
      }

      this.dialogsStore.setAskAIConnectDialogVisible(true, (action) => {
        if (action === "connect") {
          onEditRoomTemplate(room, this._syncInfoPanelRoom);
        } else if (action === "continue") {
          this.filesActionsStore.askAIAction(item);
        }
      });
    } catch (error) {
      toastr.error(error as string);
    } finally {
      endLoader(() => clearActiveOperations([item.id]));
    }
  };

  getFilesContextOptions = (
    item: TContextItem,
    t: TTranslation,
    isInfoPanel?: boolean,
    isHeader?: boolean,
  ): ContextMenuModel[] =>
    getFilesContextOptionsImpl(this, item, t, isInfoPanel, isHeader);

  getGroupContextOptions = (t: TTranslation): ContextMenuModel[] => {
    const { selection, allFilesIsEditing, canConvertSelected } =
      this.filesStore;
    const { setDeleteDialogVisible } = this.dialogsStore;
    const {
      isRecycleBinFolder,
      isRoomsFolder,
      isArchiveFolder,
      isAIAgentsFolder,
      isFormsFolder,
    } = this.treeFoldersStore;

    const { pinRooms, unpinRooms, deleteRooms } = this.filesActionsStore;

    if (isRoomsFolder || isArchiveFolder || isAIAgentsFolder || isFormsFolder) {
      const isPinOption = selection.filter((item) => !item.pinned).length > 0;

      let canDelete: boolean | undefined;
      if (isRoomsFolder || isFormsFolder) {
        canDelete = selection.every((k) => k.contextOptions.includes("delete"));
      } else if (isArchiveFolder) {
        canDelete = selection.some((k) => k.contextOptions.includes("delete"));
      }

      const canArchiveRoom = selection.every((k) =>
        k.contextOptions.includes("archive-room"),
      );

      const canRestoreRoom = selection.some((k) =>
        k.contextOptions.includes("unarchive-room"),
      );

      let archiveOptions: TContextOption | undefined;

      const pinOption = isPinOption
        ? {
            key: "pin-room",
            label: t("Common:PinToTop"),
            icon: PinReactSvgUrl,
            onClick: () => pinRooms(t),
            disabled: false,
          }
        : {
            key: "unpin-room",
            label: t("Common:Unpin"),
            icon: UnpinReactSvgUrl,
            onClick: () => unpinRooms(t),
            disabled: false,
          };

      if (canArchiveRoom) {
        archiveOptions = {
          key: "archive-room",
          label: t("Common:MoveToArchive"),
          icon: RoomArchiveSvgUrl,
          onClick: (_e?: unknown) => this.onClickArchive("archive"),
          disabled: false,
        };
      }
      if (canRestoreRoom) {
        archiveOptions = {
          key: "unarchive-room",
          label: t("Common:Restore"),
          icon: MoveReactSvgUrl,
          onClick: () => this.onClickArchive("unarchive"),
          disabled: false,
        };
      }

      const options: TContextOption[] = [];

      if (!isArchiveFolder) {
        options.push(pinOption);
      }

      const { organizeRoomsGrouping } = this.filesSettingsStore;
      const { setEditRoomGroupsDialogVisible, roomGroups } = this.dialogsStore;

      if (organizeRoomsGrouping && !isArchiveFolder && !isAIAgentsFolder) {
        const roomIds = selection.map((room) => room.id);
        options.push({
          key: "create-group",
          label: t("GroupingRooms:CreateAGroup"),
          icon: CreateGroupReactSvgUrl,
          onClick: () => setEditRoomGroupsDialogVisible(true, roomIds),
          disabled: false,
        });

        if (roomGroups && roomGroups.length > 0) {
          options.push({
            key: "add-to-group",
            label: t("GroupingRooms:AddToGroup"),
            icon: AddToGroupReactSvgUrl,
            items: roomGroups.map((group) => {
              let groupIcon = CreateGroupReactSvgUrl;
              if (typeof group.icon === "string" && group.icon) {
                groupIcon = group.icon;
              } else if (
                typeof group.icon === "object" &&
                group.icon?.data?.small
              ) {
                groupIcon = `data:image/svg+xml;utf8,${encodeURIComponent(group.icon.data.small)}`;
              }
              return {
                id: `option_add-to-group-${group.id}`,
                key: `add-to-group-${group.id}`,
                label: group.name,
                icon: groupIcon,
                onClick: () =>
                  this.onAddRoomsToGroup(roomIds, group.id, t, group.name),
              };
            }),
            disabled: false,
          });

          const currentGroupId = this.filesStore.roomsFilter?.groupId;
          if (currentGroupId) {
            options.push({
              key: "remove-from-group",
              label: t("GroupingRooms:RemoveFromGroup"),
              icon: RemoveOutlineSvgUrl,
              onClick: () => this.onRemoveRoomsFromGroup(roomIds, t),
              disabled: false,
            });
          }
        }
      }

      if ((canArchiveRoom || canDelete) && !isArchiveFolder) {
        options.push({
          key: "separator0",
          isSeparator: true,
        });
      }

      const pluginOptions = this.onMultiLoadPlugins(selection);

      if (archiveOptions) options.push(archiveOptions);
      options.push(...pluginOptions);

      canDelete &&
        options.push({
          key: "delete-rooms",
          label: t("Common:Delete"),
          icon: TrashReactSvgUrl,
          onClick: () => deleteRooms(t),
        });

      return options as ContextMenuModel[];
    }

    const hasDownloadAccess =
      selection.findIndex((k) => k.security.Download) !== -1;

    /* const favoriteItems = selection.filter((k) =>
      k.contextOptions?.includes("mark-as-favorite"),
    ); */

    const canMove = selection.every((k) =>
      k.contextOptions.includes("move-to"),
    );

    const copyItems = selection.filter((k) =>
      k.contextOptions.includes("copy-to"),
    ).length;

    const restoreItems = selection.filter((k) =>
      k.contextOptions.includes("restore"),
    ).length;

    const canRetryVectorization = selection.some(
      (k) => k.security?.Vectorization,
    );

    /* const removeFromFavoriteItems = selection.filter((k) =>
      k.contextOptions.includes("remove-from-favorites"),
    ); */

    const deleteItems = selection.filter((k) =>
      k.contextOptions.includes("delete"),
    ).length;

    const isRootThirdPartyFolder = selection.some(
      (x) => x.providerKey && x.id === x.rootFolderId,
    );

    const canCreateRoom = selection.some((k) => k.security?.CreateRoomFrom);

    const options: TContextOption[] = [
      /* {
        key: "mark-as-favorite",
        label: t("Common:MarkAsFavorite"),
        icon: FavoritesReactSvgUrl,
        onClick: (e) => this.onClickFavorite("mark", favoriteItems, t),
        disabled: !favoriteItems.length,
      }, */
      {
        id: "create_room",
        key: "create-room",
        label: t("Common:CreateRoom"),
        icon: CatalogRoomsReactSvgUrl,
        onClick: () => this.onCreateRoom(null, true),
        disabled: !canCreateRoom,
      },
      {
        key: "vectorization",
        label: t("Common:Vectorization"),
        icon: RefreshReactSvgUrl,
        onClick: () => this.filesActionsStore.retryVectorization(selection),
        disabled: !canRetryVectorization,
      },
      {
        key: "download",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () =>
          this.filesActionsStore
            .downloadAction(t("Common:ArchivingData"))
            .catch((err: unknown) => toastr.error(err as string)),
        disabled: !hasDownloadAccess,
      },
      {
        key: "download-as",
        label: t("Common:DownloadAs"),
        icon: DownloadAsReactSvgUrl,
        onClick: this.onClickDownloadAs,
        disabled: !hasDownloadAccess || !canConvertSelected,
      },
      {
        key: "move-to",
        label: t("Common:MoveTo"),
        icon: MoveReactSvgUrl,
        onClick: allFilesIsEditing
          ? () => onShowEditingToast(t)
          : this.onMoveAction,
        disabled: isRecycleBinFolder || !canMove,
      },
      {
        key: "copy-to",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        onClick: this.onCopyAction,
        disabled: isRecycleBinFolder || !copyItems,
      },
      {
        key: "restore",
        label: t("Common:Restore"),
        icon: MoveReactSvgUrl,
        onClick: this.onRestoreAction,
        disabled: !isRecycleBinFolder || !restoreItems,
      },
      {
        key: "separator1",
        isSeparator: true,
        disabled: !deleteItems || isRootThirdPartyFolder,
      },
      {
        key: "remove-from-recent",
        label: t("Common:RemoveFromList"),
        icon: RemoveOutlineSvgUrl,
        onClick: () =>
          this.filesActionsStore.onClickRemoveFromRecent(selection, t),
        disabled: !this.treeFoldersStore.isRecentFolder,
      },
      /* {
        key: "remove-from-favorites",
        label: t("Common:RemoveFromFavorites"),
        icon: FavoritesFillReactSvgUrl,
        onClick: (e) => this.onClickFavorite("remove", removeFromFavoriteItems, t),
        disabled: favoriteItems.length || !removeFromFavoriteItems.length,
      }, */
      {
        key: "delete",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: allFilesIsEditing
          ? () => onShowEditingToast(t)
          : () => {
              if (this.filesSettingsStore.confirmDelete) {
                setDeleteDialogVisible(true);
              } else {
                const translations = {
                  deleteFromTrash: t("Translations:TrashItemsDeleteSuccess", {
                    sectionName: t("Common:TrashSection"),
                  }),
                };

                this.filesActionsStore
                  .deleteAction(translations)
                  .catch((err: unknown) => toastr.error(err as string));
              }
            },
        disabled: !deleteItems || isRootThirdPartyFolder,
      },
    ];

    const { isCollaborator } = this.userStore?.user || {
      isCollaborator: false,
    };

    const pluginOptions = this.onMultiLoadPlugins(selection);

    options.splice(1, 0, ...pluginOptions);

    const newOptions = options.filter(
      (option, index) =>
        !(index === 0 && option.key === "separator1") &&
        !(isCollaborator && option.key === "create-room"),
    );

    return newOptions as ContextMenuModel[];
  };

  onCreateRoom = (item?: TContextItem | null, fromItem?: boolean) => {
    if (this.currentQuotaStore.isWarningRoomsDialog) {
      this.dialogsStore.setQuotaWarningDialogVisible(true);
      return;
    }

    if (fromItem) {
      this.filesActionsStore.setProcessCreatingRoomFromData(true);
    }

    const event: TStoreCustomEvent = new CustomEvent(Events.ROOM_CREATE, {
      detail: {
        parentId: this.selectedFolderStore.id,
        context: "context_menu",
      },
    });

    if (item && item.isFolder) {
      event.title = item.title;
    }

    if (!fromItem && window.location.pathname.startsWith("/forms")) {
      event.payload = { isFormsCreate: true };
    }

    window.dispatchEvent(event);
  };

  onCreateAgent = () => {
    // TODO: AI: Add quota if it needed

    // if (this.currentQuotaStore.isWarningRoomsDialog) {
    //   this.dialogsStore.setQuotaWarningDialogVisible(true);
    //   return;
    // }

    const event = new CustomEvent(Events.AGENT_CREATE, {
      detail: {
        parentId: this.selectedFolderStore.id,
        context: "context_menu",
      },
    });

    window.dispatchEvent(event);
  };

  // `t` is omitted by non-PDF call sites; the original .js
  // only dereferences it in the mobile-PDF branch where it is always passed —
  // the non-null assertion keeps that behavior.
  onCreate = (format?: FileExtensions | string, t?: TTranslation) => {
    const isPDf = format === FileExtensions.PDF;

    if (isMobile && isPDf) {
      toastr.info(t!("Common:MobileEditPdfNotAvailableInfo"));
      return;
    }

    const event: TStoreCustomEvent = new CustomEvent(Events.CREATE, {
      detail: {
        parentId: this.selectedFolderStore.id,
        context: "context_menu",
        extension: format,
      },
    });

    const payload = {
      extension: format,
      id: -1,
      edit: isPDf,
    };

    event.payload = payload;

    window.dispatchEvent(event);
  };

  onCreateFormFromFile = (t: TTranslation) => {
    if (isMobile) {
      toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
      return;
    }

    this.dialogsStore.setSelectFileDialogVisible(true);
  };

  onShowTemplateGallery = () => {
    this.oformsStore.setTemplateGalleryVisible(true);
    // the original .js passed a possibly-null selected folder
    // id through unchecked — the non-null assertion keeps that behavior.
    this.oformsStore.setOformFromFolderId(this.selectedFolderStore.id!);
  };

  // TODO: add privacy room check for files
  onShowFormRoomSelectFileDialog = (
    filter:
      FilesSelectorFilterTypes | FilterType = FilesSelectorFilterTypes.DOCX,
  ) => {
    this.dialogsStore.setSelectFileFormRoomDialogVisible(true, filter, true);
  };

  onShowAiKnowledgeSelectFileDialog = () => {
    this.dialogsStore.setSelectFileAiKnowledgeDialogVisible(true);
  };

  getContextOptionsPlusFormRoom = (
    t: TTranslation,
    {
      formActions,
      templateGallery,
      createNewFolder,
    }: {
      formActions: TContextOption[];
      templateGallery: TContextOption[];
      createNewFolder: TContextOption;
    },
  ) => {
    const uploadReadyPDFFrom: TContextOption = {
      id: "personal_upload-ready-Pdf-from",
      className: "main-button_drop-down_sub",
      icon: ActionsUploadReactSvgUrl,
      label: t("Common:UploadPDFForm"),
      key: "personal_upload-ready-Pdf-from",
      items: [
        {
          id: "personal_upload-from-docspace",
          className: "main-button_drop-down",
          icon: ActionsUploadReactSvgUrl,
          label: t("Common:FromPortal", {
            productName: getBrandName("ProductName"),
          }),
          key: "personal_upload-from-docspace",
          onClick: () =>
            this.onShowFormRoomSelectFileDialog(FilterType.PDFForm),
        },
        {
          id: "personal_upload-from-device",
          className: "main-button_drop-down",
          icon: ActionsUploadReactSvgUrl,
          label: t("Common:FromDevice"),
          key: "personal_upload-from-device",
          onClick: () => onUploadAction("pdf"),
        },
      ],
    };

    return [
      ...formActions,
      createNewFolder,
      ...templateGallery,
      {
        isSeparator: true,
        key: "separator-1",
      },
      uploadReadyPDFFrom,
    ];
  };

  getFolderModel = (t: TTranslation, isSectionMenu?: boolean) => {
    const { isLoading } = this.clientLoadingStore;
    const { security, roomType, parentRoomType, isFolder, isAIRoom } =
      this.selectedFolderStore;
    const { isPublicRoom } = this.publicRoomStore;

    // Window["DocSpace"]["location"]["state"] is declared as
    // `unknown` in shared types — the cast mirrors the original .js access.
    const stateCanCreate = (
      window?.DocSpace?.location?.state as { canCreate?: boolean } | undefined
    )?.canCreate;
    const isSettingsPage =
      window?.DocSpace?.location.pathname.includes("/settings");

    const currentCanCreate =
      isLoading &&
      hasOwnProperty(window?.DocSpace?.location?.state, "canCreate")
        ? stateCanCreate
        : security?.Create;

    const canCreate = currentCanCreate && !isSettingsPage && !isPublicRoom;

    const someDialogIsOpen = checkDialogsOpen();

    if (!canCreate || (isSectionMenu && (isMobile || someDialogIsOpen)))
      return null;

    const {
      isRoomsFolder,
      isPrivacyFolder,
      isFlowsFolder,
      isAIAgentsFolder,
      isFormsFolder,
    } = this.treeFoldersStore;
    const { mainButtonItemsList } = this.pluginStore;
    const { enablePlugins, templateGalleryAvailable } = this.settingsStore;
    const isFormRoomType =
      roomType === RoomsType.FormRoom ||
      (parentRoomType === FolderType.FormRoom && isFolder);

    const createNewDoc: TContextOption = {
      id: "personal_new-document",
      key: "new-document",
      label: t("Common:NewDocument"),
      onClick: () => this.onCreate("docx"),
      icon: ActionsDocumentsReactSvgUrl,
    };

    const createNewSpreadsheet = {
      id: "personal_new-spreadsheet",
      key: "new-spreadsheet",
      label: t("Common:NewSpreadsheet"),
      onClick: () => this.onCreate("xlsx"),
      icon: SpreadsheetReactSvgUrl,
    };

    const createNewPresentation = {
      id: "personal_new-presentation",
      key: "new-presentation",
      label: t("Common:NewPresentation"),
      onClick: () => this.onCreate("pptx"),
      icon: ActionsPresentationReactSvgUrl,
    };

    const createTemplateForm = {
      id: "personal_template_black",
      key: "new-form",
      label: t("Translations:SubNewForm"),
      icon: FormBlankReactSvgUrl,
      onClick: () => this.onCreate("pdf", t),
    };

    const createTemplateNewFormFile = {
      id: "personal_template_new-form-file",
      key: "new-form-file",
      label: t("Translations:SubNewFormFile"),
      icon: FormFileReactSvgUrl,
      onClick: () => this.onCreateFormFromFile(t),
      disabled: isPrivacyFolder,
    };

    // const createTemplateSelectFormFile = {
    //   id: "personal_template_new-form-file",
    //   key: "new-form-file",
    //   label: t("Translations:SubNewFormFile"),
    //   icon: FormFileReactSvgUrl,
    //   onClick: () => this.onCreateFormFromFile(t),
    //   disabled: isPrivacyFolder,
    // };

    const createNewFolder: TContextOption = {
      id: "personal_new-folder",
      key: "new-folder",
      label: t("Common:NewFolder"),
      onClick: () => this.onCreate(),
      icon: CatalogFolderReactSvgUrl,
    };

    const uploadFiles = {
      key: "upload-files",
      label: t("Common:UploadFiles"),
      onClick: () => onUploadAction("file"),
      icon: ActionsUploadReactSvgUrl,
    };

    const uploadFolder = {
      key: "upload-folder",
      label: t("Common:UploadFolder"),
      onClick: () => onUploadAction("folder"),
      icon: ActionsUploadReactSvgUrl,
    };

    const templateGallery: TContextOption[] = templateGalleryAvailable
      ? [
          { key: "separator", isSeparator: true },
          {
            key: "template-gallery",
            label: t("Common:TemplateGallery"),
            onClick: () => this.onShowTemplateGallery(),
            icon: TemplateGalleryReactSvgUrl,
          },
        ]
      : [];

    const formActions = [
      {
        id: "personal_form-template",
        icon: FormReactSvgUrl,
        label: t("Translations:NewForm"),
        key: "new-form-base",
        items: [createTemplateForm, createTemplateNewFormFile],
      },
    ];

    if (isFormRoomType) {
      return this.getContextOptionsPlusFormRoom(t, {
        formActions,
        templateGallery,
        createNewFolder,
      });
    }

    if (isAIRoom) {
      return [
        {
          id: "actions_upload-files-product",
          className: "main-button_drop-down",
          icon: MoveReactSvgUrl,
          label: t("EmptyView:UploadFromPortalTitle", {
            productName: getBrandName("ProductName"),
          }),
          onClick: this.onShowAiKnowledgeSelectFileDialog,
          key: "upload-files-product",
        },
        {
          id: "actions_upload-files",
          className: "main-button_drop-down",
          icon: ActionsUploadReactSvgUrl,
          label: t("EmptyView:UploadDeviceOptionTitle"),
          onClick: () => onUploadAction("file"),
          key: "upload-files",
        },
      ];
    }

    const showUploadFolder = !(isMobile || isTablet);

    const privateFolderActions = [
      createNewFolder,
      { key: "separator", isSeparator: true },
      uploadFiles,
    ];

    const options: (TContextOption | null)[] = isAIAgentsFolder
      ? [
          {
            key: "new-agent",
            label: t("Common:NewAgent"),
            onClick: this.onCreateAgent,
            icon: CatalogAIAgentsReactSvgUrl,
          },
        ]
      : isFormsFolder
        ? [
            {
              key: "create-form-set",
              label: t("Common:CreateFormSet"),
              onClick: this.onCreateRoom,
              icon: CatalogRoomsReactSvgUrl,
            },
            {
              key: "template-gallery",
              label: t("Common:TemplateGallery"),
              onClick: () => this.onShowTemplateGallery(),
              icon: TemplateGalleryReactSvgUrl,
            },
          ]
        : isRoomsFolder
          ? isFlowsFolder
            ? []
            : [
                {
                  key: "new-room",
                  label: t("Common:NewRoom"),
                  onClick: this.onCreateRoom,
                  icon: CatalogRoomsReactSvgUrl,
                },
              ]
          : isPrivacyFolder
            ? privateFolderActions
            : [
                createNewDoc,
                createNewSpreadsheet,
                createNewPresentation,
                ...formActions,
                createNewFolder,
                ...templateGallery,
                { key: "separator", isSeparator: true },
                uploadFiles,
                showUploadFolder ? uploadFolder : null,
              ];
    if (
      !isAIAgents() &&
      mainButtonItemsList &&
      enablePlugins &&
      !isRoomsFolder &&
      !isFormsFolder &&
      !isPrivacyFolder
    ) {
      const pluginItems: TContextOption[] = [];

      mainButtonItemsList.forEach((option) => {
        // identical to the original `{ key, ...value }` spread
        // (value.key wins) — Object.assign avoids TS2783 on the literal.
        pluginItems.push(
          Object.assign({ key: option.key }, option.value) as TContextOption,
        );
      });

      options.splice(5, 0, {
        id: "actions_more-plugins",
        className: "main-button_drop-down",
        icon: PluginMoreReactSvgUrl,
        label: t("Common:More"),
        disabled: false,
        key: "more-plugins",
        items: pluginItems,
      });
    }

    return options;
  };

  getModel = (item: TContextItem, t: TTranslation) => {
    const { selection } = this.filesStore;

    const { contextOptions } = item;

    const contextOptionsProps =
      contextOptions && contextOptions.length > 0
        ? selection.length > 1
          ? this.getGroupContextOptions(t)
          : this.getFilesContextOptions(item, t)
        : [];

    return contextOptionsProps;
  };
}

export default ContextOptionsStore;

