import { makeAutoObservable } from "mobx";

import { getUserById } from "@docspace/shared/api/people";
import { getUserRole } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { FolderType, ShareAccessRights } from "@docspace/shared/enums";
import config from "PACKAGE_FILE";
import Filter from "@docspace/shared/api/people/filter";
import { getRoomInfo } from "@docspace/shared/api/rooms";

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

  infoPanelSelection = null;
  selectionHistory = null;
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

  infoPanelSelection = null;
  infoPanelRoom = null;

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

  setSelectionHistory = (obj) => (this.selectionHistory = obj);

  setSelectionHistory = (obj) => {
    this.selectionHistory = obj;
    this.historyWithFileList =
      this.infoPanelSelection.isFolder || this.infoPanelSelection.isRoom;
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

    const isRooms = this.getIsRooms();

    if (isRooms && view === infoMembers) {
      const selectedFolder =
        view === infoMembers && this.infoPanelRoom
          ? this.infoPanelRoom
          : this.selectedFolderStore.getSelectedFolder();
      this.setInfoPanelSelection(this.normalizeSelection(selectedFolder));
    } else {
      this.setInfoPanelSelection(this.calculateSelection());
    }
  };

  setUpdateRoomMembers = (updateRoomMembers) => {
    this.setMembersList(null);
    this.updateRoomMembers = updateRoomMembers;
  };

  setIsScrollLocked = (isScrollLocked) => {
    this.isScrollLocked = isScrollLocked;
  };

  // Selection helpers //

  get infoPanelSelectedItems() {
    const { selection: filesSelection, bufferSelection: filesBufferSelection } =
      this.filesStore;

    const {
      selection: peopleSelection,
      bufferSelection: peopleBufferSelection,
    } = this.peopleStore.selectionStore;

    return this.getIsAccounts()
      ? peopleSelection.length
        ? [...peopleSelection]
        : peopleBufferSelection
          ? [peopleBufferSelection]
          : []
      : filesSelection?.length > 0
        ? [...filesSelection]
        : filesBufferSelection
          ? [filesBufferSelection]
          : [];
  }

  calculateSelection = () => {
    const selectedItems = this.infoPanelSelectedItems;
    const selectedFolder =
      this.roomsView === infoMembers && this.infoPanelRoom
        ? this.infoPanelRoom
        : this.selectedFolderStore.getSelectedFolder();

    if (!selectedItems.length) {
      return this.normalizeSelection(selectedFolder);
    } else if (selectedItems.length === 1) {
      // TODO: INFO PANEL

      if (
        this.getIsRooms() &&
        this.roomsView === infoMembers &&
        !selectedItems[0]?.isRoom
      ) {
        if (this.infoPanelSelection?.id) {
          return this.infoPanelSelection;
        } else {
          return selectedFolder;
        }
      }

      return this.normalizeSelection(selectedItems[0]);
    } else {
      return [...Array(selectedItems.length).keys()];
    }
  };

  normalizeSelection = (infoPanelSelection) => {
    return {
      ...infoPanelSelection,
      isRoom: infoPanelSelection.isRoom || !!infoPanelSelection.roomType,
      icon: this.getInfoPanelItemIcon(infoPanelSelection, 32),
      canCopyPublicLink:
        infoPanelSelection.access === ShareAccessRights.RoomManager ||
        infoPanelSelection.access === ShareAccessRights.None,
    };
  };

  updateRoomLogoCacheBreaker = () => {
    const logo = this.infoPanelSelection.logo;
    this.setInfoPanelSelection({
      ...this.infoPanelSelection,
      logo: {
        small: logo.small.split("?")[0] + "?" + new Date().getTime(),
        medium: logo.medium.split("?")[0] + "?" + new Date().getTime(),
        large: logo.large.split("?")[0] + "?" + new Date().getTime(),
        original: logo.original.split("?")[0] + "?" + new Date().getTime(),
      },
    });
  };

  // reloadSelectionParentRoom //reloadSelection
  updateInfoPanelSelection = async () => {
    // this.setInfoPanelSelection(this.calculateSelection());
    if (!this.getIsRooms) return;

    const currentFolderRoomId =
      this.selectedFolderStore.pathParts &&
      this.selectedFolderStore.pathParts[1]?.id;

    if (!currentFolderRoomId) return;

    const newInfoPanelSelection = await getRoomInfo(currentFolderRoomId);

    const roomIndex = this.selectedFolderStore.navigationPath.findIndex(
      (f) => f.id === currentFolderRoomId
    );
    if (roomIndex > -1) {
      this.selectedFolderStore.navigationPath[roomIndex].title =
        newInfoPanelSelection.title;
    }

    this.setInfoPanelSelection(this.normalizeSelection(newInfoPanelSelection));
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

  setInfoPanelSelection = (infoPanelSelection) => {
    if (
      this.getIsAccounts() &&
      (!infoPanelSelection.email || !infoPanelSelection.displayName)
    ) {
      this.infoPanelSelection = infoPanelSelection.length
        ? infoPanelSelection
        : {};
      return;
    }

    this.infoPanelSelection = infoPanelSelection;
    this.isScrollLocked = false;
  };

  setInfoPanelRoom = (infoPanelRoom) => {
    this.infoPanelRoom = this.normalizeSelection(infoPanelRoom);
  };
}

export default InfoPanelStore;
