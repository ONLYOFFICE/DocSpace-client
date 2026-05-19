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

import { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { useTranslation } from "react-i18next";

import AutomaticBackup from "@docspace/shared/pages/backup/auto-backup";
import type { ThirdPartyAccountType } from "@docspace/shared/types";

import { useUnmount } from "@docspace/ui-kit/hooks/useUnmount";
import type { TColorScheme } from "@docspace/ui-kit/providers/theme/themes";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import type {
  ExternalAutoBackupWrapperProps,
  AutoBackupWrapperProps,
} from "./AutoBackup.types";

const AutoBackupWrapper = ({
  setConnectedThirdPartyAccount,
  setBackupSchedule,
  setThirdPartyStorage,
  setDefaultOptions,
  resetDownloadingProgress,
  setErrorInformation,
  setIsInited,
  isInitialLoading,
  isEmptyContentBeforeLoader,
  isInitialError,
  isBackupPaid,
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
      isInitialLoading={isInitialLoading}
      isEmptyContentBeforeLoader={isEmptyContentBeforeLoader}
      setErrorInformation={setErrorInformation}
      isInitialError={isInitialError}
      isBackupPaid={isBackupPaid}
      {...props}
    />
  );
};

export default inject(
  ({
    backup,
    authStore,
    settingsStore,
    filesSettingsStore,
    filesSelectorInput,
    thirdPartyStore,
    dialogsStore,
    currentQuotaStore,
    clientLoadingStore,
  }: TStore) => {
    const language = authStore.language;

    const { getIcon, filesSettings } = filesSettingsStore;

    const settingsFileSelector = { getIcon, filesSettings };
    const {
      openConnectWindow,
      setThirdPartyProviders,
      providers,
      deleteThirdParty,
    } = thirdPartyStore;

    const { isBackupPaid } = currentQuotaStore;
    const { automaticBackupUrl, currentColorScheme } = settingsStore;

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

      setIsInited,
      setDefaultFolderId,

      isEmptyContentBeforeLoader,
      isInitialError,
      backupProgressWarning,
      setBackupProgressWarning,
    } = backup;

    const { showPortalSettingsLoader } = clientLoadingStore;

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
      isEmptyContentBeforeLoader,
      isInitialError,

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
      setIsInited,
      setDefaultFolderId,
      isBackupPaid,

      // clientLoadingStore
      isInitialLoading: showPortalSettingsLoader,
      backupProgressWarning,
      setBackupProgressWarning,
    };
  },
)(observer(AutoBackupWrapper as React.FC<ExternalAutoBackupWrapperProps>));
