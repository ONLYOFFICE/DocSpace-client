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

import React, { useState } from "react";
import classNames from "classnames";

import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import { Button } from "@docspace/ui-kit/components/button";
import OperationsProgressButton from "@docspace/ui-kit/components/operations-progress-button";
import { OPERATIONS_NAME } from "../../../../../constants";
import { TenantStatus } from "../../../../../enums";
import { startRestore } from "../../../../../api/portal";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isManagement } from "../../../../../utils/common";

import type { ButtonContainerProps } from "./ButtonContainer.types";
import RestoreConfirmModal from "../restore-confirm-modal";
import styles from "../../RestoreBackup.module.scss";

const ButtonContainer = (props: ButtonContainerProps) => {
  const {
    standalone,
    isConfirmed,
    navigate,
    downloadingProgress,
    getStorageType,
    isNotification,
    restoreResource,
    isCheckedThirdPartyStorage,
    isCheckedLocalFile,

    isEnableRestore,
    t,
    buttonSize,
    setTenantStatus,
    isFormReady,
    getStorageParams,
    uploadLocalFile,
    isBackupProgressVisible,
    setErrorInformation,
    setIsBackupProgressVisible,
    operationsAlert,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleRestoreConfirmModal, setIsVisibleRestoreConfirmModal] =
    useState(false);
  const [isRestoreAcknowledged, setIsRestoreAcknowledged] = useState(false);
  const isMaxProgress = downloadingProgress === 100;

  const onCloseRestoreConfirmModal = () => {
    if (isLoading) return;

    setIsVisibleRestoreConfirmModal(false);
    setIsRestoreAcknowledged(false);
  };

  const onChangeRestoreAcknowledged = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsRestoreAcknowledged(e.target.checked);
  };

  const restorePortal = async () => {
    setIsLoading(true);

    let storageParams = [];
    const tempObj: Record<string, File | number | string | null> = {};

    const backupId = "";
    const storageType = getStorageType().toString();

    if (isCheckedThirdPartyStorage) {
      storageParams = getStorageParams(true, null, restoreResource as string);
    } else {
      tempObj.key = "filePath";
      tempObj.value = isCheckedLocalFile ? "" : restoreResource;

      storageParams.push(tempObj);
    }

    if (isCheckedLocalFile) {
      const uploadedFile = await uploadLocalFile();

      if (!uploadedFile) {
        toastr.error(t("BackupCreatedError"));
        setIsLoading(false);
        return;
      }

      if (!uploadedFile.data.EndUpload) {
        toastr.error(uploadedFile.data.Message ?? t("BackupCreatedError"));
        setIsLoading(false);
        return;
      }
    }

    setErrorInformation("");

    try {
      await startRestore(
        backupId,
        storageType,
        storageParams,
        isNotification,
        isManagement(),
      );
      setTenantStatus(TenantStatus.PortalRestore);

      SocketHelper?.emit(SocketCommands.RestoreBackup, {
        dump: isManagement(),
      });

      navigate(
        "/preparation-portal",
        // combineUrl(
        //   window.ClientConfig?.proxy?.url,
        //   config.homepage,
        //   "/preparation-portal",
        // ),
      );
    } catch (e) {
      console.error(e);
      toastr.error(e as Error);
      setErrorInformation(e, t);
      setIsLoading(false);
    }
  };

  const onRestoreClick = () => {
    if (isCheckedThirdPartyStorage) {
      const requiredFieldsFilled = isFormReady();
      if (!requiredFieldsFilled) return;
    }

    if (standalone) {
      setIsRestoreAcknowledged(false);
      setIsVisibleRestoreConfirmModal(true);
      return;
    }

    void restorePortal();
  };

  const isButtonDisabled =
    isLoading ||
    !isMaxProgress ||
    (!standalone && !isConfirmed) ||
    !isEnableRestore ||
    !restoreResource;
  const isLoadingButton = isLoading;

  return (
    <>
      <div
        className={classNames(
          styles.restoreBackupButtonContainer,
          "restore-backup_button-container",
        )}
      >
        <Button
          className={classNames(
            styles.restoreBackupButton,
            "restore-backup_button",
          )}
          label={t("Common:Restore")}
          onClick={onRestoreClick}
          primary
          isDisabled={isButtonDisabled}
          isLoading={isLoadingButton}
          size={buttonSize}
          tabIndex={10}
          testId="restore_backup_button"
        />

        {isBackupProgressVisible ? (
          <OperationsProgressButton
            operationsAlert={operationsAlert}
            operationsCompleted={downloadingProgress === 100}
            operations={[
              {
                label:
                  downloadingProgress === 100
                    ? t("Backup")
                    : downloadingProgress === 0
                      ? t("PreparingBackup")
                      : t("BackupProgress", { progress: downloadingProgress }),
                percent: downloadingProgress,
                operation: OPERATIONS_NAME.backup,
                alert: false,
                completed: false,
              },
            ]}
            clearOperationsData={() => setIsBackupProgressVisible(false)}
          />
        ) : null}
      </div>

      {standalone ? (
        <RestoreConfirmModal
          visible={isVisibleRestoreConfirmModal}
          isLoading={isLoading}
          isRestoreAcknowledged={isRestoreAcknowledged}
          onClose={onCloseRestoreConfirmModal}
          onChangeRestoreAcknowledged={onChangeRestoreAcknowledged}
          onConfirm={() => void restorePortal()}
          t={t}
        />
      ) : null}
    </>
  );
};

export default ButtonContainer;
