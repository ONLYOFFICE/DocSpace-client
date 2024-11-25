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
import React from "react";
import { inject, observer } from "mobx-react";

import { isManagement } from "@docspace/shared/utils/common";
import ManualBackup from "@docspace/shared/pages/manual-backup";
import type { ThirdPartyAccountType } from "@docspace/shared/types";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import type {
  ExternalManualBackupProps,
  InjectedManualBackupProps,
  ManualBackupWrapperProps,
} from "./ManualBackup.types";

function ManualBackupWrapper(props: ManualBackupWrapperProps) {
  return <ManualBackup setDocumentTitle={setDocumentTitle} {...props} />;
}

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
    treeFoldersStore,
    thirdPartyStore,
    filesSettingsStore,
  }) => {
    const {
      accounts,
      isValidForm,
      formSettings,
      temporaryLink,
      storageRegions,
      thirdPartyStorage,
      defaultFormSettings,
      downloadingProgress,
      errorsFieldsBeforeSafe,
      isBackupProgressVisible,
      selectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
      connectedThirdPartyAccount,

      isFormReady,
      getProgress,
      setTemporaryLink,
      getStorageParams,
      clearLocalStorage,
      setStorageRegions,
      saveToLocalStorage,
      getIntervalProgress,
      setThirdPartyStorage,
      clearProgressInterval,
      setCompletedFormFields,
      addValueInFormSettings,
      setDownloadingProgress,
      deleteValueFormSetting,
      setRequiredFormSettings,
      setIsThirdStorageChanged,
      setThirdPartyAccountsInfo,
      setSelectedThirdPartyAccount,
      setConnectedThirdPartyAccount,
    } = backup;

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

    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { rootFoldersTitles, fetchTreeFolders } = treeFoldersStore;
    const {
      providers,
      deleteThirdParty,
      setThirdPartyProviders,
      openConnectWindow,
    } = thirdPartyStore;

    const { getIcon, filesSettings } = filesSettingsStore;

    const pageIsDisabled = isManagement() && portals?.length === 1;

    // TODO: fix may be an empty object!!!
    const removeItem = (selectedThirdPartyAccount ??
      storeItem ??
      {}) as ThirdPartyAccountType;

    const settingsFileSelector = { getIcon, filesSettings };

    const defaultRegion =
      defaultFormSettings && "region" in defaultFormSettings
        ? (defaultFormSettings.region as string)
        : "";

    return {
      // backup
      accounts,
      isValidForm,
      formSettings,
      temporaryLink,
      storageRegions,
      thirdPartyStorage,
      defaultRegion,
      downloadingProgress,
      errorsFieldsBeforeSafe,
      isBackupProgressVisible,
      selectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
      connectedThirdPartyAccount,

      removeItem,

      isFormReady,
      getProgress,
      setTemporaryLink,
      getStorageParams,
      clearLocalStorage,
      setStorageRegions,
      saveToLocalStorage,
      getIntervalProgress,
      setThirdPartyStorage,
      clearProgressInterval,
      setCompletedFormFields,
      addValueInFormSettings,
      setDownloadingProgress,
      deleteValueFormSetting,
      setRequiredFormSettings,
      setIsThirdStorageChanged,
      setThirdPartyAccountsInfo,
      setSelectedThirdPartyAccount,
      setConnectedThirdPartyAccount,

      // filesSelectorInput
      newPath,
      basePath,
      isErrorPath,
      toDefault,
      setBasePath,
      setNewPath,

      // settingsStore
      dataBackupUrl,
      pageIsDisabled,
      currentDeviceType,
      currentColorScheme,

      // dialogsStore
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      setConnectDialogVisible,
      setDeleteThirdPartyDialogVisible,

      // currentTariffStatusStore
      isNotPaidPeriod,

      // treeFoldersStore
      rootFoldersTitles,
      fetchTreeFolders,

      // thirdPartyStore
      providers,
      deleteThirdParty,
      setThirdPartyProviders,
      openConnectWindow,
      // filesSettingsStore
      settingsFileSelector,
    };
  },
)(observer(ManualBackupWrapper as React.FC<ExternalManualBackupProps>));
