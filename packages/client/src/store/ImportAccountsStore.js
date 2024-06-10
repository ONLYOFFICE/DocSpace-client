// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
  migrationClear,
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
    DocSpaceAdmin: "PortalAdmin",
    RoomAdmin: "RoomAdmin",
    User: "Collaborator",
  };

  isFileLoading = false;
  isLoading = false;
  isMigrationInit = false;

  searchValue = "";

  importOptions = {
    importGroups: true,
    importPersonalFiles: true,
    importSharedFiles: true,
    importSharedFolders: true,
    importCommonFiles: true,
    importProjectFiles: true,
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
    return this.users.result;
  }

  get areCheckedUsersEmpty() {
    return (
      this.checkedUsers.withEmail.length +
        this.checkedUsers.withoutEmail.length ===
      0
    );
  }

  get filteredUsers() {
    return this.users.result.filter(
      (user) =>
        !this.users.existing.some(
          (existingUser) => existingUser.key === user.key,
        ),
    );
  }

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

  setIsMigrationInit = (isMigrationInit) => {
    this.isMigrationInit = isMigrationInit;
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

  multipleFileUploading = async (files, setProgress, isAbort) => {
    try {
      const location = combineUrl(
        window.location.origin,
        "migrationFileUpload.ashx",
      );
      const requestsDataArray = [];

      const res = await axios.post(location + "?Init=true");
      const chunkUploadSize = res.data.ChunkSize;

      if (isAbort.current) return;

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
        if (isAbort.current) return;
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

  singleFileUploading = async (file, setProgress, isAbort) => {
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

      if (isAbort.current) return;

      while (chunk < chunks) {
        const offset = chunk * chunkUploadSize;
        const formData = new FormData();
        formData.append("file", file.slice(offset, offset + chunkUploadSize));
        requestsDataArray.push(formData);
        chunk++;
      }

      chunk = 0;
      while (chunk < chunks && this.isFileLoading) {
        if (isAbort.current) return;
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

  clearMigration = () => {
    return migrationClear();
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
