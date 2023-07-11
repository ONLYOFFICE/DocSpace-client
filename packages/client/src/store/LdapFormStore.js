import { makeAutoObservable } from "mobx";

class LdapFormStore {
  isLdapEnabled = false;
  enableLdap = false;

  constructor() {
    makeAutoObservable(this);
  }

  ldapToggle = () => {
    this.enableLdap = !this.enableLdap;
  };
}

export default LdapFormStore;
