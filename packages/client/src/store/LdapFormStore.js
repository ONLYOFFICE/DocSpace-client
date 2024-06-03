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
import { EmployeeType, LDAPOpeation } from "@docspace/shared/enums";
import { makeAutoObservable } from "mobx";
import isEqual from "lodash/isEqual";

const constants = {
  NULL_PERCENT: 0,
  SSL_LDAP_PORT: 636,
  DEFAULT_LDAP_PORT: 389,
  GET_STATUS_TIMEOUT: 1000,
};

class LdapFormStore {
  isLoaded = false;
  isLdapEnabled = false;
  enableLdap = false;
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

  inProgress = false;
  progressBarIntervalId = null;
  alreadyChecking = false;
  lastWarning = "";

  progressStatus = {
    percents: 0,
    completed: false,
    error: "",
    source: "",
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

  constructor() {
    makeAutoObservable(this);
  }

  mapSettings = (data) => {
    console.log("LDAP settings data", data);
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

    this.setServerSettings();
  };

  mapCron = (cron) => {
    const cronWithoutSeconds = cron ? cron.replace("0 ", "") : null;

    this.setCron(cronWithoutSeconds);
  };

  mapDefaultSettings = (data) => {
    delete data.ldapMapping.LocationAttribute;
    delete data.ldapMapping.MobilePhoneAttribute;
    delete data.ldapMapping.TitleAttribute;
    this.defaultSettings = data;
  };

  load = async () => {
    const [settingsRes, cronRes, defaultRes] = await Promise.allSettled([
      getLdapSettings(),
      getCronLdap(),
      getLdapDefaultSettings(),
    ]);

    if (settingsRes.status == "fulfilled") this.mapSettings(settingsRes.value);

    if (cronRes.status == "fulfilled") {
      this.mapCron(cronRes.value?.cron);
    }

    if (defaultRes.status == "fulfilled") {
      this.mapDefaultSettings(defaultRes.value);
    }

    this.isLoaded = true;
    //TDOD: handle error
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

  restoreToDefault = async () => {
    const settingsRes = await getLdapDefaultSettings();
    this.mapSettings(settingsRes);

    this.save(true);
  };

  syncLdap = async () => {
    this.inProgress = false;
    this.progressStatus = {
      percents: 0,
      completed: false,
      error: "",
      source: "",
      operationType: LDAPOpeation.Sync,
    };

    const respose = await syncLdap();

    console.log(respose);

    if (respose?.id) {
      this.inProgress = true;
      this.progressBarIntervalId = setInterval(
        this.checkStatus,
        constants.GET_STATUS_TIMEOUT,
      );
    }
  };

  saveCronLdap = async () => {
    const cronWithSeconds = this.isCronEnabled ? `0 ${this.cron}` : null;

    const respose = await saveCronLdap(cronWithSeconds);

    return respose;
  };

  save = async (toDefault = false) => {
    this.inProgress = false;
    this.progressStatus = {
      percents: 0,
      completed: false,
      error: "",
      source: "",
      operationType: LDAPOpeation.SaveAndSync,
    };

    let isErrorExist = false;
    this.errors = {};

    if (!toDefault) {
      if (this.authentication) {
        this.errors.login = this.login.trim() === "";
        this.errors.password = this.password.trim() === "";

        isErrorExist = this.errors.login || this.errors.password;
      }

      for (var key in this.requiredSettings) {
        console.log({ key });
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
        () => this.checkStatus(toDefault),
        constants.GET_STATUS_TIMEOUT,
      );
    }
  };

  checkStatus = (toDefault = false) => {
    if (this.alreadyChecking) {
      return;
    }
    this.alreadyChecking = true;
    this.inProgress = true;

    getLdapStatus()
      .then((data) => this.onGetStatus(data, toDefault))
      .catch((e) => {
        this.alreadyChecking = false;
      });
  };

  onGetStatus = async (data, toDefault) => {
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
        //TODO: replace to toastr.warning(status.warning, "", { timeOut: 0, extendedTimeOut: 0 });
      }

      if (this.isCompleted(status)) {
        this.lastWarning = "";

        if (status.error) throw status.error;

        this.endProcess();

        if (toDefault) {
          const response = await getCronLdap();
          this.mapCron(response?.cron);
        }
      }
    } catch (error) {
      //showError(error);
      console.error(error);
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
    console.log(status);
    this.progressStatus = status;
  };

  endProcess = () => {
    if (this.progressBarIntervalId) {
      clearInterval(this.progressBarIntervalId);
    }
    //already = false;
    //enableInterface(false);
    // if (isRestoreDefault) {
    //     enableRestoreDefault(false);
    // }
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

    console.log("SUCCESS");
    //toastr.success(ASC.Resources.Master.ResourceJS.LdapSettingsSuccess);
    return true;
  };

  showError = (error) => {
    var errorMessage;

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.responseText) {
      try {
        var json = JSON.parse(error.responseText);

        if (typeof json === "object") {
          if (json.ExceptionMessage) {
            errorMessage = json.ExceptionMessage;
          } else if (json.Message) {
            errorMessage = json.Message;
          }
        } else if (typeof json === "string") {
          errorMessage = error.responseText.replace(/(^")|("$)/g, "");

          if (!errorMessage.length && error.statusText) {
            errorMessage = error.statusText;
          }
        }
      } catch (e) {
        errorMessage = error.responseText;
      }
    } else if (error.statusText) {
      errorMessage = error.statusText;
    } else if (error.error) {
      errorMessage = error.error;
    }

    errorMessage =
      !errorMessage || typeof errorMessage !== "string" || !errorMessage.length
        ? "ASC.Resources.Master.ResourceJS.OperationFailedError"
        : errorMessage.replace(/(^")|("$)/g, "");

    if (!errorMessage.length) {
      console.error("showError failed with ", error);
      return;
    }

    // if (syncInProgress) {
    //     $ldapSettingsSyncError.text(errorMessage);
    //     $ldapSettingsSyncError.show();
    // } else {
    //     $ldapSettingsError.text(errorMessage);
    //     $ldapSettingsError.show();
    // }
    //setStatus("");
    //setSource("");
    //setPercents(constants.NULL_PERCENT);
    //toastr.error(errorMessage);
    console.error(errorMessage);
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

  get hasChanges() {
    const settings = this.getSettings();
    return !isEqual(settings, this.serverSettings);
  }

  get isDefaultSettings() {
    return isEqual(this.serverData, this.defaultSettings);
  }
}

export default LdapFormStore;
