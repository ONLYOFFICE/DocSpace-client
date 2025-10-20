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

import React, { useEffect, useLayoutEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { isManagement } from "@docspace/shared/utils/common";
import ManualBackup from "@docspace/shared/pages/backup/manual-backup";
import type { ThirdPartyAccountType } from "@docspace/shared/types";
import { getBackupsCount } from "@docspace/shared/api/backup";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import type {
  ExternalManualBackupProps,
  InjectedManualBackupProps,
  ManualBackupWrapperProps,
} from "./ManualBackup.types";

const ManualBackupWrapper = ({
  isNotPaidPeriod,
  resetDownloadingProgress,
  setConnectedThirdPartyAccount,
  setBackupsCount,
  setIsInited,
  isBackupPaid,
  setDownloadingProgress,
  isEmptyContentBeforeLoader,
  isInitialLoading,
  setIsEmptyContentBeforeLoader,
  ...props
}: ManualBackupWrapperProps) => {
  const { t } = useTranslation(["Settings", "Common"]);

  useLayoutEffect(() => {
    setDocumentTitle(t("Common:DataBackup"));
  }, [setDocumentTitle, t]);

  useEffect(() => {
    if (isNotPaidPeriod) return setIsEmptyContentBeforeLoader(false);
  }, []);

  useEffect(() => {
    return () => {
      resetDownloadingProgress();
      setIsInited(false);
    };
  }, []);

  const updateDownloadingProgress = async (progress: number) => {
    if (progress === 100 && isBackupPaid) {
      const backupsCount = await getBackupsCount();
      setBackupsCount(backupsCount);
    }

    setDownloadingProgress(progress);
  };

  return (
    <ManualBackup
      isNotPaidPeriod={isNotPaidPeriod}
      isInitialLoading={isInitialLoading}
      isEmptyContentBeforeLoader={isEmptyContentBeforeLoader}
      setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
      setDownloadingProgress={updateDownloadingProgress}
      isBackupPaid={isBackupPaid}
      {...props}
    />
  );
};

export default inject<
  TStore,
  ExternalManualBackupProps,
  InjectedManualBackupProps
>(
  ({
    backup,
    filesSelectorInput,
    settingsStore,
    dialogsStore,
    currentTariffStatusStore,
    thirdPartyStore,
    filesSettingsStore,
    currentQuotaStore,
    paymentStore,
    clientLoadingStore,
  }) => {
    const {
      accounts,
      isValidForm,
      formSettings,
      temporaryLink,
      storageRegions,
      errorInformation,
      thirdPartyStorage,
      defaultFormSettings,
      downloadingProgress,
      errorsFieldsBeforeSafe,
      isBackupProgressVisible,
      selectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
      connectedThirdPartyAccount,

      backupProgressError,
      setIsBackupProgressVisible,
      setBackupProgressError,

      isFormReady,
      setTemporaryLink,
      getStorageParams,
      clearLocalStorage,
      saveToLocalStorage,

      resetDownloadingProgress,
      setCompletedFormFields,
      addValueInFormSettings,
      setDownloadingProgress,
      deleteValueFormSetting,
      setRequiredFormSettings,
      setIsThirdStorageChanged,
      setThirdPartyAccountsInfo,
      setSelectedThirdPartyAccount,
      setConnectedThirdPartyAccount,
      setBackupsCount,
      setIsInited,

      backupPageEnable,
      backupsCount,

      isEmptyContentBeforeLoader,
      setIsEmptyContentBeforeLoader,
      isInitialError,
    } = backup;

    const { isPayer, backupServicePrice } = paymentStore;
    const {
      newPath,
      basePath,
      isErrorPath,
      toDefault,
      setBasePath,
      setNewPath,
    } = filesSelectorInput;

    const { dataBackupUrl, currentDeviceType, currentColorScheme, portals } =
      settingsStore;

    const {
      removeItem: storeItem,
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      setConnectDialogVisible,
      setDeleteThirdPartyDialogVisible,
    } = dialogsStore;

    const { isNotPaidPeriod, walletCustomerEmail } = currentTariffStatusStore;

    const {
      providers,
      deleteThirdParty,
      setThirdPartyProviders,
      openConnectWindow,
    } = thirdPartyStore;
    const { isBackupPaid, isThirdPartyAvailable, maxFreeBackups } =
      currentQuotaStore;

    const { getIcon, filesSettings } = filesSettingsStore;

    const { showPortalSettingsLoader } = clientLoadingStore;

    const pageIsDisabled = isManagement()
      ? portals?.length === 1 || !backupPageEnable
      : !backupPageEnable;

    // TODO: fix may be an empty object!!!
    const removeItem = (selectedThirdPartyAccount ??
      storeItem ??
      {}) as ThirdPartyAccountType;

    const settingsFileSelector = { getIcon, filesSettings };

    const defaultRegion =
      defaultFormSettings && "region" in defaultFormSettings
        ? (defaultFormSettings.region as string)
        : "";

    const colorScheme = currentColorScheme ?? undefined;

    const backupCount = backupsCount ?? 0;
    const isFreeBackupsLimitReached =
      maxFreeBackups > 0 ? backupCount >= maxFreeBackups : true;

    return {
      // backup
      accounts,
      isValidForm,
      formSettings,
      temporaryLink,
      storageRegions,
      thirdPartyStorage,
      defaultRegion,
      errorInformation,
      downloadingProgress,
      errorsFieldsBeforeSafe,
      isBackupProgressVisible,
      selectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
      connectedThirdPartyAccount,

      removeItem,
      backupProgressError,
      setIsBackupProgressVisible,
      setBackupProgressError,

      isFormReady,
      setTemporaryLink,
      getStorageParams,
      clearLocalStorage,
      saveToLocalStorage,

      resetDownloadingProgress,
      setCompletedFormFields,
      addValueInFormSettings,
      setDownloadingProgress,
      deleteValueFormSetting,
      setRequiredFormSettings,
      setIsThirdStorageChanged,
      setThirdPartyAccountsInfo,
      setSelectedThirdPartyAccount,
      setConnectedThirdPartyAccount,

      isEmptyContentBeforeLoader,
      setIsEmptyContentBeforeLoader,
      isInitialError,

      // filesSelectorInput
      newPath,
      basePath,
      isErrorPath,
      toDefault,
      setBasePath,
      setNewPath,

      // settingsStore
      dataBackupUrl: dataBackupUrl ?? "",
      pageIsDisabled,
      currentDeviceType,
      currentColorScheme: colorScheme,

      // dialogsStore
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      setConnectDialogVisible,
      setDeleteThirdPartyDialogVisible,

      // currentTariffStatusStore
      isNotPaidPeriod,

      // currentQuotaStore
      isBackupPaid,

      // thirdPartyStore
      providers,
      deleteThirdParty,
      setThirdPartyProviders,
      openConnectWindow,
      // filesSettingsStore
      settingsFileSelector,

      setBackupsCount,

      setIsInited,

      isPayer,
      walletCustomerEmail,
      isThirdPartyAvailable,

      backupServicePrice,
      isFreeBackupsLimitReached,

      // clientLoadingStore
      isInitialLoading: showPortalSettingsLoader,
    };
  },
)(observer(ManualBackupWrapper as React.FC<ExternalManualBackupProps>));
