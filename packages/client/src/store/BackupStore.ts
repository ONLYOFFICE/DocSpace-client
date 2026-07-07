/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getBackupProgress } from "@docspace/shared/api/portal";
import { makeAutoObservable } from "mobx";
import axios, { type AxiosResponse } from "axios";
import { toastr } from "@docspace/ui-kit/components/toast";
import { AutoBackupPeriod } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import {
  getSettingsThirdParty,
  uploadBackup,
} from "@docspace/shared/api/files";
import { getErrorInfo, isManagement } from "@docspace/shared/utils/common";

import type { ReactNode } from "react";
import type {
  TBackupProgress,
  TBackupSchedule,
} from "@docspace/shared/api/portal/types";
import type {
  TConnectingStorage,
  TUploadBackup,
} from "@docspace/shared/api/files/types";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";
import type {
  ConnectedThirdPartyAccountType,
  Nullable,
  Option,
  SelectedStorageType,
  StorageRegionsType,
  ThirdPartyAccountType,
  TTranslation,
  TWeekdaysLabel,
} from "@docspace/shared/types";
import type { TOption } from "@docspace/ui-kit/components/combobox";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeLocalStorage,
} from "../pages/PortalSettings/utils";
import { connectedCloudsTypeTitleTranslation } from "../helpers/filesUtils";
import type { ThirdPartyStore } from "./ThirdPartyStore";
import type PaymentStore from "./PaymentStore";
import type { TCommonThirdParty } from "./SettingsSetupStore";

async function* uploadBackupFile(requestsDataArray: FormData[], url: string) {
  const length = requestsDataArray.length;
  for (let index = 0; index < length; index++) {
    yield uploadBackup(url, requestsDataArray[index]);
  }
}

class BackupStore {
  // `null!` keeps the original runtime field initializer (null) while the
  // constructor immediately assigns the real store.
  authStore: AuthStore = null!;

  currentQuotaStore: CurrentQuotasStore = null!;

  currentTariffStatusStore: CurrentTariffStatusStore = null!;

  settingsStore: SettingsStore = null!;

  paymentStore: PaymentStore = null!;

  thirdPartyStore: ThirdPartyStore = null!;

  restoreResource: Nullable<File | number | string> = null;

  // initialized as `{}` in the original JS even though the
  // schedule shape is TBackupSchedule; consumers set a real schedule (or
  // deleteSchedule sets null) before the fields are read.
  backupSchedule: Nullable<TBackupSchedule> = {} as TBackupSchedule;

  backupStorage: Record<string, unknown> = {};

  defaultDay = "0";

  defaultHour = "12:00";

  defaultPeriodNumber = "0";

  defaultPeriodLabel = "Every day";

  defaultMaxCopiesNumber = "10";

  defaultWeekday: Nullable<string> = null;

  defaultWeekdayLabel = "";

  defaultStorageType: Nullable<string> = null;

  defaultFolderId: Nullable<string | number> = null;

  defaultMonthDay = "1";

  selectedDay = "0";

  selectedHour = "12:00";

  selectedPeriodNumber = "0";

  selectedPeriodLabel = "Every day";

  selectedMaxCopiesNumber = "10";

  selectedWeekday: Nullable<string> = null;

  selectedWeekdayLabel = "";

  selectedStorageType: Nullable<string> = null;

  selectedFolderId: Nullable<string | number> = null;

  selectedMonthDay = "1";

  selectedStorageId: Nullable<string> = null;

  defaultStorageId: Nullable<string> = null;

  thirdPartyStorage: SelectedStorageType[] = [];

  commonThirdPartyList: TCommonThirdParty[] = [];

  preparationPortalDialogVisible = false;

  downloadingProgress = 100;

  errorInformation = "";

  temporaryLink: Nullable<string> = null;

  timerId: Nullable<number> = null;

  isThirdStorageChanged = false;

  formSettings: Record<string, string> = {};

  // initialized as `{}` in the original JS, but every write
  // (setRequiredFormSettings) stores a string[] and isValidForm calls
  // `.some()` on it. Typed as string[] with a cast to keep the runtime
  // default untouched.
  requiredFormSettings: string[] = {} as unknown as string[];

  defaultFormSettings: Record<string, string> = {};

  errorsFieldsBeforeSafe: Record<string, boolean> = {};

  selectedEnableSchedule = false;

  defaultEnableSchedule = false;

  storageRegions: StorageRegionsType[] = [];

  selectedThirdPartyAccount: Nullable<ThirdPartyAccountType> = null;

  connectedThirdPartyAccount: Nullable<ConnectedThirdPartyAccountType> = null;

  accounts: ThirdPartyAccountType[] = [];

  connectedAccount: unknown[] = [];

  isBackupProgressVisible = false;

  backupProgressError = "";

  backupProgressWarning = "";

  backupsCount: Nullable<number> = null;

  isInited = false;

  isEmptyContentBeforeLoader = true;

  isInitialError = false;

  // `chunkUploadSize` was never declared as a class field in
  // the original JS (created on first setChunkUploadSize call, so it is not
  // observable). `declare` keeps that runtime shape; setChunkUploadSize is
  // never called by consumers — candidate for removal.
  declare chunkUploadSize?: number;

  constructor(
    authStore: AuthStore,
    thirdPartyStore: ThirdPartyStore,
    currentQuotaStore: CurrentQuotasStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
    settingsStore: SettingsStore,
    paymentStore: PaymentStore,
  ) {
    makeAutoObservable(this);

    this.authStore = authStore;
    this.thirdPartyStore = thirdPartyStore;
    this.currentQuotaStore = currentQuotaStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.settingsStore = settingsStore;
    this.paymentStore = paymentStore;
  }

  setIsInitialError = (isInitialError: boolean) => {
    this.isInitialError = isInitialError;
  };

  setIsEmptyContentBeforeLoader = (isEmptyContentBeforeLoader: boolean) => {
    this.isEmptyContentBeforeLoader = isEmptyContentBeforeLoader;
  };

  setBackupsCount = (counts?: Nullable<number>) => {
    if (counts === undefined || counts === null) return;

    this.backupsCount = counts;
  };

  setIsInited = (isInited: boolean) => {
    this.isInited = isInited;
  };

  get backupPageEnable() {
    const { maxFreeBackups, isBackupPaid } = this.currentQuotaStore;
    const { isNotPaidPeriod } = this.currentTariffStatusStore;
    const { isBackupServiceOn } = this.paymentStore;

    if (!isBackupPaid || isNotPaidPeriod) return true;

    if (maxFreeBackups === 0) return isBackupServiceOn;

    // `?? 0` mirrors the original `null >= n` coercion (null -> 0).
    const backupsCount = this.backupsCount ?? 0;

    if (backupsCount >= maxFreeBackups) return isBackupServiceOn;

    return true;
  }

  setConnectedThirdPartyAccount = (
    account: Nullable<ConnectedThirdPartyAccountType> | undefined,
  ) => {
    this.connectedThirdPartyAccount =
      account as Nullable<ConnectedThirdPartyAccountType>;
  };

  get isTheSameThirdPartyAccount() {
    if (this.connectedThirdPartyAccount && this.selectedThirdPartyAccount)
      return (
        this.connectedThirdPartyAccount.title ===
        this.selectedThirdPartyAccount.title
      );
    return true;
  }

  deleteSchedule = (weekdayArr: TWeekdaysLabel[]) => {
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

  setThirdPartyAccountsInfo = async (t: TTranslation) => {
    const [connectedAccount, providers] = await Promise.all([
      getSettingsThirdParty(),
      this.thirdPartyStore.fetchConnectingStorages("excludewebdav=true"),
    ]);

    this.setConnectedThirdPartyAccount(connectedAccount);

    let accounts: ThirdPartyAccountType[] = [];
    let selectedAccount = {} as ThirdPartyAccountType;

    providers.forEach((item) => {
      const { account, isConnected } = this.getThirdPartyAccount(item, t);

      if (!account) return true; // continue

      accounts.push(account);

      if (isConnected) {
        selectedAccount = { ...account };
      }
    });

    accounts = accounts.sort((storage) => (storage.connected ? -1 : 1));

    this.setThirdPartyAccounts(accounts);

    const connectedThirdPartyAccount = accounts.findLast((a) => a.connected);

    this.setSelectedThirdPartyAccount(
      Object.keys(selectedAccount).length !== 0
        ? selectedAccount
        : connectedThirdPartyAccount,
    );
  };

  getThirdPartyAccount = (
    provider: TConnectingStorage,
    t: TTranslation,
  ): { account: ThirdPartyAccountType; isConnected: boolean } => {
    const serviceTitle = connectedCloudsTypeTitleTranslation(provider.name, t);
    const serviceLabel = provider.connected
      ? serviceTitle
      : `${serviceTitle} (${t("Common:ActivationRequired")})`;

    // const isConnected =
    //   this.connectedThirdPartyAccount?.providerKey === "WebDav"
    //     ? serviceTitle === this.connectedThirdPartyAccount?.title
    //     : provider.name === this.connectedThirdPartyAccount?.title;
    const isConnected =
      provider.name === this.connectedThirdPartyAccount?.providerKey ||
      provider.name === this.connectedThirdPartyAccount?.title;

    const isDisabled = !provider.connected && !this.authStore.isAdmin;

    const account: ThirdPartyAccountType = {
      name: provider.name,
      label: serviceLabel,
      title: serviceLabel,
      provider_key: provider.key !== "WebDav" ? provider.key : provider.name,
      key: provider.key,
      ...(provider.clientId && {
        provider_link: provider.clientId,
      }),
      storageIsConnected: isConnected,
      connected: provider.connected,
      ...(isConnected && {
        provider_id: this.connectedThirdPartyAccount?.providerId,
        // `!` — isConnected can only be true when connectedThirdPartyAccount
        // is set (see the comparisons above), matching the original runtime.
        id: this.connectedThirdPartyAccount!.id,
      }),
      disabled: isDisabled,
    };

    return { account, isConnected };
  };

  setThirdPartyAccounts = (accounts: ThirdPartyAccountType[]) => {
    this.accounts = accounts;
  };

  // the setter historically accepts Partial<…> (old JSDoc) or
  // undefined while the field is Nullable<ThirdPartyAccountType>; the cast
  // mirrors that pre-existing mismatch without changing runtime.
  setSelectedThirdPartyAccount = (
    elem: Nullable<Partial<ThirdPartyAccountType>> | undefined,
  ) => {
    this.selectedThirdPartyAccount = elem as Nullable<ThirdPartyAccountType>;
  };

  toDefault = () => {
    // this.selectedMonthlySchedule = this.defaultMonthlySchedule;
    // this.selectedWeeklySchedule = this.defaultWeeklySchedule;
    // this.selectedDailySchedule = this.defaultDailySchedule;

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

  // params are TOption[] to match the shared
  // AutomaticBackupProps contract; TOption.key is string | number and
  // TOption.label is ReactNode, so the assignments below cast to string —
  // backup period/weekday options always carry string labels at runtime.
  setDefaultOptions = (periodObj: TOption[], weekdayArr: TOption[]) => {
    if (this.backupSchedule) {
      const { storageType, cronParams, backupsStored, storageParams } =
        this.backupSchedule;

      const { folderId, module } = storageParams;
      const { period, day, hour } = cronParams;

      const defaultFormSettings: Record<string, string> = {};
      Object.keys(storageParams).forEach((variable) => {
        if (variable !== "module") {
          defaultFormSettings[variable] = (
            storageParams as Record<string, string>
          )[variable];
        }
      });

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
      this.defaultFolderId = module ? "" : `${folderId}`;
      if (module) this.defaultStorageId = `${module}`;

      this.selectedDay = this.defaultDay;
      this.selectedHour = this.defaultHour;
      this.selectedPeriodNumber = this.defaultPeriodNumber;
      this.selectedMaxCopiesNumber = this.defaultMaxCopiesNumber;
      this.selectedStorageType = this.defaultStorageType;
      this.selectedFolderId = module ? "" : this.defaultFolderId;

      this.defaultPeriodLabel = periodObj[+this.defaultPeriodNumber]
        .label as string;
      this.selectedPeriodLabel = this.defaultPeriodLabel;
      if (module) this.selectedStorageId = this.defaultStorageId;

      this.defaultMonthDay =
        +this.defaultPeriodNumber === +AutoBackupPeriod.EveryWeekType ||
        +this.defaultPeriodNumber === +AutoBackupPeriod.EveryDayType
          ? "1"
          : this.defaultDay;

      this.selectedMonthDay = this.defaultMonthDay;

      if (+this.defaultPeriodNumber === +AutoBackupPeriod.EveryWeekType) {
        let weekDay: number | undefined;

        if (this.defaultDay) {
          for (let i = 0; i < weekdayArr.length; i++) {
            if (+weekdayArr[i].key === +this.defaultDay) {
              weekDay = i;
            }
          }
        }

        // `weekDay as number` — original JS would index with
        // undefined (yielding a crash on .label) if no weekday matched;
        // the cast keeps that runtime untouched.
        this.defaultWeekdayLabel = weekdayArr[
          this.defaultDay ? (weekDay as number) : 0
        ].label as string;
        this.selectedWeekdayLabel = this.defaultWeekdayLabel;

        this.defaultWeekday = this.defaultDay;
        this.selectedWeekday = this.defaultWeekday;
      } else {
        this.defaultWeekday = weekdayArr[0].key as string;
        this.defaultWeekdayLabel = weekdayArr[0].label as string;

        this.selectedWeekdayLabel = this.defaultWeekdayLabel;
        this.selectedWeekday = this.defaultWeekday;
      }
    } else {
      this.defaultPeriodLabel = periodObj[+this.defaultPeriodNumber]
        .label as string;
      this.selectedPeriodLabel = this.defaultPeriodLabel;

      this.defaultWeekday = weekdayArr[0].key as string;
      this.defaultWeekdayLabel = weekdayArr[0].label as string;

      this.selectedWeekdayLabel = this.defaultWeekdayLabel;
      this.selectedWeekday = this.defaultWeekday;
    }

    this.setIsThirdStorageChanged(false);
  };

  setDefaultFolderId = (id: Nullable<string | number>) => {
    this.defaultFolderId = id;
  };

  setThirdPartyStorage = (list: TStorageBackup[]) => {
    this.thirdPartyStorage = list;
  };

  setPreparationPortalDialogVisible = (visible: boolean) => {
    this.preparationPortalDialogVisible = visible;
  };

  setBackupSchedule = (backupSchedule: TBackupSchedule) => {
    this.backupSchedule = backupSchedule;
  };

  setCommonThirdPartyList = (list: TCommonThirdParty[]) => {
    this.commonThirdPartyList = list;
  };

  setPeriod = (options: TOption) => {
    const key = options.key;
    const label = options.label;

    this.selectedPeriodLabel = label as string;
    this.selectedPeriodNumber = `${key}`;
  };

  setWeekday = (options: TOption) => {
    const key = options.key;
    const label = options.label;

    this.selectedWeekday = key as string;
    this.selectedWeekdayLabel = label as string;
  };

  setMonthNumber = (options: TOption) => {
    const label = options.label;

    this.selectedMonthDay = label as string;
  };

  setTime = (options: TOption) => {
    const label = options.label;

    this.selectedHour = label as string;
  };

  setMaxCopies = (options: TOption) => {
    const key = options.key;
    this.selectedMaxCopiesNumber = key as string;
  };

  seStorageType = (type: string) => {
    this.selectedStorageType = `${type}`;
  };

  setSelectedFolder = (folderId: Nullable<string | number>) => {
    if (folderId !== this.selectedFolderId) this.selectedFolderId = folderId;
  };

  setStorageId = (selectedStorage: Nullable<string>) => {
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
    isStorage: boolean,
    moduleName: string,
    selectedId: string | number | undefined,
    selectedStorageTitle?: string,
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
      saveToLocalStorage("LocalCopyFolder", selectedId);
    }
  };

  // getErrorInfo requires `t` and can return a ReactNode, but
  // the original store calls it with t/customText omitted and stores the
  // result in a string field; the casts keep that pre-existing runtime.
  setErrorInformation = (
    err: unknown,
    t?: TTranslation,
    customText?: string | ReactNode,
  ) => {
    this.errorInformation = getErrorInfo(
      err,
      t as TTranslation,
      customText,
    ) as string;
  };

  getProgress = async (t: TTranslation) => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      const response = (await getBackupProgress(
        isManagement(),
        abortController.signal,
      )) as TBackupProgress | undefined;

      if (response) {
        const { progress, link, error, warning } = response;

        if (link && link.slice(0, 1) === "/") {
          this.temporaryLink = link;
        }

        if (!error && !warning) {
          this.setIsBackupProgressVisible(progress !== 100);
          this.downloadingProgress = progress;
          this.setErrorInformation("");
        } else {
          this.setIsBackupProgressVisible(false);
          this.downloadingProgress = 100;
          if (warning) this.setBackupProgressWarning(warning);
          if (error) this.setErrorInformation(error);
        }
      }
    } catch (err) {
      if (axios.isCancel(err)) return;

      if (err) this.setErrorInformation(err, t);
    }
  };

  resetDownloadingProgress = () => {
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("data-backup") &&
      !window.location.pathname.includes("restore-backup")
    ) {
      this.downloadingProgress = 100;
    }
  };

  setIsBackupProgressVisible = (visible: boolean) => {
    this.isBackupProgressVisible = visible;
  };

  setBackupProgressError = (error: string) => {
    this.backupProgressError = error;
  };

  setBackupProgressWarning = (warning: string) => {
    this.backupProgressWarning = warning;
  };

  setDownloadingProgress = (progress: number) => {
    if (progress !== this.downloadingProgress)
      this.downloadingProgress = progress;
  };

  setTemporaryLink = (link: string) => {
    this.temporaryLink = link;
  };

  setFormSettings = (obj: Record<string, string>) => {
    this.formSettings = obj;
  };

  addValueInFormSettings = (name: string, value: string) => {
    this.setFormSettings({ ...this.formSettings, [name]: value });
  };

  deleteValueFormSetting = (key: string) => {
    delete this.formSettings[key];
  };

  // typed Option[] to match the shared backup page contracts
  // (AutoBackup/RestoreBackup types), although the produced objects carry
  // only { key, value } at runtime (no label) — pre-existing shape.
  getStorageParams = (
    isCheckedThirdPartyStorage: boolean,
    selectedFolderId: Nullable<string | number>,
    selectedStorageId?: Nullable<string>,
  ): Option[] => {
    const storageParams = [
      {
        key: isCheckedThirdPartyStorage ? "module" : "folderId",
        value: isCheckedThirdPartyStorage
          ? selectedStorageId
          : selectedFolderId,
      },
    ] as Option[];

    if (isCheckedThirdPartyStorage) {
      const arraySettings = Object.entries(this.formSettings);

      for (let i = 0; i < arraySettings.length; i++) {
        const tmpObj = {
          key: arraySettings[i][0],
          value: arraySettings[i][1],
        } as Option;

        storageParams.push(tmpObj);
      }
    }

    return storageParams;
  };

  setRequiredFormSettings = (array: string[]) => {
    this.requiredFormSettings = array;
  };

  setStorageRegions = (regions: StorageRegionsType[]) => {
    this.storageRegions = regions;
  };

  setDefaultFormSettings = (obj: Record<string, string>) => {
    this.defaultFormSettings = obj;
  };

  get isValidForm() {
    const requiredKeys = Object.keys(this.requiredFormSettings);
    if (!requiredKeys.length) return true;

    return !this.requiredFormSettings.some((key) => {
      const value = this.formSettings[key];
      return !value || !value.trim();
    });
  }

  isFormReady = () => {
    const errors: Record<string, boolean> = {};
    let firstError = false;

    Object.values(this.requiredFormSettings).forEach((key) => {
      const elem = this.formSettings[key];

      errors[key] = !elem.trim();

      if (!elem.trim() && !firstError) {
        firstError = true;
      }
    });
    this.setErrorsFormFields(errors);

    return !firstError;
  };

  setErrorsFormFields = (errors: Record<string, boolean>) => {
    this.errorsFieldsBeforeSafe = errors;
  };

  setCompletedFormFields = (
    values: Record<string, string>,
    module?: string,
  ) => {
    const formSettingsTemp: Record<string, string> = {};

    if (module && module === this.defaultStorageId) {
      this.setFormSettings({ ...this.defaultFormSettings });
      return;
    }

    Object.keys(values).forEach((key) => {
      formSettingsTemp[key] = values[key];
    });

    this.setFormSettings({ ...formSettingsTemp });
    this.setErrorsFormFields({});
  };

  setIsThirdStorageChanged = (changed: boolean) => {
    if (changed !== this.isThirdStorageChanged) {
      this.isThirdStorageChanged = changed;
    }
  };

  setSelectedEnableSchedule = () => {
    const isEnable = this.selectedEnableSchedule;
    this.selectedEnableSchedule = !isEnable;
  };

  setterSelectedEnableSchedule = (enable: boolean) => {
    this.selectedEnableSchedule = enable;
  };

  convertServiceName = (serviceName: string) => {
    // Docusign, OneDrive, Wordpress
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

  setRestoreResource = (value: Nullable<File | string | number>) => {
    this.restoreResource = value;
  };

  setChunkUploadSize = (chunkUploadSize: number) => {
    this.chunkUploadSize = chunkUploadSize;
  };

  uploadFileChunks = async (requestsDataArray: FormData[], url: string) => {
    let res: AxiosResponse<TUploadBackup> | undefined;

    const uploadUrl = combineUrl(
      window.ClientConfig?.proxy?.url,
      config.homepage,
      url,
    );

    for await (const value of uploadBackupFile(requestsDataArray, uploadUrl)) {
      if (!value) return false;

      if (value.data.Message || !value.data.Success) return value;

      res = value;
    }

    return res;
  };

  uploadLocalFile = async () => {
    try {
      const url = "/backupFileUpload.ashx";

      const getExst = (fileName: string) => {
        if (fileName.endsWith(".tar.gz")) {
          return "tar.gz";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
      };

      // uploadLocalFile assumes restoreResource is a File
      // (name/size/slice); the original JS would crash on other values,
      // the casts keep that runtime untouched.
      const extension = getExst((this.restoreResource as File).name);

      const res = await uploadBackup(
        combineUrl(
          window.ClientConfig?.proxy?.url,
          config.homepage,
          `${url}?init=true&totalSize=${(this.restoreResource as File).size}&extension=${extension}`,
        ),
      );

      if (!res) return false;

      if (res.data.Message || !res.data.Success) return res;

      const chunkUploadSize = res.data.ChunkSize;

      // the original JS passed a second argument to
      // Math.ceil, which is ignored at runtime; removed for TS (no
      // behavior change).
      const chunks = Math.ceil(
        (this.restoreResource as File).size / chunkUploadSize,
      );

      const requestsDataArray: FormData[] = [];

      let chunk = 0;

      while (chunk < chunks) {
        const offset = chunk * chunkUploadSize;
        const formData = new FormData();
        formData.append(
          "file",
          (this.restoreResource as File).slice(
            offset,
            offset + chunkUploadSize,
          ),
        );

        requestsDataArray.push(formData);
        chunk++;
      }

      return await this.uploadFileChunks(requestsDataArray, url);
    } catch (e) {
      toastr.error(e as string);
      return null;
    }
  };
}

export default BackupStore;
