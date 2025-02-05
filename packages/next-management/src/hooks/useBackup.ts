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

"use client";

import { useCallback, useMemo, useState } from "react";

import axios, { AxiosError } from "axios";

import {
  getConnectingStorages,
  getSettingsThirdParty,
} from "@docspace/shared/api/files";
import { AutoBackupPeriod } from "@docspace/shared/enums";
import { getFromLocalStorage } from "@docspace/shared/utils/getFromLocalStorage";
import { connectedCloudsTypeTitleTranslation } from "@docspace/shared/utils/connectedCloudsTypeTitleTranslation";

import { isAdmin as isAdminUtils } from "@docspace/shared/utils/common";

import type {
  Nullable,
  Option,
  ThirdPartyAccountType,
  TTranslation,
  TWeekdaysLabel,
} from "@docspace/shared/types";
import type { TBackupSchedule } from "@docspace/shared/api/portal/types";
import type { TOption } from "@docspace/shared/components/combobox";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";
import type {
  SettingsThirdPartyType,
  TConnectingStorage,
} from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";

interface ErrorResponse {
  error: {
    message: string;
  };
}

interface BackupProps {
  account: SettingsThirdPartyType | undefined;
  backupScheduleResponse: TBackupSchedule | undefined;
  backupStorageResponse: TStorageBackup[];
  user: TUser | undefined;
}

export const useBackup = ({
  account,
  backupScheduleResponse,
  backupStorageResponse,
  user,
}: BackupProps) => {
  const [accounts, setThirdPartyAccounts] = useState<ThirdPartyAccountType[]>(
    [],
  );

  const [selectedThirdPartyAccount, setSelectedThirdPartyAccount] =
    useState<Nullable<Partial<ThirdPartyAccountType>>>(null);

  const [errorsFieldsBeforeSafe, setErrorsFormFields] = useState<
    Record<string, boolean>
  >({});

  // TODO: required fix is object
  const [requiredFormSettings, setRequiredFormSettings] = useState<string[]>(
    [],
  );

  const [backupSchedule, setBackupSchedule] = useState<
    Nullable<TBackupSchedule>
  >(() => backupScheduleResponse ?? null);

  const [thirdPartyStorage, setThirdPartyStorage] = useState<TStorageBackup[]>(
    backupStorageResponse,
  );

  const [connectedThirdPartyAccount, setConnectedThirdPartyAccount] = useState<
    Nullable<SettingsThirdPartyType>
  >(() => account ?? null);

  //   const { t } = useTranslation(["Common"]);
  const [isThirdStorageChanged, setIsThirdStorageChanged] =
    useState<boolean>(false);
  const [selectedEnableSchedule, setSelectedEnableSchedule] =
    useState<boolean>(false);
  const [errorInformation, setErrorInformationState] = useState<string>("");
  const [formSettings, setFormSettings] = useState<Record<string, string>>({});

  const [defaultWeekday, setDefaultWeekday] = useState<string | null>(null);
  const [defaultFormSettings, setDefaultFormSettings] = useState<
    Record<string, string>
  >({});
  const [defaultEnableSchedule, setDefaultEnableSchedule] =
    useState<boolean>(false);
  const [defaultStorageType, setDefaultStorageType] = useState<string | null>(
    null,
  );
  const [defaultFolderId, setDefaultFolderId] = useState<string | null>(null);
  const [defaultStorageId, setDefaultStorageId] = useState<string | null>(null);
  const [defaultMonthDay, setDefaultMonthDay] = useState<string>("1");
  const [defaultDay, setDefaultDay] = useState<string>("0");
  const [defaultHour, setDefaultHour] = useState<string>("12:00");
  const [defaultPeriodNumber, setDefaultPeriodNumber] = useState<string>("0");
  const [defaultMaxCopiesNumber, setDefaultMaxCopiesNumber] =
    useState<string>("10");
  const [defaultPeriodLabel, setDefaultPeriodLabel] =
    useState<string>("Every day");
  const [defaultWeekdayLabel, setDefaultWeekdayLabel] = useState<string>("");

  const [selectedDay, setSelectedDay] = useState<string>("0");
  const [selectedHour, setSelectedHour] = useState<string>("12:00");
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<string>("0");
  const [selectedMaxCopiesNumber, setSelectedMaxCopiesNumber] =
    useState<string>("10");
  const [selectedStorageType, setSelectedStorageType] = useState<string | null>(
    null,
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const [selectedMonthDay, setSelectedMonthDay] = useState<string>("1");
  const [selectedPeriodLabel, setSelectedPeriodLabel] =
    useState<string>("Every day");
  const [selectedStorageId, setSelectedStorageId] = useState<string | null>(
    null,
  );
  const [selectedWeekdayLabel, setSelectedWeekdayLabel] = useState<string>("");
  const [selectedWeekday, setSelectedWeekday] = useState<string | null>(null);

  const [downloadingProgress, setDownloadingProgress] = useState<number>(100);
  const [temporaryLink, setTemporaryLink] = useState<string | null>(null);

  const setErrorInformation = useCallback((err: unknown, t: TTranslation) => {
    if (typeof err === "string") return setErrorInformationState(err);

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 502)
        return setErrorInformationState(t("Common:UnexpectedError"));

      const message =
        (err as AxiosError<ErrorResponse>).response?.data?.error?.message ||
        err.message ||
        "";

      return setErrorInformationState(message || t("Common:UnexpectedError"));
    }

    return setErrorInformationState(t("Common:UnexpectedError"));
  }, []);

  const setterSelectedEnableSchedule = useCallback(
    () => setSelectedEnableSchedule((prev) => !prev),
    [],
  );

  const setDefaultOptions = useCallback(
    (t: TTranslation, periodObj: TOption[], weekdayArr: TOption[]) => {
      if (backupSchedule) {
        const { storageType, cronParams, backupsStored, storageParams } =
          backupSchedule;
        const { folderId, module, ...other } = storageParams;
        const { period, day, hour } = cronParams;

        const defaultFormSettings: Record<string, string> = {
          folderId: folderId.toString(),
          ...other,
        };

        if (defaultFormSettings) {
          setFormSettings({ ...defaultFormSettings });
          setDefaultFormSettings({ ...defaultFormSettings });

          if (isThirdStorageChanged) {
            setIsThirdStorageChanged(false);
          }
        }

        setDefaultEnableSchedule(true);
        setSelectedEnableSchedule(true);

        setDefaultDay(day.toString());
        setDefaultHour(`${hour}:00`);
        setDefaultPeriodNumber(period.toString());
        setDefaultMaxCopiesNumber(backupsStored.toString());
        setDefaultStorageType(storageType.toString());
        setDefaultFolderId(folderId.toString());
        if (module) setDefaultStorageId(module.toString());

        setSelectedDay(day.toString());
        setSelectedHour(`${hour}:00`);
        setSelectedPeriodNumber(period.toString());
        setSelectedMaxCopiesNumber(backupsStored.toString());
        setSelectedStorageType(storageType.toString());
        setSelectedFolderId(folderId.toString());

        const periodLabel = periodObj[period].label!;

        setDefaultPeriodLabel(periodLabel);
        setSelectedPeriodLabel(periodLabel);

        if (module) setSelectedStorageId(module.toString());

        const monthDay =
          period === AutoBackupPeriod.EveryDayType ||
          period === AutoBackupPeriod.EveryWeekType
            ? "1"
            : day.toString();

        setDefaultMonthDay(monthDay);
        setSelectedMonthDay(monthDay);

        if (period === AutoBackupPeriod.EveryWeekType) {
          let weekDay: number = 0;

          if (day) {
            for (let i = 0; i < weekdayArr.length; i++) {
              if (+weekdayArr[i].key === day) {
                weekDay = i;
              }
            }
          }
          const weekDayLabel = weekdayArr[weekDay].label!;

          setDefaultWeekdayLabel(weekDayLabel);
          setSelectedWeekdayLabel(weekDayLabel);

          setDefaultWeekday(day.toString());
          setSelectedWeekday(day.toString());
        } else {
          const weekDayLabel = weekdayArr[0].label!;
          const weekDay = weekdayArr[0].key.toString();

          setDefaultWeekday(weekDay);
          setDefaultWeekdayLabel(weekDayLabel);

          setSelectedWeekday(weekDay);
          setSelectedWeekdayLabel(weekDayLabel);
        }
      } else {
        const periodLabel = periodObj[+defaultPeriodNumber].label!;

        setDefaultPeriodLabel(periodLabel);
        setSelectedPeriodLabel(periodLabel);

        const weekDayLabel = weekdayArr[0].label!;
        const weekDay = weekdayArr[0].key.toString();

        setDefaultWeekday(weekDay);
        setDefaultWeekdayLabel(weekDayLabel);

        setSelectedWeekday(weekDay);
        setSelectedWeekdayLabel(weekDayLabel);
      }

      setIsThirdStorageChanged(false);
    },
    [backupSchedule, defaultPeriodNumber, isThirdStorageChanged],
  );

  const toDefault = useCallback(() => {
    setSelectedHour(defaultHour);
    setSelectedPeriodLabel(defaultPeriodLabel);
    setSelectedPeriodNumber(defaultPeriodNumber);

    setSelectedWeekdayLabel(defaultWeekdayLabel);
    setSelectedMaxCopiesNumber(defaultMaxCopiesNumber);
    setSelectedStorageType(defaultStorageType);

    setSelectedMonthDay(defaultMonthDay);
    setSelectedWeekday(defaultWeekday);
    setSelectedStorageId(defaultStorageId);
    setSelectedFolderId(defaultFolderId);

    setSelectedEnableSchedule(defaultEnableSchedule);

    if (defaultFormSettings) {
      setFormSettings({ ...defaultFormSettings });
    }

    setIsThirdStorageChanged(false);
  }, [
    defaultEnableSchedule,
    defaultFolderId,
    defaultFormSettings,
    defaultHour,
    defaultMaxCopiesNumber,
    defaultMonthDay,
    defaultPeriodLabel,
    defaultPeriodNumber,
    defaultStorageId,
    defaultStorageType,
    defaultWeekday,
    defaultWeekdayLabel,
  ]);

  const isFormReady = () => {
    const errors: Record<string, boolean> = {};

    let firstError = false;

    Object.keys(requiredFormSettings).forEach((key) => {
      const elem = formSettings[key];

      errors[key] = !elem.trim();

      if (!elem.trim() && !firstError) {
        firstError = true;
      }
    });

    setErrorsFormFields(errors);

    return !firstError;
  };

  const getStorageParams = (
    isCheckedThirdPartyStorage: boolean,
    selectedFolderId: Nullable<string | number>,
    selectedStorageId?: string | null,
  ): Option[] => {
    const storageParams = [
      {
        key: isCheckedThirdPartyStorage ? "module" : "folderId",
        value: isCheckedThirdPartyStorage
          ? selectedStorageId
          : selectedFolderId,
      },
    ];

    if (isCheckedThirdPartyStorage) {
      const arraySettings = Object.entries(formSettings);

      for (let i = 0; i < arraySettings.length; i++) {
        const tmpObj = {
          key: arraySettings[i][0],
          value: arraySettings[i][1],
        };

        storageParams.push(tmpObj);
      }
    }

    return storageParams as Option[];
  };

  const deleteSchedule = (weekdayArr: TWeekdaysLabel[]) => {
    setBackupSchedule(null);
    setDefaultDay("0");
    setDefaultHour("12:00");
    setDefaultPeriodNumber("0");
    setDefaultPeriodLabel("Every day");
    setDefaultMaxCopiesNumber("10");

    setDefaultStorageType("0");
    setDefaultFolderId(null);
    setDefaultMonthDay("1");

    setSelectedDay("0");
    setSelectedHour("12:00");
    setSelectedPeriodNumber("0");
    setSelectedPeriodLabel("Every day");
    setSelectedMaxCopiesNumber("10");

    setSelectedStorageType("0");
    setSelectedFolderId(null);
    setSelectedMonthDay("1");

    setSelectedStorageId(null);
    setDefaultStorageId(null);

    setDefaultWeekday(weekdayArr[0].key);
    setDefaultWeekdayLabel(weekdayArr[0].label);

    setSelectedWeekday(weekdayArr[0].key);
    setSelectedWeekdayLabel(weekdayArr[0].label);

    setSelectedEnableSchedule(false);
    setDefaultEnableSchedule(false);

    setIsThirdStorageChanged(false);
  };

  const isBackupProgressVisible = useMemo(() => {
    return downloadingProgress >= 0 && downloadingProgress !== 100;
  }, [downloadingProgress]);

  const isChanged = useMemo(() => {
    if (selectedHour !== defaultHour) {
      return true;
    }

    if (+selectedMaxCopiesNumber !== +defaultMaxCopiesNumber) {
      return true;
    }

    if (defaultPeriodNumber !== selectedPeriodNumber) {
      return true;
    }

    if (selectedStorageType !== defaultStorageType) {
      return true;
    }

    if (selectedPeriodNumber === "2") {
      if (selectedMonthDay !== defaultDay) {
        return true;
      }
    }

    if (selectedPeriodNumber === "1") {
      if (selectedWeekdayLabel !== defaultWeekdayLabel) {
        return true;
      }
    }

    if (selectedFolderId !== defaultFolderId) return true;

    if (selectedStorageId !== defaultStorageId) return true;

    if (selectedEnableSchedule !== defaultEnableSchedule) return true;

    return false;
  }, [
    defaultDay,
    defaultEnableSchedule,
    defaultFolderId,
    defaultHour,
    defaultMaxCopiesNumber,
    defaultPeriodNumber,
    defaultStorageId,
    defaultStorageType,
    defaultWeekdayLabel,
    selectedEnableSchedule,
    selectedFolderId,
    selectedHour,
    selectedMaxCopiesNumber,
    selectedMonthDay,
    selectedPeriodNumber,
    selectedStorageId,
    selectedStorageType,
    selectedWeekdayLabel,
  ]);

  const isTheSameThirdPartyAccount = useMemo(() => {
    if (connectedThirdPartyAccount && selectedThirdPartyAccount)
      return (
        connectedThirdPartyAccount.title === selectedThirdPartyAccount.title
      );
    return true;
  }, [connectedThirdPartyAccount, selectedThirdPartyAccount]);

  const isAdmin = useMemo(() => {
    if (!user || !user.id) return false;

    return isAdminUtils(user);
  }, [user]);

  const setMaxCopies = (option: TOption) => {
    setSelectedMaxCopiesNumber(option.key.toString());
  };

  const setPeriod = (options: TOption) => {
    const key = options.key;
    const label = options.label;

    setSelectedPeriodLabel(label!);
    setSelectedPeriodNumber(`${key}`);
  };

  const setWeekday = (options: TOption) => {
    const key = options.key;
    const label = options.label;

    setSelectedWeekday(`${key}`);
    setSelectedWeekdayLabel(label!);
  };

  const setMonthNumber = (options: TOption) => {
    const label = options.label;

    setSelectedMonthDay(label!);
  };

  const setTime = (options: TOption) => {
    const label = options.label;

    setSelectedHour(label!);
  };

  const setCompletedFormFields = (
    values: Record<string, string>,
    module?: string,
  ) => {
    const formSettingsTemp: Record<string, string> = {};

    if (module && module === defaultStorageId) {
      setFormSettings({ ...defaultFormSettings });
      return;
    }

    Object.keys(values).forEach((key) => {
      formSettingsTemp[key] = values[key];
    });

    setFormSettings({ ...formSettingsTemp });
    setErrorsFormFields({});
  };

  const addValueInFormSettings = (name: string, value: string) => {
    setFormSettings({ ...formSettings, [name]: value });
  };

  const deleteValueFormSetting = (key: string) => {
    setFormSettings((prev) => {
      const newSettings = { ...prev };
      delete newSettings[key];
      return newSettings;
    });
  };

  const clearLocalStorage = useCallback(() => {
    if (getFromLocalStorage("LocalCopyStorageType"))
      localStorage.removeItem("LocalCopyStorageType");

    if (getFromLocalStorage("LocalCopyFolder"))
      localStorage.removeItem("LocalCopyFolder");

    if (getFromLocalStorage("LocalCopyStorage"))
      localStorage.removeItem("LocalCopyStorage");

    if (getFromLocalStorage("LocalCopyThirdPartyStorageType"))
      localStorage.removeItem("LocalCopyThirdPartyStorageType");

    if (getFromLocalStorage("LocalCopyThirdPartyStorageValues"))
      localStorage.removeItem("LocalCopyThirdPartyStorageValues");
  }, []);

  const getThirdPartyAccount = (
    provider: TConnectingStorage,
    t: TTranslation,
  ) => {
    const serviceTitle = connectedCloudsTypeTitleTranslation(provider.name, t);
    const serviceLabel = provider.connected
      ? serviceTitle
      : `${serviceTitle} (${t("CreateEditRoomDialog:ActivationRequired")})`;

    const isConnected =
      connectedThirdPartyAccount?.providerKey === "WebDav"
        ? serviceTitle === connectedThirdPartyAccount?.title
        : provider.key === connectedThirdPartyAccount?.providerKey;

    const isDisabled = !provider.connected && !isAdmin;

    const account: ThirdPartyAccountType = {
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
        provider_id: connectedThirdPartyAccount?.providerId,
        id: connectedThirdPartyAccount?.id,
      }),
      disabled: isDisabled,
    };

    return { account, isConnected };
  };

  const setThirdPartyAccountsInfo = async (t: TTranslation) => {
    const [connectedAccount, providers] = await Promise.all([
      getSettingsThirdParty(),
      getConnectingStorages(),
    ]);

    if (connectedAccount) setConnectedThirdPartyAccount(connectedAccount);

    let tempAccounts: ThirdPartyAccountType[] = [];

    let selectedAccount: ThirdPartyAccountType | undefined;
    let index = 0;

    providers.forEach((item) => {
      const thirdPartyAccount = getThirdPartyAccount(item, t);

      if (!thirdPartyAccount.account) return true; // continue

      tempAccounts.push(thirdPartyAccount.account);

      if (thirdPartyAccount.isConnected) {
        selectedAccount = { ...tempAccounts[index] };
      }
      index++;
    });

    tempAccounts = tempAccounts.sort((storage) => (storage.connected ? -1 : 1));

    setThirdPartyAccounts(tempAccounts);

    const connectedThirdPartyAccount = tempAccounts.findLast(
      (a) => a.connected,
    );

    setSelectedThirdPartyAccount(
      Object.keys(selectedAccount ?? {}).length !== 0
        ? (selectedAccount ?? {})
        : (connectedThirdPartyAccount ?? {}),
    );
  };

  return {
    accounts,
    errorInformation,
    setErrorInformation,

    setDefaultOptions,

    formSettings,
    isThirdStorageChanged,
    setIsThirdStorageChanged,
    selectedEnableSchedule,
    setterSelectedEnableSchedule,

    defaultWeekday,
    defaultFormSettings,
    defaultEnableSchedule,
    defaultStorageType,
    defaultFolderId,
    defaultStorageId,
    defaultMonthDay,
    defaultDay,
    defaultHour,
    defaultPeriodNumber,
    defaultMaxCopiesNumber,
    defaultPeriodLabel,
    defaultWeekdayLabel,

    selectedDay,
    selectedHour,
    selectedPeriodNumber,
    selectedMaxCopiesNumber,
    selectedStorageType,
    selectedFolderId,
    selectedMonthDay,
    selectedPeriodLabel,
    selectedStorageId,
    selectedWeekdayLabel,
    selectedWeekday,

    setSelectedStorageType,

    setDownloadingProgress,
    downloadingProgress,

    temporaryLink,
    setTemporaryLink,

    backupSchedule,
    setBackupSchedule,

    thirdPartyStorage,
    setThirdPartyStorage,

    connectedThirdPartyAccount,
    setConnectedThirdPartyAccount,

    toDefault,
    setRequiredFormSettings,

    isFormReady,

    errorsFieldsBeforeSafe,
    setErrorsFormFields,

    setSelectedFolderId,
    getStorageParams,
    deleteSchedule,
    isBackupProgressVisible,
    isChanged,

    setMaxCopies,
    setPeriod,
    setWeekday,
    setMonthNumber,
    setTime,

    setSelectedStorageId,
    setCompletedFormFields,
    addValueInFormSettings,
    deleteValueFormSetting,
    clearLocalStorage,

    selectedThirdPartyAccount,
    setSelectedThirdPartyAccount,
    isTheSameThirdPartyAccount,
    setThirdPartyAccountsInfo,
  };
};

