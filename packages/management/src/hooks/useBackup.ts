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

import { useTranslation } from "react-i18next";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";

import axios, { AxiosError } from "axios";

import { deleteThirdParty as deleteThirdPartyApi } from "@docspace/shared/api/files";
import { getFromLocalStorage } from "@docspace/shared/utils/getFromLocalStorage";
import { saveToLocalStorageUtils } from "@docspace/shared/utils/saveToLocalStorage";
import { openConnectWindowUtils } from "@docspace/shared/utils/openConnectWindow";

import type { Nullable, Option, TTranslation } from "@docspace/shared/types";
import type {
  TBackupProgress,
  TBackupSchedule,
  TPaymentFeature,
} from "@docspace/shared/api/portal/types";
import type { TPortals } from "@docspace/shared/api/management/types";
import { BackupStorageLocalKey } from "@docspace/shared/enums";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";
import type { SettingsThirdPartyType } from "@docspace/shared/api/files/types";
import type { TError } from "@docspace/shared/utils/axiosClient";

import type { BackupSelectedStateType, ErrorResponse } from "@/types";

import { useStores } from "./useStores";
import useAppState from "./useAppState";
import { useBackupSettings } from "./useBackupSettings";

interface BackupProps {
  account: SettingsThirdPartyType | undefined;
  backupScheduleResponse: TBackupSchedule | undefined;
  backupStorageResponse: TStorageBackup[];
  backupProgress?: TBackupProgress | TError;
  features?: TPaymentFeature[];
}

export const useBackup = ({
  account,
  backupScheduleResponse,
  backupStorageResponse,
  backupProgress,
  features,
}: BackupProps) => {
  const { t } = useTranslation(["Common"]);

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

    isThirdStorageChanged,
    setIsThirdStorageChanged,
  } = useBackupSettings({ backupScheduleResponse });

  useLayoutEffect(() => {
    backupStore.setConnectedThirdPartyAccount(account ?? null);
  }, [account, backupStore]);

  const [requiredFormSettings, setRequiredFormSettings] = useState<string[]>(
    [],
  );

  const [thirdPartyStorage, setThirdPartyStorage] = useState<TStorageBackup[]>(
    () => backupStorageResponse,
  );

  const [errorInformation, setErrorInformationState] = useState<string>("");

  const [backupProgressWarning, setBackupProgressWarning] =
    useState<string>("");

  const [deleteThirdPartyDialogVisible, setDeleteThirdPartyDialogVisible] =
    useState(false);

  const [downloadingProgress, setDownloadingProgress] = useState<number>(() => {
    if (
      backupProgress &&
      "progress" in backupProgress &&
      !backupProgress.isCompleted
    )
      return backupProgress.progress;

    return 100;
  });

  const [temporaryLink, setTemporaryLink] = useState<string | null>(null);

  const setErrorInformation = useCallback(
    (err: unknown, trans: TTranslation) => {
      if (typeof err === "string") return setErrorInformationState(err);

      if (axios.isAxiosError(err)) {
        if ((err as AxiosError<ErrorResponse>).response?.status === 502)
          return setErrorInformationState(trans("Common:UnexpectedError"));

        const message =
          (err as AxiosError<ErrorResponse>).response?.data?.error?.message ||
          (err as { message: string }).message ||
          "";

        return setErrorInformationState(
          message || trans("Common:UnexpectedError"),
        );
      }

      return setErrorInformationState(trans("Common:UnexpectedError"));
    },
    [],
  );

  const setterSelectedEnableSchedule = useCallback(() => {
    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      enableSchedule: !selected.enableSchedule,
    }));
  }, [selected.enableSchedule, setSelected]);

  const setProgress = useCallback((progress: number) => {
    setDownloadingProgress(progress);
    // backupStore.setIsBackupProgressVisible(progress !== 100);
  }, []);

  const resetDownloadingProgress = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("data-backup") &&
      !window.location.pathname.includes("restore-backup")
    ) {
      setProgress(100);
    }
  }, [setProgress]);

  const isFormReady = () => {
    const errors: Record<string, boolean> = {};

    let firstError = false;

    requiredFormSettings.forEach((key) => {
      const elem = (selected.formSettings as { [key: string]: string })[key];

      errors[key] = !elem.trim();

      if (!elem.trim() && !firstError) {
        firstError = true;
      }
    });

    setErrorsFormFields(errors);

    return !firstError;
  };

  const isValidForm = useMemo(() => {
    if (!requiredFormSettings.length) return false;

    return !requiredFormSettings.some((key) => {
      const value = (selected.formSettings as { [key: string]: string })[key];

      return !value || !value.trim();
    });
  }, [requiredFormSettings, selected.formSettings]);

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

        storageParams.push(tmpObj as Option);
      }
    }

    return storageParams as Option[];
  };

  const isTheSameThirdPartyAccount = useMemo(() => {
    if (
      backupStore.connectedThirdPartyAccount &&
      backupStore.selectedThirdPartyAccount
    )
      return (
        backupStore.connectedThirdPartyAccount.title ===
        backupStore.selectedThirdPartyAccount.title
      );
    return true;
  }, [
    backupStore.connectedThirdPartyAccount,
    backupStore.selectedThirdPartyAccount,
  ]);

  const clearLocalStorage = useCallback(() => {
    if (getFromLocalStorage(BackupStorageLocalKey.StorageType))
      localStorage.removeItem(BackupStorageLocalKey.StorageType);

    if (getFromLocalStorage(BackupStorageLocalKey.Folder))
      localStorage.removeItem(BackupStorageLocalKey.Folder);

    if (getFromLocalStorage(BackupStorageLocalKey.Storage))
      localStorage.removeItem(BackupStorageLocalKey.Storage);

    if (getFromLocalStorage(BackupStorageLocalKey.ThirdPartyStorageType))
      localStorage.removeItem(BackupStorageLocalKey.ThirdPartyStorageType);

    if (getFromLocalStorage(BackupStorageLocalKey.ThirdPartyStorageValues))
      localStorage.removeItem(BackupStorageLocalKey.ThirdPartyStorageValues);
  }, []);

  const saveToLocalStorage = (
    isStorage: boolean,
    moduleName: string,
    selectedId: string | number | undefined,
    selectedStorageTitle?: string,
  ) => {
    saveToLocalStorageUtils(BackupStorageLocalKey.StorageType, moduleName);

    if (isStorage) {
      saveToLocalStorageUtils(BackupStorageLocalKey.Storage, `${selectedId}`);
      saveToLocalStorageUtils(
        BackupStorageLocalKey.ThirdPartyStorageType,
        selectedStorageTitle,
      );
      saveToLocalStorageUtils(
        BackupStorageLocalKey.ThirdPartyStorageValues,
        selected.formSettings,
      );
    } else {
      saveToLocalStorageUtils(BackupStorageLocalKey.Folder, `${selectedId}`);
    }
  };

  const setThirdPartyAccountsInfo = useCallback(
    (trans: TTranslation) => {
      return backupStore.setThirdPartyAccountsInfo(trans, isAdmin);
    },
    [backupStore, isAdmin],
  );

  const getProgress = useCallback(async () => {
    if (backupProgress && "progress" in backupProgress) {
      const { progress, link, error, isCompleted, warning } = backupProgress;

      if (warning) {
        setBackupProgressWarning(warning);
        return;
      }

      if (error) {
        setProgress(100);
        setErrorInformation(error, t);
        backupStore.setIsBackupProgressVisible(false);
        return;
      }

      if (isCompleted) {
        setProgress(100);
        backupStore.setIsBackupProgressVisible(false);
        setErrorInformation("", t);
        return;
      }

      setProgress(progress);
      backupStore.setIsBackupProgressVisible(progress !== 100);

      if (link && link.slice(0, 1) === "/") {
        setTemporaryLink(link);
      }
      setErrorInformation("", t);
    } else if (backupProgress) {
      const error =
        backupProgress && "error" in backupProgress
          ? backupProgress.error
          : backupProgress;

      setProgress(100);
      setErrorInformation(error ?? "", t);
      console.error(backupProgress);
      backupStore.setIsBackupProgressVisible(false);
    }
  }, [backupProgress, setErrorInformation, t, backupStore, setProgress]);

  const deleteThirdParty = useCallback(async (id: string) => {
    try {
      await deleteThirdPartyApi(id);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const openConnectWindow = useCallback(
    (serviceName: string, modal: Window | null) => {
      return openConnectWindowUtils(serviceName, modal, t);
    },
    [t],
  );

  const isRestoreAndAutoBackupAvailable = useMemo(() => {
    return Boolean(
      features?.find((feature) => feature.id === "restore")?.value,
    );
  }, [features]);

  const defaultRegion =
    defaults.formSettings && "region" in defaults.formSettings
      ? (defaults.formSettings.region as string)
      : "";

  const checkEnablePortalSettings = useCallback(
    (portals: Array<TPortals>) => {
      return portals.length === 1 ? false : isRestoreAndAutoBackupAvailable;
    },
    [isRestoreAndAutoBackupAvailable],
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

    setDownloadingProgress: setProgress,
    downloadingProgress,

    temporaryLink,
    setTemporaryLink,

    backupSchedule,
    setBackupSchedule,

    thirdPartyStorage,
    setThirdPartyStorage,

    connectedThirdPartyAccount: backupStore.connectedThirdPartyAccount,
    setConnectedThirdPartyAccount: backupStore.setConnectedThirdPartyAccount,

    toDefault,
    setRequiredFormSettings,

    isFormReady,
    isValidForm,
    errorsFieldsBeforeSafe,
    setErrorsFormFields,

    getStorageParams,
    deleteSchedule,
    isBackupProgressVisible: backupStore.isBackupProgressVisible,
    setIsBackupProgressVisible: backupStore.setIsBackupProgressVisible,
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
    deleteThirdPartyDialogVisible,
    setDeleteThirdPartyDialogVisible,
    getProgress,
    deleteThirdParty,
    openConnectWindow,

    defaultRegion,
    isRestoreAndAutoBackupAvailable,
    checkEnablePortalSettings,

    backupProgressError: backupStore.backupProgressError,
    setBackupProgressError: backupStore.setBackupProgressError,
    backupProgressWarning,
    setBackupProgressWarning,
  };
};
