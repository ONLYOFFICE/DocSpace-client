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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import config from "PACKAGE_FILE";

import { DeviceType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { ButtonSize } from "@docspace/ui-kit/components/button";
import { RestoreBackup } from "@docspace/shared/pages/backup/restore-backup";
import type { ThirdPartyAccountType } from "@docspace/shared/types";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import type {
  ExternalRestoreBackupWrapperProps,
  RestoreBackupWrapperProps,
} from "./RestoreBackup.types";

const RestoreBackupWrapper = ({
  setRestoreResource,
  resetDownloadingProgress,
  setConnectedThirdPartyAccount,
  isInitialLoading,
  ...props
}: RestoreBackupWrapperProps) => {
  const { t } = useTranslation(["Settings", "Common"]);
  const navigate = useNavigate();

  useEffect(() => {
    setDocumentTitle(t("Common:RestoreBackup"));
  }, [t]);

  useEffect(() => {
    return () => {
      resetDownloadingProgress();
      setRestoreResource(null);
    };
  }, []);

  const navigateTo = (path: string) => {
    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, path),
    );
  };

  return (
    <RestoreBackup
      setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
      setRestoreResource={setRestoreResource}
      isInitialLoading={isInitialLoading}
      navigate={navigateTo}
      {...props}
    />
  );
};

export default inject(
  ({
    backup,
    currentQuotaStore,
    settingsStore,
    dialogsStore,
    filesSettingsStore,
    filesSelectorInput,
    thirdPartyStore,
    clientLoadingStore,
  }: TStore) => {
    const {
      errorInformation,
      selectedThirdPartyAccount,
      isBackupProgressVisible,
      restoreResource,
      formSettings,
      errorsFieldsBeforeSafe,
      thirdPartyStorage,
      storageRegions,
      defaultFormSettings,
      accounts,
      isTheSameThirdPartyAccount,
      downloadingProgress,
      connectedThirdPartyAccount,

      backupProgressError,
      setIsBackupProgressVisible,
      setBackupProgressError,
      setTemporaryLink,
      setErrorInformation,
      setDownloadingProgress,
      setConnectedThirdPartyAccount,
      resetDownloadingProgress,
      setRestoreResource,
      clearLocalStorage,
      setSelectedThirdPartyAccount,
      setThirdPartyAccountsInfo,
      setCompletedFormFields,
      addValueInFormSettings,
      setRequiredFormSettings,
      deleteValueFormSetting,
      setIsThirdStorageChanged,
      isFormReady,
      getStorageParams,
      uploadLocalFile,
    } = backup;

    const { showPortalSettingsLoader: isInitialLoading } = clientLoadingStore;

    const {
      basePath,
      newPath,
      isErrorPath,
      toDefault,
      setBasePath,
      setNewPath,
    } = filesSelectorInput;

    const {
      providers,
      deleteThirdParty,
      openConnectWindow,
      setThirdPartyProviders,
    } = thirdPartyStore;

    const {
      currentDeviceType,
      standalone,
      checkEnablePortalSettings,
      setTenantStatus,
    } = settingsStore;

    const {
      removeItem: storeItem,
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      setConnectDialogVisible,
      setDeleteThirdPartyDialogVisible,
    } = dialogsStore;

    const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;

    const { getIcon, filesSettings } = filesSettingsStore;

    const buttonSize =
      currentDeviceType !== DeviceType.desktop
        ? ButtonSize.normal
        : ButtonSize.small;

    const isEnableRestore = checkEnablePortalSettings(
      Boolean(isRestoreAndAutoBackupAvailable),
    );

    const removeItem = (selectedThirdPartyAccount ??
      storeItem ??
      {}) as ThirdPartyAccountType;

    const settingsFileSelector = { getIcon, filesSettings };
    const defaultRegion =
      defaultFormSettings && "region" in defaultFormSettings
        ? (defaultFormSettings.region as string)
        : "";

    return {
      removeItem,
      buttonSize,
      isEnableRestore,
      settingsFileSelector,
      isInitialLoading,

      // settingsStore
      standalone,
      setTenantStatus,

      // backup
      errorInformation,
      isBackupProgressVisible,
      restoreResource,
      formSettings,
      errorsFieldsBeforeSafe,
      thirdPartyStorage,
      storageRegions,
      defaultRegion,
      accounts,
      selectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
      connectedThirdPartyAccount,
      downloadingProgress,
      backupProgressError,
      setIsBackupProgressVisible,
      setBackupProgressError,
      setTemporaryLink,
      setErrorInformation,
      setDownloadingProgress,

      setConnectedThirdPartyAccount,
      resetDownloadingProgress,
      setRestoreResource,
      clearLocalStorage,
      setSelectedThirdPartyAccount,
      setThirdPartyAccountsInfo,
      setCompletedFormFields,
      addValueInFormSettings,
      setRequiredFormSettings,
      deleteValueFormSetting,
      setIsThirdStorageChanged,
      isFormReady,
      getStorageParams,
      uploadLocalFile,

      // filesSelectorInput
      basePath,
      newPath,
      isErrorPath,
      toDefault,
      setBasePath,
      setNewPath,

      // thirdPartyStore
      providers,
      deleteThirdParty,
      openConnectWindow,
      setThirdPartyProviders,

      // dialogsStore
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      setConnectDialogVisible,
      setDeleteThirdPartyDialogVisible,
    };
  },
)(
  observer(RestoreBackupWrapper as React.FC<ExternalRestoreBackupWrapperProps>),
);
