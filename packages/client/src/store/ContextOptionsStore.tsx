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

import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import { makeAutoObservable } from "mobx";
import copy from "copy-to-clipboard";
import { isMobile } from "react-device-detect";
import { toastr } from "@docspace/ui-kit/components/toast";
import type {
  ContextMenuModel,
} from "@docspace/ui-kit/components/context-menu";
import type { TTranslation } from "@docspace/shared/types";
import type { TFile } from "@docspace/shared/api/files/types";
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
import {
  getGuidanceConfig,
} from "@docspace/shared/components/guidance/configs";
import {
  RoomsType,
  Events,
  FolderType,
  UrlActionType,
  FilesSelectorFilterTypes,
  FilterType,
  FileExtensions,
} from "@docspace/shared/enums";
import {
  isFolder,
  isRoom as isRoomUtil,
} from "@docspace/shared/utils/typeGuards";
import {
  openShareTab,
  setInfoPanelMobileHidden,
  showInfoPanel,
} from "SRC_DIR/helpers/info-panel";
import {
  onClickEditRoom as onClickEditRoomHelper,
  onShowEditingToast,
  onShowInfoPanel as onShowInfoPanelHelper,
  onShowWaitOperationToast,
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
import {
  onClickReconnectStorageImpl,
  onClickMakeFormImpl,
  onCopyLinkImpl,
  onOpenEmbeddingSettingsImpl,
  onCreateAndCopySharedLinkImpl,
  onRemoveSharedFilesOrFolderImpl,
  startFillingInRoleBasedRoomImpl,
  startFillingInFormRoomImpl,
  onClickResetAndStartFillingImpl,
  onClickDeleteSelectedFolderImpl,
  onAddRoomsToGroupImpl,
  onRemoveRoomsFromGroupImpl,
  onCreateTemplateImpl,
  onSyncXlsxDataImpl,
  handleCopyPrimaryLinkImpl,
  _resolveRoomImpl,
  _syncInfoPanelRoomImpl,
  askAIImpl,
} from "./contextOptionsStore/actions.helpers";
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

import type {
  TFilesActionsStore,
  TFilesStore,
  TSelectionItem,
} from "./contextOptionsStore/types";
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

  onClickReconnectStorage = async (item: TContextItem, t: TTranslation)=> onClickReconnectStorageImpl(this, item, t);

  onClickMakeForm = (item: TContextItem, t: TTranslation)=> onClickMakeFormImpl(this, item, t);

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

  onCopyLink = async (item: TContextItem, t: TTranslation)=> onCopyLinkImpl(this, item, t);

  onOpenEmbeddingSettings = async (item: TContextItem)=> onOpenEmbeddingSettingsImpl(this, item);

  onCreateAndCopySharedLink = async (item: TContextItem, t: TTranslation)=> onCreateAndCopySharedLinkImpl(this, item, t);

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

  onRemoveSharedFilesOrFolder = async (items: TContextItem[])=> onRemoveSharedFilesOrFolderImpl(this, items);

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

  startFillingInRoleBasedRoom = (item: TContextItem, t: TTranslation)=> startFillingInRoleBasedRoomImpl(this, item, t);

  startFillingInFormRoom = async (item: TContextItem)=> startFillingInFormRoomImpl(this, item);

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

  onClickResetAndStartFilling = async (item: TContextItem)=> onClickResetAndStartFillingImpl(this, item);

  // when used as a context-menu onClick the first argument is
  // the ui-kit click payload (an object), otherwise a media file id.
  onMediaFileClick = (fileId: number | string | object, item: TContextItem) => {
    const itemId = typeof fileId !== "object" ? fileId : item.id;
    this.mediaViewerDataStore.setMediaViewerData({ visible: true, id: itemId });
    this.mediaViewerDataStore.changeUrl(itemId);
  };

  onClickDeleteSelectedFolder = (t: TTranslation, isRoom?: boolean)=> onClickDeleteSelectedFolderImpl(this, t, isRoom);

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
  )=> onAddRoomsToGroupImpl(this, roomIds, groupId, t, groupName);

  onRemoveRoomsFromGroup = async (roomIds: number[], t: TTranslation)=> onRemoveRoomsFromGroupImpl(this, roomIds, t);

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
  onCreateTemplate = async (_navigate?: unknown)=> onCreateTemplateImpl(this, _navigate);

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

  onSyncXlsxData = async (item: TContextItem, t: TTranslation)=> onSyncXlsxDataImpl(this, item, t);

  getHeaderOptions = (
    t: TTranslation,
    item: TContextItem,
  ): ContextMenuModel[]=> getHeaderOptionsImpl(this, t, item);

  handleCopyPrimaryLink = async (item: TContextItem, t: TTranslation)=> handleCopyPrimaryLinkImpl(this, item, t);

  getManageLinkOptions = (item: TContextItem)=> getManageLinkOptionsImpl(this, item);

  _resolveRoom = async (): Promise<TContextItem | null>=> _resolveRoomImpl(this);

  _syncInfoPanelRoom = (newRoom: TRoom)=> _syncInfoPanelRoomImpl(this, newRoom);

  askAI = async (item: TContextItem)=> askAIImpl(this, item);

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

