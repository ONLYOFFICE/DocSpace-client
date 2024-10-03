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
import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";
import api from "@docspace/shared/api";
import {
  EmployeeStatus,
  EmployeeType,
  EmployeeActivationStatus,
} from "@docspace/shared/enums";
import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
const { Filter } = api;

const fullAccessId = "00000000-0000-0000-0000-000000000000";

class UsersStore {
  peopleStore = null;
  settingsStore = null;
  infoPanelStore = null;
  userStore = null;

  users = [];
  providers = [];
  accountsIsIsLoading = false;
  operationRunning = false;
  abortController = new AbortController();
  requestRunning = false;

  constructor(peopleStore, settingsStore, infoPanelStore, userStore) {
    this.peopleStore = peopleStore;
    this.settingsStore = settingsStore;
    this.infoPanelStore = infoPanelStore;
    this.userStore = userStore;
    makeAutoObservable(this);
  }

  getUsersList = async (
    filter,
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

      filterData.sortBy = splitFilter[0];
      filterData.pageCount = +splitFilter[1];
      filterData.sortOrder = splitFilter[2];
    }

    if (!this.settingsStore.withPaging) {
      const isCustomCountPage =
        filter && filter.pageCount !== 100 && filter.pageCount !== 25;

      if (!isCustomCountPage) {
        filterData.page = 0;
        filterData.pageCount = 100;
      }
    }

    if (filterData.group && filterData.group === "root")
      filterData.group = undefined;

    this.requestRunning = true;

    const res = await api.people.getUserList(
      filterData,
      this.abortController.signal,
    );
    filterData.total = res.total;

    this.requestRunning = false;

    if (updateFilter) {
      this.peopleStore.filterStore.setFilterParams(filterData);
    }

    this.setUsers(res.items);

    return Promise.resolve(res.items);
  };

  setUsers = (users) => {
    this.users = users;
  };

  setProviders = (providers) => {
    this.providers = providers;
  };

  setOperationRunning = (operationRunning) => {
    this.operationRunning = operationRunning;
  };

  employeeWrapperToMemberModel = (profile) => {
    const comment = profile.notes;
    const department = profile.groups
      ? profile.groups.map((group) => group.id)
      : [];
    const worksFrom = profile.workFrom;

    return { ...profile, comment, department, worksFrom };
  };

  createUser = async (user) => {
    const filter = this.peopleStore.filterStore.filter;
    const member = this.employeeWrapperToMemberModel(user);
    let result;
    const res = await api.people.createUser(member);
    result = res;

    await this.peopleStore.targetUserStore.getTargetUser(result.userName);
    await this.getUsersList(filter);
    return Promise.resolve(result);
  };

  removeUser = async (userId, filter, isInsideGroup) => {
    const { refreshInsideGroup } = this.peopleStore.groupsStore;

    await api.people.deleteUsers(userId);

    isInsideGroup
      ? await refreshInsideGroup()
      : await this.getUsersList(filter, true);
  };

  get needResetUserSelection() {
    const { isVisible: infoPanelVisible } = this.infoPanelStore;
    const { isOneUserSelection, isOnlyBufferSelection } =
      this.peopleStore.selectionStore;

    return !infoPanelVisible || (!isOneUserSelection && !isOnlyBufferSelection);
  }
  updateUserStatus = async (status, userIds) => {
    return api.people.updateUserStatus(status, userIds).then((users) => {
      if (users) {
        users.forEach((user) => {
          const userIndex = this.users.findIndex((x) => x.id === user.id);
          if (userIndex !== -1) this.users[userIndex] = user;
        });

        if (!this.needResetUserSelection) {
          this.peopleStore.selectionStore.updateSelection(this.peopleList);
        }
      }

      return users;
    });
  };

  updateUserType = async (type, userIds, filter) => {
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
    }

    let users = null;

    try {
      users = await api.people.updateUserType(toType, userIds);
    } catch (e) {
      throw new Error(e);
    }

    // await this.getUsersList(filter, true); // accounts loader
    await this.getUsersList(filter); // rooms

    if (users && !this.needResetUserSelection) {
      this.peopleStore.selectionStore.updateSelection(this.peopleList);
    }

    return users;
  };

  setCustomUserQuota = async (quotaSize, userIds) => {
    const filter = this.peopleStore.filterStore.filter;
    const users = await api.people.setCustomUserQuota(userIds, +quotaSize);

    await this.getUsersList(filter, true);

    return users;
  };

  resetUserQuota = async (userIds) => {
    const filter = this.peopleStore.filterStore.filter;
    const users = await api.people.resetUserQuota(userIds);

    await this.getUsersList(filter, true);

    return users;
  };

  updateProfileInUsers = async (updatedProfile) => {
    if (!this.users) {
      return this.getUsersList();
    }
    if (!updatedProfile) {
      updatedProfile = this.peopleStore.targetUserStore.targetUser;
    }
    const { userName } = updatedProfile;
    const oldProfileArr = this.users.filter((u) => u.userName === userName);
    const oldProfile = oldProfileArr[0];
    const newProfile = {};

    for (let key in oldProfile) {
      if (
        updatedProfile.hasOwnProperty(key) &&
        updatedProfile[key] !== oldProfile[key]
      ) {
        newProfile[key] = updatedProfile[key];
      } else {
        newProfile[key] = oldProfile[key];
      }
    }

    const updatedUsers = this.users.map((user) =>
      user.id === newProfile.id ? newProfile : user,
    );

    this.setUsers(updatedUsers);
  };

  getUserRole = (user) => {
    if (user.isOwner) return "owner";
    else if (user.isAdmin) return "admin";
    else if (user.isCollaborator) return "collaborator";
    else if (user.isVisitor) return "user";
    else return "manager";
  };

  getUserContextOptions = (
    isMySelf,
    isUserSSO,
    isUserLDAP,
    statusType,
    userRole,
    status,
  ) => {
    const { isOwner, isAdmin, isVisitor, isCollaborator, isLDAP } =
      this.userStore.user;

    const options = [];

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
        } else {
          if (
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
    }

    return options;
  };

  isUserSelected = (id) => {
    return this.peopleStore.selectionStore.selection.some((el) => el.id === id);
  };

  setAccountsIsIsLoading = (accountsIsIsLoading) => {
    this.accountsIsIsLoading = accountsIsIsLoading;
  };

  fetchMoreAccounts = async () => {
    if (!this.hasMoreAccounts || this.accountsIsIsLoading) return;
    // console.log("fetchMoreAccounts");

    this.setAccountsIsIsLoading(true);

    const { filter, setFilterParams } = this.peopleStore.filterStore;

    const newFilter = filter.clone();
    newFilter.page += 1;
    setFilterParams(newFilter);

    const res = await api.people.getUserList(newFilter);

    runInAction(() => {
      this.setUsers([...this.users, ...res.items]);
      this.setAccountsIsIsLoading(false);
    });
  };

  get hasMoreAccounts() {
    return this.peopleList.length < this.peopleStore.filterStore.filterTotal;
  }

  getUsersByQuery = async (query) => {
    const filter = Filter.getFilterWithOutDisabledUser();

    filter.search = query;
    filter.pageCount = 100;

    const res = await api.people.getUserList(filter);

    return res.items;
  };

  getPeopleListItem = (user) => {
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
    const role = this.getUserRole(user);
    const isMySelf =
      this.userStore.user && user.userName === this.userStore.user.userName;

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

  inviteUsers = async (data) => {
    const result = await api.people.inviteUsers(data);

    return Promise.resolve(result);
  };
}

export default UsersStore;
