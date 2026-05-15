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

"use client";

import { useMemo } from "react";
import { observer } from "mobx-react";

import { useUnmount } from "@docspace/ui-kit/hooks/useUnmount";
import { useDidMount } from "@docspace/shared/hooks/useDidMount";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import type { FilesSettingsDto } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";

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
    backupProgressWarning,
    setBackupProgressWarning,
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
      settingsFileSelector={{
        filesSettings: filesSettings as unknown as FilesSettingsDto,
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
      backupProgressWarning={backupProgressWarning}
      setBackupProgressWarning={setBackupProgressWarning}
    />
  );
};

export default observer(DataBackup);
