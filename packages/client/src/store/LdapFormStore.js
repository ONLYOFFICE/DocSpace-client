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
