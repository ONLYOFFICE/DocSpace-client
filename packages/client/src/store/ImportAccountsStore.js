import axios from "axios";
import { uploadFile } from "@docspace/shared/api/files";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { makeAutoObservable, runInAction } from "mobx";
import {
  migrationList,
  migrationName,
  migrationStatus,
  migrationCancel,
  migrationFinish,
  migrationLog,
  migrateFile,
} from "@docspace/shared/api/settings";

class ImportAccountsStore {
  services = [];

  users = {
    new: [],
    existing: [],
    withoutEmail: [],
    result: [],
  };

  checkedUsers = {
    withEmail: [],
    withoutEmail: [],
    result: [],
  };

  UserTypes = {
    DocSpaceAdmin: "DocSpaceAdmin",
    RoomAdmin: "RoomAdmin",
    User: "User",
  };

  isFileLoading = false;
  isLoading = false;

  searchValue = "";

  importOptions = {
    importGroups: true,
    importPersonalFiles: true,
    importSharedFiles: true,
    importSharedFolders: true,
    importCommonFiles: true,
    importProjectFiles: true,
  };

  importResult = {
    succeedUsers: 0,
    failedUsers: 0,
  };

  constructor() {
    makeAutoObservable(this);
  }

  get withEmailUsers() {
    return [
      ...this.users.existing.map((user) => ({ ...user, isDuplicate: true })),
      ...this.users.new.map((user) => ({ ...user, isDuplicate: false })),
    ];
  }

  get finalUsers() {
    const checkedIds = this.checkedUsers.result.map(
      (checkedUser) => checkedUser.key,
    );
    return this.users.result.filter((user) => checkedIds.includes(user.key));
  }

  get areCheckedUsersEmpty() {
    return (
      this.checkedUsers.withEmail.length +
        this.checkedUsers.withoutEmail.length ===
      0
    );
  }

  setImportResult = (parseResult) => {
    this.importResult = {
      succeedUsers: parseResult.successedUsers,
      failedUsers: parseResult.failedUsers,
    };
  };

  setResultUsers = () => {
    const checkedIds = this.checkedUsers.withoutEmail.map(
      (checkedUser) => checkedUser.key,
    );
    runInAction(() => {
      this.users = {
        ...this.users,
        result: [
          ...this.checkedUsers.withEmail,
          ...this.users.withoutEmail.filter((user) =>
            checkedIds.includes(user.key),
          ),
        ],
      };
      this.checkedUsers = {
        ...this.checkedUsers,
        result: [],
      };
    });
  };

  setUsers = (data) => {
    runInAction(() => {
      this.users = {
        new: data.users,
        existing: data.existUsers,
        withoutEmail: data.withoutEmailUsers,
        result: [],
      };
      this.checkedUsers = {
        withEmail: [...data.users],
        withoutEmail: [],
        result: [],
      };
    });
  };

  setIsFileLoading = (isLoading) => {
    this.isFileLoading = isLoading;
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };

  setSearchValue = (value) => {
    this.searchValue = value;
  };

  changeEmail = (key, email) => {
    this.users = {
      ...this.users,
      withoutEmail: this.users.withoutEmail.map((user) =>
        user.key === key ? { ...user, email } : user,
      ),
    };
  };

  toggleAccount = (account, checkedAccountType) => {
    this.checkedUsers = this.checkedUsers[checkedAccountType].some(
      (user) => user.key === account.key,
    )
      ? {
          ...this.checkedUsers,
          [checkedAccountType]: this.checkedUsers[checkedAccountType].filter(
            (user) => user.key !== account.key,
          ),
        }
      : {
          ...this.checkedUsers,
          [checkedAccountType]: [
            ...this.checkedUsers[checkedAccountType],
            account,
          ],
        };
  };

  toggleAllAccounts = (isChecked, accounts, checkedAccountType) => {
    this.checkedUsers = isChecked
      ? { ...this.checkedUsers, [checkedAccountType]: [...accounts] }
      : { ...this.checkedUsers, [checkedAccountType]: [] };
  };

  isAccountChecked = (key, checkedAccountType) =>
    this.checkedUsers[checkedAccountType].some((user) => user.key === key);

  clearCheckedAccounts = () => {
    runInAction(() => {
      // this.cancelMigration();
      this.users = {
        new: [],
        existing: [],
        withoutEmail: [],
        result: [],
      };
      this.checkedUsers = {
        withEmail: [],
        withoutEmail: [],
        result: [],
      };
      this.importOptions = {
        importGroups: true,
        importPersonalFiles: true,
        importSharedFiles: true,
        importSharedFolders: true,
        importCommonFiles: true,
        importProjectFiles: true,
      };
    });
  };

  changeUserType = (key, type) => {
    this.users = {
      ...this.users,
      result: this.users.result.map((user) =>
        user.key === key ? { ...user, userType: type } : user,
      ),
    };
  };

  changeGroupType = (type) => {
    const checkedKeys = this.checkedUsers.result.map(
      (checkedUser) => checkedUser.key,
    );
    this.users = {
      ...this.users,
      result: this.users.result.map((user) =>
        checkedKeys.includes(user.key) ? { ...user, userType: type } : user,
      ),
    };
  };

  // get numberOfCheckedAccounts() {
  //   return this.checkedAccounts.length;
  // }

  multipleFileUploading = async (files, setProgress) => {
    try {
      const location = combineUrl(
        window.location.origin,
        "migrationFileUpload.ashx",
      );
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
      const location = combineUrl(
        window.location.origin,
        "migrationFileUpload.ashx",
      );
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
        await uploadFile(
          location + `?Name=${file.name}`,
          requestsDataArray[chunk],
        );
        const progress = (chunk / chunks) * 100;
        setProgress(Math.ceil(progress));
        chunk++;
      }
    } catch (e) {
      console.error(e);
    }
  };

  setImportOptions = (value) => {
    this.importOptions = { ...this.importOptions, ...value };
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

  proceedFileMigration = (migratorName) => {
    const users = this.finalUsers.map((item) =>
      Object.assign(item, { shouldImport: true }),
    );

    return migrateFile({
      users,
      migratorName,
      ...this.importOptions,
    });
  };

  cancelMigration = () => {
    return migrationCancel();
  };

  getMigrationStatus = () => {
    return migrationStatus();
  };

  getMigrationLog = async () => {
    return migrationLog()
      .then((response) => {
        if (!response || !response.data) return null;
        return response.data;
      })
      .catch((error) => {
        console.log("Request Failed:", { error });
        return Promise.reject(error);
      });
  };

  sendWelcomeLetter = (data) => {
    return migrationFinish(data);
  };
}

export default ImportAccountsStore;
