import { makeAutoObservable } from "mobx";

class LdapFormStore {
  isLdapEnabled = false;
  enableLdap = false;
  isSettingsShown = false;

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
}

export default LdapFormStore;
