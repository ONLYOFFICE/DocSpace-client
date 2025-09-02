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

import { t } from "i18next";
import React, { useCallback } from "react";

import { getSettingsThirdParty } from "@docspace/shared/api/files";
import {
  getBackupStorage,
  getStorageRegions,
} from "@docspace/shared/api/settings";
import { getBackupSchedule } from "@docspace/shared/api/portal";
import { toastr } from "@docspace/shared/components/toast";
import { useDefaultOptions } from "@docspace/shared/pages/backup/auto-backup/hooks";
import { isManagement } from "@docspace/shared/utils/common";

import { AuthStore } from "@docspace/shared/store/AuthStore";

import TreeFoldersStore from "SRC_DIR/store/TreeFoldersStore";
import BackupStore from "SRC_DIR/store/BackupStore";

export type UseBackupProps = {
  getProgress?: BackupStore["getProgress"];
  rootFoldersTitles?: TreeFoldersStore["rootFoldersTitles"];
  fetchTreeFolders?: TreeFoldersStore["fetchTreeFolders"];
  setStorageRegions?: BackupStore["setStorageRegions"];
  setThirdPartyStorage?: BackupStore["setThirdPartyStorage"];
  setConnectedThirdPartyAccount?: BackupStore["setConnectedThirdPartyAccount"];
  setBackupSchedule?: BackupStore["setBackupSchedule"];
  setDefaultOptions?: BackupStore["setDefaultOptions"];
  language?: AuthStore["language"];
};

const useBackup = ({
  getProgress,
  rootFoldersTitles,
  fetchTreeFolders,
  setStorageRegions,
  setThirdPartyStorage,
  setConnectedThirdPartyAccount,
  setBackupSchedule,
  setDefaultOptions,
  language,
}: UseBackupProps) => {
  const { periodsObject, weekdaysLabelArray } = useDefaultOptions(t, language);

  const getManualBackupData = useCallback(async () => {
    try {
      getProgress?.(t);

      const baseRequests = [
        getSettingsThirdParty(),
        getBackupStorage(),
        getStorageRegions(),
      ];

      const optionalRequests = [];

      if (!rootFoldersTitles || Object.keys(rootFoldersTitles).length === 0) {
        optionalRequests.push(fetchTreeFolders?.());
      }

      const [account, backupStorage, storageRegionsS3] = await Promise.all([
        ...baseRequests,
        ...optionalRequests,
      ]);

      setConnectedThirdPartyAccount?.(account ?? null);
      setThirdPartyStorage?.(backupStorage);
      setStorageRegions?.(storageRegionsS3);
    } catch (error) {
      toastr.error(error as Error);
    }
  }, [
    getProgress,
    rootFoldersTitles,
    fetchTreeFolders,
    setConnectedThirdPartyAccount,
    setThirdPartyStorage,
    setStorageRegions,
  ]);

  const getAutoBackupData = useCallback(async () => {
    try {
      if (Object.keys(rootFoldersTitles).length === 0) fetchTreeFolders?.();

      getProgress?.(t);
      const [account, backupSchedule, backupStorage, newStorageRegions] =
        await Promise.all([
          getSettingsThirdParty(),
          getBackupSchedule(),
          getBackupStorage(),
          getStorageRegions(),
        ]);

      if (account) setConnectedThirdPartyAccount?.(account);
      if (backupStorage) setThirdPartyStorage?.(backupStorage);

      setBackupSchedule?.(backupSchedule);
      setStorageRegions?.(newStorageRegions);

      setDefaultOptions?.(periodsObject, weekdaysLabelArray);
    } catch (error) {
      toastr.error(error as Error);
    }
  }, [
    getProgress,
    rootFoldersTitles,
    fetchTreeFolders,
    setConnectedThirdPartyAccount,
    setThirdPartyStorage,
    setStorageRegions,
    setBackupSchedule,
    setDefaultOptions,
    language,
  ]);

  const getRestoreBackupData = useCallback(async () => {
    try {
      getProgress?.(t);

      const [account, backupStorage, resStorageRegions] = await Promise.all([
        getSettingsThirdParty(),
        getBackupStorage(isManagement()),
        getStorageRegions(),
      ]);

      if (account) setConnectedThirdPartyAccount?.(account);
      setThirdPartyStorage?.(backupStorage);
      setStorageRegions?.(resStorageRegions);

      return true;
    } catch (error) {
      toastr.error(error as Error);
      return false;
    }
  }, [
    getProgress,
    setConnectedThirdPartyAccount,
    setThirdPartyStorage,
    setStorageRegions,
  ]);

  const getBackupInitialValue = React.useCallback(async () => {
    const actions = [];
    if (window.location.pathname.includes("data-backup"))
      actions.push(getManualBackupData());

    if (window.location.pathname.includes("auto-backup"))
      actions.push(getAutoBackupData());

    if (window.location.pathname.includes("restore"))
      actions.push(getRestoreBackupData());

    await Promise.all(actions);
  }, [getManualBackupData, getAutoBackupData, getRestoreBackupData]);

  React.useEffect(() => {
    //  if (window.location.pathname.includes("backup")) getBackupInitialValue();
  }, [getBackupInitialValue]);

  return {
    getManualBackupData,
    getAutoBackupData,
    getRestoreBackupData,
    getBackupInitialValue,
  };
};

export default useBackup;
