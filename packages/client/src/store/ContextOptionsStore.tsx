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
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import { makeAutoObservable, runInAction } from "mobx";
import copy from "copy-to-clipboard";
import { isMobile } from "react-device-detect";
import { Trans } from "react-i18next";
import type { TFunction } from "i18next";
import { toastr } from "@docspace/ui-kit/components/toast";
import type {
  ContextMenuModel,
} from "@docspace/ui-kit/components/context-menu";
import type { TTranslation } from "@docspace/shared/types";
import type {
  TFile,
  TFileLink,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TOformFile } from "@docspace/shared/api/oforms/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type {
  CurrentQuotasStore,
} from "@docspace/shared/store/CurrentQuotaStore";
import type {
  CurrentTariffStatusStore,
} from "@docspace/shared/store/CurrentTariffStatusStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import { isLockedSharedRoom } from "@docspace/shared/utils";
import {
  getDefaultAccessUser,
} from "@docspace/shared/utils/getDefaultAccessUser";
import { copyShareLink as copyToBuffer } from "@docspace/shared/utils/copy";
import { copyShareLink } from "@docspace/shared/components/share/Share.helpers";
import {
  getGuidanceConfig,
} from "@docspace/shared/components/guidance/configs";
import {
  connectedCloudsTypeTitleTranslation,
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
  FormFillingManageAction,
} from "@docspace/shared/enums";
import {
  formRoleMapping,
  getFileLink,
  getFolderLink,
  manageFormFilling,
  removeSharedFolderOrFile,
} from "@docspace/shared/api/files";
import { createLoader } from "@docspace/shared/utils/createLoader";
import { FILLING_STATUS_ID } from "@docspace/shared/constants";
import {
  isFile as isFileUtil,
  isFolder,
  isFolder as isFolderUtil,
  isRoom as isRoomUtil,
} from "@docspace/shared/utils/typeGuards";
import {
  openShareTab,
  setInfoPanelMobileHidden,
  showInfoPanel,
} from "SRC_DIR/helpers/info-panel";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import {
  XlsxUpdateService,
} from "@docspace/shared/services/xlsx-update.service";
import {
  showCreatedPDFFormDialog,
} from "SRC_DIR/components/dialogs/CreatedPDFFormDialog";
import { getRoomInfo } from "@docspace/shared/api/rooms";
import { PersistenceKeys, getPersisted } from "./utils/persistence";
import {
  onClickEditRoom as onClickEditRoomHelper,
  onEditRoomTemplate,
  onShowEditingToast,
  onShowInfoPanel as onShowInfoPanelHelper,
  onShowWaitOperationToast,
  systemFolders,
} from "./contextOptionsStore/helpers";
import type {
  TContextItem,
  TContextItemSecurity,
  TContextOption,
  TStoreCustomEvent,
} from "./contextOptionsStore/helpers";
import {
  getFilesContextOptionsImpl,
} from "./contextOptionsStore/filesContextOptions.helpers";
import {
  getGroupContextOptionsImpl,
} from "./contextOptionsStore/groupContextOptions.helpers";
import {
  getFormGalleryContextOptionsImpl,
  getRoomsRootContextOptionsImpl,
  getContextOptionsPlusFormRoomImpl,
  getFolderModelImpl,
} from "./contextOptionsStore/folderModel.helpers";
import {
  getHeaderOptionsImpl,
  getManageLinkOptionsImpl,
} from "./contextOptionsStore/headerOptions.helpers";
import {
  onMultiLoadPluginsImpl,
  onLoadPluginsImpl,
} from "./contextOptionsStore/plugins.helpers";
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

  onMultiLoadPlugins = (items: TSelectionItem[]): TContextOption[]=> onMultiLoadPluginsImpl(this, items);

  onLoadPlugins = (item: TContextItem): TContextOption[]=> onLoadPluginsImpl(this, item);

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
  ): ContextMenuModel[]=> getFormGalleryContextOptionsImpl(this, item, t, navigate);

  getRoomsRootContextOptions = (
    item: TContextItem,
    t: TTranslation,
  ): { pinOptions: TContextOption[]; muteOptions: TContextOption[] }=> getRoomsRootContextOptionsImpl(this, item, t);

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
  ): ContextMenuModel[]=> getHeaderOptionsImpl(this, t, item);

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

  getManageLinkOptions = (item: TContextItem)=> getManageLinkOptionsImpl(this, item);

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

  getGroupContextOptions = (t: TTranslation): ContextMenuModel[]=> getGroupContextOptionsImpl(this, t);

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
    models: {
      formActions: TContextOption[];
      templateGallery: TContextOption[];
      createNewFolder: TContextOption;
    },
  ) => getContextOptionsPlusFormRoomImpl(this, t, models);

  getFolderModel = (t: TTranslation, isSectionMenu?: boolean)=> getFolderModelImpl(this, t, isSectionMenu);

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

