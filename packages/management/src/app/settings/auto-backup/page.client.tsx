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
import { observer } from "mobx-react";
import { useTheme } from "styled-components";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import AutomaticBackup from "@docspace/shared/pages/auto-backup";
import { useUnmount } from "@docspace/shared/hooks/useUnmount";
import { useDidMount } from "@docspace/shared/hooks/useDidMount";
import { openConnectWindowUtils } from "@docspace/shared/utils/openConnectWindow";
import { deleteThirdParty as deleteThirdPartyApi } from "@docspace/shared/api/files";
import { useDefaultOptions } from "@docspace/shared/pages/auto-backup/hooks";

import type {
  SettingsThirdPartyType,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type {
  TBackupProgress,
  TBackupSchedule,
  TPaymentFeature,
  TStorageRegion,
} from "@docspace/shared/api/portal/types";

import type { TError } from "@docspace/shared/utils/axiosClient";
import type { ThirdPartyAccountType } from "@docspace/shared/types";
import type { TPortals } from "@docspace/shared/api/management/types";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";

import { useBackup } from "@/hooks/useBackup";
import { useTreeFolders } from "@/hooks/useTreeFolders";
import { useFilesSelectorInput } from "@/hooks/useFilesSelectorInput";
import { useStores } from "@/hooks/useStores";
import useAppState from "@/hooks/useAppState";
import { getAutomaticBackupUrl } from "@/lib";

interface AutoBackupProps {
  account: SettingsThirdPartyType | undefined;
  backupScheduleResponse: TBackupSchedule | undefined;
  backupStorageResponse: TStorageBackup[];
  newStorageRegions: TStorageRegion[];
  portals: TPortals[];
  features: TPaymentFeature[];
  filesSettings: TFilesSettings;
  foldersTree: TFolder[];
  backupProgress: TBackupProgress | TError | undefined;
}

const AutoBackup = ({
  account,
  backupScheduleResponse,
  backupStorageResponse,
  newStorageRegions,
  portals,
  features,
  filesSettings,
  foldersTree,
  backupProgress,
}: AutoBackupProps) => {
  const [deleteThirdPartyDialogVisible, setDeleteThirdPartyDialogVisible] =
    useState(false);

  const { t } = useTranslation(["Common"]);

  const { currentColorScheme } = useTheme();
  const { backupStore, spacesStore } = useStores();
  const { user, settings } = useAppState();

  const language = user?.cultureName || "en";

  const rootFoldersTitles = useTreeFolders({ foldersTree });

  const openConnectWindow = useCallback(
    (serviceName: string, modal: Window | null) => {
      return openConnectWindowUtils(serviceName, modal, t);
    },
    [t],
  );

  const deleteThirdParty = useCallback(async (id: string) => {
    try {
      await deleteThirdPartyApi(id);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const {
    accounts,
    toDefault,
    setErrorInformation,
    errorInformation,
    defaults,
    selected,

    isThirdStorageChanged,
    setIsThirdStorageChanged,
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
    getStorageParams,
    deleteSchedule,
    isBackupProgressVisible,
    isChanged,
    setMaxCopies,
    setPeriod,
    setWeekday,
    setMonthNumber,
    setTime,
    setCompletedFormFields,
    addValueInFormSettings,
    setRequiredFormSettings,
    deleteValueFormSetting,
    clearLocalStorage,
    selectedThirdPartyAccount,
    setSelectedThirdPartyAccount,
    isTheSameThirdPartyAccount,
    setThirdPartyAccountsInfo,
    resetDownloadingProgress,
    seStorageType,
    setSelectedFolder,
    setStorageId,
  } = useBackup({
    account,
    backupScheduleResponse,
    backupStorageResponse,
  });

  const { periodsObject, weekdaysLabelArray } = useDefaultOptions(t, language);
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

  const getProgress = async () => {
    if (backupProgress && "progress" in backupProgress) {
      const { progress, link, error } = backupProgress;

      if (!error) {
        setDownloadingProgress(progress);

        if (link && link.slice(0, 1) === "/") {
          setTemporaryLink(link);
        }
        setErrorInformation("", t);
      } else {
        setDownloadingProgress(100);
        setErrorInformation(error, t);
      }
    } else if (backupProgress) {
      setErrorInformation(backupProgress, t);
    }
  };

  useUnmount(() => {
    resetDownloadingProgress();
  });

  useDidMount(() => {
    getProgress();
    setDefaultOptions(t, periodsObject, weekdaysLabelArray);
  });

  const isRestoreAndAutoBackupAvailable = useMemo(() => {
    return Boolean(
      features.find((feature: TPaymentFeature) => feature.id === "restore")
        ?.value,
    );
  }, [features]);

  const checkEnablePortalSettings = () => {
    return portals.length === 1 ? false : isRestoreAndAutoBackupAvailable;
  };

  const automaticBackupUrl = useMemo(
    () => getAutomaticBackupUrl(settings),
    [settings],
  );

  const isEnableAuto = checkEnablePortalSettings();

  const defaultRegion =
    defaults.formSettings && "region" in defaults.formSettings
      ? (defaults.formSettings.region as string)
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
      removeItem={selectedThirdPartyAccount as ThirdPartyAccountType}
      language={language}
      // backup
      setDefaultOptions={setDefaultOptions}
      setDownloadingProgress={setDownloadingProgress}
      setTemporaryLink={setTemporaryLink}
      setThirdPartyStorage={setThirdPartyStorage}
      setBackupSchedule={setBackupSchedule}
      setErrorInformation={setErrorInformation}
      setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
      setStorageId={setStorageId}
      seStorageType={seStorageType}
      setSelectedFolder={setSelectedFolder}
      setSelectedEnableSchedule={setterSelectedEnableSchedule}
      toDefault={toDefault}
      errorInformation={errorInformation}
      selectedStorageType={selected.storageType}
      selectedFolderId={selected.folderId}
      isFormReady={isFormReady}
      selectedMaxCopiesNumber={selected.maxCopiesNumber}
      selectedPeriodNumber={selected.periodNumber}
      selectedWeekday={selected.weekday}
      selectedHour={selected.hour}
      selectedMonthDay={selected.monthDay}
      selectedStorageId={selected.storageId}
      selectedEnableSchedule={selected.enableSchedule}
      getStorageParams={getStorageParams}
      deleteSchedule={deleteSchedule}
      downloadingProgress={downloadingProgress}
      isBackupProgressVisible={isBackupProgressVisible}
      isChanged={isChanged}
      isThirdStorageChanged={isThirdStorageChanged}
      defaultStorageType={defaults.storageType}
      defaultFolderId={defaults.folderId}
      connectedThirdPartyAccount={connectedThirdPartyAccount}
      selectedPeriodLabel={selected.periodLabel}
      selectedWeekdayLabel={selected.weekdayLabel}
      setMaxCopies={setMaxCopies}
      setPeriod={setPeriod}
      setWeekday={setWeekday}
      setMonthNumber={setMonthNumber}
      setTime={setTime}
      thirdPartyStorage={thirdPartyStorage}
      defaultStorageId={defaults.storageId}
      setCompletedFormFields={setCompletedFormFields}
      errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
      formSettings={selected.formSettings}
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
      setThirdPartyProviders={backupStore.setThirdPartyProviders}
      providers={backupStore.providers}
      deleteThirdParty={deleteThirdParty}
      // dialogsStore
      deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
      setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
      connectDialogVisible={spacesStore.connectDialogVisible}
      setConnectDialogVisible={spacesStore.setConnectDialogVisible}
    />
  );
};

export default observer(AutoBackup);
