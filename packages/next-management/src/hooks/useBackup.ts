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

import { getFromLocalStorage } from "@docspace/shared/utils/getFromLocalStorage";
import { saveToLocalStorageUtils } from "@docspace/shared/utils/saveToLocalStorage";

import type { Nullable, Option, TTranslation } from "@docspace/shared/types";
import type { TBackupSchedule } from "@docspace/shared/api/portal/types";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";
import type { SettingsThirdPartyType } from "@docspace/shared/api/files/types";

import type { ErrorResponse } from "@/types";

import { useStores } from "./useStores";
import useAppState from "./useAppState";
import { useBackupSettings } from "./useBackupSettings";

interface BackupProps {
  account: SettingsThirdPartyType | undefined;
  backupScheduleResponse: TBackupSchedule | undefined;
  backupStorageResponse: TStorageBackup[];
}

export const useBackup = ({
  account,
  backupScheduleResponse,
  backupStorageResponse,
}: BackupProps) => {
  const { backupStore } = useStores();
  const { isAdmin } = useAppState();
  const {
    defaults,
    setDefaults,
    selected,
    setSelected,
    backupSchedule,
    setBackupSchedule,
    errorsFieldsBeforeSafe,
    setErrorsFormFields,

    setMaxCopies,
    setPeriod,
    setWeekday,
    setMonthNumber,
    setTime,
    addValueInFormSettings,
    deleteValueFormSetting,
    setCompletedFormFields,

    setDefaultOptions,
    toDefault,
    deleteSchedule,
    isChanged,

    seStorageType,
    setSelectedFolder,
    setStorageId,
  } = useBackupSettings({ backupScheduleResponse });

  // TODO: required fix is object
  const [requiredFormSettings, setRequiredFormSettings] = useState<string[]>(
    [],
  );

  const [thirdPartyStorage, setThirdPartyStorage] = useState<TStorageBackup[]>(
    backupStorageResponse,
  );

  const [connectedThirdPartyAccount, setConnectedThirdPartyAccount] = useState<
    Nullable<SettingsThirdPartyType>
  >(() => account ?? null);

  const [isThirdStorageChanged, setIsThirdStorageChanged] =
    useState<boolean>(false);

  const [errorInformation, setErrorInformationState] = useState<string>("");

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

  const setterSelectedEnableSchedule = useCallback(() => {
    setSelected({ enableSchedule: !selected.enableSchedule });
  }, [selected.enableSchedule, setSelected]);

  const resetDownloadingProgress = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("data-backup") &&
      !window.location.pathname.includes("restore-backup")
    ) {
      setDownloadingProgress(100);
    }
  }, []);

  const isFormReady = () => {
    const errors: Record<string, boolean> = {};

    let firstError = false;

    Object.keys(requiredFormSettings).forEach((key) => {
      const elem = selected.formSettings[key];

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
      const arraySettings = Object.entries(selected.formSettings);

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

  const isBackupProgressVisible = useMemo(() => {
    return downloadingProgress >= 0 && downloadingProgress !== 100;
  }, [downloadingProgress]);

  const isTheSameThirdPartyAccount = useMemo(() => {
    if (connectedThirdPartyAccount && backupStore.selectedThirdPartyAccount)
      return (
        connectedThirdPartyAccount.title ===
        backupStore.selectedThirdPartyAccount.title
      );
    return true;
  }, [connectedThirdPartyAccount, backupStore.selectedThirdPartyAccount]);

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

  const saveToLocalStorage = (
    isStorage: boolean,
    moduleName: string,
    selectedId: string | number | undefined,
    selectedStorageTitle?: string,
  ) => {
    saveToLocalStorageUtils("LocalCopyStorageType", moduleName);

    if (isStorage) {
      saveToLocalStorageUtils("LocalCopyStorage", `${selectedId}`);
      saveToLocalStorageUtils(
        "LocalCopyThirdPartyStorageType",
        selectedStorageTitle,
      );
      saveToLocalStorageUtils(
        "LocalCopyThirdPartyStorageValues",
        selected.formSettings,
      );
    } else {
      saveToLocalStorageUtils("LocalCopyFolder", `${selectedId}`);
    }
  };

  const setThirdPartyAccountsInfo = useCallback(
    (t: TTranslation) => {
      return backupStore.setThirdPartyAccountsInfo(t, isAdmin);
    },
    [backupStore, isAdmin],
  );

  return {
    defaults,
    setDefaults,
    selected,
    setSelected,
    accounts: backupStore.accounts,
    errorInformation,
    setErrorInformation,

    setDefaultOptions,

    isThirdStorageChanged,
    setIsThirdStorageChanged,

    setterSelectedEnableSchedule,

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

    getStorageParams,
    deleteSchedule,
    isBackupProgressVisible,
    isChanged,

    setMaxCopies,
    setPeriod,
    setWeekday,
    setMonthNumber,
    setTime,

    setCompletedFormFields,
    addValueInFormSettings,
    deleteValueFormSetting,
    clearLocalStorage,

    selectedThirdPartyAccount: backupStore.selectedThirdPartyAccount,
    setSelectedThirdPartyAccount: backupStore.setSelectedThirdPartyAccount,
    isTheSameThirdPartyAccount,
    setThirdPartyAccountsInfo,

    fetchConnectingStorages: backupStore.fetchConnectingStorages,
    resetDownloadingProgress,

    seStorageType,
    setSelectedFolder,
    setStorageId,
    saveToLocalStorage,
  };
};
