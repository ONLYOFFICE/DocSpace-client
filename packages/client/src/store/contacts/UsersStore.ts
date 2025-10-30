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

import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import Filter from "@docspace/shared/api/people/filter";
import { TUser } from "@docspace/shared/api/people/types";
import { TThirdPartyProvider } from "@docspace/shared/api/settings/types";

import {
  EmployeeStatus,
  EmployeeType,
  Events,
  RoomSearchArea,
} from "@docspace/shared/enums";
import { getUserType } from "@docspace/shared/utils/common";
import { Nullable } from "@docspace/shared/types";
import { getCookie, getCorrectDate } from "@docspace/shared/utils";
import {
  getUserFilter,
  setUserFilter,
} from "@docspace/shared/utils/userFilterUtils";
import {
  FILTER_GUESTS,
  FILTER_INSIDE_GROUPS,
  FILTER_PEOPLE,
} from "@docspace/shared/utils/filterConstants";
import { LANGUAGE } from "@docspace/shared/constants";
import { UserStore } from "@docspace/shared/store/UserStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";
import {
  downgradeUserType,
  getReassignmentProgress,
  reassignmentNecessary,
  terminateReassignment,
} from "@docspace/shared/api/people";
import type { TGroup } from "@docspace/shared/api/groups/types";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { getPersonalFolderTree } from "@docspace/shared/api/files";

import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";

import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
import {
  getContactsView,
  getUserChecked,
  setContactsUsersFilterUrl,
  TChangeUserTypeDialogData,
} from "SRC_DIR/helpers/contacts";
import type {
  TChangeUserStatusDialogData,
  TContactsSelected,
  TContactsTab,
  TPeopleListItem,
} from "SRC_DIR/helpers/contacts";

import { getInfoPanelOpen } from "SRC_DIR/helpers/info-panel";

import AccessRightsStore from "../AccessRightsStore";
import ClientLoadingStore from "../ClientLoadingStore";
import TreeFoldersStore from "../TreeFoldersStore";

import GroupsStore from "./GroupsStore";
import ContactsHotkeysStore from "./ContactsHotkeysStore";
import DialogStore from "./DialogStore";

import FilesStore from "../FilesStore";
import DialogsStore from "../DialogsStore";
import SelectedFolderStore from "../SelectedFolderStore";

class UsersStore {
  filter = Filter.getDefault();

  users: TUser[] = [];

  selection: TPeopleListItem[] = [];

  bufferSelection: Nullable<TPeopleListItem> = null;

  selectionUsersRights = {
    isVisitor: 0,
    isCollaborator: 0,
    isRoomAdmin: 0,
    isAdmin: 0,
  };

  selected: TContactsSelected = "none";

  providers: TThirdPartyProvider[] = [];

  isUsersLoading = false;

  abortController: Nullable<AbortController> = null;

  requestRunning = false;

  contactsTab: TContactsTab = false;

  roomParts: string = "";

  activeUsers: TPeopleListItem[] = [];

  constructor(
    public settingsStore: SettingsStore,
    public userStore: UserStore,
    public groupsStore: GroupsStore,
    public contactsHotkeysStore: ContactsHotkeysStore,
    public accessRightsStore: AccessRightsStore,
    public dialogStore: DialogStore,
    public clientLoadingStore: ClientLoadingStore,
    public treeFoldersStore: TreeFoldersStore,
    public filesStore: FilesStore,
    public dialogsStore: DialogsStore,
    public selectedFolderStore: SelectedFolderStore,
  ) {
    this.settingsStore = settingsStore;
    this.userStore = userStore;
    this.groupsStore = groupsStore;
    this.contactsHotkeysStore = contactsHotkeysStore;
    this.accessRightsStore = accessRightsStore;
    this.dialogStore = dialogStore;
    this.dialogsStore = dialogsStore;
    this.clientLoadingStore = clientLoadingStore;
    this.treeFoldersStore = treeFoldersStore;
    this.contactsTab = getContactsView();
    this.filesStore = filesStore;
    this.selectedFolderStore = selectedFolderStore;

    makeAutoObservable(this);

    const addUser = async (value: { id: string; data: TUser }) => {
      console.log(`[WS] ${SocketEvents.AddUser}, id: ${value?.id}`);
      const { id, data } = value;

      if (!data || !id) return;

      const idx = this.users.findIndex((x) => x.id === id);

      const user = await api.people.getUserById(data.id);

      runInAction(() => {
        if (idx === -1) {
          this.users.push(user);
          this.filter.total += 1;
        } else {
          this.users[idx] = user;
        }
      });
    };

    const updateUser = async (value: { id: string; data: TUser }) => {
      console.log(`[WS] ${SocketEvents.UpdateUser},id: ${value?.id}`);

      const { id, data } = value;

      if (!data || !id) return;

      const idx = this.users.findIndex((x) => x.id === id);

      if (idx === -1) return;

      const user = await api.people.getUserById(data.id);

      runInAction(() => {
        this.users[idx] = user;
      });

      this.updateSelection();
    };

    const deleteUser = (id: string) => {
      console.log(`[WS] ${SocketEvents.DeleteUser}, id: ${id}`);
      const idx = this.users.findIndex((x) => x.id === id);

      if (idx === -1) return;

      runInAction(() => {
        const newUsers = this.users;
        newUsers.splice(idx, 1);
        this.users = newUsers;
        this.filter.total -= 1;
      });

      this.updateSelection();
    };

    const changeMyType = async (value: {
      id: string;
      data: TUser;
      admin: string;
      hasPersonalFolder: boolean;
    }) => {
      console.log(`[WS] ${SocketEvents.ChangeMyType}, id: ${value?.id}`);

      if (!value) return;

      const { fetchTreeFolders } = this.treeFoldersStore;
      const { setUser } = this.userStore;
      const { setReducedRightsData } = this.dialogsStore;
      const { setSecurity, getSelectedFolder } = this.selectedFolderStore;
      const { fetchFiles, filter } = this.filesStore;

      const { data, id, admin, hasPersonalFolder } = value;
      const { isAdmin, isRoomAdmin, isVisitor, isCollaborator } = data;
      const { pathname } = window.location;

      const userData = { ...data, hasPersonalFolder };

      setUser(userData);

      fetchTreeFolders();

      if (isVisitor) {
        setReducedRightsData(true, admin);
      }

      if (pathname.includes("rooms/personal")) {
        try {
          const selectedFolder = getSelectedFolder();

          const [personalFolder] = await Promise.all([
            getPersonalFolderTree(),
            fetchFiles(selectedFolder.id, filter),
          ]);

          setSecurity(personalFolder[0].security);
        } catch (e) {
          console.error(e);
        }

        return;
      }

      if (
        (isCollaborator || isVisitor) &&
        (pathname.includes("accounts") || pathname.includes("portal-settings"))
      ) {
        window.DocSpace.navigate(
          combineUrl(window.ClientConfig?.proxy?.url, "/"),
        );

        return;
      }

      if ((isAdmin || isRoomAdmin) && pathname.includes("accounts")) {
        this.getUsersList();

        return;
      }

      const isArchive = pathname.includes("rooms/archived");
      if (isArchive || pathname.includes("rooms/shared")) {
        const { fetchRooms } = this.filesStore;

        const roomsFilter = RoomsFilter.getDefault(
          id,
          isArchive ? RoomSearchArea.Archive : RoomSearchArea.Active,
        );
        fetchRooms(roomsFilter);
      }
    };

    SocketHelper?.on(SocketEvents.AddUser, addUser);
    SocketHelper?.on(SocketEvents.AddGuest, addUser);
    SocketHelper?.on(SocketEvents.UpdateUser, updateUser);
    SocketHelper?.on(SocketEvents.UpdateGuest, updateUser);
    SocketHelper?.on(SocketEvents.DeleteUser, deleteUser);
    SocketHelper?.on(SocketEvents.DeleteGuest, deleteUser);
    SocketHelper?.on(SocketEvents.ChangeMyType, changeMyType);

    SocketHelper?.on(
      SocketEvents.UpdateGroup,
      async (value: { id: string; data: TGroup }) => {
        console.log(
          `[WS] ${SocketEvents.UpdateGroup}: ${value?.id}:${value?.data}`,
        );
        const { contactsTab } = this;

        if (contactsTab !== "inside_group") return;

        const { id, data } = value;

        if (!data || !id) return;

        if (this.groupsStore!.currentGroup?.id !== id) return;

        const group = await api.groups.getGroupById(id, true);

        runInAction(() => {
          this.users = group.members ?? [];
          this.filter.total = this.users.length;
        });
      },
    );
  }

  setContactsTab = (contactsTab: TContactsTab) => {
    if (contactsTab) {
      const roomParts =
        contactsTab === "guests"
          ? `guests`
          : contactsTab === "groups" || contactsTab === "inside_group"
            ? "groups"
            : "users";

      if (
        SocketHelper?.socketSubscribers.has(this.roomParts) &&
        this.roomParts !== roomParts
      )
        SocketHelper?.emit(SocketCommands.Unsubscribe, {
          roomParts: this.roomParts,
          ...(this.roomParts === "guests" && { individual: true }),
        });

      this.roomParts = roomParts;

      if (!SocketHelper?.socketSubscribers.has(roomParts))
        SocketHelper?.emit(SocketCommands.Subscribe, {
          roomParts,
          ...(roomParts === "guests" && { individual: true }),
        });
    }

    // if (contactsTab !== this.contactsTab) {
    //   console.log("set filter here");
    //   this.filter = Filter.getDefault();
    // }
    this.contactsTab = contactsTab;
  };

  setFilter = (filter: Filter) => {
    this.filter = filter;

    const key =
      this.contactsTab === "inside_group"
        ? `${FILTER_INSIDE_GROUPS}=${this.userStore.user?.id}`
        : this.contactsTab === "guests"
          ? `${FILTER_GUESTS}=${this.userStore.user?.id}`
          : `${FILTER_PEOPLE}=${this.userStore.user?.id}`;

    const value = {
      sortBy: filter.sortBy,
      pageCount: filter.pageCount,
      sortOrder: filter.sortOrder,
    };
    setUserFilter(key, value);

    setContactsUsersFilterUrl(
      filter,
      getContactsView(),
      this.groupsStore.currentGroup?.id,
    );
  };

  get filterTotal() {
    return this.filter.total;
  }

  get isFiltered() {
    return (
      this.filter.activationStatus ||
      this.filter.employeeStatus ||
      this.filter.payments ||
      this.filter.search ||
      this.filter.role ||
      this.filter.accountLoginType ||
      this.filter.withoutGroup ||
      this.filter.group ||
      this.filter.quotaFilter ||
      this.filter.filterSeparator ||
      this.filter.invitedByMe ||
      this.filter.inviterId ||
      (this.filter.area && this.contactsTab === "people") ||
      this.filter.includeStrangers
    );
  }

  get isUsersEmptyView() {
    return !this.peopleList.length;
  }

  setUsers = (users: TUser[]) => {
    this.users = users;
  };

  getUsersList = async (
    filter?: Filter,
    updateFilter = false,
    withFilterLocalStorage = false,
    contactsTab?: TContactsTab,
  ) => {
    const { currentGroup } = this.groupsStore;
    const filterData = filter ? filter.clone() : Filter.getDefault();

    this.abortController?.abort();

    this.abortController = new AbortController();

    const contactsView = getContactsView(window.location);

    if (!(window.DocSpace?.location?.state as { user?: unknown })?.user) {
      this.setSelection([]);
      this.setBufferSelection(null);
    }

    const localStorageKey =
      contactsView === "inside_group"
        ? `${FILTER_INSIDE_GROUPS}=${this.userStore.user?.id}`
        : contactsView === "guests"
          ? `${FILTER_GUESTS}=${this.userStore.user?.id}`
          : `${FILTER_PEOPLE}=${this.userStore.user?.id}`;

    if (withFilterLocalStorage) {
      const filterObj = getUserFilter(localStorageKey);

      if (filterObj?.sortBy) filterData.sortBy = filterObj.sortBy;
      if (filterObj?.pageCount) filterData.pageCount = filterObj.pageCount;
      if (filterObj?.sortOrder) filterData.sortOrder = filterObj.sortOrder;
    }

    if (
      currentGroup?.id &&
      (contactsTab
        ? contactsTab === "inside_group"
        : contactsView === "inside_group")
    ) {
      filterData.group = currentGroup.id;
    }

    if (filterData.group && filterData.group === "root") {
      filterData.group = null;
    }

    if (
      contactsTab ? contactsTab === "guests" : this.contactsTab === "guests"
    ) {
      filterData.area = "guests";
    } else if (
      contactsTab ? contactsTab === "people" : contactsView === "people"
    ) {
      filterData.area = "people";
    }

    runInAction(() => {
      this.requestRunning = true;
    });

    const res = await api.people.getUserList(
      filterData,
      this.abortController.signal,
    );

    this.setUsers(res.items);

    filterData.total = res.total;

    if (updateFilter) {
      this.setFilter(filterData);
    }

    runInAction(() => {
      this.requestRunning = false;
      this.abortController = null;
    });

    this.clientLoadingStore.setIsLoading("body", false);
    this.clientLoadingStore.setIsLoading("header", false);
    return Promise.resolve(res.items);
  };

  setProviders = (providers: TThirdPartyProvider[]) => {
    this.providers = providers;
  };

  removeUsers = async (userIds: string[]) => {
    const { updateCurrentGroup } = this.groupsStore;

    await api.people.deleteUsers(userIds);

    const actions: Promise<void>[] = [];

    if (this.contactsTab === "inside_group" && this.filter.group) {
      actions.push(updateCurrentGroup(this.filter.group));
    }

    await Promise.all(actions);
  };

  updateUserStatus = async (status: EmployeeStatus, userIds: string[]) => {
    const updatedUsers = await api.people.updateUserStatus(status, userIds);
    const isInfoPanelVisible = getInfoPanelOpen();
    if (updatedUsers) {
      const needReset = this.needResetUserSelection || !isInfoPanelVisible;
      if (!needReset) {
        this.updateSelection();
      }
    }

    return updatedUsers;
  };

  updateUserType = async (type: EmployeeType, userIds: string[]) => {
    let toType = type ?? 0;

    switch (type) {
      case EmployeeType.Admin:
        toType = EmployeeType.Admin;
        break;
      case EmployeeType.Guest:
        toType = EmployeeType.Guest;
        break;
      case EmployeeType.User:
        toType = EmployeeType.User;
        break;
      case EmployeeType.RoomAdmin:
        toType = EmployeeType.RoomAdmin;
        break;
      default:
        return;
    }

    let updatedUsers: TUser[] = [];

    try {
      updatedUsers = await api.people.updateUserType(toType, userIds);
    } catch (e) {
      throw new Error(e as string);
    }

    const needReset = this.needResetUserSelection || !getInfoPanelOpen();

    if (updatedUsers && !needReset) {
      this.updateSelection();
    }

    return updatedUsers;
  };

  removeGuests = async (ids: string[]) => {
    if (this.contactsTab !== "guests" || !ids.length) return;

    const removedGuests = await api.people.deleteGuests(ids);

    const needReset = this.needResetUserSelection || !getInfoPanelOpen();

    if (!!removedGuests && !needReset) {
      this.updateSelection();
    }

    return removedGuests;
  };

  updateProfileInUsers = async (updatedProfile?: TUser) => {
    if (!this.users) {
      return this.getUsersList(this.filter, true);
    }

    if (!updatedProfile) return;

    const updatedUsers = this.users.map((user) => {
      if (user.id === updatedProfile.id) {
        return { ...user, ...updatedProfile };
      }

      return user;
    });

    this.setUsers(updatedUsers);
  };

  getUserContextOptions = (
    isMySelf: boolean,
    isUserSSO: boolean,
    isUserLDAP: boolean,
    isGuest: boolean,
    statusType: ReturnType<typeof getUserStatus>,
    userRole: ReturnType<typeof getUserType>,
    status: EmployeeStatus,
  ) => {
    if (!this.userStore.user) return;

    const { isOwner, isAdmin, isRoomAdmin, isLDAP } = this.userStore.user;

    const options: string[] = [];

    switch (statusType) {
      case "active":
      case "unknown":
        if (isMySelf) {
          options.push("profile");
        }
        options.push("details");

        if (isAdmin || isOwner) {
          options.push("room-list");
        }

        if (isMySelf) {
          if (!isLDAP) {
            options.push("separator-1");
            options.push("change-name");
            options.push("change-email");
            options.push("change-password");
          }

          if (isOwner) {
            options.push("separator-2");
            options.push("change-owner");
          }
        } else if (
          isOwner ||
          (isAdmin &&
            (userRole === EmployeeType.Guest ||
              userRole === EmployeeType.RoomAdmin ||
              userRole === EmployeeType.User))
        ) {
          if (!isUserLDAP && !isUserSSO) {
            options.push("separator-1");
            options.push("change-email");
            options.push("change-password");

            if (isGuest) {
              options.push("share-guest");
              options.push("separator-3");
              options.push("change-type");
            }
          }

          options.push("reset-auth");

          if (!isUserLDAP) {
            options.push("separator-2");
            options.push("disable");
          }
        } else if (isRoomAdmin && userRole === EmployeeType.Guest) {
          options.push("room-list");
          options.push("share-guest");
          options.push("separator-1");
          options.push("change-type");
          options.push("separator-2");
          options.push("remove-guest");
        }

        break;
      case "disabled":
        if (
          isOwner ||
          (isAdmin &&
            (userRole === EmployeeType.Guest ||
              userRole === EmployeeType.RoomAdmin ||
              userRole === EmployeeType.User))
        ) {
          options.push("enable");

          options.push("details");

          if (userRole !== EmployeeType.Guest) {
            options.push("reassign-data");
          }

          options.push("separator-1");
          options.push("delete-user");
        } else {
          options.push("details");
          if (isRoomAdmin && userRole === EmployeeType.Guest) {
            options.push("separator-1");
            options.push("remove-guest");
          }
        }

        break;

      case "pending":
        if (
          isOwner ||
          (isAdmin &&
            (userRole === EmployeeType.Guest ||
              userRole === EmployeeType.RoomAdmin ||
              userRole === EmployeeType.User))
        ) {
          if (isMySelf) {
            options.push("profile");
          } else {
            options.push("invite-again");
            options.push("details");
          }

          if (isAdmin || isOwner) {
            options.push("room-list");
          }

          if (
            isOwner ||
            (isAdmin &&
              (userRole === EmployeeType.Guest ||
                userRole === EmployeeType.RoomAdmin ||
                userRole === EmployeeType.User))
          ) {
            if (isGuest) {
              options.push("separator-1");

              options.push("change-type");
            }
            options.push("separator-2");

            if (
              status === EmployeeStatus.Active ||
              status === EmployeeStatus.Pending
            ) {
              options.push("disable");
            } else if (status === EmployeeStatus.Disabled) {
              options.push("enable");
            }
          }
        } else {
          if (isMySelf) {
            options.push("profile");
          } else {
            options.push("details");
          }

          if (isAdmin || isOwner) {
            options.push("room-list");
          }

          if (isRoomAdmin && userRole === EmployeeType.Guest) {
            options.push("room-list");
            options.push("separator-1");
            options.push("change-type");
            options.push("separator-2");
            options.push("remove-guest");
          }
        }

        break;

      default:
        break;
    }

    return options;
  };

  setIsUsersLoading = (isLoading: boolean) => {
    this.isUsersLoading = isLoading;
  };

  fetchMoreUsers = async () => {
    if (!this.hasMoreUsers || this.isUsersLoading) return;

    this.setIsUsersLoading(true);

    const newFilter = this.filter.clone();
    newFilter.page += 1;

    this.setFilter(newFilter);

    this.abortController?.abort();

    this.abortController = new AbortController();

    const res = await api.people.getUserList(
      newFilter,
      this.abortController.signal,
    );

    runInAction(() => {
      this.setUsers([...this.users, ...res.items]);
      this.setIsUsersLoading(false);
    });

    this.abortController = null;
  };

  getPeopleListItem: (user: TUser) => TPeopleListItem = (user: TUser) => {
    const {
      id,
      displayName,
      avatar,
      avatarMax,
      hasAvatar,
      email,
      isOwner,
      isAdmin: isAdministrator,
      isVisitor,
      isCollaborator,
      isRoomAdmin,
      mobilePhone,
      userName,
      activationStatus,
      status,
      groups,
      title,
      firstName,
      lastName,
      isSSO,
      isLDAP,
      quotaLimit,
      usedSpace,
      isCustomQuota,
      createdBy,
      registrationDate,
      tfaAppEnabled,
    } = user;

    const statusType = getUserStatus(user);
    const role = getUserType(user);
    const isMySelf =
      (this.userStore.user && user.userName === this.userStore.user.userName) ??
      false;

    const options = this.getUserContextOptions(
      isMySelf,
      isSSO,
      isLDAP,
      isVisitor,
      statusType,
      role,
      status,
    );

    const locale = getCookie(LANGUAGE) ?? this.settingsStore.culture;

    const regDate = registrationDate
      ? getCorrectDate(locale, registrationDate)
      : undefined;

    const currentAvatar = hasAvatar ? avatar : DefaultUserPhotoSize32PngUrl;

    return {
      id,
      status,
      activationStatus,
      statusType,
      role,
      isOwner,
      isAdmin: isAdministrator,
      isCollaborator,
      isRoomAdmin,
      isVisitor,
      displayName,
      avatar: currentAvatar,
      avatarMax,
      hasAvatar,
      email,
      userName,
      mobilePhone,
      options,
      groups,
      position: title,
      firstName,
      lastName,
      isSSO,
      isLDAP,
      quotaLimit,
      usedSpace,
      isCustomQuota,
      createdBy,
      registrationDate: regDate,
      tfaAppEnabled,
    };
  };

  get peopleList() {
    const list = this.users.map((user) => this.getPeopleListItem(user));

    return list;
  }

  get hasMoreUsers() {
    if (this.clientLoadingStore.isLoading || this.requestRunning) return false;

    return this.peopleList.length < this.filter.total;
  }

  get needResetUserSelection() {
    return !this.isOneUserSelection && !this.isOnlyBufferSelection;
  }

  resetUsersRight = () => {
    Object.keys(this.selectionUsersRights).forEach((key) => {
      this.selectionUsersRights[key as keyof typeof this.selectionUsersRights] =
        0;
    });
  };

  incrementUsersRights = (selection: TPeopleListItem) => {
    Object.keys(this.selectionUsersRights).forEach((key) => {
      if (key in selection && !selection[key as keyof typeof selection]) return;

      type TKey = keyof typeof this.selectionUsersRights;

      this.selectionUsersRights[key as TKey] =
        this.selectionUsersRights[key as TKey] + 1;
    });
  };

  decrementUsersRights = (selection: TPeopleListItem) => {
    Object.keys(this.selectionUsersRights).forEach((key) => {
      if (key in selection && !selection[key as keyof typeof selection]) return;

      type TKey = keyof typeof this.selectionUsersRights;

      this.selectionUsersRights[key as TKey] =
        this.selectionUsersRights[key as TKey] - 1;
    });
  };

  recalculateUsersRights = () => {
    this.resetUsersRight();
    this.selection.forEach((u) => this.incrementUsersRights(u));
  };

  setSelection = (selection: TPeopleListItem[]) => {
    this.selection = selection;

    if (selection.length === 0) this.resetUsersRight();
  };

  updateSelection = () => {
    const hasSelection = !!this.selection.length;

    this.peopleList.forEach((el) => {
      if (hasSelection && this.selection[0].id === el.id)
        this.setSelection([el]);

      if (this.bufferSelection && this.bufferSelection.id === el.id)
        this.setBufferSelection(el);
    });

    if (hasSelection) {
      this.recalculateUsersRights();
    }
  };

  setSelections = (added: Element[], removed: Element[], clear = false) => {
    if (clear) {
      this.selection = [];
    }

    const newSelections: typeof this.selection = JSON.parse(
      JSON.stringify(this.selection),
    );

    added.forEach((item) => {
      if (!item) return;

      const value = item.getElementsByClassName("user-item")
        ? item.getElementsByClassName("user-item")[0]?.getAttribute("value")
        : null;

      if (!value) return;

      const splitValue = value.split("_");
      const id = splitValue.slice(1, -3).join("_");

      const isFound = this.selection.findIndex((f) => f.id === id) === -1;

      if (isFound) {
        const user = this.peopleList.find((f) => f.id === id);

        if (user) {
          this.incrementUsersRights(user);
          newSelections.push(user);
        }
      }
    });

    removed.forEach((item) => {
      if (!item) return;

      const value = item.getElementsByClassName("user-item")
        ? item.getElementsByClassName("user-item")[0]?.getAttribute("value")
        : null;

      if (!value) return;
      const splitValue = value.split("_");
      const id = splitValue.slice(1, -3).join("_");

      const index = newSelections.findIndex((i) => i.id === id);

      if (index !== -1) {
        this.decrementUsersRights(newSelections[index]);
        newSelections.splice(index, 1);
      }
    });

    this.setSelection(newSelections);
  };

  setBufferSelection = (bufferSelection: typeof this.bufferSelection) => {
    this.bufferSelection = bufferSelection;
  };

  selectUser = (user: TPeopleListItem) => {
    const index = this.selection.findIndex((el) => el.id === user!.id);

    const exists = index > -1;

    if (exists) return;

    this.setSelection([...this.selection, user!]);
    this.contactsHotkeysStore.setHotkeyCaret(null);

    this.incrementUsersRights(user);
  };

  deselectUser = (user: TPeopleListItem) => {
    const index = this.selection.findIndex((el) => el.id === user.id);

    const exists = index > -1;

    if (!exists) return;

    const newData = [...this.selection];

    newData.splice(index, 1);

    this.decrementUsersRights(this.selection[index]);

    this.setSelection(newData);
  };

  selectAll = () => {
    this.bufferSelection = null;

    this.setSelection(this.peopleList);
  };

  clearSelection = () => {
    return this.setSelection([]);
  };

  selectRow = (item: TPeopleListItem) => {
    const isItemSelected = !!this.selection.find((s) => s.id === item.id);
    const isSingleSelected = isItemSelected && this.selection.length === 1;

    if (this.bufferSelection) {
      this.setBufferSelection(null);
    }

    if (isSingleSelected) {
      this.deselectUser(item);
    } else {
      this.clearSelection();
      this.selectUser(item);
    }
  };

  singleContextMenuAction = (item: typeof this.bufferSelection) => {
    if (this.selection.length) {
      this.clearSelection();
    }

    this.setBufferSelection(item);
  };

  multipleContextMenuAction = (item: TPeopleListItem) => {
    const isItemSelected = !!this.selection.find((s) => s.id === item.id);
    const isSingleSelected = isItemSelected && this.selection.length === 1;

    if (!isItemSelected || isSingleSelected) {
      this.clearSelection();
      this.setBufferSelection(item);
    }
  };

  resetSelections = () => {
    this.setBufferSelection(null);
    this.clearSelection();
  };

  selectByStatus = (status: EmployeeStatus) => {
    this.bufferSelection = null;
    const list = this.peopleList.filter((u) => u.status === status);

    this.setSelection(list);
  };

  getUsersBySelected = (
    users: TPeopleListItem[],
    selected: TContactsSelected,
  ) => {
    const newSelection: TPeopleListItem[] = [];
    users.forEach((user) => {
      const checked = getUserChecked(user as unknown as TUser, selected);

      if (checked) newSelection.push(user);
    });

    return newSelection;
  };

  setSelected = (selected: TContactsSelected) => {
    const { hotkeyCaret, setHotkeyCaret } = this.contactsHotkeysStore;
    this.bufferSelection = null;
    this.selected = selected;

    setHotkeyCaret(this.selection.at(-1) ?? hotkeyCaret);
    const selectedUser = this.getUsersBySelected(this.peopleList, selected);
    this.setSelection(selectedUser);

    if (selected !== "none" && selected !== "close") {
      this.resetUsersRight();
      this.peopleList.forEach((u) => this.incrementUsersRights(u));
    }

    return selected;
  };

  get hasAnybodySelected() {
    return this.selection.length > 0;
  }

  get hasUsersToMakeEmployees() {
    const { canMakeEmployeeUser } = this.accessRightsStore;

    const users = this.selection.filter((x) => canMakeEmployeeUser(x));

    return users.length > 0;
  }

  get hasUsersToChangeType() {
    const { canChangeUserType } = this.accessRightsStore;

    if (this.selection.length > 1) return false;

    const users = this.selection.filter((x) => canChangeUserType(x));

    return users.length > 0;
  }

  get getUsersToMakeEmployees() {
    const { canMakeEmployeeUser } = this.accessRightsStore;

    let users = this.selection.filter((x) => canMakeEmployeeUser(x));

    if (
      this.bufferSelection &&
      canMakeEmployeeUser(this.bufferSelection) &&
      !users.length
    ) {
      users = [this.bufferSelection];
    }

    return users.map((u) => u);
  }

  get userSelectionRole() {
    if (this.selection.length !== 1) return null;

    return this.selection[0].role;
  }

  get isOneUserSelection() {
    return this.selection.length > 0 && this.selection.length === 1;
  }

  get isOnlyBufferSelection() {
    return !this.selection.length && !!this.bufferSelection;
  }

  get hasFreeUsers() {
    const users = this.selection.filter(
      (x) => x.status !== EmployeeStatus.Disabled && x.isVisitor,
    );

    return users.length > 0;
  }

  get hasUsersToActivate() {
    const { canActivateUser } = this.accessRightsStore;

    const users = this.selection.filter((x) => canActivateUser(x));

    return users.length > 0;
  }

  get getUsersToActivate() {
    const { canActivateUser } = this.accessRightsStore;

    const users = this.selection.filter((x) => canActivateUser(x));

    return users.map((u) => u);
  }

  get hasUsersToDisable() {
    const { canDisableUser } = this.accessRightsStore;

    const users = this.selection.filter((x) => canDisableUser(x));

    return users.length > 0;
  }

  get getUsersToDisable() {
    const { canDisableUser } = this.accessRightsStore;

    const users = this.selection.filter((x) => canDisableUser(x));

    return users.map((u) => u);
  }

  get hasUsersToInvite() {
    const { canInviteUser } = this.accessRightsStore;

    const users = this.selection.filter((x) => canInviteUser(x));

    return users.length > 0;
  }

  get getUsersToInviteIds() {
    const { canInviteUser } = this.accessRightsStore;

    const users = this.selection.filter((x) => canInviteUser(x));

    return users.length > 0 ? users.map((u) => u.id) : [];
  }

  get hasOnlyOneUserToRemove() {
    const { canRemoveOnlyOneUser } = this.accessRightsStore;

    if (!this.isOneUserSelection) return false;

    const users = this.selection.filter((x) => canRemoveOnlyOneUser(x));

    return users.length === 1;
  }

  get getUsersToRemoveIds() {
    const { canRemoveUser } = this.accessRightsStore;

    const users = this.selection.filter((x) => canRemoveUser(x));

    return users.map((u) => u.id);
  }

  get hasUsersToChangeQuota() {
    const { canChangeQuota } = this.accessRightsStore;

    const users = this.selection.filter(() => canChangeQuota());

    return users.length > 0;
  }

  get hasUsersToDisableQuota() {
    const { canDisableQuota } = this.accessRightsStore;

    const users = this.selection.filter(() => canDisableQuota());

    return users.length > 0;
  }

  get hasUsersToResetQuota() {
    const { caResetCustomQuota } = this.accessRightsStore;

    const users = this.selection.filter((x) => caResetCustomQuota(x));

    return users.length > 0;
  }

  changeType = async (
    type: EmployeeType,
    users: UsersStore["getUsersToMakeEmployees"],
    successCallback?: (users?: TUser[]) => void,
    abortCallback?: VoidFunction,
  ) => {
    const { setDialogData } = this.dialogStore!;

    const event = new Event(Events.CHANGE_USER_TYPE);

    let needReassignData = false;

    if (type === EmployeeType.Guest || type === EmployeeType.User) {
      let timerId: NodeJS.Timeout | null = setTimeout(() => {
        this.setActiveUsers([users[0]]);
      }, 200);

      needReassignData = (await reassignmentNecessary(
        users[0].id,
        type,
      )) as boolean;

      if (timerId) clearTimeout(timerId);
      timerId = null;
      this.setActiveUsers([]);
    }

    let fromType =
      users.length === 1
        ? [
            users[0].role
              ? users[0].role
              : getUserType(users[0] as unknown as TUser),
          ]
        : users.map((u) =>
            u.role ? u.role : getUserType(u as unknown as TUser),
          );

    if (users.length > 1) {
      fromType = fromType.filter(
        (item, index) => fromType.indexOf(item) === index && item !== type,
      );

      if (fromType.length === 0) fromType = [fromType[0]];
    }

    if (fromType.length === 1 && fromType[0] === type) return false;

    const userNames: string[] = [];

    const userIDs = users
      .filter((u) => u.role !== type)
      .map((user) => {
        if (user.displayName) userNames.push(user.displayName);
        return user?.id ? user.id : user;
      });

    setDialogData({
      toType: type,
      fromType,
      userIDs,
      userNames,
      successCallback,
      abortCallback,
      ...(fromType[0] !== EmployeeType.Guest && {
        user: users[0],
        getReassignmentProgress,
        reassignUserData: downgradeUserType,
        cancelReassignment: terminateReassignment,
        showDeleteProfileCheckbox: false,
        needReassignData,
      }),
    } as TChangeUserTypeDialogData);

    window.dispatchEvent(event);

    return true;
  };

  changeStatus = (
    status: EmployeeStatus,
    users: typeof this.getUsersToActivate | typeof this.getUsersToDisable,
  ) => {
    const { setChangeUserStatusDialogVisible, setDialogData } =
      this.dialogStore;

    const userIDs = users.map((user) => {
      return user?.id ? user.id : user;
    });

    setDialogData({
      status,
      userIDs,
      isGuests: this.contactsTab === "guests",
    } as TChangeUserStatusDialogData);

    setChangeUserStatusDialogVisible(true);
  };

  setActiveUsers = (users: TPeopleListItem[]) => {
    this.activeUsers = users;
  };
}

export default UsersStore;
