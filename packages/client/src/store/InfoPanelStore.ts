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
import { NavigateFunction } from "react-router";

import {
  EmployeeActivationStatus,
  EmployeeType,
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

import api from "@docspace/shared/api";
import { UserStore } from "@docspace/shared/store/UserStore";
import { TGroup } from "@docspace/shared/api/groups/types";
import { TUser } from "@docspace/shared/api/people/types";
import { RoomMember, TLogo } from "@docspace/shared/api/rooms/types";
import { Nullable, TTranslation } from "@docspace/shared/types";
import { ShareProps } from "@docspace/shared/components/share/Share.types";
import { TError } from "@docspace/shared/utils/axiosClient";
import FilesFilter from "@docspace/shared/api/files/filter";

import { getUserStatus } from "../helpers/people-helpers";
import { type TPeopleListItem, getContactsView } from "../helpers/contacts";
import {
  addLinksToHistory,
  parseHistory,
} from "../pages/Home/InfoPanel/Body/helpers/HistoryHelper";
import SelectedFolderStore, { TSelectedFolder } from "./SelectedFolderStore";
import FilesSettingsStore from "./FilesSettingsStore";
import FilesStore from "./FilesStore";
import PeopleStore from "./contacts/PeopleStore";
import PublicRoomStore from "./PublicRoomStore";
import TreeFoldersStore from "./TreeFoldersStore";
import {
  HistoryFilter,
  InfoPanelView,
  TInfoPanelMember,
  TInfoPanelMembers,
  TInfoPanelMemberType,
  TInfoPanelSelection,
  TMemberTuple,
  TSelection,
  TSelectionHistory,
  TTitleMember,
} from "../pages/Home/InfoPanel/InfoPanel.types";

const observedKeys = [
  "id",
  "title",
  "thumbnailStatus",
  "thumbnailUrl",
  "version",
  "comment",
  "roomType",
  "rootFolderId",
] as const;

class InfoPanelStore {
  userStore = {} as UserStore;

  isVisible = false;

  isMobileHidden = false;

  infoPanelSelection: Nullable<TInfoPanelSelection> = null;
  // getUserContextOptions: ContactsConextOptionsStore["getUserContextOptions"];

  selectionHistory: Nullable<TSelectionHistory[]> = null;

  selectionHistoryTotal: Nullable<number> = null;

  roomsView = InfoPanelView.infoMembers;

  fileView = InfoPanelView.infoHistory;

  isScrollLocked = false;

  historyWithFileList = false;

  filesSettingsStore = {} as FilesSettingsStore;

  peopleStore = {} as PeopleStore;

  filesStore = {} as FilesStore;

  selectedFolderStore = {} as SelectedFolderStore;

  treeFoldersStore = {} as TreeFoldersStore;

  publicRoomStore = {} as PublicRoomStore;

  infoPanelMembers: Nullable<TInfoPanelMembers> = null;

  templateAvailableToEveryone = false;

  infoPanelRoom: Nullable<TInfoPanelSelection> = null;

  membersIsLoading = false;

  isMembersPanelUpdating = false;

  shareChanged = false;

  calendarDay: Nullable<string> = null;

  showSearchBlock = false;

  searchValue = "";

  infoPanelSelectedGroup: TGroup | null = null;

  historyFilter = {
    page: 0,
    pageCount: 100,
    total: 0,
    startIndex: 0,
  };

  groupSelection: Nullable<TGroup> | TGroup[] = null;

  selectedGroup: Nullable<TGroup> = null;

  constructor(userStore: UserStore) {
    this.userStore = userStore;

    makeAutoObservable(this);
  }

  setGroupSelection = (group: Nullable<TGroup> | TGroup[]) => {
    this.groupSelection = group;
  };

  updateGroupSelection = (group: TGroup | null) => {
    this.groupSelection = group;
  };

  setGroup = (group: TGroup | null) => {
    this.selectedGroup = group;
  };

  // Setters

  setInfoPanelSelectedGroup = (group: TGroup | null) => {
    this.infoPanelSelectedGroup = group;
  };

  setIsVisible = (visiable: boolean) => {
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
        this.infoPanelSelectedItems[0].id === this.selectedFolderStore?.id) ||
      this.infoPanelSelectedItems.length === 0;

    if (
      (selectedFolderIsRoomOrFolderInRoom ||
        archivedFolderIsRoomOrFolderInRoom) &&
      isFolderOpenedThroughSectionHeader
    ) {
      this.setView(InfoPanelView.infoMembers);
    } else {
      this.setView(InfoPanelView.infoDetails);
    }

    this.isVisible = visiable;
    this.isScrollLocked = false;
  };

  setIsMobileHidden = (mobileHidden: boolean) =>
    (this.isMobileHidden = mobileHidden);

  setShowSearchBlock = (showSearchBlock: boolean) =>
    (this.showSearchBlock = showSearchBlock);

  setSearchValue = (value: string) => {
    this.searchValue = value;
  };

  resetSearch = () => {
    this.setShowSearchBlock(false);
    this.setSearchValue("");
  };

  setSelectionHistory = (
    obj: Nullable<TSelectionHistory[]>,
    total: Nullable<number>,
  ) => {
    this.selectionHistory = obj;
    this.selectionHistoryTotal = total;

    if (obj) {
      if (this.infoPanelSelection) {
        const isFolder =
          "isFolder" in this.infoPanelSelection &&
          this.infoPanelSelection.isFolder;
        const isRoom =
          "isRoom" in this.infoPanelSelection && this.infoPanelSelection.isRoom;

        this.historyWithFileList = Boolean(isFolder || isRoom);
      }
    }
  };

  resetView = () => {
    this.roomsView = InfoPanelView.infoMembers;
    this.fileView = InfoPanelView.infoHistory;
  };

  setView = (view: InfoPanelView) => {
    this.roomsView = view;
    this.fileView =
      view === InfoPanelView.infoMembers ? InfoPanelView.infoDetails : view;
    this.isScrollLocked = false;
    if (view !== InfoPanelView.infoMembers) this.setInfoPanelMembers(null);

    this.setNewInfoPanelSelection();
  };

  setIsScrollLocked = (isScrollLocked: boolean) => {
    this.isScrollLocked = isScrollLocked;
  };

  setIsMembersPanelUpdating = (isMembersPanelUpdating: boolean) => {
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
    } = this.peopleStore.groupsStore!;

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
    const currentGroup = this.peopleStore.groupsStore?.currentGroup;

    if (this.getIsContacts() === "groups") {
      return {
        ...currentGroup,
        isGroup: true,
      } as TGroup;
    }

    return this.roomsView === InfoPanelView.infoMembers &&
      this.infoPanelRoom &&
      isRooms
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
    return (
      this.infoPanelSelection?.isRoom &&
      this.roomsView === InfoPanelView.infoMembers
    );
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
      this.roomsView === InfoPanelView.infoMembers &&
      !this.infoPanelSelectedItems[0]?.isRoom
    ) {
      return this.getInfoPanelSelectedFolder();
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
      newInfoPanelSelection = null;
    }

    if (!selectedItems.length && newInfoPanelSelection) {
      if (
        "parentId" in newInfoPanelSelection &&
        !newInfoPanelSelection.parentId
      ) {
        this.setSelectionHistory(null, null);
        this.setInfoPanelSelectedGroup(null);
      }
    }

    this.setInfoPanelSelection(newInfoPanelSelection);
    this.resetSearch();
  };

  normalizeSelection = (
    selection: TInfoPanelSelection | TSelection,
  ): TInfoPanelSelection => {
    if (!selection) {
      return null;
    }

    return {
      ...selection,
      icon: this.getInfoPanelItemIcon(selection, 32),
    };
  };

  updateRoomLogoCacheBreaker = () => {
    const logo = this.infoPanelSelection?.logo;

    if (!this.infoPanelSelection || !logo) {
      return;
    }

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

  updateInfoPanelSelection = async (
    infoPanelSelection: TInfoPanelSelection,
  ) => {
    if (infoPanelSelection) {
      this.setInfoPanelSelection(this.normalizeSelection(infoPanelSelection));
      if (
        !Array.isArray(this.infoPanelRoom) &&
        this.infoPanelRoom?.id === infoPanelSelection?.id
      ) {
        this.setInfoPanelRoom(this.normalizeSelection(infoPanelSelection));
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

  isItemChanged = (oldItem: TSelectedFolder, newItem: TSelectedFolder) => {
    for (let i = 0; i < observedKeys.length; i++) {
      const value = observedKeys[i] as keyof TSelectedFolder;
      if (oldItem[value] !== newItem[value]) return true;
    }
    return false;
  };

  // Icon helpers //

  getInfoPanelItemIcon = (
    item: TInfoPanelSelection | TSelection,
    size: number,
  ): TLogo | string | undefined => {
    if (!item) return undefined;

    const isRoom = "isRoom" in item && item.isRoom;
    const roomType = "roomType" in item && item.roomType;

    const isFolder = "isFolder" in item && item.isFolder;
    const folderType = "type" in item && item.type;

    const rootFolderType = "rootFolderType" in item && item.rootFolderType;
    const fileExst = "fileExst" in item && item.fileExst;

    // Room case
    if (isRoom || roomType) {
      if (rootFolderType === FolderType.Archive && !item?.logo?.cover) {
        return item.logo?.medium;
      }

      if (item.logo?.cover) {
        return item.logo;
      }

      const icon = this.filesSettingsStore.getIcon(
        size,
        "",
        "",
        null,
        roomType || undefined,
        true,
      );

      return icon ?? item.logo?.medium ?? item.icon;
    }

    // Folder case
    if (isFolder) {
      return this.filesSettingsStore.getIconByFolderType(folderType, size);
    }

    // File case
    return this.filesSettingsStore.getIcon(size, fileExst || ".file");
  };

  // User link actions //

  openUser = async (user: TUser, navigate: NavigateFunction) => {
    if (user.id === this.userStore?.user?.id) {
      this.openSelfProfile();
      return;
    }

    const fetchedUser = await this.fetchUser(user.id);
    this.openAccountsWithSelectedUser(fetchedUser, navigate);
  };

  openSelfProfile = () => {
    this.peopleStore.profileActionsStore.onProfileClick();
  };

  openAccountsWithSelectedUser = async (
    user: TUser,
    navigate: NavigateFunction,
  ) => {
    const path = [
      window.ClientConfig?.proxy?.url,
      config.homepage,
      user.isVisitor ? "/accounts/guests" : "/accounts/people",
    ];

    const defaultFilter = Filter.getDefault();

    const newFilter = {
      ...defaultFilter,
      page: 0,
      search: user.email,
      selectUserId: user.id,
    };

    path.push(`filter?${newFilter.toUrlParams()}`);

    this.selectedFolderStore.setSelectedFolder(null);
    this.treeFoldersStore.setSelectedNode(["accounts"]);
    this.filesStore.resetSelections();

    navigate(combineUrl(...path), { state: { user } });
  };

  fetchUser = async (userId: string) => {
    const { getUserContextOptions } = this.peopleStore.usersStore;

    const fetchedUser = await getUserById(userId);

    const userRole = getUserType(fetchedUser);
    const statusType = getUserStatus(fetchedUser);
    const isGuest = userRole === EmployeeType.Guest;

    const options = getUserContextOptions(
      false,
      fetchedUser.isSSO,
      fetchedUser.isLDAP,
      isGuest,
      statusType,
      userRole,
      fetchedUser.status,
    );

    return {
      ...fetchedUser,
      statusType,
      role: userRole,
      options,
    };
  };

  // Routing helpers //

  getCanDisplay = () => {
    const isFiles = this.getIsFiles();
    const isRooms = this.getIsRooms();
    const isAccounts = this.getIsContacts();
    const isGallery = this.getIsGallery();
    return isRooms || isFiles || isGallery || isAccounts;
  };

  getIsFiles = () => {
    const pathname = window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("files") !== -1 ||
      pathname.indexOf("personal") !== -1 ||
      pathname.indexOf("media") !== -1
    );
  };

  getIsRooms = () => {
    const pathname = window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("rooms") !== -1 && !(pathname.indexOf("personal") !== -1)
    );
  };

  getIsContacts = () => {
    return getContactsView();
  };

  getIsGallery = (givenPathName?: string) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return pathname.indexOf("form-gallery") !== -1;
  };

  getIsTrash = (givenPathName?: string) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return pathname.indexOf("files/trash") !== -1;
  };

  setInfoPanelMembers = (infoPanelMembers: Nullable<TInfoPanelMembers>) => {
    this.infoPanelMembers = infoPanelMembers;
  };

  setTemplateAvailableToEveryone = (isAvailable: boolean) => {
    this.templateAvailableToEveryone = isAvailable;
  };

  isPeopleListItem(
    selection: TInfoPanelSelection,
  ): selection is TPeopleListItem {
    return (
      typeof selection === "object" &&
      selection !== null &&
      "email" in selection &&
      "displayName" in selection
    );
  }

  setInfoPanelSelection = (infoPanelSelection: TInfoPanelSelection) => {
    if (isEqual(infoPanelSelection, this.infoPanelSelection)) return;

    if (
      this.getIsContacts() &&
      (!this.isPeopleListItem(infoPanelSelection) ||
        !infoPanelSelection.email ||
        !infoPanelSelection.displayName)
    ) {
      this.infoPanelSelection = infoPanelSelection;
      return;
    }

    this.setInfoPanelMembers(null);
    this.infoPanelSelection = infoPanelSelection;
    this.isScrollLocked = false;
  };

  setInfoPanelRoom = (infoPanelRoom: TInfoPanelSelection) => {
    this.infoPanelRoom = infoPanelRoom
      ? this.normalizeSelection(infoPanelRoom)
      : infoPanelRoom;
  };

  setMembersIsLoading = (membersIsLoading: boolean) => {
    this.membersIsLoading = membersIsLoading;
  };

  getHasPrevTitle = (members: TMemberTuple, type: TInfoPanelMemberType) => {
    return this.infoPanelMembers?.roomId === this.infoPanelSelection?.id
      ? members.findIndex((member) => member.id === type) > -1
      : false;
  };

  addMembersTitle = (
    t: TTranslation,
    administrators: TMemberTuple,
    users: TMemberTuple,
    expectedMembers: TMemberTuple,
    groups: TMemberTuple,
    guests: TMemberTuple,
  ) => {
    const members: {
      key: TInfoPanelMemberType;
      label: string;
      list: TMemberTuple;
      extra?: Partial<TTitleMember>;
    }[] = [
      {
        key: TInfoPanelMemberType.administrators,
        label: t("InfoPanel:Administration"),
        list: administrators,
      },
      {
        key: TInfoPanelMemberType.groups,
        label: t("Common:Groups"),
        list: groups,
      },
      {
        key: TInfoPanelMemberType.users,
        label: t("InfoPanel:Users"),
        list: users,
      },
      {
        key: TInfoPanelMemberType.guests,
        label: t("Common:Guests"),
        list: guests,
      },
      {
        key: TInfoPanelMemberType.guests,
        label: t("InfoPanel:ExpectUsers"),
        list: expectedMembers,
        extra: { isExpect: true },
      },
    ];

    members.forEach(({ key, label, list, extra }) => {
      if (list.length && !this.getHasPrevTitle(list, key)) {
        const titleMember: TTitleMember = {
          id: key,
          displayName: t(label),
          isTitle: true,
          ...(extra || {}),
        };
        list.unshift(titleMember);
      }
    });
  };

  convertMembers = (
    t: TTranslation,
    members: RoomMember[],
    clearFilter: boolean,
    withoutTitles: boolean,
  ) => {
    const users: TInfoPanelMember[] = [];
    const administrators: TInfoPanelMember[] = [];
    const expectedMembers: TInfoPanelMember[] = [];
    const groups: TInfoPanelMember[] = [];
    const guests: TInfoPanelMember[] = [];

    members?.forEach(({ access, canEditAccess, sharedTo }) => {
      const member: TInfoPanelMember = {
        access,
        canEditAccess,
        ...sharedTo,
      };

      if (
        "activationStatus" in member &&
        member.activationStatus === EmployeeActivationStatus.Pending
      ) {
        member.isExpect = true;
        expectedMembers.push(member);
      } else if (
        access === ShareAccessRights.FullAccess ||
        access === ShareAccessRights.RoomManager
      ) {
        administrators.push(member);
      } else if ("isGroup" in member && member.isGroup) {
        groups.push(member);
      } else if ("isVisitor" in member && member.isVisitor) {
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

    return {
      administrators,
      users,
      expectedMembers,
      groups,
      guests,
    };
  };

  fetchMembers = async (
    t: TTranslation,
    clearFilter = true,
    withoutTitlesAndLinks = false,
    membersFilter = null,
  ): Promise<TInfoPanelMembers | undefined> => {
    if (this.membersIsLoading) return;
    if (!this.infoPanelSelection || this.infoPanelSelection.id === null) return;

    const roomId = this.infoPanelSelection.id;

    const roomType =
      "roomType" in this.infoPanelSelection
        ? this.infoPanelSelection.roomType
        : null;

    const isTemplate =
      "isTemplate" in this.infoPanelSelection
        ? this.infoPanelSelection.isTemplate
        : false;

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
      !isTemplate &&
      roomId
    ) {
      requests.push(
        api.rooms
          .getRoomMembers(String(roomId), { filterType: 2 }) // 2 (External link)
          .then((res) => {
            return res.items;
          }),
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

  fetchMoreMembers = async (t: TTranslation, withoutTitles: boolean) => {
    const roomId = this.infoPanelSelection?.id;

    if (!roomId) return;

    const oldMembers = this.infoPanelMembers;

    const data = await this.filesStore.getRoomMembers(roomId, false);

    const newMembers = this.convertMembers(t, data, false, true);

    const mergedMembers: TInfoPanelMembers = {
      roomId,
      administrators: [
        ...(oldMembers?.administrators || []),
        ...newMembers.administrators,
      ],
      users: [...(oldMembers?.users || []), ...newMembers.users],
      expected: [
        ...(oldMembers?.expected || []),
        ...newMembers.expectedMembers,
      ],
      groups: [...(oldMembers?.groups || []), ...newMembers.groups],
      guests: [...(oldMembers?.guests || []), ...newMembers.guests],
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

  updateInfoPanelMembers = async (t: TTranslation) => {
    if (
      !this.infoPanelSelection ||
      !this.infoPanelSelection.isRoom ||
      !this.infoPanelSelection.id
    ) {
      return;
    }

    this.setIsMembersPanelUpdating(true);

    const isTemplate =
      "isTemplate" in this.infoPanelSelection &&
      this.infoPanelSelection.isTemplate;

    if (isTemplate) {
      const templateAvailable = await getTemplateAvailable(
        Number(this.infoPanelSelection.id),
      );
      this.setTemplateAvailableToEveryone(templateAvailable);
    }

    const fetchedMembers = await this.fetchMembers(t, true, !!this.searchValue);
    this.setInfoPanelMembers(fetchedMembers ?? null);

    this.setIsMembersPanelUpdating(false);
  };

  setHistoryFilter = (historyFilter: HistoryFilter) => {
    this.historyFilter = historyFilter;
  };

  fetchHistory = async (abortControllerSignal = null) => {
    const { setExternalLinks } = this.publicRoomStore;
    const selection = this.infoPanelSelection;

    if (!selection?.id) return;

    const isFolder = "isFolder" in selection && selection.isFolder;
    const isRoom = "isRoom" in selection && selection.isRoom;
    const roomType = "roomType" in selection && selection.roomType;
    const selectionType: "file" | "folder" =
      isRoom || isFolder ? "folder" : "file";
    const selectionRequestToken =
      ("requestToken" in selection && selection.requestToken) || undefined;

    const withLinks =
      isRoom &&
      roomType &&
      [RoomsType.FormRoom, RoomsType.CustomRoom, RoomsType.PublicRoom].includes(
        roomType,
      );

    this.setHistoryFilter({
      page: 0,
      pageCount: 100,
      total: 0,
      startIndex: 0,
    });

    const filter = FilesFilter.getDefault();

    filter.startIndex = 0;
    filter.pageCount = this.historyFilter.pageCount;

    try {
      const history = await api.rooms.getHistory(
        selectionType,
        selection.id,
        selectionRequestToken,
        filter,
        abortControllerSignal,
      );

      if (withLinks) {
        const links = await api.rooms
          .getRoomMembers(String(selection.id), {
            filterType: 2, // External link
          })
          .then((res) => res.items);

        const historyWithLinks = addLinksToHistory(history, links);

        setExternalLinks(links);
        this.setSelectionHistory(
          parseHistory(historyWithLinks.items),
          historyWithLinks.total,
        );
        return parseHistory(historyWithLinks.items);
      }

      setExternalLinks([]);
      this.setSelectionHistory(parseHistory(history.items), history.total);
      return parseHistory(history.items);
    } catch (err) {
      if ((err as TError).message !== "canceled") {
        console.error(err);
      }
    }
  };

  fetchMoreHistory = async (
    abortControllerSignal: AbortSignal | null = null,
  ) => {
    if (!this.infoPanelSelection) return;

    const selection = this.infoPanelSelection;
    const { setExternalLinks } = this.publicRoomStore;
    const oldHistory = this.selectionHistory;

    const isFolder = "isFolder" in selection && selection.isFolder;
    const isRoom = "isRoom" in selection && selection.isRoom;
    const roomType = "roomType" in selection ? selection.roomType : null;
    const requestToken =
      "requestToken" in selection ? selection.requestToken : undefined;

    const selectionType: "file" | "folder" =
      isRoom || isFolder ? "folder" : "file";

    const withLinks =
      isRoom &&
      roomType &&
      [RoomsType.FormRoom, RoomsType.CustomRoom, RoomsType.PublicRoom].includes(
        roomType,
      );

    const newHistoryFilter = clone(this.historyFilter);
    newHistoryFilter.page += 1;
    newHistoryFilter.startIndex =
      newHistoryFilter.page * newHistoryFilter.pageCount;
    this.setHistoryFilter(newHistoryFilter);

    const filter = FilesFilter.getDefault();
    filter.startIndex = 0;
    filter.pageCount = newHistoryFilter.pageCount;

    try {
      const data = await api.rooms.getHistory(
        selectionType,
        selection.id!,
        requestToken,
        filter,
        abortControllerSignal,
      );

      let finalHistory: ReturnType<typeof addLinksToHistory> = data;
      if (withLinks) {
        const links = await api.rooms
          .getRoomMembers(String(selection.id), {
            filterType: 2, // External links only
          })
          .then((res) => res.items);

        finalHistory = addLinksToHistory(data, links);
        setExternalLinks(links);
      } else {
        setExternalLinks([]);
      }

      const parsedNewHistory = parseHistory(finalHistory.items);
      const lastOldDay = oldHistory?.[oldHistory.length - 1]?.day;
      const firstNewDay = parsedNewHistory?.[0]?.day;

      const mergedHistory = oldHistory ? [...oldHistory] : [];

      if (lastOldDay === firstNewDay) {
        const lastIndex = mergedHistory.length - 1;
        mergedHistory[lastIndex].feeds.push(...parsedNewHistory[0].feeds);
        mergedHistory.push(...parsedNewHistory.slice(1));
      } else {
        mergedHistory.push(...parsedNewHistory);
      }

      this.setSelectionHistory(mergedHistory, finalHistory.total);
      return mergedHistory;
    } catch (err: unknown) {
      if ((err as TError).message !== "canceled") {
        console.error(err);
      }
    }
  };

  openShareTab = () => {
    this.setView(InfoPanelView.infoShare);
    this.isVisible = true;
  };

  openMembersTab = () => {
    this.setView(InfoPanelView.infoMembers);
    this.isVisible = true;
  };

  getPrimaryFileLink = async (fileId: number) => {
    const file = this.filesStore.files.find((item) => item.id === fileId);

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

  getFileLinks = async (...args: Parameters<typeof getExternalLinks>) => {
    const res = await getExternalLinks(...args);
    return res;
  };

  editFileLink: ShareProps["editFileLink"] = async (
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

  addFileLink: ShareProps["addFileLink"] = async (
    fileId,
    access,
    primary,
    internal,
    expirationDate,
  ) => {
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

  setShareChanged = (shareChanged: boolean) => {
    this.shareChanged = shareChanged;
  };

  setCalendarDay = (calendarDay: Nullable<string>) => {
    this.calendarDay = calendarDay;
  };
}

export default InfoPanelStore;
