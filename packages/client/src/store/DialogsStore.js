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

import {
  EmployeeType,
  FilesSelectorFilterTypes,
  ShareAccessRights,
  Events,
} from "@docspace/shared/enums";
import { makeAutoObservable, runInAction } from "mobx";

import TrashIconSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import PenSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import UploadSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";

import {
  getRoomCovers,
  setRoomCover,
  removeLogoFromRoom,
} from "@docspace/shared/api/rooms";

class DialogsStore {
  authStore;

  treeFoldersStore;

  filesStore;

  selectedFolderStore;

  versionHistoryStore;

  infoPanelStore;

  moveToPanelVisible = false;

  restorePanelVisible = false;

  reorderDialogVisible = false;

  copyPanelVisible = false;

  deleteThirdPartyDialogVisible = false;

  connectDialogVisible = false;

  deleteDialogVisible = false;

  lifetimeDialogVisible = false;

  lifetimeDialogCB = null;

  downloadDialogVisible = false;

  emptyTrashDialogVisible = false;

  editGroupMembersDialogVisible = false;

  conflictResolveDialogVisible = false;

  convertDialogVisible = false;

  convertDialogData = null;

  selectFileDialogVisible = false;

  selectFileFormRoomDialogVisible = false;

  convertPasswordDialogVisible = false;

  inviteQuotaWarningDialogVisible = false;

  changeQuotaDialogVisible = false;

  unsavedChangesDialogVisible = false;

  moveToPublicRoomVisible = false;

  moveToPublicRoomData = null;

  backupToPublicRoomVisible = false;

  backupToPublicRoomData = null;

  isFolderActions = false;

  roomCreation = false;

  culture = {
    key: "",
    label: "",
  };

  invitePanelOptions = {
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

  removeItem = null;

  connectItem = null;

  formItem = null;

  destFolderId = null;

  conflictResolveDialogData = null;

  conflictResolveDialogItems = null;

  removeMediaItem = null;

  unsubscribe = null;

  isRoomDelete = false;

  convertItem = null;

  formCreationInfo = null;

  saveThirdpartyResponse = null;

  inviteItems = [];

  restoreAllArchive = false;

  isConnectDialogReconnect = false;

  saveAfterReconnectOAuth = false;

  createRoomDialogVisible = false;

  createRoomConfirmDialogVisible = false;

  editLinkPanelIsVisible = false;

  embeddingPanelData = { visible: false, item: null };

  submitToGalleryDialogVisible = false;

  linkParams = null;

  leaveRoomDialogVisible = false;

  changeRoomOwnerIsVisible = false;

  editMembersGroup = null;

  closeEditIndexDialogVisible = false;

  shareFolderDialogVisible = false;

  cancelUploadDialogVisible = false;

  passwordEntryDialogDate = {
    visible: false,
    item: null,
    isDownload: false,
  };

  createRoomTemplateDialogVisible = false;

  templateAccessSettingsVisible = false;

  templateEventVisible = false;

  selectFileFormRoomFilterParam = FilesSelectorFilterTypes.DOCX;

  selectFileFormRoomOpenRoot = false;

  fillPDFDialogData = {
    visible: false,
    data: null,
  };

  shareCollectSelector = {
    visible: false,
    file: null,
  };

  warningQuotaDialogVisible = false;

  isNewQuotaItemsByCurrentUser = false;

  guestReleaseTipDialogVisible = false;

  covers = null;

  cover = null;

  coverSelection = null;

  roomCoverDialogProps = {
    icon: null,
    color: null,
    title: null,
    withoutIcon: true,
    withSelection: true,
    customColor: null,
  };

  editRoomDialogProps = {
    visible: false,
    item: null,
    onClose: null,
  };

  createRoomDialogProps = {
    title: "",
    visible: false,
    onClose: null,
  };

  newFilesPanelFolderId = null;

  sortedDownloadFiles = {
    other: [],
    password: [],
    remove: [],
    original: [],
  };

  downloadItems = [];

  operationCancelVisible = false;

  constructor(
    authStore,
    treeFoldersStore,
    filesStore,
    selectedFolderStore,
    versionHistoryStore,
    infoPanelStore,
  ) {
    makeAutoObservable(this);

    this.treeFoldersStore = treeFoldersStore;
    this.filesStore = filesStore;
    this.selectedFolderStore = selectedFolderStore;
    this.authStore = authStore;
    this.versionHistoryStore = versionHistoryStore;
    this.infoPanelStore = infoPanelStore;
  }

  setNewFilesPanelFolderId = (folderId) => {
    this.newFilesPanelFolderId = folderId;
  };

  setGuestReleaseTipDialogVisible = (visible) => {
    this.guestReleaseTipDialogVisible = visible;
  };

  setEditRoomDialogProps = (props) => {
    this.editRoomDialogProps = props;
  };

  setCreateRoomDialogProps = (props) => {
    this.createRoomDialogProps = props;
  };

  setInviteLanguage = (culture) => {
    this.culture = culture;
  };

  setIsRoomDelete = (isRoomDelete) => {
    this.isRoomDelete = isRoomDelete;
  };

  setRestoreAllArchive = (restoreAllArchive) => {
    this.restoreAllArchive = restoreAllArchive;
  };

  setArchiveDialogVisible = (visible) => {
    this.archiveDialogVisible = visible;
  };

  setRestoreRoomDialogVisible = (visible) => {
    this.restoreRoomDialogVisible = visible;
  };

  setIsFolderActions = (isFolderActions) => {
    this.isFolderActions = isFolderActions;
  };

  setOperationCancelVisible = (operationCancelVisible) => {
    this.operationCancelVisible = operationCancelVisible;
  };

  setMoveToPanelVisible = (visible) => {
    if (
      visible &&
      !this.filesStore.hasSelection &&
      !this.filesStore.hasBufferSelection &&
      !this.infoPanelStore.infoPanelSelection
    )
      return;

    this.moveToPanelVisible = visible;
  };

  setRestorePanelVisible = (visible) => {
    !visible && this.deselectActiveFiles();

    if (
      visible &&
      !this.filesStore.hasSelection &&
      !this.filesStore.hasBufferSelection
    )
      return;

    this.restorePanelVisible = visible;
  };

  setRestoreAllPanelVisible = (visible) => {
    this.restoreAllPanelVisible = visible;
  };

  setCopyPanelVisible = (visible) => {
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

  setRoomCreation = (roomCreation) => {
    this.roomCreation = roomCreation;
  };

  setSaveThirdpartyResponse = (saveThirdpartyResponse) => {
    this.saveThirdpartyResponse = saveThirdpartyResponse;
  };

  setConnectDialogVisible = (connectDialogVisible) => {
    if (!connectDialogVisible) this.setConnectItem(null);
    this.connectDialogVisible = connectDialogVisible;
    if (!this.connectDialogVisible) this.setRoomCreation(false);
  };

  setRemoveItem = (removeItem) => {
    this.removeItem = removeItem;
  };

  setDeleteThirdPartyDialogVisible = (deleteThirdPartyDialogVisible) => {
    this.deleteThirdPartyDialogVisible = deleteThirdPartyDialogVisible;
  };

  setDeleteDialogVisible = (deleteDialogVisible) => {
    this.deleteDialogVisible = deleteDialogVisible;
  };

  setLifetimeDialogVisible = (lifetimeDialogVisible, cb) => {
    this.lifetimeDialogVisible = lifetimeDialogVisible;
    this.lifetimeDialogCB = cb;
  };

  setEventDialogVisible = (eventDialogVisible) => {
    this.eventDialogVisible = eventDialogVisible;
  };

  setDownloadDialogVisible = (downloadDialogVisible) => {
    this.downloadDialogVisible = downloadDialogVisible;
  };

  getDownloadItems = (itemList, t) => {
    const files = [];
    const folders = [];
    let singleFileUrl = null;

    itemList.forEach((item) => {
      if (item.checked) {
        if (!!item.fileExst || item.contentLength) {
          const format =
            !item.format || item.format === t("OriginalFormat")
              ? item.fileExst
              : item.format;
          if (!singleFileUrl) {
            singleFileUrl = item.viewUrl;
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

  setDownloadItems = (downloadItems) => {
    this.downloadItems = downloadItems;
  };

  get sortedPasswordFiles() {
    const original = this.sortedDownloadFiles.original ?? [];
    const other = this.sortedDownloadFiles.other ?? [];
    const password = this.sortedDownloadFiles.password ?? [];
    const remove = this.sortedDownloadFiles.remove ?? [];

    return [...other, ...original, ...password, ...remove];
  }

  updateDownloadedFilePassword = (id, password, type) => {
    const currentType = this.sortedDownloadFiles[type];

    let originItem;
    const newArray = currentType.filter((item) => {
      if (item.id === id) {
        originItem = item;
        return false;
      }
      return true;
    });

    if (type === "remove") this.downloadItems.push({ ...originItem, password });
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
      originItem,
    ];
  };

  resetDownloadedFileFormat = (id, fileExst, type) => {
    const currentType = this.sortedDownloadFiles[type];

    let originItem;
    const newArray = currentType.filter((item) => {
      if (item.id === id) {
        originItem = item;
        return false;
      }
      return true;
    });

    if (type === "remove")
      this.downloadItems.push({
        ...originItem,
        format: fileExst,
        oldFormat: originItem.format,
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
      originItem,
    ];
  };

  discardDownloadedFile = (id, type) => {
    const newFileIds = this.downloadItems.filter((item) => item.id !== id);
    this.downloadItems = [...newFileIds];

    const currentType = this.sortedDownloadFiles[type];

    let removedItem = null;
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
      removedItem,
    ];
  };

  setSortedPasswordFiles = (object) => {
    this.sortedDownloadFiles = { ...object };
  };

  setEmptyTrashDialogVisible = (emptyTrashDialogVisible) => {
    this.emptyTrashDialogVisible = emptyTrashDialogVisible;
  };

  setConnectItem = (connectItem) => {
    this.connectItem = connectItem;
  };

  setIsConnectDialogReconnect = (isConnectDialogReconnect) => {
    this.isConnectDialogReconnect = isConnectDialogReconnect;
  };

  setSaveAfterReconnectOAuth = (saveAfterReconnectOAuth) => {
    this.saveAfterReconnectOAuth = saveAfterReconnectOAuth;
  };

  setDestFolderId = (destFolderId) => {
    this.destFolderId = destFolderId;
  };

  setChangeQuotaDialogVisible = (changeQuotaDialogVisible) => {
    this.changeQuotaDialogVisible = changeQuotaDialogVisible;
  };

  setEditGroupMembersDialogVisible = (editGroupMembersDialogVisible) => {
    this.editGroupMembersDialogVisible = editGroupMembersDialogVisible;
  };

  setEditMembersGroup = (editMembersGroup) => {
    this.editMembersGroup = editMembersGroup;
  };

  setConflictResolveDialogVisible = (conflictResolveDialogVisible) => {
    this.conflictResolveDialogVisible = conflictResolveDialogVisible;
  };

  setConflictResolveDialogData = (data) => {
    this.conflictResolveDialogData = data;
  };

  setConflictResolveDialogItems = (items) => {
    this.conflictResolveDialogItems = items;
  };

  setRemoveMediaItem = (removeMediaItem) => {
    this.removeMediaItem = removeMediaItem;
  };

  setUnsubscribe = (unsubscribe) => {
    this.unsubscribe = unsubscribe;
  };

  setConvertDialogVisible = (visible) => {
    this.convertDialogVisible = visible;
  };

  setConvertDialogData = (convertDialogData) => {
    this.convertDialogData = convertDialogData;
  };

  setConvertPasswordDialogVisible = (visible) => {
    this.convertPasswordDialogVisible = visible;
  };

  setFormCreationInfo = (item) => {
    this.formCreationInfo = item;
  };

  setConvertItem = (item) => {
    this.convertItem = item;
  };

  setSelectFileDialogVisible = (visible) => {
    this.selectFileDialogVisible = visible;
  };

  /**
   *  @param {boolean} visible
   *  @param {FilesSelectorFilterTypes | FilterType} [filterParam = FilesSelectorFilterTypes.DOCX]
   *  @param {boolean} [openRoot = false]
   */
  setSelectFileFormRoomDialogVisible = (
    visible,
    filterParam = FilesSelectorFilterTypes.DOCX,
    openRoot = false,
  ) => {
    this.selectFileFormRoomDialogVisible = visible;
    this.selectFileFormRoomFilterParam = filterParam;
    this.selectFileFormRoomOpenRoot = openRoot;
  };

  createMasterForm = async (fileInfo, options) => {
    const { extension = "pdf", withoutDialog, preview } = options;

    const newTitle = fileInfo.title;

    let lastIndex = newTitle.lastIndexOf(".");

    if (lastIndex === -1) {
      lastIndex = newTitle.length;
    }

    const event = new Event(Events.CREATE);

    const title = newTitle.substring(0, lastIndex);

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

  setInvitePanelOptions = (invitePanelOptions) => {
    this.invitePanelOptions = invitePanelOptions;
  };

  setInviteItems = (inviteItems) => {
    this.inviteItems = inviteItems;
  };

  isPaidUserAccess = (selectedAccess) => {
    return (
      selectedAccess === EmployeeType.Admin ||
      selectedAccess === EmployeeType.RoomAdmin
    );
  };

  changeInviteItem = async (item) =>
    runInAction(() => {
      const index = this.inviteItems.findIndex((iItem) => iItem.id === item.id);

      this.inviteItems[index] = {
        ...this.inviteItems[index],
        ...item,
        warning: false,
      };
    });

  setQuotaWarningDialogVisible = (inviteQuotaWarningDialogVisible) => {
    this.inviteQuotaWarningDialogVisible = inviteQuotaWarningDialogVisible;
  };

  setIsNewRoomByCurrentUser = (value) => {
    this.isNewRoomByCurrentUser = value;
  };

  setIsNewUserByCurrentUser = (value) => {
    this.isNewUserByCurrentUser = value;
  };

  setCreateRoomDialogVisible = (createRoomDialogVisible) => {
    this.createRoomDialogVisible = createRoomDialogVisible;
  };

  setCreateRoomConfirmDialogVisible = (createRoomConfirmDialogVisible) => {
    this.createRoomConfirmDialogVisible = createRoomConfirmDialogVisible;
  };

  setSubmitToGalleryDialogVisible = (submitToGalleryDialogVisible) => {
    this.submitToGalleryDialogVisible = submitToGalleryDialogVisible;
  };

  setFormItem = (formItem) => {
    if (formItem && !formItem.exst) {
      const splitted = formItem.title.split(".");
      formItem.title = splitted.slice(0, -1).join(".");
      formItem.exst = splitted.length !== 1 ? `.${splitted.at(-1)}` : null;
    }
    this.formItem = formItem;
  };

  setLinkParams = (linkParams) => {
    this.linkParams = linkParams;
  };

  setUnsavedChangesDialog = (unsavedChangesDialogVisible) => {
    this.unsavedChangesDialogVisible = unsavedChangesDialogVisible;
  };

  setEditLinkPanelIsVisible = (editLinkPanelIsVisible) => {
    this.editLinkPanelIsVisible = editLinkPanelIsVisible;
  };

  setLeaveRoomDialogVisible = (visible) => {
    this.leaveRoomDialogVisible = visible;
  };

  setChangeRoomOwnerIsVisible = (visible) => {
    this.changeRoomOwnerIsVisible = visible;
  };

  setDeleteLinkDialogVisible = (visible) => {
    this.deleteLinkDialogVisible = visible;
  };

  setEmbeddingPanelData = (embeddingPanelData) => {
    this.embeddingPanelData = embeddingPanelData;
  };

  setMoveToPublicRoomVisible = (visible, data = null) => {
    this.moveToPublicRoomVisible = visible;
    this.moveToPublicRoomData = data;
  };

  setBackupToPublicRoomVisible = (visible, data = null) => {
    this.backupToPublicRoomVisible = visible;
    this.backupToPublicRoomData = data;
  };

  deselectActiveFiles = () => {
    this.filesStore.setSelected("none");
  };

  setShareFolderDialogVisible = (visible) => {
    this.shareFolderDialogVisible = visible;
  };

  /**
   * @param {boolean =} visible
   * @param {import("@docspace/shared/api/rooms/types").TRoom =} item
   * @returns {void}
   */
  setPasswordEntryDialog = (
    visible = false,
    item = null,
    isDownload = false,
  ) => {
    this.passwordEntryDialogDate = {
      visible,
      item,
      isDownload,
    };
  };

  setCancelUploadDialogVisible = (visible) => {
    this.cancelUploadDialogVisible = visible;
  };

  setReorderDialogVisible = (visible) => {
    this.reorderDialogVisible = visible;
  };

  setFillPDFDialogData = (visible, data) => {
    this.fillPDFDialogData = {
      visible,
      data,
    };
  };

  /**
   * @param {boolean} visible
   * @param {import("@docspace/shared/api/files/types").TFile} [file = null]
   * @returns {void}
   */
  setShareCollectSelector = (visible, file = null) => {
    this.shareCollectSelector = {
      visible,
      file,
    };
  };

  setCreateRoomTemplateDialogVisible = (visible) => {
    this.createRoomTemplateDialogVisible = visible;
  };

  setTemplateAccessSettingsVisible = (isVisible) => {
    this.templateAccessSettingsVisible = isVisible;
  };

  setTemplateEventVisible = (isVisible) => {
    this.templateEventVisible = isVisible;
  };

  setWarningQuotaDialogVisible = (visible) => {
    this.warningQuotaDialogVisible = visible;
  };

  setRoomLogoCoverDialogVisible = (visible) => {
    this.roomLogoCoverDialogVisible = visible;
  };

  setCloseEditIndexDialogVisible = (visible) => {
    this.closeEditIndexDialogVisible = visible;
  };

  setCovers = (covers) => {
    this.covers = covers;
  };

  setRoomCoverDialogProps = (props) => {
    this.roomCoverDialogProps = props;
  };

  setCover = (color, icon) => {
    if (!color) {
      return (this.cover = null);
    }

    const newColor = color.replace("#", "");
    const newIcon = typeof icon === "string" ? "" : icon.id;
    this.cover = { color: newColor, cover: newIcon };

    this.setRoomCoverDialogProps({
      ...this.roomCoverDialogProps,
      icon: null,
      color: null,
      withoutIcon: true,
    });
  };

  setCoverSelection = (selection) => {
    this.coverSelection = selection;
  };

  setRoomLogoCover = async (roomId) => {
    const res = await setRoomCover(
      roomId || this.coverSelection?.id,
      this.cover,
    );
    this.infoPanelStore.updateInfoPanelSelection(res);
    this.setRoomCoverDialogProps({
      ...this.roomCoverDialogProps,
      withSelection: true,
    });
    this.setCover();
  };

  deleteRoomLogo = async () => {
    if (!this.coverSelection) return;
    const res = await removeLogoFromRoom(this.coverSelection.id);
    this.infoPanelStore.updateInfoPanelSelection(res);
  };

  getLogoCoverModel = (t, hasImage, onDelete) => {
    return [
      {
        label: t("RoomLogoCover:UploadPicture"),
        icon: UploadSvgUrl,
        key: "upload",
        onClick: (ref) => ref.current.click(),
      },

      hasImage
        ? {
            label: t("Common:Delete"),
            icon: TrashIconSvgUrl,
            key: "delete",
            onClick: onDelete ? onDelete() : () => this.deleteRoomLogo(),
          }
        : {
            label: t("RoomLogoCover:CustomizeCover"),
            icon: PenSvgUrl,
            key: "cover",
            onClick: () => this.setRoomLogoCoverDialogVisible(true),
          },
    ];
  };

  getCovers = async () => {
    const response = await getRoomCovers();

    this.setCovers(response);
  };
}

export default DialogsStore;
