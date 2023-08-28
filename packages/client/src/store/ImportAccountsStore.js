import { makeAutoObservable, runInAction } from "mobx";

class ImportAccountsStore {
  checkedAccounts = [];

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
}

export default ImportAccountsStore;
