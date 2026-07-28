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

import {
  getLdapSettings,
  saveLdapSettings,
  getLdapStatus,
  getLdapDefaultSettings,
  syncLdap,
  saveCronLdap,
  getCronLdap,
} from "@docspace/shared/api/settings";
import {
  EmployeeType,
  LDAPOperation,
  type LDAPCertificateProblem,
} from "@docspace/shared/enums";
import { makeAutoObservable, runInAction } from "mobx";
import isEqual from "lodash/isEqual";
import delay from "lodash/delay";
import { toastr } from "@docspace/ui-kit/components/toast";

import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TTranslation } from "@docspace/shared/types";

type TLdapMapping = {
  FirstNameAttribute: string;
  SecondNameAttribute: string;
  MailAttribute: string;
  AvatarAttribute: string;
  UserQuotaLimit: string | number;
  LocationAttribute?: string;
  MobilePhoneAttribute?: string;
  TitleAttribute?: string;
};

type TLdapServerSettings = {
  enableLdapAuthentication: boolean;
  startTls: boolean;
  ssl: boolean;
  sendWelcomeEmail: boolean;
  server: string;
  userDN: string;
  portNumber: string | number;
  userFilter: string;
  loginAttribute: string;
  ldapMapping: TLdapMapping;
  authentication: boolean;
  acceptCertificate: boolean;
  acceptCertificateHash: string | null;
  groupMembership: boolean;
  groupDN: string;
  userAttribute: string;
  groupFilter: string;
  groupAttribute: string;
  groupNameAttribute: string;
  login: string;
  password: string;
  disableEmailVerification: boolean;
};

type TLdapRequiredSettings = {
  server: string;
  userDN: string;
  loginAttribute: string;
  portNumber: string | number;
  userFilter: string;
  firstName: string;
  secondName: string;
  mail: string;
  avatarAttribute: string;
  userQuotaLimit: string | number;
  userType?: EmployeeType;
};

type TLdapCertificateConfirmRequest = {
  Approved: boolean;
  Requested: boolean;
  SerialNumber: string;
  IssuerName: string;
  SubjectName: string;
  ValidFrom: string;
  ValidUntil: string;
  Hash: string;
  CertificateErrors?: LDAPCertificateProblem[];
};

type TLdapOperationStatus = {
  id?: string | null;
  completed?: boolean;
  percents?: number;
  error?: string | null;
  warning?: string | null;
  source?: string;
  status?: string;
  operationType?: LDAPOperation;
  // raw server value is a JSON string; onGetStatus replaces it with the
  // parsed object in place
  certificateConfirmRequest?: TLdapCertificateConfirmRequest | string | null;
};

type TLdapCron = {
  cron?: string | null;
};

type TLdapCertificateIssue = {
  approved: boolean;
  requested: boolean;
  serialNumber: string;
  issuerName: string;
  subjectName: string;
  validFrom: string;
  validUntil: string;
  uniqueHash: string;
  errors: LDAPCertificateProblem[];
};

type TLdapSaveSettings = {
  EnableLdapAuthentication: boolean;
  AcceptCertificate: boolean;
  acceptCertificateHash: string | null;
  StartTls: boolean;
  Ssl: boolean;
  SendWelcomeEmail: boolean;
  DisableEmailVerification: boolean;
  Server: string;
  UserDN: string;
  PortNumber: string | number;
  UserFilter: string;
  LoginAttribute: string;
  LdapMapping: {
    firstNameAttribute: string;
    secondNameAttribute: string;
    mailAttribute: string;
    avatarAttribute: string;
    userQuotaLimit: string | number;
  };
  UsersType?: EmployeeType;
  AccessRights: Record<string, unknown>;
  GroupMembership: boolean;
  GroupDN: string;
  UserAttribute: string;
  GroupFilter: string;
  GroupAttribute: string;
  GroupNameAttribute: string;
  Authentication: boolean;
  Login: string;
  Password: string;
};

const constants = {
  SSL_LDAP_PORT: 636,
  DEFAULT_LDAP_PORT: 389,
  GET_STATUS_TIMEOUT: 1000,
};

class LdapFormStore {
  isLoaded = false;

  isLdapEnabled = false;

  isSettingsShown = false;

  isTlsEnabled = false;

  isSslEnabled = false;

  requiredSettings: TLdapRequiredSettings = {
    server: "",
    userDN: "",
    loginAttribute: "uid",
    portNumber: "",
    userFilter: "(uid=*)",
    firstName: "givenName",
    secondName: "sn",
    mail: "mail",
    avatarAttribute: "jpegPhoto",
    userQuotaLimit: "",
  };

  login = "";

  password = "";

  authentication = true;

  acceptCertificate = false;

  acceptCertificateHash: string | null = null;

  isSendWelcomeEmail = false;

  disableEmailVerification = false;

  errors: Record<string, boolean> = {};

  groupMembership = false;

  groupDN = "";

  userAttribute = "distinguishedName";

  groupFilter = "(objectClass=group)";

  groupAttribute = "member";

  groupNameAttribute = "cn";

  cron: string | null = null;

  serverCron: string | null = null;

  inProgress = false;

  progressBarIntervalId: ReturnType<typeof setInterval> | null = null;

  alreadyChecking = false;

  lastWarning = "";

  progressStatus: TLdapOperationStatus = {
    percents: 0,
    completed: false,
    error: "",
    source: "",
    status: "",
  };

  isCertificateDialogVisible = false;

  cerficateIssue: TLdapCertificateIssue = {
    approved: false,
    requested: false,
    serialNumber: "",
    issuerName: "",
    subjectName: "",
    validFrom: "",
    validUntil: "",
    uniqueHash: "",
    errors: [],
  };

  defaultSettings: TLdapServerSettings | Record<string, never> = {};

  serverData: TLdapServerSettings | Record<string, never> = {};

  serverSettings: TLdapSaveSettings | Record<string, never> = {};

  currentQuotaStore: CurrentQuotasStore | null = null;

  settingsStore: SettingsStore | null = null;

  confirmationResetModal = false;

  constructor(
    currentQuotaStore: CurrentQuotasStore,
    settingsStore: SettingsStore,
  ) {
    makeAutoObservable(this);

    this.currentQuotaStore = currentQuotaStore;
    this.settingsStore = settingsStore;
  }

  mapSettings = (data: TLdapServerSettings) => {
    // console.log("LDAP settings data", data);
    this.serverData = data;

    const {
      enableLdapAuthentication,
      startTls,
      ssl,
      sendWelcomeEmail,
      server,
      userDN,
      portNumber,
      userFilter,
      loginAttribute,
      ldapMapping,
      authentication,
      acceptCertificate,

      groupMembership,
      groupDN,
      userAttribute,
      groupFilter,
      groupAttribute,
      groupNameAttribute,
      login,
      password,
      acceptCertificateHash,
      disableEmailVerification,
    } = data;

    const {
      FirstNameAttribute,
      SecondNameAttribute,
      MailAttribute,
      AvatarAttribute,
      UserQuotaLimit,
    } = ldapMapping;

    this.isLdapEnabled = enableLdapAuthentication;
    this.isTlsEnabled = startTls;
    this.isSslEnabled = ssl;

    this.requiredSettings = {
      server,
      userDN,
      loginAttribute,
      portNumber,
      userFilter,
      firstName: FirstNameAttribute,
      secondName: SecondNameAttribute,
      mail: MailAttribute,
      avatarAttribute: AvatarAttribute,
      userQuotaLimit: UserQuotaLimit,
      userType: EmployeeType.User,
    };

    this.authentication = authentication;
    this.acceptCertificate = acceptCertificate;
    this.acceptCertificateHash = acceptCertificateHash;
    this.isSendWelcomeEmail = sendWelcomeEmail;
    this.disableEmailVerification = disableEmailVerification;

    this.groupMembership = groupMembership;
    this.groupDN = groupDN;
    this.userAttribute = userAttribute;
    this.groupFilter = groupFilter;
    this.groupAttribute = groupAttribute;
    this.groupNameAttribute = groupNameAttribute;

    this.login = login || "";
    this.password = password || "";
  };

  mapCron = (cron?: string | null) => {
    const cronWithoutSeconds = cron ? cron.replace("0 ", "") : null;

    this.setCron(cronWithoutSeconds);

    this.serverCron = cronWithoutSeconds;
  };

  mapDefaultSettings = (data: TLdapServerSettings) => {
    delete data.ldapMapping.LocationAttribute;
    delete data.ldapMapping.MobilePhoneAttribute;
    delete data.ldapMapping.TitleAttribute;
    this.defaultSettings = data;
  };

  load = async (t: TTranslation) => {
    // if (this.isLoaded) return;

    const ldapSettingsAbortController = new AbortController();
    const cronLdapAbortController = new AbortController();
    const ldapDefaultAbortController = new AbortController();
    this.settingsStore!.addAbortControllers([
      ldapSettingsAbortController,
      cronLdapAbortController,
      ldapDefaultAbortController,
    ]);

    const [settingsRes, cronRes, defaultRes] = await Promise.allSettled([
      getLdapSettings(ldapSettingsAbortController.signal),
      getCronLdap(cronLdapAbortController.signal),
      getLdapDefaultSettings(ldapDefaultAbortController.signal),
    ]);

    if (settingsRes.status == "fulfilled") {
      this.mapSettings(settingsRes.value as TLdapServerSettings);
      this.setServerSettings();
    }

    if (cronRes.status == "fulfilled") {
      this.mapCron((cronRes.value as TLdapCron | undefined)?.cron);
    }

    if (defaultRes.status == "fulfilled") {
      this.mapDefaultSettings(defaultRes.value as TLdapServerSettings);
    }

    runInAction(() => {
      this.isLoaded = true;
      this.errors = {};
    });

    if (
      settingsRes.status == "rejected" ||
      cronRes.status == "rejected" ||
      defaultRes.status == "rejected"
    ) {
      if (
        (settingsRes as { reason?: Error })?.reason?.message === "canceled" ||
        (cronRes as { reason?: Error })?.reason?.message === "canceled" ||
        (defaultRes as { reason?: Error })?.reason?.message === "canceled"
      ) {
        return;
      }

      console.error(
        "Error while loading LDAP settings",
        (settingsRes as { reason?: Error })?.reason,
        (cronRes as { reason?: Error })?.reason,
        (defaultRes as { reason?: Error })?.reason,
      );
      toastr.error(t("Common:SomethingWentWrong"));
    }
  };

  setServer = (server: string) => {
    this.requiredSettings.server = server;
  };

  setUserDN = (userDN: string) => {
    this.requiredSettings.userDN = userDN;
  };

  removeErrorField = (fieldName: string) => {
    delete this.errors[fieldName];
  };

  setErrorField = (fieldName: string) => {
    this.errors[fieldName] = true;
  };

  setLoginAttribute = (loginAttribute: string) => {
    this.requiredSettings.loginAttribute = loginAttribute;
  };

  setPortNumber = (portNumber: string | number) => {
    this.requiredSettings.portNumber = portNumber;
  };

  setUserFilter = (userFilter: string) => {
    this.requiredSettings.userFilter = userFilter;
  };

  setFirstName = (firstName: string) => {
    this.requiredSettings.firstName = firstName;
  };

  setSecondName = (secondName: string) => {
    this.requiredSettings.secondName = secondName;
  };

  setMail = (mail: string) => {
    this.requiredSettings.mail = mail;
  };

  setAvatarAttribute = (avatarAttribute: string) => {
    this.requiredSettings.avatarAttribute = avatarAttribute;
  };

  setUserQuotaLimit = (userQuotaLimit: string | number) => {
    this.requiredSettings.userQuotaLimit = userQuotaLimit;
  };

  setUserType = (userType: EmployeeType) => {
    this.requiredSettings.userType = userType;
  };

  setLogin = (login: string) => {
    this.login = login;
  };

  setPassword = (password: string) => {
    this.password = password;
  };

  setIsAuthentication = () => {
    this.authentication = !this.authentication;

    if (!this.authentication) {
      this.errors.login = false;
      this.errors.password = false;
    }
  };

  setIsSendWelcomeEmail = (sendWelcomeEmail: boolean) => {
    this.isSendWelcomeEmail = sendWelcomeEmail;
  };

  setDisableEmailVerification = (disableEmailVerification: boolean) => {
    this.disableEmailVerification = disableEmailVerification;
  };

  setIsGroupMembership = () => {
    this.groupMembership = !this.groupMembership;
  };

  setGroupDN = (groupDN: string) => {
    this.groupDN = groupDN;
  };

  setUserAttribute = (userAttribute: string) => {
    this.userAttribute = userAttribute;
  };

  setGroupFilter = (groupFilter: string) => {
    this.groupFilter = groupFilter;
  };

  setGroupAttribute = (groupAttribute: string) => {
    this.groupAttribute = groupAttribute;
  };

  setGroupNameAttribute = (groupNameAttribute: string) => {
    this.groupNameAttribute = groupNameAttribute;
  };

  restoreToDefault = async (t: TTranslation) => {
    const settingsRes = (await getLdapDefaultSettings()) as TLdapServerSettings;
    settingsRes.password = "";

    this.mapSettings(settingsRes);

    this.save(t, true);
  };

  syncLdap = async (t: TTranslation) => {
    this.inProgress = false;
    this.progressStatus = {
      percents: 0,
      completed: false,
      error: "",
      source: "",
      status: "",
      operationType: LDAPOperation.Sync,
    };

    const respose = (await syncLdap()) as TLdapOperationStatus | undefined;

    if (respose?.completed || !respose?.id) {
      this.onGetStatus(t, respose);
      return;
    }

    if (respose?.id && !respose?.completed) {
      this.inProgress = true;
      this.progressBarIntervalId = setInterval(
        () => this.checkStatus(t),
        constants.GET_STATUS_TIMEOUT,
      );
    }
  };

  saveCronLdap = async () => {
    this.inProgress = true;
    try {
      const cronWithSeconds = this.isCronEnabled ? `0 ${this.cron}` : null;

      const respose = await saveCronLdap(cronWithSeconds);

      this.serverCron = this.cron;

      return respose;
    } finally {
      this.inProgress = false;
    }
  };

  save = async (t: TTranslation, toDefault = false, turnOff = false) => {
    this.inProgress = false;
    this.progressStatus = {
      percents: 0,
      completed: false,
      error: "",
      source: "",
      status: "",
      operationType: LDAPOperation.SaveAndSync,
    };

    let isErrorExist = false;
    this.errors = {};

    if (!toDefault && !turnOff) {
      const requiredSettingsKeys = Object.keys(
        this.requiredSettings,
      ) as (keyof TLdapRequiredSettings)[];
      requiredSettingsKeys.forEach((key) => {
        if (
          typeof this.requiredSettings[key] === "string" &&
          (this.requiredSettings[key] as string).trim() === ""
        ) {
          isErrorExist = true;
          this.errors[key] = true;
        }
      });

      if (this.groupMembership) {
        const groupFields = [
          ["groupDN", this.groupDN],
          ["userAttribute", this.userAttribute],
          ["groupFilter", this.groupFilter],
          ["groupAttribute", this.groupAttribute],
          ["groupNameAttribute", this.groupNameAttribute],
        ];

        groupFields.forEach(([key, value]) => {
          if (value.trim() === "") {
            this.errors[key] = true;
          }
        });
      }

      if (this.authentication && !isErrorExist) {
        this.errors.login = this.login.trim() === "";
        this.errors.password = this.password.trim() === "";

        isErrorExist = this.errors.login || this.errors.password;
      }

      if (isErrorExist) {
        this.scrollToField();
        return;
      }
    }

    const settings = this.getSettings();
    const respose = (await saveLdapSettings(settings)) as
      | TLdapOperationStatus
      | undefined;
    this.setServerSettings();

    if (turnOff) {
      this.password = "";
    }

    if (respose?.completed || !respose?.id) {
      this.onGetStatus(t, respose, toDefault);
      return;
    }

    if (respose?.id && !respose?.completed) {
      this.inProgress = true;
      this.progressBarIntervalId = setInterval(
        () => this.checkStatus(t, toDefault),
        constants.GET_STATUS_TIMEOUT,
      );
    }
  };

  scrollToField = () => {
    Object.keys(this.errors).every((key) => {
      const element = document.getElementsByName(key)?.[0];

      if (!element) return true; // continue loop

      element?.focus();
      element?.blur();
      return false; // break loop
    });
  };

  checkStatus = (t: TTranslation, toDefault = false) => {
    if (this.alreadyChecking) {
      return;
    }
    this.alreadyChecking = true;
    this.inProgress = true;

    (getLdapStatus() as Promise<TLdapOperationStatus>)
      .then((data) => this.onGetStatus(t, data, toDefault))
      .catch((e: Error) => {
        console.error(e);
        this.alreadyChecking = false;
      });
  };

  onGetStatus = async (
    t: TTranslation,
    data?: TLdapOperationStatus,
    toDefault?: boolean,
  ) => {
    this.alreadyChecking = false;
    try {
      if (data?.error) {
        if (data.certificateConfirmRequest) {
          const certificateConfirmRequest = JSON.parse(
            data.certificateConfirmRequest as string,
          ) as TLdapCertificateConfirmRequest;
          data.certificateConfirmRequest = certificateConfirmRequest;

          this.cerficateIssue = {
            approved: data.certificateConfirmRequest.Approved,
            requested: data.certificateConfirmRequest.Requested,
            serialNumber: data.certificateConfirmRequest.SerialNumber,
            issuerName: data.certificateConfirmRequest.IssuerName,
            subjectName: data.certificateConfirmRequest.SubjectName,
            validFrom: data.certificateConfirmRequest.ValidFrom,
            validUntil: data.certificateConfirmRequest.ValidUntil,
            uniqueHash: data.certificateConfirmRequest.Hash,
            errors: data.certificateConfirmRequest?.CertificateErrors || [],
          };

          this.setCertificateDialogVisible(true);
        }
      }

      // when data is undefined/empty it is replaced by the fallback below
      let status = data as TLdapOperationStatus;
      if (
        !data ||
        (typeof data === "object" && Object.keys(data).length === 0)
      ) {
        status = {
          completed: true,
          percents: 100,
          certificateConfirmRequest: null,
          error: t("Common:UnexpectedError"),
        };
      }

      this.setProgress(status);

      if (status.warning && this.lastWarning !== status.warning) {
        this.lastWarning = status.warning;
        console.warn(status.warning);
        toastr.warning(status.warning, null, 0, true);
      }

      if (this.isCompleted(status)) {
        this.lastWarning = "";

        if (status.error) throw status.error;

        this.endProcess();

        this.progressStatus.status = t("Common:SuccessfullyCompletedOperation");

        if (toDefault) {
          const response = (await getCronLdap()) as TLdapCron | undefined;
          this.mapCron(response?.cron);
        }

        toastr.success(t("Common:SuccessfullyCompletedOperation"));
      }
    } catch (error) {
      toastr.error(error as string);
      this.endProcess();
    }
  };

  setCertificateDialogVisible = (visible: boolean) => {
    this.isCertificateDialogVisible = visible;
  };

  setAcceptCertificate = (accept: boolean) => {
    this.acceptCertificate = accept;
  };

  setAcceptCertificateHash = (hash: string | null) => {
    this.acceptCertificateHash = hash;
  };

  setProgress = (status: TLdapOperationStatus) => {
    this.progressStatus = status;
  };

  endProcess = () => {
    if (this.progressBarIntervalId) {
      clearInterval(this.progressBarIntervalId);
    }

    delay(() => {
      this.inProgress = false;
    }, 3000);
  };

  isCompleted = (status: TLdapOperationStatus) => {
    if (!status) return true;

    if (!status.completed) return false;

    if (
      status.error ||
      // lowercase `requested` does not exist on the parsed
      // certificateConfirmRequest (server sends PascalCase `Requested`) and
      // the raw value may still be a JSON string here — kept as-is to
      // preserve runtime behavior (evaluates to undefined, as in the old JS).
      (status.certificateConfirmRequest &&
        (status.certificateConfirmRequest as { requested?: boolean })
          .requested)
    ) {
      return true;
    }

    return true;
  };

  onChangeCron = (cron: string | null) => {
    this.setCron(cron);
  };

  toggleLdap = () => {
    this.isLdapEnabled = !this.isLdapEnabled;

    if (this.isLdapEnabled) {
      this.setIsSettingsShown(true);
    }
  };

  toggleCron = () => {
    if (!this.cron) {
      this.cron = "* * * * *";
    } else {
      this.cron = null;
    }
  };

  setIsSettingsShown = (shown: boolean) => {
    this.isSettingsShown = shown;
  };

  setIsTlsEnabled = (enabled: boolean) => {
    this.isTlsEnabled = enabled;
  };

  setCron = (cron: string | null) => {
    this.cron = cron;
  };

  setIsSslEnabled = (enabled: boolean) => {
    this.isSslEnabled = enabled;

    if (
      this.requiredSettings.portNumber == constants.DEFAULT_LDAP_PORT ||
      this.requiredSettings.portNumber == constants.SSL_LDAP_PORT
    ) {
      this.setPortNumber(
        enabled ? constants.SSL_LDAP_PORT : constants.DEFAULT_LDAP_PORT,
      );
    }
  };

  get isCronEnabled() {
    return !!this.cron;
  }

  get isStatusEmpty() {
    return !this.progressStatus.source;
  }

  setServerSettings = () => {
    const settings = this.getSettings();
    this.serverSettings = settings;
  };

  getSettings = (): TLdapSaveSettings => {
    const clearServer = this.requiredSettings.server.replace(
      /((https?|ldaps?):\/\/)/gi,
      "",
    );
    return {
      EnableLdapAuthentication: this.isLdapEnabled,
      AcceptCertificate: this.acceptCertificate,
      acceptCertificateHash: this.acceptCertificateHash,
      StartTls: this.isTlsEnabled,
      Ssl: this.isSslEnabled,
      SendWelcomeEmail: this.isSendWelcomeEmail,
      DisableEmailVerification: this.disableEmailVerification,
      Server: clearServer,
      UserDN: this.requiredSettings.userDN,
      PortNumber: this.requiredSettings.portNumber,
      UserFilter: this.requiredSettings.userFilter,
      LoginAttribute: this.requiredSettings.loginAttribute,
      LdapMapping: {
        firstNameAttribute: this.requiredSettings.firstName,
        secondNameAttribute: this.requiredSettings.secondName,
        mailAttribute: this.requiredSettings.mail,
        avatarAttribute: this.requiredSettings.avatarAttribute,
        userQuotaLimit: this.requiredSettings.userQuotaLimit,
      },
      UsersType: this.requiredSettings.userType,
      AccessRights: {},
      GroupMembership: this.groupMembership,
      GroupDN: this.groupDN,
      UserAttribute: this.userAttribute,
      GroupFilter: this.groupFilter,
      GroupAttribute: this.groupAttribute,
      GroupNameAttribute: this.groupNameAttribute,
      Authentication: this.authentication,
      Login: this.login,
      Password: this.password,
    };
  };

  reset = () => {
    this.progressStatus = {
      percents: 0,
      completed: false,
      error: "",
      source: "",
    };
  };

  openResetModal = () => {
    this.confirmationResetModal = true;
  };

  closeResetModal = () => {
    this.confirmationResetModal = false;
  };

  get hasChanges() {
    const settings = this.getSettings();
    return !isEqual(settings, this.serverSettings);
  }

  get isDefaultSettings() {
    return isEqual(this.serverData, this.defaultSettings);
  }

  get isUIDisabled() {
    // currentQuotaStore is assigned in the constructor and is
    // never null in practice; `!` preserves the old JS behavior (which would
    // also have thrown on null).
    return this.inProgress || !this.currentQuotaStore!.isLdapAvailable;
  }
}

export default LdapFormStore;
