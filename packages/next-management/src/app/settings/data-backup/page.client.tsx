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

import { useCallback, useState } from "react";
import { observer } from "mobx-react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import { openConnectWindowUtils } from "@docspace/shared/utils/openConnectWindow";
import { deleteThirdParty as deleteThirdPartyApi } from "@docspace/shared/api/files";
import ManualBackup from "@docspace/shared/pages/manual-backup";
import type {
  SettingsThirdPartyType,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type {
  TBackupSchedule,
  TPortalTariff,
  TStorageRegion,
} from "@docspace/shared/api/portal/types";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";
import type { ThirdPartyAccountType } from "@docspace/shared/types";

import useAppState from "@/hooks/useAppState";
import { useBackup } from "@/hooks/useBackup";
import { useStores } from "@/hooks/useStores";
import { useFilesSelectorInput } from "@/hooks/useFilesSelectorInput";
import { TariffState } from "@docspace/shared/enums";
import { useTreeFolders } from "@/hooks/useTreeFolders";

interface DataBackupProps {
  account: SettingsThirdPartyType | undefined;
  backupScheduleResponse: TBackupSchedule | undefined;
  backupStorageResponse: TStorageBackup[];
  newStorageRegions: TStorageRegion[];
  portals: string[];
  filesSettings: TFilesSettings;
  foldersTree: TFolder[];
  portalTariff: TPortalTariff | undefined;
}

const DataBackup = ({
  account,
  backupScheduleResponse,
  backupStorageResponse,
  newStorageRegions,
  portals,
  filesSettings,
  foldersTree,
  portalTariff,
}: DataBackupProps) => {
  const { settings } = useAppState();
  const { backupStore, spacesStore } = useStores();

  const [deleteThirdPartyDialogVisible, setDeleteThirdPartyDialogVisible] =
    useState(false);

  const { currentColorScheme } = useTheme();

  const { t } = useTranslation(["Common"]);

  const {
    accounts,
    defaults,
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
    setErrorInformation,
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
  } = useBackup({
    account,
    backupScheduleResponse,
    backupStorageResponse,
  });

  const {
    basePath,
    newPath,
    isErrorPath,
    setBasePath,
    setNewPath,
    toDefaultFileSelector,
  } = useFilesSelectorInput();

  const deleteThirdParty = useCallback(async (id: string) => {
    try {
      await deleteThirdPartyApi(id);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const openConnectWindow = useCallback(
    (serviceName: string, modal: Window | null) => {
      return openConnectWindowUtils(serviceName, modal, t);
    },
    [t],
  );

  const rootFoldersTitles = useTreeFolders({ foldersTree });

  const defaultRegion =
    defaults.formSettings && "region" in defaults.formSettings
      ? (defaults.formSettings.region as string)
      : "";

  const dataBackupUrl = `${settings?.helpLink ?? ""}/administration/docspace-settings.aspx#CreatingBackup_block`;

  const pageIsDisabled = portals.length === 1 && false;

  const isNotPaidPeriod = portalTariff?.state === TariffState.NotPaid;

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
      connectedThirdPartyAccount={connectedThirdPartyAccount}
      errorInformation={errorInformation}
      isFormReady={isFormReady}
      clearLocalStorage={clearLocalStorage}
      setErrorInformation={(err: unknown) => setErrorInformation(err, t)}
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
      rootFoldersTitles={rootFoldersTitles}
      removeItem={selectedThirdPartyAccount as ThirdPartyAccountType}
      providers={backupStore.providers}
      deleteThirdParty={deleteThirdParty}
      setThirdPartyProviders={backupStore.setThirdPartyProviders}
      openConnectWindow={openConnectWindow}
    />
  );
};

export default observer(DataBackup);
