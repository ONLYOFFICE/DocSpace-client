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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import config from "PACKAGE_FILE";

import {
  getBackupStorage,
  getStorageRegions,
} from "@docspace/shared/api/settings";
import { getSettingsThirdParty } from "@docspace/shared/api/files";

import { DeviceType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { isManagement } from "@docspace/shared/utils/common";
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
  getProgress,
  setStorageRegions,
  setRestoreResource,
  setThirdPartyStorage,
  resetDownloadingProgress,
  setConnectedThirdPartyAccount,
  ...props
}: RestoreBackupWrapperProps) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { t } = useTranslation(["Settings", "Common"]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        getProgress(t);

        const [account, backupStorage, resStorageRegions] = await Promise.all([
          getSettingsThirdParty(),
          getBackupStorage(isManagement()),
          getStorageRegions(),
        ]);

        if (account) setConnectedThirdPartyAccount(account);
        setThirdPartyStorage(backupStorage);
        setStorageRegions(resStorageRegions);

        setIsInitialLoading(false);
      } catch (error) {
        toastr.error(error as Error);
      }
    })();
  }, [
    t,
    getProgress,
    setStorageRegions,
    setThirdPartyStorage,
    setConnectedThirdPartyAccount,
  ]);

  useEffect(() => {
    setDocumentTitle(t("Common:RestoreBackup"));
  }, [t]);

  useEffect(() => {
    return () => {
      resetDownloadingProgress();
      setRestoreResource(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      getProgress,
      setTemporaryLink,
      setThirdPartyStorage,
      setErrorInformation,
      setDownloadingProgress,
      setStorageRegions,
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
      getProgress,
      setThirdPartyStorage,
      setTemporaryLink,
      setErrorInformation,
      setDownloadingProgress,
      setStorageRegions,
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
