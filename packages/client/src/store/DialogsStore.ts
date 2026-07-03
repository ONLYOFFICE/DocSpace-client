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

import {
  EmployeeType,
  FilesSelectorFilterTypes,
  ShareAccessRights,
  Events,
} from "@docspace/shared/enums";
import type { FilterType, RoomsType } from "@docspace/shared/enums";
import { makeAutoObservable, runInAction } from "mobx";
import type { RefObject } from "react";

import TrashIconSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import PenSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import UploadSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import { ROOM_ACTION_KEYS } from "@docspace/shared/constants";

import {
  getRoomCovers,
  setRoomCover,
  removeLogoFromRoom,
  createGroupRooms,
  getRoomGroups,
  getGroupById,
  updateGroupIcon,
  updateRoomGroup,
  deleteRoomGroup,
} from "@docspace/shared/api/rooms";

import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { ExternalSyncDB, TRoom } from "@docspace/shared/api/rooms/types";
import type { TGroup } from "@docspace/shared/api/groups/types";
import type {
  BackupToPublicRoomOptionType,
  LinkParamsType,
  Nullable,
  ThirdPartyAccountType,
  TTranslation,
} from "@docspace/shared/types";
import type { AuthStore } from "@docspace/shared/store/AuthStore";

import type {
  ICover,
  ILogoCover,
  IRoomCoverDialogProps,
} from "SRC_DIR/components/dialogs/RoomLogoCoverDialog/RoomLogoCoverDialog.types";
import type {
  ICreateRoomGroup,
  IRoomGroup,
  IUpdateRoomGroup,
} from "SRC_DIR/components/dialogs/EditRoomGroupsDialog/EditRoomGroupsDialog.types";
import type { TConflictResolveDialogData } from "SRC_DIR/components/dialogs/ConflictResolveDialog/ConflictResolveDialog.types";
import type { TModel } from "@docspace/ui-kit/components/room-icon";

import type InfoPanelStore from "./InfoPanelStore";
import type SelectedFolderStore from "./SelectedFolderStore";
import type TreeFoldersStore from "./TreeFoldersStore";
import type VersionHistoryStore from "./VersionHistoryStore";

// FABLE5-REVIEW: FilesStore is still .js (wave 3) — replace this structural
// type with `import type` once it is converted.
type TFilesStore = {
  hasSelection: boolean;
  hasBufferSelection: boolean;
  setSelected: (selected: "none") => void;
};

// FABLE5-REVIEW: connectItem is filled by several still-.js code paths
// (FilesActionsStore/ContextOptionsStore spread provider + capability
// objects) and by ThirdPartyComboBox with a partial literal, so only a
// partial ThirdPartyAccountType can be guaranteed here.
type TConnectItem = Partial<ThirdPartyAccountType> & {
  customer_title?: string;
};

// FABLE5-REVIEW: download items are file view-models produced by the
// still-.js DownloadDialog/FilesActionsStore; minimal structural type of
// the members used in this store.
type TDownloadItem = {
  id: number | string;
  checked?: boolean;
  fileExst?: Nullable<string>;
  contentLength?: number | string;
  format?: Nullable<string>;
  oldFormat?: Nullable<string>;
  viewUrl?: string;
  password?: string;
};

type TDownloadEntry = {
  key: number | string;
  value?: Nullable<string>;
  password?: string;
};

type TSortedDownloadFiles = {
  other?: TDownloadItem[];
  password?: TDownloadItem[];
  remove?: TDownloadItem[];
  original?: TDownloadItem[];
};

// FABLE5-REVIEW: invite items are produced by the still-.js InvitePanel;
// minimal structural type of the members used in this store.
type TInviteItem = {
  id: number | string;
  access?: ShareAccessRights | EmployeeType;
  warning?: boolean;
};

type TInvitePanelOptions = {
  visible: boolean;
  hideSelector: boolean;
  defaultAccess: ShareAccessRights | EmployeeType;
  roomId?: number | string;
};

// FABLE5-REVIEW: `item`/`cb`/`context`/`startRoomType` extras are set by the
// still-.js GlobalEvents component from CustomEvent payloads.
type TEditRoomDialogProps = {
  visible: boolean;
  item: unknown;
  onClose: Nullable<VoidFunction>;
  cb?: unknown;
};

type TCreateRoomDialogProps = {
  title?: string;
  visible: boolean;
  onClose: Nullable<VoidFunction>;
  startRoomType?: RoomsType;
  isFormsCreate?: boolean;
  item?: unknown;
};

type TCreateAgentDialogProps = {
  title?: string;
  visible: boolean;
  onClose: Nullable<VoidFunction>;
  item?: unknown;
  context?: string;
};

type TEditAgentDialogProps = {
  visible: boolean;
  item: unknown;
  onClose: Nullable<VoidFunction>;
  context?: string;
};

type TCreatePDFFormFileProps = {
  visible: boolean;
  file: Nullable<TFile>;
  localKey?: string;
  onClose: Nullable<VoidFunction>;
};

// FABLE5-REVIEW: formItem is produced by still-.js code
// (SubmitToGalleryDialog flow); only `title`/`fileExst` are used here.
type TFormItem = {
  title: string;
  fileExst?: Nullable<string>;
};

type TCreateMasterFormPayload = {
  extension: string;
  id: number;
  title: string;
  templateId: number;
  withoutDialog?: boolean;
  preview?: boolean;
  edit: boolean;
  toForm: boolean;
};

class DialogsStore {
  authStore: AuthStore;

  treeFoldersStore: TreeFoldersStore;

  filesStore: TFilesStore;

  selectedFolderStore: SelectedFolderStore;

  versionHistoryStore: VersionHistoryStore;

  infoPanelStore: InfoPanelStore;

  moveToPanelVisible = false;

  restorePanelVisible = false;

  reorderDialogVisible = false;

  copyPanelVisible = false;

  deleteThirdPartyDialogVisible = false;

  connectDialogVisible = false;

  deleteDialogVisible = false;

  lifetimeDialogVisible = false;

  reducedRightsData: { visible: boolean; adminName: string } = {
    visible: false,
    adminName: "",
  };

  lifetimeDialogCB: Nullable<VoidFunction> | undefined = null;

  downloadDialogVisible = false;

  emptyTrashDialogVisible = false;

  editGroupMembersDialogVisible = false;

  conflictResolveDialogVisible = false;

  convertDialogVisible = false;

  // FABLE5-REVIEW: convertDialogData is produced/consumed only by still-.js
  // code (ConvertDialog, UploadDataStore, FilesActionsStore, withBadges);
  // shape unknown until those are converted.
  convertDialogData: unknown = null;

  selectFileDialogVisible = false;

  selectFileFormRoomDialogVisible = false;

  convertPasswordDialogVisible = false;

  inviteQuotaWarningDialogVisible = false;

  changeQuotaDialogVisible = false;

  moveToPublicRoomVisible = false;

  // FABLE5-REVIEW: moveToPublicRoomData is an operation-data payload built by
  // still-.js FilesActionsStore/HotkeyStore flows; shape unknown here.
  moveToPublicRoomData: unknown = null;

  backupToPublicRoomVisible = false;

  backupToPublicRoomData: Nullable<BackupToPublicRoomOptionType> = null;

  isFolderActions = false;

  roomCreation = false;

  culture: { key: string; label: string } = {
    key: "",
    label: "",
  };

  invitePanelOptions: TInvitePanelOptions = {
    visible: false,
    hideSelector: false,
    defaultAccess: ShareAccessRights.FullAccess,
  };

  restoreAllPanelVisible = false;

  archiveDialogVisible = false;

  restoreRoomDialogVisible = false;

  roomLogoCoverDialogVisible = false;

  eventDialogVisible = false;

  deleteLinkDialogVisible = false;

  // FABLE5-REVIEW: removeItem is produced/consumed only by still-.js code
  // (DeleteThirdPartyDialog flow); shape unknown until those are converted.
  removeItem: unknown = null;

  connectItem: Nullable<TConnectItem> = null;

  formItem: Nullable<TFormItem> = null;

  destFolderId: Nullable<number | string> = null;

  conflictResolveDialogData: Nullable<TConflictResolveDialogData> = null;

  // FABLE5-REVIEW: conflict items are file/folder view-models set by the
  // still-.js FilesActionsStore; ConflictResolveDialog casts them itself.
  conflictResolveDialogItems: Nullable<unknown[]> = null;

  // FABLE5-REVIEW: removeMediaItem is produced/consumed only by still-.js
  // code; shape unknown until those are converted.
  removeMediaItem: unknown = null;

  // FABLE5-REVIEW: unsubscribe payload is produced/consumed only by still-.js
  // code; shape unknown until those are converted.
  unsubscribe: unknown = null;

  isRoomDelete = false;

  // FABLE5-REVIEW: convertItem is produced/consumed only by still-.js code
  // (ConvertDialog flow); shape unknown until those are converted.
  convertItem: unknown = null;

  // FABLE5-REVIEW: formCreationInfo is produced/consumed only by still-.js
  // code (CreateEvent/ConvertPasswordDialog); shape unknown here.
  formCreationInfo: unknown = null;

  // FABLE5-REVIEW: saveThirdpartyResponse is an untyped saveThirdParty API
  // response (see ThirdPartyComboBox `.then((res: unknown) => ...)`).
  saveThirdpartyResponse: unknown = null;

  inviteItems: TInviteItem[] = [];

  restoreAllArchive = false;

  isConnectDialogReconnect = false;

  saveAfterReconnectOAuth = false;

  createRoomDialogVisible = false;

  createAgentDialogVisible = false;

  createRoomConfirmDialogVisible = false;

  editLinkPanelIsVisible = false;

  // FABLE5-REVIEW: embeddingPanelData.item is set by still-.js code paths
  // (ContextOptionsStore, Members view); EmbeddingPanel casts it itself.
  embeddingPanelData: { visible: boolean; item?: unknown } = {
    visible: false,
    item: null,
  };

  submitToGalleryDialogVisible = false;

  linkParams: Nullable<LinkParamsType> = null;

  leaveRoomDialogVisible = false;

  changeRoomOwnerIsVisible = false;

  editMembersGroup: Nullable<TGroup> = null;

  closeEditIndexDialogVisible = false;

  shareFolderDialogVisible = false;

  cancelUploadDialogVisible = false;

  passwordEntryDialogDate: {
    visible: boolean;
    item: Nullable<TRoom | TFolder | TFile>;
    isDownload: boolean;
  } = {
    visible: false,
    item: null,
    isDownload: false,
  };

  createRoomTemplateDialogVisible = false;

  templateAccessSettingsVisible = false;

  templateEventVisible = false;

  selectFileFormRoomFilterParam: FilesSelectorFilterTypes | FilterType =
    FilesSelectorFilterTypes.DOCX;

  selectFileFormRoomOpenRoot = false;

  fillPDFDialogData: { visible: boolean; data: Nullable<TFile> } = {
    visible: false,
    data: null,
  };

  warningQuotaDialogVisible = false;

  isNewQuotaItemsByCurrentUser = false;

  // FABLE5-REVIEW: isNewRoomByCurrentUser/isNewUserByCurrentUser are never
  // initialized in the class body or constructor — only assigned later via
  // their setters (so they are not observable). `declare` keeps that exact
  // runtime shape (no own property until the setter runs).
  declare isNewRoomByCurrentUser?: boolean;

  declare isNewUserByCurrentUser?: boolean;

  covers: Nullable<ICover[]> = null;

  cover: Nullable<ILogoCover> = null;

  coverSelection: Nullable<TRoom | TFile | TFolder> = null;

  roomCoverDialogProps: IRoomCoverDialogProps = {
    icon: null,
    color: null,
    title: null,
    withoutIcon: true,
    withSelection: true,
    customColor: null,
  };

  editRoomDialogProps: TEditRoomDialogProps = {
    visible: false,
    item: null,
    onClose: null,
  };

  createRoomDialogProps: TCreateRoomDialogProps = {
    title: "",
    visible: false,
    onClose: null,
  };

  createAgentDialogProps: TCreateAgentDialogProps = {
    title: "",
    visible: false,
    onClose: null,
  };

  editAgentDialogProps: TEditAgentDialogProps = {
    visible: false,
    item: null,
    onClose: null,
  };

  createPDFFormFileProps: TCreatePDFFormFileProps = {
    visible: false,
    file: null,
    localKey: "",
    onClose: null,
  };

  aiAgentSelectorDialogProps: { visible: boolean; file: Nullable<TFile> } = {
    visible: false,
    file: null,
  };

  newFilesPanelFolderId: Nullable<number | string> = null;

  formFillingTipsVisible = false;

  welcomeFormFillingTipsVisible = false;

  guidAnimationVisible = false;

  sortedDownloadFiles: TSortedDownloadFiles = {
    other: [],
    password: [],
    remove: [],
    original: [],
  };

  downloadItems: TDownloadItem[] = [];

  fillingStatusPanel = false;

  stopFillingDialogData: { visible: boolean; formId: Nullable<number> } = {
    visible: false,
    formId: null,
  };

  operationCancelVisible = false;

  removeUserConfirmation: {
    visible: boolean;
    callback: Nullable<() => Promise<void>> | undefined;
    isEncryptedRoom: boolean;
  } = {
    visible: false,
    callback: null,
    isEncryptedRoom: false,
  };

  isShareFormData: {
    visible: boolean;
    updateAccessLink?: Nullable<VoidFunction>;
    fileId?: Nullable<number>;
  } = { visible: false, updateAccessLink: null, fileId: null };

  assignRolesDialogData: {
    visible: boolean;
    roomName: string;
    file: Nullable<TFile>;
  } = {
    visible: false,
    roomName: "",
    file: null,
  };

  socialAuthWelcomeDialogVisible = false;

  selectFileAiKnowledgeDialogVisible = false;

  connectAccountDialogVisible = false;

  disconnectAccountDialogVisible = false;

  editRoomGroupsDialogVisible = false;

  createGroupFromRoomIds: Nullable<number[]> = null;

  openInCreateMode = false;

  addRoomToGroupDialogVisible = false;

  addRoomToGroupId: Nullable<string> = null;

  pauseSubmissionsDialogVisible = false;

  askAIConnectDialogVisible = false;

  askAIConnectDialogCallback: Nullable<(res: string) => void> = null;

  pauseSubmissionsDialogCallback: Nullable<(res: boolean) => void> = null;

  roomGroups: IRoomGroup[] = [];

  syncDbData: {
    operationId: Nullable<number>;
    forms: ExternalSyncDB["forms"];
  } = {
    operationId: null,
    forms: [],
  };

  isSyncDbPanelVisible = false;

  constructor(
    authStore: AuthStore,
    treeFoldersStore: TreeFoldersStore,
    filesStore: TFilesStore,
    selectedFolderStore: SelectedFolderStore,
    versionHistoryStore: VersionHistoryStore,
    infoPanelStore: InfoPanelStore,
  ) {
    makeAutoObservable(this);

    this.treeFoldersStore = treeFoldersStore;
    this.filesStore = filesStore;
    this.selectedFolderStore = selectedFolderStore;
    this.authStore = authStore;
    this.versionHistoryStore = versionHistoryStore;
    this.infoPanelStore = infoPanelStore;
  }

  setIsShareFormData = ({
    visible,
    updateAccessLink,
    fileId,
  }: {
    visible: boolean;
    updateAccessLink?: VoidFunction;
    fileId?: number;
  }) => {
    this.isShareFormData = { visible, updateAccessLink, fileId };
  };

  setNewFilesPanelFolderId = (folderId: Nullable<number | string>) => {
    this.newFilesPanelFolderId = folderId;
  };

  setAiAgentSelectorDialogProps = (
    visible: boolean,
    file?: Nullable<TFile>,
  ) => {
    this.aiAgentSelectorDialogProps = {
      visible,
      file:
        file === null ? null : (file ?? this.aiAgentSelectorDialogProps.file),
    };
  };

  setEditRoomDialogProps = (props: TEditRoomDialogProps) => {
    this.editRoomDialogProps = props;
  };

  setCreatePDFFormFile = (props: TCreatePDFFormFileProps) => {
    this.createPDFFormFileProps = props;
  };

  setCreateRoomDialogProps = (props: TCreateRoomDialogProps) => {
    this.createRoomDialogProps = props;
  };

  setCreateAgentDialogProps = (props: TCreateAgentDialogProps) => {
    this.createAgentDialogProps = props;
  };

  setEditAgentDialogProps = (props: TEditAgentDialogProps) => {
    this.editAgentDialogProps = props;
  };

  setInviteLanguage = (culture: { key: string; label: string }) => {
    this.culture = culture;
  };

  setIsRoomDelete = (isRoomDelete: boolean) => {
    this.isRoomDelete = isRoomDelete;
  };

  setRestoreAllArchive = (restoreAllArchive: boolean) => {
    this.restoreAllArchive = restoreAllArchive;
  };

  setArchiveDialogVisible = (visible: boolean) => {
    this.archiveDialogVisible = visible;
  };

  setRestoreRoomDialogVisible = (visible: boolean) => {
    this.restoreRoomDialogVisible = visible;
  };

  setIsFolderActions = (isFolderActions: boolean) => {
    this.isFolderActions = isFolderActions;
  };

  setOperationCancelVisible = (operationCancelVisible: boolean) => {
    this.operationCancelVisible = operationCancelVisible;
  };

  setMoveToPanelVisible = (visible: boolean) => {
    if (
      visible &&
      !this.filesStore.hasSelection &&
      !this.filesStore.hasBufferSelection &&
      !this.infoPanelStore.infoPanelSelection
    )
      return;

    this.moveToPanelVisible = visible;
  };

  setRestorePanelVisible = (visible: boolean) => {
    !visible && this.deselectActiveFiles();

    if (
      visible &&
      !this.filesStore.hasSelection &&
      !this.filesStore.hasBufferSelection
    )
      return;

    this.restorePanelVisible = visible;
  };

  setRestoreAllPanelVisible = (visible: boolean) => {
    this.restoreAllPanelVisible = visible;
  };

  setCopyPanelVisible = (visible: boolean) => {
    if (
      visible &&
      !this.filesStore.hasSelection &&
      !this.filesStore.hasBufferSelection &&
      !this.infoPanelStore.infoPanelSelection
    ) {
      console.log("No files selected");
      return;
    }

    this.copyPanelVisible = visible;
  };

  setRoomCreation = (roomCreation: boolean) => {
    this.roomCreation = roomCreation;
  };

  setSaveThirdpartyResponse = (saveThirdpartyResponse: unknown) => {
    this.saveThirdpartyResponse = saveThirdpartyResponse;
  };

  setConnectDialogVisible = (connectDialogVisible: boolean) => {
    if (!connectDialogVisible) this.setConnectItem(null);
    this.connectDialogVisible = connectDialogVisible;
    if (!this.connectDialogVisible) this.setRoomCreation(false);
  };

  setRemoveItem = (removeItem: unknown) => {
    this.removeItem = removeItem;
  };

  setDeleteThirdPartyDialogVisible = (
    deleteThirdPartyDialogVisible: boolean,
  ) => {
    this.deleteThirdPartyDialogVisible = deleteThirdPartyDialogVisible;
  };

  setDeleteDialogVisible = (deleteDialogVisible: boolean) => {
    this.deleteDialogVisible = deleteDialogVisible;
  };

  setLifetimeDialogVisible = (
    lifetimeDialogVisible: boolean,
    cb?: Nullable<VoidFunction>,
  ) => {
    this.lifetimeDialogVisible = lifetimeDialogVisible;
    this.lifetimeDialogCB = cb;
  };

  setReducedRightsData = (reducedRightsVisible: boolean, adminName = "") => {
    this.reducedRightsData = {
      visible: reducedRightsVisible,
      adminName,
    };
  };

  setEventDialogVisible = (eventDialogVisible: boolean) => {
    this.eventDialogVisible = eventDialogVisible;
  };

  setDownloadDialogVisible = (downloadDialogVisible: boolean) => {
    this.downloadDialogVisible = downloadDialogVisible;
  };

  getDownloadItems = (
    itemList: TDownloadItem[],
    t: TTranslation,
  ): [TDownloadEntry[], (number | string)[], Nullable<string>] => {
    const files: TDownloadEntry[] = [];
    const folders: (number | string)[] = [];
    let singleFileUrl: Nullable<string> = null;

    itemList.forEach((item) => {
      if (item.checked) {
        if (item.fileExst || item.contentLength) {
          const format =
            !item.format || item.format === t("Common:OriginalFormat")
              ? item.fileExst
              : item.format;
          if (!singleFileUrl) {
            // FABLE5-REVIEW: viewUrl is optional on the still-.js download
            // item view-model; the original code assigned it as-is.
            singleFileUrl = item.viewUrl!;
          }
          files.push({
            key: item.id,
            value: format,
            ...(item.password && { password: item.password }),
          });
        } else {
          folders.push(item.id);
        }
      }
    });

    return [files, folders, singleFileUrl];
  };

  setDownloadItems = (downloadItems: TDownloadItem[]) => {
    this.downloadItems = downloadItems;
  };

  get sortedPasswordFiles() {
    const original = this.sortedDownloadFiles.original ?? [];
    const other = this.sortedDownloadFiles.other ?? [];
    const password = this.sortedDownloadFiles.password ?? [];
    const remove = this.sortedDownloadFiles.remove ?? [];

    return [...other, ...original, ...password, ...remove];
  }

  updateDownloadedFilePassword = (
    id: number | string,
    password: string,
    type: keyof TSortedDownloadFiles,
  ) => {
    // FABLE5-REVIEW: the original .js assumed `sortedDownloadFiles[type]` and
    // `originItem` are always found; non-null assertions keep that exact
    // runtime behavior (crash on missing) without adding new guards.
    const currentType = this.sortedDownloadFiles[type]!;

    let originItem: TDownloadItem | undefined;
    const newArray = currentType.filter((item) => {
      if (item.id === id) {
        originItem = item;
        return false;
      }
      return true;
    });

    if (type === "remove")
      this.downloadItems.push({ ...originItem!, password });
    else
      this.downloadItems.forEach((item) => {
        if (item.id === id) {
          item.password = password;
          if (item.oldFormat) item.format = item.oldFormat;
        }
      });

    this.sortedDownloadFiles[type] = [...newArray];

    this.sortedDownloadFiles.password = [
      ...(this.sortedDownloadFiles.password ?? []),
      originItem!,
    ];
  };

  resetDownloadedFileFormat = (
    id: number | string,
    fileExst: Nullable<string>,
    type: keyof TSortedDownloadFiles,
  ) => {
    // FABLE5-REVIEW: same non-null assertions as in
    // updateDownloadedFilePassword — keeps the original .js runtime.
    const currentType = this.sortedDownloadFiles[type]!;

    let originItem: TDownloadItem | undefined;
    const newArray = currentType.filter((item) => {
      if (item.id === id) {
        originItem = item;
        return false;
      }
      return true;
    });

    if (type === "remove")
      this.downloadItems.push({
        ...originItem!,
        format: fileExst,
        oldFormat: originItem!.format,
      });
    else
      this.downloadItems.forEach((item) => {
        if (item.id === id) {
          item.oldFormat = item.format;
          item.format = fileExst;
        }
      });

    this.sortedDownloadFiles[type] = [...newArray];

    this.sortedDownloadFiles.original = [
      ...(this.sortedDownloadFiles.original ?? []),
      originItem!,
    ];
  };

  discardDownloadedFile = (
    id: number | string,
    type: keyof TSortedDownloadFiles,
  ) => {
    const newFileIds = this.downloadItems.filter((item) => item.id !== id);
    this.downloadItems = [...newFileIds];

    // FABLE5-REVIEW: same non-null assertions as in
    // updateDownloadedFilePassword — keeps the original .js runtime.
    const currentType = this.sortedDownloadFiles[type]!;

    let removedItem: Nullable<TDownloadItem> = null;
    const newArray = currentType.filter((item) => {
      if (item.id === id) {
        removedItem = item;
        return false;
      }
      return true;
    });

    this.sortedDownloadFiles[type] = [...newArray];

    this.sortedDownloadFiles.remove = [
      ...(this.sortedDownloadFiles.remove ?? []),
      removedItem!,
    ];
  };

  setSortedPasswordFiles = (object: TSortedDownloadFiles) => {
    this.sortedDownloadFiles = { ...object };
  };

  setEmptyTrashDialogVisible = (emptyTrashDialogVisible: boolean) => {
    this.emptyTrashDialogVisible = emptyTrashDialogVisible;
  };

  setConnectItem = (connectItem: Nullable<TConnectItem>) => {
    this.connectItem = connectItem;
  };

  setIsConnectDialogReconnect = (isConnectDialogReconnect: boolean) => {
    this.isConnectDialogReconnect = isConnectDialogReconnect;
  };

  setSaveAfterReconnectOAuth = (saveAfterReconnectOAuth: boolean) => {
    this.saveAfterReconnectOAuth = saveAfterReconnectOAuth;
  };

  setDestFolderId = (destFolderId: Nullable<number | string>) => {
    this.destFolderId = destFolderId;
  };

  setChangeQuotaDialogVisible = (changeQuotaDialogVisible: boolean) => {
    this.changeQuotaDialogVisible = changeQuotaDialogVisible;
  };

  setEditGroupMembersDialogVisible = (
    editGroupMembersDialogVisible: boolean,
  ) => {
    this.editGroupMembersDialogVisible = editGroupMembersDialogVisible;
  };

  setEditMembersGroup = (editMembersGroup: Nullable<TGroup>) => {
    this.editMembersGroup = editMembersGroup;
  };

  setConflictResolveDialogVisible = (conflictResolveDialogVisible: boolean) => {
    this.conflictResolveDialogVisible = conflictResolveDialogVisible;
  };

  setConflictResolveDialogData = (
    data: Nullable<TConflictResolveDialogData>,
  ) => {
    this.conflictResolveDialogData = data;
  };

  setConflictResolveDialogItems = (items: Nullable<unknown[]>) => {
    this.conflictResolveDialogItems = items;
  };

  setRemoveMediaItem = (removeMediaItem: unknown) => {
    this.removeMediaItem = removeMediaItem;
  };

  setUnsubscribe = (unsubscribe: unknown) => {
    this.unsubscribe = unsubscribe;
  };

  setConvertDialogVisible = (visible: boolean) => {
    this.convertDialogVisible = visible;
  };

  setConvertDialogData = (convertDialogData: unknown) => {
    this.convertDialogData = convertDialogData;
  };

  setConvertPasswordDialogVisible = (visible: boolean) => {
    this.convertPasswordDialogVisible = visible;
  };

  setFormCreationInfo = (item: unknown) => {
    this.formCreationInfo = item;
  };

  setConvertItem = (item: unknown) => {
    this.convertItem = item;
  };

  setSelectFileDialogVisible = (visible: boolean) => {
    this.selectFileDialogVisible = visible;
  };

  setSelectFileFormRoomDialogVisible = (
    visible: boolean,
    filterParam: FilesSelectorFilterTypes | FilterType = FilesSelectorFilterTypes.DOCX,
    openRoot = false,
  ) => {
    this.selectFileFormRoomDialogVisible = visible;
    this.selectFileFormRoomFilterParam = filterParam;
    this.selectFileFormRoomOpenRoot = openRoot;
  };

  setSelectFileAiKnowledgeDialogVisible = (visible: boolean) => {
    this.selectFileAiKnowledgeDialogVisible = visible;
  };

  createMasterForm = async (
    fileInfo: TFile,
    options: {
      extension?: string;
      withoutDialog?: boolean;
      preview?: boolean;
    },
  ) => {
    const { extension = "pdf", withoutDialog, preview } = options;

    const newTitle = fileInfo.title;

    let lastIndex = newTitle.lastIndexOf(".");

    if (lastIndex === -1) {
      lastIndex = newTitle.length;
    }

    const title = newTitle.substring(0, lastIndex);

    const event: CustomEvent & { payload?: TCreateMasterFormPayload } =
      new CustomEvent(Events.CREATE, {
        detail: {
          parentId: this.selectedFolderStore.id,
          context: "dialog",
          extension,
        },
      });

    const payload = {
      extension,
      id: -1,
      title: withoutDialog ? title : `${title}.${extension}`,
      templateId: fileInfo.id,
      withoutDialog,
      preview,
      edit: true,
      toForm: true,
    };

    event.payload = payload;

    window.dispatchEvent(event);
  };

  setInvitePanelOptions = (invitePanelOptions: TInvitePanelOptions) => {
    this.invitePanelOptions = invitePanelOptions;
  };

  setInviteItems = (inviteItems: TInviteItem[]) => {
    this.inviteItems = inviteItems;
  };

  isPaidUserAccess = (selectedAccess: EmployeeType | ShareAccessRights) => {
    return (
      selectedAccess === EmployeeType.Admin ||
      selectedAccess === EmployeeType.RoomAdmin
    );
  };

  changeInviteItem = async (
    item: TInviteItem,
    addExisting?: boolean,
    oldId?: number | string,
  ) =>
    runInAction(() => {
      const index = this.inviteItems.findIndex((iItem) => {
        return iItem.id === (addExisting ? oldId : item.id);
      });

      const addFields = addExisting
        ? { access: this.inviteItems[index].access }
        : this.inviteItems[index];

      this.inviteItems[index] = {
        ...addFields,
        ...item,
        warning: false,
      };
    });

  setQuotaWarningDialogVisible = (inviteQuotaWarningDialogVisible: boolean) => {
    this.inviteQuotaWarningDialogVisible = inviteQuotaWarningDialogVisible;
  };

  setIsNewRoomByCurrentUser = (value: boolean) => {
    this.isNewRoomByCurrentUser = value;
  };

  setIsNewUserByCurrentUser = (value: boolean) => {
    this.isNewUserByCurrentUser = value;
  };

  setCreateRoomDialogVisible = (createRoomDialogVisible: boolean) => {
    this.createRoomDialogVisible = createRoomDialogVisible;
  };

  setCreateAgentDialogVisible = (value: boolean) => {
    this.createAgentDialogVisible = value;
  };

  setCreateRoomConfirmDialogVisible = (
    createRoomConfirmDialogVisible: boolean,
  ) => {
    this.createRoomConfirmDialogVisible = createRoomConfirmDialogVisible;
  };

  setSubmitToGalleryDialogVisible = (submitToGalleryDialogVisible: boolean) => {
    this.submitToGalleryDialogVisible = submitToGalleryDialogVisible;
  };

  setFormItem = (formItem: Nullable<TFormItem>) => {
    if (formItem && !formItem.fileExst) {
      const splitted = formItem.title.split(".");
      formItem.title = splitted.slice(0, -1).join(".");
      formItem.fileExst = splitted.length !== 1 ? `.${splitted.at(-1)}` : null;
    }
    this.formItem = formItem;
  };

  setLinkParams = (linkParams: Nullable<LinkParamsType>) => {
    this.linkParams = linkParams;
  };

  setEditLinkPanelIsVisible = (editLinkPanelIsVisible: boolean) => {
    this.editLinkPanelIsVisible = editLinkPanelIsVisible;
  };

  setLeaveRoomDialogVisible = (visible: boolean) => {
    this.leaveRoomDialogVisible = visible;
  };

  setChangeRoomOwnerIsVisible = (visible: boolean) => {
    this.changeRoomOwnerIsVisible = visible;
  };

  setDeleteLinkDialogVisible = (visible: boolean) => {
    this.deleteLinkDialogVisible = visible;
  };

  setEmbeddingPanelData = (embeddingPanelData: {
    visible: boolean;
    item?: unknown;
  }) => {
    this.embeddingPanelData = embeddingPanelData;
  };

  setMoveToPublicRoomVisible = (visible: boolean, data: unknown = null) => {
    this.moveToPublicRoomVisible = visible;
    this.moveToPublicRoomData = data;
  };

  setBackupToPublicRoomVisible = (
    visible: boolean,
    data: Nullable<BackupToPublicRoomOptionType> = null,
  ) => {
    this.backupToPublicRoomVisible = visible;
    this.backupToPublicRoomData = data;
  };

  deselectActiveFiles = () => {
    this.filesStore.setSelected("none");
  };

  setShareFolderDialogVisible = (visible: boolean) => {
    this.shareFolderDialogVisible = visible;
  };

  setPasswordEntryDialog = (
    visible = false,
    item: Nullable<TRoom | TFolder | TFile> = null,
    isDownload = false,
  ) => {
    this.passwordEntryDialogDate = {
      visible,
      item,
      isDownload,
    };
  };

  setCancelUploadDialogVisible = (visible: boolean) => {
    this.cancelUploadDialogVisible = visible;
  };

  setReorderDialogVisible = (visible: boolean) => {
    this.reorderDialogVisible = visible;
  };

  setFillPDFDialogData = (visible: boolean, data: Nullable<TFile> = null) => {
    this.fillPDFDialogData = {
      visible,
      data,
    };
  };

  setCreateRoomTemplateDialogVisible = (visible: boolean) => {
    this.createRoomTemplateDialogVisible = visible;
  };

  setTemplateAccessSettingsVisible = (isVisible: boolean) => {
    this.templateAccessSettingsVisible = isVisible;
  };

  setTemplateEventVisible = (isVisible: boolean) => {
    this.templateEventVisible = isVisible;
  };

  setWarningQuotaDialogVisible = (visible: boolean) => {
    this.warningQuotaDialogVisible = visible;
  };

  setRoomLogoCoverDialogVisible = (visible: boolean) => {
    this.roomLogoCoverDialogVisible = visible;
  };

  setCloseEditIndexDialogVisible = (visible: boolean) => {
    this.closeEditIndexDialogVisible = visible;
  };

  setFormFillingTipsDialog = (visible: boolean) => {
    this.formFillingTipsVisible = visible;
  };

  setWelcomeFormFillingTipsVisible = (visible: boolean) => {
    this.welcomeFormFillingTipsVisible = visible;
  };

  setCovers = (covers: Nullable<ICover[]>) => {
    this.covers = covers;
  };

  setGuidAnimationVisible = (animation: boolean) => {
    this.guidAnimationVisible = animation;
  };

  setRoomCoverDialogProps = (props: IRoomCoverDialogProps) => {
    this.roomCoverDialogProps = props;
  };

  clearCoverProps = () => {
    this.setRoomCoverDialogProps({
      icon: null,
      color: null,
      title: null,
      withoutIcon: true,
      withSelection: true,
      customColor: null,
    });
  };

  setCover = (color?: Nullable<string>, icon?: string | ICover) => {
    if (!color) {
      return (this.cover = null);
    }

    const newColor = color.replace("#", "");
    // FABLE5-REVIEW: the original .js read `icon.id` without a guard — every
    // caller passing a truthy color also passes an icon; `!` keeps that
    // runtime.
    const newIcon = typeof icon === "string" ? "" : icon!.id;
    this.cover = { color: newColor, cover: newIcon };

    this.setRoomCoverDialogProps({
      ...this.roomCoverDialogProps,
      icon: null,
      color: null,
      withoutIcon: true,
    });
  };

  setCoverSelection = (selection: Nullable<TRoom | TFile | TFolder>) => {
    runInAction(() => {
      this.coverSelection = selection;
    });
  };

  setRoomLogoCover = async (roomId?: number | string) => {
    await setRoomCover(roomId || this.coverSelection?.id, this.cover);

    this.setRoomCoverDialogProps({
      ...this.roomCoverDialogProps,
      withSelection: true,
    });
    this.setCover();
  };

  deleteRoomLogo = async () => {
    console.log(this.coverSelection);
    if (!this.coverSelection) return;

    await removeLogoFromRoom(this.coverSelection.id);
  };

  getLogoCoverModel = (
    t: TTranslation,
    // FABLE5-REVIEW: callers pass truthy strings (logo urls) as well as
    // booleans — only truthiness is used here; the union keeps the original
    // call sites type-checking without runtime change.
    hasImage: boolean | string | undefined,
    onDelete?: () => () => void,
  ): TModel[] => {
    return [
      {
        label: t("Common:UploadPicture"),
        icon: UploadSvgUrl,
        key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_UPLOAD,
        // FABLE5-REVIEW: the original .js called `ref.current.click()`
        // without null guards; `!` keeps that runtime.
        onClick: (ref?: RefObject<Nullable<HTMLInputElement>>) =>
          ref!.current!.click(),
      },

      hasImage
        ? {
            label: t("Common:Delete"),
            icon: TrashIconSvgUrl,
            key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_DELETE,
            onClick: onDelete ? onDelete() : () => this.deleteRoomLogo(),
          }
        : {
            label: t("Common:CustomizeCover"),
            icon: PenSvgUrl,
            key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_CUSTOMIZE_COVER,
            onClick: () => this.setRoomLogoCoverDialogVisible(true),
          },
    ];
  };

  getCovers = async () => {
    // FABLE5-REVIEW: getRoomCovers/getRoomGroups/getGroupById are untyped in
    // shared/api (they return `request(options)` without a generic) — cast
    // at the call sites.
    const response = (await getRoomCovers()) as ICover[];

    this.setCovers(response);
  };

  setFillingStatusPanelVisible = (visible: boolean) => {
    this.fillingStatusPanel = visible;
  };

  setStopFillingDialogVisible = (
    visible: boolean,
    formId: Nullable<number> = null,
  ) => {
    this.stopFillingDialogData = {
      visible,
      formId,
    };
  };

  setRemoveUserConfirmation = (
    visible: boolean,
    callback: Nullable<() => Promise<void>> = null,
    isEncryptedRoom = false,
  ) => {
    this.removeUserConfirmation = {
      visible,
      callback,
      isEncryptedRoom,
    };
  };

  setAssignRolesDialogData = (
    visible: boolean,
    roomName = "",
    file: Nullable<TFile> = null,
  ) => {
    this.assignRolesDialogData = { visible, roomName, file };
  };

  setSocialAuthWelcomeDialogVisible = (visible: boolean) => {
    this.socialAuthWelcomeDialogVisible = visible;
  };

  setConnectAccountDialogVisible = (visible: boolean) => {
    this.connectAccountDialogVisible = visible;
  };

  setDisconnectAccountDialogVisible = (visible: boolean) => {
    this.disconnectAccountDialogVisible = visible;
  };

  setEditRoomGroupsDialogVisible = (
    visible: boolean,
    roomIds: Nullable<number[]> = null,
    openInCreateMode = false,
  ) => {
    this.editRoomGroupsDialogVisible = visible;
    this.createGroupFromRoomIds = roomIds;
    this.openInCreateMode = openInCreateMode;
  };

  setAddRoomToGroupDialogVisible = (
    visible: boolean,
    groupId: Nullable<string> = null,
  ) => {
    this.addRoomToGroupDialogVisible = visible;
    this.addRoomToGroupId = groupId;
  };

  setPauseSubmissionsDialogVisible = (
    visible: boolean,
    callback: Nullable<(res: boolean) => void> = null,
  ) => {
    this.pauseSubmissionsDialogVisible = visible;
    this.pauseSubmissionsDialogCallback = callback;
  };

  setCreateGroupRooms = async (newGroup: ICreateRoomGroup) => {
    await createGroupRooms(newGroup);
  };

  setRoomGroups = (groups: IRoomGroup[]) => {
    this.roomGroups = groups;
  };

  getAllRoomGroups = async () => {
    const response = (await getRoomGroups()) as IRoomGroup[];
    this.setRoomGroups(response);
  };

  getGroupById = async (groupId: string) => {
    const response = (await getGroupById(groupId)) as IRoomGroup;
    return response;
  };

  updateGroupIcon = async (groupId: string, icon: Nullable<string>) => {
    await updateGroupIcon(groupId, icon);
  };

  updateRoomGroup = async (groupId: string, data: IUpdateRoomGroup) => {
    await updateRoomGroup(groupId, data);
  };

  deleteRoomGroup = async (groupId: string) => {
    await deleteRoomGroup(groupId);
  };

  setAskAIConnectDialogVisible = (
    visible: boolean,
    callback: Nullable<(res: string) => void> = null,
  ) => {
    this.askAIConnectDialogVisible = visible;
    this.askAIConnectDialogCallback = callback;
  };

  setSyncDbForms = (data: {
    operationId: Nullable<number>;
    forms: ExternalSyncDB["forms"];
  }) => {
    this.syncDbData = data;
  };

  setIsSyncDbPanelVisible = (visible: boolean) => {
    this.isSyncDbPanelVisible = visible;
  };
}

export default DialogsStore;
