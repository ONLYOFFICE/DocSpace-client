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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import config from "PACKAGE_FILE";

import { DeviceType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { ButtonSize } from "@docspace/shared/components/button";
import { RestoreBackup } from "@docspace/shared/pages/backup/restore-backup";
import type { ThirdPartyAccountType } from "@docspace/shared/types";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import type {
  ExternalRestoreBackupWrapperProps,
  InjectedRestoreBackupWrapperProps,
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

export default inject<
  TStore,
  ExternalRestoreBackupWrapperProps,
  InjectedRestoreBackupWrapperProps
>(
  ({
    backup,
    currentQuotaStore,
    settingsStore,
    dialogsStore,
    filesSettingsStore,
    filesSelectorInput,
    thirdPartyStore,
    clientLoadingStore,
  }) => {
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
