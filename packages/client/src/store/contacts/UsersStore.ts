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

import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import Filter from "@docspace/shared/api/people/filter";
import {
  TFilterSortBy,
  TSortOrder,
  TUser,
} from "@docspace/shared/api/people/types";
import { TThirdPartyProvider } from "@docspace/shared/api/settings/types";

import { EmployeeStatus, EmployeeType } from "@docspace/shared/enums";
import { getUserRole } from "@docspace/shared/utils/common";

import { UserStore } from "@docspace/shared/store/UserStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";

import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
import { setContactsFilterUrl } from "SRC_DIR/helpers/contacts";

import InfoPanelStore from "../InfoPanelStore";

import TargetUserStore from "./TargetUserStore";
import GroupsStore from "./GroupsStore";
import SelectionStore from "./SelectionPeopleStore";

class UsersStore {
  filter = Filter.getDefault();

  users: TUser[] = [];

  providers: TThirdPartyProvider[] = [];

  isUsersLoading = false;

  operationRunning = false;

  abortController = new AbortController();

  requestRunning = false;

  constructor(
    public settingsStore: SettingsStore,
    public infoPanelStore: InfoPanelStore,
    public userStore: UserStore,
    public targetUserStore: TargetUserStore,
    public groupsStore: GroupsStore,
    public selectionStore: SelectionStore,
  ) {
    this.settingsStore = settingsStore;
    this.infoPanelStore = infoPanelStore;
    this.userStore = userStore;
    this.targetUserStore = targetUserStore;
    this.groupsStore = groupsStore;
    this.selectionStore = selectionStore;

    makeAutoObservable(this);
  }

  setFilter = (filter: Filter) => {
    const key = `PeopleFilter=${this.userStore.user?.id}`;
    const value = `${filter.sortBy},${filter.pageCount},${filter.sortOrder}`;
    localStorage.setItem(key, value);
    setContactsFilterUrl(filter);

    this.filter = filter;
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
      this.filter.userId
    );
  }

  setUsers = (users: TUser[]) => {
    this.users = users;
  };

  getUsersList = async (
    filter: Filter,
    updateFilter = false,
    withFilterLocalStorage = false,
  ) => {
    const filterData = filter ? filter.clone() : Filter.getDefault();

    if (this.requestRunning) {
      this.abortController.abort();

      this.abortController = new AbortController();
    }

    const filterStorageItem = localStorage.getItem(
      `PeopleFilter=${this.userStore.user?.id}`,
    );

    if (filterStorageItem && withFilterLocalStorage) {
      const splitFilter = filterStorageItem.split(",");

      filterData.sortBy = splitFilter[0] as TFilterSortBy;
      filterData.pageCount = +splitFilter[1];
      filterData.sortOrder = splitFilter[2] as TSortOrder;
    }

    if (!this.settingsStore.withPaging) {
      const isCustomCountPage =
        filter && filter.pageCount !== 100 && filter.pageCount !== 25;

      if (!isCustomCountPage) {
        filterData.page = 0;
        filterData.pageCount = 100;
      }
    }

    if (filterData.group && filterData.group === "root") {
      filterData.group = null;
    }

    this.requestRunning = true;

    const res = await api.people.getUserList(
      filterData,
      this.abortController.signal,
    );

    filterData.total = res.total;

    this.requestRunning = false;

    if (updateFilter) {
      this.setFilter(filterData);
    }

    this.setUsers(res.items);

    return Promise.resolve(res.items);
  };

  setProviders = (providers: TThirdPartyProvider[]) => {
    this.providers = providers;
  };

  removeUsers = async (
    userIds: string[],
    filter: Filter,
    isInsideGroup: boolean,
  ) => {
    const { refreshInsideGroup } = this.groupsStore;

    await api.people.deleteUsers(userIds);

    if (isInsideGroup) {
      await refreshInsideGroup();
    } else {
      await this.getUsersList(filter, true);
    }
  };

  updateUserStatus = async (status: EmployeeStatus, userIds: string[]) => {
    const updatedUsers = await api.people.updateUserStatus(status, userIds);
    if (updatedUsers) {
      updatedUsers.forEach((user) => {
        const userIndex = this.users.findIndex((x) => x.id === user.id);
        if (userIndex !== -1) this.users[userIndex] = user;
      });

      if (!this.needResetUserSelection) {
        this.selectionStore.updateSelection(this.peopleList);
      }
    }

    return updatedUsers;
  };

  updateUserType = async (
    type: EmployeeType,
    userIds: string[],
    filter: Filter,
  ) => {
    let toType = 0;

    switch (type) {
      case "admin":
        toType = EmployeeType.Admin;
        break;
      case "user":
        toType = EmployeeType.Guest;
        break;
      case "collaborator":
        toType = EmployeeType.Collaborator;
        break;
      case "manager":
        toType = EmployeeType.User;
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

    await this.getUsersList(filter); // rooms

    if (updatedUsers && !this.needResetUserSelection) {
      this.selectionStore.updateSelection(this.peopleList);
    }

    return updatedUsers;
  };

  setCustomUserQuota = async (
    quotaSize: string | number,
    userIds: string[],
  ) => {
    const updatedUsers = await api.people.setCustomUserQuota(
      userIds,
      +quotaSize,
    );

    await this.getUsersList(this.filter, true);

    return updatedUsers;
  };

  resetUserQuota = async (userIds: string[]) => {
    const updatedUsers = await api.people.resetUserQuota(userIds);

    await this.getUsersList(this.filter, true);

    return updatedUsers;
  };

  updateProfileInUsers = async (updatedProfile?: TUser) => {
    const updatedUser = updatedProfile ?? this.targetUserStore.targetUser;
    if (!this.users) {
      return this.getUsersList(this.filter);
    }

    if (!updatedUser) return;

    const updatedUsers = this.users.map((user) => {
      if (
        user.id === updatedUser.id ||
        user.userName === updatedUser.userName
      ) {
        return { ...user, ...updatedUser };
      }

      return user;
    });

    this.setUsers(updatedUsers);
  };

  getUserContextOptions = (
    isMySelf: boolean,
    isUserSSO: boolean,
    isUserLDAP: boolean,
    statusType: ReturnType<typeof getUserStatus>,
    userRole: ReturnType<typeof getUserRole>,
    status: EmployeeStatus,
  ) => {
    if (!this.userStore.user) return;

    const { isOwner, isAdmin, isVisitor, isCollaborator, isLDAP } =
      this.userStore.user;

    const options: string[] = [];

    switch (statusType) {
      case "active":
      case "unknown":
        if (isMySelf) {
          options.push("profile");
        } else {
          options.push("details");
        }

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
            (userRole === "user" ||
              userRole === "manager" ||
              userRole === "collaborator"))
        ) {
          if (!isUserLDAP && !isUserSSO) {
            options.push("separator-1");

            options.push("change-email");
            options.push("change-password");
          }

          options.push("reset-auth");

          if (!isUserLDAP) {
            options.push("separator-2");
            options.push("disable");
          }
        }

        break;
      case "disabled":
        if (
          isOwner ||
          (isAdmin &&
            (userRole === "manager" ||
              userRole === "user" ||
              userRole === "collaborator"))
        ) {
          options.push("enable");

          options.push("details");

          if (userRole !== "user") {
            options.push("reassign-data");
          }

          options.push("separator-1");
          options.push("delete-user");
        } else {
          options.push("details");
        }

        break;

      case "pending":
        if (
          isOwner ||
          ((isAdmin || (!isVisitor && !isCollaborator)) &&
            userRole === "manager") ||
          userRole === "collaborator" ||
          userRole === "user"
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
              (userRole === "manager" ||
                userRole === "user" ||
                userRole === "collaborator"))
          ) {
            options.push("separator-1");

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

  fetchMoreAccounts = async () => {
    if (!this.hasMoreAccounts || this.isUsersLoading) return;

    this.setIsUsersLoading(true);

    const newFilter = this.filter.clone();
    newFilter.page += 1;
    this.setFilter(newFilter);

    const res = await api.people.getUserList(
      newFilter,
      this.abortController.signal,
    );

    runInAction(() => {
      this.setUsers([...this.users, ...res.items]);
      this.setIsUsersLoading(false);
    });
  };

  getPeopleListItem = (user: TUser) => {
    const {
      id,
      displayName,
      avatar,
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
    } = user;

    const statusType = getUserStatus(user);
    const role = getUserRole(user);
    const isMySelf =
      (this.userStore.user && user.userName === this.userStore.user.userName) ??
      false;

    const options = this.getUserContextOptions(
      isMySelf,
      isSSO,
      isLDAP,
      statusType,
      role,
      status,
    );

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
    };
  };

  get peopleList() {
    const list = this.users.map((user) => this.getPeopleListItem(user));

    return list;
  }

  get hasMoreAccounts() {
    return this.peopleList.length < this.filterTotal;
  }

  get needResetUserSelection() {
    const { isVisible: infoPanelVisible } = this.infoPanelStore;
    const { isOneUserSelection, isOnlyBufferSelection } = this.selectionStore;

    return !infoPanelVisible || (!isOneUserSelection && !isOnlyBufferSelection);
  }
}

export default UsersStore;
