import { makeAutoObservable } from "mobx";
import moment from "moment";

import { getUserById } from "@docspace/shared/api/people";
import { getUserRole } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { FolderType, ShareAccessRights } from "@docspace/shared/enums";
import config from "PACKAGE_FILE";
import Filter from "@docspace/shared/api/people/filter";
import { getRoomInfo } from "@docspace/shared/api/rooms";
import {
  getPrimaryLink,
  getExternalLinks,
  editExternalLink,
  addExternalLink,
} from "@docspace/shared/api/files";

const observedKeys = [
  "id",
  "title",
  "thumbnailStatus",
  "thumbnailUrl",
  "version",
  "comment",
  "roomType",
  "rootFolderId",
];

const infoMembers = "info_members";
const infoHistory = "info_history";
// const infoDetails = "info_details";

class InfoPanelStore {
  isVisible = false;
  isMobileHidden = false;

  selection = null;
  selectionHistory = null;
  selectionParentRoom = null;
  selectionHistory = null;

  roomsView = infoMembers;
  fileView = infoHistory;

  updateRoomMembers = null;
  isScrollLocked = false;
  historyWithFileList = false;

  authStore = null;
  settingsStore = null;
  peopleStore = null;
  filesStore = null;
  selectedFolderStore = null;
  treeFoldersStore = null;
  membersList = null;

  shareChanged = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Setters

  setIsVisible = (bool) => {
    this.setView(infoMembers);
    this.isVisible = bool;
    this.isScrollLocked = false;
  };

  setIsMobileHidden = (bool) => (this.isMobileHidden = bool);

  setSelection = (selection) => {
    if (this.getIsAccounts() && (!selection.email || !selection.displayName)) {
      this.selection = selection.length
        ? selection
        : { isSelectedFolder: true };
      return;
    }
    this.selection = selection;
    this.isScrollLocked = false;
  };

  setSelectionParentRoom = (obj) => (this.selectionParentRoom = obj);
  setSelectionHistory = (obj) => (this.selectionHistory = obj);

  setSelectionHistory = (obj) => {
    this.selectionHistory = obj;
    this.historyWithFileList = this.selection.isFolder || this.selection.isRoom;
  };

  resetView = () => {
    this.roomsView = infoMembers;
    this.fileView = infoHistory;
  };

  setView = (view) => {
    this.roomsView = view;
    this.fileView = view === infoMembers ? infoHistory : view;
    this.isScrollLocked = false;
    if (view !== infoMembers) this.setMembersList(null);
  };

  setUpdateRoomMembers = (updateRoomMembers) => {
    this.setMembersList(null);
    this.updateRoomMembers = updateRoomMembers;
  };

  setIsScrollLocked = (isScrollLocked) => {
    this.isScrollLocked = isScrollLocked;
  };

  // Selection helpers //

  getSelectedItems = () => {
    const {
      selection: filesStoreSelection,
      bufferSelection: filesStoreBufferSelection,
    } = this.filesStore;

    const {
      selection: peopleStoreSelection,
      bufferSelection: peopleStoreBufferSelection,
    } = this.peopleStore.selectionStore;
    return this.getIsAccounts()
      ? peopleStoreSelection.length
        ? [...peopleStoreSelection]
        : peopleStoreBufferSelection
          ? [peopleStoreBufferSelection]
          : []
      : filesStoreSelection?.length > 0
        ? [...filesStoreSelection]
        : filesStoreBufferSelection
          ? [filesStoreBufferSelection]
          : [];
  };

  getSelectedFolder = () => {
    const selectedFolderStore = { ...this.selectedFolderStore };

    return {
      ...selectedFolderStore,
      isFolder: true,
      isRoom: !!this.selectedFolderStore.roomType,
    };
  };

  calculateSelection = (
    props = { selectedItems: [], selectedFolder: null }
  ) => {
    const selectedItems = props.selectedItems.length
      ? props.selectedItems
      : this.getSelectedItems();

    const selectedFolder = props.selectedFolder
      ? props.selectedFolder
      : this.getSelectedFolder();

    return selectedItems.length === 0
      ? this.normalizeSelection({
          ...selectedFolder,
          isSelectedFolder: true,
          isSelectedItem: false,
        })
      : selectedItems.length === 1
        ? this.normalizeSelection({
            ...selectedItems[0],
            isSelectedFolder: false,
            isSelectedItem: true,
          })
        : [...Array(selectedItems.length).keys()];
  };

  normalizeSelection = (selection) => {
    const isContextMenuSelection = selection.isContextMenuSelection;
    return {
      ...selection,
      isRoom: selection.isRoom || !!selection.roomType,
      icon: this.getInfoPanelItemIcon(selection, 32),
      isContextMenuSelection: false,
      wasContextMenuSelection: !!isContextMenuSelection,
      canCopyPublicLink:
        selection.access === ShareAccessRights.RoomManager ||
        selection.access === ShareAccessRights.None,
    };
  };

  reloadSelection = () => {
    this.setSelection(this.calculateSelection());
  };

  updateRoomLogoCacheBreaker = () => {
    const logo = this.selection.logo;
    this.setSelection({
      ...this.selection,
      logo: {
        small: logo.small.split("?")[0] + "?" + new Date().getTime(),
        medium: logo.medium.split("?")[0] + "?" + new Date().getTime(),
        large: logo.large.split("?")[0] + "?" + new Date().getTime(),
        original: logo.original.split("?")[0] + "?" + new Date().getTime(),
      },
    });
  };

  reloadSelectionParentRoom = async () => {
    if (!this.getIsRooms) return;

    const currentFolderRoomId =
      this.selectedFolderStore.pathParts &&
      this.selectedFolderStore.pathParts[1]?.id;
    // const prevRoomId = this.selectionParentRoom?.id;

    // if (!currentFolderRoomId || currentFolderRoomId === prevRoomId) return;
    if (!currentFolderRoomId) return;

    const newSelectionParentRoom = await getRoomInfo(currentFolderRoomId);

    // if (prevRoomId === newSelectionParentRoom.id) return;

    const roomIndex = this.selectedFolderStore.navigationPath.findIndex(
      (f) => f.id === currentFolderRoomId
    );
    if (roomIndex > -1) {
      this.selectedFolderStore.navigationPath[roomIndex].title =
        newSelectionParentRoom.title;
    }

    this.setSelectionParentRoom(
      this.normalizeSelection(newSelectionParentRoom)
    );
  };

  isItemChanged = (oldItem, newItem) => {
    for (let i = 0; i < observedKeys.length; i++) {
      const value = observedKeys[i];
      if (oldItem[value] !== newItem[value]) return true;
    }
    return false;
  };

  // Icon helpers //

  getInfoPanelItemIcon = (item, size) => {
    return item.isRoom || !!item.roomType
      ? item.rootFolderType === FolderType.Archive
        ? item.logo && item.logo.medium
        : this.settingsStore.getIcon(
              size,
              null,
              null,
              null,
              item.roomType,
              true
            )
          ? item.logo?.medium
          : item.icon
            ? item.icon
            : this.settingsStore.getIcon(size, null, null, null, item.roomType)
      : item.isFolder
        ? this.settingsStore.getFolderIcon(item.providerKey, size)
        : this.settingsStore.getIcon(size, item.fileExst || ".file");
  };

  // User link actions //

  openUser = async (user, navigate) => {
    if (user.id === this.authStore.userStore.user.id) {
      this.openSelfProfile();
      return;
    }

    const fetchedUser = await this.fetchUser(user.id);
    this.openAccountsWithSelectedUser(fetchedUser, navigate);
  };

  openSelfProfile = () => {
    this.peopleStore.profileActionsStore.onProfileClick();
  };

  openAccountsWithSelectedUser = async (user, navigate) => {
    const path = [
      window.DocSpaceConfig?.proxy?.url,
      config.homepage,
      "/accounts",
    ];

    const newFilter = Filter.getDefault();
    newFilter.page = 0;
    newFilter.search = user.email;
    newFilter.selectUserId = user.id;
    path.push(`filter?${newFilter.toUrlParams()}`);

    this.selectedFolderStore.setSelectedFolder(null);
    this.treeFoldersStore.setSelectedNode(["accounts"]);
    navigate(combineUrl(...path), { state: { user } });
  };

  fetchUser = async (userId) => {
    const { getStatusType, getUserContextOptions } =
      this.peopleStore.usersStore;

    const fetchedUser = await getUserById(userId);
    fetchedUser.role = getUserRole(fetchedUser);
    fetchedUser.statusType = getStatusType(fetchedUser);
    fetchedUser.options = getUserContextOptions(
      false,
      fetchedUser.isOwner,
      fetchedUser.statusType,
      fetchedUser.status
    );

    return fetchedUser;
  };

  // Routing helpers //

  getCanDisplay = () => {
    const pathname = window.location.pathname.toLowerCase();
    const isFiles = this.getIsFiles(pathname);
    const isRooms = this.getIsRooms(pathname);
    const isAccounts = this.getIsAccounts(pathname);
    const isGallery = this.getIsGallery(pathname);
    return isRooms || isFiles || isGallery || isAccounts;
  };

  getIsFiles = (givenPathName) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("files") !== -1 || pathname.indexOf("personal") !== -1
    );
  };

  getIsRooms = (givenPathName) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("rooms") !== -1 && !(pathname.indexOf("personal") !== -1)
    );
  };

  getIsAccounts = (givenPathName) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("accounts") !== -1 && !(pathname.indexOf("view") !== -1)
    );
  };

  getIsGallery = (givenPathName) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return pathname.indexOf("form-gallery") !== -1;
  };

  getIsTrash = (givenPathName) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return pathname.indexOf("files/trash") !== -1;
  };

  setMembersList = (membersList) => {
    this.membersList = membersList;
  };

  openShareTab = () => {
    this.setView("info_share");
    this.isVisible = true;
  };

  getPrimaryFileLink = async (fileId) => {
    const { getFileInfo } = this.filesStore;

    const res = await getPrimaryLink(fileId);
    await getFileInfo(fileId);
    return res;
  };

  getFileLinks = async (fileId) => {
    const res = await getExternalLinks(fileId);
    return res;
  };

  editFileLink = async (
    fileId,
    linkId,
    access,
    primary,
    internal,
    expirationDate
  ) => {
    const { getFileInfo } = this.filesStore;

    const expDate = moment(expirationDate);
    const res = await editExternalLink(
      fileId,
      linkId,
      access,
      primary,
      internal,
      expDate
    );
    await getFileInfo(fileId);
    return res;
  };

  addFileLink = async (fileId, access, primary, internal) => {
    const { getFileInfo } = this.filesStore;

    const res = await addExternalLink(fileId, access, primary, internal);
    await getFileInfo(fileId);
    return res;
  };

  setShareChanged = (shareChanged) => {
    this.shareChanged = shareChanged;
  };
}

export default InfoPanelStore;
