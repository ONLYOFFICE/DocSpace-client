import axios from "axios";
import { uploadFile } from "@docspace/common/api/files";
import { combineUrl } from "@docspace/common/utils";
import { makeAutoObservable, runInAction } from "mobx";
import {
  migrationList,
  migrationName,
  migrationStatus,
  migrationCancel,
  migrationFinish,
  migrationLog,
  migrateFile,
} from "@docspace/common/api/settings";

class ImportAccountsStore {
  checkedAccounts = [];
  services = [];
  newUsers = [];
  users = [];
  existUsers = [];
  withoutEmailUsers = [];

  isFileLoading = false;
  isLoading = false;

  data = {};
  searchValue = "";

  importOptions = {
    importPersonalFiles: true,
    importSharedFiles: true,
  };

  constructor() {
    makeAutoObservable(this);
  }

  setIsFileLoading = (isLoading) => {
    this.isFileLoading = isLoading;
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };

  setSearchValue = (value) => {
    this.searchValue = value;
  };

  setImportOptions = (value) => {
    this.importOptions = { ...this.importOptions, ...value };
  };

  toggleAccount = (id) => {
    this.checkedAccounts = this.checkedAccounts.includes(id)
      ? this.checkedAccounts.filter((itemId) => itemId !== id)
      : [...this.checkedAccounts, id];
  };

  onCheckAccounts = (checked, accounts) => {
    this.checkedAccounts = checked ? accounts.map((data) => data.key) : [];
  };

  toggleAllAccounts = (e, accounts) => {
    this.checkedAccounts = e.target.checked ? accounts.map((data) => data.key) : [];
  };

  setUsers = (data) => {
    runInAction(() => {
      this.newUsers = data.parseResult.users;
      this.existUsers = data.parseResult.existUsers.map((user) => ({
        ...user,
        isDuplicate: true,
      }));
      this.users = [...this.newUsers, ...this.existUsers];
      this.withoutEmailUsers = data.parseResult.withoutEmailUsers;
      this.checkedAccounts = this.newUsers.map((item) => item.key);
    });
  };

  assignCheckedUsers = () => {
    this.users = this.users.filter((user) => this.checkedAccounts.includes(user.key));
  };

  changeTypeGroup = (key) => {
    this.checkedAccounts.map((item) => this.changeType(item, key));
  };

  changeType = (id, optionKey) => {
    this.users = this.users.map((user) => {
      if (id === user.key) {
        return { ...user, userType: optionKey };
      }
      return user;
    });
    const [existUsers, newUsers] = this.partition(this.users, (user) => user.isDublicate);
    this.data.users = [...newUsers];
    this.data.existUsers = [...existUsers];
  };

  partition(array, predicate) {
    return array.reduce(
      ([pass, fail], elem, currentIndex, array) => {
        return predicate(elem, currentIndex, array)
          ? [[...pass, elem], fail]
          : [pass, [...fail, elem]];
      },
      [[], []],
    );
  }

  setData = (data) => {
    this.data = data.parseResult;
  };

  isAccountChecked = (id) => this.checkedAccounts.includes(id);

  cleanCheckedAccounts = () => (this.checkedAccounts = []);

  get numberOfCheckedAccounts() {
    return this.checkedAccounts.length;
  }

  multipleFileUploading = async (files, setProgress) => {
    try {
      const location = combineUrl(window.location.origin, "migrationFileUpload.ashx");
      const requestsDataArray = [];

      const res = await axios.post(location + "?Init=true");
      const chunkUploadSize = res.data.ChunkSize;

      const chunksNumber = files
        .map((file) => Math.ceil(file.size / chunkUploadSize, chunkUploadSize))
        .reduce((curr, next) => curr + next, 0);

      files.forEach((file) => {
        const chunks = Math.ceil(file.size / chunkUploadSize, chunkUploadSize);
        let chunkCounter = 0;

        while (chunkCounter < chunks) {
          const offset = chunkCounter * chunkUploadSize;
          const formData = new FormData();
          formData.append("file", file.slice(offset, offset + chunkUploadSize));
          requestsDataArray.push({ formData, fileName: file.name });
          chunkCounter++;
        }
      });

      let chunk = 0;

      while (chunk < chunksNumber && this.isFileLoading) {
        await uploadFile(
          location + `?Name=${requestsDataArray[chunk].fileName}`,
          requestsDataArray[chunk].formData,
        );
        const progress = (chunk / chunksNumber) * 100;
        setProgress(Math.ceil(progress));
        chunk++;
      }
    } catch (e) {
      console.error(e);
    }
  };

  singleFileUploading = async (file, setProgress) => {
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
        const progress = (chunk / chunks) * 100;
        setProgress(Math.ceil(progress));
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

  proceedFileMigration = (data) => {
    return migrateFile(data);
  };

  cancelMigration = () => {
    return migrationCancel();
  };

  getMigrationStatus = () => {
    return migrationStatus();
  };

  getMigrationLog = () => {
    return migrationLog();
  };

  sendWelcomeLetter = (data) => {
    return migrationFinish(data);
  };
}

export default ImportAccountsStore;
