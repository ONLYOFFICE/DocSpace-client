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

import { makeAutoObservable } from "mobx";
import moment from "moment-timezone";

import { toastr } from "@docspace/shared/components/toast";
import { EmployeeStatus } from "@docspace/shared/enums";
import SocketHelper from "@docspace/shared/utils/socket";

import SettingsSetupStore from "SRC_DIR/store/SettingsSetupStore";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";

class ActiveSessionsStore {
  usersWithLastSession = [];

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

  bufferSelection = null;

  constructor(
    public settingsSetupStore: SettingsSetupStore,
    public peopleStore: PeopleStore,
  ) {
    this.settingsSetupStore = settingsSetupStore;
    this.peopleStore = peopleStore;

    makeAutoObservable(this);
  }

  get isSeveralSelection() {
    return this.selection.length > 1;
  }

  fetchUsersWithLastSession = () => {
    return new Promise((resolve) => {
      SocketHelper.emit("getSessionsInPortal");
      SocketHelper.on("sessions-in-portal", (data) => {
        this.setUsersWithLastSession(data);
        resolve();
      });
    });
  };

  setUsersWithLastSession = (usersWithLastSession) => {
    this.usersWithLastSession = usersWithLastSession;
  };

  setSelection = (selection) => {
    this.selection = selection;
  };

  setBufferSelection = (bufferSelection) => {
    this.bufferSelection = bufferSelection;
  };

  clearSelection = () => {
    this.setSelection([]);
  };

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
      // this.clearSelection();
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
      // this.clearSelection();
    }
  };
}

export default ActiveSessionsStore;
