/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import api from "@docspace/shared/api";
import { makeAutoObservable } from "mobx";
import axios from "axios";

import {
  getSMTPSettings,
  resetSMTPSettings,
  setSMTPSettings,
} from "@docspace/shared/api/settings";
import type { TCookieSettings } from "@docspace/shared/api/settings/types";
import type TPeopleFilter from "@docspace/shared/api/people/filter";
import type { TUser } from "@docspace/shared/api/people/types";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import { isDesktop } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TfaStore } from "@docspace/shared/store/TfaStore";
import type { SelectedConsumer } from "SRC_DIR/pages/PortalSettings/categories/integration/ThirdPartyServicesSettings/sub-components/ExternalDbModal/ExternalDbModal.types";
import SelectionStore from "./SelectionStore";
import type { ThirdPartyStore } from "./ThirdPartyStore";
import type FilesSettingsStore from "./FilesSettingsStore";
import type DocumentBuilderReportStore from "./DocumentBuilderReportStore";
import { ReportType } from "./DocumentBuilderReportStore";

const { Filter } = api;

export type TSmtpSettingsValues = {
  credentialsUserName: string;
  credentialsUserPassword: string;
  enableAuth: boolean;
  enableSSL: boolean;
  useNtlm: boolean;
  host: string;
  port: string;
  senderAddress: string;
  senderDisplayName: string;
};

export type TSmtpSettingsResult = {
  [K in keyof TSmtpSettingsValues]?: TSmtpSettingsValues[K] | null;
} & { isDefaultSettings?: boolean };

type TSmtpSettingsValue = string | boolean;

export type TAuditEvent = {
  id: number;
  date: string;
  user: string;
  action: string;
  context?: string;
};

export type TAuditLifetimeSettings = {
  loginHistoryLifeTime?: string;
  auditTrailLifeTime?: string;
};

export type TActiveSession = {
  id: number;
  platform: string;
  browser: string;
  mobile?: boolean;
  ip?: string;
  country?: string;
  city?: string;
  date?: string;
  page?: string;
  tenantId?: number;
  userId?: string;
};

type TActiveSessionsResponse = {
  items: TActiveSession[];
  loginEvent: number;
};

export type TCommonThirdParty = {
  key?: string;
};

class SettingsSetupStore {
  selectionStore: SelectionStore;

  authStore: AuthStore;

  settingsStore: SettingsStore;

  tfaStore: TfaStore;

  thirdPartyStore: ThirdPartyStore;

  filesSettingsStore: FilesSettingsStore;

  documentBuilderReportStore: DocumentBuilderReportStore;

  isInit = false;

  logoutDialogVisible = false;

  logoutAllDialogVisible = false;

  viewAs: string = isDesktop() ? "table" : "row";

  security: {
    accessRight: {
      options: unknown[];
      users: TUser[];
      admins: TUser[];
      adminsTotal: number;
      owner: Partial<TUser>;
      filter: TPeopleFilter;
      selectorIsOpen: boolean;
      isLoading: boolean;
    };
    loginHistory: {
      users: TAuditEvent[];
    };
    auditTrail: {
      users: TAuditEvent[];
    };
  } = {
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
  };

  headerAction: {
    addUsers: string | VoidFunction;
    removeAdmins: string | VoidFunction;
  } = {
    addUsers: "",
    removeAdmins: "",
  };

  integration: {
    consumers: SelectedConsumer[];
    selectedConsumer: Partial<SelectedConsumer>;
    smtpSettings: {
      initialSettings: Partial<TSmtpSettingsValues>;
      settings: TSmtpSettingsValues;
      isLoading: boolean;
      isDefaultSettings: boolean;
      errors: Record<string, boolean>;
    };
  } = {
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

  dataManagement: {
    commonThirdPartyList: TCommonThirdParty[];
  } = {
    commonThirdPartyList: [],
  };

  securityLifetime: TAuditLifetimeSettings | never[] = [];

  sessionsIsInit = false;

  sessions: TActiveSession[] = [];

  currentSession: number | never[] = [];

  platformModalData: Partial<
    Pick<TActiveSession, "id" | "platform" | "browser">
  > = {};

  openThirdPartyModal = false;

  constructor(
    tfaStore: TfaStore,
    authStore: AuthStore,
    settingsStore: SettingsStore,
    thirdPartyStore: ThirdPartyStore,
    filesSettingsStore: FilesSettingsStore,
    documentBuilderReportStore: DocumentBuilderReportStore,
  ) {
    this.selectionStore = new SelectionStore(this);
    this.authStore = authStore;
    this.tfaStore = tfaStore;
    this.settingsStore = settingsStore;
    this.thirdPartyStore = thirdPartyStore;
    this.filesSettingsStore = filesSettingsStore;
    this.documentBuilderReportStore = documentBuilderReportStore;
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

  resetIsInit = () => {
    this.isInit = false;
  };

  setIsInit = (isInit: boolean) => {
    this.isInit = isInit;
  };

  setIsLoading = (isLoading: boolean) => {
    this.security.accessRight.isLoading = isLoading;
  };

  setOptions = (options: unknown[]) => {
    this.security.accessRight.options = options;
  };

  setUsers = (users: TUser[]) => {
    this.security.accessRight.users = users;
  };

  setAdmins = (admins: TUser[]) => {
    this.security.accessRight.admins = admins;
  };

  setTotalAdmins = (total: number) => {
    this.security.accessRight.adminsTotal = total;
  };

  setViewAs = (viewAs: string) => {
    this.viewAs = viewAs;
  };

  setOwner = (owner: TUser) => {
    this.security.accessRight.owner = owner;
  };

  setFilter = (filter: TPeopleFilter) => {
    this.security.accessRight.filter = filter;
  };

  setConsumers = (consumers: SelectedConsumer[]) => {
    this.integration.consumers = consumers;
  };

  get isSMTPInitialSettings() {
    const settings = this.integration.smtpSettings.settings;
    const initialSettings = this.integration.smtpSettings.initialSettings;

    const fields = Object.keys(settings).filter(
      (key) =>
        settings[key as keyof TSmtpSettingsValues] !==
        initialSettings[key as keyof TSmtpSettingsValues],
    );

    return fields.length === 0;
  }

  setSMTPFields = (result: TSmtpSettingsResult) => {
    const { isDefaultSettings, ...settings } = result;

    const storeSettings = this.integration.smtpSettings.settings;

    // the original .js assigns isDefaultSettings even when
    // the server omits it; `!` keeps the identical assignment.
    this.integration.smtpSettings.isDefaultSettings = isDefaultSettings!;

    Object.keys(settings).forEach((key) => {
      const value = (
        settings as Record<string, TSmtpSettingsValue | null | undefined>
      )[key];
      if (value === null) return;
      (
        storeSettings as unknown as Record<
          string,
          TSmtpSettingsValue | undefined
        >
      )[key] = value;
    });

    this.integration.smtpSettings.errors = {};
    this.integration.smtpSettings.initialSettings = { ...storeSettings };
  };

  setInitSMTPSettings = async (password?: string) => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const result = (await getSMTPSettings(abortController.signal)) as
        | TSmtpSettingsResult
        | undefined;

      if (!result) return;

      if (password) {
        result.credentialsUserPassword = password;
      }

      this.setSMTPFields(result);
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      throw error;
    }
  };

  resetSMTPSettings = async () => {
    // shared resetSMTPSettings() is declared with no
    // parameters; the legacy call passes the current settings (ignored at
    // runtime) — preserved via cast.
    const result = await (
      resetSMTPSettings as unknown as (
        settings: TSmtpSettingsValues,
      ) => Promise<TSmtpSettingsResult | undefined> | undefined
    )(this.integration.smtpSettings.settings);

    if (!result) return;

    const resultSettingsDefault: TSmtpSettingsResult = {
      credentialsUserName: "",
      credentialsUserPassword: "",
      enableAuth: false,
      enableSSL: false,
      useNtlm: false,
      host: "",
      port: "25",
      senderAddress: "",
      senderDisplayName: "",
    };

    Object.keys(result).forEach(
      (key) =>
        ((resultSettingsDefault as Record<string, unknown>)[key] = (
          result as Record<string, unknown>
        )[key]),
    );

    this.setSMTPFields(resultSettingsDefault);
  };

  updateSMTPSettings = async () => {
    const password =
      this.integration.smtpSettings.settings.credentialsUserPassword;

    // setSMTPSettings is untyped in shared/api and may return
    // undefined; `!` keeps the original unguarded .then chain.
    return setSMTPSettings(this.integration.smtpSettings.settings)!.then(
      (result) => {
        this.setInitSMTPSettings(password);
        return result;
      },
    );
  };

  setSMTPSettings = (settings: TSmtpSettingsValues) => {
    this.integration.smtpSettings.settings = settings;
  };

  setSMTPSettingsLoading = (loading: boolean) => {
    this.integration.smtpSettings.isLoading = loading;
  };

  setSMTPErrors = (errorsArray: { name: string; hasError: boolean }[]) => {
    let errors: Record<string, boolean> = {};
    errorsArray.forEach((elem) => {
      errors = {
        ...errors,
        [elem.name]: elem.hasError,
      };
    });

    this.integration.smtpSettings.errors = { ...errors };
  };

  setAddUsers = (func: VoidFunction) => {
    this.headerAction.addUsers = func;
  };

  setRemoveAdmins = (func: VoidFunction) => {
    this.headerAction.removeAdmins = func;
  };

  toggleSelector = (isOpen: boolean) => {
    this.security.accessRight.selectorIsOpen = isOpen;
  };

  setCommonThirdPartyList = (commonThirdPartyList: TCommonThirdParty[]) => {
    commonThirdPartyList.forEach((_, index) => {
      commonThirdPartyList[index].key = `0-${index}`;
    });

    this.dataManagement.commonThirdPartyList = commonThirdPartyList;
  };

  setSelectedConsumer = (selectedConsumerName: string) => {
    this.integration.selectedConsumer =
      this.integration.consumers.find((c) => c.name === selectedConsumerName) ||
      {};
  };

  setFilterUrl = (filter: TPeopleFilter) => {
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

  setFilterParams = (data: TPeopleFilter) => {
    this.setFilterUrl(data);
    this.setFilter(data);
  };

  changeAdmins = async (
    userIds: string[],
    productId: string,
    isAdmin: boolean,
  ) => {
    const requests = userIds.map((userId) =>
      api.people.changeProductAdmin(userId, productId, isAdmin),
    );

    await Promise.all(requests);
  };

  getPortalOwner = async (userId: string) => {
    const owner = await api.people.getUserById(userId);

    this.setOwner(owner);
  };

  getUsersByIds = async (Ids: string[]) => {
    const users = Ids.map((id) => {
      return api.people.getUserById(id);
    });

    return Promise.all(users);
  };

  fetchPeople = async (filter?: TPeopleFilter | null) => {
    let filterData = filter && filter.clone();
    if (!filterData) {
      filterData = Filter.getDefault();
    }

    const admins = (await api.people.getListAdmins(filterData)) as {
      items: TUser[];
      total: number;
    };

    filterData.total = admins.total;
    this.setAdmins(admins.items);
    this.setFilter(filterData);
  };

  updateListAdmins = async (
    filter?: TPeopleFilter | null,
    withoutOwner?: boolean,
  ) => {
    let filterData = filter && filter.clone();
    if (!filterData) {
      filterData = Filter.getDefault();
    }
    const admins = (await api.people.getListAdmins(filterData)) as {
      items: TUser[];
      total: number;
    };

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

  setLanguageAndTime = async (lng: string, timeZoneID: string) => {
    return api.settings.setLanguageAndTime(lng, timeZoneID);
  };

  setPortalRename = async (alias: string) => {
    return api.portal.setPortalRename(alias);
  };

  setDNSSettings = async (dnsName: string, enable: boolean) => {
    // shared setMailDomainSettings takes a single
    // TMailDomainSettings argument; the legacy call passes (dnsName, enable)
    // where the second argument is ignored at runtime — preserved via cast.
    const res = await (
      api.settings.setMailDomainSettings as unknown as (
        dnsName: string,
        enable: boolean,
      ) => Promise<unknown>
    )(dnsName, enable);
    return res;
  };

  getLifetimeAuditSettings = async (data?: unknown) => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = (await api.settings.getLifetimeAuditSettings(
        data,
        abortController.signal,
      )) as TAuditLifetimeSettings;
      this.setSecurityLifeTime(res);
    } catch (e) {
      if (axios.isCancel(e)) return;
      throw e;
    }
  };

  setLifetimeAuditSettings = async (data: TAuditLifetimeSettings) => {
    // shared setLifetimeAuditSettings is typed as
    // TCookieSettings, but the payload passed here is
    // { loginHistoryLifeTime, auditTrailLifeTime } — preserved via cast.
    await api.settings.setLifetimeAuditSettings(
      data as unknown as TCookieSettings,
    );
    this.getLifetimeAuditSettings();
  };

  setSecurityLifeTime = (lifetime: TAuditLifetimeSettings) => {
    this.securityLifetime = lifetime;
  };

  setLoginHistoryUsers = (users: TAuditEvent[]) => {
    this.security.loginHistory.users = users;
  };

  setAuditTrailUsers = (users: TAuditEvent[]) => {
    this.security.auditTrail.users = users;
  };

  getLoginHistory = async () => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = (await api.settings.getLoginHistory(
        abortController.signal,
      )) as TAuditEvent[];
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
      const res = (await api.settings.getAuditTrail(
        abortController.signal,
      )) as TAuditEvent[];
      return this.setAuditTrailUsers(res);
    } catch (e) {
      if (axios.isCancel(e)) return;
      throw e;
    }
  };

  get isLoginHistoryReportBuilding() {
    return this.documentBuilderReportStore.isReportBuilding(
      ReportType.LoginHistory,
    );
  }

  get isAuditTrailReportBuilding() {
    return this.documentBuilderReportStore.isReportBuilding(
      ReportType.AuditTrail,
    );
  }

  getLoginHistoryReport = () => {
    return this.documentBuilderReportStore.buildReport(
      ReportType.LoginHistory,
      {
        start: api.settings.startLoginHistoryReport,
        getStatus: api.settings.getLoginHistoryReportStatus,
      },
    );
  };

  getAuditTrailReport = () => {
    return this.documentBuilderReportStore.buildReport(ReportType.AuditTrail, {
      start: api.settings.startAuditTrailReport,
      getStatus: api.settings.getAuditTrailReportStatus,
    });
  };

  markLoginHistoryReportPageLeft = () => {
    this.documentBuilderReportStore.markReportPageLeft(ReportType.LoginHistory);
  };

  resetLoginHistoryReportPageLeft = () => {
    this.documentBuilderReportStore.resetReportPageLeft(
      ReportType.LoginHistory,
    );
  };

  markAuditTrailReportPageLeft = () => {
    this.documentBuilderReportStore.markReportPageLeft(ReportType.AuditTrail);
  };

  resetAuditTrailReportPageLeft = () => {
    this.documentBuilderReportStore.resetReportPageLeft(ReportType.AuditTrail);
  };

  setGreetingTitle = async (greetingTitle: string) => {
    return api.settings.setGreetingSettings(greetingTitle);
  };

  setCurrentSchema = async (id: string) => {
    return api.settings.setCurrentSchema(id);
  };

  setCustomSchema = async (
    userCaption: string,
    usersCaption: string,
    groupCaption: string,
    groupsCaption: string,
    userPostCaption: string,
    regDateCaption: string,
    groupHeadCaption: string,
    guestCaption: string,
    guestsCaption: string,
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

      const res = (await api.settings.getConsumersList(
        abortController.signal,
      )) as SelectedConsumer[];
      this.setConsumers(res);
    } catch (e) {
      if (axios.isCancel(e)) return;

      throw e;
    }
  };

  fetchAndSetConsumers = async (
    consumerName: string,
    isThirdPartyAvailable?: boolean,
  ) => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const res = (await api.settings.getConsumersList(
        abortController.signal,
      )) as SelectedConsumer[];
      let consumer = res.find((c) => c.name === consumerName);

      const saveAvailable =
        (consumer && !consumer.paid && consumer.canSet) ||
        this.settingsStore?.standalone ||
        isThirdPartyAvailable;

      if (!saveAvailable) consumer = undefined;

      this.integration.selectedConsumer = consumer || {};
      this.setConsumers(res);

      return !!consumer;
    } catch (e) {
      if (axios.isCancel(e)) return;

      throw e;
    }
  };

  updateConsumerProps = async (newProps: unknown) => {
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

  changePassword = (userId: string, hash: string, key: string) => {
    return api.people.changePassword(userId, hash, key);
  };

  sendOwnerChange = (id: string) => {
    return api.settings.sendOwnerChange(id);
  };

  dataReassignment = (
    fromUserId: string,
    toUserId: string,
    deleteProfile: boolean,
  ) => {
    return api.settings.dataReassignment(fromUserId, toUserId, deleteProfile);
  };

  dataReassignmentProgress = (id: string) => {
    return api.settings.dataReassignmentProgress(id);
  };

  dataReassignmentTerminate = (userId: string) => {
    return api.settings.dataReassignmentTerminate(userId);
  };

  getCommonThirdPartyList = async () => {
    // api.settings.getCommonThirdPartyList no longer exists
    // in shared/api/settings — this call would throw at runtime (the
    // original .js behaves the same); preserved via cast.
    const res = await (
      api.settings as unknown as {
        getCommonThirdPartyList: () => Promise<TCommonThirdParty[]>;
      }
    ).getCommonThirdPartyList();

    this.setCommonThirdPartyList(res);
  };

  getAllSessions = () => {
    return api.settings.getAllActiveSessions() as Promise<TActiveSessionsResponse>;
  };

  removeAllSessions = () => {
    return api.settings.removeAllActiveSessions() as Promise<string>;
  };

  removeAllExecptThis = () => {
    return api.settings.removeAllExceptThisSession();
  };

  removeSession = (id: number) => {
    return api.settings.removeActiveSession(id);
  };

  setLogoutDialogVisible = (visible: boolean) => {
    this.logoutDialogVisible = visible;
  };

  setLogoutAllDialogVisible = (visible: boolean) => {
    this.logoutAllDialogVisible = visible;
  };

  getSessions = () => {
    this.getAllSessions().then((res) => {
      this.setSessions(res.items);
      this.currentSession = res.loginEvent;
      this.sessionsIsInit = true;
    });
  };

  setSessions = (sessions: TActiveSession[]) => {
    this.sessions = sessions;
  };

  setPlatformModalData = (
    data: Pick<TActiveSession, "id" | "platform" | "browser">,
  ) => {
    this.platformModalData = {
      id: data.id,
      platform: data.platform,
      browser: data.browser,
    };
  };

  setOpenThirdPartyModal = (state: boolean) => {
    this.openThirdPartyModal = state;
  };
}

export default SettingsSetupStore;
