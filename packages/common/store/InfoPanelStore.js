import { makeAutoObservable } from "mobx";
import moment from "moment";

import { getUserById } from "@docspace/shared/api/people";
import { getUserRole } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  EmployeeActivationStatus,
  FolderType,
  ShareAccessRights,
} from "@docspace/shared/enums";
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

  infoPanelSelection = null;
  selectionHistory = null;
  selectionHistory = null;

  roomsView = infoMembers;
  fileView = infoHistory;

  isScrollLocked = false;
  historyWithFileList = false;

  authStore = null;
  settingsStore = null;
  peopleStore = null;
  filesStore = null;
  selectedFolderStore = null;
  treeFoldersStore = null;
  publicRoomStore = null;

  infoPanelMembers = null;
  infoPanelSelection = null;
  infoPanelRoom = null;
  membersIsLoading = false;

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
    if (view !== infoMembers) this.setInfoPanelMembers(null);

    this.setNewInfoPanelSelection();
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

  getInfoPanelSelectedFolder = () => {
    const isRooms = this.getIsRooms();

    return this.roomsView === infoMembers && this.infoPanelRoom && isRooms
      ? this.infoPanelRoom
      : this.selectedFolderStore.getSelectedFolder();
  };

  get infoPanelCurrentSelection() {
    const { selection, bufferSelection } = this.filesStore;

    return this.infoPanelSelection
      ? this.infoPanelSelection
      : selection.length
        ? selection[0]
        : bufferSelection
          ? bufferSelection
          : null;
  }

  get withPublicRoomBlock() {
    return (
      this.infoPanelCurrentSelection?.access ===
        ShareAccessRights.RoomManager ||
      this.infoPanelCurrentSelection?.access === ShareAccessRights.None
    );
  }

  getViewItem = () => {
    const isRooms = this.getIsRooms();

    if (
      isRooms &&
      this.roomsView === infoMembers &&
      !this.infoPanelSelectedItems[0]?.isRoom
    ) {
      if (!this.infoPanelSelection?.id) {
        return this.getInfoPanelSelectedFolder();
      }
    } else {
      return this.normalizeSelection(this.infoPanelSelectedItems[0]);
    }
  };

  setNewInfoPanelSelection = () => {
    const selectedItems = this.infoPanelSelectedItems; //files list
    const selectedFolder = this.getInfoPanelSelectedFolder(); // root or current folder
    let newInfoPanelSelection = this.infoPanelSelection;

    if (!selectedItems.length) {
      newInfoPanelSelection = this.normalizeSelection(selectedFolder);
    } else if (selectedItems.length === 1) {
      newInfoPanelSelection = this.getViewItem() ?? newInfoPanelSelection;
    } else {
      newInfoPanelSelection = [...Array(selectedItems.length).keys()];
    }

    this.setInfoPanelSelection(newInfoPanelSelection);
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
    // this.setNewInfoPanelSelection();
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
      : item.isFolder && item.folderType
        ? this.settingsStore.getIconByFolderType(item.folderType, size)
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

  setInfoPanelMembers = (infoPanelMembers) => {
    this.infoPanelMembers = infoPanelMembers;
  };

  setInfoPanelSelection = (infoPanelSelection) => {
    if (
      this.infoPanelSelection &&
      infoPanelSelection &&
      this.infoPanelSelection.id === infoPanelSelection.id &&
      this.infoPanelSelection.isFolder === infoPanelSelection.isFolder
    ) {
      return;
    }

    if (
      this.getIsAccounts() &&
      (!infoPanelSelection.email || !infoPanelSelection.displayName)
    ) {
      this.infoPanelSelection = infoPanelSelection.length
        ? infoPanelSelection
        : null;
      return;
    }

    this.setInfoPanelMembers(null);
    this.infoPanelSelection = infoPanelSelection;
    this.isScrollLocked = false;
  };

  setInfoPanelRoom = (infoPanelRoom) => {
    this.infoPanelRoom = infoPanelRoom
      ? this.normalizeSelection(infoPanelRoom)
      : infoPanelRoom;
  };

  setMembersIsLoading = (membersIsLoading) => {
    this.membersIsLoading = membersIsLoading;
  };

  getHasPrevTitle = (array, type) => {
    return this.infoPanelMembers?.roomId === this.infoPanelSelection.id
      ? array.findIndex((x) => x.id === type) > -1
      : false;
  };

  addMembersTitle = (t, administrators, users, expectedMembers) => {
    let hasPrevAdminsTitle = this.getHasPrevTitle(
      administrators,
      "administration"
    );

    if (administrators.length && !hasPrevAdminsTitle) {
      administrators.unshift({
        id: "administration",
        displayName: t("Administration"),
        isTitle: true,
      });
    }

    let hasPrevUsersTitle = this.getHasPrevTitle(users, "user");

    if (users.length && !hasPrevUsersTitle) {
      users.unshift({ id: "user", displayName: t("Users"), isTitle: true });
    }

    let hasPrevExpectedTitle = this.getHasPrevTitle(
      expectedMembers,
      "expected"
    );

    if (expectedMembers.length && !hasPrevExpectedTitle) {
      expectedMembers.unshift({
        id: "expected",
        displayName: t("ExpectUsers"),
        isTitle: true,
        isExpect: true,
      });
    }
  };

  convertMembers = (t, members, clearFilter) => {
    const users = [];
    const administrators = [];
    const expectedMembers = [];

    members?.map((fetchedMember) => {
      const member = {
        access: fetchedMember.access,
        canEditAccess: fetchedMember.canEditAccess,
        ...fetchedMember.sharedTo,
      };

      if (member.activationStatus === EmployeeActivationStatus.Pending) {
        member.isExpect = true;
        expectedMembers.push(member);
      } else if (
        member.access === ShareAccessRights.FullAccess ||
        member.access === ShareAccessRights.RoomManager
      ) {
        administrators.push(member);
      } else {
        users.push(member);
      }
    });

    if (clearFilter) {
      this.addMembersTitle(t, administrators, users, expectedMembers);
    }

    return { administrators, users, expectedMembers };
  };

  fetchMembers = async (t, clearFilter = true) => {
    if (this.membersIsLoading) return;
    const isPublic =
      this.infoPanelSelection?.roomType ?? this.infoPanelSelection?.roomType;
    const roomId = this.infoPanelSelection.id;

    const requests = [this.filesStore.getRoomMembers(roomId, clearFilter)];

    if (isPublic && clearFilter && this.withPublicRoomBlock) {
      requests.push(this.filesStore.getRoomLinks(roomId));
    }

    let timerId;
    if (clearFilter)
      timerId = setTimeout(() => this.setMembersIsLoading(true), 300);

    const [data, links] = await Promise.all(requests);
    clearFilter && this.setMembersIsLoading(false);
    clearTimeout(timerId);

    links && this.publicRoomStore.setExternalLinks(links);

    const { administrators, users, expectedMembers } = this.convertMembers(
      t,
      data,
      clearFilter
    );

    return {
      users,
      administrators,
      expected: expectedMembers,
      roomId,
    };
  };

  addInfoPanelMembers = (t, members, clearFilter) => {
    const newMembers = this.convertMembers(t, members, clearFilter);
    const { roomId, administrators, users, expected } = this.infoPanelMembers;

    this.setInfoPanelMembers({
      roomId: roomId,
      administrators: [...administrators, ...newMembers.administrators],
      users: [...users, ...newMembers.users],
      expected: [...expected, ...newMembers.expectedMembers],
    });
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
