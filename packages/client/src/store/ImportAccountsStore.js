import axios from "axios";
import { uploadFile } from "@docspace/common/api/files";
import { combineUrl } from "@docspace/common/utils";
import { makeAutoObservable, runInAction } from "mobx";
import { migrationList, migrationName, migrationStatus } from "@docspace/common/api/settings";

class ImportAccountsStore {
  checkedAccounts = [];
  services = [];
  users = [];
  existUsers = [];
  withoutEmailUsers = [];
  isFileLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsFileLoading = (isLoading) => {
    this.isFileLoading = isLoading;
  };

  toggleAccount = (id) => {
    this.checkedAccounts = this.checkedAccounts.includes(id)
      ? this.checkedAccounts.filter((itemId) => itemId !== id)
      : [...this.checkedAccounts, id];
  };

  onCheckAccounts = (checked, accounts) => {
    this.checkedAccounts = checked ? accounts.map((data) => data.id) : [];
  };

  toggleAllAccounts = (e, accounts) => {
    this.checkedAccounts = e.target.checked ? accounts.map((data) => data.id) : [];
  };

  setUsers = (data) => {
    runInAction(() => {
      this.users = data.parseResult.users;
      this.existUsers = data.parseResult.existUsers;
      this.withoutEmailUsers = data.parseResult.withoutEmailUsers;
    });
  };

  isAccountChecked = (id) => this.checkedAccounts.includes(id);

  cleanCheckedAccounts = () => (this.checkedAccounts = []);

  get numberOfCheckedAccounts() {
    return this.checkedAccounts.length;
  }

  localFileUploading = async (file, setProgress) => {
    try {
      const location = combineUrl(window.location.origin, "migrationFileUpload.ashx");
      const requestsDataArray = [];
      let chunk = 0;

      const res = await axios.post(location + "?Init=true");
      const chunkUploadSize = res.data.ChunkSize;
      const chunks = Math.ceil(file.size / chunkUploadSize, chunkUploadSize);

      while (chunk < chunks) {
        const offset = chunk * chunkUploadSize;
        const formData = new FormData();
        formData.append("file", file.slice(offset, offset + chunkUploadSize));
        requestsDataArray.push(formData);
        chunk++;
      }

      chunk = 0;
      while (chunk < chunks && this.isFileLoading) {
        await uploadFile(location + `?Name=${file.name}`, requestsDataArray[chunk]);
        setProgress((chunk / chunks) * 100);
        chunk++;
      }
    } catch (e) {
      console.error(e);
    }
  };

  setServices = (service) => {
    this.services = service;
  };

  getMigrationList = () => {
    return migrationList();
  };

  initMigrationName = (name) => {
    return migrationName(name);
  };

  getMigrationStatus = () => {
    return migrationStatus();
  };
}

export default ImportAccountsStore;
