import { makeAutoObservable } from "mobx";

class LdapFormStore {
  isLdapEnabled = false;
  enableLdap = false;
  isSettingsShown = false;
  isTlsEnabled = false;
  isSslEnabled = false;

  constructor() {
    makeAutoObservable(this);
  }

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
