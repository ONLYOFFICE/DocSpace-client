import {
  getLdapSettings,
  saveLdapSettings,
  getLdapStatus,
  getLdapDefaultSettings,
  syncLdap,
  saveCronLdap,
  getCronLdap,
} from "@docspace/shared/api/settings";
import { getNextSynchronization } from "@docspace/shared/components/cron";
import { EmployeeType, LDAPOperation } from "@docspace/shared/enums";
import { makeAutoObservable, runInAction } from "mobx";
import isEqual from "lodash/isEqual";
import delay from "lodash/delay";
import { toastr } from "@docspace/shared/components/toast";

const constants = {
  NULL_PERCENT: 0,
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

  requiredSettings = {
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
  acceptCertificateHash = null;
  isSendWelcomeEmail = false;
  errors = {};

  groupMembership = false;
  groupDN = "";
  userAttribute = "distinguishedName";
  groupFilter = "(objectClass=group)";
  groupAttribute = "member";
  groupNameAttribute = "cn";

  cron = null;
  serverCron = null;

  inProgress = false;
  progressBarIntervalId = null;
  alreadyChecking = false;
  lastWarning = "";

  progressStatus = {
    percents: 0,
    completed: false,
    error: "",
    source: "",
    status: "",
  };

  isCertificateDialogVisible = false;

  cerficateIssue = {
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

  defaultSettings = {};
  serverData = {};
  serverSettings = {};

  currentQuotaStore = null;

  constructor(currentQuotaStore) {
    makeAutoObservable(this);

    this.currentQuotaStore = currentQuotaStore;
  }

  mapSettings = (data) => {
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
      userType: EmployeeType.Collaborator,
    };

    this.authentication = authentication;
    this.acceptCertificate = acceptCertificate;
    this.acceptCertificateHash = acceptCertificateHash;
    this.isSendWelcomeEmail = sendWelcomeEmail;

    this.groupMembership = groupMembership;
    this.groupDN = groupDN;
    this.userAttribute = userAttribute;
    this.groupFilter = groupFilter;
    this.groupAttribute = groupAttribute;
    this.groupNameAttribute = groupNameAttribute;

    this.login = login;
    this.password = password || "";
  };

  mapCron = (cron) => {
    const cronWithoutSeconds = cron ? cron.replace("0 ", "") : null;

    this.setCron(cronWithoutSeconds);

    this.serverCron = cronWithoutSeconds;
  };

  mapDefaultSettings = (data) => {
    delete data.ldapMapping.LocationAttribute;
    delete data.ldapMapping.MobilePhoneAttribute;
    delete data.ldapMapping.TitleAttribute;
    this.defaultSettings = data;
  };

  load = async (t) => {
    const [settingsRes, cronRes, defaultRes] = await Promise.allSettled([
      getLdapSettings(),
      getCronLdap(),
      getLdapDefaultSettings(),
    ]);

    if (settingsRes.status == "fulfilled") {
      this.mapSettings(settingsRes.value);
      this.setServerSettings();
    }

    if (cronRes.status == "fulfilled") {
      this.mapCron(cronRes.value?.cron);
    }

    if (defaultRes.status == "fulfilled") {
      this.mapDefaultSettings(defaultRes.value);
    }

    runInAction(() => {
      this.isLoaded = true;
    });

    if (
      settingsRes.status == "rejected" ||
      cronRes.status == "rejected" ||
      defaultRes.status == "rejected"
    ) {
      console.error(
        "Error while loading LDAP settings",
        settingsRes?.reason,
        cronRes?.reason,
        defaultRes?.reason,
      );
      toastr.error(t("Common:SomethingWentWrong"));
    }
  };

  setServer = (server) => {
    this.requiredSettings.server = server;
  };

  setUserDN = (userDN) => {
    this.requiredSettings.userDN = userDN;
  };

  setLoginAttribute = (loginAttribute) => {
    this.requiredSettings.loginAttribute = loginAttribute;
  };

  setPortNumber = (portNumber) => {
    this.requiredSettings.portNumber = portNumber;
  };

  setUserFilter = (userFilter) => {
    this.requiredSettings.userFilter = userFilter;
  };

  setFirstName = (firstName) => {
    this.requiredSettings.firstName = firstName;
  };

  setSecondName = (secondName) => {
    this.requiredSettings.secondName = secondName;
  };

  setMail = (mail) => {
    this.requiredSettings.mail = mail;
  };

  setAvatarAttribute = (avatarAttribute) => {
    this.requiredSettings.avatarAttribute = avatarAttribute;
  };

  setUserQuotaLimit = (userQuotaLimit) => {
    this.requiredSettings.userQuotaLimit = userQuotaLimit;
  };

  setUserType = (userType) => {
    this.requiredSettings.userType = userType;
  };

  setLogin = (login) => {
    this.login = login;
  };

  setPassword = (password) => {
    this.password = password;
  };

  setIsAuthentication = () => {
    this.authentication = !this.authentication;
  };

  setIsSendWelcomeEmail = (sendWelcomeEmail) => {
    this.isSendWelcomeEmail = sendWelcomeEmail;
  };

  setIsGroupMembership = () => {
    this.groupMembership = !this.groupMembership;
  };

  setGroupDN = (groupDN) => {
    this.groupDN = groupDN;
  };

  setUserAttribute = (userAttribute) => {
    this.userAttribute = userAttribute;
  };

  setGroupFilter = (groupFilter) => {
    this.groupFilter = groupFilter;
  };

  setGroupAttribute = (groupAttribute) => {
    this.groupAttribute = groupAttribute;
  };

  setGroupNameAttribute = (groupNameAttribute) => {
    this.groupNameAttribute = groupNameAttribute;
  };

  restoreToDefault = async (t) => {
    const settingsRes = await getLdapDefaultSettings();
    this.mapSettings(settingsRes);

    this.save(t, true);
  };

  syncLdap = async (t) => {
    this.inProgress = false;
    this.progressStatus = {
      percents: 0,
      completed: false,
      error: "",
      source: "",
      status: "",
      operationType: LDAPOperation.Sync,
    };

    const respose = await syncLdap();

    // console.log(respose);

    if (respose?.id) {
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

  save = async (t, toDefault = false, turnOff = false) => {
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
      if (this.authentication) {
        this.errors.login = this.login.trim() === "";
        this.errors.password = this.password.trim() === "";

        isErrorExist = this.errors.login || this.errors.password;
      }

      for (var key in this.requiredSettings) {
        // console.log({ key });
        if (
          this.requiredSettings[key] &&
          typeof this.requiredSettings[key] == "string" &&
          this.requiredSettings[key].trim() === ""
        ) {
          isErrorExist = true;
          this.errors[key] = true;
        }
      }

      if (isErrorExist) return;
    }

    const settings = this.getSettings();
    const respose = await saveLdapSettings(settings);
    this.setServerSettings();

    if (respose?.id) {
      this.inProgress = true;
      this.progressBarIntervalId = setInterval(
        () => this.checkStatus(t, toDefault),
        constants.GET_STATUS_TIMEOUT,
      );
    }
  };

  checkStatus = (t, toDefault = false) => {
    if (this.alreadyChecking) {
      return;
    }
    this.alreadyChecking = true;
    this.inProgress = true;

    getLdapStatus()
      .then((data) => this.onGetStatus(t, data, toDefault))
      .catch((e) => {
        this.alreadyChecking = false;
      });
  };

  onGetStatus = async (t, data, toDefault) => {
    this.alreadyChecking = false;
    try {
      if (data?.error) {
        if (data.certificateConfirmRequest) {
          const certificateConfirmRequest = JSON.parse(
            data.certificateConfirmRequest,
          );
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

      var status = data;
      if (
        !data ||
        (typeof data == "object" && Object.keys(data).length === 0)
      ) {
        status = {
          completed: true,
          percents: 100,
          certificateConfirmRequest: null,
          error: "",
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
          const response = await getCronLdap();
          this.mapCron(response?.cron);
        }

        toastr.success(t("Common:SuccessfullyCompletedOperation"));
      }
    } catch (error) {
      console.error(error);
      toastr.error(error);
      this.endProcess();
    }
  };

  setCertificateDialogVisible = (visible) => {
    this.isCertificateDialogVisible = visible;
  };

  setAcceptCertificate = (accept) => {
    this.acceptCertificate = accept;
  };

  setAcceptCertificateHash = (hash) => {
    this.acceptCertificateHash = hash;
  };

  setProgress = (status) => {
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

  isCompleted = (status) => {
    if (!status) return true;

    if (!status.completed) return false;

    if (
      status.certificateConfirmRequest &&
      status.certificateConfirmRequest.requested
    ) {
      setCertificateDetails(status.certificateConfirmRequest);
      // currentSettings = previousSettings;
      return true;
    }

    if (status.error) {
      return true;
    }

    return true;
  };

  onChangeCron = (cron) => {
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

  setIsSettingsShown = (shown) => {
    this.isSettingsShown = shown;
  };

  setIsTlsEnabled = (enabled) => {
    this.isTlsEnabled = enabled;
  };

  setCron = (cron) => {
    this.cron = cron;
  };

  get nextSyncDate() {
    return getNextSynchronization(this.cron ?? "* * * * *");
  }

  setIsSslEnabled = (enabled) => {
    this.isSslEnabled = enabled;
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

  getSettings = () => {
    return {
      EnableLdapAuthentication: this.isLdapEnabled,
      AcceptCertificate: this.acceptCertificate,
      acceptCertificateHash: this.acceptCertificateHash,
      StartTls: this.isTlsEnabled,
      Ssl: this.isSslEnabled,
      SendWelcomeEmail: this.isSendWelcomeEmail,
      Server: this.requiredSettings.server,
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

  get hasChanges() {
    const settings = this.getSettings();
    return !isEqual(settings, this.serverSettings);
  }

  get isDefaultSettings() {
    return isEqual(this.serverData, this.defaultSettings);
  }

  get isUIDisabled() {
    return this.inProgress || !this.currentQuotaStore.isLdapAvailable;
  }
}

export default LdapFormStore;