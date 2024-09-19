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

import { getBackupProgress } from "@docspace/shared/api/portal";
import { makeAutoObservable } from "mobx";
import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeLocalStorage,
} from "../pages/PortalSettings/utils";
import { toastr } from "@docspace/shared/components/toast";
import { AutoBackupPeriod } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import {
  getSettingsThirdParty,
  uploadBackup,
} from "@docspace/shared/api/files";
import { connectedCloudsTypeTitleTranslation } from "../helpers/filesUtils.js";

const { EveryDayType, EveryWeekType } = AutoBackupPeriod;

/**
 * @typedef {import("@docspace/shared/types").ThirdPartyAccountType} ThirdPartyAccountType
 * @typedef {import("@docspace/shared/api/files/types").TConnectingStorage} TConnectingStorage
 */

class BackupStore {
  authStore = null;
  /** @type {import("./ThirdPartyStore").default} */
  thirdPartyStore = null;

  restoreResource = null;

  backupSchedule = {};
  backupStorage = {};

  defaultDay = "0";
  defaultHour = "12:00";
  defaultPeriodNumber = "0";
  defaultPeriodLabel = "Every day";
  defaultMaxCopiesNumber = "10";

  defaultWeekday = null;
  defaultWeekdayLabel = "";
  defaultStorageType = null;
  defaultFolderId = null;
  defaultMonthDay = "1";

  selectedDay = "0";
  selectedHour = "12:00";
  selectedPeriodNumber = "0";
  selectedPeriodLabel = "Every day";
  selectedMaxCopiesNumber = "10";

  selectedWeekday = null;
  selectedWeekdayLabel = "";
  selectedStorageType = null;
  selectedFolderId = null;
  selectedMonthDay = "1";

  selectedStorageId = null;
  defaultStorageId = null;

  thirdPartyStorage = [];
  commonThirdPartyList = [];

  preparationPortalDialogVisible = false;

  downloadingProgress = 100;

  temporaryLink = null;
  timerId = null;

  isThirdStorageChanged = false;

  formSettings = {};
  requiredFormSettings = {};
  defaultFormSettings = {};
  errorsFieldsBeforeSafe = {};

  selectedEnableSchedule = false;
  defaultEnableSchedule = false;

  storageRegions = [];
  /** @type {ThirdPartyAccountType | null} */
  selectedThirdPartyAccount = null;
  connectedThirdPartyAccount = null;
  /** @type {ThirdPartyAccountType[]} */
  accounts = [];
  connectedAccount = [];

  constructor(authStore, thirdPartyStore) {
    makeAutoObservable(this);

    this.authStore = authStore;
    this.thirdPartyStore = thirdPartyStore;
  }

  setConnectedThirdPartyAccount = (account) => {
    this.connectedThirdPartyAccount = account;
  };

  get isTheSameThirdPartyAccount() {
    if (this.connectedThirdPartyAccount && this.selectedThirdPartyAccount)
      return (
        this.connectedThirdPartyAccount.title ===
        this.selectedThirdPartyAccount.title
      );
    return true;
  }

  deleteSchedule = (weekdayArr) => {
    this.backupSchedule = null;

    this.defaultDay = "0";
    this.defaultHour = "12:00";
    this.defaultPeriodNumber = "0";
    this.defaultPeriodLabel = "Every day";
    this.defaultMaxCopiesNumber = "10";

    this.defaultStorageType = "0";
    this.defaultFolderId = null;
    this.defaultMonthDay = "1";

    this.selectedDay = "0";
    this.selectedHour = "12:00";
    this.selectedPeriodNumber = "0";
    this.selectedPeriodLabel = "Every day";
    this.selectedMaxCopiesNumber = "10";

    this.selectedStorageType = "0";
    this.selectedFolderId = null;
    this.selectedMonthDay = "1";

    this.selectedStorageId = null;
    this.defaultStorageId = null;

    this.defaultWeekday = weekdayArr[0].key;
    this.defaultWeekdayLabel = weekdayArr[0].label;

    this.selectedWeekdayLabel = this.defaultWeekdayLabel;
    this.selectedWeekday = this.defaultWeekday;

    this.selectedEnableSchedule = false;
    this.defaultEnableSchedule = false;

    this.setIsThirdStorageChanged(false);
  };
  get isChanged() {
    if (this.selectedHour !== this.defaultHour) {
      return true;
    }

    if (+this.selectedMaxCopiesNumber !== +this.defaultMaxCopiesNumber) {
      return true;
    }

    if (this.defaultPeriodNumber !== this.selectedPeriodNumber) {
      return true;
    }

    if (this.selectedStorageType !== this.defaultStorageType) {
      return true;
    }

    if (this.selectedPeriodNumber === "2") {
      if (this.selectedMonthDay !== this.defaultDay) {
        return true;
      }
    }

    if (this.selectedPeriodNumber === "1") {
      if (this.selectedWeekdayLabel !== this.defaultWeekdayLabel) {
        return true;
      }
    }

    if (this.selectedFolderId !== this.defaultFolderId) return true;

    if (this.selectedStorageId !== this.defaultStorageId) return true;

    if (this.selectedEnableSchedule !== this.defaultEnableSchedule) return true;

    return false;
  }

  setThirdPartyAccountsInfo = async (t) => {
    const [connectedAccount, providers] = await Promise.all([
      getSettingsThirdParty(),
      this.thirdPartyStore.fetchConnectingStorages(),
    ]);

    this.setConnectedThirdPartyAccount(connectedAccount);

    /** @type {ThirdPartyAccountType[]} */
    let accounts = [],
      /** @type {ThirdPartyAccountType} */
      selectedAccount = {};
    let index = 0;

    providers.map((item) => {
      const { account, isConnected } = this.getThirdPartyAccount(item, t);

      if (!account) return;

      accounts.push(account);

      if (isConnected) {
        selectedAccount = { ...accounts[index] };
      }
      index++;
    });

    accounts = accounts.sort((storage) => (storage.connected ? -1 : 1));

    this.setThirdPartyAccounts(accounts);

    console.log(selectedAccount, accounts);
    const connectedThirdPartyAccount = accounts.findLast((a) => a.connected);

    this.setSelectedThirdPartyAccount(
      Object.keys(selectedAccount).length !== 0
        ? selectedAccount
        : connectedThirdPartyAccount,
    );
  };

  /**
   * @typedef {Object} GetThirdPartyAccountReturnType
   * @property {ThirdPartyAccountType} account
   * @property {boolean} isConnected
   *
   * @param {TConnectingStorage} provider
   * @param {import("@docspace/shared/types").TTranslation} t
   * @returns {GetThirdPartyAccountReturnType}
   */
  getThirdPartyAccount = (provider, t) => {
    const serviceTitle = connectedCloudsTypeTitleTranslation(provider.name, t);
    const serviceLabel = provider.connected
      ? serviceTitle
      : `${serviceTitle} (${t("CreateEditRoomDialog:ActivationRequired")})`;

    const isConnected =
      this.connectedThirdPartyAccount?.providerKey === "WebDav"
        ? serviceTitle === this.connectedThirdPartyAccount?.title
        : provider.key === this.connectedThirdPartyAccount?.providerKey;

    const isDisabled = !provider.connected && !this.authStore.isAdmin;

    const account = {
      key: provider.name,
      label: serviceLabel,
      title: serviceLabel,
      provider_key: provider.key,
      ...(provider.clientId && {
        provider_link: provider.clientId,
      }),
      storageIsConnected: isConnected,
      connected: provider.connected,
      ...(isConnected && {
        provider_id: this.connectedThirdPartyAccount?.providerId,
        id: this.connectedThirdPartyAccount.id,
      }),
      disabled: isDisabled,
    };

    return { account, isConnected };
  };

  setThirdPartyAccounts = (accounts) => {
    this.accounts = accounts;
  };

  /**
   * @param {ThirdPartyAccountType | null} elem
   */
  setSelectedThirdPartyAccount = (elem) => {
    this.selectedThirdPartyAccount = elem;
  };

  toDefault = () => {
    this.selectedMonthlySchedule = this.defaultMonthlySchedule;
    this.selectedWeeklySchedule = this.defaultWeeklySchedule;
    this.selectedDailySchedule = this.defaultDailySchedule;
    this.selectedHour = this.defaultHour;
    this.selectedPeriodLabel = this.defaultPeriodLabel;
    this.selectedPeriodNumber = this.defaultPeriodNumber;
    this.selectedWeekdayLabel = this.defaultWeekdayLabel;
    this.selectedMaxCopiesNumber = this.defaultMaxCopiesNumber;
    this.selectedStorageType = this.defaultStorageType;
    this.selectedMonthDay = this.defaultMonthDay;
    this.selectedWeekday = this.defaultWeekday;
    this.selectedStorageId = this.defaultStorageId;
    this.selectedFolderId = this.defaultFolderId;

    this.selectedEnableSchedule = this.defaultEnableSchedule;

    if (this.defaultFormSettings) {
      this.setFormSettings({ ...this.defaultFormSettings });
    }

    this.setIsThirdStorageChanged(false);
  };

  setDefaultOptions = (t, periodObj, weekdayArr) => {
    if (this.backupSchedule) {
      const { storageType, cronParams, backupsStored, storageParams } =
        this.backupSchedule;

      const { folderId, module } = storageParams;
      const { period, day, hour } = cronParams;

      let defaultFormSettings = {};
      for (let variable in storageParams) {
        if (variable === "module") continue;
        defaultFormSettings[variable] = storageParams[variable];
      }
      if (defaultFormSettings) {
        this.setFormSettings({ ...defaultFormSettings });
        this.setDefaultFormSettings({ ...defaultFormSettings });
        this.isThirdStorageChanged && this.setIsThirdStorageChanged(false);
      }

      this.defaultEnableSchedule = true;
      this.selectedEnableSchedule = true;
      this.defaultDay = `${day}`;
      this.defaultHour = `${hour}:00`;
      this.defaultPeriodNumber = `${period}`;
      this.defaultMaxCopiesNumber = `${backupsStored}`;
      this.defaultStorageType = `${storageType}`;
      this.defaultFolderId = `${folderId}`;
      if (module) this.defaultStorageId = `${module}`;

      this.selectedDay = this.defaultDay;
      this.selectedHour = this.defaultHour;
      this.selectedPeriodNumber = this.defaultPeriodNumber;
      this.selectedMaxCopiesNumber = this.defaultMaxCopiesNumber;
      this.selectedStorageType = this.defaultStorageType;
      this.selectedFolderId = this.defaultFolderId;

      this.defaultPeriodLabel = periodObj[+this.defaultPeriodNumber].label;
      this.selectedPeriodLabel = this.defaultPeriodLabel;
      if (module) this.selectedStorageId = this.defaultStorageId;

      this.defaultMonthDay =
        +this.defaultPeriodNumber === +EveryWeekType ||
        +this.defaultPeriodNumber === +EveryDayType
          ? "1"
          : this.defaultDay;

      this.selectedMonthDay = this.defaultMonthDay;

      if (+this.defaultPeriodNumber === +EveryWeekType) {
        let weekDay;

        if (this.defaultDay) {
          for (let i = 0; i < weekdayArr.length; i++) {
            if (+weekdayArr[i].key === +this.defaultDay) {
              weekDay = i;
            }
          }
        }

        this.defaultWeekdayLabel =
          weekdayArr[this.defaultDay ? weekDay : 0].label;
        this.selectedWeekdayLabel = this.defaultWeekdayLabel;

        this.defaultWeekday = this.defaultDay;
        this.selectedWeekday = this.defaultWeekday;
      } else {
        this.defaultWeekday = weekdayArr[0].key;
        this.defaultWeekdayLabel = weekdayArr[0].label;

        this.selectedWeekdayLabel = this.defaultWeekdayLabel;
        this.selectedWeekday = this.defaultWeekday;
      }
    } else {
      this.defaultPeriodLabel = periodObj[+this.defaultPeriodNumber].label;
      this.selectedPeriodLabel = this.defaultPeriodLabel;

      this.defaultWeekday = weekdayArr[0].key;
      this.defaultWeekdayLabel = weekdayArr[0].label;

      this.selectedWeekdayLabel = this.defaultWeekdayLabel;
      this.selectedWeekday = this.defaultWeekday;
    }

    this.setIsThirdStorageChanged(false);
  };

  setThirdPartyStorage = (list) => {
    this.thirdPartyStorage = list;
  };

  setPreparationPortalDialogVisible = (visible) => {
    this.preparationPortalDialogVisible = visible;
  };

  setBackupSchedule = (backupSchedule) => {
    this.backupSchedule = backupSchedule;
  };

  setCommonThirdPartyList = (list) => {
    this.commonThirdPartyList = list;
  };
  setPeriod = (options) => {
    const key = options.key;
    const label = options.label;

    this.selectedPeriodLabel = label;
    this.selectedPeriodNumber = `${key}`;
  };

  setWeekday = (options) => {
    const key = options.key;
    const label = options.label;

    this.selectedWeekday = key;
    this.selectedWeekdayLabel = label;
  };

  setMonthNumber = (options) => {
    const key = options.key;
    const label = options.label;

    this.selectedMonthDay = label;
  };

  setTime = (options) => {
    const key = options.key;
    const label = options.label;

    this.selectedHour = label;
  };

  setMaxCopies = (options) => {
    const key = options.key;
    this.selectedMaxCopiesNumber = key;
  };

  seStorageType = (type) => {
    this.selectedStorageType = `${type}`;
  };

  setSelectedFolder = (folderId) => {
    if (folderId !== this.selectedFolderId) this.selectedFolderId = folderId;
  };

  setStorageId = (selectedStorage) => {
    this.selectedStorageId = selectedStorage;
  };

  clearLocalStorage = () => {
    getFromLocalStorage("LocalCopyStorageType") &&
      removeLocalStorage("LocalCopyStorageType");

    getFromLocalStorage("LocalCopyFolder") &&
      removeLocalStorage("LocalCopyFolder");

    getFromLocalStorage("LocalCopyStorage") &&
      removeLocalStorage("LocalCopyStorage");

    getFromLocalStorage("LocalCopyThirdPartyStorageType") &&
      removeLocalStorage("LocalCopyThirdPartyStorageType");

    getFromLocalStorage("LocalCopyThirdPartyStorageValues") &&
      removeLocalStorage("LocalCopyThirdPartyStorageValues");
  };

  saveToLocalStorage = (
    isStorage,
    moduleName,
    selectedId,
    selectedStorageTitle,
  ) => {
    saveToLocalStorage("LocalCopyStorageType", moduleName);

    if (isStorage) {
      saveToLocalStorage("LocalCopyStorage", `${selectedId}`);
      saveToLocalStorage(
        "LocalCopyThirdPartyStorageType",
        selectedStorageTitle,
      );
      saveToLocalStorage("LocalCopyThirdPartyStorageValues", this.formSettings);
    } else {
      saveToLocalStorage("LocalCopyFolder", `${selectedId}`);
    }
  };

  getProgress = async (t) => {
    try {
      const response = await getBackupProgress();

      if (response) {
        const { progress, link, error } = response;
        if (!error) {
          this.downloadingProgress = progress;

          if (link && link.slice(0, 1) === "/") {
            this.temporaryLink = link;
          }

          if (progress !== 100) {
            this.getIntervalProgress(t);
          } else {
            //this.clearLocalStorage();
          }
        } else {
          this.downloadingProgress = 100;
          clearInterval(this.timerId);
          //this.clearLocalStorage();
        }
      }
    } catch (e) {
      toastr.error(t("BackupCreatedError"));
      // this.clearLocalStorage();
    }
  };
  getIntervalProgress = (t) => {
    if (this.timerId) {
      return;
    }

    let isWaitRequest = false;
    this.timerId = setInterval(async () => {
      try {
        if (isWaitRequest) {
          return;
        }

        isWaitRequest = true;

        const response = await getBackupProgress();

        if (response) {
          const { progress, link, error } = response;

          if (error.length > 0 && progress !== 100) {
            clearInterval(timerId);
            this.timerId && toastr.error(t("BackupCreatedError"));
            this.timerId = null;
            //this.clearLocalStorage();
            this.downloadingProgress = 100;
            return;
          }

          if (progress > 0 && progress !== this.downloadingProgress) {
            this.downloadingProgress = progress;
          }

          if (progress === 100) {
            clearInterval(this.timerId);
            //this.clearLocalStorage();

            if (link && link.slice(0, 1) === "/") {
              this.temporaryLink = link;
            }

            this.timerId && toastr.success(t("BackupCreatedSuccess"));
            this.timerId = null;

            return;
          }
        } else {
          this.timerId && toastr.error(t("BackupCreatedError"));
          this.downloadingProgress = 100;
          clearInterval(this.timerId);
          // this.clearLocalStorage();
          this.timerId = null;
          return;
        }

        isWaitRequest = false;
      } catch (e) {
        clearInterval(this.timerId);
        // this.clearLocalStorage();
        this.downloadingProgress = 100;
        this.timerId && toastr.error(t("BackupCreatedError"));
        this.timerId = null;
      }
    }, 1000);
  };

  clearProgressInterval = () => {
    this.timerId && clearInterval(this.timerId);
    this.timerId = null;
  };

  setDownloadingProgress = (progress) => {
    this.downloadingProgress = progress;
  };

  setTemporaryLink = (link) => {
    this.temporaryLink = link;
  };

  setFormSettings = (obj) => {
    this.formSettings = obj;
  };

  addValueInFormSettings = (name, value) => {
    this.setFormSettings({ ...this.formSettings, [name]: value });
  };

  deleteValueFormSetting = (key) => {
    delete this.formSettings[key];
  };
  getStorageParams = (
    isCheckedThirdPartyStorage,
    selectedFolderId,
    selectedStorageId,
  ) => {
    let storageParams = [
      {
        key: isCheckedThirdPartyStorage ? "module" : "folderId",
        value: isCheckedThirdPartyStorage
          ? selectedStorageId
          : selectedFolderId,
      },
    ];

    if (isCheckedThirdPartyStorage) {
      const arraySettings = Object.entries(this.formSettings);

      for (let i = 0; i < arraySettings.length; i++) {
        const tmpObj = {
          key: arraySettings[i][0],
          value: arraySettings[i][1],
        };

        storageParams.push(tmpObj);
      }
    }

    return storageParams;
  };

  setRequiredFormSettings = (array) => {
    this.requiredFormSettings = array;
  };

  setStorageRegions = (regions) => {
    this.storageRegions = regions;
  };
  setDefaultFormSettings = (obj) => {
    this.defaultFormSettings = obj;
  };

  get isValidForm() {
    if (Object.keys(this.requiredFormSettings).length == 0) return;

    for (let key of this.requiredFormSettings) {
      const elem = this.formSettings[key];
      if (!elem) return false;
      if (!elem.trim()) return false;
    }
    return true;
  }
  isFormReady = () => {
    let errors = {};
    let firstError = false;

    for (let key of this.requiredFormSettings) {
      const elem = this.formSettings[key];

      errors[key] = !elem.trim();

      if (!elem.trim() && !firstError) {
        firstError = true;
      }
    }
    this.setErrorsFormFields(errors);

    return !firstError;
  };

  setErrorsFormFields = (errors) => {
    this.errorsFieldsBeforeSafe = errors;
  };
  setCompletedFormFields = (values, module) => {
    let formSettingsTemp = {};

    if (module && module === this.defaultStorageId) {
      this.setFormSettings({ ...this.defaultFormSettings });
      return;
    }

    for (const [key, value] of Object.entries(values)) {
      formSettingsTemp[key] = value;
    }

    this.setFormSettings({ ...formSettingsTemp });
    this.setErrorsFormFields({});
  };

  setIsThirdStorageChanged = (changed) => {
    if (changed !== this.isThirdStorageChanged) {
      this.isThirdStorageChanged = changed;
    }
  };

  setSelectedEnableSchedule = () => {
    const isEnable = this.selectedEnableSchedule;
    this.selectedEnableSchedule = !isEnable;
  };

  convertServiceName = (serviceName) => {
    //Docusign, OneDrive, Wordpress
    switch (serviceName) {
      case "GoogleDrive":
        return "google";
      case "Box":
        return "box";
      case "DropboxV2":
        return "dropbox";
      case "OneDrive":
        return "onedrive";
      default:
        return "";
    }
  };

  setRestoreResource = (value) => {
    this.restoreResource = value;
  };

  setChunkUploadSize = (chunkUploadSize) => {
    this.chunkUploadSize = chunkUploadSize;
  };

  uploadFileChunks = async (requestsDataArray, url) => {
    const length = requestsDataArray.length;
    let res;

    for (let index = 0; index < length; index++) {
      res = await uploadBackup(
        combineUrl(window.ClientConfig?.proxy?.url, config.homepage, url),
        requestsDataArray[index],
      );

      if (!res) return false;

      if (res.data.Message || !res.data.Success) return res;
    }

    return res;
  };
  uploadLocalFile = async () => {
    try {
      const url = "/backupFileUpload.ashx";

      const getExst = (fileName) => {
        if (fileName.endsWith("." + "tar.gz")) {
          return "tar.gz";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
      };

      const extension = getExst(this.restoreResource.name);

      const res = await uploadBackup(
        combineUrl(
          window.ClientConfig?.proxy?.url,
          config.homepage,
          `${url}?init=true&totalSize=${this.restoreResource.size}&extension=${extension}`,
        ),
      );

      if (!res) return false;

      if (res.data.Message || !res.data.Success) return res;

      const chunkUploadSize = res.data.ChunkSize;

      const chunks = Math.ceil(
        this.restoreResource.size / chunkUploadSize,
        chunkUploadSize,
      );

      const requestsDataArray = [];

      let chunk = 0;

      while (chunk < chunks) {
        const offset = chunk * chunkUploadSize;
        const formData = new FormData();
        formData.append(
          "file",
          this.restoreResource.slice(offset, offset + chunkUploadSize),
        );

        requestsDataArray.push(formData);
        chunk++;
      }

      return await this.uploadFileChunks(requestsDataArray, url);
    } catch (e) {
      toastr.error(e);
      return null;
    }
  };
}

export default BackupStore;
