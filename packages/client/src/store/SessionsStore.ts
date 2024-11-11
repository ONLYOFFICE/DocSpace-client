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
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";
import {
  TPortalSession,
  TPortalSessionsMap,
  TSession,
  TSessionsInPortal,
  TSessionsSelected,
} from "@docspace/shared/types/ActiveSessions";
import { Nullable, TTranslation } from "@docspace/shared/types";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import api from "@docspace/shared/api";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import SettingsSetupStore from "SRC_DIR/store/SettingsSetupStore";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";

import DialogsStore from "./DialogsStore";

class SessionsStore {
  portalSessionsMap: TPortalSessionsMap = new Map();

  onlineSessionsIds: string[] = [];

  offlineSessionsIds: string[] = [];

  userSessions: TSession[] = [];

  totalPortalSessions: number = 0;

  sessionsData = []; // Sessions inited in fetchData.

  dataFromSocket = []; // Sessions from socket (all sessions, include closed sessions or from deleted users)

  activeSessionsMap = new Map();

  displayName = "";

  fromDateAgo = {};

  items;

  logoutModalData: Nullable<TSession> = null;

  isLogoutLoading = false;

  isSessionsLoaded = false;

  isDisabled = false;

  selection: TPortalSession[] = [];

  bufferSelection: Nullable<TPortalSession> = null;

  selected: TSessionsSelected = "none";

  constructor(
    public settingsSetupStore: SettingsSetupStore,
    public peopleStore: PeopleStore,
    public dialogsStore: DialogsStore,
  ) {
    this.settingsSetupStore = settingsSetupStore;
    this.peopleStore = peopleStore;
    this.dialogsStore = dialogsStore;

    makeAutoObservable(this);
  }

  fetchPortalSessions = (startIndex: number = 0, count: number = 100) => {
    return new Promise((resolve) => {
      SocketHelper.emit(SocketCommands.GetSessionsInPortal, {
        startIndex,
        count,
      });
      SocketHelper.on(
        SocketEvents.SessionsInPortal,
        (data: TSessionsInPortal) => {
          this.addPortalSessions(data.users);
          this.setTotalPortalSessions(data.total);
          resolve();
        },
      );
    });
  };

  fetchUserSessions = (userId: string) => {
    return new Promise((resolve) => {
      SocketHelper.emit(SocketCommands.GetSessions, {
        id: userId,
      });
      // Todo: add unsubscribing
      SocketHelper.on(SocketEvents.UserSessions, (data: TSession[]) => {
        this.setUserSessions(data);
        this.sortUserSessions();
        resolve();
      });
    });
  };

  addPortalSession = (
    portalSession: TPortalSession,
    addToTop: boolean = false,
  ) => {
    if (this.portalSessionsMap.has(portalSession.userId)) {
      return;
    }

    this.portalSessionsMap.set(portalSession.userId, portalSession);

    const sessionIdsArray =
      portalSession.session.status === "online"
        ? this.onlineSessionsIds
        : this.offlineSessionsIds;

    if (addToTop) {
      sessionIdsArray.unshift(portalSession.userId);
    } else {
      sessionIdsArray.push(portalSession.userId);
    }
  };

  addPortalSessions = (portalSessions: TPortalSession[]) => {
    portalSessions.forEach((ps) => this.addPortalSession(ps));
  };

  moveToOnlineSessions = (portalSessionId: string) => {
    const index = this.offlineSessionsIds.indexOf(portalSessionId);
    if (index !== -1) {
      this.offlineSessionsIds.splice(index, 1);
    }

    this.onlineSessionsIds.unshift(portalSessionId);
  };

  moveToOfflineSessions = (portalSessionId: string) => {
    const index = this.onlineSessionsIds.indexOf(portalSessionId);
    if (index !== -1) {
      this.onlineSessionsIds.splice(index, 1);
    }

    this.offlineSessionsIds.unshift(portalSessionId);
  };

  get portalSessionsIds() {
    return [...this.onlineSessionsIds, ...this.offlineSessionsIds];
  }

  subscribeToPortalSessions = () => {
    SocketHelper.emit(SocketCommands.SubscribeToPortal);
    SocketHelper.on(SocketEvents.EnterInPortal, this.handleUserEnterPortal);
    SocketHelper.on(SocketEvents.LeaveInPortal, this.handleUserLeavePortal);
    SocketHelper.on(
      SocketEvents.NewSessionInPortal,
      this.handleNewSessionInPortal,
    );
  };

  unsubscribeToPortalSessions = () => {
    SocketHelper.emit(SocketCommands.UnsubscribeToPortal);
    SocketHelper.off(SocketEvents.EnterInPortal, this.handleUserEnterPortal);
    SocketHelper.off(SocketEvents.LeaveInPortal, this.handleUserLeavePortal);
    SocketHelper.off(
      SocketEvents.NewSessionInPortal,
      this.handleNewSessionInPortal,
    );
  };

  subscribeToUserSessions = (id: string) => {
    SocketHelper.emit(SocketCommands.SubscribeToUser, { id });
    SocketHelper.on(
      SocketEvents.EnterSessionInPortal,
      this.handleUserEnterSessionInPortal,
    );
    SocketHelper.on(
      SocketEvents.LeaveSessionInPortal,
      this.handleUserLeaveSessionInPortal,
    );
  };

  unsubscribeToUserSessions = (id: string) => {
    SocketHelper.emit(SocketCommands.UnsubscribeToUser, { id });
    SocketHelper.off(
      SocketEvents.EnterSessionInPortal,
      this.handleUserEnterSessionInPortal,
    );
    SocketHelper.off(
      SocketEvents.LeaveSessionInPortal,
      this.handleUserLeaveSessionInPortal,
    );
  };

  handleUserEnterPortal = (newPortalSession: TPortalSession) => {
    // update userSessions if new session belongs to selected user
    if (newPortalSession.userId === this.bufferSelection?.userId) {
      const { userId, session } = newPortalSession;
      this.handleUserEnterSessionInPortal({ userId, session });
    }

    // update portalSessions
    const currentSession = this.portalSessionsMap.get(newPortalSession.userId);

    if (!currentSession) {
      this.addPortalSession(newPortalSession, true);
      return;
    }

    const statusChanged =
      currentSession.session.status !== newPortalSession.session.status;

    if (statusChanged) {
      this.moveToOnlineSessions(newPortalSession.userId);
    }

    this.portalSessionsMap.set(newPortalSession.userId, newPortalSession);
  };

  handleUserLeavePortal = ({
    userId,
    sessionId,
  }: {
    userId: string;
    sessionId: number;
  }) => {
    const currentSession = this.portalSessionsMap.get(userId);
    if (!currentSession) return;

    // update userSessions if new session belongs to selected user
    if (userId === this.bufferSelection?.userId) {
      this.handleUserLeaveSessionInPortal({
        userId,
        sessionId,
      });
    }

    // update portalSessions
    currentSession.session.status = "offline";
    currentSession.session.date = new Date().toISOString();

    this.moveToOfflineSessions(userId);
  };

  handleUserEnterSessionInPortal = ({
    userId,
    session,
  }: {
    userId: string;
    session: TSession;
  }) => {
    if (userId !== this.bufferSelection?.userId) return;

    const foundSessionIndex = this.userSessions.findIndex(
      (s) => s.id === session.id,
    );

    if (foundSessionIndex !== -1) {
      this.userSessions.splice(foundSessionIndex, 1);
    }

    this.userSessions.unshift(session);
  };

  handleUserLeaveSessionInPortal = ({
    userId,
    sessionId,
  }: {
    userId: string;
    sessionId: number;
  }) => {
    if (userId !== this.bufferSelection?.userId) return;

    const foundSession = this.userSessions.find((s) => s.id === sessionId);

    if (foundSession) {
      foundSession.status = "offline";
      foundSession.date = new Date().toISOString();
      this.sortUserSessions();
    }
  };

  handleNewSessionInPortal = (newPortalSession: TPortalSession) => {
    this.handleUserEnterPortal(newPortalSession);
  };

  sortUserSessions = () => {
    this.userSessions.sort((a, b) => {
      const isAOnline = a.status === "online";
      const isBOnline = b.status === "online";

      if (isAOnline && !isBOnline) return -1;
      if (isBOnline && !isAOnline) return 1;

      return -a.date.localeCompare(b.date);
    });
  };

  setUserSessions = (userSessions: TSession[]) => {
    this.userSessions = userSessions;
  };

  clearPortalSessions = () => {
    this.portalSessionsMap.clear();
    this.onlineSessionsIds = [];
    this.offlineSessionsIds = [];
    this.totalPortalSessions = 0;
  };

  clearUserSessions = () => {
    this.setUserSessions([]);
  };

  setTotalPortalSessions = (total: number) => {
    this.totalPortalSessions = total;
  };

  setSelection = (selection: TPortalSession[]) => {
    this.selection = selection;
  };

  setBufferSelection = (bufferSelection: Nullable<TPortalSession>) => {
    this.bufferSelection = bufferSelection;
  };

  selectRow = (item: TPortalSession) => {
    const isItemSelected = this.selection.some((s) => s.userId === item.userId);
    const isSingleSelected = isItemSelected && this.selection.length === 1;

    if (this.bufferSelection) {
      this.setBufferSelection(null);
    }

    if (isSingleSelected) {
      this.deselectSession(item);
    } else {
      this.clearSelection();
      this.selectSession(item);
    }
  };

  selectCheckbox = (isChecked: boolean, item: TPortalSession) => {
    this.setBufferSelection(null);

    if (isChecked) {
      this.selectSession(item);
    } else {
      this.deselectSession(item);
    }
  };

  selectSession = (session: TPortalSession) => {
    this.setSelection([...this.selection, session]);
  };

  deselectSession = (session: TPortalSession) => {
    if (!this.selection.length) return;

    const newSelection = this.selection.filter(
      (s) => s.userId !== session.userId,
    );

    this.setSelection(newSelection);
  };

  singleContextMenuAction = (item: typeof this.bufferSelection) => {
    if (this.selection.length) {
      this.clearSelection();
    }

    this.setBufferSelection(item);
  };

  multipleContextMenuAction = (item: TPortalSession) => {
    const isItemSelected = this.selection.some((s) => s.userId === item.userId);
    const isSingleSelected = isItemSelected && this.selection.length === 1;

    if (!isItemSelected || isSingleSelected) {
      this.clearSelection();
      this.setBufferSelection(item);
    }
  };

  getContextOptions = (t: TTranslation, forSessionsPanel?: boolean) => {
    return [
      {
        key: "ViewSessions",
        label: t("Settings:ViewSessions"),
        icon: HistoryFinalizedReactSvgUrl,
        onClick: () => this.dialogsStore.setUserSessionPanelVisible(true),
        disabled: forSessionsPanel || this.isSeveralSelection,
      },
      {
        key: "LogoutAllSessions",
        label: t("Settings:LogoutAllSessions"),
        icon: LogoutReactSvgUrl,
        onClick: () => this.settingsSetupStore.setLogoutAllDialogVisible(true),
      },
      {
        key: "Separator",
        isSeparator: true,
        disabled: this.hasMeInSelections,
      },
      {
        key: "Disable",
        label: t("Common:DisableUserButton"),
        icon: RemoveSvgUrl,
        onClick: () => this.settingsSetupStore.setDisableDialogVisible(true),
        disabled: this.hasMeInSelections,
      },
    ];
  };

  getHeaderMenuItems = (t: TTranslation) => {
    return [
      {
        id: "sessions",
        key: "Sessions",
        label: t("Common:Sessions"),
        disabled: this.isSeveralSelection,
        onClick: () => {
          this.setBufferSelection(this.selection[0]);
          this.dialogsStore.setUserSessionPanelVisible(true);
        },
        iconUrl: HistoryFinalizedReactSvgUrl,
      },
      {
        id: "logout",
        key: "Logout",
        label: t("Common:Logout"),
        onClick: () => {
          if (!this.isSeveralSelection) {
            this.setBufferSelection(this.selection[0]);
          }
          this.settingsSetupStore.setLogoutAllDialogVisible(true);
        },
        iconUrl: LogoutReactSvgUrl,
      },
      {
        id: "disable",
        key: "Disable",
        label: t("Common:DisableUserButton"),
        onClick: () => this.settingsSetupStore.setDisableDialogVisible(true),
        iconUrl: RemoveSvgUrl,
        disabled: this.hasMeInSelections,
      },
    ];
  };

  get hasMeInSelections() {
    const { user } = this.peopleStore.userStore;

    if (!user) return false;

    const hasMeInSelection = this.selection.some((s) => s.userId === user.id);
    const hasMeInBufferSelection = this.bufferSelection?.userId === user.id;

    return hasMeInSelection || hasMeInBufferSelection;
  }

  setSelected = (selected: TSessionsSelected) => {
    this.bufferSelection = null;
    this.selected = selected;
    this.setSelection(this.getSessionsBySelected(selected));

    return selected;
  };

  getSessionsBySelected = (selected: TSessionsSelected) => {
    switch (selected) {
      case "all":
        return Array.from(this.portalSessionsMap.values());

      case "none":
        return [];

      case "online":
      case "offline":
        return Array.from(this.portalSessionsMap.values()).filter(
          (s) => s.session.status === selected,
        );

      default:
        return [];
    }
  };

  get isHeaderVisible() {
    return this.selection.length > 0;
  }

  get isHeaderChecked() {
    return (
      this.isHeaderVisible &&
      this.selection.length === this.portalSessionsMap.size
    );
  }

  get isHeaderIndeterminate() {
    return (
      this.isHeaderVisible &&
      this.selection.length !== this.portalSessionsMap.size
    );
  }

  get isSeveralSelection() {
    return this.selection.length > 1;
  }

  clearSelection = () => {
    this.setSelection([]);
  };

  disableUsers = async (userIds: string[]) => {
    try {
      const disabledUsers = await api.people.updateUserStatus(
        EmployeeStatus.Disabled,
        userIds,
      );

      this.removePortalSessions(disabledUsers.map((u) => u.id));
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  removePortalSessions = (userIds: string[]) => {
    userIds.forEach((userId) => this.portalSessionsMap.delete(userId));
    this.onlineSessionsIds = this.onlineSessionsIds.filter(
      (userId) => !userIds.includes(userId),
    );
    this.offlineSessionsIds = this.offlineSessionsIds.filter(
      (userId) => !userIds.includes(userId),
    );
    this.setTotalPortalSessions(this.totalPortalSessions - userIds.length);
  };

  logoutSession = async (t: TTranslation, sessionId: number) => {
    const { removeSession } = this.settingsSetupStore;
    const { setUserSessionPanelVisible } = this.dialogsStore;

    const foundSession = this.userSessions.find((s) => s.id === sessionId);

    if (!foundSession) return;

    this.setIsLogoutLoading(true);
    try {
      await removeSession(sessionId);

      this.setUserSessions(this.userSessions.filter((s) => s.id !== sessionId));

      const allSessionsLoggedOut = !this.userSessions.length;

      if (allSessionsLoggedOut) {
        setUserSessionPanelVisible(false);
      }

      const toastText = allSessionsLoggedOut
        ? t("LoggedOutBySelectedUsers")
        : t("Profile:SuccessLogout", {
            platform: foundSession.platform,
            browser: foundSession.browser?.split(".")[0] ?? "",
          });

      toastr.success(toastText);
    } catch (e) {
      toastr.error(e as TData);
    } finally {
      this.setIsLogoutLoading(false);
    }
  };

  logoutAllSessions = async (
    t: TTranslation,
    userId: string,
    displayName: string,
    changePassword: boolean,
  ) => {
    const { removeAllActiveSessionsById } = this.settingsSetupStore;

    try {
      this.setIsLogoutLoading(true);
      await removeAllActiveSessionsById(userId, changePassword);

      toastr.success(t("Settings:LoggedOutByUser", { displayName }));
    } catch (error) {
      toastr.error(error as TData);
    } finally {
      this.setIsLogoutLoading(false);
    }
  };

  logoutAllSessionsMultiple = async (t: TTranslation, userIds: string[]) => {
    const { logoutAllUsers } = this.settingsSetupStore;

    try {
      this.setIsLogoutLoading(true);
      await logoutAllUsers(userIds);

      toastr.success(t("LoggedOutBySelectedUsers"));
    } catch (error) {
      toastr.error(error as TData);
    } finally {
      this.setIsLogoutLoading(false);
      this.clearSelection();
    }
  };

  setLogoutModalData = (data: TSession) => {
    this.logoutModalData = data;
  };

  setIsLogoutLoading = (isLogoutLoading: boolean) => {
    this.isLogoutLoading = isLogoutLoading;
  };

  setDisplayName = (displayName: string) => {
    this.displayName = displayName;
  };

  //////////////////////////////////////////////////////////////////////////////

  setAllSessions = (allSessions) => {
    this.allSessions = allSessions;
  };

  setSessionsData = (data) => {
    this.sessionsData = data;
  };

  setDataFromSocket = (data) => {
    this.dataFromSocket = data;
  };

  setItems = (items) => {
    this.items = items;
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
}

export default SessionsStore;
