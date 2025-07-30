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
import { useTranslation } from "react-i18next";

import { useState } from "react";
import isNil from "lodash/isNil";

import { useUnmount } from "@docspace/shared/hooks/useUnmount";
import { useDidMount } from "@docspace/shared/hooks/useDidMount";

import { RestoreBackup } from "@docspace/shared/pages/restore-backup";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { ButtonSize } from "@docspace/shared/components/button";
import { uploadBackup } from "@docspace/shared/api/files";

import type {
  SettingsThirdPartyType,
  TFilesSettings,
} from "@docspace/shared/api/files/types";
import type {
  TBackupProgress,
  TBackupSchedule,
  TPaymentFeature,
  TStorageRegion,
} from "@docspace/shared/api/portal/types";
import type { TError } from "@docspace/shared/utils/axiosClient";
import type { TStorageBackup } from "@docspace/shared/api/settings/types";
import type { Nullable, ThirdPartyAccountType } from "@docspace/shared/types";
import type { TPortals } from "@docspace/shared/api/management/types";

import { useBackup } from "@/hooks/useBackup";
import useAppState from "@/hooks/useAppState";
import { toastr } from "@docspace/shared/components/toast";
import { useStores } from "@/hooks/useStores";
import { useFilesSelectorInput } from "@/hooks/useFilesSelectorInput";

export interface RestoreProps {
  account: SettingsThirdPartyType | undefined;
  backupScheduleResponse: TBackupSchedule | undefined;
  backupStorageResponse: TStorageBackup[];
  newStorageRegions: TStorageRegion[];
  portals: TPortals[];
  features: TPaymentFeature[];
  filesSettings: TFilesSettings;
  backupProgress: TBackupProgress | TError | undefined;
}

const Restore = ({
  account,
  backupScheduleResponse,
  backupStorageResponse,
  features,
  portals,
  filesSettings,
  newStorageRegions,
  backupProgress,
}: RestoreProps) => {
  const { t } = useTranslation(["Common"]);

  const [restoreResource, setRestoreResource] =
    useState<Nullable<File | string | number>>(null);

  const { backupStore, spacesStore } = useStores();
  const { settings } = useAppState();
  const {
    accounts,
    selectedThirdPartyAccount,
    errorInformation,
    selected,
    isBackupProgressVisible,
    errorsFieldsBeforeSafe,
    thirdPartyStorage,

    isTheSameThirdPartyAccount,
    downloadingProgress,
    connectedThirdPartyAccount,
    setErrorInformation,
    setTemporaryLink,
    setDownloadingProgress,
    setConnectedThirdPartyAccount,
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
    resetDownloadingProgress,
    deleteThirdPartyDialogVisible,
    setDeleteThirdPartyDialogVisible,
    getProgress,
    deleteThirdParty,
    openConnectWindow,
    defaultRegion,
    checkEnablePortalSettings,

    setIsBackupProgressVisible,
    backupProgressError,
    setBackupProgressError,
  } = useBackup({
    account,
    backupScheduleResponse,
    backupStorageResponse,
    backupProgress,
    features,
  });

  const {
    basePath,
    newPath,
    isErrorPath,
    setBasePath,
    setNewPath,
    toDefaultFileSelector,
  } = useFilesSelectorInput();

  useUnmount(() => {
    resetDownloadingProgress();
    setRestoreResource(null);
  });

  useDidMount(() => {
    getProgress();
  });

  const navigate = (path: string) => {
    const url = window.ClientConfig?.proxy?.url;

    if (isNil(url)) return;

    window.location.replace(combineUrl(url, path));
  };

  async function* uploadBackupFile(requestsDataArray: FormData[], url: string) {
    const length = requestsDataArray.length;
    for (let index = 0; index < length; index++) {
      yield uploadBackup(url, requestsDataArray[index]);
    }
  }

  const uploadFileChunks = async (
    requestsDataArray: FormData[],
    url: string,
  ) => {
    let res;

    const uploadUrl = combineUrl(window.ClientConfig?.proxy?.url, url);

    // eslint-disable-next-line no-restricted-syntax
    for await (const value of uploadBackupFile(requestsDataArray, uploadUrl)) {
      if (!value) return false;

      if (value.data.Message || !value.data.Success) return value;

      res = value;
    }

    return res;
  };

  const uploadLocalFile = async () => {
    if (!(restoreResource instanceof File)) return;

    try {
      const url = "/backupFileUpload.ashx";

      const getExst = (fileName: string) => {
        if (fileName.endsWith(".tar.gz")) {
          return "tar.gz";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
      };

      const extension = getExst(restoreResource.name);

      const res = await uploadBackup(
        combineUrl(
          window.ClientConfig?.proxy?.url,
          `${url}?init=true&totalSize=${restoreResource.size}&extension=${extension}`,
        ),
      );

      if (!res) return false;

      if (res.data.Message || !res.data.Success) return res;

      const chunkUploadSize = res.data.ChunkSize;

      const chunks = Math.ceil(
        restoreResource.size / chunkUploadSize,
        // chunkUploadSize,
      );

      const requestsDataArray = [];

      let chunk = 0;

      while (chunk < chunks) {
        const offset = chunk * chunkUploadSize;
        const formData = new FormData();
        formData.append(
          "file",
          restoreResource.slice(offset, offset + chunkUploadSize),
        );

        requestsDataArray.push(formData);
        chunk++;
      }

      return await uploadFileChunks(requestsDataArray, url);
    } catch (e) {
      toastr.error(e as Error);
      return null;
    }
  };

  const isEnableRestore = checkEnablePortalSettings(portals);

  return (
    <RestoreBackup
      isInitialLoading={false}
      removeItem={selectedThirdPartyAccount as ThirdPartyAccountType}
      buttonSize={ButtonSize.normal}
      isEnableRestore={isEnableRestore}
      navigate={navigate}
      settingsFileSelector={{
        filesSettings,
      }}
      standalone={Boolean(settings?.standalone)}
      setTenantStatus={() => {}}
      errorInformation={errorInformation}
      isBackupProgressVisible={isBackupProgressVisible}
      restoreResource={restoreResource}
      formSettings={selected.formSettings}
      errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
      thirdPartyStorage={thirdPartyStorage}
      storageRegions={newStorageRegions}
      defaultRegion={defaultRegion}
      accounts={accounts}
      selectedThirdPartyAccount={
        selectedThirdPartyAccount as ThirdPartyAccountType
      }
      isTheSameThirdPartyAccount={isTheSameThirdPartyAccount}
      downloadingProgress={downloadingProgress}
      connectedThirdPartyAccount={connectedThirdPartyAccount}
      setErrorInformation={(error: unknown) => setErrorInformation(error, t)}
      setTemporaryLink={setTemporaryLink}
      setDownloadingProgress={setDownloadingProgress}
      setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
      setRestoreResource={setRestoreResource}
      clearLocalStorage={clearLocalStorage}
      setSelectedThirdPartyAccount={setSelectedThirdPartyAccount}
      setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
      setCompletedFormFields={setCompletedFormFields}
      addValueInFormSettings={addValueInFormSettings}
      setRequiredFormSettings={setRequiredFormSettings}
      deleteValueFormSetting={deleteValueFormSetting}
      setIsThirdStorageChanged={setIsThirdStorageChanged}
      isFormReady={isFormReady}
      getStorageParams={getStorageParams}
      uploadLocalFile={uploadLocalFile}
      basePath={basePath}
      newPath={newPath}
      isErrorPath={isErrorPath}
      toDefault={toDefaultFileSelector}
      setBasePath={setBasePath}
      setNewPath={setNewPath}
      providers={backupStore.providers}
      deleteThirdParty={deleteThirdParty}
      openConnectWindow={openConnectWindow}
      setThirdPartyProviders={backupStore.setThirdPartyProviders}
      connectDialogVisible={spacesStore.connectDialogVisible}
      setConnectDialogVisible={spacesStore.setConnectDialogVisible}
      deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
      setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
      setIsBackupProgressVisible={setIsBackupProgressVisible}
      backupProgressError={backupProgressError}
      setBackupProgressError={setBackupProgressError}
    />
  );
};

export default observer(Restore);
