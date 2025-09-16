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
import { getBackupsCount } from "@docspace/shared/api/backup";

import { AuthStore } from "@docspace/shared/store/AuthStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import BackupStore from "SRC_DIR/store/BackupStore";
import PaymentStore from "SRC_DIR/store/PaymentStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

export type UseBackupProps = {
  getProgress?: BackupStore["getProgress"];
  setStorageRegions?: BackupStore["setStorageRegions"];
  setThirdPartyStorage?: BackupStore["setThirdPartyStorage"];
  setConnectedThirdPartyAccount?: BackupStore["setConnectedThirdPartyAccount"];
  setBackupSchedule?: BackupStore["setBackupSchedule"];
  setDefaultOptions?: BackupStore["setDefaultOptions"];
  language?: AuthStore["language"];

  isBackupPaid?: CurrentQuotasStore["isBackupPaid"];
  maxFreeBackups?: CurrentQuotasStore["maxFreeBackups"];
  setServiceQuota?: PaymentStore["setServiceQuota"];
  fetchPayerInfo?: CurrentTariffStatusStore["fetchPayerInfo"];
  setBackupsCount?: BackupStore["setBackupsCount"];
  setIsInited?: BackupStore["setIsInited"];
  setErrorInformation?: BackupStore["setErrorInformation"];

  setIsInitialError?: BackupStore["setIsInitialError"];
  setIsEmptyContentBeforeLoader?: BackupStore["setIsEmptyContentBeforeLoader"];
  isInitialError?: BackupStore["isInitialError"];
  isEmptyContentBeforeLoader?: BackupStore["isEmptyContentBeforeLoader"];

  addAbortControllers?: SettingsStore["addAbortControllers"];
};

const useBackup = ({
  getProgress,
  setStorageRegions,
  setThirdPartyStorage,
  setConnectedThirdPartyAccount,
  setBackupSchedule,
  setDefaultOptions,
  language,

  isBackupPaid,
  maxFreeBackups,
  setServiceQuota,
  fetchPayerInfo,
  setBackupsCount,
  setIsInited,
  setErrorInformation,

  setIsInitialError,
  setIsEmptyContentBeforeLoader,
  isInitialError,
  isEmptyContentBeforeLoader,

  addAbortControllers,
}: UseBackupProps) => {
  const { periodsObject, weekdaysLabelArray } = useDefaultOptions(
    t,
    language ?? "",
  );

  const getManualBackupData = useCallback(async () => {
    try {
      getProgress?.(t);

      // Create individual abort controllers for each request
      const thirdPartyController = new AbortController();
      const backupStorageController = new AbortController();
      const storageRegionsController = new AbortController();
      const backupsCountController = new AbortController();

      addAbortControllers?.([
        thirdPartyController,
        backupStorageController,
        storageRegionsController,
        backupsCountController,
      ]);

      const baseRequests = [
        getSettingsThirdParty(thirdPartyController.signal),
        getBackupStorage(false, backupStorageController.signal),
        getStorageRegions(storageRegionsController.signal),
      ];

      const optionalRequests = [];

      if (isBackupPaid) {
        if (maxFreeBackups && maxFreeBackups > 0) {
          baseRequests.push(
            getBackupsCount(
              undefined,
              undefined,
              backupsCountController.signal,
            ),
          );
        }

        optionalRequests.push(setServiceQuota?.());
        optionalRequests.push(fetchPayerInfo?.());
      }

      const [account, backupStorage, storageRegionsS3, backupsCount] =
        await Promise.all([...baseRequests, ...optionalRequests]);

      setConnectedThirdPartyAccount?.(account ?? null);
      setThirdPartyStorage?.(backupStorage);
      setStorageRegions?.(storageRegionsS3);

      if (isBackupPaid) {
        if (typeof backupsCount === "number") setBackupsCount?.(backupsCount);
      }
      setIsInited?.(true);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "CanceledError" || error.message === "canceled")
      ) {
        return;
      }

      toastr.error(error as Error);
    }
    setIsEmptyContentBeforeLoader?.(false);
  }, [
    getProgress,
    setConnectedThirdPartyAccount,
    setThirdPartyStorage,
    setStorageRegions,
    setBackupsCount,
    setIsInited,
    setServiceQuota,
    fetchPayerInfo,
    setIsEmptyContentBeforeLoader,
  ]);

  const getAutoBackupData = useCallback(async () => {
    try {
      getProgress?.(t);

      // Create individual abort controllers for each request
      const thirdPartyController = new AbortController();
      const backupScheduleController = new AbortController();
      const backupStorageController = new AbortController();
      const storageRegionsController = new AbortController();
      const backupsCountController = new AbortController();

      addAbortControllers?.([
        thirdPartyController,
        backupScheduleController,
        backupStorageController,
        storageRegionsController,
        backupsCountController,
      ]);

      const baseRequests: (Promise<any> | undefined)[] = [
        getSettingsThirdParty(thirdPartyController.signal),
        getBackupSchedule(undefined, backupScheduleController.signal),
        getBackupStorage(undefined, backupStorageController.signal),
        getStorageRegions(storageRegionsController.signal),
      ];

      const optionalRequests = [];
      if (isBackupPaid) {
        if (maxFreeBackups && maxFreeBackups > 0) {
          baseRequests.push(
            getBackupsCount(
              undefined,
              undefined,
              backupsCountController.signal,
            ),
          );
        }
        optionalRequests.push(setServiceQuota?.());
        optionalRequests.push(fetchPayerInfo?.());
      }

      const [
        account,
        backupSchedule,
        backupStorage,
        newStorageRegions,
        backupsCount,
      ] = await Promise.all([...baseRequests, ...optionalRequests]);

      if (account) setConnectedThirdPartyAccount?.(account);
      if (backupStorage) setThirdPartyStorage?.(backupStorage);

      setBackupSchedule?.(backupSchedule);
      setStorageRegions?.(newStorageRegions);

      setIsInited?.(true);

      if (isBackupPaid) {
        if (typeof backupsCount === "number") setBackupsCount?.(backupsCount);
      }

      setDefaultOptions?.(periodsObject, weekdaysLabelArray);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "CanceledError" || error.message === "canceled")
      ) {
        return;
      }

      setErrorInformation?.(error, t);
      setIsInitialError?.(true);
      toastr.error(error as Error);
    } finally {
      setIsEmptyContentBeforeLoader?.(false);
    }
  }, [
    getProgress,
    setConnectedThirdPartyAccount,
    setThirdPartyStorage,
    setStorageRegions,
    setBackupSchedule,
    setDefaultOptions,
    setBackupsCount,
    setIsInited,
    setServiceQuota,
    fetchPayerInfo,
    setErrorInformation,
  ]);

  const getRestoreBackupData = useCallback(async () => {
    try {
      getProgress?.(t);

      // Create individual abort controllers for each request
      const thirdPartyController = new AbortController();
      const backupStorageController = new AbortController();
      const storageRegionsController = new AbortController();

      addAbortControllers?.([
        thirdPartyController,
        backupStorageController,
        storageRegionsController,
      ]);

      const [account, backupStorage, resStorageRegions] = await Promise.all([
        getSettingsThirdParty(thirdPartyController.signal),
        getBackupStorage(isManagement(), backupStorageController.signal),
        getStorageRegions(storageRegionsController.signal),
      ]);

      if (account) setConnectedThirdPartyAccount?.(account);
      setThirdPartyStorage?.(backupStorage);
      setStorageRegions?.(resStorageRegions);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "CanceledError" || error.message === "canceled")
      ) {
        return;
      }

      toastr.error(error as Error);
    }
  }, [
    getProgress,
    setConnectedThirdPartyAccount,
    setThirdPartyStorage,
    setStorageRegions,
  ]);

  const getBackupInitialValue = React.useCallback(async () => {
    const actions = [];
    if (window.location.pathname.includes("data-backup")) {
      actions.push(getManualBackupData());
    }

    if (window.location.pathname.includes("auto-backup"))
      actions.push(getAutoBackupData());

    if (window.location.pathname.includes("restore"))
      actions.push(getRestoreBackupData());

    await Promise.all(actions);
  }, [getManualBackupData, getAutoBackupData, getRestoreBackupData]);

  return {
    getManualBackupData,
    getAutoBackupData,
    getRestoreBackupData,
    getBackupInitialValue,

    isEmptyContentBeforeLoader,
    setIsEmptyContentBeforeLoader,
    isInitialError,
  };
};

export default useBackup;
