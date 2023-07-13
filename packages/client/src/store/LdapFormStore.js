import { makeAutoObservable } from "mobx";

class LdapFormStore {
  isLdapEnabled = false;
  enableLdap = false;
  isSettingsShown = false;
  isTlsEnabled = false;
  isSslEnabled = false;

  server = "";
  userDN = "";
  loginAttribute = "";
  portNumber = "";
  userFilter = "";

  firstName = "givenName";
  secondName = "sn";
  mail = "mail";

  errors = {
    isServerError: false,
    isUserDNError: false,
    isPortNumberError: false,
    isUserFilterError: false,
    isLoginAttributeError: false,
    isFirstNameError: false,
    isSecondNameError: false,
    isMailError: false,
  };

  constructor() {
    makeAutoObservable(this);
  }

  setServer = (server) => {
    this.server = server;
  };

  setIsServerError = (isServerError) => {
    this.isServerError = isServerError;
  };

  setIsUserDNError = (isUserDNError) => {
    this.isUserDNError = isUserDNError;
  };

  setIsPortNumberError = (isPortNumberError) => {
    this.isPortNumberError = isPortNumberError;
  };
  setIsUserFilterError = (isUserFilterError) => {
    this.isUserFilterError = isUserFilterError;
  };
  setIsLoginAttributeError = (isLoginAttributeError) => {
    this.isLoginAttributeError = isLoginAttributeError;
  };

  setUserDN = (userDN) => {
    this.userDN = userDN;
  };

  setLoginAttribute = (loginAttribute) => {
    this.loginAttribute = loginAttribute;
  };

  setPortNumber = (portNumber) => {
    this.portNumber = portNumber;
  };

  setUserFilter = (userFilter) => {
    this.userFilter = userFilter;
  };

  setFirstName = (firstName) => {
    this.firstName = firstName;
  };
  setSecondName = (secondName) => {
    this.secondName = secondName;
  };
  setMail = (mail) => {
    this.mail = mail;
  };

  setErrors = (key, value) => {
    this.errors[key] = value;
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
