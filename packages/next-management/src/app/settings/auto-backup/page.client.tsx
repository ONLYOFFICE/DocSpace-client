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

import { useTheme } from "styled-components";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import AutomaticBackup from "@docspace/shared/pages/auto-backup";

import type {
  SettingsThirdPartyType,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type {
  TBackupSchedule,
  TPaymentFeature,
  TStorageRegion,
} from "@docspace/shared/api/portal/types";

import type { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import type { TUser } from "@docspace/shared/api/people/types";
import type {
  ThirdPartyAccountType,
  ProviderType,
} from "@docspace/shared/types";
import { useBackup } from "@/hooks/useBackup";
import { TStorageBackup } from "@docspace/shared/api/settings/types";
import { useTreeFolders } from "@/hooks/useTreeFolders";
import { useFilesSelectorInput } from "@/hooks/useFilesSelectorInput";
import { useThirdParty } from "@/hooks/useThirdParty";

interface AutoBackupProps {
  account: SettingsThirdPartyType | undefined;
  backupScheduleResponse: TBackupSchedule | undefined;
  backupStorageResponse: TStorageBackup[];
  newStorageRegions: TStorageRegion[];
  portals: string[];
  features: TPaymentFeature[];
  filesSettings: TFilesSettings;
  user: TUser | undefined;
  foldersTree: TFolder[];
  automaticBackupUrl: string;
}

const AutoBackup = ({
  account,
  backupScheduleResponse,
  backupStorageResponse,
  newStorageRegions,
  portals,
  features,
  filesSettings,
  user,
  foldersTree,
  automaticBackupUrl,
}: AutoBackupProps) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const { currentColorScheme } = useTheme();

  const rootFoldersTitles = useTreeFolders({ foldersTree });

  const {
    accounts,
    toDefault,
    setErrorInformation,
    errorInformation,

    defaultDay,
    defaultHour,
    defaultWeekday,
    defaultFolderId,
    defaultMonthDay,
    defaultStorageId,
    defaultPeriodLabel,
    defaultStorageType,
    defaultWeekdayLabel,
    defaultPeriodNumber,
    defaultFormSettings,
    defaultEnableSchedule,
    defaultMaxCopiesNumber,

    selectedHour,
    selectedDay,
    selectedWeekday,
    selectedFolderId,
    selectedMonthDay,
    selectedStorageId,
    selectedPeriodLabel,
    selectedStorageType,
    selectedWeekdayLabel,
    selectedPeriodNumber,
    selectedEnableSchedule,
    selectedMaxCopiesNumber,

    setSelectedStorageType,
    isThirdStorageChanged,
    setIsThirdStorageChanged,
    formSettings,
    setDefaultOptions,

    setDownloadingProgress,
    downloadingProgress,

    setTemporaryLink,

    setBackupSchedule,

    thirdPartyStorage,
    setThirdPartyStorage,

    connectedThirdPartyAccount,
    setConnectedThirdPartyAccount,

    setterSelectedEnableSchedule,

    errorsFieldsBeforeSafe,
    isFormReady,
    setSelectedFolderId,
    getStorageParams,
    deleteSchedule,
    isBackupProgressVisible,
    isChanged,
    setMaxCopies,
    setPeriod,
    setWeekday,
    setMonthNumber,
    setTime,
    setSelectedStorageId,
    setCompletedFormFields,
    addValueInFormSettings,
    setRequiredFormSettings,
    deleteValueFormSetting,
    clearLocalStorage,
    selectedThirdPartyAccount,
    setSelectedThirdPartyAccount,
    isTheSameThirdPartyAccount,
    setThirdPartyAccountsInfo,
  } = useBackup({
    account,
    backupScheduleResponse,
    backupStorageResponse,
    user,
  });

  const {
    basePath,
    newPath,
    isErrorPath,
    setBasePath,
    setNewPath,
    toDefaultFileSelector,
    resetNewFolderPath,
    updateBaseFolderPath,
  } = useFilesSelectorInput();

  const {
    openConnectWindow,
    setThirdPartyProviders,
    providers,
    deleteThirdParty,
  } = useThirdParty();

  const isRestoreAndAutoBackupAvailable = useMemo(() => {
    return Boolean(
      features.find((feature: TPaymentFeature) => feature.id === "restore")
        ?.value,
    );
  }, [features]);

  const checkEnablePortalSettings = () => {
    return portals.length === 1 ? false : isRestoreAndAutoBackupAvailable;
  };

  const isEnableAuto = checkEnablePortalSettings();
  const language = user?.cultureName || "en";

  const removeItem = {
    key: "",
    title: "",
    label: "",
    provider_key: "",
    provider_link: undefined,
    storageIsConnected: false,
    connected: false,
    provider_id: "",
    id: "",
    disabled: false,
    className: undefined,
  };

  const defaultRegion =
    defaultFormSettings && "region" in defaultFormSettings
      ? (defaultFormSettings.region as string)
      : "";

  return (
    <AutomaticBackup
      isManagement
      isInitialError={false}
      isInitialLoading={false}
      isEmptyContentBeforeLoader={false}
      settingsFileSelector={{
        filesSettings,
      }}
      removeItem={removeItem}
      language={language}
      // backup
      setDefaultOptions={setDefaultOptions}
      setDownloadingProgress={setDownloadingProgress}
      setTemporaryLink={setTemporaryLink}
      setThirdPartyStorage={setThirdPartyStorage}
      setBackupSchedule={setBackupSchedule}
      setErrorInformation={setErrorInformation}
      setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
      seStorageType={setSelectedStorageType}
      setSelectedEnableSchedule={setterSelectedEnableSchedule}
      toDefault={toDefault}
      errorInformation={errorInformation}
      selectedStorageType={selectedStorageType}
      selectedFolderId={selectedFolderId}
      isFormReady={isFormReady}
      selectedMaxCopiesNumber={selectedMaxCopiesNumber}
      selectedPeriodNumber={selectedPeriodNumber}
      selectedWeekday={selectedWeekday}
      selectedHour={selectedHour}
      selectedMonthDay={selectedMonthDay}
      selectedStorageId={selectedStorageId}
      selectedEnableSchedule={selectedEnableSchedule}
      setSelectedFolder={setSelectedFolderId}
      getStorageParams={getStorageParams}
      deleteSchedule={deleteSchedule}
      downloadingProgress={downloadingProgress}
      isBackupProgressVisible={isBackupProgressVisible}
      isChanged={isChanged}
      isThirdStorageChanged={isThirdStorageChanged}
      defaultStorageType={defaultStorageType}
      defaultFolderId={defaultFolderId}
      connectedThirdPartyAccount={connectedThirdPartyAccount}
      selectedPeriodLabel={selectedPeriodLabel}
      selectedWeekdayLabel={selectedWeekdayLabel}
      setMaxCopies={setMaxCopies}
      setPeriod={setPeriod}
      setWeekday={setWeekday}
      setMonthNumber={setMonthNumber}
      setTime={setTime}
      setStorageId={setSelectedStorageId}
      thirdPartyStorage={thirdPartyStorage}
      defaultStorageId={defaultStorageId}
      setCompletedFormFields={setCompletedFormFields}
      errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
      formSettings={formSettings}
      addValueInFormSettings={addValueInFormSettings}
      setRequiredFormSettings={setRequiredFormSettings}
      setIsThirdStorageChanged={setIsThirdStorageChanged}
      storageRegions={newStorageRegions}
      deleteValueFormSetting={deleteValueFormSetting}
      clearLocalStorage={clearLocalStorage}
      setSelectedThirdPartyAccount={setSelectedThirdPartyAccount}
      selectedThirdPartyAccount={
        selectedThirdPartyAccount as ThirdPartyAccountType
      }
      accounts={accounts}
      isTheSameThirdPartyAccount={isTheSameThirdPartyAccount}
      setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
      defaultRegion={defaultRegion}
      // treeFoldersStore
      rootFoldersTitles={rootFoldersTitles}
      // settingsStore
      automaticBackupUrl={automaticBackupUrl}
      currentColorScheme={currentColorScheme}
      isEnableAuto={isEnableAuto}
      // filesSelectorInput
      basePath={basePath}
      newPath={newPath}
      resetNewFolderPath={resetNewFolderPath}
      updateBaseFolderPath={updateBaseFolderPath}
      toDefaultFileSelector={toDefaultFileSelector}
      isErrorPath={isErrorPath}
      setBasePath={setBasePath}
      setNewPath={setNewPath}
      // thirdPartyStore
      openConnectWindow={openConnectWindow}
      setThirdPartyProviders={setThirdPartyProviders}
      providers={providers}
      deleteThirdParty={deleteThirdParty}
      // dialogsStore
      connectDialogVisible={false}
      deleteThirdPartyDialogVisible={false}
      setConnectDialogVisible={function (visible: boolean): void {
        throw new Error("Function not implemented.");
      }}
      setDeleteThirdPartyDialogVisible={function (visible: boolean): void {
        throw new Error("Function not implemented.");
      }}
    />
  );
};

export default AutoBackup;

