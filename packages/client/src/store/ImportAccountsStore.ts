// (c) Copyright Ascensio System SIA 2009-2025
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
import { toastr } from "@docspace/shared/components/toast";
import { makeAutoObservable, runInAction } from "mobx";
import {
  migrationList,
  initMigration,
  migrationStatus,
  migrationCancel,
  migrationFinish,
  migrationLog,
  migrateFile,
  migrationClear,
} from "@docspace/shared/api/settings";
import {
  TWorkspaceService,
  TSendWelcomeEmailData,
  TEnhancedMigrationUser,
  TMigrationStatusResult,
} from "@docspace/shared/api/settings/types";

import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { parseQuota } from "SRC_DIR/pages/PortalSettings/utils/parseQuota";
import { getUserByEmail } from "@docspace/shared/api/people";

type TUsers = {
  new: TEnhancedMigrationUser[];
  existing: TEnhancedMigrationUser[];
  withoutEmail: TEnhancedMigrationUser[];
  result: TEnhancedMigrationUser[];
};

type TCheckedUsers = {
  withEmail: TEnhancedMigrationUser[];
  withoutEmail: TEnhancedMigrationUser[];
  result: TEnhancedMigrationUser[];
};

type CheckedAccountTypes = "withEmail" | "withoutEmail" | "result";

type LoadingState = "none" | "upload" | "proceed" | "done";

type TMigrationPhase = "" | "setup" | "migrating" | "complete";

class ImportAccountsStore {
  private currentQuotaStore: CurrentQuotasStore | null = null;

  services: TWorkspaceService[] = [];

  users: TUsers = {
    new: [],
    existing: [],
    withoutEmail: [],
    result: [],
  };

  checkedUsers: TCheckedUsers = {
    withEmail: [],
    withoutEmail: [],
    result: [],
  };

  UserTypes = {
    PortalAdmin: "DocSpaceAdmin",
    RoomAdmin: "RoomAdmin",
    User: "User",
  };

  fileLoadingStatus: LoadingState = "none";

  isLoading = false;

  isMigrationInit = false;

  searchValue = "";

  step = 1;

  workspace: TWorkspaceService | "" = "";

  migratingWorkspace: TWorkspaceService | "" = "";

  files: string[] = [];

  importOptions = {
    importGroups: true,
    importPersonalFiles: true,
    importSharedFiles: true,
    importSharedFolders: true,
    importCommonFiles: true,
    importProjectFiles: true,
  };

  migrationPhase: TMigrationPhase = "";

  constructor(currentQuotaStoreConst: CurrentQuotasStore) {
    this.currentQuotaStore = currentQuotaStoreConst;
    makeAutoObservable(this);
  }

  get withEmailUsers() {
    return [...this.users.existing, ...this.users.new];
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
        ) &&
        !this.users.withoutEmail.some(
          (withoutEmailUser) =>
            !!withoutEmailUser.email &&
            withoutEmailUser.isDuplicate &&
            withoutEmailUser.key === user.key,
        ),
    );
  }

  get quota() {
    return parseQuota(this.currentQuotaStore!.quotaCharacteristics[1]);
  }

  get totalUsedUsers() {
    const totalPaidUsers =
      this.quota.used +
      this.finalUsers.filter((user) => user.userType !== "User").length;

    return totalPaidUsers;
  }

  get numberOfSelectedUsers() {
    return (
      this.checkedUsers.withEmail.length + this.checkedUsers.withoutEmail.length
    );
  }

  get totalUsers() {
    return this.withEmailUsers.length + this.users.withoutEmail.length;
  }

  setStep = (step: number) => {
    this.step = step;
  };

  incrementStep = () => {
    this.step += 1;
  };

  decrementStep = () => {
    this.step -= 1;
  };

  setMigrationPhase = (phase: TMigrationPhase) => {
    this.migrationPhase = phase;
  };

  setWorkspace = (workspace: TWorkspaceService | "") => {
    this.workspace = workspace;
  };

  setMigratingWorkspace = (workspace: TWorkspaceService | "") => {
    this.migratingWorkspace = workspace;
  };

  setFiles = (files: string[]) => {
    this.files = files;
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

  setUsers = (data: TMigrationStatusResult) => {
    const newUsers = data.users.map((user) => ({
      ...user,
      isDuplicate: false,
    }));

    const existingUsers = data.existUsers.map((user) => ({
      ...user,
      isDuplicate: true,
    }));

    const withoutEmailUsers = data.withoutEmailUsers.map((user) => ({
      ...user,
      isDuplicate: false,
    }));

    runInAction(() => {
      this.users = {
        new: newUsers,
        existing: existingUsers,
        withoutEmail: withoutEmailUsers,
        result: [],
      };
      this.checkedUsers = {
        withEmail: newUsers,
        withoutEmail: [],
        result: [],
      };
    });
  };

  setLoadingStatus = (status: LoadingState) => {
    this.fileLoadingStatus = status;
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setIsMigrationInit = (isMigrationInit: boolean) => {
    this.isMigrationInit = isMigrationInit;
  };

  setSearchValue = (value: string) => {
    this.searchValue = value;
  };

  changeEmail = (key: string, email: string) => {
    getUserByEmail(email)
      .then((response) => {
        console.log(`getUserByEmail(email='${email}') user found:`, {
          response,
        });

        runInAction(() => {
          this.users = {
            ...this.users,
            withoutEmail: this.users.withoutEmail.map((user) =>
              user.key === key ? { ...user, email, isDuplicate: true } : user,
            ),
          };
        });

        console.log("changeEmail", {
          users: this.users,
          checkedUsers: this.checkedUsers,
        });
      })
      .catch((error) => {
        console.log(
          `getUserByEmail(email='${email}') ${error.response.status !== 404 ? "search user failed" : "user not found"} :`,
          {
            error,
          },
        );

        runInAction(() => {
          this.users = {
            ...this.users,
            withoutEmail: this.users.withoutEmail.map((user) =>
              user.key === key ? { ...user, email } : user,
            ),
          };
        });
      });
  };

  toggleAccount = (
    account: TEnhancedMigrationUser,
    checkedAccountType: CheckedAccountTypes,
  ) => {
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

  toggleAllAccounts = (
    isChecked: boolean,
    accounts: TEnhancedMigrationUser[],
    checkedAccountType: CheckedAccountTypes,
  ) => {
    this.checkedUsers = isChecked
      ? { ...this.checkedUsers, [checkedAccountType]: [...accounts] }
      : { ...this.checkedUsers, [checkedAccountType]: [] };
  };

  isAccountChecked = (key: string, checkedAccountType: CheckedAccountTypes) =>
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

  changeUserType = (key: string, type: string) => {
    this.users = {
      ...this.users,
      result: this.users.result.map((user) =>
        user.key === key ? { ...user, userType: type } : user,
      ),
    };
  };

  changeGroupType = (type: string) => {
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

  uploadFiles = async (
    filesData: File | File[],
    setProgress: (progress: number) => void,
    isAbort: React.RefObject<boolean>,
    setChunk: React.Dispatch<React.SetStateAction<number>>,
    startChunk: number,
    setChunkSize: React.Dispatch<React.SetStateAction<number>>,
    chunkSize: number,
  ) => {
    let chunk = 0;
    const location = combineUrl(
      window.location.origin,
      "migrationFileUpload.ashx",
    );

    try {
      let chunkUploadSize = chunkSize;

      if (!chunkSize) {
        const res = await axios.post<{
          Success: boolean;
          ChunkSize: number;
          Message: string;
        }>(`${location}?Init=${startChunk === 0}`);

        if (!res.data.Success) {
          toastr.error(res.data.Message);
          throw new Error(res.data.Message);
        }

        chunkUploadSize = res.data.ChunkSize;
        setChunkSize(chunkUploadSize);
      }

      if (!chunkUploadSize || isAbort.current) return;

      const requestsDataArray: { formData: FormData; fileName: string }[] = [];
      const files = Array.isArray(filesData) ? filesData : [filesData];

      const chunksNumber = files
        .map((file) => Math.ceil(file.size / chunkUploadSize))
        .reduce((curr, next) => curr + next, 0);

      files.forEach((file) => {
        const chunks = Math.ceil(file.size / chunkUploadSize);
        let chunkCounter = 0;

        while (chunkCounter < chunks) {
          const offset = chunkCounter * chunkUploadSize;
          const formData = new FormData();
          formData.append("file", file.slice(offset, offset + chunkUploadSize));
          requestsDataArray.push({ formData, fileName: file.name });
          chunkCounter += 1;
        }
      });

      chunk = startChunk || 0;

      while (
        chunk < chunksNumber &&
        (this.fileLoadingStatus === "upload" ||
          this.fileLoadingStatus === "proceed")
      ) {
        if (isAbort.current) return;
        // eslint-disable-next-line no-await-in-loop
        await uploadFile(
          `${location}?Name=${requestsDataArray[chunk].fileName}`,
          requestsDataArray[chunk].formData,
        );
        const progress = (chunk / chunksNumber) * 100;
        setProgress(Math.ceil(progress));
        chunk += 1;
      }
    } catch (error) {
      setChunk(chunk);
      throw new Error(error as string);
    }
  };

  setImportOptions = (value: Record<string, boolean>) => {
    this.importOptions = { ...this.importOptions, ...value };
  };

  setServices = (services: TWorkspaceService[]) => {
    this.services = services;
  };

  // eslint-disable-next-line class-methods-use-this
  getMigrationList = () => {
    return migrationList();
  };

  // eslint-disable-next-line class-methods-use-this
  initMigrations = (name: TWorkspaceService) => {
    return initMigration(name);
  };

  proceedFileMigration = (migratorName: TWorkspaceService) => {
    const users = this.finalUsers.map((item) =>
      Object.assign(item, { shouldImport: true }),
    );

    return migrateFile({
      users,
      migratorName,
      ...this.importOptions,
    });
  };

  // eslint-disable-next-line class-methods-use-this
  cancelMigration = () => {
    return migrationCancel();
  };

  // eslint-disable-next-line class-methods-use-this
  clearMigration = () => {
    return migrationClear();
  };

  // eslint-disable-next-line class-methods-use-this
  getMigrationStatus = () => {
    return migrationStatus();
  };

  // eslint-disable-next-line class-methods-use-this
  getMigrationLog = () => {
    try {
      return migrationLog();
    } catch (error) {
      console.log("Request Failed:", { error });
      return Promise.reject(error);
    }
  };

  // eslint-disable-next-line class-methods-use-this
  sendWelcomeLetter = (data: TSendWelcomeEmailData) => {
    return migrationFinish(data);
  };
}

export default ImportAccountsStore;
