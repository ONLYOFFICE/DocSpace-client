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

import { makeAutoObservable } from "mobx";
import clone from "lodash/clone";
import { getUserById } from "@docspace/shared/api/people";
import { getUserType } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  EmployeeActivationStatus,
  FileType,
  // Events,
  // FileType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import config from "PACKAGE_FILE";
import Filter from "@docspace/shared/api/people/filter";
import {
  DEFAULT_CREATE_LINK_SETTINGS,
  getExpirationDate,
} from "@docspace/shared/components/share/Share.helpers";
import { getRoomInfo, getTemplateAvailable } from "@docspace/shared/api/rooms";
import {
  getPrimaryLink,
  getExternalLinks,
  editExternalLink,
  addExternalLink,
  // checkIsPDFForm,
  getPrimaryLinkIfNotExistCreate,
} from "@docspace/shared/api/files";
import isEqual from "lodash/isEqual";
import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
import {
  addLinksToHistory,
  parseHistory,
} from "SRC_DIR/pages/Home/InfoPanel/Body/helpers/HistoryHelper";
import { getContactsView } from "SRC_DIR/helpers/contacts";
import api from "@docspace/shared/api";
import { getCookie, getCorrectDate } from "@docspace/shared/utils";
import { LANGUAGE } from "@docspace/shared/constants";

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
const infoDetails = "info_details";
const infoShare = "info_share";
// const infoPlugin = "info_plugin"; // Useless?

class InfoPanelStore {
  userStore = null;

  isVisible = false;

  isMobileHidden = false;

  infoPanelSelection = null;

  selectionHistory = null;

  selectionHistoryTotal = null;

  roomsView = infoMembers;

  fileView = infoHistory;

  isScrollLocked = false;

  historyWithFileList = false;

  filesSettingsStore = null;

  peopleStore = null;

  filesStore = null;

  selectedFolderStore = null;

  treeFoldersStore = null;

  publicRoomStore = null;

  infoPanelMembers = null;

  templateAvailableToEveryone = false;

  infoPanelRoom = null;

  membersIsLoading = false;

  isMembersPanelUpdating = false;

  shareChanged = false;

  calendarDay = null;

  showSearchBlock = false;

  searchValue = "";

  infoPanelSelectedGroup = null;

  historyFilter = {
    page: 0,
    pageCount: 100,
    total: 0,
    startIndex: 0,
  };

  constructor(userStore) {
    this.userStore = userStore;

    makeAutoObservable(this);
  }

  // Setters

  setInfoPanelSelectedGroup = (group) => {
    this.infoPanelSelectedGroup = group;
  };

  setIsVisible = (bool) => {
    const selectedFolderIsRoomOrFolderInRoom =
      this.selectedFolderStore &&
      !this.selectedFolderStore.isRootFolder &&
      this.selectedFolderStore?.parentRoomType;

    const archivedFolderIsRoomOrFolderInRoom =
      this.selectedFolderStore &&
      !this.selectedFolderStore.isRootFolder &&
      this.selectedFolderStore?.rootFolderType === FolderType.Archive;

    const isFolderOpenedThroughSectionHeader =
      (this.infoPanelSelectedItems.length &&
        this.infoPanelSelectedItems[0].id === this.selectedFolderStore.id) ||
      this.infoPanelSelectedItems.length === 0;

    if (
      (selectedFolderIsRoomOrFolderInRoom ||
        archivedFolderIsRoomOrFolderInRoom) &&
      isFolderOpenedThroughSectionHeader
    ) {
      this.setView(infoMembers);
    } else {
      this.setView(infoDetails);
    }

    this.isVisible = bool;
    this.isScrollLocked = false;
  };

  setIsMobileHidden = (bool) => (this.isMobileHidden = bool);

  setShowSearchBlock = (bool) => (this.showSearchBlock = bool);

  setSearchValue = (value) => {
    this.searchValue = value;
  };

  resetSearch = () => {
    this.setShowSearchBlock(false);
    this.setSearchValue("");
  };

  setSelectionHistory = (obj, total) => {
    this.selectionHistory = obj;
    this.selectionHistoryTotal = total;

    if (obj)
      this.historyWithFileList =
        this.infoPanelSelection.isFolder || this.infoPanelSelection.isRoom;
  };

  resetView = () => {
    this.roomsView = infoMembers;
    this.fileView = infoHistory;
  };

  /**
   * @param {infoMembers | infoHistory | infoDetails | infoShare | infoPlugin} view
   * @returns {void}
   */
  setView = (view) => {
    this.roomsView = view;
    this.fileView = view === infoMembers ? infoDetails : view;
    this.isScrollLocked = false;
    if (view !== infoMembers) this.setInfoPanelMembers(null);

    this.setNewInfoPanelSelection();
  };

  setIsScrollLocked = (isScrollLocked) => {
    this.isScrollLocked = isScrollLocked;
  };

  setIsMembersPanelUpdating = (isMembersPanelUpdating) => {
    this.isMembersPanelUpdating = isMembersPanelUpdating;
  };

  // Selection helpers //

  get infoPanelSelectedItems() {
    const { selection: filesSelection, bufferSelection: filesBufferSelection } =
      this.filesStore;

    const {
      selection: peopleSelection,
      bufferSelection: peopleBufferSelection,
    } = this.peopleStore.usersStore;

    const {
      selection: groupsSelection,
      bufferSelection: groupsBufferSelection,
    } = this.peopleStore.groupsStore;

    const contactsTab = this.peopleStore.usersStore.contactsTab;

    const isGroups = contactsTab === "groups";

    if (!isGroups && contactsTab) {
      if (peopleSelection.length) return [...peopleSelection];
      if (peopleBufferSelection) return [peopleBufferSelection];
    }

    if (isGroups) {
      if (groupsSelection.length) return [...groupsSelection];
      if (groupsBufferSelection) return [groupsBufferSelection];
    }

    if (filesSelection?.length) return [...filesSelection];
    if (filesBufferSelection) return [filesBufferSelection];

    return [];
  }

  getInfoPanelSelectedFolder = () => {
    const isRooms = this.getIsRooms();
    const { currentGroup } = this.peopleStore.groupsStore;

    if (this.getIsContacts() === "groups") {
      return {
        ...currentGroup,
        isGroup: true,
      };
    }

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
        : bufferSelection || null;
  }

  get isRoomMembersPanelOpen() {
    return this.infoPanelSelection?.isRoom && this.roomsView === infoMembers;
  }

  get withPublicRoomBlock() {
    return this.infoPanelCurrentSelection?.security?.EditAccess;
  }

  getViewItem = () => {
    const isRooms = this.getIsRooms();

    const pathname = window.location.pathname.toLowerCase();
    const isMedia = pathname.indexOf("view") !== -1;

    if (
      (isRooms || isMedia) &&
      this.roomsView === infoMembers &&
      !this.infoPanelSelectedItems[0]?.isRoom
    ) {
      // if (!this.infoPanelSelection?.id) {
      return this.getInfoPanelSelectedFolder();
      // }
    }
    return this.infoPanelSelectedItems[0];
  };

  setNewInfoPanelSelection = () => {
    const selectedItems = this.infoPanelSelectedItems; // files list
    const selectedFolder = this.getInfoPanelSelectedFolder(); // root or current folder
    let newInfoPanelSelection = this.infoPanelSelection;

    if (!selectedItems.length) {
      newInfoPanelSelection = this.normalizeSelection(selectedFolder);
    } else if (selectedItems.length === 1) {
      newInfoPanelSelection = this.normalizeSelection(
        this.getViewItem() ?? newInfoPanelSelection,
      );
    } else {
      newInfoPanelSelection = [...Array(selectedItems.length).keys()];
    }

    if (!selectedItems.length && !newInfoPanelSelection.parentId) {
      this.setSelectionHistory(null, null);
      this.setInfoPanelSelectedGroup(null);
    }

    this.setInfoPanelSelection(newInfoPanelSelection);
    this.resetSearch();
  };

  normalizeSelection = (infoPanelSelection) => {
    return {
      ...infoPanelSelection,
      isRoom: infoPanelSelection.isRoom || !!infoPanelSelection.roomType,
      icon: this.getInfoPanelItemIcon(infoPanelSelection, 32),
    };
  };

  updateRoomLogoCacheBreaker = () => {
    const logo = this.infoPanelSelection.logo;
    this.setInfoPanelSelection({
      ...this.infoPanelSelection,
      logo: {
        small: `${logo.small.split("?")[0]}?${new Date().getTime()}`,
        medium: `${logo.medium.split("?")[0]}?${new Date().getTime()}`,
        large: `${logo.large.split("?")[0]}?${new Date().getTime()}`,
        original: `${logo.original.split("?")[0]}?${new Date().getTime()}`,
      },
    });
  };

  updateInfoPanelSelection = async (room) => {
    if (room) {
      this.setInfoPanelSelection(this.normalizeSelection(room));
      if (this.infoPanelRoom?.id === room?.id) {
        this.setInfoPanelRoom(this.normalizeSelection(room));
      }
      return;
    }
    this.setNewInfoPanelSelection();

    if (!this.getIsRooms) return;

    const currentFolderRoomId =
      this.selectedFolderStore.pathParts &&
      this.selectedFolderStore.pathParts[1]?.id;

    if (!currentFolderRoomId) return;

    const newInfoPanelSelection = await getRoomInfo(currentFolderRoomId);

    const roomIndex = this.selectedFolderStore.navigationPath.findIndex(
      (f) => f.id === currentFolderRoomId,
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
    return item?.isRoom || !!item?.roomType
      ? item.rootFolderType === FolderType.Archive && !item?.logo?.cover
        ? item.logo && item.logo.medium
        : item?.logo?.cover
          ? item.logo
          : this.filesSettingsStore.getIcon(
                size,
                null,
                null,
                null,
                item.roomType,
                true,
              )
            ? item.logo?.medium
            : item.icon
              ? item.icon
              : this.filesSettingsStore.getIcon(
                  size,
                  null,
                  null,
                  null,
                  item.roomType,
                )
      : item?.isFolder
        ? this.filesSettingsStore.getIconByFolderType(item.type, size)
        : this.filesSettingsStore.getIcon(size, item?.fileExst || ".file");
  };

  // User link actions //

  openUser = async (user, navigate) => {
    if (user.id === this.userStore.user.id) {
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
      window.ClientConfig?.proxy?.url,
      config.homepage,
      user.isVisitor ? "/accounts/guests" : "/accounts/people",
    ];

    const newFilter = Filter.getDefault();
    newFilter.page = 0;
    newFilter.search = user.email;
    newFilter.selectUserId = user.id;
    path.push(`filter?${newFilter.toUrlParams()}`);

    this.selectedFolderStore.setSelectedFolder(null);
    this.treeFoldersStore.setSelectedNode(["accounts"]);
    this.filesStore.resetSelections();

    const locale = getCookie(LANGUAGE);

    user.registrationDate = getCorrectDate(locale, user.registrationDate);

    navigate(combineUrl(...path), { state: { user } });
  };

  fetchUser = async (userId) => {
    const { getUserContextOptions } = this.peopleStore.usersStore;

    const fetchedUser = await getUserById(userId);
    fetchedUser.role = getUserType(fetchedUser);
    fetchedUser.statusType = getUserStatus(fetchedUser);
    fetchedUser.options = getUserContextOptions(
      false,
      fetchedUser.isOwner,
      fetchedUser.statusType,
      fetchedUser.status,
    );

    return fetchedUser;
  };

  // Routing helpers //

  getCanDisplay = () => {
    const pathname = window.location.pathname.toLowerCase();
    const isFiles = this.getIsFiles(pathname);
    const isRooms = this.getIsRooms(pathname);
    const isAccounts = this.getIsContacts(pathname);
    const isGallery = this.getIsGallery(pathname);
    return isRooms || isFiles || isGallery || isAccounts;
  };

  getIsFiles = (givenPathName) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("files") !== -1 ||
      pathname.indexOf("personal") !== -1 ||
      pathname.indexOf("recent") !== -1 ||
      pathname.indexOf("media") !== -1
    );
  };

  getIsRooms = (givenPathName) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("rooms") !== -1 && !(pathname.indexOf("personal") !== -1)
    );
  };

  getIsContacts = (givenPathName) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return getContactsView({ pathname });
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

  setTemplateAvailableToEveryone = (isAvailable) => {
    this.templateAvailableToEveryone = isAvailable;
  };

  setInfoPanelSelection = (infoPanelSelection) => {
    if (isEqual(infoPanelSelection, this.infoPanelSelection)) {
      return;
    }

    if (
      this.getIsContacts() &&
      (!infoPanelSelection?.email || !infoPanelSelection?.displayName)
    ) {
      this.infoPanelSelection = !infoPanelSelection?.length
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
    return this.infoPanelMembers?.roomId === this.infoPanelSelection?.id
      ? array.findIndex((x) => x.id === type) > -1
      : false;
  };

  addMembersTitle = (
    t,
    administrators,
    users,
    expectedMembers,
    groups,
    guests,
  ) => {
    const hasPrevAdminsTitle = this.getHasPrevTitle(
      administrators,
      "administration",
    );

    if (administrators.length && !hasPrevAdminsTitle) {
      administrators.unshift({
        id: "administration",
        displayName: t("InfoPanel:Administration"),
        isTitle: true,
      });
    }

    const hasPrevGroupsTitle = this.getHasPrevTitle(groups, "groups");

    if (groups.length && !hasPrevGroupsTitle) {
      groups.unshift({
        id: "groups",
        displayName: t("Common:Groups"),
        isTitle: true,
      });
    }

    const hasPrevUsersTitle = this.getHasPrevTitle(users, "user");

    if (users.length && !hasPrevUsersTitle) {
      users.unshift({
        id: "user",
        displayName: t("InfoPanel:Users"),
        isTitle: true,
      });
    }

    const hasPrevGuestsTitle = this.getHasPrevTitle(users, "guest");

    if (guests?.length && !hasPrevGuestsTitle) {
      guests.unshift({
        id: "guest",
        displayName: t("Common:Guests"),
        isTitle: true,
      });
    }

    const hasPrevExpectedTitle = this.getHasPrevTitle(
      expectedMembers,
      "expected",
    );

    if (expectedMembers.length && !hasPrevExpectedTitle) {
      expectedMembers.unshift({
        id: "expected",
        displayName: t("InfoPanel:ExpectUsers"),
        isTitle: true,
        isExpect: true,
      });
    }
  };

  convertMembers = (t, members, clearFilter, withoutTitles) => {
    const users = [];
    const administrators = [];
    const expectedMembers = [];
    const groups = [];
    const guests = [];

    members?.forEach((fetchedMember) => {
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
      } else if (member.isGroup) {
        groups.push(member);
      } else if (member.isVisitor) {
        guests.push(member);
      } else {
        users.push(member);
      }
    });

    if (clearFilter && !withoutTitles) {
      this.addMembersTitle(
        t,
        administrators,
        users,
        expectedMembers,
        groups,
        guests,
      );
    }

    return { administrators, users, expectedMembers, groups, guests };
  };

  fetchMembers = async (
    t,
    clearFilter = true,
    withoutTitlesAndLinks = false,
    membersFilter = null,
  ) => {
    if (this.membersIsLoading) return;
    const roomId = this.infoPanelSelection.id;
    const roomType = this.infoPanelSelection.roomType;
    const isTemplate = this.infoPanelSelection.isTemplate;

    const isPublicRoomType =
      roomType === RoomsType.PublicRoom ||
      roomType === RoomsType.CustomRoom ||
      roomType === RoomsType.FormRoom;

    const requests = [
      this.filesStore.getRoomMembers(roomId, clearFilter, membersFilter),
    ];

    if (
      isPublicRoomType &&
      clearFilter &&
      this.withPublicRoomBlock &&
      !withoutTitlesAndLinks &&
      !isTemplate
    ) {
      requests.push(
        api.rooms
          .getRoomMembers(roomId, { filterType: 2 }) // 2 (External link)
          .then((res) => res.items),
      );
    }

    let timerId;
    if (clearFilter)
      timerId = setTimeout(() => this.setMembersIsLoading(true), 300);

    const [data, links] = await Promise.all(requests);
    clearFilter && this.setMembersIsLoading(false);
    clearTimeout(timerId);

    this.publicRoomStore.setExternalLinks(links ?? []);

    const { administrators, users, expectedMembers, groups, guests } =
      this.convertMembers(t, data, clearFilter, withoutTitlesAndLinks);

    return {
      users,
      administrators,
      expected: expectedMembers,
      groups,
      roomId,
      guests,
    };
  };

  fetchMoreMembers = async (t, withoutTitles) => {
    const roomId = this.infoPanelSelection.id;
    const oldMembers = this.infoPanelMembers;

    const data = await this.filesStore.getRoomMembers(roomId, false);

    const newMembers = this.convertMembers(t, data, false, true);

    const mergedMembers = {
      roomId,
      administrators: [
        ...oldMembers.administrators,
        ...newMembers.administrators,
      ],
      users: [...oldMembers.users, ...newMembers.users],
      expected: [...oldMembers.expected, ...newMembers.expectedMembers],
      groups: [...oldMembers.groups, ...newMembers.groups],
      guests: [...oldMembers.guests, ...newMembers.guests],
    };

    if (!withoutTitles) {
      this.addMembersTitle(
        t,
        mergedMembers.administrators,
        mergedMembers.users,
        mergedMembers.expected,
        mergedMembers.groups,
        mergedMembers.guests,
      );
    }

    this.setInfoPanelMembers(mergedMembers);
  };

  updateInfoPanelMembers = async (t) => {
    if (
      !this.infoPanelSelection ||
      !this.infoPanelSelection.isRoom ||
      !this.infoPanelSelection.id
    ) {
      return;
    }

    this.setIsMembersPanelUpdating(true);

    if (this.infoPanelSelection.isTemplate) {
      const templateAvailable = await getTemplateAvailable(
        this.infoPanelSelection.id,
      );
      this.setTemplateAvailableToEveryone(templateAvailable);
    }

    const fetchedMembers = await this.fetchMembers(t, true, !!this.searchValue);
    this.setInfoPanelMembers(fetchedMembers);

    this.setIsMembersPanelUpdating(false);
  };

  setHistoryFilter = (historyFilter) => {
    this.historyFilter = historyFilter;
  };

  fetchHistory = async (abortControllerSignal = null) => {
    const { setExternalLinks } = this.publicRoomStore;

    let selectionType = "file";
    if (this.infoPanelSelection.isRoom || this.infoPanelSelection.isFolder)
      selectionType = "folder";

    const withLinks =
      this.infoPanelSelection.isRoom &&
      [RoomsType.FormRoom, RoomsType.CustomRoom, RoomsType.PublicRoom].includes(
        this.infoPanelSelection.roomType,
      );

    this.setHistoryFilter({
      page: 0,
      pageCount: 100,
      total: 0,
      startIndex: 0,
    });

    const filter = {
      startIndex: 0,
      count: this.historyFilter.pageCount,
    };

    return api.rooms
      .getHistory(
        selectionType,
        this.infoPanelSelection.id,
        this.infoPanelSelection?.requestToken,
        filter,
        abortControllerSignal,
      )
      .then(async (data) => {
        if (withLinks) {
          const links = await api.rooms
            .getRoomMembers(this.infoPanelSelection.id, { filterType: 2 }) // 2 (External link)
            .then((res) => res.items);
          const historyWithLinks = addLinksToHistory(data, links);
          setExternalLinks(links);
          return historyWithLinks;
        }
        setExternalLinks([]);
        return data;
      })
      .then((data) => {
        const parsedSelectionHistory = parseHistory(data);
        this.setSelectionHistory(parsedSelectionHistory, data.total);
        return parsedSelectionHistory;
      })
      .catch((err) => {
        if (err.message !== "canceled") console.error(err);
      });
  };

  fetchMoreHistory = async (abortControllerSignal = null) => {
    const { setExternalLinks } = this.publicRoomStore;
    const oldHistory = this.selectionHistory;

    let selectionType = "file";

    if (this.infoPanelSelection.isRoom || this.infoPanelSelection.isFolder)
      selectionType = "folder";

    const withLinks =
      this.infoPanelSelection.isRoom &&
      [RoomsType.FormRoom, RoomsType.CustomRoom, RoomsType.PublicRoom].includes(
        this.infoPanelSelection.roomType,
      );

    const newFilter = clone(this.historyFilter);

    newFilter.page += 1;
    newFilter.startIndex = newFilter.page * newFilter.pageCount;

    this.setHistoryFilter(newFilter);

    const filter = {
      startIndex: newFilter.startIndex,
      count: this.historyFilter.pageCount,
    };

    return api.rooms
      .getHistory(
        selectionType,
        this.infoPanelSelection.id,
        this.infoPanelSelection?.requestToken,
        filter,
        abortControllerSignal,
      )
      .then(async (data) => {
        if (withLinks) {
          const links = await api.rooms
            .getRoomMembers(this.infoPanelSelection.id, { filterType: 2 }) // 2 (External link)
            .then((res) => res.items);
          const historyWithLinks = addLinksToHistory(data, links);
          setExternalLinks(links);
          return historyWithLinks;
        }
        setExternalLinks([]);
        return data;
      })
      .then((data) => {
        const parsedSelectionHistory = parseHistory(data);

        const lastOldDay = oldHistory[oldHistory.length - 1].day;
        const newDay = parsedSelectionHistory[0].day;

        const newHistory = JSON.parse(JSON.stringify(oldHistory));

        let mergedHistory = [];

        if (lastOldDay === newDay) {
          const lastIndexNewHistory = newHistory.length - 1;
          const mergedFeeds = newHistory[lastIndexNewHistory].feeds.concat(
            parsedSelectionHistory[0].feeds,
          );

          newHistory[lastIndexNewHistory].feeds = mergedFeeds;

          const newParsedSelectionHistory = JSON.parse(
            JSON.stringify(parsedSelectionHistory),
          );
          newParsedSelectionHistory.splice(0, 1);

          mergedHistory = newHistory.concat(newParsedSelectionHistory);
        } else {
          mergedHistory = newHistory.concat(parsedSelectionHistory);
        }

        this.setSelectionHistory(mergedHistory, data.total);

        return mergedHistory;
      })
      .catch((err) => {
        if (err.message !== "canceled") console.error(err);
      });
  };

  openShareTab = () => {
    this.setView(infoShare);
    this.isVisible = true;
  };

  openMembersTab = () => {
    this.setView(infoMembers);
    this.isVisible = true;
  };

  getPrimaryFileLink = async (fileId) => {
    const file = this.filesStore.files.find((item) => item.id === fileId);

    /**
     *  @type {import("@docspace/shared/components/share/Share.types").DefaultCreatePropsType | null}
     */
    const value = { ...DEFAULT_CREATE_LINK_SETTINGS };

    if (value && file.isForm) {
      value.access = ShareAccessRights.Editing;
    }

    if (
      value &&
      !file.isForm &&
      file.fileType === FileType.PDF &&
      (value.access === ShareAccessRights.Editing ||
        value.access === ShareAccessRights.FormFilling)
    ) {
      value.access = ShareAccessRights.ReadOnly;
    }

    const { getFileInfo } = this.filesStore;

    const res = await (value
      ? getPrimaryLinkIfNotExistCreate(
          fileId,
          value.access,
          value.internal,
          getExpirationDate(value.diffExpirationDate),
        )
      : getPrimaryLink(fileId));

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
    expirationDate,
  ) => {
    const { getFileInfo } = this.filesStore;

    const res = await editExternalLink(
      fileId,
      linkId,
      access,
      primary,
      internal,
      expirationDate,
    );
    await getFileInfo(fileId);
    return res;
  };

  addFileLink = async (fileId, access, primary, internal, expirationDate) => {
    const { getFileInfo } = this.filesStore;

    const res = await addExternalLink(
      fileId,
      access,
      primary,
      internal,
      expirationDate,
    );
    await getFileInfo(fileId);
    return res;
  };

  setShareChanged = (shareChanged) => {
    this.shareChanged = shareChanged;
  };

  setCalendarDay = (calendarDay) => {
    this.calendarDay = calendarDay;
  };
}

export default InfoPanelStore;
