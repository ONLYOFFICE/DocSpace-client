import { makeAutoObservable } from "mobx";

class LdapFormStore {
  isLdapEnabled = false;
  enableLdap = false;
  isSettingsShown = false;
  isTlsEnabled = false;
  isSslEnabled = false;

  requiredSettings = {
    server: "",
    userDN: "",
    loginAttribute: "uid",
    portNumber: "389",
    userFilter: "(objectclass=*)",
    firstName: "givenName",
    secondName: "sn",
    mail: "mail",
  };

  login = "";
  password = "";
  authentication = true;

  errors = {};

  constructor() {
    makeAutoObservable(this);
  }

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

  setLogin = (login) => {
    this.login = login;
  };
  setPassword = (password) => {
    this.password = password;
  };

  setIsAuthentication = () => {
    this.authentication = !this.authentication;
  };

  saveLdapSettings = () => {
    let isErrorExist = false;
    this.errors = {};

    if (this.authentication) {
      this.errors.login = this.login.trim() === "";
      this.errors.password = this.password.trim() === "";

      isErrorExist = this.errors.login || this.errors.password;
    }

    for (var key in this.requiredSettings) {
      if (this.requiredSettings[key].trim() === "") {
        isErrorExist = true;
        this.errors[key] = true;
      }
    }

    if (isErrorExist) return;

    console.log("saving settings");
  };

  ldapToggle = () => {
    this.enableLdap = !this.enableLdap;

    if (this.enableLdap) {
      this.setIsSettingsShown(true);
    }
  };

  setIsSettingsShown = (shown) => {
    this.isSettingsShown = shown;
  };

  setIsTlsEnabled = (enabled) => {
    this.isTlsEnabled = enabled;
  };

  setIsSslEnabled = (enabled) => {
    this.isSslEnabled = enabled;
  };
}

export default LdapFormStore;
