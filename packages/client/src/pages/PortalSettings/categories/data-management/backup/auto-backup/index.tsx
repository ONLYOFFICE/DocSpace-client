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
import { observer, inject } from "mobx-react";

import AutomaticBackup from "@docspace/shared/pages/auto-backup";
import type { ThirdPartyAccountType } from "@docspace/shared/types";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import type {
  ExternalAutoBackupWrapperProps,
  InjectedAutoBackupWrapperProps,
  AutoBackupWrapperProps,
} from "./AutoBackup.types";

function AutoBackupWrapper(props: AutoBackupWrapperProps) {
  return <AutomaticBackup setDocumentTitle={setDocumentTitle} {...props} />;
}

export default inject<
  TStore,
  ExternalAutoBackupWrapperProps,
  InjectedAutoBackupWrapperProps
>(
  ({
    backup,
    authStore,
    settingsStore,
    currentQuotaStore,
    filesSettingsStore,
    treeFoldersStore,
    filesSelectorInput,
    thirdPartyStore,
    dialogsStore,
  }) => {
    const language = authStore.language;
    const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;
    const { getIcon, filesSettings } = filesSettingsStore;

    const settingsFileSelector = { getIcon, filesSettings };
    const {
      openConnectWindow,
      setThirdPartyProviders,
      providers,
      deleteThirdParty,
    } = thirdPartyStore;

    const {
      checkEnablePortalSettings,
      automaticBackupUrl,
      currentColorScheme,
    } = settingsStore;

    const isEnableAuto = checkEnablePortalSettings(
      Boolean(isRestoreAndAutoBackupAvailable),
    );

    const { rootFoldersTitles, fetchTreeFolders } = treeFoldersStore;
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
      setDefaultOptions,
      clearProgressInterval,
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
    } = backup;

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
      clearProgressInterval,
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
      defaultRegion,
      deleteValueFormSetting,
      clearLocalStorage,
      setSelectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
      selectedThirdPartyAccount,
      accounts,
      setThirdPartyAccountsInfo,

      // treeFoldersStore
      rootFoldersTitles,
      fetchTreeFolders,

      // settingsStore
      automaticBackupUrl,
      currentColorScheme,

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
    };
  },
)(observer(AutoBackupWrapper as React.FC<ExternalAutoBackupWrapperProps>));
