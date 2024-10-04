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
import { EmployeeStatus } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import SettingsSetupStore from "./SettingsSetupStore";
import moment from "moment-timezone";

class SelectionStore {
  peopleStore = null;
  sessionsData = []; // Sessions inited in fetchData.
  dataFromSocket = []; // Sessions from socket (all sessions, include closed sessions or from deleted users)
  activeSessionsMap = new Map();
  displayName = "";
  fromDateAgo = {};
  items;
  platformData = [];
  isLoading = false;
  isSessionsLoaded = false;
  isDisabled = false;
  selection = [];
  selectionUsersRights = {
    isVisitor: 0,
    isCollaborator: 0,
    isRoomAdmin: 0,
    isAdmin: 0,
  };
  bufferSelection = null;
  selected = "none";

  constructor(peopleStore) {
    this.peopleStore = peopleStore;
    this.settingsSetupStore = new SettingsSetupStore(this);

    makeAutoObservable(this);
  }

  updateSelection = (peopleList) => {
    const hasSelection = !!this.selection.length;
    const hasBufferSelection = !!this.bufferSelection;

    peopleList.some((el) => {
      if (hasSelection && this.selection[0].id === el.id)
        this.setSelection([el]);

      if (hasBufferSelection && this.bufferSelection.id === el.id)
        this.setBufferSelection(el);
    });

    if (hasSelection) {
      this.recalculateUsersRights();
    }
  };

  resetUsersRight = () => {
    for (const key in this.selectionUsersRights) {
      this.selectionUsersRights[key] = 0;
    }
  };

  incrementUsersRights = (selection) => {
    for (const key in this.selectionUsersRights) {
      if (selection[key]) {
        this.selectionUsersRights[key]++;
      }
    }
  };

  decrementUsersRights = (selection) => {
    for (const key in this.selectionUsersRights) {
      if (selection[key]) {
        this.selectionUsersRights[key]--;
      }
    }
  };

  recalculateUsersRights = () => {
    this.resetUsersRight();
    this.selection.forEach((u) => this.incrementUsersRights(u));
  };

  setSelection = (selection) => {
    // console.log("setSelection", { selection });
    this.selection = selection;

    selection.length === 0 && this.resetUsersRight();
  };

  setSelections = (added, removed, clear = false) => {
    if (clear) {
      this.selection = [];
    }

    let newSelections = JSON.parse(JSON.stringify(this.selection));

    for (let item of added) {
      if (!item) return;

      const value = item.getElementsByClassName("user-item")
        ? item.getElementsByClassName("user-item")[0]?.getAttribute("value")
        : null;

      if (!value) return;
      const splitValue = value && value.split("_");
      const id = splitValue.slice(1, -3).join("_");

      const isFound = this.selection.findIndex((f) => f.id == id) === -1;

      if (isFound) {
        const user = this.peopleStore.usersStore.peopleList.find(
          (f) => f.id == id,
        );
        newSelections.push(user);

        this.incrementUsersRights(user);
      }
    }

    for (let item of removed) {
      if (!item) return;

      const value = item.getElementsByClassName("user-item")
        ? item.getElementsByClassName("user-item")[0]?.getAttribute("value")
        : null;

      const splitValue = value && value.split("_");
      const id = splitValue.slice(1, -3).join("_");

      const index = newSelections.findIndex((item) => item.id == id);

      if (index !== -1) {
        this.decrementUsersRights(newSelections[index]);
        newSelections.splice(index, 1);
      }
    }

    this.setSelection(newSelections);
  };

  setBufferSelection = (bufferSelection) => {
    this.bufferSelection = bufferSelection;
  };

  selectRow = (item) => {
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

  singleContextMenuAction = (item) => {
    if (this.selection.length) {
      this.clearSelection();
    }

    this.setBufferSelection(item);
  };

  multipleContextMenuAction = (item) => {
    const isItemSelected = !!this.selection.find((s) => s.id === item.id);
    const isSingleSelected = isItemSelected && this.selection.length === 1;

    if (!isItemSelected || isSingleSelected) {
      this.clearSelection();
      this.setBufferSelection(item);
    }
  };

  selectUser = (user) => {
    const index = this.selection.findIndex((el) => el.id === user.id);

    const exists = index > -1;

    // console.log("selectUser", { user, selection: this.selection, exists });

    if (exists) return;

    this.setSelection([...this.selection, user]);
    this.peopleStore.accountsHotkeysStore.setHotkeyCaret(null);

    this.incrementUsersRights(user);
  };

  deselectUser = (user) => {
    const index = this.selection.findIndex((el) => el.id === user.id);

    const exists = index > -1;

    //console.log("deselectUser", { user, selection: this.selection, exists });

    if (!exists) return;

    const newData = [...this.selection];

    newData.splice(index, 1);

    this.decrementUsersRights(this.selection[index]);

    this.setSelection(newData);
  };

  selectAll = () => {
    this.bufferSelection = null;
    const list = this.peopleStore.usersStore.peopleList;
    this.setSelection(list);
  };

  clearSelection = () => {
    return this.setSelection([]);
  };

  resetSelections = () => {
    this.setBufferSelection(null);
    this.clearSelection();
  };

  selectByStatus = (status) => {
    this.bufferSelection = null;
    const list = this.peopleStore.usersStore.peopleList.filter(
      (u) => u.status === status,
    );

    this.setSelection(list);
  };

  getUserChecked = (user, selected) => {
    switch (selected) {
      case "all":
        return true;
      case "active":
        return user.status === EmployeeStatus.Active;
      case "pending":
        return user.status === EmployeeStatus.Pending;
      case "disabled":
        return user.status === EmployeeStatus.Disabled;
      case "online":
        return user.status === EmployeeStatus.Online;
      case "offline":
        return user.status === EmployeeStatus.Offline;
      default:
        return false;
    }
  };

  getUsersBySelected = (users, selected) => {
    let newSelection = [];
    users.forEach((user) => {
      const checked = this.getUserChecked(user, selected);

      if (checked) newSelection.push(user);
    });

    return newSelection;
  };

  setSelected = (selected, isSessionsPage) => {
    this.bufferSelection = null;
    this.selected = selected;
    const sessions = this.allSessions;
    const list = this.peopleStore.usersStore.peopleList;

    if (selected !== "none" && selected !== "close") {
      this.resetUsersRight();
      list.forEach((u) => this.incrementUsersRights(u));
    }

    this.peopleStore.accountsHotkeysStore.setHotkeyCaret(null);
    isSessionsPage
      ? this.setSelection(this.getUsersBySelected(sessions, selected))
      : this.setSelection(this.getUsersBySelected(list, selected));

    return selected;
  };

  get hasAnybodySelected() {
    return this.selection.length > 0;
  }

  get hasUsersToMakeEmployees() {
    const { canMakeEmployeeUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canMakeEmployeeUser(x));

    return users.length > 0;
  }
  get hasUsersToMakePowerUser() {
    const { canMakePowerUser } = this.peopleStore.accessRightsStore;
    const users = this.selection.filter((x) => canMakePowerUser(x));

    return users.length > 0;
  }
  get getUsersToMakeEmployees() {
    const { canMakeEmployeeUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canMakeEmployeeUser(x));

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
    const { canActivateUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canActivateUser(x));

    return users.length > 0;
  }

  get getUsersToActivate() {
    const { canActivateUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canActivateUser(x));

    return users.map((u) => u);
  }

  get hasUsersToDisable() {
    const { canDisableUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canDisableUser(x));

    return users.length > 0;
  }

  get getUsersToDisable() {
    const { canDisableUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canDisableUser(x));

    return users.map((u) => u);
  }

  get hasUsersToInvite() {
    const { canInviteUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canInviteUser(x));

    return users.length > 0;
  }

  get getUsersToInviteIds() {
    const { canInviteUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canInviteUser(x));

    return users.length > 0 ? users.map((u) => u.id) : [];
  }

  get hasUsersToRemove() {
    const { canRemoveUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canRemoveUser(x));

    return users.length > 0;
  }

  get hasOnlyOneUserToRemove() {
    const { canRemoveUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canRemoveUser(x));

    return users.length === 1;
  }

  get getUsersToRemoveIds() {
    const { canRemoveUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canRemoveUser(x));

    return users.map((u) => u.id);
  }

  get hasUsersToChangeQuota() {
    const { canChangeQuota } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter(() => canChangeQuota());

    return users.length > 0;
  }

  get hasUsersToDisableQuota() {
    const { canDisableQuota } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter(() => canDisableQuota());

    return users.length > 0;
  }

  get hasUsersToResetQuota() {
    const { caResetCustomQuota } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => caResetCustomQuota(x));

    return users.length > 0;
  }

  get isSeveralSelection() {
    return this.selection.length > 1;
  }

  get isHeaderVisible() {
    return this.selection.length > 0;
  }

  get isHeaderIndeterminate() {
    return (
      this.isHeaderVisible && this.selection.length !== this.sessionsData.length
    );
  }

  get isHeaderChecked() {
    return (
      this.isHeaderVisible && this.selection.length === this.sessionsData.length
    );
  }

  setAllSessions = (allSessions) => {
    this.allSessions = allSessions;
  };

  setSessionsData = (data) => {
    this.sessionsData = data;
  };

  setDataFromSocket = (data) => {
    this.dataFromSocket = data;
  };

  setDisplayName = (displayName) => {
    this.displayName = displayName;
  };

  setItems = (items) => {
    this.items = items;
  };

  setPlatformData = (data) => {
    this.platformData = data;
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };

  setIsSessionsLoaded = (isSessionsLoaded) => {
    this.isSessionsLoaded = isSessionsLoaded;
  };

  setFromDateAgo = (id, value) => {
    this.fromDateAgo[id] = value;
  };

  setIsDisabled = (isDisabled) => {
    this.isDisabled = isDisabled;
  };

  getFromDateAgo = (sessionId) => {
    return this.fromDateAgo[sessionId] || "";
  };

  get isMe() {
    const { id } = this.peopleStore.userStore.user;

    const selectionUserId = this.selection.map((user) => user.id);

    const userIds =
      this.bufferSelection?.id !== undefined
        ? [this.bufferSelection.id, ...selectionUserId]
        : [...selectionUserId];

    return userIds.includes(id);
  }

  get getItems() {
    if (!this.items) return {};
    return this.allSessions.find((item) => item.id === this.items.userId) ?? {};
  }

  convertDate = (t, dateString, locale) => {
    const parsedDate = moment(new Date(dateString).toISOString());
    const now = moment();
    const daysDiff = now.diff(parsedDate, "days");
    moment.locale(locale);

    if (daysDiff < 1) return parsedDate.fromNow();
    if (daysDiff === 1) return t("Common:Yesterday");
    if (daysDiff < 7) return parsedDate.fromNow();
    return parsedDate.format(locale);
  };

  findSessionIndexByUserId = (userIds) => {
    if (!Array.isArray(userIds)) {
      userIds = [userIds];
    }

    return this.dataFromSocket.reduce((indexes, data, index) => {
      if (userIds.includes(data.userId)) {
        indexes.push(index);
      }
      return indexes;
    }, []);
  };

  sessionLogout = ({ userId, date }) => {
    const newData = [...this.dataFromSocket];

    const status = "offline";

    const currentSesstionIndex = this.sessionsData.findIndex(
      ({ id }) => id === userId,
    );

    const index = newData.findIndex((data) => data.userId === userId);

    if (currentSesstionIndex !== -1) {
      this.sessionsData[currentSesstionIndex] = {
        ...this.sessionsData[currentSesstionIndex],
        status,
        connections: [
          ...this.sessionsData[currentSesstionIndex].connections,
          {
            ...this.sessionsData[currentSesstionIndex].connections.at(-1),
            date,
          },
        ],
      };
    }

    // Remove all active sessions for this user (sessionLogout calls after last user's session logout)
    this.activeSessionsMap.delete(userId);

    if (index === -1) return;

    newData[index] = {
      ...newData[index],
      status,
      sessions: [
        ...newData[index].sessions,
        { ...newData[index].sessions.at(-1), date },
      ],
    };

    this.setDataFromSocket(newData);
  };

  setMultiConnections = ({ session, userId }) => {
    const index = this.findSessionIndexByUserId(userId);
    if (index === -1) return;

    const existingSessionIndex = this.dataFromSocket[index].sessions.findIndex(
      (item) => item.id === session.id,
    );

    if (existingSessionIndex === -1) {
      this.dataFromSocket[index].sessions.push(session);
    } else {
      this.dataFromSocket[index].sessions[existingSessionIndex] = session;
    }

    // Add new active session
    // Need to test with working backend
    const userActiveSessions = this.activeSessionsMap.get(userId) ?? [];
    userActiveSessions.push(session);
    this.activeSessionsMap.set(userId, userActiveSessions);
  };

  sessionMultiLogout = ({ sessionId, userId, date }) => {
    const index = this.findSessionIndexByUserId(userId);

    if (index === -1) return;

    const sessionIndex = this.dataFromSocket[index].sessions.findIndex(
      (item) => item.id === sessionId,
    );

    if (sessionIndex === -1) return;

    const [deletedElement] = this.dataFromSocket[index].sessions.splice(
      sessionIndex,
      1,
    );

    if (!deletedElement) return;

    const sessionsLength = this.dataFromSocket[index].sessions.length;
    const countActiveSession =
      this.dataFromSocket[index].sessions.filter(
        (item) => item.status !== "offline",
      ).length ?? 0;

    const addedIndex =
      sessionsLength >= countActiveSession
        ? sessionsLength - countActiveSession
        : 0;

    this.dataFromSocket[index].sessions.splice(addedIndex, 0, {
      ...deletedElement,
      date,
      status: "offline",
    });

    // remove active session that was logged out
    const userActiveSessions = this.activeSessionsMap.get(userId);

    if (userActiveSessions) {
      this.activeSessionsMap.set(
        userId,
        userActiveSessions.filter((item) => item.id !== sessionId),
      );
    }
  };

  updateDataFromSocket = (data) => {
    const newArr = [...this.dataFromSocket];
    const index = newArr.findIndex(({ userId }) => userId === data.userId);
    const currentSesstionIndex = this.sessionsData.findIndex(
      ({ id }) => id === data.userId,
    );
    const { sessions, status } = data;

    // create active session after user's first login (updateDataFromSocket calls from socket enter-in-portal)
    this.activeSessionsMap.set(data.userId, data.sessions);

    // if (data.userId === this.items.userId) {
    //   const newActiveSessionsPanelItems = {
    //     ...this.items,
    //     sessions: data.sessions,
    //   };
    //   this.setItems(newActiveSessionsPanelItems);
    // }

    if (currentSesstionIndex !== -1) {
      this.sessionsData[currentSesstionIndex] = {
        ...this.sessionsData[currentSesstionIndex],
        status,
      };
    }

    if (index === -1) {
      this.dataFromSocket = [...this.dataFromSocket, data];
      return;
    }

    newArr[index] = {
      ...newArr[index],
      sessions,
      status,
    };

    this.setDataFromSocket(newArr);
  };

  getCurrentConnections = (session, data) => {
    const [first, ...other] = session.connections;
    const isCurrentSesstion = session.id === data?.userId;
    const connectionsIsEmpty = session.connections.length === 0;

    const sessionData = data.sessions?.at(-1);
    if (isCurrentSesstion) return [{ ...first, ...sessionData }, ...other];

    if (connectionsIsEmpty) {
      if (!sessionData) return [];
      return [sessionData];
    }

    return session.connections;
  };

  // Merge initial sessions and sessions from socket
  get allSessions() {
    const dataFromSocketMap = new Map(
      this.dataFromSocket.map((data) => [data.userId, data]),
    );

    const sessions = this.sessionsData.map((session) => {
      const data = dataFromSocketMap.get(session.id) || {};
      const connections = this.getCurrentConnections(session, data);
      return { ...data, ...session, connections };
    });

    return sessions.filter((session) => session.connections.length !== 0);
  }

  // Get 100 users, then get sessions for each user separately. What if there are more than 100 users?
  fetchData = async () => {
    const { getUserSessionsById } = this.settingsSetupStore;
    const { getUsersList } = this.peopleStore.usersStore;
    this.setIsSessionsLoaded(true);
    try {
      const users = await getUsersList();
      const sessionsPromises = users
        .filter((user) => user.status !== EmployeeStatus.Disabled)
        .map((user) => getUserSessionsById(user.id));

      const sessions = await Promise.all(sessionsPromises);

      // Initialize active sessions
      sessions.forEach((item) => {
        this.activeSessionsMap.set(item.id, item.connections);
      });

      this.setSessionsData(sessions);
    } catch (error) {
      toastr.error(error);
    } finally {
      this.setIsSessionsLoaded(false);
    }
  };

  onClickLogoutAllSessions = async (t, userId, displayName, changePassword) => {
    const { removeAllActiveSessionsById } = this.settingsSetupStore;

    try {
      this.setIsLoading(true);
      await removeAllActiveSessionsById(userId, changePassword);

      const newData = {
        ...this.items,
        sessions: [],
      };
      this.setItems(newData);
      // const index = this.findSessionIndexByUserId(userId);
      // this.dataFromSocket[index] = newData;

      // Remove all active sessions for this user
      this.activeSessionsMap.delete(userId);

      toastr.success(
        t("Settings:LoggedOutByUser", {
          displayName: displayName,
        }),
      );
    } catch (error) {
      toastr.error(error);
    } finally {
      this.setIsLoading(false);
      this.clearSelection();
    }
  };

  onClickLogoutAllExceptThis = async (t, exceptId, displayName) => {
    const { removeAllExceptThisEventId } = this.settingsSetupStore;

    try {
      this.setIsLoading(true);
      await removeAllExceptThisEventId(exceptId);

      const filteredConnections = this.items.sessions.filter(
        (session) => session.id === exceptId,
      );

      const newData = {
        ...this.items,
        sessions: filteredConnections,
      };

      this.setItems(newData);
      const index = this.findSessionIndexByUserId(this.items.id);
      this.dataFromSocket[index] = newData;

      toastr.success(
        t("Settings:LoggedOutByUserExceptThis", {
          displayName: displayName,
        }),
      );
    } catch (error) {
      toastr.error(error);
    } finally {
      this.setIsLoading(false);
    }
  };

  onClickRemoveSession = async (t, sessionId) => {
    const { removeSession } = this.settingsSetupStore;

    const foundConnection = this.items.sessions.find(
      (session) => session.id === sessionId,
    );

    // Remove specific active session
    const activeSessions = this.activeSessionsMap.get(this.items.userId);
    this.activeSessionsMap.set(
      this.items.userId,
      activeSessions.filter((item) => item.id !== sessionId),
    );

    if (!foundConnection) return;

    try {
      this.setIsLoading(true);
      await removeSession(sessionId);
      const filteredConnections = this.items.sessions.filter(
        (session) => session.id !== sessionId,
      );

      const newData = {
        ...this.items,
        sessions: filteredConnections,
      };

      this.setItems(newData);
      const index = this.findSessionIndexByUserId(this.items.id);
      this.dataFromSocket[index] = newData;

      toastr.success(
        t("Profile:SuccessLogout", {
          platform: foundConnection.platform,
          browser: foundConnection.browser?.split(".")[0] ?? "",
        }),
      );
    } catch (error) {
      toastr.error(error);
    } finally {
      this.setIsLoading(false);
    }
  };

  onClickLogoutAllUsers = async (t, userIds) => {
    const { logoutAllUsers } = this.settingsSetupStore;

    try {
      this.setIsLoading(true);
      await logoutAllUsers(userIds);

      // Remove all active sessions for this user
      this.activeSessionsMap.delete(userIds[0]);

      const newData = {
        ...this.items,
        sessions: [],
      };

      this.setItems(newData);
      // const indexes = this.findSessionIndexByUserId(userIds);

      // indexes.forEach((index) => {
      //   this.dataFromSocket[index] = newData;
      // });

      toastr.success(t("LoggedOutBySelectedUsers"));
    } catch (error) {
      toastr.error(error);
    } finally {
      this.setIsLoading(false);
      this.clearSelection();
    }
  };
}

export default SelectionStore;
