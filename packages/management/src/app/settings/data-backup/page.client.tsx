// (c) Copyright Ascensio System SIA 2009-2025
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

import { useMemo } from "react";
import { observer } from "mobx-react";
import { useTheme } from "styled-components";

import { useUnmount } from "@docspace/shared/hooks/useUnmount";
import { useDidMount } from "@docspace/shared/hooks/useDidMount";

import ManualBackup from "@docspace/shared/pages/backup/manual-backup";
import { TariffState } from "@docspace/shared/enums";

import type {
  SettingsThirdPartyType,
  TFilesSettings,
} from "@docspace/shared/api/files/types";
import type {
  TBackupProgress,
  TBackupSchedule,
  TPortalTariff,
  TStorageRegion,
} from "@docspace/shared/api/portal/types";
import type { TError } from "@docspace/shared/utils/axiosClient";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";
import type { ThirdPartyAccountType } from "@docspace/shared/types";
import type { TPortals } from "@docspace/shared/api/management/types";

import useAppState from "@/hooks/useAppState";
import { useBackup } from "@/hooks/useBackup";
import { useStores } from "@/hooks/useStores";
import { useFilesSelectorInput } from "@/hooks/useFilesSelectorInput";
import { getDataBackupUrl } from "@/lib";

interface DataBackupProps {
  account: SettingsThirdPartyType | undefined;
  backupScheduleResponse: TBackupSchedule | undefined;
  backupStorageResponse: TStorageBackup[];
  newStorageRegions: TStorageRegion[];
  portals: TPortals[];
  filesSettings: TFilesSettings;
  portalTariff: TPortalTariff | undefined;
  backupProgress: TBackupProgress | TError | undefined;
}

const DataBackup = ({
  account,
  backupScheduleResponse,
  backupStorageResponse,
  newStorageRegions,
  portals,
  filesSettings,
  portalTariff,
  backupProgress,
}: DataBackupProps) => {
  const { settings } = useAppState();
  const { backupStore, spacesStore } = useStores();

  const { currentColorScheme } = useTheme();

  const {
    accounts,
    selected,
    downloadingProgress,
    temporaryLink,
    isTheSameThirdPartyAccount,
    thirdPartyStorage,
    errorsFieldsBeforeSafe,
    selectedThirdPartyAccount,
    connectedThirdPartyAccount,
    errorInformation,
    isFormReady,
    clearLocalStorage,

    setTemporaryLink,
    deleteValueFormSetting,
    setRequiredFormSettings,
    setDownloadingProgress,
    setIsThirdStorageChanged,
    setThirdPartyAccountsInfo,
    addValueInFormSettings,
    setSelectedThirdPartyAccount,
    getStorageParams,
    saveToLocalStorage,
    setConnectedThirdPartyAccount,
    setCompletedFormFields,
    resetDownloadingProgress,
    isBackupProgressVisible,
    deleteThirdPartyDialogVisible,
    setDeleteThirdPartyDialogVisible,
    getProgress,
    deleteThirdParty,
    openConnectWindow,

    isValidForm,
    defaultRegion,

    backupProgressError,
    setBackupProgressError,
    setIsBackupProgressVisible,
  } = useBackup({
    account,
    backupScheduleResponse,
    backupStorageResponse,
    backupProgress,
  });

  const {
    basePath,
    newPath,
    isErrorPath,
    setBasePath,
    setNewPath,
    toDefaultFileSelector,
  } = useFilesSelectorInput();

  const dataBackupUrl = useMemo(() => getDataBackupUrl(settings), [settings]);

  const pageIsDisabled = portals.length === 1;

  const isNotPaidPeriod = portalTariff?.state === TariffState.NotPaid;

  useUnmount(() => {
    resetDownloadingProgress();
  });

  useDidMount(() => {
    getProgress();
  });

  return (
    <ManualBackup
      isManagement
      isInitialLoading={false}
      isEmptyContentBeforeLoader={false}
      //
      settingsFileSelector={{
        filesSettings,
      }}
      defaultRegion={defaultRegion}
      downloadingProgress={downloadingProgress}
      temporaryLink={temporaryLink}
      accounts={accounts}
      isTheSameThirdPartyAccount={isTheSameThirdPartyAccount}
      storageRegions={newStorageRegions}
      formSettings={selected.formSettings}
      thirdPartyStorage={thirdPartyStorage}
      errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
      selectedThirdPartyAccount={
        selectedThirdPartyAccount as ThirdPartyAccountType
      }
      isBackupProgressVisible={isBackupProgressVisible}
      connectedThirdPartyAccount={connectedThirdPartyAccount}
      errorInformation={errorInformation}
      isFormReady={isFormReady}
      isValidForm={isValidForm}
      clearLocalStorage={clearLocalStorage}
      setTemporaryLink={setTemporaryLink}
      deleteValueFormSetting={deleteValueFormSetting}
      setRequiredFormSettings={setRequiredFormSettings}
      setDownloadingProgress={setDownloadingProgress}
      setIsThirdStorageChanged={setIsThirdStorageChanged}
      setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
      addValueInFormSettings={addValueInFormSettings}
      setSelectedThirdPartyAccount={setSelectedThirdPartyAccount}
      getStorageParams={getStorageParams}
      saveToLocalStorage={saveToLocalStorage}
      setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
      setCompletedFormFields={setCompletedFormFields}
      newPath={newPath}
      basePath={basePath}
      isErrorPath={isErrorPath}
      toDefault={toDefaultFileSelector}
      setBasePath={setBasePath}
      setNewPath={setNewPath}
      dataBackupUrl={dataBackupUrl}
      pageIsDisabled={pageIsDisabled}
      currentColorScheme={currentColorScheme}
      connectDialogVisible={spacesStore.connectDialogVisible}
      deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
      setConnectDialogVisible={spacesStore.setConnectDialogVisible}
      setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
      isNotPaidPeriod={isNotPaidPeriod}
      removeItem={selectedThirdPartyAccount as ThirdPartyAccountType}
      providers={backupStore.providers}
      deleteThirdParty={deleteThirdParty}
      setThirdPartyProviders={backupStore.setThirdPartyProviders}
      openConnectWindow={openConnectWindow}
      backupProgressError={backupProgressError}
      setBackupProgressError={setBackupProgressError}
      setIsBackupProgressVisible={setIsBackupProgressVisible}
    />
  );
};

export default observer(DataBackup);
