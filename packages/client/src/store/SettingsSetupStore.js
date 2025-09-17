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

import api from "@docspace/shared/api";
import { makeAutoObservable } from "mobx";
import axios from "axios";

import {
  getSMTPSettings,
  resetSMTPSettings,
  setSMTPSettings,
} from "@docspace/shared/api/settings";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import { isDesktop } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import SelectionStore from "./SelectionStore";

const { Filter } = api;

class SettingsSetupStore {
  selectionStore = null;

  authStore = null;

  settingsStore = null;

  tfaStore = null;

  thirdPartyStore = null;

  filesSettingsStore = null;

  isInit = false;

  logoutDialogVisible = false;

  logoutAllDialogVisible = false;

  viewAs = isDesktop() ? "table" : "row";

  isLoadingDownloadReport = false;

  security = {
    accessRight: {
      options: [],
      users: [],
      admins: [],
      adminsTotal: 0,
      owner: {},
      filter: Filter.getDefault(),
      selectorIsOpen: false,
      isLoading: false,
    },
    loginHistory: {
      users: [],
    },
    auditTrail: {
      users: [],
    },
    trailReport: [],
  };

  headerAction = {
    addUsers: "",
    removeAdmins: "",
  };

  integration = {
    consumers: [],
    selectedConsumer: {},
    smtpSettings: {
      initialSettings: {},
      settings: {
        credentialsUserName: "",
        credentialsUserPassword: "",
        enableAuth: false,
        enableSSL: false,
        useNtlm: false,
        host: "",
        port: "25",
        senderAddress: "",
        senderDisplayName: "",
      },
      isLoading: false,
      isDefaultSettings: false,
      errors: {},
    },
  };

  dataManagement = {
    commonThirdPartyList: [],
  };

  securityLifetime = [];

  sessionsIsInit = false;

  sessions = [];

  currentSession = [];

  platformModalData = {};

  constructor(
    tfaStore,
    authStore,
    settingsStore,
    thirdPartyStore,
    filesSettingsStore,
  ) {
    this.selectionStore = new SelectionStore(this);
    this.authStore = authStore;
    this.tfaStore = tfaStore;
    this.settingsStore = settingsStore;
    this.thirdPartyStore = thirdPartyStore;
    this.filesSettingsStore = filesSettingsStore;
    makeAutoObservable(this);
  }

  initSettings = async () => {
    const isMobileView =
      this.settingsStore.currentDeviceType === DeviceType.mobile;

    if (this.isInit && isMobileView) return;

    if (this.authStore.isAuthenticated && !isMobileView) {
      await Promise.all([
        this.settingsStore.getPortalPasswordSettings(),
        this.tfaStore.getTfaType(),
        this.settingsStore.getIpRestrictionsEnable(),
        this.settingsStore.getIpRestrictions(),
        this.settingsStore.getSessionLifetime(),
        this.settingsStore.getBruteForceProtection(),
        this.settingsStore.getInvitationSettings(),
      ]);
      this.setIsInit(true);
    }
  };

  setIsLoadingDownloadReport = (state) => {
    this.isLoadingDownloadReport = state;
  };

  resetIsInit = () => {
    this.isInit = false;
  };

  setIsInit = (isInit) => {
    this.isInit = isInit;
  };

  setIsLoading = (isLoading) => {
    this.security.accessRight.isLoading = isLoading;
  };

  setOptions = (options) => {
    this.security.accessRight.options = options;
  };

  setUsers = (users) => {
    this.security.accessRight.users = users;
  };

  setAdmins = (admins) => {
    this.security.accessRight.admins = admins;
  };

  setTotalAdmins = (total) => {
    this.security.accessRight.adminsTotal = total;
  };

  setViewAs = (viewAs) => {
    this.viewAs = viewAs;
  };

  setOwner = (owner) => {
    this.security.accessRight.owner = owner;
  };

  setFilter = (filter) => {
    this.security.accessRight.filter = filter;
  };

  setConsumers = (consumers) => {
    this.integration.consumers = consumers;
  };

  get isSMTPInitialSettings() {
    const settings = this.integration.smtpSettings.settings;
    const initialSettings = this.integration.smtpSettings.initialSettings;

    const fields = Object.keys(settings).filter(
      (key) => settings[key] !== initialSettings[key],
    );

    return fields.length === 0;
  }

  setSMTPFields = (result) => {
    const { isDefaultSettings, ...settings } = result;

    const storeSettings = this.integration.smtpSettings.settings;

    this.integration.smtpSettings.isDefaultSettings = isDefaultSettings;

    Object.keys(settings).forEach((key) => {
      if (settings[key] === null) return;
      storeSettings[key] = settings[key];
    });

    this.integration.smtpSettings.errors = {};
    this.integration.smtpSettings.initialSettings = { ...storeSettings };
  };

  setInitSMTPSettings = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const result = await getSMTPSettings(abortController.signal);

      if (!result) return;

      this.setSMTPFields(result);
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      throw error;
    }
  };

  resetSMTPSettings = async () => {
    const result = await resetSMTPSettings(
      this.integration.smtpSettings.settings,
    );

    if (!result) return;

    this.setSMTPFields(result);
  };

  updateSMTPSettings = async () => {
    await setSMTPSettings(this.integration.smtpSettings.settings);

    this.setInitSMTPSettings();
  };

  setSMTPSettings = (settings) => {
    this.integration.smtpSettings.settings = settings;
  };

  setSMTPSettingsLoading = (loading) => {
    this.integration.smtpSettings.isLoading = loading;
  };

  setSMTPErrors = (errorsArray) => {
    let errors = {};
    errorsArray.forEach((elem) => {
      errors = {
        ...errors,
        [elem.name]: elem.hasError,
      };
    });

    this.integration.smtpSettings.errors = { ...errors };
  };

  setAddUsers = (func) => {
    this.headerAction.addUsers = func;
  };

  setRemoveAdmins = (func) => {
    this.headerAction.removeAdmins = func;
  };

  toggleSelector = (isOpen) => {
    this.security.accessRight.selectorIsOpen = isOpen;
  };

  setCommonThirdPartyList = (commonThirdPartyList) => {
    commonThirdPartyList.forEach((_, index) => {
      commonThirdPartyList[index].key = `0-${index}`;
    });

    this.dataManagement.commonThirdPartyList = commonThirdPartyList;
  };

  setSelectedConsumer = (selectedConsumerName) => {
    this.integration.selectedConsumer =
      this.integration.consumers.find((c) => c.name === selectedConsumerName) ||
      {};
  };

  setFilterUrl = (filter) => {
    window.history.replaceState(
      "",
      "",
      combineUrl(
        window.ClientConfig?.proxy?.url,
        `${config.homepage}/portal-settings/security/access-rights/admins`,
        `/filter?page=${filter.page}`, // TODO: Change url by category
      ),
    );
  };

  setFilterParams = (data) => {
    this.setFilterUrl(data);
    this.setFilter(data);
  };

  changeAdmins = async (userIds, productId, isAdmin) => {
    const requests = userIds.map((userId) =>
      api.people.changeProductAdmin(userId, productId, isAdmin),
    );

    await Promise.all(requests);
  };

  getPortalOwner = async (userId) => {
    const owner = await api.people.getUserById(userId);

    this.setOwner(owner);
  };

  getUsersByIds = async (Ids) => {
    const users = Ids.map((id) => {
      return api.people.getUserById(id);
    });

    return Promise.all(users);
  };

  fetchPeople = async (filter) => {
    let filterData = filter && filter.clone();
    if (!filterData) {
      filterData = Filter.getDefault();
    }

    const admins = await api.people.getListAdmins(filterData);

    filterData.total = admins.total;
    this.setAdmins(admins.items);
    this.setFilter(filterData);
  };

  updateListAdmins = async (filter, withoutOwner) => {
    let filterData = filter && filter.clone();
    if (!filterData) {
      filterData = Filter.getDefault();
    }
    const admins = await api.people.getListAdmins(filterData);

    if (withoutOwner) {
      admins.items = admins.items.filter((admin) => {
        if (admin.isOwner) return false;
        return true;
      });
    }

    filterData.total = admins.total;
    if (filter) {
      this.setFilterParams(filterData);
    }

    this.setAdmins(admins.items);
    this.setTotalAdmins(admins.total - 1);
    this.setFilter(filterData);
  };

  setLanguageAndTime = async (lng, timeZoneID) => {
    return api.settings.setLanguageAndTime(lng, timeZoneID);
  };

  setPortalRename = async (alias) => {
    return api.portal.setPortalRename(alias);
  };

  setDNSSettings = async (dnsName, enable) => {
    const res = await api.settings.setMailDomainSettings(dnsName, enable);
    return res;
  };

  getLifetimeAuditSettings = async (data) => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = await api.settings.getLifetimeAuditSettings(
        data,
        abortController.signal,
      );
      this.setSecurityLifeTime(res);
    } catch (e) {
      if (axios.isCancel(e)) return;
      throw e;
    }
  };

  setLifetimeAuditSettings = async (data) => {
    await api.settings.setLifetimeAuditSettings(data);
    this.getLifetimeAuditSettings();
  };

  setSecurityLifeTime = (lifetime) => {
    this.securityLifetime = lifetime;
  };

  setLoginHistoryUsers = (users) => {
    this.security.loginHistory.users = users;
  };

  setAuditTrailUsers = (users) => {
    this.security.auditTrail.users = users;
  };

  getLoginHistory = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = await api.settings.getLoginHistory(abortController.signal);
      return this.setLoginHistoryUsers(res);
    } catch (e) {
      if (axios.isCancel(e)) return;
      throw e;
    }
  };

  getAuditTrail = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = await api.settings.getAuditTrail(abortController.signal);
      return this.setAuditTrailUsers(res);
    } catch (e) {
      if (axios.isCancel(e)) return;
      throw e;
    }
  };

  getLoginHistoryReport = async () => {
    const { openOnNewPage } = this.filesSettingsStore;

    try {
      const res = await api.settings.getLoginHistoryReport();
      setTimeout(
        () => window.open(res, openOnNewPage ? "_blank" : "_self"),
        100,
      ); // hack for ios
      return this.setAuditTrailReport(res);
    } catch (error) {
      console.error(error);
      toastr.error(error);
    }
  };

  getAuditTrailReport = async () => {
    const { openOnNewPage } = this.filesSettingsStore;
    try {
      this.setIsLoadingDownloadReport(true);
      const res = await api.settings.getAuditTrailReport();
      setTimeout(
        () => window.open(res, openOnNewPage ? "_blank" : "_self"),
        100,
      ); // hack for ios
      return this.setAuditTrailReport(res);
    } catch (error) {
      console.error(error);
      toastr.error(error);
    } finally {
      this.setIsLoadingDownloadReport(false);
    }
  };

  setGreetingTitle = async (greetingTitle) => {
    return api.settings.setGreetingSettings(greetingTitle);
  };

  setAuditTrailReport = (report) => {
    this.security.trailReport = report;
  };

  setCurrentSchema = async (id) => {
    return api.settings.setCurrentSchema(id);
  };

  setCustomSchema = async (
    userCaption,
    usersCaption,
    groupCaption,
    groupsCaption,
    userPostCaption,
    regDateCaption,
    groupHeadCaption,
    guestCaption,
    guestsCaption,
  ) => {
    return api.settings.setCustomSchema(
      userCaption,
      usersCaption,
      groupCaption,
      groupsCaption,
      userPostCaption,
      regDateCaption,
      groupHeadCaption,
      guestCaption,
      guestsCaption,
    );
  };

  restoreGreetingTitle = async () => {
    return api.settings.restoreGreetingSettings();
  };

  getConsumers = async () => {
    try {
      const abortController = new AbortController();
      this.settingsStore.addAbortControllers(abortController);

      const res = await api.settings.getConsumersList(abortController.signal);
      this.setConsumers(res);
    } catch (e) {
      if (axios.isCancel(e)) return;

      throw e;
    }
  };

  fetchAndSetConsumers = async (consumerName) => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = await api.settings.getConsumersList(abortController.signal);
      const consumer = res.find((c) => c.name === consumerName);
      this.integration.selectedConsumer = consumer || {};
      this.setConsumers(res);

      return !!consumer;
    } catch (e) {
      if (axios.isCancel(e)) return;

      throw e;
    }
  };

  updateConsumerProps = async (newProps) => {
    await api.settings.updateConsumerProps(newProps);

    await this.getConsumers();

    await Promise.all([
      api.files.getThirdPartyCapabilities(),
      api.files.getThirdPartyList(),
    ]).then(([capabilities, providers]) => {
      capabilities.forEach((item) => {
        item.splice(1, 1);
      });
      this.thirdPartyStore.setThirdPartyCapabilities(capabilities); // TODO: Out of bounds read: 1
      this.thirdPartyStore.setThirdPartyProviders(providers);
    });
  };

  changePassword = (userId, hash, key) => {
    return api.people.changePassword(userId, hash, key);
  };

  sendOwnerChange = (id) => {
    return api.settings.sendOwnerChange(id);
  };

  dataReassignment = (fromUserId, toUserId, deleteProfile) => {
    return api.settings.dataReassignment(fromUserId, toUserId, deleteProfile);
  };

  dataReassignmentProgress = (id) => {
    return api.settings.dataReassignmentProgress(id);
  };

  dataReassignmentTerminate = (userId) => {
    return api.settings.dataReassignmentTerminate(userId);
  };

  getCommonThirdPartyList = async () => {
    const res = await api.settings.getCommonThirdPartyList();

    this.setCommonThirdPartyList(res);
  };

  getAllSessions = () => {
    return api.settings.getAllActiveSessions();
  };

  removeAllSessions = () => {
    return api.settings.removeAllActiveSessions();
  };

  removeAllExecptThis = () => {
    return api.settings.removeAllExceptThisSession();
  };

  removeSession = (id) => {
    return api.settings.removeActiveSession(id);
  };

  setLogoutDialogVisible = (visible) => {
    this.logoutDialogVisible = visible;
  };

  setLogoutAllDialogVisible = (visible) => {
    this.logoutAllDialogVisible = visible;
  };

  getSessions = () => {
    this.getAllSessions().then((res) => {
      this.setSessions(res.items);
      this.currentSession = res.loginEvent;
      this.sessionsIsInit = true;
    });
  };

  setSessions = (sessions) => {
    this.sessions = sessions;
  };

  setPlatformModalData = (data) => {
    this.platformModalData = {
      id: data.id,
      platform: data.platform,
      browser: data.browser,
    };
  };
}

export default SettingsSetupStore;
