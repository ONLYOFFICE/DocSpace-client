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
import config from "PACKAGE_FILE";
import { Trans } from "react-i18next";
import type { TFunction } from "i18next";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import type { TTranslation } from "@docspace/shared/types";
import type {
  TFile,
  TFileLink,
  TFileSecurity,
  TFileViewAccessibility,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoom, TRoomSecurity } from "@docspace/shared/api/rooms/types";
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
  setView,
  showInfoPanel,
} from "SRC_DIR/helpers/info-panel";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import { XlsxUpdateService } from "@docspace/shared/services/xlsx-update.service";
import { showCreatedPDFFormDialog } from "SRC_DIR/components/dialogs/CreatedPDFFormDialog";
import { getBrandName } from "@docspace/shared/constants/brands";
import { getRoomInfo } from "@docspace/shared/api/rooms";
import type { IContextMenuItemClient } from "SRC_DIR/helpers/plugins/types";
import { PersistenceKeys, getPersisted } from "./utils/persistence";
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

const LOADER_TIMER = 500;
let loadingTime: Date | null | undefined;
let timer: ReturnType<typeof setTimeout> | null | undefined;

const systemFolders = [
  FolderType.InProgress,
  FolderType.Done,
  FolderType.SubFolderDone,
  FolderType.SubFolderInProgress,
];

type TContextItemSecurity = Partial<
  TFileSecurity & TFolderSecurity & TRoomSecurity
>;

// FABLE5-REVIEW: context-menu items are FilesStore filesList view-models and
// FilesStore is still .js (wave 3) — this is a minimal structural type of the
// members used in this store. TFile/TFolder/TRoom from typed consumers are
// assignable to it. Replace with the real list-item type once FilesStore is
// converted.
export type TContextItem = {
  id: number;
  title: string;
  access?: ShareAccessRights;
  security?: TContextItemSecurity;
  viewAccessibility?: TFileViewAccessibility;
  contextOptions?: string[];
  fileExst?: string;
  exst?: string | null;
  folderId?: number;
  parentId?: number;
  rootFolderId?: number;
  rootFolderType?: FolderType;
  parentRoomType?: FolderType;
  roomType?: RoomsType;
  type?: FolderType;
  providerKey?: string;
  providerId?: number;
  external?: boolean;
  isLinkExpired?: boolean;
  passwordProtected?: boolean;
  shared?: boolean;
  canShare?: boolean;
  href?: string;
  webUrl?: string;
  viewUrl?: string;
  shortWebUrl?: string;
  canOpenPlayer?: boolean;
  locked?: boolean;
  encrypted?: boolean;
  isFolder?: boolean;
  isRoom?: boolean;
  isAIAgent?: boolean;
  isTemplate?: boolean;
  isEdit?: boolean;
  isEditing?: boolean;
  isPDFForm?: boolean;
  startFilling?: boolean;
  inRoom?: boolean;
  pinned?: boolean;
  requestToken?: string;
  customFilterEnabled?: boolean;
  customFilterEnabledBy?: string;
  indexing?: boolean;
  isInsideKnowledge?: boolean;
  isInsideResultStorage?: boolean;
  sendFormToExternalDB?: boolean;
};

// FABLE5-REVIEW: multi-select items always carry contextOptions/security in
// the .js FilesStore filesList view-model.
type TSelectionItem = TContextItem & {
  contextOptions: string[];
  security: TContextItemSecurity;
};

// FABLE5-REVIEW: the option shape this store builds is looser than ui-kit's
// ContextMenuModel (store-specific onClick signatures, string-keyed
// separators); results are cast to ContextMenuModel[] at the public
// boundaries. Align with ContextMenuModel once the .js consumers are typed.
type TContextOption = {
  id?: string;
  key: string;
  label?: React.ReactNode;
  icon?: string;
  disabled?: boolean | string;
  isSeparator?: boolean;
  onClick?: (...args: never[]) => unknown;
  items?: TContextOption[];
  className?: string;
  placement?: "top" | "topLast";
};

type TMenuGroupKey = string | { key: string };

type TMenuGroupConfig = {
  groupKey: string;
  groupLabel: React.ReactNode;
  groupIcon?: string;
  itemKeys: TMenuGroupKey[] | { key: string }[][];
  needsGrouping?: boolean;
  minItemsCount?: number;
};

type TCreateEventPayload = {
  extension?: string;
  id?: number;
  fromTemplate?: boolean;
  title?: string;
  openEditor?: boolean;
  edit?: boolean;
  isFormsCreate?: boolean;
};

// FABLE5-REVIEW: the still-.js GlobalEvents component reads these extra
// fields off the dispatched CustomEvent.
type TStoreCustomEvent = CustomEvent & {
  item?: TContextItem;
  cb?: (room: TRoom) => void;
  payload?: TCreateEventPayload;
  title?: string;
};

// FABLE5-REVIEW: matches the (unexported) GroupItem type of the plugin SDK's
// IContextMenuItem["onGroupClick"].
type TPluginGroupItem = {
  id: number | string;
  itemType: "file" | "folder" | "room";
};

// FABLE5-REVIEW: FilesStore is still .js (wave 3) — minimal structural type of
// the members used here; replace with `import type FilesStore` once converted.
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

// FABLE5-REVIEW: FilesActionsStore is still .js (wave 3) — minimal structural
// type of the members used here; replace with import type once converted.
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
  onCreateRoomFromTemplate: (item: TContextItem, addSelection?: boolean) => void;
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

  // FABLE5-REVIEW: `this.onOwnerChange` is referenced by the "owner-change"
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

    // FABLE5-REVIEW: the original .js assumed the provider is always found
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
          // FABLE5-REVIEW: the original .js assumed window.open succeeded
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
    // FABLE5-REVIEW: the original .js assumed a file item (fileExst/folderId
    // always present) — the cast keeps identical runtime behavior.
    const { title, id, folderId, fileExst } = item as TContextItem & {
      fileExst: string;
      folderId: number;
    };

    const newTitle =
      title.substring(0, title.length - fileExst.length) +
      this.filesSettingsStore.extsWebRestrictedEditing[0];

    // FABLE5-REVIEW: copyAsAction rejections are untyped (axios error or
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

  // FABLE5-REVIEW: some call sites pass `item.security` as a second argument
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

  onClickLinkForPortal = (item: TContextItem, t: TTranslation) => {
    const { fileExst, canOpenPlayer, webUrl, id } = item;

    const isFile = !!fileExst;
    // FABLE5-REVIEW: the original .js passed a possibly-undefined webUrl
    // through to copy() unchecked — the cast keeps that behavior.
    copy(
      isFile
        ? canOpenPlayer
          ? `${window.location.href}&preview=${id}`
          : (webUrl as string)
        : `${window.location.origin + config.homepage}/filter?folder=${id}`, // TODO: Change url by category
    );

    toastr.success(t("Common:LinkCopySuccess"));
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

    // FABLE5-REVIEW: the original .js sets linkParams without the `link`
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
      // FABLE5-REVIEW: the original .js passed viewUrl through unchecked
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

  // FABLE5-REVIEW: some call sites pass `t` as a second argument which the
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

  // FABLE5-REVIEW: some call sites pass `item` which the original .js
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

      // FABLE5-REVIEW: the original .js assumed a signed-in user and a file
      // item here — the assertions/casts keep identical runtime behavior.
      showCreatedPDFFormDialog(item as TFile, this.userStore.user!.id);
    } catch (error) {
      toastr.error(error as string);
    }
  };

  // FABLE5-REVIEW: the AssignRoles dialog calls this without `t` (only ever
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

  // FABLE5-REVIEW: when used as a context-menu onClick the first argument is
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
      // FABLE5-REVIEW: the original .js passes `undefined` through here when
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

  // FABLE5-REVIEW: some call sites pass `item` which the original .js
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

    if (item.isEditing) return this.onShowEditingToast(t);

    if (isGroupMenuBlocked) return this.onShowWaitOperationToast(t);

    this.onClickDelete(item, t);
  };

  filterModel = (model: TContextOption[], filter: string[]) => {
    const options: TContextOption[] = [];
    let index = 0;
    const last = model.length;

    // Keys that should preserve their items without filtering
    const preserveItemsKeys = ["add-to-group"];

    for (index; index < last; index++) {
      if (filter.includes(model[index].key)) {
        options[index] = model[index];
        if (model[index].items) {
          // Skip filtering items for keys that need to preserve dynamic items
          if (!preserveItemsKeys.includes(model[index].key)) {
            options[index].items = model[index].items!.filter((item) =>
              filter.includes(item.key),
            );

            if (options[index].items!.length === 1) {
              options[index] = options[index].items![0];
            }
          }
        }
      }
    }

    return options.filter((o) => !!o);
  };

  // FABLE5-REVIEW: every current call site passes only `item`, so `view` is
  // undefined at runtime; the cast preserves that pre-existing behavior of
  // calling setView(undefined).
  onShowInfoPanel = (item?: TContextItem, view?: string) => {
    showInfoPanel();

    if (item) {
      setView(view as string);
    }
  };

  onClickEditRoom = (item: TContextItem) => {
    const event: TStoreCustomEvent = new CustomEvent(Events.ROOM_EDIT, {
      detail: { context: "context_menu" },
    });
    event.item = item;
    window.dispatchEvent(event);
  };

  onClickEditAgent = (item: TContextItem) => {
    const event: TStoreCustomEvent = new CustomEvent(Events.AGENT_EDIT, {
      detail: { context: "context_menu" },
    });
    event.item = item;
    window.dispatchEvent(event);
  };

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

  onEditRoomTemplate = (item: TContextItem, cb?: (room: TRoom) => void) => {
    const event: TStoreCustomEvent = new CustomEvent(Events.ROOM_EDIT, {
      detail: { context: "context_menu" },
    });
    event.item = { ...item, isEdit: true };
    event.cb = cb;
    window.dispatchEvent(event);
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

        // FABLE5-REVIEW: the original .js returns undefined for unknown
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

          // FABLE5-REVIEW: the original .js called onGroupClick without a
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
    // FABLE5-REVIEW: callers always pass an item enriched with
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

          // FABLE5-REVIEW: the original .js called onClick without a
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

  placePlugins(result: TContextOption[], pluginItems: TContextOption[]) {
    const newResult = [...result];
    const placementPlugins = pluginItems.filter((p) => p.placement);

    placementPlugins.forEach((option) => {
      if (option.placement === "top") {
        newResult.splice(0, 0, option);
      }

      if (option.placement === "topLast") {
        const firstSepIdx = newResult.findIndex((o) => o.isSeparator);
        const insertAt = firstSepIdx !== -1 ? firstSepIdx : newResult.length;
        newResult.splice(insertAt, 0, option);
      }
    });
    return newResult;
  }

  // FABLE5-REVIEW: call sites may pass an undefined roomType which the
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

  onShowEditingToast = (t: TTranslation) => {
    toastr.error(t("Files:DocumentEdited"));
  };

  onShowWaitOperationToast = (t: TTranslation) => {
    toastr.warning(t("Files:WaitOperation"));
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

  // FABLE5-REVIEW: call sites may pass an undefined roomType which the
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

  // FABLE5-REVIEW: some call sites pass `navigate` which the original .js
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
      // FABLE5-REVIEW: the original .js assumed a selected gallery template
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

  onSuggestOformChanges = (item: {
    attributes?: { name_form: string };
    title?: string;
  }) => {
    const formTitle = item.attributes ? item.attributes.name_form : item.title;

    // FABLE5-REVIEW: assigning a string to window.location is valid at
    // runtime (navigates) but lib.dom types the setter stricter — the cast
    // keeps the original statement.
    window.location = `mailto:marketing@onlyoffice.com
    ?subject=Suggesting changes for ${formTitle}
    &body=Suggesting changes for ${formTitle}.
  ` as unknown as string & Location;
  };

  // FABLE5-REVIEW: the Gallery ItemTitle consumer passes either a full
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
        onClick: () => this.onSuggestOformChanges(item as TOformFile),
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

  createMenuGroup = (
    options: TContextOption[],
    groupConfig: TMenuGroupConfig,
  ) => {
    const {
      groupKey,
      groupLabel,
      groupIcon,
      itemKeys,
      needsGrouping = false,
      minItemsCount = 1,
    } = groupConfig;

    let groupItems: TContextOption[] = [];

    if (needsGrouping) {
      let lastNonEmptyGroupIndex = -1;

      // FABLE5-REVIEW: needsGrouping callers always pass nested
      // { key }[][] itemKeys — the cast reflects that contract.
      (itemKeys as { key: string }[][]).forEach((group, groupIndex) => {
        const groupSubItems = group
          .map((groupItem) =>
            options.find((option) => option.key === groupItem.key),
          )
          .filter((menuItem): menuItem is TContextOption =>
            Boolean(menuItem && menuItem.disabled !== true),
          );

        if (groupSubItems.length > 0) {
          if (lastNonEmptyGroupIndex !== -1) {
            groupItems.push({
              key: `separator-after-group-${lastNonEmptyGroupIndex}`,
              isSeparator: true,
            });
          }

          groupSubItems.forEach((menuItem) => groupItems.push(menuItem));
          lastNonEmptyGroupIndex = groupIndex;
        }
      });
    } else {
      groupItems = (itemKeys as TMenuGroupKey[])
        .map((item) =>
          options.find(
            (option) =>
              option.key === (typeof item === "object" ? item.key : item),
          ),
        )
        .filter((option): option is TContextOption =>
          Boolean(option && option.disabled !== true),
        );
    }

    const itemsCount = groupItems.filter(
      (menuItem) => !menuItem.isSeparator && menuItem.disabled !== true,
    ).length;

    const shouldAddGroup = itemsCount > minItemsCount;

    return {
      group: shouldAddGroup
        ? {
            id: `option_${groupKey}`,
            key: groupKey,
            label: groupLabel,
            icon: groupIcon,
            items: groupItems,
          }
        : null,
      keysToRemove: shouldAddGroup
        ? needsGrouping
          ? (itemKeys as { key: string }[][]).flat().map((item) => item.key)
          : (itemKeys as TMenuGroupKey[]).map((item) =>
              typeof item === "object" ? item.key : item,
            )
        : [],
    };
  };

  getHeaderOptions = (t: TTranslation, item: TContextItem): ContextMenuModel[] => {
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

    // FABLE5-REVIEW: canShowManageLink expects TFile | TFolder while items
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

    // FABLE5-REVIEW: rooms resolved here are TRoom/TSelectedFolder shapes
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
          this.onEditRoomTemplate(room, this._syncInfoPanelRoom);
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
  ): ContextMenuModel[] => {
    const optionsToRemove = isInfoPanel
      ? ["select", "open", "room-info", "show-info"]
      : isHeader
        ? ["select"]
        : [];

    if (!item.contextOptions) {
      const contextOptions = this.filesStore.getFilesContextOptions(
        item,
        optionsToRemove,
      );
      item = { ...item, contextOptions };
    } else {
      // FABLE5-REVIEW: removeOptions lives in the untyped filesUtils.js
      // helper — the cast restores the string[] type of the filtered list.
      item.contextOptions = removeOptions(
        item.contextOptions,
        optionsToRemove,
      ) as string[];
    }

    const { isPublicRoom } = this.publicRoomStore;

    // FABLE5-REVIEW: contextOptions is guaranteed by the branch above — the
    // cast keeps the original unchecked destructuring.
    const { contextOptions, isEditing } = item as TSelectionItem;

    const isRootThirdPartyFolder =
      item.providerKey && item.id === item.rootFolderId;

    // const isShareable = this.treeFoldersStore.isPersonalRoom
    //   ? item.canShare || (item.isFolder && item.security?.CreateRoomFrom)
    //   : false;

    const isMedia =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;

    const hasInfoPanel = contextOptions.includes("show-info");

    const withAI = contextOptions.includes("ask-ai");

    // const emailSendIsDisabled = true;
    const showSeparator0 =
      item.inRoom &&
      (hasInfoPanel ||
        !isMedia ||
        (item.external && item.isLinkExpired) ||
        withAI); // || !emailSendIsDisabled;

    const separator0 = showSeparator0
      ? {
          key: "separator0",
          isSeparator: true,
        }
      : false;

    const onlyShowVersionHistory =
      !contextOptions.includes("finalize-version") &&
      contextOptions.includes("show-version-history");

    const versionActions = onlyShowVersionHistory
      ? [
          {
            id: "option_show-version-history",
            key: "show-version-history",
            label: t("Common:ShowVersionHistory"),
            icon: HistoryReactSvgUrl,
            onClick: () =>
              this.showVersionHistory(
                item.id,
                item.security,
                item?.requestToken,
              ),
            disabled: false,
          },
        ]
      : [
          {
            id: "option_version",
            key: "version",
            label: t("VersionHistory"),
            icon: HistoryFinalizedReactSvgUrl,
            items: [
              {
                id: "option_finalize-version",
                key: "finalize-version",
                label: t("FinalizeVersion"),
                icon: HistoryFinalizedReactSvgUrl,
                onClick: () =>
                  isEditing
                    ? this.onShowEditingToast(t)
                    : this.finalizeVersion(item.id, item.security),
                disabled: false,
              },
              {
                id: "option_version-history",
                key: "show-version-history",
                label: t("Common:ShowVersionHistory"),
                icon: HistoryReactSvgUrl,
                onClick: () =>
                  this.showVersionHistory(
                    item.id,
                    item.security,
                    item?.requestToken,
                  ),
                disabled: false,
              },
            ],
          },
        ];

    const moveActions = [
      {
        id: "option_move-or-copy",
        key: "move",
        label: t("Common:MoveOrCopy"),
        icon: CopyReactSvgUrl,
        items: [
          {
            id: "option_move-to",
            key: "move-to",
            label: t("Common:MoveTo"),
            icon: MoveReactSvgUrl,
            onClick: isEditing
              ? () => this.onShowEditingToast(t)
              : () => this.onMoveAction(item),
            disabled: false,
          },
          {
            id: "option_copy-to",
            key: "copy-to",
            label: t("Common:Copy"),
            icon: CopyReactSvgUrl,
            onClick: () => this.onCopyAction(item),
            disabled: false,
          },
          {
            id: "option_create-duplicate",
            key: "duplicate",
            label: t("Common:Duplicate"),
            icon: DuplicateReactSvgUrl,
            onClick: () => this.onDuplicate(item, t),
            disabled: false,
          },
        ],
      },
    ];

    const { pinOptions, muteOptions } = this.getRoomsRootContextOptions(
      item,
      t,
    );

    let withOpen = item.id !== this.selectedFolderStore.id;
    const isPublicRoomType =
      item.roomType === RoomsType.PublicRoom ||
      item.roomType === RoomsType.FormRoom ||
      item.roomType === RoomsType.CustomRoom;

    const { navigationPath } = this.selectedFolderStore;

    if (item.isRoom && withOpen) {
      withOpen = navigationPath.findIndex((f) => f.id === item.id) === -1;
    }

    const isArchive = item.rootFolderType === FolderType.Archive;
    const isFormRoom = item.roomType === RoomsType.FormRoom;
    const isAIAgent =
      item.isAIAgent ??
      (item.rootFolderType === FolderType.AIAgents &&
        item.roomType === RoomsType.AIRoom);

    const isKnowledgeOrResult =
      item.isAIAgent && (item.isInsideKnowledge || item.isInsideResultStorage);

    const hasShareLinkRights = isPublicRoom
      ? item.security?.Read
      : item.shared
        ? item.security?.CopySharedLink
        : item.security?.EditAccess;

    const { isFiltered } = this.filesStore;
    const { isIndexedFolder, security } = this.selectedFolderStore;

    const indexOptions = {
      id: "option_edit-index",
      key: "edit-index",
      label: t("Common:EditIndex"),
      icon: EditIndexReactSvgUrl,
      onClick: () => this.onEditIndex(),
      disabled: !security?.EditRoom || !isIndexedFolder || isFiltered,
    };

    const isTemplateOwner =
      item.access === ShareAccessRights.None ||
      item.access === ShareAccessRights.FullAccess;

    const isRoomAdmin =
      item.access === ShareAccessRights.RoomManager ||
      item.access === ShareAccessRights.None;

    const optionsModel: (TContextOption | false)[] = [
      {
        id: "option_select",
        key: "select",
        label: t("Common:SelectAction"),
        icon: CheckBoxReactSvgUrl,
        onClick: () => this.onSelect(item),
        disabled: false,
      },
      withOpen && {
        id: "option_open",
        key: "open",
        label: t("Common:Open"),
        icon: FolderReactSvgUrl,
        onClick: () => this.onOpenFolder(item, t),
        disabled:
          !this.treeFoldersStore.isFavoritesFolder &&
          !this.treeFoldersStore.isRecentFolder &&
          Boolean(item.external && item.isLinkExpired),
      },
      {
        id: "option_sync_xlsx_data",
        key: "update-xlsx-data",
        label: t("Common:SyncXlsxData"),
        icon: spreadsheetUrl,
        onClick: () => this.onSyncXlsxData(item, t),
        disabled: false,
      },
      {
        id: "option_fill-form",
        key: "fill-form",
        label: t("Common:FillFormButton"),
        icon: FormFillRectSvgUrl,
        onClick: () => this.onClickLinkFillForm(item),
        disabled: false,
      },
      {
        id: "option_open-pdf",
        key: "open-pdf",
        label: t("Common:Open"),
        icon: EyeReactSvgUrl,
        onClick: () => this.gotoDocEditor(item, false),
        disabled: false,
      },
      {
        id: "option_edit-pdf",
        key: "edit-pdf",
        label: t("Common:EditButton"),
        icon: AccessEditReactSvgUrl,
        onClick: () => {
          if (isMobile) {
            toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
            return;
          }
          this.onOpenPDFEditDialog(item.id);
        },
        disabled: false,
      },
      {
        id: "option_edit",
        key: "edit",
        label: t("Common:EditButton"),
        icon: AccessEditReactSvgUrl,
        onClick: () => {
          const isPDF = item.fileExst === ".pdf";

          if (isPDF && isMobile) {
            toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
            return;
          }
          this.onClickLinkEdit(item);
        },
        disabled: false,
      },
      {
        id: "option_vectorization",
        key: "vectorization",
        label: t("Common:Vectorization"),
        icon: RefreshReactSvgUrl,
        onClick: () => this.filesActionsStore.retryVectorization([item]),
        disabled: !item.security?.Vectorization,
      },
      {
        id: "option_preview",
        key: "preview",
        label:
          this.treeFoldersStore.isRecentFolder ||
          this.treeFoldersStore.isFavoritesFolder
            ? t("Common:Open")
            : t("Common:Preview"),
        icon: EyeReactSvgUrl,
        onClick: () =>
          this.treeFoldersStore.isRecentFolder ||
          this.treeFoldersStore.isFavoritesFolder
            ? this.gotoDocEditor(item)
            : this.onPreviewClick(item),
        disabled: false,
      },
      separator0,
      {
        id: "option_view",
        key: "view",
        label:
          this.treeFoldersStore.isRecentFolder ||
          this.treeFoldersStore.isFavoritesFolder
            ? t("Common:Open")
            : t("Common:View"),
        icon: EyeReactSvgUrl,
        onClick: (fileId) => this.onMediaFileClick(fileId, item),
        disabled: false,
      },
      {
        id: "option_pdf-view",
        key: "pdf-view",
        label: "Pdf viewer",
        icon: EyeReactSvgUrl,
        onClick: (fileId) => this.onMediaFileClick(fileId, item),
        disabled: false,
      },
      {
        id: "option_make-form",
        key: "make-form",
        label: t("Common:MakeForm"),
        icon: FormPlusReactSvgUrl,
        onClick: () => this.onClickMakeForm(item, t),
        disabled: false,
      },
      ...pinOptions,
      ...muteOptions,
      {
        key: "separator1",
        isSeparator: true,
      },
      {
        id: "option_edit-room",
        key: "edit-room",
        label: t("Common:EditRoom"),
        icon: SettingsReactSvgUrl,
        onClick: () => this.onClickEditRoom(item),
        disabled: false,
      },
      {
        id: "option_edit-agent",
        key: "edit-agent",
        label: t("Common:EditAgent"),
        icon: SettingsReactSvgUrl,
        onClick: () => this.onClickEditAgent(item),
        disabled: false,
      },
      {
        id: "option_invite-users-to-room",
        key: "invite-users-to-room",
        label: t("Common:InviteContacts"),
        icon: PersonReactSvgUrl,
        onClick: () => this.onClickInviteUsers(item.id, item.roomType),
        disabled: false,
      },
      {
        id: "option_link-for-room-members",
        key: "link-for-room-members",
        label: t("Common:CopyLink"),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => this.onCopyLink(item, t),
        disabled: item.isTemplate
          ? false
          : (!item.isRoom && item.canShare) ||
            (isPublicRoomType && hasShareLinkRights) ||
            Boolean(
              item.external && (item.isLinkExpired || item.passwordProtected),
            ),
      },
      {
        id: "option_ask-ai",
        key: "ask-ai",
        label: t("Common:AskAI"),
        icon: AISvgUrl,
        onClick: () => this.askAI(item),
        disabled: false,
      },
      {
        key: "separator6",
        isSeparator: true,
      },
      {
        id: "option_start-filling",
        key: "start-filling",
        label: t("Common:StartFilling"),
        icon: FormFillRectSvgUrl,
        onClick: () => this.onClickStartFilling(item, t),
        disabled: false,
      },
      {
        id: "option_reset-and-start-filling",
        key: "reset-and-start-filling",
        label: t("Common:ResetAndStartFilling"),
        icon: BackupSvgUrl,
        onClick: () => this.onClickResetAndStartFilling(item),
        disabled: false,
      },
      {
        id: "option_filling-status",
        key: "filling-status",
        label: t("Common:FillingStatus"),
        icon: FormFillRectSvgUrl,
        onClick: () => this.onFillingStatus(item),
        disabled: false,
      },
      {
        key: "separator-SubmitToGallery",
        isSeparator: true,
      },
      {
        id: "option_reconnect-storage",
        key: "reconnect-storage",
        label: t("Common:ReconnectStorage"),
        icon: ReconnectSvgUrl,
        onClick: () => this.onClickReconnectStorage(item, t),
        disabled: !item.security?.Reconnect || !item.security?.EditRoom,
      },
      {
        id: "option_create-room",
        key: "create-room-from-template",
        label: t("Common:CreateRoom"),
        icon: CreateRoomReactSvgUrl,
        onClick: () => this.filesActionsStore.onCreateRoomFromTemplate(item),
        disabled: false,
      },
      {
        id: "option_edit-room",
        key: "edit-template",
        label: t("EditTemplate"),
        icon: SettingsReactSvgUrl,
        onClick: () => this.onEditRoomTemplate(item),
        disabled: !isTemplateOwner,
      },
      {
        id: "option_save-as-template",
        key: "save-as-template",
        label: t("SaveAsTemplate"),
        icon: CreateTemplateSvgUrl,
        onClick: () => this.onSaveAsTemplate(item),
        // FABLE5-REVIEW: the original .js uses the providerKey string itself
        // as the truthy "disabled" value — TContextOption allows it.
        disabled: !item.security?.Create || item.providerKey,
      },
      {
        id: "option_create-duplicate-room",
        key: "duplicate-room",
        label: t("Common:Duplicate"),
        icon: DuplicateReactSvgUrl,
        onClick: () => this.onDuplicate(item, t),
        disabled: !item.security?.Duplicate,
      },
      {
        id: "option_reconnect-storage",
        key: "reconnect-storage",
        label: t("Common:ReconnectStorage"),
        icon: ReconnectSvgUrl,
        onClick: () => this.onClickReconnectStorage(item, t),
        disabled: !item.security?.Reconnect || !item.security?.EditRoom,
      },
      {
        id: "option_access-settings",
        key: "access-settings",
        label: t("AccessSettingsTitle"),
        icon: PersonReactSvgUrl,
        onClick: () => this.onOpenTemplateAccessOptions(),
        disabled: !isTemplateOwner,
      },
      // {
      //   id: "option_copy-general-link",
      //   key: "copy-general-link",
      //   label: t("Common:CopySharedLink"),
      //   icon: TabletLinkReactSvgUrl,
      //   disabled: !isShareable,
      //   onClick: () => this.getManageLink(item, t),
      // },
      {
        id: "option_copy-shared-link",
        key: "copy-shared-link",
        label: t("Common:CopySharedLink"),
        icon: TabletLinkReactSvgUrl,
        onClick: () => this.handleCopyPrimaryLink(item, t),
        disabled: !item.canShare,
      },
      {
        id: "option_manage-links",
        key: "manage-links",
        label: t("Common:SharingSettings"),
        icon: SettingsReactSvgUrl,
        onClick: () => this.onClickShare(item),
        disabled: !item.canShare,
      },
      {
        id: "option_copy-external-link",
        key: "external-link",
        label: t("Common:CopySharedLink"),
        icon: TabletLinkReactSvgUrl,
        disabled:
          !hasShareLinkRights || Boolean(item.external && item.isLinkExpired),
        onClick: () => this.onCreateAndCopySharedLink(item, t),
        // onLoad: () => this.onLoadLinks(t, item),
      },
      {
        id: "option_download",
        key: "download",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => {
          if (isLockedSharedRoom(item as TRoom))
            return this.dialogsStore.setPasswordEntryDialog(
              true,
              item as TRoom,
              true,
            );

          this.onClickDownload(item, t);
        },
        disabled:
          (!item.security?.Download && !isLockedSharedRoom(item as TRoom)) ||
          Boolean(item.external && item.isLinkExpired),
      },
      {
        id: "option_download-encrypted",
        key: "download-encrypted",
        label: t("Common:DownloadWithoutDecryption"),
        icon: DownloadReactSvgUrl,
        onClick: () => this.onClickDownloadEncrypted(item, t),
        disabled: !item.security?.Download,
      },
      {
        id: "option_room-info",
        key: "room-info",
        label: item.isAIAgent ? t("Common:AgentInfo") : t("Common:RoomInfo"),
        icon: InfoOutlineReactSvgUrl,
        onClick: () => this.onShowInfoPanel(item),
        disabled: isPublicRoom || Boolean(item.external && item.isLinkExpired),
      },
      {
        id: "option_create-group",
        key: "create-group",
        label: t("GroupingRooms:CreateAGroup"),
        icon: CreateGroupReactSvgUrl,
        onClick: () =>
          this.dialogsStore.setEditRoomGroupsDialogVisible(true, [item.id]),
        disabled: false,
      },
      {
        id: "option_add-to-group",
        key: "add-to-group",
        label: t("GroupingRooms:AddToGroup"),
        icon: AddToGroupReactSvgUrl,
        items: this.dialogsStore.roomGroups.map((group) => {
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
              this.onAddRoomsToGroup([item.id], group.id, t, group.name),
          };
        }),
        disabled: false,
      },
      {
        id: "option_export-room-index",
        key: "export-room-index",
        label: t("Files:ExportRoomIndex"),
        icon: ExportRoomIndexSvgUrl,
        onClick: () => this.onExportRoomIndex(t, item.id),
        disabled: !item.indexing || !item.security?.IndexExport,
      },
      {
        id: "option_embedding-setting",
        key: "embedding-settings",
        label: t("Common:Embed"),
        icon: CodeReactSvgUrl,
        onClick: () => this.onOpenEmbeddingSettings(item),
        disabled: !item.security?.Embed,
      },
      {
        key: "create-room-separator",
        isSeparator: true,
        disabled: !item.security?.CreateRoomFrom,
      },
      {
        id: "option_create_room",
        key: "create-room",
        label: t("Common:CreateRoom"),
        icon: CatalogRoomsReactSvgUrl,
        onClick: () => this.onCreateRoom(item, true),
        disabled: !item.security?.CreateRoomFrom,
      },
      {
        id: "option_owner-change",
        key: "owner-change",
        label: t("Common:OwnerChange"),
        icon: FileActionsOwnerReactSvgUrl,
        onClick: this.onOwnerChange,
        disabled: false,
      },
      {
        id: "option_link-for-portal-users",
        key: "link-for-portal-users",
        label: t("LinkForPortalUsers", {
          productName: getBrandName("ProductName"),
        }),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => this.onClickLinkForPortal(item, t),
        disabled: false,
      },
      // {
      //   id: "option_send-by-email",
      //   key: "send-by-email",
      //   label: t("SendByEmail"),
      //   icon: MailReactSvgUrl,
      //   disabled: emailSendIsDisabled,
      // },

      {
        id: "option_show-info",
        key: "show-info",
        label: item.isFolder ? t("Common:FolderInfo") : t("Common:FileInfo"),
        icon: InfoOutlineReactSvgUrl,
        onClick: () => this.onShowInfoPanel(item),
        disabled: false,
      },
      {
        id: "option_change-room-owner",
        key: "change-room-owner",
        label: t("Common:ChangeRoomOwner"),
        icon: ReconnectSvgUrl,
        onClick: this.onChangeRoomOwner,
        disabled: isAIAgent,
      },
      {
        id: "option_remove-from-group",
        key: "remove-from-group",
        label: t("GroupingRooms:RemoveFromGroup"),
        icon: RemoveOutlineSvgUrl,
        onClick: () => this.onRemoveRoomsFromGroup([item.id], t),
        disabled: false,
      },
      ...versionActions,
      {
        id: "option_custom-filter",
        key: "custom-filter",
        label: item.customFilterEnabled
          ? t("Common:CustomFilterDisable")
          : t("Common:CustomFilterEnable"),
        icon: CustomFilterReactSvgUrl,
        onClick: () => this.onSetUpCustomFilter(item, t),
        disabled: Boolean(
          !isRoomAdmin &&
          item.customFilterEnabled &&
          item.customFilterEnabledBy &&
          item.customFilterEnabledBy !== this.userStore?.user?.displayName,
        ),
      },
      {
        id: "option_block-unblock-version",
        key: "block-unblock-version",
        label: item.locked ? t("Common:UnblockFile") : t("Common:BlockFile"),
        icon: LockedReactSvgUrl,
        onClick: () => this.lockFile(item, t),
        disabled: false,
      },
      {
        id: "option_open-location",
        key: "open-location",
        label: t("Common:OpenLocation"),
        icon: FolderLocationReactSvgUrl,
        onClick: () => this.onOpenLocation(item),
        disabled: !!item.requestToken,
      },
      {
        key: "separator1",
        isSeparator: true,
      },
      {
        id: "option_mark-read",
        key: "mark-read",
        label: t("MarkRead"),
        icon: TickRoundedSvgUrl,
        onClick: () => this.onClickMarkRead(item),
        disabled: false,
      },
      {
        id: "option_mark-as-favorite",
        key: "mark-as-favorite",
        label: t("Common:MarkAsFavorite"),
        icon: FavoritesReactSvgUrl,
        onClick: () => this.onClickFavorite("mark", [item], t),
        disabled: false,
      },
      {
        id: "option_create-duplicate-room",
        key: "duplicate-room",
        label: t("Common:Duplicate"),
        icon: DuplicateReactSvgUrl,
        onClick: () => this.onDuplicate(item, t),
        disabled: !item.security?.Duplicate,
      },
      {
        id: "option_remove-shared-room",
        key: "remove-shared-room",
        label: t("Common:RemoveFromList"),
        icon: CircleCrossSvgUrl,
        onClick: () => this.onRemoveSharedFilesOrFolder([item]),
        disabled:
          this.userStore?.user?.isAdmin ||
          this.userStore?.user?.isOwner ||
          !item.external,
      },
      {
        id: "option_download-as",
        key: "download-as",
        label: t("Common:DownloadAs"),
        icon: DownloadAsReactSvgUrl,
        onClick: this.onClickDownloadAs,
        disabled: !item.security?.Download,
      },
      ...moveActions,
      {
        id: "option_restore",
        key: "restore",
        label: t("Common:Restore"),
        icon: MoveReactSvgUrl,
        onClick: this.onRestoreAction,
        disabled: false,
      },
      indexOptions,
      {
        id: "option_rename",
        key: "rename",
        label: t("Common:Rename"),
        icon: RenameReactSvgUrl,
        onClick: () => this.onClickRename(item),
        disabled: false,
      },
      {
        key: "separator3",
        isSeparator: true,
      },
      {
        id: "option_unsubscribe",
        key: "unsubscribe",
        label: t("Common:RemoveFromList"),
        icon: RemoveSvgUrl,
        onClick: this.onClickUnsubscribe,
        disabled: false,
      },
      {
        id: "option_change-thirdparty-info",
        key: "change-thirdparty-info",
        label: t("Translations:ThirdPartyInfo"),
        icon: AccessEditReactSvgUrl,
        onClick: () => this.onChangeThirdPartyInfo(item.providerKey),
        disabled: false,
      },
      {
        id: "option_short-tour",
        key: "short-tour",
        label: t("FormFillingTipsDialog:WelcomeStartTutorial"),
        icon: HelpCenterReactSvgUrl,
        onClick: () => this.onEnableFormFillingGuid(t, item.roomType),
        disabled:
          isArchive ||
          !isFormRoom ||
          isMobileUtils() ||
          item.id !== this.selectedFolderStore.id,
      },
      {
        id: "option_change-room-owner",
        key: "change-agent-owner",
        label: t("Common:OwnerChange"),
        icon: ReconnectSvgUrl,
        onClick: this.onChangeRoomOwner,
        disabled: !isAIAgent,
      },
      {
        id: "option_leave-room",
        key: "leave-room",
        label: isAIAgent ? t("Common:LeaveTheAgent") : t("Common:LeaveTheRoom"),
        icon: LeaveRoomSvgUrl,
        onClick: this.onLeaveRoom,
        disabled: isKnowledgeOrResult
          ? false
          : isArchive || !item.inRoom || isPublicRoom || Boolean(item.external),
      },
      {
        id: "option_archive-room",
        key: "archive-room",
        label: t("Common:MoveToArchive"),
        icon: RoomArchiveSvgUrl,
        onClick: () => this.onClickArchive("archive"),
        disabled: false,
      },
      {
        id: "option_unarchive-room",
        key: "unarchive-room",
        label: t("Common:Restore"),
        icon: MoveReactSvgUrl,
        onClick: (e) => this.onClickArchive("unarchive"),
        disabled: false,
      },
      {
        key: "separator5",
        isSeparator: true,
      },
      {
        id: "option_remove-from-favorites",
        key: "remove-from-favorites",
        label: t("Common:RemoveFromFavorites"),
        icon: FavoritesFillReactSvgUrl,
        onClick: () => this.onClickFavorite("remove", [item], t),
        disabled: false,
      },
      {
        id: "option_delete",
        key: "delete",
        label: isRootThirdPartyFolder
          ? t("Common:Disconnect")
          : isAIAgent
            ? t("Common:DeleteAgent")
            : item.isTemplate
              ? t("Files:DeleteTemplateAction")
              : item.isRoom
                ? t("Common:DeleteRoom")
                : t("Common:Delete"),
        icon:
          item.isRoom && !isAIAgent ? RemoveOutlineSvgUrl : TrashReactSvgUrl,
        onClick: () => this.onDelete(item, t),
        disabled: item.isTemplate ? !isTemplateOwner : false,
      },
      {
        id: "option_remove-from-recent",
        key: "remove-from-recent",
        label: t("Common:RemoveFromList"),
        icon: RemoveOutlineSvgUrl,
        onClick: () => this.onClickRemoveFromRecent(item, t),
        disabled: !this.treeFoldersStore.isRecentFolder,
      },
      {
        id: "option_remove-shared-file-or-folder",
        key: "remove-shared-folder-or-file",
        label: t("Common:RemoveFromList"),
        icon: CircleCrossSvgUrl,
        onClick: () => {
          this.dialogsStore.setUnsubscribe(true);
          this.dialogsStore.setDeleteDialogVisible(true);
        },
        disabled:
          // FIXME: temporary hack — backend should expose a flag to disable this
          typeof window !== "undefined"
            ? !window?.location?.pathname.includes(SHARED_WITH_ME_PATH)
            : false,
      },
      {
        key: "separate-stop-filling",
        isSeparator: true,
      },
      {
        id: "option_stop-filling",
        key: "stop-filling",
        label: t("Common:StopFilling"),
        icon: AccessNoneReactSvgUrl,
        onClick: () =>
          this.dialogsStore.setStopFillingDialogVisible(true, item.id),
        disabled: false,
      },
    ];
    // FABLE5-REVIEW: `false` entries are skipped by filterModel's key lookup
    // exactly as in the original .js — the cast keeps that behavior.
    const options = this.filterModel(
      optionsModel as TContextOption[],
      contextOptions,
    );

    const pluginItems = this.onLoadPlugins(item);

    if (pluginItems.length > 0) {
      pluginItems.forEach((plugin) => {
        options.push({
          id: `option_${plugin.key}`,
          key: plugin.key,
          label: plugin.label,
          icon: plugin.icon,
          disabled: false,
          onClick: plugin.onClick,
          items: plugin.items,
        });
      });
    }

    const { isCollaborator } = this.userStore?.user || {
      isCollaborator: false,
    };

    let newOptions = options.filter(
      (option, index) =>
        !(index === 0 && option.key === "separator1") &&
        !(isCollaborator && option.key === "create-room"),
    );

    let minItemsCount = 3;
    if (item.isAIAgent && item.inRoom) {
      if (this.userStore?.user?.isAdmin || this.userStore?.user?.isOwner) {
        if (
          item.access === ShareAccessRights.RoomManager ||
          item.access === ShareAccessRights.None
        ) {
          minItemsCount = 1;
        }
      } else if (
        item.access === ShareAccessRights.RoomManager ||
        item.access === ShareAccessRights.None
      ) {
        minItemsCount = 1;
      }
    }

    const showInfoOption = newOptions.find(
      (option) => option.key === "show-info",
    );
    const showVersionHistoryOption = newOptions.find(
      (option) => option.key === "show-version-history",
    );

    const moreOptionsItemKeys: { key: string }[][] = [
      [
        { key: "save-as-template" },
        { key: "duplicate-room" },
        { key: "download" },
        { key: "room-info" },
        { key: "embedding-settings" },
        { key: "reconnect-storage" },
        { key: "export-room-index" },
      ],
      [{ key: "change-room-owner" }, { key: "change-agent-owner" }],
    ];

    const menuGroupsConfig: TMenuGroupConfig[] = [
      {
        groupKey: "more-options",
        groupLabel: t("Common:MoreOptions"),
        groupIcon: DotsHorizontalUrl,
        itemKeys: moreOptionsItemKeys,
        needsGrouping: true,
        minItemsCount,
      },
    ];

    if (!item.isRoom) {
      menuGroupsConfig.push({
        groupKey: "share",
        groupLabel: t("Common:Share"),
        groupIcon: ShareReactSvgUrl,
        itemKeys: [
          [
            { key: "link-for-room-members" },
            { key: "copy-shared-link" },
            { key: "manage-links" },
          ],
          [{ key: "create-room" }],
        ],
        needsGrouping: true,
        minItemsCount: 1,
      });
    }

    const downloadOption = newOptions.find(
      (option) => option.key === "download",
    );
    const downloadAsOption = newOptions.find(
      (option) => option.key === "download-as",
    );

    const downloadEncryptedOption = newOptions.find(
      (option) => option.key === "download-encrypted",
    );

    if (downloadOption && (downloadAsOption || downloadEncryptedOption)) {
      const originalDownloadOption = {
        ...downloadOption,
        key: "download-original",
        label: t("Common:OriginalFormat"),
      };

      newOptions = [
        ...newOptions.filter((option) => option.key !== "download"),
        originalDownloadOption,
      ];

      const downloadItemKeys: string[] = ["download-original"];
      if (downloadEncryptedOption) downloadItemKeys.push("download-encrypted");
      if (downloadAsOption) downloadItemKeys.push("download-as");

      menuGroupsConfig.push({
        groupKey: "download",
        groupLabel: downloadOption.label,
        groupIcon: downloadOption.icon,
        itemKeys: downloadItemKeys,
        needsGrouping: false,
        minItemsCount: 1,
      });
    }

    if (showInfoOption && showVersionHistoryOption) {
      menuGroupsConfig.push({
        groupKey: "info",
        groupLabel: t("Common:MoreOptions"),
        groupIcon: DotsHorizontalUrl,
        itemKeys: [
          [
            { key: "show-version-history" },
            { key: "show-info" },
            { key: "embedding-settings" },
          ],
        ],
        needsGrouping: true,
        minItemsCount: 1,
      });
    }

    const menuGroups: TContextOption[] = [];
    let keysToRemove: string[] = [];

    menuGroupsConfig.forEach((configItem) => {
      const { group, keysToRemove: groupKeysToRemove } = this.createMenuGroup(
        newOptions,
        configItem,
      );
      if (group) {
        menuGroups.push(group);
      }
      if (groupKeysToRemove && groupKeysToRemove.length > 0) {
        keysToRemove = [...keysToRemove, ...groupKeysToRemove];
      }
    });

    if (downloadOption && (downloadAsOption || downloadEncryptedOption)) {
      keysToRemove.push("download-original");
    }

    const resultOptions = newOptions.filter(
      (option) => !keysToRemove.includes(option.key),
    );

    if (menuGroups.length > 0) {
      const copySharedLinkIndex = resultOptions.findIndex(
        (option) => option.key === "external-link",
      );
      const copyLinkIndex = resultOptions.findIndex(
        (option) => option.key === "link-for-room-members",
      );

      const menuIndex =
        copySharedLinkIndex === -1 ? copyLinkIndex : copySharedLinkIndex;

      const insertIndex =
        menuIndex !== -1
          ? menuIndex + 1
          : (() => {
              const separatorIndex = resultOptions.findIndex((option) =>
                withAI
                  ? option.key === "separator6"
                  : option.key === "separator0",
              );
              return separatorIndex !== -1 ? separatorIndex + 1 : 1;
            })();

      resultOptions.splice(insertIndex, 0, ...menuGroups);
    }

    if (pluginItems.length > 0) {
      const pluginKeys = pluginItems.map((p) => p.key);

      // Remove all plugin items from resultOptions first
      for (let i = resultOptions.length - 1; i >= 0; i--) {
        if (pluginKeys.includes(resultOptions[i].key))
          resultOptions.splice(i, 1);
      }

      const defaultPlugins = pluginItems.filter((p) => !p.placement);

      // default — existing "more-options" logic unchanged
      if (defaultPlugins.length > 0) {
        const moreOptionsGroup =
          resultOptions.find((o) => o.key === "more-options") ||
          resultOptions.find((o) => o.key === "info");
        if (moreOptionsGroup) {
          // FABLE5-REVIEW: menu groups are always created with an items
          // array — the non-null assertions keep the original unchecked
          // access.
          moreOptionsGroup.items!.push({
            key: "separator-before-plugins",
            isSeparator: true,
          });
          defaultPlugins.forEach((p) => moreOptionsGroup.items!.push(p));
        } else {
          const externalLinkIdx = resultOptions.findIndex(
            (o) => o.key === "external-link",
          );
          const roomMembersLinkIdx = resultOptions.findIndex(
            (o) => o.key === "link-for-room-members",
          );
          const menuIdx =
            externalLinkIdx !== -1 ? externalLinkIdx : roomMembersLinkIdx;
          const pluginInsertIdx = menuIdx !== -1 ? menuIdx + 1 : 1;

          resultOptions.splice(pluginInsertIdx, 0, {
            id: "option_more-options",
            key: "more-options",
            label: t("Common:MoreOptions"),
            icon: DotsHorizontalUrl,
            items: defaultPlugins,
          });
        }
      }
    }

    const downloadGroupIndex = resultOptions.findIndex(
      (option) => option.key === "download",
    );
    const moveIndex = resultOptions.findIndex(
      (option) => option.key === "move" || option.key === "copy-to",
    );

    if (!item.isRoom) {
      const groups = item.isFolder
        ? [
            ["select", "open", "mark-read", "open-location"],
            [
              "update-xlsx-data",
              "share",
              "move",
              "copy-to",
              "download",
              "download-encrypted",
              "rename",
            ],
            ["mark-as-favorite", "show-info"],
            ["restore"],
            ["remove-from-favorites", "remove-shared-folder-or-file", "delete"],
          ]
        : [
            [
              "select",
              "view",
              "open-pdf",
              "fill-form",
              "edit",
              "start-filling",
              "vectorization",
              "preview",
              "mark-read",
              "open-location",
            ],
            ["filling-status", "reset-and-start-filling"],
            ["ask-ai"],
            [
              "update-xlsx-data",
              "share",
              "move",
              "copy-to",
              "download",
              "download-encrypted",
              "edit-index",
              "rename",
            ],
            [
              "mark-as-favorite",
              "block-unblock-version",
              "custom-filter",
              "info",
              "show-info",
            ],
            ["restore"],
            [
              "remove-from-favorites",
              "remove-shared-folder-or-file",
              "stop-filling",
              "delete",
            ],
          ];

      const items = resultOptions.filter((opt) => !opt.isSeparator);
      const result: TContextOption[] = [];
      let folderSeparatorIndex = 0;

      groups.forEach((group) => {
        const groupItems: TContextOption[] = [];

        group.forEach((key) => {
          const option = items.find((opt) => opt.key === key);
          if (option) groupItems.push(option);
        });

        if (groupItems.length > 0) {
          const isDeleteGroup = group.includes("delete");
          const shouldAddSeparator =
            result.length > 0 && (groupItems.length >= 2 || isDeleteGroup);

          if (group.includes("restore") || group.includes("ask-ai")) {
            result.push({
              key: `separator${folderSeparatorIndex++}`,
              isSeparator: true,
            });
          }

          if (shouldAddSeparator) {
            result.push({
              key: `separator${folderSeparatorIndex++}`,
              isSeparator: true,
            });
          }
          result.push(...groupItems);
        }
      });

      items.forEach((option) => {
        const isInGroups = groups.flat().includes(option.key);
        if (!isInGroups) {
          if (result.length > 0 && !result[result.length - 1].isSeparator) {
            result.push({
              key: `separator${folderSeparatorIndex++}`,
              isSeparator: true,
            });
          }
          result.push(option);
        }
      });

      // Insert plugin items according to their placement
      const newResult = this.placePlugins(result, pluginItems);

      return trimSeparator(newResult as ContextMenuModel[]);
    }

    if (downloadGroupIndex !== -1 && moveIndex !== -1) {
      // If download group is already before move, do nothing
      if (
        downloadGroupIndex < moveIndex &&
        moveIndex - downloadGroupIndex > 1
      ) {
        // If there are other items between them, move download right before move
        const downloadGroup = resultOptions.splice(downloadGroupIndex, 1)[0];
        resultOptions.splice(moveIndex - 1, 0, downloadGroup);
      } else if (downloadGroupIndex > moveIndex) {
        // If download is after move, move it before move
        const downloadGroup = resultOptions.splice(downloadGroupIndex, 1)[0];
        resultOptions.splice(moveIndex, 0, downloadGroup);
      }
    }

    const newResult = this.placePlugins(resultOptions, pluginItems);

    return trimSeparator(newResult as ContextMenuModel[]);
  };

  getGroupContextOptions = (t: TTranslation): ContextMenuModel[] => {
    const { selection, allFilesIsEditing, canConvertSelected } =
      this.filesStore;
    const { setDeleteDialogVisible } = this.dialogsStore;
    const {
      isRecycleBinFolder,
      isRoomsFolder,
      isArchiveFolder,
      isAIAgentsFolder,
    } = this.treeFoldersStore;

    const { pinRooms, unpinRooms, deleteRooms } = this.filesActionsStore;

    if (isRoomsFolder || isArchiveFolder || isAIAgentsFolder) {
      const isPinOption = selection.filter((item) => !item.pinned).length > 0;

      let canDelete: boolean | undefined;
      if (isRoomsFolder) {
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
          ? () => this.onShowEditingToast(t)
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
          ? () => this.onShowEditingToast(t)
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

  // FABLE5-REVIEW: `t` is omitted by non-PDF call sites; the original .js
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
    // FABLE5-REVIEW: the original .js passed a possibly-null selected folder
    // id through unchecked — the non-null assertion keeps that behavior.
    this.oformsStore.setOformFromFolderId(this.selectedFolderStore.id!);
  };

  // TODO: add privacy room check for files
  onUploadAction = (type: "file" | "pdf" | "folder") => {
    const element =
      type === "file"
        ? document.getElementById("customFileInput")
        : type === "pdf"
          ? document.getElementById("customPDFInput")
          : document.getElementById("customFolderInput");

    element?.click();
  };

  onShowFormRoomSelectFileDialog = (
    filter: FilesSelectorFilterTypes | FilterType = FilesSelectorFilterTypes.DOCX,
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
          onClick: () => this.onUploadAction("pdf"),
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

    // FABLE5-REVIEW: Window["DocSpace"]["location"]["state"] is declared as
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

    const { isRoomsFolder, isPrivacyFolder, isFlowsFolder, isAIAgentsFolder } =
      this.treeFoldersStore;
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
      onClick: () => this.onUploadAction("file"),
      icon: ActionsUploadReactSvgUrl,
    };

    const uploadFolder = {
      key: "upload-folder",
      label: t("Common:UploadFolder"),
      onClick: () => this.onUploadAction("folder"),
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
          onClick: () => this.onUploadAction("file"),
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
      !isPrivacyFolder
    ) {
      const pluginItems: TContextOption[] = [];

      mainButtonItemsList.forEach((option) => {
        // FABLE5-REVIEW: identical to the original `{ key, ...value }` spread
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

