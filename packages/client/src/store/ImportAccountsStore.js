import { makeAutoObservable, runInAction } from "mobx";
import api from "@docspace/common/api";

class ImportAccountsStore {
  checkedAccounts = [];
  services = [];

  constructor() {
    makeAutoObservable(this);
  }

  toggleAccount = (id) => {
    this.checkedAccounts = this.checkedAccounts.includes(id)
      ? this.checkedAccounts.filter((itemId) => itemId !== id)
      : [...this.checkedAccounts, id];
  };

  onCheckAccounts = (checked, accounts) => {
    this.checkedAccounts = checked ? accounts.map((data) => data.id) : [];
  };

  toggleAllAccounts = (e, accounts) => {
    this.checkedAccounts = e.target.checked
      ? accounts.map((data) => data.id)
      : [];
  };

  isAccountChecked = (id) => this.checkedAccounts.includes(id);

  cleanCheckedAccounts = () => (this.checkedAccounts = []);

  get numberOfCheckedAccounts() {
    return this.checkedAccounts.length;
  }

  setServices = (service) => {
    this.services = service;
  };

  getMigrationName = () => {
    return api.settings.getMigrationList();
  };

  initMigration = (name) => {
    return api.settings.initMigrationName(name);
  };
}

export default ImportAccountsStore;
