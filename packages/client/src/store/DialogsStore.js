// (c) Copyright Ascensio System SIA 2009-2024
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

import { getNewFiles } from "@docspace/shared/api/files";
import {
  EmployeeType,
  FilesSelectorFilterTypes,
  FilterType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { makeAutoObservable, runInAction } from "mobx";
import { Events } from "@docspace/shared/enums";

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
  copyPanelVisible = false;
  deleteThirdPartyDialogVisible = false;
  connectDialogVisible = false;
  thirdPartyMoveDialogVisible = false;
  deleteDialogVisible = false;
  downloadDialogVisible = false;
  emptyTrashDialogVisible = false;
  newFilesPanelVisible = false;
  editGroupMembersDialogVisible = false;
  conflictResolveDialogVisible = false;
  convertDialogVisible = false;
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
  newFilesIds = null;
  newFiles = null;
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
  changeUserTypeDialogVisible = false;
  editLinkPanelIsVisible = false;
  embeddingPanelData = { visible: false, item: null };
  submitToGalleryDialogVisible = false;
  linkParams = null;
  leaveRoomDialogVisible = false;
  changeRoomOwnerIsVisible = false;
  editMembersGroup = null;
  pdfFormEditVisible = false;
  pdfFormEditData = null;

  shareFolderDialogVisible = false;
  cancelUploadDialogVisible = false;

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
  invitePaidUsersCount = 0;
  isNewQuotaItemsByCurrentUser = false;

  covers = null;
  cover = null;
  coverSelection = null;

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

  setEventDialogVisible = (eventDialogVisible) => {
    this.eventDialogVisible = eventDialogVisible;
  };

  setDownloadDialogVisible = (downloadDialogVisible) => {
    this.downloadDialogVisible = downloadDialogVisible;
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
  setNewFilesPanelVisible = async (visible, newId, item) => {
    const { pathParts } = this.selectedFolderStore;

    const id = visible && !newId ? item.id : newId;
    const newIds = newId
      ? [newId]
      : pathParts
        ? pathParts.map((p) => p.id)
        : [];
    item &&
      pathParts.push({
        id: item.id,
        title: item.title,
        roomType: item.roomType,
      });

    let newFilesPanelVisible = visible;

    if (visible) {
      const files = await getNewFiles(id);
      if (files && files.length) {
        this.setNewFiles(files);
        this.setNewFilesIds(newIds);
      } else {
        newFilesPanelVisible = false;
        //   const {
        //     getRootFolder,
        //     updateRootBadge,
        //     treeFolders,
        //   } = this.treeFoldersStore;
        //   const { updateFolderBadge, updateFoldersBadge } = this.filesStore;

        //   if (item) {
        //     const { rootFolderType, id } = item;
        //     const rootFolder = getRootFolder(rootFolderType);
        //     updateRootBadge(rootFolder.id, item.new);
        //     updateFolderBadge(id, item.new);
        //   } else {
        //     const rootFolder = treeFolders.find((x) => x.id === +newIds[0]);
        //     updateRootBadge(rootFolder.id, rootFolder.new);
        //     if (this.selectedFolderStore.id === rootFolder.id)
        //       updateFoldersBadge();
        //   }
      }
    } else {
      this.setNewFilesIds(null);
    }

    this.newFilesPanelVisible = newFilesPanelVisible;
  };

  setNewFilesIds = (newFilesIds) => {
    this.newFilesIds = newFilesIds;
  };

  setNewFiles = (files) => {
    this.newFiles = files;
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

  setInvitePaidUsersCount = (modifier = 1) => {
    this.invitePaidUsersCount = this.invitePaidUsersCount + modifier;
    if (this.invitePaidUsersCount === -1) this.invitePaidUsersCount = 0;
  };

  isPaidUserAccess = (selectedAccess) => {
    return (
      selectedAccess === EmployeeType.Admin ||
      selectedAccess === EmployeeType.Collaborator ||
      selectedAccess === EmployeeType.User
    );
  };

  changeInviteItem = async (item) =>
    runInAction(() => {
      const index = this.inviteItems.findIndex((iItem) => iItem.id === item.id);

      const isPrevAccessPaid = this.isPaidUserAccess(
        this.inviteItems[index].access,
      );
      const isCurrAccessPaid = this.isPaidUserAccess(item.access);

      let modifier = 0;

      if (isPrevAccessPaid && !isCurrAccessPaid) modifier = -1;
      if (!isPrevAccessPaid && isCurrAccessPaid) modifier = 1;

      this.setInvitePaidUsersCount(modifier);

      this.inviteItems[index] = { ...this.inviteItems[index], ...item };
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

  setChangeUserTypeDialogVisible = (changeUserTypeDialogVisible) => {
    this.changeUserTypeDialogVisible = changeUserTypeDialogVisible;
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

  setCancelUploadDialogVisible = (visible) => {
    this.cancelUploadDialogVisible = visible;
  };

  setPdfFormEditVisible = (visible, data) => {
    this.pdfFormEditVisible = visible;
    this.pdfFormEditData = data;
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

  setWarningQuotaDialogVisible = (visible) => {
    this.warningQuotaDialogVisible = visible;
  };

  setRoomLogoCoverDialogVisible = (visible) => {
    this.roomLogoCoverDialogVisible = visible;
  };

  setCovers = (covers) => {
    this.covers = covers;
  };

  setCover = (color, icon) => {
    const newColor = color.replace("#", "");
    const newIcon = typeof icon === "string" ? "" : icon.id;
    this.cover = { color: newColor, cover: newIcon };
  };

  setCoverSelection = (selection) => {
    this.coverSelection = selection;
  };

  setRoomLogoCover = async () => {
    if (!this.coverSelection) return;

    const res = await setRoomCover(this.coverSelection.id, this.cover);
    this.infoPanelStore.updateInfoPanelSelection(res);
  };

  deleteRoomLogo = async () => {
    if (!this.coverSelection) return;
    const res = await removeLogoFromRoom(this.coverSelection.id);
    this.infoPanelStore.updateInfoPanelSelection(res);
  };

  getLogoCoverModel = (t, hasImage) => {
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
            onClick: () => this.deleteRoomLogo(),
          }
        : {
            label: t("RoomLogoCover:CustomizeCover"),
            icon: PenSvgUrl,
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
