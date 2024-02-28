import { getNewFiles } from "@docspace/shared/api/files";
import { ShareAccessRights } from "@docspace/shared/enums";
import { makeAutoObservable, runInAction } from "mobx";
import { Events } from "@docspace/shared/enums";

class DialogsStore {
  authStore;
  treeFoldersStore;
  filesStore;
  selectedFolderStore;
  versionHistoryStore;
  infoPanelStore;

  ownerPanelVisible = false;
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
  convertPasswordDialogVisible = false;
  inviteUsersWarningDialogVisible = false;
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
  embeddingPanelIsVisible = false;
  submitToGalleryDialogVisible = false;
  linkParams = null;
  leaveRoomDialogVisible = false;
  changeRoomOwnerIsVisible = false;
  changeRoomOwnerData = null;
  editMembersGroupId = null;

  shareFolderDialogVisible = false;

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

  setChangeOwnerPanelVisible = (ownerPanelVisible) => {
    this.ownerPanelVisible = ownerPanelVisible;
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

  setEditMembersGroupId = (editMembersGroupId) => {
    this.editMembersGroupId = editMembersGroupId;
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

  createMasterForm = async (fileInfo) => {
    let newTitle = fileInfo.title;
    newTitle = newTitle.substring(0, newTitle.lastIndexOf("."));

    const event = new Event(Events.CREATE);

    const payload = {
      extension: "docxf",
      id: -1,
      title: `${newTitle}.docxf`,
      templateId: fileInfo.id,
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

  changeInviteItem = async (item) =>
    runInAction(() => {
      const index = this.inviteItems.findIndex((iItem) => iItem.id === item.id);

      this.inviteItems[index] = { ...this.inviteItems[index], ...item };
    });

  setInviteUsersWarningDialogVisible = (inviteUsersWarningDialogVisible) => {
    this.inviteUsersWarningDialogVisible = inviteUsersWarningDialogVisible;
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

  setChangeRoomOwnerIsVisible = (
    visible,
    showBackButton = false,
    setRoomParams,
  ) => {
    this.changeRoomOwnerIsVisible = visible;

    this.changeRoomOwnerData = {
      showBackButton,
      setRoomParams,
    };
  };

  setDeleteLinkDialogVisible = (visible) => {
    this.deleteLinkDialogVisible = visible;
  };

  setEmbeddingPanelIsVisible = (embeddingPanelIsVisible) => {
    this.embeddingPanelIsVisible = embeddingPanelIsVisible;
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
}

export default DialogsStore;
