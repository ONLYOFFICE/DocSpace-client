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

import { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { useTranslation } from "react-i18next";

import AutomaticBackup from "@docspace/shared/pages/backup/auto-backup";

import { useUnmount } from "@docspace/shared/hooks/useUnmount";

import type { ThirdPartyAccountType } from "@docspace/shared/types";
import type { TColorScheme } from "@docspace/shared/themes";
// import { getBackupsCount } from "@docspace/shared/api/backup";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import type {
  ExternalAutoBackupWrapperProps,
  InjectedAutoBackupWrapperProps,
  AutoBackupWrapperProps,
} from "./AutoBackup.types";

const AutoBackupWrapper = ({
  getProgress,
  setConnectedThirdPartyAccount,
  setStorageRegions,
  setBackupSchedule,
  setThirdPartyStorage,
  setDefaultOptions,
  resetDownloadingProgress,
  setErrorInformation,
  setBackupsCount,
  setServiceQuota,
  setIsInited,
  fetchPayerInfo,
  isBackupPaid,
  maxFreeBackups,
  ...props
}: AutoBackupWrapperProps) => {
  const { t, ready } = useTranslation(["Settings", "Common"]);

  useUnmount(() => {
    resetDownloadingProgress();
    props.setterSelectedEnableSchedule(false);
    props.toDefault();
    setIsInited(false);
  });

  useEffect(() => {
    if (ready) setDocumentTitle(t("Common:DataBackup"));
  }, [t, ready]);

  return (
    <AutomaticBackup
      setDefaultOptions={setDefaultOptions}
      setBackupSchedule={setBackupSchedule}
      setThirdPartyStorage={setThirdPartyStorage}
      setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
      {...props}
    />
  );
};

export default inject<
  TStore,
  ExternalAutoBackupWrapperProps,
  InjectedAutoBackupWrapperProps
>(
  ({
    backup,
    authStore,
    settingsStore,
    filesSettingsStore,
    filesSelectorInput,
    thirdPartyStore,
    dialogsStore,
    currentTariffStatusStore,
    currentQuotaStore,
    paymentStore,
  }) => {
    const language = authStore.language;

    const { setServiceQuota } = paymentStore;
    const { fetchPayerInfo } = currentTariffStatusStore;
    const { getIcon, filesSettings } = filesSettingsStore;

    const settingsFileSelector = { getIcon, filesSettings };
    const {
      openConnectWindow,
      setThirdPartyProviders,
      providers,
      deleteThirdParty,
    } = thirdPartyStore;

    const { automaticBackupUrl, currentColorScheme } = settingsStore;
    const { isBackupPaid, maxFreeBackups } = currentQuotaStore;

    const {
      basePath,
      newPath,
      resetNewFolderPath,
      updateBaseFolderPath,
      toDefault: toDefaultFileSelector,
      isErrorPath,
      setBasePath,
      setNewPath,
    } = filesSelectorInput;

    const {
      removeItem: storeItem,
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      setConnectDialogVisible,
      setDeleteThirdPartyDialogVisible,
    } = dialogsStore;

    const {
      errorInformation,
      setDefaultOptions,
      setErrorInformation,
      resetDownloadingProgress,
      setThirdPartyStorage,
      setBackupSchedule,
      getProgress,
      setStorageRegions,
      setConnectedThirdPartyAccount,
      seStorageType,
      setSelectedEnableSchedule,
      toDefault,
      selectedStorageType,
      selectedFolderId,
      isFormReady,
      selectedMaxCopiesNumber,
      selectedPeriodNumber,
      selectedWeekday,
      selectedHour,
      selectedMonthDay,
      selectedStorageId,
      selectedEnableSchedule,
      setSelectedFolder,
      getStorageParams,
      deleteSchedule,
      downloadingProgress,
      isBackupProgressVisible,
      isChanged,
      isThirdStorageChanged,
      defaultStorageType,
      defaultFolderId,
      connectedThirdPartyAccount,
      selectedPeriodLabel,
      selectedWeekdayLabel,

      setMaxCopies,
      setPeriod,
      setWeekday,
      setMonthNumber,
      setTime,
      setStorageId,
      thirdPartyStorage,
      defaultStorageId,
      setCompletedFormFields,
      errorsFieldsBeforeSafe,
      formSettings,
      addValueInFormSettings,
      setRequiredFormSettings,
      setIsThirdStorageChanged,
      storageRegions,
      defaultFormSettings,
      deleteValueFormSetting,
      clearLocalStorage,
      setSelectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
      selectedThirdPartyAccount,
      accounts,
      setThirdPartyAccountsInfo,
      setDownloadingProgress,
      setTemporaryLink,

      setIsBackupProgressVisible,
      backupProgressError,
      setBackupProgressError,
      setterSelectedEnableSchedule,
      backupPageEnable,

      setBackupsCount,

      setIsInited,
    } = backup;

    const isEnableAuto = backupPageEnable ?? false;

    const defaultRegion =
      defaultFormSettings && "region" in defaultFormSettings
        ? (defaultFormSettings.region as string)
        : "";

    const removeItem = (selectedThirdPartyAccount ??
      storeItem ??
      {}) as ThirdPartyAccountType;

    return {
      removeItem,
      settingsFileSelector,
      isEnableAuto,
      // authStore
      language,
      // backup
      setDefaultOptions,
      setThirdPartyStorage,
      setBackupSchedule,
      getProgress,
      setStorageRegions,
      setConnectedThirdPartyAccount,
      seStorageType,
      setSelectedEnableSchedule,
      setterSelectedEnableSchedule,
      toDefault,
      selectedStorageType,
      selectedFolderId,
      isFormReady,
      selectedMaxCopiesNumber,
      selectedPeriodNumber,
      selectedWeekday,
      selectedHour,
      selectedMonthDay,
      selectedStorageId,
      selectedEnableSchedule,
      setSelectedFolder,
      getStorageParams,
      deleteSchedule,
      downloadingProgress,
      isBackupProgressVisible,
      isChanged,
      isThirdStorageChanged,
      defaultStorageType,
      defaultFolderId,
      connectedThirdPartyAccount,
      selectedPeriodLabel,
      selectedWeekdayLabel,
      errorInformation,
      resetDownloadingProgress,
      setDownloadingProgress,
      setTemporaryLink,
      setMaxCopies,
      setPeriod,
      setWeekday,
      setMonthNumber,
      setTime,
      setStorageId,
      setErrorInformation,
      thirdPartyStorage,
      defaultStorageId,
      setCompletedFormFields,
      errorsFieldsBeforeSafe,
      formSettings,
      addValueInFormSettings,
      setRequiredFormSettings,
      setIsThirdStorageChanged,
      storageRegions,
      defaultRegion,
      deleteValueFormSetting,
      clearLocalStorage,
      setSelectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
      selectedThirdPartyAccount,
      accounts,
      setThirdPartyAccountsInfo,
      setIsBackupProgressVisible,
      backupProgressError,
      setBackupProgressError,

      // settingsStore
      automaticBackupUrl,
      currentColorScheme: currentColorScheme as TColorScheme,

      // filesSelectorInput
      newPath,
      basePath,
      resetNewFolderPath,
      updateBaseFolderPath,
      toDefaultFileSelector,
      isErrorPath,
      setBasePath,
      setNewPath,

      // thirdPartyStore
      openConnectWindow,
      setThirdPartyProviders,
      providers,
      deleteThirdParty,
      // dialogsStore
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      setConnectDialogVisible,
      setDeleteThirdPartyDialogVisible,
      fetchPayerInfo,
      setBackupsCount,
      setServiceQuota,
      setIsInited,
      isBackupPaid,
      maxFreeBackups,
    };
  },
)(observer(AutoBackupWrapper as React.FC<ExternalAutoBackupWrapperProps>));
